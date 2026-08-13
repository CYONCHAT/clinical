const clinicalService = require('../services/clinicalService');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const send = (res, data, status = 200) => res.status(status).json({ success: true, data });
const contextOf = (req) => req.context;

const controller = {
  createPatient: asyncHandler(async (req, res) => send(res, await clinicalService.createPatient(contextOf(req), req.body), 201)),
  listPatients: asyncHandler(async (req, res) => {
    const result = await clinicalService.listPatients(contextOf(req), req.query);
    return send(res, { items: result.rows, total: result.count, limit: Number(req.query.limit || 50), offset: Number(req.query.offset || 0) });
  }),
  getMyProfiles: asyncHandler(async (req, res) => send(res, await clinicalService.getMyProfiles(contextOf(req)))),
  getPatient: asyncHandler(async (req, res) => send(res, await clinicalService.getPatient(contextOf(req), req.params.patientId))),
  updatePatient: asyncHandler(async (req, res) => send(res, await clinicalService.updatePatient(contextOf(req), req.params.patientId, req.body))),
  deletePatient: asyncHandler(async (req, res) => send(res, await clinicalService.deletePatient(contextOf(req), req.params.patientId))),

  createAssessment: asyncHandler(async (req, res) => send(res, await clinicalService.createAssessment(contextOf(req), req.body), 201)),
  listAssessments: asyncHandler(async (req, res) => send(res, await clinicalService.listAssessments(contextOf(req), req.params.patientId))),
  getAssessment: asyncHandler(async (req, res) => send(res, await clinicalService.getAssessment(contextOf(req), req.params.assessmentId))),
  updateAssessment: asyncHandler(async (req, res) => send(res, await clinicalService.updateAssessment(contextOf(req), req.params.assessmentId, req.body))),

  createQuestionnaire: asyncHandler(async (req, res) => send(res, await clinicalService.createQuestionnaire(contextOf(req), req.body), 201)),
  getMyQuestionnaireHistory: asyncHandler(async (req, res) => send(res, await clinicalService.getMyQuestionnaireHistory(contextOf(req), req.query.limit))),
  getQuestionnaireHistory: asyncHandler(async (req, res) => send(res, await clinicalService.getQuestionnaireHistory(contextOf(req), req.params.patientId, req.query.limit))),

  createFunctionalTests: asyncHandler(async (req, res) => send(res, await clinicalService.createFunctionalTests(contextOf(req), req.body), 201)),
  getFunctionalTests: asyncHandler(async (req, res) => send(res, await clinicalService.getFunctionalTests(contextOf(req), req.params.patientId))),

  createMobilityAssessment: asyncHandler(async (req, res) => send(res, await clinicalService.createMobilityAssessment(contextOf(req), req.body), 201)),
  getMobilityAssessments: asyncHandler(async (req, res) => send(res, await clinicalService.getMobilityAssessments(contextOf(req), req.params.patientId))),

  createTherapySession: asyncHandler(async (req, res) => send(res, await clinicalService.createTherapySession(contextOf(req), req.body), 201)),
  addTherapyPhases: asyncHandler(async (req, res) => send(res, await clinicalService.addTherapyPhases(contextOf(req), req.params.sessionId, req.body.phases), 201)),
  getMyTherapySessions: asyncHandler(async (req, res) => send(res, await clinicalService.getMyTherapySessions(contextOf(req)))),
  getTherapySessions: asyncHandler(async (req, res) => send(res, await clinicalService.getTherapySessions(contextOf(req), req.params.patientId))),

  createPatientLinkRequest: asyncHandler(async (req, res) => send(res, await clinicalService.createPatientLinkRequest(contextOf(req), req.body), 201)),
  createClinicLinkRequest: asyncHandler(async (req, res) => send(res, await clinicalService.createClinicLinkRequest(contextOf(req), req.body), 201)),
};

module.exports = controller;
