/**
 * MUNDO DOS AMIGOS - Motor Lógico (game.js)
 * Versão: 3.0 - Edição Final (Lead Developer)
 * Otimizado para iPhone, Acessibilidade TEA e Feedback Multimodal.
 */

// ===============================
// ELEMENTOS DO DOM
// ===============================
const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById("loader");
const gameArea = document.getElementById("game");

// ===============================
// ESTADO GLOBAL DO JOGO
// ===============================
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let lastSupportTime = 0;
let consecutiveErrors = 0;
const SUPPORT_INTERVAL = 15000; // 15 segundos entre apoios

const nomeJogador = localStorage.getItem("nomeJogador") || "Amigo";
const materia = localStorage.getItem("materiaAtual") || "soma";

// ===============================
// INICIALIZAÇÃO
// ===============================
const startGame = () => {
    questionCounter = 0;
    score = 0;
    consecutiveErrors = 0;
    lastSupportTime = Date.now();

    if (gameArea && loader) {
        gameArea.classList.remove("hidden");
        loader.classList.add("hidden");
    }

    // Tenta carregar progresso do Firebase (v8)
    if (typeof carregarProgresso === "function") {
        carregarProgresso(nomeJogador, (dados) => {
            if (dados) {
                questionCounter = (parseInt(dados.fase_atual) || 1) - 1;
                score = parseInt(dados.pontos) || 0;
                scoreText.innerText = score;
            }
            getNextQuestion();
        });
    } else {
        getNextQuestion();
    }
};

// ===============================
// FLUXO DE PERGUNTAS
// ===============================
const getNextQuestion = () => {
    if (questionCounter >= 30) {
        localStorage.setItem("mostRecentScore", score);
        return window.location.assign("./end.html");
    }

    questionCounter++;
    progressText.innerText = `Fase ${questionCounter}/30`;
    if (progressBarFull) {
        progressBarFull.style.width = `${(questionCounter / 30) * 100}%`;
    }

    // Define nível e tema visual
    const nivel = questionCounter <= 10 ? 1 : (questionCounter <= 20 ? 2 : 3);
    document.body.className = `tema-nivel-${nivel}`;

    // Gerencia Música de Fundo (sons.js)
    if (typeof gerenciarMusicaFundo === "function") {
        gerenciarMusicaFundo(nivel);
    }

    // Gera o cálculo matemático
    const { q, options, answer } = generateMathQuestion(nivel);
    currentQuestion = {
        question: q,
        answer: options.indexOf(answer) + 1
    };

    question.innerText = currentQuestion.question;

    // Renderiza opções nos balões
    choices.forEach((choice, index) => {
        choice.innerText = options[index];
        const container = choice.parentElement;
        container.classList.remove("correct", "incorrect");
    });

    // Narração da Pergunta (voz.js)
    if (typeof falar === "function") {
        falar(currentQuestion.question, "pergunta");
    }

    acceptingAnswers = true;
};

// ===============================
// GERADOR DE CÁLCULOS
// ===============================
const generateMathQuestion = (nivel) => {
    let max = nivel === 1 ? 10 : (nivel === 2 ? 20 : 50);
    let n1 = Math.floor(Math.random() * max) + 1;
    let n2 = Math.floor(Math.random() * max) + 1;
    let q, answer;

    if (materia === "soma") {
        q = `${n1} + ${n2}`;
        answer = n1 + n2;
    } else if (materia === "subtracao") {
        if (n1 < n2) [n1, n2] = [n2, n1];
        q = `${n1} - ${n2}`;
        answer = n1 - n2;
    } else if (materia === "divisao") {
        answer = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 5) + 1;
        n1 = answer * n2;
        q = `${n1} ÷ ${n2}`;
    } else {
        q = `${n1} + ${n2}`;
        answer = n1 + n2;
    }

    let options = [answer];
    while (options.length < 4) {
        let wrong = answer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
        if (wrong >= 0 && !options.includes(wrong)) options.push(wrong);
    }
    return { q, options: options.sort(() => Math.random() - 0.5), answer };
};

// ===============================
// GESTÃO DE TOQUE E RESPOSTAS
// ===============================
choices.forEach(choice => {
    const container = choice.parentElement;

    const handleSelection = (e) => {
        if (!acceptingAnswers) return;
        
        // Evita comportamento padrão de zoom/scroll no toque
        if (e.type === 'touchstart') e.preventDefault();

        acceptingAnswers = false;
        const selectedAnswer = choice.dataset["number"];
        const acertou = selectedAnswer == currentQuestion.answer;
        const classToApply = acertou ? "correct" : "incorrect";

        container.classList.add(classToApply);

        if (acertou) {
            score += 10;
            if (scoreText) scoreText.innerText = score;
            consecutiveErrors = 0;
            
            if (typeof tocarSomAcerto === "function") tocarSomAcerto();
            if (typeof vibrarAcerto === "function") vibrarAcerto();
            
            // Salva progresso online
            if (typeof salvarProgresso === "function") {
                salvarProgresso(nomeJogador, questionCounter + 1, score);
            }

            falar("Muito bem! Você acertou!", "sucesso", () => {
                setTimeout(getNextQuestion, 500);
            });
        } else {
            consecutiveErrors++;
            if (typeof tocarSomErro === "function") tocarSomErro();
            if (typeof vibrarErro === "function") vibrarErro();

            const agora = Date.now();
            if (consecutiveErrors >= 3 && (agora - lastSupportTime > SUPPORT_INTERVAL)) {
                lastSupportTime = agora;
                iniciarSequenciaApoio();
            } else {
                falar("Tente de novo com calma.", "erro", () => {
                    setTimeout(() => {
                        container.classList.remove("incorrect");
                        acceptingAnswers = true;
                    }, 500);
                });
            }
        }
    };

    // Escuta tanto clique quanto toque (Essencial para iPhone/Android)
    container.addEventListener("click", handleSelection);
    container.addEventListener("touchstart", handleSelection, { passive: false });
});

// ===============================
// APOIO PSICOLÓGICO (TRAVAMENTO)
// ===============================
function iniciarSequenciaApoio() {
    acceptingAnswers = false; // BLOQUEIA O JOGO TOTALMENTE
    
    falar(`${nomeJogador}, vamos respirar um pouco?`, "apoio", () => {
        setTimeout(() => {
            falar("Cheire a florzinha pelo nariz...", "apoio", () => {
                setTimeout(() => {
                    falar("Agora sopre a velinha devagar...", "apoio", () => {
                        setTimeout(() => {
                            falar("Você é capaz! Vamos tentar a conta mais uma vez.", "apoio", () => {
                                // Limpa erros visuais e destrava
                                document.querySelectorAll(".choice-container").forEach(el => {
                                    el.classList.remove("incorrect");
                                });
                                acceptingAnswers = true; // DESTRAVA
                                falar(currentQuestion.question, "pergunta");
                            });
                        }, 1000);
                    });
                }, 3000); // Pausa da respiração
            });
        }, 1000);
    });
}

// INICIALIZAÇÃO
window.onload = startGame;