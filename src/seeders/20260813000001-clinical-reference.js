'use strict';

// O RBAC é propriedade do standalone Identity. O Clinical não cria roles,
// usuários ou permissões locais; este seed existe para manter o pipeline
// oficial de seeders idempotente e documentar explicitamente essa fronteira.
module.exports = {
  async up() {},
  async down() {},
};
