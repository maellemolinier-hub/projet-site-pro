/* ===== MAËLLE JEAN — Agent Immo 2.0 · main.js ===== */

// Navbar scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// Mobile nav
const hamburger = document.getElementById('navToggle');
const navMenu = document.getElementById('navLinks');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => navMenu.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
    }
  });
}

// Chatbot
const chatToggle = document.getElementById('chatbotToggle');
const chatPanel = document.getElementById('chatbotPanel');
const chatClose = document.getElementById('chatbotClose');
if (chatToggle && chatPanel) {
  chatToggle.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    dismissHint();
  });
}
if (chatClose) chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));

function dismissHint(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const h = document.getElementById('chatbotHint');
  if (h) h.style.display = 'none';
}
setTimeout(() => dismissHint(), 8000);

// Audio greeting
let audioPlaying = false;
function toggleAudio() {
  const audio = document.getElementById('welcomeAudio');
  const btn = document.getElementById('audioBtn');
  if (!audio) return;

  if (audioPlaying) {
    audio.pause();
    audio.currentTime = 0;
    audioPlaying = false;
    btn.classList.remove('playing');
  } else {
    audio.play().then(() => {
      audioPlaying = true;
      btn.classList.add('playing');
      audio.onended = () => {
        audioPlaying = false;
        btn.classList.remove('playing');
      };
    }).catch(() => {
      showToast('🎵 Message audio bientôt disponible !');
    });
  }
}

// Number counter animation
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.round(current);
  }, 16);
}

// Intersection Observer for reveal + counters
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    entry.target.querySelectorAll('[data-target]').forEach(el => {
      if (!el.dataset.counted) { el.dataset.counted = '1'; animateCounter(el); }
    });
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
const heroCounters = document.querySelector('.hero-counters');
if (heroCounters) observer.observe(heroCounters);

// Home staging slider
const hsSlider = document.getElementById('hsSlider');
if (hsSlider) {
  const hsAfter = document.getElementById('hsAfter');
  const hsContainer = document.getElementById('hsContainer');
  let dragging = false;

  function setSlider(x) {
    const rect = hsContainer.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    hsSlider.style.left = pct + '%';
    hsAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
  }

  hsSlider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
  document.addEventListener('mousemove', e => { if (dragging) setSlider(e.clientX); });
  document.addEventListener('mouseup', () => { dragging = false; });
  hsSlider.addEventListener('touchstart', () => { dragging = true; }, { passive: true });
  document.addEventListener('touchmove', e => { if (dragging) setSlider(e.touches[0].clientX); }, { passive: true });
  document.addEventListener('touchend', () => { dragging = false; });

  // Auto-animate on load
  setTimeout(() => {
    let pct = 82;
    const anim = setInterval(() => {
      pct -= 1.8;
      hsSlider.style.left = pct + '%';
      hsAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
      if (pct <= 50) clearInterval(anim);
    }, 18);
  }, 1400);
}

// Toast
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Ebook form (sub-pages)
function submitEbook(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]') || e.target.querySelector('button');
  if (btn) { btn.textContent = '✓ E-book envoyé !'; btn.style.background = '#16a34a'; }
  showToast('🎉 Votre e-book est en route dans votre boîte mail !');
}

// Lead notification stub
function sendLeadNotification(data) { console.log('[LEAD]', data); }

// Son hero : active la vidéo + le message vocal simultanément
function activateHeroSound() {
  const video = document.getElementById('heroVideo');
  const btn = document.getElementById('heroSoundBtn');
  const audio = document.getElementById('welcomeAudio');

  // Unmute et repart depuis le début
  if (video) {
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  // Message vocal en parallèle
  if (audio && !audioPlaying) {
    audio.play().then(() => {
      audioPlaying = true;
      const ab = document.getElementById('audioBtn');
      if (ab) ab.classList.add('playing');
      audio.onended = () => {
        audioPlaying = false;
        if (ab) ab.classList.remove('playing');
      };
    }).catch(() => {});
  }

  if (btn) {
    btn.classList.add('on');
    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg> Son activé';
  }
}