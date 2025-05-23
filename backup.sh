#!/bin/bash

# Script de backup automático para o GC Clock Pro Track
# Este script cria backups regulares do sistema

# Configurações
BACKUP_DIR="/home/ubuntu/gc-clock-pro-backups"
SOURCE_DIR="/home/ubuntu/gc-clock-pro-redesign"
DATE_FORMAT=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILENAME="gc-clock-pro-backup_${DATE_FORMAT}.zip"
LOG_FILE="${BACKUP_DIR}/backup_log.txt"
MAX_BACKUPS=10  # Número máximo de backups a manter

# Criar diretório de backup se não existir
mkdir -p "${BACKUP_DIR}"

# Iniciar log
echo "==================================================" >> "${LOG_FILE}"
echo "Backup iniciado: $(date)" >> "${LOG_FILE}"
echo "Arquivo de backup: ${BACKUP_FILENAME}" >> "${LOG_FILE}"

# Criar backup
echo "Criando backup..." >> "${LOG_FILE}"
zip -r "${BACKUP_DIR}/${BACKUP_FILENAME}" "${SOURCE_DIR}" >> "${LOG_FILE}" 2>&1

# Verificar se o backup foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Backup concluído com sucesso!" >> "${LOG_FILE}"
    echo "Tamanho do arquivo: $(du -h ${BACKUP_DIR}/${BACKUP_FILENAME} | cut -f1)" >> "${LOG_FILE}"
else
    echo "❌ ERRO: Falha ao criar backup!" >> "${LOG_FILE}"
    exit 1
fi

# Limpar backups antigos se exceder o número máximo
echo "Verificando backups antigos..." >> "${LOG_FILE}"
BACKUP_COUNT=$(ls -1 ${BACKUP_DIR}/*.zip 2>/dev/null | wc -l)

if [ ${BACKUP_COUNT} -gt ${MAX_BACKUPS} ]; then
    echo "Número de backups (${BACKUP_COUNT}) excede o máximo (${MAX_BACKUPS}). Removendo backups mais antigos..." >> "${LOG_FILE}"
    ls -t ${BACKUP_DIR}/*.zip | tail -n $(( ${BACKUP_COUNT} - ${MAX_BACKUPS} )) | xargs rm -f
    echo "Backups antigos removidos. Novo total: $(ls -1 ${BACKUP_DIR}/*.zip | wc -l)" >> "${LOG_FILE}"
fi

# Listar todos os backups disponíveis
echo "Backups disponíveis:" >> "${LOG_FILE}"
ls -lh ${BACKUP_DIR}/*.zip >> "${LOG_FILE}"

echo "Backup concluído: $(date)" >> "${LOG_FILE}"
echo "==================================================" >> "${LOG_FILE}"

# Exibir mensagem de sucesso
echo "Backup concluído com sucesso!"
echo "Arquivo: ${BACKUP_DIR}/${BACKUP_FILENAME}"
echo "Log: ${LOG_FILE}"

# Instruções para restauração
echo ""
echo "Para restaurar este backup, execute:"
echo "unzip ${BACKUP_DIR}/${BACKUP_FILENAME} -d /caminho/para/restauracao"
