/**
 * MUNDO DOS AMIGOS — CONQUISTAS (V2.0.0 ULTRA)
 */
const TODAS_CONQUISTAS = [
    {id:'primeiro_acerto', icone:'⭐',titulo:'Primeira Estrela',  desc:'Acertou pela primeira vez!',          cond:s=>s.totalAcertos>=1},
    {id:'combo_3',         icone:'🔥',titulo:'Em Chamas!',        desc:'3 acertos seguidos!',                 cond:s=>s.combo>=3},
    {id:'combo_5',         icone:'💥',titulo:'Combo x5',          desc:'5 acertos seguidos! Incrível!',       cond:s=>s.combo>=5},
    {id:'combo_10',        icone:'🌟',titulo:'Imbatível',         desc:'10 acertos seguidos! Você é top!',    cond:s=>s.combo>=10},
    {id:'fase_5',          icone:'🚀',titulo:'Decolando!',        desc:'Chegou na fase 5!',                   cond:s=>s.fase>=5},
    {id:'fase_10',         icone:'🏅',titulo:'Persistente',       desc:'Chegou na fase 10!',                  cond:s=>s.fase>=10},
    {id:'fase_20',         icone:'🥇',titulo:'Campeão',           desc:'Chegou na fase 20! Quase lá!',        cond:s=>s.fase>=20},
    {id:'pontos_50',       icone:'💎',titulo:'50 Pontos!',        desc:'Acumulou 50 pontos!',                 cond:s=>s.score>=50},
    {id:'pontos_150',      icone:'👑',titulo:'150 Pontos!',       desc:'150 pontos! Sensacional!',            cond:s=>s.score>=150},
    {id:'pontos_300',      icone:'🌈',titulo:'300 Pontos!',       desc:'300 pontos! Lenda absoluta!',         cond:s=>s.score>=300},
    {id:'sem_erro_10',     icone:'🎯',titulo:'Perfeito!',         desc:'10 acertos sem nenhum erro!',         cond:s=>s.acertosSemErro>=10},
    {id:'velocidade',      icone:'⚡',titulo:'Veloz!',            desc:'Respondeu em menos de 3 segundos!',   cond:s=>s.tempoResposta<3},
    {id:'divisao_mestre',  icone:'🧮',titulo:'Mestre da Divisão', desc:'5 divisões seguidas!',                cond:s=>s.divisoesSeguidas>=5},
    {id:'completo',        icone:'🎓',titulo:'Formado!',          desc:'Completou todas as 30 fases!',        cond:s=>s.fase>=30},
];

let _desbloqueadas = new Set(JSON.parse(localStorage.getItem('conquistas')||'[]'));
let _fila=[],_mostrando=false;

function verificarConquistas(estado){
    TODAS_CONQUISTAS.forEach(c=>{
        if(_desbloqueadas.has(c.id))return;
        if(c.cond(estado)){
            _desbloqueadas.add(c.id);
            localStorage.setItem('conquistas',JSON.stringify([..._desbloqueadas]));
            _fila.push(c);_exibirFila();
        }
    });
}
function _exibirFila(){if(_mostrando||_fila.length===0)return;_mostrando=true;_mostrarConquista(_fila.shift());}
function _mostrarConquista(c){
    if(typeof tocarSomConquista==='function')tocarSomConquista();
    setTimeout(()=>{if(typeof falar==='function')falar('Conquista desbloqueada: '+c.titulo+'! '+c.desc,'festa');},300);
    const el=document.createElement('div');
    el.className='conquista-popup';
    el.innerHTML=`<div class="conquista-shimmer"></div><div class="conquista-inner"><div class="conquista-icone-wrap"><span class="conquista-icone">${c.icone}</span></div><div class="conquista-info"><span class="conquista-label">🏆 CONQUISTA DESBLOQUEADA</span><span class="conquista-titulo">${c.titulo}</span><span class="conquista-desc">${c.desc}</span></div></div><div class="conquista-progress"></div>`;
    document.body.appendChild(el);
    _lancarParticulas(el);
    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('conquista-visivel')));
    setTimeout(()=>{el.classList.add('conquista-saindo');setTimeout(()=>{el.remove();_mostrando=false;_exibirFila();},500);},4000);
}
function _lancarParticulas(pai){
    const cores=['#FFD700','#FF6B6B','#4ECDC4','#A29BFE','#FD79A8','#FFEAA7'];
    for(let i=0;i<18;i++){
        const p=document.createElement('div');p.className='conquista-particula';
        const ang=Math.random()*360,dist=40+Math.random()*60;
        p.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;background:${cores[i%cores.length]};--tx:${Math.cos(ang*Math.PI/180)*dist}px;--ty:${Math.sin(ang*Math.PI/180)*dist}px;animation-delay:${Math.random()*0.3}s;`;
        pai.appendChild(p);
    }
}
function totalConquistas(){return _desbloqueadas.size;}

let _cbEl=null,_cbT=null;
function mostrarComboBadge(combo){
    if(combo<2)return;
    if(!_cbEl){_cbEl=document.createElement('div');_cbEl.className='combo-badge';document.body.appendChild(_cbEl);}
    clearTimeout(_cbT);
    _cbEl.className='combo-badge';
    _cbEl.textContent=combo>=10?`🌟 COMBO x${combo}!!`:combo>=5?`💥 COMBO x${combo}!`:`🔥 COMBO x${combo}`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>_cbEl.classList.add('combo-visivel')));
    _cbT=setTimeout(()=>{_cbEl.classList.remove('combo-visivel');},1600);
}

(function(){
    const s=document.createElement('style');
    s.textContent=`
.conquista-popup{position:fixed;top:16px;right:-420px;z-index:99999;width:min(360px,92vw);background:linear-gradient(135deg,#0d1b2a,#1a2744,#0d1b2a);border:1.5px solid rgba(255,215,0,.5);border-radius:22px;padding:14px 16px;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(255,215,0,.15);transition:right .55s cubic-bezier(.175,.885,.32,1.275);overflow:hidden;}
.conquista-popup.conquista-visivel{right:12px;}.conquista-popup.conquista-saindo{right:-420px;transition:right .4s ease-in;}
.conquista-shimmer{position:absolute;inset:0;border-radius:22px;background:linear-gradient(105deg,transparent 40%,rgba(255,215,0,.08) 50%,transparent 60%);animation:shimmerPass 2s linear infinite;}
@keyframes shimmerPass{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.conquista-inner{display:flex;align-items:center;gap:14px;position:relative;z-index:1;}
.conquista-icone-wrap{width:52px;height:52px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle,rgba(255,215,0,.2),transparent);display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(255,215,0,.3);}
.conquista-icone{font-size:2.2rem;animation:iconeEntrada .5s cubic-bezier(.175,.885,.32,1.5);}
@keyframes iconeEntrada{from{transform:scale(0) rotate(-30deg)}to{transform:scale(1) rotate(0)}}
.conquista-info{display:flex;flex-direction:column;gap:2px;}
.conquista-label{font-size:.68rem;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:1.5px;}
.conquista-titulo{font-size:1.05rem;font-weight:800;color:#f8fafc;}
.conquista-desc{font-size:.8rem;color:rgba(255,255,255,.65);line-height:1.3;}
.conquista-progress{position:absolute;bottom:0;left:0;height:3px;width:100%;background:linear-gradient(90deg,#FFD700,#FF6B6B,#A29BFE);animation:progressBar 4s linear forwards;transform-origin:left;}
@keyframes progressBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.conquista-particula{position:absolute;width:7px;height:7px;border-radius:50%;pointer-events:none;opacity:0;animation:pExp .9s ease-out forwards;}
@keyframes pExp{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0;}}
.combo-badge{position:fixed;bottom:110px;left:50%;transform:translateX(-50%) scale(0);background:linear-gradient(135deg,#FF6B6B,#FE7F2D);color:white;font-size:1.25rem;font-weight:900;padding:11px 28px;border-radius:32px;z-index:9998;pointer-events:none;box-shadow:0 10px 30px rgba(255,107,107,.45);transition:transform .35s cubic-bezier(.175,.885,.32,1.4);}
.combo-badge.combo-visivel{transform:translateX(-50%) scale(1);}
`;document.head.appendChild(s);
})();
