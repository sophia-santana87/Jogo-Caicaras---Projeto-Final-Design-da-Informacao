// Cabeçalho de autoria: Projeto final do curso de Gestão da Informação da UFPR.
// Equipe: Bianca Vasconcelos de Lima; Katryni Haaby dos Santos Bueno; Luana Harmatiuk Guimarães; Sophia Santana da Silva; Vanessa da Silva Costa.
// Disciplina: Design da Informação • 2026.

import { desenharAve, desenharCachorro, desenharNpc, desenharObjeto } from './sprites.js?v=66';

export class DialogoController {
  constructor(documentRef = document) {
    this.documentRef = documentRef;
    this.overlay = documentRef.getElementById('dialogo-overlay');
    this.box = this.overlay.querySelector('.dialogo-box');
    this.portrait = documentRef.getElementById('dialogo-retrato');
    this.portraitContext = this.portrait.getContext('2d');
    this.textoEl = documentRef.getElementById('dialogo-texto');
    this.nomeEl = documentRef.getElementById('dialogo-nome');
    this.choicesEl = documentRef.getElementById('dialogo-choices');
    this.botaoContinuar = documentRef.getElementById('btn-dialogo-continuar');
    this.onChoice = null;
    this.onContinue = null;
    this.onType = null;
    this.typingTimer = null;
    this.isTyping = false;
    this.allowEscape = true;
    this.previousFocus = null;
    this.panelsVisiveis = [];
    this.box.addEventListener('keydown', (event) => this.manejarTecladoModal(event));
    this.botaoContinuar.addEventListener('click', () => {
      if (this.isTyping) {
        this.finishTyping();
        return;
      }
      if (this.onContinue) {
        const continuar = this.onContinue;
        this.close({ restoreFocus: false });
        continuar();
      } else {
        this.close();
      }
    });
  }

  open({ nome, texto, choices = [], onChoice = null, onContinue = null, onType = null, typewriter = true, className = '', personagemId = null, retratoTipo = null, allowEscape = true }) {
    if (this.overlay.classList.contains('hidden')) {
      this.previousFocus = this.documentRef.activeElement;
      this.panelsVisiveis = ['panel-missoes', 'indicator-panel'].filter((id) => {
        const panel = this.documentRef.getElementById(id);
        if (!panel || panel.classList.contains('hidden')) return false;
        panel.classList.add('hidden');
        return true;
      });
      this.documentRef.getElementById('btn-missoes')?.setAttribute('aria-expanded', 'false');
      this.documentRef.getElementById('btn-indicadores')?.setAttribute('aria-expanded', 'false');
    }
    this.clearTyping();
    const dicaContextual = this.documentRef.getElementById('tutorial-hint');
    if (dicaContextual && !dicaContextual.classList.contains('hidden')) {
      const botaoFecharDica = this.documentRef.getElementById('btn-tutorial-hint-close');
      if (botaoFecharDica) botaoFecharDica.click();
      else dicaContextual.classList.add('hidden');
    }
    this.nomeEl.textContent = nome || 'Narrador';
    const characterId = personagemId || {
      'Dona Cida': 'dona-cida',
      'Seu Nelson': 'nelson',
      Jaque: 'jaque',
      Rita: 'rita',
      'Mestre Tião': 'tiao',
      Davi: 'davi',
      'Rita e Jaque': 'rita',
      'Caderno de Saberes': 'jogador'
    }[nome] || 'jogador';
    this.portraitContext.clearRect(0, 0, this.portrait.width, this.portrait.height);
    this.portraitContext.imageSmoothingEnabled = false;
    this.portraitContext.fillStyle = '#EBD39A';
    this.portraitContext.fillRect(0, 0, this.portrait.width, this.portrait.height);
    this.portraitContext.fillStyle = '#8CCB5E';
    this.portraitContext.fillRect(0, 92, this.portrait.width, 36);
    this.portraitContext.fillStyle = '#D9A441';
    this.portraitContext.fillRect(0, 88, this.portrait.width, 5);
    if (retratoTipo) {
      this.desenharRetratoObservacao(retratoTipo);
    } else if (nome === 'Cachorro') {
      desenharCachorro(this.portraitContext, 64, 124, 64, 0, 'down');
    } else if (nome === 'Rita e Jaque') {
      desenharNpc(this.portraitContext, 42, 122, 40, 0, 'rita');
      desenharNpc(this.portraitContext, 88, 122, 40, 0, 'jaque');
    } else {
      desenharNpc(this.portraitContext, 64, 124, 64, 0, characterId);
    }
    const fullText = texto || '';
    this.fullText = fullText;
    this.textoEl.textContent = typewriter ? '' : fullText;
    this.box.classList.toggle('notebook-dialog', className === 'notebook');
    this.onChoice = onChoice;
    this.onContinue = onContinue;
    this.onType = onType;
    this.allowEscape = allowEscape;
    this.choicesEl.innerHTML = '';
    this.isTyping = Boolean(typewriter && fullText);
    this.textoEl.classList.toggle('is-typing', this.isTyping);
    this.botaoContinuar.classList.toggle('hidden', choices.length > 0 && !this.isTyping);
    this.botaoContinuar.textContent = this.isTyping ? 'Pular ⏩' : 'Continuar ▶';
    this.choicesEl.classList.toggle('hidden', this.isTyping);

    if (choices.length) {
      choices.forEach((choice, index) => {
        const button = this.documentRef.createElement('button');
        button.type = 'button';
        button.className = 'choice-button';
        button.textContent = choice.text;
        button.addEventListener('click', () => {
          const handleChoice = this.onChoice;
          this.close({ restoreFocus: false });
          if (handleChoice) handleChoice(index);
        });
        this.choicesEl.appendChild(button);
      });
    }

    this.overlay.classList.remove('hidden');
    this.atualizarFundoInerte(true);
    if (this.isTyping) {
      let index = 0;
      let soundCounter = 0;
      this.typingTimer = setInterval(() => {
        index += 1;
        this.textoEl.textContent = fullText.slice(0, index);
        soundCounter += 1;
        if (soundCounter % 3 === 0 && this.onType) this.onType();
        if (index >= fullText.length) this.finishTyping();
      }, 24);
    }
    const first = this.isTyping ? this.botaoContinuar : (this.choicesEl.querySelector('button') || this.botaoContinuar);
    if (first) setTimeout(() => {
      if (first.isConnected && !this.overlay.classList.contains('hidden')) {
        first.focus({ preventScroll: true });
      }
    }, 80);
  }

  desenharRetratoObservacao(tipo) {
    const ctx = this.portraitContext;
    const centroX = this.portrait.width / 2;
    const baseY = this.portrait.height - 10;
    ctx.fillStyle = '#D9BE82';
    ctx.fillRect(0, 0, this.portrait.width, this.portrait.height);
    ctx.fillStyle = '#2BB5C9';
    ctx.fillRect(0, 92, this.portrait.width, 36);
    if (tipo === 'peixe') {
      desenharObjeto(ctx, 'peixe', centroX, baseY, 64, 0);
      return;
    }
    if (tipo === 'passaro') {
      desenharAve(ctx, centroX, baseY, 64, 0, true);
      return;
    }
    if (tipo === 'caranguejo') {
      ctx.fillStyle = '#A64C3A';
      ctx.fillRect(35, 70, 58, 24);
      ctx.fillRect(24, 62, 16, 16);
      ctx.fillRect(88, 62, 16, 16);
      ctx.fillStyle = '#5A3A1E';
      [42, 56, 72, 86].forEach((x) => ctx.fillRect(x, 88, 5, 17));
      ctx.fillRect(46, 58, 5, 8);
      ctx.fillRect(76, 58, 5, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(46, 62, 5, 5);
      ctx.fillRect(76, 62, 5, 5);
      return;
    }
    if (tipo === 'lagarto') {
      ctx.fillStyle = '#5F8B45';
      ctx.fillRect(28, 72, 58, 18);
      ctx.fillRect(78, 64, 22, 22);
      ctx.fillRect(12, 78, 20, 6);
      ctx.fillRect(42, 86, 7, 17);
      ctx.fillRect(72, 86, 7, 17);
      ctx.fillStyle = '#2B1A0E';
      ctx.fillRect(91, 71, 4, 4);
    }
  }

  close({ restoreFocus = true } = {}) {
    this.clearTyping();
    this.overlay.classList.add('hidden');
    this.atualizarFundoInerte(false);
    this.box.classList.remove('notebook-dialog');
    this.choicesEl.innerHTML = '';
    this.onChoice = null;
    this.onContinue = null;
    this.onType = null;
    this.allowEscape = true;
    this.fullText = '';
    this.panelsVisiveis.forEach((id) => this.documentRef.getElementById(id)?.classList.remove('hidden'));
    this.documentRef.getElementById('btn-missoes')?.setAttribute('aria-expanded', String(this.panelsVisiveis.includes('panel-missoes')));
    this.documentRef.getElementById('btn-indicadores')?.setAttribute('aria-expanded', String(this.panelsVisiveis.includes('indicator-panel')));
    this.panelsVisiveis = [];
    const focoAnterior = this.previousFocus;
    this.previousFocus = null;
    if (restoreFocus && focoAnterior?.isConnected && !focoAnterior.closest('.hidden')) {
      setTimeout(() => focoAnterior.focus({ preventScroll: true }), 0);
    }
  }

  atualizarFundoInerte(ativo) {
    const tela = this.documentRef.getElementById('screen-game');
    if (!tela) return;
    const canvasMapa = this.documentRef.getElementById('gameCanvas');
    const avisoSistema = this.documentRef.getElementById('system-notice');
    if (canvasMapa) canvasMapa.inert = ativo;
    if (avisoSistema) avisoSistema.inert = ativo;
    [...tela.children].forEach((elemento) => {
      if (elemento === this.overlay) return;
      const modalVisivel = elemento.matches('#interior-panel, #card-explicacao, #card-resumo, #pause-menu')
        && !elemento.classList.contains('hidden');
      elemento.inert = ativo || !modalVisivel && elemento.classList.contains('modal');
      if (!ativo && modalVisivel) elemento.inert = false;
    });
  }

  manejarTecladoModal(event) {
    if (event.key === 'Escape') {
      if (!this.allowEscape) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focaveis = [...this.box.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((elemento) => !elemento.classList.contains('hidden'));
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (event.shiftKey && this.documentRef.activeElement === primeiro) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && this.documentRef.activeElement === ultimo) {
      event.preventDefault();
      primeiro.focus();
    }
  }

  clearTyping() {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
  }

  finishTyping() {
    this.clearTyping();
    this.isTyping = false;
    this.textoEl.textContent = this.fullText || this.textoEl.textContent;
    this.textoEl.classList.remove('is-typing');
    this.choicesEl.classList.remove('hidden');
    this.botaoContinuar.textContent = 'Continuar ▶';
    this.botaoContinuar.classList.toggle('hidden', this.choicesEl.children.length > 0);
  }
}
