const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PatientLinkRequest = sequelize.define('PatientLinkRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patientId: { type: DataTypes.UUID, allowNull: false },
  candidateUserId: { type: DataTypes.UUID, allowNull: false },
  requestingTenantId: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED'), allowNull: false, defaultValue: 'PENDING' },
  confirmationTokenHash: { type: DataTypes.STRING(128), allowNull: true },
  confirmedAt: { type: DataTypes.DATE, allowNull: true },
  expiresAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'patient_link_requests',
  timestamps: true,
  indexes: [
    { fields: ['candidateUserId'] },
    { fields: ['patientId'] },
    { fields: ['requestingTenantId'] },
    { fields: ['status'] },
    { unique: true, fields: ['patientId', 'requestingTenantId'], where: { status: 'PENDING' } },
  ],
});

module.exports = PatientLinkRequest;
