(()=>{
const B=globalThis.B={parts:{},acts:{},css:''};
const esc=B.esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fn=B.fn=(v,...a)=>typeof v=='function'?v(...a):v;
B.val=(r,f)=>typeof f=='function'?f(r):r[f];
B.fmt=(v,f)=>{
  if(v==null||v==='')return '';
  if(typeof f=='function')return f(v);
  if(typeof v!='number')return esc(v);
  if(!isFinite(v))return '–';
  const m=/#(?:\.(0+))?/.exec(f||''),d=m&&m[1]?m[1].length:0;
  const n=Math.abs(v).toLocaleString('en-US',f?{minimumFractionDigits:d,maximumFractionDigits:d}:{maximumFractionDigits:2});
  const neg=v<0&&/[1-9]/.test(n);
  return (neg?'-':'')+(f?f.replace(/#(\.0+)?/,n):n);
};
B.agg=(rows,of,how,s)=>{
  if(typeof how=='function')return how(rows,s);
  if(how=='count')return rows.length;
  const v=rows.map(r=>B.val(r,of)).filter(x=>typeof x=='number');
  if(!v.length)return 0;
  const t=v.reduce((a,b)=>a+b,0);
  return how=='avg'?t/v.length:how=='min'?Math.min(...v):how=='max'?Math.max(...v):t;
};
const TI={good:'circle-check',warn:'alert-triangle',bad:'alert-circle'},TW={good:'OK',warn:'Warning',bad:'Problem'};
B.icon=r=>{const n=r.icon||TI[r.tone];
  return n?`<i class="ti ti-${esc(n)} ${TI[r.tone]?r.tone:''}" aria-hidden="true"></i>${TW[r.tone]?`<span class="sr-only">${TW[r.tone]}: </span>`:''}`:''};
B.gap='<i class="ti bk-sp" aria-hidden="true"></i>';
B.btn=(act,a,fk,more='')=>`data-do="${act}" data-a="${esc(a)}" data-fk="${esc(fk)}" tabindex="0" ${more}`;
B.ck=(s,r,i)=>`<span class="bk-ck" ${B.btn('pick',r.id,i+'c'+r.id,`role="checkbox" aria-checked="${s.pick.has(r.id)}" aria-label="Select ${esc(s.name(r))}"`)}><i class="ti ti-check" aria-hidden="true"></i></span>`;
B.none=()=>`<div class="bk-none">Nothing matches. <span class="bk-link" ${B.btn('clear','','clr','role="button"')}>Clear filters</span></div>`;

B.store=(spec,paint=()=>{})=>{
  const p0={...spec.params},raw=spec.rows||[],nk=spec.name||'name';
  const s={spec,p0,p:{...p0},f:{},q:'',focus:spec.focus==null?null:String(spec.focus),pick:new Set((spec.pick||[]).map(String)),sort:{},more:{},hover:null};
  const build=p=>raw.map((r,i)=>{const o={...r,id:String(r.id??i)};return spec.derive?{...o,...spec.derive(o,p,raw)}:o});
  const hit=(r,skip)=>Object.entries(s.f).every(([k,t])=>k===skip||!t.size||t.has(String(r[k])))&&
    (!s.q||Object.entries(r).some(([k,v])=>k!='id'&&typeof v=='string'&&v.toLowerCase().includes(s.q)));
  s.name=r=>r[nk]??r.id;
  s.calc=()=>{s.all=build(s.p);s.rows=s.all.filter(r=>hit(r));s.picked=s.all.filter(r=>s.pick.has(r.id));
    s.changed=Object.keys(p0).some(k=>p0[k]!==s.p[k]);s.filtered=s.rows.length<s.all.length;return s};
  s.without=k=>s.all.filter(r=>hit(r,k));
  s.start=()=>{const ids=new Set(s.rows.map(r=>r.id));
    return {...s,p:p0,changed:false,all:s.base,rows:s.base.filter(r=>ids.has(r.id)),picked:s.base.filter(r=>s.pick.has(r.id))}};
  s.set=f=>{f(s);paint()};
  s.base=build(p0);
  return s.calc();
};

B.acts.focus=(s,a)=>s.set(s=>s.focus=s.focus===a?null:a);
B.acts.pick=(s,a)=>s.set(s=>{s.pick.has(a)?s.pick.delete(a):s.pick.add(a)});
B.acts.filter=(s,a)=>{const[k,v]=JSON.parse(a);s.set(s=>{const t=s.f[k]||(s.f[k]=new Set);t.has(v)?t.delete(v):t.add(v)})};
B.acts.clear=s=>s.set(s=>{s.f={};s.q=''});
B.acts.reset=s=>s.set(s=>{s.p={...s.p0}});
B.acts.say=(s,a,n)=>{const el=n.closest('.bk-act'),it=el._o.items[a],out=el.querySelector('small'),t=fn(it.prompt,s);
  if(!t){out.className='bad';out.textContent=it.need||'Pick something first.';return}
  out.className='';out.textContent='If nothing appears, type: '+t;
  try{const r=globalThis.sendPrompt(t);r&&r.catch&&r.catch(()=>{})}catch{}};

B.parts.act=(el,o,s)=>{
  el.innerHTML=o.items.map((_,i)=>`<button data-do="say" data-a="${i}"></button>`).join('')+'<small role="status"></small>';
  const bs=el.querySelectorAll('button'),out=el.querySelector('small');
  return s=>{o.items.forEach((it,i)=>bs[i].textContent=fn(it.label,s)+' ↗');if(out.className){out.className='';out.textContent=''}};
};
B.parts.view=(el,o,s)=>s=>o.draw(el,s);

globalThis.Blocks=spec=>{
  const root=typeof spec.el=='string'?document.querySelector(spec.el):spec.el||document.querySelector('.bk:empty')||document.querySelector('.bk');
  if(!document.getElementById('bk-css')){const st=document.createElement('style');st.id='bk-css';st.textContent=B.css;(document.head||document.documentElement).append(st)}
  root.classList.add('bk');
  root.innerHTML=spec.summary?`<h2 class="sr-only">${esc(spec.summary)}</h2>`:'';
  let parts=[];
  const mark=()=>{root.querySelectorAll('.hv').forEach(n=>n.classList.remove('hv'));
    if(s.hover!=null)root.querySelectorAll(`[data-id="${CSS.escape(s.hover)}"]`).forEach(n=>n.classList.add('hv'))};
  const paint=()=>{s.calc();const a=document.activeElement,k=a&&root.contains(a)&&a.dataset.fk;
    parts.forEach(x=>{try{x.draw(s)}catch(e){x.el.innerHTML=`<div class="bk-none bad">${esc(x.o.type)} failed: ${esc(e.message)}</div>`}});
    if(k){const n=root.querySelector(`[data-fk="${CSS.escape(k)}"]`);n&&n!==document.activeElement&&n.focus()}
    mark()};
  const s=B.store(spec,paint);
  s.hot=id=>{if(id!==s.hover){s.hover=id;mark()}};
  parts=(spec.parts||[]).map((o,i)=>{const el=document.createElement('div');el.className='bk-'+o.type;el._o=o;root.append(el);
    try{const def=B.parts[o.type];if(!def)throw Error('part not loaded');return {o,el,draw:def(el,o,s,i)}}
    catch(e){el.innerHTML=`<div class="bk-none bad">${esc(o.type)} failed: ${esc(e.message)}</div>`;return null}}).filter(Boolean);
  root.addEventListener('click',e=>{const n=e.target.closest('[data-do]');if(n&&root.contains(n)){const f=B.acts[n.dataset.do];f&&f(s,n.dataset.a,n,e)}});
  root.addEventListener('keydown',e=>{if((e.key=='Enter'||e.key==' ')&&e.target.matches('[data-do]:not(button,input)')){e.preventDefault();e.target.click()}});
  root.addEventListener('mouseover',e=>{const n=e.target.closest('[data-id]');s.hot(n?n.dataset.id:null)});
  root.addEventListener('mouseleave',()=>s.hot(null));
  paint();
  return s;
};

B.css+=`
.bk{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;font-size:14px;line-height:1.45;color:var(--text-primary);--c1:#2a78d6;--c2:#eb6834;--c3:#1baf7a;--c4:#eda100;--c5:#e87ba4;--c6:#6250d6}
[data-mode=dark] .bk{--c1:#3987e5;--c2:#d95926;--c3:#199e70;--c4:#c98500;--c5:#d55181;--c6:#9085e9}
@media(prefers-color-scheme:dark){:root:not([data-mode=light]) .bk{--c1:#3987e5;--c2:#d95926;--c3:#199e70;--c4:#c98500;--c5:#d55181;--c6:#9085e9}}
.bk .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.bk [data-do]{cursor:pointer}
.bk [tabindex]:focus-visible{outline:2px solid var(--border-accent);outline-offset:1px;border-radius:4px}
.bk small{font-size:12px;color:var(--text-secondary)}
.bk .ti{font-size:16px;vertical-align:-2px;margin-right:6px;color:var(--text-secondary)}
.bk .bk-sp{display:inline-block;width:16px}
.bk .good{color:var(--text-success)}.bk .warn{color:var(--text-warning)}.bk .bad{color:var(--text-danger)}
.bk .num{text-align:right;font-variant-numeric:tabular-nums}
.bk .hv{background:var(--surface-1)}
.bk .on{background:var(--bg-accent-muted,var(--surface-1))}
.bk-link{font-size:12px;color:var(--text-accent);justify-self:start}
.bk-none{color:var(--text-secondary);padding:10px 0}
.bk-ck{display:inline-grid;place-items:center;width:16px;height:16px;border:1px solid var(--border-stronger);border-radius:4px;vertical-align:-3px}
.bk .bk-ck .ti{font-size:12px;margin:0;color:transparent}
.bk-ck[aria-checked=true]{background:var(--text-primary);border-color:var(--text-primary)}
.bk .bk-ck[aria-checked=true] .ti{color:var(--surface-2)}
.bk-act{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
`;
})();
