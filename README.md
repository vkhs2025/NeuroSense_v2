# 🧠 NeuroSense_v2

A production-ready rewrite of the NeuroSense assessment generator — built with **Next.js 14 + TypeScript + TailwindCSS**, supporting `.docx`, `.pdf`, and `.txt` uploads.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

App runs at http://localhost:3000

## 🧩 Folder Layout
```
pages/           → UI & API
utils/           → Extraction, mapping, docx filler
templates/       → ADHD.docx / Autism.docx (add your files here)
types/           → Placeholder schemas
styles/          → Tailwind globals
components/      → Reusable UI (pulsating circle)
```

## 🗃 Deployment (Vercel)
1. Push this repo to GitHub  
2. Go to https://vercel.com → “New Project” → import this repo  
3. Click **Deploy** — done!  
Each future `git push` auto-redeploys.  

Templates are `.gitignored` for privacy — upload them manually in Vercel or your local `/templates` folder before generation.
