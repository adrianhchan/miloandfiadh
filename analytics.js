(() => {
  const ID = 'G-6GFF7V2JGX';
  const KEY = 'miloandfiadh.analyticsConsent';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const production = location.protocol === 'https:' && ['miloandfiadh.com', 'www.miloandfiadh.com'].includes(location.hostname);
  const disableKey = `ga-disable-${ID}`;
  let initialized = false;
  let remembered = true;
  let allowed = false;

  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      const age = Date.now() - value?.savedAt;
      return value?.version === 1 && ['granted', 'denied'].includes(value.analytics)
        && Number.isFinite(age) && age >= 0 && age < MAX_AGE ? value.analytics : 'denied';
    } catch { return 'denied'; }
  };

  const clearCookies = () => {
    if (!production) return;
    const names = document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]);
    for (const name of names.filter(name => name === '_ga' || name === '_ga_6GFF7V2JGX')) {
      for (const domain of ['', location.hostname, '.miloandfiadh.com']) {
        document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''} SameSite=Lax`;
      }
    }
  };

  const safeReferrer = () => {
    try {
      const url = new URL(document.referrer);
      return ['http:', 'https:'].includes(url.protocol) ? `${url.origin}/` : '';
    } catch { return ''; }
  };

  const start = () => {
    if (!production || initialized || !allowed) return;
    initialized = true;
    window[disableKey] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    });
    window.gtag('js', new Date());
    const config = {
      page_location: `${location.origin}${location.pathname}`,
      page_referrer: safeReferrer(),
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    };
    // Preserve conventional campaign labels without sending arbitrary URL queries.
    const params = new URLSearchParams(location.search);
    for (const [query, field] of Object.entries({
      utm_source: 'campaign_source', utm_medium: 'campaign_medium', utm_campaign: 'campaign_name',
      utm_term: 'campaign_term', utm_content: 'campaign_content',
    })) {
      const value = params.get(query);
      if (value && /^[a-zA-Z0-9][a-zA-Z0-9 _.-]{0,79}$/.test(value)) config[field] = value;
    }
    window.gtag('config', ID, config);
    const tag = document.createElement('script');
    tag.id = 'optional-google-analytics';
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
    document.head.append(tag);
  };

  const stop = () => {
    window[disableKey] = true;
    document.querySelector('#optional-google-analytics')?.remove();
    clearCookies();
    // Reload after withdrawal to remove code/listeners already loaded by Google.
    if (initialized) location.reload();
  };

  const render = () => {
    document.querySelectorAll('[data-analytics-controls]').forEach(panel => { panel.hidden = false; });
    document.querySelectorAll('[data-analytics-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String((button.dataset.analyticsChoice === 'granted') === allowed));
    });
    document.querySelectorAll('[data-analytics-status]').forEach(status => {
      status.textContent = `Optional analytics is ${allowed ? 'allowed' : 'off'}${remembered ? ' in this browser.' : ' for this page. Browser storage is unavailable, so your choice could not be saved.'}`;
    });
  };

  const apply = choice => {
    allowed = choice === 'granted';
    window[disableKey] = !allowed || !production;
    render();
    if (allowed) start();
    else stop();
  };

  document.querySelectorAll('[data-analytics-choice]').forEach(button => {
    button.addEventListener('click', () => {
      const choice = button.dataset.analyticsChoice;
      if (!['granted', 'denied'].includes(choice)) return;
      try {
        localStorage.setItem(KEY, JSON.stringify({ version: 1, analytics: choice, savedAt: Date.now() }));
        remembered = true;
      } catch { remembered = false; }
      apply(choice);
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === null) apply(read());
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && remembered) apply(read());
  });
  apply(read());
})();
