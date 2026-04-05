/**
 * SISTEMA DE APOIO PSICOLÓGICO (TEA)
 * 🔒 VERSÃO FINAL - ARQUITETURA LIMPA
 * FOCO: APENAS SUPORTE EMOCIONAL E VOZ
 */

let apoioAtivo = false;
let ultimoDisparo = 0;

function verificarApoio(errosSeguidos, perguntaAtual) {
    try {
        const agora = Date.now();
        if (agora - ultimoDisparo < 5000) return;

        if (errosSeguidos >= 2 && !apoioAtivo) {
            apoioAtivo = true;
            ultimoDisparo = agora;
            iniciarApoio(perguntaAtual);
        }
    } catch (e) {
        console.error("[APOIO ERRO]", e);
    }
}

function iniciarApoio(pergunta) {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";
    const frases = [
        `${nome}, tudo bem errar. Vamos com calma.`,
        `${nome}, você está tentando, isso já é importante.`,
        `${nome}, pode respirar um pouco. Sem pressa.`,
        `${nome}, observe com atenção antes de responder.`,
        `${nome}, tente escolher a opção mais simples primeiro.`,
        `${nome}, leia novamente, você está perto de acertar.`
    ];

    const frase1 = frases[Math.floor(Math.random() * frases.length)];
    const frase2 = frases[Math.floor(Math.random() * frases.length)];

    // 🎧 FLUXO DE VOZ PURO (Sem controle de objeto)
    falar(frase1, "dica");

    setTimeout(() => {
        falar("Vamos juntos.", "dica");
    }, 1800);

    setTimeout(() => {
        falar(frase2, "dica");
    }, 3500);

    setTimeout(() => {
        falar("Vamos tentar novamente.", "dica");
    }, 5500);

    setTimeout(() => {
        falar(pergunta, "dica");
        apoioAtivo = false;
    }, 7000);
}

// ===============================
// 👁 FUNÇÃO: mostrarObjetoDaPergunta (DESATIVADA)
// ===============================
function mostrarObjetoDaPergunta(pergunta) {
    // 🔒 DESATIVADO — controle agora é exclusivo do game.js
}

function resetarApoio() {
    apoioAtivo = false;
}