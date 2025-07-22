# Copilot Instructions - Pastoral Escolar

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Contexto do Projeto

Este é um sistema web completo para **Pastoral Escolar** com as seguintes características:

### Stack Tecnológico
- **Frontend**: React com TailwindCSS
- **Backend**: Node.js com Express
- **Banco de Dados**: PostgreSQL com Prisma
- **Autenticação**: JWT com rotas protegidas
- **Estrutura**: Backend e frontend separados

### Módulos do Sistema
1. Início
2. Calendário
3. Batismos
4. Colaboradores
5. Escola Saudável
6. Alunos Adventistas
7. Comunidades
8. Eventos
9. Classes Bíblicas
10. Recoltas
11. Relatórios
12. Atendimentos Pastorais
13. Planejamento Pastoral

### Estrutura do Projeto
```
pastoral-escolar/
├── backend/          # API Node.js/Express com Prisma
├── frontend/         # App React com TailwindCSS
└── README.md
```

### Diretrizes de Código
- Use componentes funcionais React com hooks
- Aplique TailwindCSS para estilização
- Mantenha código limpo e bem estruturado
- Use TypeScript quando possível
- Implemente validações adequadas
- Siga padrões REST para APIs
- Use middleware de autenticação JWT
