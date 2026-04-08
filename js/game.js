/**
 * MUNDO DOS AMIGOS - NÚCLEO DO JOGO (ENGINE UNIFICADA V13.2.0)
 * 🔒 STATUS: AUDITORIA SÊNIOR COMPLETA
 * ✅ FIX: Foco Acessível (NVDA/VoiceOver)
 * ✅ FIX: Sincronia de Voz iOS
 * ✅ FIX: Suporte Total a Teclado (Enter/Espaço)
 * ✅ FIX: Prevenção de Duplicidade Sonora
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Seleção de Elementos do DOM ---
    const elPergunta = document.getElementById('question');
    const elScore = document.getElementById('score');
    const elBarra = document.getElementById('progressBarFull');
    const elFase = document.getElementById('progressText');
    const elEstrelas = document.getElementById('estrelas');
    const containerAjuda = document.getElementById("area-ajuda-visual");

    // --- Estado Global do Jogo ---
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
     * ⭐ SISTEMA DE RECOMPENSA E HUD
     */
    function registrarAcerto() {
        estrelas++;
        acertosSeguidos++;
        score += 10;
        atualizarHUD();

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

    function atualizarHUD() {
        if (elScore) elScore.innerText = score;
        if (elFase) elFase.innerText = `Fase ${fase}/30`;
        if (elBarra) elBarra.style.width = `${(fase / 30) * 100}%`;
        
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
     * 🔄 LÓGICA DE GERAÇÃO DE PERGUNTAS
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
            const textoQuestao = `Quanto é ${numero1} ${simbolo} ${numero2}?`;
            elPergunta.innerText = textoQuestao;
            
            // ♿ FORÇA FOCO PARA LEITOR DE TELA (NVDA / VoiceOver)
            // Garante que o leitor anuncie a nova pergunta imediatamente.
            elPergunta.focus();

            // 🔊 Sincronização de fala (Ajuste cirúrgico para iPhone)
            if (typeof falar === "function") {
                setTimeout(() => falar(textoQuestao), 300);
            }
        }
        
        atualizarHUD();
        montarOpcoes();
    }

    /**
     * 🎯 MECÂNICA DE RESPOSTA
     */
    function selecionarRespostaDireta(botao) {
        if (window.__bloqueadoResposta) return;
        window.__bloqueadoResposta = true;

        const valor = Number(botao.dataset.number);
        const acertou = valor === window.respostaCorreta;
        const nome = localStorage.getItem("nomeJogador") || "Jogador";

        if (acertou) {
            botao.classList.add("correto", "acerto-animado");
            registrarAcerto();
            
            if (typeof tocarSom === "function") tocarSom('acerto');
            if (typeof falar === "function") falar(`${nome}, você acertou! Mandou muito bem!`, "festa");

            setTimeout(() => {
                fase++;
                fase > 30 ? finalizarJogo() : proximaPergunta();
            }, 1500);

        } else {
            botao.classList.add("errado", "erro-animado");
            registrarErro();

            if (typeof tocarSom === "function") tocarSom('erro');
            if (typeof falar === "function") falar(`${nome}, tente novamente com calma.`);

            if (errosSeguidos >= 2) mostrarAjudaVisual();
            if (errosSeguidos >= 3) dispararFraseMotivacional();

            setTimeout(() => {
                botao.classList.remove("errado", "erro-animado");
                window.__bloqueadoResposta = false;
            }, 800);
        }
    }

    /**
     * 🎨 AJUDA VISUAL (MÉTODO TEA - CONTAGEM RÍTMICA)
     */
    function mostrarAjudaVisual() {
        if (!containerAjuda) return;

        const div = document.createElement("div");
        div.id = "visual-calculo";
        const nome = localStorage.getItem("nomeJogador") || "Jogador";
        let delayGlobal = 0;

        const gerarEmojis = (qtd) => {
            let html = "";
            for (let i = 0; i < qtd; i++) {
                html += `<span class="emoji-ajuda contagem-sequencial" style="--delay:${delayGlobal}s">${emojiAtual}</span>`;
                delayGlobal += 0.4;
            }
            return html;
        };

        let htmlFinal = "";
        if (operacao === "soma") {
            htmlFinal = `<div class="linha-calculo">${gerarEmojis(numero1)}</div><div class="sinal-calculo">+</div><div class="linha-calculo">${gerarEmojis(numero2)}</div>`;
        } else if (operacao === "subtracao") {
            htmlFinal = `<div class="linha-calculo">${gerarEmojis(numero1)}</div><div class="sinal-calculo">−</div><div class="linha-calculo">${gerarEmojis(numero2)}</div>`;
        } else if (operacao === "divisao") {
            htmlFinal = `<div class="linha-calculo">${gerarEmojis(numero1)}</div><div class="sinal-calculo">÷</div><div class="linha-calculo">${gerarEmojis(numero2)}</div>`;
        }

        div.innerHTML = htmlFinal;
        containerAjuda.innerHTML = "";
        containerAjuda.appendChild(div);

        setTimeout(() => {
            if (typeof falar === "function") falar(`${nome}, conte as figuras na tela.`, "dica");
        }, 1000);
    }

    /**
     * ❤️ APOIO EMOCIONAL
     */
    function dispararFraseMotivacional() {
        if (!window._ultimoApoioTempo) window._ultimoApoioTempo = 0;
        const agora = Date.now();
        if (agora - window._ultimoApoioTempo < 6000) return;
        window._ultimoApoioTempo = agora;

        const frasesApoio = [
            "Respire fundo, você consegue.",
            "Tente de novo com calma.",
            "Você é inteligente, vamos lá!",
            "Cada erro é um aprendizado."
        ];

        let frase = frasesApoio[Math.floor(Math.random() * frasesApoio.length)];
        if (typeof falar === "function") falar(frase, "dica");
    }

    function limparEmojisAjuda() { 
        if (containerAjuda) {
            containerAjuda.innerHTML = ""; 
        }
    }

    /**
     * ⌨️ CONSTRUÇÃO DE INTERFACE ACESSÍVEL
     */
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
            
            // 🎯 GATILHO: TOQUE / MOUSE
            btn.onpointerdown = () => selecionarRespostaDireta(btn);

            // 🔥 GATILHO: TECLADO (ENTER / ESPAÇO) - ESSENCIAL PARA NVDA
            btn.onkeydown = (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault(); // Evita scroll indesejado
                    selecionarRespostaDireta(btn);
                }
            };
        });
    }

    function finalizarJogo() {
        localStorage.setItem("mostRecentScore", score);
        localStorage.setItem("estrelas", estrelas);
        window.location.href = "end.html";
    }

    // Início da primeira rodada
    proximaPergunta();
});