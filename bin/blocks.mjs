#!/usr/bin/env node
// Checks a Blocks spec and builds the widget code for show_widget.
//   node blocks.mjs <spec.js> [-o out.html] [--check] [--inline]
//   node blocks.mjs --bundle        rebuild dist/blocks.js from runtime/
// The spec file holds one call: Blocks({ rows:[...], parts:[...] })
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const REPO='TheSethRose/claude-blocks',VERSION='1.0.0';
const CDN=`https://cdn.jsdelivr.net/gh/${REPO}@v${VERSION}/dist/blocks.js`;

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.join(here,'..'),rt=path.join(root,'runtime'),dist=path.join(root,'dist','blocks.js');
const read=n=>fs.readFileSync(path.join(rt,n+'.js'),'utf8');
const have=fs.readdirSync(rt).filter(f=>f.endsWith('.js')).map(f=>f.slice(0,-3)).sort((a,b)=>(a!='core')-(b!='core')||a.localeCompare(b));
const pack=mods=>mods.map(read).join('\n').split('\n').map(l=>l.trimStart()).filter(Boolean).join('\n');
const bundle=()=>`/* Blocks runtime v${VERSION} · https://github.com/${REPO} · MIT */\n${pack(have)}\n`;

const args=process.argv.slice(2),oi=args.indexOf('-o'),out=oi<0?null:args[oi+1];
if(args.includes('--bundle')){fs.mkdirSync(path.dirname(dist),{recursive:true});fs.writeFileSync(dist,bundle());
  console.error(`wrote dist/blocks.js · v${VERSION} · ${(fs.statSync(dist).size/1024).toFixed(1)} KB`);process.exit(0)}
const file=args.find((a,i)=>!a.startsWith('-')&&(oi<0||i!==oi+1)),checkOnly=args.includes('--check'),inline=args.includes('--inline');
if(!file){console.error('usage: node blocks.mjs <spec.js> [-o out.html] [--check] [--inline]\n       node blocks.mjs --bundle');process.exit(2)}

const src=fs.readFileSync(file,'utf8').trim();
const errors=[],warns=[];
const err=m=>errors.push(m),warn=m=>warns.push(m);

const ctx=vm.createContext({console,sendPrompt(){}});
vm.runInContext(read('core'),ctx);
let spec;
ctx.Blocks=s=>{spec=s};
try{vm.runInContext(src,ctx)}catch(e){err('spec does not run: '+e.message)}
if(!spec&&!errors.length)err('spec file must call Blocks({...})');
if(/<\/script/i.test(src))err('spec contains "</script", which ends the widget script early');

const builtin=['act','view'];
let used=[];
if(spec){
  const parts=Array.isArray(spec.parts)?spec.parts:[];
  if(!parts.length)err('parts is empty');
  if(!spec.summary)warn('no summary: add one sentence for screen readers');
  if(spec.rows&&!Array.isArray(spec.rows))err('rows must be an array of objects');
  used=[...new Set(parts.map(p=>p.type))];
  used.filter(t=>!builtin.includes(t)&&!have.includes(t)).forEach(t=>err(`unknown part type "${t}" (have: ${[...have.filter(h=>h!='core'),...builtin].join(', ')})`));

  let s;
  try{s=ctx.B.store(spec)}catch(e){err('derive failed: '+e.message)}
  if(s){
    const keys=new Set(s.all.flatMap(r=>Object.keys(r)));
    const field=(f,where)=>{if(typeof f=='string'&&!keys.has(f))err(`${where}: no field "${f}" in rows (have: ${[...keys].join(', ')})`)};
    const numeric=(f,where)=>{if(typeof f=='string'&&keys.has(f)&&!s.all.some(r=>typeof r[f]=='number'))err(`${where}: field "${f}" holds no numbers`)};
    const ids=s.all.map(r=>r.id);
    if(new Set(ids).size<ids.length)err('rows have duplicate id values');
    s.all.forEach(r=>Object.entries(r).forEach(([k,v])=>{if(typeof v=='number'&&!isFinite(v))err(`row "${s.name(r)}": field "${k}" is ${v}`)}));
    s.all.forEach(r=>{if(r.tone!=null&&!['good','warn','bad'].includes(r.tone))err(`row "${s.name(r)}": tone "${r.tone}" must be good, warn or bad`)});
    const needsName=parts.some(p=>['list','cards','bars'].includes(p.type)&&!p.label&&!p.title&&!p.by);
    if(needsName&&!keys.has(spec.name||'name'))err(`rows need a "${spec.name||'name'}" field, or set name:'<field>' on the spec`);

    // Every function is run in three states: as loaded, with all rows picked, and with nothing shown.
    const states=[['as loaded',()=>{}],['all picked',x=>ids.forEach(i=>x.pick.add(i))],['nothing matches',x=>{x.q='\u0000'}]];
    const each=(where,f)=>states.forEach(([label,prep])=>{
      let x;try{x=ctx.B.store(spec);prep(x);x.calc()}catch{return}
      try{const v=f(x);if(typeof v=='number'&&!isFinite(v))err(`${where}: gives ${v} when ${label}`)}
      catch(e){err(`${where}: throws when ${label}: ${e.message}`)}});
    const A=ctx.B.agg;

    parts.forEach((p,i)=>{
      const at=`parts[${i}] ${p.type}`;
      if(p.type=='facets'){[].concat(p.fields||[]).forEach(f=>field(f,at));
        [].concat(p.fields||[]).forEach(f=>{const n=new Set(s.all.map(r=>r[f])).size;if(n>8)warn(`${at}: "${f}" has ${n} values; chips suit 8 or fewer, use search`)});
        if(!p.fields&&!p.search)err(`${at}: needs fields or search`)}
      if(p.type=='knobs')(p.items||[]).forEach(k=>{if(!(k.p in (spec.params||{})))err(`${at}: param "${k.p}" is not in params`);
        if(k.options&&!k.options.includes(spec.params?.[k.p]))err(`${at}: start value of "${k.p}" is not one of its options`)});
      if(p.type=='stats'){if((p.items||[]).length>4)warn(`${at}: ${p.items.length} stats; 4 or fewer reads faster`);
        (p.items||[]).forEach((it,j)=>{const w=`${at} "${it.label}"`;field(it.of,w);numeric(it.of,w);
          const how=it.agg||(it.of?'sum':'count'),sc=it.scope||p.scope||'rows',rows=x=>sc=='pick'?x.picked:sc=='all'?x.all:x.rows;
          each(w,x=>{const v=A(rows(x),it.of,how,x);if(typeof v!='number')throw Error('agg must return a number');
            if(typeof it.note=='function')it.note(v,x);if(it.tone){const t=it.tone(v,x);if(t&&!['good','warn','bad'].includes(t))throw Error(`tone "${t}" must be good, warn or bad`)}
            if(typeof it.max=='function')it.max(x);return v})})}
      if(p.type=='list'){field(p.label,at);field(p.detail,at);field(p.body,at)}
      if(p.type=='table'){if(!p.cols?.length)err(`${at}: needs cols`);(p.cols||[]).forEach(c=>{field(c.f,at);if(c.bar||c.sum)numeric(c.f,at)});
        field(p.body,at);if(p.sort)field(p.sort.replace(/^-/,''),at+' sort');
        if(s.all.length>12&&!p.limit)warn(`${at}: ${s.all.length} rows; set limit so the table starts short`)}
      if(p.type=='bars'){field(p.by,at);field(p.of,at);numeric(p.of,at);if(!p.by&&!p.of)err(`${at}: needs "of" when there is no "by"`);
        if(p.by){const n=new Set(s.all.map(r=>r[p.by])).size;if(n>12)warn(`${at}: ${n} bars; fold small groups or use a table`)}}
      if(p.type=='line'){
        if(p.series)each(at+' series',x=>{const r=p.series(x);if(!Array.isArray(r?.x)||!Array.isArray(r?.y))throw Error('series must return {x:[...],y:[{name,data:[...]}]}');
          r.y.forEach(q=>{if(!q.name||!Array.isArray(q.data))throw Error('each y needs name and data');if(q.data.length!==r.x.length)throw Error(`"${q.name}" has ${q.data.length} points for ${r.x.length} x labels`);
            q.data.forEach(v=>{if(typeof v=='number'&&!isFinite(v))throw Error(`"${q.name}" holds ${v}`)})})});
        else{field(p.x,at);[].concat(p.y||[]).forEach(f=>{const k=typeof f=='string'?f:f.f;field(k,at);numeric(k,at)});if(!p.x||!p.y)err(`${at}: needs x and y, or series`)}
        const n=p.series?(()=>{try{return p.series(s).x.length}catch{return 9}})():s.all.length;
        if(n<4)warn(`${at}: ${n} points is a sentence, not a chart`)}
      if(p.type=='cards'){field(p.title,at);(p.lines||[]).forEach(l=>field(l.f,at));if(p.best){const b=p.best.replace(/^-/,'');field(b,at+' best');numeric(b,at+' best')}
        if(s.all.length>4)warn(`${at}: ${s.all.length} cards; more than 4 reads better as a table`)}
      if(p.type=='act')(p.items||[]).forEach((it,j)=>{const w=`${at} item ${j}`;
        each(w,x=>{const l=typeof it.label=='function'?it.label(x):it.label;if(!l)throw Error('label is empty');
          const t=typeof it.prompt=='function'?it.prompt(x):it.prompt;if(t&&typeof t!='string')throw Error('prompt must return text or a falsy value')})});
      if(p.type=='view'&&typeof p.draw!='function')err(`${at}: needs draw(el,s)`);
    });

    const picks=parts.some(p=>p.pick),usesPick=parts.some(p=>p.type=='act'||p.scope=='pick'||(p.items||[]).some(it=>it.scope=='pick'));
    if(picks&&!usesPick)warn('rows can be picked but nothing reads the picks: add an act button or a stat with scope:"pick"');
    if(spec.params&&Object.keys(spec.params).length&&!parts.some(p=>p.type=='knobs'))warn('params are set but there are no knobs to change them');
    if(parts.some(p=>p.type=='knobs')&&!spec.derive&&!parts.some(p=>p.series||p.type=='view'||(p.items||[]).some(it=>typeof it.agg=='function')))
      warn('knobs change params but nothing reads them: use derive, a series function or an agg function');
    const interactive=parts.some(p=>['facets','knobs','act'].includes(p.type)||p.pick||p.body||p.by||p.type=='line'||p.type=='table');
    if(!interactive)warn('nothing here responds to the reader; a plain list or sentence may say it faster');
  }
}

warns.forEach(w=>console.error('warn  '+w));
errors.forEach(e=>console.error('error '+e));
if(errors.length){console.error(`\n${errors.length} error(s). Fix the spec and run again.`);process.exit(1)}

if(!inline&&(!fs.existsSync(dist)||fs.readFileSync(dist,'utf8')!==bundle()))
  console.error(`warn  runtime/ differs from dist/blocks.js, so the CDN copy may not match what was checked. Use --inline, or release a new version (see references/maintain.md)`);
const guard=`if(window.Blocks){\n${src}\n}else document.querySelector('.bk').textContent='The Blocks runtime did not load. Ask for the inline version.';`;
const html=inline
  ?`<div class="bk"></div>\n<script>\n${pack(['core',...have.filter(h=>h!='core'&&used.includes(h))])}\n</script>\n<script>\n${src}\n</script>\n`
  :`<div class="bk"></div>\n<script src="${CDN}"></script>\n<script>\n${guard}\n</script>\n`;
console.error(`ok    ${used.join(', ')} · ${inline?'inline':'runtime v'+VERSION+' from jsDelivr'} · ${(html.length/1024).toFixed(1)} KB`);
if(!checkOnly){if(out){fs.writeFileSync(out,html);console.error('wrote '+out)}else process.stdout.write(html)}
