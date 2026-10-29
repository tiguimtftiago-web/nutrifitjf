# Auditoria de ferramentas open source — Nutrifit

## Objetivo

Avaliar cinco projetos vistos na pesquisa e integrá-los por etapas, sem substituir a aplicação atual nem alterar pedidos, preços, Supabase ou o painel administrativo sem uma necessidade validada.

## Fase 1 — OpenPanel (telemetria em preview)

**Estado:** integração opt-in preparada em `app/layout.tsx`; ainda depende de uma conta, Client ID e configuração de ambiente no Vercel.

- A integração não carrega por padrão. Só é ativada quando `NEXT_PUBLIC_OPENPANEL_ENABLED=true` e `NEXT_PUBLIC_OPENPANEL_CLIENT_ID` estão definidos.
- Começar apenas no ambiente Preview do Vercel; não adicionar as variáveis à Production.
- Inicialmente rastrear visualizações de página e links externos. Não habilitar session replay, identificação de usuários, captura de campos ou atributos automáticos.
- Não enviar nomes, telefones, endereços, dados de pedidos, conteúdo de formulários, informações de pagamento nem dados do painel administrativo.
- Antes de ativar, revisar aviso de privacidade, base legal/consentimento aplicável à LGPD, retenção e configurações de coleta da conta OpenPanel.
- Validar a compilação do preview e confirmar que a ausência das variáveis mantém a coleta desligada.

### Configuração necessária

1. Criar a conta em https://openpanel.dev/.
2. Criar um projeto/site para o domínio de preview da Nutrifit e copiar o **Client ID** (não o Client Secret).
3. Em Vercel > projeto `nutrifitjf-oficial` > Settings > Environment Variables, adicionar as variáveis somente ao escopo **Preview**:
   - `NEXT_PUBLIC_OPENPANEL_ENABLED` = `true`
   - `NEXT_PUBLIC_OPENPANEL_CLIENT_ID` = Client ID fornecido pelo OpenPanel
4. Gerar novo deployment Preview e verificar eventos no painel OpenPanel.
5. Manter Production desligado até aprovação explícita e revisão de privacidade.

## Fase 2 — DSPy (assistente de IA separado)

**Estado:** auditoria; não instalado no site.

DSPy é um framework Python para construir e otimizar fluxos de IA. Deve ser avaliado como serviço separado, com Python compatível, modelo/provedor e chave de API no servidor. Próximo experimento recomendado: responder perguntas usando somente um catálogo de teste, com respostas verificadas e sem acesso a pedidos ou dados pessoais. Medir precisão, custo, latência e recusas para perguntas fora do catálogo antes de qualquer integração.

Referência: https://dspy.ai/getting-started/installation/

## Fase 3 — Open SaaS (portal B2B como referência)

**Estado:** auditoria; não instalado nem implantado.

Open SaaS é um starter de aplicação Wasp e possui uma arquitetura própria de autenticação, pagamentos e tarefas. Não deve ser incorporado ao Next.js atual como uma dependência. Comparar funcionalidades com o fluxo B2B já existente e, se houver lacunas reais, decidir entre reaproveitar padrões, criar módulos no sistema atual ou manter um portal independente. Não migrar usuários, pedidos ou pagamentos durante a avaliação.

Referência: https://opensaas.sh/

## Fase 4 — Markdoc (conteúdo estruturado)

**Estado:** auditoria; não instalado.

A documentação de integração Next.js do Markdoc apresenta configuração de plugin e extensões de página que podem não corresponder diretamente à estrutura App Router usada no projeto. Antes de instalar, criar um protótipo isolado numa branch e validar compatibilidade com Next.js 16, metadados, rotas, build e SEO. Se o benefício não superar os componentes/páginas atuais, não adotar.

Referência: https://markdoc.dev/docs/nextjs

## Fase 5 — auto-editor (fluxo de produção de vídeo)

**Estado:** avaliação de ferramenta externa; não faz parte do site.

Testar em cópias locais de vídeos sem dados sensíveis, preservando os originais. Comparar o resultado automático com edição manual e confirmar qualidade de áudio, legendas, cortes e proporção vertical para Reels/TikTok. Não enviar mídia privada a serviços externos nem adicionar essa ferramenta à aplicação web.

Referência: https://auto-editor.com/installing

## Critérios para avançar de fase

- Build Preview aprovado e comportamento atual do site preservado.
- Sem mudanças em schema, dados ou permissões do Supabase nesta iniciativa.
- Nenhuma chave secreta no código cliente ou no repositório.
- Cada ferramenta deve demonstrar valor num teste pequeno antes de qualquer publicação ou migração.
