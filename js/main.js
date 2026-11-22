// Cabeçalho de autoria: Projeto final do curso de Gestão da Informação da UFPR.
// Equipe: Bianca Vasconcelos de Lima; Katryni Haaby dos Santos Bueno; Luana Harmatiuk Guimarães; Sophia Santana da Silva; Vanessa da Silva Costa.
// Disciplina: Design da Informação • 2026.

import { CONTEUDO } from '../dados/conteudo.js?v=71';
import { ESPECIES_FAUNA, FAUNA } from '../dados/fauna.js?v=71';
import { INTERIORES } from '../dados/interiores.js?v=71';
import { CONCEITOS_ESCOLA, ELEMENTOS_LAGOA, ETAPAS_FARINHA, EXPLICACAO_FANDANGO, FICHAS_INSTRUMENTOS, PRODUTOS_PEIXARIA, TEXTO_CIDA_FINALIZACAO } from '../dados/locais.js?v=71';
import { ESTADO_PADRAO, ajustarIndicadores, apagarEstadoSalvo, carregarEstado, falhaArmazenamento, salvarEstado } from './estado.js?v=71';
import { DialogoController } from './dialogo.js?v=71';
import { aplicarAcessibilidade } from './acessibilidade.js?v=71';
import { SomManager } from './som.js?v=71';
import { renderHorario, renderIndicadores, renderMissoes } from './ui.js?v=71';
import { CENA_FANDANGO, DANCARINOS_FANDANGO, EDIFICIOS, ENTRADA_COMUNIDADE, HORTA_CENTRAL, MAPA, MAPA_DECORACOES, MISSION_POINTS, MUSICOS_FANDANGO, NPCS, PESSOAS_CENARIO, POSICAO_INICIAL_CACHORRO, POSICAO_INICIAL_JOGADOR, PRACA_CENTRAL, PONTOS_ATRACACAO, PONTOS_EMBARQUE, PONTOS_DE_OBSERVACAO, PONTOS_PESCA, distancia, findPath, getNPCsNoHorario, isPassable, tileAt, verificarEdificios } from './mundo.js?v=71';
import { MISSION_ORDER, MISSOES_INFO } from './missoes.js?v=71';
import { desenharAlunoSentado, desenharAve, desenharCachorro, desenharCantosArredondadosMapa, desenharCanoaCaiçara, desenharDancarino, desenharJogador, desenharJogadorSentado, desenharMorador, desenharMusico, desenharNpc, desenharObjeto, desenharPiso, desenharVaraPesca } from './sprites.js?v=71';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const dialogController = new DialogoController(document);
const som = new SomManager();
const estado = carregarEstado();
const falhaInicialArmazenamento = falhaArmazenamento;
const modoDebug = new URLSearchParams(window.location.search).get('debug') === '1';

function syncAudioState() {
  som.enabled = Boolean(estado.somLigado && som.audioCtx?.state === 'running');
}

function atualizarEstadoBotoesAcessibilidade() {
  const opcoes = [
    { chave: 'letra', ativo: estado.letraNivel === 2, nome: 'Letra maior' },
    { chave: 'facil', ativo: estado.letraNivel === 3, nome: 'Leitura fácil' },
    { chave: 'contraste', ativo: estado.altoContraste, nome: 'Alto contraste' },
    { chave: 'movimento', ativo: estado.reduzirMovimento, nome: 'Reduzir movimento' },
    { chave: 'setas', ativo: estado.mostrarSetas, nome: 'Setas na tela' }
  ];
  opcoes.forEach(({ chave, ativo, nome }) => {
    const ligado = ativo ? 'ligada' : 'desligada';
    [`btn-opening-${chave}`, `btn-pause-${chave}`].forEach((id) => {
      const botao = document.getElementById(id);
      if (!botao) return;
      botao.textContent = `${nome}: ${ligado}`;
      botao.setAttribute('aria-pressed', String(ativo));
    });
  });
  const textoSom = estado.somLigado ? (som.enabled ? 'Som: ligado' : 'Som: suspenso') : 'Som: desligado';
  ['btn-opening-som', 'btn-pause-som'].forEach((id) => {
    const botao = document.getElementById(id);
    if (botao) {
      botao.textContent = textoSom;
      botao.setAttribute('aria-pressed', String(estado.somLigado));
    }
  });
}

function atualizarMenuPausa() {
  const botaoLetra = document.getElementById('btn-pause-letra');
  const botaoFacil = document.getElementById('btn-pause-facil');
  const botaoMovimento = document.getElementById('btn-pause-movimento');
  const botaoSom = document.getElementById('btn-pause-som');
  const botaoContraste = document.getElementById('btn-pause-contraste');
  const botaoSetas = document.getElementById('btn-pause-setas');

  if (botaoLetra) botaoLetra.textContent = estado.letraNivel === 2 ? 'Letra normal' : 'Letra maior';
  if (botaoFacil) botaoFacil.textContent = estado.letraNivel === 3 ? 'Leitura padrão' : 'Letra para leitura fácil';
  if (botaoMovimento) {
    botaoMovimento.textContent = estado.reduzirMovimento ? 'Movimento normal' : 'Reduzir movimento';
  }
  if (botaoSom) {
    botaoSom.textContent = estado.somLigado ? 'Som ligado' : 'Som desligado';
  }
  if (botaoContraste) {
    botaoContraste.textContent = estado.altoContraste ? 'Contraste normal' : 'Alto contraste';
  }
  if (botaoSetas) botaoSetas.textContent = estado.mostrarSetas ? 'Ocultar setas na tela' : 'Mostrar setas na tela';
  atualizarEstadoBotoesAcessibilidade();
}

const telas = {
  'screen-opening': document.getElementById('screen-opening'),
  'screen-customizacao': document.getElementById('screen-customizacao'),
  'screen-tutorial': document.getElementById('screen-tutorial'),
  'screen-game': document.getElementById('screen-game'),
  'screen-creditos': document.getElementById('screen-creditos')
};

let tutorialIndex = 0;
let destinoAtual = null;
let animationTick = 0;
let eventStep = 0;
let currentSelection = null;
let novaJornada = false;
let pescaAnimacao = null;
let pescaResultadoAnimacao = null;
let conceitoEscolaAtivo = null;
let pontoDaPescaAtual = null;
let faunaVoo = new Map();
let tempoFaunaAnterior = 0;
let tempoMovimentoFauna = 0;
let playerDirection = 'down';
let playerMotion = null;
let playerNextStepAt = 0;
let dogMotion = null;
let dogDirection = 'left';
let dogNextMoveAt = 0;
let dogPetUntil = 0;
let camadaEstatica = null;
let camadaEstaticaMinimapa = null;
let ultimaAtualizacaoMinimapa = -1;
const PARTICULAS = Array.from({ length: 42 }, (_, index) => ({
  x: ((index * 73 + 19) % 997) / 997,
  y: ((index * 137 + 41) % 991) / 991,
  fase: (index * 29) % 180,
  tipo: index % 3
}));
const ITENS_ARMAZEM = [
  { id: 'farinha', nome: 'Farinha' },
  { id: 'peixe', nome: 'Peixe' },
  { id: 'produtos-comunidade', nome: 'Produtos da comunidade' }
];
const PRODUTOS_MERCADINHO = ['Farinha', 'Peixe', 'Produtos da comunidade'];
const ITENS_DESTAQUE = new Set([
  'viola', 'rabeca', 'adufo', 'cataia',
  'planta-medicinal-a', 'planta-medicinal-b', 'planta-medicinal-c', 'canteiro'
]);
let filaMensagensMapa = [];
let mensagemMapaAtiva = null;
let temporizadorMensagemMapa = null;
let sequenciaMensagemMapa = 0;
let cachePontosCobertos = null;
let cachePontosFrame = -1;
let horarioPontosMissao = null;
let pontosMissaoDinamicos = {};
let portaAnimacao = null;
let ritmoTentativa = [];
let peixesSaltantes = [
  { x: 36, y: 22, especieId: 'tainha', inicio: 0, proximo: 4200 },
  { x: 38, y: 24, especieId: 'robalo', inicio: 0, proximo: 6700 },
  { x: 35, y: 23, especieId: 'parati', inicio: 0, proximo: 5300 },
  ...PONTOS_PESCA.filter((ponto) => ponto.tipo === 'mar' && tileAt(ponto.x, ponto.y) === 'mar')
    .map((ponto, indice) => ({
      ...ponto,
      especieId: ['tainha', 'robalo', 'parati'][indice % 3],
      inicio: 0,
      proximo: [3900, 6100, 4700][indice % 3]
    }))
];
const ESPECIES_PEIXES = [
  { id: 'tainha', nome: 'Tainha', raridade: 4, ficha: 'Peixe ligado ao mar; redes de cerco fazem parte do saber artesanal. Época relevante depende da comunidade e do tempo local.' },
  { id: 'robalo', nome: 'Robalo', raridade: 3, ficha: 'Peixe de estuários e regiões costeiras. Sua presença varia com vento, maré e estação.' },
  { id: 'parati', nome: 'Parati', raridade: 3, ficha: 'Peixe comum em águas costeiras e estuarinas. A pesca depende de observar o ambiente.' },
  { id: 'bagre', nome: 'Bagre', raridade: 2, ficha: 'Pode ocorrer em rios, lagoas e áreas próximas. O preparo varia entre famílias e comunidades.' },
  { id: 'corvina', nome: 'Corvina', raridade: 2, ficha: 'Peixe costeiro conhecido em pesca artesanal. Quantidade e época exigem atenção ao mar.' },
  { id: 'savelha', nome: 'Savelha', raridade: 2, ficha: 'Peixe marinho usado em hábitos locais de alimentação. Os detalhes locais precisam ser validados.' }
];

function showScreen(id) {
  Object.entries(telas).forEach(([key, el]) => {
    el.classList.toggle('active', key === id);
  });

  const menuPausa = document.getElementById('pause-menu');
  if (menuPausa && id !== 'screen-game') {
    menuPausa.classList.add('hidden');
  }
  if (id === 'screen-game') canvas.focus({ preventScroll: true });
  else {
    const titulo = telas[id]?.querySelector('h1, h2');
    if (titulo) {
      titulo.tabIndex = -1;
      titulo.focus({ preventScroll: true });
    }
  }
  window.__activeScreen = id;
}

function mostrarDicaContextual(texto) {
  filaMensagensMapa = filaMensagensMapa.filter((mensagem) => mensagem.tipo !== 'dica');
  if (mensagemMapaAtiva?.tipo === 'dica') {
    if (mensagemMapaAtiva.texto === texto) return;
    dispensarMensagemMapa(mensagemMapaAtiva.id);
  }
  ['panel-missoes', 'indicator-panel'].forEach((id) => {
    document.getElementById(id)?.classList.add('hidden');
  });
  document.getElementById('btn-missoes')?.setAttribute('aria-expanded', 'false');
  document.getElementById('btn-indicadores')?.setAttribute('aria-expanded', 'false');
  enfileirarMensagemMapa('dica', texto, 2);
}

function ocultarDicaContextual() {
  if (mensagemMapaAtiva) {
    dispensarMensagemMapa(mensagemMapaAtiva.id);
    return;
  }
  document.getElementById('tutorial-hint')?.classList.add('hidden');
}

function mostrarProximaMensagemMapa() {
  if (mensagemMapaAtiva || !filaMensagensMapa.length) return;
  mensagemMapaAtiva = filaMensagensMapa.shift();
  const dica = document.getElementById('tutorial-hint');
  const notificacao = document.getElementById('coleta-notificacao');
  dica.classList.add('hidden');
  notificacao.classList.add('hidden');

  if (mensagemMapaAtiva.tipo === 'dica') {
    document.getElementById('tutorial-hint-text').textContent = mensagemMapaAtiva.texto;
    dica.classList.remove('hidden');
    return;
  }

  const mensagem = mensagemMapaAtiva;
  notificacao.textContent = mensagem.texto;
  notificacao.classList.remove('hidden');
  temporizadorMensagemMapa = setTimeout(
    () => dispensarMensagemMapa(mensagem.id),
    mensagem.duracao
  );
}

function enfileirarMensagemMapa(tipo, texto, prioridade, duracao = 0) {
  if (mensagemMapaAtiva?.texto === texto || filaMensagensMapa.some((item) => item.texto === texto)) return;
  const mensagem = { id: ++sequenciaMensagemMapa, tipo, texto, prioridade, duracao };
  if (mensagemMapaAtiva && prioridade > mensagemMapaAtiva.prioridade) {
    filaMensagensMapa.push(mensagemMapaAtiva);
    mensagemMapaAtiva = null;
    clearTimeout(temporizadorMensagemMapa);
    temporizadorMensagemMapa = null;
  }
  filaMensagensMapa.push(mensagem);
  filaMensagensMapa.sort((a, b) => b.prioridade - a.prioridade || a.id - b.id);
  mostrarProximaMensagemMapa();
}

function dispensarMensagemMapa(id) {
  if (!mensagemMapaAtiva || mensagemMapaAtiva.id !== id) return;
  clearTimeout(temporizadorMensagemMapa);
  temporizadorMensagemMapa = null;
  document.getElementById('tutorial-hint').classList.add('hidden');
  document.getElementById('coleta-notificacao').classList.add('hidden');
  mensagemMapaAtiva = null;
  mostrarProximaMensagemMapa();
}

function alternarPausa(ativo = !estado.pausa) {
  estado.pausa = Boolean(ativo);
  const menuPausa = document.getElementById('pause-menu');
  if (menuPausa) {
    menuPausa.classList.toggle('hidden', !estado.pausa);
  }
  document.body.classList.toggle('pause-overlay', estado.pausa);
  document.getElementById(estado.pausa ? 'btn-pause-continuar' : 'btn-pausa')?.focus({ preventScroll: true });
  salvar();
}

function salvar() {
  estado.progressoSalvo = true;
  const salvo = salvarEstado(estado);
  const aviso = document.getElementById('system-notice');
  if (aviso) {
    aviso.textContent = salvo ? '' : 'Não foi possível salvar neste aparelho. Seu progresso pode não continuar depois que fechar o jogo.';
    aviso.classList.toggle('hidden', salvo);
  }
}

function mostrarFalhaDeLeituraSeNecessario() {
  if (!falhaInicialArmazenamento) return;
  const aviso = document.getElementById('system-notice');
  if (!aviso) return;
  aviso.textContent = 'Não foi possível ler o progresso salvo. Você pode continuar, mas o progresso anterior não foi carregado.';
  aviso.classList.remove('hidden');
}

function nomeJogadorAtivo() {
  return estado.jogador?.nome || estado.nomeJogador || 'Visitante';
}

function posicaoInicialJogador() {
  return { ...POSICAO_INICIAL_JOGADOR, nome: nomeJogadorAtivo() };
}

function proximoHorario(atual) {
  const ordem = ['08:00', '10:30', '13:30', '16:00', '17:30'];
  const i = ordem.indexOf(atual);
  return ordem[Math.min(ordem.length - 1, i + 1)];
}

function setarLetra(valor) {
  estado.letraNivel = valor;
  aplicarAcessibilidade(estado);
  atualizarMenuPausa();
  salvar();
}

function alternarLetra() {
  setarLetra(estado.letraNivel === 2 ? 1 : 2);
}

function alternarLeituraFacil() {
  setarLetra(estado.letraNivel === 3 ? 1 : 3);
}

function alternarContraste() {
  estado.altoContraste = !estado.altoContraste;
  document.body.classList.add('contrast-choice-saved');
  aplicarAcessibilidade(estado);
  atualizarMenuPausa();
  salvar();
}

function alternarMovimento() {
  estado.reduzirMovimento = !estado.reduzirMovimento;
  document.body.classList.add('motion-choice-saved');
  atualizarMenuPausa();
  salvar();
}

function alternarSom() {
  estado.somLigado = !estado.somLigado;
  const ligar = estado.somLigado;
  let operacao;
  try {
    operacao = ligar ? som.ativar() : som.desativar();
  } catch {
    operacao = Promise.resolve(false);
  }
  if (som.audioCtx) {
    som.audioCtx.onstatechange = () => {
      syncAudioState();
      atualizarMenuPausa();
    };
  }
  syncAudioState();
  atualizarMenuPausa();
  salvar();
  Promise.resolve(operacao).catch(() => false).then(() => {
    if (estado.somLigado !== ligar) return;
    syncAudioState();
    atualizarMenuPausa();
  });
}

function apagarProgresso() {
  if (!window.confirm('Apagar todo o progresso salvo neste aparelho e começar um novo jogo?')) return;
  const preferencias = {
    letraNivel: estado.letraNivel,
    altoContraste: estado.altoContraste,
    reduzirMovimento: estado.reduzirMovimento,
    mostrarSetas: estado.mostrarSetas,
    somLigado: false
  };
  apagarEstadoSalvo();
  Object.assign(estado, structuredClone(ESTADO_PADRAO), preferencias);
  som.enabled = false;
  som.desativar();
  novaJornada = false;
  estado.progressoSalvo = false;
  aplicarAcessibilidade(estado);
  atualizarMenuPausa();
  showScreen('screen-opening');
  const aviso = document.getElementById('system-notice');
  if (aviso) {
    aviso.textContent = falhaArmazenamento ? 'Não foi possível apagar o progresso salvo neste aparelho.' : '';
    aviso.classList.toggle('hidden', !falhaArmazenamento);
  }
}

function alternarSetas() {
  estado.mostrarSetas = !estado.mostrarSetas;
  atualizarMenuPausa();
  salvar();
}

function atualizarHud() {
  const clockRoot = document.getElementById('clock-panel');
  const indicatorRoot = document.getElementById('indicator-panel');
  const missionRoot = document.getElementById('panel-missoes');
  renderHorario(estado, clockRoot);
  renderIndicadores(estado, indicatorRoot);
  renderMissoes(estado, missionRoot);
  const itensNoInventario = Object.values(estado.inventario || {})
    .reduce((total, quantidade) => total + (Number.isFinite(quantidade) ? quantidade : 0), 0);
  document.getElementById('caderno-contador').textContent = String(estado.cartasColetadas.length + itensNoInventario + (estado.colecaoFauna?.length || 0));
}

function atualizarDescricaoCanvas(etapaAtiva, npcProximo) {
  const edificio = edificioProximo();
  const local = edificio ? nomeEdificio(edificio) : 'vila';
  const proximaMissao = MISSION_ORDER.find((id) => !estado.missoesConcluidas.includes(id));
  const objetivo = etapaAtiva?.etapa.texto || (proximaMissao ? MISSOES_INFO[proximaMissao].nome : 'explorar a vila');
  const pessoa = npcProximo ? ` Pessoa próxima: ${npcProximo.nome}.` : '';
  const descricao = `Mapa do jogo. Local atual: ${local}. Objetivo: ${objetivo}.${pessoa} Use as setas ou WASD para caminhar e E para interagir.`;
  if (canvas.getAttribute('aria-label') !== descricao) canvas.setAttribute('aria-label', descricao);
}

function pontoMissaoAtual(id) {
  if (horarioPontosMissao !== estado.horario) {
    const npcs = new Map(getNPCsNoHorario(estado.horario).map((npc) => [npc.id, npc]));
    pontosMissaoDinamicos = Object.fromEntries(Object.entries(MISSOES_INFO).map(([missaoId, missao]) => {
      const npc = npcs.get(missao.npcId);
      return [missaoId, npc
        ? { x: npc.x + (missao.marcador?.x || 0), y: npc.y + (missao.marcador?.y || 0) }
        : MISSION_POINTS[missaoId]];
    }));
    horarioPontosMissao = estado.horario;
  }
  return pontosMissaoDinamicos[id] || MISSION_POINTS[id] || null;
}

function atualizarInteracao() {
  const interactButton = document.getElementById('btn-interagir');
  if (pescaAnimacao) {
    interactButton.classList.add('hidden');
    atualizarDescricaoCanvas(obterEtapaAtiva(), null);
    return;
  }
  const etapaAtiva = obterEtapaAtiva();
  const pertoDeMissao = MISSION_ORDER.find((id) => {
    if (estado.missoesConcluidas.includes(id)) return false;
    const ponto = pontoMissaoAtual(id);
    return ponto && distancia(estado.jogador.x, estado.jogador.y, ponto.x, ponto.y) <= 1.5;
  });
  const npcs = getNPCsNoHorario(estado.horario);
  const npcDaEtapa = etapaAtiva?.etapa.tipo === 'conversar'
    ? npcs.find((npc) => npc.id === etapaAtiva.etapa.alvo
      && distancia(estado.jogador.x, estado.jogador.y, npc.x, npc.y) <= 1.5)
    : null;
  const pertoNpc = npcDaEtapa || npcs.find((npc) => distancia(estado.jogador.x, estado.jogador.y, npc.x, npc.y) <= 1.5);
  const pertoDoCachorro = distancia(estado.jogador.x, estado.jogador.y, estado.cachorro.x, estado.cachorro.y) <= 1.5;
  const edificio = edificioProximo();
  const alvo = alvoDaEtapaProximo(etapaAtiva);
  const pontoPesca = pontoPescaProximo();
  const atracacao = atracacaoProxima();
  const embarque = embarqueCanoaProximo();
  const animal = pontoPesca ? null : faunaProxima();
  const elementoLagoa = pontoPesca || animal ? null : elementoLagoaProximo();
  let texto = '';

  if (!estado.emCanoa && pertoNpc && !estado.tutorialInteracaoVisto) {
    estado.tutorialInteracaoVisto = true;
    mostrarDicaContextual('Aproxime-se de uma pessoa e pressione E ou toque em Interagir para conversar.');
    salvar();
  }

  if (estado.emCanoa && atracacao) {
    texto = 'Sair da canoa';
  } else if (etapaAtiva?.etapa.tipo === 'conversar' && pertoNpc?.id === etapaAtiva.etapa.alvo) {
    texto = `Conversar com ${pertoNpc.nome}`;
  } else if (etapaAtiva?.etapa.tipo === 'ir-ate' && edificio?.id === etapaAtiva.etapa.alvo) {
    texto = acaoNoEdificio(edificio);
  } else if (etapaAtiva?.etapa.tipo === 'ordenar' && edificio?.id === 'casa-de-farinha') {
    texto = acaoNoEdificio(edificio);
  } else if (alvo) {
    texto = `Investigar ${alvo.nome}`;
  } else if (pertoDeMissao && (!estado.missaoAtiva || estado.missaoAtiva === pertoDeMissao)) {
    texto = estado.progressoMissoes[pertoDeMissao] ? 'Retomar missão' : 'Começar missão';
  } else if (pontoPesca) {
    texto = 'Pescar com cuidado';
  } else if (pertoNpc && !estado.emCanoa) {
    texto = `Conversar com ${pertoNpc.nome}`;
  } else if (pertoDoCachorro && !estado.emCanoa) {
    texto = 'Fazer carinho';
  } else if (!estado.emCanoa && embarque) {
    texto = 'Entrar na canoa';
  } else if (animal) {
    texto = `Observar ${ESPECIES_FAUNA[animal.especieId].nome.toLowerCase()}`;
  } else if (elementoLagoa) {
    texto = `Conhecer ${elementoLagoa.nome.toLowerCase()}`;
  } else if (edificio?.enterable || edificio?.id === 'peixaria' || edificio?.id === 'capela') {
    texto = acaoNoEdificio(edificio);
  }
  interactButton.classList.toggle('hidden', !texto);
  if (texto) interactButton.textContent = `E / toque · ${texto}`;
  atualizarDescricaoCanvas(etapaAtiva, pertoNpc);
}

function mostrarNotificacaoColeta(texto) {
  enfileirarMensagemMapa('coleta', texto, 3, 3000);
}

function mostrarExplicacao(texto, efeitos = null) {
  const box = document.getElementById('card-explicacao');
  const content = document.getElementById('explicacao-texto');
  const detalhe = efeitos ? Object.entries(efeitos).map(([e, v]) => `${e} ${v >= 0 ? '+' : ''}${v}`).join(', ') : '';
  content.innerHTML = `<p>${texto}</p>${detalhe ? `<p>${detalhe}</p>` : ''}`;
  box.classList.remove('hidden');
  document.getElementById('btn-explicacao-fechar').focus({ preventScroll: true });
}

function esconderExplicacao() {
  document.getElementById('card-explicacao').classList.add('hidden');
  if (estado.missoesConcluidas.length >= MISSION_ORDER.length && estado.horario === '17:30' && !estado.eventoConcluido) {
    abrirEventoFinal();
  }
}

function mostrarResumo() {
  const resumo = document.getElementById('card-resumo');
  const area = document.getElementById('resumo-conteudo');
  area.innerHTML = `
    <div><strong>Cultura:</strong> ${estado.indicadores.Cultura}/10</div>
    <div><strong>Ambiente:</strong> ${estado.indicadores.Ambiente}/10</div>
    <div><strong>Comunidade:</strong> ${estado.indicadores.Comunidade}/10</div>
    <div><strong>Renda:</strong> ${estado.indicadores.Renda}/10</div>
    <h4>Cartas:</h4>
    <ul>${estado.cartasColetadas.map((carta) => `<li>${carta}</li>`).join('') || '<li>Nenhuma carta ainda.</li>'}</ul>
    <h4>Para conversar</h4>
    <ul>${CONTEUDO.perguntas.map((p) => `<li>${p}</li>`).join('')}</ul>
    <p>Este protótipo não substitui a voz da comunidade caiçara. As decisões sobre o território são coletivas.</p>
  `;
  resumo.classList.remove('hidden');
  document.getElementById('btn-resumo-fechar').focus({ preventScroll: true });
}

function fecharResumo() {
  document.getElementById('card-resumo').classList.add('hidden');
  const preferencias = {
    letraNivel: estado.letraNivel,
    altoContraste: estado.altoContraste,
    reduzirMovimento: estado.reduzirMovimento,
    mostrarSetas: estado.mostrarSetas,
    minimapaRecolhido: estado.minimapaRecolhido,
    somLigado: estado.somLigado
  };
  Object.assign(estado, structuredClone(ESTADO_PADRAO), preferencias);
  document.getElementById('btn-continuar').classList.add('hidden');
  novaJornada = false;
  salvarEstado(estado);
  showScreen('screen-opening');
}

function abrirCaderno(abrirMapa = false) {
  dialogController.open({
    nome: `${nomeJogadorAtivo()} · Caderno de Saberes`,
    texto: '',
    className: 'notebook'
  });
  const content = document.getElementById('dialogo-texto');
  content.replaceChildren();

  const tabs = document.createElement('div');
  tabs.className = 'notebook-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Seções do caderno');
  const sections = ['Saberes', 'Mapa'].map((titulo, indice) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'notebook-tab';
    tab.id = `notebook-tab-${indice}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(indice === (abrirMapa ? 1 : 0)));
    tab.setAttribute('aria-controls', `notebook-section-${indice}`);
    tab.textContent = titulo;
    tabs.appendChild(tab);

    const section = document.createElement('section');
    section.className = 'notebook-category';
    section.id = `notebook-section-${indice}`;
    section.setAttribute('role', 'tabpanel');
    section.setAttribute('aria-labelledby', tab.id);
    section.hidden = indice !== (abrirMapa ? 1 : 0);
    const heading = document.createElement('h3');
    heading.textContent = titulo;
    section.appendChild(heading);

    tab.addEventListener('click', () => {
      tabs.querySelectorAll('[role="tab"]').forEach((item) => {
        item.setAttribute('aria-selected', String(item === tab));
      });
      sections.forEach((item) => {
        item.hidden = item !== section;
      });
      if (indice === 1) atualizarMapaDoCaderno(section);
    });
    if (indice === 1) atualizarMapaDoCaderno(section);
    return section;
  });

  MISSION_ORDER.forEach((id) => {
    const missao = MISSOES_INFO[id];
    const dadosMissao = CONTEUDO.missoes.find((item) => item.id === id);
    const progresso = estado.progressoMissoes[id];
    const concluida = estado.missoesConcluidas.includes(id);
    const item = document.createElement('article');
    item.className = 'notebook-card';
    const title = document.createElement('h4');
    title.textContent = `${concluida ? 'Concluída' : estado.missaoAtiva === id ? 'Em andamento' : 'Disponível'} · ${missao.nome}`;
    const description = document.createElement('p');
    description.textContent = concluida
      ? missao.descricao
      : progresso
        ? dadosMissao?.etapas[progresso.passo]?.texto || missao.descricao
        : missao.descricao;
    item.append(title, description);
    sections[0].appendChild(item);
  });

  const cartas = [...CONTEUDO.missoes.map((missao) => missao.carta), ...CONTEUDO.cartas]
    .filter((carta) => estado.cartasColetadas.includes(carta.texto));
  const categorias = new Map([['Receitas e Causos', []], ['Natureza e Mar', []], ['Festas e Música', []]]);
  cartas.forEach((carta) => {
    if (categorias.has(carta.categoria)) categorias.get(carta.categoria).push(carta);
  });
  const conceitosAprendidos = CONCEITOS_ESCOLA.filter((conceito) => estado.conceitosEscola.includes(conceito.id));
  if (conceitosAprendidos.length) {
    const heading = document.createElement('h4');
    heading.textContent = 'Aprendizados da escola';
    sections[0].appendChild(heading);
    conceitosAprendidos.forEach((conceito) => {
      const article = document.createElement('article');
      article.className = 'notebook-card';
      const title = document.createElement('h4');
      title.textContent = conceito.titulo;
      const description = document.createElement('p');
      description.textContent = `${conceito.texto}`;
      article.append(title, description);
      sections[0].appendChild(article);
    });
  }
  if (estado.locaisVisitados.includes('peixaria')) {
    const article = document.createElement('article');
    article.className = 'notebook-card';
    const title = document.createElement('h4');
    title.textContent = 'Peixaria · produtos para observar';
    const description = document.createElement('p');
    description.textContent = `${PRODUTOS_PEIXARIA.map((item) => item.nome).join(', ')}. Produtos para observação.`;
    article.append(title, description);
    sections[0].appendChild(article);
  }
  const elementosLagoaObservados = ELEMENTOS_LAGOA.filter((elemento) => estado.locaisVisitados.includes(`lagoa-${elemento.id}`));
  if (elementosLagoaObservados.length) {
    const heading = document.createElement('h4');
    heading.textContent = 'Elementos da lagoa';
    sections[0].appendChild(heading);
    elementosLagoaObservados.forEach((elemento) => {
      const article = document.createElement('article');
      article.className = 'notebook-card';
      const title = document.createElement('h4');
      title.textContent = elemento.nome;
      const description = document.createElement('p');
      description.textContent = `${elemento.texto}`;
      article.append(title, description);
      sections[0].appendChild(article);
    });
  }
  const instrumentosObservados = FICHAS_INSTRUMENTOS.filter((instrumento) => estado.locaisVisitados.includes(`instrumento-${instrumento.id}`));
  if (instrumentosObservados.length) {
    const heading = document.createElement('h4');
    heading.textContent = 'Instrumentos do fandango';
    sections[0].appendChild(heading);
    instrumentosObservados.forEach((instrumento) => {
      const article = document.createElement('article');
      article.className = 'notebook-card';
      const title = document.createElement('h4');
      title.textContent = instrumento.nome;
      const description = document.createElement('p');
      description.textContent = `${instrumento.texto}`;
      article.append(title, description);
      sections[0].appendChild(article);
    });
  }
  categorias.forEach((cartasDaCategoria, categoria) => {
    if (!cartasDaCategoria.length) return;
    const heading = document.createElement('h4');
    heading.textContent = categoria;
    sections[0].appendChild(heading);
    cartasDaCategoria.forEach((carta) => {
      const article = document.createElement('article');
      article.className = 'notebook-card';
      const title = document.createElement('h4');
      title.textContent = carta.titulo;
      const description = document.createElement('p');
      description.textContent = carta.texto;
      article.append(title, description);
      sections[0].appendChild(article);
    });
  });

  const itensInventario = ITENS_ARMAZEM
    .map((item) => ({ ...item, quantidade: Number(estado.inventario[item.id]) || 0 }))
    .filter((item) => item.quantidade > 0);
  if (itensInventario.length) {
    itensInventario.forEach((item) => {
      const article = document.createElement('article');
      article.className = 'notebook-card';
      article.innerHTML = `<h4>${item.nome}</h4><p>Quantidade: ${item.quantidade}</p>`;
      sections[0].appendChild(article);
    });
  }

  const colecao = document.createElement('article');
  colecao.className = 'notebook-card';
  const colecaoTitulo = document.createElement('h4');
  colecaoTitulo.textContent = 'Coleção de peixes e crustáceos';
  colecao.appendChild(colecaoTitulo);
  ESPECIES_PEIXES.forEach((especie) => {
    const capturada = estado.colecaoPeixes.includes(especie.id);
    const item = document.createElement('p');
    item.textContent = capturada ? `${especie.nome}: ${especie.ficha}` : '? espécie ainda não capturada';
    colecao.appendChild(item);
  });
  sections[0].appendChild(colecao);

  const fauna = document.createElement('article');
  fauna.className = 'notebook-card';
  const faunaTitulo = document.createElement('h4');
  faunaTitulo.textContent = 'Fauna observada';
  fauna.appendChild(faunaTitulo);
  Object.entries(ESPECIES_FAUNA).forEach(([id, especie]) => {
    const item = document.createElement('p');
    item.textContent = estado.colecaoFauna.includes(id)
      ? `${especie.nome}: ${especie.ficha}`
      : '? espécie ainda não observada';
    fauna.appendChild(item);
  });
  sections[0].appendChild(fauna);

  content.append(tabs, ...sections);
}

function atualizarMapaDoCaderno(section) {
  section.querySelector('.mapa-caderno')?.remove();
  const wrapper = document.createElement('div');
  wrapper.className = 'mapa-caderno';
  const canvasMapa = document.createElement('canvas');
  canvasMapa.width = 384;
  canvasMapa.height = 304;
  canvasMapa.setAttribute('role', 'img');
  canvasMapa.setAttribute('aria-label', 'Mapa da Ponta Oeste mostrando sua posição atual');
  canvasMapa.className = 'notebook-map';
  wrapper.appendChild(canvasMapa);

  const legenda = document.createElement('p');
  legenda.className = 'mapa-legenda-caderno';
  legenda.textContent = 'Posição atual: ' + (estado.interiorAtivo
    ? `porta da ${nomeEdificio(EDIFICIOS.find((item) => item.id === estado.interiorAtivo) || { id: estado.interiorAtivo })}`
    : 'fora das casas');
  wrapper.appendChild(legenda);
  section.appendChild(wrapper);
  desenharMinimapa(canvasMapa, true);
  const ctxMapa = canvasMapa.getContext('2d');
  EDIFICIOS.forEach((edificio) => {
    const visitado = estado.locaisVisitados.includes(edificio.id) || edificio.id === 'armazem' && estado.itensArmazemColetados.length > 0;
    const x = edificio.entrada.x * 16 * (canvasMapa.width / (MAPA[0].length * 16));
    const y = edificio.entrada.y * 16 * (canvasMapa.height / (MAPA.length * 16));
    ctxMapa.fillStyle = visitado ? '#FFE066' : 'rgba(246,231,193,0.35)';
    ctxMapa.strokeStyle = '#2B1A0E';
    ctxMapa.lineWidth = 2;
    ctxMapa.beginPath();
    ctxMapa.arc(x, y, 3.5, 0, Math.PI * 2);
    ctxMapa.fill();
    ctxMapa.stroke();
  });
}

function iniciarTutorial() {
  tutorialIndex = 0;
  atualizarCartaoTutorial();
}

function atualizarCartaoTutorial() {
  const card = document.getElementById('tutorial-card');
  const titulo = document.createElement('h3');
  titulo.textContent = `Passo ${tutorialIndex + 1} de ${CONTEUDO.tutorial.length}`;
  const texto = document.createElement('p');
  texto.textContent = CONTEUDO.tutorial[tutorialIndex];
  card.replaceChildren(titulo, texto);
  document.getElementById('btn-tutorial-prev').disabled = tutorialIndex === 0;
  document.getElementById('btn-tutorial-next').textContent = tutorialIndex < CONTEUDO.tutorial.length - 1 ? 'Próximo' : 'Começar';
}

function proximoTutorial() {
  if (tutorialIndex < CONTEUDO.tutorial.length - 1) {
    tutorialIndex += 1;
    atualizarCartaoTutorial();
  } else {
    mostrarJogo();
  }
}

function anteriorTutorial() {
  if (tutorialIndex > 0) {
    tutorialIndex -= 1;
    atualizarCartaoTutorial();
  }
}

function mostrarJogo() {
  if (novaJornada) {
    const nomeJogador = nomeJogadorAtivo();
    const avatar = estado.avatar;
    const preferencias = {
      letraNivel: estado.letraNivel,
      altoContraste: estado.altoContraste,
      reduzirMovimento: estado.reduzirMovimento,
      mostrarSetas: estado.mostrarSetas,
      somLigado: estado.somLigado
    };
    Object.assign(estado, structuredClone(ESTADO_PADRAO), {
      nomeJogador,
      avatar,
      jogador: { ...ESTADO_PADRAO.jogador, nome: nomeJogador },
      ...preferencias
    });
    faunaVoo.clear();
    tempoMovimentoFauna = 0;
    tempoFaunaAnterior = performance.now();
    pescaResultadoAnimacao = null;
    novaJornada = false;
  }
  prepararPeixesSaltantes();
  estado.fase = 'jogo';
  if (!estado.progressoSalvo) {
    estado.horario = '08:00';
    estado.jogador = posicaoInicialJogador();
    estado.cachorro = { ...POSICAO_INICIAL_CACHORRO };
  }
  estado.interiorAtivo = null;
  if (!isPassable(estado.jogador.x, estado.jogador.y, estado.emCanoa ? 'canoa' : 'pe')) {
    estado.emCanoa = false;
    estado.jogador = posicaoInicialJogador();
  }
  if (!isPassable(estado.cachorro.x, estado.cachorro.y)) estado.cachorro = { ...POSICAO_INICIAL_CACHORRO };
  playerMotion = null;
  dogMotion = null;
  destinoAtual = null;
  playerNextStepAt = 0;
  dogNextMoveAt = performance.now() + 1200;
  showScreen('screen-game');
  atualizarHud();
  salvar();
  if (!estado.tutorialMovimentoVisto) {
    estado.tutorialMovimentoVisto = true;
    mostrarDicaContextual('Use WASD, as setas ou toque no mapa para caminhar.');
    salvar();
  }
  if (estado.missoesConcluidas.length >= MISSION_ORDER.length && estado.horario === '17:30' && !estado.eventoConcluido) {
    abrirEventoFinal();
  }
}

function continuarJogo() {
  estado.fase = 'jogo';
  if (estado.interiorAtivo && INTERIORES[estado.interiorAtivo]) {
    const edificio = EDIFICIOS.find((item) => item.id === estado.interiorAtivo);
    if (edificio) {
      showScreen('screen-game');
      abrirInterior(edificio);
      return;
    }
  }
  estado.interiorAtivo = null;
  prepararPeixesSaltantes();
  estado.cenaAtual = 'exterior';
  if (!isPassable(estado.jogador.x, estado.jogador.y, estado.emCanoa ? 'canoa' : 'pe')) {
    estado.emCanoa = false;
    estado.jogador = posicaoInicialJogador();
  }
  if (!isPassable(estado.cachorro.x, estado.cachorro.y)) estado.cachorro = { ...POSICAO_INICIAL_CACHORRO };
  showScreen('screen-game');
  atualizarHud();
  salvar();
  if (!estado.tutorialMovimentoVisto) {
    estado.tutorialMovimentoVisto = true;
    mostrarDicaContextual('Use WASD, as setas ou toque no mapa para caminhar.');
    salvar();
  }
  if (estado.missoesConcluidas.length >= MISSION_ORDER.length && estado.horario === '17:30' && !estado.eventoConcluido) {
    abrirEventoFinal();
  }
}

function concluirMissao(missaoId, indiceEscolha) {
  const missao = CONTEUDO.missoes.find((item) => item.id === missaoId);
  const opcao = missao.escolhas[indiceEscolha];
  ajustarIndicadores(estado, opcao.efeito);

  if (!estado.missoesConcluidas.includes(missaoId)) {
    estado.missoesConcluidas.push(missaoId);
  }
  estado.missaoAtiva = null;

  const carta = missao.carta;
  if (!estado.cartasColetadas.includes(carta.texto)) {
    estado.cartasColetadas.push(carta.texto);
  }

  estado.horario = proximoHorario(estado.horario);
  mostrarExplicacao(opcao.explicacao, opcao.efeito);
  atualizarHud();
  salvar();

}

function abrirEventoFinal() {
  if (estado.eventoConcluido) return;
  const evento = CONTEUDO.evento;
  eventStep = Math.min(estado.progressoEvento, evento.etapas.length - 1);
  const fase = evento.etapas[eventStep];
  dialogController.open({
    nome: eventStep === 0 ? 'Seu Nelson' : 'Rita',
    personagemId: eventStep === 0 ? 'nelson' : 'rita',
    texto: `${evento.abertura} ${fase.texto}`,
    choices: fase.opcoes.map((op) => ({ text: op.texto })),
    allowEscape: false,
    onChoice: (index) => {
      const opcao = fase.opcoes[index];
      ajustarIndicadores(estado, opcao.efeito);
      if (eventStep === 1 && index === fase.opcoes.length - 1 && !estado.impactoBarcoAplicado) {
        estado.peixesDisponiveis = Math.max(0, estado.peixesDisponiveis - 2);
        estado.impactoBarcoAplicado = true;
      }
      estado.progressoEvento += 1;
      salvar();
      const proximaAcao = estado.progressoEvento < evento.etapas.length ? 'Próxima conversa' : 'Ver resumo';
      dialogController.open({
        nome: eventStep === 0 ? 'Seu Nelson' : 'Rita',
        personagemId: eventStep === 0 ? 'nelson' : 'rita',
        texto: `${opcao.explicacao} A decisão final é coletiva.`,
        choices: [{ text: proximaAcao }],
        allowEscape: false,
        onChoice: () => {
          if (estado.progressoEvento < evento.etapas.length) {
            abrirEventoFinal();
            return;
          }
          estado.eventoConcluido = true;
          mostrarResumo();
          atualizarHud();
          salvar();
        }
      });
    }
  });
}

function obterEtapaAtiva() {
  const id = estado.missaoAtiva;
  if (!id) return null;
  const missao = CONTEUDO.missoes.find((item) => item.id === id);
  const progresso = estado.progressoMissoes[id];
  if (!missao || !progresso || progresso.passo >= missao.etapas.length) return null;
  return { id, missao, progresso, etapa: missao.etapas[progresso.passo] };
}

function nomePersonagem(id) {
  return NPCS.find((npc) => npc.id === id)?.nome || 'Narrador';
}

function falaDoNpc(npc) {
  return npc.fala.replace(/^Oi!/, `Oi, ${nomeJogadorAtivo()}!`);
}

function nomeEdificio(edificio) {
  const nomes = {
    'casa-de-farinha': 'Casa de farinha',
    'casa-musical': 'Casa musical',
    armazem: 'armazém',
    escola: 'escola',
    capela: 'capela',
    peixaria: 'peixaria',
    barraca: 'barraca',
    mercadinho: 'Mercadinho'
  };
  return nomes[edificio.id] || 'casa';
}

function acaoNoEdificio(edificio) {
  if (edificio.id === 'casa-de-farinha') return 'Entrar na casa de farinha';
  if (edificio.id === 'armazem') return 'Entrar no armazém';
  if (edificio.id === 'casa-musical') return 'Entrar na casa musical';
  if (edificio.id === 'mercadinho') return 'Visitar o mercadinho';
  if (edificio.id === 'capela') return 'Observar a capela';
  if (edificio.id === 'peixaria') return 'Observar a peixaria';
  return `Entrar na ${nomeEdificio(edificio)}`;
}

function edificioProximo() {
  return EDIFICIOS.find((edificio) => distancia(
    estado.jogador.x,
    estado.jogador.y,
    edificio.entrada.x,
    edificio.entrada.y
  ) <= 1.5);
}

function pontoPescaProximo() {
  return PONTOS_PESCA.find((ponto) => (
    (!estado.emCanoa || ponto.tipo === 'mar' && tileAt(ponto.x, ponto.y) === 'mar')
    && (estado.emCanoa || ponto.tipo !== 'mar' || ponto.y <= 29)
    && distancia(estado.jogador.x, estado.jogador.y, ponto.x, ponto.y) <= 1.5
  ));
}

function atracacaoProxima() {
  if (!estado.emCanoa) {
    return [...PONTOS_ATRACACAO, ...PONTOS_EMBARQUE].find((ponto) => (
      isPassable(ponto.x, ponto.y, 'pe')
      && distancia(estado.jogador.x, estado.jogador.y, ponto.x, ponto.y) <= 1.5
    ));
  }
  const conhecida = [...PONTOS_ATRACACAO, ...PONTOS_EMBARQUE].find((ponto) => (
    ponto.agua?.x === estado.jogador.x && ponto.agua?.y === estado.jogador.y
    && isPassable(ponto.x, ponto.y, 'pe')
  ));
  if (conhecida) return conhecida;
  const margem = [
    { x: estado.jogador.x, y: estado.jogador.y - 1 },
    { x: estado.jogador.x + 1, y: estado.jogador.y },
    { x: estado.jogador.x, y: estado.jogador.y + 1 },
    { x: estado.jogador.x - 1, y: estado.jogador.y }
  ].find((ponto) => isPassable(ponto.x, ponto.y, 'pe'));
  return margem ? { ...margem, agua: { x: estado.jogador.x, y: estado.jogador.y } } : null;
}

function embarqueCanoaProximo() {
  return [...PONTOS_ATRACACAO, ...PONTOS_EMBARQUE].find((ponto) => distancia(
    estado.jogador.x, estado.jogador.y, ponto.x, ponto.y
  ) <= 1.5);
}

function faunaProxima(agora = performance.now()) {
  return FAUNA.find((animal, indice) => {
    const posicao = posicaoFauna(animal, indice, agora);
    const distanciaBase = distancia(estado.jogador.x, estado.jogador.y, animal.x, animal.y);
    const alcance = ['caranguejo', 'passaro'].includes(animal.especieId) ? 2 : 1.35;
    return distanciaBase <= alcance || distancia(estado.jogador.x, estado.jogador.y, posicao.x, posicao.y) <= 1.35;
  });
}

function elementoLagoaProximo() {
  return ELEMENTOS_LAGOA.map((elemento) => ({
    ...elemento,
    ponto: MAPA_DECORACOES.find((decoracao) => decoracao.tipo === elemento.id)
  })).find((elemento) => elemento.ponto
    && distancia(estado.jogador.x, estado.jogador.y, elemento.ponto.x, elemento.ponto.y) <= 1.35) || null;
}

function pontosDaEtapa(contexto) {
  if (!contexto) return [];
  const { etapa, progresso } = contexto;
  let pontos = [];
  if (etapa.tipo === 'observar') {
    pontos = etapa.alvos.map((id) => ({ id, nome: nomeObjeto(id), ...PONTOS_DE_OBSERVACAO[id] }));
  } else if (['encontrar', 'separar'].includes(etapa.tipo)) {
    if (etapa.tipo === 'encontrar' && contexto.id === 'fandango') {
      if (estado.interiorAtivo !== 'casa-musical') return [];
      pontos = INTERIORES['casa-musical'].objetos
        .filter((objeto) => objeto.tipo === 'musica' && etapa.alvos.includes(objeto.id))
        .map((objeto) => ({ id: objeto.id, nome: objeto.nome, x: objeto.x, y: objeto.y }));
    } else {
      pontos = etapa.alvos.flatMap((tipo) => MAPA_DECORACOES
        .filter((decoracao) => decoracao.tipo === tipo)
        .map((decoracao) => ({ id: tipo, nome: nomeObjeto(tipo), x: decoracao.x, y: decoracao.y })));
    }
  }
  return pontos.filter((ponto) => (
    Number.isFinite(ponto.x)
    && Number.isFinite(ponto.y)
    && !progresso.alvosConcluidos.includes(ponto.id)
  ));
}

function nomeObjeto(tipo) {
  return ({
    viola: 'a viola',
    rabeca: 'a rabeca',
    adufo: 'o adufo (pandeiro quadrado)',
    'planta-medicinal-a': 'uma planta da trilha',
    'planta-medicinal-b': 'uma planta da trilha',
    'planta-medicinal-c': 'uma planta da trilha',
    'manejo-mata': 'o ponto de observação da trilha',
    lixeiraOrganica: 'a lixeira de resíduos orgânicos',
    lixeiraReciclavel: 'a lixeira de recicláveis',
    mare: 'o sinal da maré',
    vento: 'a bandeira do vento',
    ceu: 'o céu'
  })[tipo] || tipo;
}

function alvoDaEtapaProximo(contexto) {
  const alcance = contexto?.id === 'mata' && contexto.etapa.tipo === 'encontrar' ? 2 : 1.5;
  return pontosDaEtapa(contexto).find((ponto) => (
    distancia(estado.jogador.x, estado.jogador.y, ponto.x, ponto.y) <= alcance
  ));
}

function destinoDaMissao() {
  const contexto = obterEtapaAtiva();
  if (!contexto) {
    const proximaMissao = MISSION_ORDER.find((id) => !estado.missoesConcluidas.includes(id));
    return proximaMissao ? pontoMissaoAtual(proximaMissao) : null;
  }

  const { etapa } = contexto;
  if (etapa.tipo === 'conversar') {
    const npc = getNPCsNoHorario(estado.horario).find((item) => item.id === etapa.alvo);
    return npc ? { x: npc.x, y: npc.y } : null;
  }
  if (etapa.tipo === 'ir-ate' || etapa.tipo === 'ordenar') {
    const id = etapa.tipo === 'ordenar' ? 'casa-de-farinha' : etapa.alvo;
    const edificio = EDIFICIOS.find((item) => item.id === id);
    return edificio?.entrada || null;
  }
  if (etapa.tipo === 'encontrar' && contexto.id === 'fandango' && estado.interiorAtivo !== 'casa-musical') {
    return EDIFICIOS.find((item) => item.id === 'casa-musical')?.entrada || null;
  }
  return pontosDaEtapa(contexto)[0] || null;
}

function pontosCobertosPelaInterface() {
  if (cachePontosFrame === animationTick && cachePontosCobertos) return cachePontosCobertos;
  const seletores = [
    '#clock-panel', '#btn-indicadores', '#indicator-panel', '#btn-pausa', '#btn-missoes',
    '#panel-missoes', '#btn-caderno', '#btn-interagir', '#coleta-notificacao', '#tutorial-hint', '#system-notice'
  ];
  const areaCanvas = canvas.getBoundingClientRect();
  cachePontosCobertos = seletores.flatMap((seletor) => {
    const elemento = document.querySelector(seletor);
    if (!elemento || elemento.classList.contains('hidden')) return [];
    const area = elemento.getBoundingClientRect();
    return [{
      esquerda: (area.left - areaCanvas.left) * larguraCanvasLogica() / areaCanvas.width,
      direita: (area.right - areaCanvas.left) * larguraCanvasLogica() / areaCanvas.width,
      topo: (area.top - areaCanvas.top) * alturaCanvasLogica() / areaCanvas.height,
      base: (area.bottom - areaCanvas.top) * alturaCanvasLogica() / areaCanvas.height
    }];
  });
  cachePontosFrame = animationTick;
  return cachePontosCobertos;
}

function desenharIndicadorMissao(tile, camera) {
  if (!estado.mostrarSetas) return;
  if (!dialogController.overlay.classList.contains('hidden') || estado.pausa) return;
  const destino = destinoDaMissao();
  if (!destino || distancia(estado.jogador.x, estado.jogador.y, destino.x, destino.y) <= 1.5) return;

  const x = (destino.x + 0.5) * tile - camera.x;
  const y = (destino.y + 0.5) * tile - camera.y;
  const margem = Math.max(24, tile * 0.45);
  const areaSegura = {
    esquerda: margem,
    direita: larguraCanvasLogica() - margem,
    topo: Math.max(margem, larguraCanvasLogica() <= 540 ? 112 : 76),
    base: alturaCanvasLogica() - Math.max(margem, alturaCanvasLogica() <= 520 ? 108 : 88)
  };
  const obstaculos = pontosCobertosPelaInterface();
  const raioIndicador = Math.max(20, tile * 0.4);
  const coberto = (px, py) => obstaculos.some((area) => (
    px + raioIndicador >= area.esquerda && px - raioIndicador <= area.direita
    && py + raioIndicador >= area.topo && py - raioIndicador <= area.base
  ));
  const dentroDaArea = x >= areaSegura.esquerda && x <= areaSegura.direita
    && y >= areaSegura.topo && y <= areaSegura.base;
  const dentroDaTela = dentroDaArea && !coberto(x, y);
  const pulso = estado.reduzirMovimento ? 1 : 1 + Math.sin(animationTick / 16) * 0.08;

  if (dentroDaTela) {
    ctx.save();
    ctx.globalAlpha = estado.altoContraste ? 1 : 0.82;
    ctx.fillStyle = estado.altoContraste ? '#FFFFFF' : '#FFE066';
    ctx.strokeStyle = '#2B1A0E';
    ctx.lineWidth = Math.max(2, tile * 0.055);
    ctx.beginPath();
    ctx.arc(x, y, tile * 0.2 * pulso, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + tile * 0.18);
    ctx.lineTo(x, y + tile * 0.38);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const centroX = larguraCanvasLogica() / 2;
  const centroY = alturaCanvasLogica() / 2;
  const dx = x - centroX;
  const dy = y - centroY;
  const escalaX = dx > 0
    ? (areaSegura.direita - centroX) / dx
    : dx < 0 ? (areaSegura.esquerda - centroX) / dx : Infinity;
  const escalaY = dy > 0
    ? (areaSegura.base - centroY) / dy
    : dy < 0 ? (areaSegura.topo - centroY) / dy : Infinity;
  let escala = dentroDaArea ? 0.78 : Math.min(escalaX > 0 ? escalaX : Infinity, escalaY > 0 ? escalaY : Infinity);
  let pontaX = centroX + dx * escala;
  let pontaY = centroY + dy * escala;
  while (escala > 0.08 && coberto(pontaX, pontaY)) {
    escala -= 0.06;
    pontaX = centroX + dx * escala;
    pontaY = centroY + dy * escala;
  }
  if (escala <= 0.08 && coberto(pontaX, pontaY)) return;
  const angulo = Math.atan2(dy, dx);
  const tamanho = Math.max(11, Math.min(18, tile * 0.34));
  ctx.save();
  ctx.translate(pontaX, pontaY);
  ctx.rotate(angulo);
  ctx.fillStyle = estado.altoContraste ? '#FFFFFF' : '#FFE066';
  ctx.strokeStyle = '#5A3A1E';
  ctx.lineWidth = Math.max(2, tile * 0.05);
  ctx.beginPath();
  ctx.moveTo(tamanho, 0);
  ctx.lineTo(-tamanho * 0.7, -tamanho * 0.65);
  ctx.lineTo(-tamanho * 0.45, 0);
  ctx.lineTo(-tamanho * 0.7, tamanho * 0.65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function desenharIdentificacaoLocal(tile, camera) {
  if (!dialogController.overlay.classList.contains('hidden') || mensagemMapaAtiva || filaMensagensMapa.length) return;
  const locais = [
    {
      nome: 'Terreiro dos Fandangos',
      x: CENA_FANDANGO.x,
      y: CENA_FANDANGO.y,
      alturaMarcador: 1.2
    },
    ...EDIFICIOS.map((edificio) => ({
      nome: nomeEdificio(edificio),
      x: edificio.entrada.x,
      y: edificio.entrada.y,
      alturaMarcador: 4
    })),
    ...MAPA_DECORACOES
      .filter((decoracao) => decoracao.tipo === 'ponte-saber')
      .map((decoracao) => ({
        nome: decoracao.nome,
        x: decoracao.x,
        y: decoracao.y,
        alturaMarcador: 1.2
      })),
    ...PONTOS_PESCA.map((ponto) => ({
      nome: ponto.tipo === 'mar' ? 'Píer' : 'Lagoa',
      x: ponto.x,
      y: ponto.y,
      alturaMarcador: 0.65
    })),
    { nome: ENTRADA_COMUNIDADE.nome, x: ENTRADA_COMUNIDADE.x, y: ENTRADA_COMUNIDADE.y, alturaMarcador: 0.8 }
  ];
  const local = locais
    .map((item) => ({ ...item, distancia: distancia(estado.jogador.x, estado.jogador.y, item.x, item.y) }))
    .filter((item) => item.distancia <= 3.5)
    .sort((a, b) => a.distancia - b.distancia)[0];
  if (!local) return;

  let x = (local.x + 0.5) * tile - camera.x;
  let y = local.y * tile - camera.y - tile * local.alturaMarcador;
  ctx.save();
  ctx.font = `bold ${Math.max(11, Math.min(16, tile * 0.34))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const largura = ctx.measureText(local.nome).width + 16;
  const altura = Math.max(23, tile * 0.48);
  const zonaTopo = Math.max(76, larguraCanvasLogica() <= 540 ? 116 : 76);
  const zonaBase = Math.max(92, alturaCanvasLogica() <= 520 ? 108 : 88);
  x = Math.max(8 + largura / 2, Math.min(larguraCanvasLogica() - 8 - largura / 2, x));
  if (y + altura / 2 > alturaCanvasLogica() - zonaBase) y -= tile * 1.25;
  const atores = [
    ...getNPCsNoHorario(estado.horario),
    ...EDIFICIOS.map((edificio) => ({ x: edificio.entrada.x, y: edificio.entrada.y })),
    estado.jogador
  ];
  const interfaceMapa = pontosCobertosPelaInterface();
  for (let tentativa = 0; tentativa < 4; tentativa += 1) {
    const caixa = { esquerda: x - largura / 2, direita: x + largura / 2, topo: y - altura / 2, base: y + altura / 2 };
    const sobreAtor = atores.some((ator) => {
      const centroX = (ator.x + 0.5) * tile - camera.x;
      const baseY = (ator.y + 1) * tile - camera.y;
      return caixa.direita >= centroX - tile * 0.55 && caixa.esquerda <= centroX + tile * 0.55
        && caixa.base >= baseY - tile * 1.55 && caixa.topo <= baseY;
    });
    const sobreInterface = interfaceMapa.some((area) => (
      caixa.direita >= area.esquerda && caixa.esquerda <= area.direita
      && caixa.base >= area.topo && caixa.topo <= area.base
    ));
    if (!sobreAtor && !sobreInterface) break;
    y -= tile * 0.8;
  }
  if (y - altura / 2 < zonaTopo || y + altura / 2 > alturaCanvasLogica() - zonaBase) {
    ctx.restore();
    return;
  }
  ctx.fillStyle = estado.altoContraste ? '#000000' : 'rgba(246,231,193,0.94)';
  ctx.strokeStyle = estado.altoContraste ? '#FFE066' : '#68452B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - largura / 2, y - altura / 2, largura, altura, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = estado.altoContraste ? '#FFFFFF' : '#3B2A1A';
  ctx.fillText(local.nome, x, y);
  ctx.restore();
}

function nomeDebug(tipo) {
  const nomes = {
    barraca: 'barraca', varapesca: 'vara de pesca', 'vara-pesca': 'vara de pesca', casa: 'casa', casaFarinha: 'casa de farinha', mercadinho: 'mercadinho', pavilhao: 'terreiro dos fandangos', luminaria: 'luminaria', banco: 'banco', placa: 'placa', 'ponte-saber': 'placa Ponte do Saber', arvore: 'arvore', palmeira: 'palmeira', mangue: 'mangue', arbusto: 'arbusto', flor: 'flor', pedra: 'pedra', capim: 'capim', cerca: 'cerca', 'vitoria-regia': 'vitoria-regia', junco: 'junco', tronco: 'tronco', lixeiraOrganica: 'lixeira organica', lixeiraReciclavel: 'lixeira reciclavel', viola: 'viola', rabeca: 'rabeca', adufo: 'adufo', forno: 'forno', prensa: 'prensa', peneira: 'peneira', rede: 'rede', peixe: 'peixe', cataia: 'cataia', biju: 'biju'
  };
  Object.assign(nomes, { escola: 'escola', capela: 'capela', peixaria: 'peixaria', coreto: 'coreto', canteiro: 'canteiro', luminaria: 'poste' });
  return nomes[tipo] || tipo;
}

function desenharDebugMapa(tile, camera) {
  if (!modoDebug) return;

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.font = `bold ${Math.max(9, Math.min(12, tile * 0.22))}px monospace`;

  const objetos = [];
  EDIFICIOS.forEach((edificio, indice) => objetos.push({
    id: `edificio_${indice + 1}_${edificio.id}`, nome: nomeDebug(edificio.tipo), x: edificio.x, y: edificio.y, largura: edificio.largura, altura: edificio.altura, porta: edificio.entrada
  }));
  MAPA_DECORACOES.forEach((objeto, indice) => objetos.push({
    id: `${objeto.tipo}_${String(indice + 1).padStart(2, '0')}`, nome: nomeDebug(objeto.tipo), x: objeto.x, y: objeto.y, largura: 1, altura: 1
  }));
  NPCS.forEach((npc) => objetos.push({ id: `npc_${npc.id}`, nome: npc.nome, x: npc.x, y: npc.y, largura: 1, altura: 1 }));
  PONTOS_PESCA.forEach((ponto, indice) => objetos.push({ id: `pesca_${indice + 1}`, nome: ponto.tipo === 'mar' ? 'ponto de pesca mar' : 'ponto de pesca lagoa', x: ponto.x, y: ponto.y, largura: 1, altura: 1 }));
  objetos.push({ id: 'terreiro_fandango', nome: 'Terreiro dos Fandangos', x: CENA_FANDANGO.x, y: CENA_FANDANGO.y, largura: 5, altura: 4 });

  objetos.forEach((objeto) => {
    const esquerda = (objeto.x - (objeto.largura > 1 ? objeto.largura / 2 : 0)) * tile - camera.x;
    const topo = (objeto.y - (objeto.altura > 1 ? objeto.altura : 1)) * tile - camera.y;
    const largura = objeto.largura * tile;
    const altura = objeto.altura * tile;

    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = Math.max(1, tile * 0.035);
    ctx.strokeRect(esquerda, topo, largura, altura);

    const texto = `${objeto.id} | ${objeto.nome}`;
    const medida = ctx.measureText(texto);
    const textoX = Math.max(2, Math.min(larguraCanvasLogica() - medida.width - 4, esquerda));
    const textoY = Math.max(10, topo - 2);
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(textoX - 2, textoY - 12, medida.width + 4, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(texto, textoX, textoY);

    if (objeto.porta) {
      ctx.strokeStyle = '#00E5FF';
      ctx.strokeRect((objeto.porta.x - 0.5) * tile - camera.x, (objeto.porta.y - 0.5) * tile - camera.y, tile, tile);
    }
  });

  ctx.restore();
}

function abrirEscolhasMissao(missaoId) {
  const missao = CONTEUDO.missoes.find((item) => item.id === missaoId);
  if (!missao) return;
  const choices = missao.escolhas.map((op) => ({ text: op.texto }));
  const personagemId = MISSOES_INFO[missaoId]?.npcId;
  dialogController.open({
    nome: nomePersonagem(personagemId),
    personagemId,
    texto: `Você concluiu as etapas de “${MISSOES_INFO[missaoId].nome}”. Agora a comunidade pode conversar sobre diferentes caminhos.`,
    choices,
    allowEscape: false,
    onChoice: (index) => concluirMissao(missaoId, index)
  });
}

function orientarEtapa(contexto) {
  if (!contexto) return;
  const { etapa, id } = contexto;
  dialogController.open({
    nome: nomePersonagem(MISSOES_INFO[id]?.npcId),
    personagemId: MISSOES_INFO[id]?.npcId,
    texto: etapa.texto,
    choices: [{ text: 'Entendi' }]
  });
}

function completarEtapaMissao(id, mostrarProxima = true) {
  const contexto = obterEtapaAtiva();
  if (!contexto || contexto.id !== id) return;
  contexto.progresso.passo += 1;
  contexto.progresso.alvosConcluidos = [];
  contexto.progresso.ordemIndice = 0;
  atualizarHud();
  salvar();
  if (contexto.progresso.passo >= contexto.missao.etapas.length) {
    abrirEscolhasMissao(id);
  } else if (mostrarProxima) {
    dialogController.open({
      nome: nomePersonagem(MISSOES_INFO[id]?.npcId),
      personagemId: MISSOES_INFO[id]?.npcId,
      texto: `Etapa registrada. ${contexto.missao.etapas[contexto.progresso.passo].texto}`,
      choices: [{ text: 'Continuar' }],
      onChoice: () => orientarEtapa(obterEtapaAtiva())
    });
  }
}

function registrarAlvoEtapa(contexto, ponto) {
  if (!contexto || !ponto) return;
  if (!contexto.progresso.alvosConcluidos.includes(ponto.id)) {
    contexto.progresso.alvosConcluidos.push(ponto.id);
  }
  const restantes = pontosDaEtapa(contexto);
  if (!restantes.length) {
    completarEtapaMissao(contexto.id);
    return;
  }
  atualizarHud();
  salvar();
  dialogController.open({
    nome: nomePersonagem(MISSOES_INFO[contexto.id]?.npcId),
    personagemId: MISSOES_INFO[contexto.id]?.npcId,
    texto: `Registro feito. Ainda falta observar ${restantes.map((item) => item.nome).join(' e ')}.`,
    typewriter: false
  });
}

function iniciarOuRetomarMissao(missaoId) {
  const missao = CONTEUDO.missoes.find((item) => item.id === missaoId);
  if (!missao || estado.missoesConcluidas.includes(missaoId)) return;
  if (estado.missaoAtiva && estado.missaoAtiva !== missaoId) {
    dialogController.open({
      nome: 'Caderno de Saberes',
      texto: `Você já está acompanhando “${MISSOES_INFO[estado.missaoAtiva].nome}”. Retome essa missão antes de começar outra.`,
      typewriter: false
    });
    return;
  }
  const nova = !estado.progressoMissoes[missaoId];
  if (nova) {
    estado.missaoAtiva = missaoId;
    estado.progressoMissoes[missaoId] = {
      passo: 0,
      total: missao.etapas.length,
      alvosConcluidos: [],
      ordemIndice: 0
    };
  }
  atualizarHud();
  salvar();
  if (!nova) {
    orientarEtapa(obterEtapaAtiva());
    return;
  }
  const personagemId = MISSOES_INFO[missaoId].npcId;
  dialogController.open({
    nome: nomePersonagem(personagemId),
    personagemId,
    texto: `${nomeJogadorAtivo()}, ${missao.abertura}`,
    choices: [{ text: 'Começar missão' }],
    onChoice: () => orientarEtapa(obterEtapaAtiva())
  });
}

function interagir() {
  if (estado.fase !== 'jogo' || pescaAnimacao || !dialogController.overlay.classList.contains('hidden')) return;
  if (estado.interiorAtivo) {
    interagirNoInterior();
    return;
  }
  if (estado.emCanoa) {
    const atracacao = atracacaoProxima();
    if (atracacao) {
      estado.emCanoa = false;
      estado.canoaEmbarcada = null;
      estado.jogador = { x: atracacao.x, y: atracacao.y, nome: nomeJogadorAtivo() };
      playerMotion = null;
      destinoAtual = null;
      salvar();
      return;
    }
  }
  const contexto = obterEtapaAtiva();
  const npcs = getNPCsNoHorario(estado.horario);
  const edificio = edificioProximo();
  const pontoPesca = pontoPescaProximo();
  const pertoDeMissao = MISSION_ORDER.find((id) => {
    if (estado.missoesConcluidas.includes(id)) return false;
    const ponto = pontoMissaoAtual(id);
    return ponto && distancia(estado.jogador.x, estado.jogador.y, ponto.x, ponto.y) <= 1.5;
  });

  if (contexto?.etapa.tipo === 'conversar') {
    const npc = npcs.find((pessoa) => pessoa.id === contexto.etapa.alvo
      && distancia(estado.jogador.x, estado.jogador.y, pessoa.x, pessoa.y) <= 1.5);
    if (npc) {
      dialogController.open({
        nome: npc.nome,
        personagemId: npc.id,
        texto: falaDoNpc(npc),
        onContinue: () => completarEtapaMissao(contexto.id)
      });
      return;
    }
  }

  if (contexto?.etapa.tipo === 'ir-ate' && edificio?.id === contexto.etapa.alvo) {
    if (edificio.enterable) {
      abrirInterior(edificio);
    } else {
      completarEtapaMissao(contexto.id);
    }
    return;
  }

  if (contexto?.etapa.tipo === 'ordenar' && edificio?.id === 'casa-de-farinha') {
    abrirInterior(edificio);
    return;
  }

  const alvo = alvoDaEtapaProximo(contexto);
  if (alvo) {
    registrarAlvoEtapa(contexto, alvo);
    return;
  }

  if (pertoDeMissao && (!estado.missaoAtiva || estado.missaoAtiva === pertoDeMissao)) {
    iniciarOuRetomarMissao(pertoDeMissao);
    return;
  }

  if (edificio?.id === 'capela') {
    dialogController.open({ nome: 'Capela da vila', texto: 'Uma pequena capela perto da praça central.', typewriter: false });
    return;
  }
  if (edificio?.id === 'peixaria') {
    estado.locaisVisitados = [...new Set([...(estado.locaisVisitados || []), 'peixaria'])];
    salvar();
    dialogController.open({
      nome: 'Peixaria da vila',
      texto: `Balcão de observação, sem compra ou venda. Produtos observáveis: ${PRODUTOS_PEIXARIA.map((item) => item.nome).join(', ')}.`,
      typewriter: false
    });
    return;
  }
  if (edificio?.enterable) {
    abrirInterior(edificio);
    return;
  }
  if (edificio && !edificio.enterable) {
    portaAnimacao = { inicio: performance.now(), edificio };
    const frases = ['Esta casa está fechada.', 'Parece que não tem ninguém.', 'A porta está trancada.'];
    dialogController.open({
      nome: 'Narrador',
      texto: frases[Math.floor(Math.random() * frases.length)],
      typewriter: false
    });
    return;
  }

  const npc = npcs.find((pessoa) => distancia(estado.jogador.x, estado.jogador.y, pessoa.x, pessoa.y) <= 1.5);
  if (npc && !pontoPesca) {
    dialogController.open({
      nome: npc.nome,
      personagemId: npc.id,
      texto: `${nomeJogadorAtivo()}, ${npc.nome} percebe você e sorri.`,
      choices: [{ text: 'Dizer oi' }],
      onChoice: () => dialogController.open({
        nome: npc.nome,
        personagemId: npc.id,
        texto: falaDoNpc(npc),
        onType: () => som.tocar(420, 0.025, 0.006)
      }),
      onType: () => som.tocar(420, 0.025, 0.006)
    });
    return;
  }

  const varaNoPier = MAPA_DECORACOES.find((item) => item.tipo === 'vara-pesca'
    && distancia(estado.jogador.x, estado.jogador.y, item.x, item.y) <= 1.5);
  if (varaNoPier && !estado.temVara) {
    estado.temVara = true;
    estado.locaisVisitados = [...new Set([...(estado.locaisVisitados || []), 'vara-pesca'])];
    mostrarNotificacaoColeta('Vara de pesca encontrada');
    dialogController.open({
      nome: 'Seu Nelson',
      personagemId: 'nelson',
      texto: 'Esta vara fica no píer. Use-a junto ao deque para pescar com cuidado.',
      typewriter: false
    });
    atualizarHud();
    salvar();
    return;
  }
  if (pontoPesca) {
    interagirComPesca(pontoPesca);
    return;
  }
  const atracacao = atracacaoProxima();
  const embarque = embarqueCanoaProximo();
  if (estado.emCanoa && atracacao) {
    estado.emCanoa = false;
    estado.canoaEmbarcada = null;
    estado.jogador = { x: atracacao.x, y: atracacao.y, nome: nomeJogadorAtivo() };
    playerMotion = null;
    salvar();
    return;
  }
  if (!estado.emCanoa && embarque) {
    estado.emCanoa = true;
    estado.canoaEmbarcada = { x: embarque.x, y: embarque.y };
    estado.jogador = { ...embarque.agua, nome: nomeJogadorAtivo() };
    playerMotion = null;
    destinoAtual = null;
    salvar();
    mostrarDicaContextual('Ao chegar perto da margem, pressione E ou toque em Interagir para sair da canoa.');
    return;
  }
  const animal = pontoPesca ? null : faunaProxima();
  if (animal) {
    registrarFauna(animal.especieId);
    return;
  }
  if (pontoPesca) {
    interagirComPesca(pontoPesca);
    return;
  }

  const elementoLagoa = elementoLagoaProximo();
  if (elementoLagoa) {
    const idRegistro = `lagoa-${elementoLagoa.id}`;
    if (!estado.locaisVisitados.includes(idRegistro)) estado.locaisVisitados.push(idRegistro);
    salvar();
    dialogController.open({
      nome: elementoLagoa.nome,
      texto: `${elementoLagoa.texto}`,
      typewriter: false
    });
    return;
  }

  if (distancia(estado.jogador.x, estado.jogador.y, estado.cachorro.x, estado.cachorro.y) <= 1.5) {
    dogPetUntil = animationTick + 75;
    if (som.enabled) som.tocar(660, 0.08, 0.025);
    dialogController.open({
      nome: 'Cachorro',
      texto: 'O cachorro abana o rabo, feliz com o carinho.',
      onType: () => som.tocar(420, 0.025, 0.006)
    });
  }
}

function abrirInterior(edificio) {
  playerMotion = null;
  destinoAtual = null;
  document.getElementById('btn-interagir').classList.add('hidden');
  estado.interiorAtivo = edificio.id;
  estado.cenaAtual = 'interior';
  const interior = INTERIORES[edificio.id];
  estado.posicaoInterior = interior ? { ...interior.spawn } : { x: 4, y: 5 };
  const panel = document.getElementById('interior-panel');
  panel.inert = false;
  panel.classList.remove('hidden');
  panel.classList.toggle('sem-fade', estado.reduzirMovimento);
  document.getElementById('interior-scroll').scrollTop = 0;
  document.getElementById('btn-sair-interior').focus({ preventScroll: true });
  document.getElementById('interior-titulo').textContent = interior?.titulo || nomeEdificio(edificio);
  const contexto = obterEtapaAtiva();
  if (contexto?.etapa.tipo === 'ir-ate' && contexto.etapa.alvo === edificio.id) {
    completarEtapaMissao(contexto.id, false);
  }
  const etapaAtivaNoInterior = obterEtapaAtiva();
  if (edificio.id === 'casa-de-farinha'
    && etapaAtivaNoInterior?.id === 'roca'
    && etapaAtivaNoInterior.etapa.tipo === 'ordenar'
    && estado.progressoFarinha >= ETAPAS_FARINHA.length) {
    completarEtapaMissao('roca', false);
  }
  renderizarInterior(edificio);
  const etapaInterior = obterEtapaAtiva();
  if (edificio.id === 'casa-musical' && etapaInterior?.id === 'fandango' && etapaInterior.etapa.tipo === 'encontrar') {
    document.getElementById('interior-feedback').textContent = 'Toque nos três instrumentos para observá-los e registrá-los no Caderno.';
  }
  salvar();
}

function renderizarInterior(edificio) {
  const interior = INTERIORES[edificio.id];
  const sala = document.getElementById('interior-sala');
  const scrollInterior = document.getElementById('interior-scroll');
  const scrollTopAnterior = scrollInterior.scrollTop;
  const descricao = document.getElementById('interior-descricao');
  const feedback = document.getElementById('interior-feedback');
  if (!interior) return;

  sala.replaceChildren();
  sala.parentElement.querySelector('.interior-controles')?.remove();
  sala.className = 'interior-canvas-wrap';
  feedback.textContent = '';

  const tile = 16 * escalaDoMapa();
  const larguraSala = interior.largura * tile;
  const alturaSala = interior.altura * tile;
  const larguraViewport = Math.max(1, Math.floor(sala.clientWidth || document.getElementById('interior-panel').clientWidth - 24));
  const alturaViewport = Math.max(tile * 5, Math.floor(window.innerHeight * 0.52));
  const larguraJanela = Math.min(larguraSala, larguraViewport);
  const alturaJanela = Math.min(alturaSala, alturaViewport);

  const canvasInterior = document.createElement('canvas');
  canvasInterior.width = larguraSala;
  canvasInterior.height = alturaSala;
  canvasInterior.className = 'interior-canvas';
  canvasInterior.setAttribute('role', 'img');
  canvasInterior.setAttribute('aria-label', `Cena interna de ${interior.titulo}`);
  canvasInterior.setAttribute('aria-describedby', 'interior-feedback');
  canvasInterior.style.setProperty('--interior-tiles-w', String(interior.largura));
  const ctxInterior = canvasInterior.getContext('2d');
  ctxInterior.imageSmoothingEnabled = false;

  sala.style.width = `${larguraJanela}px`;
  sala.style.height = `${alturaJanela}px`;
  sala.style.marginInline = 'auto';
  sala.style.position = 'relative';
  sala.style.justifyContent = 'flex-start';
  sala.style.alignItems = 'flex-start';
  sala.style.gap = '0';
  ctxInterior.fillStyle = '#F6E7C1';
  ctxInterior.fillRect(0, 0, canvasInterior.width, canvasInterior.height);
  for (let y = 0; y < interior.altura; y += 1) {
    for (let x = 0; x < interior.largura; x += 1) {
      desenharPiso(ctxInterior, 'madeira', x * tile, y * tile, tile, x * 23 + y);
    }
  }

  // Paredes de tábuas com vigas e rodapé, na mesma madeira das fachadas.
  ctxInterior.fillStyle = '#8A5A33';
  ctxInterior.fillRect(0, 0, canvasInterior.width, tile);
  ctxInterior.fillStyle = '#68452B';
  ctxInterior.fillRect(0, tile * 0.82, canvasInterior.width, tile * 0.18);
  for (let x = 0; x < interior.largura; x += 1) {
    if (x % 3 === 0) ctxInterior.fillRect(x * tile, 0, Math.max(2, tile * 0.07), tile * 0.82);
    ctxInterior.fillStyle = '#A78354';
    ctxInterior.fillRect(x * tile + tile * 0.22, tile * 0.32, tile * 0.14, tile * 0.035);
    ctxInterior.fillRect(x * tile + tile * 0.64, tile * 0.58, tile * 0.17, tile * 0.035);
    ctxInterior.fillStyle = '#8A5A33';
  }
  ctxInterior.fillStyle = '#8A5A33';
  ctxInterior.fillRect(0, tile, tile * 0.42, canvasInterior.height - tile * 2);
  ctxInterior.fillRect(canvasInterior.width - tile * 0.42, tile, tile * 0.42, canvasInterior.height - tile * 2);
  ctxInterior.fillStyle = '#68452B';
  ctxInterior.fillRect(tile * 0.38, tile, tile * 0.08, canvasInterior.height - tile * 2);
  ctxInterior.fillRect(canvasInterior.width - tile * 0.46, tile, tile * 0.08, canvasInterior.height - tile * 2);

  const portaX = (interior.saida.x + 0.5) * tile;
  const portaY = (interior.saida.y + 1) * tile;
  ctxInterior.fillStyle = '#68452B';
  ctxInterior.fillRect(0, canvasInterior.height - tile * 0.18, portaX - tile * 0.43, tile * 0.18);
  ctxInterior.fillRect(portaX + tile * 0.43, canvasInterior.height - tile * 0.18, canvasInterior.width - portaX - tile * 0.43, tile * 0.18);
  ctxInterior.fillStyle = '#5A3A1E';
  ctxInterior.fillRect(portaX - tile * 0.42, portaY - tile * 0.92, tile * 0.84, tile);
  ctxInterior.fillStyle = '#A78354';
  ctxInterior.fillRect(portaX - tile * 0.28, portaY - tile * 0.82, tile * 0.56, tile * 0.82);
  ctxInterior.fillStyle = '#D9A441';
  ctxInterior.fillRect(portaX + tile * 0.18, portaY + tile * 0.1, tile * 0.05, tile * 0.05);

  const camX = Math.max(0, Math.min(larguraSala - larguraJanela, (estado.posicaoInterior.x + 0.5) * tile - larguraJanela / 2));
  const camY = Math.max(0, Math.min(alturaSala - alturaJanela, (estado.posicaoInterior.y + 0.5) * tile - alturaJanela * 0.62));
  canvasInterior.dataset.cameraX = String(camX);
  canvasInterior.dataset.cameraY = String(camY);
  ctxInterior.save();
  ctxInterior.translate(-camX, -camY);
  const elementos = interior.objetos.map((objeto, indice) => ({ tipo: 'objeto', objeto, indice, y: objeto.y }));
  if (interior.professora) elementos.push({ tipo: 'professora', x: interior.professora.x, y: interior.professora.y, id: interior.professora.id });
  if (interior.instrutor) elementos.push({ tipo: 'instrutor', x: interior.instrutor.x, y: interior.instrutor.y, id: interior.instrutor.id });
  (interior.alunos || []).forEach((aluno, indice) => elementos.push({ tipo: 'aluno', x: aluno.x, y: aluno.y, indice }));
  elementos.push({ tipo: 'player', y: estado.posicaoInterior.y, x: estado.posicaoInterior.x });
  elementos.sort((a, b) => a.y - b.y);

  elementos.forEach((elemento) => {
    if (elemento.tipo === 'player') {
      const centerX = (elemento.x + 0.5) * tile;
      const baseY = (elemento.y + 1) * tile;
      desenharSombraInterno(ctxInterior, centerX, baseY, tile);
      desenharJogador(ctxInterior, centerX, baseY, tile, estado.reduzirMovimento ? 0 : animationTick, playerDirection, false, estado.avatar);
      return;
    }

    if (elemento.tipo === 'professora' || elemento.tipo === 'instrutor' || elemento.tipo === 'aluno') {
      const centerX = (elemento.x + 0.5) * tile;
      const baseY = (elemento.y + 1) * tile;
      desenharSombraInterno(ctxInterior, centerX, baseY, tile);
      if (elemento.tipo === 'professora' || elemento.tipo === 'instrutor') {
        desenharNpc(ctxInterior, centerX, baseY, tile, 0, elemento.id);
        if (conceitoEscolaAtivo) desenharPensamentoEscola(ctxInterior, centerX, baseY - tile * 1.35, tile, conceitoEscolaAtivo);
      } else {
        desenharAlunoSentado(ctxInterior, centerX, baseY, tile, elemento.indice);
      }
      return;
    }

    const objeto = elemento.objeto;
    const centerX = (objeto.x + 0.5) * tile;
    const baseY = (objeto.y + 1) * tile;
    desenharSombraInterno(ctxInterior, centerX, baseY, tile);
    if (objeto.tipo === 'ritmo') {
      desenharNpc(ctxInterior, centerX, baseY, tile, 0, objeto.id);
      return;
    }
    const tipoSprite = objeto.tipo === 'farinha' && objeto.etapa === 0
      ? 'mandioca'
      : objeto.tipo === 'farinha' && objeto.etapa === 1
        ? 'ralador'
        : objeto.tipo === 'farinha' && objeto.etapa === 2
      ? 'prensa'
      : objeto.tipo === 'farinha' && objeto.etapa === 3
        ? 'peneira'
        : objeto.tipo === 'farinha' && objeto.etapa === 4
          ? 'forno'
          : objeto.tipo === 'musica'
            ? objeto.id
            : objeto.tipo === 'produto'
              ? (objeto.id === 'peixe-seco' || objeto.id === 'peixe' ? 'peixe' : objeto.id === 'farinha' ? 'saco' : objeto.id === 'frutas' ? 'frutas' : objeto.id === 'artesanato' ? 'artesanato' : 'biju')
              : 'prensa';
    if (['prensa', 'peneira', 'forno', 'saco', 'mandioca', 'ralador', 'biju', 'frutas', 'artesanato', 'viola', 'rabeca', 'adufo', 'peixe', 'placa'].includes(tipoSprite)) {
      desenharObjeto(ctxInterior, tipoSprite, centerX, baseY, tile, elemento.indice);
    }
  });
  ctxInterior.restore();

  const controles = document.createElement('div');
  controles.className = 'interior-controles';
  interior.objetos.forEach((objeto) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = objeto.nome;
    botao.addEventListener('click', () => {
      estado.posicaoInterior = { x: objeto.x, y: objeto.y };
      renderizarInterior(edificio);
      interagirNoInterior();
    });
    controles.appendChild(botao);
  });
  if (interior.professora) {
    const conversar = document.createElement('button');
    conversar.type = 'button';
    conversar.textContent = 'Conversar com a professora';
    conversar.addEventListener('click', () => {
      estado.posicaoInterior = { x: interior.professora.x, y: interior.professora.y + 1 };
      renderizarInterior(edificio);
      interagirNoInterior();
    });
    controles.appendChild(conversar);
  }
  if (interior.instrutor) {
    const conversar = document.createElement('button');
    conversar.type = 'button';
    conversar.textContent = 'Conversar com Dona Cida';
    conversar.addEventListener('click', () => {
      estado.posicaoInterior = { x: interior.instrutor.x - 1, y: interior.instrutor.y };
      renderizarInterior(edificio);
      interagirNoInterior();
    });
    controles.appendChild(conversar);
  }
  const sair = document.createElement('button');
  sair.type = 'button';
  sair.textContent = 'Sair pela porta';
  sair.className = 'btn-secondary';
  sair.addEventListener('click', fecharInterior);
  controles.appendChild(sair);

  canvasInterior.style.cursor = 'pointer';
  canvasInterior.addEventListener('click', (event) => {
    const rect = canvasInterior.getBoundingClientRect();
    const x = Math.max(0, Math.min(interior.largura - 1,
      Math.floor(((event.clientX - rect.left) * canvasInterior.width / rect.width + Number(canvasInterior.dataset.cameraX)) / tile)));
    const y = Math.max(0, Math.min(interior.altura - 1,
      Math.floor(((event.clientY - rect.top) * canvasInterior.height / rect.height + Number(canvasInterior.dataset.cameraY)) / tile)));
    const clicado = interior.objetos
      .map((objeto) => ({ objeto, distancia: Math.abs(objeto.x - x) + Math.abs(objeto.y - y) }))
      .filter((item) => item.distancia <= 1)
      .sort((a, b) => a.distancia - b.distancia)[0]?.objeto;
    if (clicado) {
      estado.posicaoInterior = { x: clicado.x, y: clicado.y };
      salvar();
      interagirNoInterior();
      return;
    }
    if (Math.abs(interior.saida.x - x) + Math.abs(interior.saida.y - y) <= 1) {
      fecharInterior();
      return;
    }
    estado.posicaoInterior = { x, y };
    salvar();
    renderizarInterior(edificio);
  });

  sala.append(canvasInterior);
  sala.after(controles);
  scrollInterior.scrollTop = scrollTopAnterior;

  if (edificio.id === 'casa-de-farinha') {
    descricao.textContent = 'Dona Cida acompanha cinco estações. Toque em cada etapa na ordem para ouvir uma explicação curta.';
  } else if (edificio.id === 'casa-musical') {
    descricao.textContent = 'Observe os instrumentos e converse com Mestre Tião sobre a roda do fandango.';
  } else if (edificio.id === 'mercadinho') {
    descricao.textContent = 'Toque em cada produto para observar sua ilustração e descrição. Não há compra ou venda.';
  } else if (edificio.id === 'escola') {
    descricao.textContent = 'Converse com a professora para conhecer dois conceitos.';
  } else {
    descricao.textContent = 'Você entrou no armazém da vila.';
  }
}

function desenharSombraInterno(ctxInterior, centerX, baseY, tile = 16) {
  ctxInterior.fillStyle = 'rgba(43,26,14,0.22)';
  ctxInterior.beginPath();
  ctxInterior.ellipse(centerX, baseY + tile * 0.12, tile * 0.28, tile * 0.08, 0, 0, Math.PI * 2);
  ctxInterior.fill();
}

function desenharPensamentoEscola(ctxInterior, centerX, baseY, tile, conceitoId) {
  const conceito = CONCEITOS_ESCOLA.find((item) => item.id === conceitoId);
  if (!conceito) return;
  const largura = tile * 3.4;
  const altura = tile * 1.6;
  const x = centerX + tile * 0.25;
  const y = baseY - altura;
  ctxInterior.save();
  ctxInterior.fillStyle = '#F6E7C1';
  ctxInterior.strokeStyle = '#68452B';
  ctxInterior.lineWidth = Math.max(1, tile / 12);
  ctxInterior.beginPath();
  ctxInterior.roundRect(x, y, largura, altura, tile * 0.18);
  ctxInterior.fill();
  ctxInterior.stroke();
  ctxInterior.beginPath();
  ctxInterior.arc(x - tile * 0.12, y + altura * 0.78, tile * 0.12, 0, Math.PI * 2);
  ctxInterior.fill();
  ctxInterior.stroke();
  ctxInterior.fillStyle = '#3B2A1A';
  ctxInterior.font = `bold ${Math.max(7, tile * 0.25)}px sans-serif`;
  ctxInterior.textAlign = 'left';
  ctxInterior.textBaseline = 'middle';
  const textoX = x + tile * 0.16;
  const larguraTexto = tile * 2.35;
  const linhas = [];
  conceito.titulo.split(/\s+/).forEach((palavra) => {
    const atual = linhas[linhas.length - 1];
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (atual && ctxInterior.measureText(tentativa).width > larguraTexto) linhas.push(palavra);
    else if (atual) linhas[linhas.length - 1] = tentativa;
    else linhas.push(palavra);
  });
  const alturaLinha = tile * 0.34;
  const inicioTextoY = y + altura * 0.5 - ((linhas.length - 1) * alturaLinha) / 2;
  linhas.slice(0, 3).forEach((linha, indice) => {
    ctxInterior.fillText(linha, textoX, inicioTextoY + indice * alturaLinha, larguraTexto);
  });
  const escalaIlustracao = conceito.ilustracao === 'canoa' ? 0.32 : 0.72;
  desenharObjeto(ctxInterior, conceito.ilustracao, x + largura - tile * 0.48, y + altura * 0.82, tile * escalaIlustracao, 0);
  ctxInterior.restore();
}

function moverNoInterior(dx, dy) {
  if (!estado.interiorAtivo) return;
  const interior = INTERIORES[estado.interiorAtivo];
  if (!interior) return;
  const posicao = estado.posicaoInterior || interior.spawn;
  const x = Math.max(0, Math.min(interior.largura - 1, posicao.x + dx));
  const y = Math.max(0, Math.min(interior.altura - 1, posicao.y + dy));
  estado.posicaoInterior = { x, y };
  const edificio = EDIFICIOS.find((item) => item.id === estado.interiorAtivo);
  if (edificio) renderizarInterior(edificio);
  salvar();
}

function objetoInteriorProximo() {
  const interior = INTERIORES[estado.interiorAtivo];
  if (!interior) return null;
  const posicao = estado.posicaoInterior || interior.spawn;
  const objeto = interior.objetos.find((item) => Math.abs(item.x - posicao.x) + Math.abs(item.y - posicao.y) <= 1);
  if (objeto) return objeto;
  if (interior.professora && Math.abs(interior.professora.x - posicao.x) + Math.abs(interior.professora.y - posicao.y) <= 1) {
    return { ...interior.professora, tipo: 'professora', nome: 'Professora Marina' };
  }
  if (interior.instrutor && Math.abs(interior.instrutor.x - posicao.x) + Math.abs(interior.instrutor.y - posicao.y) <= 1) {
    return { ...interior.instrutor, tipo: 'instrutor', nome: 'Dona Cida' };
  }
  return null;
}

function interagirNoInterior() {
  const interior = INTERIORES[estado.interiorAtivo];
  if (!interior) return;
  const posicao = estado.posicaoInterior || interior.spawn;
  if (posicao.x === interior.saida.x && posicao.y === interior.saida.y) {
    fecharInterior();
    return;
  }
  const objeto = objetoInteriorProximo();
  const feedback = document.getElementById('interior-feedback');
  if (!objeto) {
    feedback.textContent = 'Aproxime-se de uma estação e use Interagir.';
    return;
  }

  if (objeto.tipo === 'instrutor') {
    const contextoInstrutor = obterEtapaAtiva();
    if (contextoInstrutor?.etapa.tipo === 'conversar' && contextoInstrutor.etapa.alvo === objeto.id) {
      dialogController.open({
        nome: 'Dona Cida',
        personagemId: 'dona-cida',
        texto: `${TEXTO_CIDA_FINALIZACAO.texto}`,
        typewriter: false,
        onContinue: () => {
          completarEtapaMissao(contextoInstrutor.id);
        }
      });
      return;
    }
    dialogController.open({
      nome: 'Dona Cida',
      personagemId: 'dona-cida',
      texto: 'Posso acompanhar cada estação. Observe os objetos e faça uma etapa por vez.',
      typewriter: false
    });
    return;
  }

  if (objeto.tipo === 'professora') {
    const conceito = CONCEITOS_ESCOLA.find((item) => !estado.conceitosEscola.includes(item.id)) || CONCEITOS_ESCOLA[0];
    conceitoEscolaAtivo = conceito.id;
    dialogController.open({
      nome: 'Professora Marina',
      personagemId: 'professora-marina',
      texto: conceito.texto,
      typewriter: false,
      onContinue: () => {
        if (!estado.conceitosEscola.includes(conceito.id)) estado.conceitosEscola.push(conceito.id);
        salvar();
        renderizarInterior({ id: 'escola' });
      }
    });
    renderizarInterior({ id: 'escola' });
    return;
  }

  if (objeto.tipo === 'farinha') {
    if (estado.progressoFarinha !== objeto.etapa) {
      const proximaEtapa = Math.min(estado.progressoFarinha, ETAPAS_FARINHA.length - 1);
      dialogController.open({
        nome: 'Dona Cida',
        personagemId: 'dona-cida',
        texto: estado.progressoFarinha >= ETAPAS_FARINHA.length
          ? 'As cinco estações já foram registradas. Você pode observar os objetos de novo.'
          : `Vamos seguir uma etapa por vez. Primeiro, ${interior.objetos[proximaEtapa].nome.toLowerCase()}. ${ETAPAS_FARINHA[proximaEtapa].explicacao}`,
        typewriter: false
      });
      return;
    }
    const etapaFarinha = ETAPAS_FARINHA[objeto.etapa];
    estado.progressoFarinha += 1;
    feedback.textContent = etapaFarinha.explicacao;
    ajustarIndicadores(estado, objeto.etapa === 4 ? { Cultura: 1, Renda: 1 } : { Cultura: 1 });
    if (!estado.cartasColetadas.includes('A farinha guarda memória de trabalho coletivo.')) {
      estado.cartasColetadas.push('A farinha guarda memória de trabalho coletivo.');
    }
    const ultimaEtapa = estado.progressoFarinha >= ETAPAS_FARINHA.length;
    if (ultimaEtapa) {
      estado.farinhaColetada = true;
      estado.inventario.farinha = (Number(estado.inventario.farinha) || 0) + 1;
      feedback.textContent = 'Processo concluído. A farinha foi registrada na mochila.';
      mostrarNotificacaoColeta('Farinha +1');
    }
    atualizarHud();
    salvar();
    const contextoFarinha = obterEtapaAtiva();
    if (ultimaEtapa && contextoFarinha?.id === 'roca' && contextoFarinha.etapa.tipo === 'ordenar') {
      completarEtapaMissao('roca');
      return;
    }
    dialogController.open({
      nome: 'Dona Cida',
      personagemId: 'dona-cida',
      texto: ultimaEtapa
        ? `${etapaFarinha.explicacao} A farinha foi registrada na mochila.`
        : `${etapaFarinha.explicacao} Próxima estação: ${interior.objetos[estado.progressoFarinha].nome}.`,
      typewriter: false
    });
    return;
  }

  if (objeto.tipo === 'musica') {
    const ficha = FICHAS_INSTRUMENTOS.find((item) => item.id === objeto.id);
    const textoFicha = ficha?.texto || objeto.descricao;
    const contextoFandango = obterEtapaAtiva();
    const registrarInstrumento = () => {
      const idRegistro = `instrumento-${objeto.id}`;
      if (!estado.locaisVisitados.includes(idRegistro)) estado.locaisVisitados.push(idRegistro);
      atualizarHud();
      salvar();
      feedback.textContent = `${ficha?.nome || objeto.nome}: ${textoFicha}`;
    };
    if (contextoFandango?.id === 'fandango' && contextoFandango.etapa.tipo === 'encontrar') {
      dialogController.open({
        nome: ficha?.nome || objeto.nome,
        texto: `${textoFicha} `,
        typewriter: false,
        onContinue: () => {
          registrarInstrumento();
          registrarAlvoEtapa(contextoFandango, { id: objeto.id, nome: ficha?.nome || objeto.nome });
        }
      });
      return;
    }
    registrarInstrumento();
    dialogController.open({
      nome: ficha?.nome || objeto.nome,
      texto: `${textoFicha} `,
      typewriter: false
    });
    if (som.enabled) {
      const frequencia = { viola: 220, rabeca: 330, adufo: 150 }[objeto.id] || 220;
      som.tocar(frequencia, 0.18, 0.035);
    } else {
      feedback.textContent += ' Visualização rítmica ativa: toque, pausa, toque.';
    }
    return;
  }

  if (objeto.tipo === 'ritmo') {
    const contextoFandango = obterEtapaAtiva();
    if (contextoFandango?.id === 'fandango' && contextoFandango.etapa.tipo === 'conversar' && contextoFandango.etapa.alvo === 'tiao') {
      dialogController.open({
        nome: 'Mestre Tião',
        personagemId: 'tiao',
        texto: `${EXPLICACAO_FANDANGO.texto}`,
        typewriter: false,
        onContinue: () => {
          completarEtapaMissao('fandango');
        }
      });
      return;
    }
    ritmoTentativa = [];
    function abrirRitmo() {
      dialogController.open({
        nome: 'Mestre Tiao',
        personagemId: 'tiao',
        texto: `Sequência ${ritmoTentativa.length + 1} de 3: forte, pausa ou forte?`,
        choices: [{ text: 'Forte' }, { text: 'Pausa' }, { text: 'Pular atividade' }],
        onChoice: (indice) => {
          if (indice === 2) {
            ritmoTentativa = [];
            feedback.textContent = 'Atividade pulada. Você ainda pode ouvir os instrumentos.';
            return;
          }
          ritmoTentativa.push(indice);
          if (ritmoTentativa.length < 3) {
            abrirRitmo();
            return;
          }
          if (ritmoTentativa.join(',') === '0,1,0') {
            estado.ritmoMusicalConcluido = true;
            ajustarIndicadores(estado, { Cultura: 1, Comunidade: 1 });
            feedback.textContent = 'Ritmo registrado. O Terreiro dos Fandangos ficou mais vivo.';
            atualizarHud();
            salvar();
          } else {
            ritmoTentativa = [];
            feedback.textContent = 'Quase: tente novamente. A sequência é forte, pausa, forte. Tentativas ilimitadas.';
          }
        }
      });
    }
    dialogController.open({
      nome: 'Mestre Tião',
      personagemId: 'tiao',
      texto: `${EXPLICACAO_FANDANGO.texto} Quer experimentar uma sequência curta?`,
      choices: [{ text: 'Experimentar ritmo' }, { text: 'Ouvir os instrumentos primeiro' }],
      typewriter: false,
      onChoice: (indice) => {
        if (indice === 0) abrirRitmo();
        else feedback.textContent = EXPLICACAO_FANDANGO.texto;
      }
    });
    return;
  }

  if (objeto.tipo === 'produto' && objeto.retirar) {
    const mapaInventario = {
      farinha: 'farinha',
      peixe: 'peixe',
      'produtos-comunidade': 'produtos-comunidade'
    };
    const chave = mapaInventario[objeto.id];
    if (!chave) {
      feedback.textContent = `${objeto.nome}: produto não possui ação configurada.`;
      return;
    }
    dialogController.open({
      nome: 'Armazém da vila',
      texto: `O que fazer com ${objeto.nome.toLowerCase()}?`,
      choices: [{ text: 'Guardar 1 item' }, { text: 'Retirar 1 item' }, { text: 'Cancelar' }],
      onChoice: (indice) => {
        if (indice === 0) {
          estado.inventario[chave] = (Number(estado.inventario[chave]) || 0) + 1;
          feedback.textContent = `${objeto.nome} guardado no inventário.`;
        } else if (indice === 1) {
          if (Number(estado.inventario[chave]) > 0) {
            estado.inventario[chave] -= 1;
            if (estado.inventario[chave] <= 0) delete estado.inventario[chave];
            feedback.textContent = `${objeto.nome} retirado do inventário.`;
          } else {
            feedback.textContent = `Não há ${objeto.nome.toLowerCase()} disponível para retirar.`;
          }
        } else {
          feedback.textContent = 'Nenhuma alteração feita no inventário.';
        }
        atualizarHud();
        salvar();
      }
    });
    return;
  }

  if (objeto.tipo === 'produto') {
    feedback.textContent = `${objeto.nome}: ${objeto.descricao}`;
    if (!estado.locaisVisitados.includes(`produto-${objeto.id}`)) {
      estado.locaisVisitados.push(`produto-${objeto.id}`);
      ajustarIndicadores(estado, { Cultura: 1 });
      atualizarHud();
      salvar();
    }
  }
}

function fecharInterior() {
  const panel = document.getElementById('interior-panel');
  panel.inert = true;
  panel.classList.add(estado.reduzirMovimento ? 'hidden' : 'fechando');
  setTimeout(() => {
    panel.classList.add('hidden');
    panel.classList.remove('fechando');
  }, estado.reduzirMovimento ? 0 : 220);
  estado.interiorAtivo = null;
  conceitoEscolaAtivo = null;
  estado.cenaAtual = 'exterior';
  estado.posicaoInterior = null;
  salvar();
}

function interagirComPesca(ponto) {
  if (!estado.temVara) {
    dialogController.open({
      nome: 'Caderno de Saberes',
      texto: 'Você não tem a vara disponível. Procure uma vara no píer ou retome a atividade de pesca.',
      typewriter: false
    });
    return;
  }
  if (estado.peixesDisponiveis <= 0) {
    dialogController.open({
      nome: 'Caderno de Saberes',
      texto: 'Hoje há poucos peixes disponíveis por aqui. Você pode observar o mar e voltar em outro horário.',
      typewriter: false
    });
    return;
  }
  if (estado.horariosDePesca.includes(estado.horario)) {
    dialogController.open({
      nome: 'Seu Nelson',
      personagemId: 'nelson',
      texto: 'Neste horário, a pesca já foi registrada. Observar o tempo também faz parte do cuidado.',
      typewriter: false
    });
    return;
  }
  dialogController.open({
    nome: 'Seu Nelson',
    personagemId: 'nelson',
    texto: 'A pesca é uma atividade de atenção. O que você prefere fazer?',
    choices: [
      { text: 'Tentar uma pesca curta e cuidadosa.' },
      { text: 'Esperar e observar o tempo.' }
    ],
    onChoice: (indice) => {
      if (indice === 0) iniciarAnimacaoPesca(ponto);
    }
  });
}

function iniciarAnimacaoPesca(ponto) {
  pontoDaPescaAtual = ponto;
  if (estado.reduzirMovimento) {
    abrirEscolhaPeixe();
    return;
  }
  playerMotion = null;
  destinoAtual = null;
  const agua = ponto.agua || ponto;
  const direcao = agua.x < estado.jogador.x ? 'left'
    : agua.x > estado.jogador.x ? 'right'
      : agua.y >= estado.jogador.y ? 'down' : 'up';
  playerDirection = direcao;
  pescaAnimacao = { fase: 'lancamento', inicio: performance.now(), ponto, direcao };
}

function atualizarAnimacaoPesca(agora) {
  if (!pescaAnimacao || estado.pausa) return;
  const duracoes = { lancamento: 520, fisgada: 620, salto: 820 };
  if (agora - pescaAnimacao.inicio < duracoes[pescaAnimacao.fase]) return;

  if (pescaAnimacao.fase === 'lancamento') {
    pescaAnimacao = { ...pescaAnimacao, fase: 'fisgada', inicio: agora };
    if (som.enabled) {
      som.tocar(740, 0.08, 0.025);
      som.tocar(980, 0.12, 0.025);
    }
  } else if (pescaAnimacao.fase === 'fisgada') {
    pescaAnimacao = { ...pescaAnimacao, fase: 'salto', inicio: agora };
  } else {
    pescaAnimacao = null;
    abrirEscolhaPeixe();
  }
}

function abrirEscolhaPeixe() {
  dialogController.open({
    nome: 'Seu Nelson',
    personagemId: 'nelson',
    texto: 'Um peixe fisgou. Você prefere guardar para compartilhar ou devolver ao mar?',
    choices: [
      { text: 'Guardar para compartilhar.' },
      { text: 'Devolver ao mar.' }
    ],
    onChoice: (indice) => registrarPesca(indice === 0)
  });
}

function sortearEspecie() {
  const pesoTotal = ESPECIES_PEIXES.reduce((total, especie) => total + especie.raridade, 0);
  let sorte = Math.random() * pesoTotal;
  for (const especie of ESPECIES_PEIXES) {
    sorte -= especie.raridade;
    if (sorte <= 0) return especie;
  }
  return ESPECIES_PEIXES[0];
}

function registrarPesca(guardar) {
  const especie = sortearEspecie();
  if (guardar) {
    estado.peixesDisponiveis = Math.max(0, estado.peixesDisponiveis - 1);
    estado.inventario.peixe = (Number(estado.inventario.peixe) || 0) + 1;
    ajustarIndicadores(estado, { Renda: 1 });
  } else {
    estado.peixesDisponiveis = Math.min(5, estado.peixesDisponiveis + 1);
    ajustarIndicadores(estado, { Ambiente: 1 });
  }
  estado.horariosDePesca.push(estado.horario);
  pescaResultadoAnimacao = {
    guardar,
    especieId: especie.id,
    ponto: pontoDaPescaAtual || pontoPescaProximo(),
    inicio: performance.now(),
    ultimoTick: performance.now()
  };
  if (!estado.colecaoPeixes.includes(especie.id)) estado.colecaoPeixes.push(especie.id);
  const carta = CONTEUDO.cartas.find((item) => item.id === 'registro-pesca');
  if (carta && !estado.cartasColetadas.includes(carta.texto)) {
    estado.cartasColetadas.push(carta.texto);
  }
  dialogController.open({
    nome: 'Caderno de Saberes',
    texto: guardar
      ? `Você encontrou ${especie.nome}. ${especie.ficha} Restam ${estado.peixesDisponiveis} peixes disponíveis no cenário.`
      : `Você encontrou ${especie.nome} e devolveu ao mar. ${especie.ficha} Há ${estado.peixesDisponiveis} peixes disponíveis no cenário.`,
    typewriter: false
  });
  atualizarHud();
  salvar();
}

function atualizarAnimacaoResultadoPesca(agora) {
  if (!pescaResultadoAnimacao) return;
  const delta = Math.max(0, agora - pescaResultadoAnimacao.ultimoTick);
  if (estado.reduzirMovimento) pescaResultadoAnimacao.inicio += delta;
  pescaResultadoAnimacao.ultimoTick = agora;
  if (!estado.reduzirMovimento && agora - pescaResultadoAnimacao.inicio >= 1050) pescaResultadoAnimacao = null;
}

function moverPlayer(dx, dy, agora = performance.now()) {
  if (estado.fase !== 'jogo' || estado.pausa || estado.interiorAtivo || pescaAnimacao || !dialogController.overlay.classList.contains('hidden')) return;
  if (playerMotion || agora < playerNextStepAt) return;
  const origem = { x: estado.jogador.x, y: estado.jogador.y };
  const destino = { x: origem.x + dx, y: origem.y + dy };
  if (!isPassable(destino.x, destino.y, estado.emCanoa ? 'canoa' : 'pe')) return;
  playerDirection = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  playerMotion = { origem, destino, inicio: agora, duracao: estado.reduzirMovimento ? 1 : 180 };
}

function progressoDoMovimento(movimento, agora) {
  if (!movimento) return 1;
  return Math.min(1, (agora - movimento.inicio) / movimento.duracao);
}

function posicaoVisual(posicao, movimento, agora) {
  if (!movimento) return posicao;
  const progresso = progressoDoMovimento(movimento, agora);
  return {
    x: movimento.origem.x + (movimento.destino.x - movimento.origem.x) * progresso,
    y: movimento.origem.y + (movimento.destino.y - movimento.origem.y) * progresso
  };
}

function atualizarMovimentoPlayer(agora) {
  if (!playerMotion || progressoDoMovimento(playerMotion, agora) < 1) return;
  estado.jogador = { ...playerMotion.destino, nome: nomeJogadorAtivo() };
  playerMotion = null;
  playerNextStepAt = agora + 35;
  if (som.enabled) som.tocar(220, 0.05, 0.012);
  salvar();
}

function atualizarCachorro(agora) {
  if (estado.reduzirMovimento) return;
  if (dogMotion) {
    if (progressoDoMovimento(dogMotion, agora) >= 1) {
      estado.cachorro = dogMotion.destino;
      dogMotion = null;
    }
    return;
  }
  if (agora < dogNextMoveAt) return;

  const direcoes = [
    { x: 1, y: 0, nome: 'right' },
    { x: -1, y: 0, nome: 'left' },
    { x: 0, y: 1, nome: 'down' },
    { x: 0, y: -1, nome: 'up' }
  ].sort(() => Math.random() - 0.5);
  const proximo = direcoes.find((direcao) => {
    const x = estado.cachorro.x + direcao.x;
    const y = estado.cachorro.y + direcao.y;
    return x >= 8 && x <= 18 && y >= 19 && y <= 25
      && isPassable(x, y)
      && distancia(x, y, estado.jogador.x, estado.jogador.y) > 1.5;
  });

  dogNextMoveAt = agora + 1600 + Math.random() * 1800;
  if (!proximo) return;
  dogDirection = proximo.nome;
  dogMotion = {
    origem: { ...estado.cachorro },
    destino: { x: estado.cachorro.x + proximo.x, y: estado.cachorro.y + proximo.y },
    inicio: agora,
    duracao: 420
  };
}

function escalaDoMapa() {
  const larguraCanvas = canvas.clientWidth || larguraCanvasLogica();
  const alturaCanvas = canvas.clientHeight || alturaCanvasLogica();
  const celular = larguraCanvas <= 540;
  const larguraDesejadaEmTiles = celular ? 11 : 15;
  const alturaDesejadaEmTiles = celular && alturaCanvas >= larguraCanvas ? 10 : 12;
  const escalaInteira = Math.floor(Math.min(
    5,
    larguraCanvas / (larguraDesejadaEmTiles * 16),
    alturaCanvas / (alturaDesejadaEmTiles * 16)
  ));
  return Math.max(1, escalaInteira);
}

function redimensionarCanvas() {
  const larguraViewport = Math.round(canvas.parentElement?.clientWidth || canvas.clientWidth);
  const altura = Math.round(canvas.parentElement?.clientHeight || canvas.clientHeight);
  if (!larguraViewport || !altura) return;
  if (larguraViewport <= 540) {
    const tilesAlturaDesejada = altura >= larguraViewport ? 10 : 12;
    const escalaInteira = Math.max(1, Math.floor(Math.min(
      5,
      larguraViewport / (11 * 16),
      altura / (tilesAlturaDesejada * 16)
    )));
    const tile = 16 * escalaInteira;
    const larguraEmTiles = Math.floor(larguraViewport / tile);
    canvas.style.width = `${larguraEmTiles * tile}px`;
    canvas.style.left = '50%';
    canvas.style.right = 'auto';
    canvas.style.transform = 'translateX(-50%)';
  } else {
    canvas.style.width = '100%';
    canvas.style.left = '0';
    canvas.style.right = '0';
    canvas.style.transform = 'none';
  }
  const largura = Math.round(canvas.clientWidth);
  const proporcao = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  if (!largura) return;
  if (canvas.width === Math.round(largura * proporcao)
    && canvas.height === Math.round(altura * proporcao)
    && Number(canvas.dataset.pixelRatio) === proporcao) return;
  canvas.width = Math.round(largura * proporcao);
  canvas.height = Math.round(altura * proporcao);
  canvas.dataset.pixelRatio = String(proporcao);
  ctx.setTransform(proporcao, 0, 0, proporcao, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

function larguraCanvasLogica() {
  return canvas.clientWidth || canvas.width / (Number(canvas.dataset.pixelRatio) || 1);
}

function alturaCanvasLogica() {
  return canvas.clientHeight || canvas.height / (Number(canvas.dataset.pixelRatio) || 1);
}

function posicaoCamera(tile, agora = performance.now()) {
  const jogador = posicaoVisual(estado.jogador, playerMotion, agora);
  const zonaTopo = Math.max(76, larguraCanvasLogica() <= 540 ? 116 : 76);
  const zonaBase = Math.max(92, alturaCanvasLogica() <= 520 ? 108 : 88);
  const conversaAberta = !dialogController.overlay.classList.contains('hidden');
  const centroDesejado = conversaAberta ? alturaCanvasLogica() * 0.32 : (alturaCanvasLogica() + zonaTopo - zonaBase) / 2;
  const centroSeguro = Math.max(zonaTopo, Math.min(alturaCanvasLogica() - zonaBase, centroDesejado));
  const margemVertical = centroSeguro / Math.max(1, alturaCanvasLogica());
  return {
    x: Math.max(0, Math.min(MAPA[0].length * tile - larguraCanvasLogica(), jogador.x * tile - larguraCanvasLogica() * 0.45)),
    y: Math.max(0, Math.min(MAPA.length * tile - alturaCanvasLogica(), jogador.y * tile - alturaCanvasLogica() * margemVertical))
  };
}

function atualizarPeixesSaltantes(agora) {
  if (estado.reduzirMovimento) return;
  peixesSaltantes.forEach((peixe) => {
    if (peixe.inicio === 0 && agora >= peixe.proximo) {
      peixe.inicio = agora;
      peixe.proximo = agora + 3000 + Math.random() * 5000;
    }
  });
}

function prepararPeixesSaltantes() {
  const agora = performance.now();
  peixesSaltantes.forEach((peixe, indice) => {
    peixe.inicio = 0;
    peixe.proximo = agora + 850 + indice * 1450;
  });
}

function desenharPeixesSaltantes(tile, camera, agora) {
  peixesSaltantes.forEach((peixe, indice) => {
    const x = (peixe.x + 0.5) * tile - camera.x;
    const y = (peixe.y + 0.5) * tile - camera.y;
    if (estado.reduzirMovimento) {
      ctx.save();
      ctx.strokeStyle = 'rgba(246,231,193,0.8)';
      ctx.lineWidth = Math.max(1, tile * 0.025);
      ctx.beginPath();
      ctx.ellipse(x, y, tile * 0.18, tile * 0.07, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (peixe.inicio === 0) return;
    const progresso = Math.max(0, Math.min(1, (agora - peixe.inicio) / 760));
    if (progresso >= 1) {
      peixe.inicio = 0;
      return;
    }
    const arco = Math.sin(progresso * Math.PI) * tile * 0.48;
    const saltoX = x + (indice % 2 ? 1 : -1) * tile * progresso * 0.32;
    const saltoY = y - arco;
    ctx.save();
    const direcao = indice % 2 ? -1 : 1;
    ctx.translate(saltoX, saltoY);
    ctx.scale(direcao, 1);
    ctx.fillStyle = '#2BB5C9';
    ctx.beginPath();
    ctx.ellipse(0, 0, tile * 0.2, tile * 0.105, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-tile * 0.16, 0);
    ctx.lineTo(-tile * 0.3, -tile * 0.11);
    ctx.lineTo(-tile * 0.3, tile * 0.11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#F6E7C1';
    ctx.fillRect(tile * 0.095, -tile * 0.035, tile * 0.035, tile * 0.035);
    ctx.fillStyle = '#1B7FA0';
    ctx.beginPath();
    ctx.moveTo(-tile * 0.04, tile * 0.06);
    ctx.lineTo(tile * 0.035, tile * 0.13);
    ctx.lineTo(tile * 0.09, tile * 0.055);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(241,255,229,0.8)';
    ctx.lineWidth = Math.max(1, tile * 0.025);
    ctx.beginPath();
    ctx.ellipse(x, y + tile * 0.06, tile * (0.16 + progresso * 0.12), tile * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (progresso > 0.35) {
      ctx.fillStyle = '#F6E7C1';
      ctx.fillRect(Math.round(x - tile * 0.2), Math.round(y - tile * 0.14 - arco * 0.2), tile * 0.045, tile * 0.06);
      ctx.fillRect(Math.round(x + tile * 0.16), Math.round(y - tile * 0.1 - arco * 0.15), tile * 0.04, tile * 0.05);
    }
  });
}

function abrirPeixeSaltante(peixe) {
  const especie = ESPECIES_PEIXES.find((item) => item.id === peixe.especieId);
  if (!especie) return;
  if (!estado.colecaoPeixes.includes(especie.id)) estado.colecaoPeixes.push(especie.id);
  ajustarIndicadores(estado, { Ambiente: 1 });
  atualizarHud();
  salvar();
  dialogController.open({
    nome: especie.nome,
    retratoTipo: 'peixe',
    texto: `${especie.ficha} Registro de observação adicionado ao Caderno.`,
    typewriter: false
  });
}

function registrarFauna(especieId) {
  const especie = ESPECIES_FAUNA[especieId];
  if (!especie) return;
  if (!estado.colecaoFauna.includes(especieId)) estado.colecaoFauna.push(especieId);
  atualizarHud();
  salvar();
  dialogController.open({
    nome: 'Caderno de Saberes',
    texto: `${especie.nome}: ${especie.ficha}`,
    retratoTipo: especieId,
    typewriter: false
  });
}

function tocarPeixeNaTela(event) {
  if (estado.interiorAtivo || estado.fase !== 'jogo') return;
  const rect = canvas.getBoundingClientRect();
  const tile = escalaDoMapa() * 16;
  const camera = posicaoCamera(tile);
  const px = ((event.clientX - rect.left) / rect.width) * larguraCanvasLogica() + camera.x;
  const py = ((event.clientY - rect.top) / rect.height) * alturaCanvasLogica() + camera.y;
  const peixe = peixesSaltantes.find((item) => {
    const x = (item.x + 0.5) * tile;
    const y = (item.y + 0.5) * tile;
    return Math.abs(px - x) <= tile * 0.75 && Math.abs(py - y) <= tile * 0.75;
  });
  if (peixe) abrirPeixeSaltante(peixe);
}

function desenharOndas(x, y, tile, mapaX, mapaY) {
  const tick = estado.reduzirMovimento ? 0 : animationTick;
  const movimento = (tick / 12 + mapaX * 0.7 + mapaY * 0.35) % 1;
  ctx.fillStyle = 'rgba(241,255,229,0.52)';
  ctx.fillRect(x + tile * movimento, y + tile * 0.25, tile * 0.15, tile * 0.045);
  ctx.fillRect(x + tile * ((movimento + 0.48) % 1), y + tile * 0.68, tile * 0.1, tile * 0.045);
  ctx.fillStyle = 'rgba(27,127,160,0.22)';
  ctx.fillRect(x + tile * ((movimento + 0.65) % 1), y + tile * 0.47, tile * 0.2, tile * 0.035);
}

function tocarMapa(event) {
  if (estado.fase !== 'jogo' || estado.interiorAtivo || pescaAnimacao || !dialogController.overlay.classList.contains('hidden')) return;
  const rect = canvas.getBoundingClientRect();
  const scale = escalaDoMapa();
  const tile = 16 * scale;
  const camera = posicaoCamera(tile);
  const pixelX = ((event.clientX - rect.left) / rect.width) * larguraCanvasLogica() + camera.x;
  const pixelY = ((event.clientY - rect.top) / rect.height) * alturaCanvasLogica() + camera.y;
  const destino = { x: Math.floor(pixelX / tile), y: Math.floor(pixelY / tile) };
  destinoAtual = isPassable(destino.x, destino.y, estado.emCanoa ? 'canoa' : 'pe') ? destino : null;
}

function atualizarMovimentoAlvo(agora) {
  if (!destinoAtual || estado.interiorAtivo || playerMotion || agora < playerNextStepAt) return;
  const rota = findPath(estado.jogador, destinoAtual, estado.emCanoa ? 'canoa' : 'pe');
  if (rota.length > 1) {
    const next = rota[1];
    const dx = next.x - estado.jogador.x;
    const dy = next.y - estado.jogador.y;
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
      moverPlayer(dx, dy);
    }
  }
  if (estado.jogador.x === destinoAtual.x && estado.jogador.y === destinoAtual.y) {
    destinoAtual = null;
  }
}

function desenharParticulas(tile, camera) {
  const tick = estado.reduzirMovimento ? 0 : animationTick;
  PARTICULAS.forEach((particula, indice) => {
    const tempo = tick / (particula.tipo === 0 ? 20 : 13) + particula.fase;
    let mundoX;
    let mundoY;

    if (particula.tipo === 0) {
      mundoX = 18 + ((indice * 7) % 9);
      mundoY = 6 + (Math.floor(tempo) % 5);
      if (tileAt(mundoX, mundoY) !== 'plantacao') return;
    } else if (particula.tipo === 1) {
      mundoX = (indice * 17 + 3) % MAPA[0].length;
      mundoY = 1 + (Math.floor(tempo) % 9);
      if (tileAt(mundoX, mundoY) !== 'mato') return;
    } else {
      mundoX = (indice * 11 + Math.floor(tempo)) % MAPA[0].length;
      mundoY = 29 + (indice % 3);
      if (tileAt(mundoX, mundoY) !== 'mar') return;
    }

    const x = Math.round((mundoX + ((tempo % 1) * 0.5)) * tile - camera.x);
    const y = Math.round(mundoY * tile - camera.y);
    if (x < -tile || y < -tile || x > larguraCanvasLogica() + tile || y > alturaCanvasLogica() + tile) return;

    if (particula.tipo === 0) {
      ctx.fillStyle = 'rgba(217,164,65,0.75)';
      ctx.fillRect(x, y, tile * 0.08, tile * 0.08);
      ctx.fillRect(x + tile * 0.08, y - tile * 0.08, tile * 0.08, tile * 0.08);
    } else if (particula.tipo === 1) {
      ctx.fillStyle = '#D9A441';
      ctx.fillRect(x, y, tile * 0.12, tile * 0.06);
      ctx.fillStyle = '#8CCB5E';
      ctx.fillRect(x + tile * 0.06, y + tile * 0.06, tile * 0.06, tile * 0.06);
    } else {
      ctx.fillStyle = 'rgba(241,255,229,0.65)';
      ctx.fillRect(x, y, tile * 0.16, tile * 0.045);
    }
  });
}

function desenharFumaca(tile, camera) {
  const tick = estado.reduzirMovimento ? 0 : animationTick;
  const chamines = [{ x: 26.9, y: 6.05 }, { x: 43.8, y: 5.2 }];
  chamines.forEach((chamine) => {
    const origemX = chamine.x * tile - camera.x;
    const origemY = chamine.y * tile - camera.y;
    for (let index = 0; index < 4; index += 1) {
      const fase = (tick / 24 + index * 0.27) % 1;
      const x = origemX + Math.sin(fase * Math.PI * 2) * tile * 0.08;
      const y = origemY - fase * tile * 0.9 - index * tile * 0.06;
      const tamanho = tile * (0.07 + fase * 0.025);
      ctx.fillStyle = `rgba(246,231,193,${0.38 - fase * 0.2})`;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(tamanho), Math.round(tamanho));
      ctx.fillRect(Math.round(x + tamanho * 0.6), Math.round(y - tamanho * 0.35), Math.round(tamanho * 0.55), Math.round(tamanho * 0.55));
    }
  });
}

function desenharTerreiroFandango(tile, camera) {
  const x = (CENA_FANDANGO.x + 0.5) * tile - camera.x;
  const y = (CENA_FANDANGO.y + 0.5) * tile - camera.y;
  ctx.fillStyle = 'rgba(156,107,63,0.42)';
  ctx.beginPath();
  ctx.ellipse(x, y, tile * 4.1, tile * 2.8, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,58,30,0.72)';
  ctx.lineWidth = Math.max(2, tile * 0.035);
  ctx.setLineDash([tile * 0.14, tile * 0.12]);
  ctx.beginPath();
  ctx.ellipse(x, y, tile * 2.25, tile * 1.65, -0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#9A9B8C';
  for (let indice = 0; indice < 14; indice += 1) {
    const angulo = (indice / 14) * Math.PI * 2;
    const pedraX = x + Math.cos(angulo) * tile * 2.12;
    const pedraY = y + Math.sin(angulo) * tile * 1.55;
    ctx.fillRect(Math.round(pedraX - tile * 0.08), Math.round(pedraY - tile * 0.06), tile * 0.16, tile * 0.12);
  }
}

function posicaoMorador(morador, indice, agora) {
  const caminho = morador.caminho;
  const passo = estado.reduzirMovimento ? indice % caminho.length : (agora / 1500 + indice * 1.3) % caminho.length;
  const segmento = Math.floor(passo);
  const inicio = caminho[segmento];
  const fim = caminho[(segmento + 1) % caminho.length];
  const progresso = estado.reduzirMovimento ? 0 : passo - segmento;
  const dx = fim.x - inicio.x;
  const dy = fim.y - inicio.y;
  return {
    x: inicio.x + dx * progresso,
    y: inicio.y + dy * progresso,
    direcao: Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'down' : 'up')
  };
}

function atualizarFauna(agora) {
  const delta = tempoFaunaAnterior ? Math.max(0, agora - tempoFaunaAnterior) : 0;
  tempoFaunaAnterior = agora;
  if (estado.reduzirMovimento) return;
  tempoMovimentoFauna += delta;
  FAUNA.filter((animal) => animal.especieId === 'passaro').forEach((animal) => {
    const restante = faunaVoo.get(animal.id) || 0;
    const proximidade = distancia(estado.jogador.x, estado.jogador.y, animal.x, animal.y);
    if (restante > 0) {
      const novoRestante = Math.max(0, restante - delta);
      if (novoRestante) faunaVoo.set(animal.id, novoRestante);
      else faunaVoo.delete(animal.id);
    } else if (proximidade < 2) {
      faunaVoo.set(animal.id, 1900);
    }
  });
}

function posicaoFauna(animal, indice, agora = performance.now()) {
  const tick = tempoMovimentoFauna;
  if (animal.especieId === 'caranguejo') {
    const perto = distancia(estado.jogador.x, estado.jogador.y, animal.x, animal.y) < 2;
    const lado = animal.x < estado.jogador.x ? -1 : animal.x > estado.jogador.x ? 1 : indice % 2 ? -1 : 1;
    const fuga = perto ? lado * 1.2 : 0;
    const passo = ((tick / 320 + indice * 0.31) % 2) - 1;
    return { x: Math.max(0.5, Math.min(47.5, animal.x + fuga + passo * 0.38)), y: animal.y };
  }
  if (animal.especieId === 'lagarto') {
    const ciclo = (tick + indice * 430) % 2100;
    const corrida = ciclo > 1500 ? (ciclo - 1500) / 600 : 0;
    return { x: animal.x + corrida * (indice % 2 ? -0.8 : 0.8), y: animal.y };
  }
  const restante = faunaVoo.get(animal.id) || 0;
  if (!restante) return { x: animal.x, y: animal.y };
  const progresso = 1 - restante / 1900;
  const lado = animal.x < estado.jogador.x ? -1 : 1;
  return { x: animal.x + lado * progresso * 1.5, y: animal.y - Math.sin(progresso * Math.PI) * 1.1 };
}

function desenharFauna(tile, camera, agora) {
  const tick = estado.reduzirMovimento ? 0 : animationTick;
  FAUNA.forEach((animal, indice) => {
    const posicao = posicaoFauna(animal, indice, agora);
    const x = (posicao.x + 0.5) * tile - camera.x;
    const y = (posicao.y + 0.5) * tile - camera.y;
    if (animal.especieId === 'passaro') {
      desenharAve(ctx, x, y, tile, tick + indice * 3, !faunaVoo.get(animal.id));
    } else if (animal.especieId === 'caranguejo') {
      ctx.fillStyle = '#A64C3A';
      ctx.fillRect(Math.round(x - tile * 0.15), Math.round(y - tile * 0.08), tile * 0.3, tile * 0.16);
      ctx.fillStyle = '#5A3A1E';
      for (let pata = -1; pata <= 1; pata += 1) {
        ctx.fillRect(Math.round(x + pata * tile * 0.09), Math.round(y + tile * 0.05), tile * 0.035, tile * 0.11);
      }
    } else {
      ctx.fillStyle = '#5F8B45';
      ctx.fillRect(Math.round(x - tile * 0.17), Math.round(y - tile * 0.06), tile * 0.3, tile * 0.12);
      ctx.fillRect(Math.round(x + tile * 0.1), Math.round(y - tile * 0.13), tile * 0.12, tile * 0.12);
      ctx.fillStyle = '#2B1A0E';
      ctx.fillRect(Math.round(x + tile * 0.18), Math.round(y - tile * 0.1), tile * 0.025, tile * 0.025);
    }
  });
}

function desenharAves(tile, camera, agora) {
  desenharFauna(tile, camera, agora);
}

function desenharBorboletas(tile, camera) {
  if (estado.reduzirMovimento) return;
  for (let indice = 0; indice < 3; indice += 1) {
    const fase = animationTick / 24 + indice * 2.1;
    const x = (39 + Math.sin(fase) * 1.5) * tile - camera.x;
    const y = (14 + Math.cos(fase * 0.8) * 0.6) * tile - camera.y;
    ctx.fillStyle = indice % 2 ? '#A64C3A' : '#D9A441';
    ctx.fillRect(x - tile * 0.07, y, tile * 0.06, tile * 0.04);
    ctx.fillRect(x + tile * 0.01, y - tile * 0.02, tile * 0.06, tile * 0.04);
    ctx.fillStyle = '#5A3A1E';
    ctx.fillRect(x, y, tile * 0.035, tile * 0.06);
  }
}

function desenharSombra(x, baseY, tile, tamanho, profundidade = 0) {
  const desplazamiento = {
    '08:00': 0.22,
    '10:30': 0.14,
    '13:30': 0.06,
    '16:00': -0.12,
    '17:30': -0.2
  }[estado.horario] || 0.1;
  ctx.fillStyle = estado.horario === '17:30' ? 'rgba(32,34,48,0.32)' : 'rgba(43,26,14,0.24)';
  ctx.beginPath();
  ctx.ellipse(
    x + tile * desplazamiento,
    baseY + tile * 0.04,
    tile * (tamanho * 0.34 + profundidade * 0.05),
    tile * (0.1 + profundidade * 0.015),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function desenharIluminacao() {
  const luzes = {
    '08:00': 'rgba(255,201,112,0.09)',
    '10:30': 'rgba(255,250,214,0.025)',
    '13:30': 'rgba(255,184,76,0.07)',
    '16:00': 'rgba(233,118,63,0.11)',
    '17:30': 'rgba(60,73,125,0.2)'
  };
  ctx.fillStyle = luzes[estado.horario] || luzes['08:00'];
  ctx.fillRect(0, 0, larguraCanvasLogica(), alturaCanvasLogica());
}

function desenharLuzes(tile, camera) {
  if (!['16:00', '17:30'].includes(estado.horario)) return;
  MAPA_DECORACOES.filter((item) => item.tipo === 'luminaria').forEach((luz) => {
    const x = (luz.x + 0.5) * tile - camera.x;
    const y = (luz.y + 0.5) * tile - camera.y;
    const brilho = ctx.createRadialGradient(x, y, tile * 0.08, x, y, tile * 1.3);
    brilho.addColorStop(0, estado.horario === '17:30' ? 'rgba(255,215,120,0.7)' : 'rgba(255,215,120,0.42)');
    brilho.addColorStop(1, 'rgba(255,215,120,0)');
    ctx.fillStyle = brilho;
    ctx.fillRect(x - tile * 1.15, y - tile * 1.15, tile * 2.3, tile * 2.3);
  });
}

function desenharBarcoDeFora(tile, camera) {
  if (estado.horario !== '17:30' || estado.eventoConcluido) return;
  const x = 16.5 * tile - camera.x;
  const y = 29.5 * tile - camera.y;
  desenharCanoaCaiçara(ctx, x, y, tile, 3, estado.reduzirMovimento);
}

function desenharPeixe(x, y, escala) {
  ctx.fillStyle = '#F0D9A0';
  ctx.fillRect(Math.round(x), Math.round(y), escala * 3, escala * 2);
  ctx.fillStyle = '#2BB5C9';
  ctx.fillRect(Math.round(x + escala), Math.round(y + escala), escala * 5, escala * 2);
  ctx.fillRect(Math.round(x + escala * 5), Math.round(y), escala * 2, escala * 4);
  ctx.fillStyle = '#5A3A1E';
  ctx.fillRect(Math.round(x + escala * 2), Math.round(y + escala), escala, escala);
}

function desenharCestoPeixe(centroX, baseY, tile, comPeixe) {
  ctx.fillStyle = '#8A5A33';
  ctx.fillRect(Math.round(centroX - tile * 0.19), Math.round(baseY - tile * 0.2), tile * 0.38, tile * 0.19);
  ctx.fillStyle = '#A78354';
  ctx.fillRect(Math.round(centroX - tile * 0.17), Math.round(baseY - tile * 0.18), tile * 0.34, tile * 0.16);
  ctx.fillStyle = '#5A3A1E';
  ctx.fillRect(Math.round(centroX - tile * 0.2), Math.round(baseY - tile * 0.2), tile * 0.4, tile * 0.035);
  if (comPeixe) desenharPeixe(centroX - tile * 0.11, baseY - tile * 0.29, tile * 0.025);
}

function desenharResultadoPesca(tile, camera, agora) {
  if (!pescaResultadoAnimacao) return;
  const ponto = pescaResultadoAnimacao.ponto;
  const agua = ponto?.agua || ponto || estado.jogador;
  const progresso = estado.reduzirMovimento
    ? 0
    : Math.max(0, Math.min(1, (agora - pescaResultadoAnimacao.inicio) / 1050));
  const origemX = (pescaResultadoAnimacao.guardar ? agua.x + 0.5 : estado.jogador.x + 0.5) * tile - camera.x;
  const origemY = (pescaResultadoAnimacao.guardar ? agua.y + 0.5 : estado.jogador.y + 0.5) * tile - camera.y;
  const destinoX = (pescaResultadoAnimacao.guardar ? estado.jogador.x + 1.05 : agua.x + 0.5) * tile - camera.x;
  const destinoY = (pescaResultadoAnimacao.guardar ? estado.jogador.y + 0.82 : agua.y + 0.5) * tile - camera.y;
  const peixeX = origemX + (destinoX - origemX) * progresso;
  const peixeY = origemY + (destinoY - origemY) * progresso - Math.sin(progresso * Math.PI) * tile * 0.85;
  if (progresso < 1 || estado.reduzirMovimento) desenharPeixe(peixeX, peixeY, tile * 0.045);
  if (!pescaResultadoAnimacao.guardar && progresso > 0.82) {
    const intensidade = estado.reduzirMovimento ? 0.7 : (progresso - 0.82) / 0.18;
    ctx.strokeStyle = `rgba(241,255,229,${intensidade})`;
    ctx.lineWidth = Math.max(1, tile * 0.035);
    ctx.beginPath();
    ctx.ellipse(destinoX, destinoY, tile * 0.28 * intensidade, tile * 0.09 * intensidade, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#2BB5C9';
    ctx.fillRect(destinoX - tile * 0.11, destinoY - tile * 0.12, tile * 0.07, tile * 0.05);
    ctx.fillRect(destinoX + tile * 0.08, destinoY - tile * 0.04, tile * 0.06, tile * 0.045);
  }
}

function desenharAnimacaoPesca(tile, camera, agora) {
  const jogador = posicaoVisual(estado.jogador, playerMotion, agora);
  const jogadorX = (jogador.x + 0.5) * tile - camera.x;
  const jogadorY = (jogador.y + 0.2) * tile - camera.y;
  if (!pescaAnimacao) {
    if ((Number(estado.inventario.peixe) || 0) > 0) desenharCestoPeixe(jogadorX + tile * 0.55, (jogador.y + 1) * tile - camera.y, tile, true);
    desenharResultadoPesca(tile, camera, agora);
    return;
  }
  const direcao = pescaAnimacao.direcao;
  const maoX = jogadorX + tile * (direcao === 'left' ? -0.1 : direcao === 'right' ? 0.1 : 0);
  const maoY = jogadorY - tile * 0.45;
  const pontaX = maoX + tile * (direcao === 'left' ? -0.35 : direcao === 'right' ? 0.35 : 0.08);
  const pontaY = maoY + tile * (direcao === 'down' ? 0.3 : -0.55);
  const agua = pescaAnimacao.ponto.agua || pescaAnimacao.ponto;
  const aguaX = (agua.x + 0.5) * tile - camera.x;
  const aguaY = (agua.y + 0.5) * tile - camera.y;
  const duracao = { lancamento: 520, fisgada: 620, salto: 820 }[pescaAnimacao.fase];
  const progresso = Math.max(0, Math.min(1, (agora - pescaAnimacao.inicio) / duracao));
  const progressoVisual = estado.reduzirMovimento ? 0 : progresso;

  ctx.save();
  desenharVaraPesca(ctx, maoX, maoY, pontaX, pontaY, aguaX, aguaY, tile, direcao, pescaAnimacao.fase, progressoVisual, estado.reduzirMovimento);

  if (pescaAnimacao.fase === 'lancamento') {
    const flutuadorX = pontaX + (aguaX - pontaX) * progressoVisual;
    const flutuadorY = pontaY + (aguaY - pontaY) * progressoVisual;
    ctx.fillStyle = '#A64C3A';
    ctx.fillRect(Math.round(flutuadorX - tile * 0.04), Math.round(flutuadorY - tile * 0.055), tile * 0.08, tile * 0.06);
    ctx.fillStyle = '#F6E7C1';
    ctx.fillRect(Math.round(flutuadorX - tile * 0.04), Math.round(flutuadorY), tile * 0.08, tile * 0.045);
    ctx.strokeStyle = '#5A3A1E';
    ctx.beginPath();
    ctx.moveTo(flutuadorX, flutuadorY + tile * 0.09);
    ctx.lineTo(flutuadorX + tile * 0.06, flutuadorY + tile * 0.16);
    ctx.stroke();
  }

  if (pescaAnimacao.fase === 'lancamento' || pescaAnimacao.fase === 'fisgada') {
    const pulso = estado.reduzirMovimento ? 0.6 : 0.45 + (Math.sin(animationTick / 4) + 1) * 0.08;
    ctx.strokeStyle = `rgba(43,181,201,${pulso})`;
    ctx.lineWidth = Math.max(2, tile * 0.035);
    ctx.beginPath();
    ctx.ellipse(aguaX, aguaY, tile * 0.24, tile * 0.09, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (pescaAnimacao.fase === 'fisgada') {
      ctx.fillStyle = '#FFE066';
      ctx.strokeStyle = '#5A3A1E';
      ctx.lineWidth = Math.max(2, tile * 0.04);
      ctx.font = `bold ${Math.round(tile * 0.5)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeText('!', jogadorX, jogadorY - tile * 1.15);
      ctx.fillText('!', jogadorX, jogadorY - tile * 1.15);
    }
  }

  if (pescaAnimacao.fase === 'salto') {
    const arco = estado.reduzirMovimento ? 0 : Math.sin(progressoVisual * Math.PI) * tile * 0.72;
    const peixeX = aguaX + (maoX - aguaX) * progressoVisual;
    const peixeY = aguaY + (maoY - aguaY) * progressoVisual - arco;
    desenharPeixe(peixeX, peixeY, tile * 0.045);
    ctx.fillStyle = '#2BB5C9';
    ctx.fillRect(Math.round(aguaX - tile * 0.06), Math.round(aguaY - tile * 0.1), tile * 0.08, tile * 0.05);
    ctx.fillRect(Math.round(aguaX + tile * 0.04), Math.round(aguaY - tile * 0.04), tile * 0.06, tile * 0.045);
  }
  ctx.restore();
  if ((Number(estado.inventario.peixe) || 0) > 0) desenharCestoPeixe(jogadorX + tile * 0.55, (jogador.y + 1) * tile - camera.y, tile, true);
  desenharResultadoPesca(tile, camera, agora);
}

function criarCamadaEstaticaMinimapa() {
  if (camadaEstaticaMinimapa) return camadaEstaticaMinimapa;
  const escala = 4;
  camadaEstaticaMinimapa = document.createElement('canvas');
  camadaEstaticaMinimapa.width = MAPA[0].length * escala;
  camadaEstaticaMinimapa.height = MAPA.length * escala;
  const minimapaCtx = camadaEstaticaMinimapa.getContext('2d');
  minimapaCtx.imageSmoothingEnabled = false;

  MAPA.forEach((linha, y) => linha.forEach((tipo, x) => {
    desenharPiso(minimapaCtx, tipo, x * escala, y * escala, escala, x * 31 + y, y >= 30);
  }));
  EDIFICIOS.forEach((edificio) => {
    minimapaCtx.fillStyle = '#8A5A33';
    minimapaCtx.fillRect(edificio.x * escala - escala, edificio.y * escala - escala * 1.5, escala * 3, escala * 2);
    minimapaCtx.fillStyle = edificio.temInterior ? '#D9A441' : '#F6E7C1';
    minimapaCtx.fillRect(edificio.x * escala - escala, edificio.y * escala - escala, escala * 3, escala);
  });
  return camadaEstaticaMinimapa;
}

function desenharIconeInteresse(ctx, tipo, x, y) {
  ctx.save();
  ctx.fillStyle = '#FFE066';
  ctx.strokeStyle = '#2B1A0E';
  ctx.lineWidth = 1;
  if (tipo === 'casa-musical' || tipo === 'casa-de-farinha' || tipo === 'terreiro') {
    ctx.fillRect(x - 2, y - 2, 4, 4);
  } else if (tipo === 'praca') {
    ctx.fillStyle = '#A64C3A';
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.fillStyle = '#FFE066';
    ctx.fillRect(x - 1, y - 1, 2, 2);
  } else if (tipo === 'horta') {
    ctx.fillStyle = '#3F813D';
    ctx.fillRect(x - 3, y - 2, 6, 4);
    ctx.fillStyle = '#8CCB5E';
    ctx.fillRect(x - 2, y - 1, 1, 2);
    ctx.fillRect(x, y - 1, 1, 2);
    ctx.fillRect(x + 2, y - 1, 1, 2);
  } else if (tipo === 'lagoa' || tipo === 'praia') {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.lineTo(x - 3, y + 2);
    ctx.lineTo(x + 3, y + 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
}

function desenharMinimapa(canvas, ampliar = false) {
  if (!canvas) return;
  const ctxMinimapa = canvas.getContext('2d');
  ctxMinimapa.imageSmoothingEnabled = false;
  ctxMinimapa.clearRect(0, 0, larguraCanvasLogica(), alturaCanvasLogica());
  ctxMinimapa.drawImage(criarCamadaEstaticaMinimapa(), 0, 0, larguraCanvasLogica(), alturaCanvasLogica());

  const escalaX = larguraCanvasLogica() / (MAPA[0].length * 16);
  const escalaY = alturaCanvasLogica() / (MAPA.length * 16);
  const px = (x) => x * 16 * escalaX;
  const py = (y) => y * 16 * escalaY;

  const pontos = ampliar
    ? [
      { tipo: 'praca', x: PRACA_CENTRAL.coreto.x, y: PRACA_CENTRAL.coreto.y, nome: PRACA_CENTRAL.nome },
      { tipo: 'horta', x: HORTA_CENTRAL.x + Math.floor(HORTA_CENTRAL.largura / 2), y: HORTA_CENTRAL.y + Math.floor(HORTA_CENTRAL.altura / 2), nome: HORTA_CENTRAL.nome },
      { tipo: 'casa-de-farinha', x: 25, y: 10, nome: 'Casa de farinha' },
      { tipo: 'mercadinho', x: 21, y: 16, nome: 'Mercadinho' },
      { tipo: 'armazem', x: 15, y: 16, nome: 'Armazém' },
      { tipo: 'casa-musical', x: 29, y: 16, nome: 'Casa musical' },
      { tipo: 'terreiro', x: 7, y: 18, nome: 'Terreiro dos Fandangos' },
      { tipo: 'pier', x: 13, y: 28, nome: 'Píer' },
      { tipo: 'lagoa', x: 37, y: 23, nome: 'Lagoa' },
      ...EDIFICIOS.filter((edificio) => ['escola', 'capela', 'peixaria'].includes(edificio.id))
        .map((edificio) => ({ tipo: edificio.id, x: edificio.x, y: edificio.y, nome: nomeEdificio(edificio) }))
    ]
    : [];
  pontos.forEach((ponto) => desenharIconeInteresse(ctxMinimapa, ponto.tipo, px(ponto.x), py(ponto.y)));

  const tile = escalaDoMapa() * 16;
  const camera = posicaoCamera(tile);
  ctxMinimapa.save();
  ctxMinimapa.strokeStyle = estado.altoContraste ? '#FFFFFF' : '#2B1A0E';
  ctxMinimapa.lineWidth = ampliar ? 2 : 1;
  const escalaTela = escalaDoMapa();
  const mundoLargura = MAPA[0].length * 16;
  const mundoAltura = MAPA.length * 16;
  const larguraVisibleMundo = larguraCanvasLogica() * (larguraCanvasLogica() / (16 * escalaTela)) * 16 / mundoLargura;
  const alturaVisibleMundo = alturaCanvasLogica() * (alturaCanvasLogica() / (16 * escalaTela)) * 16 / mundoAltura;
  ctxMinimapa.strokeRect(
    camera.x / mundoLargura * larguraCanvasLogica(),
    camera.y / mundoAltura * alturaCanvasLogica(),
    larguraVisibleMundo,
    alturaVisibleMundo
  );

  const jogadorX = px(estado.jogador.x);
  const jogadorY = py(estado.jogador.y);
  ctxMinimapa.fillStyle = estado.altoContraste ? '#FFFFFF' : '#FFE066';
  ctxMinimapa.strokeStyle = '#2B1A0E';
  ctxMinimapa.beginPath();
  const pulsoJogador = estado.reduzirMovimento ? 1 : 1 + Math.sin(animationTick / 14) * 0.12;
  ctxMinimapa.arc(jogadorX, jogadorY, (ampliar ? 4 : 2.5) * pulsoJogador, 0, Math.PI * 2);
  ctxMinimapa.fill();
  ctxMinimapa.stroke();

  const destino = destinoDaMissao();
  if (destino) {
    ctxMinimapa.fillStyle = '#A64C3A';
    ctxMinimapa.fillRect(px(destino.x) - 2, py(destino.y) - 2, 4, 4);
  }
  ctxMinimapa.restore();
}

function criarCamadaEstatica() {
  if (camadaEstatica) return camadaEstatica;
  camadaEstatica = document.createElement('canvas');
  camadaEstatica.width = MAPA[0].length * 16;
  camadaEstatica.height = MAPA.length * 16;
  const camadaCtx = camadaEstatica.getContext('2d');
  camadaCtx.imageSmoothingEnabled = false;

  MAPA.forEach((linha, y) => linha.forEach((tipo, x) => {
    desenharPiso(camadaCtx, tipo, x * 16, y * 16, 16, x * 31 + y, y >= 30);
  }));
  desenharCantosArredondadosMapa(camadaCtx, MAPA[0].length, MAPA.length, 16);
  return camadaEstatica;
}

function desenhoMapa(agora = performance.now()) {
  const scale = escalaDoMapa();
  const tile = 16 * scale;
  const camera = posicaoCamera(tile, agora);
  const jogadorVisual = posicaoVisual(estado.jogador, playerMotion, agora);
  const cachorroVisual = posicaoVisual(estado.cachorro, dogMotion, agora);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, larguraCanvasLogica(), alturaCanvasLogica());
  const skyColors = [
    { time: '08:00', color: '#F4C47A' },
    { time: '10:30', color: '#E8D5A2' },
    { time: '13:30', color: '#E9B878' },
    { time: '16:00', color: '#D99568' },
    { time: '17:30', color: '#596B89' }
  ];
  const actualSky = skyColors.find((entry) => entry.time === estado.horario) || skyColors[0];
  ctx.fillStyle = actualSky.color;
  ctx.fillRect(0, 0, larguraCanvasLogica(), alturaCanvasLogica());

  const fundo = criarCamadaEstatica();
  ctx.drawImage(
    fundo,
    0,
    0,
    fundo.width,
    fundo.height,
    -camera.x,
    -camera.y,
    fundo.width * scale,
    fundo.height * scale
  );

  const inicioX = Math.max(0, Math.floor(camera.x / tile) - 1);
  const fimX = Math.min(MAPA[0].length, Math.ceil((camera.x + larguraCanvasLogica()) / tile) + 1);
  const inicioY = Math.max(0, Math.floor(camera.y / tile) - 1);
  const fimY = Math.min(MAPA.length, Math.ceil((camera.y + alturaCanvasLogica()) / tile) + 1);

  for (let y = inicioY; y < fimY; y += 1) {
    for (let x = inicioX; x < fimX; x += 1) {
      if (MAPA[y][x] === 'mar' || MAPA[y][x] === 'lagoa') {
        desenharOndas(x * tile - camera.x, y * tile - camera.y, tile, x, y);
      }
    }
  }

  desenharPeixesSaltantes(tile, camera, agora);
  desenharTerreiroFandango(tile, camera);

  const elements = [];
  for (let y = Math.max(0, inicioY - 2); y < Math.min(MAPA.length, fimY + 1); y += 1) {
    for (let x = Math.max(0, inicioX - 2); x < Math.min(MAPA[0].length, fimX + 2); x += 1) {
      const tipo = MAPA[y][x];
      if (tipo !== 'mato' && !['casa', 'casaFarinha', 'casaRural', 'casaMusical', 'pavilhao', 'barraca', 'mercadinho', 'escola', 'capela', 'peixaria', 'canoa', 'saco'].includes(tipo)) continue;
      if (estado.emCanoa && tipo === 'canoa'
        && estado.canoaEmbarcada?.x === x && estado.canoaEmbarcada?.y === y) continue;
      elements.push({ tipo: 'objeto', objeto: tipo, x, y, seed: x * 17 + y * 31 });
    }
  }
  MAPA_DECORACOES.forEach((decoracao) => {
    if (decoracao.x >= inicioX - 1 && decoracao.x <= fimX && decoracao.y >= inicioY - 1 && decoracao.y <= fimY) {
      elements.push({ tipo: 'decoracao', objeto: decoracao.tipo, x: decoracao.x, y: decoracao.y, seed: decoracao.variante ?? decoracao.x * 17 + decoracao.y * 31 });
    }
  });
  getNPCsNoHorario(estado.horario).forEach((npc) => elements.push({ tipo: 'npc', x: npc.x, y: npc.y, npc }));
  PESSOAS_CENARIO.forEach((morador, indice) => {
    const posicao = posicaoMorador(morador, indice, agora);
    elements.push({ tipo: 'morador', ...posicao, indice });
  });
  DANCARINOS_FANDANGO.forEach((dancarino, indice) => {
    elements.push({ tipo: 'dancarino', ...dancarino, indice });
  });
  MUSICOS_FANDANGO.forEach((musico) => {
    elements.push({ tipo: 'musico', ...musico });
  });
  elements.push({ tipo: 'dog', x: cachorroVisual.x, y: cachorroVisual.y });
  elements.push({ tipo: 'player', x: jogadorVisual.x, y: jogadorVisual.y });
  const prioridadeProfundidade = { objeto: 0, decoracao: 1, npc: 2, morador: 2, dancarino: 2, musico: 2, dog: 2, player: 2 };
  elements.sort((a, b) => a.y - b.y || prioridadeProfundidade[a.tipo] - prioridadeProfundidade[b.tipo]);

  elements.forEach((element) => {
    const centerX = (element.x + 0.5) * tile - camera.x;
    const baseY = (element.y + 1) * tile - camera.y;
    const tick = estado.reduzirMovimento ? 0 : animationTick;
    if (element.tipo === 'objeto' || element.tipo === 'decoracao') {
      const casa = ['casa', 'casaFarinha', 'casaRural', 'casaMusical', 'pavilhao', 'barraca', 'mercadinho', 'escola', 'capela', 'peixaria'].includes(element.objeto);
      const grande = element.tipo === 'objeto' && ['mato', 'arvore', 'palmeira', 'mangue', 'casa', 'casaFarinha', 'casaRural', 'casaMusical', 'pavilhao', 'barraca', 'mercadinho', 'escola', 'capela', 'peixaria', 'canoa'].includes(element.objeto);
      const destaque = element.tipo === 'decoracao' && ITENS_DESTAQUE.has(element.objeto);
      const salto = destaque && !estado.reduzirMovimento
        ? Math.sin(tick / 13 + element.seed) * tile * 0.035
        : 0;
      desenharSombra(centerX, baseY, tile, grande ? 1.7 : 0.8, grande ? 1 : 0);
      if (element.objeto === 'canoa') {
        desenharCanoaCaiçara(ctx, centerX, baseY, tile, element.seed, estado.reduzirMovimento);
      } else {
        desenharObjeto(ctx, element.objeto, centerX, baseY - salto, tile, element.seed);
      }
      const edificioDoObjeto = EDIFICIOS.find((item) => item.x === element.x && item.y === element.y);
      if (edificioDoObjeto?.enterable && distancia(estado.jogador.x, estado.jogador.y, edificioDoObjeto.entrada.x, edificioDoObjeto.entrada.y) <= 3.5) {
        ctx.save();
        ctx.fillStyle = estado.altoContraste ? '#FFE066' : '#FFF4C2';
        ctx.strokeStyle = '#5A3A1E';
        ctx.lineWidth = Math.max(1, tile * 0.04);
        ctx.beginPath();
        ctx.moveTo(centerX, baseY - tile * 2.18);
        ctx.lineTo(centerX - tile * 0.14, baseY - tile * 2.38);
        ctx.lineTo(centerX + tile * 0.14, baseY - tile * 2.38);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      if (destaque) {
        const brilho = estado.reduzirMovimento ? 0.55 : 0.35 + (Math.sin(tick / 8 + element.seed) + 1) * 0.2;
        const pontoY = baseY - tile * 0.48 - salto;
        ctx.fillStyle = `rgba(255,224,102,${brilho})`;
        ctx.fillRect(Math.round(centerX - tile * 0.22), Math.round(pontoY - tile * 0.08), tile * 0.07, tile * 0.07);
        ctx.fillRect(Math.round(centerX + tile * 0.16), Math.round(pontoY + tile * 0.06), tile * 0.06, tile * 0.06);
        ctx.fillRect(Math.round(centerX + tile * 0.02), Math.round(pontoY - tile * 0.2), tile * 0.055, tile * 0.055);
        if (estado.altoContraste) {
          ctx.strokeStyle = '#2B1A0E';
          ctx.lineWidth = Math.max(4, tile * 0.12);
          ctx.strokeRect(centerX - tile * 0.25, pontoY - tile * 0.25, tile * 0.5, tile * 0.5);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = Math.max(2, tile * 0.05);
          ctx.strokeRect(centerX - tile * 0.25, pontoY - tile * 0.25, tile * 0.5, tile * 0.5);
        }
      }
    } else if (element.tipo === 'npc') {
      desenharSombra(centerX, baseY, tile, 0.75);
      desenharNpc(ctx, centerX, baseY, tile, tick, element.npc.id);

      const markerY = baseY - tile * 1.42 + Math.sin(tick / 12) * tile * 0.025;
      const perto = distancia(estado.jogador.x, estado.jogador.y, element.npc.x, element.npc.y) <= 1.5;
      ctx.fillStyle = perto ? '#FFE066' : '#F6E7C1';
      ctx.strokeStyle = '#5A3A1E';
      ctx.lineWidth = Math.max(2, tile * 0.045);
      ctx.beginPath();
      ctx.arc(centerX, markerY, tile * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5A3A1E';
      ctx.fillRect(centerX - tile * 0.025, markerY - tile * 0.025, tile * 0.05, tile * 0.05);
    } else if (element.tipo === 'morador') {
      desenharSombra(centerX, baseY, tile, 0.65);
      desenharMorador(ctx, centerX, baseY, tile, tick, element.direcao, true, element.indice);
    } else if (element.tipo === 'dancarino') {
      desenharSombra(centerX, baseY, tile, 0.65);
      desenharDancarino(ctx, centerX, baseY, tile, tick, element.indice, element.estilo);
    } else if (element.tipo === 'musico') {
      desenharSombra(centerX, baseY, tile, 0.65);
      desenharMusico(ctx, centerX, baseY, tile, tick, element.instrumento);
    } else if (element.tipo === 'dog') {
      desenharSombra(centerX, baseY, tile, 0.7);
      desenharCachorro(ctx, centerX, baseY, tile, tick, dogDirection, Boolean(dogMotion));
      if (animationTick < dogPetUntil) {
        ctx.font = `${Math.round(tile * 0.24)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#A64C3A';
        ctx.fillText('♥', centerX, baseY - tile * 0.85);
      }
    } else {
      desenharSombra(centerX, baseY, tile, 0.7);
      if (element.tipo === 'player' && estado.emCanoa) {
        desenharCanoaCaiçara(ctx, centerX, baseY, tile, estado.jogador.x + estado.jogador.y, estado.reduzirMovimento);
      }
      if (element.tipo === 'player' && estado.emCanoa) {
        desenharJogadorSentado(ctx, centerX, baseY - tile * 0.08, tile, tick, playerDirection, estado.avatar);
      } else {
        desenharJogador(
          ctx,
          centerX,
          baseY,
          tile,
          tick,
          playerDirection,
          Boolean(playerMotion),
          estado.avatar
        );
      }
      if (element.tipo === 'player' && estado.emCanoa) {
        const remada = estado.reduzirMovimento ? 0 : Math.sin(animationTick / 3) * tile * 0.11;
        ctx.strokeStyle = '#5A3A1E';
        ctx.lineWidth = Math.max(2, tile * 0.05);
        ctx.beginPath();
        ctx.moveTo(centerX + tile * 0.45, baseY - tile * 0.55);
        ctx.lineTo(centerX + tile * 0.9, baseY - tile * 0.25 + remada);
        ctx.lineTo(centerX + tile * 0.98, baseY - tile * 0.08 + remada);
        ctx.stroke();
      }
      if (element.tipo === 'player' && portaAnimacao && !estado.reduzirMovimento && performance.now() - portaAnimacao.inicio < 360) {
        ctx.save();
        const quadros = Math.floor((performance.now() - portaAnimacao.inicio) / 90);
        ctx.translate(quadros % 2 ? tile * 0.08 : -tile * 0.08, 0);
        ctx.restore();
      }
    }
  });

  desenharAves(tile, camera, agora);
  desenharBorboletas(tile, camera);
  desenharParticulas(tile, camera);
  desenharFumaca(tile, camera);
  desenharBarcoDeFora(tile, camera);
  desenharAnimacaoPesca(tile, camera, agora);

  MISSION_ORDER.forEach((id) => {
    const point = pontoMissaoAtual(id);
    if (estado.missaoAtiva || estado.missoesConcluidas.includes(id)) return;
    const centerX = (point.x + 0.5) * tile - camera.x;
    const tick = estado.reduzirMovimento ? 0 : animationTick;
    const centerY = point.y * tile - camera.y + tile * 0.2;
    const pulse = 1 + Math.sin(tick / 16) * 0.08;
    ctx.fillStyle = '#FFE066';
    ctx.strokeStyle = '#5A3A1E';
    ctx.lineWidth = Math.max(2, tile * 0.05);
    ctx.beginPath();
    ctx.arc(centerX, centerY, tile * 0.22 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#5A3A1E';
    ctx.fillRect(centerX - tile * 0.035, centerY - tile * 0.04, tile * 0.07, tile * 0.08);
  });

  desenharIluminacao();
  desenharLuzes(tile, camera);
  desenharIndicadorMissao(tile, camera);
  desenharIdentificacaoLocal(tile, camera);
  desenharDebugMapa(tile, camera);
}

function loop(agora = performance.now()) {
  if (!estado.reduzirMovimento) animationTick += 1;
  if (estado.fase === 'jogo' && !estado.pausa && !estado.interiorAtivo) {
    atualizarMovimentoPlayer(agora);
    atualizarMovimentoAlvo(agora);
    atualizarCachorro(agora);
    atualizarAnimacaoPesca(agora);
    atualizarAnimacaoResultadoPesca(agora);
    atualizarPeixesSaltantes(agora);
    atualizarFauna(agora);
    atualizarInteracao();
  }
  if (estado.fase === 'jogo' && !estado.pausa && !estado.interiorAtivo) desenhoMapa(agora);
  requestAnimationFrame(loop);
}

function tratarTecladoModal(event) {
  const modal = [...document.querySelectorAll('#interior-panel, #card-explicacao, #card-resumo, #pause-menu')]
    .find((elemento) => !elemento.classList.contains('hidden'));
  if (!modal) return false;
  if (event.key === 'Escape') {
    event.preventDefault();
    if (modal.id === 'interior-panel') fecharInterior();
    if (modal.id === 'card-explicacao') esconderExplicacao();
    if (modal.id === 'card-resumo') fecharResumo();
    if (modal.id === 'pause-menu') alternarPausa(false);
    return true;
  }
  if (event.key !== 'Tab') return false;
  const focaveis = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
    .filter((elemento) => elemento.getClientRects().length > 0);
  if (!focaveis.length) return false;
  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];
  if (!modal.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? ultimo : primeiro).focus();
  } else if (event.shiftKey && document.activeElement === primeiro) {
    event.preventDefault();
    ultimo.focus();
  } else if (!event.shiftKey && document.activeElement === ultimo) {
    event.preventDefault();
    primeiro.focus();
  }
  return false;
}

function setupEventos() {
  window.addEventListener('resize', () => {
    redimensionarCanvas();
    if (estado.interiorAtivo) {
      const edificio = EDIFICIOS.find((item) => item.id === estado.interiorAtivo);
      if (edificio) renderizarInterior(edificio);
    }
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
  });
  document.getElementById('btn-jogar').addEventListener('click', () => {
    novaJornada = true;
    mostrarJogo();
  });

  document.getElementById('btn-personalizar').addEventListener('click', () => {
    novaJornada = true;
    showScreen('screen-customizacao');
  });

  document.getElementById('btn-acessibilidade').addEventListener('click', (event) => {
    const panel = document.getElementById('opening-accessibility');
    const abrir = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !abrir);
    event.currentTarget.setAttribute('aria-expanded', String(abrir));
  });

  document.getElementById('btn-opening-letra').addEventListener('click', alternarLetra);
  document.getElementById('btn-opening-facil').addEventListener('click', alternarLeituraFacil);
  document.getElementById('btn-opening-contraste').addEventListener('click', alternarContraste);
  document.getElementById('btn-opening-movimento').addEventListener('click', alternarMovimento);
  document.getElementById('btn-opening-som').addEventListener('click', alternarSom);
  document.getElementById('btn-opening-setas').addEventListener('click', alternarSetas);
  document.getElementById('btn-abertura-creditos').addEventListener('click', () => showScreen('screen-creditos'));
  document.getElementById('btn-apagar-progresso').addEventListener('click', apagarProgresso);

  document.getElementById('btn-continuar').addEventListener('click', continuarJogo);

  document.getElementById('btn-voltar-abertura').addEventListener('click', () => {
    showScreen('screen-opening');
  });

  document.getElementById('btn-comecar').addEventListener('click', () => {
    const input = document.getElementById('player-name');
    estado.nomeJogador = input.value.trim() || 'Visitante';
    estado.jogador.nome = estado.nomeJogador;
    estado.avatar = document.querySelector('.avatar-card.selected')?.dataset.id || 'a1';
    novaJornada = true;
    salvar();
    mostrarJogo();
  });

  document.getElementById('btn-tutorial-hint-close').addEventListener('click', ocultarDicaContextual);
  document.getElementById('btn-tutorial-next').addEventListener('click', () => proximoTutorial());
  document.getElementById('btn-tutorial-prev').addEventListener('click', () => anteriorTutorial());
  document.getElementById('btn-explicacao-fechar').addEventListener('click', esconderExplicacao);
  document.getElementById('btn-resumo-fechar').addEventListener('click', fecharResumo);
  document.getElementById('btn-sair-interior').addEventListener('click', fecharInterior);
  document.getElementById('btn-pausa').addEventListener('click', () => {
    if (estado.fase === 'jogo') {
      alternarPausa();
    }
  });

  document.getElementById('btn-pause-continuar').addEventListener('click', () => alternarPausa(false));
  document.getElementById('btn-pause-letra').addEventListener('click', alternarLetra);
  document.getElementById('btn-pause-facil').addEventListener('click', alternarLeituraFacil);
  document.getElementById('btn-pause-contraste').addEventListener('click', alternarContraste);
  document.getElementById('btn-pause-movimento').addEventListener('click', alternarMovimento);
  document.getElementById('btn-pause-som').addEventListener('click', alternarSom);
  document.getElementById('btn-pause-setas').addEventListener('click', alternarSetas);
  document.getElementById('btn-pause-tutorial').addEventListener('click', () => {
    alternarPausa(false);
    showScreen('screen-tutorial');
    iniciarTutorial();
  });
  document.getElementById('btn-pause-creditos').addEventListener('click', () => {
    alternarPausa(false);
    showScreen('screen-creditos');
  });
  document.getElementById('btn-pause-abertura').addEventListener('click', () => {
    alternarPausa(false);
    estado.fase = 'abertura';
    showScreen('screen-opening');
    salvar();
  });

  document.getElementById('btn-missoes').addEventListener('click', () => {
    const panel = document.getElementById('panel-missoes');
    const abrir = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !abrir);
    document.getElementById('btn-missoes').setAttribute('aria-expanded', String(abrir));
  });

  document.getElementById('btn-indicadores').addEventListener('click', (event) => {
    const panel = document.getElementById('indicator-panel');
    const abrir = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !abrir);
    event.currentTarget.setAttribute('aria-expanded', String(abrir));
  });

  document.getElementById('btn-caderno').addEventListener('click', abrirCaderno);

  document.getElementById('btn-interagir').addEventListener('click', interagir);
  document.addEventListener('keydown', (event) => {
    if (tratarTecladoModal(event)) return;
    const keyInicial = event.key.toLowerCase();
    if (estado.interiorAtivo && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(keyInicial)) {
      event.preventDefault();
      if (keyInicial === 'arrowup' || keyInicial === 'w') moverNoInterior(0, -1);
      if (keyInicial === 'arrowdown' || keyInicial === 's') moverNoInterior(0, 1);
      if (keyInicial === 'arrowleft' || keyInicial === 'a') moverNoInterior(-1, 0);
      if (keyInicial === 'arrowright' || keyInicial === 'd') moverNoInterior(1, 0);
      return;
    }
    const ativo = document.activeElement;
    if (ativo && (
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(ativo.tagName)
      || ativo.isContentEditable
      || ativo.closest('button, a, [role="button"], .dialogo-overlay')
    )) return;
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
      if (key === 'arrowup' || key === 'w') moverPlayer(0, -1);
      if (key === 'arrowdown' || key === 's') moverPlayer(0, 1);
      if (key === 'arrowleft' || key === 'a') moverPlayer(-1, 0);
      if (key === 'arrowright' || key === 'd') moverPlayer(1, 0);
    }
    if (event.key === 'Enter' || event.key === ' ' || key === 'e') {
      event.preventDefault();
      interagir();
    }
    if (event.key === 'Escape' && estado.fase === 'jogo') {
      alternarPausa();
    }
    if (key === 'm') {
      abrirCaderno(true);
    }
    if (key === 'c') {
      abrirCaderno();
    }
  });

  canvas.addEventListener('pointerdown', (event) => {
    tocarMapa(event);
    tocarPeixeNaTela(event);
  });

  const avatarGrid = document.getElementById('avatar-grid');
  CONTEUDO.avatares.forEach((avatar) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'avatar-card';
    card.dataset.id = avatar.id;
    card.setAttribute('aria-pressed', String(avatar.id === estado.avatar));
    const preview = document.createElement('canvas');
    preview.width = 40;
    preview.height = 60;
    preview.className = 'avatar-visual avatar-preview';
    const previewContext = preview.getContext('2d');
    previewContext.imageSmoothingEnabled = false;
    desenharJogador(previewContext, 20, 58, 40, 0, 'down', false, avatar.id);
    const name = document.createElement('span');
    name.textContent = avatar.nome;
    const description = document.createElement('span');
    description.className = 'avatar-description';
    description.textContent = avatar.descricao;
    card.append(preview, name, description);
    if (avatar.id === estado.avatar) card.classList.add('selected');
    card.addEventListener('click', () => {
      document.querySelectorAll('.avatar-card').forEach((item) => {
        item.classList.remove('selected');
        item.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-pressed', 'true');
      estado.avatar = avatar.id;
      salvar();
    });
    avatarGrid.appendChild(card);
  });

  document.getElementById('player-name').value = nomeJogadorAtivo();
}

function criarPaginaTesteSprites() {
  if (new URLSearchParams(window.location.search).get('teste') !== 'sprites') return;
  showScreen('screen-game');
  const app = document.getElementById('app');
  const canvasTeste = document.createElement('canvas');
  canvasTeste.width = 760;
  canvasTeste.height = 620;
  canvasTeste.className = 'sprite-test-canvas';
  canvasTeste.setAttribute('aria-label', 'Teste das combinações de personagem em todas as direções');
  canvasTeste.style.cssText = 'position:absolute;z-index:30;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,calc(100% - 24px));height:auto;image-rendering:pixelated;background:#F6E7C1;border:4px solid #68452B;border-radius:8px';
  app.appendChild(canvasTeste);

  const testeCtx = canvasTeste.getContext('2d');
  testeCtx.imageSmoothingEnabled = false;
  testeCtx.fillStyle = '#F6E7C1';
  testeCtx.fillRect(0, 0, canvasTeste.width, canvasTeste.height);
  testeCtx.fillStyle = '#2B1A0E';
  testeCtx.font = 'bold 14px monospace';

  const avatares = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
  const direcoes = ['down', 'up', 'left', 'right'];
  avatares.forEach((avatar, avatarIndex) => {
    const x = 92 + avatarIndex * 82;
    testeCtx.fillText(avatar, x - 10, 18);
    direcoes.forEach((direcao, direcaoIndex) => {
      const y = 70 + direcaoIndex * 132;
      if (avatarIndex === 0) testeCtx.fillText(direcao, 8, y + 32);
      for (let quadro = 0; quadro < 3; quadro += 1) {
        const tick = quadro * 8;
        const px = x + (quadro - 1) * 24;
        desenharJogador(testeCtx, px, y + 56, 48, tick, direcao, quadro > 0, avatar);
      }
    });
  });
}

function init() {
  applyDefaults();
  if (new URLSearchParams(window.location.search).get('dev') === '1') {
    verificarEdificios(console);
  }
  redimensionarCanvas();
  syncAudioState();
  setupEventos();
  criarPaginaTesteSprites();
  aplicarAcessibilidade(estado);
  atualizarMenuPausa();
  mostrarFalhaDeLeituraSeNecessario();
  showScreen('screen-opening');
  window.__appReady = true;
  window.__activeScreen = 'screen-opening';
  atualizarHud();
  requestAnimationFrame(loop);
}

function applyDefaults() {
  estado.fase = 'abertura';
  if (!estado.progressoSalvo) {
    estado.horario = '08:00';
    estado.jogador = posicaoInicialJogador();
    estado.cachorro = { ...POSICAO_INICIAL_CACHORRO };
  }
  if (!isPassable(estado.jogador.x, estado.jogador.y, estado.emCanoa ? 'canoa' : 'pe')) {
    estado.emCanoa = false;
    estado.jogador = posicaoInicialJogador();
  }
  if (!isPassable(estado.cachorro.x, estado.cachorro.y)) estado.cachorro = { ...POSICAO_INICIAL_CACHORRO };
  playerMotion = null;
  dogMotion = null;
  destinoAtual = null;
  playerNextStepAt = 0;
  dogNextMoveAt = performance.now() + 1200;
  estado.pausa = false;
  const menuPausa = document.getElementById('pause-menu');
  if (menuPausa) menuPausa.classList.add('hidden');
  document.body.classList.toggle('pause-overlay', false);
  document.getElementById('btn-continuar').classList.toggle('hidden', !estado.progressoSalvo);
}

document.addEventListener('DOMContentLoaded', init);
