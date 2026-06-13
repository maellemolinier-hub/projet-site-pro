/* ===== MAËLLE JEAN — Main JS ===== */

// Navbar scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// Home staging slider
const hsSlider = document.getElementById('hsSlider');
if (hsSlider) {
  const afterEl = document.querySelector('.hs-after');
  let dragging = false;
  const container = document.querySelector('.hs-before-after');

  function setSlider(x) {
    const rect = container.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    hsSlider.style.left = pct + '%';
    afterEl.style.clipPath = `inset(0 0 0 ${pct}%)`;
  }

  hsSlider.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
  document.addEventListener('mousemove', (e) => { if (dragging) setSlider(e.clientX); });
  document.addEventListener('mouseup', () => { dragging = false; });
  hsSlider.addEventListener('touchstart', (e) => { dragging = true; }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (dragging) setSlider(e.touches[0].clientX);
  }, { passive: true });
  document.addEventListener('touchend', () => { dragging = false; });

  // Animate slider on load
  setTimeout(() => {
    let pct = 80;
    const anim = setInterval(() => {
      pct -= 1.5;
      hsSlider.style.left = pct + '%';
      afterEl.style.clipPath = `inset(0 0 0 ${pct}%)`;
      if (pct <= 50) clearInterval(anim);
    }, 20);
  }, 1200);
}

// Intersection Observer animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.value-card, .tech-card, .testi-card, .milestone, .vlog-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Ebook form
function submitEbook(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = '✓ E-book envoyé !';
  btn.style.background = '#16a34a';
  showToast('🎉 Votre e-book est en route dans votre boîte mail !');
  // Send lead notification
  sendLeadNotification({
    type: 'ebook',
    email: e.target.querySelector('input[type=email]').value,
    prenom: e.target.querySelector('input[type=text]').value,
    source: 'ebook_form',
    page: window.location.href,
    timestamp: new Date().toISOString()
  });
}

// Toast notification
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Lead notification (simulated — to replace with your webhook/email service)
function sendLeadNotification(data) {
  console.log('[LEAD]', data);
  // Example: fetch('/api/leads', { method: 'POST', body: JSON.stringify(data) })
}

// Dismiss chatbot hint
function dismissHint(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const hint = document.getElementById('chatbotHint');
  if (hint) hint.style.display = 'none';
}

// Auto-dismiss hint after 8s
setTimeout(() => dismissHint(), 8000);

// Chatbot toggle
const chatToggle = document.getElementById('chatbotToggle');
const chatPanel = document.getElementById('chatbotPanel');
const chatClose = document.getElementById('chatbotClose');

if (chatToggle && chatPanel) {
  chatToggle.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    dismissHint();
  });
}
if (chatClose) {
  chatClose.addEventListener('click', () => {
    chatPanel.classList.remove('open');
  });
}

// Video presentation overlay
function playVP() {
  const overlay = document.getElementById('vpOverlay');
  const video = document.querySelector('.vp-video');
  if (overlay) overlay.classList.add('hidden');
  if (video) video.play();
}
