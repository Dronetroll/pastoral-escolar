#!/usr/bin/env node

/**
 * Script para limpar cache do Sistema Pastoral Escolar
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpeza de Cache do Sistema Pastoral Escolar v1.1.0\n');

// Função para deletar arquivo se existir
const deleteFileIfExists = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removido: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Erro ao remover ${filePath}: ${error.message}`);
    return false;
  }
};

// Função para deletar diretório recursivamente
const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    try {
      fs.readdirSync(folderPath).forEach((file) => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folderPath);
      console.log(`✅ Diretório removido: ${folderPath}`);
      return true;
    } catch (error) {
      console.log(`❌ Erro ao remover diretório ${folderPath}: ${error.message}`);
      return false;
    }
  }
  return false;
};

// Função para limpar node_modules
const cleanNodeModules = () => {
  console.log('📦 Limpando node_modules...\n');
  
  const locations = [
    './node_modules',
    './backend/node_modules',
    './frontend/node_modules'
  ];
  
  locations.forEach(location => {
    if (deleteFolderRecursive(location)) {
      console.log(`✅ node_modules removido: ${location}`);
    } else {
      console.log(`ℹ️ node_modules não encontrado: ${location}`);
    }
  });
};

// Função para limpar cache de build
const cleanBuildCache = () => {
  console.log('\n🏗️ Limpando cache de build...\n');
  
  const buildFiles = [
    './frontend/dist',
    './frontend/.vite',
    './backend/dist',
    './backend/build'
  ];
  
  buildFiles.forEach(file => {
    if (deleteFolderRecursive(file)) {
      console.log(`✅ Cache de build removido: ${file}`);
    }
  });
};

// Função para limpar logs
const cleanLogs = () => {
  console.log('\n📋 Limpando logs...\n');
  
  const logFiles = [
    './backend/logs',
    './logs',
    './npm-debug.log',
    './yarn-debug.log',
    './yarn-error.log',
    './.npm'
  ];
  
  logFiles.forEach(file => {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        deleteFolderRecursive(file);
      } else {
        deleteFileIfExists(file);
      }
    }
  });
};

// Função para limpar cache do sistema
const cleanSystemCache = () => {
  console.log('\n💾 Limpando cache do sistema...\n');
  
  // Informar sobre localStorage (não podemos limpar diretamente do Node.js)
  console.log('ℹ️ Para limpar o cache do navegador:');
  console.log('   1. Abra as Ferramentas do Desenvolvedor (F12)');
  console.log('   2. Vá para Application/Storage');
  console.log('   3. Limpe Local Storage e Session Storage');
  console.log('   4. Ou use Ctrl+Shift+R para recarregar ignorando cache');
};

// Função para limpar cache de dependências
const cleanDependencyCache = () => {
  console.log('\n📦 Limpando cache de dependências...\n');
  
  const cacheFiles = [
    './package-lock.json',
    './backend/package-lock.json',
    './frontend/package-lock.json',
    './yarn.lock',
    './backend/yarn.lock',
    './frontend/yarn.lock'
  ];
  
  cacheFiles.forEach(file => {
    deleteFileIfExists(file);
  });
};

// Função principal
const runCleanup = () => {
  console.log('Iniciando limpeza completa do sistema...\n');
  
  // Verificar se está no diretório correto
  if (!fs.existsSync('./package.json')) {
    console.log('❌ Este script deve ser executado no diretório raiz do projeto!');
    process.exit(1);
  }
  
  try {
    cleanBuildCache();
    cleanLogs();
    cleanDependencyCache();
    cleanSystemCache();
    
    // Perguntar se quer limpar node_modules
    console.log('\n❓ Deseja também limpar node_modules? (Será necessário executar npm install novamente)');
    console.log('   Para limpar node_modules, execute: npm run reset:cache -- --full');
    
    if (process.argv.includes('--full')) {
      cleanNodeModules();
      console.log('\n📝 Próximos passos:');
      console.log('1. Execute "npm run install:all" para reinstalar dependências');
      console.log('2. Execute "npm run health:check" para verificar a instalação');
    }
    
    console.log('\n✅ Limpeza concluída com sucesso!');
    console.log('\n💡 Dicas:');
    console.log('- Execute "npm run dev" para iniciar o desenvolvimento');
    console.log('- Execute "npm run health:check" para verificar a saúde do sistema');
    console.log('- Use "npm run reset:cache -- --full" para limpeza completa');
    
  } catch (error) {
    console.log(`❌ Erro durante a limpeza: ${error.message}`);
    process.exit(1);
  }
};

// Executar limpeza
runCleanup();
