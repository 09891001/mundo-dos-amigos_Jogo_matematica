/**
 * MUNDO DOS AMIGOS — MOTOR DE ÁUDIO DEFINITIVO (V10.0.0)
 * ✅ iOS Safari: AudioContext desbloqueado no primeiro toque
 * ✅ MP3 reais com fallback sintético via Web Audio API
 * ✅ Música de fundo com crossfade suave (fundo1/2/3/home)
 * ✅ Sons especiais: parabéns fanfarra, nível up, conquista
 * ✅ Botão mudo persistido em localStorage
 */

// ─── ESTADO GLOBAL ──────────────────────────────────────────────
let _ctx       = null;
let _desbloq   = false;
let _mutado    = localStorage.getItem('mutado') === 'true';
let _trilhaAtiva = null;
let _nivelAtual  = null;
let _pendente    = null;

// ─── AudioContext lazy ───────────────────────────────────────────
function _ctx_get() {
    if (!_ctx) {
        try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { return null; }
    }
    return _ctx;
}

// ─── DESBLOQUEIO (obrigatório iOS/Safari) ───────────────────────
function liberarAudio() {
    if (_desbloq) return;
    const ctx = _ctx_get();
    if (!ctx) return;

    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    resume.then(() => {
        // Handshake silencioso
        try {
            const o = ctx.createOscillator(), g = ctx.createGain();
            g.gain.setValueAtTime(0, ctx.currentTime);
            o.connect(g); g.connect(ctx.destination);
            o.start(); o.stop(ctx.currentTime + 0.001);
        } catch(e) {}

        _desbloq = true;
        console.log('[ÁUDIO] ✓ Desbloqueado');

        // Inicia música pendente
        if (_pendente !== null) { gerenciarMusicaFundo(_pendente); _pendente = null; }
    }).catch(() => {});
}

document.addEventListener('pointerdown', liberarAudio, { once: true });
document.addEventListener('touchstart',  liberarAudio, { once: true });

// ─── SÍNTESE WEB AUDIO ──────────────────────────────────────────
function _tom(freq, tipo, dur, vol = 0.22, delay = 0) {
    if (_mutado) return;
    const ctx = _ctx_get(); if (!ctx || ctx.state !== 'running') return;
    try {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = tipo; o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        g.gain.setValueAtTime(0, ctx.currentTime + delay);
        g.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        o.start(ctx.currentTime + delay);
        o.stop(ctx.currentTime + delay + dur + 0.05);
    } catch(e) {}
}

// ─── MP3 MANAGER ────────────────────────────────────────────────
const _mp3 = {};
const _MP3_NAMES = ['acerto','erro','clique','bonus','sair','home','fundo1','fundo2','fundo3'];
const _TRILHAS   = new Set(['home','fundo1','fundo2','fundo3']);

_MP3_NAMES.forEach(n => {
    try {
        const a  = new Audio(`sons/${n}.mp3`);
        a.preload = 'auto';
        a.volume  = _TRILHAS.has(n) ? 0.12 : 0.55;
        if (_TRILHAS.has(n)) a.loop = true;
        _mp3[n] = a;
    } catch(e) {}
});

function _tocarMP3(nome) {
    if (_mutado || !_mp3[nome]) return;
    try { _mp3[nome].currentTime = 0; _mp3[nome].play().catch(() => {}); }
    catch(e) {}
}

// ─── EFEITOS SONOROS ────────────────────────────────────────────

/** Toca o MP3 e reforça com síntese */
function tocarSomAcerto() {
    _tocarMP3('acerto');
    // Arpejo de vitória Dó-Mi-Sol-Dó
    [[523,0],[659,0.1],[784,0.2],[1047,0.3]].forEach(([f,d]) => _tom(f,'sine',0.25,0.2,d));
}

function tocarSomErro() {
    _tocarMP3('erro');
    _tom(220,'sawtooth',0.12,0.2,0);
    _tom(180,'sawtooth',0.18,0.2,0.13);
}

function tocarSomClique() {
    _tocarMP3('clique');
    _tom(900,'sine',0.05,0.12,0);
}

function tocarSomBonus() {
    _tocarMP3('bonus');
    [784,988,1175,1568].forEach((f,i) => _tom(f,'sine',0.15,0.18,i*0.07));
}

/** Fanfarra de conquista/parabéns */
function tocarSomParabens() {
    // Parabéns a você — síntese completa
    const seq = [
        [523,.3],[523,.15],[587,.45],[523,.45],[698,.45],[659,.9],
        [523,.3],[523,.15],[587,.45],[523,.45],[784,.45],[698,.9],
        [523,.3],[523,.15],[1047,.45],[880,.45],[698,.45],[659,.45],[587,.9],
        [988,.3],[988,.15],[880,.45],[698,.45],[784,.45],[698,.9]
    ];
    let t = 0.1;
    seq.forEach(([f,d]) => { _tom(f,'triangle',d*0.9,0.22,t); t += d; });
}

function tocarSomConquista() {
    // Fanfarra curta
    [[523,0],[523,.1],[523,.2],[659,.3],[523,.5],[659,.6],[784,.7]].forEach(([f,d]) => _tom(f,'triangle',0.28,0.28,d));
}

function tocarSomNivel() {
    [392,440,494,587,659,784].forEach((f,i) => _tom(f,'sine',0.2,0.22,i*0.09));
}

function tocarSomFinal() {
    tocarSomParabens();
}

// ─── MÚSICA DE FUNDO ─────────────────────────────────────────────
function gerenciarMusicaFundo(nivel) {
    if (!_desbloq) { _pendente = nivel; return; }
    if (_nivelAtual === nivel) return;
    _nivelAtual = nivel;

    // Fade out da trilha atual
    if (_trilhaAtiva) {
        const ant = _trilhaAtiva;
        let v = ant.volume;
        const fi = setInterval(() => {
            v = Math.max(0, v - 0.012);
            try { ant.volume = v; } catch(e) {}
            if (v <= 0) { clearInterval(fi); try { ant.pause(); ant.currentTime = 0; ant.volume = 0.12; } catch(e) {} }
        }, 50);
    }

    const key  = nivel === 'home' ? 'home' : `fundo${nivel}`;
    const nova = _mp3[key];
    if (!nova) return;

    _trilhaAtiva  = nova;
    nova.volume   = 0;
    nova.currentTime = 0;

    setTimeout(() => {
        if (_mutado) return;
        nova.play().catch(() => {});
        let v = 0;
        const fo = setInterval(() => {
            v = Math.min(0.12, v + 0.005);
            try { nova.volume = v; } catch(e) {}
            if (v >= 0.12) clearInterval(fo);
        }, 50);
    }, 300);
}

// ─── MUDO ────────────────────────────────────────────────────────
function toggleMudo() {
    _mutado = !_mutado;
    localStorage.setItem('mutado', _mutado);
    if (_mutado && _trilhaAtiva) { try { _trilhaAtiva.pause(); } catch(e) {} }
    else if (!_mutado && _trilhaAtiva) { _trilhaAtiva.play().catch(() => {}); }
    return _mutado;
}
function getMutado() { return _mutado; }

// ─── Compatibilidade legada ──────────────────────────────────────
const sons = { sair: { play: () => Promise.resolve(tocarSomClique()) } };
function tocarSom(n) { ({acerto:tocarSomAcerto,erro:tocarSomErro,clique:tocarSomClique,bonus:tocarSomBonus}[n]||tocarSomClique)(); }
