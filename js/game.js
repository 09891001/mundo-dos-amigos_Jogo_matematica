/**
 * MUNDO DOS AMIGOS — MOTOR DO JOGO (V27.0.0 ULTRA GOLD)
 * ✅ Sistema TEA: apoio progressivo até 10 tentativas, nunca muda questão
 * ✅ Objetos visuais aparecem na 2ª tentativa errada
 * ✅ Frases motivadoras com nome do jogador
 * ✅ Conquistas em tempo real (combo, fases, pontos, velocidade)
 * ✅ Efeitos: confetes premium, partículas de clique, pontos flutuantes, estrelas
 * ✅ Nível-up popup a cada 5 fases
 * ✅ Som de fundo com crossfade entre fases
 * ✅ Compatibilidade total iOS/Android
 */

// ═══════════════════════════════════════════════════════════════
// 1. EFEITOS VISUAIS PREMIUM
// ═══════════════════════════════════════════════════════════════

function soltarConfete(intensidade = 1) {
    const cores = ['#22C55E','#4F46E5','#F59E0B','#EF4444','#EC4899','#06B6D4','#8B5CF6','#F97316'];
    const total = Math.round((window.innerWidth < 500 ? 22 : 50) * intensidade);
    for (let i = 0; i < total; i++) {
        const c = document.createElement('div');
        c.className = 'confete';
        c.style.cssText = `
            left:${Math.random()*100}vw;
            background:${cores[~~(Math.random()*cores.length)]};
            width:${4+Math.random()*8}px;height:${4+Math.random()*8}px;
            border-radius:${Math.random()>.5?'50%':'2px'};
            animation-duration:${0.7+Math.random()*1.2}s;
            animation-delay:${Math.random()*0.4}s;
        `;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 1800);
    }
}

function particulaClique(x, y, cor = '#4F46E5') {
    for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        const ang = (i/6)*360;
        p.style.cssText = `
            position:fixed;left:${x}px;top:${y}px;
            width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:9999;
            background:${['#4F46E5','#22C55E','#F59E0B','#EF4444','#EC4899','#8B5CF6'][i]};
            transition:all 0.45s cubic-bezier(0.2,0.8,0.2,1);
        `;
        document.body.appendChild(p);
        const d = 35 + Math.random()*30;
        requestAnimationFrame(() => {
            p.style.transform = `translate(${Math.cos(ang*Math.PI/180)*d}px,${Math.sin(ang*Math.PI/180)*d}px) scale(0)`;
            p.style.opacity = '0';
        });
        setTimeout(() => p.remove(), 450);
    }
}

function pontosFlutuantes(x, y, val, cor = '#22C55E') {
    const el = document.createElement('div');
    el.style.cssText = `
        position:fixed;left:${x-15}px;top:${y-10}px;
        font-size:1.6rem;font-weight:900;color:${cor};
        pointer-events:none;z-index:9990;
        text-shadow:0 2px 8px rgba(0,0,0,0.3);
        animation:pontosFlutuar 1s ease-out forwards;
    `;
    el.textContent = val > 0 ? `+${val}` : `${val}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function estrelaFlutuante(x, y) {
    const el = document.createElement('div');
    el.style.cssText = `
        position:fixed;left:${x-16}px;top:${y-40}px;
        font-size:1.8rem;pointer-events:none;z-index:9991;
        animation:estrelaFluir 0.9s ease-out forwards;
    `;
    el.textContent = '⭐';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
}

function nivelUpPopup(fase) {
    const el = document.createElement('div');
    el.className = 'nivel-up-popup';
    const msgs = {5:'Aquecendo! 🔥',10:'Metade! 💪',15:'Mais da metade! 🚀',20:'Quase lá! 🏅',25:'Faltam 5! 👑',30:'COMPLETO! 🎓'};
    el.innerHTML = `
        <div class="nivel-up-icone">🚀</div>
        <div class="nivel-up-info">
            <span class="nivel-up-label">FASE ${fase}</span>
            <span class="nivel-up-msg">${msgs[fase] || `Fase ${fase}!`}</span>
        </div>
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('nivel-up-visivel')));
    setTimeout(() => { el.classList.add('nivel-up-saindo'); setTimeout(() => el.remove(), 500); }, 1800);
}

// Injeta estilos de efeitos
(function() {
    const s = document.createElement('style');
    s.textContent = `
    @keyframes pontosFlutuar {
        0%   { opacity:1; transform:translateY(0) scale(1); }
        100% { opacity:0; transform:translateY(-65px) scale(1.3); }
    }
    @keyframes estrelaFluir {
        0%   { transform:scale(0) rotate(-20deg); opacity:1; }
        60%  { transform:scale(1.5) rotate(10deg); opacity:1; }
        100% { transform:scale(0) translateY(-30px); opacity:0; }
    }
    .nivel-up-popup {
        position:fixed;top:50%;left:50%;
        transform:translate(-50%,-50%) scale(0);
        background:linear-gradient(135deg,#4F46E5,#7C3AED);
        color:white;border-radius:28px;padding:20px 32px;
        z-index:9990;display:flex;align-items:center;gap:14px;
        box-shadow:0 20px 60px rgba(79,70,229,0.55);pointer-events:none;
        transition:transform 0.45s cubic-bezier(0.175,0.885,0.32,1.5);
    }
    .nivel-up-visivel { transform:translate(-50%,-50%) scale(1) !important; }
    .nivel-up-saindo  { transform:translate(-50%,-80%) scale(0) !important; opacity:0; transition:all 0.4s ease-in !important; }
    .nivel-up-icone   { font-size:2.8rem; animation:spinOnce 0.5s ease-out; }
    @keyframes spinOnce { from{transform:rotate(-180deg) scale(0)} to{transform:rotate(0) scale(1)} }
    .nivel-up-info    { display:flex;flex-direction:column; }
    .nivel-up-label   { font-size:1.8rem;font-weight:900;line-height:1; }
    .nivel-up-msg     { font-size:1rem;opacity:0.85;margin-top:3px; }
    `;
    document.head.appendChild(s);
})();


// ═══════════════════════════════════════════════════════════════
// 2. MOTOR DO JOGO
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

    // ─ Nodes ─────────────────────────────────────────────────
    const N = {
        pergunta:  document.getElementById('question')          || { innerText:'', classList:{add:()=>{},remove:()=>{}} },
        score:     document.getElementById('score')             || { innerText:'' },
        barra:     document.getElementById('progressBarFull')   || { style:{} },
        fase:      document.getElementById('progressText')      || { innerText:'' },
        estrelas:  document.getElementById('estrelas')          || { innerText:'', classList:{add:()=>{},remove:()=>{}}, offsetWidth:0 },
        ajuda:     document.getElementById('area-ajuda-visual') || { innerHTML:'' },
        respostas: Array.from(document.querySelectorAll('.choice-container')),
        botoesModo:document.querySelectorAll('.btn-modo'),
        fotoHud:   document.getElementById('foto-jogador'),
        conquCount:document.getElementById('conquistas-count'),
        comboDisplay: document.getElementById('combo-display'),
    };

    // ─ Estado ────────────────────────────────────────────────
    const S = {
        nome:           localStorage.getItem('nomeJogador') || 'Amigo',
        operacao:       localStorage.getItem('modoJogo')    || 'soma',
        fase:           1,
        score:          0,
        estrelas:       0,
        n1:             0,
        n2:             0,
        respostaCorreta:0,
        bloqueado:      false,
        audioLiberado:  false,
        vozPronta:      false,
        emoji:          '🍎',
        totalFases:     30,
        clicado:        false,
        combo:          0,
        acertosSemErro: 0,
        totalAcertos:   0,
        divisoesSeguidas:0,
        tempoInicio:    0,
        tempoResposta:  999,
    };

    // Emojis variados por fase
    const EMOJIS = ['🍎','🦋','⭐','🌸','🎈','🚀','🍕','🎸','🐶','🌈','🦄','🎯','🏆','🍦','🌺'];

    // Música de fundo
    if (typeof gerenciarMusicaFundo === 'function') gerenciarMusicaFundo(1);

    // ─ Utilitários ───────────────────────────────────────────
    function falarJogo(texto, tipo = 'neutro') {
        if (typeof falarSeguro === 'function' && texto) {
            setTimeout(() => falarSeguro(texto, tipo), 100);
        }
    }

    function desbloquearSistemas() {
        if (S.audioLiberado) return;
        if (typeof liberarAudio === 'function') liberarAudio();
        if (typeof liberarVoz   === 'function') liberarVoz();
        S.audioLiberado = true;
    }

    function atualizarBotoesModo() {
        N.botoesModo.forEach(b => b.classList.toggle('ativo', b.dataset.modo === S.operacao));
    }

    function atualizarConqCount() {
        if (N.conquCount && typeof totalConquistas === 'function')
            N.conquCount.textContent = `🏆 ${totalConquistas()}`;
    }

    // ─ HUD ───────────────────────────────────────────────────
    function atualizarHUD() {
        if (N.score)    N.score.innerText    = S.score;
        if (N.fase)     N.fase.innerText     = `Fase ${S.fase}/${S.totalFases}`;
        if (N.barra && N.barra.style)
            N.barra.style.width = `${(S.fase/S.totalFases)*100}%`;

        if (N.estrelas) {
            N.estrelas.innerText = S.estrelas;
            N.estrelas.classList.remove('acerto-animado');
            void N.estrelas.offsetWidth;
            N.estrelas.classList.add('acerto-animado');
        }

        // Combo display
        if (N.comboDisplay) {
            if (S.combo >= 2) {
                N.comboDisplay.textContent = S.combo >= 10 ? `🌟 COMBO x${S.combo}!!` : S.combo >= 5 ? `💥 COMBO x${S.combo}!` : `🔥 ${S.combo}x seguidos!`;
                N.comboDisplay.classList.add('ativo');
            } else {
                N.comboDisplay.classList.remove('ativo');
            }
        }

        atualizarConqCount();
    }

    // ─ Ajuda visual ──────────────────────────────────────────
    function renderizarAjuda(destacar = false) {
        if (!N.ajuda) return;
        N.ajuda.innerHTML = '';
        const max = Math.min(S.n1, 12);
        for (let i = 0; i < max; i++) {
            const span = document.createElement('span');
            span.className = 'emoji-ajuda' + (destacar ? ' emoji-destaque' : '');
            span.style.animationDelay = (i * 0.06) + 's';
            span.setAttribute('aria-label', `${S.emoji} número ${i+1}`);
            span.innerText = S.emoji;
            N.ajuda.appendChild(span);
        }

        // Label de contagem se modo apoio
        if (destacar) {
            const label = document.createElement('div');
            label.className = 'ajuda-label-conta';
            label.textContent = `👆 Conte: ${max} ${S.emoji}`;
            N.ajuda.appendChild(label);
        }
    }

    // ─ Geração de questão ────────────────────────────────────
    function gerarQuestao() {
        if (S.fase > S.totalFases) { finalizarJogo(); return; }

        // Troca emoji a cada 2 fases
        S.emoji = EMOJIS[Math.floor((S.fase-1) / 2) % EMOJIS.length];

        let n1, n2, resp, sim;
        switch (S.operacao) {
            case 'subtracao':
                n1 = ~~(Math.random()*9)+2; n2 = ~~(Math.random()*(n1-1))+1;
                resp = n1-n2; sim = '−'; break;
            case 'divisao':
                n2 = ~~(Math.random()*4)+1; resp = ~~(Math.random()*5)+1;
                n1 = n2*resp; sim = '÷'; break;
            default:
                n1 = ~~(Math.random()*10)+1; n2 = ~~(Math.random()*10)+1;
                resp = n1+n2; sim = '+';
        }

        S.n1 = n1; S.n2 = n2; S.respostaCorreta = resp;
        S.bloqueado   = false;
        S.tempoInicio = Date.now();

        // Reset apoio para nova questão
        if (typeof resetarApoio === 'function') resetarApoio();

        if (N.pergunta) N.pergunta.innerText = `Quanto é ${n1} ${sim} ${n2}?`;

        atualizarHUD();
        renderizarAjuda();
        montarOpcoes();

        if (S.audioLiberado && S.vozPronta)
            falarJogo(`${S.nome}, quanto é ${n1} ${sim} ${n2}?`);
    }

    // ─ Opções de resposta ────────────────────────────────────
    function montarOpcoes() {
        let ops = [S.respostaCorreta];
        let tent = 0;
        while (ops.length < 4 && tent < 50) {
            tent++;
            const n = S.respostaCorreta + (~~(Math.random()*7)-3);
            if (n >= 0 && n !== S.respostaCorreta && !ops.includes(n)) ops.push(n);
        }
        // garante 4 opções únicas
        while (ops.length < 4) ops.push(ops.length + 1);
        ops.sort(() => Math.random()-.5);

        N.respostas.forEach((btn, i) => {
            const txt = btn.querySelector('.choice-text');
            if (txt) txt.innerText = ops[i];
            btn.classList.remove('correta','errada','acerto-animado','erro-animado');
            btn.style.pointerEvents = 'auto';
            btn.style.transform = 'scale(1)';
            btn.style.background = '';

            // Handler unificado mouse + touch
            const handle = (e) => {
                if (e.type === 'touchstart') e.preventDefault();
                if (S.clicado || S.bloqueado) return;
                S.clicado = true;
                setTimeout(() => S.clicado = false, 380);

                btn.style.transform = 'scale(0.92)';
                setTimeout(() => btn.style.transform = 'scale(1)', 150);

                const touch = e.touches ? e.touches[0] : e;
                particulaClique(touch.clientX, touch.clientY);
                desbloquearSistemas();
                if (typeof tocarSomClique === 'function') tocarSomClique();

                if (!S.vozPronta) {
                    S.vozPronta = true;
                    falarJogo('Vamos começar!', 'festa');
                    setTimeout(() => { if (N.pergunta) falarJogo(N.pergunta.innerText); }, 1200);
                } else {
                    responder(btn, touch.clientX, touch.clientY);
                }
            };

            btn.onmousedown  = (e) => { if (e.button === 0) handle(e); };
            btn.ontouchstart = handle;
        });
    }

    // ─ Responder ─────────────────────────────────────────────
    function responder(btn, ex, ey) {
        if (S.bloqueado) return;
        S.bloqueado = true;
        N.respostas.forEach(b => b.style.pointerEvents = 'none');

        const txt = btn.querySelector('.choice-text');
        const val = txt ? parseInt(txt.innerText) : null;
        const ok  = val === S.respostaCorreta;

        S.tempoResposta = (Date.now() - S.tempoInicio) / 1000;

        if (ok) {
            // ── ACERTO ──────────────────────────────────────
            btn.classList.add('correta','acerto-animado');
            soltarConfete(S.combo >= 5 ? 2 : 1);
            if (typeof tocarSomAcerto === 'function') tocarSomAcerto();

            S.score        += 10;
            S.estrelas++;
            S.combo++;
            S.totalAcertos++;
            S.acertosSemErro++;
            if (S.operacao === 'divisao') S.divisoesSeguidas++;
            else S.divisoesSeguidas = 0;

            pontosFlutuantes(ex, ey, 10);
            estrelaFlutuante(ex, ey - 40);

            if (S.combo >= 2 && typeof mostrarComboBadge === 'function')
                mostrarComboBadge(S.combo);

            if (S.combo >= 5 && typeof tocarSomBonus === 'function')
                setTimeout(() => tocarSomBonus(), 350);

            const frasesAcerto = [
                `Parabéns ${S.nome}! Você acertou!`,
                `Isso mesmo ${S.nome}! Você é demais!`,
                `Muito bem ${S.nome}! Continue assim!`,
                `Perfeito ${S.nome}! Você arrasou!`,
            ];
            falarJogo(frasesAcerto[~~(Math.random()*frasesAcerto.length)], 'festa');

            atualizarHUD();

            // Verifica conquistas
            if (typeof verificarConquistas === 'function') {
                verificarConquistas({
                    fase: S.fase, score: S.score, combo: S.combo,
                    totalAcertos: S.totalAcertos, acertosSemErro: S.acertosSemErro,
                    tempoResposta: S.tempoResposta, estrelas: S.estrelas,
                    divisoesSeguidas: S.divisoesSeguidas,
                });
            }

            setTimeout(() => {
                S.fase++;
                // Nível up a cada 5 fases
                if (S.fase % 5 === 1 && S.fase > 1) {
                    nivelUpPopup(S.fase - 1);
                    if (typeof tocarSomNivel === 'function') tocarSomNivel();
                    // Muda trilha a cada 10 fases
                    if (typeof gerenciarMusicaFundo === 'function') {
                        if (S.fase <= 10)      gerenciarMusicaFundo(1);
                        else if (S.fase <= 20) gerenciarMusicaFundo(2);
                        else                   gerenciarMusicaFundo(3);
                    }
                }
                gerarQuestao();
            }, 1400);

        } else {
            // ── ERRO ─────────────────────────────────────────
            btn.classList.add('errada','erro-animado');
            document.body.classList.add('shake');
            if (typeof tocarSomErro === 'function') tocarSomErro();

            S.combo = 0;
            S.acertosSemErro = 0;
            S.divisoesSeguidas = 0;
            atualizarHUD();

            // Revela correta
            N.respostas.forEach(b => {
                const t = b.querySelector('.choice-text');
                if (t && parseInt(t.innerText) === S.respostaCorreta) b.classList.add('correta');
            });

            // Atualiza visual de apoio (objetos aparecem na 2ª tentativa)
            if (typeof registrarErroApoio === 'function') {
                const sim = S.operacao === 'subtracao' ? '−' : S.operacao === 'divisao' ? '÷' : '+';
                registrarErroApoio(
                    `${S.nome}, quanto é ${S.n1} ${sim} ${S.n2}?`,
                    S.n1, S.n2, S.emoji
                );
            }

            // Na 2ª tentativa em diante: destaca objetos de contagem
            const erros = parseInt(btn._erros || 0) + 1;
            if (erros >= 2) renderizarAjuda(true);

            setTimeout(() => {
                document.body.classList.remove('shake');
                // NÃO avança fase! Questão permanece até acertar
                S.bloqueado = false;
                montarOpcoes();
                N.respostas.forEach(b => b.style.pointerEvents = 'auto');
            }, 1800);
        }
    }

    // ─ Finalizar ─────────────────────────────────────────────
    function finalizarJogo() {
        localStorage.setItem('mostRecentScore', S.score);
        localStorage.setItem('estrelas', S.estrelas);

        if (typeof verificarConquistas === 'function')
            verificarConquistas({ fase:31, score:S.score, combo:S.combo, totalAcertos:S.totalAcertos, acertosSemErro:S.acertosSemErro });

        soltarConfete(3);
        if (typeof tocarSomConquista === 'function') tocarSomConquista();
        falarJogo(`Incrível ${S.nome}! Você completou o desafio com ${S.score} pontos! Você é um campeão!`, 'festa');

        setTimeout(() => {
            document.body.classList.add('fade-out');
            setTimeout(() => window.location.href = 'end.html', 400);
        }, 3000);
    }

    // ─ Botões de modo ────────────────────────────────────────
    atualizarBotoesModo();
    N.botoesModo.forEach(btn => {
        const h = (e) => {
            if (e.type === 'touchstart') e.preventDefault();
            if (S.clicado) return;
            S.clicado = true; setTimeout(() => S.clicado = false, 300);
            const t = e.touches ? e.touches[0] : e;
            particulaClique(t.clientX, t.clientY);
            S.operacao = btn.dataset.modo || 'soma';
            localStorage.setItem('modoJogo', S.operacao);
            atualizarBotoesModo();
            S.fase=1; S.score=0; S.combo=0; S.totalAcertos=0; S.acertosSemErro=0;
            gerarQuestao();
        };
        btn.onmousedown  = (e) => { if(e.button===0) h(e); };
        btn.ontouchstart = h;
    });

    // ─ Inicializar ───────────────────────────────────────────
    requestAnimationFrame(() => gerarQuestao());
});
