/**
 * SISTEMA DE VOZ AFETIVA - MUNDO DOS AMIGOS
 * Ajustado para Entonação e Reforço Positivo (Regra 1 e 16)
 */

const nomeUsuario = localStorage.getItem("nomeJogador") || "Amigo";

function narrar(texto, tipo = "neutro") {
    if (!('speechSynthesis' in window)) return;

    // Cancela qualquer fala anterior para não sobrepor
    window.speechSynthesis.cancel();

    const mensagem = new SpeechSynthesisUtterance(texto);
    mensagem.lang = 'pt-BR';

    // AJUSTE DE ENTONAÇÃO CONFORME O FEEDBACK
    if (tipo === "festa") {
        mensagem.pitch = 1.4; // Voz mais aguda e alegre
        mensagem.rate = 1.1;  // Um pouco mais rápido de empolgação
    } else if (tipo === "dica") {
        mensagem.pitch = 0.9; // Voz mais calma e acolhedora
        mensagem.rate = 0.9;  // Mais devagar para o entendimento
    } else {
        mensagem.pitch = 1.1; // Tom padrão amigável
        mensagem.rate = 1.0;
    }

    window.speechSynthesis.speak(mensagem);
}

// FUNÇÕES DE FEEDBACK PERSONALIZADO
function narrarAcerto() {
    const frasesFesta = [
        `Uau, ${nomeUsuario}! Você brilhou!`,
        `Muito bem, ${nomeUsuario}! Você é um gênio!`,
        `Incrível! O ${nomeUsuario} acertou tudo!`,
        `Isso mesmo! Que inteligência, ${nomeUsuario}!`
    ];
    const escolhida = frasesFesta[Math.floor(Math.random() * frasesFesta.length)];
    narrar(escolhida, "festa");
}

function narrarErro(perguntaOriginal) {
    // Dica pedagógica: repete a pergunta de forma mais lenta
    const frasesDica = [
        `Não faz mal, ${nomeUsuario}. Vamos tentar de novo?`,
        `Quase, ${nomeUsuario}! Olhe com atenção:`,
        `O ${nomeUsuario} consegue! Tente pensar mais um pouquinho nesta:`
    ];
    const introducao = frasesDica[Math.floor(Math.random() * frasesDica.length)];
    
    // Fala a dica + a pergunta novamente para reforçar
    narrar(`${introducao} ... ${perguntaOriginal}`, "dica");
}