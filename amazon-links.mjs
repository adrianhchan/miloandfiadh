import {
  AMAZON_MARKETS,
  AMAZON_PREFERENCE_KEY,
  getAmazonDestination,
  getAmazonMarket,
  getAutomaticAmazonRegion,
  readAmazonPreference,
  saveAmazonPreference,
} from './amazon-routing.mjs';

const links = [...document.querySelectorAll('[data-amazon-link]')];
const picker = document.querySelector('.amazon-store-picker');
const select = document.querySelector('#amazon-store');
const status = document.querySelector('#amazon-store-status');
const originalLabels = new Map(links.map(link => [
  link,
  link.getAttribute('aria-label') || link.innerText.trim().replace(/\s+/g, ' '),
]));

let storage;
try {
  storage = window.localStorage;
} catch {
  // Private browsing or browser settings can prevent storage access.
}

let preference = readAmazonPreference(storage);

function updateAmazonLinks() {
  const automatic = getAmazonMarket(getAutomaticAmazonRegion());
  const market = preference === 'auto' ? automatic : getAmazonMarket(preference);

  for (const link of links) {
    link.href = getAmazonDestination(market.code, link.dataset.amazonLink || 'series');
    link.dataset.amazonStore = market.code;
    link.setAttribute('aria-label', originalLabels.get(link) + ' (' + market.name + ')');
  }

  if (select) {
    select.options[0].textContent = 'Automatic (' + automatic.name + ')';
    select.value = preference;
  }
  if (status) {
    status.textContent = 'Amazon links now use the ' + market.name + ' store.';
  }
}

if (picker && select) {
  for (const market of [...AMAZON_MARKETS].sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const option = document.createElement('option');
    option.value = market.code;
    option.textContent = market.name + ' · ' + market.domain;
    select.append(option);
  }

  select.addEventListener('change', () => {
    preference = select.value;
    saveAmazonPreference(storage, preference);
    updateAmazonLinks();
  });

  picker.hidden = false;
}

updateAmazonLinks();

// Keep tabs in sync when a visitor chooses a store elsewhere on this website.
window.addEventListener('storage', event => {
  if (event.key === AMAZON_PREFERENCE_KEY || event.key === null) {
    preference = readAmazonPreference(storage);
    updateAmazonLinks();
  }
});
