const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClinicLinkRequest = sequelize.define('ClinicLinkRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  candidateUserId: { type: DataTypes.UUID, allowNull: false },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'DISMISSED', 'RESOLVED'), allowNull: false, defaultValue: 'PENDING' },
  message: { type: DataTypes.TEXT, allowNull: true },
  resolvedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'clinic_link_requests',
  timestamps: true,
  indexes: [
    { fields: ['candidateUserId'] },
    { fields: ['tenantId'] },
    { fields: ['status'] },
    { unique: true, fields: ['candidateUserId', 'tenantId'], where: { status: 'PENDING' } },
  ],
});

module.exports = ClinicLinkRequest;
