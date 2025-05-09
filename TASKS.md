# 📋 Tasks do Projeto AI Agents Study

## 1. Setup Inicial
- [x] Inicializar projeto Node.js com TypeScript
- [x] Instalar dependências principais
- [x] Configurar arquivos de ambiente (.env)

## 2. Modelagem e Banco de Dados
- [x] Definir schema com Drizzle (Product, Order, Customer)
- [x] Configurar PostgreSQL com pgvector
- [x] Criar migrações com drizzle-kit
- [x] Implementar seed de dados para testes

## 3. Backend/API
- [x] Criar endpoints Express:
  - [x] POST /chat (mensagem e resposta)
  - [x] POST /handoff (transferência para humano)
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