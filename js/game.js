/**
 * MOTOR DO JOGO - MUNDO DOS AMIGOS
 * 🔒 VERSÃO DEFINITIVA TOTAL (EDIÇÃO ANTI-TRAVAMENTO AAA)
 * RESPONSÁVEL: Lead Developer
 */

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // ELEMENTOS DOM & ESTADO GLOBAL
    // ===============================
    const elPergunta = document.getElementById('question');
    const elScore = document.getElementById('score');
    const elBarra = document.getElementById('progressBarFull');
    const elFase = document.getElementById('progressText');

    let fase = 1;
    let nivel = 1;
    let errosSeguidos = 0;
    let score = 0;

    let respostaCorreta = 0;
    let bloqueado = false;
    let combo = 0;

    let ultimoClique = 0;
    let ultimoTempoFala = 0;
    let emTransicao = false;

    let emojiAtual = "🐝";

    const nomeJogador = localStorage.getItem("nomeJogador") || "Amigo";
    const materia = localStorage.getItem("materiaAtual") || "soma";

    // --- FUNÇÃO: escolherEmojiRodada (Define o ícone lúdico da fase) ---
    function escolherEmojiRodada() {
        try {
            const objetos = ["🐝", "🐶", "🍌", "⭐", "🍎", "⚽", "🍓"];
            emojiAtual = objetos[Math.floor(Math.random() * objetos.length)];
        } catch {
            emojiAtual = "⭐";
        }
    }

    // --- FUNÇÃO: falarSeguro (Controle inteligente de fala) ---
    function falarSeguro(texto, tipo = "dica") {
        try {
            const agora = Date.now();
            if (agora - ultimoTempoFala < 250) return;
            ultimoTempoFala = agora;

            if (window.speechSynthesis) {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
            }

            if (typeof falar === "function") {
                falar(texto, tipo);
            }
        } catch (e) {
            console.error("[FALA ERRO]", e);
        }
    }

    // --- FUNÇÃO: efeitoAcertoDisney (Chuva de confetes premium) ---
    function efeitoAcertoDisney() {
        try {
            const cores = ["#FFD700", "#FF69B4", "#00CED1", "#ADFF2F", "#FF4500"];
            for (let i = 0; i < 30; i++) {
                const p = document.createElement("div");
                p.style.cssText = `
                    position:fixed; left:50%; top:50%;
                    width:${8 + Math.random() * 10}px; height:${8 + Math.random() * 10}px;
                    background-color:${cores[Math.floor(Math.random() * cores.length)]};
                    border-radius:50%; pointer-events:none; z-index:999999;
                `;
                const angulo = Math.random() * 2 * Math.PI;
                const distancia = 150 + Math.random() * 200;
                p.animate([
                    { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
                    { transform: `translate(calc(-50% + ${Math.cos(angulo)*distancia}px), calc(-50% + ${Math.sin(angulo)*distancia}px)) scale(0)`, opacity: 0 }
                ], { duration: 1200, easing: "cubic-bezier(0.1, 0.8, 0.3, 1)" });
                document.body.appendChild(p);
                setTimeout(() => p.remove(), 1300);
            }
        } catch (e) { console.error(e); }
    }

    // --- FUNÇÃO: recompensaEstrelaAAA (Feedback visual de progresso) ---
    function recompensaEstrelaAAA(origemX, origemY) {
        try {
            const e = document.createElement("div");
            e.innerText = "⭐";
            e.style.cssText = `position:fixed; left:${origemX}px; top:${origemY}px; font-size:3.5rem; z-index:999999; pointer-events:none; filter: drop-shadow(0 0 15px #facc15);`;
            document.body.appendChild(e);
            e.animate([
                { transform: "translate(-50%, -50%) scale(0.5)", opacity: 0 },
                { transform: "translate(-50%, -150px) scale(1.8) rotate(25deg)", opacity: 1, offset: 0.4 },
                { transform: "translate(-50%, -350px) scale(1) rotate(-25deg)", opacity: 0 }
            ], { duration: 1200, easing: "ease-out" });
            setTimeout(() => e.remove(), 1200);
        } catch (e) { console.error(e); }
    }

    // --- FUNÇÃO: mostrarCombo (Incentiva acertos consecutivos) ---
    function mostrarCombo(valor) {
        try {
            const div = document.createElement("div");
            div.innerText = `🔥 Combo x${valor}`;
            div.style.cssText = `position:fixed; top:140px; left:50%; transform:translateX(-50%); font-size:3rem; font-weight:900; color:#f97316; z-index:9999; pointer-events:none;`;
            document.body.appendChild(div);
            setTimeout(() => {
                div.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400 });
                setTimeout(() => div.remove(), 350);
            }, 1200);
        } catch (e) { console.error(e); }
    }

    // --- FUNÇÃO: mostrarCalculoVisual (Pedagogia Visual TEA) ---
    function mostrarCalculoVisual(n1, n2, operacao = "+") {
        try {
            let antigo = document.getElementById("visual-calculo");
            if (antigo) antigo.remove();

            const container = document.createElement("div");
            container.id = "visual-calculo";
            container.style.cssText = `
                position:fixed; left:50%; top:55%; transform:translate(-50%, -50%);
                z-index:999999; pointer-events:none; background: rgba(255,255,255,0.95);
                padding: 30px; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                border: 4px solid #facc15; text-align:center;
            `;

            document.body.appendChild(container);

            const gerarGrupo = (n) => Array.from({ length: n }, (_, i) => 
                `<span style="display:inline-block; font-size:3rem; margin:5px; animation: jumpEmoji 0.5s ${i * 0.1}s infinite alternate;">${emojiAtual}</span>`
            ).join("");

            let simbolo = operacao === "-" ? "−" : (operacao === "/" ? "÷" : "+");

            container.innerHTML = `
                <div style="margin-bottom:10px;">${gerarGrupo(n1)}</div>
                <div style="font-size:3rem; font-weight:900; color:#2563eb; margin:10px 0;">${simbolo}</div>
                <div style="margin-bottom:10px;">${gerarGrupo(n2)}</div>
                <div style="font-size:2.5rem; font-weight:900; color:#f59e0b; border-top:3px dashed #cbd5e1; padding-top:10px;">Contando com você!</div>
            `;

            setTimeout(() => {
                if (container.parentNode) {
                    container.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 });
                    setTimeout(() => { if (container.parentNode) container.remove(); }, 450);
                }
            }, 3000);
        } catch (e) { console.error(e); }
    }

    // --- FUNÇÃO: verificarResposta (CORRIGIDA - ANTI TRAVAMENTO) ---
    function verificarResposta(escolha, botao) {
        if (emTransicao) return; 

        if (bloqueado) return;
        bloqueado = true;

        const rect = botao.getBoundingClientRect();
        const bX = rect.left + rect.width / 2;
        const bY = rect.top + rect.height / 2;

        try {
            if (typeof tocarSom === "function") tocarSom('clique');

            if (escolha === respostaCorreta) {
                // ✅ ACERTO
                combo++;
                if (combo >= 2) mostrarCombo(combo);

                score += 10;
                fase++;
                errosSeguidos = 0;

                atualizarHUD();
                botao.classList.add("correto");
                efeitoAcertoDisney();
                recompensaEstrelaAAA(bX, bY);

                if (typeof tocarSomAcerto === "function") tocarSomAcerto();
                if (typeof vibrar === "function") vibrar(65);

                const frasesAcerto = ["Muito bem!", "Você é incrível!", "Acertou!", "Boa!", "Perfeito!"];
                falarSeguro(frasesAcerto[Math.floor(Math.random() * frasesAcerto.length)]);

                emTransicao = true;
                setTimeout(() => {
                    animarTransicao();
                    emTransicao = false;
                    bloqueado = false; // Garante liberação após transição
                }, 1400);

            } else {
                // ❌ ERRO
                combo = 0;
                errosSeguidos++;
                botao.classList.add("errado");
                if (typeof tocarSomErro === "function") tocarSomErro();
                if (typeof vibrar === "function") vibrar([100, 50, 100]);

                const frasesErro = ["Quase!", "Tente novamente!", "Você consegue!", "Vamos juntos!"];
                falarSeguro(frasesErro[Math.min(errosSeguidos - 1, 3)]);

                // Feedback visual imediato no erro
                const partes = elPergunta.innerText.match(/\d+/g);
                if (partes && partes.length >= 2) {
                    let op = elPergunta.innerText.includes("-") ? "-" : (elPergunta.innerText.includes("÷") ? "/" : "+");
                    setTimeout(() => mostrarCalculoVisual(parseInt(partes[0]), parseInt(partes[1]), op), 200);
                }

                setTimeout(() => {
                    botao.classList.remove("errado");
                    bloqueado = false; // Libera para nova tentativa
                }, 800);
            }
        } catch (e) { 
            console.error(e); 
            bloqueado = false; // Fallback crítico de segurança
        }
    }

    // --- FUNÇÃO: proximaPergunta (Ensino no início da fase) ---
    function proximaPergunta() {
        try {
            if (fase > 30) {
                localStorage.setItem("mostRecentScore", score);
                window.location.href = "end.html";
                return;
            }

            escolherEmojiRodada();
            bloqueado = false; // Reseta bloqueio na nova pergunta
            nivel = fase <= 10 ? 1 : (fase <= 20 ? 2 : 3);
            document.body.className = `tema-nivel-${nivel}`;

            let lim = (nivel === 1 ? 6 : (nivel === 2 ? 12 : 24));
            const n1 = Math.floor(Math.random() * lim) + 1;
            const n2 = Math.floor(Math.random() * lim) + 1;

            if (materia === "soma") {
                respostaCorreta = n1 + n2;
                elPergunta.innerText = `Quanto é ${n1} + ${n2}?`;
            } else if (materia === "subtracao") {
                const ma = Math.max(n1, n2);
                const me = Math.min(n1, n2);
                respostaCorreta = ma - me;
                elPergunta.innerText = `Quanto é ${ma} - ${me}?`;
            } else if (materia === "divisao") {
                respostaCorreta = n1;
                elPergunta.innerText = `Quanto é ${n1 * n2} ÷ ${n2}?`;
            }

            montarOpcoes();
            atualizarHUD();
            if (typeof narrar === "function") narrar(elPergunta.innerText);

            setTimeout(() => {
                mostrarCalculoVisual(n1, n2, materia === "subtracao" ? "-" : (materia === "divisao" ? "/" : "+"));
            }, 300);

        } catch (e) { console.error(e); }
    }

    // --- FUNÇÃO: montarOpcoes ---
    function montarOpcoes() {
        const botoes = Array.from(document.querySelectorAll(".choice-container"));
        let opcoes = [respostaCorreta];
        while (opcoes.length < 4) {
            let erro = respostaCorreta + (Math.floor(Math.random() * 8) - 4);
            if (erro > 0 && !opcoes.includes(erro)) opcoes.push(erro);
        }
        opcoes.sort(() => Math.random() - 0.5);
        botoes.forEach((btn, i) => {
            const texto = btn.querySelector('.choice-text');
            if (texto) texto.innerText = opcoes[i];
            btn.classList.remove("correto", "errado");
            btn.onclick = () => {
                if (Date.now() - ultimoClique < 250) return;
                ultimoClique = Date.now();
                verificarResposta(opcoes[i], btn);
            };
        });
    }

    // --- FUNÇÃO: animarTransicao ---
    function animarTransicao() {
        const container = document.querySelector(".game-container");
        if (!container) { proximaPergunta(); return; }
        container.style.transform = "scale(0.85)";
        container.style.opacity = "0";
        setTimeout(() => {
            proximaPergunta();
            container.style.transform = "scale(1)";
            container.style.opacity = "1";
        }, 350);
    }

    // --- FUNÇÃO: atualizarHUD ---
    function atualizarHUD() {
        if (elScore) elScore.innerText = score;
        if (elFase) elFase.innerText = `Fase ${fase}/30`;
        if (elBarra) elBarra.style.width = (fase / 30) * 100 + "%";
    }

    // --- INICIALIZAÇÃO ---
    escolherEmojiRodada();
    if (typeof carregarProgresso === "function") {
        carregarProgresso(nomeJogador, (dados) => {
            if (dados) {
                fase = parseInt(dados.fase_atual) || 1;
                score = parseInt(dados.pontos) || 0;
            }
            proximaPergunta();
        });
    } else {
        proximaPergunta();
    }
});