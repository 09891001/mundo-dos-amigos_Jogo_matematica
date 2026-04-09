/**
 * MUNDO DOS AMIGOS - NÚCLEO DO JOGO (ENGINE UNIFICADA V18.2.0)
 * 🔒 STATUS: ENGENHARIA SÊNIOR ATIVADA - DIAMOND MASTER EDITION
 * ✅ INTEGRIDADE: 100% (Voz, Música, Acessibilidade, Lógica TEA)
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Seleção de Elementos (Nodes) ---
    const nodes = {
        pergunta: document.getElementById('question'),
        score: document.getElementById('score'),
        barra: document.getElementById('progressBarFull'),
        fase: document.getElementById('progressText'),
        estrelas: document.getElementById('estrelas'),
        ajuda: document.getElementById("area-ajuda-visual"),
        musica: document.getElementById('musica-fundo')
    };

    // --- Estado Global do Jogo (State) ---
    const state = {
        operacao: localStorage.getItem("modoJogo") || "soma",
        fase: 1,
        score: 0,
        estrelas: parseInt(localStorage.getItem("estrelas")) || 0,
        acertosSeguidos: 0,
        numero1: 0,
        numero2: 0,
        errosSeguidos: 0,
        emojiAtual: "🍎",
        bloqueado: false, 
        respostaCorreta: 0,
        repetirPergunta: false,
        ultimaFraseApoio: ""
    };

    // Controle de hardware para iOS
    window.__audioLiberado = false;
    window.__vozTesteFeita = false;

    /**
     * 🔓 FUNÇÃO: desbloquearAudioIOS
     * Libera o canal e aquece o motor de vozes no Safari.
     */
    function desbloquearAudioIOS() {
        if (window.__audioLiberado) return;
        try {
            speechSynthesis.cancel();
            
            const utter = new SpeechSynthesisUtterance("ok");
            utter.volume = 0;
            speechSynthesis.speak(utter);

            setTimeout(() => {
                speechSynthesis.cancel();
                // Double-tap de hardware para iOS
                speechSynthesis.speak(new SpeechSynthesisUtterance(" "));
                speechSynthesis.cancel();

                const vozes = speechSynthesis.getVoices();
                if (!vozes || vozes.length === 0) speechSynthesis.getVoices();
            }, 20);

            if (nodes.musica) {
                nodes.musica.volume = 0.15;
                nodes.musica.play().catch(e => console.warn("BGM aguardando interação."));
            }
            
            window.__audioLiberado = true;
            console.log("[Engine]: Diamond Master Edition Ativada.");
        } catch (e) {
            console.warn("[Engine]: Falha no handshake de áudio.");
        }
    }

    /**
     * 📊 FUNÇÃO: atualizarHUD
     */
    function atualizarHUD() {
        if (nodes.score) nodes.score.innerText = state.score;
        if (nodes.fase) nodes.fase.innerText = `Fase ${state.fase}/30`;
        if (nodes.barra) nodes.barra.style.width = `${(state.fase / 30) * 100}%`;
        
        if (nodes.estrelas) {
            nodes.estrelas.innerText = state.estrelas;
            nodes.estrelas.classList.remove("acerto-animado");
            void nodes.estrelas.offsetWidth; 
            nodes.estrelas.classList.add("acerto-animado");
        }
    }

    /**
     * ❤️ FUNÇÃO: dispararFraseMotivacional (Suporte TEA)
     */
    function dispararFraseMotivacional() {
        const frasesApoio = [
            "Tudo bem errar, faz parte de aprender. Você está indo bem.",
            "Respire fundo, com calma você consegue tentar de novo.",
            "Cada tentativa é um passo à frente, continue assim.",
            "Você é capaz, só precisa de um pouquinho de calma.",
            "Não tem problema errar, vamos tentar juntos mais uma vez."
        ];

        let fraseEscolhida;
        do {
            fraseEscolhida = frasesApoio[Math.floor(Math.random() * frasesApoio.length)];
        } while (fraseEscolhida === state.ultimaFraseApoio);

        state.ultimaFraseApoio = fraseEscolhida;

        setTimeout(() => {
            if (typeof falar === "function") falar(fraseEscolhida);
        }, 800);
    }

    /**
     * 🔄 FUNÇÃO: proximaPergunta
     */
    function proximaPergunta() {
        if (state.repetirPergunta) {
            state.repetirPergunta = false;
            state.bloqueado = false;
            montarOpcoes();
            return;
        }

        state.bloqueado = false;
        state.errosSeguidos = 0;
        if (nodes.ajuda) nodes.ajuda.innerHTML = "";

        let simbolo = "+";
        const limite = Math.min(5 + state.fase, 20);

        if (state.operacao === "soma") {
            state.numero1 = Math.floor(Math.random() * 5) + 1;
            state.numero2 = Math.floor(Math.random() * 5) + 1;
            state.respostaCorreta = state.numero1 + state.numero2;
        } else if (state.operacao === "subtracao") {
            state.numero1 = Math.floor(Math.random() * 9) + 2;
            state.numero2 = Math.floor(Math.random() * (state.numero1 - 1)) + 1;
            state.respostaCorreta = state.numero1 - state.numero2;
            simbolo = "−";
        } else if (state.operacao === "divisao") {
            state.numero2 = Math.floor(Math.random() * 4) + 1;
            let result = Math.floor(Math.random() * 5) + 1;
            state.numero1 = state.numero2 * result;
            state.respostaCorreta = result;
            simbolo = "÷";
        }

        if (nodes.pergunta) {
            const textoQuestao = `Quanto é ${state.numero1} ${simbolo} ${state.numero2}?`;
            nodes.pergunta.innerText = textoQuestao;
            nodes.pergunta.setAttribute("role", "alert");
            
            setTimeout(() => {
                nodes.pergunta.focus();
            }, 50);

            if (typeof falar === "function" && window.__audioLiberado && state.fase > 1 && window.__vozTesteFeita) {
                speechSynthesis.cancel();
                setTimeout(() => {
                    falar(textoQuestao);
                }, 60);
            }
        }
        
        atualizarHUD();
        montarOpcoes();
    }

    /**
     * 🎯 FUNÇÃO: selecionarRespostaDireta
     */
    function selecionarRespostaDireta(botao) {
        if (state.bloqueado) return;
        state.bloqueado = true;

        const valor = Number(botao.dataset.number);
        if (isNaN(valor)) {
            state.bloqueado = false;
            return;
        }

        const acertou = valor === state.respostaCorreta;
        const nome = localStorage.getItem("nomeJogador") || "Jogador";

        if (acertou) {
            botao.classList.add("corcorre", "acerto-animado");
            if (nodes.ajuda) nodes.ajuda.innerHTML = "";
            state.score += 10;
            state.acertosSeguidos++;
            state.estrelas++;

            if (state.acertosSeguidos % 3 === 0) state.estrelas += 2;

            atualizarHUD();
            if (typeof falar === "function" && window.__audioLiberado) {
                falar(`${nome}, você acertou!`);
            }

            setTimeout(() => {
                state.fase++;
                state.bloqueado = false;
                state.fase > 30 ? finalizarJogo() : proximaPergunta();
            }, 1500);
        } else {
            botao.classList.add("errado", "erro-animado");
            state.acertosSeguidos = 0;
            state.errosSeguidos++;

            if (typeof falar === "function" && window.__audioLiberado) {
                falar(`${nome}, tente novamente.`);
            }

            if (state.errosSeguidos >= 2) mostrarAjudaVisual();
            if (state.errosSeguidos >= 3) dispararFraseMotivacional();

            setTimeout(() => {
                botao.classList.remove("errado", "erro-animado");
                state.repetirPergunta = true; 
                state.bloqueado = false;
                proximaPergunta();
            }, 800);
        }
    }

    /**
     * 🎨 FUNÇÃO: mostrarAjudaVisual (Reforço Pedagógico)
     */
    function mostrarAjudaVisual() {
        if (!nodes.ajuda) return;
        const nome = localStorage.getItem("nomeJogador") || "Jogador";
        
        // Estrutura de auxílio visual baseada em emojis
        let helpHTML = `<div id="visual-calculo" style="display:flex; flex-direction:column; align-items:center; gap:10px; animation: bounceIn 0.5s;">`;
        
        const gerarEmojis = (n) => Array(n).fill(`<span style="font-size:1.5rem">${state.emojiAtual}</span>`).join("");
        
        if (state.operacao === "soma") {
            helpHTML += `<div>${gerarEmojis(state.numero1)}</div><div>+</div><div>${gerarEmojis(state.numero2)}</div>`;
        } else if (state.operacao === "subtracao") {
            helpHTML += `<div>${gerarEmojis(state.numero1)}</div><div>-</div><div>${gerarEmojis(state.numero2)}</div>`;
        } else if (state.operacao === "divisao") {
            helpHTML += `<div>${gerarEmojis(state.numero1)} repartidos para ${state.numero2}</div>`;
        }
        
        helpHTML += `</div>`;
        nodes.ajuda.innerHTML = helpHTML;
        
        setTimeout(() => {
            if (typeof falar === "function") falar(`${nome}, conte os itens na tela.`);
        }, 1200);
    }

    /**
     * ⌨️ FUNÇÃO: montarOpcoes
     */
    function montarOpcoes() {
        const botoes = document.querySelectorAll(".choice-container");
        if (!botoes || botoes.length === 0) return;

        let opcoes = [state.respostaCorreta];
        while (opcoes.length < 4) {
            let n = state.respostaCorreta + (Math.floor(Math.random() * 6) - 3);
            if (n >= 0 && !opcoes.includes(n)) opcoes.push(n);
        }
        opcoes.sort(() => Math.random() - 0.5);
        
        botoes.forEach((btn, i) => {
            const txt = btn.querySelector(".choice-text");
            if (txt) txt.innerText = opcoes[i];
            
            btn.dataset.number = opcoes[i];
            btn.classList.remove("correto", "errado");
            
            btn.setAttribute("tabindex", "0");
            btn.setAttribute("role", "button");
            btn.setAttribute("aria-label", `Resposta ${opcoes[i]}`);

            btn.onclick = () => {
                if (state.bloqueado) return;
                desbloquearAudioIOS();

                if (!window.__vozTesteFeita) {
                    window.__vozTesteFeita = true;
                    setTimeout(() => {
                        speechSynthesis.cancel();
                        falar("Vamos começar!");
                    }, 300);

                    setTimeout(() => {
                        falar(nodes.pergunta.innerText);
                    }, 700);

                    setTimeout(() => {
                        selecionarRespostaDireta(btn);
                    }, 900);
                } else {
                    selecionarRespostaDireta(btn);
                }
            };

            btn.onkeydown = (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    btn.click();
                }
            };
        });
    }

    function finalizarJogo() {
        localStorage.setItem("mostRecentScore", state.score);
        localStorage.setItem("estrelas", state.estrelas);
        window.location.href = "end.html";
    }

    proximaPergunta();
});