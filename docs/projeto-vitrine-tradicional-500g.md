# Projeto — Vitrine interativa Nutrifit | Linha Tradicional 500 g

## Regra de publicação
Este projeto permanece isolado na branch `feat/traditional-500-product-experience`.
Não fazer merge em `main`, não promover deployment para produção e não alterar o site oficial até:
1. todos os ativos visuais e conteúdos estarem concluídos;
2. fichas técnicas e dados nutricionais estarem conferidos;
3. os testes funcionais e responsivos passarem;
4. Tiago revisar a versão completa e autorizar expressamente a implantação.

Deploys de preview são apenas para avaliação e não representam publicação no domínio oficial.

## Escopo da entrega
- Vitrine de duas áreas no desktop: seleção dos pratos e painel de detalhes.
- No celular, detalhes reorganizados abaixo da seleção.
- Seleção de prato sem navegação para outra página.
- Integração com o carrinho existente.
- Fotos individuais dos pratos e dos ingredientes efetivamente utilizados.
- Ingredientes, descrições, gramagens e macros provenientes de fichas técnicas validadas.
- Preservar identidade Nutrifit (preto, verde-oliva e laranja), logo oficial e cadastro atual de produtos.

## Cardápio de referência
A lista abaixo corresponde ao cadastro do site verificado na implementação da branch. Antes da aprovação final, comparar novamente com o cadastro vigente para confirmar que não houve atualização.

| Produto | Preço cadastrado |
|---|---:|
| Patinho com Abóbora | R$ 29,90 |
| Parmegiana Cremosa | R$ 26,90 |
| Feijoada | R$ 26,90 |
| Frango Cremoso | R$ 26,90 |
| Churrasco Mineiro | R$ 29,90 |
| Strogonoff Leve | R$ 26,90 |
| Executivo Saudável | R$ 26,90 |
| Carne de Panela com Batata e Cenoura | R$ 29,90 |
| Cupim com Mandioca | R$ 29,90 |
| Panqueca de Frango ao Molho de Tomate | R$ 27,00 |
| Sobrecoxa com Mostarda e Mel | R$ 29,90 |

## Controle de qualidade por prato

| Produto | Foto do prato | Ingredientes confirmados | Ficha técnica 500 g | Macros validados |
|---|---|---|---|---|
| Patinho com Abóbora | Pendente de validação | Pendente | Pendente | Pendente |
| Parmegiana Cremosa | Pendente de validação | Pendente | Pendente | Pendente |
| Feijoada | Pendente de validação | Pendente | Pendente | Pendente |
| Frango Cremoso | Pendente de validação | Pendente | Pendente | Pendente |
| Churrasco Mineiro | Pendente de validação | Pendente | Pendente | Pendente |
| Strogonoff Leve | Pendente de validação | Pendente | Pendente | Pendente |
| Executivo Saudável | Pendente de validação | Pendente | Pendente | Pendente |
| Carne de Panela com Batata e Cenoura | Pendente de validação | Pendente | Pendente | Pendente |
| Cupim com Mandioca | Pendente de validação | Pendente | Pendente | Pendente |
| Panqueca de Frango ao Molho de Tomate | Pendente de validação | Pendente | Pendente | Pendente |
| Sobrecoxa com Mostarda e Mel | Pendente de validação | Pendente | Pendente | Pendente |

## Pendências de conteúdo e produção
- Localizar ou consolidar as fichas técnicas específicas da Linha Tradicional; os materiais recuperados até agora incluem catálogos e rótulos de referência, mas não comprovam a formulação completa, rendimento, gramagem por componente e macros dos 11 pratos.
- Não assumir que listas de ingredientes de artes anteriores sejam receitas finais.
- Confirmar para cada prato: ingredientes, quantidade bruta e líquida, perdas, rendimento após preparo, peso final servido, método de preparo, alergênicos e custo com fonte/data.
- Calcular informação nutricional apenas após fechar a formulação e usar base de composição confiável ou análise aplicável.
- Produzir imagens individuais consistentes para os 11 pratos e para os ingredientes confirmados. Imagens conceituais não devem ser apresentadas como registro fotográfico da produção real.
- Substituir os cartões de ingredientes provisórios da interface por ativos individuais aprovados.
- Testar iPhone/Android, desktop, acessibilidade básica, carregamento de imagens, seleção de produtos, preço e adição ao carrinho.

## Estado técnico inicial
- Branch de desenvolvimento: `feat/traditional-500-product-experience`
- Componente inicial: `TraditionalCatalog` em `app/HomeClient.tsx`
- PR de revisão: #73 (rascunho)
- Preview anterior: `https://nutrifitjf-oficial-3eh91wkqo-tiguimtftiago-3866s-projects.vercel.app`
- Último build verificado: READY; compilação Next.js e TypeScript concluída.
- A interface atual é uma primeira estrutura funcional, não a entrega final. Cartões de ingredientes ainda provisórios e validação visual ponta a ponta ainda pendente.

## Critério de conclusão
Marcar um prato como concluído somente quando foto, receita, gramagens, rendimento, ingredientes, custo e informação nutricional estiverem documentados e revisados. A vitrine completa só será submetida à aprovação após todos os 11 pratos e os testes finais estarem prontos.
