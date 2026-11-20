# CHANGELOG - Evolucao da versao 2

## Arquitetura encontrada
- O jogo usa HTML, CSS e JavaScript puro em modulos ES, com um Canvas principal de 48x32 tiles e loop em `requestAnimationFrame`.
- Terreno e objetos usam atlases Canvas; o mapa estatico fica em cache e personagens, NPCs e decoracoes usam y-sorting parcial.
- Colisao e caminho por tile usam `isPassable()` e BFS em `js/mundo.js`; portas e missoes sao derivadas de coordenadas desse modulo.
- Os interiores atuais usam painel DOM, nao uma cena jogavel em grid; interacao, movimento externo e save ja existem em `js/main.js` e `js/estado.js`.
- O Caderno hoje possui objetivos, cartas e inventario, mas o minimapa ainda ocupa a tela principal em HTML/Canvas.
- O estado usa `localStorage` com valores padrao e merge retrocompativel em `ESTADO_PADRAO`; ha controles de texto, contraste, movimento, som e setas.

## Plano da versao 2
- P1: remover o minimapa da tela principal e cria-lo como aba do Caderno, mantendo M e botao de celular como atalhos.
- P2/P7: remover transparencia das casas, usar profundidade por `y`, marcar `enterable` no cadastro e substituir limites textuais por elementos naturais.
- P3-P9: criar cenas internas modulares, completar farinha, musica e mercadinho, ampliar pesca, reformar lago e placas, centralizar o Terreiro dos Fandangos e manter saves retrocompativeis.
- Validar desktop 1280x720, celular 390x844 e paisagem, alto contraste, texto maior, reduzir movimento, teclado e toque, sem erros no console.

## Implementacao da versao 2
- P1 concluido: minimapa removido da tela principal e integrado as abas Saberes/Mapa do Caderno; M abre o mapa.
- P2 concluido: transparencia das casas removida; EDIFICIOS ganha enterable e casas fechadas mostram baloes no Interagir.
- P3 concluido: sistema modular de interiores com grid, spawn, saida, movimento por teclado/toque e save de cena.
- P4 concluido: placa Ponte do Saber localizada com identificacao ampliada; placass de limite removidas.
- P5 concluido: vara redesenhada, sete especies com raridade, fichas e colecao no Caderno.
- P6 concluido: lago reformulado com bordas irregulares e detalhes naturais.
- P7 concluido: limites textuais removidos e bordas naturais preservadas.
- P8 concluido: Terreiro dos Fandangos centralizado no fluxo principal.
- P9 concluido: casa musical, instrumentos, mercadinho e observacao de produtos usam o novo sistema interno.

## Pendencias
- Validacao cultural dos textos novos sobre farinha, pesca, instrumentos e especies; ver REVISAO_CONTEUDO.md.
- Revisao humana da tradicao de cerco/tainha e de detalhes sazonais antes da publicacao ampla.

## v2.1 - Reorganizacao
- Arquitetura: a v2 ja separa dados de interiores, estado localStorage, mapa 48x32, cache de terreno, y-sorting e Caderno com abas Saberes/Mapa.
- A vara so era desenhada dentro da animacao de pesca; não havia aquisicao visual nem deque identificavel. A correção adicionara vara persistente, ponto no deque e indicador "Pescar".
- Plano A: corrigir primeiro o estado, sprite e interação da pesca.
- Plano B: consolidar até cinco edificios em uma vilinha, separar lago, costa, terreiro lateral e trilhas.
- Plano C/D/E: separar vegetacao aquatica/terrestre, peixes pulantes, canoas reutilizaveis e barracas funcionais.
- Plano F: substituir o painel CSS atual dos interiores por uma cena canvas reutilizavel no mesmo tile 16 px e y-sorting.
- Plano G/H: atualizar mapa do Caderno, revisão cultural, README e documentação manual de testes.

### Teste manual da vara (A)
1. Iniciar uma jornada nova e ir ao deque/pontão oeste da praia.
2. Confirmar que a vara aparece apoiada no deque antes da pesca.
3. Aproximar-se e confirmar o botão "Pescar"; Interagir mostra a ação apenas com a vara disponível.
4. Durante a pesca, confirmar haste longa curva, cabo, linha fina, boia vermelha/branca e anzol visível.
5. Recarregar a página e confirmar que a vara continua no inventário salvo.

## v2.1 - Itens iniciados
- B concluido: cinco edificios no núcleo da vila, trilha lateral para o Terreiro e barracas em pontos separados.
- C em andamento: lago irregular por tiles, peixes saltantes com reducao por movimento e ficha no Caderno.
- D/E em andamento: canoas cairçaras com veios e barracas reduzidas.
- F concluido: interiores agora usam Canvas reutilizável, 16 px de base em escala inteira, parede/porta, personagem, objetos e y-sorting.
- G concluido: mapa do Caderno usa o layout v2.1 com cinco casas, lago, pavilhao lateral, barracas e Terreiro.
- H concluido: revisão cultural ampliada para vara, canoas, lago, peixes e ocupacao do terreiro.

## Fase 0 - Auditoria
- Arquitetura atual: mundo em grid 48x32, cada tile mede 16 px na base e usa escalas inteiras no Canvas.
- Terreno, objetos e personagens usam atlas Canvas, com terreno estático em cache offscreen e y-sorting no loop principal.
- Colisão: `isPassable()` bloqueia mar, lagoa, céu, mato e retângulos derivados de `EDIFICIOS`; BFS usa tiles adjacentes para caminho.
- Câmera: centraliza o jogador com margem vertical diferente em retrato/paisagem e limita às bordas do mapa; não estica pixels.
- Interação: proximidade em Manhattan, tecla E/Enter/espaço, toque no mapa e botão Interagir; objetos interativos têm cadastro em `MAPA_DECORACOES` ou módulos específicos.
- Diálogos: DOM em `js/dialogo.js`, com retrato Canvas e opção de digitação sem som fora da opção Som.
- Missões: estrutura em `dados/personagens.js` e `dados/conteudo.js`; progresso é salvo por etapa e alvos concluídos.
- Mochila: inventário em `estado.inventario`, itens únicos em `itensArmazemColetados` e cartas em `cartasColetadas`.
- Save: localStorage com merge do estado antigo em `ESTADO_PADRAO`, incluindo campos novos por retrocompatibilidade.
- Acessibilidade: texto grande/fácil, alto contraste, reduzir movimento, som, setas, teclado, toque e áreas seguras.

### Modo debug
- URL: `?debug=1`.
- Não altera o mapa ou o layout normal.
- Exibe ID/nome sobre edificações, NPCs, decoração, pontos de pesca e praça; caixas vermelhas de colisão; coordenadas do jogador.

## Fase A - Correcoes verificaveis
- Item A1 | verificado: sim | como testei: abri `/?teste=sprites`, confirmei 8 avatares em 4 direcoes e 3 quadros, ativei alto contraste e não houve erro no console.
- Item A2 | verificado: sim | como testei: exportei `tileAt` em `/?debug=1`, confirmei zero tiles de grama no bloco 35..39/y21..25 e 25 tiles lagoa em formato irregular; revistei o mapa ampliado e removi barracas/praia do conjunto de icones.
- Item A3 | verificado: sim | como testei: confirmei `casa-musical` em `EDIFICIOS`, `CENA_FANDANGO` em (7,18), remoção dos objetos da clareira e rótulo próprio no debug; cinco casas e sem colisao das portas.
- Item A4 | verificado: sim | como testei: percorri `findPath` e `verificarEdificios` em navegador, todas as portas tiveram rota e não houve avisos de edificações próximas; a rua principal ficou em y17/18 e trilhas verticais em x25,13,37,40.
- Item A5 | verificado: sim | como testei: carreguei o modulo repetidamente em `/?debug=1`; gerador fixo produziu 25 elementos arvore/palmeira sem coordenadas repetidas e sem tiles caminho/agua/edificio.
- Item A6 | verificado: sim | como testei: listei `EDIFICIOS` e objetos da clareira direita em `?debug=1`; não havia casa dentro ou na beira da mata. Casa removida: nenhuma nesta fase; adicionei `tronco-caido` em (43,7).
- Item A7 | verificado: sim | como testei: confirmei placa em margem nao aquatica em (40,25), lixeira organica em (41,24), reciclavel em (43,25), zero peixe/biju/cataia e somente vitoria-regia/junco/tronco em tiles lagoa.
- Item A8 | verificado: sim | como testei: rodei a checagem de sobreposicao em decoracoes em `?debug=1`; a bandeira ficou separada do vento, Rita saiu da lagoa, arbustos duplicados foram removidos e não restaram pares próximos em coordenadas iguais.
