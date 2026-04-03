/**
 * MUNDO DOS AMIGOS - Lógica Principal (game.js)
 * Versão: 2.1 - Correção de IDs e Música
 */

const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById("loader");
const gameArea = document.getElementById("game");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let lastSupportTime = 0;
const SUPPORT_INTERVAL = 15000;
let consecutiveErrors = 0;

const nomeJogador = localStorage.getItem("nomeJogador") || "Amigo";
const materia = localStorage.getItem("materiaAtual") || "soma";

const startGame = () => {
    questionCounter = 0;
    score = 0;
    consecutiveErrors = 0;
    
    // Mostra o jogo e esconde o loader (Correção do erro classList)
    if (gameArea && loader) {
        gameArea.classList.remove("hidden");
        loader.classList.add("hidden");
    }

    // Carrega progresso do Firebase ou inicia novo
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

const getNextQuestion = () => {
    if (questionCounter >= 30) {
        localStorage.setItem("mostRecentScore", score);
        return window.location.assign("end.html");
    }

    questionCounter++;
    progressText.innerText = `Fase ${questionCounter}/30`;
    progressBarFull.style.width = `${(questionCounter / 30) * 100}%`;

    // Gerenciar Música por Nível (Correção da música que não tocava)
    const nivel = questionCounter <= 10 ? 1 : (questionCounter <= 20 ? 2 : 3);
    document.body.className = `tema-nivel-${nivel}`;
    if (typeof gerenciarMusicaFundo === "function") {
        gerenciarMusicaFundo(nivel);
    }

    const { q, options, answer } = generateMathQuestion(nivel);
    currentQuestion = {
        question: q,
        answer: options.indexOf(answer) + 1
    };

    question.innerText = currentQuestion.question;

    choices.forEach((choice, index) => {
        choice.innerText = options[index];
        choice.parentElement.classList.remove("correct", "incorrect");
    });

    falar(currentQuestion.question, "pergunta");
    acceptingAnswers = true;
};

// Continua na Parte 2 para não quebrar o código...
// ==========================================
// LÓGICA DE RESPOSTA E GERAÇÃO DE CÁLCULOS
// ==========================================

const generateMathQuestion = (nivel) => {
    let max = nivel === 1 ? 10 : (nivel === 2 ? 20 : 50);
    let op = localStorage.getItem("materiaAtual") || "soma";
    
    let n1 = Math.floor(Math.random() * max) + 1;
    let n2 = Math.floor(Math.random() * max) + 1;
    let q, answer;

    if (op === "soma") {
        q = `${n1} + ${n2}`;
        answer = n1 + n2;
    } else if (op === "subtracao") {
        if (n1 < n2) [n1, n2] = [n2, n1];
        q = `${n1} - ${n2}`;
        answer = n1 - n2;
    } else if (op === "divisao") {
        answer = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 5) + 1;
        n1 = answer * n2;
        q = `${n1} ÷ ${n2}`;
    }

    let options = [answer];
    while (options.length < 4) {
        let wrong = answer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
        if (wrong >= 0 && !options.includes(wrong)) options.push(wrong);
    }
    return { q, options: options.sort(() => Math.random() - 0.5), answer };
};

// EVENTO DE CLIQUE NAS RESPOSTAS
choices.forEach(choice => {
    choice.parentElement.addEventListener("click", () => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedAnswer = choice.dataset["number"];
        const classToApply = selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

        if (classToApply === "correct") {
            score += 10;
            scoreText.innerText = score;
            consecutiveErrors = 0;
            
            tocarSomAcerto();
            vibrarAcerto();
            
            choice.parentElement.classList.add("correct");
            
            // Salva progresso no Firebase
            if (typeof salvarProgresso === "function") {
                salvarProgresso(nomeJogador, questionCounter + 1, score);
            }

            falar("Muito bem! Você acertou!", "sucesso", () => {
                setTimeout(getNextQuestion, 500);
            });

        } else {
            consecutiveErrors++;
            tocarSomErro();
            vibrarErro();
            choice.parentElement.classList.add("incorrect");

            const agora = Date.now();
            if (consecutiveErrors >= 3 && (agora - lastSupportTime > SUPPORT_INTERVAL)) {
                lastSupportTime = agora;
                iniciarSequenciaApoio();
            } else {
                falar("Não tem problema, vamos tentar de novo.", "erro", () => {
                    setTimeout(() => {
                        choice.parentElement.classList.remove("incorrect");
                        acceptingAnswers = true;
                    }, 500);
                });
            }
        }
    });
});

// SISTEMA DE APOIO COM TRAVAMENTO (Melhoria 1)
function iniciarSequenciaApoio() {
    acceptingAnswers = false; // BLOQUEIA O JOGO
    const nome = localStorage.getItem("nomeJogador") || "Amigo";

    falar(`${nome}, vamos parar um pouquinho para respirar?`, "apoio", () => {
        setTimeout(() => {
            falar("Cheire a florzinha pelo nariz...", "apoio", () => {
                setTimeout(() => {
                    falar("Agora sopre a velinha devagar...", "apoio", () => {
                        setTimeout(() => {
                            falar("Você consegue! Vamos olhar a conta de novo.", "apoio", () => {
                                // Limpa as marcações de erro e destrava
                                document.querySelectorAll(".choice-container").forEach(el => {
                                    el.classList.remove("incorrect");
                                });
                                acceptingAnswers = true; // DESTRAVA
                                falar(currentQuestion.question, "pergunta");
                            });
                        }, 1000);
                    });
                }, 3000); // Pausa para simular a respiração
            });
        }, 1000);
    });
}

// INICIALIZAÇÃO DO JOGO
window.onload = startGame;