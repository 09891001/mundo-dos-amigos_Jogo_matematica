// CONFIGURAÇÃO DO FIREBASE (V8)
const firebaseConfig = {
    apiKey: "AIzaSyAKykFVtOUuFt5c7VO_xVuiZACR_VVR5IM",
    authDomain: "mundo-dos-amigos.firebaseapp.com",
    databaseURL: "https://mundo-dos-amigos-default-rtdb.firebaseio.com/",
    projectId: "mundo-dos-amigos",
    storageBucket: "mundo-dos-amigos.firebasestorage.app",
    messagingSenderId: "593559233837",
    appId: "1:593559233837:web:dbd954431dfe77cf849fa4"
};



firebase.initializeApp(firebaseConfig);
const database = firebase.database();
console.log("[FIREBASE]: Sistema de dados pronto.");



/**
 * GRAVAR DADOS: Salva progresso no Realtime Database
 */
function salvarProgresso(nome, fase, score) {
    console.log("[FIREBASE]: Salvando dados de " + nome);
    database.ref('jogadores/' + nome).set({
        fase_atual: fase,
        pontos: score,
        data: Date.now()
    }).catch(e => console.error("[ERRO]: Falha ao salvar no banco", e));
}



/**
 * BUSCAR DADOS: Recupera onde o jogador parou
 */
function carregarProgresso(nome, callback) {
    console.log("[FIREBASE]: Buscando progresso de " + nome);
    database.ref('jogadores/' + nome).once('value').then((snap) => {
        callback(snap.val());
    });
}