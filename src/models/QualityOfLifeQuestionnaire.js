const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QualityOfLifeQuestionnaire = sequelize.define('QualityOfLifeQuestionnaire', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  patientId: { type: DataTypes.UUID, allowNull: false },
  assessmentId: { type: DataTypes.UUID, allowNull: true },
  applicationDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  version: { type: DataTypes.ENUM('10-items', '12-items'), allowNull: false, defaultValue: '12-items' },
  scores: { type: DataTypes.JSONB, allowNull: false },
  totalScore: { type: DataTypes.INTEGER, allowNull: false },
  classification: { type: DataTypes.ENUM('Muito comprometido', 'Comprometido', 'Moderado', 'Bom', 'Excelente'), allowNull: false },
}, {
  tableName: 'quality_of_life_questionnaires',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['patientId'] },
    { fields: ['assessmentId'] },
    { fields: ['applicationDate'] },
    { fields: ['tenantId', 'patientId'] },
  ],
});

module.exports = QualityOfLifeQuestionnaire;
