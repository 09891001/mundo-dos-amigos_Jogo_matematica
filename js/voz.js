/**
 * SISTEMA DE VOZ CENTRALIZADO - MUNDO DOS AMIGOS
 * 🔒 VERSÃO: 4.7.0 - FIX DEFINITIVO IPHONE (VOICE SELECTION & DEPLOY)
 * RESPONSÁVEL: Engenheiro de Software Sênior
 */

let falando = false;
let vozLiberada = false;
let filaFalas = [];

/**
 * 🕵️ DETECÇÃO DE LEITOR DE TELA
 * Evita duplicidade sonora com VoiceOver, TalkBack ou NVDA.
 */
function detectarLeitorTela() {
    return (
        /VoiceOver|TalkBack|NVDA|JAWS/i.test(navigator.userAgent)
    );
}

/**
 * 🔓 FUNÇÃO: liberarVoz
 * Handshake essencial para o iOS habilitar o áudio via PointerDown.
 */
function liberarVoz() { 
    if (vozLiberada) return;

    try {
        if (!('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;
        
        const handshake = () => {
            const vozes = synth.getVoices();
            
            // iOS carrega as vozes assincronamente após a primeira interação
            if (vozes.length === 0) {
                setTimeout(handshake, 100);
                return;
            }

            // Ativa o hardware com um comando vazio e silencioso
            const msgSilenciosa = new SpeechSynthesisUtterance("");
            msgSilenciosa.volume = 0;
            synth.speak(msgSilenciosa);
            
            vozLiberada = true;
            console.log("[VOZ]: Sistema desbloqueado com sucesso (Produção).");
            processarFila();
        };

        handshake();
    } catch (e) {
        console.error("[VOZ ERRO]: Falha na inicialização do hardware:", e);
    }
}

/**
 * 🎯 GATILHOS DE DESBLOQUEIO
 * Pointerdown é o evento prioritário para Safari moderno.
 */
document.addEventListener("pointerdown", liberarVoz, { once: true });
document.addEventListener("touchstart", liberarVoz, { once: true });
document.addEventListener("click", liberarVoz, { once: true });

/**
 * 🗣️ FUNÇÃO: falar
 * Organiza as mensagens na fila de processamento.
 */
function falar(texto, tipo = "neutro", callback = null) {
    if (detectarLeitorTela()) {
        if (callback) callback();
        return;
    }

    filaFalas.push({ texto, tipo, callback });
    processarFila();
}

/**
 * ⚙️ PROCESSADOR DE FILA
 * Gerencia a reprodução sequencial e força seleção de voz para o iOS.
 */
function processarFila() {
    if (falando || filaFalas.length === 0 || !vozLiberada) return;

    const item = filaFalas.shift();
    const synth = window.speechSynthesis;
    const msg = new SpeechSynthesisUtterance(item.texto);
    
    msg.lang = "pt-BR";

    // 🔥 FIX IPHONE: Força seleção de voz válida (Crítico para Deploy/GitHub Pages)
    const vozes = synth.getVoices();
    const vozPT = vozes.find(v => v.lang === "pt-BR") 
               || vozes.find(v => v.lang.includes("pt")) 
               || vozes[0];

    if (vozPT) {
        msg.voice = vozPT;
    }

    falando = true;

    // Ajustes de entonação para suporte TEA
    if (item.tipo === "festa") { 
        msg.pitch = 1.2; 
        msg.rate = 1.0; 
    } else if (item.tipo === "dica") { 
        msg.pitch = 1.0; 
        msg.rate = 0.85; // Mais lento para suporte pedagógico
    } else { 
        msg.pitch = 1.1; 
        msg.rate = 1.0; 
    }

    msg.onend = () => {
        falando = false;
        if (item.callback) item.callback();
        processarFila(); 
    };

    msg.onerror = (event) => {
        // Ignora erros de interrupção comuns no mobile
        if (event.error === "interrupted" || event.error === "canceled") {
            falando = false;
            processarFila();
            return;
        }
        console.error("[VOZ ERRO REAL]:", event);
        falando = false;
        processarFila();
    };

    synth.speak(msg);
}

/**
 * 🛡️ FUNÇÃO: falarSeguro
 * Garante que a fala ocorra mesmo que o handshake ainda esteja processando.
 */
function falarSeguro(texto, tipo = "neutro", callback = null) {
    if (!vozLiberada) {
        setTimeout(() => falarSeguro(texto, tipo, callback), 800);
        return;
    }
    falar(texto, tipo, callback);
}

/**
 * API DE NARRAÇÃO RÁPIDA
 */
function narrar(texto) { 
    falar(texto, "neutro"); 
}

function narrarAcerto() {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";
    falar(`${nome}, você acertou!`, "festa");
}

function narrarErro() {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";
    falar(`${nome}, tente de novo com calma.`, "dica");
}

// Sincronização de vozes (Necessário para alguns navegadores carregarem a lista)
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        console.log("[VOZ]: Dicionário de vozes sincronizado.");
    };
}