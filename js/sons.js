/**
 * MUNDO DOS AMIGOS - SISTEMA DE ÁUDIO (ENGINE SONORA)
 * 🔒 VERSÃO FINAL: 6.4.0 - FIX: TOTAL BUFFER RESET & MEMORY CLEANUP
 * Foco: Estabilidade AAA, anti-glitch e performance mobile.
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

// 🔥 CONTROLE EXTERNO DE TIMEOUTS (Isolamento de estado)
const controleTimeouts = {};

// Configuração inicial de volumes e pré-carregamento
Object.values(sons).forEach(s => {
    s.volume = 0.5;
    s.preload = "auto"; 
});

// Configurações de trilhas sonoras (Loop e Volume baixo)
const trilhas = ['fundo1', 'fundo2', 'fundo3', 'home'];
trilhas.forEach(t => {
    if (sons[t]) {
        sons[t].volume = 0.12; 
        sons[t].loop = true;
    }
});

let musicaAtual = null;
let audioLiberado = false;

/**
 * 🔓 SISTEMA DE DESBLOQUEIO (MOBILE FIX)
 * Libera o hardware de som no primeiro toque do usuário.
 */
function liberarAudio() {
    if (audioLiberado) return;

    Object.values(sons).forEach(som => {
        try {
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
    console.log("[AUDIO]: Engine AAA pronta. Reset de buffer ativado.");

    if (musicaAtual) {
        executarAudioSeguro(musicaAtual);
    }
}

document.addEventListener("pointerdown", liberarAudio, { once: true });

/**
 * 🛡️ EXECUÇÃO PROTEGIDA (TRILHAS)
 */
function executarAudioSeguro(audio) {
    if (!audio) return;
    if (!audio.paused && audio.currentTime > 0) return;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {}).catch(() => {});
    }
}

/**
 * 🎧 EXECUÇÃO DE EFEITOS (RESET TOTAL DE BUFFER + ANTI-SPAM)
 * Garante que o som seja reiniciado instantaneamente sem glitches.
 */
function tocarSom(nome) {
    if (!sons[nome] || !audioLiberado) return;

    try {
        const som = sons[nome];

        // Limpa timeout anterior se houver para evitar fila
        if (controleTimeouts[nome]) {
            clearTimeout(controleTimeouts[nome]);
            delete controleTimeouts[nome]; 
        }

        // 🔥 RESET TOTAL DE BUFFER: Evita glitches em repetições rápidas
        if (!som.paused) {
            som.pause();
            som.currentTime = 0; 
        }

        // Agendamento de 10ms para estabilidade de buffer do navegador
        controleTimeouts[nome] = setTimeout(() => {
            try {
                som.currentTime = 0;

                const playPromise = som.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {});
                }

                // Limpeza de memória
                delete controleTimeouts[nome];

            } catch (err) {
                delete controleTimeouts[nome];
            }
        }, 10);

    } catch (err) {
        console.error("[AUDIO]: Falha crítica no efeito: " + nome, err);
    }
}

/**
 * 🎼 GERENCIAMENTO DE TRILHAS
 */
function gerenciarMusicaFundo(nivel) {
    let novaMusica = null;

    if (nivel === "home") novaMusica = sons.home;
    else if (nivel === 1) novaMusica = sons.fundo1;
    else if (nivel === 2) novaMusica = sons.fundo2;
    else if (nivel === 3) novaMusica = sons.fundo3;

    if (musicaAtual === novaMusica) return;

    if (musicaAtual) {
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