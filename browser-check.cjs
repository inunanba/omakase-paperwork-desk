// Existing browser runtime only. Model endpoint is stubbed for UI-state regression, not LLM evidence.
const {chromium}=require(process.env.PW_PATH||'playwright');
const {UI}=require('./app.js');
const port=Number(process.env.PORT||8765);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('invalid PORT');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PW_EXECUTABLE_PATH?{executablePath:process.env.PW_EXECUTABLE_PATH}:{})});
 try{
  const observations=[];
  for(const width of [390,1024]){
   const page=await browser.newPage({viewport:{width,height:844}});
   await page.route('**/api/model-hint',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({model_hint:{status:'LOCAL_RESPONSE_SCHEMA_VERIFIED',explanation_id:'prepare_documents'}})}));
   await page.goto('http://127.0.0.1:'+port+'/');
   for(const sample of ['renewal','conflict','injection'])for(const lang of ['ja','en','vi']){
    await page.selectOption('#case',sample);await page.selectOption('#lang',lang);
    const selected=await page.locator('#case').evaluate(el=>({value:el.value,index:el.selectedIndex,label:el.selectedOptions[0]?.label,text:el.selectedOptions[0]?.text,visible:el.getBoundingClientRect().width>0}));
    if(selected.value!==sample||selected.index<0||selected.label!==UI[lang][sample]||selected.text!==UI[lang][sample]||!selected.visible)throw Error('selected sample label/value mismatch: '+JSON.stringify(selected));
    await page.click('#start');await page.locator('#result').waitFor({state:'visible'});
    await page.click('#model');await page.waitForFunction(()=>!document.querySelector('#model').disabled);
    await page.click('#start');await page.waitForFunction(()=>!document.querySelector('#start').disabled);
    const result=await page.evaluate(()=>({lang:document.documentElement.lang,modelCode:document.querySelector('#model-state').dataset.code||null,state:document.querySelector('#state').dataset.code,sw:document.documentElement.scrollWidth,width:innerWidth}));
    if(result.modelCode!==null||result.sw>result.width)throw Error('stale model state or horizontal overflow');
    await page.selectOption('#case',sample==='renewal'?'conflict':'renewal');
    const cleared=await page.evaluate(()=>({hidden:document.querySelector('#result').hidden,codes:['state','model-state'].some(id=>'code' in document.getElementById(id).dataset),text:['next','note','citations','source'].map(id=>document.getElementById(id).textContent)}));
    if(!cleared.hidden||cleared.codes||cleared.text.some(Boolean))throw Error('stale hidden result');
    observations.push({sample,lang,width,selected,result});
   }
   await page.close();
  }
  console.log(JSON.stringify({status:'PASS',cases:observations.length,observations,model:'UI_STUB_ONLY_NOT_LIVE_MODEL',notice:'no OCR/native zoom/video evidence'}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
