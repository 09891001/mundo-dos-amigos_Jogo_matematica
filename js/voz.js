/**
 * MUNDO DOS AMIGOS — VOZ (V6.0.0 FINAL)
 *
 * REGRA CENTRAL:
 *  • Falas do sistema (apoio, pergunta, objetos) NÃO se cortam entre si.
 *  • Só uma ação real do JOGADOR (toque) interrompe a fala atual.
 *  • falarSequencia() garante narração completa em ordem.
 *  • falarPrioritario() é chamado APENAS quando o jogador toca algo.
 *
 * COMPATIBILIDADE:
 *  ✅ iOS Safari: handshake silencioso após 1ª interação
 *  ✅ Android Chrome: onvoiceschanged + desbloqueio automático
 *  ✅ Offline: 100% Web Speech API — zero dependência de rede
 *  ✅ Guardião anti-travamento: avança se onend não disparar
 */
(function(g) {
    'use strict';

    var _ok      = false;   // voz desbloqueada
    var _ativo   = false;   // falando agora
    var _fila    = [];      // [{txt,tipo,cb}]
    var _guard   = null;
    var _cortadoPorJogador = false;

    // Detecta leitor de tela (VoiceOver, TalkBack etc.)
    function _leitor() {
        return /VoiceOver|TalkBack|NVDA|JAWS/i.test(navigator.userAgent);
    }

    // Escolhe a melhor voz pt-BR disponível
    function _voz(msg) {
        if (!window.speechSynthesis) return;
        var vs = window.speechSynthesis.getVoices();
        var v  = vs.find(function(x){ return x.lang === 'pt-BR'; })
              || vs.find(function(x){ return x.lang.indexOf('pt') === 0; })
              || vs[0];
        if (v) msg.voice = v;
    }

    // Entonações por tipo de fala
    var _cfg = {
        festa:  { pitch:1.35, rate:0.96, vol:1.0  },
        dica:   { pitch:1.05, rate:0.78, vol:0.96 },
        guia:   { pitch:1.08, rate:0.73, vol:0.97 }, // narração de objetos — bem pausado
        alerta: { pitch:0.90, rate:0.82, vol:1.0  },
        neutro: { pitch:1.10, rate:0.90, vol:1.0  },
    };

    // ── DESBLOQUEIO iOS ─────────────────────────────────────────
    function _desbloquear() {
        if (_ok || !('speechSynthesis' in window)) { _ok = true; return; }
        var s = window.speechSynthesis;
        function hs() {
            s.cancel();
            var vs = s.getVoices();
            if (!vs.length) { setTimeout(hs, 150); return; }
            var m = new SpeechSynthesisUtterance('\u00A0');
            m.volume = 0; m.rate = 2;
            m.onend  = function(){ _ok = true; _proc(); };
            m.onerror= function(){ _ok = true; _proc(); };
            s.speak(m);
        }
        hs();
    }
    ['pointerdown','touchstart','click'].forEach(function(ev){
        document.addEventListener(ev, _desbloquear, { once: true });
    });
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = function(){
            if (!_ok) _desbloquear();
        };
    }

    // ── PROCESSADOR DA FILA ──────────────────────────────────────
    function _proc() {
        if (_ativo || !_fila.length || !_ok) return;

        var s = window.speechSynthesis;
        // Safari "fantasma" — força reset
        if (s.speaking && !_ativo) { s.cancel(); setTimeout(_proc, 120); return; }

        var item = _fila.shift();
        if (!item || !item.txt) { setTimeout(_proc, 50); return; }

        var msg   = new SpeechSynthesisUtterance(item.txt);
        msg.lang  = 'pt-BR';
        _voz(msg);

        var c     = _cfg[item.tipo] || _cfg.neutro;
        msg.pitch = c.pitch; msg.rate = c.rate; msg.volume = c.vol;

        _ativo = true;
        _cortadoPorJogador = false;

        // Guardião: se onend não disparar em tempo estimado + folga, avança
        var est = Math.max(1800, item.txt.length * 70);
        _guard = setTimeout(function(){
            if (_ativo) {
                _ativo = false;
                if (item.cb) item.cb();
                setTimeout(_proc, 100);
            }
        }, est + 500);

        msg.onend = function() {
            clearTimeout(_guard);
            _ativo = false;
            if (item.cb) item.cb();
            setTimeout(_proc, 170); // pausa natural entre frases
        };

        msg.onerror = function(ev) {
            clearTimeout(_guard);
            _ativo = false;
            var ignorar = (ev.error === 'interrupted' || ev.error === 'canceled');
            if (ignorar && _cortadoPorJogador) {
                _fila = []; // limpa fila ao ser interrompido pelo jogador
                return;
            }
            setTimeout(_proc, 150);
        };

        try { s.speak(msg); } catch(e) {
            clearTimeout(_guard);
            _ativo = false;
            setTimeout(_proc, 150);
        }
    }

    // ══════════════════════════════════════════════════════════
    // API PÚBLICA
    // ══════════════════════════════════════════════════════════

    /**
     * falar(txt, tipo, cb)
     * Enfileira normalmente. Não interrompe o que está sendo dito.
     * Use para falas avulsas que podem esperar.
     */
    function falar(txt, tipo, cb) {
        if (!txt || _leitor()) { if (cb) cb(); return; }
        _fila.push({ txt: String(txt), tipo: tipo || 'neutro', cb: cb || null });
        _proc();
    }

    /**
     * falarSequencia(itens)
     * Enfileira um BLOCO de frases que devem ser ditas em sequência.
     * Nenhuma corta a outra — cada uma espera a anterior terminar.
     * itens: [{txt:'...', tipo:'guia'}, ...]
     */
    function falarSequencia(itens) {
        if (!itens || !itens.length || _leitor()) return;
        itens.forEach(function(it) {
            if (it && it.txt) {
                _fila.push({ txt: String(it.txt), tipo: it.tipo || 'neutro', cb: null });
            }
        });
        _proc();
    }

    /**
     * falarPrioritario(txt, tipo)
     * INTERROMPE a fala atual e limpa a fila.
     * Deve ser chamado APENAS por ações do jogador (toque em botão).
     */
    function falarPrioritario(txt, tipo) {
        if (!txt || _leitor()) return;
        _cortadoPorJogador = true;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        clearTimeout(_guard);
        _fila  = [];
        _ativo = false;
        setTimeout(function(){
            _fila.push({ txt: String(txt), tipo: tipo || 'neutro', cb: null });
            _proc();
        }, 60);
    }

    /**
     * falarSeguro(txt, tipo, cb)
     * Aguarda o desbloqueio se necessário. Não interrompe.
     */
    function falarSeguro(txt, tipo, cb) {
        if (!_ok) { setTimeout(function(){ falarSeguro(txt, tipo, cb); }, 300); return; }
        falar(txt, tipo, cb);
    }

    /**
     * pararVoz()
     * Para tudo imediatamente. Usado ao sair da tela.
     */
    function pararVoz() {
        _cortadoPorJogador = true;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        clearTimeout(_guard);
        _fila  = [];
        _ativo = false;
    }

    // liberarVoz: alias para compatibilidade
    function liberarVoz() { _desbloquear(); }

    // Helpers legados
    function narrar(t)      { falar(t, 'neutro'); }
    function narrarAcerto() {
        falarPrioritario((localStorage.getItem('nomeJogador')||'Amigo')+', você acertou!', 'festa');
    }
    function narrarErro() {
        falarPrioritario((localStorage.getItem('nomeJogador')||'Amigo')+', tente de novo.', 'dica');
    }

    // Expõe no escopo global
    g.falar            = falar;
    g.falarSequencia   = falarSequencia;
    g.falarPrioritario = falarPrioritario;
    g.falarSeguro      = falarSeguro;
    g.pararVoz         = pararVoz;
    g.liberarVoz       = liberarVoz;
    g.narrar           = narrar;
    g.narrarAcerto     = narrarAcerto;
    g.narrarErro       = narrarErro;

})(window);
