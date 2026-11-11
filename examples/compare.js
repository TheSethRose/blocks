Blocks({
  summary:'Three hosting options scored on cost, speed and effort. Change what matters and the ranking updates.',
  params:{cost:2,speed:2,ease:1},
  rows:[
    {name:'Coolify on your VPS',price:12,p95:180,setup:1,costS:9,speedS:6,easeS:8},
    {name:'Vercel Pro',price:40,p95:90,setup:0.5,costS:5,speedS:9,easeS:9},
    {name:'Bare Kubernetes',price:65,p95:110,setup:12,costS:3,speedS:8,easeS:2},
  ],
  derive:(r,p)=>({score:(r.costS*p.cost+r.speedS*p.speed+r.easeS*p.ease)/((p.cost+p.speed+p.ease)||1)}),
  parts:[
    {type:'knobs',items:[
      {p:'cost',label:'Cost matters',options:[0,1,2,3],names:{0:'Not',1:'A bit',2:'Yes',3:'Most'}},
      {p:'speed',label:'Speed matters',options:[0,1,2,3],names:{0:'Not',1:'A bit',2:'Yes',3:'Most'}},
      {p:'ease',label:'Ease matters',options:[0,1,2,3],names:{0:'Not',1:'A bit',2:'Yes',3:'Most'}}]},
    {type:'bars',of:'score',fmt:'#.0',sort:true},
    {type:'cards',best:'score',bestLabel:'Top score',pick:true,lines:[
      {f:'price',label:'Monthly',fmt:'$#'},{f:'p95',label:'p95 latency',fmt:'# ms'},{f:'setup',label:'Setup',fmt:'#.0 hr'}]},
    {type:'act',items:[{label:s=>s.picked[0]?'Plan the move to '+s.picked[0].name:'Plan the move',need:'Pick an option first.',
      prompt:s=>s.picked[0]&&`Write the migration plan for ${s.picked.map(r=>r.name).join(' and ')}.`}]},
  ],
});
