const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClinicalAssessment = sequelize.define('ClinicalAssessment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  patientId: { type: DataTypes.UUID, allowNull: false },
  evaluatorId: { type: DataTypes.UUID, allowNull: false },
  assessmentDate: { type: DataTypes.DATE, allowNull: false },
  weight: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  height: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  isBedridden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'clinical_assessments',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['patientId'] },
    { fields: ['evaluatorId'] },
    { fields: ['assessmentDate'] },
    { fields: ['tenantId', 'patientId'] },
  ],
});

module.exports = ClinicalAssessment;
