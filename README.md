# Milo and Fiadh

Static website built with HTML, CSS, and browser JavaScript. No build step or dependency installation is required.

## Local preview

From this folder, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173 in your browser. Use this local preview so browsers can load the self-hosted font correctly.

On the homepage, the hero text starts minimized and appears after five seconds. Visitors can use the restore button at the hero's bottom right to open it sooner; doing so cancels the automatic reveal, so closing it again keeps it minimized. All five book detail pages show their hero text immediately on page load. The video keeps playing, and the hidden/shown state persists when resizing. Reloading the homepage starts the five-second delay again. Automatic reveal does not move focus unless the restore button currently has focus. Without JavaScript, the text is visible immediately on every page.

The hero video has a responsive top inset to expose more of the scene below the navigation wave: 48–80px on desktop/tablet and 36px on mobile. This keeps its upper edge behind the wave. The image is aligned to the top and still covers its video area without bars. Adjust `--hero-video-top-gap` in `styles.css` to tune this spacing; the overall hero remains 80% of the viewport on desktop/tablet and 90% on mobile.

## Files

- `index.html`: page content and link destinations.
- `styles.css`: shared colors, typography, desktop, tablet, and mobile layouts.
- `book-details.css`: book-specific themes, hero artwork, character panels, and four-book collection layouts.
- `meet-milo-and-fiadh.html`, `backyard-adventures.html`, `fun-with-snacks.html`, `a-milo-and-fiadh-christmas.html`, and `halloween.html`: standalone book detail pages, usable without JavaScript.
- `script.js`: background video controls, hero text controls, reduced motion support, and the copyright year.
- `animations.js`: responsive GSAP welcome, scroll reveals, artwork motion, and book-cover interactions.
- `christmas-scroll.js`: lazily loaded, scroll-controlled Christmas book-opening video.
- `amazon-routing.mjs`: supported Amazon stores and their destinations.
- `amazon-links.mjs`: automatic store selection and the footer store selector.
- `assets/images/`: the supplied artwork and a video poster.
- `assets/videos/hero-bg.mp4`: optimized, silent, looping hero video.
- `assets/videos/christmas-book-open.mp4`: silent, all-keyframe H.264 version of `Book Open 004 Christmas.mp4`, optimized for seeking in both directions.
- `assets/fonts/`: locally hosted Quicksand and its font license.
- `assets/vendor/gsap/`: pinned GSAP 3.15.0 core and ScrollTrigger, served locally with original license headers and source maps.

## Animation

GSAP adds a springy logo and hero entrance, sequential paw stamps in the friendship bar, and book and character reveals. Desktop layouts also get subtle scroll-linked movement in the title/character background shapes. Fine-pointer devices get book-cover tilt, brief paw bursts, and logo wiggles. Effects finish rather than looping indefinitely, and native page scrolling is preserved.

The Christmas section fills the viewport while scrolling scrubs through the 6.58-second book-opening clip. The video covers the viewport edge to edge, with centered cropping as needed on desktop and mobile. Scrolling backward closes the book, and stopping holds the current frame. The video is muted and never plays automatically. Its first frame supplies the still-image fallback. The Amazon button keeps its localized Christmas product and affiliate link. Scroll distance is 1.8 viewport heights on desktop/tablet and 1.35 on mobile, then the section releases to the footer. The roughly 5 MB clip is fetched when the section is within one viewport of view, then served to the video from a browser-local blob so seeking works even without server byte-range support. Reduced motion skips the download and pinning. Load errors also restore the still image and remove the pin; leaving motion mode aborts the download and releases the blob.

The hero close/restore controls also get a small entrance animation. Motion effects are disabled for `prefers-reduced-motion: reduce`, including when the preference changes while the page is open; the existing video preference handling remains active. All content is visible without GSAP or JavaScript, and keyboard focus immediately completes relevant entrance effects. GSAP's responsive context removes animations, inline styles, and interaction listeners when media conditions change.

Implementation references: [GSAP installation](https://gsap.com/docs/v3/Installation/), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), and [gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).

The page canvas and video fallback backgrounds match the nav shape (`#bee1e6`). The Christmas progress bar uses the footer's base green (`#ccd5ae`). Its Amazon button stays hidden for the first half of the scroll sequence, then fades up 24px into place between 50% and 62%; scrolling backward reverses the reveal. The hidden link cannot receive focus or clicks. With reduced motion, unavailable video, or no JavaScript, the button remains visible and usable.

## Amazon links

All Amazon links choose a store using browser language settings, then the browser's time zone, with the US as fallback. A selector in the footer lets visitors choose another store or return to automatic selection. Manual choices are saved locally in the browser and synchronized between tabs. If storage is blocked, the selector still works for the current page.

Routing uses a locally hosted copy of [davorg/amazon-store](https://github.com/davorg/amazon-store). It makes no IP lookup, API, or external script request. Its source revision, MIT license, and local modifications are documented in `assets/vendor/amazon-store/`. Browser settings estimate a preferred store; they do not determine physical location.

Supported stores: US, Canada, Japan, UK, Australia, Belgium, Germany, Spain, France, Ireland, Italy, Netherlands, Poland, and Sweden.

The supplied US link opens the series: https://www.amazon.com/dp/B0FF2T9PVG. Browser checks found the same series ID on the US, Canadian, Japanese, UK, Australian, German, Spanish, French, and Italian sites. Belgium, Ireland, Netherlands, Poland, and Sweden returned a missing page for that ID; those destinations use a local Amazon search for `Milo and Fiadh Anita Cheng` instead. The code does not check Amazon availability during a visitor's session.

The book images, titles, buttons, and footer collection links open each corresponding detail page. Each detail page uses its numbered `Book Logo` in the navigation, `Book Title` above the hero copy, and a muted, looping `00x Open.mp4` background. These supplied clips are optimized to 1280 × 720 H.264 with audio removed and fast-start metadata; first-frame posters provide a still fallback. The hero pause and text hide/restore controls also work on detail pages.

Detail pages place the character panels side by side on desktop and stack them on mobile. Each collection shows the other four books. The hero CTA and top navigation Amazon button open that page’s paperback, using the existing affiliate parameters and regional store selection. The footer Amazon button opens the series. The homepage Christmas feature continues to open the Christmas paperback directly, and the homepage header and footer Amazon buttons open the series.

| Book | Paperback product ID |
| --- | --- |
| Meet Milo and Fiadh | 1069597309 |
| Backyard Adventures | 1069597317 |
| Fun with Snacks | 1069597325 |
| A Milo and Fiadh Christmas | 1069597333 |
| Halloween | 1069597341 |

Every Amazon URL includes the supplied affiliate parameters: `linkCode=ll2`, `tag=adrianchan-20`, `linkId=32d125adf2b813c3ec117533e04cc04a`, and `ref_=as_li_ss_tl`. These are applied to all supported stores, including the series-search fallbacks. Amazon Associates account eligibility and tracking IDs for each marketplace remain separate from the website's link routing.

To add a verified regional series page later, update that market's destination in `amazon-routing.mjs`. Product IDs and affiliate parameters are configured there as well. Without JavaScript, all purchase links retain their tagged US destinations.

Purchase links are marked with `data-amazon-link="meet"`, `"backyard"`, `"snacks"`, `"christmas"`, or `"halloween"`. Links to detail pages do not carry this attribute, so Amazon routing cannot rewrite internal navigation.

Run routing checks with:

```sh
node --test tests/*.test.mjs
```

The hero's “Check it out!” button scrolls to the collection. Instagram, TikTok, and YouTube use the supplied profile URLs, and email uses `mailto:hi@miloandfiadh.com`. Unfinished information and legal links retain `href="#"`. The navigation and footer logos link home.

The existing custom-domain file and Google Analytics configuration are retained. Changes are local; nothing is published automatically.
