(()=>{
const {esc,fmt,val,icon,btn,none}=B;
B.parts.cards=(el,o,s,i)=>s=>{
  const bf=o.best&&o.best.replace(/^-/,''),sign=o.best&&o.best[0]=='-'?-1:1;
  const top=bf&&s.rows.length>1?s.rows.reduce((a,r)=>r[bf]*sign>a[bf]*sign?r:a):null;
  el.innerHTML=s.rows.length?s.rows.map(r=>{const on=o.pick?s.pick.has(r.id):s.focus===r.id;
    return `<div data-id="${esc(r.id)}" class="bk-c${on?' on':''}" ${btn(o.pick?'pick':'focus',r.id,i+'c'+r.id,`role="button" aria-pressed="${on}"`)}><header>${
      icon(r)}<b>${esc(o.title?val(r,o.title):s.name(r))}</b>${top&&top.id===r.id?`<mark>${esc(o.bestLabel||'Best')}</mark>`:''}</header>${
      (o.lines||[]).map(l=>`<div><small>${esc(l.label??l.f)}</small><span>${fmt(val(r,l.f),l.fmt)}</span></div>`).join('')}</div>`}).join(''):none();
};
B.css+=`
.bk-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.bk-c{display:grid;gap:6px;align-content:start;padding:14px 16px;border:1px solid var(--border-strong);border-radius:12px;min-width:0}
.bk .bk-c.on{background:none;border-color:var(--border-accent);box-shadow:inset 0 0 0 1px var(--border-accent)}
.bk-c header{display:flex;gap:6px;align-items:center;margin-bottom:2px}
.bk-c header b{flex:1;font-weight:500;min-width:0}
.bk-c mark{padding:2px 8px;border-radius:999px;font-size:11px;background:var(--bg-accent);color:var(--text-accent)}
.bk-c>div{display:flex;justify-content:space-between;gap:12px}
.bk-c>div span{font-variant-numeric:tabular-nums;text-align:right}
.bk .bk-c header .ti{margin:0}
`;
})();
