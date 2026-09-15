// EmailJS 공개 설정: 이 네 값을 한 곳에서 관리합니다. 비밀 키를 넣지 마세요.
const EMAILJS_PUBLIC_KEY   = "ey2tZPNxP664HJb2w";
const EMAILJS_SERVICE_ID   = "service_4ajkv8q";
const EMAILJS_TEMPLATE_ID  = "template_57p278m"; // 접수 알림
const EMAILJS_AUTOREPLY_ID = "template_ipef5ua"; // 자동회신

// 배포 주소는 site-config.json에서 내보낼 때 채웁니다.
const SITE_URL = "https://daarm.vercel.app";
const CONTACT_EMAIL = "kkumnalgae1@gmail.com";
document.getElementById('year').textContent = new Date().getFullYear();
document.querySelectorAll('img[data-institute-logo]').forEach(img => {
  img.addEventListener('error', () => { img.hidden = true; });
  if (img.complete && !img.naturalWidth) img.hidden = true;
});
document.querySelectorAll('[data-program]').forEach((link, index) => {
  link.addEventListener('click', () => {
    const field = document.getElementById('inquiry-message');
    document.getElementById('inquiry-program').value = ['business', 'career', 'life'][index];
    if (!field.value.trim()) field.value = `관심 프로그램: ${link.dataset.program}\n교육 대상 및 인원: \n희망 일정: \n문의 내용: `;
  });
});
const form = document.getElementById('inquiry-form');
const consent = document.getElementById('privacy-consent');
const submitButton = document.getElementById('inquiry-submit');
const guard = document.getElementById('submit-guard');
const statusMessage = document.getElementById('form-status');
const consentHelp = document.getElementById('consent-help');
let sending = false;
let agreedAt = '';
function updateConsent() {
  submitButton.disabled = sending || !consent.checked;
  guard.tabIndex = consent.checked ? -1 : 0;
  consentHelp.textContent = consent.checked ? '' : '전송하려면 개인정보 수집 · 이용에 동의해 주세요.';
}
consent.addEventListener('change', () => {
  agreedAt = consent.checked ? new Date().toISOString() : '';
  form.elements.agreed_at.value = agreedAt;
  updateConsent();
});
function explainConsent(event) {
  if (!consent.checked && (!event.key || event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    statusMessage.textContent = '개인정보 수집 · 이용에 동의해 주세요.';
    consent.focus();
  }
}
guard.addEventListener('click', explainConsent);
guard.addEventListener('keydown', explainConsent);
updateConsent();
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending) return;
  if (!consent.checked) {
    statusMessage.textContent = '개인정보 수집 · 이용에 동의해 주세요.';
    consent.focus();
    return;
  }
  // 공백만 입력한 필수 필드도 유효성 검사를 통과하지 못하게 합니다.
  for (const name of ['from_name', 'from_email', 'message']) {
    form.elements[name].value = form.elements[name].value.trim();
  }
  if (!form.reportValidity()) return;
  if (!window.emailjs) {
    statusMessage.textContent = '메일 전송 기능을 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도하거나 ' + CONTACT_EMAIL + '으로 문의해 주세요.';
    return;
  }
  const fields = form.elements;
  fields.to_email.value = CONTACT_EMAIL;
  fields.reply_to.value = fields.from_email.value;
  fields.submitted_at.value = new Date().toISOString();
  fields.page_url.value = SITE_URL + '/#contact';
  fields.agreed_at.value = agreedAt || new Date().toISOString();
  const params = Object.fromEntries(new FormData(form).entries());
  params.inquiry_type = fields.inquiry_type.value ? fields.inquiry_type.selectedOptions[0].textContent : '일반 문의';
  sending = true;
  form.setAttribute('aria-busy', 'true');
  // 전송 도중 입력 변경과 중복 접수를 방지합니다.
  const controls = [...form.querySelectorAll('input, select, textarea')];
  controls.forEach(control => { control.disabled = true; });
  submitButton.textContent = '전송 중…';
  statusMessage.textContent = '문의 내용을 전송하고 있습니다.';
  updateConsent();
  let notified = false;
  try {
    const options = { publicKey: EMAILJS_PUBLIC_KEY };
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, options);
    notified = true;
    // 접수 알림 성공만 문의 전환으로 기록하며 입력 내용은 보내지 않습니다.
    try { window.trackSiteEvent?.("generate_lead"); } catch (_) {}
    // EmailJS의 초당 1회 제한에 맞춰 자동회신을 순서대로 전송합니다.
    await new Promise(resolve => setTimeout(resolve, 1100));
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_ID, params, options);
    statusMessage.textContent = '문의가 접수되었습니다. 입력하신 이메일로 접수 확인 메일을 보냈습니다.';
  } catch (error) {
    statusMessage.textContent = notified
      ? '문의는 접수되었지만 자동회신을 보내지 못했습니다. 다시 제출하지 않으셔도 됩니다. 담당자가 확인 후 답변드리겠습니다.'
      : '문의 전송에 실패했습니다. 잠시 후 다시 시도하거나 ' + CONTACT_EMAIL + '으로 문의해 주세요.';
  } finally {
    controls.forEach(control => { control.disabled = false; });
    if (notified) { form.reset(); agreedAt = ''; }
    sending = false;
    form.removeAttribute('aria-busy');
    submitButton.innerHTML = '이메일로 문의 보내기 <span>↗</span>';
    updateConsent();
  }
});

// 상세 과정에서 넘어온 선택값만 반영합니다.
const chosenProgram = new URLSearchParams(location.search).get('program');
if (['business', 'career', 'life'].includes(chosenProgram)) document.getElementById('inquiry-program').value = chosenProgram;
