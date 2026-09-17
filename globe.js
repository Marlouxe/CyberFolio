// ─── GLOBE — wireframe sphere, rotating, hoverable markers ──────
(function () {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const card = document.getElementById('globeCard');
  const ctx = canvas.getContext('2d');

  // Locations: [name, lat, lon, type, photo]
  // type: 'visited' or 'target'. Drop a matching photo in images/travel/
  // and point to it here to replace the placeholder card.
  const LOCATIONS = [
    { name: 'Allemagne',  lat: 51.2, lon: 10.4,  type: 'visited', photo: 'images/travel/allemagne.jpg' },
    { name: 'Espagne',    lat: 40.0, lon: -4.0,  type: 'visited', photo: 'images/travel/espagne.jpg' },
    { name: 'Grèce',      lat: 39.0, lon: 22.0,  type: 'visited', photo: 'images/travel/grece.jpg' },
    { name: 'Lettonie',   lat: 56.9, lon: 24.6,  type: 'visited', photo: 'images/travel/lettonie.jpg' },
    { name: 'Lituanie',   lat: 55.0, lon: 23.9,  type: 'visited', photo: 'images/travel/lituanie.jpg' },
    { name: 'Estonie',    lat: 58.9, lon: 25.5,  type: 'visited', photo: 'images/travel/estonie.jpg' },
    { name: 'Norvège',    lat: 60.5, lon: 8.5,   type: 'visited', photo: 'images/travel/norvege.jpg' },
    { name: 'Sardaigne',  lat: 40.0, lon: 9.4,   type: 'visited', photo: 'images/travel/sardaigne.jpg' },
    { name: 'Corse',      lat: 42.3, lon: 9.0,   type: 'visited', photo: 'images/travel/corse.jpg' },
    { name: 'Seattle',    lat: 47.6, lon: -122.3, type: 'target', photo: 'images/travel/seattle.jpg' },
    { name: 'New York',   lat: 40.7, lon: -74.0,  type: 'target', photo: 'images/travel/newyork.jpg' },
  ];

  let W, H, R, cx, cy;
  let angle = 0.4;
  let dragging = false, lastX = 0, autoRotate = true;
  const focal = 3.2;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H / 2; R = Math.min(W, H) * 0.42;
  }
  window.addEventListener('resize', resize);
  resize();

  function project(lat, lon) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon * Math.PI / 180) + angle;
    let x = Math.sin(phi) * Math.sin(theta);
    let y = Math.cos(phi);
    let z = Math.sin(phi) * Math.cos(theta);
    const scale = focal / (focal - z);
    return {
      x: cx + x * R * scale * 0.62,
      y: cy - y * R * scale * 0.62,
      z, scale
    };
  }

  function getAccent(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#4fd1c5';
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const border = getAccent('--border');
    const accent = getAccent('--accent');
    const target = getAccent('--accent3');

    // graticule (latitude/longitude wire lines)
    ctx.lineWidth = 1;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 6) {
        const p = project(lat, lon);
        const op = Math.max(0, (p.z + 1) / 2) * 0.35;
        ctx.strokeStyle = hexA(border, op);
        if (lon === -180) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    for (let lon = -180; lon < 180; lon += 30) {
      ctx.beginPath();
      for (let lat = -90; lat <= 90; lat += 6) {
        const p = project(lat, lon);
        const op = Math.max(0, (p.z + 1) / 2) * 0.35;
        ctx.strokeStyle = hexA(border, op);
        if (lat === -90) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.62, 0, Math.PI * 2);
    ctx.strokeStyle = hexA(border, .5);
    ctx.stroke();

    // markers, sorted so back ones draw first
    const pts = LOCATIONS.map(loc => ({ loc, p: project(loc.lat, loc.lon) }));
    pts.sort((a, b) => a.p.z - b.p.z);
    pts.forEach(({ loc, p }) => {
      if (p.z < -0.15) return; // hidden on far side
      const col = loc.type === 'target' ? target : accent;
      const r = loc.type === 'target' ? 5 : 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      if (loc.type === 'target') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = hexA(col, .5);
        ctx.stroke();
      }
    });

    loc_points = pts;
  }

  let loc_points = [];

  function hexA(hex, a) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16) || 90;
    const g = parseInt(hex.slice(2, 4), 16) || 100;
    const b = parseInt(hex.slice(4, 6), 16) || 110;
    return `rgba(${r},${g},${b},${a})`;
  }

  function tick() {
    if (autoRotate && !dragging) angle += 0.0025;
    draw();
    requestAnimationFrame(tick);
  }

  // ── interaction ──
  canvas.addEventListener('mousedown', e => { dragging = true; lastX = e.clientX; });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('mousemove', e => {
    if (dragging) { angle += (e.clientX - lastX) * 0.005; lastX = e.clientX; }
  });

  canvas.addEventListener('mouseenter', () => autoRotate = false);
  canvas.addEventListener('mouseleave', () => { autoRotate = true; hideCard(); });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let closest = null, dist = 16;
    loc_points.forEach(({ loc, p }) => {
      if (p.z < -0.15) return;
      const d = Math.hypot(p.x - mx, p.y - my);
      if (d < dist) { dist = d; closest = { loc, p }; }
    });
    if (closest) showCard(closest.loc, closest.p);
    else hideCard();
  });

  function showCard(loc, p) {
    card.style.left = p.x + 'px';
    card.style.top = p.y + 'px';
    const img = card.querySelector('.card-media');
    img.innerHTML = '';
    const el = document.createElement('img');
    el.alt = loc.name;
    el.src = loc.photo;
    el.onerror = () => {
      el.remove();
      const ph = document.createElement('div');
      ph.className = 'ph';
      ph.textContent = loc.type === 'target' ? '🎯' : '📍';
      img.appendChild(ph);
    };
    img.appendChild(el);
    card.querySelector('.name').textContent = loc.name;
    const tagline = card.querySelector('.tag-line');
    tagline.textContent = loc.type === 'target' ? 'Prochaine destination visée' : '';
    tagline.style.display = loc.type === 'target' ? 'block' : 'none';
    card.classList.add('show');
  }
  function hideCard() { card.classList.remove('show'); }

  tick();
})();