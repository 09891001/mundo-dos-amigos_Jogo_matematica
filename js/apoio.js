// ===============================
// SISTEMA DE APOIO PSICOLÓGICO (TEA)
// ===============================

let apoioAtivo = false;
let ultimoDisparo = 0;

// ===============================
// FUNÇÃO PRINCIPAL
// ===============================
function verificarApoio(errosSeguidos, perguntaAtual) {
    try {
        const agora = Date.now();

        // evita repetir toda hora
        if (agora - ultimoDisparo < 5000) return;

        if (errosSeguidos >= 3 && !apoioAtivo) {
            apoioAtivo = true;
            ultimoDisparo = agora;

            iniciarApoio(perguntaAtual);
        }

    } catch (e) {
        console.error("[APOIO ERRO]", e);
    }
}

// ===============================
// INICIAR APOIO
// ===============================
function iniciarApoio(pergunta) {

    const nome = localStorage.getItem("nomeJogador") || "Amigo";

    // sequência guiada (respiração + acolhimento)
    falar(`${nome}, vamos com calma...`);

    falar("Respire fundo pelo nariz...", () => {
        setTimeout(() => {
            falar("Solte o ar devagar...", () => {
                setTimeout(() => {

                    falar("Você consegue. Vamos tentar juntos.");

                    // reforça pergunta novamente
                    falar(pergunta, () => {
                        apoioAtivo = false;
                    });

                }, 800);
            });
        }, 1200);
    });
}

// ===============================
// RESET APOIO (quando acerta)
// ===============================
function resetarApoio() {
    apoioAtivo = false;
}