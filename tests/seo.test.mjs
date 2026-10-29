import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pages, ORIGIN } from '../scripts/seo-data.mjs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const baseline = JSON.parse(read('_project/seo-aeo/content-baseline.json'));

test('existing page copy, images, and shared visual styles are unchanged', () => {
  for (const [file, expected] of Object.entries(baseline.pages)) {
    const html = read(file);
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
    const text = body.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    assert.equal(hash(text), expected.text, `${file}: page copy changed`);
    assert.deepEqual([...html.matchAll(/<img\b([^>]*)>/g)].map(match => match[1]), expected.images, `${file}: images changed`);
  }
  for (const [file, expected] of Object.entries(baseline.styles)) assert.equal(hash(read(file)), expected, file);
  for (const [file, expected] of Object.entries(baseline.images)) assert.equal(hash(readFileSync(new URL('assets/images/' + file, root))), expected, file);
});

test('every public page has unique static search/social metadata and consistent canonical identity', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const page of pages) {
    const html = read(page.file);
    const title = html.match(/<title>(.*?)<\/title>/s)[1];
    const description = html.match(/<meta name="description" content="([^"]*)">/)[1];
    assert.ok(!titles.has(title), page.file);
    assert.ok(!descriptions.has(description), page.file);
    titles.add(title); descriptions.add(description);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.ok(html.includes(`rel="canonical" href="${ORIGIN + page.path}"`));
    assert.ok(html.includes(`property="og:url" content="${ORIGIN + page.path}"`));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
    assert.ok(!html.includes('noindex'));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, page.file);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const webpage = graph['@graph'].find(node => node['@id'] === ORIGIN + page.path + '#webpage');
    assert.equal(webpage.url, ORIGIN + page.path);
    assert.equal(webpage.isPartOf['@id'], ORIGIN + '/#website');
    assert.equal(webpage.publisher['@id'], ORIGIN + '/#organization');
    if (page.asin) {
      const book = graph['@graph'].find(node => node['@type'] === 'Book');
      assert.equal(book.identifier.value, page.asin);
      assert.equal(book.author['@id'], ORIGIN + '/about-the-author.html#author');
      assert.equal(book.offers, undefined);
      assert.equal(book.aggregateRating, undefined);
    }
  }
});

test('sitemap, crawl policy, and internal links point only to the intended public pages/assets', () => {
  const locations = [...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(locations, pages.map(page => ORIGIN + page.path));
  assert.match(read('robots.txt'), /User-agent: \*\nAllow: \/\n/);
  assert.ok(read('robots.txt').includes(ORIGIN + '/sitemap.xml'));
  const publicFiles = new Set(pages.map(page => page.file));
  for (const page of pages) {
    const html = read(page.file);
    for (const destination of ['info-for-parents.html', 'about-the-author.html', 'privacy.html', 'terms-and-conditions.html']) {
      assert.ok(html.includes(`href="${destination}"`), `${page.file}: ${destination}`);
    }
    for (const [, value] of html.matchAll(/(?:href|src|poster|data-src)="([^"]*)"/g)) {
      if (/^(https?:|mailto:|#|data:)/.test(value)) continue;
      const path = decodeURIComponent(value.split('#')[0]);
      if (path === './') continue;
      assert.ok(existsSync(new URL(path.replace(/^\//, ''), root)), `${page.file}: missing ${path}`);
      if (path.endsWith('.html')) assert.ok(publicFiles.has(path), `${page.file}: excluded page ${path}`);
    }
    assert.ok(!/src="https:\/\/www.googletagmanager.com/.test(html));
    assert.equal((html.match(/src="analytics.js"/g) || []).length, 1);
  }
});

test('working files and historical duplicate pages are excluded from the GitHub Pages build', () => {
  const config = read('_config.yml');
  for (const path of ['README.md', 'scripts', 'tests', '_project', 'index copy.html', 'index copy 2.html']) {
    assert.ok(config.includes(`  - ${path}\n`), path);
  }
  assert.match(read('404.html'), /name="robots" content="noindex, follow"/);
  assert.ok(!read('404.html').includes('rel="canonical"'));
  assert.ok(read('404.html').includes('href="/styles.css"'));
});

test('the supplied author photo is present and the new pages preserve the supplied passages', () => {
  const author = read('about-the-author.html');
  const parents = read('info-for-parents.html');
  assert.ok(author.includes('assets/images/author-and-milo.jpg'));
  assert.ok(author.includes('And that\'s how Milo &amp; Fiadh began.'));
  assert.ok(author.includes('These books are my way of keeping Milo\'s memory alive'));
  assert.ok(parents.includes('Created for children ages 2–6'));
  assert.ok(parents.includes('Gentle stories for little readers.'));
  assert.ok(parents.includes('Made to be read together.'));
  assert.ok(read('privacy.html').includes('2021076 Ontario Corporation'));
  assert.ok(read('terms-and-conditions.html').includes('2021076 Ontario Corporation'));
});
