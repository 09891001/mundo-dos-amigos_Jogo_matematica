/**
 * MUNDO DOS AMIGOS — CONQUISTAS (V3.0.0 DEFINITIVO)
 */
const TODAS_CONQUISTAS = [
    {id:'primeiro_acerto', icone:'⭐',titulo:'Primeira Estrela',  desc:'Acertou pela primeira vez!',          cond:s=>s.totalAcertos>=1},
    {id:'combo_3',         icone:'🔥',titulo:'Em Chamas!',        desc:'3 acertos seguidos!',                 cond:s=>s.combo>=3},
    {id:'combo_5',         icone:'💥',titulo:'Combo x5',          desc:'5 acertos seguidos! Incrível!',       cond:s=>s.combo>=5},
    {id:'combo_10',        icone:'🌟',titulo:'Imbatível',         desc:'10 acertos seguidos! Você é top!',    cond:s=>s.combo>=10},
    {id:'fase_5',          icone:'🚀',titulo:'Decolando!',        desc:'Chegou na fase 5!',                   cond:s=>s.fase>=5},
    {id:'fase_10',         icone:'🏅',titulo:'Persistente',       desc:'Chegou na fase 10!',                  cond:s=>s.fase>=10},
    {id:'fase_20',         icone:'🥇',titulo:'Campeão',           desc:'Chegou na fase 20!',                  cond:s=>s.fase>=20},
    {id:'pontos_50',       icone:'💎',titulo:'50 Pontos!',        desc:'Acumulou 50 pontos!',                 cond:s=>s.score>=50},
    {id:'pontos_150',      icone:'👑',titulo:'150 Pontos!',       desc:'150 pontos! Sensacional!',            cond:s=>s.score>=150},
    {id:'pontos_300',      icone:'🌈',titulo:'300 Pontos!',       desc:'300 pontos! Lenda!',                  cond:s=>s.score>=300},
    {id:'sem_erro_10',     icone:'🎯',titulo:'Perfeito!',         desc:'10 acertos sem errar!',               cond:s=>s.acertosSemErro>=10},
    {id:'velocidade',      icone:'⚡',titulo:'Veloz!',            desc:'Respondeu em menos de 3 segundos!',   cond:s=>s.tempoResposta<3},
    {id:'divisao_mestre',  icone:'🧮',titulo:'Mestre da Divisão', desc:'5 divisões seguidas!',                cond:s=>s.divisoesSeguidas>=5},
    {id:'completo',        icone:'🎓',titulo:'Formado!',          desc:'Completou todas as 30 fases!',        cond:s=>s.fase>=30},
];

let _desbl = new Set(JSON.parse(localStorage.getItem('conquistas')||'[]'));
let _fila  = [], _show = false;

function verificarConquistas(st) {
    TODAS_CONQUISTAS.forEach(c => {
        if (_desbl.has(c.id)) return;
        if (c.cond(st)) {
            _desbl.add(c.id);
            localStorage.setItem('conquistas', JSON.stringify([..._desbl]));
            _fila.push(c); _next();
        }
    });
}

function _next() {
    if (_show || !_fila.length) return;
    _show = true; _render(_fila.shift());
}

function _render(c) {
    if (typeof tocarSomConquista === 'function') tocarSomConquista();
    setTimeout(() => { if(typeof falar==='function') falar('Conquista desbloqueada: '+c.titulo+'! '+c.desc,'festa'); }, 200);

    const el = document.createElement('div');
    el.className = 'cq-popup';
    el.innerHTML = `
        <div class="cq-shimmer"></div>
        <div class="cq-body">
            <div class="cq-icon-wrap"><span class="cq-icon">${c.icone}</span></div>
            <div class="cq-info">
                <span class="cq-label">🏆 CONQUISTA DESBLOQUEADA</span>
                <span class="cq-title">${c.titulo}</span>
                <span class="cq-desc">${c.desc}</span>
            </div>
        </div>
        <div class="cq-prog"></div>`;
    document.body.appendChild(el);

    // Partículas
    const cs=['#FFD700','#FF6B6B','#4ECDC4','#A29BFE','#FD79A8'];
    for(let i=0;i<16;i++){
        const p=document.createElement('div'); p.className='cq-pt';
        const a=Math.random()*360, d=45+Math.random()*55;
        p.style.cssText=`left:${10+Math.random()*80}%;top:${10+Math.random()*80}%;background:${cs[i%cs.length]};--tx:${Math.cos(a*Math.PI/180)*d}px;--ty:${Math.sin(a*Math.PI/180)*d}px;animation-delay:${Math.random()*0.25}s;`;
        el.appendChild(p);
    }

    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('cq-in')));
    setTimeout(()=>{ el.classList.add('cq-out'); setTimeout(()=>{el.remove();_show=false;_next();},500); },4200);
}

function totalConquistas() { return _desbl.size; }

// Combo badge
let _cb=null, _ct=null;
function mostrarComboBadge(n) {
    if (n<2) return;
    if (!_cb) { _cb=document.createElement('div');_cb.className='combo-badge';document.body.appendChild(_cb); }
    clearTimeout(_ct);
    _cb.className='combo-badge';
    _cb.textContent = n>=10?`🌟 COMBO x${n}!!`:n>=5?`💥 COMBO x${n}!`:`🔥 ${n}x seguidos!`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>_cb.classList.add('combo-on')));
    _ct = setTimeout(()=>{ _cb.classList.remove('combo-on'); }, 1800);
}

(function(){
    const s=document.createElement('style');
    s.textContent=`
.cq-popup{position:fixed;top:14px;right:-420px;z-index:99999;width:min(360px,93vw);
  background:linear-gradient(135deg,#0d1b2a,#1a2744);
  border:1.5px solid rgba(255,215,0,.5);border-radius:22px;padding:14px 16px;
  box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(255,215,0,.12);
  transition:right .55s cubic-bezier(.175,.885,.32,1.275);overflow:hidden;}
.cq-popup.cq-in{right:12px;}.cq-popup.cq-out{right:-420px;transition:right .4s ease-in;}
.cq-shimmer{position:absolute;inset:0;border-radius:22px;background:linear-gradient(105deg,transparent 40%,rgba(255,215,0,.07) 50%,transparent 60%);animation:cqShim 2s linear infinite;}
@keyframes cqShim{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.cq-body{display:flex;align-items:center;gap:14px;position:relative;z-index:1;}
.cq-icon-wrap{width:52px;height:52px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle,rgba(255,215,0,.2),transparent);display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(255,215,0,.3);}
.cq-icon{font-size:2.2rem;animation:cqIconIn .5s cubic-bezier(.175,.885,.32,1.5);}
@keyframes cqIconIn{from{transform:scale(0) rotate(-30deg)}to{transform:scale(1) rotate(0)}}
.cq-info{display:flex;flex-direction:column;gap:2px;}
.cq-label{font-size:.65rem;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:1.5px;}
.cq-title{font-size:1.05rem;font-weight:800;color:#f8fafc;}
.cq-desc{font-size:.78rem;color:rgba(255,255,255,.65);line-height:1.3;}
.cq-prog{position:absolute;bottom:0;left:0;height:3px;width:100%;background:linear-gradient(90deg,#FFD700,#FF6B6B,#A29BFE);animation:cqProg 4.2s linear forwards;transform-origin:left;}
@keyframes cqProg{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.cq-pt{position:absolute;width:7px;height:7px;border-radius:50%;pointer-events:none;opacity:0;animation:cqPt .9s ease-out forwards;}
@keyframes cqPt{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}
.combo-badge{position:fixed;bottom:108px;left:50%;transform:translateX(-50%) scale(0);
  background:linear-gradient(135deg,#FF6B6B,#FE7F2D);color:white;font-size:1.2rem;font-weight:900;
  padding:10px 26px;border-radius:30px;z-index:9998;pointer-events:none;
  box-shadow:0 10px 28px rgba(255,107,107,.4);transition:transform .35s cubic-bezier(.175,.885,.32,1.4);}
.combo-badge.combo-on{transform:translateX(-50%) scale(1);}
    `;
    document.head.appendChild(s);
})();
