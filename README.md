# Milo and Fiadh

Static homepage built with HTML, CSS, and a little browser JavaScript. No build step or dependencies are required.

## Local preview

From this folder, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173 in your browser. Use this local preview so browsers can load the self-hosted font correctly.

## Files

- `index.html`: page content and link destinations.
- `styles.css`: colors, typography, desktop, tablet, and mobile layouts.
- `script.js`: background video controls, reduced motion support, and the copyright year.
- `amazon-routing.mjs`: supported Amazon stores and their destinations.
- `amazon-links.mjs`: automatic store selection and the footer store selector.
- `assets/images/`: the supplied artwork and a video poster.
- `assets/videos/hero-bg.mp4`: optimized, silent, looping hero video.
- `assets/fonts/`: locally hosted Quicksand and its font license.

## Amazon links

All three Amazon buttons choose a store using browser language settings, then the browser's time zone, with the US as fallback. A selector in the footer lets visitors choose another store or return to automatic selection. Manual choices are saved locally in the browser and synchronized between tabs. If storage is blocked, the selector still works for the current page.

Routing uses a locally hosted copy of [davorg/amazon-store](https://github.com/davorg/amazon-store). It makes no IP lookup, API, or external script request. Its source revision, MIT license, and local modifications are documented in `assets/vendor/amazon-store/`. Browser settings estimate a preferred store; they do not determine physical location.

Supported stores: US, Canada, Japan, UK, Australia, Belgium, Germany, Spain, France, Ireland, Italy, Netherlands, Poland, and Sweden.

The supplied US link opens the series: https://www.amazon.com/dp/B0FF2T9PVG. Browser checks found the same series ID on the US, Canadian, Japanese, UK, Australian, German, Spanish, French, and Italian sites. Belgium, Ireland, Netherlands, Poland, and Sweden returned a missing page for that ID; those destinations use a local Amazon search for `Milo and Fiadh Anita Cheng` instead. The code does not check Amazon availability during a visitor's session.

To add a verified regional series page later, update that market's destination in `amazon-routing.mjs`. Without JavaScript, all three buttons retain the supplied US URL.

Run routing checks with:

```sh
node --test tests/amazon-routing.test.mjs
```

Unfinished page, social, and email links use `href="#"` until their destinations are supplied. The navigation and footer logos link home.

The existing custom-domain file and Google Analytics configuration are retained. Changes are local; nothing is published automatically.
