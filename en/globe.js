import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ─── DATA: fill in your own photos under images/travel/ ──────────
// Countries: shown when hovering a green (visited) area on the globe.
const COUNTRIES = [
  { key: 'germany',   label: 'Germany',  lat: 51.2, lon: 10.4,  date: "Childhood: only a few memories", photos: ['../images/travel/allemagne.jpg'] },
  { key: 'spain',     label: 'Spain',    lat: 40.0, lon: -4.0,  date: 'Summer 2026',      photos: ['../images/travel/espagne.jpg'] },
  { key: 'france',    label: 'France',     lat: 46.6, lon: 2.2,   date: "I live here 🇫🇷",  photos: ['../images/travel/village.jpg', '../images/travel/paris.jpg'] },
  { key: 'corsica',   label: 'Corsica',      lat: 42.1, lon: 9.1,   date: 'Summer 2022',      photos: ['../images/travel/corse.jpg'],
    bbox: { latMin: 41.2, latMax: 43.1, lonMin: 8.4, lonMax: 9.7 } },
  { key: 'sardinia',  label: 'Sardinia',  lat: 40.0, lon: 9.1,   date: 'Summer 2022',      photos: ['../images/travel/sardaigne.jpg'],
    bbox: { latMin: 38.8, latMax: 41.3, lonMin: 8.0, lonMax: 9.9 } },
  { key: 'greece',    label: 'Greece',      lat: 39.0, lon: 22.0,  date: 'April 2023',    photos: ['../images/travel/grece.jpg'] },
  { key: 'norway',    label: 'Norway',    lat: 60.5, lon: 8.5,   date: 'Summer 2023',      photos: ['../images/travel/norvege.jpg'] },
  { key: 'estonia',   label: 'Estonia',    lat: 58.9, lon: 25.5,  date: 'Summer 2024',      photos: ['../images/travel/estonie.jpg'] },
  { key: 'latvia',    label: 'Latvia',   lat: 56.9, lon: 24.6,  date: 'Summer 2024',      photos: ['../images/travel/lettonie.jpg'] },
  { key: 'lithuania', label: 'Lithuania',   lat: 55.0, lon: 23.9,  date: 'Summer 2024',      photos: ['../images/travel/lituanie.jpg'] },
];

// Pins: shown when hovering the 3D pin markers themselves.
const PINS = {
  Pin_Seattle: {
    label: 'Seattle',
    text: "Seattle is the cradle of tech giants like Microsoft and Amazon, with a real cybersecurity scene. After a program where I learn to defend systems, I want to see how it plays out at the scale of one of the biggest tech hubs in the world.",
  },
  Pin_NewYork: {
    label: 'New York',
    text: "New York is raw energy, a rhythm that never stops, and an incredible concentration of tech and financial companies to protect. Adapting to a city like that is a real challenge, exactly the kind that makes me want to move forward.",
  },
  Pin_Tokyo: {
    label: 'Tokyo',
    text: "Japan is a total change of scenery: a culture, a language and a way of thinking about technology very different from what I know. After traveling around Europe, I want to face a real culture shock, and Tokyo is renowned for its excellence in tech and cybersecurity.",
  },
};

(function () {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const card = document.getElementById('globeCard');

  const PIN_RADIUS_PX = 38;      // zone de survol autour d'une épingle (en pixels écran)
  const COUNTRY_RADIUS_PX = 22;  // tolérance autour d'un pays vert (en pixels écran)

  let fallbackTimer = setTimeout(showFallback, 6000);
  function showFallback() {
    if (wrap.querySelector('.globe-fallback')) return;
    const msg = document.createElement('div');
    msg.className = 'globe-fallback';
    msg.textContent = '🌍 Nine countries visited · goal: Seattle, New York or Tokyo';
    wrap.appendChild(msg);
  }
  function clearFallback() {
    clearTimeout(fallbackTimer);
    const el = wrap.querySelector('.globe-fallback');
    if (el) el.remove();
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) { showFallback(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4);
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 2, 4);
  scene.add(key);

  let globeNode = null;
  const pinNodes = {};
  let maskData = null, maskW = 0, maskH = 0;
  let viewW = 300, viewH = 300;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    viewW = rect.width || 300; viewH = rect.height || 300;
    renderer.setSize(viewW, viewH, false);
    camera.aspect = viewW / viewH;
    // le globe doit toujours tenir en entier dans la zone (petit côté)
    const fit = camera.aspect >= 1 ? 1 : camera.aspect;
    camera.position.z = 4 / fit * (fit < 1 ? 0.85 : 1);
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap);
  else window.addEventListener('resize', resize);

  new GLTFLoader().load(
    '../assets/globe.glb',
    (gltf) => {
      clearFallback();
      scene.add(gltf.scene);
      gltf.scene.position.y -= 1;
      globeNode = gltf.scene.getObjectByName('Globe');
      baseQuat.copy(globeNode.quaternion);
      applyRotation();
      ['Pin_Seattle', 'Pin_NewYork', 'Pin_Tokyo'].forEach((n) => {
        const obj = gltf.scene.getObjectByName(n);
        if (obj) pinNodes[n] = obj;
      });

      const tex = globeNode && globeNode.material && globeNode.material.map;
      if (tex && tex.image) {
        const c = document.createElement('canvas');
        maskW = c.width = tex.image.width;
        maskH = c.height = tex.image.height;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(tex.image, 0, 0);
        maskData = ctx.getImageData(0, 0, maskW, maskH).data; // lu une seule fois
      }
      resize();
      tick();
    },
    undefined,
    () => showFallback()
  );

  // ─────────── ROTATION LIBRE (type trackball) ───────────
  // Le globe tourne autour des axes de l'ÉCRAN : glisser à gauche/droite/haut/bas/diagonale
  // le fait suivre le doigt ou la souris dans toutes les directions.
  // Deux angles seulement : yaw (autour de l'axe nord-sud du globe) et pitch (bascule avant/arrière).
  // Pas de roulis possible : le nord reste toujours en haut, quoi qu'on fasse avec la souris.
  const AXIS_X = new THREE.Vector3(1, 0, 0);
  const AXIS_Y = new THREE.Vector3(0, 1, 0);
  const MAX_PITCH = THREE.MathUtils.degToRad(80);
  const qYaw = new THREE.Quaternion(), qPitch = new THREE.Quaternion();
  const baseQuat = new THREE.Quaternion();
  let yaw = 0, pitch = THREE.MathUtils.degToRad(15); // légère inclinaison de départ

  function applyRotation() {
    qYaw.setFromAxisAngle(AXIS_Y, yaw);
    qPitch.setFromAxisAngle(AXIS_X, pitch);
    globeNode.quaternion.copy(qPitch).multiply(qYaw).multiply(baseQuat);
  }

  function rotateGlobe(dxPx, dyPx) {
    if (!globeNode) return;
    // 1 pixel déplacé = 1 pixel de surface sous le curseur
    const pxPerUnit = viewH / (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    yaw += dxPx / pxPerUnit;
    pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch + dyPx / pxPerUnit));
    applyRotation();
  }

  let dragging = false, moved = 0, lastX = 0, lastY = 0, velX = 0, velY = 0;
  let hovering = false, pointerX = 0, pointerY = 0, pointerDirty = false, pinnedUntil = 0;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; moved = 0;
    lastX = e.clientX; lastY = e.clientY; velX = velY = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('grabbing');
    hideCard();
  });
  canvas.addEventListener('pointermove', (e) => {
    pointerX = e.clientX; pointerY = e.clientY; pointerDirty = true;
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    velX = dx; velY = dy;
    rotateGlobe(dx, dy);
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove('grabbing');
    if (moved < 6 && e.type === 'pointerup') {      // simple clic / tap : affiche (et garde) la fiche
      pointerX = e.clientX; pointerY = e.clientY;
      updateHover(true);
    }
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerenter', (e) => { hovering = true; });
  canvas.addEventListener('pointerleave', () => { hovering = false; if (!dragging) hideCard(); });

  function tick() {
    if (globeNode) {
      if (!dragging) {
        if (Math.abs(velX) > 0.02 || Math.abs(velY) > 0.02) {   // inertie après un lancer
          rotateGlobe(velX, velY);
          velX *= 0.95; velY *= 0.95;
        } else if (!hovering && performance.now() > pinnedUntil) {  // rotation lente au repos
          yaw += 0.0025;
          applyRotation();
        }
      }
      if (!dragging && (pointerDirty || Math.abs(velX) > 0.02 || Math.abs(velY) > 0.02)) {
        pointerDirty = false;
        if (hovering) updateHover(false);
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // ─────────── DÉTECTION DES ÉPINGLES ET DES PAYS ───────────
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const tmpV = new THREE.Vector3();
  const centre = new THREE.Vector3();

  function toNDC(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  }

  function findPin(clientX, clientY) {
    // distance écran entre le curseur et la tête de chaque épingle (visible, côté caméra)
    const r = canvas.getBoundingClientRect();
    globeNode.getWorldPosition(centre);
    let best = null, bestD = PIN_RADIUS_PX;
    for (const name of Object.keys(pinNodes)) {
      pinNodes[name].getWorldPosition(tmpV);
      const normal = tmpV.clone().sub(centre).normalize();
      const toCam = camera.position.clone().sub(tmpV).normalize();
      if (normal.dot(toCam) < 0.1) continue;                 // face cachée du globe
      tmpV.add(normal.multiplyScalar(0.12)).project(camera);   // tête de l'épingle
      const sx = r.left + (tmpV.x + 1) / 2 * r.width;
      const sy = r.top + (1 - tmpV.y) / 2 * r.height;
      const d = Math.hypot(sx - clientX, sy - clientY);
      if (d < bestD) { bestD = d; best = name; }
    }
    return best;
  }

  function isGreenAt(u, v) {
    const x = Math.min(maskW - 1, Math.max(0, Math.floor(u * maskW)));
    const y = Math.min(maskH - 1, Math.max(0, Math.floor(v * maskH)));   // v : 0 = haut de l'image
    const i = (y * maskW + x) * 4;
    const r = maskData[i], g = maskData[i + 1];
    return g > r + 15 && g > 150;
  }

  function countryAtRay(clientX, clientY) {
    toNDC(clientX, clientY);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObject(globeNode, false)[0];
    if (!hit || !hit.uv || !maskData) return null;
    if (!isGreenAt(hit.uv.x, hit.uv.y)) return null;
    return matchCountry(hit.uv.x, hit.uv.y);
  }

  function findCountry(clientX, clientY) {
    // on teste le point exact, puis des anneaux autour : un pays « attire » le curseur
    const found = countryAtRay(clientX, clientY);
    if (found) return found;
    for (const radius of [COUNTRY_RADIUS_PX * 0.5, COUNTRY_RADIUS_PX]) {
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        const c = countryAtRay(clientX + Math.cos(ang) * radius, clientY + Math.sin(ang) * radius);
        if (c) return c;
      }
    }
    return null;
  }

  function matchCountry(u, v) {
    const lon = u * 360 - 180;
    const lat = 90 - v * 180;
    for (const c of COUNTRIES) {
      if (c.bbox && lat >= c.bbox.latMin && lat <= c.bbox.latMax && lon >= c.bbox.lonMin && lon <= c.bbox.lonMax) return c;
    }
    let best = null, bestD = Infinity;
    for (const c of COUNTRIES) {
      if (c.bbox) continue;
      const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
      if (d < bestD) { bestD = d; best = c; }
    }
    return best;
  }

  function updateHover(fromTap) {
    if (!globeNode) return;
    const pin = findPin(pointerX, pointerY);
    if (pin) { showPinCard(PINS[pin]); if (fromTap) pinnedUntil = performance.now() + 4000; return; }
    const country = findCountry(pointerX, pointerY);
    if (country) { showCountryCard(country); if (fromTap) pinnedUntil = performance.now() + 4000; return; }
    hideCard();
  }

  // ─────────── FICHE D'INFO ───────────
  function positionCard() {
    const r = wrap.getBoundingClientRect();
    const x = pointerX - r.left, y = pointerY - r.top;
    const w = card.offsetWidth || 160, h = card.offsetHeight || 120;
    const left = Math.min(r.width - w / 2 - 8, Math.max(w / 2 + 8, x));
    const above = y - h - 24 > 8;                       // si pas la place au-dessus, on affiche en dessous
    card.style.left = left + 'px';
    card.style.top = (above ? y - 16 : y + 24 + h) + 'px';
  }

  function showCountryCard(c) {
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
    tagline.style.color = '';
    card.classList.add('show');
    positionCard();
  }

  function showPinCard(pin) {
    card.classList.add('text-only');
    card.querySelector('.card-media').innerHTML = '';
    card.querySelector('.name').textContent = pin.label;
    const tagline = card.querySelector('.tag-line');
    tagline.textContent = pin.text;
    tagline.style.color = 'var(--muted)';
    card.classList.add('show');
    positionCard();
  }

  function hideCard() { card.classList.remove('show'); }
})();
