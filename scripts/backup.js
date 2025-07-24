#!/usr/bin/env node

/**
 * Script para fazer backup dos dados do Sistema Pastoral Escolar
 * Cria backup do banco de dados e arquivos de configuração
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('💾 Backup do Sistema Pastoral Escolar\n');

const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const backupDir = `./backups/backup_${timestamp}`;

// Criar diretório de backup
try {
  if (!fs.existsSync('./backups')) {
    fs.mkdirSync('./backups');
  }
  fs.mkdirSync(backupDir);
  console.log(`📁 Diretório de backup criado: ${backupDir}`);
} catch (error) {
  console.error('❌ Erro ao criar diretório de backup:', error.message);
  process.exit(1);
}

// Função para copiar arquivos
const copyFile = (source, destination) => {
  try {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`✅ Copiado: ${source} → ${destination}`);
      return true;
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${source}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro ao copiar ${source}: ${error.message}`);
    return false;
  }
};

console.log('\n📄 Fazendo backup dos arquivos de configuração...');

// Arquivos para backup
const filesToBackup = [
  { source: './backend/.env', dest: `${backupDir}/backend_env` },
  { source: './backend/package.json', dest: `${backupDir}/backend_package.json` },
  { source: './frontend/package.json', dest: `${backupDir}/frontend_package.json` },
  { source: './package.json', dest: `${backupDir}/root_package.json` },
  { source: './README.md', dest: `${backupDir}/README.md` },
  { source: './CHANGELOG.md', dest: `${backupDir}/CHANGELOG.md` }
];

let successCount = 0;
filesToBackup.forEach(({ source, dest }) => {
  if (copyFile(source, dest)) {
    successCount++;
  }
});

console.log('\n🗄️ Fazendo backup do banco de dados...');

// Backup do banco de dados (PostgreSQL)
const dbBackup = () => {
  return new Promise((resolve, reject) => {
    // Ler configuração do banco do .env
    try {
      const envPath = './backend/.env';
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const dbUrl = envContent.match(/DATABASE_URL="(.+)"/);
        
        if (dbUrl) {
          const dbCommand = `pg_dump "${dbUrl[1]}" > ${backupDir}/database_backup.sql`;
          
          exec(dbCommand, (error, stdout, stderr) => {
            if (error) {
              console.log(`⚠️ Backup do banco não realizado: ${error.message}`);
              console.log('💡 Certifique-se de que o pg_dump está instalado e o PostgreSQL está rodando');
              resolve(false);
            } else {
              console.log('✅ Backup do banco de dados realizado');
              resolve(true);
            }
          });
        } else {
          console.log('⚠️ DATABASE_URL não encontrada no .env');
          resolve(false);
        }
      } else {
        console.log('⚠️ Arquivo .env não encontrado');
        resolve(false);
      }
    } catch (error) {
      console.log(`⚠️ Erro ao ler configuração do banco: ${error.message}`);
      resolve(false);
    }
  });
};

// Executar backup do banco
dbBackup().then((dbSuccess) => {
  console.log('\n📊 RESUMO DO BACKUP');
  console.log('====================');
  console.log(`📄 Arquivos salvos: ${successCount}/${filesToBackup.length}`);
  console.log(`🗄️ Banco de dados: ${dbSuccess ? 'Sucesso' : 'Falhou/Pulado'}`);
  console.log(`📁 Local: ${backupDir}`);
  console.log('====================\n');
  
  if (successCount > 0 || dbSuccess) {
    console.log('🎉 Backup concluído!');
    console.log(`💾 Arquivos salvos em: ${backupDir}`);
    console.log('\n💡 Para restaurar:');
    console.log('1. Copie os arquivos de volta para seus locais originais');
    console.log('2. Para o banco: psql -U postgres -d pastoral_escolar < database_backup.sql');
  } else {
    console.log('❌ Nenhum backup foi realizado com sucesso');
  }
  
  console.log('\n🔒 Mantenha seus backups em local seguro!');
});
