const request = require('supertest');
const { randomUUID } = require('crypto');
require('./env');
const app = require('../src/app');
const { generateAccessToken } = require('../src/utils/jwt');
const { sequelize } = require('../src/models');

const tenantId = randomUUID();
const userId = randomUUID();
const evaluatorId = randomUUID();
const physiotherapistId = randomUUID();
const serviceKey = process.env.CLINICAL_SERVICE_API_KEY;

const tokenFor = (overrides = {}) => generateAccessToken({
  sub: overrides.sub || userId,
  tenantId: overrides.tenantId || tenantId,
  roles: overrides.roles || ['professional'],
  permissions: overrides.permissions || ['clinical:read', 'clinical:write', 'patient:read', 'patient:write'],
  tokenVersion: 0,
  ...overrides,
});

const auth = (token = tokenFor()) => ({ 'X-Service-Key': serviceKey, Authorization: `Bearer ${token}`, 'X-Tenant-Id': tenantId });

let patientId;
let assessmentId;
let sessionId;

describe('Clinical standalone contract', () => {
  afterAll(async () => { await sequelize.close(); });

  test('health check is public', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.service).toBe('clinical');
  });

  test('rejects requests without service key or access token', async () => {
    const response = await request(app).get('/api/clinical/patients');
    expect(response.status).toBe(401);
  });

  test('creates and lists a patient inside the tenant', async () => {
    const response = await request(app).post('/api/clinical/patients').set(auth()).send({
      fullName: 'Paciente Clinical', initials: 'PC', gender: 'F', birthDate: '1985-05-10', height: 165, weight: 70,
      baseDiseases: ['hipertensão'], cpf: '123.456.789-00', userId,
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    patientId = response.body.data.id;

    const list = await request(app).get('/api/clinical/patients?limit=10').set(auth());
    expect(list.status).toBe(200);
    expect(list.body.data.total).toBe(1);
    expect(list.body.data.items[0].id).toBe(patientId);

    const mine = await request(app).get('/api/clinical/patients/me').set(auth());
    expect(mine.status).toBe(200);
    expect(mine.body.data).toHaveLength(1);
  });

  test('creates and reads a clinical assessment', async () => {
    const response = await request(app).post('/api/clinical/assessments').set(auth()).send({
      patientId, evaluatorId, assessmentDate: '2026-08-13T10:00:00.000Z', weight: 70, height: 165, isBedridden: false,
    });
    expect(response.status).toBe(201);
    assessmentId = response.body.data.id;

    const list = await request(app).get(`/api/clinical/assessments/${patientId}`).set(auth());
    expect(list.status).toBe(200);
    expect(list.body.data[0].id).toBe(assessmentId);

    const detail = await request(app).get(`/api/clinical/assessments/detail/${assessmentId}`).set(auth());
    expect(detail.status).toBe(200);
    expect(detail.body.data.patient.id).toBe(patientId);
  });

  test('calculates questionnaire classification and functional test interpretation', async () => {
    const questionnaire = await request(app).post('/api/clinical/questionnaires').set(auth()).send({
      patientId, assessmentId, scores: { q1: 5, q2: 5, q3: 5 }, version: '12-items',
    });
    expect(questionnaire.status).toBe(201);
    expect(questionnaire.body.data.totalScore).toBe(15);
    expect(questionnaire.body.data.classification).toBe('Comprometido');

    const functional = await request(app).post('/api/clinical/functional-tests').set(auth()).send({
      patientId, assessmentId, bergScores: { q1: 4, q2: 4, q3: 4 }, sitToStand5RepsTime: 12, patientGender: 'F', patientAge: 41, patientHeight: 165,
    });
    expect(functional.status).toBe(201);
    expect(functional.body.data.bergTotalScore).toBe(12);
    expect(functional.body.data.bergClassification).toBe('Alto risco de queda');
  });

  test('creates therapy session, phases and mobility assessment', async () => {
    const session = await request(app).post('/api/clinical/therapy-sessions').set(auth()).send({ patientId, physiotherapistId, sessionNumber: 1, sessionDate: '2026-08-13T11:00:00.000Z' });
    expect(session.status).toBe(201);
    sessionId = session.body.data.id;

    const phases = await request(app).post(`/api/clinical/therapy-sessions/${sessionId}/phases`).set(auth()).send({ phases: [{ phaseName: 'Aquecimento', durationMinutes: 10 }, { phaseName: 'Fortalecimento', durationMinutes: 20, intensity: 3 }] });
    expect(phases.status).toBe(201);
    expect(phases.body.data).toHaveLength(2);

    const mobility = await request(app).post('/api/clinical/mobility-assessments').set(auth()).send({ patientId, evaluatorId, mobilityLevel: 'independente', fallRisk: 'baixo', score: 8 });
    expect(mobility.status).toBe(201);

    const sessions = await request(app).get(`/api/clinical/therapy-sessions/${patientId}`).set(auth());
    expect(sessions.status).toBe(200);
    expect(sessions.body.data[0].TherapyPhases).toHaveLength(2);
  });

  test('does not expose one tenant patient to another tenant', async () => {
    const response = await request(app).get(`/api/clinical/patients/${patientId}`).set(auth(tokenFor({ tenantId: randomUUID() })));
    expect(response.status).toBe(403);
  });
});
