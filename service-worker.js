// service-worker.js

const CACHE_NAME = "mundo-amigos-v1";

// Listagem de todos os arquivos que o celular deve "baixar" para o modo App
const assets = [
    "./",
    "./index.html",
    "./game.html",
    "./css/game.css",
    "./js/sons.js",
    "./js/voz.js",
    "./js/vibracao.js",
    "./js/game.js",
    "./js/firebase.js",
    "./img/avatar-padrao.png",
    // Adicione aqui os caminhos exatos dos seus sons, ex:
    "./sons/clique.mp3",
    "./sons/fundo1.mp3"
];

// 1. INSTALAÇÃO: Salva todos os arquivos no cache do celular
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[SW]: Cacheando arquivos do jogo...");
            return cache.addAll(assets);
        })
    );
});

// 2. ATIVAÇÃO: Limpa versões antigas do jogo quando você atualizar o código
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// 3. ESTRATÉGIA DE BUSCA (Fetch): Tenta carregar do cache primeiro (muito mais rápido)
self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});