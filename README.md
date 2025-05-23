# GC Clock Pro Track

Um aplicativo web para controle de horas trabalhadas, geolocalização e gerenciamento de funcionários para a GC Home Improvements LLC.

## Funcionalidades

- Registro de horas com um clique
- Captura automática de geolocalização
- Upload de fotos do local de trabalho
- Gerenciamento de valores por hora para cada funcionário
- Cálculo automático de valores com base nas horas trabalhadas
- Relatórios diários e semanais

## Acesso

O aplicativo está disponível em: [https://[seu-usuario].github.io/gc-clock-pro-track](https://[seu-usuario].github.io/gc-clock-pro-track)

## Credenciais de Demonstração

- **Admin:** admin.demo@gchome.com / senha: admin123
- **Funcionário:** john@gchome.com / senha: password

## Configuração para Domínio Personalizado

Para configurar o aplicativo para usar seu domínio personalizado (gchomeimprovementsc.com), siga as instruções na seção [Configuração de Domínio](#configuração-de-domínio).

## Tecnologias Utilizadas

- Next.js
- React
- Tailwind CSS
- Supabase (mock para versão estática)

## Configuração de Domínio

Para configurar o aplicativo para usar seu domínio personalizado:

1. Crie um arquivo CNAME na raiz do repositório com o conteúdo:
   ```
   app.gchomeimprovementsc.com
   ```

2. Configure seu provedor de DNS (Hostinger) para apontar o subdomínio para o GitHub Pages:
   - Adicione um registro CNAME para `app.gchomeimprovementsc.com` apontando para `[seu-usuario].github.io`

3. Nas configurações do repositório GitHub, em "Pages", ative a opção "Custom domain" e insira `app.gchomeimprovementsc.com`

4. Aguarde a propagação do DNS (pode levar até 24 horas)

## Contato

Para suporte ou dúvidas, entre em contato com o desenvolvedor.

© 2025 GC Home Improvements LLC. Todos os direitos reservados.
