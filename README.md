# Internal Stock Management + POS

A small full-stack app for managing product stock and ringing up sales, built as a portfolio project to show off a complete, working full-stack build — backend API, database, and a mobile-first frontend, all containerized.

This is a single-user demo app (no login, no multi-tenant anything) — the point is to demonstrate the stack, not to be a real production POS system.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Frontend | React (Vite) |
| Routing | React Router |
| PDF receipts | fpdf2 (generated server-side) |
| Barcode scanning | Browser's native `BarcodeDetector` API (camera + image upload) |
| Containers | Docker / Docker Compose |

No heavy frameworks beyond that — no Redux, no CSS framework, no ORM migrations tool. Plain CSS, plain `fetch`, plain React state.

## Features

- **Dashboard** — today's sales count & revenue, total product count, and a low-stock alert list (amber = running low, red = out of stock) with a one-tap restock button.
- **Products** — browse/search/filter all products, add new ones, edit details, restock, or delete.
- **POS (Point of Sale)** — tap products (or scan/upload a barcode) to build a cart, then confirm payment. This decreases stock, records the sale, and downloads a PDF receipt.
- **History** — a timeline of every stock movement (sales and restocks), filterable and grouped by day.

All 4 screens share a bottom navigation bar, mobile-first layout (designed for a 375px-wide phone screen), and a clean white/light theme.

## Project structure

```
internal_stock_management/
├── backend/                 FastAPI app
│   ├── main.py               app entrypoint, CORS, router wiring
│   ├── database.py           SQLAlchemy engine/session setup
│   ├── models/                one file per DB table (Product, Sale, SaleItem, StockMovement)
│   ├── schemas/                one file per Pydantic request/response shape
│   ├── routers/
│   │   ├── products/            product CRUD, barcode lookup, restock
│   │   ├── sales/                create sale, get sale, PDF receipt
│   │   ├── history/              stock movement log
│   │   └── dashboard/            summary stats + low-stock alerts
│   └── Dockerfile
├── frontend/                 React (Vite) app
│   ├── src/
│   │   ├── App.jsx              routes
│   │   ├── Layout.jsx           shared shell + bottom nav
│   │   ├── api.js                backend base URL
│   │   └── pages/                 Dashboard, Products, Pos, History (+ matching .css files)
│   └── Dockerfile
├── docker-compose.yml         runs Postgres + backend + frontend together
└── CLAUDE.md                  detailed build log / notes for AI-assisted development
```

## Data model

- **Product** — name, price, barcode, category, stock quantity
- **Sale** — total price, timestamp, and a list of line items
- **SaleItem** — which product, how many, price at the time of sale
- **StockMovement** — a record of every stock change: direction (in/out), reason (sale/restock), quantity before → after, and a timestamp — this is what powers the History screen

Stock quantity only ever changes through a sale or a restock — there's no way to directly edit it, so there's always a paper trail.

## Running it

### Option 1 — Docker (recommended, one command)

```bash
docker compose up -d --build
```

This starts everything: Postgres on port `5433`, the API on `8001`, and the frontend on `5173`. Source code is mounted into the containers, so both the backend and frontend hot-reload as you edit files — it behaves exactly like running them locally.

Open **http://localhost:5173** in your browser (or on your phone, for the real mobile experience).

To stop everything: `docker compose down` (add `-v` to also wipe the database).

### Option 2 — Running natively

You'll need Postgres running somewhere (e.g. just `docker compose up -d db` for the database only), then:

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

The backend reads its database connection string from a `.env` file (`DATABASE_URL=...`), which isn't committed to the repo.

## API overview

The backend exposes a REST API under these groups (full details in the code, one route per file):

- `GET/POST/PUT/DELETE /products`, plus `/products/barcode/{code}` and `/products/{id}/restock`
- `POST /sales`, `GET /sales/{id}`, `GET /sales/{id}/receipt` (PDF download)
- `GET /history` — filterable by product, reason, or date
- `GET /dashboard` — the stats shown on the Dashboard screen

## Known limitations

- **Barcode camera scanning** depends on the browser's `BarcodeDetector` API, which is mainly supported on Android/ChromeOS Chrome — it generally won't work in desktop browsers. The app falls back to a manual barcode-entry box when it's unavailable, so the feature still works everywhere, just without the camera.
- No automated test suite yet.
- No authentication — this is intentionally a single-user demo.
- The Docker setup is dev-oriented (hot reload, bind-mounted source) rather than an optimized production build.
