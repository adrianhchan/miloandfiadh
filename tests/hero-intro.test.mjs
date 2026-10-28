import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

function setup() {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const document = {
    activeElement: null,
    documentElement: { classList: { remove() {} } },
    querySelector: selector => elements[selector] || null,
  };
  const element = () => Object.assign(new EventTarget(), {
    hidden: false,
    focus(options) { document.activeElement = this; this.focusOptions = options; },
  });
  const card = element();
  const close = element();
  const restore = element();
  const elements = {
    '#hero-card': card,
    '.hero-card-close': close,
    '.hero-card-restore': restore,
    '#copyright-year': {},
  };
  class CustomEvent extends Event {
    constructor(type, options) { super(type); this.detail = options.detail; }
  }
  runInNewContext(source, {
    document, CustomEvent,
    window: { matchMedia: () => ({ matches: false }) },
    setTimeout(callback, delay) {
      const id = ++nextId;
      timers.set(id, { callback, due: now + delay });
      return id;
    },
    clearTimeout: id => timers.delete(id),
  });
  return {
    card, close, restore, document,
    click: target => target.dispatchEvent(new Event('click')),
    advance(milliseconds) {
      now += milliseconds;
      for (const [id, timer] of timers) {
        if (timer.due <= now) {
          timers.delete(id);
          timer.callback();
        }
      }
    },
  };
}

test('the hero starts minimized and reveals after five seconds without taking focus', () => {
  const app = setup();
  assert.equal(app.card.hidden, true);
  assert.equal(app.close.hidden, true);
  assert.equal(app.restore.hidden, false);
  app.advance(4999);
  assert.equal(app.card.hidden, true);
  app.advance(1);
  assert.equal(app.card.hidden, false);
  assert.equal(app.close.hidden, false);
  assert.equal(app.restore.hidden, true);
  assert.equal(app.document.activeElement, null);
});

test('opening early and closing again cancels automatic reopening', () => {
  const app = setup();
  app.advance(1000);
  app.click(app.restore);
  assert.equal(app.card.hidden, false);
  assert.equal(app.document.activeElement, app.close);
  app.click(app.close);
  app.advance(5000);
  assert.equal(app.card.hidden, true);
  assert.equal(app.restore.hidden, false);
  assert.equal(app.document.activeElement, app.restore);
  app.click(app.restore);
  assert.equal(app.card.hidden, false);
});

test('automatic reveal preserves keyboard focus when the restore button disappears', () => {
  const app = setup();
  app.restore.focus();
  app.advance(5000);
  assert.equal(app.document.activeElement, app.close);
  assert.equal(app.close.focusOptions.preventScroll, true);
  app.click(app.close);
  app.advance(10000);
  assert.equal(app.card.hidden, true);
});
