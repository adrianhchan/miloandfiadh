import AmazonStore, { detectRegion } from './assets/vendor/amazon-store/amazon-store.mjs';

export const AMAZON_SERIES_ID = 'B0FF2T9PVG';
export const AMAZON_DEFAULT_REGION = 'US';
export const AMAZON_PREFERENCE_KEY = 'miloandfiadh.amazonStore';

export const AMAZON_AFFILIATE_PARAMETERS = Object.freeze({
  linkCode: 'll2',
  tag: 'adrianchan-20',
  linkId: '32d125adf2b813c3ec117533e04cc04a',
  ref_: 'as_li_ss_tl',
});

// Paperback product IDs from the official US Amazon series page.
export const AMAZON_PRODUCTS = Object.freeze({
  series: Object.freeze({ asin: AMAZON_SERIES_ID }),
  meet: Object.freeze({ asin: '1069597309' }),
  backyard: Object.freeze({ asin: '1069597317' }),
  snacks: Object.freeze({ asin: '1069597325' }),
  christmas: Object.freeze({ asin: '1069597333' }),
  halloween: Object.freeze({ asin: '1069597341' }),
});

// The series page was checked in each marketplace. The five search destinations
// returned no series page under the US ID.
// Replace their search destination with a verified local series URL when available.
const destinations = [
  ['US', 'United States', 'series'],
  ['CA', 'Canada', 'series'],
  ['JP', 'Japan', 'series'],
  ['UK', 'United Kingdom', 'series'],
  ['AU', 'Australia', 'series'],
  ['BE', 'Belgium', 'search'],
  ['DE', 'Germany', 'series'],
  ['ES', 'Spain', 'series'],
  ['FR', 'France', 'series'],
  ['IE', 'Ireland', 'search'],
  ['IT', 'Italy', 'series'],
  ['NL', 'Netherlands', 'search'],
  ['PL', 'Poland', 'search'],
  ['SE', 'Sweden', 'search'],
];

export const AMAZON_MARKETS = Object.freeze(destinations.map(([code, name, destination]) => (
  Object.freeze({ code, name, destination, domain: AmazonStore.STORES[code].domain })
)));

export function getAmazonMarket(region) {
  return AMAZON_MARKETS.find(market => market.code === region) || AMAZON_MARKETS[0];
}

export function getAutomaticAmazonRegion() {
  try {
    return getAmazonMarket(detectRegion({ defaultRegion: AMAZON_DEFAULT_REGION })).code;
  } catch {
    return AMAZON_DEFAULT_REGION;
  }
}

export function getAmazonDestination(region, product = 'series') {
  const market = getAmazonMarket(region);
  const key = Object.hasOwn(AMAZON_PRODUCTS, product) ? product : 'series';
  const listing = AMAZON_PRODUCTS[key];
  const search = key === 'series' && market.destination === 'search';
  const url = new URL(search ? '/s' : '/dp/' + listing.asin, 'https://www.' + market.domain);
  if (search) {
    url.searchParams.set('k', 'Milo and Fiadh Anita Cheng');
  }
  for (const [key, value] of Object.entries(AMAZON_AFFILIATE_PARAMETERS)) {
    url.searchParams.set(key, value);
  }
  return url.href;
}

export function readAmazonPreference(storage) {
  try {
    const value = storage?.getItem(AMAZON_PREFERENCE_KEY);
    return AMAZON_MARKETS.some(market => market.code === value) ? value : 'auto';
  } catch {
    return 'auto';
  }
}

export function saveAmazonPreference(storage, region) {
  try {
    if (region === 'auto') {
      storage?.removeItem(AMAZON_PREFERENCE_KEY);
    } else if (AMAZON_MARKETS.some(market => market.code === region)) {
      storage?.setItem(AMAZON_PREFERENCE_KEY, region);
    }
  } catch {
    // The selection still works for this page if browser storage is unavailable.
  }
}
