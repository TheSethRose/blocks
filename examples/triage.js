Blocks({
  summary:'Nine review findings. Filter by severity or area, open one for the reason, tick the ones to fix.',
  rows:[
    {name:'Token logged in plain text',area:'auth',tone:'bad',sev:'High',mins:20,why:'auth/session.ts:88 writes the bearer token to the request log.\nFix: log the token id only.'},
    {name:'No rate limit on login',area:'auth',tone:'bad',sev:'High',mins:45,why:'POST /login accepts unlimited attempts per address.'},
    {name:'N+1 query on orders list',area:'api',tone:'warn',sev:'Medium',mins:30,why:'orders/list.ts:41 loads each customer in a loop: 51 queries for 50 rows.'},
    {name:'Unbounded page size',area:'api',tone:'warn',sev:'Medium',mins:15,why:'limit is read from the query string with no cap.'},
    {name:'Missing index on orders.created_at',area:'db',tone:'warn',sev:'Medium',mins:10,why:'The dashboard query scans the whole table.'},
    {name:'Stale React key in cart rows',area:'web',tone:'warn',sev:'Medium',mins:10,why:'Index used as key, so quantity inputs swap on delete.'},
    {name:'Dead feature flag: newCheckout',area:'web',sev:'Low',mins:15,why:'Flag has been 100% on since March. Three branches can go.'},
    {name:'Duplicate date helper',area:'web',sev:'Low',mins:10,why:'formatDate exists in utils/date.ts and lib/time.ts.'},
    {name:'Test name typo',area:'api',sev:'Low',mins:2,why:'"shoud reject expired token".'},
  ],
  pick:[0,1],
  parts:[
    {type:'facets',fields:['sev','area'],labels:{sev:'Severity'}},
    {type:'stats',items:[
      {label:'Showing',note:'findings'},
      {label:'Picked',scope:'pick',note:(v,s)=>v?'to fix':'tick rows below'},
      {label:'Picked effort',scope:'pick',of:'mins',fmt:'# min',max:120,tone:v=>v>120?'bad':v>90?'warn':'',note:(v)=>v>120?'over the 2 hour slot':'of a 2 hour slot'},
    ]},
    {type:'table',pick:true,sort:'-mins',body:'why',cols:[
      {f:'name',label:'Finding',tone:true},{f:'area',label:'Area'},{f:'mins',label:'Effort',fmt:'# min',bar:true,sum:true}]},
    {type:'act',items:[{label:s=>s.picked.length?`Fix ${s.picked.length} picked`:'Fix picked',need:'Tick at least one finding first.',
      prompt:s=>s.picked.length&&'Fix these findings: '+s.picked.map(r=>r.name).join('; ')}]},
  ],
});
