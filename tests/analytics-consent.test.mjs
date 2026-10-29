import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../analytics.js', import.meta.url), 'utf8');
const KEY = 'miloandfiadh.analyticsConsent';
const NOW = Date.UTC(2026, 9, 29);
const stored = (analytics, savedAt = NOW) => JSON.stringify({ version: 1, analytics, savedAt });

function setup({ choice, host = 'miloandfiadh.com', blocked = false, search = '' } = {}) {
  const state = new Map(choice ? [[KEY, choice]] : []);
  const tags = [];
  const deleted = [];
  const panel = { hidden: true };
  const status = {};
  const buttons = ['granted', 'denied'].map(analyticsChoice => Object.assign(new EventTarget(), {
    dataset: { analyticsChoice }, attributes: {}, setAttribute(key, value) { this.attributes[key] = value; },
  }));
  const document = Object.assign(new EventTarget(), {
    visibilityState: 'visible', referrer: 'https://example.com/story?email=private@example.com',
    head: { append(tag) { tags.push(tag); } },
    createElement: () => ({ remove() { this.removed = true; } }),
    querySelector: () => tags.find(tag => !tag.removed),
    querySelectorAll(selector) {
      return ({ '[data-analytics-controls]': [panel], '[data-analytics-choice]': buttons, '[data-analytics-status]': [status] })[selector] || [];
    },
  });
  Object.defineProperty(document, 'cookie', {
    get: () => '_ga=old; _ga_6GFF7V2JGX=old; other=keep',
    set: value => deleted.push(value),
  });
  const window = new EventTarget();
  let reloads = 0;
  class Clock extends Date { static now() { return NOW; } }
  runInNewContext(source, {
    window, document, Date: Clock, URL, URLSearchParams,
    location: { protocol: 'https:', hostname: host, origin: `https://${host}`, pathname: '/privacy.html', search, reload() { reloads++; } },
    localStorage: {
      getItem(key) { if (blocked) throw new Error('Blocked'); return state.get(key) || null; },
      setItem(key, value) { if (blocked) throw new Error('Blocked'); state.set(key, value); },
    },
  });
  return { window, document, tags, deleted, panel, status, buttons, state, reloads: () => reloads, click: choice => buttons[choice === 'granted' ? 0 : 1].dispatchEvent(new Event('click')) };
}

test('fresh visitors, refusal, and invalid/expired choices make no Google requests', () => {
  for (const choice of [undefined, stored('denied'), 'bad-json', stored('granted', 0), stored('granted', NOW + 1), stored('other')]) {
    const app = setup({ choice });
    assert.equal(app.tags.length, 0);
    assert.equal(app.window.dataLayer, undefined);
    assert.equal(app.window['ga-disable-G-6GFF7V2JGX'], true);
    assert.equal(app.panel.hidden, false);
    assert.equal(app.buttons[1].attributes['aria-pressed'], 'true');
  }
});

test('explicit opt-in loads the existing tag once, remembers consent, and bounds attribution data', () => {
  const app = setup({ search: '?utm_source=instagram&utm_campaign=winter_reads&utm_content=private%40example.com&email=private%40example.com#private' });
  app.click('granted');
  app.click('granted');
  assert.equal(app.tags.length, 1);
  assert.equal(app.tags[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-6GFF7V2JGX');
  assert.equal(JSON.parse(app.state.get(KEY)).analytics, 'granted');
  const config = app.window.dataLayer.find(args => args[0] === 'config')[2];
  assert.equal(config.page_location, 'https://miloandfiadh.com/privacy.html');
  assert.equal(config.page_referrer, 'https://example.com/');
  assert.equal(config.campaign_source, 'instagram');
  assert.equal(config.campaign_name, 'winter_reads');
  assert.equal(config.campaign_content, undefined);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
});

test('return visits can use a valid saved grant, and withdrawing stops/reloads and clears only this site’s GA cookies', () => {
  const app = setup({ choice: stored('granted') });
  assert.equal(app.tags.length, 1);
  app.click('denied');
  assert.equal(app.window['ga-disable-G-6GFF7V2JGX'], true);
  assert.equal(app.tags[0].removed, true);
  assert.equal(app.reloads(), 1);
  assert.ok(app.deleted.some(cookie => cookie.startsWith('_ga=')));
  assert.ok(app.deleted.some(cookie => cookie.startsWith('_ga_6GFF7V2JGX=')));
  assert.ok(app.deleted.every(cookie => !cookie.startsWith('other=')));
});

test('preview/local hosts never load analytics, even after an explicit choice', () => {
  for (const host of ['localhost', '127.0.0.1', 'preview.example.com']) {
    const app = setup({ host, choice: stored('granted') });
    app.click('granted');
    assert.equal(app.tags.length, 0);
    assert.equal(app.window['ga-disable-G-6GFF7V2JGX'], true);
    assert.equal(app.deleted.length, 0, 'preview must not alter cookies shared with other local projects');
  }
});

test('blocked storage still supports an explicit choice for the current page', () => {
  const app = setup({ blocked: true });
  app.click('granted');
  assert.equal(app.tags.length, 1);
  assert.match(app.status.textContent, /could not be saved/);
  app.click('denied');
  assert.equal(app.reloads(), 1);
});

test('a withdrawal in another tab stops collection in this tab', () => {
  const app = setup({ choice: stored('granted') });
  app.state.set(KEY, stored('denied'));
  const event = Object.assign(new Event('storage'), { key: KEY });
  app.window.dispatchEvent(event);
  assert.equal(app.reloads(), 1);
  assert.equal(app.window['ga-disable-G-6GFF7V2JGX'], true);
});
