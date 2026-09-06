const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function setup(permission, {returning=true, home=false, standalone=false}={}) {
  const state={prompts:0,navigations:0,meta:[],timers:new Map(),events:{},subscriptions:0};
  const storage=new Map(returning?[['skippf_auto','1']]:[]);
  const context={URLSearchParams,Promise,Uint8Array,Math,Date,Blob,
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    window:{location:{search:home?'?home=1':''},matchMedia:()=>({matches:standalone}),navigator:{standalone},open:()=>state.navigations++},
    navigator:{},location:{replace:()=>state.navigations++},
    document:{write:text=>state.meta.push(text),addEventListener:(name,fn)=>state.events[name]=fn,getElementById:()=>null},
    setTimeout:(fn,ms)=>{const id=Symbol();state.timers.set(id,{fn,ms});return id;},clearTimeout:id=>state.timers.delete(id)
  };
  if(permission!==null) context.Notification={permission,requestPermission:()=>{state.prompts++;return new Promise(resolve=>state.resolvePermission=resolve);}};
  vm.createContext(context);vm.runInContext(script,context);
  context.pasangSW=()=>Promise.resolve({});
  context.daftarPeranti=()=>{state.subscriptions++;return Promise.resolve();};
  context.rekodDeny=()=>Promise.resolve();
  return {state,context};
}
async function flush(){for(let n=0;n<12;n++)await Promise.resolve();}
(async()=>{
  // Returning officers who dismissed a previous prompt must still get a user-gesture path.
  for(const standalone of [false,true]){
    const {state,context}=setup('default',{standalone});
    await flush();assert.equal(state.meta.length,0);assert.equal(state.navigations,0);assert.equal(state.prompts,0);
    context.bukaSkippf({preventDefault(){}});
    assert.equal(state.prompts,1,'Request must happen synchronously inside click handler');
    await flush();assert.equal(state.timers.size,0,'Never time out an unanswered permission prompt');
    state.resolvePermission('granted');await flush();assert.equal(state.subscriptions,1);
    [...state.timers.values()].forEach(t=>t.fn());assert.equal(state.navigations,1);
  }
  for(const permission of ['granted','denied',null]){
    const {state,context}=setup(permission,{home:true});
    context.bukaSkippf({preventDefault(){}});await flush();assert.equal(state.prompts,0);
  }
  for(const permission of ['granted','denied']){
    const {state}=setup(permission);await flush();assert.equal(state.meta.length,1,'Retain auto access for settled permissions');
  }
  const dismissed=setup('default',{returning:false});
  dismissed.context.bukaSkippf();dismissed.state.resolvePermission('default');await flush();
  assert.equal(dismissed.state.subscriptions,0);
  [...dismissed.state.timers.values()].forEach(t=>t.fn());assert.equal(dismissed.state.navigations,1);
  const slow=setup('default');slow.context.daftarPeranti=()=>new Promise(resolve=>slow.finish=resolve);
  slow.context.bukaSkippf();slow.state.resolvePermission('granted');await flush();
  const fallback=[...slow.state.timers.values()].find(t=>t.ms===10000);assert.ok(fallback);fallback.fn();
  slow.finish();await flush();[...slow.state.timers.values()].forEach(t=>t.fn());assert.equal(slow.state.navigations,1);
  console.log('PASS: first/returning users, standalone, pending prompt, dismissed/granted/blocked/unsupported permissions, and slow registration.');
})().catch(error=>{console.error(error);process.exitCode=1;});
