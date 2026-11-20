// Definicoes modulares das cenas internas. Coordenadas em tiles internos.
export const INTERIORES = {
  'casa-de-farinha': {
    titulo: 'Casa de farinha',
    largura: 14,
    altura: 9,
    spawn: { x: 7, y: 8 },
    saida: { x: 7, y: 8 },
    instrutor: { id: 'dona-cida', x: 12, y: 3 },
    objetos: [
      { id: 'descascar', nome: '1 · Descascar mandioca', x: 2, y: 4, tipo: 'farinha', etapa: 0 },
      { id: 'ralar', nome: '2 · Ralar mandioca', x: 4, y: 4, tipo: 'farinha', etapa: 1 },
      { id: 'prensar', nome: '3 · Prensar a massa', x: 6, y: 4, tipo: 'farinha', etapa: 2 },
      { id: 'peneirar', nome: '4 · Peneirar a massa', x: 8, y: 4, tipo: 'farinha', etapa: 3 },
      { id: 'torrar', nome: '5 · Torrar a farinha', x: 10, y: 4, tipo: 'farinha', etapa: 4 }
    ]
  },
  'casa-musical': {
    titulo: 'Casa musical do Mestre Tiao',
    largura: 14,
    altura: 9,
    spawn: { x: 7, y: 8 },
    saida: { x: 7, y: 8 },
    objetos: [
      { id: 'viola', nome: 'Viola de fandango', descricao: 'Instrumento de cordas; toque para conhecer o instrumento.', x: 3, y: 3, tipo: 'musica' },
      { id: 'rabeca', nome: 'Rabeca', descricao: 'Instrumento de arco; toque para conhecer o instrumento.', x: 6, y: 3, tipo: 'musica' },
      { id: 'adufo', nome: 'Adufo', descricao: 'Instrumento de percussão; toque para conhecer o instrumento.', x: 9, y: 3, tipo: 'musica' },
      { id: 'mestre-tiao', nome: 'Conversar com Mestre Tião', descricao: 'Converse sobre a importância da roda e da transmissão dos saberes.', x: 11, y: 6, tipo: 'ritmo' }
    ]
  },
  mercadinho: {
    titulo: 'Mercadinho',
    largura: 14,
    altura: 9,
    spawn: { x: 7, y: 8 },
    saida: { x: 7, y: 8 },
    objetos: [
      { id: 'farinha', nome: 'Farinha', descricao: 'Produto demonstrativo. Toque para observar.', x: 3, y: 3, tipo: 'produto' },
      { id: 'peixe-seco', nome: 'Peixe seco', descricao: 'Produto demonstrativo. Toque para observar.', x: 6, y: 3, tipo: 'produto' },
      { id: 'artesanato', nome: 'Artesanato', descricao: 'Peça demonstrativa; autoria e contexto devem ser reconhecidos.', x: 9, y: 3, tipo: 'produto' },
      { id: 'frutas', nome: 'Frutas da vila', descricao: 'Produto demonstrativo; espécies e época dependem do contexto local.', x: 11, y: 5, tipo: 'produto' }
    ]
  },
  armazem: {
    titulo: 'Armazem da vila',
    largura: 14,
    altura: 9,
    spawn: { x: 7, y: 8 },
    saida: { x: 7, y: 8 },
    objetos: [
      { id: 'farinha', nome: 'Farinha', descricao: 'Farinha guardada em sacos para uso e troca.', x: 3, y: 3, tipo: 'produto' },
      { id: 'peixe', nome: 'Peixe seco', descricao: 'Peixe preparado para guardar e compartilhar.', x: 6, y: 3, tipo: 'produto' },
      { id: 'produtos-comunidade', nome: 'Produtos da comunidade', descricao: 'Itens produzidos por diferentes moradores da vila.', x: 9, y: 3, tipo: 'produto' }
    ]
  },
  escola: {
    titulo: 'Escola da vila',
    largura: 14,
    altura: 9,
    spawn: { x: 7, y: 8 },
    saida: { x: 7, y: 8 },
    professora: { id: 'professora-marina', x: 7, y: 2 },
    alunos: [
      { x: 4, y: 4 }, { x: 6, y: 4 }, { x: 8, y: 4 },
      { x: 10, y: 4 }, { x: 5, y: 6 }, { x: 9, y: 6 }
    ],
    objetos: []
  }
};
