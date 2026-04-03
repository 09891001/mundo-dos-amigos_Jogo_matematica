/**
 * MOTOR DO JOGO - MUNDO DOS AMIGOS (BLINDADO)
 * Seguro, acessível, performático e sem quebra
 */

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // ELEMENTOS
    // ===============================
    const elPergunta = document.getElementById('question');
    const botoes = Array.from(document.querySelectorAll(".choice-container"));
    const elScore = document.getElementById('score');
    const elBarra = document.getElementById('progressBarFull');
    const elFase = document.getElementById('progressText');

    // ===============================
    // ESTADO GLOBAL
    // ===============================
    let fase = 1;
    let nivel = 1;
    let errosSeguidos = 0;
    let score = 0;
    let respostaCorreta = 0;
    let bloqueado = false;
    let combo = 0;

    const nomeJogador = localStorage.getItem("nomeJogador") || "Amigo";
    const materia = localStorage.getItem("materiaAtual") || "soma";

    // ===============================
    // INICIAR JOGO
    // ===============================
    function iniciarJogo() {
        console.log("[SISTEMA]: Iniciando jogo para " + nomeJogador);

        try {
            if (typeof carregarProgresso === "function") {
                carregarProgresso(nomeJogador, (dados) => {
                    if (dados) {
                        fase = parseInt(dados.fase_atual) || 1;
                        score = parseInt(dados.pontos) || 0;
                    }
                    atualizarHUD();
                    proximaPergunta();
                });
            } else {
                atualizarHUD();
                proximaPergunta();
            }
        } catch (e) {
            console.error("[ERRO]: iniciarJogo", e);
            atualizarHUD();
            proximaPergunta();
        }
    }

    // ===============================
    // HUD
    // ===============================
    function atualizarHUD() {
        if (elScore) elScore.innerText = score;
        if (elFase) elFase.innerText = `Fase ${fase}/30`;

        if (elBarra) {
            const progresso = (fase / 30) * 100;
            elBarra.style.width = progresso + "%";
        }
    }

    // ===============================
    // PERGUNTA
    // ===============================
    function proximaPergunta() {
        try {
            if (fase > 30) {
                localStorage.setItem("mostRecentScore", score);
                window.location.href = "end.html";
                return;
            }

            bloqueado = false;

            nivel = fase <= 10 ? 1 : (fase <= 20 ? 2 : 3);
            document.body.className = `tema-nivel-${nivel}`;

            atualizarHUD();

            if (typeof gerenciarMusicaFundo === "function") {
                try { gerenciarMusicaFundo(nivel); } catch {}
            }

            let limite = nivel === 1 ? 5 : (nivel === 2 ? 10 : 20);
            limite = Math.max(2, limite - errosSeguidos);

            const n1 = Math.floor(Math.random() * limite) + 1;
            const n2 = Math.floor(Math.random() * limite) + 1;

            if (materia === "soma") {
                respostaCorreta = n1 + n2;
                elPergunta.innerText = `Quanto é ${n1} + ${n2}?`;
            } else if (materia === "subtracao") {
                const maior = Math.max(n1, n2);
                const menor = Math.min(n1, n2);
                respostaCorreta = maior - menor;
                elPergunta.innerText = `Quanto é ${maior} - ${menor}?`;
            } else if (materia === "divisao") {
                respostaCorreta = n1;
                elPergunta.innerText = `Quanto é ${n1 * n2} ÷ ${n2}?`;
            } else {
                respostaCorreta = n1 + n2;
                elPergunta.innerText = `Quanto é ${n1} + ${n2}?`;
            }

            aplicarAcessibilidade();
            montarOpcoes();

            if (typeof narrar === "function") {
                narrar(elPergunta.innerText);
            }

        } catch (e) {
            console.error("[ERRO]: proximaPergunta", e);
        }
    }

    // ===============================
    // ACESSIBILIDADE
    // ===============================
    function aplicarAcessibilidade() {
        if (!elPergunta) return;

        elPergunta.setAttribute("tabindex", "-1");
        elPergunta.setAttribute("aria-live", "polite");

        setTimeout(() => {
            try { elPergunta.focus(); } catch {}
        }, 100);
    }

    // ===============================
    // OPÇÕES
    // ===============================
    function montarOpcoes() {
        let opcoes = [respostaCorreta];

        while (opcoes.length < 4) {
            let erro1 = respostaCorreta + Math.floor(Math.random() * 4) + 1;
            let erro2 = Math.abs(respostaCorreta - (Math.floor(Math.random() * 3) + 1));

            if (!opcoes.includes(erro1)) opcoes.push(erro1);
            if (opcoes.length < 4 && !opcoes.includes(erro2)) opcoes.push(erro2);
        }

        opcoes.sort(() => Math.random() - 0.5);

        botoes.forEach((btn, i) => {
            const texto = btn.querySelector('.choice-text');

            if (texto) texto.innerText = opcoes[i];

            btn.classList.remove("correto", "errado");

            btn.onclick = null;
            btn.addEventListener("click", () => verificarResposta(opcoes[i], btn));
        });
    }

    // ===============================
    // RESPOSTA
    // ===============================
    function verificarResposta(escolha, botao) {
        if (bloqueado) return;
        bloqueado = true;

        try {
            if (typeof tocarSom === "function") tocarSom('clique');

            const rect = botao.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            if (escolha === respostaCorreta) {

                combo++;

                if (combo >= 3) mostrarCombo(combo);

                score += 10;
                fase++;
                errosSeguidos = 0;

                botao.classList.add("correto");

                if (elScore) elScore.innerText = score;

                for (let i = 0; i < 5; i++) criarEstrela(x, y);

                if (typeof tocarSomAcerto === "function") tocarSomAcerto();
                if (typeof narrarAcerto === "function") narrarAcerto();
                if (typeof vibrarAcerto === "function") vibrarAcerto();

                if (typeof salvarProgresso === "function") {
                    try { salvarProgresso(nomeJogador, fase, score); } catch {}
                }

                setTimeout(animarTransicao, 1000);

            } else {

                combo = 0;
                errosSeguidos++;

                botao.classList.add("errado");

                if (typeof tocarSomErro === "function") tocarSomErro();
                if (typeof vibrarErro === "function") vibrarErro();
                if (typeof narrarErro === "function") narrarErro(elPergunta.innerText);

                setTimeout(animarTransicao, 1200);
            }

        } catch (e) {
            console.error("[ERRO]: verificarResposta", e);
            bloqueado = false;
        }
    }

    // ===============================
    // TRANSIÇÃO
    // ===============================
    function animarTransicao() {
        const container = document.querySelector(".game-container");

        if (!container) {
            bloqueado = false;
            proximaPergunta();
            return;
        }

        container.classList.add("fade-out");

        setTimeout(() => {
            proximaPergunta();

            container.classList.remove("fade-out");
            container.classList.add("fade-in");

            setTimeout(() => {
                container.classList.remove("fade-in");
            }, 300);

        }, 300);
    }

    // ===============================
    // COMBO
    // ===============================
    function mostrarCombo(valor) {
        const div = document.createElement("div");
        div.innerText = `🔥 Combo x${valor}`;

        div.style.position = "fixed";
        div.style.top = "120px";
        div.style.left = "50%";
        div.style.transform = "translateX(-50%)";
        div.style.fontSize = "2rem";
        div.style.fontWeight = "bold";
        div.style.color = "#f97316";
        div.style.zIndex = "9999";

        document.body.appendChild(div);

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(`Combo de ${valor}`);
            msg.lang = "pt-BR";
            window.speechSynthesis.speak(msg);
        }

        setTimeout(() => div.remove(), 1200);
    }

    // ===============================
    // ESTRELAS (COM LIMITE)
    // ===============================
    function criarEstrela(x, y) {
        if (document.querySelectorAll(".estrela").length > 20) return;

        const estrela = document.createElement("div");

        estrela.className = "estrela";
        estrela.innerText = "⭐";

        estrela.style.position = "fixed";
        estrela.style.left = x + "px";
        estrela.style.top = y + "px";
        estrela.style.fontSize = "24px";
        estrela.style.pointerEvents = "none";
        estrela.style.zIndex = "9999";
        estrela.style.transition = "transform 0.8s ease, opacity 0.8s ease";

        document.body.appendChild(estrela);

        setTimeout(() => {
            estrela.style.transform = "translateY(-80px)";
            estrela.style.opacity = "0";
        }, 10);

        setTimeout(() => estrela.remove(), 800);
    }

    // ===============================
    // START
    // ===============================
    iniciarJogo();

});