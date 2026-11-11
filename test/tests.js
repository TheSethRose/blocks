(()=>{
const res=[],$=(id,q)=>document.querySelector('#'+id+' '+q),$$=(id,q)=>[...document.querySelectorAll('#'+id+' '+q)];
const txt=n=>n?n.textContent.replace(/\s+/g,' ').trim():'(missing)';
const t=(name,f)=>{try{f();res.push('pass  '+name)}catch(e){res.push('FAIL  '+name+' — '+e.message)}};
const eq=(a,b,m='')=>{if(a!==b)throw Error(`${m} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`)};
const has=(a,b,m='')=>{if(!String(a).includes(b))throw Error(`${m} expected to contain ${JSON.stringify(b)}, got ${JSON.stringify(a)}`)};
const click=n=>{if(!n)throw Error('nothing to click');n.click()};
const chip=(id,label)=>$$(id,'.bk-chip').find(n=>txt(n).startsWith(label));
const stat=(id,i)=>txt($$(id,'.bk-stats>div')[i]);

t('no part failed to draw',()=>eq($$('main','.bk-none.bad').map(txt).join('|'),''));
t('fmt',()=>{eq(B.fmt(1234.5,'$#'),'$1,235');eq(B.fmt(-5,'$#'),'-$5');eq(B.fmt(2.5,'#.0%'),'2.5%');eq(B.fmt(0.004,'$#'),'$0');eq(B.fmt(1/3),'0.33');eq(B.fmt('<b>'),'&lt;b&gt;');eq(B.fmt(null,'$#'),'')});

t('triage: starts with 9 rows and 2 picked',()=>{eq($$('triage','tbody tr').length,9);has(stat('triage',1),'2');has(stat('triage',2),'65 min')});
t('triage: severity chip narrows table and stats',()=>{click(chip('triage','High'));eq($$('triage','tbody tr').length,2);has(stat('triage',0),'2');has(stat('triage',0),'of 9');
  has(txt($('triage','tfoot')),'2 of 9');has(txt($('triage','tfoot')),'65 min')});
t('triage: other facet counts follow the filter',()=>{has(txt(chip('triage','auth')),'2');has(txt(chip('triage','web')),'0');has(txt(chip('triage','Medium')),'4')});
t('triage: two chips in one field are OR',()=>{click(chip('triage','Low'));eq($$('triage','tbody tr').length,5)});
t('triage: clear restores all rows',()=>{click($('triage','.bk-facets .bk-link'));eq($$('triage','tbody tr').length,9);eq($('triage','.bk-facets .bk-link'),null)});
t('triage: row click opens the reason, second click closes',()=>{const r=$$('triage','tbody tr').find(n=>txt(n).includes('N+1'));click(r);has(txt($('triage','.bk-body')),'51 queries');
  eq($('triage','tbody tr.on').getAttribute('aria-expanded'),'true');click($('triage','tbody tr.on'));eq($('triage','.bk-body'),null)});
t('triage: ticking a row updates picked stats, meter and button',()=>{const r=$$('triage','tbody tr').find(n=>txt(n).includes('N+1'));click(r.querySelector('.bk-ck'));
  has(stat('triage',1),'3');has(stat('triage',2),'95 min');eq($('triage','.bk-m').className.includes('warn'),true);has(txt($('triage','.bk-act button')),'Fix 3 picked');eq($('triage','.bk-body'),null,'tick must not open the row')});
t('triage: sort by header',()=>{const h=$$('triage','th span').find(n=>txt(n).startsWith('Finding'));click(h);has(txt($$('triage','tbody tr')[0]),'Dead feature flag');
  click($$('triage','th span').find(n=>txt(n).startsWith('Finding')));has(txt($$('triage','tbody tr')[0]),'Unbounded')});
t('triage: act sends a prompt built from picks',()=>{sent.length=0;click($('triage','.bk-act button'));eq(sent.length,1);has(sent[0],'Token logged');has(sent[0],'N+1');has(txt($('triage','.bk-act small')),'If nothing appears')});
t('triage: act with nothing picked shows the need text and sends nothing',()=>{S.triage.set(s=>s.pick.clear());sent.length=0;click($('triage','.bk-act button'));eq(sent.length,0);has(txt($('triage','.bk-act small')),'Tick at least one')});
t('triage: Enter on a focused row works like a click',()=>{const r=$$('triage','tbody tr')[1];r.focus();r.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  eq(!!$('triage','.bk-body'),true);eq(document.activeElement,$('triage','tbody tr.on'),'focus kept after redraw');click($('triage','tbody tr.on'))});
t('triage: hover marks the row',()=>{const r=$$('triage','tbody tr')[2];r.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));eq($$('triage','tbody tr')[2].classList.contains('hv'),true)});

const slide=(id,i,v)=>{const n=$$(id,'input[type=range]')[i];n.value=v;n.dispatchEvent(new Event('input',{bubbles:true}))};
t('whatif: starts at base, no ghost, no reset',()=>{has(stat('whatif',0),'$106,916');eq($$('whatif','.bk-gh').length,0);eq($('whatif','.bk-knobs .bk-link').hidden,true)});
t('whatif: slider recounts stats with change from start',()=>{slide('whatif',0,800);has(stat('whatif',0),'$213,831');has(stat('whatif',0),'+$106,915 from start');has(stat('whatif',1),'$144,000');
  has(txt($$('whatif','output')[0]),'$800 was $400')});
t('whatif: chart shows a ghost of the start and a "was" readout',()=>{eq($$('whatif','.bk-gh').length,2);has(txt($('whatif','.bk-lg')),'was $106,916')});
t('whatif: tone stat follows the params',()=>{has(stat('whatif',3),'Year 9')});
t('whatif: years changes the axis and drops the ghost',()=>{slide('whatif',2,10);eq($$('whatif','.bk-gh').length,0);has(txt($('whatif','.bk-lg')),'Yr 10')});
t('whatif: reset returns to start',()=>{click($('whatif','.bk-knobs .bk-link'));has(stat('whatif',0),'$106,916');eq($$('whatif','input[type=range]')[0].value,'400');eq($('whatif','.bk-knobs .bk-link').hidden,true)});
t('whatif: arrow keys read chart points',()=>{const svg=$('whatif','svg');svg.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));has(txt($('whatif','.bk-lg')),'Yr 14');
  eq($('whatif','.bk-cr').style.display,'');svg.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));has(txt($('whatif','.bk-lg')),'Yr 15')});
t('whatif: chart has paths, ticks and a goal mark',()=>{eq($$('whatif','.bk-ln').length,2);eq($$('whatif','.bk-ln').every(p=>p.getAttribute('d').length>50),true);eq($$('whatif','.bk-mk').length,1);eq($$('whatif','text.bk-tx').length>6,true)});

const seg=(id,row,label)=>$$(id,'.bk-k')[row].querySelectorAll('[data-do]')[label];
t('compare: default ranking and best mark',()=>{has(txt($$('compare','.bk-b')[0]),'Coolify');has(txt($('compare','.bk-c mark')),'Top score');has(txt($('compare','.bk-c:has(mark)')),'Coolify')});
t('compare: weights re-rank bars and move the best mark',()=>{click(seg('compare',0,0));click(seg('compare',1,3));has(txt($$('compare','.bk-b')[0]),'Vercel');has(txt($('compare','.bk-c:has(mark)')),'Vercel');
  eq(seg('compare',0,0).getAttribute('aria-pressed'),'true');eq($$('compare','.bk-t i.g').length>0,true,'ghost bars show the start score')});
t('compare: picking a card feeds the button',()=>{click($$('compare','.bk-c')[1]);has(txt($('compare','.bk-act button')),'Vercel Pro');eq($$('compare','.bk-c')[1].getAttribute('aria-pressed'),'true')});

const bar=(id,label)=>$$(id,'.bk-b').find(n=>txt(n.firstChild)===label);
t('breakdown: totals',()=>{has(stat('breakdown',0),'$8,780');has(txt(bar('breakdown','Compute')),'$3,520');eq($$('breakdown','tbody tr').length,5);has(txt($('breakdown','.bk-table .bk-link')),'Show all 10')});
t('breakdown: clicking a service bar cross-filters team bars, stats and table',()=>{click(bar('breakdown','Database'));has(stat('breakdown',0),'$3,130');has(stat('breakdown',0),'of $8,780');
  has(txt(bar('breakdown','Data')),'$2,150');has(txt(bar('breakdown','Web')),'$0');eq($$('breakdown','tbody tr').length,2);
  eq(bar('breakdown','Compute').classList.contains('dim'),true);has(txt(bar('breakdown','Compute')),'$3,520','own-field bars keep their value');eq(!!bar('breakdown','Data').querySelector('i.g'),true,'ghost shows the unfiltered total')});
t('breakdown: second field narrows further, then toggling off restores',()=>{click(bar('breakdown','Data'));has(stat('breakdown',0),'$2,150');has(txt(bar('breakdown','Compute')),'$1,260');
  click(bar('breakdown','Data'));click(bar('breakdown','Database'));has(stat('breakdown',0),'$8,780');eq($$('breakdown','.bk-b.dim').length,0)});
t('breakdown: show all expands the table',()=>{click($('breakdown','.bk-table .bk-link'));eq($$('breakdown','tbody tr').length,10);has(txt($('breakdown','.bk-table .bk-link')),'Show fewer')});
t('breakdown: negative numbers format and sort',()=>{has(txt($$('breakdown','tbody tr')[9]),'-$40');has(txt($$('breakdown','tbody tr')[0]),'$730')});

t('plan: opens on the focused step with its body',()=>{has(txt($('plan','li.on')),'Backfill');has(txt($('plan','li.on p')),'Batches of 5,000');eq($$('plan','.bk-rail em').length,5);has(stat('plan',0),'2')});
t('plan: clicking another step moves the detail',()=>{click($$('plan','.bk-row')[3]);has(txt($('plan','li.on p')),'readV2');eq($$('plan','li p').length,1)});

t('trend: chart and table share rows',()=>{eq($$('trend','tbody tr').length,8);eq($$('trend','.bk-ln').length,1);has(txt($('trend','.bk-lg')),'Oct 26');has(txt($('trend','.bk-lg')),'$830')});
t('trend: clicking a chart point focuses the same table row',()=>{const svg=$('trend','svg'),r=svg.getBoundingClientRect();
  svg.dispatchEvent(new MouseEvent('mousemove',{clientX:r.left+r.width*0.5,clientY:r.top+50,bubbles:true}));const x=txt($('trend','.bk-lg .bk-x'));
  eq($$('trend','tbody tr').some(n=>n.classList.contains('hv')&&txt(n).includes(x)),true,'row hover follows the crosshair');
  svg.dispatchEvent(new MouseEvent('click',{bubbles:true}));has(txt($('trend','tbody tr.on')),x);eq($$('trend','.bk-fc').length,1)});
t('trend: derived tone shows as an icon with words for screen readers',()=>{eq($$('trend','tbody .ti-alert-triangle').length,4);has(txt($$('trend','tbody tr')[1]),'Warning:')});
t('escaping: row text cannot inject markup',()=>{const d=document.createElement('div');d.className='bk';document.body.append(d);
  const s=B.store({rows:[{name:'<img src=x onerror=alert(1)>'}]});Blocks({el:d,rows:[{name:'<img src=x onerror=alert(1)>',why:'<b>x</b>'}],focus:0,parts:[{type:'list',body:'why'},{type:'table',cols:[{f:'name'}]}]});
  eq(d.querySelectorAll('img,b').length,0);d.remove()});
t('unknown part reports itself instead of going blank',()=>{const d=document.createElement('div');d.className='bk';document.body.append(d);Blocks({el:d,rows:[],parts:[{type:'nope'}]});has(d.textContent,'nope failed');d.remove()});

const bad=res.filter(r=>r.startsWith('FAIL')).length;
document.getElementById('out').textContent=`${bad?'FAILED':'ALL PASS'}: ${res.length-bad} passed, ${bad} failed\n`+res.join('\n');
})();
