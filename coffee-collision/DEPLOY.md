# Deploy on Vercel (ONE project: website + API together)

## 1. MongoDB Atlas
Use your Atlas connection string (Network Access must allow 0.0.0.0/0).

## 2. Push to GitHub
    git add .
    git commit -m "update"
    git push

## 3. One Vercel project
Add New -> Project -> import the repo.
- Root Directory: the folder that contains `frontend`, `backend`, `api` and `vercel.json` (repo root)
- Framework Preset: Other
- Leave Build / Output / Install commands as they are (vercel.json sets them)
- Environment Variables: `MONGO_URI`, `JWT_SECRET`   (do NOT set VITE_API_URL, same address is used)
Deploy. The site is at your Vercel link, the API at `<link>/api/health`.

Seed the database once from your PC with your Atlas link in backend/.env: `npm run seed`
