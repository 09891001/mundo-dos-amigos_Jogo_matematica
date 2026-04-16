/**
 * MUNDO DOS AMIGOS — APOIO TEA (V5.0.0 FINAL)
 *
 * CORREÇÕES DESTA VERSÃO:
 *  ✅ Narração usa falarSequencia() — frases nunca se cortam entre si
 *  ✅ Objetos pedagógicos narrados completamente antes da próxima instrução
 *  ✅ Narração explica CADA ELEMENTO da tela (grupos, operador, resultado)
 *  ✅ Voz interrompida SOMENTE se criança tocar na tela (falarPrioritario)
 *  ✅ Animações escalonadas nos objetos (entram um a um)
 *  ✅ Destaque visual com contagem numérica
 *  ✅ Offline 100%: zero APIs externas
 */

// ── Estado ───────────────────────────────────────────────────────
var _ap_erros   = 0;
var _ap_ativo   = false;
var _ap_ultimo  = 0;
var _ap_perg    = '';
var _ap_n1 = 0, _ap_n2 = 0, _ap_emoji = '🍎', _ap_op = 'soma';
var _ap_timerBanner = null;

// ── Frases motivadoras (10 únicas) ───────────────────────────────
var _FRASES = [
    function(n){ return n+', respira fundo. Você consegue, eu acredito em você!'; },
    function(n){ return n+', dessa vez você vai acertar. Olha com atenção!'; },
    function(n){ return n+', olha os objetos na tela e conta um por um com calma.'; },
    function(n){ return n+', se tiver difícil, chame alguém para ajudar. Não desista!'; },
    function(n){ return n+', você já chegou até aqui. Isso mostra que você é capaz!'; },
    function(n){ return n+', você é mais inteligente do que imagina. Vai lá!'; },
    function(n){ return n+', tente ler a pergunta de novo. Você está quase lá!'; },
    function(n){ return n+', não existe errado, existe tentando. Continue!'; },
    function(n){ return n+', cada tentativa te deixa mais esperto. Você consegue!'; },
    function(n){ return n+', respira fundo, pensa com calma e escolhe. Você sabe!'; },
];

/**
 * Registrar erro — chamado pelo game.js a cada resposta errada.
 */
function registrarErroApoio(pergunta, n1, n2, emoji, operacao) {
    _ap_perg  = pergunta;
    _ap_n1    = n1 || 0;
    _ap_n2    = n2 || 0;
    _ap_emoji = emoji   || '🍎';
    _ap_op    = operacao|| 'soma';
    _ap_erros++;

    // Debounce: evita disparo duplo rápido
    var agora = Date.now();
    if (agora - _ap_ultimo < 2500) return;
    _ap_ultimo = agora;

    _disparar();
}

// ── Disparo do apoio ─────────────────────────────────────────────
function _disparar() {
    var nome  = localStorage.getItem('nomeJogador') || 'Amigo';
    var idx   = Math.min(_ap_erros - 1, _FRASES.length - 1);
    var frase = _FRASES[idx](nome);

    _ap_ativo = true;
    _mostrarBanner(frase);

    // ── SEQUÊNCIA DE VOZ ──────────────────────────────────────────
    // Usa falarSequencia: cada frase espera a anterior terminar.
    // NÃO usa setTimeout — a ordem é garantida pelo processador de fila.

    var seq = [];

    // 1. Frase motivadora
    seq.push({ txt: frase, tipo: 'dica' });

    if (_ap_erros >= 2) {
        // 2. Apresenta os objetos
        seq.push({ txt: 'Olha a tela! Eu coloquei objetos para te ajudar.', tipo: 'guia' });

        // 3. Explica os objetos conforme a operação
        if (_ap_op === 'soma') {
            seq.push({ txt: 'Veja o primeiro grupo: tem '+_ap_n1+' '+_ap_emoji+'. E o segundo grupo: tem '+_ap_n2+' '+_ap_emoji+'.', tipo: 'guia' });
            seq.push({ txt: 'Para somar, conta todos juntos: primeiro os '+_ap_n1+' do grupo azul, depois os '+_ap_n2+' do grupo verde.', tipo: 'guia' });
            seq.push({ txt: 'Vai contando em voz alta com o dedo: um, dois, três... até terminar os dois grupos!', tipo: 'guia' });

        } else if (_ap_op === 'subtracao') {
            seq.push({ txt: 'Olha! Tem '+_ap_n1+' '+_ap_emoji+' no total.', tipo: 'guia' });
            seq.push({ txt: 'Precisamos tirar '+_ap_n2+'. Os que ficaram com X em cima são os que vamos tirar.', tipo: 'guia' });
            seq.push({ txt: 'Conta só os que NÃO têm X. Esses são os que sobram!', tipo: 'guia' });

        } else { // divisão
            seq.push({ txt: 'Olha! Os '+_ap_emoji+' foram divididos em '+_ap_n2+' grupos iguais.', tipo: 'guia' });
            seq.push({ txt: 'Cada grupo tem a mesma quantidade de '+_ap_emoji+'.', tipo: 'guia' });
            seq.push({ txt: 'Conta quantos '+_ap_emoji+' tem em UM grupo só. Essa é a resposta!', tipo: 'guia' });
        }

        // 4. Encoraja nova tentativa
        seq.push({ txt: nome+', agora tente! Você já sabe!', tipo: 'dica' });

    } else {
        // Primeiro erro: só a frase + pergunta
        seq.push({ txt: 'Vamos tentar mais uma vez.', tipo: 'neutro' });
    }

    // 5. Repete a pergunta ao final
    seq.push({ txt: _ap_perg, tipo: 'neutro' });

    // Enfileira tudo de uma vez — nunca se cortam entre si
    if (typeof falarSequencia === 'function') {
        falarSequencia(seq);
    }

    // Libera flag após tempo suficiente para toda a sequência
    clearTimeout(_ap_timerBanner);
    _ap_timerBanner = setTimeout(function(){ _ap_ativo = false; }, 18000);
}

// ── Banner visual ────────────────────────────────────────────────
function _mostrarBanner(frase) {
    document.querySelectorAll('.apoio-banner').forEach(function(e){ e.remove(); });

    var emojis = ['💙','🌟','💪','🤗','🌈','⭐','🎯','🚀','💎','🏆'];
    var ic = emojis[Math.min(_ap_erros - 1, emojis.length - 1)];
    var el = document.createElement('div');
    el.className = 'apoio-banner';
    el.innerHTML =
        '<div class="ab-inner">'+
            '<span class="ab-icone">'+ic+'</span>'+
            '<div class="ab-txt">'+
                '<span class="ab-tent">Tentativa '+_ap_erros+'</span>'+
                '<span class="ab-frase">'+frase+'</span>'+
            '</div>'+
        '</div>'+
        '<div class="ab-barra"></div>';

    document.body.appendChild(el);
    requestAnimationFrame(function(){
        requestAnimationFrame(function(){ el.classList.add('apoio-visivel'); });
    });

    var dur = _ap_erros >= 2 ? 15000 : 7000;
    setTimeout(function(){
        el.classList.add('apoio-saindo');
        setTimeout(function(){ if (el.parentNode) el.remove(); }, 500);
    }, dur);
}

// ── Objetos pedagógicos (chamado pelo game.js) ───────────────────
// O game.js já renderiza os objetos via renderizarObjetos(true).
// Esta função adiciona o painel de instrução escrita acima da área.
function _mostrarPainelInstrucao(n1, n2, emoji, op) {
    document.querySelectorAll('#apoio-painel').forEach(function(e){ e.remove(); });

    var area = document.getElementById('area-ajuda-visual');
    if (!area) return;

    var texto = '';
    if (op === 'soma') {
        texto = '👆 Conta o grupo <b style="color:#4F46E5">azul</b> ('+n1+') + grupo <b style="color:#10B981">verde</b> ('+n2+') = ?';
    } else if (op === 'subtracao') {
        texto = '👆 Tem <b style="color:#F59E0B">'+n1+'</b> '+emoji+'. Tira os <b style="color:#EF4444">marcados</b>. Quantos sobram?';
    } else {
        texto = '👆 Os '+emoji+' foram divididos em <b style="color:#EC4899">'+n2+' grupos iguais</b>. Conta um grupo só!';
    }

    var painel = document.createElement('div');
    painel.id = 'apoio-painel';
    painel.className = 'apoio-painel-instrucao';
    painel.innerHTML = texto;

    // Insere ANTES da área de ajuda
    area.parentNode.insertBefore(painel, area);

    // Animação de entrada
    requestAnimationFrame(function(){
        requestAnimationFrame(function(){ painel.classList.add('apoio-painel-visivel'); });
    });
}

/**
 * resetarApoio — chamado pelo game.js ao acertar ou mudar de questão
 */
function resetarApoio() {
    _ap_erros  = 0;
    _ap_ativo  = false;
    clearTimeout(_ap_timerBanner);
    document.querySelectorAll('.apoio-banner, #apoio-painel').forEach(function(e){ e.remove(); });
    var area = document.getElementById('area-ajuda-visual');
    if (area) area.classList.remove('area-ajuda-destaque');
}

// ── Estilos ───────────────────────────────────────────────────────
(function(){
    var s = document.createElement('style');
    s.textContent = [
        /* Banner */
        '.apoio-banner{',
            'position:fixed;bottom:-160px;left:50%;transform:translateX(-50%);',
            'z-index:99998;width:min(400px,96vw);',
            'background:linear-gradient(135deg,#1e3a5f,#0f2d4a);',
            'border:2px solid rgba(100,180,255,0.35);',
            'border-radius:22px;padding:14px 16px;overflow:hidden;',
            'box-shadow:0 -4px 40px rgba(0,80,200,0.18),0 20px 60px rgba(0,0,0,0.5);',
            'transition:bottom 0.5s cubic-bezier(0.175,0.885,0.32,1.275);',
        '}',
        '.apoio-banner.apoio-visivel{bottom:14px;}',
        '.apoio-banner.apoio-saindo{bottom:-160px;transition:bottom 0.4s ease-in;}',

        '.ab-inner{display:flex;align-items:flex-start;gap:12px;position:relative;z-index:1;}',
        '.ab-icone{font-size:2.8rem;flex-shrink:0;',
            'animation:abIconIn .4s cubic-bezier(.175,.885,.32,1.5);',
            'filter:drop-shadow(0 0 10px rgba(100,200,255,0.55));}',
        '@keyframes abIconIn{from{transform:scale(0) rotate(-25deg)}to{transform:scale(1)}}',
        '.ab-txt{display:flex;flex-direction:column;gap:3px;}',
        '.ab-tent{font-size:0.68rem;font-weight:900;color:#60a5fa;text-transform:uppercase;letter-spacing:1.2px;}',
        '.ab-frase{font-size:0.96rem;font-weight:700;color:#e2e8f0;line-height:1.46;}',

        '.ab-barra{position:absolute;bottom:0;left:0;height:3px;width:100%;',
            'background:linear-gradient(90deg,#60a5fa,#a78bfa,#f472b6);',
            'transform-origin:left;animation:abBar var(--dur,9s) linear forwards;}',
        '@keyframes abBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}',

        /* Painel de instrução acima dos objetos */
        '.apoio-painel-instrucao{',
            'margin:0 4px 4px;',
            'background:linear-gradient(135deg,rgba(79,70,229,0.10),rgba(124,58,237,0.08));',
            'border:1.5px solid rgba(79,70,229,0.22);',
            'border-radius:14px;padding:7px 12px;',
            'font-size:clamp(0.80rem,2.6vw,0.96rem);font-weight:800;',
            'color:#3730a3;text-align:center;line-height:1.45;',
            'opacity:0;transform:translateY(-6px);',
            'transition:all 0.4s cubic-bezier(.175,.885,.32,1.275);',
            'flex-shrink:0;',
        '}',
        '.apoio-painel-instrucao.apoio-painel-visivel{opacity:1;transform:translateY(0);}',

        /* Destaque da área de objetos */
        '.area-ajuda-destaque{',
            'background:rgba(245,158,11,0.07);',
            'border:1.5px solid rgba(245,158,11,0.3);',
            'border-radius:16px;',
            'animation:aGlow 0.7s ease-in-out 3;',
        '}',
        '@keyframes aGlow{0%,100%{box-shadow:none}50%{box-shadow:0 0 20px rgba(245,158,11,0.4)}}',
    ].join('');
    document.head.appendChild(s);
})();
