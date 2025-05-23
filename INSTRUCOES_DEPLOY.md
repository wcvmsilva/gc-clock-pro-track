# Instruções para Deploy no GitHub Pages

## Passo 1: Criar um novo repositório no GitHub

1. Acesse sua conta do GitHub em https://github.com
2. Clique no botão "+" no canto superior direito e selecione "New repository"
3. Nomeie o repositório como "gc-clock-pro-track"
4. Deixe o repositório como "Public"
5. Não inicialize o repositório com README, .gitignore ou licença
6. Clique em "Create repository"

## Passo 2: Fazer upload dos arquivos

### Opção 1: Upload via interface web (mais fácil)
1. No seu novo repositório, clique no link "uploading an existing file"
2. Arraste todos os arquivos da pasta que você baixou para a área de upload
3. Clique em "Commit changes"

### Opção 2: Upload via Git (para usuários avançados)
```bash
cd pasta-do-projeto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/gc-clock-pro-track.git
git push -u origin main
```

## Passo 3: Configurar GitHub Pages

1. No seu repositório, vá para "Settings" (aba de configurações)
2. Role para baixo até a seção "GitHub Pages"
3. Em "Source", selecione "main" como branch e "/" (root) como pasta
4. Clique em "Save"
5. Na seção "Custom domain", digite "app.gchomeimprovementsc.com" e clique em "Save"
6. Marque a opção "Enforce HTTPS" se disponível

## Passo 4: Configurar seu domínio

1. Acesse o painel de controle do seu provedor de DNS (Hostinger)
2. Adicione um registro CNAME:
   - Nome/Host: app
   - Valor/Destino: seu-usuario.github.io
   - TTL: Automático ou 3600
3. Salve as alterações

## Passo 5: Verificar o deploy

1. O GitHub Pages pode levar alguns minutos para ficar disponível
2. Inicialmente, você pode acessar: https://seu-usuario.github.io/gc-clock-pro-track
3. Após a configuração do DNS propagar (pode levar até 24h), você poderá acessar: https://app.gchomeimprovementsc.com

## Credenciais de acesso

- **Admin:** admin.demo@gchome.com / senha: admin123
- **Funcionário:** john@gchome.com / senha: password

## Suporte

Se precisar de ajuda durante qualquer etapa do processo, entre em contato.
