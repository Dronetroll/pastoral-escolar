# 🚀 Guia de Instalação - Patch v1.1.0

## Sistema Pastoral Escolar - Segunda Atualização

Esta documentação guia você através da instalação do segundo patch de atualização do Sistema Pastoral Escolar.

---

## 📋 Pré-requisitos

Antes de instalar o patch, certifique-se de que você tem:

- ✅ Sistema Pastoral Escolar v1.0.0 funcionando
- ✅ Node.js 18+ instalado
- ✅ PostgreSQL 12+ em execução
- ✅ npm ou yarn disponível
- ✅ Backup dos dados (recomendado)

---

## 🔄 Processo de Atualização

### Passo 1: Backup dos Dados
```bash
# Fazer backup do banco de dados
pg_dump -U postgres -h localhost pastoral_escolar > backup_$(date +%Y%m%d).sql

# Fazer backup dos arquivos de configuração
cp backend/.env backend/.env.backup
```

### Passo 2: Verificar Saúde do Sistema
```bash
# Verificar se o sistema atual está funcionando
npm run health:check
```

### Passo 3: Aplicar o Patch
```bash
# Instalar novas dependências (se houver)
npm run install:all

# Aplicar migrações do banco (se houver)
npm run migrate

# Limpar cache antigo
npm run reset:cache
```

### Passo 4: Verificar Instalação
```bash
# Verificar se todas as funcionalidades estão funcionando
npm run health:check

# Iniciar o sistema
npm run dev
```

---

## 🆕 Novas Funcionalidades

### 1. Centro de Notificações
- **Localização**: Header superior direito
- **Funcionalidades**: 
  - Notificações em tempo real
  - Contador de não lidas
  - Auto-remoção
  - Persistência local

### 2. Validação Inteligente
- **Componente**: `FormInput`
- **Funcionalidades**:
  - Validação em tempo real
  - Formatação automática
  - Feedback visual
  - Múltiplos tipos de validação

### 3. Sistema de Cache
- **Performance**: Melhoria significativa
- **Funcionalidades**:
  - Cache em memória
  - Persistência local
  - TTL configurável
  - Limpeza automática

### 4. Estados Globais
- **Context API**: Gerenciamento centralizado
- **Funcionalidades**:
  - Estado do usuário
  - Configurações
  - Loading states
  - Notificações

### 5. Componentes de Loading
- **Tipos**: Cards, tabelas, listas, calendário
- **Funcionalidades**:
  - Skeleton loading
  - Progress bar
  - Estados de erro
  - Retry automático

---

## 🔧 Configurações Adicionais

### Variáveis de Ambiente
Nenhuma nova variável de ambiente é necessária para esta versão.

### Configurações de Cache
O cache é configurado automaticamente, mas você pode ajustar:

```javascript
// frontend/src/utils/cache.js
const defaultTTL = 5 * 60 * 1000; // 5 minutos (padrão)
```

### Configurações de Notificação
```javascript
// frontend/src/contexts/AppContext.jsx
settings: {
  soundEnabled: true,        // Sons de notificação
  emailNotifications: true,  // Notificações por email
  pushNotifications: true    // Notificações push
}
```

---

## 🧪 Testes Pós-Instalação

### 1. Testar Centro de Notificações
1. Acesse o sistema
2. Clique no ícone de sino no header
3. Verifique se as notificações aparecem
4. Teste marcar como lida
5. Teste remover notificação

### 2. Testar Validação
1. Acesse qualquer formulário
2. Digite um CPF inválido
3. Verifique se a validação aparece em tempo real
4. Teste formatação automática

### 3. Testar Performance
1. Navegue entre as páginas
2. Observe o tempo de carregamento
3. Verifique se o cache está funcionando
4. Teste em modo desenvolvedor (Network tab)

### 4. Testar Loading States
1. Recarregue uma página com dados
2. Observe os componentes de loading
3. Teste conexão lenta (throttling)
4. Verifique estados de erro

---

## 🐛 Solução de Problemas

### Problema: Notificações Não Aparecem
**Solução**:
```bash
# Limpar cache do navegador
# Ctrl+Shift+R ou F12 > Application > Clear Storage
```

### Problema: Validação Não Funciona
**Solução**:
```bash
# Verificar se o componente FormInput está importado
# Verificar console do navegador para erros
npm run health:check
```

### Problema: Cache Não Funciona
**Solução**:
```bash
# Limpar cache antigo
npm run reset:cache

# Reiniciar aplicação
npm run dev
```

### Problema: Loading Infinito
**Solução**:
```bash
# Verificar conexão com backend
# Verificar logs do servidor
# Verificar console do navegador
```

---

## 📞 Suporte

### Logs para Análise
```bash
# Logs do backend
tail -f backend/logs/app.log

# Logs do frontend (console do navegador)
# F12 > Console
```

### Informações para Suporte
Ao solicitar suporte, inclua:
- ✅ Versão do sistema (v1.1.0)
- ✅ Sistema operacional
- ✅ Versão do Node.js
- ✅ Logs de erro
- ✅ Resultado do `npm run health:check`

### Contatos
- 📧 Email: pastoral@escola.com
- 🐛 Issues: https://github.com/seu-repo/issues
- 📖 Documentação: README.md

---

## ✅ Checklist de Instalação

- [ ] Backup realizado
- [ ] Health check inicial executado
- [ ] Dependências instaladas
- [ ] Migrações aplicadas
- [ ] Cache limpo
- [ ] Health check final executado
- [ ] Sistema iniciado com sucesso
- [ ] Testes pós-instalação realizados
- [ ] Funcionalidades novas testadas
- [ ] Documentação revisada

---

## 🎉 Instalação Concluída!

Se todos os itens do checklist foram marcados, sua instalação do patch v1.1.0 foi concluída com sucesso!

**Próximos passos:**
1. Treinar usuários nas novas funcionalidades
2. Monitorar performance do sistema
3. Aguardar próximas atualizações
4. Fornecer feedback para melhorias

---

**Sistema Pastoral Escolar v1.1.0**  
*Desenvolvido com ❤️ para a comunidade adventista*
