(() => {
  const { gsap, ScrollTrigger } = window;
  // Motion is an enhancement: the entire page works if either library fails to load.
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();

  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 961px)',
    finePointer: '(hover: hover) and (pointer: fine)',
  }, context => {
    const { motion, desktop, finePointer } = context.conditions;
    if (!motion) return;

    const cleanups = [];
    const listen = (element, event, handler) => {
      element.addEventListener(event, handler);
      cleanups.push(() => element.removeEventListener(event, handler));
    };

    // Keep reveals brief, and finish them immediately if a keyboard user enters.
    const reveal = (target, vars, trigger = target) => {
      const tween = gsap.from(target, {
        duration: 0.8,
        ease: 'back.out(1.35)',
        ...vars,
        clearProps: 'transform',
        scrollTrigger: { trigger, start: 'top 92%', once: true },
      });
      listen(trigger, 'focusin', () => {
        tween.progress(1);
        tween.scrollTrigger?.kill();
      });
      return tween;
    };

    const welcome = gsap.timeline({ defaults: { ease: 'back.out(1.4)', clearProps: 'transform,opacity' } })
      .from('.nav-logo', { y: -28, rotation: -7, scale: 0.9, duration: 0.85 })
      .from('.nav-amazon', { y: -18, opacity: 0, duration: 0.55 }, 0.16)
      .from('.hero-content', { y: 25, opacity: 0, duration: 0.7 }, 0.25)
      .from('.hero-card h1, .hero-card p, .hero-button', {
        y: 13, opacity: 0, duration: 0.5, stagger: 0.1,
      }, 0.35);

    listen(document.querySelector('.hero'), 'focusin', () => welcome.progress(1));
    context.add('heroVisibility', event => {
      welcome.progress(1);
      const target = document.querySelector(event.detail.show ? '.hero-card' : '.hero-card-restore');
      gsap.fromTo(target, { y: 12, scale: 0.94, opacity: 0 }, {
        y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)',
        overwrite: true, clearProps: 'transform,opacity',
      });
    });
    listen(document.querySelector('#hero-card'), 'hero:visibility', context.heroVisibility);

    gsap.from('.friendship-bar > *', {
      y: 12, scale: 0.75, rotation: index => index % 2 ? -18 : 0,
      stagger: 0.09, duration: 0.65, ease: 'back.out(2.2)', clearProps: 'transform',
      scrollTrigger: { trigger: '.friendship-bar', start: 'top 95%', once: true },
    });

    reveal('.collection-heading', { y: 24, scale: 0.96 }, document.querySelector('.collection-heading'));
    gsap.utils.toArray('.book').forEach((book, index) => {
      reveal(book, {
        y: desktop ? 52 : 28, scale: 0.92, rotation: index % 2 ? 2.5 : -2.5,
        delay: desktop ? index * 0.08 : (index % 2) * 0.07,
      });
    });

    gsap.utils.toArray('.character').forEach((section, index) => {
      const portrait = section.querySelector('.character-portrait');
      reveal(portrait, {
        y: 24, x: desktop ? (index ? 35 : -35) : 0,
        rotation: index ? 7 : -7, scale: 0.9, duration: 1,
      });
      reveal(section.querySelector('.character-copy'), {
        y: 24, duration: 0.75, ease: 'power2.out',
      });
    });

    // Scroll-linked artwork moves around the words; the copy stays still and readable.
    if (desktop) {
      gsap.utils.toArray('.collection-heading, .character-copy').forEach((shape, index) => {
        gsap.fromTo(shape, {
          '--shape-turn': `${index % 2 ? 4 : -4}deg`, '--shape-scale': 0.98,
        }, {
          '--shape-turn': `${index % 2 ? -4 : 4}deg`, '--shape-scale': 1.035,
          ease: 'none',
          scrollTrigger: { trigger: shape, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        });
      });
    }

    // Animate the button's image so its existing horizontal centering is untouched.
    reveal('.amazon-feature-button img', { y: 22, scale: 0.8 }, document.querySelector('.amazon-feature-button'));
    reveal('.footer-brand', { y: 22, rotation: -4, scale: 0.94 }, document.querySelector('.footer-brand'));

    if (finePointer) {
      gsap.utils.toArray('.book-image').forEach(link => {
        const cover = link.querySelector('img');
        const book = link.closest('.book');
        link.classList.add('is-tilting');
        const paws = Array.from({ length: 3 }, (_, index) => {
          const paw = document.createElement('img');
          paw.className = 'book-paw';
          paw.src = `assets/images/paw%20icon%20${index % 2 ? 'right' : 'left'}.svg`;
          paw.alt = '';
          paw.setAttribute('aria-hidden', 'true');
          paw.width = 24;
          paw.height = 26;
          link.append(paw);
          return paw;
        });
        const pawPop = gsap.timeline({ paused: true })
          .fromTo(paws, { y: 14, scale: 0.35, opacity: 0, rotation: -20 }, {
            y: 0, scale: 1, opacity: 0.9, rotation: 12,
            duration: 0.35, stagger: 0.07, ease: 'back.out(2)',
          })
          .to(paws, { y: -16, opacity: 0, scale: 0.8, stagger: 0.06, duration: 0.35 }, 0.55);
        const lift = gsap.to(cover, {
          y: -7, scale: 1.045, duration: 0.35, ease: 'back.out(1.8)', paused: true,
        });
        const tiltX = gsap.quickTo(cover, 'rotationX', { duration: 0.45, ease: 'power2.out' });
        const tiltY = gsap.quickTo(cover, 'rotationY', { duration: 0.45, ease: 'power2.out' });
        gsap.set(cover, { transformPerspective: 650 });
        const reset = () => {
          tiltX(0);
          tiltY(0);
          lift.reverse();
        };
        const greet = () => { lift.play(); pawPop.restart(); };
        listen(link, 'pointerenter', greet);
        listen(link, 'pointermove', event => {
          const bounds = link.getBoundingClientRect();
          tiltX((0.5 - (event.clientY - bounds.top) / bounds.height) * 10);
          tiltY(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
        });
        listen(link, 'pointerleave', reset);
        listen(book, 'focusin', greet);
        listen(book, 'focusout', event => {
          if (!book.contains(event.relatedTarget)) reset();
        });
        cleanups.push(() => {
          link.classList.remove('is-tilting');
          paws.forEach(paw => paw.remove());
        });
      });

      gsap.utils.toArray('.nav-logo img, .footer-brand img').forEach(logo => {
        const wave = gsap.timeline({ paused: true })
          .to(logo, { rotation: -5, duration: 0.12, ease: 'power1.out' })
          .to(logo, { rotation: 4, duration: 0.18, ease: 'power1.inOut' })
          .to(logo, { rotation: 0, duration: 0.45, ease: 'elastic.out(1, 0.4)', clearProps: 'transform' });
        listen(logo.closest('a'), 'pointerenter', () => wave.restart());
        listen(logo.closest('a'), 'focus', () => wave.restart());
      });
    }

    return () => cleanups.forEach(cleanup => cleanup());
  });

  // Lazy images and fonts can settle after setup; refresh the trigger positions.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  document.querySelectorAll('img[loading="lazy"]').forEach(image => {
    image.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
