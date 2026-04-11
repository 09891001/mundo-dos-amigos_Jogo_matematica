/**
 * MUNDO DOS AMIGOS - NÚCLEO DO JOGO (ENGINE UNIFICADA V20.0.0)
 * 🔒 STATUS: ENGENHARIA SÊNIOR ATIVADA - DIAMOND PERFECTION EDITION
 * ✅ FIX: Feedback de clique em estado bloqueado (UX Refinada)
 * ✅ FIX: Controle Inteligente de Cancelamento (falarSeguro)
 * ✅ FIX: Áudio Adaptativo e Clima Emocional (sons.js integration)
 * ✅ FIX: Blindagem iOS (Handshake Profissional)
 * ✅ INTEGRIDADE: 100% (Voz, Música, Acessibilidade, TEA)
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Variáveis de Controle de Voz ---
    let ultimaFalaTimestamp = 0;

    // --- Seleção de Elementos (Nodes) ---
    const nodes = {
        pergunta: document.getElementById('question'),
        score: document.getElementById('score'),
        barra: document.getElementById('progressBarFull'),
        fase: document.getElementById('progressText'),
        estrelas: document.getElementById('estrelas'),
        ajuda: document.getElementById("area-ajuda-visual")
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
     * 🗣️ FUNÇÃO: falarSeguro
     * Evita cancelamentos agressivos e garante fluidez na fala.
     */
    function falarSeguro(texto) {
        const agora = Date.now();

        // Evita cancelamento agressivo em sequência rápida (menos de 300ms)
        if (agora - ultimaFalaTimestamp > 300) {
            speechSynthesis.cancel();
        }

        ultimaFalaTimestamp = agora;

        setTimeout(() => {
            if (typeof falar === "function") {
                falar(texto);
            }
        }, 120);
    }

    /**
     * 🧠 SISTEMA EMOCIONAL DE ÁUDIO
     */
    function controlarClimaDoJogo(tipo) {
        if (typeof gerenciarMusicaFundo !== "function") return;

        if (tipo === "calmo") {
            gerenciarMusicaFundo(1); 
        } else if (tipo === "medio") {
            gerenciarMusicaFundo(2); 
        } else if (tipo === "intenso") {
            gerenciarMusicaFundo(3); 
        }
    }

    /**
     * 🔓 FUNÇÃO: desbloquearAudioIOS
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
                speechSynthesis.speak(new SpeechSynthesisUtterance(" "));
                speechSynthesis.cancel();

                const vozes = speechSynthesis.getVoices();
                if (!vozes || vozes.length === 0) speechSynthesis.getVoices();
            }, 20);

            if (typeof gerenciarMusicaFundo === "function") {
                gerenciarMusicaFundo(1);
            }
            
            window.__audioLiberado = true;
            console.log("[Engine]: Diamond Perfection Edition Ativada.");
        } catch (e) {
            console.warn("[Engine]: Falha no handshake de áudio.");
        }
    }

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
        falarSeguro(fraseEscolhida);
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

        if (state.fase > 15) {
            controlarClimaDoJogo("intenso");
        }

        let simbolo = "+";
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
            
            requestAnimationFrame(() => {
                nodes.pergunta.focus();
            });

            if (window.__audioLiberado && state.fase > 1 && window.__vozTesteFeita) {
                falarSeguro(textoQuestao);
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
        const acertou = valor === state.respostaCorreta;
        const nome = localStorage.getItem("nomeJogador") || "Jogador";

        if (acertou) {
            if (typeof tocarSomAcerto === "function") tocarSomAcerto();

            botao.classList.add("correto", "acerto-animado");
            state.score += 10;
            state.acertosSeguidos++;
            state.estrelas++;

            if (state.acertosSeguidos % 3 === 0) state.estrelas += 2;

            controlarClimaDoJogo("medio");
            atualizarHUD();

            falarSeguro(`${nome}, muito bem! você acertou!`);

            setTimeout(() => {
                state.fase++;
                state.bloqueado = false;
                state.fase > 30 ? (window.location.href = "end.html") : proximaPergunta();
            }, 1500);
        } else {
            if (typeof tocarSomErro === "function") tocarSomErro();

            botao.classList.add("errado", "erro-animado");
            state.acertosSeguidos = 0;
            state.errosSeguidos++;

            controlarClimaDoJogo("calmo");

            falarSeguro(`${nome}, tudo bem... vamos tentar juntos.`);

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

    function mostrarAjudaVisual() {
        if (!nodes.ajuda) return;
        const nome = localStorage.getItem("nomeJogador") || "Jogador";
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
        
        falarSeguro(`${nome}, conte os itens na tela.`);
    }

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
                // ✅ MELHORIA FINAL: Feedback sonoro mesmo bloqueado
                if (state.bloqueado) {
                    if (typeof tocarSomClique === "function") tocarSomClique();
                    return;
                }

                desbloquearAudioIOS();

                if (typeof tocarSomClique === "function") tocarSomClique();

                if (!window.__vozTesteFeita) {
                    window.__vozTesteFeita = true;
                    falarSeguro("Vamos começar!");

                    setTimeout(() => {
                        falarSeguro(nodes.pergunta.innerText);
                    }, 800);

                    setTimeout(() => {
                        selecionarRespostaDireta(btn);
                    }, 1600);
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

    requestAnimationFrame(() => {
        proximaPergunta();
    });
});