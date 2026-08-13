const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TherapySession = sequelize.define('TherapySession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  patientId: { type: DataTypes.UUID, allowNull: false },
  physiotherapistId: { type: DataTypes.UUID, allowNull: false },
  sessionNumber: { type: DataTypes.INTEGER, allowNull: false },
  sessionDate: { type: DataTypes.DATE, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
  totalDurationMinutes: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'), allowNull: false, defaultValue: 'completed' },
}, {
  tableName: 'therapy_sessions',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['patientId'] },
    { fields: ['physiotherapistId'] },
    { fields: ['sessionDate'] },
    { fields: ['tenantId', 'patientId'] },
  ],
});

module.exports = TherapySession;
