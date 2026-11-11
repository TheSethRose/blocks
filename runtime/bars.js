(()=>{
const {esc,fmt,val,btn,none,agg}=B;
B.parts.bars=(el,o,s,i)=>s=>{
  const how=o.agg||(o.of?'sum':'count'),A=rows=>agg(rows,o.of,how,s),by=o.by;
  let items;
  if(by){const on=s.f[by]||new Set,own=s.without(by),is=k=>r=>String(r[by])===k;
    items=[...new Set(s.all.map(r=>r[by]).filter(v=>v!=null).map(String))].map(k=>({k,label:(o.names&&o.names[k])||k,
      v:A(own.filter(is(k))),g:A(s.all.filter(is(k))),dim:on.size&&!on.has(k),
      at:o.filter===false?'':btn('filter',JSON.stringify([by,k]),i+'b'+k,`role="button" aria-pressed="${on.has(k)}"`)}));
  }else{const was=s.changed?new Map(s.base.map(r=>[r.id,val(r,o.of)])):null;
    items=s.rows.map(r=>({k:r.id,label:s.name(r),v:val(r,o.of)||0,g:was?was.get(r.id)||0:val(r,o.of)||0,on:s.focus===r.id,
      at:`data-id="${esc(r.id)}" `+btn('focus',r.id,i+'b'+r.id,'role="button"')}))}
  if(o.sort)items.sort((a,b)=>by?b.g-a.g:b.v-a.v);
  const max=Math.max(...items.flatMap(x=>[Math.abs(x.v),Math.abs(x.g)]),1e-9),w=v=>(Math.abs(v)/max*100).toFixed(1)+'%';
  const cap=o.label??(by?by[0].toUpperCase()+by.slice(1):'');
  el.innerHTML=items.length?(cap?`<small>${esc(cap)}</small>`:'')+items.map(x=>`<div class="bk-b${x.dim?' dim':''}${x.on?' on':''}" ${x.at}><span>${esc(x.label)}</span><span class="bk-t">${
    Math.abs(x.g-x.v)>1e-9?`<i class="g" style="width:${w(x.g)}"></i>`:''}<i style="width:${w(x.v)}"></i></span><b>${fmt(x.v,o.fmt)}</b></div>`).join(''):none();
};
B.css+=`
.bk-bars{display:grid;grid-template-columns:fit-content(40%) minmax(0,1fr) auto;gap:2px 12px}
.bk-bars>small{grid-column:1/-1;padding:0 6px 2px}
.bk-b{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:center;padding:5px 6px;border-radius:6px}
.bk-b>span:first-child{overflow-wrap:anywhere}
.bk-t{position:relative;height:10px}
.bk-t i{position:absolute;inset:0 auto 0 0;min-width:1px;background:var(--c1);border-radius:0 3px 3px 0}
.bk-t i.g{background:none;box-shadow:inset 0 0 0 1px var(--border-stronger)}
.bk-b b{font-weight:500;font-variant-numeric:tabular-nums;text-align:right}
.bk-b.dim .bk-t i:not(.g){opacity:.3}
.bk-b.dim>span:first-child,.bk-b.dim b{color:var(--text-muted);font-weight:400}
`;
})();
