# Evara (MERN)

Full-stack coffee shop site: React (Vite) frontend + Express/MongoDB backend.

## Features
- Scroll-driven hero: a canvas plays an image sequence as you scroll (big "Evara" title behind the cup)
- Menu and "Pick your poison" cards loaded from the API, with search from the navbar
- Sign up / sign in (JWT), "Create your cup" custom orders (size, milk, sweetness, notes)
- Archives page: each user's past cups
- Contact form saved to the database
- Admin panel: manage orders (status), products (add / hide / delete), contact messages

## Run it
0. Copy `backend/.env.example` to `backend/.env` and put your own MongoDB link in it (the zip does not include a `.env` so it never overwrites yours).
1. Install MongoDB locally (or use Atlas and put its URI in `backend/.env`).
2. `npm run install:all`
3. `npm run seed` (creates 3 drinks + admin user)
4. `npm run dev`
   - Site: http://localhost:5173
   - API: http://localhost:5000

Admin login: `admin@coffeecollision.com` / `admin123` (change in `backend/.env` before seeding).

## Use your own hero frames
Export your animation as frames into `frontend/public/frames/` named `frame_001.png`, `frame_002.png`, ...
Then set `FRAME_COUNT` and `FRAME_EXT` at the top of `frontend/src/components/Hero.jsx`.
The hero keeps only the glass area of each frame so the big title appears behind the cup; tune the cup position/size in `draw()` in Hero.jsx.
Replace the drink photos in `frontend/public/products/` the same way.

## Structure
```
backend/  config, models (User, Product, Order, Message), middleware (JWT), routes, seed.js
frontend/  src/components (Navbar, Hero, ProductCards, Footer), src/pages, src/context/AuthContext.jsx
```
