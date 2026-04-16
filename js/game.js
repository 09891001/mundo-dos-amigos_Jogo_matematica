/**
 * MUNDO DOS AMIGOS — MOTOR DO JOGO (V28.0.0 DEFINITIVO FINAL)
 *
 * FIXES DESTA VERSÃO:
 * ✅ Objetos visuais completamente visíveis em TODAS as telas
 * ✅ Layout flexível: HUD compacto → pergunta → área objetos → botões
 * ✅ Apoio TEA: questão nunca muda, objetos pedagógicos por operação
 * ✅ Som de fundo que muda a cada bloco de 10 fases
 * ✅ Som de parabéns completo ao acertar
 * ✅ Som de erro com shake na tela
 * ✅ Partículas, confetes, pontos flutuantes, estrelas voando
 * ✅ Nível-up popup a cada 5 fases com música
 * ✅ 14 conquistas verificadas em tempo real
 * ✅ Compatibilidade total iOS/Android
 */

// ═══════════════════════════════════════════════════════════════
// EFEITOS VISUAIS
// ═══════════════════════════════════════════════════════════════

function soltarConfete(intensidade) {
    intensidade = intensidade || 1;
    const cores = ['#22C55E','#4F46E5','#F59E0B','#EF4444','#EC4899','#06B6D4','#8B5CF6','#F97316'];
    const total = Math.round((window.innerWidth < 480 ? 20 : 45) * intensidade);
    for (let i = 0; i < total; i++) {
        const c = document.createElement('div');
        c.className = 'confete';
        c.style.left = (Math.random() * 100) + 'vw';
        c.style.background = cores[~~(Math.random() * cores.length)];
        c.style.width  = (4 + Math.random() * 8) + 'px';
        c.style.height = (4 + Math.random() * 8) + 'px';
        c.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
        c.style.animationDuration = (0.8 + Math.random() * 1.1) + 's';
        c.style.animationDelay    = (Math.random() * 0.35) + 's';
        document.body.appendChild(c);
        setTimeout(() => { if (c.parentNode) c.remove(); }, 2000);
    }
}

function particulaClique(x, y) {
    const cs = ['#4F46E5','#22C55E','#F59E0B','#EF4444','#EC4899','#8B5CF6'];
    for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        const ang = (i / 6) * 360;
        p.style.cssText = 'position:fixed;left:'+x+'px;top:'+y+'px;width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:9999;background:'+cs[i]+';transition:all .45s cubic-bezier(.2,.8,.2,1);';
        document.body.appendChild(p);
        const d = 35 + Math.random() * 28;
        requestAnimationFrame(() => {
            p.style.transform = 'translate('+Math.cos(ang*Math.PI/180)*d+'px,'+Math.sin(ang*Math.PI/180)*d+'px) scale(0)';
            p.style.opacity = '0';
        });
        setTimeout(() => { if(p.parentNode) p.remove(); }, 460);
    }
}

function pontosFlutuantes(x, y, val) {
    const el = document.createElement('div');
    el.className = 'pts-float';
    el.textContent = '+' + val;
    el.style.left = (x - 18) + 'px';
    el.style.top  = (y - 14) + 'px';
    document.body.appendChild(el);
    setTimeout(() => { if(el.parentNode) el.remove(); }, 900);
}

function estrelaFlutuante(x, y) {
    const el = document.createElement('div');
    el.className = 'star-float';
    el.textContent = '⭐';
    el.style.left = (x - 16) + 'px';
    el.style.top  = (y - 42) + 'px';
    document.body.appendChild(el);
    setTimeout(() => { if(el.parentNode) el.remove(); }, 850);
}

function nivelUpPopup(fase) {
    document.querySelectorAll('.nivel-popup').forEach(e => e.remove());
    const msgs = {5:'Aquecendo! 🔥', 10:'Metade! 💪', 15:'Mais da metade! 🚀', 20:'Quase lá! 🏅', 25:'Faltam 5! 👑', 30:'VOCÊ PASSOU! 🎓'};
    const el = document.createElement('div');
    el.className = 'nivel-popup';
    el.innerHTML = '<div class="np-icon">🚀</div><div class="np-txt"><b>FASE '+fase+'</b><span>'+(msgs[fase]||'Avançando!')+'</span></div>';
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('np-in')));
    setTimeout(() => { el.classList.add('np-out'); setTimeout(() => { if(el.parentNode) el.remove(); }, 450); }, 2000);
}

// Estilos dos efeitos
(function() {
    const s = document.createElement('style');
    s.textContent = `
.pts-float{position:fixed;font-size:1.55rem;font-weight:900;color:#22C55E;pointer-events:none;z-index:9990;text-shadow:0 2px 8px rgba(0,0,0,.25);animation:pfloat .9s ease-out forwards;}
@keyframes pfloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-58px) scale(1.25)}}
.star-float{position:fixed;font-size:1.7rem;pointer-events:none;z-index:9991;animation:sfloat .85s ease-out forwards;}
@keyframes sfloat{0%{transform:scale(0) rotate(-20deg);opacity:1}60%{transform:scale(1.4) rotate(8deg);opacity:1}100%{transform:scale(0) translateY(-28px);opacity:0}}
.nivel-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);
  background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;
  border-radius:28px;padding:20px 30px;z-index:9995;
  display:flex;align-items:center;gap:14px;pointer-events:none;
  box-shadow:0 20px 60px rgba(79,70,229,.55);
  transition:transform .45s cubic-bezier(.175,.885,.32,1.5);}
.nivel-popup.np-in{transform:translate(-50%,-50%) scale(1);}
.nivel-popup.np-out{transform:translate(-50%,-80%) scale(0);opacity:0;transition:all .4s ease-in;}
.np-icon{font-size:2.6rem;animation:spin1 .5s ease-out;}
@keyframes spin1{from{transform:rotate(-180deg) scale(0)}to{transform:rotate(0) scale(1)}}
.np-txt{display:flex;flex-direction:column;gap:2px;}
.np-txt b{font-size:1.75rem;font-weight:900;line-height:1;}
.np-txt span{font-size:1rem;opacity:.85;margin-top:2px;}
    `;
    document.head.appendChild(s);
})();


// ═══════════════════════════════════════════════════════════════
// MOTOR DO JOGO
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {

    // ─ Mapeamento de nodes ────────────────────────────────────
    var N = {
        pergunta   : document.getElementById('question'),
        score      : document.getElementById('score'),
        barra      : document.getElementById('progressBarFull'),
        faseTxt    : document.getElementById('progressText'),
        estrelas   : document.getElementById('estrelas'),
        ajuda      : document.getElementById('area-ajuda-visual'),
        respostas  : Array.from(document.querySelectorAll('.choice-container')),
        comboBox   : document.getElementById('combo-display'),
        conquCount : document.getElementById('conquistas-count'),
    };

    // Fallback seguro para nodes ausentes
    function _safe(el) {
        return el || { innerText:'', textContent:'', classList:{ add:function(){}, remove:function(){}, contains:function(){return false;} }, style:{}, offsetWidth:0, innerHTML:'' };
    }
    Object.keys(N).forEach(k => { if (!N[k]) N[k] = _safe(null); });

    // ─ Estado do jogo ─────────────────────────────────────────
    var S = {
        nome    : localStorage.getItem('nomeJogador') || 'Amigo',
        op      : localStorage.getItem('modoJogo')    || 'soma',
        fase    : 1, totalFases: 30,
        score   : 0, estrelas : 0,
        n1:0, n2:0, resp:0,
        bloq    : false,
        audOk   : false, vozOk: false,
        emoji   : '🍎',
        clicado : false,
        combo   : 0, totalAcertos:0, acertosSemErro:0,
        divisoesSeg: 0, tempoInicio: 0, tempoResp: 999,
        errosQuestao: 0,   // erros na questão atual (para TEA)
    };

    var EMOJIS = ['🍎','🦋','⭐','🌸','🎈','🚀','🍕','🎸','🐶','🌈','🦄','🎯','🍦','🌺','🎀'];

    // ─ Início ────────────────────────────────────────────────
    // Música de fundo: inicia quando usuário tocar
    document.addEventListener('pointerdown', function inicMusica() {
        document.removeEventListener('pointerdown', inicMusica);
        if (typeof gerenciarMusicaFundo === 'function') gerenciarMusicaFundo(1);
    });

    // ─ Utilitários ───────────────────────────────────────────

    /**
     * falarJogo: narração do sistema (pergunta, feedback).
     * USA falar() — enfileira sem cortar o que está sendo dito.
     */
    function falarJogo(txt, tipo) {
        tipo = tipo || 'neutro';
        if (typeof falar === 'function' && txt)
            falar(txt, tipo);
    }

    /**
     * falarAcao: chamado APENAS quando o jogador toca algo.
     * USA falarPrioritario() — interrompe e fala imediatamente.
     */
    function falarAcao(txt, tipo) {
        tipo = tipo || 'neutro';
        if (typeof falarPrioritario === 'function' && txt)
            falarPrioritario(txt, tipo);
    }

    function desbloq() {
        if (S.audOk) return;
        if (typeof liberarAudio === 'function') liberarAudio();
        if (typeof liberarVoz   === 'function') liberarVoz();
        S.audOk = true;
    }

    function atualizarModo() {
        document.querySelectorAll('.btn-modo').forEach(function(b) {
            b.classList.toggle('ativo', b.dataset.modo === S.op);
        });
    }

    function atualizarConqCount() {
        var t = typeof totalConquistas === 'function' ? totalConquistas() : 0;
        N.conquCount.textContent = '🏆 ' + t;
    }

    // ─ HUD ───────────────────────────────────────────────────
    function atualizarHUD() {
        N.score.textContent    = S.score;
        N.estrelas.textContent = S.estrelas;
        N.faseTxt.textContent  = 'Fase ' + S.fase + '/' + S.totalFases;

        if (N.barra && N.barra.style)
            N.barra.style.width = ((S.fase / S.totalFases) * 100) + '%';

        // Combo
        if (S.combo >= 2) {
            N.comboBox.textContent = S.combo >= 10 ? '🌟 COMBO x'+S.combo+'!!' : S.combo >= 5 ? '💥 COMBO x'+S.combo+'!' : '🔥 '+S.combo+'x!';
            N.comboBox.classList.add('ativo');
        } else {
            N.comboBox.classList.remove('ativo');
        }

        atualizarConqCount();
    }

    // ─ Renderizar objetos ────────────────────────────────────
    /**
     * Renderiza os objetos de ajuda visual na área central.
     * SEMPRE visíveis, tamanho adaptativo.
     * destaque: true quando em modo apoio (2ª tentativa+)
     */
    function renderizarObjetos(destaque) {
        var area = N.ajuda;
        area.innerHTML = '';
        area.className = 'area-ajuda-base' + (destaque ? ' area-ajuda-destaque' : '');

        // Máximo objetos que cabem na área
        // Mobile pequeno: max 8, normal: max 10
        var maxItens = window.innerWidth < 380 ? 6 : (window.innerWidth < 500 ? 8 : 10);
        var n1Show   = Math.min(S.n1, maxItens);

        if (S.op === 'soma') {
            // Dois grupos separados por "+"
            var g1 = Math.min(S.n1, maxItens);
            var g2 = Math.min(S.n2, maxItens);

            var row = document.createElement('div');
            row.className = 'obj-row';

            // Grupo 1
            var box1 = document.createElement('div');
            box1.className = 'obj-box obj-box-soma1';
            for (var i=0; i<g1; i++) {
                var sp = document.createElement('span');
                sp.className = 'obj-emoji' + (destaque ? ' obj-destaque':'');
                sp.style.animationDelay = (i*0.05)+'s';
                sp.textContent = S.emoji;
                box1.appendChild(sp);
            }
            var lbl1 = document.createElement('div');
            lbl1.className = 'obj-lbl'; lbl1.textContent = S.n1;
            box1.appendChild(lbl1);

            var op  = document.createElement('div'); op.className='obj-op'; op.textContent='➕';
            
            // Grupo 2
            var box2 = document.createElement('div');
            box2.className = 'obj-box obj-box-soma2';
            for (var j=0; j<g2; j++) {
                var sp2 = document.createElement('span');
                sp2.className = 'obj-emoji' + (destaque ? ' obj-destaque':'');
                sp2.style.animationDelay = ((g1+j)*0.05)+'s';
                sp2.textContent = S.emoji;
                box2.appendChild(sp2);
            }
            var lbl2 = document.createElement('div');
            lbl2.className='obj-lbl'; lbl2.textContent=S.n2;
            box2.appendChild(lbl2);

            row.appendChild(box1); row.appendChild(op); row.appendChild(box2);
            area.appendChild(row);

        } else if (S.op === 'subtracao') {
            var row2 = document.createElement('div'); row2.className='obj-row';
            var box  = document.createElement('div'); box.className='obj-box obj-box-sub';
            for (var k=0; k<n1Show; k++) {
                var spk = document.createElement('span');
                var riscado = (k >= (S.n1 - S.n2));
                spk.className = 'obj-emoji' + (riscado?' obj-riscado':'') + (destaque&&!riscado?' obj-destaque':'');
                spk.style.animationDelay=(k*0.05)+'s';
                spk.textContent = S.emoji;
                box.appendChild(spk);
            }
            var lbl3=document.createElement('div'); lbl3.className='obj-lbl'; lbl3.textContent=S.n1+' − '+S.n2;
            box.appendChild(lbl3);
            row2.appendChild(box); area.appendChild(row2);

        } else { // divisão
            var numGrupos  = Math.min(S.n2, 4);
            var perGrupo   = Math.min(Math.ceil(S.n1 / S.n2), 4);
            var rowD = document.createElement('div'); rowD.className='obj-row obj-row-div';

            for (var g=0; g<numGrupos; g++) {
                var gd = document.createElement('div'); gd.className='obj-box obj-box-div';
                for (var h=0; h<perGrupo; h++) {
                    var spd = document.createElement('span');
                    spd.className='obj-emoji'+(destaque?' obj-destaque':'');
                    spd.style.animationDelay=((g*perGrupo+h)*0.05)+'s';
                    spd.textContent=S.emoji;
                    gd.appendChild(spd);
                }
                var lgd=document.createElement('div'); lgd.className='obj-lbl-sm'; lgd.textContent=(g+1)+'º';
                gd.appendChild(lgd);
                rowD.appendChild(gd);
            }
            area.appendChild(rowD);
        }

        // Instrução sempre visível no modo apoio
        if (destaque) {
            var inst = document.createElement('div'); inst.className='obj-instrucao';
            if (S.op==='soma')       inst.textContent='👆 Conta o 1º grupo + o 2º grupo!';
            else if (S.op==='subtracao') inst.textContent='👆 Conta o que sobra depois de tirar!';
            else                     inst.textContent='👆 Divide em grupos iguais!';
            area.appendChild(inst);
        }
    }

    // ─ Gerar questão ─────────────────────────────────────────
    function gerarQuestao() {
        if (S.fase > S.totalFases) { finalizarJogo(); return; }

        S.emoji = EMOJIS[Math.floor((S.fase - 1) / 2) % EMOJIS.length];

        var n1, n2, resp, sim;
        if (S.op === 'subtracao') {
            n1=~~(Math.random()*9)+2; n2=~~(Math.random()*(n1-1))+1; resp=n1-n2; sim='−';
        } else if (S.op === 'divisao') {
            n2=~~(Math.random()*4)+1; resp=~~(Math.random()*5)+1; n1=n2*resp; sim='÷';
        } else {
            n1=~~(Math.random()*10)+1; n2=~~(Math.random()*10)+1; resp=n1+n2; sim='+';
        }

        S.n1=n1; S.n2=n2; S.resp=resp;
        S.bloq=false; S.errosQuestao=0;
        S.tempoInicio=Date.now();

        if (typeof resetarApoio==='function') resetarApoio();

        N.pergunta.textContent = 'Quanto é '+n1+' '+sim+' '+n2+'?';
        // Força reanimação da pergunta
        N.pergunta.style.animation='none'; void N.pergunta.offsetWidth;
        N.pergunta.style.animation='';

        atualizarHUD();
        renderizarObjetos(false);
        montarOpcoes();

        if (S.audOk && S.vozOk) {
            // Sistema: enfileira sem cortar
            falarJogo(S.nome+', quanto é '+n1+' '+sim+' '+n2+'?');
        }
    }

    // ─ Opções ────────────────────────────────────────────────
    function montarOpcoes() {
        var ops = [S.resp], t=0;
        while(ops.length < 4 && t++ < 60) {
            var n = S.resp + (~~(Math.random()*7)-3);
            if (n >= 0 && !ops.includes(n)) ops.push(n);
        }
        while(ops.length < 4) ops.push(ops.length * 2 + 1);
        ops.sort(function(){ return Math.random()-.5; });

        N.respostas.forEach(function(btn, i) {
            var txt = btn.querySelector('.choice-text');
            if (txt) txt.textContent = ops[i];
            btn.classList.remove('correta','errada','acerto-animado','erro-animado');
            btn.style.pointerEvents='auto';
            btn.style.transform='';

            function handle(e) {
                if (e.type==='touchstart') e.preventDefault();
                if (S.clicado||S.bloq) return;
                S.clicado=true; setTimeout(function(){ S.clicado=false; },380);

                btn.style.transform='scale(0.91)';
                setTimeout(function(){ btn.style.transform=''; },150);

                var t2=e.touches?e.touches[0]:e;
                particulaClique(t2.clientX,t2.clientY);
                desbloq();
                if(typeof tocarSomClique==='function') tocarSomClique();

                if (!S.vozOk) {
                    // Primeiro toque do jogador: desbloqueia e fala prioritariamente
                    S.vozOk = true;
                    falarAcao('Vamos começar! ' + N.pergunta.textContent, 'festa');
                } else {
                    responder(btn, t2.clientX, t2.clientY);
                }
            }
            btn.onmousedown  = function(e){ if(e.button===0) handle(e); };
            btn.ontouchstart = handle;
        });
    }

    // ─ Responder ─────────────────────────────────────────────
    function responder(btn, ex, ey) {
        if (S.bloq) return;
        S.bloq = true;
        N.respostas.forEach(function(b){ b.style.pointerEvents='none'; });

        var txt = btn.querySelector('.choice-text');
        var val = txt ? parseInt(txt.textContent) : null;
        var ok  = (val === S.resp);
        S.tempoResp = (Date.now()-S.tempoInicio)/1000;

        if (ok) {
            // ── ACERTO ──────────────────────────────────────
            btn.classList.add('correta','acerto-animado');
            soltarConfete(S.combo>=5?2:1);

            // Som de parabéns
            if (typeof tocarSomAcerto==='function') tocarSomAcerto();

            S.score+=10; S.estrelas++; S.combo++;
            S.totalAcertos++; S.acertosSemErro++;
            if (S.op==='divisao') S.divisoesSeg++; else S.divisoesSeg=0;

            pontosFlutuantes(ex,ey,10);
            estrelaFlutuante(ex,ey-42);

            if (S.combo>=2 && typeof mostrarComboBadge==='function') mostrarComboBadge(S.combo);
            if (S.combo>=5 && typeof tocarSomBonus==='function') setTimeout(function(){ tocarSomBonus(); },320);

            var fa=[
                'Parabéns '+S.nome+'! Você acertou!',
                'Isso mesmo '+S.nome+'! Você é demais!',
                'Muito bem '+S.nome+'! Continue assim!',
                'Perfeito '+S.nome+'! Você arrasou!',
                'Uau '+S.nome+'! Que resposta incrível!',
            ];
            // Ação do jogador: interrompe qualquer narração e fala parabéns
            falarAcao(fa[~~(Math.random()*fa.length)], 'festa');
            atualizarHUD();

            if (typeof verificarConquistas==='function') {
                verificarConquistas({
                    fase:S.fase, score:S.score, combo:S.combo,
                    totalAcertos:S.totalAcertos, acertosSemErro:S.acertosSemErro,
                    tempoResposta:S.tempoResp, estrelas:S.estrelas,
                    divisoesSeguidas:S.divisoesSeg,
                });
            }

            setTimeout(function() {
                S.fase++;
                if (S.fase%5===1 && S.fase>1) {
                    nivelUpPopup(S.fase-1);
                    if(typeof tocarSomNivel==='function') tocarSomNivel();
                }
                // Troca trilha sonora
                if (typeof gerenciarMusicaFundo==='function') {
                    if (S.fase<=10)      gerenciarMusicaFundo(1);
                    else if (S.fase<=20) gerenciarMusicaFundo(2);
                    else                 gerenciarMusicaFundo(3);
                }
                gerarQuestao();
            }, 1500);

        } else {
            // ── ERRO ─────────────────────────────────────────
            btn.classList.add('errada','erro-animado');
            document.body.classList.add('shake');
            if(typeof tocarSomErro==='function') tocarSomErro();

            S.combo=0; S.acertosSemErro=0; S.divisoesSeg=0; S.errosQuestao++;
            atualizarHUD();

            // Revela resposta correta
            N.respostas.forEach(function(b){
                var t2=b.querySelector('.choice-text');
                if(t2&&parseInt(t2.textContent)===S.resp) b.classList.add('correta');
            });

            // Sistema TEA — aguarda o shake terminar antes de disparar a narração
            setTimeout(function() {
                document.body.classList.remove('shake');

                // A partir do 2º erro: mostra objetos visuais + painel de instrução
                if (S.errosQuestao >= 2) {
                    renderizarObjetos(true);
                    if (typeof _mostrarPainelInstrucao === 'function') {
                        _mostrarPainelInstrucao(S.n1, S.n2, S.emoji, S.op);
                    }
                }

                // Registra o erro no sistema de apoio (dispara narração sequencial)
                if (typeof registrarErroApoio === 'function') {
                    var sim2 = S.op==='subtracao' ? '−' : S.op==='divisao' ? '÷' : '+';
                    registrarErroApoio(
                        S.nome+', quanto é '+S.n1+' '+sim2+' '+S.n2+'?',
                        S.n1, S.n2, S.emoji, S.op
                    );
                }

                S.bloq = false;
                montarOpcoes();
                N.respostas.forEach(function(b){ b.style.pointerEvents='auto'; });
            }, 1600);
        }
    }

    // ─ Fim de jogo ───────────────────────────────────────────
    function finalizarJogo() {
        localStorage.setItem('mostRecentScore', S.score);
        localStorage.setItem('estrelas', S.estrelas);

        if(typeof verificarConquistas==='function')
            verificarConquistas({fase:31,score:S.score,combo:S.combo,totalAcertos:S.totalAcertos,acertosSemErro:S.acertosSemErro});

        soltarConfete(3);
        if(typeof tocarSomFinal==='function') tocarSomFinal();
        // Fim de jogo: usa falarAcao para garantir que fala imediatamente
        falarAcao('Incrível '+S.nome+'! Você completou o desafio com '+S.score+' pontos! Você é um campeão!','festa');

        setTimeout(function() {
            document.body.classList.add('fade-out');
            setTimeout(function(){ window.location.href='end.html'; },400);
        }, 3200);
    }

    // ─ Botões de modo ────────────────────────────────────────
    atualizarModo();
    document.querySelectorAll('.btn-modo').forEach(function(btn){
        function hm(e) {
            if(e.type==='touchstart') e.preventDefault();
            if(S.clicado) return; S.clicado=true; setTimeout(function(){S.clicado=false;},300);
            var t2=e.touches?e.touches[0]:e;
            particulaClique(t2.clientX,t2.clientY);
            S.op=btn.dataset.modo||'soma';
            localStorage.setItem('modoJogo',S.op);
            atualizarModo();
            S.fase=1;S.score=0;S.combo=0;S.totalAcertos=0;S.acertosSemErro=0;S.errosQuestao=0;
            if(typeof resetarApoio==='function') resetarApoio();
            gerarQuestao();
        }
        btn.onmousedown=(e)=>{ if(e.button===0) hm(e); };
        btn.ontouchstart=hm;
    });

    // ─ Start ─────────────────────────────────────────────────
    requestAnimationFrame(gerarQuestao);
});
