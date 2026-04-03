// ===============================
// CONFIGURAÇÃO DOS SONS
// ===============================
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

// Volume padrão
Object.values(sons).forEach(s => s.volume = 0.5);

// Música de fundo
sons.fundo1.volume = 0.15; sons.fundo1.loop = true;
sons.fundo2.volume = 0.15; sons.fundo2.loop = true;
sons.fundo3.volume = 0.15; sons.fundo3.loop = true;
sons.home.volume = 0.2;   sons.home.loop = true;

let musicaAtual = null;
let volumeOriginal = 0.15;

// ===============================
// 🎧 AUDIO DUCKING (PROFISSIONAL)
// ===============================
function abaixarMusica() {
    if (!musicaAtual) return;

    volumeOriginal = musicaAtual.volume;

    musicaAtual.volume = 0.03; // bem baixo
}

function restaurarMusica() {
    if (!musicaAtual) return;

    musicaAtual.volume = volumeOriginal || 0.15;
}

// ===============================
// TOCAR SOM COM DUCKING
// ===============================
function tocarSom(nome) {
    if (!sons[nome]) return;

    try {
        abaixarMusica();

        const som = sons[nome];
        som.currentTime = 0;

        som.onended = () => {
            restaurarMusica();
        };

        som.play().catch(() => {});
    } catch {}
}

// ===============================
// FUNÇÕES ESPECÍFICAS
// ===============================
function tocarSomAcerto() {
    tocarSom('acerto');
}

function tocarSomErro() {
    tocarSom('erro');
}

// ===============================
// MÚSICA DE FUNDO
// ===============================
function gerenciarMusicaFundo(nivel) {
    if (musicaAtual) musicaAtual.pause();

    if (nivel === "home") musicaAtual = sons.home;
    else if (nivel === 1) musicaAtual = sons.fundo1;
    else if (nivel === 2) musicaAtual = sons.fundo2;
    else if (nivel === 3) musicaAtual = sons.fundo3;

    if (musicaAtual) {
        musicaAtual.currentTime = 0;
        musicaAtual.play().catch(() => {});
    }
}