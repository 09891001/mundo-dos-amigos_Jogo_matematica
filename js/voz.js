/**
 * MUNDO DOS AMIGOS - Sistema de Voz Profissional (voz.js)
 * Versão: 2.0 - Lead Developer Edition
 * Gerencia fila de falas, evita eco e ajusta entonação por contexto.
 */

const VozSistema = {
    fila: [],
    estaFalando: false,
    synth: window.speechSynthesis,

    // Configurações de "Emoção" por Contexto (Melhoria item 4)
    perfis: {
        pergunta: { pitch: 1.1, rate: 0.9 },   // Tom curioso e calmo
        sucesso:  { pitch: 1.3, rate: 1.1 },   // Tom agudo, rápido e alegre
        erro:     { pitch: 0.9, rate: 0.9 },   // Tom mais baixo e acolhedor
        apoio:    { pitch: 1.0, rate: 0.75 },  // Tom bem lento e relaxante (Melhoria item 4)
        padrao:   { pitch: 1.0, rate: 1.0 }
    }
};

/**
 * Função principal para falar.
 * @param {string} texto - O que será dito.
 * @param {string} contexto - 'pergunta', 'sucesso', 'erro' ou 'apoio'.
 * @param {function} callback - Função executada após o fim da fala.
 */
function falar(texto, contexto = "padrao", callback = null) {
    if (!texto) return;

    // Limpeza de fila inteligente (Melhoria item 2)
    // Se entrar uma nova pergunta, cancelamos falas de acerto/erro pendentes
    if (contexto === "pergunta") {
        VozSistema.synth.cancel();
        VozSistema.fila = [];
        VozSistema.estaFalando = false;
    }

    VozSistema.fila.push({ texto, contexto, callback });

    if (!VozSistema.estaFalando) {
        processarFilaVoz();
    }
}

/**
 * Processador interno da fila de mensagens.
 */
function processarFilaVoz() {
    if (VozSistema.fila.length === 0) {
        VozSistema.estaFalando = false;
        return;
    }

    VozSistema.estaFalando = true;
    const item = VozSistema.fila.shift();
    const utterance = new SpeechSynthesisUtterance(item.texto);
    
    // Aplicar perfil de voz baseado no contexto (Melhoria item 4)
    const perfil = VozSistema.perfis[item.contexto] || VozSistema.perfis.padrao;
    
    utterance.lang = 'pt-BR';
    utterance.pitch = perfil.pitch;
    utterance.rate = perfil.rate;
    utterance.volume = 1.0;

    // Evento: Quando terminar de falar
    utterance.onend = () => {
        if (item.callback) {
            item.callback();
        }
        
        // Pequena pausa natural entre frases para não sobrecarregar (Melhoria item 2)
        setTimeout(() => {
            processarFilaVoz();
        }, 250);
    };

    // Tratamento de erro para não travar a fila
    utterance.onerror = (event) => {
        console.error("[ERRO VOZ]:", event);
        VozSistema.estaFalando = false;
        processarFilaVoz();
    };

    VozSistema.synth.speak(utterance);
}

/**
 * Interrupção de emergência (útil para o botão 'Sair').
 */
function pararTodasAsFalas() {
    VozSistema.synth.cancel();
    VozSistema.fila = [];
    VozSistema.estaFalando = false;
}

console.log("[SISTEMA]: Motor de Voz 2.0 Ativado.");