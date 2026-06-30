# 🐯 Tiger Host — Server-Side Version

Your website converted from static HTML to **Node.js + Express**.  
Plans load from Firebase on the **server** — visitors never see your logic.

---

## 📁 Folder Structure

```
tigerhost/
├── server.js                  ← Main server (all logic here)
├── .env                       ← Your secrets (NEVER share this)
├── .gitignore                 ← Keeps .env off GitHub
├── package.json
├── firebase-service-account.json  ← Download from Firebase (see below)
├── views/
│   ├── index.ejs              ← Home page template
│   ├── games.ejs              ← Plans page template
│   ├── admin.ejs              ← Admin panel
│   └── partials/
│       ├── header.ejs         ← Shared navbar
│       └── footer.ejs         ← Shared footer
└── public/
    ├── css/
    │   ├── main.css           ← All styles
    │   └── admin.css          ← Admin styles
    └── js/
        └── main.js            ← Cursor, particles, animations only
```

---

## 🚀 Setup (step by step)

### Step 1 — Install Node.js
Download from https://nodejs.org (choose LTS version)

### Step 2 — Install dependencies
```bash
cd tigerhost
npm install
```

### Step 3 — Get Firebase Service Account
1. Go to Firebase Console → Your Project
2. Click ⚙️ Settings → **Service Accounts**
3. Click **"Generate new private key"**
4. Download the JSON file
5. Rename it to `firebase-service-account.json`
6. Place it inside the `tigerhost/` folder

### Step 4 — Edit `.env` file
Open `.env` and set your values:
```
FIREBASE_DATABASE_URL=https://areex-cloud-default-rtdb.asia-southeast1.firebasedatabase.app
ADMIN_PASSWORD=YourStrongPasswordHere
SESSION_SECRET=some_long_random_string
PORT=3000
```

### Step 5 — Run the server
```bash
npm start
```

Open browser: **http://localhost:3000**

---

## 🌐 Deploy for free (pick one)

### Option A — Railway (easiest)
1. Push your code to GitHub (without `.env` and `firebase-service-account.json`)
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Upload `firebase-service-account.json` as a file or paste its contents as env var

### Option B — Render
1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set `npm start` as start command
4. Add environment variables

---

## 🔒 What is now protected

| What | Old (static) | New (server-side) |
|------|-------------|-------------------|
| Plans/pricing data | Loaded by JS in browser ✗ | Server renders into HTML ✅ |
| Firebase config | Visible in source ✗ | In .env on server ✅ |
| Admin password | In JS source code ✗ | In .env, checked by server ✅ |
| Business logic | Anyone can see ✗ | Hidden on server ✅ |
| HTML/CSS | Still visible (normal) | Still visible (normal) |

---

## 📄 Pages

| URL | Page |
|-----|------|
| `/` | Home page |
| `/games` | All plans / pricing |
| `/admin` | Admin panel (password protected) |
| `/api/plans` | JSON API (public) |

---

## ⚠️ Important

- **Never** commit `.env` or `firebase-service-account.json` to GitHub
- Change `ADMIN_PASSWORD` in `.env` to something strong
- The `.gitignore` file already blocks these files
