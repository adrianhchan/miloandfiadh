"""Verify static routes, exclusions, and representative assets against the local preview."""
import argparse
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--origin", default="http://127.0.0.1:4173")
args = parser.parse_args()
tree = ET.parse(ROOT / "sitemap.xml")
paths = [(urlsplit(node.text).path, 200) for node in tree.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
paths += [(path, 200) for path in ["/meet-milo-and-fiadh", "/robots.txt", "/sitemap.xml", "/analytics.js", "/info-pages.css", "/assets/images/author-and-milo.jpg", "/assets/vendor/gsap/gsap.min.js"]]
paths += [(path, 404) for path in ["/unknown/nested-page", "/index%20copy.html", "/index%20copy%202.html", "/tests/homepage-links.test.mjs", "/scripts/seo-data.mjs", "/_project/seo-aeo/content-baseline.json", "/README.md"]]
for path, expected in paths:
    try:
        with urlopen(Request(args.origin + path, method="HEAD")) as response:
            status = response.status
    except HTTPError as error:
        status = error.code
    assert status == expected, (path, status, expected)
    print(status, path)
print(f"Passed {len(paths)} preview URL checks")
