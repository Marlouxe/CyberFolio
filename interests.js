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

// ─── PHOTOS : clic = agrandir, photo absente = emoji à la place ───
document.querySelectorAll('.tile').forEach((tile) => {
  const img = tile.querySelector('img');
  const markMissing = () => tile.classList.add('missing');
  img.addEventListener('error', markMissing);
  if (img.complete && img.naturalWidth === 0) markMissing();
  tile.addEventListener('click', () => {
    if (!tile.classList.contains('missing')) openLightbox(img.src);
  });
});

// ─── SCROLL REVEAL ─────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));