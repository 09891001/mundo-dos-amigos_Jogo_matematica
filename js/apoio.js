/**
 * MUNDO DOS AMIGOS — APOIO TEA (V3.0.0 ULTRA)
 * ✅ Frases motivadoras com nome do jogador (10 frases únicas)
 * ✅ Ativa na 2ª tentativa errada: exibe objetos para contar
 * ✅ Frases progressivas: 3ª, 4ª... até 10ª tentativa
 * ✅ Nunca muda o cálculo: permanece até acertar
 * ✅ Voz com entonação de apoio (tipo "dica")
 * ✅ Indicador visual de "objetos disponíveis para contar"
 */

const FRASES_APOIO = [
    (n) => `${n}, respira fundo. Você consegue!`,
    (n) => `${n}, dessa vez você vai acertar. Acredita em você!`,
    (n) => `${n}, se tiver difícil, chame alguém para ajudar. Não desista, você é inteligente!`,
    (n) => `${n}, olha os objetos com atenção e conta devagar, um por um.`,
    (n) => `${n}, você já chegou até aqui! Isso mostra que você é capaz!`,
    (n) => `${n}, tente ler a pergunta de novo com calma. Você está quase lá!`,
    (n) => `${n}, não existe errado, existe tentando. Continue tentando!`,
    (n) => `${n}, cada tentativa te deixa mais esperto. Vai lá!`,
    (n) => `${n}, você é mais forte do que pensa. Respira e tenta mais uma vez.`,
    (n) => `${n}, pensa: qual número faz mais sentido? Você sabe a resposta!`,
];

let _errosNaQuestao  = 0;
let _apoioAtivo      = false;
let _questaoAtual    = "";
let _n1Atual         = 0;
let _n2Atual         = 0;
let _emojiAtual      = "🍎";
let _ultimoDisparo   = 0;

/**
 * Registra um erro e aciona o sistema de apoio progressivo.
 * @param {string} pergunta - Texto da pergunta atual
 * @param {number} n1       - Primeiro número
 * @param {number} n2       - Segundo número
 * @param {string} emoji    - Emoji de apoio visual
 */
function registrarErroApoio(pergunta, n1, n2, emoji) {
    _questaoAtual = pergunta;
    _n1Atual      = n1;
    _n2Atual      = n2;
    _emojiAtual   = emoji || "🍎";
    _errosNaQuestao++;

    const agora = Date.now();
    if (agora - _ultimoDisparo < 3500) return; // debounce
    _ultimoDisparo = agora;

    _ativarApoio();
}

function _ativarApoio() {
    const nome = localStorage.getItem("nomeJogador") || "Amigo";
    const idx  = Math.min(_errosNaQuestao - 1, FRASES_APOIO.length - 1);
    const frase = FRASES_APOIO[idx](nome);

    _apoioAtivo = true;

    // Exibe banner de apoio
    _mostrarBannerApoio(frase, _errosNaQuestao);

    // Na 2ª tentativa em diante: mostra objetos visuais
    if (_errosNaQuestao >= 2) {
        _mostrarObjetosApoio(_n1Atual, _n2Atual, _emojiAtual);
    }

    // Voz sequencial
    const seq = [];
    seq.push({ t: frase,                    tipo: "dica",   delay: 0 });
    if (_errosNaQuestao >= 2) {
        seq.push({ t: `Olha, eu coloquei ${_n1Atual} ${_emojiAtual} para você contar!`, tipo: "dica", delay: 2000 });
    }
    seq.push({ t: `${nome}, vamos tentar mais uma vez.`, tipo: "neutro", delay: _errosNaQuestao >= 2 ? 5000 : 3000 });
    seq.push({ t: _questaoAtual, tipo: "neutro", delay: _errosNaQuestao >= 2 ? 7500 : 5000 });

    seq.forEach(item => {
        setTimeout(() => {
            if (typeof falar === "function") falar(item.t, item.tipo);
        }, item.delay);
    });

    setTimeout(() => { _apoioAtivo = false; }, 8000);
}

// ─── BANNER DE APOIO ─────────────────────────────────────────────────────────
function _mostrarBannerApoio(frase, tentativa) {
    document.querySelectorAll('.apoio-banner').forEach(e => e.remove());

    const el = document.createElement('div');
    el.className = 'apoio-banner';
    const emoji = tentativa <= 2 ? '💙' : tentativa <= 4 ? '🌟' : tentativa <= 6 ? '💪' : '🤗';
    el.innerHTML = `
        <div class="apoio-banner-inner">
            <span class="apoio-emoji">${emoji}</span>
            <div class="apoio-texto">
                <span class="apoio-tentativa">Tentativa ${tentativa}</span>
                <span class="apoio-frase">${frase}</span>
            </div>
        </div>
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('apoio-visivel')));

    setTimeout(() => {
        el.classList.add('apoio-saindo');
        setTimeout(() => el.remove(), 500);
    }, tentativa >= 2 ? 8500 : 5000);
}

// ─── OBJETOS VISUAIS DE APOIO ────────────────────────────────────────────────
function _mostrarObjetosApoio(n1, n2, emoji) {
    const areaAjuda = document.getElementById('area-ajuda-visual');
    if (!areaAjuda) return;

    // Pulsa a área de ajuda para chamar atenção
    areaAjuda.classList.add('apoio-pulsando');
    setTimeout(() => areaAjuda.classList.remove('apoio-pulsando'), 2000);

    // Mostra indicador "👆 Conte os objetos!"
    let indicador = document.getElementById('apoio-indicador');
    if (!indicador) {
        indicador = document.createElement('div');
        indicador.id = 'apoio-indicador';
        indicador.className = 'apoio-indicador';
        areaAjuda.parentNode.insertBefore(indicador, areaAjuda);
    }
    indicador.innerHTML = `👆 Conte os <strong>${emoji}</strong>! Tem <strong>${n1}</strong> para contar.`;
    indicador.classList.add('apoio-indicador-visivel');

    setTimeout(() => {
        indicador.classList.remove('apoio-indicador-visivel');
        setTimeout(() => indicador.remove(), 500);
    }, 7000);
}

/** Reseta ao acertar ou mudar de questão */
function resetarApoio() {
    _errosNaQuestao = 0;
    _apoioAtivo     = false;
    document.querySelectorAll('.apoio-banner, #apoio-indicador').forEach(e => e.remove());
}

// ─── ESTILOS INJETADOS ────────────────────────────────────────────────────────
(function() {
    const s = document.createElement('style');
    s.textContent = `
    .apoio-banner {
        position: fixed;
        bottom: -140px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99998;
        width: min(380px, 94vw);
        background: linear-gradient(135deg, #1e3a5f 0%, #0f2d4a 100%);
        border: 2px solid rgba(100,180,255,0.4);
        border-radius: 22px;
        padding: 14px 16px;
        box-shadow: 0 -8px 40px rgba(0,100,255,0.2), 0 20px 60px rgba(0,0,0,0.4);
        transition: bottom 0.5s cubic-bezier(0.175,0.885,0.32,1.275);
    }
    .apoio-banner.apoio-visivel  { bottom: 20px; }
    .apoio-banner.apoio-saindo   { bottom: -140px; transition: bottom 0.4s ease-in; }
    .apoio-banner-inner { display: flex; align-items: flex-start; gap: 12px; }
    .apoio-emoji { font-size: 2.6rem; flex-shrink: 0; filter: drop-shadow(0 0 8px rgba(100,200,255,0.6)); }
    .apoio-texto { display: flex; flex-direction: column; gap: 3px; }
    .apoio-tentativa { font-size: 0.7rem; font-weight: 900; color: #60a5fa; text-transform: uppercase; letter-spacing: 1px; }
    .apoio-frase { font-size: 0.95rem; font-weight: 700; color: #e2e8f0; line-height: 1.4; }

    .apoio-indicador {
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border: 2px solid #f59e0b;
        border-radius: 14px;
        padding: 10px 16px;
        font-size: 0.95rem;
        font-weight: 800;
        color: #92400e;
        text-align: center;
        margin: 6px 0;
        opacity: 0;
        transform: translateY(-8px);
        transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
    }
    .apoio-indicador-visivel { opacity: 1; transform: translateY(0); }
    .apoio-indicador strong  { color: #b45309; }

    @keyframes apoioPulse {
        0%,100% { transform: scale(1); box-shadow: none; }
        50%      { transform: scale(1.04); box-shadow: 0 0 20px rgba(245,158,11,0.5); }
    }
    .apoio-pulsando { animation: apoioPulse 0.7s ease-in-out 2; }
    `;
    document.head.appendChild(s);
})();
