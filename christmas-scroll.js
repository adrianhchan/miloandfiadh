(() => {
  const { gsap, ScrollTrigger } = window;
  const section = document.querySelector('.amazon-feature');
  const video = document.querySelector('#christmas-book-video');
  if (!gsap || !ScrollTrigger || !section || !video || !video.canPlayType('video/mp4')) return;

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const poster = section.querySelector('.amazon-feature-image');
    const cue = section.querySelector('.christmas-scroll-cue');
    const progressBar = section.querySelector('.christmas-scroll-progress');
    const playhead = { progress: 0 };
    const listeners = [];
    let active = true;
    let ready = false;
    let loading = false;
    let observer;
    let objectUrl;
    const download = new AbortController();
    section.classList.add('is-scroll-scene');

    const listen = (event, handler) => {
      video.addEventListener(event, handler);
      listeners.push(() => video.removeEventListener(event, handler));
    };

    // Let the browser finish decoding a frame before requesting the latest one.
    // This avoids a backlog of seeks when someone scrolls quickly or reverses.
    const seek = () => {
      if (!active || video.readyState < 1 || !Number.isFinite(video.duration) || video.seeking) return;
      const end = Math.max(0, video.duration - 1 / 48);
      const time = Math.min(1, Math.max(0, playhead.progress)) * end;
      const tolerance = playhead.progress <= 0 || playhead.progress >= 1 ? 0.001 : 1 / 48;
      if (Math.abs(video.currentTime - time) < tolerance) return;
      try {
        video.currentTime = time;
      } catch {
        // A later loadeddata/seeked event retries if media is not seekable yet.
      }
    };

    const update = () => {
      section.style.setProperty('--book-progress', playhead.progress);
      cue.hidden = !ready || playhead.progress > 0.1;
      seek();
    };

    const scrub = gsap.to(playhead, {
      progress: 1,
      ease: 'none',
      onUpdate: update,
      scrollTrigger: {
        id: 'christmas-book-scrub',
        trigger: section,
        start: 'center center',
        end: () => `+=${Math.round(window.innerHeight * (window.innerWidth <= 600 ? 1.35 : 1.8))}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.2,
        invalidateOnRefresh: true,
      },
    });

    const showFrame = () => {
      if (!active || video.readyState < 2) return;
      ready = true;
      video.hidden = false;
      poster.hidden = true;
      progressBar.hidden = false;
      update();
    };

    const showPoster = () => {
      video.hidden = true;
      poster.hidden = false;
      cue.hidden = true;
      progressBar.hidden = true;
      section.style.removeProperty('--book-progress');
    };

    listen('loadedmetadata', () => { video.pause(); seek(); });
    listen('loadeddata', showFrame);
    listen('seeked', showFrame);
    const fail = () => {
      active = false;
      observer?.disconnect();
      scrub.scrollTrigger.kill();
      scrub.kill();
      showPoster();
      section.classList.remove('is-scroll-scene');
      ScrollTrigger.refresh();
    };
    listen('error', fail);

    const load = async () => {
      if (!active || loading) return;
      loading = true;
      try {
        // A local blob supports frame seeking even on basic static servers
        // that do not implement HTTP byte-range responses.
        const response = await fetch(video.dataset.src, { signal: download.signal });
        if (!response.ok) throw new Error('Christmas video unavailable');
        const blob = await response.blob();
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        video.muted = true;
        video.preload = 'auto';
        video.src = objectUrl;
        video.load();
      } catch (error) {
        if (active && error.name !== 'AbortError') fail();
      }
    };

    // Fetch shortly before this section arrives, rather than during hero playback.
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          load();
          observer.disconnect();
        }
      }, { rootMargin: '100% 0px' });
      observer.observe(section);
    } else {
      load();
    }
    ScrollTrigger.refresh();

    return () => {
      active = false;
      download.abort();
      observer?.disconnect();
      listeners.forEach(remove => remove());
      video.pause();
      showPoster();
      section.classList.remove('is-scroll-scene');
      video.removeAttribute('src');
      video.preload = 'none';
      if (loading) video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      // gsap.matchMedia reverts the tween and removes the pin/spacer itself.
    };
  });
})();
