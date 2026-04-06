/**
 * MUNDO DOS AMIGOS - SISTEMA DE FINALIZAÇÃO E RANKING
 * 🔒 VERSÃO: 9.0.0 - EXIBIÇÃO DE ESTRELAS E PONTOS ACUMULADOS
 * Foco: Persistência de dados, Feedback por voz e UX de recompensa.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Seleção de Elementos do DOM ---
    const elFinalScore = document.getElementById("finalScore");
    const elFinalStars = document.getElementById("finalStars");
    const usernameInput = document.getElementById("username");
    const saveScoreBtn = document.getElementById("saveScoreBtn");

    // --- Recuperação de Dados do Jogo (LocalStorage) ---
    const mostRecentScore = parseInt(localStorage.getItem("mostRecentScore")) || 0;
    const estrelasAcumuladas = parseInt(localStorage.getItem("estrelas")) || 0;
    const nomeSalvo = localStorage.getItem("nomeJogador") || "Amigo";

    /**
     * 🏁 INICIALIZAÇÃO DA TELA FINAL
     */
    function configurarTela() {
        try {
            // Exibe a pontuação da partida
            if (elFinalScore) {
                elFinalScore.innerText = mostRecentScore;
            }

            // Exibe o total de estrelas (Recompensa Principal)
            if (elFinalStars) {
                elFinalStars.innerText = estrelasAcumuladas;
                elFinalStars.classList.add("acerto-animado"); // Pulo de alegria
            }

            // Preenche o input com o nome que o jogador já usou
            if (usernameInput) {
                usernameInput.value = nomeSalvo;
            }

            // Feedback por Voz Personalizado
            anunciarVitoria();

        } catch (error) {
            console.error("[ERRO]: Falha ao carregar resultados finais", error);
        }
    }

    /**
     * 🔊 FEEDBACK POR VOZ (ACESSIBILIDADE)
     */
    function anunciarVitoria() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Para vozes anteriores

            const texto = `Parabéns ${nomeSalvo}! Você conseguiu ${mostRecentScore} pontos e agora tem ${estrelasAcumuladas} estrelas!`;
            const msg = new SpeechSynthesisUtterance(texto);
            msg.lang = "pt-BR";
            msg.rate = 1.1; // Velocidade amigável
            window.speechSynthesis.speak(msg);
        }
    }

    /**
     * 🏆 SISTEMA DE RANKING (HIGH SCORES)
     */
    function salvarNoRanking(e) {
        if (e) e.preventDefault();

        const nomeFinal = usernameInput ? usernameInput.value.trim() : nomeSalvo;

        // Validação simples de nome
        if (nomeFinal.length < 2) {
            alert("Por favor, digite um nome válido para o ranking!");
            return;
        }

        try {
            const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

            const novoRegistro = {
                name: nomeFinal,
                score: mostRecentScore,
                stars: estrelasAcumuladas,
                date: new Date().toLocaleDateString()
            };

            // Adiciona e ordena do maior para o menor ponto
            highScores.push(novoRegistro);
            highScores.sort((a, b) => b.score - a.score);

            // Mantém apenas o Top 5 no Ranking
            const top5 = highScores.slice(0, 5);

            // Salva permanentemente
            localStorage.setItem("highScores", JSON.stringify(top5));
            localStorage.setItem("nomeJogador", nomeFinal); // Atualiza nome preferido

            console.log("[SISTEMA]: Pontuação salva no ranking.");

            // Redireciona para a tela de pódio (Highscores)
            window.location.href = "highscores.html";

        } catch (error) {
            console.error("[ERRO]: Falha ao salvar no ranking", error);
        }
    }

    /**
     * ⌨️ CONTROLES DE EVENTO
     */
    if (saveScoreBtn) {
        saveScoreBtn.addEventListener("click", salvarNoRanking);
    }

    // Atalho: Salvar ao apertar ENTER no teclado
    if (usernameInput) {
        usernameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                salvarNoRanking(e);
            }
        });
    }

    // --- Início do Processo ---
    configurarTela();
});