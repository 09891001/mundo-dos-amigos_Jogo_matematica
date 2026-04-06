// CONFIGURAÇÃO DO FIREBASE (V8) - MUNDO DOS AMIGOS
const firebaseConfig = {
    apiKey: "AIzaSyAKykFVtOUuFt5c7VO_xVuiZACR_VVR5IM",
    authDomain: "mundo-dos-amigos.firebaseapp.com",
    databaseURL: "https://mundo-dos-amigos-default-rtdb.firebaseio.com/",
    projectId: "mundo-dos-amigos",
    storageBucket: "mundo-dos-amigos.firebasestorage.app",
    messagingSenderId: "593559233837",
    appId: "1:593559233837:web:dbd954431dfe77cf849fa4"
};

// 1. Inicialização blindada para evitar erros de duplicidade (SPA/Navegação)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

/**
 * GRAVAR DADOS: Salva progresso com sanitização de nome para chaves do Firebase
 */
function salvarProgresso(nome, fase, score) {
    if (!nome || nome.trim() === "") return;

    // 🔥 MELHORIA: Sanitização do nome (remove espaços e caracteres especiais para a chave)
    // Ex: "João Silva" vira "Jo_o_Silva" para evitar erros no Realtime Database
    const nomeSeguro = nome.trim().replace(/[^a-zA-Z0-9]/g, "_");

    console.log("[FIREBASE]: Sincronizando progresso de " + nomeSeguro);

    database.ref('jogadores/' + nomeSeguro).set({
        fase_atual: fase,
        pontos: score,
        ultima_atualizacao: firebase.database.ServerValue.TIMESTAMP
    }).catch(e => console.error("[FIREBASE ERRO]: Falha ao salvar no banco", e));
}

/**
 * BUSCAR DADOS: Recupera o progresso salvo
 */
function carregarProgresso(nome, callback) {
    if (!nome) return;
    
    const nomeSeguro = nome.trim().replace(/[^a-zA-Z0-9]/g, "_");
    
    console.log("[FIREBASE]: Buscando progresso de " + nomeSeguro);
    
    database.ref('jogadores/' + nomeSeguro).once('value').then((snap) => {
        if (callback) callback(snap.val());
    }).catch(e => console.error("[FIREBASE ERRO]: Erro ao buscar dados", e));
}

/**
 * MONITOR DE CONEXÃO
 */
database.ref(".info/connected").on("value", (snap) => {
    if (snap.val() === true) {
        console.log("[SISTEMA]: Conectado ao Firebase via HTTPS.");
    } else {
        console.warn("[SISTEMA]: Operando em modo Offline. Sincronização pendente.");
    }
});