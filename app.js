const UI={
 ja:{title:'おまかせ書類窓口',mark:'紙 → つぎの一歩',tag:'見本で体験',lead:'むずかしい書類を、ひとつずつ。',privacy:'架空の見本のみ。実際の書類や個人情報は送らないでください。',choose:'1. 見本をえらぶ',language:'言語',document:'架空の書類',renewal:'更新のお知らせ',conflict:'期限が二つある書類',injection:'不審な指示がある書類',start:'見本を読み解く',source:'見本文（個人情報を非表示）',model:'ローカルMetaモデルの接続確認',loading:'確認しています…',ready:'見本を確認しました。自動提出はしません。',error:'読み取りに失敗しました。もう一度見本を選んでください。',disconnected:'モデルは未接続です。案内は用意した見本文です。',modelLoading:'モデルを確認しています…',modelError:'接続できません。モデル検証は未完了です。',modelPrefix:'Metaモデル',modelNote:'案内の事実・期限は変更しません。',footer:'写真読取りと実書類への対応は準備中です。資格判断・診断・申請提出はしません。',fiction:'見本文は架空です。実在する役所の情報ではありません。',ocr:'写真のOCRでは期限を誤読することがあります。原本と窓口で確認してください。OCRはこの画面に未接続です。',states:{SOURCE_BOUND_SAMPLE:'見本の根拠に基づく案内',NEEDS_DESK_CONFIRMATION:'窓口での確認が必要',STOPPED_UNTRUSTED_INSTRUCTION:'不審な指示のため停止'},models:{LOCAL_RESPONSE_SCHEMA_VERIFIED:'ローカルモデルの応答形式を確認',LOCAL_MODEL_UNAVAILABLE_OR_INVALID:'モデルに接続できないか、応答が不正',NOT_CALLED_UNSAFE_OR_AMBIGUOUS:'不審または曖昧なためモデル非呼出し'},hints:{prepare_documents:'書類を準備',ask_desk:'窓口へ確認'}},
 en:{title:'Your Paperwork Guide',mark:'Paper → a next step',tag:'Try fictional samples',lead:'Unfamiliar paperwork, one step at a time.',privacy:'Fictional samples only. Do not send real documents or personal information.',choose:'1. Choose a sample',language:'Language',document:'Fictional document',renewal:'Renewal notice',conflict:'Two different deadlines',injection:'Suspicious embedded instructions',start:'Read the sample',source:'Sample text (personal information hidden)',model:'Check the local Meta model',loading:'Checking the sample…',ready:'Sample checked. Nothing is submitted automatically.',error:'Could not read the sample. Please choose a sample again.',disconnected:'Model not connected. Guidance is curated sample text.',modelLoading:'Checking the model…',modelError:'Cannot connect. Model verification is incomplete.',modelPrefix:'Meta model',modelNote:'Facts and deadlines in the guidance do not change.',footer:'Camera input and real-document support are unfinished. No eligibility decisions, diagnoses or application submissions.',fiction:'These examples are fictional, not information from a real government office.',ocr:'Photo OCR can misread deadlines. Check the original and the issuing desk. OCR is not connected to this screen.',states:{SOURCE_BOUND_SAMPLE:'Guidance linked to sample evidence',NEEDS_DESK_CONFIRMATION:'Confirmation at the issuing desk needed',STOPPED_UNTRUSTED_INSTRUCTION:'Stopped: suspicious instructions'},models:{LOCAL_RESPONSE_SCHEMA_VERIFIED:'Local model response format verified',LOCAL_MODEL_UNAVAILABLE_OR_INVALID:'Model unavailable or invalid response',NOT_CALLED_UNSAFE_OR_AMBIGUOUS:'Model not called: suspicious or ambiguous'},hints:{prepare_documents:'Prepare the documents',ask_desk:'Ask the issuing desk'}},
 vi:{title:'Hướng dẫn giấy tờ',mark:'Giấy tờ → bước tiếp theo',tag:'Thử mẫu giả định',lead:'Giấy tờ khó hiểu, từng bước một.',privacy:'Chỉ dùng mẫu giả định. Không gửi giấy tờ thật hoặc thông tin cá nhân.',choose:'1. Chọn một mẫu',language:'Ngôn ngữ',document:'Giấy tờ giả định',renewal:'Thông báo gia hạn',conflict:'Hai hạn nộp khác nhau',injection:'Chỉ dẫn đáng ngờ trong giấy',start:'Đọc mẫu',source:'Nội dung mẫu (đã ẩn thông tin cá nhân)',model:'Kiểm tra mô hình Meta cục bộ',loading:'Đang kiểm tra mẫu…',ready:'Đã kiểm tra mẫu. Không tự động nộp hồ sơ.',error:'Không đọc được mẫu. Vui lòng chọn lại mẫu.',disconnected:'Chưa kết nối mô hình. Hướng dẫn là văn bản mẫu soạn sẵn.',modelLoading:'Đang kiểm tra mô hình…',modelError:'Không kết nối được. Chưa hoàn tất kiểm chứng mô hình.',modelPrefix:'Mô hình Meta',modelNote:'Không thay đổi thông tin và hạn nộp trong hướng dẫn.',footer:'Chưa hoàn tất đọc ảnh và hỗ trợ giấy tờ thật. Không quyết định điều kiện hưởng trợ cấp, chẩn đoán hoặc nộp hồ sơ.',fiction:'Các mẫu này là giả định, không phải thông tin của cơ quan thật.',ocr:'OCR ảnh có thể đọc sai hạn nộp. Hãy kiểm tra bản gốc và hỏi nơi cấp giấy. OCR chưa được kết nối với màn hình này.',states:{SOURCE_BOUND_SAMPLE:'Hướng dẫn dựa trên nội dung mẫu',NEEDS_DESK_CONFIRMATION:'Cần xác nhận tại nơi cấp giấy',STOPPED_UNTRUSTED_INSTRUCTION:'Đã dừng vì chỉ dẫn đáng ngờ'},models:{LOCAL_RESPONSE_SCHEMA_VERIFIED:'Đã kiểm tra định dạng phản hồi mô hình cục bộ',LOCAL_MODEL_UNAVAILABLE_OR_INVALID:'Mô hình không sẵn sàng hoặc phản hồi không hợp lệ',NOT_CALLED_UNSAFE_OR_AMBIGUOUS:'Không gọi mô hình: đáng ngờ hoặc chưa rõ'},hints:{prepare_documents:'Chuẩn bị giấy tờ',ask_desk:'Hỏi nơi cấp giấy'}}
};
if(typeof module!=='undefined')module.exports={UI};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);
 let epoch=0;
 const lang=()=>UI[$('lang').value]?$('lang').value:'ja';
 const text=()=>UI[lang()];
 const key=()=>$('case').value+'|'+lang();
 function translate(){
  const selectedSample=$('case').value;
  const t=text();document.documentElement.lang=lang();document.title=t.title;
  document.querySelectorAll('[data-ui]').forEach(el=>{
   const label=t[el.dataset.ui];
   if(el.tagName==='OPTION')el.label=label;
   el.textContent=label;
  });
  // Keep the selected value while native option labels are localized.
  $('case').value=selectedSample;
  $('title').textContent=t.title;$('privacy').textContent=t.privacy;
  $('progress').textContent='';$('model-state').textContent=t.disconnected;
  delete $('model-state').dataset.code;delete $('state').dataset.code;
  $('next').textContent='';$('note').textContent='';$('citations').replaceChildren();
  $('source').textContent='';
 }
 async function call(path){const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({case:$('case').value,lang:lang()})});if(!response.ok)throw Error('request failed');return response.json();}
 function render(d){
  delete $('model-state').dataset.code;
  const t=text();$('next-title').textContent=d.labels.step;$('quote-title').textContent=d.labels.quote;$('note-title').textContent=d.labels.note;$('next').textContent=d.next_step;$('note').textContent=d.desk_note;$('source').textContent=d.source_text;
  $('state').dataset.code=d.status;$('state').textContent=t.states[d.status]||t.error;
  $('citations').replaceChildren(...d.citations.map(c=>{const li=document.createElement('li');li.textContent=c.quote;return li;}));$('result').hidden=false;$('model-state').textContent=t.disconnected;
 }
 $('start').addEventListener('click',async()=>{
  const version=++epoch,chosen=key();$('start').disabled=true;$('progress').textContent=text().loading;
  try{const d=await call('/api/assist');if(version===epoch&&chosen===key()){render(d);$('progress').textContent=text().ready;}}
  catch(e){if(version===epoch)$('progress').textContent=text().error;}
  finally{$('start').disabled=false;}
 });
 $('model').addEventListener('click',async()=>{
  const version=epoch,chosen=key();$('model').disabled=true;$('model-state').textContent=text().modelLoading;
  try{const d=await call('/api/model-hint');if(version===epoch&&chosen===key()){
   const t=text(),h=d.model_hint;$('model-state').dataset.code=h.status;
   $('model-state').textContent=t.modelPrefix+': '+(t.models[h.status]||t.modelError)+' / '+(t.hints[h.explanation_id]||t.modelError)+' — '+t.modelNote;
  }}catch(e){if(version===epoch)$('model-state').textContent=text().modelError;}finally{$('model').disabled=false;}
 });
 for(const id of ['case','lang'])$(id).addEventListener('change',()=>{epoch++;$('result').hidden=true;translate();});
 translate();
}
