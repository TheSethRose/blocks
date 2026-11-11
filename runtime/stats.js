(()=>{
const {esc,fmt,fn,agg,icon}=B;
B.parts.stats=(el,o)=>s=>{
  const st=s.changed?s.start():null;
  el.classList.toggle('bk-one',o.items.length==1);
  el.innerHTML=o.items.map(it=>{
    const sc=it.scope||o.scope||'rows',how=it.agg||(it.of?'sum':'count');
    const get=x=>agg(sc=='pick'?x.picked:sc=='all'?x.all:x.rows,it.of,how,x);
    const v=get(s),tone=it.tone?it.tone(v,s)||'':'',max=fn(it.max,s);
    let note=typeof it.note=='function'?esc(it.note(v,s)):'';
    if(!note&&st){const d=v-get(st);
      if(Math.abs(d)>1e-9)note=`<i class="ti ti-arrow-${d>0?'up':'down'}-right ${it.good?((d>0)==(it.good=='up')?'good':'bad'):''}" aria-hidden="true"></i>${d>0?'+':''}${fmt(d,it.fmt)} from start`}
    if(!note&&sc=='rows'&&s.filtered&&(how=='sum'||how=='count'))note='of '+fmt(agg(s.all,it.of,how,s),it.fmt);
    if(!note&&typeof it.note=='string')note=esc(it.note);
    return `<div><small>${tone?icon({tone}):''}${esc(it.label)}</small><b>${fmt(v,it.fmt)}</b>${
      max?`<span class="bk-m ${tone}"><i style="width:${(Math.max(0,Math.min(1,v/max))*100).toFixed(1)}%"></i></span>`:''}${note?`<small>${note}</small>`:''}</div>`}).join('');
};
B.css+=`
.bk-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));border:1px solid var(--border);border-radius:12px;overflow:hidden}
.bk-stats>div{min-width:0;margin:-1px 0 0 -1px;padding:14px 16px;border-top:1px solid var(--border);border-left:1px solid var(--border)}
.bk-stats small{display:block}
.bk-stats small:first-child{font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase}
.bk-stats b{display:block;margin:4px 0;font-size:20px;font-weight:500;font-variant-numeric:tabular-nums}
.bk .bk-stats .ti{font-size:13px;margin-right:4px}
.bk-stats.bk-one{border:0;overflow:visible}
.bk-stats.bk-one>div{margin:0;padding:0;border:0}
.bk-stats.bk-one b{font-size:40px;line-height:1.1}
.bk-m{display:block;height:3px;margin:8px 0 6px;border-radius:2px;background:var(--border);overflow:hidden}
.bk-m i{display:block;height:100%;background:var(--c1)}
.bk-m.warn i{background:var(--text-warning)}.bk-m.bad i{background:var(--text-danger)}.bk-m.good i{background:var(--text-success)}
`;
})();
