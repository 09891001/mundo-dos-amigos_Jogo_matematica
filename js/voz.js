/**
 * SISTEMA DE VOZ CENTRALIZADO - MUNDO DOS AMIGOS
 * 🔒 VERSÃO: 3.4.0 - FILTRO DE LOGS E BLINDAGEM SÊNIOR
 * RESPONSÁVEL: Lead Developer Sênior
 */

let falando = false;
let vozLiberada = false;

/**
 * 🔓 FUNÇÃO: liberarVoz
 * Descrição: Realiza o handshake inicial com a Web Speech API.
 * Essencial para contornar restrições de reprodução automática no iOS/Safari.
 */
function liberarVoz() { // Desbloqueia sintetizador de voz no primeiro toque
    if (vozLiberada) return;

    try {
        if (!('speechSynthesis' in window)) return;

        const synth = window.speechSynthesis;
        let tentativas = 0;

        const tentarExecutarHandshake = () => {
            const vozes = synth.getVoices();

            // Aguarda o carregamento assíncrono das vozes (comum no iOS)
            if (vozes.length === 0 && tentativas < 10) {
                tentativas++;
                setTimeout(tentarExecutarHandshake, 150);
                return;
            }

            const msgSilenciosa = new SpeechSynthesisUtterance(" ");
            msgSilenciosa.volume = 0;
            
            // Tenta ancorar em uma voz pt-BR para estabilizar a engine
            const vozPT = vozes.find(v => v.lang.includes('pt-BR')) || vozes[0];
            if (vozPT) msgSilenciosa.voice = vozPT;

            synth.speak(msgSilenciosa);
            vozLiberada = true;
            console.log(`[VOZ]: Sistema liberado (Handshake OK após ${tentativas} tentativas).`);
        };

        tentarExecutarHandshake();

    } catch (e) {
        console.error("[VOZ ERRO LIBERAR]: Falha crítica na inicialização", e);
    }
}

// Ouvinte para detecção de prontidão das vozes do sistema
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        console.log("[VOZ]: Lista de vozes sincronizada.");
    };
}

// Eventos de gatilho para o usuário (Padrão Mobile)
document.addEventListener("touchstart", liberarVoz, { once: true });
document.addEventListener("click", liberarVoz, { once: true });

/**
 * 🗣️ FUNÇÃO: falar
 * Descrição: Executa a narração com tratamento de interrupções e filtro de erros.
 */
function falar(texto, tipo = "neutro", callback = null) { // Gerencia fluxo de narração e ducking
    try {
        if (!('speechSynthesis' in window)) return;

        if (!vozLiberada) {
            console.warn("[VOZ]: Narração ignorada - aguardando interação inicial do usuário.");
            return;
        }

        const synth = window.speechSynthesis;

        // Interrompe falas anteriores apenas se o canal estiver ocupado
        if (synth.speaking) {
            synth.cancel();
        }

        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = "pt-BR";

        // Parâmetros de Voz (Customizados para acessibilidade TEA)
        if (tipo === "festa") {
            msg.pitch = 1.3;
            msg.rate = 1.05;
        } else if (tipo === "dica") {
            msg.pitch = 1.0;
            msg.rate = 0.85; // Mais lento para facilitar a compreensão
        } else {
            msg.pitch = 1.1;
            msg.rate = 1.0;
        }

        // Integração com sistema de som (Ducking)
        if (typeof abaixarMusica === "function") abaixarMusica();

        falando = true;

        msg.onend = () => {
            falando = false;
            if (typeof restaurarMusica === "function") restaurarMusica();
            if (callback) callback();
        };

        msg.onerror = (event) => {
            // 🔥 FILTRO INTELIGENTE SÊNIOR:
            // "interrupted" e "canceled" são comportamentos esperados ao trocar de fala rápido.
            // Não tratamos como erro para não poluir o console de produção.
            if (event.error === "interrupted" || event.error === "canceled") {
                return;
            }

            console.error("[VOZ ERRO REAL]:", event);
            falando = false;
            
            // Garante que a música volte ao normal mesmo em erro real
            if (typeof restaurarMusica === "function") {
                restaurarMusica();
            }
        };

        synth.speak(msg);

    } catch (e) {
        console.error("[VOZ ERRO FATAL]: Falha no motor de fala", e);
        if (typeof restaurarMusica === "function") restaurarMusica();
    }
}

/**
 * MÓDULO DE NARRAÇÕES RÁPIDAS (API de Contexto)
 */
function narrar(texto) { 
    falar(texto, "neutro"); 
}

function narrarAcerto() {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";
    const frases = [`Muito bem, ${nome}!`, `Isso mesmo!`, `Excelente!`, `Você acertou!`];
    falar(frases[Math.floor(Math.random() * frases.length)], "festa");
}

function narrarErro(pergunta) {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";
    falar(`Tudo bem, ${nome}. Vamos tentar de novo.`, "dica", () => {
        // Repete a pergunta para reforçar o aprendizado
        falar(pergunta, "dica");
    });
}