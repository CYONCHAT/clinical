const { Op } = require('sequelize');
const models = require('../models');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

const {
  Patient,
  ClinicalAssessment,
  QualityOfLifeQuestionnaire,
  FunctionalTests,
  MobilityAssessment,
  TherapySession,
  TherapyPhase,
  PatientLinkRequest,
  ClinicLinkRequest,
} = models;

const normalizeCpf = (cpf) => String(cpf || '').replace(/\D/g, '');

const calculateAge = (birthDate, referenceDate = new Date()) => {
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);
  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) age -= 1;
  return age;
};

const classifyQuestionnaireScore = (totalScore) => {
  if (totalScore <= 12) return 'Muito comprometido';
  if (totalScore <= 24) return 'Comprometido';
  if (totalScore <= 36) return 'Moderado';
  if (totalScore <= 48) return 'Bom';
  return 'Excelente';
};

const calculateQuestionnaireScore = (scores) => Object.values(scores || {}).reduce((sum, value) => sum + Number.parseInt(value || 0, 10), 0);

const calculateBergScore = (bergScores) => {
  const totalScore = Object.values(bergScores || {}).reduce((sum, value) => sum + Number.parseInt(value || 0, 10), 0);
  const classification = totalScore >= 41 ? 'Baixo risco de queda' : totalScore >= 21 ? 'Risco moderado de queda' : 'Alto risco de queda';
  return { totalScore, classification };
};

const calculateSitToStand5RepsPredicted = (gender, age, height) => gender === 'M' ? 4.698 + (age * 0.096) : -3.185 + (age * 0.074) + (height * 0.055);

const classifySitToStand5Reps = (actualTime, predictedTime) => {
  const percentage = (actualTime / predictedTime) * 100;
  if (percentage > 130) return 'Baixíssima potência muscular';
  if (percentage > 120) return 'Baixa potência muscular';
  if (percentage > 100) return 'Regular potência muscular';
  if (percentage > 80) return 'Boa potência muscular';
  return 'Excelente potência muscular';
};

const requireTenant = (tenantId) => {
  if (!tenantId) throw new ValidationError('tenantId é obrigatório no contexto clínico');
  return tenantId;
};

const audit = async ({ tenantId, actorUserId, requestId, action, entityType, entityId, metadata = {} }) => {
  await models.sequelize.query(
    `INSERT INTO clinical_audit_events (id, "tenantId", "actorUserId", "requestId", action, "entityType", "entityId", metadata, "occurredAt") VALUES (gen_random_uuid(), :tenantId, :actorUserId, :requestId, :action, :entityType, :entityId, CAST(:metadata AS jsonb), CURRENT_TIMESTAMP)`,
    { replacements: { tenantId, actorUserId: actorUserId || null, requestId: requestId || null, action, entityType, entityId: entityId || null, metadata: JSON.stringify(metadata) } },
  );
};

const assertPatientTenant = async (patientId, tenantId) => {
  const patient = await Patient.findOne({ where: { id: patientId, tenantId } });
  if (!patient) throw new NotFoundError('Paciente não encontrado');
  return patient;
};

const assertRoleCanManage = (context) => {
  if (context.isService) return;
  const roles = context.roles || [];
  const permissions = context.permissions || [];
  if (!roles.some((role) => ['admin', 'tenant_admin', 'professional', 'super_admin'].includes(role)) && !permissions.includes('clinical:write')) {
    throw new ForbiddenError('Permissão clínica insuficiente');
  }
};

const createPatient = async (context, data) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  if (!data.fullName || !data.initials || !data.gender || !data.birthDate) throw new ValidationError('Campos obrigatórios: fullName, initials, gender, birthDate');
  const patient = await Patient.create({
    tenantId,
    userId: data.userId || null,
    fullName: data.fullName,
    initials: data.initials,
    gender: data.gender,
    birthDate: data.birthDate,
    height: data.height,
    weight: data.weight,
    baseDiseases: data.baseDiseases || [],
    cpf: normalizeCpf(data.cpf) || null,
    contactPhone: data.contactPhone,
    contactEmail: data.contactEmail,
    zipCode: data.zipCode,
    street: data.street,
    addressNumber: data.addressNumber,
    complement: data.complement,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
    addressLat: data.addressLat,
    addressLng: data.addressLng,
    notes: data.notes,
    imageUseConsent: Boolean(data.imageUseConsent),
    imageUseConsentDate: data.imageUseConsent ? new Date() : null,
    origin: data.origin || 'TENANT_DIRECT',
    originLeadId: data.originLeadId,
    chatConversationId: data.chatConversationId,
  });
  if (!data.userId && data.candidateUserId) {
    await ClinicLinkRequest.findOrCreate({
      where: { candidateUserId: data.candidateUserId, tenantId, status: 'PENDING' },
      defaults: { message: data.linkMessage },
    });
  }
  await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'patient.created', entityType: 'Patient', entityId: patient.id });
  return patient;
};

const listPatients = async (context, filters = {}) => {
  const tenantId = requireTenant(context.tenantId);
  const where = { tenantId };
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.search) where[Op.or] = [{ fullName: { [Op.iLike]: `%${filters.search}%` } }, { initials: { [Op.iLike]: `%${filters.search}%` } }, { cpf: { [Op.like]: `%${normalizeCpf(filters.search)}%` } }];
  const limit = Math.min(Number(filters.limit || 50), 200);
  const offset = Math.max(Number(filters.offset || 0), 0);
  return Patient.findAndCountAll({ where, order: [['fullName', 'ASC']], limit, offset });
};

const getPatient = async (context, patientId) => assertPatientTenant(patientId, requireTenant(context.tenantId));

const getMyProfiles = async (context) => {
  if (!context.userId) throw new ValidationError('Usuário ausente no contexto');
  return Patient.findAll({ where: { tenantId: requireTenant(context.tenantId), userId: context.userId, isActive: true }, order: [['fullName', 'ASC']] });
};

const updatePatient = async (context, patientId, data) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  const patient = await assertPatientTenant(patientId, tenantId);
  const allowed = ['fullName', 'initials', 'gender', 'birthDate', 'height', 'weight', 'baseDiseases', 'cpf', 'contactPhone', 'contactEmail', 'zipCode', 'street', 'addressNumber', 'complement', 'neighborhood', 'city', 'state', 'addressLat', 'addressLng', 'notes', 'isActive', 'imageUseConsent', 'chatConversationId'];
  const changes = {};
  for (const key of allowed) if (data[key] !== undefined) changes[key] = key === 'cpf' ? normalizeCpf(data[key]) : data[key];
  if (changes.imageUseConsent === true && !patient.imageUseConsentDate) changes.imageUseConsentDate = new Date();
  await patient.update(changes);
  await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'patient.updated', entityType: 'Patient', entityId: patient.id, metadata: { fields: Object.keys(changes) } });
  return patient;
};

const deletePatient = async (context, patientId) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  const patient = await assertPatientTenant(patientId, tenantId);
  await patient.update({ isActive: false });
  await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'patient.deactivated', entityType: 'Patient', entityId: patient.id });
  return patient;
};

const createAssessment = async (context, data) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  await assertPatientTenant(data.patientId, tenantId);
  if (!data.evaluatorId || !data.assessmentDate || data.weight === undefined || data.height === undefined) throw new ValidationError('Campos obrigatórios: evaluatorId, assessmentDate, weight, height');
  const assessment = await ClinicalAssessment.create({ tenantId, patientId: data.patientId, evaluatorId: data.evaluatorId, assessmentDate: data.assessmentDate, weight: data.weight, height: data.height, isBedridden: Boolean(data.isBedridden), notes: data.notes });
  await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'assessment.created', entityType: 'ClinicalAssessment', entityId: assessment.id });
  return assessment;
};

const listAssessments = async (context, patientId) => {
  const tenantId = requireTenant(context.tenantId);
  await assertPatientTenant(patientId, tenantId);
  return ClinicalAssessment.findAll({ where: { tenantId, patientId }, order: [['assessmentDate', 'DESC']] });
};

const getAssessment = async (context, assessmentId) => {
  const assessment = await ClinicalAssessment.findOne({ where: { id: assessmentId, tenantId: requireTenant(context.tenantId) }, include: [{ model: Patient, as: 'patient' }] });
  if (!assessment) throw new NotFoundError('Avaliação não encontrada');
  return assessment;
};

const updateAssessment = async (context, assessmentId, data) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  const assessment = await ClinicalAssessment.findOne({ where: { id: assessmentId, tenantId } });
  if (!assessment) throw new NotFoundError('Avaliação não encontrada');
  const allowed = ['assessmentDate', 'weight', 'height', 'isBedridden', 'notes'];
  await assessment.update(Object.fromEntries(allowed.filter((key) => data[key] !== undefined).map((key) => [key, data[key]])));
  await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'assessment.updated', entityType: 'ClinicalAssessment', entityId: assessment.id });
  return assessment;
};

const createQuestionnaire = async (context, data) => {
  const tenantId = requireTenant(context.tenantId);
  await assertPatientTenant(data.patientId, tenantId);
  if (!data.scores || Object.keys(data.scores).length === 0) throw new ValidationError('Campos obrigatórios: patientId, scores');
  const totalScore = calculateQuestionnaireScore(data.scores);
  const questionnaire = await QualityOfLifeQuestionnaire.create({ tenantId, patientId: data.patientId, assessmentId: data.assessmentId || null, version: data.version || '12-items', scores: data.scores, totalScore, classification: classifyQuestionnaireScore(totalScore) });
  await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'questionnaire.created', entityType: 'QualityOfLifeQuestionnaire', entityId: questionnaire.id });
  return questionnaire;
};

const getQuestionnaireHistory = async (context, patientId, limit = 10) => {
  const tenantId = requireTenant(context.tenantId);
  await assertPatientTenant(patientId, tenantId);
  return QualityOfLifeQuestionnaire.findAll({ where: { tenantId, patientId }, order: [['applicationDate', 'DESC']], limit: Math.min(Number(limit), 100) });
};

const getMyQuestionnaireHistory = async (context, limit = 10) => {
  const patients = await getMyProfiles(context);
  if (patients.length === 0) return [];
  return QualityOfLifeQuestionnaire.findAll({ where: { tenantId: requireTenant(context.tenantId), patientId: patients.map((patient) => patient.id) }, order: [['applicationDate', 'DESC']], limit: Math.min(Number(limit), 100) });
};

const createFunctionalTests = async (context, data) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  let patientId = data.patientId;
  if (data.assessmentId) {
    const assessment = await ClinicalAssessment.findOne({ where: { id: data.assessmentId, tenantId } });
    if (!assessment) throw new NotFoundError('Avaliação não encontrada');
    patientId = patientId || assessment.patientId;
  }
  await assertPatientTenant(patientId, tenantId);
  const functionalTests = { patientId, assessmentId: data.assessmentId || null, testType: data.testType, repetitions: data.repetitions, timeSeconds: data.timeSeconds, notes: data.notes, attempts: data.attempts };
  if (data.bergScores && Object.keys(data.bergScores).length) Object.assign(functionalTests, { bergScores: data.bergScores, ...(() => { const result = calculateBergScore(data.bergScores); return { bergTotalScore: result.totalScore, bergClassification: result.classification }; })() });
  if (data.sitToStand5RepsTime !== undefined) {
    functionalTests.sitToStand5RepsTime = data.sitToStand5RepsTime;
    if (data.patientGender && data.patientAge !== undefined && data.patientHeight) {
      const predicted = calculateSitToStand5RepsPredicted(data.patientGender, data.patientAge, data.patientHeight);
      functionalTests.sitToStand5RepsPredicted = predicted;
      functionalTests.sitToStand5RepsPercentage = (data.sitToStand5RepsTime / predicted) * 100;
      functionalTests.sitToStand5RepsClassification = classifySitToStand5Reps(data.sitToStand5RepsTime, predicted);
    }
  }
  if (data.sitToStand1MinReps !== undefined) functionalTests.sitToStand1MinReps = data.sitToStand1MinReps;
  const tests = await FunctionalTests.create(functionalTests);
  await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'functional_test.created', entityType: 'FunctionalTests', entityId: tests.id });
  return tests;
};

const getFunctionalTests = async (context, patientId) => {
  const tenantId = requireTenant(context.tenantId);
  await assertPatientTenant(patientId, tenantId);
  return FunctionalTests.findAll({ where: { patientId }, order: [['createdAt', 'DESC']] });
};

const createMobilityAssessment = async (context, data) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  await assertPatientTenant(data.patientId, tenantId);
  const mobility = await MobilityAssessment.create({ tenantId, patientId: data.patientId, evaluatorId: data.evaluatorId || context.userId, assessmentDate: data.assessmentDate || new Date(), mobilityLevel: data.mobilityLevel, assistiveDevice: data.assistiveDevice, fallRisk: data.fallRisk, score: data.score, findings: data.findings, notes: data.notes });
  await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'mobility_assessment.created', entityType: 'MobilityAssessment', entityId: mobility.id });
  return mobility;
};

const getMobilityAssessments = async (context, patientId) => {
  const tenantId = requireTenant(context.tenantId);
  await assertPatientTenant(patientId, tenantId);
  return MobilityAssessment.findAll({ where: { tenantId, patientId }, order: [['assessmentDate', 'DESC']] });
};

const createTherapySession = async (context, data) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  await assertPatientTenant(data.patientId, tenantId);
  if (!data.physiotherapistId || !data.sessionNumber || !data.sessionDate) throw new ValidationError('Campos obrigatórios: physiotherapistId, sessionNumber, sessionDate');
  const session = await TherapySession.create({ tenantId, patientId: data.patientId, physiotherapistId: data.physiotherapistId, sessionNumber: data.sessionNumber, sessionDate: data.sessionDate, notes: data.notes, status: data.status || 'completed' });
  await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'therapy_session.created', entityType: 'TherapySession', entityId: session.id });
  return session;
};

const addTherapyPhases = async (context, sessionId, phases) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  const session = await TherapySession.findOne({ where: { id: sessionId, tenantId } });
  if (!session) throw new NotFoundError('Sessão de terapia não encontrada');
  if (!Array.isArray(phases) || phases.length === 0) throw new ValidationError('phases deve ser um array não vazio');
  const transaction = await models.sequelize.transaction();
  try {
    const created = [];
    let totalDuration = 0;
    for (let index = 0; index < phases.length; index += 1) {
      const phase = phases[index];
      if (!phase.phaseName || phase.durationMinutes === undefined || phase.durationMinutes === null) throw new ValidationError(`Fase ${index + 1}: phaseName e durationMinutes são obrigatórios`);
      const item = await TherapyPhase.create({ sessionId, phaseName: phase.phaseName, phaseOrder: index + 1, durationMinutes: phase.durationMinutes, pulseWidth: phase.pulseWidth, intensity: phase.intensity, frequency: phase.frequency, cadence: phase.cadence }, { transaction });
      created.push(item);
      totalDuration += Number(phase.durationMinutes);
    }
    await session.update({ totalDurationMinutes: totalDuration }, { transaction });
    await transaction.commit();
    await audit({ tenantId, actorUserId: context.userId, requestId: context.requestId, action: 'therapy_phases.created', entityType: 'TherapySession', entityId: session.id, metadata: { count: created.length, totalDuration } });
    return created;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getTherapySessions = async (context, patientId) => {
  const tenantId = requireTenant(context.tenantId);
  await assertPatientTenant(patientId, tenantId);
  return TherapySession.findAll({ where: { tenantId, patientId }, include: [{ model: TherapyPhase, as: 'TherapyPhases' }], order: [['sessionDate', 'DESC']], limit: 100 });
};

const getMyTherapySessions = async (context) => {
  const patients = await getMyProfiles(context);
  if (patients.length === 0) return [];
  return TherapySession.findAll({ where: { tenantId: requireTenant(context.tenantId), patientId: patients.map((patient) => patient.id) }, include: [{ model: TherapyPhase, as: 'TherapyPhases' }], order: [['sessionDate', 'DESC']], limit: 100 });
};

const createPatientLinkRequest = async (context, data) => {
  const tenantId = requireTenant(context.tenantId);
  assertRoleCanManage(context);
  await assertPatientTenant(data.patientId, tenantId);
  const request = await PatientLinkRequest.create({ patientId: data.patientId, candidateUserId: data.candidateUserId, requestingTenantId: tenantId, confirmationTokenHash: data.confirmationToken ? sha256(data.confirmationToken) : null, expiresAt: data.expiresAt });
  return request;
};

const createClinicLinkRequest = async (context, data) => {
  const tenantId = requireTenant(context.tenantId);
  if (!context.userId) throw new ValidationError('Usuário ausente no contexto');
  const [request] = await ClinicLinkRequest.findOrCreate({ where: { candidateUserId: context.userId, tenantId, status: 'PENDING' }, defaults: { message: data.message } });
  return request;
};

module.exports = {
  calculateAge,
  classifyQuestionnaireScore,
  calculateQuestionnaireScore,
  calculateBergScore,
  calculateSitToStand5RepsPredicted,
  classifySitToStand5Reps,
  createPatient,
  listPatients,
  getPatient,
  getMyProfiles,
  updatePatient,
  deletePatient,
  createAssessment,
  listAssessments,
  getAssessment,
  updateAssessment,
  createQuestionnaire,
  getQuestionnaireHistory,
  getMyQuestionnaireHistory,
  createFunctionalTests,
  getFunctionalTests,
  createMobilityAssessment,
  getMobilityAssessments,
  createTherapySession,
  addTherapyPhases,
  getTherapySessions,
  getMyTherapySessions,
  createPatientLinkRequest,
  createClinicLinkRequest,
};
