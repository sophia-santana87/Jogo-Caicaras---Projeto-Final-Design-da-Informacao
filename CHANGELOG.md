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

## Fase B - Diagnostico de interiores
- Exterior: mapa em grid 48x32, tile base de 16 px e escala inteira por `escalaDoMapa()`; personagem usa `desenharJogador()` com escala derivada do mesmo tile; objetos usam `desenharObjeto()`/atlas de 32 px; profundidade principal usa y-sorting da lista de elementos.
- Interior atual: painel DOM com canvas 384x288 calculado como 8x6 celulas de 48 px, não 14x9 tiles de 16 px; o personagem é desenhado em 48 px, diferente da escala externa em celulares e desktop; móveis usam tipo convertido manualmente e não uma cena unificada em 16 px.
- Câmera interna atual: não usa `escalaDoMapa()`, `posicaoCamera()` ou coordenadas tiles externas; usa apenas grid CSS/Canvas fixo de 8x6 e centralização por painel.
- Diferenças de paleta: piso, paredes e porta usam cores locais no Canvas interno, mas não reusa todos os piso/objetos/atlas externos e não aplica o fundo externo fora da sala.
- Interações internas: já diferenciam farinha, música/ritmo, mercadinho e armazém, mas o armazém não permite retirar itens; o mercadinho já observa sem compra.
- Verificação planejada: medir interior em 360, 390 e 430 px, confirmar 14x9 tiles em escala inteira e manter personagem/interação visualmente coerente.

## Fase B - Interiores na escala do mapa
- B1 - Diagnostico: antes do ajuste, o exterior usava escala inteira de `escalaDoMapa()` (16 px por tile base) e os sprites do atlas; o interior desenhava madeira, paredes e porta em cores locais, sem uma câmera equivalente. Na implementação anterior, mobile fixava a escala em 1 (tiles de 16 px), enquanto desktop limitava a escala a 2-3. Isso deixava personagem/objetos menores no celular, escala diferente no desktop e não mostrava o exterior atrás de uma janela de câmera. O personagem interno já usava o sprite normal, mas a sala não tinha o mesmo enquadramento.
- B2 - Interior redesenhado em Canvas de 14x9 tiles base, tile de 16 px multiplicado pela escala inteira do mapa, personagem do atlas e profundidade por y. A janela acompanha o jogador; piso usa o atlas de madeira e fora da sala aparece a cor do mar da paleta, sem barras pretas. Prensa, peneira, forno, sacos e produtos usam o atlas de objetos.
- B3 - Mercadinho segue apenas observacional; armazém mantém ações para guardar e retirar itens do inventário; casa de farinha mantém as cinco etapas, falas e animação já existentes.
- B4 - Medição prevista pela geometria da janela em retrato: com tiles de 32 px, larguras úteis de 341, 371 e 411 px mostram aproximadamente 10,7, 11,6 e 12,8 tiles em viewports de 360, 390 e 430 px. Botões mantêm mínimo de 44 px e ficam abaixo da cena, sem cobrir o personagem.
- Verificação pendente: comparação visual e console em navegador desktop e 360/390/430 px. O ambiente desta execução não oferece navegador integrado; as medidas acima são cálculo do layout, não medição visual.

## Fase C - Pesca, canoa e fauna
- C1 - A vara continua apoiada no píer e usa desenho vetorial na mão durante a pescaria; a ponta, linha, boia e anzol ficam no mesmo sprite funcional. Guardar registra um peixe no inventário e mostra o cesto ao lado do jogador; devolver desenha o arco, a queda e o respingo. Os desenhos de resultado congelam com `reduzirMovimento`.
- C2 - `MAPA_ALTURA` passou a 38. As seis novas linhas (y32..37) são mar; a região x15..28/y31..35 fornece 14x5 tiles de água contínua em frente ao píer. Câmera e cache usam a altura de `MAPA`; o minimapa agora mantém a proporção 48:38.
- C3 - O jogador pode embarcar nos pontos dos barcos ou no píer. A locomoção embarcada e o BFS por toque aceitam somente tiles `mar`; a saída fica no píer. `emCanoa` entra no estado padrão e saves antigos recebem `false`. A canoa desenha o personagem sentado e a remada para com movimento reduzido. Pontos de pesca no mar permitem a mesma pescaria a bordo.
- C4 - Cadastro fixo e determinístico: 8 caranguejos na praia, 4 lagartos perto da lagoa e 5 pássaros no píer/água. Eles não colidem; caranguejos fogem, lagartos alternam pausas e corridas, e pássaros levantam voo e retornam. As fichas são persistidas no Caderno e marcadas `validar: true` em `dados/fauna.js`; animações pausam com movimento reduzido.
- C5 - Peixes saltantes usam os três novos pontos no mar e os pontos existentes na lagoa. O respingo é desenhado durante o salto; com movimento reduzido aparecem apenas ondulações.
- Checagem estática: 38 linhas com 48 tiles cada; seis linhas novas de mar; 14x5 tiles contínuos em x15..28/y31..35; posições cadastradas de fauna foram conferidas contra a costa e a lagoa; sufixos de módulos iguais.
- Verificação visual e console ainda pendentes: esta execução não dispõe de navegador nem runtime JavaScript. Confirmar lançamento da vara, captura/devolução, embarque, save/reload e movimento reduzido em navegador antes de considerar a fase visualmente validada.


## Fase D - Pra?a e equipamentos comunit?rios
- D1 - Pra?a pavimentada de 7x5 tiles no centro da vila, com coreto novo em pixel art, quatro bancos e ?rvores nos cantos. A liga??o sul chega ? avenida existente; a liga??o norte segue pela rua da farinha. A casa musical permanece no quarteir?o a leste, sem bloquear a pra?a.
- D2 - Capela pr?xima ? pra?a com fachada pr?pria, porta e torre pequena com cruz.
- D3 - Peixaria junto ao caminho do p?er, com balc?o e peixes na fachada. A visita ? apenas observacional, sem compra ou venda; tainha, robalo e parati est?o cadastrados com `validar: true`.
- D4 - Escola funcional com interior de 14x9 tiles, professora fict?cia e seis alunos sentados. A conversa apresenta cai?aras e fandango em falas curtas, mostra um bal?o de pensamento ilustrado no Canvas e registra os conceitos aprendidos no Caderno. Os dois conceitos est?o marcados para valida??o cultural.
- D5 - Horta cercada com canteiros distintos de couve, alface e mandioca e NPC fict?cia cuidadora; fala curta marcada `validar: true`.
- D6 - Postes nas ruas da pra?a e da avenida aparecem de dia e recebem brilho ao entardecer; o brilho ? desligado quando `reduzirMovimento` est? ativo. Bot?es compactos do celular t?m m?nimo de 44x44 px.
- D7 - Minimapa ampliado atualizado com escola, capela, pra?a e peixaria, preservando somente ?cones de locais principais.
- Edif?cios: sete locais funcionais e uma casa comum fechada; n?o foi adicionada casa decorativa. Acessos s?o tiles transit?veis e `verificarEdificios()` n?o deve emitir avisos de espa?o ou rota.
- Verifica??o est?tica: coordenadas e ?reas dos oito edif?cios conferidas contra a regra de espa?amento; todas as portas ficam fora das ?reas bloqueadas, com acesso ? rede de caminhos. Verifica??o visual e console pendentes: n?o h? navegador nem runtime JavaScript dispon?vel nesta execu??o.
