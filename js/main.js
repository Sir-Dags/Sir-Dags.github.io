// ============ Starfield ============
(function starfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let width, height;
  let mouseX = 0, mouseY = 0;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.floor((width * height) / 8000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      parallax: Math.random() * 0.5 + 0.1,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    if (document.documentElement.getAttribute('data-theme') === 'light') {
      if (!reduceMotion) requestAnimationFrame(draw);
      return;
    }
    for (const s of stars) {
      const alpha = reduceMotion
        ? s.baseAlpha
        : s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.3;
      const dx = reduceMotion ? 0 : (mouseX - width / 2) * s.parallax * 0.01;
      const dy = reduceMotion ? 0 : (mouseY - height / 2) * s.parallax * 0.01;
      ctx.beginPath();
      ctx.arc(s.x + dx, s.y + dy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 236, 255, ${Math.max(alpha, 0)})`;
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  resize();
  requestAnimationFrame(draw);
  if (reduceMotion) draw(0);
})();

// ============ Comet scroll reveal ============
(function cometScroll() {
  const path = document.getElementById('glitchPath');
  const head = document.getElementById('cometHead');
  const glow = document.getElementById('cometGlow');
  const headGroup = document.getElementById('cometHeadGroup');
  if (!path || !head || !glow || !headGroup) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length}`;

  if (reduceMotion) {
    path.style.strokeDashoffset = '0';
    return;
  }

  const SCROLL_RANGE = 0.8; // fraction of one viewport height over which the star travels
  const FADE_START = 0.5; // fade the head out well before it nears the clipped edge
  const FADE_END = 0.78; // fully transparent by here, with margin before clipping starts
  const HEAD_R = 7;
  const GLOW_R = 16;

  function update() {
    const range = window.innerHeight * SCROLL_RANGE;
    const progress = Math.max(0, Math.min(1, window.scrollY / range));

    path.style.strokeDashoffset = `${length * (1 - progress)}`;

    const point = path.getPointAtLength(length * progress);
    head.setAttribute('cx', point.x);
    head.setAttribute('cy', point.y);
    glow.setAttribute('cx', point.x);
    glow.setAttribute('cy', point.y);

    let fade = 1;
    if (progress >= FADE_END) fade = 0;
    else if (progress > FADE_START) fade = 1 - (progress - FADE_START) / (FADE_END - FADE_START);
    headGroup.style.opacity = `${fade}`;

    // Shrink the disc as it fades so there's less translucent area to see through,
    // rather than a fixed-size circle just going glassy.
    head.setAttribute('r', HEAD_R * fade);
    glow.setAttribute('r', GLOW_R * fade);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  });

  update();
})();

// ============ Theme toggle ============
(function themeToggle() {
  const STORAGE_KEY = 'sir-dags-theme';
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem(STORAGE_KEY, 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem(STORAGE_KEY, 'light');
    }
  });
})();

// ============ Typing effect ============
(function typewriter() {
  const el = document.getElementById('typed');
  if (!el) return;

  const phrases = [
    'They cast me and accidentally wrote me.',
    'I ran the bug bounty. I also caused half of it.',
    'Built a virtual world scary enough to haunt my dreams.',
    'I liked games so much I ended up making one.',
    'Got into cybersecurity out of curiosity. Stayed for the chaos.',
    'I manage the Steam page, the Discord, the playtests, and the vibe.',
    'If you couldn\'t afford to fix it, I fixed it for free.',
    'If it needed to exist, I built it.',
    'I am the FAQ. I also wrote the FAQ.',
    'If it\'s player-facing, it came through me first.',
    'My back hurts :(',
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    el.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 35 : 60);
  }

  tick();
})();

// ============ Nav: mobile toggle + active link + scroll progress ============
(function nav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  const navAnchors = document.querySelectorAll('a[data-nav]');
  const sections = Array.from(navAnchors).map((a) =>
    document.querySelector(a.getAttribute('href'))
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach((a) =>
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`)
          );
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => s && observer.observe(s));

  const progressBar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${(scrollTop / docHeight) * 100}%`;
  });
})();

// ============ Scroll reveal ============
(function reveal() {
  const sections = document.querySelectorAll('.section:not(.hero)');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px 200px 0px' }
  );
  sections.forEach((s) => observer.observe(s));
})();

// ============ Back to top ============
(function backToTop() {
  const btn = document.getElementById('back-to-top');
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
