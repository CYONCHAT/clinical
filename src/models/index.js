const sequelize = require('../config/database');
const Patient = require('./Patient');
const ClinicalAssessment = require('./ClinicalAssessment');
const QualityOfLifeQuestionnaire = require('./QualityOfLifeQuestionnaire');
const FunctionalTests = require('./FunctionalTests');
const MobilityAssessment = require('./MobilityAssessment');
const TherapySession = require('./TherapySession');
const TherapyPhase = require('./TherapyPhase');
const PatientLinkRequest = require('./PatientLinkRequest');
const ClinicLinkRequest = require('./ClinicLinkRequest');

Patient.hasMany(ClinicalAssessment, { foreignKey: 'patientId', as: 'assessments', onDelete: 'CASCADE' });
ClinicalAssessment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(QualityOfLifeQuestionnaire, { foreignKey: 'patientId', as: 'questionnaires', onDelete: 'CASCADE' });
QualityOfLifeQuestionnaire.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
QualityOfLifeQuestionnaire.belongsTo(ClinicalAssessment, { foreignKey: 'assessmentId', as: 'assessment' });

Patient.hasMany(FunctionalTests, { foreignKey: 'patientId', as: 'functionalTests', onDelete: 'CASCADE' });
FunctionalTests.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
FunctionalTests.belongsTo(ClinicalAssessment, { foreignKey: 'assessmentId', as: 'assessment' });

Patient.hasMany(MobilityAssessment, { foreignKey: 'patientId', as: 'mobilityAssessments', onDelete: 'CASCADE' });
MobilityAssessment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(TherapySession, { foreignKey: 'patientId', as: 'therapySessions', onDelete: 'CASCADE' });
TherapySession.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
TherapySession.hasMany(TherapyPhase, { foreignKey: 'sessionId', as: 'TherapyPhases', onDelete: 'CASCADE' });
TherapyPhase.belongsTo(TherapySession, { foreignKey: 'sessionId', as: 'session' });

Patient.hasMany(PatientLinkRequest, { foreignKey: 'patientId', as: 'linkRequests', onDelete: 'CASCADE' });
PatientLinkRequest.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

module.exports = {
  sequelize,
  Patient,
  ClinicalAssessment,
  QualityOfLifeQuestionnaire,
  FunctionalTests,
  MobilityAssessment,
  TherapySession,
  TherapyPhase,
  PatientLinkRequest,
  ClinicLinkRequest,
};
