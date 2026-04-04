/**
 * END.JS - SISTEMA DE RANKING PROFISSIONAL
 * Seguro, acessível e sem bugs
 */

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // ELEMENTOS
    // ===============================
    const usernameInput = document.getElementById("username");
    const saveScoreBtn = document.getElementById("saveScoreBtn");
    const finalScoreEl = document.getElementById("finalScore");

    // ===============================
    // DADOS
    // ===============================
    const mostRecentScore = Number(localStorage.getItem("mostRecentScore")) || 0;
    let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

    const MAX_HIGH_SCORES = 5;

    // ===============================
    // INICIALIZAÇÃO
    // ===============================
    function iniciarTelaFinal() {
        try {
            if (finalScoreEl) {
                finalScoreEl.innerText = mostRecentScore;
            }

            if (saveScoreBtn) {
                saveScoreBtn.disabled = true;
            }

        } catch (e) {
            console.error("[ERRO]: iniciarTelaFinal", e);
        }
    }

    // ===============================
    // VALIDAÇÃO INPUT
    // ===============================
    function validarNome(nome) {
        if (!nome) return false;

        nome = nome.trim();

        if (nome.length < 2) return false;
        if (nome.length > 20) return false;

        return true;
    }

    // ===============================
    // EVENTO INPUT
    // ===============================
    if (usernameInput) {
        usernameInput.addEventListener("input", () => {
            const nome = usernameInput.value;

            if (saveScoreBtn) {
                saveScoreBtn.disabled = !validarNome(nome);
            }
        });
    }

    // ===============================
    // SALVAR SCORE
    // ===============================
    function salvarPontuacao(e) {
        e.preventDefault();

        try {
            const nome = usernameInput.value.trim();

            if (!validarNome(nome)) {
                alert("Digite um nome válido (2 a 20 caracteres)");
                return;
            }

            const novoScore = {
                name: nome,
                score: mostRecentScore
            };

            // adiciona
            highScores.push(novoScore);

            // ordena corretamente
            highScores.sort((a, b) => b.score - a.score);

            // limita tamanho
            highScores = highScores.slice(0, MAX_HIGH_SCORES);

            // salva
            localStorage.setItem("highScores", JSON.stringify(highScores));

            console.log("[RANKING]: Score salvo com sucesso", novoScore);

            // feedback acessível
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();

                const msg = new SpeechSynthesisUtterance(`Pontuação salva, ${nome}!`);
                msg.lang = "pt-BR";
                window.speechSynthesis.speak(msg);
            }

            // redireciona
            window.location.href = "highscores.html";

        } catch (e) {
            console.error("[ERRO]: salvarPontuacao", e);
            alert("Erro ao salvar pontuação.");
        }
    }

    // ===============================
    // EVENTO BOTÃO
    // ===============================
    if (saveScoreBtn) {
        saveScoreBtn.addEventListener("click", salvarPontuacao);
    }

    // ===============================
    // ACESSIBILIDADE EXTRA
    // ===============================
    if (usernameInput) {
        usernameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !saveScoreBtn.disabled) {
                salvarPontuacao(e);
            }
        });
    }

    // ===============================
    // START
    // ===============================
    iniciarTelaFinal();

});