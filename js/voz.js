/**
 * MUNDO DOS AMIGOS — VOZ (V5.1.0 ULTRA)
 * ✅ iOS/Safari: handshake após interação, vozes carregadas async
 * ✅ Fila com guardião anti-travamento (iOS não dispara onend)
 * ✅ Detecção de leitor de tela (VoiceOver, TalkBack)
 * ✅ Cancelamento seguro entre telas
 */

let _vozLiberada = false;
let _falando     = false;
let _fila        = [];
let _guardiao    = null;

function detectarLeitorTela() {
    return /VoiceOver|TalkBack|NVDA|JAWS/i.test(navigator.userAgent);
}

// ─── DESBLOQUEIO ─────────────────────────────────────────────────────────────
function liberarVoz() {
    if (_vozLiberada) return;
    if (!('speechSynthesis' in window)) { _vozLiberada = true; return; }

    const synth = window.speechSynthesis;

    function handshake() {
        synth.cancel();
        const vozes = synth.getVoices();
        if (vozes.length === 0) { setTimeout(handshake, 150); return; }

        const msg = new SpeechSynthesisUtterance(' ');
        msg.volume = 0; msg.rate = 2;
        msg.onend  = () => { _vozLiberada = true; _processarFila(); };
        msg.onerror = () => { _vozLiberada = true; _processarFila(); };
        synth.speak(msg);
    }
    handshake();
}

['pointerdown','touchstart','click'].forEach(ev =>
    document.addEventListener(ev, liberarVoz, { once: true })
);

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        if (!_vozLiberada) liberarVoz();
    };
}

// ─── API PÚBLICA ─────────────────────────────────────────────────────────────
function falar(texto, tipo = 'neutro', callback = null) {
    if (!texto || detectarLeitorTela()) { if (callback) callback(); return; }
    _fila.push({ texto, tipo, callback });
    _processarFila();
}

function falarSeguro(texto, tipo = 'neutro', callback = null) {
    if (!_vozLiberada) { setTimeout(() => falarSeguro(texto, tipo, callback), 400); return; }
    // Limpa fila e cancela fala atual para priorizar
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    _fila = []; _falando = false;
    falar(texto, tipo, callback);
}

function pararVoz() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    clearTimeout(_guardiao);
    _fila = []; _falando = false;
}

// ─── FILA ────────────────────────────────────────────────────────────────────
function _processarFila() {
    if (_falando || _fila.length === 0 || !_vozLiberada) return;

    const synth = window.speechSynthesis;
    if (synth.speaking) { synth.cancel(); setTimeout(_processarFila, 150); return; }

    const item = _fila.shift();
    const msg  = new SpeechSynthesisUtterance(item.texto);
    msg.lang   = 'pt-BR';

    // Seleciona voz pt-BR (crítico iOS)
    const vozes = synth.getVoices();
    const voz   = vozes.find(v => v.lang === 'pt-BR')
               || vozes.find(v => v.lang.startsWith('pt'))
               || (vozes[0] || null);
    if (voz) msg.voice = voz;

    // Entonação
    const cfg = { festa: [1.3,1.0,1.0], dica: [1.0,0.8,0.95], alerta: [0.9,0.85,1.0], neutro: [1.1,0.95,1.0] };
    const [pitch, rate, volume] = cfg[item.tipo] || cfg.neutro;
    msg.pitch = pitch; msg.rate = rate; msg.volume = volume;

    _falando = true;

    // ⏱️ Guardião iOS (iOS pode não disparar onend)
    const dur = Math.max(2500, item.texto.length * 75);
    _guardiao = setTimeout(() => {
        if (_falando) { _falando = false; if (item.callback) item.callback(); _processarFila(); }
    }, dur);

    msg.onend = () => {
        clearTimeout(_guardiao);
        _falando = false;
        if (item.callback) item.callback();
        _processarFila();
    };
    msg.onerror = (e) => {
        clearTimeout(_guardiao);
        _falando = false;
        if (e.error !== 'interrupted' && e.error !== 'canceled') console.warn('[VOZ]', e.error);
        _processarFila();
    };

    try { synth.speak(msg); } catch(e) { clearTimeout(_guardiao); _falando = false; _processarFila(); }
}

// Helpers legados
function narrar(t) { falar(t, 'neutro'); }
function narrarAcerto() { falar(`${localStorage.getItem('nomeJogador')||'Amigo'}, você acertou!`, 'festa'); }
function narrarErro()   { falar(`${localStorage.getItem('nomeJogador')||'Amigo'}, tente de novo.`,  'dica'); }
