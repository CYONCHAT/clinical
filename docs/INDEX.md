# Documentação — Clinical / Patient Care

> **Status:** documentação versionada em Docs as Code. **Owner:** Clinical. **Branch:** main.

Este índice organiza a documentação oficial do repositório [Clinical / Patient Care][1]. A documentação global define os padrões; este repositório registra somente responsabilidades, contratos e procedimentos específicos.

## Visão rápida

| Campo | Valor |
| --- | --- |
| Repositório | `clinical` |
| Tipo | module |
| Responsabilidade | Pacientes, atendimentos e fatos clínicos autorizados. |
| Porta declarada | 4710 |
| Banco próprio | Sim, conforme configuração do serviço |
| Entrada oficial | Gateway ou serviço autorizado |

## Documentos

- [Contrato do módulo](module-contract.md)
- [API e endpoints](api.md)
- [Eventos e integrações](events.md)
- [Segurança](security.md)
- [Operação](operations.md)
- [Testes](testing.md)
- [Runbook de saúde](runbooks/health-and-readiness.md)
- [Decisões arquiteturais](decisions/ADR-0001-documentation-standard.md)

## Princípios

Dados clínicos pertencem ao Clinical; módulos financeiros devem receber somente os dados mínimos necessários.

A regra de ownership é obrigatória: comandos que alteram estado devem ser enviados ao owner do domínio; eventos informam mudanças após commit; consultas não transferem ownership.

## Referências

[1]: https://github.com/operaon/clinical "Repositório Clinical / Patient Care"
[2]: https://github.com/operaon/api "API Gateway Operaon"
[3]: https://github.com/operaon/identity "Identity Operaon"
