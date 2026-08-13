const { z } = require('zod');

const uuid = z.string().uuid();
const date = z.coerce.date();

const createPatient = z.object({
  fullName: z.string().min(1).max(200), initials: z.string().min(1).max(10), gender: z.enum(['M', 'F', 'Other']), birthDate: date,
  height: z.coerce.number().positive().max(300).optional(), weight: z.coerce.number().positive().max(500).optional(), baseDiseases: z.array(z.any()).optional(),
  cpf: z.string().min(3).max(20).optional(), contactPhone: z.string().max(40).optional(), contactEmail: z.string().email().optional(), userId: uuid.optional().nullable(), candidateUserId: uuid.optional(), linkMessage: z.string().max(1000).optional(),
  zipCode: z.string().max(12).optional(), street: z.string().max(200).optional(), addressNumber: z.string().max(20).optional(), complement: z.string().max(200).optional(), neighborhood: z.string().max(120).optional(), city: z.string().max(120).optional(), state: z.string().max(2).optional(), addressLat: z.coerce.number().min(-90).max(90).optional(), addressLng: z.coerce.number().min(-180).max(180).optional(), notes: z.string().max(10000).optional(), imageUseConsent: z.boolean().optional(), origin: z.enum(['PLATFORM_LEAD', 'TENANT_DIRECT']).optional(), originLeadId: uuid.optional(), chatConversationId: uuid.optional(),
}).passthrough();
const updatePatient = createPatient.partial();
const createAssessment = z.object({ patientId: uuid, evaluatorId: uuid, assessmentDate: date, weight: z.coerce.number().positive().max(500), height: z.coerce.number().positive().max(300), isBedridden: z.boolean().optional(), notes: z.string().max(10000).optional() }).passthrough();
const updateAssessment = createAssessment.omit({ patientId: true, evaluatorId: true }).partial();
const createQuestionnaire = z.object({ patientId: uuid, assessmentId: uuid.optional().nullable(), version: z.enum(['10-items', '12-items']).optional(), scores: z.record(z.union([z.number(), z.string()])).refine((value) => Object.keys(value).length > 0, { message: 'scores não pode ser vazio' }) }).passthrough();
const createFunctionalTests = z.object({ patientId: uuid.optional(), assessmentId: uuid.optional(), testType: z.enum(['5_reps', '1_minute']).optional(), repetitions: z.coerce.number().int().nonnegative().optional(), timeSeconds: z.coerce.number().nonnegative().optional(), notes: z.string().max(10000).optional(), bergScores: z.record(z.union([z.number(), z.string()])).optional(), sitToStand5RepsTime: z.coerce.number().nonnegative().optional(), sitToStand1MinReps: z.coerce.number().int().nonnegative().optional(), patientGender: z.enum(['M', 'F', 'Other']).optional(), patientAge: z.coerce.number().int().nonnegative().optional(), patientHeight: z.coerce.number().positive().optional(), attempts: z.array(z.any()).optional() }).passthrough().refine((value) => value.patientId || value.assessmentId, { message: 'patientId ou assessmentId é obrigatório' });
const createMobilityAssessment = z.object({ patientId: uuid, evaluatorId: uuid.optional(), assessmentDate: date.optional(), mobilityLevel: z.string().max(80).optional(), assistiveDevice: z.string().max(120).optional(), fallRisk: z.string().max(80).optional(), score: z.coerce.number().optional(), findings: z.record(z.any()).optional(), notes: z.string().max(10000).optional() }).passthrough();
const createTherapySession = z.object({ patientId: uuid, physiotherapistId: uuid, sessionNumber: z.coerce.number().int().positive(), sessionDate: date, notes: z.string().max(10000).optional(), status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional() }).passthrough();
const addTherapyPhases = z.object({ phases: z.array(z.object({ phaseName: z.string().min(1).max(120), durationMinutes: z.coerce.number().int().nonnegative(), pulseWidth: z.coerce.number().optional(), intensity: z.coerce.number().optional(), frequency: z.coerce.number().optional(), cadence: z.coerce.number().optional() }).passthrough()).min(1) });
const createPatientLinkRequest = z.object({ patientId: uuid, candidateUserId: uuid, confirmationToken: z.string().optional(), expiresAt: date.optional() });
const createClinicLinkRequest = z.object({ message: z.string().max(1000).optional() });
const pagination = z.object({ search: z.string().max(120).optional(), isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(), limit: z.coerce.number().int().min(1).max(200).optional(), offset: z.coerce.number().int().min(0).optional() });

const schemas = { createPatient, updatePatient, createAssessment, updateAssessment, createQuestionnaire, createFunctionalTests, createMobilityAssessment, createTherapySession, addTherapyPhases, createPatientLinkRequest, createClinicLinkRequest, pagination };
const validate = (schemaName, source = 'body') => (req, _res, next) => {
  const result = schemas[schemaName].safeParse(req[source]);
  if (!result.success) return next(Object.assign(new Error('Dados inválidos'), { statusCode: 422, code: 'VALIDATION_ERROR', details: result.error.flatten() }));
  req[source] = result.data;
  return next();
};

module.exports = { schemas, validate, uuid };
