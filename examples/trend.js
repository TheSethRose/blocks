Blocks({
  summary:'Weekly spend against a 500 budget for eight weeks. Hover the chart or a row; click a week to mark it.',
  name:'week',
  rows:[
    {week:'Sep 7',spend:420,orders:31},{week:'Sep 14',spend:510,orders:38},{week:'Sep 21',spend:380,orders:27},{week:'Sep 28',spend:710,orders:52},
    {week:'Oct 5',spend:640,orders:44},{week:'Oct 12',spend:455,orders:35},{week:'Oct 19',spend:490,orders:36},{week:'Oct 26',spend:830,orders:61},
  ],
  derive:r=>({per:r.spend/r.orders,tone:r.spend>500?'warn':undefined}),
  parts:[
    {type:'line',x:'week',y:[{f:'spend',label:'Spend'}],fmt:'$#',mark:{y:500,label:'Budget'}},
    {type:'table',cols:[{f:'week',label:'Week',tone:true},{f:'spend',label:'Spend',fmt:'$#',bar:true,sum:true},{f:'orders',label:'Orders',sum:true},{f:'per',label:'Per order',fmt:'$#.00'}]},
  ],
});
