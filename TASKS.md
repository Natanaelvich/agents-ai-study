# 📋 Tasks do Projeto AI Agents Study

## 1. Setup Inicial
- [ ] Inicializar projeto Node.js com TypeScript
- [ ] Instalar dependências principais
- [ ] Configurar arquivos de ambiente (.env)

## 2. Modelagem e Banco de Dados
- [ ] Definir modelos no Prisma (Product, Order, Customer)
- [ ] Executar migrações e criar banco SQLite/PostgreSQL
- [ ] Implementar seed de dados para testes

## 3. Backend/API
- [ ] Criar endpoints Express:
  - [ ] POST /chat (mensagem e resposta)
  - [ ] POST /handoff (transferência para humano)
- [ ] Implementar lógica do agente com LangChain
- [ ] Implementar integração com Redis para contexto

## 4. Integrações
- [ ] Integração com Google Sheets (registro de pedidos/logs)
- [ ] Envio de emails (Nodemailer ou SendGrid)
- [ ] Integração com Google Calendar (agendamento)

## 5. Interface
- [ ] Criar interface CLI simples
- [ ] (Opcional) Iniciar frontend React

## 6. Testes
- [ ] Testes unitários dos endpoints
- [ ] Testes de integração dos fluxos principais
- [ ] Testar persistência no banco, Redis e planilha

## 7. Monitoramento e Logs
- [ ] Implementar logs de eventos importantes (pedido, erro, handoff)
- [ ] Validar expiração de sessões no Redis

## 8. Futuras Melhorias
- [ ] Migrar para AutogenJS
- [ ] Criar dashboard de administração
- [ ] Automatizar CI/CD e testes

---

Marque as tarefas conforme forem concluídas para acompanhar o progresso do projeto. 