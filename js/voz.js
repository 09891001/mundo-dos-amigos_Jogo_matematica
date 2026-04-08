/**
 * SISTEMA DE VOZ CENTRALIZADO - MUNDO DOS AMIGOS
 * 🔒 VERSÃO: 4.6.0 - FIX: DETECÇÃO PRECISA DE LEITOR DE TELA (A11Y)
 * RESPONSÁVEL: Engenheiro de Software Sênior
 */

let falando = false;
let vozLiberada = false;
let filaFalas = [];

/**
 * 🕵️ DETECÇÃO DE LEITOR DE TELA
 * Ajuste Cirúrgico: Removemos 'prefers-reduced-motion' para evitar falsos positivos.
 * Agora a voz só é desativada se um leitor de tela real for identificado via UserAgent.
 */
function detectarLeitorTela() {
    return (
        /VoiceOver|TalkBack|NVDA|JAWS/i.test(navigator.userAgent)
    );
}

/**
 * 🔓 FUNÇÃO: liberarVoz
 * Realiza o handshake inicial com a Web Speech API.
 * Essencial para contornar restrições de áudio no iOS/Safari via PointerDown.
 */
function liberarVoz() { 
    if (vozLiberada) return;

    try {
        if (!('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;
        
        const handshake = () => {
            const vozes = synth.getVoices();
            
            // Aguarda carregamento de vozes no iOS
            if (vozes.length === 0) {
                setTimeout(handshake, 100);
                return;
            }

            const msgSilenciosa = new SpeechSynthesisUtterance("");
            msgSilenciosa.volume = 0;
            synth.speak(msgSilenciosa);
            
            vozLiberada = true;
            console.log("[VOZ]: Sistema desbloqueado com sucesso.");
            processarFila();
        };

        handshake();
    } catch (e) {
        console.error("[VOZ ERRO]: Falha na ativação:", e);
    }
}

/**
 * 🎯 GATILHOS DE DESBLOQUEIO
 * Mantemos o 'pointerdown' como prioridade para iPhones modernos.
 */
document.addEventListener("pointerdown", liberarVoz, { once: true });
document.addEventListener("touchstart", liberarVoz, { once: true });
document.addEventListener("click", liberarVoz, { once: true });

/**
 * 🗣️ FUNÇÃO: falar
 * Encaminha mensagens para a fila de processamento.
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
 * Gerencia a reprodução sequencial para evitar sobreposição sonora.
 */
function processarFila() {
    if (falando || filaFalas.length === 0 || !vozLiberada) return;

    const item = filaFalas.shift();
    const synth = window.speechSynthesis;
    const msg = new SpeechSynthesisUtterance(item.texto);
    
    msg.lang = "pt-BR";
    falando = true;

    // Configurações de prosódia para suporte cognitivo (TEA)
    if (item.tipo === "festa") { 
        msg.pitch = 1.2; 
        msg.rate = 1.0; 
    } else if (item.tipo === "dica") { 
        msg.pitch = 1.0; 
        msg.rate = 0.85; // Velocidade reduzida para auxílio pedagógico
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
 */
function falarSeguro(texto, tipo = "neutro", callback = null) {
    if (!vozLiberada) {
        setTimeout(() => falarSeguro(texto, tipo, callback), 800);
        return;
    }
    falar(texto, tipo, callback);
}

/**
 * API DE NARRAÇÃO
 */
function narrar(texto) { 
    falar(texto, "neutro"); 
}

function narrarAcerto() {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";
    const frases = [`Muito bem, ${nome}!`, `Isso mesmo!`, `Excelente!`];
    falar(frases[Math.floor(Math.random() * frases.length)], "festa");
}

function narrarErro() {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";
    falar(`${nome}, tudo bem. Vamos tentar de novo com calma.`, "dica");
}

// Sincronização de vozes
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        console.log("[VOZ]: Dicionário de vozes pronto.");
    };
}