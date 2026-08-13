# Operaon Clinical

Standalone responsável pelo domínio **Clinical / Patient Care** da plataforma Operaon. O serviço concentra o prontuário clínico, avaliações, questionários, testes funcionais, mobilidade, sessões terapêuticas e pedidos de vínculo entre paciente e clínica.

## Responsabilidades

O Clinical é dono das entidades clínicas e de seus dados transacionais. `tenantId`, `userId`, `evaluatorId` e `physiotherapistId` são referências opacas a serviços externos; o serviço não replica usuários, organizações, roles ou permissões do Identity.

> O Identity autentica e emite tokens. O Clinical valida o JWT, aplica o contexto de tenant e executa as regras clínicas. A API gateway encaminha as chamadas durante a migração gradual.

| Capacidade | Endpoint base |
|---|---|
| Pacientes | `/api/clinical/patients` |
| Avaliações | `/api/clinical/assessments` |
| Qualidade de vida | `/api/clinical/questionnaires` |
| Testes funcionais | `/api/clinical/functional-tests` |
| Mobilidade | `/api/clinical/mobility-assessments` |
| Terapia | `/api/clinical/therapy-sessions` |
| Vínculos | `/api/clinical/patient-link-requests` e `/api/clinical/clinic-link-requests` |

## Execução local

Requisitos: Node.js 18 ou superior e PostgreSQL 14 ou superior.

```bash
cp .env.example .env
npm install
npm run migrate
npm run seed
npm test -- --runInBand
npm start
```

O serviço escuta por padrão em `http://localhost:4710`. O health check público está em `/health` e a prontidão em `/ready`.

## Configuração

Nunca publique um `.env` real. Os valores abaixo são apenas um contrato de configuração e devem ser fornecidos pelo ambiente de execução ou por um secret manager.

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `development`, `test` ou `production`. |
| `HOST` / `CLINICAL_HOST` | Interface de bind do processo. |
| `PORT` / `CLINICAL_PORT` | Porta HTTP; default `4710`. |
| `DATABASE_URL` ou `DB_*` | Conexão PostgreSQL exclusiva do Clinical. |
| `SERVICE_API_KEY` | Chave backend-a-backend exigida no header `X-Service-Key`. |
| `JWT_SECRET` | Segredo HS256 em desenvolvimento/teste; em produção prefira RS256/EdDSA. |
| `JWT_ISSUER` | Issuer esperado nos tokens emitidos pelo Identity. |
| `JWT_AUDIENCE` | Audience aceita pelo serviço, separada por vírgula. |
| `JWT_ALGORITHM` | `HS256`, `RS256` ou `EdDSA`. |
| `CORS_ORIGIN` | Lista de origens permitidas. |
| `MFA_ENCRYPTION_KEY` | Mantido para compatibilidade operacional do template; não é usado para autenticação clínica. |
| `LOG_LEVEL` | Nível do logger estruturado. |

## Segurança e isolamento

Toda rota clínica exige `X-Service-Key` e um bearer token JWT válido. O token deve conter `sub`, `iss`, `aud` e, para operações tenant-scoped, `tenantId`. Quando `X-Tenant-Id` é enviado, ele precisa ser compatível com o `tenantId` do token; divergências são rejeitadas com `403`.

As consultas sempre filtram por `tenantId`. IDs de Identity e de organizações são tratados como UUIDs externos e não criam foreign keys entre bancos. O serviço não aceita que o cliente escolha livremente o tenant de execução.

## Migrações e testes

A migration inicial cria as tabelas clínicas, índices por tenant e a trilha `clinical_audit_events`. O seed é idempotente e cria apenas referências clínicas necessárias ao ambiente. A suíte de contrato cobre health check, autenticação do gateway, criação e isolamento de pacientes, avaliações, questionários, testes funcionais, mobilidade, terapia e vínculos.

```bash
npm run migrate
npm run seed
npm test -- --runInBand
```

## Integração gradual com a API

Durante o cutover, a API central mantém `/api/clinical` para compatibilidade. O adapter novo é exposto pelo namespace não destrutivo `/api/clinical-standalone`, que encaminha para o Clinical em `/api/clinical` usando as credenciais criptografadas da integração `clinical`.

Para configurar a integração no gateway, cadastre uma integração ativa com:

```json
{
  "provider": "clinical",
  "environment": "sandbox",
  "label": "Operaon Clinical local",
  "credentials": { "serviceApiKey": "secret-gerenciado-fora-do-repositorio" },
  "config": { "baseURL": "http://localhost:4710" },
  "isActive": true
}
```

O cutover recomendado é: dual-read controlado, comparação de envelopes, observação de erros e latência, migração dos consumidores para `/api/clinical-standalone`, rollback por feature flag e remoção das rotas legadas somente após evidência operacional.

## Contrato de autenticação

O gateway propaga o bearer token emitido pelo Identity e a chave backend-a-backend em `X-Service-Key`. O Clinical não mantém usuários locais nem emite tokens. Em chamadas diretas, os headers mínimos são:

```text
X-Service-Key: <chave-do-servico>
Authorization: Bearer <access-token-do-Identity>
X-Tenant-Id: <tenant-uuid>
```

## Observabilidade

O serviço utiliza logging estruturado, request id e readiness separado do health check. Eventos clínicos relevantes são gravados em `clinical_audit_events`, sem registrar senhas, tokens, chaves de serviço ou códigos de MFA. O banco do Clinical deve ser isolado do banco da API e acessado com usuário de menor privilégio.
