const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MobilityAssessment = sequelize.define('MobilityAssessment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  patientId: { type: DataTypes.UUID, allowNull: false },
  evaluatorId: { type: DataTypes.UUID, allowNull: false },
  assessmentDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  mobilityLevel: { type: DataTypes.STRING, allowNull: true },
  assistiveDevice: { type: DataTypes.STRING, allowNull: true },
  fallRisk: { type: DataTypes.STRING, allowNull: true },
  score: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  findings: { type: DataTypes.JSONB, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'mobility_assessments',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['patientId'] },
    { fields: ['evaluatorId'] },
    { fields: ['assessmentDate'] },
  ],
});

module.exports = MobilityAssessment;
