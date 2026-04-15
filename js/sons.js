/**
 * MUNDO DOS AMIGOS — MOTOR DE ÁUDIO (V9.0.0 ULTRA)
 * ✅ iOS/Safari: AudioContext + MP3 reais via HTMLAudio
 * ✅ Música de fundo com crossfade suave entre telas
 * ✅ Sons sintéticos Web Audio API como fallback se MP3 falhar
 * ✅ Volume master + mute persistido em localStorage
 */

// ─── AudioContext (Web Audio API) ───────────────────────────────────────────
let _ctx = null;
let _audioDesbloqueado = false;
let _musicaPendente = null;
let _musicaAtual = null;
let _gainMusica = null;
let _nivelMusicaAtual = null;
let _mutado = localStorage.getItem("mutado") === "true";

function _getCtx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    return _ctx;
}

// ─── DESBLOQUEIO (obrigatório iOS) ──────────────────────────────────────────
function liberarAudio() {
    if (_audioDesbloqueado) return;
    try {
        const ctx = _getCtx();
        const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
        resume.then(() => {
            _audioDesbloqueado = true;
            console.log("[ÁUDIO] Desbloqueado ✓");
            if (_musicaPendente !== null) {
                gerenciarMusicaFundo(_musicaPendente);
                _musicaPendente = null;
            }
        }).catch(() => {});

        // Handshake silencioso para Safari
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.001);
    } catch (e) {}
}

document.addEventListener("pointerdown", liberarAudio, { once: true });
document.addEventListener("touchstart",  liberarAudio, { once: true });

// ─── SONS SINTÉTICOS (fallback + efeitos extras) ────────────────────────────
function _tom(freq, tipo, dur, vol = 0.25, delay = 0) {
    if (_mutado) return;
    try {
        const ctx = _getCtx();
        if (ctx.state !== 'running') return;
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = tipo;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur + 0.05);
    } catch (e) {}
}

// ─── MP3 REAIS ──────────────────────────────────────────────────────────────
const _mp3 = {};
const _MP3_LISTA = ['acerto','erro','clique','bonus','sair','home','fundo1','fundo2','fundo3'];
const _TRILHAS   = ['home','fundo1','fundo2','fundo3'];

_MP3_LISTA.forEach(nome => {
    const a = new Audio();
    a.src = `sons/${nome}.mp3`;
    a.preload = 'auto';
    if (_TRILHAS.includes(nome)) { a.loop = true; a.volume = 0.12; }
    else { a.volume = 0.55; }
    _mp3[nome] = a;
});

function _tocarMP3(nome) {
    if (_mutado) return;
    const a = _mp3[nome];
    if (!a) return;
    try {
        a.currentTime = 0;
        const p = a.play();
        if (p) p.catch(() => {});
    } catch (e) {}
}

// ─── EFEITOS ────────────────────────────────────────────────────────────────
function tocarSomAcerto() {
    _tocarMP3('acerto');
    // Reforço sintético: arpejo de vitória
    [[523,0],[659,0.1],[784,0.2],[1047,0.3]].forEach(([f,d]) => _tom(f,'sine',0.2,0.18,d));
}

function tocarSomErro() {
    _tocarMP3('erro');
    _tom(200,'sawtooth',0.15,0.2,0);
    _tom(160,'sawtooth',0.2,0.2,0.15);
}

function tocarSomClique() {
    _tocarMP3('clique');
}

function tocarSomBonus() {
    _tocarMP3('bonus');
    [784,988,1175,1568].forEach((f,i) => _tom(f,'sine',0.18,0.2,i*0.07));
}

function tocarSomConquista() {
    [523,523,523,659,523,659,784].forEach((f,i) => {
        _tom(f,'triangle',0.3,0.3,[0,.1,.2,.3,.5,.6,.7][i]);
    });
}

function tocarSomNivel() {
    [392,440,494,587,659,784].forEach((f,i) => _tom(f,'sine',0.22,0.25,i*0.08));
}

// ─── MUDO ───────────────────────────────────────────────────────────────────
function toggleMudo() {
    _mutado = !_mutado;
    localStorage.setItem("mutado", _mutado);
    if (_mutado && _musicaAtual) { _musicaAtual.pause(); }
    else if (!_mutado && _musicaAtual) { _musicaAtual.play().catch(()=>{}); }
    return _mutado;
}
function getMutado() { return _mutado; }

// ─── MÚSICA DE FUNDO ─────────────────────────────────────────────────────────
function gerenciarMusicaFundo(nivel) {
    if (!_audioDesbloqueado) { _musicaPendente = nivel; return; }
    if (_nivelMusicaAtual === nivel) return;
    _nivelMusicaAtual = nivel;

    // Fade out da música atual
    if (_musicaAtual) {
        const ant = _musicaAtual;
        let v = ant.volume;
        const fade = setInterval(() => {
            v = Math.max(0, v - 0.015);
            ant.volume = v;
            if (v <= 0) { clearInterval(fade); ant.pause(); ant.currentTime = 0; ant.volume = 0.12; }
        }, 50);
    }

    const chave = nivel === "home" ? "home" : `fundo${nivel}`;
    const nova  = _mp3[chave];
    if (!nova) return;

    _musicaAtual = nova;
    nova.volume  = 0;
    nova.currentTime = 0;

    if (!_mutado) {
        const p = nova.play();
        if (p) p.catch(() => {});
    }

    // Fade in
    let v = 0;
    const fade = setInterval(() => {
        v = Math.min(0.12, v + 0.004);
        nova.volume = v;
        if (v >= 0.12) clearInterval(fade);
    }, 50);
}

// ─── Compatibilidade legada ──────────────────────────────────────────────────
const sons = { sair: { play: () => Promise.resolve(tocarSomClique()) } };
function tocarSom(n) { ({acerto:tocarSomAcerto,erro:tocarSomErro,clique:tocarSomClique,bonus:tocarSomBonus}[n] || tocarSomClique)(); }
