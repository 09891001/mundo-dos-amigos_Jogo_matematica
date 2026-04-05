/**
 * MUNDO DOS AMIGOS - NÚCLEO DO JOGO (GAME ENGINE)
 * 🔒 VERSÃO: 2.5.0 - BLINDAGEM DE REFERÊNCIA (ANTI-NULL DATASET)
 * RESPONSÁVEL: Lead Developer Sênior
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Seleção de Elementos do DOM ---
    const elPergunta = document.getElementById('question');
    const elScore = document.getElementById('score');
    const elBarra = document.getElementById('progressBarFull');
    const elFase = document.getElementById('progressText');

    // --- Estado Global (Memória de Trabalho) ---
    let fase = 1;
    let score = 0;
    let numero1 = 0;
    let numero2 = 0;
    let errosSeguidos = 0;
    let emojiAtual = "🍎";
    
    // Semáforos de Controle e Globais de Blindagem
    window.respostaCorreta = 0;
    window.__bloqueadoResposta = false;
    window.modoAjudaAtivo = false;

    const emojisDestaque = ["🍎", "⭐", "⚽", "🍓", "🍌", "🚗"];

    /**
     * 🔄 FUNÇÃO: proximaPergunta
     * Reseta estados e gera novo desafio matemático.
     */
    function proximaPergunta() { // Inicia nova fase
        window.__bloqueadoResposta = false;
        window.modoAjudaAtivo = false;
        errosSeguidos = 0;
        limparEmojis();

        // Lógica: 1 a 5 para segurança pedagógica TEA
        numero1 = Math.floor(Math.random() * 5) + 1;
        numero2 = Math.floor(Math.random() * 5) + 1;
        window.respostaCorreta = numero1 + numero2;
        
        emojiAtual = emojisDestaque[Math.floor(Math.random() * emojisDestaque.length)];

        if (elPergunta) elPergunta.innerText = `Quanto é ${numero1} + ${numero2}?`;
        
        atualizarHUD();
        montarOpcoes();

        if (typeof falar === "function") {
            falar(elPergunta.innerText);
        }
    }

    /**
     * 📊 FUNÇÃO: atualizarHUD
     * Sincroniza barra de progresso e pontos.
     */
    function atualizarHUD() { // Atualiza interface de progresso
        if (elScore) elScore.innerText = score;
        if (elFase) elFase.innerText = `Fase ${fase}/30`;
        if (elBarra) {
            const progresso = (fase / 30) * 100;
            elBarra.style.width = `${progresso}%`;
        }
    }

    /**
     * 🎯 FUNÇÃO: montarOpcoes
     * Configura botões com captura segura de referência para evitar erro de dataset null.
     */
    function montarOpcoes() { // Configura alternativas e listeners
        let opcoes = [window.respostaCorreta];
        
        while (opcoes.length < 4) {
            let n = window.respostaCorreta + (Math.floor(Math.random() * 6) - 3);
            if (n > 0 && !opcoes.includes(n)) opcoes.push(n);
        }
        
        opcoes.sort(() => Math.random() - 0.5);

        const botoes = document.querySelectorAll(".choice-container");
        botoes.forEach((btn, i) => {
            const texto = btn.querySelector(".choice-text");
            if (texto) texto.innerText = opcoes[i];
            
            btn.dataset.number = opcoes[i];
            btn.classList.remove("correto", "errado", "touch-ativo");

            // 👆 LISTENERS HÍBRIDOS (TOQUE PROFISSIONAL FINAL - BLINDADO)
            btn.onpointerdown = (e) => {
                if (e.cancelable) e.preventDefault();

                // 🔥 Feedback visual imediato
                btn.classList.add("touch-ativo");

                // 🔥 CAPTURA SEGURA: Armazena a referência do elemento antes do delay
                const botaoSeguro = btn;

                setTimeout(() => {
                    selecionarRespostaDireta(botaoSeguro);
                }, 50);
            };

            btn.onpointerup = () => {
                btn.classList.remove("touch-ativo");
            };

            btn.onpointerleave = () => {
                btn.classList.remove("touch-ativo");
            };

            // Acessibilidade de Teclado
            btn.onkeydown = (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selecionarRespostaDireta(btn);
                }
            };
        });
    }

    /**
     * ⚡ FUNÇÃO: selecionarRespostaDireta
     * Versão segura que recebe o elemento diretamente, eliminando dependência do 'event'.
     */
    function selecionarRespostaDireta(botao) { // Processa resposta com blindagem de referência
        if (window.modoAjudaAtivo) {
            fecharAjuda();
            return;
        }

        if (window.__bloqueadoResposta) return;
        window.__bloqueadoResposta = true;

        // Validação de segurança para evitar Uncaught TypeError
        if (!botao || !botao.dataset) {
            window.__bloqueadoResposta = false;
            return;
        }

        const valor = Number(botao.dataset.number);
        const acertou = valor === window.respostaCorreta;

        if (typeof navigator.vibrate === "function") navigator.vibrate(15);

        if (acertou) {
            // --- FLUXO DE ACERTO ---
            botao.classList.add("correto");
            score += 10;
            fase++;
            errosSeguidos = 0;
            limparEmojis();

            if (typeof tocarSom === "function") tocarSom('acerto');
            if (typeof falar === "function") falar("Muito bem! Você acertou!");

            setTimeout(() => {
                proximaPergunta();
            }, 1200);

        } else {
            // --- FLUXO DE ERRO ---
            botao.classList.add("errado");
            errosSeguidos++;

            if (typeof tocarSom === "function") tocarSom('erro');

            if (errosSeguidos === 1) {
                if (typeof falar === "function") falar("Quase! Tente novamente.");
            } else if (errosSeguidos === 2) {
                mostrarObjeto(); 
                if (typeof falar === "function") falar("Conte os desenhos.");
            } else if (errosSeguidos === 3) {
                if (typeof falar === "function") falar("Tente mais uma vez, você consegue.");
            } else if (errosSeguidos >= 4) {
                limparEmojis();
                if (typeof chamarApoio === "function") chamarApoio();
            }

            setTimeout(() => {
                botao.classList.remove("errado");
                window.__bloqueadoResposta = false;
            }, 800);
        }
    }

    /**
     * 🎨 FUNÇÃO: mostrarObjeto
     * Injeta auxílio visual sem estilos inline (controlado pelo CSS).
     */
    function mostrarObjeto() { // Injeta auxílio visual
        let antigo = document.getElementById("visual-calculo");
        if (antigo) antigo.remove();

        window.modoAjudaAtivo = true;
        const div = document.createElement("div");
        div.id = "visual-calculo";
        
        div.setAttribute("aria-live", "polite");
        div.setAttribute("role", "status");

        const gerarItens = (qtd) => {
            let html = "";
            for (let i = 0; i < qtd; i++) {
                html += `<span role="img" aria-label="item">${emojiAtual}</span>`;
            }
            return html;
        };

        div.innerHTML = `
            <div class="linha-calculo">${gerarItens(numero1)}</div>
            <div class="sinal-calculo">+</div>
            <div class="linha-calculo">${gerarItens(numero2)}</div>
        `;

        document.body.appendChild(div);
    }

    /**
     * 🧹 FUNÇÕES DE LIMPEZA
     */
    function limparEmojis() { // Remove auxílio visual
        let div = document.getElementById("visual-calculo");
        if (div) div.remove();
        window.modoAjudaAtivo = false;
    }

    function fecharAjuda() { // Fecha ajuda e libera input
        limparEmojis();
        window.__bloqueadoResposta = false;
    }

    // GATILHO INICIAL
    proximaPergunta();
});