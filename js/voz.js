/**
 * SISTEMA DE VOZ CENTRALIZADO - MUNDO DOS AMIGOS
 * 🔒 BLINDADO E PADRONIZADO
 */

let falando = false;

/**
 * FUNÇÃO GLOBAL PADRÃO (USAR EM TODO O PROJETO)
 */
function falar(texto, tipo = "neutro", callback = null) {
    try {
        if (!('speechSynthesis' in window)) return;

        // Cancela qualquer fala anterior
        window.speechSynthesis.cancel();

        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = "pt-BR";

        // ===============================
        // CONTROLE EMOCIONAL (TEA)
        // ===============================
        if (tipo === "festa") {
            msg.pitch = 1.4;
            msg.rate = 1.1;
        } else if (tipo === "dica") {
            msg.pitch = 0.9;
            msg.rate = 0.85;
        } else {
            msg.pitch = 1.1;
            msg.rate = 1.0;
        }

        // ===============================
        // SINCRONIZAÇÃO COM MÚSICA
        // ===============================
        if (typeof abaixarMusica === "function") {
            abaixarMusica();
        }

        falando = true;

        msg.onend = () => {
            falando = false;

            if (typeof restaurarMusica === "function") {
                restaurarMusica();
            }

            if (callback) callback();
        };

        window.speechSynthesis.speak(msg);

    } catch (e) {
        console.error("[VOZ ERRO]", e);
    }
}

/**
 * NARRAÇÃO PADRÃO
 */
function narrar(texto) {
    falar(texto, "neutro");
}

/**
 * ACERTO
 */
function narrarAcerto() {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";

    const frases = [
        `Muito bem, ${nome}!`,
        `Isso mesmo, ${nome}!`,
        `Você acertou!`,
        `Excelente!`
    ];

    const escolhida = frases[Math.floor(Math.random() * frases.length)];
    falar(escolhida, "festa");
}

/**
 * ERRO COM APOIO
 */
function narrarErro(pergunta) {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";

    falar(`Tudo bem, ${nome}. Vamos tentar de novo.`, "dica", () => {
        falar(pergunta, "dica");
    });
}