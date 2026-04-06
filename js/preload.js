/**
 * SISTEMA DE PRELOAD - MUNDO DOS AMIGOS
 * Garante que sons e imagens estejam na memória antes do início.
 */

const assetsParaCarregar = {
    sons: [
        'sons/acerto.mp3',
        'sons/erro.mp3',
        'sons/clique.mp3',
        'sons/fundo1.mp3',
        'sons/fundo2.mp3',
        'sons/fundo3.mp3'
    ],
    imagens: [
        'img/avatar-padrao.png'
    ]
};

function realizarPreload() {
    console.log("[PRELOAD]: Iniciando carregamento de assets...");

    // 1. Preload de Sons
    assetsParaCarregar.sons.forEach(url => {
        const audio = new Audio();
        audio.src = url;
        audio.preload = "auto";
        audio.load(); 
    });

    // 2. Preload de Imagem de Perfil (Recupera do LocalStorage se existir)
    const fotoSalva = localStorage.getItem("fotoJogador");
    if (fotoSalva) {
        const img = new Image();
        img.src = fotoSalva;
    }

    assetsParaCarregar.imagens.forEach(url => {
        const img = new Image();
        img.src = url;
    });

    console.log("[PRELOAD]: Assets enviados para o cache do navegador.");
}

// Executa assim que o script é lido
realizarPreload();