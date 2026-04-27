# LabLink — Lab Test Booking Platform

A full-stack SaaS for booking lab tests in Pakistan.
Built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## DEMO ACCOUNTS

| Role       | Email              | Password   |
|------------|--------------------|------------|
| Admin      | admin@demo.com     | Admin1234  |
| Patient    | patient@demo.com   | Demo1234   |
| Lab Owner  | lab@demo.com       | Demo1234   |
| Technician | tech@demo.com      | Demo1234   |

---

## RUN LOCALLY

### Step 1 — Setup server

```
cd server
npm install
```

Create `server/.env` file:
```
MONGODB_URI=mongodb+srv://farmanpk50:FFff007%40%24@cluster0.3w5evuk.mongodb.net/LabLinkDB?appName=Cluster0
JWT_SECRET=lablink_secret_2024
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Step 2 — Seed demo data (first time only)

```
cd server
node utils/seed.js
```

### Step 3 — Start server (Terminal 1)

```
cd server
node index.js
```

### Step 4 — Setup and start frontend (Terminal 2)

```
cd client
npm install
npm run dev
```

Open http://localhost:3000

---

## DEPLOY TO PRODUCTION

### Step 1 — Push to GitHub

```
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

### Step 2 — Deploy Backend on Render.com

1. Go to https://render.com and sign in with GitHub
2. Click New → Web Service
3. Select your GitHub repo
4. Fill in these settings:

```
Name:            lablink-api  (or any name you want)
Root Directory:  server
Build Command:   npm install
Start Command:   node index.js
```

5. Add Environment Variables (click Add Environment Variable for each):

```
MONGODB_URI    =  mongodb+srv://farmanpk50:FFff007%40%24@cluster0.3w5evuk.mongodb.net/LabLinkDB?appName=Cluster0
JWT_SECRET     =  lablink_secret_2024
PORT           =  5000
CLIENT_URL     =  https://YOUR-APP-NAME.vercel.app
```

6. Click Deploy
7. Wait for deploy to finish
8. Copy your Render URL — looks like: https://lablink-api.onrender.com

---

### Step 3 — Deploy Frontend on Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click New Project
3. Select your GitHub repo
4. Fill in these settings:

```
Root Directory:  client
```

5. Add Environment Variable:

```
VITE_API_URL  =  https://lablink-api.onrender.com/api
```
(replace with your actual Render URL from Step 2)

6. Click Deploy
7. Your app is live at https://YOUR-APP-NAME.vercel.app

---

### Step 4 — Update Render CLIENT_URL

After Vercel gives you your URL:
1. Go back to Render dashboard
2. Go to your web service → Environment
3. Update CLIENT_URL to your actual Vercel URL
4. Click Save — Render will redeploy automatically

---

## IMPORTANT NOTES

- Render free tier sleeps after 15 minutes of no traffic. First request after sleep takes ~30 seconds. This is normal on free plan.
- File uploads (reports, certificates) are stored locally on Render. They reset on each redeploy. For permanent storage upgrade to paid plan or use Cloudinary.
- MongoDB Atlas is already cloud hosted — no setup needed.

---

## PROJECT STRUCTURE

```
lablink/
├── client/          React + Vite frontend
│   ├── src/
│   │   ├── pages/   All page components
│   │   ├── components/
│   │   ├── context/
│   │   └── services/
│   └── .env         Frontend environment variables
│
└── server/          Node.js + Express backend
    ├── models/      MongoDB models
    ├── routes/      API routes
    ├── middleware/
    ├── utils/
    ├── uploads/     Report and certificate files
    └── .env         Backend environment variables
```
