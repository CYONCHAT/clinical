# Arquitetura e responsabilidades — Clinical / Patient Care

## Propósito

Pacientes, atendimentos e fatos clínicos autorizados. O serviço declara a porta **4710** no ambiente atual.

## Boundary de responsabilidade

| Dentro do boundary | Fora do boundary |
| --- | --- |
| Persistência e regras do domínio de Clinical / Patient Care | Regras pertencentes a outros owners |
| Validação de tenant, organização e autorização | Confiança em dados não assinados do cliente |
| Auditoria das mutações relevantes | Alterações diretas no banco de outro módulo |
| Contratos de integração versionados | Recalcular estados oficiais de outro owner |

## Topologia

```mermaid
flowchart LR
  Client[Cliente ou serviço autorizado] --> Boundary[Clinical / Patient Care]
  Boundary --> Identity[Identity / JWT]
  Boundary --> Tenant[Tenant & Organization]
  Boundary --> Audit[Audit & Activity]
  Boundary -. eventos .-> Reporting[Reporting & Analytics]
```

## Dependências autorizadas

Identity e Tenant & Organization; integrações explícitas com Agend, Notification e Reporting.

Toda dependência deve utilizar o contrato transversal de comunicação, audience e scope mínimos. Nenhum módulo deve abrir acesso direto ao banco de outro módulo.

## Ownership e dados

Dados clínicos pertencem ao Clinical; módulos financeiros devem receber somente os dados mínimos necessários. Dados persistidos neste repositório devem possuir tenant/organization quando o domínio for multi-tenant, chaves únicas apropriadas, migrations versionadas e trilha de auditoria para alterações sensíveis.

## Evolução

Mudanças de boundary, ownership, estado ou contrato devem ser registradas em ADR antes da implementação. Mudanças incompatíveis exigem nova versão de contrato e janela de compatibilidade.

## Referências

[1]: https://github.com/operaon/clinical "Repositório Clinical / Patient Care"
[2]: https://github.com/operaon/api "API Gateway Operaon"
[3]: https://github.com/operaon/identity "Identity Operaon"
