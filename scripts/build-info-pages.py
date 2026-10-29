"""Regenerate the four static support pages using the current site header/footer."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
home = (ROOT / "index.html").read_text()
header = re.search(r'    <header class="site-header">.*?</header>', home, re.S).group()
footer = re.search(r'    <footer class="site-footer">.*?</footer>', home, re.S).group()
links = {"Info for parents": "info-for-parents.html", "About the author": "about-the-author.html", "Privacy": "privacy.html", "Terms &amp; Conditions": "terms-and-conditions.html"}
for label, destination in links.items():
    footer = footer.replace(f'href="#">{label}</a>', f'href="{destination}">{label}</a>')

PARENTS = '''      <div class="note-stack">
        <section class="note-panel" aria-labelledby="little-stories">
          <img class="note-paw" src="assets/images/paw%20icon%20left.svg" alt="" width="32" height="35" aria-hidden="true">
          <h2 id="little-stories">Little stories, big moments.</h2>
          <p>The idea behind Milo &amp; Fiadh is simple: sometimes the smallest moments make the loveliest stories.</p>
          <p>A walk around the neighbourhood, a little backyard adventure, or sharing a snack. Through Milo and Fiadh's eyes, everyday experiences become something special.</p>
        </section>
        <section class="note-panel" aria-labelledby="gentle-stories">
          <h2 id="gentle-stories">Gentle stories for little readers.</h2>
          <p>Created for children ages 2–6, each book is filled with familiar moments, playful sounds, simple language, and a little humour.</p>
          <p>Our stories celebrate friendship, kindness, and curiosity, with gentle adventures and cozy endings that make them lovely for quiet moments, bedtime, or reading together anytime.</p>
        </section>
        <section class="note-panel" aria-labelledby="read-together">
          <h2 id="read-together">Made to be read together.</h2>
          <p>There's something special about sharing a story with a little one.</p>
          <p>Whether it's pointing at pictures, making funny sounds, or hearing "Again, please!", we hope Milo and Fiadh bring a little joy to those moments you share together.</p>
          <p>Curious about how Milo &amp; Fiadh began? Meet the real Milo and discover the story behind the books.</p>
          <a class="button note-link" href="about-the-author.html">About the author</a>
        </section>
      </div>'''

AUTHOR = '''      <div class="author-layout">
        <figure class="author-photo"><img src="assets/images/author-and-milo.jpg" alt="The author holding Milo, her tiny white Maltese" width="1729" height="1731" fetchpriority="high"></figure>
        <div class="author-copy">
          <p>Milo was my tiny Maltese, and for more than a decade, he filled our days with so much love and laughter. From his daily walkies to his favourite toys, he had a way of making even the simplest moments feel special.</p>
          <p>Fiadh is his little cousin. They only met a few times when she was a baby, but as she grew, she heard lots of stories about him. I began to imagine all the little adventures they might have shared if they'd had more time together.</p>
          <p class="story-beginning">And that's how Milo &amp; Fiadh began.</p>
          <p>These books are my way of keeping Milo's memory alive while sharing a little of the happiness he brought into our lives. I hope their stories bring smiles, giggles, and lots of cozy reading moments to your family, too.</p>
        </div>
      </div>'''

PRIVACY = '''      <div class="legal-copy">
        <p class="legal-updated">Last updated: October 29, 2026</p>
        <p>This Privacy Policy explains how 2021076 Ontario Corporation ("we", "us", or "our"), the operator of miloandfiadh.com in Ontario, Canada, handles information in connection with this website. For privacy questions or requests, email <a href="mailto:hi@miloandfiadh.com">hi@miloandfiadh.com</a>.</p>
        <h2>Information involved in visiting this site</h2>
        <p>This is a static website. It does not offer visitor accounts, comments, a shopping cart, or a contact form. If you email us, we receive the information you choose to include, such as your email address and message. Please do not send payment information or sensitive information about a child.</p>
        <p>The site is hosted on GitHub Pages. GitHub and its delivery providers process technical information, such as IP addresses and request information, to deliver and protect the site. Their handling of that information is described in <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub's Privacy Statement</a>.</p>
        <h2>Optional analytics and your choice</h2>
        <p>Google Analytics is off unless you choose to allow optional analytics. Before that choice, this site does not load Google's analytics tag or send analytics requests to Google. Allowing analytics helps us understand visits, device and browser information, and how the site is used. Google may use first-party analytics cookies and process technical information, including IP information, in providing that service.</p>
        <p>You can allow or turn off optional analytics below. Your choice is stored in this browser for up to 180 days, after which analytics returns to off unless you choose again. Your choice applies to this browser, not every device you use. If browser storage is unavailable, a choice applies only to the current page. Turning analytics off stops future collection on this site and removes the analytics cookies this site manages; it does not erase information already received by Google.</p>
        <div class="privacy-controls" data-analytics-controls hidden>
          <div class="privacy-actions"><button type="button" data-analytics-choice="granted" aria-pressed="false">Allow optional analytics</button><button type="button" data-analytics-choice="denied" aria-pressed="true">Turn off optional analytics</button></div>
          <p role="status" data-analytics-status>Optional analytics is off.</p>
        </div>
        <noscript><p>Optional analytics is off when JavaScript is disabled.</p></noscript>
        <p>We do not enable advertising personalization through this site's analytics configuration. Website addresses sent by our analytics setup omit query strings and fragments; standard campaign labels may be included separately. Google describes its processing in its <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/technologies/partner-sites">information about partner sites</a>.</p>
        <h2>Amazon store preferences and external links</h2>
        <p>Amazon links can use your browser language and time zone to suggest an Amazon store. This happens in your browser without an IP-location service or a request for GPS access. If you choose a store manually, that preference is saved in local browser storage until you reset it or clear your browser data.</p>
        <p>Purchases take place on Amazon, not on this website. We do not receive your card details or Amazon account password through this site. Amazon and linked social platforms apply their own privacy policies when you visit them. Some Amazon links are affiliate links and include our affiliate tracking details. As an Amazon Associate I earn from qualifying purchases.</p>
        <h2>How we use and share information</h2>
        <p>We use information you send us to respond to your message, handle your request, and maintain related business records. Optional analytics is used to understand and improve the website. Service providers may process information to provide hosting, email, or analytics services. Information may also be disclosed when required by law or reasonably necessary to protect legal rights and security.</p>
        <h2>Retention, security, and international processing</h2>
        <p>We keep correspondence and related records for as long as reasonably needed for the request, legitimate business purposes, and applicable legal obligations. Hosting, email, and analytics providers may process information outside your province or country, including in the United States, under their own applicable arrangements and retention settings. No method of internet transmission or storage is completely secure.</p>
        <h2>Children and family privacy</h2>
        <p>The books are for young children, but this website's purchasing, contact, and privacy choices are intended for parents and other grown-ups. We do not ask children to submit personal information. If you believe a child has sent us personal information, contact us so we can review and address it.</p>
        <h2>Your questions and requests</h2>
        <p>You can ask about the personal information we hold about you, request access or correction, or raise a privacy concern by emailing <a href="mailto:hi@miloandfiadh.com">hi@miloandfiadh.com</a>. Depending on the law that applies, you may also have rights to request deletion or withdraw consent. We may need to verify your identity before responding, and legal exceptions or recordkeeping requirements may apply. You can also contact the <a href="https://www.priv.gc.ca/en/">Office of the Privacy Commissioner of Canada</a> about an unresolved concern.</p>
        <h2>Changes to this policy</h2>
        <p>We may update this policy when the website or our practices change. The date above shows the latest revision.</p>
      </div>'''

TERMS = '''      <div class="legal-copy">
        <p class="legal-updated">Last updated: October 29, 2026</p>
        <p>These Terms &amp; Conditions describe use of miloandfiadh.com, operated by 2021076 Ontario Corporation in Ontario, Canada. Questions can be sent to <a href="mailto:hi@miloandfiadh.com">hi@miloandfiadh.com</a>. If you do not agree with these terms, please do not use the website.</p>
        <h2>About this website</h2>
        <p>This website introduces the Milo and Fiadh books and provides links to external retailers. It does not sell books or process payments directly. Purchasing and other grown-up decisions should be made by a parent, guardian, or other adult.</p>
        <h2>Our stories and artwork</h2>
        <p>The stories, text, illustrations, photographs, logos, videos, and design on this site are protected by intellectual property laws and belong to their respective owners. You may browse the site and share ordinary links to its pages. Except as permitted by law or with the relevant owner's permission, you may not reproduce, distribute, sell, modify, or use its content commercially. Viewing the site does not grant rights to copy a book or its artwork.</p>
        <h2>Respectful use</h2>
        <p>Please use the website lawfully. Do not attempt to damage or disrupt it, bypass access controls, introduce harmful code, or misuse information about other people. Nothing in these terms removes rights that applicable law gives you.</p>
        <h2>Amazon purchases and affiliate links</h2>
        <p>Amazon handles purchases made through the linked Amazon stores. Prices, stock, delivery, taxes, returns, and order support are governed by the relevant retailer's terms and policies. Check the details shown by Amazon before purchasing. Availability can differ between countries, and our store suggestion may not match your location or preferred store.</p>
        <p>Some Amazon links contain affiliate tracking details. As an Amazon Associate I earn from qualifying purchases. This does not mean Amazon sponsors or endorses this website. Contact the relevant Amazon store for help with an Amazon order.</p>
        <h2>Links to other websites</h2>
        <p>External websites and services are controlled by their own operators. Their content, terms, privacy practices, and availability can change. Please review their policies when you visit them.</p>
        <h2>Information and availability</h2>
        <p>We aim to keep the site accurate and available, but mistakes, interruptions, or outdated information can occur. The website is provided on an "as available" basis. To the extent permitted by applicable law, we do not promise uninterrupted access or that every item of information will be error-free. These terms do not exclude liability or consumer rights that cannot lawfully be excluded.</p>
        <h2>Privacy</h2>
        <p>Our <a href="privacy.html">Privacy Policy</a> explains the site's handling of information and optional analytics choices.</p>
        <h2>Applicable law</h2>
        <p>These terms are governed by the laws of Ontario and the applicable federal laws of Canada, subject to any mandatory protections that apply where you live.</p>
        <h2>Changes and contact</h2>
        <p>We may update these terms as the website changes. The date above identifies the latest revision. For questions about the website or permission to use its content, email <a href="mailto:hi@miloandfiadh.com">hi@miloandfiadh.com</a>.</p>
      </div>'''

pages = [
    ("info-for-parents.html", "info-parents", "Info for parents", "A Little Note for Grown-Ups", PARENTS),
    ("about-the-author.html", "info-author", "About the author", "A Little Note from the Author", AUTHOR),
    ("privacy.html", "legal-page", "Privacy", "Privacy Policy", PRIVACY),
    ("terms-and-conditions.html", "legal-page", "Terms &amp; Conditions", "Terms &amp; Conditions", TERMS),
]

for filename, class_name, label, title, content in pages:
    document = f'''<!DOCTYPE html>
<html lang="en" class="info-page {class_name}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#bee1e6">
    <meta name="description" content="{title} · Milo and Fiadh">
    <title>{label} · Milo and Fiadh</title>
    <link rel="icon" href="assets/images/Logo%20Nav.png" type="image/png">
    <link rel="preload" href="assets/fonts/quicksand-variable.ttf" as="font" type="font/ttf" crossorigin>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="info-pages.css">
    <script src="script.js" defer></script>
    <script src="analytics.js" defer></script>
    <script src="amazon-links.mjs" type="module"></script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
{header}
    <main class="info-main" id="main">
      <header class="info-intro">
        <nav class="info-breadcrumb" aria-label="Breadcrumb"><a href="./">Home</a><span aria-hidden="true">›</span><span aria-current="page">{label}</span></nav>
        <h1>{title}</h1>
      </header>
{content}
    </main>
{footer}
  </body>
</html>
'''
    (ROOT / filename).write_text(document)
    print(filename)
