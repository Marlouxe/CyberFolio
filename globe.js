import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// ─── DATA: fill in your own photos under images/travel/ ──────────
// Countries: shown when hovering a green (visited) area on the globe.
const COUNTRIES = [
  { key: 'germany',   label: 'Allemagne',  lat: 51.2, lon: 10.4,  date: "Enfance — quelques souvenirs seulement", photos: ['images/travel/allemagne.jpg'] },
  { key: 'spain',     label: 'Espagne',    lat: 40.0, lon: -4.0,  date: 'Été 2026',      photos: ['images/travel/espagne.jpg'] },
  { key: 'france',    label: 'France',     lat: 46.6, lon: 2.2,   date: "J'y vis 🇫🇷",  photos: ['images/travel/village.jpg', 'images/travel/paris.jpg'] },
  { key: 'corsica',   label: 'Corse',      lat: 42.1, lon: 9.1,   date: 'Été 2022',      photos: ['images/travel/corse.jpg'],
    bbox: { latMin: 41.2, latMax: 43.1, lonMin: 8.4, lonMax: 9.7 } },
  { key: 'sardinia',  label: 'Sardaigne',  lat: 40.0, lon: 9.1,   date: 'Été 2022',      photos: ['images/travel/sardaigne.jpg'],
    bbox: { latMin: 38.8, latMax: 41.3, lonMin: 8.0, lonMax: 9.9 } },
  { key: 'greece',    label: 'Grèce',      lat: 39.0, lon: 22.0,  date: 'Avril 2023',    photos: ['images/travel/grece.jpg'] },
  { key: 'norway',    label: 'Norvège',    lat: 60.5, lon: 8.5,   date: 'Été 2023',      photos: ['images/travel/norvege.jpg'] },
  { key: 'estonia',   label: 'Estonie',    lat: 58.9, lon: 25.5,  date: 'Été 2024',      photos: ['images/travel/estonie.jpg'] },
  { key: 'latvia',    label: 'Lettonie',   lat: 56.9, lon: 24.6,  date: 'Été 2024',      photos: ['images/travel/lettonie.jpg'] },
  { key: 'lithuania', label: 'Lituanie',   lat: 55.0, lon: 23.9,  date: 'Été 2024',      photos: ['images/travel/lituanie.jpg'] },
];

// Pins: shown when hovering the 3D pin markers themselves.
const PINS = {
  Pin_Seattle: {
    label: 'Seattle',
    text: "Seattle, c'est le berceau de géants tech comme Microsoft et Amazon, avec une vraie scène cybersécurité. Après une formation où j'apprends à défendre des systèmes, j'ai envie d'aller voir comment ça se joue à l'échelle d'un des plus gros hubs tech au monde.",
  },
  Pin_NewYork: {
    label: 'New York',
    text: "New York, c'est l'énergie brute, le rythme qui ne s'arrête jamais, et une concentration incroyable d'entreprises tech et financières à sécuriser. Un vrai défi de s'adapter à une ville pareille — exactement le genre de challenge qui me donne envie d'avancer.",
  },
  Pin_Tokyo: {
    label: 'Tokyo',
    text: "Le Japon, c'est un dépaysement total : une culture, une langue et une façon de penser la technologie très différentes de ce que je connais. Après avoir voyagé en Europe, j'ai envie de me confronter à un vrai choc culturel, et Tokyo est réputée pour son excellence en tech et cybersécurité.",
  },
};

(function () {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const card = document.getElementById('globeCard');

  // ── renderer / scene / camera ──
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 2, 4);
  scene.add(key);

  let globeNode = null;
  const pinNodes = {};
  let maskCanvas = null, maskCtx = null;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    const w = rect.width || 300, h = rect.height || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap);
  else window.addEventListener('resize', resize);

  new GLTFLoader().load('assets/globe.glb', (gltf) => {
    scene.add(gltf.scene);
    globeNode = gltf.scene.getObjectByName('Globe');
    ['Pin_Seattle', 'Pin_NewYork', 'Pin_Tokyo'].forEach((n) => {
      const obj = gltf.scene.getObjectByName(n);
      if (obj) pinNodes[n] = obj;
    });

    // grab the baked texture so we can sample it on hover (is this pixel a visited/green country?)
    const mat = globeNode && globeNode.material;
    const tex = mat && mat.map;
    if (tex && tex.image) {
      maskCanvas = document.createElement('canvas');
      maskCanvas.width = tex.image.width;
      maskCanvas.height = tex.image.height;
      maskCtx = maskCanvas.getContext('2d');
      maskCtx.drawImage(tex.image, 0, 0);
    }

    resize();
    tick();
  });

  let dragging = false, lastX = 0, autoRotate = true;
  canvas.addEventListener('mousedown', (e) => { dragging = true; lastX = e.clientX; });
  window.addEventListener('mouseup', () => (dragging = false));
  window.addEventListener('mousemove', (e) => {
    if (dragging && globeNode) {
      globeNode.rotation.y += (e.clientX - lastX) * 0.008;
      lastX = e.clientX;
    }
  });
  canvas.addEventListener('mouseenter', () => (autoRotate = false));
  canvas.addEventListener('mouseleave', () => { autoRotate = true; hideCard(); });

  function tick() {
    if (autoRotate && !dragging && globeNode) globeNode.rotation.y += 0.0025;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // ── hover raycasting ──
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  let lastClientX = 0, lastClientY = 0;

  canvas.addEventListener('mousemove', (e) => {
    lastClientX = e.clientX; lastClientY = e.clientY;
    const rect = canvas.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (!globeNode) return;
    raycaster.setFromCamera(mouseNDC, camera);

    const pinList = Object.values(pinNodes);
    const pinHits = raycaster.intersectObjects(pinList, true);
    if (pinHits.length) {
      let obj = pinHits[0].object;
      while (obj && !PINS[obj.name]) obj = obj.parent;
      if (obj) { showPinCard(PINS[obj.name]); return; }
    }

    const hits = raycaster.intersectObject(globeNode, true);
    if (hits.length && hits[0].uv && maskCtx) {
      const uv = hits[0].uv;
      const country = matchCountry(uv);
      if (country) { showCountryCard(country); return; }
    }
    hideCard();
  });

  function isGreen(u, v) {
    const x = Math.min(maskCanvas.width - 1, Math.max(0, Math.floor(u * maskCanvas.width)));
    const y = Math.min(maskCanvas.height - 1, Math.max(0, Math.floor((1 - v) * maskCanvas.height)));
    const [r, g, b] = maskCtx.getImageData(x, y, 1, 1).data;
    return g > r + 15 && g > 150; // our apple-green is clearly G-dominant vs the orange land / white ocean
  }

  function matchCountry(uv) {
    if (!isGreen(uv.x, uv.y)) return null;
    const lon = uv.x * 360 - 180;
    const lat = uv.y * 180 - 90;

    // small island regions first (tight bounding boxes beat nearest-centroid)
    for (const c of COUNTRIES) {
      if (c.bbox && lat >= c.bbox.latMin && lat <= c.bbox.latMax && lon >= c.bbox.lonMin && lon <= c.bbox.lonMax) {
        return c;
      }
    }
    // otherwise nearest centroid among the non-bbox countries
    let best = null, bestD = Infinity;
    for (const c of COUNTRIES) {
      if (c.bbox) continue;
      const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
      if (d < bestD) { bestD = d; best = c; }
    }
    return best;
  }

  function positionCard() {
    const rect = wrap.getBoundingClientRect();
    card.style.left = (lastClientX - rect.left) + 'px';
    card.style.top = (lastClientY - rect.top) + 'px';
  }

  function showCountryCard(c) {
    positionCard();
    card.classList.remove('text-only');
    const media = card.querySelector('.card-media');
    media.innerHTML = '';
    if (c.photos && c.photos.length) {
      media.classList.toggle('multi', c.photos.length > 1);
      c.photos.slice(0, 2).forEach((src) => {
        const img = document.createElement('img');
        img.src = src; img.alt = c.label;
        img.onerror = () => {
          img.remove();
          const ph = document.createElement('div');
          ph.className = 'ph'; ph.textContent = '📍';
          media.appendChild(ph);
        };
        media.appendChild(img);
      });
    }
    card.querySelector('.name').textContent = c.label;
    const tagline = card.querySelector('.tag-line');
    tagline.textContent = c.date;
    tagline.style.display = 'block';
    tagline.style.color = '';
    card.classList.add('show');
  }

  function showPinCard(pin) {
    positionCard();
    card.classList.add('text-only');
    card.querySelector('.card-media').innerHTML = '';
    card.querySelector('.name').textContent = pin.label;
    const tagline = card.querySelector('.tag-line');
    tagline.textContent = pin.text;
    tagline.style.display = 'block';
    tagline.style.color = 'var(--muted)';
    card.classList.add('show');
  }

  function hideCard() { card.classList.remove('show'); }
})();