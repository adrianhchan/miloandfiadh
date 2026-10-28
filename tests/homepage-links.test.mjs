import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getAmazonDestination } from '../amazon-routing.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const links = [...html.matchAll(/<a\b([^>]*)>/g)].map(([, source]) => (
  Object.fromEntries([...source.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(([, key, value]) => [
    key, (value || '').replaceAll('&amp;', '&'),
  ]))
));

test('the three homepage purchase links retain their product and affiliate URL without JavaScript', () => {
  const amazonLinks = links.filter(link => Object.hasOwn(link, 'data-amazon-link'));
  assert.equal(amazonLinks.length, 3);
  const counts = {};
  for (const link of amazonLinks) {
    const product = link['data-amazon-link'] || 'series';
    counts[product] = (counts[product] || 0) + 1;
    assert.equal(link.href, getAmazonDestination('US', product));
    assert.equal(link.rel, 'sponsored');
  }
  assert.deepEqual(counts, { series: 2, christmas: 1 });
});

const pages = {
  meet: 'meet-milo-and-fiadh.html',
  backyard: 'backyard-adventures.html',
  snacks: 'fun-with-snacks.html',
  christmas: 'a-milo-and-fiadh-christmas.html',
  halloween: 'halloween.html',
};

test('homepage cover, title, button, and footer links lead to every book detail page', () => {
  for (const page of Object.values(pages)) {
    const bookLinks = links.filter(link => link.href === page);
    assert.equal(bookLinks.length, 4, page);
    assert.ok(bookLinks.every(link => !Object.hasOwn(link, 'data-amazon-link')));
  }
});

for (const [index, [product, page]] of Object.entries(pages).entries()) {
  test(`${page} has matching artwork/video, book purchase links, and other-book navigation`, () => {
    const detail = readFileSync(new URL('../' + page, import.meta.url), 'utf8');
    const number = String(index + 1).padStart(3, '0');
    assert.ok(detail.includes(`assets/images/Book%20Logo%20${number}.png`));
    assert.ok(detail.includes(`assets/images/Book%20Title%20${number}.png`));
    assert.ok(detail.includes(`assets/videos/${number}%20Open.mp4`));
    assert.match(detail, /id="hero-video" autoplay muted loop playsinline/);
    assert.equal((detail.match(/<h1 /g) || []).length, 1);
    assert.equal((detail.match(/<article class="book /g) || []).length, 4);
    const purchaseLinks = [...detail.matchAll(/<a\b([^>]*)>/g)]
      .map(([, attributes]) => Object.fromEntries([...attributes.matchAll(/([\w-]+)(?:="([^"]*)")?/g)]
        .map(([, key, value]) => [key, (value || '').replaceAll('&amp;', '&')])));
    for (const className of ['button nav-amazon', 'button hero-button']) {
      const link = purchaseLinks.find(link => link.class === className);
      assert.equal(link['data-amazon-link'], product);
      assert.equal(link.href, getAmazonDestination('US', product));
      assert.equal(link.rel, 'sponsored');
    }
    for (const otherPage of Object.values(pages)) {
      assert.equal(purchaseLinks.filter(link => link.href === otherPage).length, otherPage === page ? 1 : 4);
    }
    assert.ok(detail.indexOf('class="book-characters"') < detail.indexOf('class="collection"'));
  });
}

test('the Christmas banner links to the Christmas book instead of the series', () => {
  const banner = links.find(link => link.class === 'amazon-feature-button');
  assert.equal(banner['data-amazon-link'], 'christmas');
  assert.equal(new URL(banner.href).pathname, '/dp/1069597333');
});

test('the hero scrolls to the collection and the supplied contact links are connected', () => {
  assert.equal(links.find(link => link.class === 'button hero-button').href, '#collection');
  assert.match(html, /<section class="collection" id="collection"/);
  assert.equal(links.find(link => link['aria-label'] === 'Milo and Fiadh on Instagram').href, 'https://www.instagram.com/miloandfiadh');
  assert.equal(links.find(link => link['aria-label'] === 'Email Milo and Fiadh').href, 'mailto:hi@miloandfiadh.com');
});
