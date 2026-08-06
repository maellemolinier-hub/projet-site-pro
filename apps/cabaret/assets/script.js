/* =========================================================
   VESPER — interactions & animations
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Rideau d'ouverture ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => document.body.classList.add('is-loaded'), 350);
  });
  // filet de sécurité si "load" tarde (polices lentes, etc.)
  setTimeout(() => document.body.classList.add('is-loaded'), 2200);

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById('burger');
  const links = document.querySelector('.nav__links');
  burger.addEventListener('click', () => links.classList.toggle('is-open'));
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('is-open'))
  );

  /* ---------- Particules dorées ---------- */
  const sparkContainer = document.getElementById('sparkles');
  const SPARKS = 26;
  for (let i = 0; i < SPARKS; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.left = Math.random() * 100 + '%';
    s.style.setProperty('--drift', (Math.random() * 60 - 30).toFixed(0) + 'px');
    s.style.animationDuration = (5 + Math.random() * 6).toFixed(1) + 's';
    s.style.animationDelay = (Math.random() * 8).toFixed(1) + 's';
    sparkContainer.appendChild(s);
  }

  /* ---------- Reveal au scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Carrousel d'avis ---------- */
  const reviews = document.querySelectorAll('.review');
  const dotsWrap = document.getElementById('reviewDots');
  let current = 0;
  reviews.forEach((_, i) => {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => showReview(i));
    dotsWrap.appendChild(dot);
  });
  function showReview(i) {
    reviews[current].classList.remove('is-active');
    dotsWrap.children[current].classList.remove('is-active');
    current = i;
    reviews[current].classList.add('is-active');
    dotsWrap.children[current].classList.add('is-active');
  }
  setInterval(() => showReview((current + 1) % reviews.length), 5500);

  /* ---------- Formulaire de réservation -> WhatsApp ---------- */
  const form = document.getElementById('bookForm');
  const WHATSAPP_NUMBER = '33763632801';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nom = data.get('nom');
    const tel = data.get('tel');
    const date = data.get('date');
    const nb = data.get('nb');
    const message = data.get('message') || '—';
    const text =
      `Bonsoir, je souhaite réserver chez Vesper.\n` +
      `Nom : ${nom}\nTéléphone : ${tel}\nDate : ${date}\nPersonnes : ${nb}\nMessage : ${message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
});
