const express = require('express');
const controller = require('../controllers/clinicalController');
const { authenticate } = require('../middlewares/auth');
const { schemas, validate } = require('../validators');

const router = express.Router();
router.use(authenticate);

router.post('/patients', validate('createPatient'), controller.createPatient);
router.get('/patients', validate('pagination', 'query'), controller.listPatients);
router.get('/patients/me', controller.getMyProfiles);
router.get('/patients/:patientId', controller.getPatient);
router.put('/patients/:patientId', validate('updatePatient'), controller.updatePatient);
router.delete('/patients/:patientId', controller.deletePatient);

router.post('/assessments', validate('createAssessment'), controller.createAssessment);
router.get('/assessments/:patientId', controller.listAssessments);
router.get('/assessments/detail/:assessmentId', controller.getAssessment);
router.put('/assessments/:assessmentId', validate('updateAssessment'), controller.updateAssessment);

router.post('/questionnaires', validate('createQuestionnaire'), controller.createQuestionnaire);
router.get('/questionnaires/me', controller.getMyQuestionnaireHistory);
router.get('/questionnaires/:patientId', controller.getQuestionnaireHistory);

router.post('/functional-tests', validate('createFunctionalTests'), controller.createFunctionalTests);
router.get('/functional-tests/:patientId', controller.getFunctionalTests);

router.post('/mobility-assessments', validate('createMobilityAssessment'), controller.createMobilityAssessment);
router.get('/mobility-assessments/:patientId', controller.getMobilityAssessments);

router.post('/therapy-sessions', validate('createTherapySession'), controller.createTherapySession);
router.post('/therapy-sessions/:sessionId/phases', validate('addTherapyPhases'), controller.addTherapyPhases);
router.get('/therapy-sessions/me', controller.getMyTherapySessions);
router.get('/therapy-sessions/:patientId', controller.getTherapySessions);

router.post('/patient-link-requests', validate('createPatientLinkRequest'), controller.createPatientLinkRequest);
router.post('/clinic-link-requests', validate('createClinicLinkRequest'), controller.createClinicLinkRequest);

module.exports = router;
