// ═══════════════════════════════════════════════════════════
//  Tiger Host — Node.js + Express Server
//  All logic runs HERE on the server — visitors never see it
// ═══════════════════════════════════════════════════════════

require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const admin      = require('firebase-admin');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Firebase Admin Init (server-side only, never exposed) ──
let db;
try {
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  db = admin.database();
  console.log('✅ Firebase Admin connected');
} catch (e) {
  console.warn('⚠️  Firebase service account not found. Using mock data.');
  console.warn('   → Download from Firebase Console > Project Settings > Service Accounts');
  db = null;
}

// ── Middleware ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // disable if you use inline scripts/styles
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rate limiting — protects your APIs from abuse
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// ── Admin Auth Middleware ──────────────────────────────────
function requireAdmin(req, res, next) {
  const auth = req.headers['x-admin-password'];
  if (auth === process.env.ADMIN_PASSWORD) return next();
  const bodyPass = req.body?.password;
  if (bodyPass === process.env.ADMIN_PASSWORD) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Helper: Fetch plans from Firebase ─────────────────────
async function getPlans() {
  if (!db) return getMockPlans(); // fallback if no Firebase
  const snap = await db.ref('plans').once('value');
  const raw  = snap.val() || {};
  return Object.entries(raw)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (a.price || 0) - (b.price || 0));
}

// ── Mock plans (shown when Firebase not configured yet) ────
function getMockPlans() {
  return [
    { id:'1', name:'Trial',      price:19,  cat:'sandbox',  tag:'pop', emoji:'⛏️', ram:'2GB RAM', desc:'Run Vanilla, Spigot, Paper or BungeeCord.', bg:'bg-mc',   pills:['Unlimited Slots','1-Click Mods','Java & Bedrock'] },
    { id:'2', name:'Nano',       price:29,  cat:'sandbox',  tag:'hot', emoji:'🔫', ram:'4GB RAM', desc:'Vanilla or modded servers for up to 500 players.', bg:'bg-rust', pills:['Up to 500 Players','DDoS Protected'] },
    { id:'3', name:'Micro',      price:49,  cat:'sandbox',  tag:'',    emoji:'🦕', ram:'6GB RAM', desc:'Full mod support, all official maps available.', bg:'bg-ark',  pills:['Up to 100 Players','All Maps'] },
    { id:'4', name:'Mini',       price:79,  cat:'sandbox',  tag:'new', emoji:'🏙️', ram:'8GB RAM', desc:'Full FiveM support with txAdmin, ESX / QBCore.', bg:'bg-fivem',pills:['Up to 512 Players','txAdmin'] },
    { id:'5', name:'Micro Vps',  price:299, cat:'survival', tag:'pop', emoji:'🗄️', ram:'2GB RAM', desc:'Entry-level VPS with full root access.', bg:'bg-mc',   pills:['Full Root Access','SSD Storage'] },
    { id:'6', name:'Macro Vps',  price:400, cat:'survival', tag:'hot', emoji:'🖥️', ram:'8GB RAM', desc:'Mid-range VPS for websites, game panels, or bots.', bg:'bg-rust', pills:['Dedicated vCPU','DDoS Protected'] },
  ];
}

// ════════════════════════════════════════════════════════════
//  PAGE ROUTES — server renders HTML, sends to browser
// ════════════════════════════════════════════════════════════

// Home page
app.get('/', async (req, res) => {
  try {
    const plans = await getPlans();
    res.render('index', { plans, page: 'home' });
  } catch (e) {
    console.error(e);
    res.render('index', { plans: getMockPlans(), page: 'home' });
  }
});

// Games / Pricing page
app.get('/games', async (req, res) => {
  try {
    const plans = await getPlans();
    res.render('games', { plans, page: 'games' });
  } catch (e) {
    res.render('games', { plans: getMockPlans(), page: 'games' });
  }
});

// Admin panel page (password checked client-side on this route,
// but ALL admin API calls require server-side password header)
app.get('/admin', (req, res) => {
  res.render('admin', { page: 'admin' });
});

// ════════════════════════════════════════════════════════════
//  API ROUTES — data endpoints (server-side logic)
// ════════════════════════════════════════════════════════════

// GET all plans (public — no password needed)
app.get('/api/plans', async (req, res) => {
  try {
    const plans = await getPlans();
    res.json({ success: true, plans });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST add new plan (admin only — password required in header)
app.post('/api/plans', requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    if (!db) return res.json({ success: true, id: 'mock-' + Date.now(), mock: true });
    const ref = await db.ref('plans').push(data);
    res.json({ success: true, id: ref.key });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT update plan (admin only)
app.put('/api/plans/:id', requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    if (!db) return res.json({ success: true, mock: true });
    await db.ref('plans/' + req.params.id).update(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE plan (admin only)
app.delete('/api/plans/:id', requireAdmin, async (req, res) => {
  try {
    if (!db) return res.json({ success: true, mock: true });
    await db.ref('plans/' + req.params.id).remove();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Admin login check (returns token/success if password correct)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: process.env.ADMIN_PASSWORD });
  } else {
    res.status(401).json({ success: false, error: 'Wrong password' });
  }
});

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🐯 Tiger Host running at http://localhost:${PORT}`);
  console.log(`   Home    → http://localhost:${PORT}/`);
  console.log(`   Games   → http://localhost:${PORT}/games`);
  console.log(`   Admin   → http://localhost:${PORT}/admin`);
  console.log(`   API     → http://localhost:${PORT}/api/plans\n`);
});
