/**
 * MUNDO DOS AMIGOS - NÚCLEO DO JOGO (GAME ENGINE)
 * 🔒 VERSÃO: 3.6.0 - SINCRONIZAÇÃO COMPLETA (ÁUDIO, UX E TEA)
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Seleção de Elementos do DOM ---
    const elPergunta = document.getElementById('question');
    const elScore = document.getElementById('score');
    const elBarra = document.getElementById('progressBarFull');
    const elFase = document.getElementById('progressText');
    const areaAjuda = document.getElementById("area-ajuda-visual");

    // --- Estado Global do Jogo ---
    let fase = 1;
    let score = 0;
    let numero1 = 0;
    let numero2 = 0;
    let errosSeguidos = 0;
    let emojiAtual = "🍎";
    
    // Semáforos e Controles Globais
    window.respostaCorreta = 0;
    window.__bloqueadoResposta = false;
    window.modoAjudaAtivo = false;
    let musicaFaseAtual = 0; 

    const emojisDestaque = ["🍎", "⭐", "⚽", "🍓", "🍌", "🚗"];

    /**
     * 🔄 FUNÇÃO: proximaPergunta
     * Gera o desafio matemático e limpa estados anteriores.
     */
    function proximaPergunta() {
        window.__bloqueadoResposta = false;
        window.modoAjudaAtivo = false;
        errosSeguidos = 0;
        limparEmojis();

        // Gera números aleatórios (1 a 5 para soma simples)
        numero1 = Math.floor(Math.random() * 5) + 1;
        numero2 = Math.floor(Math.random() * 5) + 1;
        window.respostaCorreta = numero1 + numero2;
        
        // Escolhe um emoji aleatório para suporte visual
        emojiAtual = emojisDestaque[Math.floor(Math.random() * emojisDestaque.length)];

        if (elPergunta) elPergunta.innerText = `Quanto é ${numero1} + ${numero2}?`;
        
        atualizarHUD();
        montarOpcoes();
        atualizarMusicaPorFase(); 

        // Feedback de Voz (Acessibilidade)
        if (typeof falar === "function") {
            falar(elPergunta ? elPergunta.innerText : "Quanto é a soma?");
        }
    }

    /**
     * 📊 FUNÇÃO: atualizarHUD
     * Sincroniza a interface visual (pontos e barra de progresso).
     */
    function atualizarHUD() {
        if (elScore) elScore.innerText = score;
        if (elFase) elFase.innerText = `Fase ${fase}/30`;
        if (elBarra) {
            const progresso = (fase / 30) * 100;
            elBarra.style.width = `${progresso}%`;
        }
    }

    /**
     * 🎵 FUNÇÃO: atualizarMusicaPorFase
     * Gerencia a troca de trilhas sonoras conforme a evolução do jogador.
     */
    function atualizarMusicaPorFase() {
        let nivelDesejado = 1;
        if (fase > 10 && fase <= 20) nivelDesejado = 2;
        if (fase > 20) nivelDesejado = 3;

        if (nivelDesejado !== musicaFaseAtual) {
            musicaFaseAtual = nivelDesejado;
            // Comunica a mudança para o sistema de som centralizado
            if (typeof gerenciarMusicaFundo === "function") {
                gerenciarMusicaFundo(musicaFaseAtual);
            }
        }
    }

    /**
     * 🎯 FUNÇÃO: montarOpcoes
     * Configura os botões de resposta com lógica de alternativas e feedback tátil.
     */
    function montarOpcoes() {
        let opcoes = [window.respostaCorreta];
        
        // Gera alternativas próximas à correta para desafio pedagógico
        while (opcoes.length < 4) {
            let n = window.respostaCorreta + (Math.floor(Math.random() * 6) - 3);
            if (n > 0 && !opcoes.includes(n)) opcoes.push(n);
        }
        
        // Embaralha as opções
        opcoes.sort(() => Math.random() - 0.5);

        const botoes = document.querySelectorAll(".choice-container");
        botoes.forEach((btn, i) => {
            const texto = btn.querySelector(".choice-text");
            if (texto) texto.innerText = opcoes[i];
            
            btn.dataset.number = opcoes[i];
            btn.classList.remove("correto", "errado", "touch-ativo");

            // Evento de toque otimizado (Mobile-First)
            btn.onpointerdown = (e) => {
                if (window.__bloqueadoResposta) return;
                btn.classList.add("touch-ativo");
                
                // Delay para percepção visual do clique antes de processar
                setTimeout(() => {
                    selecionarRespostaDireta(btn);
                }, 100);
            };

            btn.onpointerup = () => btn.classList.remove("touch-ativo");
            btn.onpointerleave = () => btn.classList.remove("touch-ativo");
        });
    }

    /**
     * ⚡ FUNÇÃO: selecionarRespostaDireta
     * Lógica principal de processamento de acerto e erro.
     */
    function selecionarRespostaDireta(botao) {
        if (window.modoAjudaAtivo && errosSeguidos >= 2) {
            // Se a ajuda estiver na tela, o primeiro toque apenas fecha/limpa se necessário
            // Mas aqui permitimos a resposta direta para fluidez
        }

        if (window.__bloqueadoResposta) return;
        window.__bloqueadoResposta = true;

        const valor = Number(botao.dataset.number);
        const acertou = valor === window.respostaCorreta;

        if (acertou) {
            botao.classList.add("correto");
            score += 10;
            fase++;

            // Disparos Sensoriais
            if (typeof tocarSom === "function") tocarSom('acerto');
            if (typeof vibrarAcerto === "function") vibrarAcerto();

            setTimeout(() => {
                if (fase > 30) {
                    localStorage.setItem("mostRecentScore", score);
                    // Sincronização final com Firebase
                    if (typeof salvarProgresso === "function") {
                        const nome = localStorage.getItem("nomeJogador");
                        salvarProgresso(nome, fase, score);
                    }
                    window.location.href = "end.html";
                } else {
                    proximaPergunta();
                }
            }, 1500);

        } else {
            botao.classList.add("errado");
            errosSeguidos++;

            if (typeof tocarSom === "function") tocarSom('erro');
            if (typeof vibrarErro === "function") vibrarErro();

            // Suporte TEA: Ativa contagem visual após 2 erros
            if (errosSeguidos === 2) {
                mostrarObjeto(); 
                if (typeof falar === "function") falar("Conte os desenhos para ajudar.");
            }

            setTimeout(() => {
                botao.classList.remove("errado");
                window.__bloqueadoResposta = false;
            }, 800);
        }
    }

    /**
     * 🎨 FUNÇÃO: mostrarObjeto
     * Injeta suporte visual (frutinhas) na área reservada do layout.
     */
    function mostrarObjeto() {
        if (!areaAjuda) return;

        window.modoAjudaAtivo = true;
        const div = document.createElement("div");
        div.id = "visual-calculo";
        
        const gerarItens = (qtd) => {
            let html = "";
            for (let i = 0; i < qtd; i++) {
                // 🔥 Injeta classe emoji-ajuda para animação CSS
                html += `<span class="emoji-ajuda" role="img" aria-label="item">${emojiAtual}</span>`;
            }
            return html;
        };

        div.innerHTML = `
            <div class="linha-calculo">${gerarItens(numero1)}</div>
            <div class="sinal-calculo">+</div>
            <div class="linha-calculo">${gerarItens(numero2)}</div>
        `;

        areaAjuda.innerHTML = ""; // Limpa container
        areaAjuda.appendChild(div);
    }

    /**
     * 🧹 FUNÇÃO: limparEmojis
     * Remove a ajuda visual do fluxo do documento.
     */
    function limparEmojis() {
        if (areaAjuda) {
            areaAjuda.innerHTML = "";
        }
        window.modoAjudaAtivo = false;
    }

    // --- INICIALIZAÇÃO DO MOTOR ---
    proximaPergunta();
});