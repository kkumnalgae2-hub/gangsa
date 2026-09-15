// 측정 ID는 site-config.json에서 내보냅니다. 미설정 시 외부 요청을 하지 않습니다.
const GA4_MEASUREMENT_ID = "";
(() => {
  if (!/^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID) || location.protocol !== 'https:') return;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  const cleanUrl = location.origin + location.pathname;
  gtag('js', new Date());
  // 문의 입력값, URL 쿼리, 해시는 분석에 전달하지 않습니다.
  gtag('config', GA4_MEASUREMENT_ID, {
    page_location: cleanUrl, page_referrer: '',
    allow_google_signals: false, allow_ad_personalization_signals: false
  });
  window.trackSiteEvent = name => {
    if (['generate_lead', 'contact_phone_click', 'contact_email_click'].includes(name)) {
      gtag('event', name, { page_location: cleanUrl });
    }
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('tel:')) window.trackSiteEvent('contact_phone_click');
    if (href.startsWith('mailto:')) window.trackSiteEvent('contact_email_click');
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
  document.head.appendChild(script);
})();
