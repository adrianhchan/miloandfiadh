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

document.querySelector('#copyright-year').textContent = new Date().getFullYear();
