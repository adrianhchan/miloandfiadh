# Amazon Store

Vendored from [davorg/amazon-store](https://github.com/davorg/amazon-store), version 1.2.2.

- Source commit: `6465ceb412fe44a9aa9eaee9158ed886d5bfd180`
- Source file: `src/amazon-store.esm.js`
- License: MIT; the original notice is retained in `LICENCE`.

Local changes:

- Added Belgium (`amazon.com.be`), Ireland (`amazon.ie`), Poland (`amazon.pl`), and Sweden (`amazon.se`).
- Routed Irish locale, time zone, and domain detection to Ireland.
- Expanded Canadian and Australian time zones, and added the Canary Islands and Ceuta for Spain.
- Saved as `.mjs` for direct browser and Node.js module use.

The website uses the library's detection and store metadata. Link configuration, the supported-market allowlist, and the visitor's manual selection are handled by `amazon-routing.mjs` and `amazon-links.mjs` at the project root. It does not use the library's enhancement or store-grid functions.

No remote script, IP lookup, analytics, or API is needed for Amazon routing.
