const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TherapyPhase = sequelize.define('TherapyPhase', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sessionId: { type: DataTypes.UUID, allowNull: false },
  phaseName: { type: DataTypes.STRING, allowNull: false },
  phaseOrder: { type: DataTypes.INTEGER, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false },
  pulseWidth: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  intensity: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  frequency: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  cadence: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
}, {
  tableName: 'therapy_phases',
  timestamps: true,
  indexes: [
    { fields: ['sessionId'] },
    { unique: true, fields: ['sessionId', 'phaseOrder'] },
  ],
});

module.exports = TherapyPhase;
