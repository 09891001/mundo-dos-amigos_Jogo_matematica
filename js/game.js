/**
 * MUNDO DOS AMIGOS - NÚCLEO DO JOGO (ENGINE UNIFICADA V11.4.0)
 * 🔒 VERSÃO FINAL ABSOLUTA: ROBUSTEZ CONTRA LOOP E SINCRONIZAÇÃO AAA
 * Foco: Estabilidade total, Prevenção de Bugs Críticos e Acessibilidade TEA.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Seleção de Elementos do DOM ---
    const elPergunta = document.getElementById('question');
    const elScore = document.getElementById('score');
    const elBarra = document.getElementById('progressBarFull');
    const elFase = document.getElementById('progressText');
    const elEstrelas = document.getElementById('estrelas');
    const containerAjuda = document.getElementById("area-ajuda-visual");

    // --- Estado Global ---
    let operacao = localStorage.getItem("modoJogo") || "soma";
    let fase = 1;
    let score = 0;
    let estrelas = parseInt(localStorage.getItem("estrelas")) || 0; 
    let acertosSeguidos = 0;
    let numero1 = 0;
    let numero2 = 0;
    let errosSeguidos = 0;
    let emojiAtual = "🍎";
    let ultimaFrase = ""; 
    
    window.respostaCorreta = 0;
    window.__bloqueadoResposta = false;

    /**
     * ⭐ SISTEMA DE RECOMPENSA
     */
    function registrarAcerto() {
        estrelas++;
        acertosSeguidos++;
        score += 10;
        atualizarEstrelasUI();

        if (acertosSeguidos === 3) {
            estrelas += 2;
            mostrarPopupBonus("🔥 SEQUÊNCIA INCRÍVEL! +2 ⭐");
            if (typeof tocarSom === "function") tocarSom('bonus');
        }
    }

    function registrarErro() {
        acertosSeguidos = 0;
        errosSeguidos++;
    }

    function atualizarEstrelasUI() {
        if (elEstrelas) {
            elEstrelas.innerText = estrelas;
            elEstrelas.classList.add("acerto-animado");
            setTimeout(() => elEstrelas.classList.remove("acerto-animado"), 400);
        }
    }

    function mostrarPopupBonus(texto) {
        const div = document.createElement("div");
        div.innerText = texto;
        div.className = "fade-in"; 
        Object.assign(div.style, {
            position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
            background: "#4CAF50", color: "#fff", padding: "15px 30px",
            borderRadius: "20px", fontSize: "20px", fontWeight: "900",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)", zIndex: "10000", pointerEvents: "none"
        });
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2000);
    }

    /**
     * 🔄 FUNÇÃO: proximaPergunta
     */
    function proximaPergunta() {
        window.__bloqueadoResposta = false;
        errosSeguidos = 0;
        limparEmojisAjuda();

        let simbolo = "+";

        if (operacao === "soma") {
            numero1 = Math.floor(Math.random() * 5) + 1;
            numero2 = Math.floor(Math.random() * 5) + 1;
            window.respostaCorreta = numero1 + numero2;
            simbolo = "+";
        } 
        else if (operacao === "subtracao") {
            numero1 = Math.floor(Math.random() * 9) + 2;
            numero2 = Math.floor(Math.random() * (numero1 - 1)) + 1;
            window.respostaCorreta = numero1 - numero2;
            simbolo = "−";
        } 
        else if (operacao === "divisao") {
            numero2 = Math.floor(Math.random() * 4) + 1;
            window.respostaCorreta = Math.floor(Math.random() * 5) + 1;
            numero1 = numero2 * window.respostaCorreta;
            simbolo = "÷";
        }

        const listaEmojis = ["🍎", "⭐", "⚽", "🍓", "🍌", "🚗", "🧸", "🎈"];
        emojiAtual = listaEmojis[Math.floor(Math.random() * listaEmojis.length)];

        if (elPergunta) {
            elPergunta.innerText = `Quanto é ${numero1} ${simbolo} ${numero2}?`;
            elPergunta.classList.remove("fade-in");
            void elPergunta.offsetWidth;
            elPergunta.classList.add("fade-in");
        }
        
        atualizarHUD();
        montarOpcoes();

        if (typeof falar === "function") falar(elPergunta.innerText);
    }

    /**
     * 🎯 FUNÇÃO: selecionarRespostaDireta
     */
    function selecionarRespostaDireta(botao) {
        if (window.__bloqueadoResposta) return;
        window.__bloqueadoResposta = true;

        const valor = Number(botao.dataset.number);
        const acertou = valor === window.respostaCorreta;

        if (acertou) {
            botao.classList.add("correto", "acerto-animado");
            registrarAcerto();
            errosSeguidos = 0; 

            if (typeof tocarSom === "function") tocarSom('acerto');
            
            setTimeout(() => {
                fase++;
                fase > 30 ? finalizarJogo() : proximaPergunta();
            }, 1500);

        } else {
            botao.classList.add("errado", "erro-animado");
            registrarErro();

            if (typeof tocarSom === "function") tocarSom('erro');

            if (errosSeguidos >= 2) {
                mostrarAjudaVisual();
            }

            if (errosSeguidos >= 3) {
                dispararFraseMotivacional();
            }

            setTimeout(() => {
                botao.classList.remove("errado", "erro-animado");
                window.__bloqueadoResposta = false;
            }, 800);
        }
    }

    /**
     * 🎨 FUNÇÃO: mostrarAjudaVisual
     */
    function mostrarAjudaVisual() {
        if (!containerAjuda) return;
        const div = document.createElement("div");
        div.id = "visual-calculo";

        const gerarEmojis = (qtd) => {
            let html = "";
            for (let i = 0; i < qtd; i++) {
                html += `<span class="emoji-ajuda" style="--i:${i}">${emojiAtual}</span>`;
            }
            return html;
        };

        let htmlFinal = "";

        if (operacao === "soma") {
            htmlFinal = `<div class="linha-calculo">${gerarEmojis(numero1)}</div><div class="sinal-calculo">+</div><div class="linha-calculo">${gerarEmojis(numero2)}</div>`;
        } 
        else if (operacao === "subtracao") {
            const resultado = numero1 - numero2;
            htmlFinal = `<div class="linha-calculo">${gerarEmojis(numero1)}</div><div class="sinal-calculo">−</div><div class="linha-calculo">${gerarEmojis(numero2)}</div><div class="sinal-calculo">=</div><div class="linha-calculo">${gerarEmojis(resultado)}</div>`;
        } 
        else if (operacao === "divisao") {
            const resultado = numero1 / numero2;
            htmlFinal = `<div class="linha-calculo">${gerarEmojis(numero1)}</div><div class="sinal-calculo">÷</div><div class="linha-calculo">${gerarEmojis(numero2)}</div><div class="sinal-calculo">=</div><div class="linha-calculo">${gerarEmojis(resultado)}</div>`;
        }

        div.innerHTML = htmlFinal;
        Object.assign(div.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", animation: "bounceIn 0.5s ease" });
        containerAjuda.innerHTML = "";
        containerAjuda.appendChild(div);
    }

    /**
     * ❤️ FUNÇÃO: dispararFraseMotivacional (VERSÃO BLINDADA)
     */
    function dispararFraseMotivacional() {
        if (!window._ultimoApoioTempo) window._ultimoApoioTempo = 0;
        const agora = Date.now();
        if (agora - window._ultimoApoioTempo < 6000) return;
        window._ultimoApoioTempo = agora;

        const frases = [
            "Tudo bem errar, faz parte de aprender. Você está indo bem.",
            "Respire fundo, com calma você consegue tentar de novo.",
            "Cada tentativa é um passo à frente, continue assim.",
            "Você é capaz, só precisa de um pouquinho de calma.",
            "Não tem problema errar, vamos tentar juntos mais uma vez.",
            "Devagar e com atenção, você consegue resolver.",
            "Está tudo bem parar um segundo e respirar.",
            "Você já conseguiu antes, pode conseguir de novo.",
            "Errar é só parte do caminho, continue tentando.",
            "Respire, pense com calma e tente mais uma vez.",
            "Você está aprendendo, isso é o mais importante.",
            "Não precisa ter pressa, vá no seu ritmo.",
            "Está indo bem, continue tentando com calma.",
            "Se ficar difícil, peça ajuda, tudo bem.",
            "Você é inteligente, confie em você.",
            "Vamos tentar juntos mais uma vez, com calma.",
            "Respire fundo, você consegue dar o próximo passo.",
            "Tudo bem descansar um pouco e depois tentar de novo.",
            "Cada erro ensina algo novo, continue.",
            "Você está fazendo um bom trabalho, não desista."
        ];

        let fraseEscolhida;
        
        // 🔒 Proteção contra loop infinito se houver apenas 1 frase
        if (frases.length > 1) {
            do {
                fraseEscolhida = frases[Math.floor(Math.random() * frases.length)];
            } while (fraseEscolhida === ultimaFrase);
        } else {
            fraseEscolhida = frases[0];
        }

        ultimaFrase = fraseEscolhida;

        setTimeout(() => {
            if (typeof falar === "function") falar(fraseEscolhida, "dica");
        }, 500);
    }

    function limparEmojisAjuda() { if (containerAjuda) containerAjuda.innerHTML = ""; }

    function atualizarHUD() {
        if (elScore) elScore.innerText = score;
        if (elFase) elFase.innerText = `Fase ${fase}/30`;
        if (elBarra) elBarra.style.width = `${(fase / 30) * 100}%`;
        atualizarEstrelasUI();
    }

    function montarOpcoes() {
        let opcoes = [window.respostaCorreta];
        while (opcoes.length < 4) {
            let n = window.respostaCorreta + (Math.floor(Math.random() * 6) - 3);
            if (n >= 0 && !opcoes.includes(n)) opcoes.push(n);
        }
        opcoes.sort(() => Math.random() - 0.5);
        const botoes = document.querySelectorAll(".choice-container");
        botoes.forEach((btn, i) => {
            const textoEl = btn.querySelector(".choice-text");
            if (textoEl) textoEl.innerText = opcoes[i];
            btn.dataset.number = opcoes[i];
            btn.classList.remove("correto", "errado", "acerto-animado", "erro-animado");
            btn.onpointerdown = () => selecionarRespostaDireta(btn);
        });
    }

    function finalizarJogo() {
        localStorage.setItem("mostRecentScore", score);
        localStorage.setItem("estrelas", estrelas);
        window.location.href = "end.html";
    }

    proximaPergunta();
});