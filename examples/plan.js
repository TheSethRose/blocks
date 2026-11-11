Blocks({
  summary:'Five step migration plan with status. Open a step to see what it does and how to undo it.',
  focus:2,
  rows:[
    {name:'Snapshot the database',tone:'good',when:'done 09:10',mins:5,how:'pg_dump to the backup bucket.\nUndo: nothing to undo.'},
    {name:'Add the new columns',tone:'good',when:'done 09:25',mins:10,how:'Additive migration, nullable columns only.\nUndo: drop the columns.'},
    {name:'Backfill 2.1M rows',tone:'warn',when:'running, 64%',mins:40,how:'Batches of 5,000 with a 200 ms pause.\nUndo: stop the job; rows stay valid.'},
    {name:'Switch reads to the new columns',when:'next',mins:15,how:'Behind the readV2 flag, 10% then 100%.\nUndo: turn the flag off.'},
    {name:'Drop the old columns',when:'after 7 days',mins:5,how:'Only after a week with no reads.\nUndo: restore from the snapshot.'},
  ],
  parts:[
    {type:'stats',items:[{label:'Steps done',agg:rows=>rows.filter(r=>r.tone=='good').length,max:5,note:'of 5'},
      {label:'Time left',agg:rows=>rows.filter(r=>r.tone!='good').reduce((a,r)=>a+r.mins,0),fmt:'# min'}]},
    {type:'list',rail:true,detail:'when',body:'how'},
  ],
});
