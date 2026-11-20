# Prompt de melhorias: Dia na Ponta Oeste

Este arquivo reúne o roteiro de melhorias para ser usado diretamente pelo Codex. O Codex deve confirmar a estrutura real do código antes de editar e seguir as regras de `AGENTS.md`.

## Contexto técnico (resumo do repositório)

- Projeto estático em HTML, CSS e JS puro, com mapa em Canvas e sem build.
- Arquivos principais:

- `js/mundo.js`: mapa, `EDIFICIOS`, `MAPA_DECORACOES`, colisões e entradas.
- `js/sprites.js`: atlas Canvas de terrenos, cenários e personagens, com suavização desligada (pixel art).
- `js/ui.js`, `js/dialogo.js`, `js/missoes.js`, `js/estado.js`, `js/som.js`, `js/acessibilidade.js`.
- `dados/conteudo.js` (etapas, escolhas e cartas das missões) e `dados/personagens.js` (cadastro de NPCs e missões).
- `docs/NARRATIVA.md` e `docs/MISSOES_E_LOCAIS.md`.
- Já existem: casa de farinha e armazém com interior interativo, atividade de pesca com lançamento, fisgada e escolha de guardar ou devolver, pavilhão central com bancos e vegetação, placa de entrada da comunidade, fandango animado, cachorro, trilha da mata, seta de missão, caderno e inventário.
- Restrições:

- Respeitar o `AGENTS.md`.
- Conteúdo cultural novo deve ficar marcado como "a validar" em `dados/`.
- A opção de reduzir movimento deve pausar as novas animações.
- Manter o pixel art sem suavização.
- Não quebrar a persistência do progresso no navegador.

## Prioridade 1: Correções e usabilidade

**1. Cabelo transparente (bug visual)**

- Corrigir em `js/sprites.js` a geração do cabelo do personagem, que fica transparente.
- Verificar as 8 combinações de cabelo, pele e roupa, tanto na criação quanto no jogo.
- Pistas prováveis: alpha, máscara de cor ou camada de cabelo sem preenchimento.
- Aceite: cabelo opaco em todas as direções e animações de caminhada.

**2. Usabilidade em celular: câmera muito distante**

- Aproximar o zoom da câmera do Canvas em telas pequenas, sem esticar os pixels (escala inteira).
- Ajustar o enquadramento em `js/mundo.js` ou `js/main.js` para retrato e paisagem.
- Revisar o tamanho dos controles de toque, textos e diálogos nessas telas.
- Aceite: em ~360–412px de largura, personagem, NPCs e placas legíveis, com a seta de missão ainda visível na borda.

**3. Bordas do mapa arredondadas + placa de limite**

- Suavizar os cantos do mapa: tiles de transição arredondados nas quinas, em vez de recorte reto.
- Adicionar placas de limite, como "Limite da vila", seguindo o padrão da placa de entrada que já existe. (Entendi "um lado" como borda/limite do mapa. Se for outra coisa, ajustar.)
- Usar o nome de um lugar real da localização caiçara como nome da placa e registrar em `docs/MISSOES_E_LOCAIS.md` como "a validar".

## Prioridade 2: Pesca, mar e píer

**4. Píer nomeado e área de pesca**

- Criar ou renomear um local específico de pesca como píer, com placa identificadora, em `MAPA_DECORACOES`.
- Atualizar as referências em `docs/MISSOES_E_LOCAIS.md` e `dados/conteudo.js`.

**5. Varas e iscas**

- Redesenhar a vara em `sprites.js`: haste, **linha de pesca visível** e **isca/anzol** na ponta.
- Mostrar a linha caindo na água no lançamento e a isca na fisgada.

**6. Cesto de peixes**

- Ao pegar o peixe, ele vai para um **cesto** (sprite próprio, visível perto do jogador ou na interface).
- Integrar com a escolha de guardar ou devolver, que já atualiza indicadores e inventário, e mostrar a contagem no caderno.

**7. Animação de devolver o peixe**

- Se o jogador devolver, o peixe sai do cesto em arco e cai na água, com respingo.
- Manter o efeito sonoro em `js/som.js` e pausar a animação se "reduzir movimento" estiver ativo.

**8. Peixes pulando na praia**

- Peixes pequenos saltando no mar, em intervalos aleatórios, como animação de cenário (loop leve, sem afetar a colisão).

**9. Barco**

- Corrigir o design em `sprites.js`: hoje dá para atravessar o barco e há uma **sombra verde** feia.
- Adicionar colisão em `EDIFICIOS` ou na lista de bloqueios, e trocar a sombra por uma sombra suave e coerente com a água.

**10. Animação de remar e pescar no barco**

- Criar animação do personagem remando e, depois, pescando a bordo, usando o estado e as transições de caminhada que já existem.

**11. Fauna costeira**

- **Lagarto** e **caranguejo** perto do mar, com movimentos curtos e aleatórios. ("carangueiro" no documento parece ser caranguejo; confirmar.)
- **Pássaros** perto do píer, pousando e voando. Podem ficar parados no píer e, de vez em quando, levantar voo.

## Prioridade 3: Novos locais do cenário

**12. Praça com coreto**

- Evoluir o pavilhão central existente para uma **praça**: bancos, árvores ao redor e **coreto ao centro**.
- Manter a iluminação de apoio e o caminho até as casas e a praia.

**13. Igreja**

- Adicionar o edifício com fachada, porta e entrada, registrado em `EDIFICIOS`. Um interior simples é opcional.
- Posicionar ao lado da praça, sem bloquear os caminhos atuais.

**14. Peixaria**

- Nova construção com fachada e interação simples, no estilo do mercadinho e do armazém.
- **Sem compra e venda**, pois o `README` diz que a economia depende de validação comunitária.

**15. Escola**

- Edifício novo com interior interativo, usando o mesmo padrão da casa de farinha.

## Prioridade 4: Conteúdo educativo e missões

**16. Casa de farinha mais didática (reformular a missão)**

- Hoje a missão é "ordenar etapas". Trocar por uma sequência prática dentro da casa: o personagem **entra e executa cada etapa** (mão na massa) com animação por etapa.
- Incluir um **instrutor (NPC)** que guia, explica e corrige sem punição.
- Reaproveitar o interior e as etapas já em `dados/conteudo.js`, mantendo-as marcadas como "a validar".
- Aceite: cada etapa tem animação própria, fala do instrutor e retomada de progresso.

**17. Missão de fandango e instrumentos**

- Missão em duas partes: **aprender a dançar** (passos guiados por NPC) e **aprender a tocar** os instrumentos (mini-interação simples, sem pontuação punitiva).
- Integrar com o fandango animado e com a etapa "encontrar instrumentos" que já existem.
- Cadastrar em `dados/personagens.js` e `dados/conteudo.js`, com conteúdo "a validar".

**18. Aula na escola sobre os caiçaras**

- A professora explica **o que são os caiçaras**, e uma **imagem do personagem imaginando** aparece (balão de pensamento ou cena ilustrada) enquanto ela fala.
- Textos curtos, em linguagem adequada para crianças e adolescentes, e "a validar" com a comunidade.

**19. NPCs no estilo aldeões do Minecraft**

- Reformular os NPCs: silhuetas e proporções mais simples e expressivas, rotinas por horário (já existem), falas curtas e um som característico ao interagir.
- Manter a escala revisada, o cadastro em `dados/personagens.js` e as opções de acessibilidade.

## Ordem sugerida de implementação

1. Itens 1, 2 e 3 (bugs e celular).
2. Itens 9, 5, 6 e 7 (barco e pesca, com mesma base visual).
3. Itens 4, 8, 10 e 11 (animações de cenário).
4. Itens 12 a 15 (novos locais).
5. Itens 16 a 19 (missões e conteúdo).

## Regras gerais para o Codex

- Antes de cada item, localizar o código real e listar os arquivos que vai alterar.
- Não alterar o que já funciona, especialmente a persistência e a navegação.
- Todo texto cultural novo vai em `dados/` com a marca "a validar", e as decisões entram em `docs/`.
- Testar em desktop e em celular, retrato e paisagem, com "reduzir movimento" ligado e desligado.
