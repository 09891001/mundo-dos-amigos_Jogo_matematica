/**
 * MOTOR DO JOGO - MUNDO DOS AMIGOS
 * 🔒 VERSÃO FINAL DEFINITIVA - EXECUÇÃO IMEDIATA & BLINDADA
 * FOCO: FIX EXECUÇÃO (SEM DEPENDER SÓ DE TIMER) + DATA-DRIVEN + ZERO BUG
 * RESPONSÁVEL: Lead Developer / Gemini AI
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
    
    // 🔥 ESTADO REAL (DADOS PUROS)
    let numero1 = 0;
    let numero2 = 0;
    let operacaoAtual = "+";
    let timeoutObjeto = null;
    let apoioAtivo = false;

    let emojiAtual = "🐝";

    const nomeJogador = localStorage.getItem("nomeJogador") || "Amigo";
    const materia = localStorage.getItem("materiaAtual") || "soma";

    // ===============================
    // 🔊 ÁUDIO (UNLOCK MOBILE)
    // ===============================
    function iniciarMusicaMobile() {
        try {
            if (typeof gerenciarMusicaFundo === "function") {
                gerenciarMusicaFundo(1);
            }
            document.addEventListener("touchstart", liberarAudio, { once: true });
            document.addEventListener("click", liberarAudio, { once: true });
        } catch (e) { console.error("[MUSICA INIT ERRO]", e); }
    }

    function liberarAudio() {
        try {
            if (typeof musicaAtual !== "undefined" && musicaAtual && musicaAtual.paused) {
                musicaAtual.play().catch(() => {});
            }
        } catch (e) { console.warn("[AUDIO BLOQUEADO]", e); }
    }

    // ===============================
    // 🎯 LÓGICA BASE
    // ===============================
    function escolherEmojiRodada() {
        try {
            const objetos = ["🐝", "🐶", "🍌", "⭐", "🍎", "⚽", "🍓"];
            emojiAtual = objetos[Math.floor(Math.random() * objetos.length)];
        } catch { emojiAtual = "⭐"; }
    }

    function falarSeguro(texto, tipo = "dica") {
        try {
            const agora = Date.now();
            if (agora - ultimoTempoFala < 300) return;
            ultimoTempoFala = agora;
            if (window.speechSynthesis && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            if (typeof falar === "function") falar(texto, tipo);
        } catch (e) { console.error(e); }
    }

    function podeClicar() {
        const agora = Date.now();
        if (agora - ultimoClique < 250) return false;
        ultimoClique = agora;
        return true;
    }

    // ===============================
    // 🎉 EFEITOS VISUAIS
    // ===============================
    function efeitoAcertoDisney() {
        try {
            const cores = ["#FFD700", "#FF69B4", "#00CED1", "#ADFF2F", "#FF4500"];
            for (let i = 0; i < 25; i++) {
                const p = document.createElement("div");
                p.style.cssText = `position:fixed; left:50%; top:50%; width:${8+Math.random()*10}px; height:${8+Math.random()*10}px; background-color:${cores[Math.floor(Math.random()*cores.length)]}; border-radius:50%; pointer-events:none; z-index:999999;`;
                const angulo = Math.random() * 2 * Math.PI;
                const distancia = 120 + Math.random() * 150;
                p.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(angulo)*distancia}px), calc(-50% + ${Math.sin(angulo)*distancia}px)) scale(0)`,opacity:0}], {duration:1000});
                document.body.appendChild(p);
                setTimeout(() => p.remove(), 1000);
            }
        } catch (e) { console.error(e); }
    }

    // ===============================
    // 🧠 GESTÃO DE OBJETOS (FONTE ÚNICA)
    // ===============================
    function mostrarObjetoAtual() { 
        try {
            // Aceita 0, bloqueia apenas se for indefinido
            if (numero1 === undefined || numero2 === undefined) return;

            console.log("[OBJETO DISPARADO]", numero1, numero2, operacaoAtual);
            mostrarCalculoVisual(numero1, numero2, operacaoAtual);

        } catch (e) {
            console.error("[OBJETO ERRO]", e);
        }
    }

    function mostrarCalculoVisual(n1, n2, operacao = "+") { 
        try {
            let antigo = document.getElementById("visual-calculo");
            if (antigo) antigo.remove();

            const container = document.createElement("div");
            container.id = "visual-calculo";
            container.style.cssText = `
                position:fixed; left:50%; top:60%; transform:translate(-50%, -50%);
                z-index:999999; pointer-events:none; background: rgba(255,255,255,0.95);
                padding: 20px; border-radius: 20px; text-align:center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            `;

            let simbolo = operacao === "-" ? "−" : (operacao === "/" ? "÷" : "+");

            const gerarGrupo = (n) => Array.from({ length: n }, (_, i) => 
                `<span style="display:inline-block; font-size:2.5rem; margin:4px; opacity:0; 
                animation: aparecerObjeto 0.4s ease forwards; animation-delay:${i*120}ms;">${emojiAtual}</span>`
            ).join("");

            container.innerHTML = `
                <div>${gerarGrupo(n1)}</div>
                <div style="font-size:2rem; font-weight:bold;">${simbolo}</div>
                <div>${gerarGrupo(n2)}</div>
            `;

            document.body.appendChild(container);

            setTimeout(() => {
                if (container.parentNode) container.remove();
            }, 4500);

        } catch (e) { console.error(e); }
    }

    // ===============================
    // 🎯 FUNÇÃO: verificarResposta (EXECUÇÃO BLINDADA)
    // ===============================
    function verificarResposta(escolha, botao) {
        if (emTransicao || bloqueado || !podeClicar()) return;
        bloqueado = true;

        try {
            if (typeof tocarSom === "function") tocarSom('clique');

            if (escolha === respostaCorreta) {
                // ✅ ACERTO
                combo++; score += 10; fase++; errosSeguidos = 0;
                apoioAtivo = false;
                if (timeoutObjeto) clearTimeout(timeoutObjeto);
                if (typeof resetarApoio === "function") resetarApoio();

                atualizarHUD();
                botao.classList.add("correto");
                efeitoAcertoDisney();
                falarSeguro("Muito bem!", "festa");
                
                emTransicao = true;
                setTimeout(() => {
                    animarTransicao();
                    emTransicao = false; bloqueado = false;
                }, 1200);

            } else {
                // ❌ ERRO (VERSÃO BLINDADA)
                combo = 0; errosSeguidos++;
                botao.classList.add("errado");
                if (typeof tocarSomErro === "function") tocarSomErro();
                if (typeof vibrar === "function") vibrar([100, 50, 100]);

                // 🔥 MOSTRA IMEDIATO (SEM DEPENDER DE TIMER PARA A PRIMEIRA RENDERIZAÇÃO)
                mostrarObjetoAtual();

                // 🔥 GESTÃO DE TIMERS PARA REFORÇO E APOIO
                if (timeoutObjeto) clearTimeout(timeoutObjeto);

                timeoutObjeto = setTimeout(() => {
                    if (!apoioAtivo) {
                        mostrarObjetoAtual();
                        if (errosSeguidos >= 2) apoioAtivo = true;
                    }
                }, 600);

                if (errosSeguidos >= 1) {
                    if (errosSeguidos === 1) {
                        falarSeguro("Quase!", "dica");
                    } else if (typeof verificarApoio === "function") {
                        // O apoio.js agora recebe o controle vocal
                        verificarApoio(errosSeguidos, elPergunta.innerText);
                    }
                }

                setTimeout(() => {
                    botao.classList.remove("errado");
                    bloqueado = false;
                }, 750);
            }
        } catch (e) { console.error("[ERRO CRÍTICO]", e); bloqueado = false; }
    }

    // ===============================
    // 🔥 FUNÇÕES DE FLUXO
    // ===============================
    function atualizarHUD() {
        if (elScore) elScore.innerText = score;
        if (elFase) elFase.innerText = `Fase ${fase}/30`;
        if (elBarra) elBarra.style.width = (fase / 30) * 100 + "%";
    }

    function animarTransicao() {
        const container = document.querySelector(".game-container");
        if (container) container.style.opacity = "0";
        setTimeout(() => { proximaPergunta(); if(container) container.style.opacity = "1"; }, 300);
    }

    function proximaPergunta() { 
        try {
            if (fase > 30) {
                localStorage.setItem("mostRecentScore", score);
                window.location.href = "end.html";
                return;
            }

            escolherEmojiRodada();
            bloqueado = false;
            apoioAtivo = false;

            if (timeoutObjeto) {
                clearTimeout(timeoutObjeto);
                timeoutObjeto = null;
            }
            let antigo = document.getElementById("visual-calculo");
            if (antigo) antigo.remove();

            nivel = fase <= 10 ? 1 : (fase <= 20 ? 2 : 3);
            document.body.className = `tema-nivel-${nivel}`;
            if (typeof gerenciarMusicaFundo === "function") gerenciarMusicaFundo(nivel);

            let limite = (nivel === 1 ? 6 : (nivel === 2 ? 12 : 24));
            
            numero1 = Math.floor(Math.random() * limite) + 1;
            numero2 = Math.floor(Math.random() * limite) + 1;

            if (materia === "soma") {
                operacaoAtual = "+";
                respostaCorreta = numero1 + numero2;
                elPergunta.innerText = `Quanto é ${numero1} + ${numero2}?`;
            } else if (materia === "subtracao") {
                operacaoAtual = "-";
                const ma = Math.max(numero1, numero2);
                const me = Math.min(numero1, numero2);
                numero1 = ma;
                numero2 = me;
                respostaCorreta = ma - me;
                elPergunta.innerText = `Quanto é ${ma} - ${me}?`;
            } else if (materia === "divisao") {
                operacaoAtual = "/";
                const auxResult = numero1;
                const auxDivisor = (numero2 % 5) + 1; 
                respostaCorreta = auxResult;
                elPergunta.innerText = `${auxResult * auxDivisor} ÷ ${auxDivisor}`;
                numero1 = auxResult * auxDivisor;
                numero2 = auxDivisor;
            }

            montarOpcoes();
            atualizarHUD();
            if (typeof narrar === "function") narrar(elPergunta.innerText);

        } catch (e) { console.error(e); }
    }

    function montarOpcoes() {
        const botoes = Array.from(document.querySelectorAll(".choice-container"));
        let opcoes = [respostaCorreta];
        while (opcoes.length < 4) {
            let erro = respostaCorreta + (Math.floor(Math.random() * 8) - 4);
            if (erro > 0 && !opcoes.includes(erro)) opcoes.push(erro);
        }
        opcoes.sort(() => Math.random() - 0.5);
        botoes.forEach((btn, i) => {
            btn.querySelector('.choice-text').innerText = opcoes[i];
            btn.onclick = () => { verificarResposta(opcoes[i], btn); };
        });
    }

    proximaPergunta();
    iniciarMusicaMobile();
});