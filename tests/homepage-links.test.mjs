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

test('all 23 Amazon links have the correct product and affiliate URL without JavaScript', () => {
  const amazonLinks = links.filter(link => Object.hasOwn(link, 'data-amazon-link'));
  assert.equal(amazonLinks.length, 23);
  const counts = {};
  for (const link of amazonLinks) {
    const product = link['data-amazon-link'] || 'series';
    counts[product] = (counts[product] || 0) + 1;
    assert.equal(link.href, getAmazonDestination('US', product));
    assert.equal(link.rel, 'sponsored');
  }
  assert.deepEqual(counts, { series: 2, meet: 4, backyard: 4, snacks: 4, christmas: 5, halloween: 4 });
});

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
