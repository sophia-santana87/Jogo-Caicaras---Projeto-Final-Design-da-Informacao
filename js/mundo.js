// Cabeçalho de autoria: Projeto final extensionista do curso de Gestão da Informação da UFPR.
// Equipe: Bianca Vasconcelos de Lima; Katryni Haaby dos Santos Bueno; Luana Harmatiuk Guimarães; Sophia Santana da Silva; Vanessa da Silva Costa.
// Disciplina: Design da Informação • 2026.

import { PERSONAGENS, MISSOES_CADASTRO, ROTINAS_VILA } from '../dados/personagens.js?v=28';

export const MAPA_LARGURA = 48;
export const MAPA_ALTURA = 32;
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

const TIPOS_DE_EDIFICIO = new Set(['casa', 'casaFarinha', 'casaRural', 'pavilhao', 'barraca', 'mercadinho']);

export const POSICOES_EDIFICIOS = {
  'casa-de-farinha': { x: 26, y: 7, tipo: 'casaFarinha' },
  'casa-rural': { x: 43, y: 8, tipo: 'casaRural' },
  escola: { x: 11, y: 12, tipo: 'casa' },
  capela: { x: 17, y: 14, tipo: 'casa' },
  armazem: { x: 23, y: 14, tipo: 'casa' },
  'pavilhao-fandango': { x: 29, y: 14, tipo: 'pavilhao' },
  'casa-4': { x: 35, y: 14, tipo: 'casa' },
  'casa-5': { x: 43, y: 14, tipo: 'casa' },
  'casa-6': { x: 13, y: 18, tipo: 'casa' },
  'casa-7': { x: 31, y: 20, tipo: 'casa' },
  'casa-8': { x: 16, y: 24, tipo: 'casa' },
  mercadinho: { x: 24, y: 24, tipo: 'mercadinho' },
  'casa-9': { x: 33, y: 26, tipo: 'casa' },
  barraca: { x: 42, y: 24, tipo: 'barraca' }
};

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
for (let x = 19; x <= 28; x += 1) MAPA[15][x] = 'caminho';
for (let y = 21; y <= 24; y += 1) {
  for (let x = 35; x <= 39; x += 1) MAPA[y][x] = 'lagoa';
}

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

const ESTRADA_RURAL = [
  { x: 43, y: 10 }, { x: 44, y: 10 }, { x: 44, y: 11 }, { x: 43, y: 11 },
  { x: 43, y: 12 }, { x: 42, y: 12 }, { x: 42, y: 13 }, { x: 42, y: 14 },
  { x: 41, y: 14 }, { x: 41, y: 15 }, { x: 41, y: 16 }, { x: 42, y: 16 },
  { x: 42, y: 17 }, { x: 42, y: 18 }, { x: 42, y: 19 }, { x: 41, y: 19 },
  { x: 40, y: 19 }, { x: 39, y: 19 }, { x: 38, y: 19 }, { x: 37, y: 19 },
  { x: 37, y: 18 }
];
ESTRADA_RURAL.forEach(({ x, y }) => {
  MAPA[y][x] = 'caminho';
});

for (const [y, inicio, fim] of [[15, 8, 40], [17, 10, 38], [18, 10, 39], [21, 14, 34]]) {
  for (let x = inicio; x <= fim; x += 1) {
    if (MAPA[y][x] === 'vila' || MAPA[y][x] === 'caminho') {
      MAPA[y][x] = 'caminho';
    }
  }
}
MAPA[19][22] = 'caminho';
MAPA[20][22] = 'caminho';

export const NPCS = [
  { ...PERSONAGENS['dona-cida'], x: 21, y: 10 },
  { ...PERSONAGENS.nelson, x: 13, y: 26 },
  { ...PERSONAGENS.jaque, x: 34, y: 27 },
  { ...PERSONAGENS.tiao, x: 29, y: 15 },
  { ...PERSONAGENS.rita, x: 39, y: 25 },
  { ...PERSONAGENS.davi, x: 11, y: 23 },
  { ...PERSONAGENS.erveiro, x: 40, y: 5 }
];

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
  const temInterior = tipo === 'casaFarinha' || id === 'armazem' || id === 'mercadinho';
  return [{ id, tipo, x, y, largura: 3, altura: 2, entrada: { x, y: y + 1 }, temInterior }];
}));

export const PONTOS_DE_OBSERVACAO = {
  mare: { x: 13, y: 26 },
  vento: { x: 15, y: 28 },
  ceu: { x: 16, y: 26 },
  'manejo-mata': { x: 40, y: 6 }
};

export const PONTOS_PESCA = [
  { x: 13, y: 28, tipo: 'mar', agua: { x: 13, y: 29 } },
  { x: 34, y: 23, tipo: 'lagoa', agua: { x: 35, y: 23 } },
  { x: 40, y: 23, tipo: 'lagoa', agua: { x: 39, y: 23 } }
];

export function getNPCsNoHorario(horario) {
  const rotina = ROTINAS_VILA[horario] || {};
  return NPCS.map((npc) => ({ ...npc, ...(rotina[npc.id] || {}) }));
}

export const MAPA_DECORACOES = [
  { tipo: 'placa-limite', x: 1, y: 11, nome: 'Limite da Ponta Oeste', validar: true },
  { tipo: 'placa-limite', x: 46, y: 11, nome: 'Limite da Ponta Oeste', validar: true },
  { tipo: 'placa-limite', x: 1, y: 25, nome: 'Limite da Ponta Oeste', validar: true },
  { tipo: 'placa-limite', x: 46, y: 25, nome: 'Limite da Ponta Oeste', validar: true },
  { tipo: 'forno', x: 23, y: 8 },
  { tipo: 'prensa', x: 22, y: 8 },
  { tipo: 'peneira', x: 22, y: 9 },
  { tipo: 'rede', x: 12, y: 28 },
  { tipo: 'bandeira', x: 15, y: 28 },
  { tipo: 'luminaria', x: 24, y: 12 },
  { tipo: 'luminaria', x: 9, y: 18 },
  { tipo: 'luminaria', x: 26, y: 18 },
  { tipo: 'luminaria', x: 39, y: 18 },
  { tipo: 'luminaria', x: 28, y: 12 },
  { tipo: 'luminaria', x: 36, y: 12 },
  { tipo: 'banco', x: 27, y: 12 },
  { tipo: 'banco', x: 35, y: 12 },
  { tipo: 'placa', x: 18, y: 13 },
  { tipo: 'planta-medicinal-a', x: 38, y: 4 },
  { tipo: 'planta-medicinal-b', x: 45, y: 4 },
  { tipo: 'planta-medicinal-c', x: 46, y: 6 },
  { tipo: 'arvore', x: 40, y: 3 },
  { tipo: 'arbusto', x: 47, y: 5 },
  { tipo: 'arbusto', x: 40, y: 5 },
  { tipo: 'arbusto', x: 47, y: 4 },
  { tipo: 'viola', x: 26, y: 17 },
  { tipo: 'rabeca', x: 28, y: 17 },
  { tipo: 'adufo', x: 30, y: 17 },
  { tipo: 'placa', x: 40, y: 24 },
  { tipo: 'peixe', x: 41, y: 25 },
  { tipo: 'biju', x: 42, y: 25 },
  { tipo: 'cataia', x: 43, y: 25 },
  { tipo: 'lixeiraOrganica', x: 41, y: 24 },
  { tipo: 'lixeiraReciclavel', x: 43, y: 24 },
  { tipo: 'bandeira', x: 30, y: 7 },
  { tipo: 'bandeira', x: 38, y: 7 },
  { tipo: 'flor', x: 30, y: 11 },
  { tipo: 'flor', x: 38, y: 11 },
  { tipo: 'arbusto', x: 29, y: 9 },
  { tipo: 'arbusto', x: 38, y: 10 },
  { tipo: 'flor', x: 39, y: 12 },
  { tipo: 'pedra', x: 40, y: 11 },
  { tipo: 'capim', x: 44, y: 13 },
  { tipo: 'cerca', x: 45, y: 11 },
  { tipo: 'cerca', x: 45, y: 12 },
  { tipo: 'cerca', x: 44, y: 13 },
  { tipo: 'flor', x: 40, y: 14 },
  { tipo: 'pedra', x: 40, y: 15 },
  { tipo: 'arbusto', x: 39, y: 16 },
  { tipo: 'capim', x: 37, y: 17 },
  { tipo: 'flor', x: 30, y: 20 },
  { tipo: 'arbusto', x: 30, y: 23 },
  { tipo: 'pedra', x: 38, y: 22 },
  { tipo: 'flor', x: 39, y: 20 },
  { tipo: 'cerca', x: 41, y: 25 },
  { tipo: 'cerca', x: 44, y: 24 },
  { tipo: 'capim', x: 45, y: 23 },
  { tipo: 'capim', x: 34, y: 21 },
  { tipo: 'capim', x: 40, y: 21 },
  { tipo: 'arbusto', x: 8, y: 17 },
  { tipo: 'flor', x: 9, y: 16 },
  { tipo: 'arbusto', x: 25, y: 19 },
  { tipo: 'flor', x: 36, y: 20 },
  { tipo: 'arvore', x: 6, y: 17 },
  { tipo: 'arbusto', x: 9, y: 22 },
  { tipo: 'flor', x: 11, y: 22 },
  { tipo: 'arbusto', x: 39, y: 16 },
  { tipo: 'pedra', x: 34, y: 24 },
  { tipo: 'flor', x: 40, y: 24 }
];

export const CENA_FANDANGO = { x: 34, y: 9 };

export const DANCARINOS_FANDANGO = [
  { x: 32, y: 9, estilo: 'homem' },
  { x: 33, y: 7.5, estilo: 'mulher' },
  { x: 35, y: 7.5, estilo: 'homem' },
  { x: 36, y: 9, estilo: 'mulher' },
  { x: 35, y: 10.5, estilo: 'homem' },
  { x: 33, y: 10.5, estilo: 'mulher' }
];

export const MUSICOS_FANDANGO = [
  { x: 39, y: 8, instrumento: 'viola' },
  { x: 39, y: 9.5, instrumento: 'rabeca' },
  { x: 39, y: 11, instrumento: 'adufo' }
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

export const AVES_POUSADAS = [
  { x: 8.5, y: 3.2 },
  { x: 17.5, y: 3.5 },
  { x: 44.2, y: 5.2 },
  { x: 45.2, y: 11.2 }
];

export function isPassable(x, y) {
  if (x < 0 || y < 0 || x >= MAPA_LARGURA || y >= MAPA_ALTURA) return false;
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

export function findPath(start, goal) {
  if (!isPassable(start.x, start.y) || !isPassable(goal.x, goal.y)) return [];

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
      if (!visited.has(key) && isPassable(next.x, next.y)) {
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
