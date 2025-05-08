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
- CLI ou integração com WhatsApp API / React frontend opcional

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

### 5. 🚚 Atualizar Status de Pedido via API
- Simular integração com transportadora

### 6. 🔁 Follow-up Automático
- Perguntar feedback após entrega

### 7. 🔐 Login com Token
- Sessões seguras por cliente

### 8. 🔍 Análise de Conversas
- Resumir e classificar conversas com LLM

### 9. 📅 Agendamento
- Integração com Google Calendar

### 10. 🌐 Suporte Multilingue
- Auto detectar idioma e responder conforme necessário

---

## ✅ Testes e Casos de Uso
- Cliente pergunta por produto → recebe resposta
- Cliente fornece dados → chatbot armazena
- Pedido realizado → salvo no banco
- Caso complexo → escalado para humano

---

## 🚀 Futuras Melhorias
- Migrar para AutogenJS
- Dashboard para administração
- Testes automatizados e integração contínua
