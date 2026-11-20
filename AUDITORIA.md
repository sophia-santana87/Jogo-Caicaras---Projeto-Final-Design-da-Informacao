# AUDITORIA DE OBJETOS E POSICAO

Mapa em grade de 48x32 tiles. Coordenadas abaixo usam o canto ou ponto registrado em `js/mundo.js`.

## Resumo do mapa

| Categoria | Quantidade | Observacao |
|---|---:|---|
| Edificios | 5 | Vila reduzida a cinco construcoes |
| Decoracoes | 71 | Objetos em `MAPA_DECORACOES` |
| NPCs | 7 | Rotinas por horario |
| Pontos de pesca | 3 | Ponto mar e pontos lago |
| Pontos de observacao | 4 | Mare, vento, ceu e manejo da mata |
| Terreiro | 1 | Centro visual em (7,18) |
| Dancarinos | 6 | Cena do fandango |
| Musicos | 3 | Cena do fandango |
| Rotas de moradores | 12 pontos | Caminhos cenicos |

## Edificios

| ID | Tipo | x | y | Entrada | Terreno |
|---|---|---:|---:|---|---|
| edificio_1_casa-de-farinha | casaFarinha | 25 | 10 | (25,11) | casaFarinha |
| edificio_2_armazem | casa | 15 | 16 | (15,17) | vila/casa |
| edificio_3_mercadinho | mercadinho | 21 | 16 | (21,17) | mercadinho |
| edificio_4_pavilhao-fandango | pavilhao | 29 | 16 | (29,17) | pavilhao |
| edificio_5_casa-fechada | casa | 36 | 16 | (36,17) | casa |

## NPCs

| ID | Nome | x | y | Terreno |
|---|---|---:|---:|---|
| npc_dona-cida | Dona Cida | 21 | 10 | vila |
| npc_nelson | Seu Nelson | 13 | 26 | vila/praia |
| npc_jaque | Jaque | 34 | 27 | grama |
| npc_tiao | Mestre Tião | 29 | 15 | vila |
| npc_rita | Rita | 39 | 25 | lagoa |
| npc_davi | Davi | 11 | 23 | vila |
| npc_erveiro | Seu Ari | 40 | 5 | grama/mata |

## Pontos de pesca e observacao

| ID | Tipo | x | y | Terreno |
|---|---|---:|---:|---|
| pesca_1 | mar | 13 | 28 | madeira/praia |
| pesca_2 | lagoa | 34 | 23 | lagoa |
| pesca_3 | lagoa | 40 | 23 | lagoa |
| observacao_mare | mare | 13 | 26 | vila/praia |
| observacao_vento | vento | 15 | 28 | praia |
| observacao_ceu | ceu | 16 | 26 | vila/praia |
| observacao_manejo-mata | manejo-mata | 40 | 6 | mata |

## Terreiro e cena do fandango

| ID | Tipo | x | y |
|---|---|---:|---:|
| terreiro_fandango | centro da cena | 7 | 18 |
| dancarino_1 | homem | 5 | 18 |
| dancarino_2 | mulher | 6 | 16.5 |
| dancarino_3 | homem | 8 | 16.5 |
| dancarino_4 | mulher | 9 | 18 |
| dancarino_5 | homem | 8 | 19.5 |
| dancarino_6 | mulher | 6 | 19.5 |
| musico_1 | viola | 10 | 17 |
| musico_2 | rabeca | 10 | 18.5 |
| musico_3 | adufo | 10 | 20 |

## Decoracoes

| ID | Tipo | Nome | x | y | Terreno |
|---|---|---|---:|---:|---|
| barraca_01 | barraca | Barraca da praia | 42 | 24 | praia |
| barraca_02 | barraca | Barraca da vila | 6 | 27 | praia |
| vara-pesca_03 | vara-pesca | Vara de pesca | 12 | 27 | praia |
| forno_04 | forno | forno | 23 | 8 | plantacao |
| prensa_05 | prensa | prensa | 22 | 8 | plantacao |
| peneira_06 | peneira | peneira | 22 | 9 | plantacao |
| rede_07 | rede | rede | 12 | 28 | praia |
| bandeira_08 | bandeira | bandeira | 15 | 28 | praia |
| luminaria_09 | luminaria | luminaria | 24 | 12 | vila |
| luminaria_10 | luminaria | luminaria | 9 | 18 | caminho |
| luminaria_11 | luminaria | luminaria | 26 | 18 | caminho |
| luminaria_12 | luminaria | luminaria | 39 | 18 | caminho |
| luminaria_13 | luminaria | luminaria | 28 | 12 | vila |
| luminaria_14 | luminaria | luminaria | 35 | 12 | vila |
| banco_15 | banco | banco | 27 | 12 | vila |
| banco_16 | banco | banco | 35 | 12 | vila |
| placa_17 | placa | placa | 18 | 13 | vila |
| planta-medicinal-a_18 | planta-medicinal-a | planta-medicinal-a | 38 | 4 | mato |
| planta-medicinal-b_19 | planta-medicinal-b | planta-medicinal-b | 45 | 4 | mato |
| planta-medicinal-c_20 | planta-medicinal-c | planta-medicinal-c | 46 | 6 | mato |
| arvore_21 | arvore | arvore | 40 | 3 | mato |
| arbusto_22 | arbusto | arbusto | 47 | 5 | mato |
| arbusto_23 | arbusto | arbusto | 40 | 5 | grama |
| arbusto_24 | arbusto | arbusto | 47 | 4 | mato |
| viola_25 | viola | viola | 26 | 17 | caminho |
| rabeca_26 | rabeca | rabeca | 28 | 17 | caminho |
| adufo_27 | adufo | adufo | 30 | 17 | caminho |
| placa_28 | placa | placa | 40 | 24 | lagoa |
| ponte-saber_29 | ponte-saber | Ponte do Saber | 20 | 16 | vila/caminho |
| peixe_30 | peixe | peixe | 41 | 25 | lagoa |
| biju_31 | biju | biju | 42 | 25 | praia |
| cataia_32 | cataia | cataia | 43 | 25 | grama |
| lixeiraOrganica_33 | lixeiraOrganica | lixeiraOrganica | 41 | 24 | grama |
| lixeiraReciclavel_34 | lixeiraReciclavel | lixeiraReciclavel | 41 | 24 | grama |
| bandeira_35 | bandeira | bandeira | 30 | 7 | plantacao |
| bandeira_36 | bandeira | bandeira | 38 | 7 | grama |
| flor_37 | flor | flor | 30 | 11 | vila |
| flor_38 | flor | flor | 38 | 11 | vila |
| arbusto_39 | arbusto | arbusto | 29 | 9 | grama |
| arbusto_40 | arbusto | arbusto | 38 | 10 | grama |
| flor_41 | flor | flor | 39 | 12 | vila |
| pedra_42 | pedra | pedra | 40 | 11 | vila |
| capim_43 | capim | capim | 44 | 13 | vila |
| cerca_46 | cerca | cerca | 45 | 11 | vila |
| cerca_47 | cerca | cerca | 45 | 12 | vila |
| cerca_48 | cerca | cerca | 44 | 13 | vila |
| flor_49 | flor | flor | 40 | 14 | grama |
| pedra_50 | pedra | pedra | 40 | 15 | grama |
| arbusto_51 | arbusto | arbusto | 39 | 16 | vila |
| capim_52 | capim | capim | 37 | 17 | vila |
| flor_53 | flor | flor | 30 | 20 | vila |
| arbusto_54 | arbusto | arbusto | 30 | 23 | vila |
| vitoria-regia_55 | vitoria-regia | vitoria-regia | 38 | 22 | lagoa |
| junco_56 | junco | junco | 40 | 24 | lagoa |
| tronco_57 | tronco | tronco | 36 | 24 | lagoa |
| flor_58 | flor | flor | 39 | 20 | vila |
| cerca_59 | cerca | cerca | 41 | 25 | lagoa |
| cerca_60 | cerca | cerca | 44 | 24 | praia |
| capim_61 | capim | capim | 45 | 23 | praia |
| capim_62 | capim | capim | 34 | 21 | grama |
| capim_63 | capim | capim | 33 | 23 | vila |
| pedra_64 | pedra | pedra | 41 | 23 | lagoa |
| flor_65 | flor | flor | 40 | 25 | praia |
| capim_66 | capim | capim | 40 | 21 | vila |
| arbusto_67 | arbusto | arbusto | 8 | 17 | vila |
| flor_68 | flor | flor | 9 | 16 | vila |
| arbusto_69 | arbusto | arbusto | 25 | 19 | vila |
| flor_70 | flor | flor | 36 | 20 | vila |
| arvore_71 | arvore | arvore | 6 | 17 | vila |
| arbusto_72 | arbusto | arbusto | 9 | 22 | vila |
| flor_73 | flor | flor | 11 | 22 | vila |
| arbusto_74 | arbusto | arbusto | 39 | 16 | vila |
| pedra_75 | pedra | pedra | 34 | 24 | grama |

## Sobreposicoes confirmadas

- **bandeira_08 + observacao_vento** em (15,28): a bandeira e o ponto de observacao compartilham a mesma posicao.
- **arbusto_23 + npc_erveiro** em (40,5): o arbusto pode cobrir parte visual do NPC.
- **placa_28 + junco_56** em (40,24): placa e junco apontam para o mesmo tile dentro da lagoa.
- **peixe_30 + cerca_60** em (41,25): decoracoes de pesca e cerca muito proximas.
- **capim_43 + cerca_48** em (44,13): vegetacao e cerca compartilham o mesmo setor.
- **arbusto_51 + arbusto_74** em (39,16): dois arbustos duplicados no mesmo setor.
- **npc_nelson + observacao_mare** em (13,26): NPC e ponto de observacao foram cadastrados no mesmo tile.

## Objetos dentro da agua

1. **placa_28** em (40,24), tipo placa, mas dentro de tile lagoa.
2. **vitoria-regia_55** em (38,22), tipo aquatico correto.
3. **junco_56** em (40,24), tipo aquatico correto.
4. **tronco_57** em (36,24), tipo aquatico correto.
5. **npc_rita** em (39,25), NPC sobre lagoa, caminho ou colisao deve ser revisado.
6. **peixe_30** em (41,25), decoracao em tile lagoa; revise se esta decoracao deve ficar na margem.
7. **cerca_59** em (41,25), cerca dentro ou na borda da lagoa.

Observacao: os pontos 1, 5 e 7 sao os mais claros para correcoes futuras de navegacao.

## Diagnosticos solicitados

### 1. Quadrado preto ao redor do lago no minimapa
O quadrado nao esta definido como objeto do mapa. Ele aparece no minimapa porque o mapa inteiro foi desenhado em `criarCamadaEstaticaMinimapa()` como um retangulo de 48x32 tiles em uma tela 192x128; a lagoa antiga/atual usa uma mascara por tiles, mas o fundo e a moldura ainda sao tratados como um retangulo. O quadrado preto nao vem de `lagoa`; ele vem da conversao entre o canvas offscreen retangular e o desenho da borda/canto da cena principal. Em `js/sprites.js`, `desenharCantosArredondadosMapa()` usa `destination-out` em todos os cantos e o fundo pode ser composto como preto quando `alpha:false` encontra transparencia. Esta combinacao gera a percepcao de quadro ao redor da area de agua.

### 2. Cabelo transparente
O personagem nao usa uma spritesheet externa. Em `desenharQuadro()` o cabelo e desenhado por retangulos em uma folha transparente criada em `criarFolhaPersonagem()`. A transparencia ocorre apenas onde nao existe retangulo de cabelo ou quando o cabelo e pintado no mesmo alpha da tela; o bug nao vem de `desenharObjeto()` nem da cama do personagem. Foi registrado antes em `docs/MELHORIAS_TESTES.md`. A correcao futura precisa validar a paleta e o preenchimento de todos os quadros, nao mudar o mapa.

### 3. Vara de pesca
A causa anterior era que a vara existia somente dentro da animacao `desenharAnimacaoPesca()` e nao tinha sprite externo permanente no mapa nem aquisicao persistente clara. Hoje ela foi adicionada ao cadastro em `MAPA_DECORACOES` como `vara-pesca_03` em (12,27), ao estado `temVara`, ao atlas de objetos em `js/sprites.js` e ao desenho da mao em `desenharVaraPesca()`. A versao atual precisa ser testada no navegador com `?debug=1`, mas o cadastro esta visivel ao debug.

### 4. Rótulo "Terreiro dos Fandangos" longe do sprite
O sprite real da cena esta em `CENA_FANDANGO = (7,18)`. O rótulo aproximado nao usa esse cadastro: `desenharIdentificacaoLocal()` percorre `EDIFICIOS`, que contem o pavilhao em (29,16) com entrada (29,17), e atribui o nome "terreiro do fandango" pela funcao `nomeEdificio()`. Por isso o rotulo pode aparecer perto do pavilhao, a (29,17), em vez de ficar sobre a clareira em (7,18). O problema e um desvio de origem dos dados, nao falta de espaço no terreno.

## Modo debug

Com `?debug=1`, `desenharDebugMapa()` exibe:
- ID/nome sobre edificios, decoracoes, NPCs, pontos de pesca e Terreiro;
- caixa vermelha de colisao aproximada;
- caixa azul na porta das edificacoes;
- coordenadas do jogador em `jogador | x=... y=...`.

Sem `?debug=1`, o bloco debug não desenha nada.

## Arquivos envolvidos

- [js/mundo.js](js/mundo.js)
- [js/main.js](js/main.js)
- [js/sprites.js](js/sprites.js)
- [js/estado.js](js/estado.js)
- [CHANGELOG.md](CHANGELOG.md)
