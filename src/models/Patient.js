const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  initials: { type: DataTypes.STRING(10), allowNull: false },
  gender: { type: DataTypes.ENUM('M', 'F', 'Other'), allowNull: false },
  birthDate: { type: DataTypes.DATE, allowNull: false },
  height: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  weight: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  baseDiseases: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
  cpf: { type: DataTypes.STRING(14), allowNull: true },
  contactPhone: { type: DataTypes.STRING, allowNull: true },
  contactEmail: { type: DataTypes.STRING, allowNull: true },
  zipCode: { type: DataTypes.STRING(9), allowNull: true },
  street: { type: DataTypes.STRING, allowNull: true },
  addressNumber: { type: DataTypes.STRING(20), allowNull: true },
  complement: { type: DataTypes.STRING, allowNull: true },
  neighborhood: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING(2), allowNull: true },
  addressLat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  addressLng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  imageUseConsent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  imageUseConsentDate: { type: DataTypes.DATE, allowNull: true },
  origin: { type: DataTypes.ENUM('PLATFORM_LEAD', 'TENANT_DIRECT'), allowNull: false, defaultValue: 'TENANT_DIRECT' },
  originLeadId: { type: DataTypes.UUID, allowNull: true },
  chatConversationId: { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'patients',
  timestamps: true,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['userId'] },
    { fields: ['isActive'] },
    { fields: ['tenantId', 'isActive'] },
    { fields: ['cpf'] },
    { fields: ['originLeadId'] },
    { fields: ['chatConversationId'] },
  ],
});

module.exports = Patient;
