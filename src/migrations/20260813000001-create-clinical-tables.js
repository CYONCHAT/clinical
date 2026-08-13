'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    const { DataTypes } = Sequelize;
    const timestamps = {
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    };

    await queryInterface.createTable('patients', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      tenantId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID },
      fullName: { type: DataTypes.STRING, allowNull: false },
      initials: { type: DataTypes.STRING(10), allowNull: false },
      gender: { type: DataTypes.ENUM('M', 'F', 'Other'), allowNull: false },
      birthDate: { type: DataTypes.DATE, allowNull: false },
      height: { type: DataTypes.DECIMAL(5, 2) },
      weight: { type: DataTypes.DECIMAL(5, 2) },
      baseDiseases: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      cpf: { type: DataTypes.STRING(14) },
      contactPhone: { type: DataTypes.STRING },
      contactEmail: { type: DataTypes.STRING },
      zipCode: { type: DataTypes.STRING(9) },
      street: { type: DataTypes.STRING },
      addressNumber: { type: DataTypes.STRING(20) },
      complement: { type: DataTypes.STRING },
      neighborhood: { type: DataTypes.STRING },
      city: { type: DataTypes.STRING },
      state: { type: DataTypes.STRING(2) },
      addressLat: { type: DataTypes.DECIMAL(10, 8) },
      addressLng: { type: DataTypes.DECIMAL(11, 8) },
      notes: { type: DataTypes.TEXT },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      imageUseConsent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      imageUseConsentDate: { type: DataTypes.DATE },
      origin: { type: DataTypes.ENUM('PLATFORM_LEAD', 'TENANT_DIRECT'), allowNull: false, defaultValue: 'TENANT_DIRECT' },
      originLeadId: { type: DataTypes.UUID },
      chatConversationId: { type: DataTypes.UUID },
      ...timestamps,
    });
    await queryInterface.addIndex('patients', ['tenantId']);
    await queryInterface.addIndex('patients', ['userId']);
    await queryInterface.addIndex('patients', ['isActive']);
    await queryInterface.addIndex('patients', ['tenantId', 'isActive']);
    await queryInterface.addIndex('patients', ['cpf']);
    await queryInterface.addIndex('patients', ['originLeadId']);
    await queryInterface.addIndex('patients', ['chatConversationId']);

    await queryInterface.createTable('clinical_assessments', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      tenantId: { type: DataTypes.UUID, allowNull: false },
      patientId: { type: DataTypes.UUID, allowNull: false, references: { model: 'patients', key: 'id' }, onDelete: 'CASCADE' },
      evaluatorId: { type: DataTypes.UUID, allowNull: false },
      assessmentDate: { type: DataTypes.DATE, allowNull: false },
      weight: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
      height: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      isBedridden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      notes: { type: DataTypes.TEXT },
      ...timestamps,
    });
    await queryInterface.addIndex('clinical_assessments', ['tenantId', 'patientId']);
    await queryInterface.addIndex('clinical_assessments', ['evaluatorId']);
    await queryInterface.addIndex('clinical_assessments', ['assessmentDate']);

    await queryInterface.createTable('quality_of_life_questionnaires', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      tenantId: { type: DataTypes.UUID, allowNull: false },
      patientId: { type: DataTypes.UUID, allowNull: false, references: { model: 'patients', key: 'id' }, onDelete: 'CASCADE' },
      assessmentId: { type: DataTypes.UUID, references: { model: 'clinical_assessments', key: 'id' }, onDelete: 'SET NULL' },
      applicationDate: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      version: { type: DataTypes.ENUM('10-items', '12-items'), allowNull: false, defaultValue: '12-items' },
      scores: { type: DataTypes.JSONB, allowNull: false },
      totalScore: { type: DataTypes.INTEGER, allowNull: false },
      classification: { type: DataTypes.ENUM('Muito comprometido', 'Comprometido', 'Moderado', 'Bom', 'Excelente'), allowNull: false },
      ...timestamps,
    });
    await queryInterface.addIndex('quality_of_life_questionnaires', ['tenantId', 'patientId']);
    await queryInterface.addIndex('quality_of_life_questionnaires', ['assessmentId']);
    await queryInterface.addIndex('quality_of_life_questionnaires', ['applicationDate']);

    await queryInterface.createTable('functional_tests', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      patientId: { type: DataTypes.UUID, allowNull: false, references: { model: 'patients', key: 'id' }, onDelete: 'CASCADE' },
      assessmentId: { type: DataTypes.UUID, references: { model: 'clinical_assessments', key: 'id' }, onDelete: 'SET NULL' },
      testType: { type: DataTypes.ENUM('5_reps', '1_minute') },
      repetitions: { type: DataTypes.INTEGER },
      timeSeconds: { type: DataTypes.DECIMAL(5, 2) },
      notes: { type: DataTypes.TEXT },
      bergScores: { type: DataTypes.JSONB },
      bergTotalScore: { type: DataTypes.INTEGER },
      bergClassification: { type: DataTypes.ENUM('Alto risco de queda', 'Risco moderado de queda', 'Baixo risco de queda') },
      sitToStand5RepsTime: { type: DataTypes.DECIMAL(5, 2) },
      sitToStand5RepsPredicted: { type: DataTypes.DECIMAL(5, 2) },
      sitToStand5RepsPercentage: { type: DataTypes.DECIMAL(5, 2) },
      sitToStand5RepsClassification: { type: DataTypes.ENUM('Baixíssima potência muscular', 'Baixa potência muscular', 'Regular potência muscular', 'Boa potência muscular', 'Excelente potência muscular') },
      sitToStand1MinReps: { type: DataTypes.INTEGER },
      attempts: { type: DataTypes.JSONB },
      ...timestamps,
    });
    await queryInterface.addIndex('functional_tests', ['patientId', 'createdAt']);
    await queryInterface.addIndex('functional_tests', ['assessmentId']);

    await queryInterface.createTable('mobility_assessments', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      tenantId: { type: DataTypes.UUID, allowNull: false },
      patientId: { type: DataTypes.UUID, allowNull: false, references: { model: 'patients', key: 'id' }, onDelete: 'CASCADE' },
      evaluatorId: { type: DataTypes.UUID, allowNull: false },
      assessmentDate: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      mobilityLevel: { type: DataTypes.STRING },
      assistiveDevice: { type: DataTypes.STRING },
      fallRisk: { type: DataTypes.STRING },
      score: { type: DataTypes.DECIMAL(8, 2) },
      findings: { type: DataTypes.JSONB },
      notes: { type: DataTypes.TEXT },
      ...timestamps,
    });
    await queryInterface.addIndex('mobility_assessments', ['tenantId', 'patientId']);
    await queryInterface.addIndex('mobility_assessments', ['evaluatorId']);
    await queryInterface.addIndex('mobility_assessments', ['assessmentDate']);

    await queryInterface.createTable('therapy_sessions', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      tenantId: { type: DataTypes.UUID, allowNull: false },
      patientId: { type: DataTypes.UUID, allowNull: false, references: { model: 'patients', key: 'id' }, onDelete: 'CASCADE' },
      physiotherapistId: { type: DataTypes.UUID, allowNull: false },
      sessionNumber: { type: DataTypes.INTEGER, allowNull: false },
      sessionDate: { type: DataTypes.DATE, allowNull: false },
      notes: { type: DataTypes.TEXT },
      totalDurationMinutes: { type: DataTypes.INTEGER },
      status: { type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'), allowNull: false, defaultValue: 'completed' },
      ...timestamps,
    });
    await queryInterface.addIndex('therapy_sessions', ['tenantId', 'patientId']);
    await queryInterface.addIndex('therapy_sessions', ['physiotherapistId']);
    await queryInterface.addIndex('therapy_sessions', ['sessionDate']);

    await queryInterface.createTable('therapy_phases', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      sessionId: { type: DataTypes.UUID, allowNull: false, references: { model: 'therapy_sessions', key: 'id' }, onDelete: 'CASCADE' },
      phaseName: { type: DataTypes.STRING, allowNull: false },
      phaseOrder: { type: DataTypes.INTEGER, allowNull: false },
      durationMinutes: { type: DataTypes.INTEGER, allowNull: false },
      pulseWidth: { type: DataTypes.DECIMAL(8, 2) },
      intensity: { type: DataTypes.DECIMAL(8, 2) },
      frequency: { type: DataTypes.DECIMAL(8, 2) },
      cadence: { type: DataTypes.DECIMAL(8, 2) },
      ...timestamps,
    });
    await queryInterface.addIndex('therapy_phases', ['sessionId', 'phaseOrder'], { unique: true });

    await queryInterface.createTable('patient_link_requests', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      patientId: { type: DataTypes.UUID, allowNull: false, references: { model: 'patients', key: 'id' }, onDelete: 'CASCADE' },
      candidateUserId: { type: DataTypes.UUID, allowNull: false },
      requestingTenantId: { type: DataTypes.UUID, allowNull: false },
      status: { type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED'), allowNull: false, defaultValue: 'PENDING' },
      confirmationTokenHash: { type: DataTypes.STRING(128) },
      confirmedAt: { type: DataTypes.DATE },
      expiresAt: { type: DataTypes.DATE },
      ...timestamps,
    });
    await queryInterface.addIndex('patient_link_requests', ['candidateUserId']);
    await queryInterface.addIndex('patient_link_requests', ['patientId']);
    await queryInterface.addIndex('patient_link_requests', ['requestingTenantId']);
    await queryInterface.addIndex('patient_link_requests', ['status']);
    await queryInterface.addIndex('patient_link_requests', ['patientId', 'requestingTenantId'], { unique: true, where: { status: 'PENDING' } });

    await queryInterface.createTable('clinic_link_requests', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      candidateUserId: { type: DataTypes.UUID, allowNull: false },
      tenantId: { type: DataTypes.UUID, allowNull: false },
      status: { type: DataTypes.ENUM('PENDING', 'DISMISSED', 'RESOLVED'), allowNull: false, defaultValue: 'PENDING' },
      message: { type: DataTypes.TEXT },
      resolvedAt: { type: DataTypes.DATE },
      ...timestamps,
    });
    await queryInterface.addIndex('clinic_link_requests', ['candidateUserId']);
    await queryInterface.addIndex('clinic_link_requests', ['tenantId']);
    await queryInterface.addIndex('clinic_link_requests', ['status']);
    await queryInterface.addIndex('clinic_link_requests', ['candidateUserId', 'tenantId'], { unique: true, where: { status: 'PENDING' } });

    await queryInterface.createTable('clinical_audit_events', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      tenantId: { type: DataTypes.UUID, allowNull: false },
      actorUserId: { type: DataTypes.UUID },
      requestId: { type: DataTypes.STRING(128) },
      action: { type: DataTypes.STRING(80), allowNull: false },
      entityType: { type: DataTypes.STRING(80), allowNull: false },
      entityId: { type: DataTypes.UUID },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      occurredAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('clinical_audit_events', ['tenantId', 'occurredAt']);
    await queryInterface.addIndex('clinical_audit_events', ['entityType', 'entityId']);
    await queryInterface.addIndex('clinical_audit_events', ['actorUserId']);
  },

  async down(queryInterface) {
    for (const table of [
      'clinical_audit_events',
      'clinic_link_requests',
      'patient_link_requests',
      'therapy_phases',
      'therapy_sessions',
      'mobility_assessments',
      'functional_tests',
      'quality_of_life_questionnaires',
      'clinical_assessments',
      'patients',
    ]) {
      await queryInterface.dropTable(table);
    }
    for (const typeName of [
      'enum_patients_gender',
      'enum_patients_origin',
      'enum_quality_of_life_questionnaires_version',
      'enum_quality_of_life_questionnaires_classification',
      'enum_functional_tests_testType',
      'enum_functional_tests_bergClassification',
      'enum_functional_tests_sitToStand5RepsClassification',
      'enum_therapy_sessions_status',
      'enum_patient_link_requests_status',
      'enum_clinic_link_requests_status',
    ]) {
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${typeName}";`);
    }
  },
};
