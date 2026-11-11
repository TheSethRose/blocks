Blocks({
  summary:'October cloud spend by service and team. Click a bar to narrow everything to that service or team.',
  rows:[
    {name:'api-prod',service:'Compute',team:'Platform',cost:1840,prev:1610},
    {name:'worker-pool',service:'Compute',team:'Data',cost:1260,prev:1300},
    {name:'web-edge',service:'Compute',team:'Web',cost:420,prev:400},
    {name:'orders-db',service:'Database',team:'Platform',cost:980,prev:960},
    {name:'analytics-wh',service:'Database',team:'Data',cost:2150,prev:1420},
    {name:'media-bucket',service:'Storage',team:'Web',cost:310,prev:290},
    {name:'backups',service:'Storage',team:'Platform',cost:270,prev:265},
    {name:'event-logs',service:'Storage',team:'Data',cost:640,prev:380},
    {name:'cdn',service:'Network',team:'Web',cost:520,prev:540},
    {name:'nat-gateway',service:'Network',team:'Platform',cost:390,prev:370},
  ],
  derive:r=>({change:r.cost-r.prev}),
  parts:[
    {type:'stats',items:[{label:'Spend',of:'cost',fmt:'$#'},{label:'Change from September',of:'change',fmt:'$#'},{label:'Resources'}]},
    {type:'bars',by:'service',of:'cost',fmt:'$#',sort:true},
    {type:'bars',by:'team',of:'cost',fmt:'$#',sort:true},
    {type:'table',sort:'-change',limit:5,cols:[{f:'name',label:'Resource'},{f:'service',label:'Service'},{f:'cost',label:'Cost',fmt:'$#',sum:true},{f:'change',label:'Change',fmt:'$#',bar:true,sum:true}]},
  ],
});
