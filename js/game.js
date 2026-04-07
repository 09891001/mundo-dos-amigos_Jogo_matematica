/**
 * MUNDO DOS AMIGOS - NÚCLEO DO JOGO (ENGINE UNIFICADA V12.9.0)
 * 🔒 VERSÃO FINAL: CONTAGEM COM PAUSA ENTRE GRUPOS (ELITE TEA)
 * Foco: Espaçamento cognitivo, didática aritmética e suporte terapêutico.
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
    let ultimaFraseApoio = ""; 
    
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

        if (typeof gerenciarMusicaFundo === "function") {
            gerenciarMusicaFundo(1);
        }

        const listaEmojis = ["🍎", "⭐", "⚽", "🍓", "🍌", "🚗", "🧸", "🎈", "❤️", "🐝"];
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
        const nome = localStorage.getItem("nomeJogador") || "Jogador";

        const frasesAcerto = [
            `${nome}, você acertou! Vamos continuar!`,
            `${nome}, muito bem! Você é inteligente! Próxima fase!`,
            `${nome}, isso mesmo! Mandou muito bem!`,
            `${nome}, perfeito! Continue assim!`,
            `${nome}, você está arrasando! Vamos para a próxima!`,
            `${nome}, incrível! Você acertou de primeira!`,
            `${nome}, parabéns! Você está indo muito bem!`,
            `${nome}, excelente! Continue focado!`
        ];

        const frasesErro = [
            `${nome}, você errou, mas tudo bem. Vamos tentar de novo.`,
            `${nome}, não foi dessa vez, mas você consegue.`,
            `${nome}, resposta errada, tente novamente com calma.`,
            `${nome}, quase! Você é inteligente, vamos tentar outra vez.`,
            `${nome}, errou, mas está aprendendo. Continue.`,
            `${nome}, não acertou agora, mas vai conseguir.`,
            `${nome}, calma, você consegue acertar na próxima.`,
            `${nome}, tente novamente, você é capaz.`
        ];

        if (acertou) {
            botao.classList.add("correto", "acerto-animado");
            registrarAcerto();
            errosSeguidos = 0;

            if (typeof tocarSom === "function") tocarSom('acerto');

            const frase = frasesAcerto[Math.floor(Math.random() * frasesAcerto.length)];
            if (typeof falar === "function") falar(frase);

            setTimeout(() => {
                fase++;
                fase > 30 ? finalizarJogo() : proximaPergunta();
            }, 1500);

        } else {
            botao.classList.add("errado", "erro-animado");
            registrarErro();

            if (typeof tocarSom === "function") tocarSom('erro');

            const frase = frasesErro[Math.floor(Math.random() * frasesErro.length)];
            if (typeof falar === "function") falar(frase);

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
     * 🎨 FUNÇÃO: mostrarAjudaVisual (CONTAGEM COM PAUSA ENTRE GRUPOS - PERFEITO TEA)
     */
    function mostrarAjudaVisual() {
        if (!containerAjuda) return;

        const div = document.createElement("div");
        div.id = "visual-calculo";

        const nome = localStorage.getItem("nomeJogador") || "Jogador";

        const mapaObjetos = {
            "🍎": "maçãs", "⭐": "estrelas", "⚽": "bolas", "🍓": "morangos",
            "🍌": "bananas", "🚗": "carros", "🧸": "ursinhos", "🎈": "balões",
            "❤️": "corações", "🐝": "abelhas"
        };

        const nomeObjeto = mapaObjetos[emojiAtual] || "itens";

        // Controle de delay global para sincronia rítmica
        let delayGlobal = 0;

        const gerarEmojis = (qtd) => {
            let html = "";
            for (let i = 0; i < qtd; i++) {
                html += `
                    <span class="emoji-ajuda contagem-sequencial" style="--delay:${delayGlobal}s">
                        ${emojiAtual}
                    </span>
                `;
                delayGlobal += 0.4;
            }
            return html;
        };

        let htmlFinal = "";

        if (operacao === "soma") {
            const grupo1 = gerarEmojis(numero1);
            delayGlobal += 1.0; // 🔥 PAUSA ESTRUTURAL ENTRE GRUPOS
            const grupo2 = gerarEmojis(numero2);

            htmlFinal = `
                <div class="linha-calculo">${grupo1}</div>
                <div class="sinal-calculo">+</div>
                <div class="linha-calculo">${grupo2}</div>
            `;
        } 
        else if (operacao === "subtracao") {
            const resultado = numero1 - numero2;
            const grupo1 = gerarEmojis(numero1);
            delayGlobal += 1.0;
            const grupo2 = gerarEmojis(numero2);
            delayGlobal += 1.0;
            const grupoResultado = gerarEmojis(resultado);

            htmlFinal = `
                <div class="linha-calculo">${grupo1}</div>
                <div class="sinal-calculo">−</div>
                <div class="linha-calculo">${grupo2}</div>
                <div class="sinal-calculo">=</div>
                <div class="linha-calculo">${grupoResultado}</div>
            `;
        } 
        else if (operacao === "divisao") {
            const resultado = numero1 / numero2;
            const grupo1 = gerarEmojis(numero1);
            delayGlobal += 1.0;
            const grupo2 = gerarEmojis(numero2);
            delayGlobal += 1.0;
            const grupoResultado = gerarEmojis(resultado);

            htmlFinal = `
                <div class="linha-calculo">${grupo1}</div>
                <div class="sinal-calculo">÷</div>
                <div class="linha-calculo">${grupo2}</div>
                <div class="sinal-calculo">=</div>
                <div class="linha-calculo">${grupoResultado}</div>
            `;
        }

        div.innerHTML = htmlFinal;

        Object.assign(div.style, {
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "10px", width: "100%",
            animation: "bounceIn 0.5s ease"
        });

        containerAjuda.innerHTML = "";
        containerAjuda.appendChild(div);

        setTimeout(() => {
            if (typeof falar === "function") {
                falar(`${nome}, conte os ${nomeObjeto} na tela.`);
            }
        }, 1200);
    }

    /**
     * ❤️ FUNÇÃO: dispararFraseMotivacional
     */
    function dispararFraseMotivacional() {
        if (!window._ultimoApoioTempo) window._ultimoApoioTempo = 0;
        const agora = Date.now();
        if (agora - window._ultimoApoioTempo < 6000) return;
        window._ultimoApoioTempo = agora;

        const frasesApoio = [
            "Tudo bem errar, faz parte de aprender. Você está indo bem.",
            "Respire fundo, com calma você consegue tentar de novo.",
            "Cada tentativa é um passo à frente, continue assim.",
            "Você é capaz, só precisa de um pouquinho de calma.",
            "Não tem problema errar, vamos tentar juntos mais uma vez.",
            "Devagar e com atenção, você consegue resolver.",
            "Está tudo bem parar um segundo e respirar.",
            "Você já conseguiu antes, pode conseguir de novo.",
            "Errar é só parte do caminho, continue tentando.",
            "Você está aprendendo, isso é o mais importante."
        ];

        let fraseEscolhida;
        if (frasesApoio.length > 1) {
            do {
                fraseEscolhida = frasesApoio[Math.floor(Math.random() * frasesApoio.length)];
            } while (fraseEscolhida === ultimaFraseApoio);
        } else {
            fraseEscolhida = frasesApoio[0];
        }

        ultimaFraseApoio = fraseEscolhida;

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