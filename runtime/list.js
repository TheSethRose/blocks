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
