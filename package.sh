#!/bin/bash

# Script para criar um arquivo ZIP do projeto GC Clock Pro React
# Este script empacota todos os arquivos necessários para deploy e documentação

echo "Iniciando empacotamento do GC Clock Pro React..."

# Criar diretório temporário para organizar arquivos
mkdir -p /tmp/gc-clock-pro-react-package

# Copiar arquivos do projeto
echo "Copiando arquivos do projeto..."
cp -r /home/ubuntu/gc-clock-pro-react/* /tmp/gc-clock-pro-react-package/

# Remover node_modules para reduzir tamanho (não necessário para distribuição)
echo "Removendo node_modules..."
rm -rf /tmp/gc-clock-pro-react-package/node_modules

# Criar arquivo ZIP
echo "Criando arquivo ZIP..."
cd /tmp
zip -r /home/ubuntu/gc-clock-pro-react.zip gc-clock-pro-react-package

# Limpar diretório temporário
echo "Limpando arquivos temporários..."
rm -rf /tmp/gc-clock-pro-react-package

echo "Empacotamento concluído!"
echo "Arquivo ZIP criado em: /home/ubuntu/gc-clock-pro-react.zip"
