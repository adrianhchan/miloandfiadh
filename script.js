const video = document.querySelector('#hero-video');
const videoToggle = document.querySelector('.video-toggle');
const videoLabel = document.querySelector('.video-toggle-label');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (video && videoToggle) {
  const updateVideoControl = () => {
    videoToggle.classList.toggle('is-paused', video.paused);
    videoToggle.setAttribute('aria-label', video.paused ? 'Play background video' : 'Pause background video');
    videoLabel.textContent = video.paused ? 'Play video' : 'Pause video';
  };

  const applyMotionPreference = () => {
    if (reducedMotion.matches) {
      video.autoplay = false;
      video.pause();
    }
    updateVideoControl();
  };

  videoToggle.hidden = false;
  videoToggle.addEventListener('click', async () => {
    if (video.paused) {
      try {
        await video.play();
      } catch {
        // The poster remains visible if the browser cannot play the video.
      }
    } else {
      video.pause();
    }
    updateVideoControl();
  });

  video.addEventListener('play', updateVideoControl);
  video.addEventListener('pause', updateVideoControl);
  reducedMotion.addEventListener('change', applyMotionPreference);
  applyMotionPreference();
}

const heroCard = document.querySelector('#hero-card');
const heroClose = document.querySelector('.hero-card-close');
const heroRestore = document.querySelector('.hero-card-restore');
const mobileHero = window.matchMedia('(max-width: 600px)');

if (heroCard && heroClose && heroRestore) {
  const showHeroCard = (show, moveFocus = false) => {
    heroCard.hidden = !show;
    heroClose.hidden = !mobileHero.matches;
    heroRestore.hidden = show || !mobileHero.matches;
    heroCard.dispatchEvent(new CustomEvent('hero:visibility', { detail: { show } }));

    if (moveFocus) {
      (show ? heroClose : heroRestore).focus({ preventScroll: true });
    }
  };

  heroClose.addEventListener('click', () => showHeroCard(false, true));
  heroRestore.addEventListener('click', () => showHeroCard(true, true));
  mobileHero.addEventListener('change', () => {
    const controlFocused = [heroClose, heroRestore].includes(document.activeElement);
    showHeroCard(true);
    if (controlFocused) {
      (mobileHero.matches ? heroClose : heroCard.querySelector('.hero-button')).focus({ preventScroll: true });
    }
  });
  showHeroCard(true);
}

document.querySelector('#copyright-year').textContent = new Date().getFullYear();
