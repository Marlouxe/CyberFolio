// ─── SPARKLES ──────────────────────────────────
const container = document.getElementById('sparkles');
const colors = ['#f2a7c3', '#c9b8f0', '#ffd4b3', '#aaecdc', '#fce8a0'];

for (let i = 0; i < 60; i++) {
  const s = document.createElement('div');
  s.className = 'sparkle';
  s.style.left    = Math.random() * 100 + '%';
  s.style.top     = Math.random() * 100 + '%';
  s.style.setProperty('--d', (2 + Math.random() * 4) + 's');
  s.style.setProperty('--delay', '-' + (Math.random() * 6) + 's');
  s.style.width   = (2 + Math.random() * 4) + 'px';
  s.style.height  = s.style.width;
  s.style.background = colors[Math.floor(Math.random() * colors.length)];
  container.appendChild(s);
}

// ─── LIGHTBOX ──────────────────────────────────
function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ─── SCROLL REVEAL ─────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
