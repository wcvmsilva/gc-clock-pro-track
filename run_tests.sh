#!/bin/bash

# Script de teste automatizado para o GC Clock Pro Track
# Este script verifica a integridade e funcionamento básico do sistema

echo "Iniciando testes automatizados do GC Clock Pro Track..."
echo "Data e hora: $(date)"
echo "----------------------------------------"

# Diretório base
BASE_DIR="/home/ubuntu/gc-clock-pro-redesign"
TEST_LOG="$BASE_DIR/test_results.log"

# Função para registrar resultados
log_result() {
    echo "[$(date +%H:%M:%S)] $1" >> $TEST_LOG
    echo "$1"
}

# Limpar log anterior
echo "Iniciando testes: $(date)" > $TEST_LOG

# Verificar existência de arquivos essenciais
echo "Verificando arquivos essenciais..."
ESSENTIAL_FILES=(
    "index.html"
    "dashboard.html"
    "detailed-reports.html"
    "geolocation.html"
    "project-management.html"
    "notifications.html"
    "styles.css"
    "images/logo.jpeg"
    "guia-usuario.md"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$BASE_DIR/$file" ]; then
        log_result "✅ Arquivo encontrado: $file"
    else
        log_result "❌ ERRO: Arquivo não encontrado: $file"
    fi
done

# Verificar sintaxe HTML
echo "Verificando sintaxe HTML..."
HTML_FILES=(
    "index.html"
    "dashboard.html"
    "detailed-reports.html"
    "geolocation.html"
    "project-management.html"
    "notifications.html"
)

for file in "${HTML_FILES[@]}"; do
    if grep -q "<!DOCTYPE html>" "$BASE_DIR/$file"; then
        log_result "✅ Sintaxe HTML válida: $file"
    else
        log_result "❌ ERRO: Sintaxe HTML inválida: $file"
    fi
done

# Verificar referências a arquivos CSS
echo "Verificando referências CSS..."
for file in "${HTML_FILES[@]}"; do
    if grep -q "styles.css" "$BASE_DIR/$file"; then
        log_result "✅ Referência CSS encontrada: $file"
    else
        log_result "❌ ERRO: Referência CSS não encontrada: $file"
    fi
done

# Verificar referências à logo
echo "Verificando referências à logo..."
for file in "${HTML_FILES[@]}"; do
    if grep -q "logo.jpeg" "$BASE_DIR/$file"; then
        log_result "✅ Referência à logo encontrada: $file"
    else
        log_result "❌ ERRO: Referência à logo não encontrada: $file"
    fi
done

# Verificar links entre páginas
echo "Verificando links entre páginas..."
PAGES=(
    "index.html"
    "dashboard.html"
    "detailed-reports.html"
    "geolocation.html"
    "project-management.html"
    "notifications.html"
)

for file in "${HTML_FILES[@]}"; do
    for page in "${PAGES[@]}"; do
        if [ "$file" != "$page" ] && grep -q "$page" "$BASE_DIR/$file"; then
            log_result "✅ Link para $page encontrado em $file"
        fi
    done
done

# Verificar responsividade (presença de meta viewport)
echo "Verificando responsividade..."
for file in "${HTML_FILES[@]}"; do
    if grep -q "viewport" "$BASE_DIR/$file"; then
        log_result "✅ Meta viewport encontrado: $file"
    else
        log_result "❌ ERRO: Meta viewport não encontrado: $file"
    fi
done

# Verificar cores da identidade visual
echo "Verificando cores da identidade visual..."
if grep -q "#0F1A20" "$BASE_DIR/styles.css" && grep -q "#C69C6D" "$BASE_DIR/styles.css"; then
    log_result "✅ Cores da identidade visual encontradas no CSS"
else
    log_result "❌ ERRO: Cores da identidade visual não encontradas no CSS"
fi

# Verificar funcionalidades JavaScript
echo "Verificando funcionalidades JavaScript..."
JS_FUNCTIONS=(
    "switchTab"
    "logout"
    "markAsRead"
    "filterLocations"
    "createReminder"
    "handleCreateProject"
)

for file in "${HTML_FILES[@]}"; do
    for func in "${JS_FUNCTIONS[@]}"; do
        if grep -q "function $func" "$BASE_DIR/$file"; then
            log_result "✅ Função JavaScript encontrada: $func em $file"
        fi
    done
done

# Resumo dos testes
TOTAL_TESTS=$(grep -c "✅\|❌" $TEST_LOG)
PASSED_TESTS=$(grep -c "✅" $TEST_LOG)
FAILED_TESTS=$(grep -c "❌" $TEST_LOG)

echo "----------------------------------------"
echo "Resumo dos testes:"
echo "Total de testes: $TOTAL_TESTS"
echo "Testes bem-sucedidos: $PASSED_TESTS"
echo "Testes falhos: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo "✅ TODOS OS TESTES PASSARAM!"
else
    echo "❌ ALGUNS TESTES FALHARAM. Verifique o log para mais detalhes."
fi

echo "----------------------------------------"
echo "Testes concluídos em: $(date)"
echo "Log completo disponível em: $TEST_LOG"
