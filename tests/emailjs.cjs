// 실제 발송 없이 전송 순서·실패 복구·동의 기록을 검증합니다.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('dist/app.js','utf8');
const html=fs.readFileSync('dist/index.html','utf8');
const expected='from_name from_email phone company inquiry_type message to_email reply_to submitted_at page_url privacy_agreed agreed_at'.split(' ');
const formHtml=html.match(/<form id="inquiry-form">([\s\S]*?)<\/form>/)[1];
assert.deepEqual([...formHtml.matchAll(/name="([^"]+)"/g)].map(m=>m[1]).sort(),expected.slice().sort());
function element(){return {value:'',checked:false,disabled:false,textContent:'',events:{},addEventListener(k,f){this.events[k]=f},focus(){this.focused=true},setAttribute(){},removeAttribute(){}}}
function setup(mode='success'){
  const fields=Object.fromEntries(expected.map(n=>[n,element()]));
  Object.assign(fields.from_name,{value:'  테스트 사용자  '}); fields.from_email.value='test@example.com';fields.message.value='  전송 검증  ';
  fields.inquiry_type.value='custom';fields.inquiry_type.selectedOptions=[{textContent:'기관 맞춤 교육 / 상담 후 결정'}];fields.privacy_agreed.value='동의함';
  const nodes=Object.fromEntries(['year','inquiry-form','privacy-consent','inquiry-submit','submit-guard','form-status','consent-help'].map(id=>[id,element()]));
  nodes['privacy-consent']=fields.privacy_agreed;
  const form=nodes['inquiry-form'];form.elements=fields;form.querySelectorAll=()=>Object.values(fields);form.reportValidity=()=>!!fields.from_name.value&&fields.from_email.value.includes('@')&&!!fields.message.value;
  form.reset=()=>{Object.values(fields).forEach(f=>{f.value='';f.checked=false});};
  let calls=[],delays=[];
  const events=[];
  const context={URLSearchParams,location:{search:''},document:{getElementById:id=>nodes[id],querySelectorAll:()=>[]},Date,Promise,Object,setTimeout:(fn,ms)=>{delays.push(ms);fn()},FormData:class{constructor(){this.entries=()=>Object.entries(fields).filter(([n,f])=>n!=='privacy_agreed'||f.checked).map(([n,f])=>[n,f.value])[Symbol.iterator]()}},window:{trackSiteEvent:name=>events.push(name)}};
  if(mode!=='no-sdk')context.window.emailjs={send:async(service,template,params,options)=>{calls.push({service,template,params:{...params},options});if(mode==='failure'||mode==='partial'&&calls.length===2)throw Error('대체 전송 오류');return {status:200}}};
  vm.runInNewContext(source,context);
  return {nodes,fields,calls,delays,events,submit:()=>form.events.submit({preventDefault(){}}),agree:()=>{fields.privacy_agreed.checked=true;fields.privacy_agreed.events.change();}};
}
(async()=>{
  let t=setup();await t.submit();assert.equal(t.calls.length,0);assert(t.nodes['inquiry-submit'].disabled);assert.match(t.nodes['form-status'].textContent,/동의해/);
  t.agree();assert(!t.nodes['inquiry-submit'].disabled);assert.match(t.fields.agreed_at.value,/Z$/);t.fields.from_name.value='  ';await t.submit();assert.equal(t.calls.length,0);
  t=setup();t.agree();const first=t.submit();await t.submit();await first;assert.equal(t.calls.length,2);assert.deepEqual(t.events,['generate_lead']);assert.deepEqual(t.calls.map(x=>x.template),['template_57p278m','template_ipef5ua']);assert(t.delays[0]>=1000);assert.deepEqual(Object.keys(t.calls[0].params).sort(),expected.slice().sort());assert.equal(t.calls[0].params.privacy_agreed,'동의함');assert.match(t.calls[0].params.agreed_at,/Z$/);assert.equal(t.calls[0].params.reply_to,'test@example.com');assert.equal(t.fields.from_name.value,'');assert(t.nodes['inquiry-submit'].disabled);assert.match(t.nodes['form-status'].textContent,/접수되었습니다/);
  t=setup('failure');t.agree();await t.submit();assert.equal(t.calls.length,1);assert.equal(t.events.length,0);assert.equal(t.fields.from_name.value,'테스트 사용자');assert(!t.nodes['inquiry-submit'].disabled);assert.match(t.nodes['form-status'].textContent,/실패/);
  t=setup('partial');t.agree();await t.submit();assert.equal(t.calls.length,2);assert.deepEqual(t.events,['generate_lead']);assert.match(t.nodes['form-status'].textContent,/다시 제출하지/);assert.equal(t.fields.from_name.value,'');
  t=setup('no-sdk');t.agree();await t.submit();assert.equal(t.calls.length,0);assert.match(t.nodes['form-status'].textContent,/불러오지/);
  console.log('통과: 정확한 12개 필드, 미동의 차단, 공백 필수값, 순차 발송, 중복 차단, 동의 시각, 성공 초기화, 실패 보존, 자동회신 부분 실패, CDN 실패');
})().catch(e=>{console.error(e);process.exit(1)});
