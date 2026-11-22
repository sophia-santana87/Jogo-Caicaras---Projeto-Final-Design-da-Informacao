# Auditoria de missoes e sobreposicoes

## Escopo conferido

O cadastro contem cinco missoes, na ordem `roca`, `mar`, `fandango`, `visitantes`, `mata`, com 14 etapas no total. O evento `barco-de-fora` tem duas etapas de escolha e foi verificado separadamente. Pesca, armazem e mercadinho aparecem como atividades/locais, nao como missoes cadastradas em `dados/conteudo.js`.

| Missao | Etapas confirmadas no cadastro | Elemento principal da etapa |
|---|---|---|
| Memoria da Farinha (`roca`) | entrar na casa; ordenar cinco estacoes; conversar com Dona Cida | seta e Interagir; interior com cinco botoes; dialogo e escolha final |
| A Leitura do Tempo (`mar`) | observar mare, vento e ceu; conversar com Davi | seta, Interagir, registros e dialogos |
| Resgate Cultural (`fandango`) | entrar na casa musical; observar viola, rabeca e adufo; conversar com Mestre Tiao | seta, interior, botoes dos instrumentos e dialogos |
| O Conflito Contemporaneo (`visitantes`) | conversar com Rita; conversar com Jaque; observar duas lixeiras | seta, Interagir, registros e dialogos |
| Trilha dos Saberes da Mata (`mata`) | conversar com Seu Ari; encontrar tres plantas; observar o ponto de manejo | seta, Interagir, registros e dialogos |
| Barco de Fora (`barco-de-fora`, evento) | duas decisoes com tres opcoes cada | dialogo modal, escolhas e explicacoes |

Nao ha etapas cadastradas de missao para pesca, armazem ou mercadinho. A casa de farinha e a casa musical sao interiores usados pelas missoes acima. O armazem e o mercadinho sao atividades separadas.

## Matriz de abertura e mapa

Cada celula abaixo representa uma abertura do jogo em `screen-game`, com as preferencias aplicadas no estado salvo e o viewport configurado no Chrome headless. Nas 16 combinacoes: `window.__appReady` ficou verdadeiro, o canvas usou as dimensoes CSS solicitadas, nao houve resposta HTTP de recurso >=400 e os botoes visiveis tiveram alvo minimo de 44 px.

| Viewport | Padrao | Letra maior | Alto contraste | Reduzir movimento |
|---|---|---|---|---|
| 390x844 | OK | OK | OK | OK |
| 844x390 | OK | OK | OK | OK |
| 768x1024 | OK | OK | OK | OK |
| 1280x720 | OK | OK | OK | OK |

Capturas representativas do mapa:

- [390x844, padrao](capturas/mapa-390x844-padrao.png)
- [844x390, alto contraste](capturas/mapa-844x390-alto-contraste.png)
- [768x1024, reduzir movimento](capturas/mapa-768x1024-reduzir-movimento.png)
- [1280x720, letra maior](capturas/mapa-1280x720-letra-maior.png)

## Retomada representativa por etapa

A matriz completa de cenas contem 256 capturas: as 14 etapas de missao e as duas do evento, cruzadas com os quatro viewports e as quatro preferencias. Todas as capturas foram geradas apos carregar um save intermediario e aguardar `window.__appReady`. O indice esta em [matriz-etapas.csv](matriz-etapas.csv).

As acoes e a persistencia foram pontuadas em 390x844, configuracao padrao, para cada uma das 16 etapas. Nos outros 240 cruzamentos, a evidencia e a cena retomada/capturada; o resultado de cada toque nao foi medido separadamente.

| Missao/etapa | Resultado observado apos retomar e interagir |
|---|---|
| `roca` 1/3 - entrar | Interagir abriu a casa e salvou o passo 2/3. |
| `roca` 2/3 - ordenar | Os cinco botoes das estacoes, na ordem, salvaram `progressoFarinha=5` e avancaram ao passo 3/3. |
| `roca` 3/3 - conversar | Dona Cida abriu dialogo. |
| `mar` 1/2 - observar | O primeiro sinal abriu registro; a etapa permaneceu retomavel. |
| `mar` 2/2 - conversar | O botao identificou Davi e abriu dialogo. |
| `fandango` 1/3 - entrar | Interagir abriu a casa musical e salvou o passo 2/3. |
| `fandango` 2/3 - instrumentos | O botao do instrumento abriu dialogo e a ficha. |
| `fandango` 3/3 - conversar | O botao identificou Mestre Tiao e abriu dialogo. |
| `visitantes` 1/3 - conversar com Rita | Dialogo abriu. |
| `visitantes` 2/3 - conversar com Jaque | Dialogo abriu. |
| `visitantes` 3/3 - separar residuos | Interagir com a lixeira organica abriu o registro. |
| `mata` 1/3 - conversar | Dialogo de Seu Ari abriu. |
| `mata` 2/3 - encontrar plantas | O primeiro alvo abriu registro e informou as plantas restantes. |
| `mata` 3/3 - manejo | O registro abriu e apresentou as tres escolhas de conclusao. |
| Barco de Fora 1/2 | O dialogo apresentou tres opcoes; escolher uma salvou o progresso 1/2. |
| Barco de Fora 2/2 | O dialogo apresentou tres opcoes; escolher uma salvou o progresso 2/2. |

Nenhuma das cinco missoes apresentou bloqueio nos estados retomados depois da correcao. [Captura da trilha apos registrar uma planta](capturas/mata-planta-interacao-390x844.png).

## Correcoes e achados

- A primeira planta da trilha, em `(38, 4)`, nao tinha nenhum tile cardinal passavel ao redor. Como a distancia de interacao e Manhattan, o raio anterior de `1,5` impedia alcanca-la por todos os lados. A etapa da mata agora aceita distancia `2` para os alvos de plantas; o teste retomado passou a mostrar "Investigar uma planta da trilha" e registrou uma planta.
- Davi e Seu Nelson podem ficar proximos. A interface agora prioriza o NPC indicado pela etapa atual, para o botao nao sugerir conversar com a pessoa errada.
- O estado do botao de audio agora acompanha mudancas de `AudioContext` depois de sua criacao, inclusive quando o navegador suspende o contexto.
- Os URLs de CSS e modulos foram atualizados de forma uniforme para `?v=59`. Como os imports sao estaticos e nao ha build, o numero ainda aparece repetido nos arquivos; nao ha um unico ponto de definicao.

## Limites desta rodada

- Nao foi feita uma partida manual continua desde a abertura ate o fim, nem teste fisico em celular, rotacao durante a partida, falha induzida de `localStorage`, ciclo de suspensao real do Web Audio ou leitor de tela. A interface recebeu alvos DOM e atributos ARIA, mas a leitura por tecnologia assistiva precisa de validacao dedicada.
- Nao foi capturada uma matriz equivalente da revisao anterior. O problema das plantas foi confirmado pela geometria de colisao no codigo-base e reproduzido no estado novo; portanto, nao ha comparacao visual completa antes/depois.
- A checagem de rede confirmou zero recursos com status >=400; o console do navegador e avisos de execucao nao foram inspecionados integralmente.
- O fluxo de personalizacao foi aberto e iniciado em 390x844 e 1280x720. O menu de pausa foi checado em 844x390: ficou dentro da tela, rolou internamente, recebeu foco inicial e fechou com Esc.

Para repetir a verificacao local, execute `python -m http.server 8000` na raiz. Use os quatro tamanhos e preferencias da tabela, depois retome cada missao e confirme os passos descritos acima.