/* Blocks runtime v1.0.0 · https://github.com/TheSethRose/claude-blocks · MIT */
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
(()=>{
const {esc,fmt}=B,DASH=['','6 4','2 3','8 3 2 3'];
const nice=(lo,hi,n=4)=>{const sp=hi-lo||1,mag=10**Math.floor(Math.log10(sp/n)),st=[1,2,2.5,5,10].map(m=>m*mag).find(m=>sp/m<=n)||mag*10,t=[];
for(let v=Math.floor(lo/st)*st;v<hi+st-st*1e-9;v+=st)t.push(+v.toFixed(10));return t};
B.parts.line=(el,o,s,i)=>{
el.innerHTML='<div class="bk-lg" aria-live="off"></div><svg tabindex="0" role="img"></svg>';
const lg=el.firstChild,svg=el.lastChild;let d,at=null,g,w=0;
const get=st=>{if(o.series){const r=o.series(st);return {x:r.x,y:r.y}}
return {x:st.rows.map(r=>r[o.x]),ids:st.rows.map(r=>r.id),y:[].concat(o.y).map(f=>typeof f=='string'?{name:f,data:st.rows.map(r=>r[f])}:
{...f,name:f.label??f.f,data:st.rows.map(r=>r[f.f])})}};
const show=()=>{const n=d.x.length,j=at??n-1,on=at!=null;
lg.innerHTML=`<span class="bk-x">${esc(d.x[j])}</span>`+d.y.map((q,k)=>`<span><i style="background:var(--c${k%6+1})"></i>${esc(q.name)} <b>${fmt(q.data[j],o.fmt)}</b>${
d.ghost&&d.ghost[k]&&d.ghost[k].data[j]!==q.data[j]?` <small>was ${fmt(d.ghost[k].data[j],o.fmt)}</small>`:''}</span>`).join('');
const cr=svg.querySelector('.bk-cr');if(!cr)return;
cr.setAttribute('x1',g.X(j));cr.setAttribute('x2',g.X(j));cr.style.display=on?'':'none';
svg.querySelectorAll('.bk-dot').forEach((c,k)=>{const v=d.y[k].data[j],ok=typeof v=='number';
c.style.display=ok?'':'none';if(ok){c.setAttribute('cx',g.X(j));c.setAttribute('cy',g.Y(v))}});
if(d.ids)s.hot(on?d.ids[j]:null)};
const draw=()=>{
const W=w=el.clientWidth||640,H=o.h||200,n=d.x.length;
const ys=d.y.concat(d.ghost||[]).flatMap(q=>q.data).concat(o.mark?[o.mark.y]:[]).filter(v=>typeof v=='number');
if(!n||!ys.length){svg.innerHTML='';lg.innerHTML='<span class="bk-x">No data</span>';return}
const lo=o.zero===false?Math.min(...ys):Math.min(0,...ys),tk=nice(lo,Math.max(...ys,lo+1e-9)),y0=tk[0],y1=tk[tk.length-1],lab=tk.map(v=>fmt(v,o.fmt));
const L=Math.max(...lab.map(t=>t.length))*6.6+12,R=12,T=8,M=22,pw=W-L-R;
const X=j=>+(L+(n>1?j/(n-1):.5)*pw).toFixed(1),Y=v=>+(T+(1-(v-y0)/(y1-y0))*(H-T-M)).toFixed(1);
g={X,Y,L,pw};
const path=a=>{let p='',pen=0;a.forEach((v,j)=>{if(typeof v!='number'){pen=0;return}p+=(pen?'L':'M')+X(j)+' '+Y(v);pen=1});return p};
const step=Math.max(1,Math.ceil(n/Math.max(2,Math.floor(pw/70)))),fi=d.ids?d.ids.indexOf(s.focus):-1;
svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.style.height=H+'px';
svg.setAttribute('aria-label',o.label||d.y.map(q=>q.name).join(', ')+' by '+(o.x||'step')+'. Arrow keys read each point.');
svg.innerHTML=tk.map((v,k)=>`<line class="bk-g" x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="bk-tx" x="${L-6}" y="${Y(v)+4}" text-anchor="end">${lab[k]}</text>`).join('')+
d.x.map((t,j)=>j%step==0||j==n-1&&(n-1)%step>step/2?`<text class="bk-tx" x="${X(j)}" y="${H-4}" text-anchor="${j==0?'start':j==n-1?'end':'middle'}">${esc(t)}</text>`:'').join('')+
(o.mark?`<line class="bk-mk" x1="${L}" x2="${W-R}" y1="${Y(o.mark.y)}" y2="${Y(o.mark.y)}"/><text class="bk-tx" x="${L+4}" y="${Y(o.mark.y)-5}">${esc(o.mark.label||'')}</text>`:'')+
(fi>=0?`<line class="bk-fc" x1="${X(fi)}" x2="${X(fi)}" y1="${T}" y2="${H-M}"/>`:'')+
(d.ghost||[]).map(q=>`<path class="bk-gh" d="${path(q.data)}"/>`).join('')+
d.y.map((q,k)=>`<path class="bk-ln" style="stroke:var(--c${k%6+1})" stroke-dasharray="${q.dash===false?'':DASH[k%4]}" d="${path(q.data)}"/>`).join('')+
`<line class="bk-cr" y1="${T}" y2="${H-M}"/>`+d.y.map((q,k)=>`<circle class="bk-dot" r="4.5" style="fill:var(--c${k%6+1})"/>`).join('');
show()};
const move=j=>{at=j==null?null:Math.max(0,Math.min(d.x.length-1,j));show()};
svg.onmousemove=e=>{if(!g)return;const r=svg.getBoundingClientRect(),px=(e.clientX-r.left)*(w/r.width);move(Math.round((px-g.L)/g.pw*(d.x.length-1)))};
svg.onmouseleave=svg.onblur=()=>move(null);
svg.onkeydown=e=>{const k={ArrowLeft:-1,ArrowRight:1}[e.key];if(k){e.preventDefault();move((at??d.x.length-1)+k)}else if(e.key=='Escape')move(null)
else if(e.key=='Enter'&&d.ids&&at!=null)B.acts.focus(s,d.ids[at])};
svg.onclick=()=>{if(d.ids&&at!=null)B.acts.focus(s,d.ids[at])};
if(typeof ResizeObserver!='undefined')new ResizeObserver(()=>{if(d&&el.clientWidth&&el.clientWidth!==w)draw()}).observe(el);
return s=>{d=get(s);
if(o.series&&s.changed){const b=get(s.start());if(b.x.length===d.x.length)d.ghost=b.y}
if(at!=null&&at>=d.x.length)at=null;draw()};
};
B.css+=`
.bk-line{display:grid;gap:8px}
.bk-line svg{display:block;width:100%;overflow:visible;cursor:crosshair}
.bk-lg{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;color:var(--text-secondary);min-height:18px}
.bk-lg .bk-x{min-width:64px;color:var(--text-primary);font-weight:500}
.bk-lg i{display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:2px}
.bk-lg b{font-weight:500;color:var(--text-primary);font-variant-numeric:tabular-nums}
.bk-g{stroke:var(--border)}
.bk-tx{font-size:11px;fill:var(--text-muted);font-variant-numeric:tabular-nums}
.bk-ln{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.bk-gh{fill:none;stroke:var(--text-muted);stroke-width:1.5;stroke-dasharray:3 4}
.bk-mk{stroke:var(--text-secondary);stroke-dasharray:2 3}
.bk-cr{stroke:var(--border-stronger)}
.bk-fc{stroke:var(--border-accent);stroke-width:2}
.bk-dot{stroke:var(--surface-2);stroke-width:2;pointer-events:none}
`;
})();
(()=>{
const {esc,fmt,val,icon,ck,btn,none}=B;
B.parts.list=(el,o,s,i)=>s=>{
const any=s.rows.some(r=>icon(r));
el.innerHTML=s.rows.length?'<ul>'+s.rows.map((r,n)=>{
const open=s.focus===r.id,body=o.body&&val(r,o.body),side=o.detail&&val(r,o.detail),mark=icon(r);
return `<li data-id="${esc(r.id)}" class="${open?'on':''}"><div class="bk-row" ${btn('focus',r.id,i+'r'+r.id,body?`role="button" aria-expanded="${open}"`:'role="button"')}>${
o.pick?ck(s,r,i):''}${o.rail?`<em>${mark||n+1}</em>`:mark||(any?B.gap:'')}<span>${esc(o.label?val(r,o.label):s.name(r))}</span>${
side!=null&&side!==''?`<small>${fmt(side,o.fmt)}</small>`:''}${body?`<i class="ti ti-chevron-${open?'up':'down'}" aria-hidden="true"></i>`:''}</div>${
open&&body?`<p>${esc(body)}</p>`:''}</li>`}).join('')+'</ul>':none();
el.classList.toggle('bk-rail',!!o.rail);
};
B.css+=`
.bk-list ul{margin:0;padding:0;list-style:none}
.bk-list li{margin:0;border-top:1px solid var(--border)}
.bk-list li:first-child{border-top:0}
.bk-row{display:flex;gap:10px;align-items:baseline;padding:9px 6px}
.bk-row>span:not(.bk-ck){flex:1;min-width:0}
.bk-row>small{font-size:13px;text-align:right;font-variant-numeric:tabular-nums}
.bk .bk-row>.ti{margin:0;align-self:center}
.bk .bk-row>.ti-chevron-down,.bk .bk-row>.ti-chevron-up{font-size:14px;color:var(--text-muted)}
.bk-list p{margin:0;padding:0 6px 12px 32px;color:var(--text-secondary);white-space:pre-line}
.bk-rail li{border:0}
.bk-rail em{flex:none;display:grid;place-items:center;width:22px;height:22px;border:1px solid var(--border-strong);border-radius:50%;font-style:normal;font-size:12px;color:var(--text-secondary);align-self:center}
.bk .bk-rail em .ti{margin:0;font-size:14px}
.bk-rail li:not(:last-child){background:linear-gradient(var(--border-strong),var(--border-strong)) 16.5px 31px/1px 100% no-repeat}
.bk-rail li.on,.bk-rail li.hv{background-color:transparent}
.bk-rail li.on>.bk-row span{font-weight:500}
.bk-rail p{padding-left:38px}
`;
})();
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
(()=>{
const {esc,fmt,val,icon,ck,btn,none,agg}=B;
B.acts.sort=(s,a)=>{const[i,f,num]=JSON.parse(a),c=s.sort[i];s.set(s=>s.sort[i]=c==='-'+f?f:c===f?'-'+f:num?'-'+f:f)};
B.acts.more=(s,a)=>s.set(s=>s.more[a]=!s.more[a]);
B.parts.table=(el,o,s,i)=>{
s.sort[i]=o.sort||'';
return s=>{
const cols=o.cols,srt=s.sort[i],sf=srt.replace(/^-/,''),dir=srt[0]=='-'?-1:1,rows=[...s.rows];
if(sf)rows.sort((a,b)=>{const x=a[sf],y=b[sf];
return (x==null)-(y==null)||(typeof x=='number'&&typeof y=='number'?x-y:String(x).localeCompare(String(y),undefined,{numeric:true}))*dir});
const cut=o.limit&&!s.more[i]&&rows.length>o.limit?rows.slice(0,o.limit):rows;
const N=cols.map(c=>s.all.some(r=>typeof r[c.f]=='number'));
const M=cols.map(c=>c.bar?Math.max(...s.all.map(r=>Math.abs(r[c.f])||0),1e-9):0),span=cols.length+(o.pick?1:0);
const head=`<thead><tr>${o.pick?'<th class="bk-w"></th>':''}${cols.map((c,j)=>
`<th class="${N[j]?'num':''}"${c.w?` style="width:${esc(c.w)}"`:''} aria-sort="${sf===c.f?(dir<0?'descending':'ascending'):'none'}"><span ${
btn('sort',JSON.stringify([i,c.f,N[j]]),i+'h'+j,'role="button"')}>${esc(c.label??c.f)}${sf===c.f?(dir<0?' ↓':' ↑'):''}</span></th>`).join('')}</tr></thead>`;
const cell=(r,c,j)=>{const v=r[c.f];
return `<td class="${N[j]?'num':''}">${c.tone?icon(r)||B.gap:''}${fmt(v,c.fmt)}${
c.bar&&typeof v=='number'?`<i class="bk-bar${v<0?' neg':''}" style="width:${(Math.abs(v)/M[j]*100).toFixed(1)}%"></i>`:''}</td>`};
const body=cut.map(r=>{const open=s.focus===r.id,b=o.body&&val(r,o.body);
return `<tr data-id="${esc(r.id)}" class="${open?'on':''}" ${btn('focus',r.id,i+'r'+r.id,b?`aria-expanded="${open}"`:'')}>${
o.pick?`<td class="bk-w">${ck(s,r,i)}</td>`:''}${cols.map((c,j)=>cell(r,c,j)).join('')}</tr>${
open&&b?`<tr class="bk-body"><td colspan="${span}">${esc(b)}</td></tr>`:''}`}).join('');
const foot=cols.some(c=>c.sum)?`<tfoot><tr>${o.pick?'<td></td>':''}${cols.map((c,j)=>`<td class="${N[j]?'num':''}">${
c.sum?fmt(agg(s.rows,c.f,c.sum===true?'sum':c.sum,s),c.fmt):j==0?(s.filtered?`${s.rows.length} of ${s.all.length}`:'Total'):''}</td>`).join('')}</tr></tfoot>`:'';
el.innerHTML=rows.length?`<table>${head}<tbody>${body}</tbody>${foot}</table>`+(o.limit&&rows.length>o.limit?
`<span class="bk-link" ${btn('more',i,i+'m','role="button"')}>${s.more[i]?'Show fewer':'Show all '+rows.length}</span>`:''):none();
};
};
B.css+=`
.bk-table{display:grid;gap:8px}
.bk-table table{width:100%;border-collapse:collapse;font-size:14px}
.bk-table th{text-align:left;font-weight:400;font-size:12px;color:var(--text-secondary);padding:0 12px 8px 6px;border-bottom:1px solid var(--border);white-space:nowrap;user-select:none}
.bk-table td{padding:9px 12px 9px 6px;border-bottom:1px solid var(--border);color:var(--text-secondary);overflow-wrap:anywhere;vertical-align:top}
.bk-table th:last-child,.bk-table td:last-child{padding-right:6px}
.bk-table .bk-w{width:16px;padding-right:4px}
.bk-table td:not(.bk-w):first-child,.bk-table .bk-w+td{color:var(--text-primary)}
.bk-table tfoot td{border-bottom:0;color:var(--text-primary);font-weight:500}
.bk-bar{display:block;height:3px;margin:5px 0 0 auto;border-radius:2px;background:var(--c1)}
.bk-bar.neg{background:var(--c2)}
.bk-table .bk-body td{padding:2px 12px 14px 6px;white-space:pre-line;background:var(--bg-accent-muted,var(--surface-1))}
.bk-table tr.on td{border-bottom-color:transparent}
`;
})();
