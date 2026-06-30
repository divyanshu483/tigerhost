/* ═══════════════════════════════════════════
   Tiger Host — main.js
   Runs in browser (UI only — no business logic)
═══════════════════════════════════════════ */

/* ── BLOCK RIGHT CLICK + DEVTOOLS ── */
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = function(e) {
  if (e.keyCode === 123) return false;
  if (e.ctrlKey && e.shiftKey && ['I','C','J'].includes(String.fromCharCode(e.keyCode))) return false;
  if (e.ctrlKey && e.keyCode === 85) return false;
};

/* ── CURSOR ── */
const curOut  = document.getElementById('cursor-outer');
const curDot  = document.getElementById('cursor-dot');
const curGlow = document.getElementById('cursorGlow');
let mx = 0, my = 0, ox = 0, oy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  curDot.style.left  = mx + 'px';
  curDot.style.top   = my + 'px';
  if (curGlow) { curGlow.style.left = mx + 'px'; curGlow.style.top = my + 'px'; }
});
function animCursor() {
  ox += (mx - ox) * .18;
  oy += (my - oy) * .18;
  curOut.style.left = ox + 'px';
  curOut.style.top  = oy + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

/* ── LOADER ── */
const loaderBar = document.getElementById('loaderBar');
const loader    = document.getElementById('loader');
if (loader) {
  let prog = 0;
  const iv = setInterval(() => {
    prog += Math.random() * 12 + 3;
    if (prog >= 100) {
      prog = 100;
      clearInterval(iv);
      setTimeout(() => { loader.classList.add('done'); }, 400);
    }
    loaderBar.style.width = Math.min(prog, 100) + '%';
  }, 80);
}

/* ── PARTICLES ── */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  class P {
    constructor() { this.reset(); }
    reset() {
      this.x   = Math.random() * W;
      this.y   = Math.random() * H;
      this.r   = Math.random() * 1.5 + .3;
      this.vx  = (Math.random() - .5) * .3;
      this.vy  = (Math.random() - .5) * .3;
      this.life = Math.random();
      this.dl  = Math.random() * .02 + .003;
      this.col = Math.random() > .5 ? 'rgba(20,0,255,' : 'rgba(0,150,255,';
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life += this.dl;
      if (this.life > 1 || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      const a = Math.sin(this.life * Math.PI) * .6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col + a + ')';
      ctx.fill();
    }
  }
  for (let i = 0; i < 100; i++) pts.push(new P());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(20,0,255,${(1 - d / 110) * .07})`;
          ctx.lineWidth   = .5;
          ctx.stroke();
        }
      }
      pts[i].update();
      pts[i].draw();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── NAVBAR ── */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', scrollY > 60);
  const st = document.getElementById('scrollTop');
  if (st)  st.classList.toggle('visible', scrollY > 400);
});

function toggleMobile() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}

/* ── HERO ANIMATE ── */
setTimeout(() => {
  const hl = document.getElementById('heroLeft');
  const hr = document.getElementById('heroRight');
  if (hl) hl.classList.add('animated');
  if (hr) hr.classList.add('animated');
}, 300);

/* ── SCROLL REVEAL ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
  });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ── FAQ ── */
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  document.querySelectorAll('.faq-item.open').forEach(i => { if (i !== item) i.classList.remove('open'); });
  item.classList.toggle('open');
}

/* ── TOAST ── */
let tc = 0;
function showToast(msg, type = 'blue') {
  const wrap = document.getElementById('toastWrap');
  const t    = document.createElement('div');
  t.className = 'toast';
  const cols = { blue:'rgba(20,0,255,.9)', green:'rgba(0,180,80,.9)', red:'rgba(200,0,0,.9)' };
  t.innerHTML = `<div class="toast-dot" style="background:${cols[type]};box-shadow:0 0 8px ${cols[type]}"></div><span>${msg}</span>`;
  wrap.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 4000);
  tc++;
  if (tc > 4) { const f = wrap.children[0]; if (f) { f.classList.remove('show'); setTimeout(() => f.remove(), 350); tc--; } }
}

/* ── LIVE SERVER COUNTER (cosmetic) ── */
let bc = 872;
const lcEl = document.getElementById('liveCount');
if (lcEl) {
  setInterval(() => {
    bc += Math.floor(Math.random() * 3) - 1;
    if (bc < 800) bc = 800;
    lcEl.textContent = bc.toLocaleString();
  }, 3000);
}

/* ── MOCK PANEL STATS (cosmetic) ── */
function rnd(base, variance) { return Math.round(base + Math.random() * variance - variance / 2); }
const cpuVal  = document.getElementById('cpuVal');
const ramVal  = document.getElementById('ramVal');
const plVal   = document.getElementById('playersVal');
const cpuBar  = document.getElementById('cpuBar');
const ramBar  = document.getElementById('ramBar');
const plBar   = document.getElementById('plBar');
if (cpuVal) {
  setInterval(() => {
    const cpu = rnd(24, 8);
    const ram = (rnd(32, 6) / 10).toFixed(1);
    const pl  = rnd(47, 10);
    cpuVal.textContent = cpu + '%';
    ramVal.textContent = ram + 'GB';
    plVal.textContent  = pl + '/100';
    if (cpuBar) cpuBar.style.width = cpu + '%';
    if (ramBar) ramBar.style.width = (ram / 8 * 100).toFixed(0) + '%';
    if (plBar)  plBar.style.width  = pl + '%';
  }, 4000);
}
