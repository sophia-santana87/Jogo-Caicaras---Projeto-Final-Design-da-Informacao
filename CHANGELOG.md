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
