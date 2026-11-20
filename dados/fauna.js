// Fauna cenográfica e fichas de observação; posições fixas tornam o conjunto determinístico.
export const ESPECIES_FAUNA = {
  caranguejo: {
    nome: 'Caranguejo',
    ficha: 'Crustáceo observado na faixa costeira. Espécie, época e comportamento locais precisam de confirmação.',
    validar: true
  },
  lagarto: {
    nome: 'Lagarto',
    ficha: 'Réptil observado em áreas de terra e pedras. A identificação local precisa de confirmação.',
    validar: true
  },
  passaro: {
    nome: 'Pássaro',
    ficha: 'Ave observada perto da água e do píer. Espécie e hábitos locais precisam de confirmação.',
    validar: true
  }
};

export const FAUNA = [
  ...[
    [2, 28], [6, 27], [10, 28], [17, 27], [23, 28], [30, 27], [39, 28], [46, 27]
  ].map(([x, y], indice) => ({ id: `caranguejo-${indice + 1}`, especieId: 'caranguejo', x, y })),
  ...[
    [33, 21], [34, 24], [40, 21], [41, 23]
  ].map(([x, y], indice) => ({ id: `lagarto-${indice + 1}`, especieId: 'lagarto', x, y })),
  ...[
    [13, 28], [14, 29], [37, 22], [38, 23], [36, 24]
  ].map(([x, y], indice) => ({ id: `passaro-${indice + 1}`, especieId: 'passaro', x, y }))
];
