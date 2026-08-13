const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FunctionalTests = sequelize.define('FunctionalTests', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patientId: { type: DataTypes.UUID, allowNull: false },
  assessmentId: { type: DataTypes.UUID, allowNull: true },
  testType: { type: DataTypes.ENUM('5_reps', '1_minute'), allowNull: true },
  repetitions: { type: DataTypes.INTEGER, allowNull: true },
  timeSeconds: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  bergScores: { type: DataTypes.JSONB, allowNull: true },
  bergTotalScore: { type: DataTypes.INTEGER, allowNull: true },
  bergClassification: { type: DataTypes.ENUM('Alto risco de queda', 'Risco moderado de queda', 'Baixo risco de queda'), allowNull: true },
  sitToStand5RepsTime: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  sitToStand5RepsPredicted: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  sitToStand5RepsPercentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  sitToStand5RepsClassification: { type: DataTypes.ENUM('Baixíssima potência muscular', 'Baixa potência muscular', 'Regular potência muscular', 'Boa potência muscular', 'Excelente potência muscular'), allowNull: true },
  sitToStand1MinReps: { type: DataTypes.INTEGER, allowNull: true },
  attempts: { type: DataTypes.JSONB, allowNull: true },
}, {
  tableName: 'functional_tests',
  timestamps: true,
  indexes: [
    { fields: ['patientId'] },
    { fields: ['assessmentId'] },
    { fields: ['patientId', 'createdAt'] },
  ],
});

module.exports = FunctionalTests;
