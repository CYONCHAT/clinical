'use strict';

const express = require('express');
const controller = require('../controllers/clinicalController');
const { authenticate, requirePermission } = require('../middlewares/auth');
const { validate } = require('../validators');

const router = express.Router();
const readClinical = requirePermission('clinical', 'read');
const writeClinical = requirePermission('clinical', 'write');

router.use(authenticate);

router.post('/patients', writeClinical, validate('createPatient'), controller.createPatient);
router.get('/patients', readClinical, validate('pagination', 'query'), controller.listPatients);
router.get('/patients/me', readClinical, controller.getMyProfiles);
router.get('/patients/:patientId', readClinical, controller.getPatient);
router.put('/patients/:patientId', writeClinical, validate('updatePatient'), controller.updatePatient);
router.delete('/patients/:patientId', writeClinical, controller.deletePatient);

router.post('/assessments', writeClinical, validate('createAssessment'), controller.createAssessment);
router.get('/assessments/:patientId', readClinical, controller.listAssessments);
router.get('/assessments/detail/:assessmentId', readClinical, controller.getAssessment);
router.put('/assessments/:assessmentId', writeClinical, validate('updateAssessment'), controller.updateAssessment);

router.post('/questionnaires', writeClinical, validate('createQuestionnaire'), controller.createQuestionnaire);
router.get('/questionnaires/me', readClinical, controller.getMyQuestionnaireHistory);
router.get('/questionnaires/:patientId', readClinical, controller.getQuestionnaireHistory);

router.post('/functional-tests', writeClinical, validate('createFunctionalTests'), controller.createFunctionalTests);
router.get('/functional-tests/:patientId', readClinical, controller.getFunctionalTests);

router.post('/mobility-assessments', writeClinical, validate('createMobilityAssessment'), controller.createMobilityAssessment);
router.get('/mobility-assessments/:patientId', readClinical, controller.getMobilityAssessments);

router.post('/therapy-sessions', writeClinical, validate('createTherapySession'), controller.createTherapySession);
router.post('/therapy-sessions/:sessionId/phases', writeClinical, validate('addTherapyPhases'), controller.addTherapyPhases);
router.get('/therapy-sessions/me', readClinical, controller.getMyTherapySessions);
router.get('/therapy-sessions/:patientId', readClinical, controller.getTherapySessions);

router.post('/patient-link-requests', writeClinical, validate('createPatientLinkRequest'), controller.createPatientLinkRequest);
router.post('/clinic-link-requests', writeClinical, validate('createClinicLinkRequest'), controller.createClinicLinkRequest);

module.exports = router;
