# Deploy: GitHub + Vercel

## 1. MongoDB Atlas (free database; localhost will not work online)
1. Create a free cluster at mongodb.com/atlas, then Database Access -> add a user and password.
2. Network Access -> Add IP Address -> Allow access from anywhere (0.0.0.0/0).
3. Connect -> Drivers -> copy the connection string, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/evara`
4. Seed it once from your PC: put that string as MONGO_URI in `backend/.env`, then run `npm run seed`.

## 2. Push to GitHub (VS Code terminal, inside the evara folder)
Create an empty repo on github.com (New repository, no README), then:

    git init
    git add .
    git commit -m "Evara MERN app"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/evara.git
    git push -u origin main

## 3. Vercel: two projects from the same repo
Backend: Add New Project -> import the repo -> Root Directory `backend`.
  Environment variables: MONGO_URI, JWT_SECRET (any long random text), CLIENT_URL (frontend URL, add after step 2 below).
Frontend: Add New Project -> same repo -> Root Directory `frontend` (Framework: Vite).
  Environment variable: VITE_API_URL = the backend URL from Vercel.
Then go back to the backend project, set CLIENT_URL to the frontend URL, and redeploy it.
