Blocks({
  summary:'Savings projection. Move the monthly deposit, the yearly return and the number of years to see the balance and when it passes the goal.',
  params:{deposit:400,rate:5,years:15},
  parts:[
    {type:'knobs',items:[
      {p:'deposit',label:'Monthly deposit',min:0,max:1500,step:50,fmt:'$#'},
      {p:'rate',label:'Yearly return',min:0,max:10,step:0.5,fmt:'#.0%'},
      {p:'years',label:'Years',min:5,max:30,step:1}]},
    {type:'stats',items:[
      {label:'Final balance',fmt:'$#',good:'up',agg:(_,s)=>grow(s.p).at(-1)},
      {label:'You put in',fmt:'$#',agg:(_,s)=>s.p.deposit*12*s.p.years},
      {label:'Growth',fmt:'$#',good:'up',agg:(_,s)=>grow(s.p).at(-1)-s.p.deposit*12*s.p.years},
      {label:'Passes $100k',agg:(_,s)=>{const i=grow(s.p).findIndex(v=>v>=100000);return i<0?0:i},fmt:v=>v?'Year '+v:'Never',
        tone:v=>v?'good':'warn'}]},
    {type:'line',fmt:'$#',mark:{y:100000,label:'Goal'},
      series:s=>({x:grow(s.p).map((_,i)=>'Yr '+i),y:[{name:'Balance',data:grow(s.p)},{name:'Deposits',data:grow(s.p).map((_,i)=>s.p.deposit*12*i)}]})},
  ],
});
function grow(p){const out=[0];let b=0;for(let y=1;y<=p.years;y++){for(let m=0;m<12;m++)b=b*(1+p.rate/1200)+p.deposit;out.push(Math.round(b))}return out}
