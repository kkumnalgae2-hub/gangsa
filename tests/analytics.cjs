const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('dist/analytics.js','utf8');
function run(active){let scripts=[],handlers={};const c={location:{protocol:'https:',origin:'https://test.example',pathname:'/index.html',search:'?email=secret'},window:{},document:{addEventListener:(n,f)=>handlers[n]=f,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}}};vm.runInNewContext(active?source.replace('= ""','= "G-TEST123"'):source,c);return {c,scripts,handlers};}
let t=run(false);assert.equal(t.scripts.length,0);
t=run(true);t.c.window.trackSiteEvent('generate_lead');t.c.window.trackSiteEvent('forbidden');t.handlers.click({target:{closest:()=>({getAttribute:()=> 'tel:123'})}});assert.equal(t.scripts.length,1);assert.equal(t.c.window.dataLayer.length,4);assert(!JSON.stringify(t.c.window.dataLayer).includes('secret'));console.log('통과: ID 미설정 요청 없음, 성공·전화 이벤트, 허용 목록, 쿼리 제외');
