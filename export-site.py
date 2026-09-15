"""기존 정적 파일을 갱신하고 단독 실행 HTML과 Vercel 배포 파일을 내보냅니다."""
from pathlib import Path
import base64,json,re,shutil,hashlib
from datetime import datetime
from zoneinfo import ZoneInfo
from xml.sax.saxutils import escape

ROOT=Path(__file__).resolve().parent
config=json.loads((ROOT/'site-config.json').read_text(encoding='utf-8'))
base=config['siteUrl'].rstrip('/')
dist=ROOT/'dist';out=ROOT/'output/website';out.mkdir(parents=True,exist_ok=True)
old_match=re.search(r'<link rel="canonical" href="(https://[^"/]+)',(dist/'index.html').read_text(encoding='utf-8'))
old_base=old_match.group(1) if old_match else base
names=['robots.txt','sitemap.xml','llms.txt','email_template_notify.html','email_template_autoreply.html','emailjs_setting_guide.html']
# 배포 문서를 포함한 주소의 원본은 site-config.json 한 곳입니다.
for p in list(dist.glob('*.html'))+[dist/'app.js']+[ROOT/n for n in names]:
    s=p.read_text(encoding='utf-8').replace(old_base,base)
    p.write_text(s,encoding='utf-8')
analytics=dist/'analytics.js'
a=analytics.read_text(encoding='utf-8')
a=re.sub(r'const GA4_MEASUREMENT_ID = .*?;', 'const GA4_MEASUREMENT_ID = '+json.dumps(config.get('ga4MeasurementId',''))+';', a)
analytics.write_text(a,encoding='utf-8')

today=datetime.now(ZoneInfo('Asia/Seoul')).date().isoformat()
xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for page in config['pages']:
    xml+=f'  <url><loc>{escape(base+page["path"])}</loc><lastmod>{page.get("lastmod",today)}</lastmod><changefreq>{page["changefreq"]}</changefreq><priority>{page["priority"]}</priority></url>\n'
(ROOT/'sitemap.xml').write_text(xml+'</urlset>\n',encoding='utf-8')
llms=f'# {config["siteName"]}\n\n> {config["description"]}\n\n## 핵심 페이지\n'
for page in config['pages']:
    llms+=f'- [{page["title"]}]({base+page["path"]}): {page["description"]}\n'
llms+=f'\n## 문의\n- [강의 문의 및 신청]({base}/#contact): 대상과 목적에 맞춘 AI 교육 문의\n- 이메일: {config["email"]}\n'
(ROOT/'llms.txt').write_text(llms,encoding='utf-8')
for name in names: shutil.copyfile(ROOT/name,dist/name)
# 짧은 파일명으로도 같은 단독 실행 안내서를 제공합니다.
shutil.copyfile(ROOT/'emailjs_setting_guide.html',ROOT/'guide.html')
shutil.copyfile(ROOT/'guide.html',dist/'guide.html')
# 내용이 바뀐 파일만 새 버전으로 읽어 이전 브라우저 캐시를 피합니다.
p=dist/'index.html'
s=re.sub(r'/(styles\.css|works\.css|app\.js)(?:\?[^"\s>]+)?',lambda m:'/'+m.group(1)+'?v='+hashlib.sha256((dist/m.group(1)).read_bytes()).hexdigest()[:10],p.read_text(encoding='utf-8'))
p.write_text(s,encoding='utf-8')
# 검색 공유 이미지와 실제 공개 교육과정 주소를 함께 제공합니다.
for p in dist.iterdir():
    if p.is_dir(): shutil.copytree(p,out/p.name,dirs_exist_ok=True)
    elif p.name!='index.html': shutil.copyfile(p,out/p.name)
s=(dist/'index.html').read_text(encoding='utf-8')
s=re.sub(r'<link rel="stylesheet" href="/styles\.css[^\"]*">',lambda m:'<style>'+(dist/'styles.css').read_text(encoding='utf-8')+'</style>',s)
s=re.sub(r'<link rel=stylesheet href=/works\.css[^>]*>',lambda m:'<style>'+(dist/'works.css').read_text(encoding='utf-8')+'</style>',s)
s=re.sub(r'<script src="/app\.js[^"]*" defer></script>',lambda m:'<script>document.addEventListener("DOMContentLoaded",()=>{\n'+(dist/'app.js').read_text(encoding='utf-8')+'\n});</script>',s)
def embed(m):
    prefix,name=m.group(1),m.group(2);p=dist/name
    mime={'.jpg':'image/jpeg','.png':'image/png','.html':'text/html;charset=utf-8'}[p.suffix]
    return prefix+'"data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()+'"'
s=re.sub(r'(src=|href=)"/((?:assets/[^\"]+)|curriculum\.html)"',embed,s)
s=s.replace('<script src="analytics.js" defer></script>', '<script>'+analytics.read_text(encoding='utf-8')+'</script>')
assert not re.search(r'(?:src|href)="/',s)
(out/'index.html').write_text(s,encoding='utf-8')
print('내보내기 완료:',out)
