# Backend README

## 🚀 API do Sistema Pastoral Escolar

Backend em Node.js com Express, Prisma e PostgreSQL.

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

\`\`\`bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Configurar banco de dados
npx prisma generate
npx prisma db push

# Iniciar desenvolvimento
npm run dev
\`\`\`

## 🔐 Variáveis de Ambiente

\`\`\`bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://username:password@localhost:5432/pastoral_escolar?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h
\`\`\`

## 📡 Endpoints Disponíveis

### Autenticação
- \`POST /api/auth/login\` - Login
- \`POST /api/auth/register\` - Registro

### Alunos Adventistas (Protegidas)
- \`GET /api/alunos\` - Listar alunos
- \`GET /api/alunos/:id\` - Buscar por ID
- \`POST /api/alunos\` - Criar aluno
- \`PUT /api/alunos/:id\` - Atualizar aluno
- \`DELETE /api/alunos/:id\` - Remover aluno

### Health Check
- \`GET /health\` - Status do servidor

## 🗄️ Models do Banco

- Usuario
- AlunoAdventista ✅ (API completa)
- Batismo
- Colaborador
- EscolaSaudavel
- Comunidade
- Evento
- ClasseBiblica
- Recolta
- AtendimentoPastoral
- PlanejamentoPastoral

## 🔧 Scripts

\`\`\`bash
npm run dev       # Desenvolvimento
npm start         # Produção
npm run db:generate # Gerar Prisma client
npm run db:push     # Aplicar schema
npm run db:studio   # Prisma Studio
\`\`\`
