/**
 * MOTOR DO JOGO - MUNDO DOS AMIGOS
 * 🔒 REFATORAÇÃO TOTAL - ARQUITETURA SIMPLES E ESTÁVEL
 * FOCO: 1 Ação = 1 Efeito (Sem concorrência)
 */

document.addEventListener("DOMContentLoaded", () => {

    const elPergunta = document.getElementById('question');
    const botoes = Array.from(document.querySelectorAll(".choice-container"));
    const elScore = document.getElementById('score');
    const elBarra = document.getElementById('progressBarFull');
    const elFase = document.getElementById('progressText');

    let fase = 1;
    let score = 0;
    let respostaCorreta = 0;
    let bloqueado = false;

    let numero1 = 0;
    let numero2 = 0;
    let emojiAtual = "🐝";

    const materia = localStorage.getItem("materiaAtual") || "soma";

    // ===============================
    // 🔊 VOZ SIMPLES (GATILHO DIRETO)
    // ===============================
    function falar(texto) {
        try {
            if (!window.speechSynthesis) return;

            // Para tudo antes de falar o novo
            window.speechSynthesis.cancel();

            const utter = new SpeechSynthesisUtterance(texto);
            utter.lang = "pt-BR";
            utter.rate = 0.9;
            utter.pitch = 1.0;

            window.speechSynthesis.speak(utter);

        } catch (e) {
            console.warn("Erro voz", e);
        }
    }

    // ===============================
    // 🎨 OBJETO VISUAL (RENDER IMEDIATO)
    // ===============================
    function mostrarObjeto() {
        // Limpa qualquer objeto anterior
        let antigo = document.getElementById("visual-calculo");
        if (antigo) antigo.remove();

        const div = document.createElement("div");
        div.id = "visual-calculo";

        // Estilo centralizado e robusto
        div.style.cssText = `
            position:fixed;
            left:50%;
            top:50%;
            transform:translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.98);
            padding: 30px;
            border-radius: 30px;
            z-index: 999999;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            border: 4px solid #f0f0f0;
            pointer-events: none;
        `;

        const gerar = (n) => {
            let html = "";
            for (let i = 0; i < n; i++) {
                html += `<span style="font-size:2.8rem; margin:5px; display:inline-block;">${emojiAtual}</span>`;
            }
            return html;
        };

        div.innerHTML = `
            <div style="margin-bottom:10px">${gerar(numero1)}</div>
            <div style="font-size:2.5rem; font-weight:bold; color:#555">+</div>
            <div style="margin-top:10px">${gerar(numero2)}</div>
        `;

        document.body.appendChild(div);

        // Remove após tempo suficiente para a criança contar
        setTimeout(() => {
            if (div.parentNode) div.remove();
        }, 3000);
    }

    // ===============================
    // 🎯 LÓGICA DE PERGUNTA
    // ===============================
    function proximaPergunta() {
        bloqueado = false;

        // Reset visual dos botões
        botoes.forEach(btn => btn.classList.remove("correto", "errado"));

        // Números simples para base estável
        numero1 = Math.floor(Math.random() * 5) + 1;
        numero2 = Math.floor(Math.random() * 5) + 1;
        respostaCorreta = numero1 + numero2;

        elPergunta.innerText = `Quanto é ${numero1} + ${numero2}?`;
        
        atualizarHUD();
        montarOpcoes();
        falar(elPergunta.innerText);
    }

    function atualizarHUD() {
        if (elScore) elScore.innerText = score;
        if (elFase) elFase.innerText = `Fase ${fase}/30`;
        if (elBarra) elBarra.style.width = (fase / 30) * 100 + "%";
    }

    function montarOpcoes() {
        let opcoes = [respostaCorreta];

        while (opcoes.length < 4) {
            let n = respostaCorreta + (Math.floor(Math.random() * 6) - 3);
            if (n > 0 && !opcoes.includes(n)) {
                opcoes.push(n);
            }
        }

        opcoes.sort(() => Math.random() - 0.5);

        botoes.forEach((btn, i) => {
            const elTexto = btn.querySelector(".choice-text");
            if (elTexto) {
                elTexto.innerText = opcoes[i];
                btn.onclick = () => verificarResposta(opcoes[i], btn);
            }
        });
    }

    // ===============================
    // 🎯 VALIDAÇÃO (FLUXO LINEAR)
    // ===============================
    function verificarResposta(valor, botao) {
        if (bloqueado) return;
        bloqueado = true;

        if (valor === respostaCorreta) {
            score += 10;
            fase++;
            botao.classList.add("correto");
            
            falar("Muito bem! Você acertou!");

            setTimeout(() => {
                proximaPergunta();
            }, 1200);

        } else {
            botao.classList.add("errado");
            
            // Ordem: Visual -> Voz -> Reset
            mostrarObjeto();
            falar("Tente novamente! Conte os desenhos.");

            setTimeout(() => {
                botao.classList.remove("errado");
                bloqueado = false;
            }, 1500);
        }
    }

    // Inicialização
    proximaPergunta();
});