(()=>{
const {esc,fmt,btn}=B;
B.acts.param=(s,a)=>{const[k,v]=JSON.parse(a);s.set(s=>s.p[k]=v)};
B.parts.knobs=(el,o,s,i)=>{
  el.innerHTML=o.items.map((k,j)=>{
    const lab=`<span>${esc(k.label??k.p)}</span>`;
    if(k.options)return `<div class="bk-k" role="group" aria-label="${esc(k.label??k.p)}">${lab}<span class="bk-seg">${k.options.map((v,n)=>
      `<span ${btn('param',JSON.stringify([k.p,v]),i+'k'+j+'o'+n,'role="button"')}>${esc((k.names&&k.names[v])||v)}</span>`).join('')}</span></div>`;
    if(k.toggle)return `<label class="bk-k">${lab}<input type="checkbox" data-j="${j}"></label>`;
    return `<label class="bk-k">${lab}<input type="range" data-j="${j}" min="${k.min??0}" max="${k.max??100}" step="${k.step??1}"><output></output></label>`}).join('')+
    `<span class="bk-link" ${btn('reset','',i+'r','role="button"')} hidden>Reset</span>`;
  const rows=[...el.children].slice(0,-1),reset=el.lastChild;
  el.querySelectorAll('input').forEach(n=>{const k=o.items[n.dataset.j];
    n.oninput=()=>s.set(s=>s.p[k.p]=k.toggle?n.checked:+n.value)});
  return s=>{
    o.items.forEach((k,j)=>{const v=s.p[k.p],n=rows[j].querySelector('input');
      if(k.options)rows[j].querySelectorAll('[data-do]').forEach((b,x)=>b.setAttribute('aria-pressed',k.options[x]===v));
      else if(k.toggle)n.checked=!!v;
      else{if(+n.value!==v)n.value=v;rows[j].querySelector('output').innerHTML=fmt(v,k.fmt)+(v!==s.p0[k.p]?` <small>was ${fmt(s.p0[k.p],k.fmt)}</small>`:'')}});
    reset.hidden=!s.changed;
  };
};
B.css+=`
.bk-knobs{display:grid;gap:10px}
.bk-k{display:grid;grid-template-columns:minmax(90px,max-content) minmax(0,1fr) minmax(90px,max-content);gap:12px;align-items:center}
.bk-k>span:first-child{color:var(--text-secondary)}
.bk-k output{font-variant-numeric:tabular-nums;font-weight:500}
.bk-k output small{font-weight:400}
.bk-k input[type=checkbox]{justify-self:start}
.bk-seg{display:inline-flex;justify-self:start;gap:2px;padding:2px;border:1px solid var(--border-strong);border-radius:8px}
.bk-seg span{padding:3px 12px;border-radius:6px;font-size:13px;color:var(--text-secondary);user-select:none}
.bk-seg span[aria-pressed=true]{background:var(--text-primary);color:var(--surface-2)}
.bk-knobs [hidden]{display:none}
`;
})();
