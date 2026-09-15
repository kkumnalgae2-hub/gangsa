from pathlib import Path
import json,re,xml.etree.ElementTree as ET
from urllib.parse import urlsplit,unquote
r=Path.cwd(); c=json.loads((r/'site-config.json').read_text(encoding='utf-8')); d=r/'dist'
for page in c['pages']:
 p=d/(page['path'].lstrip('/') or 'index.html');s=p.read_text(encoding='utf-8')
 assert f'href="{c["siteUrl"]}{page["path"]}"' in s,p
 for blob in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):
  data=json.loads(blob);assert data['@graph'][0]['contactPoint']['telephone']=='+82-10-5967-8219'
 for link in re.findall(r'(?:href|src)="([^"]+)"',s):
  u=urlsplit(link)
  if u.scheme or not u.path:continue
  target=d/unquote(u.path.lstrip('/'))
  assert target.exists(),(p,link)
 assert 'analytics.js' in s
locs=[e.text for e in ET.parse(r/'sitemap.xml').findall('.//{*}loc')]
assert set(locs)=={c['siteUrl']+p['path'] for p in c['pages']}
assert len(locs)==6
print('통과: 공개 6페이지 canonical, 구조화 데이터, 내부 파일 링크, 분석 스크립트, 사이트맵')
