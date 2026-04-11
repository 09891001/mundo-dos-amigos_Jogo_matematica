/**
 * MUNDO DOS AMIGOS - PERSISTÊNCIA FIREBASE (V2.1.0)
 * 🔒 STATUS: ENGENHARIA SÊNIOR ATIVADA - HIGH SCALE EDITION
 * ✅ FIX: Ranking por Usuário (evita inflar o banco de dados)
 * ✅ FIX: Lógica de High Score (só salva se a nova pontuação for maior)
 * ✅ FIX: Sanitização de Nome (proteção contra campos vazios)
 * ✅ FIX: Sincronização Total Offline (Jogadores e Ranking)
 */

const firebaseConfig = {
    apiKey: "AIzaSyAKykFVtOUuFt5c7VO_xVuiZACR_VVR5IM",
    authDomain: "mundo-dos-amigos.firebaseapp.com",
    databaseURL: "https://mundo-dos-amigos-default-rtdb.firebaseio.com/",
    projectId: "mundo-dos-amigos",
    storageBucket: "mundo-dos-amigos.firebasestorage.app",
    messagingSenderId: "593559233837",
    appId: "1:593559233837:web:dbd954431dfe77cf849fa4"
};

// 1. Inicialização blindada
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 🔥 ATIVAÇÃO: Sincronização Total Offline
database.ref('jogadores').keepSynced(true);
database.ref('ranking').keepSynced(true);

/**
 * GERAÇÃO DE IDENTIDADE ÚNICA (UID)
 */
function obterUserId() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        // Usa fallback seguro se crypto.randomUUID não estiver disponível
        userId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
            ? crypto.randomUUID() 
            : "user_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem("userId", userId);
    }
    return userId;
}

/**
 * GRAVAR/ATUALIZAR PROGRESSO
 */
function salvarProgresso(nome, fase, score) {
    const userId = obterUserId();
    const nomeLimpo = (nome && nome.trim()) ? nome : "Jogador";
    
    console.log("[FIREBASE]: Sincronizando progresso de " + nomeLimpo);

    const dados = {
        nome: nomeLimpo,
        fase_atual: fase,
        pontos: score,
        ultima_atualizacao: firebase.database.ServerValue.TIMESTAMP
    };

    // Salva o progresso da jornada do jogador
    database.ref('jogadores/' + userId).update(dados)
    .then(() => {
        // Tenta atualizar o recorde no ranking global
        verificarEAtualizarRanking(userId, nomeLimpo, score);
    })
    .catch(e => console.error("[FIREBASE ERRO]: Falha ao salvar progresso", e));
}

/**
 * CARREGAR PROGRESSO
 */
function carregarProgresso(callback) {
    const userId = obterUserId();
    database.ref('jogadores/' + userId).once('value').then((snap) => {
        if (callback) callback(snap.val());
    }).catch(e => console.warn("[FIREBASE]: Modo offline ou erro ao buscar dados."));
}

/**
 * SISTEMA DE RANKING (RECORDES PESSOAIS)
 * ✅ Garante que o ranking não infle e só guarde o melhor score de cada um.
 */
function verificarEAtualizarRanking(userId, nome, score) {
    if (score <= 0) return;

    const rankingRef = database.ref('ranking/' + userId);

    rankingRef.once('value').then(snap => {
        const dadosAtuais = snap.val();

        // Só atualiza se for o primeiro registro ou se o novo score for maior
        if (!dadosAtuais || score > dadosAtuais.score) {
            rankingRef.set({
                nome: nome,
                score: score,
                data: firebase.database.ServerValue.TIMESTAMP
            });
            console.log("[RANKING]: Novo recorde pessoal registrado!");
        }
    });
}

/**
 * LEITURA DO TOP 10 (USO FUTURO NA UI)
 */
function buscarTopRanking(callback) {
    database.ref('ranking')
        .orderByChild('score')
        .limitToLast(10)
        .once('value', (snap) => {
            const lista = [];
            snap.forEach(item => {
                lista.push(item.val());
            });
            if (callback) callback(lista.reverse()); // Maior para o menor
        });
}

// Monitor de Conexão
database.ref('.info/connected').on('value', (snap) => {
    if (snap.val() === true) {
        console.log("[FIREBASE]: Cloud Sync Ativo.");
    } else {
        console.warn("[FIREBASE]: Offline - Cache Local Ativado.");
    }
});