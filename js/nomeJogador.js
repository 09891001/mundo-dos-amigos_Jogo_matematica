// nomeJogador.js - Controle de nome do jogador (100% seguro e isolado)

document.addEventListener("DOMContentLoaded", () => {

    const inputNome = document.getElementById("inputNomeJogador");
    const btnIniciar = document.getElementById("btnIniciarJogo");

    // 🔒 Segurança: se não existir na tela, não quebra nada
    if (!inputNome || !btnIniciar) return;

    // 🔁 Se já tiver nome salvo, preenche automaticamente
    const nomeSalvo = localStorage.getItem("nomeJogador");
    if (nomeSalvo) {
        inputNome.value = nomeSalvo;
    }

    /**
     * 💾 FUNÇÃO: salvarNomeJogador
     */
    function salvarNomeJogador() { // Salva nome no localStorage
        let nome = inputNome.value.trim();

        if (!nome) {
            nome = "Jogador";
        }

        // 🔥 Primeira letra maiúscula (UX importante)
        nome = nome.charAt(0).toUpperCase() + nome.slice(1);

        localStorage.setItem("nomeJogador", nome);
    }

    // 🎯 Evento principal (mobile-friendly)
    btnIniciar.addEventListener("pointerdown", () => {
        salvarNomeJogador();
    });

});