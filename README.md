# Dia na Ponta Oeste

Projeto final em HTML, CSS e JavaScript para um MVP de jogo educativo web inspirado na cultura caiçara da Ponta Oeste.

## Equipe
- Bianca Vasconcelos de Lima
- Katryni Haaby dos Santos Bueno
- Luana Harmatiuk Guimarães
- Sophia Santana da Silva
- Vanessa da Silva Costa

## Contexto
Jogo educativo com foco em escuta, pesquisa e cultura caiçara, pensado para crianças e adolescentes, com textos curtos, aprendizado por escolhas e uma abordagem respeitosa com a comunidade.

## Como executar
1. Abra a pasta do projeto em um navegador moderno.
2. Para ambiente local, rode um servidor estático simples:
   ```bash
   python -m http.server 8000
   ```
3. Acesse: http://localhost:8000

## Telas e acessibilidade
- A interface se adapta a celulares, tablets e computadores, em retrato ou paisagem.
- O mapa Canvas ajusta o enquadramento ao tamanho da janela sem esticar os pixels.
- Controles de toque, áreas seguras de celular, diálogos roláveis e opções de acessibilidade são mantidos.
- Para verificar diferentes tamanhos, redimensione a janela ou use a simulação de dispositivos do navegador.

## Publicar no GitHub
1. Crie um repositório no GitHub. Para publicar o jogo, deixe-o público.
2. Envie os arquivos desta pasta, incluindo `index.html`, `.nojekyll` e `.gitignore`. Não envie pastas de editor, dependências ou segredos.
3. Para publicar também no GitHub Pages, abra **Settings → Pages**, escolha **Deploy from a branch**, selecione `main` e a pasta `/ (root)`, e salve.
4. O GitHub exibirá o endereço da página na mesma seção. A publicação pode levar alguns minutos.

O projeto é estático: não requer instalação de pacotes, compilação ou configuração de servidor no GitHub Pages.
Antes de tornar o repositório público, a equipe deve definir a licença do projeto e concluir as validações culturais descritas nesta documentação.

## Estrutura
- `index.html`
- `css/estilo.css`
- `js/main.js`
- `js/mundo.js`
- `js/sprites.js`
- `js/ui.js`
- `js/dialogo.js`
- `js/missoes.js`
- `js/acessibilidade.js`
- `js/estado.js`
- `js/som.js`
- `dados/conteudo.js`
- `dados/personagens.js`
- `docs/NARRATIVA.md`
- `docs/MISSOES_E_LOCAIS.md`
- `docs/MELHORIAS_TESTES.md`

## Melhorias desta revisão
- Interiores de 14x9 tiles com piso e personagens na escala do mapa; casa de farinha com cinco estações instruídas, mercadinho demonstrativo e instrumentos dentro da casa musical.
- Praça, capela, escola, peixaria, horta e postes integrados ao mapa; caminho e identificação da entrada revistos.
- Pesca ampliada para o mar, canoa controlável, fauna observável e fichas de lagoa/fandango registradas no Caderno.
- Tutorial “Como jogar” dividido em cinco passos curtos, com progresso e navegação anterior/próximo.
- Textos culturais novos permanecem sinalizados para validação comunitária. A matriz de abertura e mapa nos quatro viewports e preferências, com limites de cobertura, está em `docs/auditoria/MATRIZ_MISSOES_E_LAYOUT.md`.
## Observações
- As imagens da pasta `referencias/` não entram na versão publicada.
- O conteúdo e textos marcados como "a validar" ficam em dados separados para revisão.
- `js/sprites.js` gera e reutiliza atlas em Canvas para terrenos, cenários e personagens; o desenho mantém a suavização desligada para preservar os pixels.
- O terreno estático é armazenado em uma camada Canvas. `EDIFICIOS` deriva dos símbolos do mapa e define áreas bloqueadas e entradas.
- Personagens, ordem e títulos das missões vêm do cadastro em `dados/personagens.js`; as etapas, escolhas e cartas estão em `dados/conteudo.js`.
- As missões agora registram etapas retomáveis: observar sinais do mar, encontrar instrumentos, visitar locais, conversar e ordenar as etapas da farinha no interior.
- A casa de farinha e o armazém têm interiores interativos. O progresso das missões, a pesca e o evento final são persistidos no navegador.
- A lagoa tem margens acessíveis para pesca limitada, e moradores mudam de atividade conforme os horários do dia. A interação na canoa prioriza o desembarque e reconhece margens caminháveis próximas.
- O evento do Barco de Fora apresenta escolhas e explicações sem indicar uma resposta correta. Se a comunidade não agir, o cenário registra a redução de peixes.
- `AGENTS.md` e os guias em `docs/` registram o escopo, a linguagem e os pontos que ainda precisam de validação cultural.
- `MAPA_DECORACOES`, em `js/mundo.js`, reúne os objetos de apoio das áreas da farinha, do píer, do fandango e da barraca sem alterar a navegação do mapa.
- A opção de reduzir movimento também pausa as animações de cenário; contraste e tamanho de texto continuam aplicados pela interface de acessibilidade.
- O personagem caminha com transição entre casas do mapa; o cachorro passeia pela vila e pode receber carinho quando está por perto.
- Indicadores ficam recolhidos até serem abertos, e conversas comuns começam com a opção de dizer oi.
- A abertura tem atalhos para jogar, personalizar e acessar recursos de acessibilidade; a criação oferece oito combinações de tons de pele, cabelos e roupas, e o nome permanece salvo no jogador.
- Dicas contextuais apresentam movimentação e interação no momento em que são necessárias. O caderno separa objetivos de missões e cartas coletadas.
- O mapa separa os pontos de missão, reúne as casas em ruas próximas ao pavilhão central e ao armazém e mantém caminhos para a praia, a casa de farinha e a trilha da mata; também inclui fandango animado e elementos decorativos.
- A trilha da mata contém a missão «Trilha dos Saberes da Mata», com Seu Ari, e plantas destacadas na trilha da mata.
- A atividade de pesca mostra o lançamento, a fisgada e o peixe; a escolha de guardar ou devolver atualiza os indicadores e a disponibilidade local.
- O armazém está junto ao núcleo comunitário, e um caminho conecta a vila à área de observação da mata.
- As construções residenciais e personagens usam uma escala revisada para tornar as proporções mais coerentes.
- A seta de missão acompanha a etapa atual, mostra o destino no mapa ou na borda da tela e some ao chegar; o painel informa objetivo e progresso.
- O armazém permite adicionar cada produto uma vez ao inventário persistido. O caderno mostra quantidades, e uma notificação confirma cada coleta.
- Caminhos conectam as frentes das casas e novas luminárias iluminam pontos da vila ao entardecer. Identificações de locais aparecem quando o jogador se aproxima.
- A vila foi reorganizada com mais espaço entre fachadas, fileiras escalonadas e respiros entre núcleo comunitário, praia, lagoa e trilha da mata. NPCs e pontos interativos foram afastados das zonas de oclusão das casas.
- Casas mantêm opacidade constante; o personagem passa atrás ou na frente das fachadas por y-sorting, sem transparência indiscriminada.
- O minimapa agora fica no Caderno dos Saberes, na aba Mapa. A tecla M abre essa aba; o mapa ampliado usa a mesma camada estática e mostra posição atual e pontos de interesse.
- Versão dos módulos atualizada para `v=36`; o modo `?dev=1` registra pares de edifícios com distância insuficiente e portas inacessíveis no console, sem custo na execução normal.
- Residências decorativas foram reduzidas e espaçadas; a rua central liga portas, área comercial e o caminho da praia. O mercadinho tem fachada, interior demonstrativo e interação sem compras, pois a economia depende de validação comunitária.
- O pavilhão ganhou bancos, vegetação e iluminação de apoio, e uma placa sinaliza a entrada da comunidade.
- Versão 2: o minimapa passou para o Caderno, casas fechadas usam balão curto, interiores são navegáveis e a casa de farinha possui cinco etapas jogáveis.
- A casa musical concentra instrumentos e ritmo do Mestre Tião, o mercadinho permite observar produtos e a pesca registra espécies com fichas no Caderno.
- O lago usa margem irregular sem vegetação terrestre na água, a casa musical fica junto ao núcleo e o Terreiro dos Fandangos ocupa uma clareira lateral ligada por trilha.
- Licença a definir pela equipe.

## Validação cultural
As etapas da farinha, o fandango, os sinais do tempo, a pesca, a missão da mata e o evento do Barco de Fora são rascunhos educativos marcados para revisão. Antes de publicar, validá-los com a comunidade caiçara da Ponta Oeste e o Instituto Raízes Caiçaras.

- Fase B: interiores usam a escala inteira do mapa, câmera acompanhando o jogador, piso de madeira e objetos do atlas. O armazém mantém guardar/retirar, o mercadinho é observacional e a casa de farinha mantém as cinco etapas. O diagnóstico e as medidas calculadas para 360, 390 e 430 px estão no `CHANGELOG.md`.

- Fase C: mar ampliado em seis linhas; canoa navegável salva no estado; pesca no mar e cesto/soltura animados; fauna observável com fichas `validar: true` no Caderno. Veja `CHANGELOG.md` para as checagens estáticas e os passos de verificação visual ainda necessários.


- Fase D: praça central 7x5 com coreto, bancos e árvores; capela e escola próximas; peixaria observacional junto ao píer; horta interativa cercada. A escola registra conceitos culturais ilustrados no Caderno, com conteúdo marcado para validação. Postes iluminam suavemente ao entardecer e respeitam reduzir movimento. Checagens estão documentadas no `CHANGELOG.md`.


## Auditoria de layout e acessibilidade

- Menus de áudio ignoram cliques repetidos durante a transição; o mapa deixa de redesenhar por quadro enquanto um modal de interior está aberto. O foco dos diálogos não desloca a rolagem, e a sala preserva sua posição ao atualizar.
- O armazém foi afastado da horta, as lixeiras foram levadas para o canto oeste e a placa da entrada saiu do terreiro. A escolha de sair de canoa foi removida da missão de leitura do tempo, que fica com duas opções.
- Casa musical em escala maior e interiores em tom mais claro; fichas de peixes e fauna mostram o animal no retrato do diálogo.
- Posições iniciais dos interiores recuadas um tile da porta para permitir caminhar até a saída. Os produtos do armazém agora habilitam as opções de guardar e retirar.
- O canvas do mapa usa largura em tiles inteiros nos celulares: 11 colunas em 360 px, 12 em 390 px e 13 em 430 px, centralizadas sem esticar pixels.

- Correção de alcance para a primeira planta da trilha, priorização do NPC alvo e atualização do estado de áudio suspenso. Reteste representativo das 14 etapas de missão e 2 decisões do evento, além de 16 combinações de viewport e preferência para abertura/mapa.
- Capturas e limites do reteste: `docs/auditoria/MATRIZ_MISSOES_E_LAYOUT.md`. A pontuação da interação em cada combinação e a validação com leitor de tela permanecem pendentes.
- Dica "Entendi": conversas agora dispensam a dica pela mesma acao do botao, evitando deixar a fila de mensagens presa. A ficha da fauna e os textos da trilha nao exibem avisos de confirmacao; os metadados `validar: true` continuam no cadastro.
- A terceira planta da trilha foi movida para um tile caminhável junto ao caminho da mata. Imports e cache estático usam `v=66`.

## Verificacao manual final

- Chrome desktop/headless: mapa testado em 1280x900; celulares em 360x800, 390x844 e 430x932; tablets em 768x1024 e 1024x768. O mapa mostra 11, 12 e 13 tiles inteiros nos tres tamanhos de celular, sem esticar pixels; os controles visiveis mantem alvo de pelo menos 44 px.
- Fluxos percorridos: abertura, tutorial, dialogos e botao Entendi, caderno/mapa, missoes, casa de farinha, mercadinho, armazem, casa musical, escola, pesca, canoa, trilha da mata, salvar/carregar e preferencias de contraste e movimento reduzido. Nenhum erro de console foi observado.
- Em 360x640, o interior musical continua rolavel e o botao de saida permanece visivel. Verificacao de edificios: zero portas inacessiveis e zero pares em conflito.
- Validacao feita no Chrome headless, nao em aparelhos fisicos; leitor de tela e saida de audio em hardware real nao foram verificados.

- Paineis dos interiores reativam foco e interacao ao abrir, mesmo depois de um dialogo ter aplicado `inert` aos modais ocultos; ao sair, o painel volta a ficar inerte. Cache dos modulos atualizado para `v=67`.

- Casa musical: o dialogo agora fica acima do painel do interior; Mestre Tiao foi reposicionado fora da area coberta pelo telhado e sua rotina da tarde fica junto ao terreiro. A opcao Entendi encerra a orientacao da missao sem abrir outro dialogo por cima.
- No celular, toques no canvas nao bloqueiam a rolagem vertical da sala. O toque curto continua selecionando objetos, e o botao Voltar ao mapa permanece fixo e visivel. Reteste no Chrome: musical, farinha, Entendi da missao e da dica em 360x640; rolagem vertical avancou 122 px, dialogos ficaram clicaveis e a saida ficou visivel.
- A bolinha e a seta de missao acompanham a posicao atual do personagem conforme o horario; a posicao de Mestre Tiao e o marcador ficam em tiles caminhaveis, fora da fachada.
- Imports e cache estatico atualizados para `v=70`.
