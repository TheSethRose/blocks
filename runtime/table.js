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
