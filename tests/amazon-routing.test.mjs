import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  AMAZON_MARKETS,
  AMAZON_PREFERENCE_KEY,
  getAutomaticAmazonRegion,
  getAmazonDestination,
  readAmazonPreference,
  saveAmazonPreference,
} from '../amazon-routing.mjs';

const originalGlobals = new Map(['navigator', 'document', 'location', 'localStorage'].map(
  key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]
));

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
}

function browser({ languages = ['en'], timeZone = 'Etc/UTC', htmlLang = 'en', hostname = 'miloandfiadh.com' } = {}) {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { languages, language: languages[0] } });
  globalThis.document = { documentElement: { lang: htmlLang } };
  globalThis.location = { hostname };
  globalThis.localStorage = memoryStorage();
  mock.method(Intl, 'DateTimeFormat', () => ({ resolvedOptions: () => ({ timeZone }) }));
}

afterEach(() => {
  mock.restoreAll();
  for (const [key, descriptor] of originalGlobals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});

test('routes all 14 requested browser locales to their correct Amazon domains', () => {
  const scenarios = [
    ['en-US', 'US', 'www.amazon.com'],
    ['en-CA', 'CA', 'www.amazon.ca'],
    ['ja-JP', 'JP', 'www.amazon.co.jp'],
    ['en-GB', 'UK', 'www.amazon.co.uk'],
    ['en-AU', 'AU', 'www.amazon.com.au'],
    ['nl-BE', 'BE', 'www.amazon.com.be'],
    ['de-DE', 'DE', 'www.amazon.de'],
    ['es-ES', 'ES', 'www.amazon.es'],
    ['fr-FR', 'FR', 'www.amazon.fr'],
    ['en-IE', 'IE', 'www.amazon.ie'],
    ['it-IT', 'IT', 'www.amazon.it'],
    ['nl-NL', 'NL', 'www.amazon.nl'],
    ['pl-PL', 'PL', 'www.amazon.pl'],
    ['sv-SE', 'SE', 'www.amazon.se'],
  ];
  assert.equal(AMAZON_MARKETS.length, 14);
  for (const [locale, expectedRegion, expectedHost] of scenarios) {
    browser({ languages: [locale] });
    const region = getAutomaticAmazonRegion();
    assert.equal(region, expectedRegion, locale);
    assert.equal(new URL(getAmazonDestination(region)).hostname, expectedHost, locale);
  }
});

test('uses time zones when language settings do not identify a country', () => {
  for (const [timeZone, expected] of [
    ['Europe/Dublin', 'IE'],
    ['Europe/Brussels', 'BE'],
    ['Europe/Warsaw', 'PL'],
    ['Europe/Stockholm', 'SE'],
    ['America/Halifax', 'CA'],
    ['Australia/Adelaide', 'AU'],
    ['Atlantic/Canary', 'ES'],
  ]) {
    browser({ timeZone });
    assert.equal(getAutomaticAmazonRegion(), expected, timeZone);
  }
});

test('preserves the upstream language-first behavior without saving an automatic choice', () => {
  browser({ languages: ['en-US'], timeZone: 'America/Toronto' });
  assert.equal(getAutomaticAmazonRegion(), 'US');
  assert.equal(globalThis.localStorage.getItem('amazonStoreRegion'), null);
  assert.equal(readAmazonPreference(globalThis.localStorage), 'auto');
});

test('uses the supplied US destination for unknown and unsupported countries', () => {
  browser({ languages: ['pt-BR'], timeZone: 'America/Sao_Paulo' });
  assert.equal(getAutomaticAmazonRegion(), 'US');
  assert.equal(getAmazonDestination('BR'), 'https://www.amazon.com/dp/B0FF2T9PVG');
  browser({ languages: ['en-ZA'], timeZone: 'Africa/Johannesburg' });
  assert.equal(getAutomaticAmazonRegion(), 'US');
  assert.equal(getAmazonDestination('https://example.com'), 'https://www.amazon.com/dp/B0FF2T9PVG');
});

test('avoids the five confirmed missing series pages by using local book searches', () => {
  for (const region of ['BE', 'IE', 'NL', 'PL', 'SE']) {
    const url = new URL(getAmazonDestination(region));
    assert.equal(url.protocol, 'https:');
    assert.equal(url.pathname, '/s', region);
    assert.equal(url.searchParams.get('k'), 'Milo and Fiadh Anita Cheng', region);
    assert.equal(url.searchParams.has('tag'), false);
  }
  for (const region of ['US', 'CA', 'JP', 'UK', 'AU', 'DE', 'ES', 'FR', 'IT']) {
    assert.equal(new URL(getAmazonDestination(region)).pathname, '/dp/B0FF2T9PVG', region);
  }
});

test('remembers a manual country selection and can restore automatic selection', () => {
  const storage = memoryStorage();
  assert.equal(readAmazonPreference(storage), 'auto');
  saveAmazonPreference(storage, 'IE');
  assert.equal(readAmazonPreference(storage), 'IE');
  assert.equal(storage.getItem(AMAZON_PREFERENCE_KEY), 'IE');
  saveAmazonPreference(storage, 'auto');
  assert.equal(readAmazonPreference(storage), 'auto');
  assert.equal(storage.getItem(AMAZON_PREFERENCE_KEY), null);
});

test('ignores invalid stored choices and tolerates blocked browser storage', () => {
  const storage = memoryStorage();
  storage.setItem(AMAZON_PREFERENCE_KEY, '__proto__');
  assert.equal(readAmazonPreference(storage), 'auto');
  const unavailable = {
    getItem() { throw new Error('Storage is blocked'); },
    setItem() { throw new Error('Storage is blocked'); },
    removeItem() { throw new Error('Storage is blocked'); },
  };
  assert.equal(readAmazonPreference(unavailable), 'auto');
  assert.doesNotThrow(() => saveAmazonPreference(unavailable, 'CA'));
  assert.doesNotThrow(() => saveAmazonPreference(unavailable, 'auto'));
  assert.equal(readAmazonPreference(undefined), 'auto');
});

test('falls back to US if browser locale information cannot be accessed', () => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    get() { throw new Error('Navigator unavailable'); },
  });
  assert.equal(getAutomaticAmazonRegion(), 'US');
});
