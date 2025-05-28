# Guia de Deploy e Uso - GC Clock Pro Track

## Índice

1. [Introdução](#introdução)
2. [Requisitos do Sistema](#requisitos-do-sistema)
3. [Opções de Deploy](#opções-de-deploy)
   - [GitHub Pages](#github-pages)
   - [Netlify](#netlify)
   - [Vercel](#vercel)
   - [Hospedagem Tradicional](#hospedagem-tradicional)
4. [Processo de Build](#processo-de-build)
5. [Instruções de Deploy](#instruções-de-deploy)
6. [Configuração Pós-Deploy](#configuração-pós-deploy)
7. [Guia de Uso](#guia-de-uso)
   - [Para Funcionários](#para-funcionários)
   - [Para Administradores](#para-administradores)
8. [Manutenção e Atualizações](#manutenção-e-atualizações)
9. [Backup e Segurança](#backup-e-segurança)
10. [Solução de Problemas](#solução-de-problemas)
11. [Suporte Técnico](#suporte-técnico)

## Introdução

Este guia fornece instruções detalhadas para deploy, configuração e uso do GC Clock Pro Track, um sistema de registro de ponto com geolocalização desenvolvido em React.js. O sistema permite que funcionários registrem suas horas de trabalho com um único clique, capturando automaticamente sua localização, enquanto administradores podem visualizar a equipe em tempo real através de um mapa interativo.

## Requisitos do Sistema

Para executar o GC Clock Pro Track, você precisará de:

- Node.js 14.0.0 ou superior
- npm 6.14.0 ou superior
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão com a internet (para funcionalidades de mapa e geolocalização)
- Conta em um serviço de hospedagem (GitHub, Netlify, Vercel ou similar)

## Opções de Deploy

### GitHub Pages

**Vantagens:**
- Gratuito para repositórios públicos e privados
- Integração direta com seu repositório GitHub existente
- Processo de deploy automatizado via GitHub Actions

**Limitações:**
- Apenas para sites estáticos (front-end)
- Sem suporte para back-end ou banco de dados

### Netlify

**Vantagens:**
- Plano gratuito generoso
- Deploy automático a partir do GitHub
- Funções serverless para lógica de back-end simples
- Formulários integrados e autenticação
- CDN global para melhor desempenho

**Limitações:**
- Recursos avançados requerem plano pago

### Vercel

**Vantagens:**
- Otimizado para aplicações React
- Deploy automático a partir do GitHub
- Funções serverless
- Previews automáticas para cada commit
- CDN global

**Limitações:**
- Recursos avançados requerem plano pago

### Hospedagem Tradicional

**Vantagens:**
- Controle total sobre o ambiente
- Possibilidade de implementar back-end completo
- Maior flexibilidade para configurações avançadas

**Limitações:**
- Requer mais conhecimento técnico para configuração
- Geralmente mais caro
- Manutenção manual do servidor

## Processo de Build

Antes de fazer o deploy, você precisa criar uma versão otimizada para produção do seu aplicativo:

1. Navegue até a pasta do projeto:
   ```bash
   cd gc-clock-pro-react
   ```

2. Instale todas as dependências:
   ```bash
   npm install
   ```

3. Crie a build de produção:
   ```bash
   npm run build
   ```

4. Após a conclusão, uma pasta `build` será criada contendo todos os arquivos otimizados para produção.

## Instruções de Deploy

### Deploy no GitHub Pages

1. **Prepare seu repositório:**
   - Certifique-se de que seu código está em um repositório GitHub
   - Se ainda não tiver um repositório, crie um em github.com

2. **Configure o package.json:**
   - Adicione a propriedade `homepage` ao seu package.json:
     ```json
     "homepage": "https://seuusuario.github.io/nome-do-repositorio"
     ```
   - Adicione os scripts de deploy:
     ```json
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build",
       // outros scripts existentes
     }
     ```

3. **Instale o pacote gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

4. **Execute o deploy:**
   ```bash
   npm run deploy
   ```

5. **Configure o GitHub Pages:**
   - Vá para as configurações do seu repositório no GitHub
   - Na seção "GitHub Pages", selecione a branch `gh-pages` como fonte
   - Clique em "Save"

6. **Verifique o deploy:**
   - Após alguns minutos, seu site estará disponível em `https://seuusuario.github.io/nome-do-repositorio`

### Deploy no Netlify

1. **Crie uma conta no Netlify:**
   - Acesse [netlify.com](https://www.netlify.com/) e crie uma conta

2. **Conecte ao GitHub:**
   - Clique em "New site from Git"
   - Selecione GitHub como provedor
   - Autorize o Netlify a acessar seus repositórios
   - Selecione o repositório do GC Clock Pro Track

3. **Configure o build:**
   - Branch: `main` (ou `master`)
   - Build command: `npm run build`
   - Publish directory: `build`

4. **Clique em "Deploy site"**

5. **Configure o domínio:**
   - Por padrão, o Netlify fornecerá um domínio como `random-name.netlify.app`
   - Você pode configurar um domínio personalizado nas configurações do site

### Deploy no Vercel

1. **Crie uma conta no Vercel:**
   - Acesse [vercel.com](https://vercel.com/) e crie uma conta

2. **Importe o projeto:**
   - Clique em "Import Project"
   - Selecione "From Git Repository"
   - Conecte sua conta GitHub
   - Selecione o repositório do GC Clock Pro Track

3. **Configure o projeto:**
   - Framework Preset: React
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variables: Adicione quaisquer variáveis de ambiente necessárias

4. **Clique em "Deploy"**

5. **Acesse seu site:**
   - Após o deploy, você receberá um URL como `projeto.vercel.app`
   - Você pode configurar um domínio personalizado nas configurações do projeto

## Configuração Pós-Deploy

Após o deploy, algumas configurações adicionais podem ser necessárias:

1. **Configuração da API do Google Maps:**
   - Obtenha uma chave de API do Google Maps em [console.cloud.google.com](https://console.cloud.google.com/)
   - Restrinja a chave para seu domínio por segurança
   - Atualize a chave no arquivo `AdminMap.js`
   - Faça um novo deploy com a chave atualizada

2. **Configuração de CORS:**
   - Se você estiver usando uma API separada, configure o CORS para permitir solicitações do seu domínio

3. **Teste em dispositivos móveis:**
   - Verifique se a geolocalização funciona corretamente em dispositivos móveis
   - Teste o registro de ponto em diferentes navegadores e dispositivos

## Guia de Uso

### Para Funcionários

1. **Acesso ao Sistema:**
   - Acesse o sistema através do URL fornecido pelo administrador
   - Faça login com suas credenciais (email e senha)
   - Para demonstração, use:
     - Email: carlos@example.com
     - Senha: carlos123

2. **Registro de Ponto:**
   - Na tela principal, clique no botão "INICIAR TRABALHO"
   - Permita o acesso à sua localização quando solicitado
   - O sistema registrará automaticamente sua localização atual
   - O timer começará a contar o tempo trabalhado

3. **Adicionar Detalhes:**
   - Clique em "Detalhes" para adicionar informações complementares
   - Selecione o projeto em que está trabalhando
   - Confirme ou ajuste o endereço do trabalho
   - Adicione observações sobre o trabalho realizado

4. **Finalizar Registro:**
   - Ao terminar o trabalho, clique em "FINALIZAR TRABALHO"
   - Confirme a finalização na janela de diálogo
   - O sistema registrará o horário de saída e calculará o total de horas

5. **Modo Offline:**
   - O sistema funciona mesmo sem conexão com a internet
   - Os registros são armazenados localmente
   - Quando a conexão for restaurada, os dados serão sincronizados automaticamente

### Para Administradores

1. **Acesso ao Sistema:**
   - Acesse o sistema através do URL de produção
   - Faça login com suas credenciais de administrador
   - Para demonstração, use:
     - Email: admin@example.com
     - Senha: admin123

2. **Dashboard Principal:**
   - Visualize métricas importantes como funcionários ativos, horas trabalhadas e projetos
   - Veja atividades recentes e alertas que requerem atenção
   - Acesse rapidamente outras seções do sistema

3. **Mapa de Equipe:**
   - Acesse "Mapa de Equipe" no menu lateral
   - Visualize a localização atual de todos os funcionários
   - Use os filtros para visualizar funcionários específicos, projetos ou status
   - Clique em um pin para ver detalhes do funcionário
   - Atualize o mapa para ver as posições mais recentes

4. **Gestão de Funcionários:**
   - Adicione, edite ou desative contas de funcionários
   - Visualize histórico de registros por funcionário
   - Redefina senhas quando necessário

5. **Relatórios:**
   - Gere relatórios de horas trabalhadas por funcionário ou projeto
   - Filtre por período específico
   - Exporte relatórios em PDF ou Excel para análise adicional

## Manutenção e Atualizações

Para manter seu sistema atualizado e funcionando corretamente:

1. **Atualizações Regulares:**
   - Verifique regularmente se há atualizações no repositório
   - Atualize as dependências do projeto:
     ```bash
     npm update
     ```
   - Teste as atualizações em um ambiente de desenvolvimento antes de aplicar em produção

2. **Monitoramento:**
   - Monitore o uso do sistema para identificar possíveis problemas
   - Verifique regularmente os logs de erro
   - Solicite feedback dos usuários sobre a experiência

3. **Expansão:**
   - Para adicionar novas funcionalidades, modifique o código-fonte
   - Teste as novas funcionalidades em um ambiente de desenvolvimento
   - Faça o deploy das atualizações seguindo o mesmo processo inicial

## Backup e Segurança

Para garantir a segurança e integridade dos dados:

1. **Backup do Código:**
   - Mantenha seu código versionado no GitHub ou outro sistema de controle de versão
   - Configure backups automáticos do repositório

2. **Backup dos Dados:**
   - Se estiver usando um back-end, configure backups regulares do banco de dados
   - Armazene backups em locais seguros e diferentes

3. **Segurança:**
   - Mantenha todas as dependências atualizadas para evitar vulnerabilidades
   - Use HTTPS para todas as comunicações
   - Implemente autenticação segura
   - Proteja chaves de API com restrições adequadas

## Solução de Problemas

### Problemas Comuns e Soluções

1. **Página em branco após deploy:**
   - Verifique se a propriedade `homepage` no package.json está correta
   - Certifique-se de que todos os caminhos de arquivo são relativos

2. **Problemas de geolocalização:**
   - Verifique se o site está sendo servido via HTTPS (obrigatório para geolocalização)
   - Certifique-se de que o usuário permitiu o acesso à localização
   - Teste em diferentes navegadores

3. **Mapa não carrega:**
   - Verifique se a chave da API do Google Maps é válida
   - Confirme se a chave tem as APIs necessárias habilitadas
   - Verifique se há restrições de domínio na chave

4. **Problemas de login:**
   - Limpe os dados do navegador (cookies e armazenamento local)
   - Verifique se as credenciais estão corretas
   - Reinicie o navegador

## Suporte Técnico

Para obter suporte técnico adicional:

1. Consulte a documentação completa do React: [reactjs.org](https://reactjs.org/)
2. Verifique a documentação do Google Maps API: [developers.google.com/maps](https://developers.google.com/maps)
3. Entre em contato com o desenvolvedor para suporte personalizado

---

Este guia foi criado para ajudá-lo a implementar e utilizar o GC Clock Pro Track com sucesso. Se você tiver dúvidas adicionais ou precisar de assistência, não hesite em entrar em contato.

**GC Clock Pro Track © 2025 - Todos os direitos reservados**
