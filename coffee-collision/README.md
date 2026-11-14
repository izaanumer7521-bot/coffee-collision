# Evara (MERN)

Full-stack coffee shop site: React (Vite) frontend + Express/MongoDB backend.

## Features
- Scroll-driven hero: the cup animation plays as you scroll, with the big "EVARA" title behind it
- Home page: category filter, product cards that animate in as you scroll, new-product badge and live refresh (new drinks slide in), flavours strip, how-it-works section
- Accounts (JWT), "Create your cup" orders with flavour, size, milk, sweetness; Archives page for past cups
- Menu import (Admin -> Import menu): type your menu under `# Category` headings with sizes, prices and flavours; preview, then import
- Admin panel at /admin: dashboard with charts, products (picture upload, category, flavours), categories, flavours, orders, activity log, messages, settings (change email and password)

## Run it
0. Copy `backend/.env.example` to `backend/.env` and put your own MongoDB link in it (the zip does not include a `.env` so it never overwrites yours).
1. Install MongoDB locally (or use Atlas and put its URI in `backend/.env`).
2. `npm run install:all`
3. Nothing to seed: the first time the server connects to an empty database it creates the admin account (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`) and a few starter drinks. A database that already has an admin is never touched.
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

## English / Arabic and the full menu
- The navbar has a language button (English ⇄ العربية). Arabic switches the whole site to right-to-left. Visitor text lives in `frontend/src/i18n/strings.js`.
- Products, categories and flavours have an Arabic name (`nameAr`); edit them in Admin. Prices are in Saudi riyals (SAR).
- Add the whole printed menu: Admin -> Import menu -> "Load the full menu", or run `npm run seed:menu` (add `-- --hide-demo` to hide the 3 starter drinks). Safe to run repeatedly. The menu data is in `backend/data/menu.js`.
