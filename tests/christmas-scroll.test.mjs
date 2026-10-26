import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../christmas-scroll.js', import.meta.url), 'utf8');

// Exercise the controller with asynchronous video seeks, without a browser decoder.
function setup({ motion = true, downloadFailure = false } = {}) {
  const children = Object.fromEntries([
    '.amazon-feature-image', '.christmas-scroll-cue', '.christmas-scroll-progress',
  ].map(selector => [selector, { hidden: selector !== '.amazon-feature-image' }]));
  const properties = new Map();
  const section = {
    classList: { add() {}, remove() {} },
    querySelector: selector => children[selector],
    style: { setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key) },
  };
  const requests = [];
  const video = new EventTarget();
  let time = 0;
  Object.defineProperty(video, 'currentTime', {
    get: () => time,
    set: value => { time = value; video.seeking = true; requests.push(value); },
  });
  Object.assign(video, {
    hidden: true, readyState: 0, duration: NaN, seeking: false, paused: true,
    src: '', dataset: { src: 'assets/videos/christmas-book-open.mp4' }, preload: 'none',
    canPlayType: () => 'probably', loadCount: 0,
    load() { this.loadCount++; }, pause() { this.paused = true; },
    removeAttribute(name) { if (name === 'src') this.src = ''; },
  });
  const tweens = [];
  let cleanup;
  let observer;
  const revoked = [];
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  const gsap = {
    registerPlugin() {},
    matchMedia: () => ({ add: (_query, callback) => { if (motion) cleanup = callback(); } }),
    to(target, vars) {
      const tween = {
        scrollTrigger: { kill() { this.killed = true; } },
        kill() { this.killed = true; },
        progress(value) { target.progress = value; vars.onUpdate(); },
      };
      tweens.push(tween);
      return tween;
    },
  };
  runInNewContext(source, {
    AbortController,
    fetch: async () => {
      if (downloadFailure) throw new Error('Network unavailable');
      return { ok: true, blob: async () => ({}) };
    },
    URL: { createObjectURL: () => 'blob:christmas-video', revokeObjectURL: value => revoked.push(value) },
    window: { gsap, ScrollTrigger: { refresh() {} }, IntersectionObserver: Observer, innerHeight: 900, innerWidth: 1440 },
    IntersectionObserver: Observer,
    document: { querySelector: selector => selector === '.amazon-feature' ? section : video },
  });
  return {
    video, children, properties, requests, tweens, revoked,
    approach: async () => {
      observer.callback([{ isIntersecting: true }]);
      await new Promise(setImmediate);
    },
    cleanup: () => cleanup(),
    metadata() { video.readyState = 1; video.duration = 6.583333; video.dispatchEvent(new Event('loadedmetadata')); },
    finishSeek() { video.seeking = false; video.readyState = 2; video.dispatchEvent(new Event('seeked')); },
  };
}

test('loads near the section and coalesces rapid scroll/reverse requests while a frame decodes', async () => {
  const app = setup();
  assert.equal(app.video.src, '');
  assert.equal(app.video.loadCount, 0);
  await app.approach();
  await app.approach();
  assert.equal(app.video.loadCount, 1);
  assert.equal(app.video.muted, true);
  app.metadata();
  app.tweens[0].progress(0.5);
  app.tweens[0].progress(0.9);
  app.tweens[0].progress(0.2);
  assert.equal(app.requests.length, 1);
  app.finishSeek();
  assert.equal(app.requests.length, 2);
  assert.ok(app.requests[1] < app.requests[0], 'the queued request follows the latest reverse scroll');
  app.finishSeek();
  assert.equal(app.requests.length, 2, 'stopping the scroll holds the frame');
  app.tweens[0].progress(1);
  assert.ok(Math.abs(app.video.currentTime - (app.video.duration - 1 / 48)) < 0.000001);
  assert.equal(app.video.paused, true);
  assert.equal(app.children['.amazon-feature-image'].hidden, true);
  assert.equal(app.children['.christmas-scroll-progress'].hidden, false);
});

test('late metadata seeks to the current scroll position instead of starting from the beginning', async () => {
  const app = setup();
  app.tweens[0].progress(0.75);
  assert.equal(app.requests.length, 0);
  await app.approach();
  app.metadata();
  assert.ok(app.video.currentTime > 4.8);
});

test('a media error restores the poster and releases the pinned section', async () => {
  const app = setup();
  await app.approach();
  app.metadata();
  app.video.readyState = 2;
  app.video.dispatchEvent(new Event('loadeddata'));
  app.video.dispatchEvent(new Event('error'));
  assert.equal(app.tweens[0].scrollTrigger.killed, true);
  assert.equal(app.tweens[0].killed, true);
  assert.equal(app.video.hidden, true);
  assert.equal(app.children['.amazon-feature-image'].hidden, false);
  assert.equal(app.children['.christmas-scroll-cue'].hidden, true);
  assert.equal(app.children['.christmas-scroll-progress'].hidden, true);
});

test('reduced motion skips pinning/downloads and cleanup ignores late media events', async () => {
  const reduced = setup({ motion: false });
  assert.equal(reduced.tweens.length, 0);
  assert.equal(reduced.video.src, '');
  assert.equal(reduced.video.loadCount, 0);

  const app = setup();
  await app.approach();
  app.metadata();
  app.cleanup();
  assert.equal(app.video.src, '');
  assert.equal(app.video.preload, 'none');
  assert.equal(app.video.hidden, true);
  assert.deepEqual(app.revoked, ['blob:christmas-video']);
  app.video.readyState = 2;
  app.video.dispatchEvent(new Event('loadeddata'));
  assert.equal(app.video.hidden, true);
  assert.equal(app.children['.amazon-feature-image'].hidden, false);
});

test('a failed download restores the poster and removes the pin', async () => {
  const app = setup({ downloadFailure: true });
  await app.approach();
  assert.equal(app.tweens[0].scrollTrigger.killed, true);
  assert.equal(app.video.src, '');
  assert.equal(app.children['.amazon-feature-image'].hidden, false);
});
