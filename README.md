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
- `assets/images/`: the supplied artwork and a video poster.
- `assets/videos/hero-bg.mp4`: optimized, silent, looping hero video.
- `assets/fonts/`: locally hosted Quicksand and its font license.

Unfinished page, social, email, and Amazon links use `href="#"` until their destinations are supplied. The navigation and footer logos link home.

The existing custom-domain file and Google Analytics configuration are retained. Changes are local; nothing is published automatically.
