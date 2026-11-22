// Cabeçalho de autoria: Projeto final do curso de Gestão da Informação da UFPR.
// Equipe: Bianca Vasconcelos de Lima; Katryni Haaby dos Santos Bueno; Luana Harmatiuk Guimarães; Sophia Santana da Silva; Vanessa da Silva Costa.
// Disciplina: Design da Informação • 2026.

import { PERSONAGENS, MISSOES_CADASTRO, ROTINAS_VILA } from '../dados/personagens.js?v=67';

export const MAPA_LARGURA = 48;
export const MAPA_ALTURA = 38;
export const POSICAO_INICIAL_JOGADOR = { x: 14, y: 23 };
export const POSICAO_INICIAL_CACHORRO = { x: 10, y: 21 };

const TIPOS_DE_TERRENO = {
  '^': 'mato',
  r: 'roca',
  f: 'plantacao',
  '.': 'grama',
  g: 'vila',
  '-': 'caminho',
  'l': 'lagoa',
  H: 'casa',
  T: 'escola',
  A: 'capela',
  Q: 'peixaria',
  M: 'mercadinho',
  F: 'casaFarinha',
  S: 'saco',
  P: 'pavilhao',
  B: 'barraca',
  C: 'canoa',
  s: 'ceu',
  '=': 'praia',
  w: 'madeira',
  '~': 'mar'
};

const DESENHO_MAPA = [
  'ssssssssssssssssssssssssssssssssssssssssssssssss',
  'ssssssssssssssssssssssssssssssssssssssssssssssss',
  'ssssssssssssssssssssssssssssssssssssssssssssssss',
  '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
  '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
  '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
  '^^^^^^^^^^^^^^^^^^rrrrrrrrr^^^^^^^^^^^^^^^^^^^^^',
  '^^^^^^^^^^^^^^^^^^rrfffffrF^^^^^^^^^^^^^^^^^^^^^',
  '^^^^^^^^^^^^^^^^^^rrfffffrr^^^^^^^^^^^^^^^^^^^^^',
  '^^^^^^^^^^^^^^^^^^rrfffffSS^^^^^^^^^^^^^^^^^^^^^',
  '..................rrrr-rrrr.....................',
  '......................-.........................',
  'gggggggggggggggggggggg-ggggggggggggggggggggggggg',
  'gggggggggggggggggggggg-ggggggggggggggggggggggggg',
  'gggggggggggHgggHgggHgg-ggggPgggggHgggHgggggggggg',
  'gggggggggggggggggggggg-------ggggggggggggggggggg',
  'gggggggggggggHgggHggg-gggggggggHgggHgggggggggggg',
  'gggggggggggggggggggggB-ggggggggggggggggggggggggg',
  'gggggggggggg----------ggg------------ggggggggggg',
  'gggggggggggggg-ggggggggggggggggggggggggggggggggg',
  'gggggggggggggg-gHgggHggggggHgggHgggggggggggggggg',
  'gggggggggggggg-ggggggggggggggggggggggggggggggggg',
  'gggggggggggggg-ggggggggggggggggggggggggggggggggg',
  'gggggggggggggg---------ggggggggggggggggggggggggg',
  '==============-=================================',
  '==============-=================================',
  '==============-=================================',
  '==============-=================================',
  '========C=====-======C==========================',
  '~~~~~~~~~~~~~~w~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~w~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
];

if (DESENHO_MAPA.length !== MAPA_ALTURA || DESENHO_MAPA.some((linha) => linha.length !== MAPA_LARGURA)) {
  throw new Error('O desenho do mapa precisa respeitar as dimensões declaradas.');
}

export const MAPA = DESENHO_MAPA.map((linha) => Array.from(linha, (simbolo) => {
  const terreno = TIPOS_DE_TERRENO[simbolo];
  if (!terreno) {
    throw new Error(`Símbolo de terreno desconhecido no mapa: ${simbolo}`);
  }
  return terreno;
}));

const TIPOS_DE_EDIFICIO = new Set(['casa', 'casaFarinha', 'casaRural', 'pavilhao', 'casaMusical', 'barraca', 'mercadinho', 'escola', 'capela', 'peixaria']);

export const POSICOES_EDIFICIOS = {
  escola: { x: 11, y: 10, tipo: 'escola' },
  capela: { x: 18, y: 10, tipo: 'capela' },
  'casa-de-farinha': { x: 25, y: 10, tipo: 'casaFarinha' },
  armazem: { x: 32, y: 13, tipo: 'casa' },
  mercadinho: { x: 21, y: 16, tipo: 'mercadinho' },
  'casa-musical': { x: 29, y: 16, tipo: 'casaMusical' },
  'casa-fechada': { x: 36, y: 16, tipo: 'casa' },
  peixaria: { x: 9, y: 26, tipo: 'peixaria' }
};
export const PRACA_CENTRAL = { nome: 'Praça central', x: 17, y: 11, largura: 7, altura: 5, coreto: { x: 20, y: 13 } };
export const HORTA_CENTRAL = {
  nome: 'Horta da vila', x: 12, y: 11, largura: 5, altura: 5, cuidadora: { x: 15, y: 14 },
  canteiros: [
    { x: 13, y: 13, variante: 0 },
    { x: 14, y: 13, variante: 1 },
    { x: 15, y: 13, variante: 2 }
  ]
};
export const ENTRADA_COMUNIDADE = { x: 13, y: 20, nome: 'Entrada da comunidade' };

for (let y = 0; y < MAPA_ALTURA; y += 1) {
  for (let x = 0; x < MAPA_LARGURA; x += 1) {
    if (TIPOS_DE_EDIFICIO.has(MAPA[y][x])) MAPA[y][x] = 'grama';
  }
}
Object.values(POSICOES_EDIFICIOS).forEach((posicao) => {
  MAPA[posicao.y][posicao.x] = posicao.tipo;
});
MAPA[9][43] = 'caminho';
MAPA[5][39] = 'grama';
MAPA[6][39] = 'grama';

function aplicarCaminhosDeclarativos() {
  // Avenida principal reta e dois tiles de largura, à frente das portas.
  for (let y = 17; y <= 18; y += 1) {
    for (let x = 10; x <= 38; x += 1) {
      if (!TIPOS_DE_EDIFICIO.has(MAPA[y][x])) MAPA[y][x] = 'caminho';
    }
  }

  // Rua transversal da casa de farinha.
  for (let y = 11; y <= 16; y += 1) {
    MAPA[y][25] = 'caminho';
  }

  // Rua transversal até o píer.
  for (let y = 19; y <= 28; y += 1) MAPA[y][13] = 'caminho';

  // Rua transversal até a lagoa.
  for (let y = 19; y <= 23; y += 1) MAPA[y][37] = 'caminho';

  // Trilha reta da vila até o Terreiro, terminando na borda da clareira.
  for (let x = 10; x <= 18; x += 1) MAPA[18][x] = 'caminho';
  for (let x = 4; x <= 10; x += 1) MAPA[18][x] = 'grama';

  // Trilha da mata com no máximo duas curvas.
  for (let y = 6; y <= 16; y += 1) MAPA[y][40] = 'caminho';
  for (let y = 5; y <= 6; y += 1) MAPA[y][40] = 'caminho';
  for (let y = PRACA_CENTRAL.y; y < PRACA_CENTRAL.y + PRACA_CENTRAL.altura; y += 1) {
    for (let x = PRACA_CENTRAL.x; x < PRACA_CENTRAL.x + PRACA_CENTRAL.largura; x += 1) MAPA[y][x] = 'caminho';
  }
  const eixoPraca = PRACA_CENTRAL.coreto.x;
  for (let y = PRACA_CENTRAL.y + PRACA_CENTRAL.altura; y <= 18; y += 1) MAPA[y][eixoPraca] = 'caminho';
  for (let x = 9; x <= 13; x += 1) MAPA[27][x] = 'caminho';
}

aplicarCaminhosDeclarativos();
[36, 37, 38].forEach((x) => { MAPA[21][x] = 'lagoa'; });
[35, 36, 37, 38, 39].forEach((x) => { MAPA[22][x] = 'lagoa'; });
[34, 35, 36, 37, 38, 39, 40].forEach((x) => { MAPA[23][x] = 'lagoa'; });
[35, 36, 37, 38, 39, 40].forEach((x) => { MAPA[24][x] = 'lagoa'; });
[36, 37, 38, 39].forEach((x) => { MAPA[25][x] = 'lagoa'; });

for (let y = 6; y <= 12; y += 1) {
  for (let x = 29; x <= 38; x += 1) {
    MAPA[y][x] = 'grama';
  }
}

for (let y = 3; y <= 5; y += 1) {
  for (let x = 40; x <= 47; x += 1) MAPA[y][x] = 'grama';
}
for (let x = 39; x <= 44; x += 1) MAPA[6][x] = 'caminho';
MAPA[5][43] = 'caminho';
MAPA[4][43] = 'caminho';

// Ruas antigas em zigue-zague removidas: os acessos agora sao declarativos acima.

export const NPCS = [
  { ...PERSONAGENS['dona-cida'], x: 21, y: 10 },
  { ...PERSONAGENS.nelson, x: 13, y: 26 },
  { ...PERSONAGENS.jaque, x: 34, y: 27 },
  { ...PERSONAGENS.tiao, x: 29, y: 15 },
  { ...PERSONAGENS.rita, x: 39, y: 26 },
  { ...PERSONAGENS.davi, x: 11, y: 23 },
  { ...PERSONAGENS.erveiro, x: 40, y: 5 },
  { ...PERSONAGENS['hortela-da-vila'], ...HORTA_CENTRAL.cuidadora }
];

function gerarCercaHorta() {
  const { x, y, largura, altura } = HORTA_CENTRAL;
  const cerca = [];
  for (let dx = 0; dx < largura; dx += 1) {
    if (dx < Math.floor(largura / 2) || dx > Math.floor(largura / 2)) {
      cerca.push({ tipo: 'cerca', x: x + dx, y: y + altura - 1 });
    }
    cerca.push({ tipo: 'cerca', x: x + dx, y });
  }
  for (let dy = 1; dy < altura - 1; dy += 1) {
    cerca.push({ tipo: 'cerca', x, y: y + dy }, { tipo: 'cerca', x: x + largura - 1, y: y + dy });
  }
  cerca.push({ tipo: 'porteira', x: x + Math.floor(largura / 2), y: y + altura - 1 });
  return cerca;
}

const npcPorId = new Map(NPCS.map((npc) => [npc.id, npc]));
export const MISSION_POINTS = Object.fromEntries(
  Object.entries(MISSOES_CADASTRO).map(([id, missao]) => {
    const npc = npcPorId.get(missao.npcId);
    return [id, { x: npc.x + missao.marcador.x, y: npc.y + missao.marcador.y }];
  })
);

const nomePorPosicao = new Map(
  Object.entries(POSICOES_EDIFICIOS).map(([id, posicao]) => [`${posicao.x},${posicao.y}`, id])
);

export const EDIFICIOS = MAPA.flatMap((linha, y) => linha.flatMap((tipo, x) => {
  if (!TIPOS_DE_EDIFICIO.has(tipo)) return [];
  const id = nomePorPosicao.get(`${x},${y}`);
  if (!id) return [];
  const temInterior = tipo === 'casaFarinha' || id === 'armazem' || id === 'mercadinho' || id === 'casa-musical' || id === 'escola';
  const enterable = temInterior;
  return [{ id, tipo, x, y, largura: 3, altura: 2, entrada: { x, y: y + 1 }, temInterior, enterable }];
}));

export const PONTOS_DE_OBSERVACAO = {
  mare: { x: 14, y: 26 },
  vento: { x: 16, y: 28 },
  ceu: { x: 16, y: 26 },
  'manejo-mata': { x: 40, y: 6 }
};

export const PONTOS_ATRACACAO = [
  { x: 13, y: 28, agua: { x: 13, y: 29 } }
];

export const PONTOS_PESCA = [
  { x: 13, y: 28, tipo: 'mar', agua: PONTOS_ATRACACAO[0].agua },
  { x: 13, y: 31, tipo: 'mar' },
  { x: 18, y: 33, tipo: 'mar' },
  { x: 10, y: 36, tipo: 'mar' },
  { x: 34, y: 23, tipo: 'lagoa', agua: { x: 35, y: 23 } },
  { x: 40, y: 23, tipo: 'lagoa', agua: { x: 39, y: 23 } }
];
export const PONTOS_EMBARQUE = MAPA.flatMap((linha, y) => linha.flatMap((terreno, x) => (
  terreno === 'canoa' && MAPA[y + 1]?.[x] === 'mar' ? [{ x, y, agua: { x, y: y + 1 } }] : []
)));

export function getNPCsNoHorario(horario) {
  const rotina = ROTINAS_VILA[horario] || {};
  return NPCS.map((npc) => ({ ...npc, ...(rotina[npc.id] || {}) }));
}

export const CENA_FANDANGO = { x: 7, y: 18 };

export const MAPA_DECORACOES = [
  { tipo: 'barraca', x: 42, y: 24, nome: 'Barraca da praia' },
  { tipo: 'barraca', x: 6, y: 27, nome: 'Barraca da vila' },
  { tipo: 'vara-pesca', x: 12, y: 27, nome: 'Vara de pesca' },
  { tipo: 'forno', x: 23, y: 8 },
  { tipo: 'prensa', x: 22, y: 8 },
  { tipo: 'peneira', x: 22, y: 9 },
  { tipo: 'rede', x: 12, y: 28 },
  { tipo: 'bandeira', x: 15, y: 28 },
  { tipo: 'luminaria', x: 24, y: 12 },
  { tipo: 'luminaria', x: 26, y: 18 },
  { tipo: 'luminaria', x: 39, y: 18 },
  { tipo: 'luminaria', x: 28, y: 12 },
  { tipo: 'luminaria', x: 36, y: 12 },
  { tipo: 'banco', x: 27, y: 12 },
  { tipo: 'banco', x: 35, y: 12 },
  { tipo: 'coreto', ...PRACA_CENTRAL.coreto },
  { tipo: 'banco', x: 18, y: 12 },
  { tipo: 'banco', x: 22, y: 12 },
  { tipo: 'banco', x: 18, y: 14 },
  { tipo: 'banco', x: 22, y: 14 },
  { tipo: 'arvore', x: 17, y: 11 },
  { tipo: 'arvore', x: 23, y: 11 },
  { tipo: 'arvore', x: 17, y: 15 },
  { tipo: 'arvore', x: 23, y: 15 },
  { tipo: 'luminaria', x: 18, y: 16 },
  { tipo: 'luminaria', x: 22, y: 16 },
  { tipo: 'luminaria', x: 12, y: 18 },
  { tipo: 'luminaria', x: 20, y: 18 },
  { tipo: 'luminaria', x: 31, y: 18 },
  { tipo: 'luminaria', x: 35, y: 18 },
  ...gerarCercaHorta(),
  ...HORTA_CENTRAL.canteiros.map((canteiro) => ({ tipo: 'canteiro', ...canteiro })),
  { tipo: 'planta-medicinal-a', x: 38, y: 4 },
  { tipo: 'planta-medicinal-b', x: 45, y: 4 },
  { tipo: 'planta-medicinal-c', x: 42, y: 5 },
  { tipo: 'arvore', x: 40, y: 3 },
  { tipo: 'arbusto', x: 47, y: 5 },
  { tipo: 'arbusto', x: 47, y: 4 },
  { tipo: 'placa', x: 14, y: 27, nome: 'Pescar com cuidado' },
  { tipo: 'lixeiraOrganica', x: 3, y: 24 },
  { tipo: 'lixeiraReciclavel', x: 4, y: 24 },
  { tipo: 'vitoria-regia', x: 35, y: 22 },
  { tipo: 'junco', x: 40, y: 24 },
  { tipo: 'tronco', x: 35, y: 24 },
  { tipo: 'flor', x: 30, y: 11 },
  { tipo: 'flor', x: 38, y: 11 },
  { tipo: 'arbusto', x: 29, y: 9 },
  { tipo: 'arbusto', x: 38, y: 10 },
  { tipo: 'flor', x: 39, y: 12 },
  { tipo: 'pedra', x: 40, y: 11 },

  { tipo: 'cerca', x: 45, y: 11 },
  { tipo: 'cerca', x: 45, y: 12 },
  { tipo: 'cerca', x: 44, y: 13 },
  { tipo: 'flor', x: 40, y: 14 },
  { tipo: 'pedra', x: 40, y: 15 },
  { tipo: 'capim', x: 37, y: 17 },
  { tipo: 'flor', x: 30, y: 20 },
  { tipo: 'arbusto', x: 30, y: 23 },
  { tipo: 'flor', x: 39, y: 20 },
  { tipo: 'cerca', x: 44, y: 24 },
  { tipo: 'capim', x: 45, y: 23 },
  { tipo: 'capim', x: 34, y: 21 },
  { tipo: 'capim', x: 33, y: 23 },
  { tipo: 'pedra', x: 41, y: 23 },

  { tipo: 'capim', x: 40, y: 21 },
  { tipo: 'arbusto', x: 25, y: 19 },
  { tipo: 'flor', x: 36, y: 20 },
  { tipo: 'arbusto', x: 9, y: 22 },
  { tipo: 'flor', x: 11, y: 22 },
  { tipo: 'pedra', x: 34, y: 24 },
];

function gerarVegetacaoDeterministica() {
  const novos = [];
  const ocupados = new Set(MAPA_DECORACOES.map((item) => `${item.x},${item.y}`));
  const proibidos = new Set([
    ...EDIFICIOS.map((item) => `${item.x},${item.y}`),
    ...PONTOS_PESCA.map((item) => `${item.x},${item.y}`),
    `${CENA_FANDANGO.x},${CENA_FANDANGO.y}`
  ]);

  let semente = 7321;
  const sorteio = (indice) => {
    semente = (semente * 1103515245 + 12345 + indice * 101) >>> 0;
    return semente % 1000;
  };

  for (let indice = 0; novos.length < 24 && indice < 260; indice += 1) {
    const x = 4 + sorteio(indice * 2) % 43;
    const y = 3 + sorteio(indice * 2 + 1) % 24;
    const chave = `${x},${y}`;
    const terreno = tileAt(x, y);
    if (ocupados.has(chave) || proibidos.has(chave)) continue;
    if (Math.abs(x - CENA_FANDANGO.x) <= 4 && Math.abs(y - CENA_FANDANGO.y) <= 4) continue;
    if (terreno === 'lagoa' || terreno === 'mar' || terreno === 'mato' && y > 12) continue;
    if (MAPA_DECORACOES.some((item) => Math.abs(item.x - x) + Math.abs(item.y - y) < 2)) continue;

    let pertoDeCaminho = false;
    for (let dy = -2; dy <= 2 && !pertoDeCaminho; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        if (tileAt(x + dx, y + dy) === 'caminho') pertoDeCaminho = true;
      }
    }
    if (pertoDeCaminho) continue;

    const tipo = y >= 24 && terreno === 'praia'
      ? 'palmeira'
      : (sorteio(indice + 50) % 4 === 0 ? 'palmeira' : 'arvore');
    novos.push({ tipo, x, y, gerar: true });
    ocupados.add(chave);
  }

  return novos;
}

MAPA_DECORACOES.push(...gerarVegetacaoDeterministica());
MAPA_DECORACOES.push({ tipo: 'tronco-caido', x: 43, y: 7, nome: 'Tronco caído' });

export const DANCARINOS_FANDANGO = [
  { x: 5, y: 18, estilo: 'homem' },
  { x: 6, y: 16.5, estilo: 'mulher' },
  { x: 8, y: 16.5, estilo: 'homem' },
  { x: 9, y: 18, estilo: 'mulher' },
  { x: 8, y: 19.5, estilo: 'homem' },
  { x: 6, y: 19.5, estilo: 'mulher' }
];

export const MUSICOS_FANDANGO = [
  { x: 10, y: 17, instrumento: 'viola' },
  { x: 10, y: 18.5, instrumento: 'rabeca' },
  { x: 10, y: 20, instrumento: 'adufo' }
];

export const PESSOAS_CENARIO = [
  {
    id: 'morador-1',
    caminho: [{ x: 17, y: 18 }, { x: 19, y: 18 }, { x: 20, y: 20 }, { x: 18, y: 21 }]
  },
  {
    id: 'morador-2',
    caminho: [{ x: 24, y: 12 }, { x: 25, y: 12 }, { x: 25, y: 15 }, { x: 24, y: 16 }]
  },
  {
    id: 'morador-3',
    caminho: [{ x: 42, y: 12 }, { x: 43, y: 14 }, { x: 43, y: 16 }, { x: 42, y: 17 }]
  }
];

export function isPassable(x, y, modo = 'pe') {
  if (x < 0 || y < 0 || x >= MAPA_LARGURA || y >= MAPA_ALTURA) return false;
  if (modo === 'canoa') return MAPA[y][x] === 'mar';
  if (MAPA[y][x] === 'mar' || MAPA[y][x] === 'lagoa' || MAPA[y][x] === 'ceu' || MAPA[y][x] === 'mato') return false;
  return !EDIFICIOS.some((edificio) => (
    x >= edificio.x - 1
    && x < edificio.x + edificio.largura - 1
    && y >= edificio.y - edificio.altura + 1
    && y <= edificio.y
  ));
}

export function tileAt(x, y) {
  return MAPA[y]?.[x] || 'vila';
}

export function findPath(start, goal, modo = 'pe') {
  if (!isPassable(start.x, start.y, modo) || !isPassable(goal.x, goal.y, modo)) return [];

  const queue = [{ x: start.x, y: start.y }];
  const visited = new Set([`${start.x},${start.y}`]);
  const previous = new Map();
  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
  ];

  while (queue.length) {
    const current = queue.shift();
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let cursor = current;
      while (cursor) {
        path.push({ x: cursor.x, y: cursor.y });
        cursor = previous.get(`${cursor.x},${cursor.y}`) || null;
      }
      return path.reverse();
    }

    for (const direction of directions) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const key = `${next.x},${next.y}`;
      if (!visited.has(key) && isPassable(next.x, next.y, modo)) {
        visited.add(key);
        previous.set(key, current);
        queue.push(next);
      }
    }
  }

  return [];
}

export function verificarEdificios(consoleRef = console) {
  const paresViolados = [];
  for (let i = 0; i < EDIFICIOS.length; i += 1) {
    for (let j = i + 1; j < EDIFICIOS.length; j += 1) {
      const a = EDIFICIOS[i];
      const b = EDIFICIOS[j];
      const aArea = { left: a.x - 1, right: a.x + a.largura - 2, top: a.y - a.altura + 1, bottom: a.y };
      const bArea = { left: b.x - 1, right: b.x + b.largura - 2, top: b.y - b.altura + 1, bottom: b.y };
      const horizontal = aArea.right < bArea.left
        ? bArea.left - aArea.right - 1
        : bArea.right < aArea.left ? aArea.left - bArea.right - 1 : 0;
      const vertical = aArea.bottom < bArea.top
        ? bArea.top - aArea.bottom - 1
        : bArea.bottom < aArea.top ? aArea.top - bArea.bottom - 1 : 0;
      const temSobreposicaoHorizontal = !(aArea.right < bArea.left || bArea.right < aArea.left);
      const temSobreposicaoVertical = !(aArea.bottom < bArea.top || bArea.bottom < aArea.top);
      if ((temSobreposicaoVertical && horizontal > 0 && horizontal < 3)
        || (temSobreposicaoHorizontal && vertical > 0 && vertical < 4)) {
        paresViolados.push({ a: a.id, b: b.id, horizontal, vertical });
      }
    }
  }

  const portas = EDIFICIOS.map((edificio) => edificio.entrada);
  const inacessiveis = portas.filter((porta) => !findPath(POSICAO_INICIAL_JOGADOR, porta).length);
  if (paresViolados.length) consoleRef.warn('EDIFICIOS: pares com espaço insuficiente', paresViolados);
  if (inacessiveis.length) consoleRef.warn('EDIFICIOS: portas fora do caminho', inacessiveis);
  return { paresViolados, inacessiveis };
}

export function distancia(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export function coordToPixels(x, y, scale = 1) {
  return { x: x * 16 * scale, y: y * 16 * scale };
}
