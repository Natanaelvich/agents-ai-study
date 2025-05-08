# AI Agents Study

A study repository for exploring AI agents, autonomous systems, and agent-based architectures.

## Project Description

This repository contains experiments and implementations of various techniques related to:
- AI Agents and autonomous systems
- Multi-agent architectures and communication
- Agent decision-making and planning
- Task automation and orchestration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your API keys:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
npm run dev
```

## Project Structure

- `src/` - Source code
- `docs/` - Documentation and examples
- `tests/` - Test files

## Technologies

- TypeScript
- Node.js
- AI Agent frameworks
- Task orchestration tools

## License

MIT 

# 🤖 AI Agent para Atendimento e Coleta de Dados

## 🎯 Objetivo do Projeto
Criar um AI Agent (chatbot) com as seguintes capacidades:

1. Responder dúvidas sobre produtos.
2. Coletar dados do cliente (nome, pedido, endereço).
3. Consultar e registrar dados no banco (catálogo e pedidos).
4. Encaminhar casos não resolvidos para um atendente humano.

---

## 🧱 Stack Utilizada
- Node.js + TypeScript
- LangChain (ou AutogenJS futuramente)
- Redis (para estado e cache)
- Prisma ORM
- SQLite (dev) ou PostgreSQL (prod)

---

## 🗂️ Etapas do Projeto

### 1. Setup Inicial
- Inicializar projeto Node.js com TypeScript
- Instalar dependências:
  ```bash
  npm install express langchain redis prisma @prisma/client zod
  ```

### 2. Modelagem com Prisma
```prisma
model Product {
  id        String @id @default(cuid())
  name      String
  price     Float
  stock     Int
  createdAt DateTime @default(now())
}

model Order {
  id         String   @id @default(cuid())
  customer   Customer @relation(fields: [customerId], references: [id])
  customerId String
  items      Json
  address    String
  status     String
  createdAt  DateTime @default(now())
}

model Customer {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```
- Criar banco com `npx prisma migrate dev`

### 3. LangChain Agent
- Criar agente com ferramentas (tools):
  - Busca de produto via banco
  - Registro de pedido
  - Escalonamento para humano

### 4. API/Backend
- Endpoints Express:
  - `POST /chat`: recebe mensagem e responde
  - `POST /handoff`: transfere para humano

### 5. Redis para Contexto
- Armazenar estado de conversas por usuário

### 6. Interface Simples (CLI ou Web)
- CLI ou integração com React frontend opcional

### 7. 📅 Agendamento
- Integração com Google Calendar

---

## 🧠 Poderes Adicionais do AI Agent

### 1. 📊 Atualizar Planilhas (Google Sheets)
- Registrar pedidos ou log de conversas
- Usar Google Sheets API

### 2. 📨 Enviar Emails
- Notificar humanos sobre pedidos ou erros
- Nodemailer ou SendGrid

### 3. 🧾 Gerar PDFs
- Criar comprovantes de pedido
- pdfkit ou puppeteer

### 4. 📚 Base de Conhecimento (RAG)
- Responder dúvidas com LangChain + Embeddings + Redis

### 5. 🔁 Follow-up Automático
- Perguntar feedback após entrega

### 6. 🔐 Login com Token
- Sessões seguras por cliente

### 7. 🔍 Análise de Conversas
- Resumir e classificar conversas com LLM

### 8. 📅 Agendamento
- Integração com Google Calendar
---

## ✅ Testes e Casos de Uso

### Exemplo de Fluxo Completo de Atendimento

**Cenário:** Maria deseja comprar um produto e utilizar o atendimento automatizado.

1. **Início da Conversa:**
   - Maria inicia o chat perguntando: "Quais produtos estão disponíveis?"
   - O AI Agent consulta o banco de dados e responde com a lista de produtos e preços.

2. **Escolha do Produto:**
   - Maria escolhe um produto e pergunta: "Quero comprar o Produto X. Como faço?"
   - O AI Agent solicita os dados necessários: nome, endereço e quantidade desejada.

3. **Coleta de Dados:**
   - Maria informa seus dados.
   - O AI Agent valida as informações e confirma o pedido.

4. **Registro do Pedido:**
   - O pedido é registrado no banco de dados.
   - O AI Agent informa o número do pedido e o status inicial (ex: "Aguardando pagamento").

5. **Dúvida ou Problema:**
   - Maria pergunta sobre prazo de entrega ou relata um problema.
   - O AI Agent tenta responder com base na base de conhecimento.
   - Se não conseguir resolver, oferece encaminhamento para um atendente humano.

6. **Encaminhamento para Humano (se necessário):**
   - Caso Maria aceite, o caso é transferido para um atendente, que recebe o histórico da conversa.

7. **Finalização:**
   - Maria recebe confirmação do atendimento e pode avaliar a experiência.

---

Esses testes cobrem desde dúvidas simples até o registro de pedidos e o handoff para atendimento humano, garantindo que o fluxo do agente seja robusto e eficiente.

### Critérios de Aceite

Para considerar o fluxo de atendimento aprovado, os seguintes requisitos técnicos devem ser atendidos:

- **Banco de Dados:**
  - Pedido salvo corretamente no banco (Prisma/SQLite ou PostgreSQL), com todos os campos obrigatórios preenchidos (cliente, itens, endereço, status, data).
  - Cliente cadastrado corretamente, sem duplicidade.

- **Redis:**
  - Contexto da conversa salvo no Redis para cada usuário, incluindo histórico de mensagens e status do atendimento.
  - Chaves de sessão expiram corretamente após o tempo configurado.

- **Planilha (Google Sheets):**
  - Registro do pedido e/ou log de conversas atualizado na planilha, com dados do cliente, itens e status.
  - Não deve haver perda de dados ou inconsistências entre banco e planilha.

- **API/Backend:**
  - Endpoints respondem corretamente (200 OK) e validam dados obrigatórios.
  - Logs de eventos importantes (criação de pedido, erro, escalonamento para humano) registrados.

- **Escalonamento para Humano:**
  - Quando necessário, o handoff transfere o histórico completo da conversa para o atendente humano.

- **Emails (se aplicável):**
  - Notificações enviadas corretamente para humanos em caso de erro ou novo pedido.

- **Testes Automatizados:**
  - Testes de integração cobrem os principais fluxos (consulta, pedido, escalonamento, persistência de dados).

Se todos esses requisitos técnicos forem cumpridos durante o teste, o fluxo é considerado aceito.

## 🚀 Futuras Melhorias
- Migrar para AutogenJS
- Dashboard para administração
- Testes automatizados e integração contínua
