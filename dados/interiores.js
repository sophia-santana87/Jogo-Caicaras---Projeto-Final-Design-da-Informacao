// Definicoes modulares das cenas internas. Coordenadas em tiles internos.
export const INTERIORES = {
  'casa-de-farinha': {
    titulo: 'Casa de farinha',
    largura: 8,
    altura: 6,
    spawn: { x: 4, y: 5 },
    saida: { x: 4, y: 5 },
    objetos: [
      { id: 'descacara', nome: 'Descacar mandioca', x: 1, y: 2, tipo: 'farinha', etapa: 0 },
      { id: 'ralar', nome: 'Ralar ou triturar', x: 3, y: 2, tipo: 'farinha', etapa: 1 },
      { id: 'prensar', nome: 'Prensar no tipiti', x: 5, y: 2, tipo: 'farinha', etapa: 2 },
      { id: 'peneirar', nome: 'Peneirar', x: 6, y: 4, tipo: 'farinha', etapa: 3 },
      { id: 'torrar', nome: 'Torrar no forno de barro', x: 2, y: 4, tipo: 'farinha', etapa: 4 }
    ]
  },
  'casa-musical': {
    titulo: 'Casa musical do Mestre Tiao',
    largura: 8,
    altura: 6,
    spawn: { x: 4, y: 5 },
    saida: { x: 4, y: 5 },
    objetos: [
      { id: 'viola', nome: 'Viola de fandango', descricao: 'Instrumento de cordas usado em rodas de fandango.', x: 1, y: 2, tipo: 'musica' },
      { id: 'rabeca', nome: 'Rabeca', descricao: 'Instrumento de arco que acompanha encontros musicais.', x: 3, y: 2, tipo: 'musica' },
      { id: 'adufo', nome: 'Adufe ou pandeiro', descricao: 'Instrumento de percussao marcado por batidas e acompanhamento.', x: 5, y: 2, tipo: 'musica' },
      { id: 'mestre-tiao', nome: 'Mestre Tiao', descricao: 'Ensina um padrao ritmico curto e permite tentar novamente.', x: 6, y: 4, tipo: 'ritmo' }
    ]
  },
  mercadinho: {
    titulo: 'Mercadinho',
    largura: 8,
    altura: 6,
    spawn: { x: 4, y: 5 },
    saida: { x: 4, y: 5 },
    objetos: [
      { id: 'farinha', nome: 'Farinha', descricao: 'Produto da mandioca, ligado ao trabalho de roca e mutirao.', x: 1, y: 2, tipo: 'produto' },
      { id: 'peixe-seco', nome: 'Peixe seco', descricao: 'Forma tradicional de conservar parte da pesca para outro momento.', x: 3, y: 2, tipo: 'produto' },
      { id: 'artesanato', nome: 'Artesanato', descricao: 'Criacao da comunidade que precisa de reconhecimento e autoria.', x: 5, y: 2, tipo: 'produto' },
      { id: 'frutas', nome: 'Frutas da vila', descricao: 'Produtos locais ligados ao trabalho sazonal e a troca na comunidade.', x: 6, y: 4, tipo: 'produto' }
    ]
  },
  armazem: {
    titulo: 'Armazem da vila',
    largura: 8,
    altura: 6,
    spawn: { x: 4, y: 5 },
    saida: { x: 4, y: 5 },
    objetos: [
      { id: 'farinha', nome: 'Farinha', descricao: 'Farinha guardada em sacos para uso e troca.', x: 1, y: 2, tipo: 'produto' },
      { id: 'peixe', nome: 'Peixe seco', descricao: 'Peixe preparado para guardar e compartilhar.', x: 3, y: 2, tipo: 'produto' },
      { id: 'produtos-comunidade', nome: 'Produtos da comunidade', descricao: 'Itens produzidos por diferentes moradores da vila.', x: 5, y: 2, tipo: 'produto' }
    ]
  }
};
