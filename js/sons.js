const sons = {
    clique: new Audio('sons/clique.mp3'),
    acerto: new Audio('sons/acerto.mp3'),
    erro: new Audio('sons/erro.mp3'),
    sair: new Audio('sons/sair.mp3'),
    home: new Audio('sons/home.mp3'),
    fundo1: new Audio('sons/fundo1.mp3'),
    fundo2: new Audio('sons/fundo2.mp3'),
    fundo3: new Audio('sons/fundo3.mp3')
};

// Configuração inicial de volumes e pré-carregamento
Object.values(sons).forEach(s => {
    s.volume = 0.5;
    s.preload = "auto"; 
});

// Configurações de Loop e Volume para trilhas
sons.fundo1.volume = 0.15; sons.fundo1.loop = true;
sons.fundo2.volume = 0.15; sons.fundo2.loop = true;
sons.fundo3.volume = 0.15; sons.fundo3.loop = true;
sons.home.volume = 0.2;   sons.home.loop = true;

let musicaAtual = null;
let volumeOriginal = 0.15;

// ============================================================
// 🔓 SISTEMA DE DESBLOQUEIO DE ÁUDIO (iOS FIX - PREMIUM)
// ============================================================
let audioLiberado = false;

function liberarAudio() { // Libera áudio no primeiro toque com sincronização imediata
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
            console.error("[AUDIO]: Erro ao liberar som", e);
        }
    });

    audioLiberado = true;
    console.log("[AUDIO]: Sistema de som liberado para uso.");

    // 🔥 CORREÇÃO FINAL DEFINITIVA (Sincronização de Estado)
    // Se o motor do jogo já definiu uma música antes do toque, nós a iniciamos agora.
    if (musicaAtual) {
        musicaAtual.currentTime = 0;
        const playPromise = musicaAtual.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.warn("[AUDIO]: Falha ao iniciar música após unlock", e));
        }
    } else if (typeof gerenciarMusicaFundo === "function") {
        // Fallback caso nenhuma música tenha sido setada ainda
        gerenciarMusicaFundo(1);
    }
}

// 🔥 EVENTO UNIVERSAL (MOBILE + DESKTOP)
document.addEventListener("pointerdown", liberarAudio, { once: true });

// ============================================================
// 🎧 AUDIO DUCKING
// ============================================================
function abaixarMusica() { // Reduz volume para foco na voz/efeito
    if (!musicaAtual) return;
    volumeOriginal = musicaAtual.volume;
    musicaAtual.volume = 0.03;
}

function restaurarMusica() { // Retorna volume original
    if (!musicaAtual) return;
    musicaAtual.volume = volumeOriginal || 0.15;
}

// ============================================================
// 🔊 EXECUÇÃO DE SONS E TRILHAS
// ============================================================
function tocarSom(nome) { // Toca efeito sonoro com segurança
    if (!sons[nome] || !audioLiberado) return;

    try {
        abaixarMusica();
        const som = sons[nome];
        som.currentTime = 0;

        som.onended = () => {
            restaurarMusica();
        };

        const playPromise = som.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    } catch (err) {
        console.error("[AUDIO]: Falha ao tocar efeito " + nome, err);
    }
}

function gerenciarMusicaFundo(nivel) { // Gerencia trilha sonora com sincronização mobile segura
    let novaMusica = null;

    if (nivel === "home") novaMusica = sons.home;
    else if (nivel === 1) novaMusica = sons.fundo1;
    else if (nivel === 2) novaMusica = sons.fundo2;
    else if (nivel === 3) novaMusica = sons.fundo3;

    // Evita reiniciar a mesma música
    if (musicaAtual === novaMusica) return;

    // Para a música anterior
    if (musicaAtual) {
        musicaAtual.pause();
    }

    // 🔥 ATUALIZA REFERÊNCIA (PREPARAÇÃO DE ESTADO)
    musicaAtual = novaMusica;

    // Se o áudio já estiver liberado, toca imediatamente
    if (musicaAtual && audioLiberado) {
        musicaAtual.currentTime = 0;
        const playPromise = musicaAtual.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.warn("[AUDIO]: Trilha bloqueada:", e));
        }
    }
}

function tocarSomAcerto() { tocarSom('acerto'); }
function tocarSomErro() { tocarSom('erro'); }