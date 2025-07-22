# 🏫 Sistema Pastoral Escolar

Um sistema web completo e profissional para gestão da Pastoral Escolar Adventista, desenvolvido com tecnologias modernas e interface intuitiva.

## 🚀 Tecnologias

### Frontend
- **React 18** - Biblioteca para interface do usuário
- **TailwindCSS** - Framework CSS utilitário
- **React Router** - Roteamento SPA
- **Lucide React** - Ícones modernos
- **React Hook Form** - Gerenciamento de formulários
- **React Hot Toast** - Notificações
- **Vite** - Build tool e dev server

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Helmet** - Segurança HTTP

## 📋 Módulos do Sistema

1. **Início** - Dashboard com visão geral
2. **Calendário** - Agenda de eventos e atividades
3. **Batismos** - Registro de batismos realizados
4. **Colaboradores** - Gestão da equipe pastoral
5. **Escola Saudável** - Programas de saúde e bem-estar
6. **Alunos Adventistas** - Gerenciamento de alunos *(API completa)*
7. **Comunidades** - Gestão de grupos e comunidades
8. **Eventos** - Organização de eventos
9. **Classes Bíblicas** - Gestão de estudos bíblicos
10. **Recoltas** - Controle financeiro
11. **Relatórios** - Análises e relatórios
12. **Atendimentos Pastorais** - Registro de atendimentos
13. **Planejamento Pastoral** - Planejamento estratégico

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### 1. Clone o repositório
\`\`\`bash
git clone <repository-url>
cd pastoral-escolar
\`\`\`

### 2. Configuração do Backend

\`\`\`bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Configurar banco de dados
npx prisma generate
npx prisma db push

# Iniciar servidor de desenvolvimento
npm run dev
\`\`\`

### 3. Configuração do Frontend

\`\`\`bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
\`\`\`

## 🔧 Configuração do Banco de Dados

1. Crie um banco PostgreSQL:
\`\`\`sql
CREATE DATABASE pastoral_escolar;
\`\`\`

2. Configure a `DATABASE_URL` no arquivo `.env`:
\`\`\`
DATABASE_URL="postgresql://username:password@localhost:5432/pastoral_escolar?schema=public"
\`\`\`

3. Execute as migrações:
\`\`\`bash
cd backend
npx prisma db push
\`\`\`

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. Para criar um usuário inicial:

\`\`\`bash
# POST /api/auth/register
{
  "nome": "Pastor João",
  "email": "pastor@escola.com",
  "senha": "suasenha123",
  "role": "ADMIN"
}
\`\`\`

## 📡 API Endpoints (Alunos Adventistas)

Base URL: \`http://localhost:3001/api\`

### Autenticação
- \`POST /auth/login\` - Login
- \`POST /auth/register\` - Registro (desenvolvimento)

### Alunos (Protegidas com JWT)
- \`GET /alunos\` - Listar alunos
- \`GET /alunos/:id\` - Buscar aluno por ID
- \`POST /alunos\` - Criar novo aluno
- \`PUT /alunos/:id\` - Atualizar aluno
- \`DELETE /alunos/:id\` - Remover aluno (soft delete)

## 🎨 Interface

- **Design responsivo** com TailwindCSS
- **Menu lateral fixo** com todos os módulos
- **Tema profissional** azul e cinza
- **Ícones consistentes** do Lucide React
- **Componentes reutilizáveis**

## 🔄 Scripts Disponíveis

### Backend
\`\`\`bash
npm run dev      # Servidor desenvolvimento
npm start        # Servidor produção
npm run db:generate # Gerar Prisma client
npm run db:push     # Aplicar schema ao banco
npm run db:studio   # Prisma Studio
\`\`\`

### Frontend
\`\`\`bash
npm run dev      # Servidor desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Verificar código
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
pastoral-escolar/
├── backend/                 # API Node.js/Express
│   ├── controllers/         # Controladores
│   ├── middleware/          # Middlewares
│   ├── routes/              # Rotas da API
│   ├── prisma/              # Schema e migrações
│   ├── server.js            # Servidor principal
│   └── package.json
├── frontend/                # App React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── App.jsx          # Componente raiz
│   │   └── main.jsx         # Ponto de entrada
│   ├── public/              # Arquivos públicos
│   └── package.json
└── README.md
\`\`\`

## 🛡️ Segurança

- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Helmet** para headers de segurança
- **Rate limiting** para prevenir ataques
- **CORS** configurado
- **Validação** de dados de entrada

## 🚦 Status de Desenvolvimento

- ✅ **Estrutura do projeto**
- ✅ **Backend base com Express**
- ✅ **Models Prisma completos**
- ✅ **API Alunos Adventistas completa**
- ✅ **Frontend React com TailwindCSS**
- ✅ **Menu lateral e roteamento**
- ✅ **Páginas base para todos os módulos**
- ⏳ **APIs dos demais módulos**
- ⏳ **Implementação completa das interfaces**
- ⏳ **Autenticação no frontend**
- ⏳ **Testes automatizados**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo \`LICENSE\` para detalhes.

## 📞 Suporte

Para suporte, envie um email para: pastoral@escola.com

---

⭐ **Sistema Pastoral Escolar** - Desenvolvido com ❤️ para a comunidade adventista
