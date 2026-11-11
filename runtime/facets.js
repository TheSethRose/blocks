(()=>{
const {esc,btn,icon}=B;
B.parts.facets=(el,o,s,i)=>{
  const fs=[].concat(o.fields||[]),cap=k=>(o.labels&&o.labels[k])||k[0].toUpperCase()+k.slice(1);
  el.innerHTML=(o.search?`<input type="search" placeholder="${esc(o.search===true?'Filter':o.search)}" aria-label="Filter rows">`:'')+'<div></div>';
  const inp=el.querySelector('input'),box=el.lastChild,norm=()=>inp.value.trim().toLowerCase();
  if(inp)inp.oninput=()=>s.set(s=>s.q=norm());
  return s=>{
    if(inp&&norm()!==s.q)inp.value=s.q;
    const any=s.q||Object.values(s.f).some(t=>t.size);
    box.innerHTML=fs.map(k=>{
      const own=s.without(k),on=s.f[k]||new Set,vals=[...new Set(s.all.map(r=>r[k]).filter(v=>v!=null).map(String))];
      return `<div class="bk-chips" role="group" aria-label="${esc(cap(k))}"><small>${esc(cap(k))}</small>`+vals.map(v=>{
        const n=own.filter(r=>String(r[k])===v).length;
        return `<span class="bk-chip${n?'':' zero'}" ${btn('filter',JSON.stringify([k,v]),i+'f'+k+v,`role="button" aria-pressed="${on.has(v)}"`)}>${k=='tone'?icon({tone:v}):''}${esc((o.names&&o.names[v])||v)} <b>${n}</b></span>`}).join('')+'</div>'}).join('')+
      (any?`<span class="bk-link" ${btn('clear','',i+'x','role="button"')}>Clear</span>`:'');
  };
};
B.css+=`
.bk-facets,.bk-facets>div{display:grid;gap:8px}
.bk-facets input{width:100%;box-sizing:border-box}
.bk-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.bk-chips>small{min-width:64px}
.bk-chip{padding:3px 10px;border:1px solid var(--border-strong);border-radius:999px;font-size:13px;color:var(--text-secondary);user-select:none}
.bk-chip b{font-weight:400;font-variant-numeric:tabular-nums;color:var(--text-muted)}
.bk-chip[aria-pressed=true]{background:var(--text-primary);border-color:var(--text-primary);color:var(--surface-2)}
.bk-chip[aria-pressed=true] b,.bk .bk-chip[aria-pressed=true] .ti{color:var(--surface-2)}
.bk-chip.zero{border-style:dashed}
.bk .bk-chip .ti{font-size:14px;margin-right:4px}
`;
})();
