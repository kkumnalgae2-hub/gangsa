# 김다감 강사 랜딩페이지

심리·직업상담과 생성형 AI 실전 교육을 소개하는 반응형 정적 웹사이트입니다.

## 구성

- `dist/index.html`: 소개, 프로그램, 실제 도서·음악 작품, 교육 사례, 전문 자격, FAQ, 문의
- `dist/styles.css`: 반응형 디자인
- `dist/app.js`: 프로그램 문의 선택, 개인정보 동의 확인, EmailJS 알림 및 자동회신
- `dist/curriculum.html`: 다운로드 및 인쇄 가능한 교육과정 안내
- `vercel.json`: Vercel 정적 배포 설정 (출력 폴더 `dist`)

## 실행 및 배포

별도 설치나 빌드가 필요 없습니다. 로컬 HTTP 서버로 `dist`를 열면 됩니다.
Vercel에서 이 저장소를 가져오고 Framework Preset을 Other로 설정합니다.
출력 폴더는 `vercel.json`의 `dist`를 사용합니다.

## 문의 동작

문의 폼은 EmailJS CDN SDK로 접수 알림과 자동회신을 순서대로 전송합니다. 알림이 성공하고 자동회신만 실패하면 접수 완료 사실을 안내하여 중복 제출을 방지합니다. 전송 실패 시 입력 내용은 유지됩니다.
공개 문의 이메일: kkumnalgae1@gmail.com / 전화: 010-5967-8219

기획서·이력서·교육계획안 원본과 로컬 검수 자료는 업로드에서 제외됩니다.
메인과 작품 섹션의 표지는 강사가 제공한 실제 작품 이미지입니다. 프로그램 카드의 미니 화면은 교육 결과물 디자인 예시입니다.

작품: 엄마, 나 사실 힘들어(POD·전자출판), 당신이 찾는 상담자 50인(종이도서 공저), 단지 속 너(5곡 수록 1집), 그 옛날(싱글 BGM), 시간이 남긴 너(싱글 앨범).


문의 폼은 미리 선택되지 않은 필수 개인정보 동의를 포함합니다. 동의 여부와 체크 시각, 접수 시각을 메일에 전달합니다. 보유기간은 문의 처리 완료 후 1년이며, 이메일 보관함의 자동 삭제 기능은 구현되어 있지 않습니다.

## 검색 파일과 설정 안내

- `site-config.json`: 배포 주소, 사이트 소개, 공개 페이지 목록의 원본입니다.
- `robots.txt`, `sitemap.xml`, `llms.txt`: 검색 및 AI 참조용 파일입니다. 루트 원본을 `dist`와 배포 폴더에도 제공합니다.
- `email_template_notify.html`, `email_template_autoreply.html`: EmailJS 본문 원본입니다.
- `emailjs_setting_guide.html`: 두 본문 전체와 복사 버튼이 포함된 단독 실행 설정 안내서입니다. 검색 목록에서는 제외합니다.
- `export-site.py`: `python export-site.py`로 주소를 반영하고 검색 파일 및 `output/website` 배포 폴더를 갱신합니다. 새로운 프레임워크나 npm 설치는 필요 없습니다.

메인 원본은 `dist/index.html`이며 `output/website/index.html`은 생성 파일입니다. 변경 후 내보내기를 실행하세요. EmailJS 상수 네 개는 `dist/app.js` 상단에서만 수정합니다. URL을 변경할 때는 `site-config.json`의 `siteUrl`만 변경하고 내보내기를 실행합니다.

EmailJS 서비스·템플릿 저장과 Gmail 전달/라벨은 운영자가 안내서에 따라 설정해야 합니다. 실제 수신 확인은 알림·자동회신·네이버 전달·라벨을 각각 확인합니다. 개발 검증에서 대체 전송 함수를 사용한 테스트는 실제 이메일 수신을 의미하지 않습니다.

## 방문 분석과 문의 전환

- `site-config.json`의 `ga4MeasurementId`에 실제 G- 측정 ID를 넣고 `export-site.py`를 실행합니다. 현재는 미설정이며 외부 분석 요청을 하지 않습니다.
- GA4 웹 스트림에서 향상된 측정의 양식 상호작용 자동 수집은 끕니다. 입력한 이름, 이메일, 전화번호와 문의 내용은 분석 이벤트에 전달하지 않습니다.
- `generate_lead`: EmailJS 접수 알림 전송이 성공한 경우 한 번 기록합니다. 자동회신 실패는 이미 접수된 문의를 중복 집계하지 않습니다.
- `contact_phone_click`, `contact_email_click`: 연락 링크 클릭을 별도 측정합니다. 실제 통화나 이메일 발송 완료를 의미하지 않습니다.
- GA4 실시간 보고서에서 이벤트를 확인한 후 `generate_lead`를 주요 이벤트로 지정합니다. 실제 데이터 수신 검증은 측정 ID 연결 후 수행합니다.
- 검색용 제목은 수정했지만 검색엔진의 실제 표시는 재수집 후 반영되며 검색엔진이 다른 제목을 선택할 수 있습니다.

검증: `node tests/emailjs.cjs`, `node tests/analytics.cjs`, `python tests/site.py`.
