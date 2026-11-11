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
