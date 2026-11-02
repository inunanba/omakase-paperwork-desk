// DOM wiring regression only. This is not browser layout/screenshot evidence.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class El{
 constructor(){this.textContent='';this.value='';this.hidden=true;this.disabled=false;this.dataset={};this.handlers={};this.children=[];}
 addEventListener(n,f){this.handlers[n]=f;}
 replaceChildren(...children){this.children=children;}
}
const ids=['lang','case','title','privacy','progress','model-state','next-title','quote-title','note-title','next','note','source','state','citations','result','start','model'];
const els=Object.fromEntries(ids.map(n=>[n,new El()]));els.lang.value='ja';els.case.value='renewal';
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const fixed=[...html.matchAll(/data-ui="([^"]+)"/g)].map(m=>{const el=new El();el.dataset.ui=m[1];return el;});
for(const el of fixed)if(['renewal','conflict','injection'].includes(el.dataset.ui))el.tagName='OPTION';
let pending=[];
const document={documentElement:{lang:''},title:'',getElementById:n=>els[n],querySelectorAll:()=>fixed,createElement:()=>new El()};
const sandbox={document,module:{exports:{}},fetch:(path,options)=>new Promise(resolve=>pending.push({path,input:JSON.parse(options.body),resolve}))};
vm.runInNewContext(fs.readFileSync(__dirname+'/app.js','utf8'),sandbox);
const UI=sandbox.module.exports.UI;
const reply=(req,data,ok=true)=>req.resolve({ok,json:async()=>data});
const output={labels:{step:'Next step',quote:'Evidence',note:'Japanese note'},next_step:'Prepare documents',desk_note:'日本語の窓口メモ',source_text:'日本語の原文',status:'SOURCE_BOUND_SAMPLE',citations:[{quote:'日本語の引用'}]};
(async()=>{
 const cases=[];
 for(const lang of ['ja','en','vi']){
  els.lang.value=lang;els.lang.handlers.change();
  assert.equal(document.documentElement.lang,lang);assert.equal(document.title,UI[lang].title);
  for(const el of fixed){assert.equal(typeof el.textContent,'string');assert(el.textContent.length>0);}
  if(lang!=='ja')for(const el of fixed)assert(!/[\u3040-\u30ff\u3400-\u9fff]/.test(el.textContent),'untranslated fixed UI '+el.dataset.ui);
 }
 cases.push('all fixed UI localizes before reading a sample');
 els.lang.value='en';els.lang.handlers.change();
 const start=els.start.handlers.click();reply(pending.shift(),output);await start;
 assert.equal(els.result.hidden,false);assert.equal(els.state.dataset.code,'SOURCE_BOUND_SAMPLE');assert.equal(els.state.textContent,UI.en.states.SOURCE_BOUND_SAMPLE);
 assert.equal(els.source.textContent,'日本語の原文');assert.equal(els.note.textContent,'日本語の窓口メモ');
 cases.push('source quotations and intentional Japanese desk note stay verbatim');
 let model=els.model.handlers.click();reply(pending.shift(),{model_hint:{status:'LOCAL_MODEL_UNAVAILABLE_OR_INVALID',explanation_id:'ask_desk'}});await model;
 assert(els['model-state'].textContent.includes(UI.en.models.LOCAL_MODEL_UNAVAILABLE_OR_INVALID));assert(!/[\u3040-\u30ff\u3400-\u9fff]/.test(els['model-state'].textContent));
 cases.push('model-unavailable state uses selected-language text');
 const stale=els.start.handlers.click(),req=pending.shift();els.lang.value='vi';els.lang.handlers.change();reply(req,output);await stale;
 assert.equal(els.result.hidden,true);assert.equal(els.progress.textContent,'');assert.equal(document.title,UI.vi.title);
 cases.push('late old-language response cannot reopen old guidance');
 for(const status of Object.keys(UI.en.models)){
  model=els.model.handlers.click();reply(pending.shift(),{model_hint:{status,explanation_id:'ask_desk'}});await model;
  assert(els['model-state'].textContent.includes(UI.vi.models[status]));
 }
 cases.push('all three model states localize in Vietnamese');
 for(const changed of ['case','lang']){
  els.state.dataset.code='SOURCE_BOUND_SAMPLE';els['model-state'].dataset.code='LOCAL_RESPONSE_SCHEMA_VERIFIED';
  els.next.textContent='old next';els.note.textContent='old note';els.citations.replaceChildren(new El());
  els[changed].handlers.change();
  assert.equal(els.result.hidden,true);assert(!('code' in els.state.dataset));assert(!('code' in els['model-state'].dataset));
  assert.equal(els.next.textContent,'');assert.equal(els.note.textContent,'');assert.equal(els.citations.children.length,0);
 }
 cases.push('sample and language changes clear hidden guidance and both status codes');
 assert(html.includes('Built with Llama'));assert(html.includes('Llama 3.2 Community License'));
 cases.push('model attribution visible in page source');
 for(const sample of ['renewal','conflict','injection'])for(const lang of ['ja','en','vi']){
  els.case.value=sample;els.lang.value=lang;els.lang.handlers.change();
  assert.equal(els.case.value,sample);
  const option=fixed.find(el=>el.tagName==='OPTION'&&el.dataset.ui===sample);
  assert.equal(option.label,UI[lang][sample]);assert.equal(option.textContent,UI[lang][sample]);
 }
 cases.push('all nine sample/language combinations retain selected value and explicit option label');
 els.case.value='renewal';els.lang.value='en';els.lang.handlers.change();
 let read=els.start.handlers.click();reply(pending.shift(),output);await read;
 let hint=els.model.handlers.click();reply(pending.shift(),{model_hint:{status:'LOCAL_RESPONSE_SCHEMA_VERIFIED',explanation_id:'prepare_documents'}});await hint;
 assert.equal(els['model-state'].dataset.code,'LOCAL_RESPONSE_SCHEMA_VERIFIED');
 read=els.start.handlers.click();reply(pending.shift(),output);await read;
 assert(!('code' in els['model-state'].dataset));assert.equal(els['model-state'].textContent,UI.en.disconnected);
 cases.push('same-selection read after model result clears stale model status');
 els.source.textContent='old source';els.lang.handlers.change();assert.equal(els.source.textContent,'');
 cases.push('selection switch clears hidden source text');
 console.log(JSON.stringify({kind:'FAKE_DOM_WIRING_NOT_BROWSER',scenarios:cases,status:'PASS'}));
})().catch(e=>{console.error(e);process.exit(1)});
