/**
 * MUNDO DOS AMIGOS - SISTEMA DE ÁUDIO (ENGINE SONORA)
 * 🔒 VERSÃO FINAL: 6.7.0 - FIX: MOBILE AUTO-RESUME & SAFE PLAYBACK
 * Foco: Estabilidade total em transições de tela e compatibilidade mobile.
 */

const sons = {
    clique: new Audio('sons/clique.mp3'),
    acerto: new Audio('sons/acerto.mp3'),
    erro: new Audio('sons/erro.mp3'),
    sair: new Audio('sons/sair.mp3'),
    home: new Audio('sons/home.mp3'),
    bonus: new Audio('sons/bonus.mp3'),
    fundo1: new Audio('sons/fundo1.mp3'),
    fundo2: new Audio('sons/fundo2.mp3'),
    fundo3: new Audio('sons/fundo3.mp3')
};

// CONTROLE EXTERNO DE TIMEOUTS (Gestão de Memória)
const controleTimeouts = {};

// Configuração inicial de volumes e pré-carregamento
Object.values(sons).forEach(s => {
    s.volume = 0.5;
    s.preload = "auto"; 
});

// Configurações de trilhas sonoras (Loop e Volume baixo)
const trilhasNomes = ['fundo1', 'fundo2', 'fundo3', 'home'];
trilhasNomes.forEach(t => {
    if (sons[t]) {
        sons[t].volume = 0.12; 
        sons[t].loop = true;
    }
});

let musicaAtual = null;
let audioLiberado = false;

/**
 * 🔓 SISTEMA DE DESBLOQUEIO (FIX DE HARDWARE)
 * Libera apenas efeitos para não interromper a trilha ativa.
 */
function liberarAudio() {
    if (audioLiberado) return;

    Object.entries(sons).forEach(([nome, som]) => {
        try {
            const isTrilha = trilhasNomes.includes(nome);
            if (isTrilha) return;

            const playPromise = som.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    som.pause();
                    som.currentTime = 0;
                }).catch(() => {});
            }
        } catch (e) {
            console.error("[AUDIO]: Erro no desbloqueio", e);
        }
    });

    audioLiberado = true;
    console.log("[AUDIO]: Engine 6.7.0 pronta. Hardware liberado.");

    if (musicaAtual) {
        executarAudioSeguro(musicaAtual);
    }
}

document.addEventListener("pointerdown", liberarAudio, { once: true });

/**
 * 🛡️ EXECUÇÃO SEGURA (FIX DEFINITIVO MOBILE)
 * Garante a tentativa de reprodução sem bloqueios por estado inconsistente.
 */
function executarAudioSeguro(audio) {
    if (!audio) return;

    try {
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Silêncio total: o navegador pode bloquear temporariamente em trocas de aba
            });
        }
    } catch (e) {
        // Segurança total contra exceções de hardware
    }
}

/**
 * 🎧 EXECUÇÃO DE EFEITOS (ANTI-SPAM & RESET)
 */
function tocarSom(nome) {
    if (!sons[nome] || !audioLiberado) return;

    try {
        const som = sons[nome];

        if (controleTimeouts[nome]) {
            clearTimeout(controleTimeouts[nome]);
            delete controleTimeouts[nome]; 
        }

        if (!som.paused) {
            som.pause();
            som.currentTime = 0; 
        }

        controleTimeouts[nome] = setTimeout(() => {
            try {
                som.currentTime = 0;
                const playPromise = som.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {});
                }
                delete controleTimeouts[nome];
            } catch (err) {
                delete controleTimeouts[nome];
            }
        }, 10);

    } catch (err) {
        console.error("[AUDIO]: Falha no efeito: " + nome, err);
    }
}

/**
 * 🎼 GERENCIAMENTO DE TRILHAS (RESILIENTE)
 */
function gerenciarMusicaFundo(nivel) {
    let novaMusica = null;

    if (nivel === "home") novaMusica = sons.home;
    else if (nivel === 1) novaMusica = sons.fundo1;
    else if (nivel === 2) novaMusica = sons.fundo2;
    else if (nivel === 3) novaMusica = sons.fundo3;

    if (musicaAtual === novaMusica) return;

    if (musicaAtual && musicaAtual !== novaMusica) {
        musicaAtual.pause();
        musicaAtual.currentTime = 0;
    }

    musicaAtual = novaMusica;

    if (musicaAtual && audioLiberado) {
        executarAudioSeguro(musicaAtual);
    }
}

/**
 * 🎯 ATALHOS PARA O MOTOR DO JOGO
 */
function tocarSomAcerto() { tocarSom('acerto'); }
function tocarSomErro() { tocarSom('erro'); }
function tocarSomClique() { tocarSom('clique'); }
function tocarSomBonus() { tocarSom('bonus'); }