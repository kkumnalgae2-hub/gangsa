'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-program]').forEach(link => {
  link.addEventListener('click', () => {
    const field = document.getElementById('inquiry-message');
    const values = ['business', 'career', 'life'];
    document.getElementById('inquiry-program').value = values[[...document.querySelectorAll('[data-program]')].indexOf(link)];
    if (!field.value.trim()) field.value = `관심 프로그램: ${link.dataset.program}\n교육 대상 및 인원: \n희망 일정: \n문의 내용: `;
  });
});
document.getElementById('inquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = `[강의 문의] ${data.get('organization') || data.get('name')}`;
  const program = form.elements.program;
  const programName = program.value ? program.options[program.selectedIndex].textContent : '미선택';
  const body = `성함: ${data.get('name')}\n기관명: ${data.get('organization') || '미입력'}\n회신 연락처: ${data.get('contact')}\n관심 프로그램: ${programName}\n\n희망 강의 내용\n${data.get('message')}\n\n개인정보 수집·이용 동의: 동의함\n안내 버전: 2026-09-13 (문의 상담 종료 시까지 보유 후 파기)`;
  window.location.href = `mailto:kkumnalgae1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.getElementById('form-status').textContent = '이메일 앱에서 내용을 확인하고 전송해 주세요. 앱이 열리지 않으면 kkumnalgae1@gmail.com으로 직접 문의해 주세요.';
});
