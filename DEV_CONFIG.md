# 🔧 Configuração de Desenvolvimento

## Portas do Sistema
- **Frontend**: http://localhost:3005 (Vite dev server)
- **Backend**: http://localhost:3005 (Express API)
- **PostgreSQL**: localhost:5432

## Scripts Úteis

### Desenvolvimento
```bash
# Iniciar apenas frontend
npm run dev:frontend

# Iniciar apenas backend  
npm run dev:backend

# Iniciar ambos (recomendado)
npm run dev
```

### Manutenção
```bash
# Verificar saúde do sistema
npm run health:check

# Limpar cache
npm run reset:cache

# Fazer backup
npm run backup:data

# Aplicar migrações
npm run migrate
```

### Instalação
```bash
# Instalar todas as dependências
npm run install:all

# Aplicar patch de atualização
npm run update:patch
```

## Estrutura de Desenvolvimento

### Frontend (React + Vite)
- **Entrada**: `frontend/src/main.jsx`
- **Componentes**: `frontend/src/components/`
- **Páginas**: `frontend/src/pages/`
- **Estilos**: `frontend/src/styles/`
- **Utilitários**: `frontend/src/utils/`

### Backend (Node.js + Express)
- **Servidor**: `backend/server.js`
- **Rotas**: `backend/routes/`
- **Controllers**: `backend/controllers/`
- **Middleware**: `backend/middleware/`
- **Prisma**: `backend/prisma/`

## Variáveis de Ambiente

### Backend (.env)
```env
NODE_ENV=development
PORT=3005
DATABASE_URL="postgresql://postgres:senha@localhost:5432/pastoral_escolar"
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=24h
```

## Funcionalidades v1.1.0

### ✨ Novas Funcionalidades
1. **Centro de Notificações** - Sistema completo de notificações
2. **Validação Inteligente** - Validação em tempo real de formulários
3. **Sistema de Cache** - Performance otimizada
4. **Estados Globais** - Gerenciamento centralizado
5. **Loading Avançado** - Indicadores visuais aprimorados

### 🔧 Componentes Principais
- `NotificationCenter.jsx` - Centro de notificações
- `FormInput.jsx` - Input com validação
- `Loading.jsx` - Componentes de loading
- `AppContext.jsx` - Estado global
- `validation.js` - Utilitários de validação
- `cache.js` - Sistema de cache

## Troubleshooting

### Problema: Porta em uso
```bash
# Matar processos na porta
npx kill-port 3000 3005
```

### Problema: Dependências desatualizadas
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm run install:all
```

### Problema: Cache corrompido
```bash
# Limpar todo o cache
npm run reset:cache
```

### Problema: Banco de dados
```bash
# Verificar conexão
npm run health:check

# Aplicar migrações
npm run migrate
```

## Dicas de Desenvolvimento

1. **Hot Reload**: Ambos frontend e backend têm hot reload ativo
2. **Console Logs**: Use F12 no navegador para ver logs do frontend
3. **API Testing**: Use http://localhost:3005/health para testar API
4. **Database**: Use `npx prisma studio` para gerenciar dados
5. **Cache**: O sistema usa cache inteligente para performance

## Comandos Úteis

```bash
# Verificar status do sistema
npm run health:check

# Ver logs em tempo real
tail -f backend/logs/app.log

# Abrir Prisma Studio
cd backend && npx prisma studio

# Resetar banco de dados
cd backend && npx prisma db push --force-reset

# Build para produção
npm run build
```

---

**Sistema Pastoral Escolar v1.1.0**  
*Configuração de desenvolvimento atualizada*
