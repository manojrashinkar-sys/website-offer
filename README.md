# Business Website Offer — Promotional Landing Page

A standalone React (Vite) + FastAPI implementation of the `/business-website-offer`
promotional landing page, built to be dropped into an existing hosted portal.
Since no existing portal project was found on this machine (see "Notes on
integration" below), this was scaffolded as a self-contained project using the
requested stack (React + Vite, FastAPI, SQLAlchemy with SQLite/PostgreSQL) so it
runs and is testable today, and can be merged into your real portal's
repositories with minimal changes.

## What's included

- **Public landing page** at `/business-website-offer`: hero, offer explanation,
  included services, business categories, "how it works", enquiry form, FAQ,
  footer, and a floating WhatsApp button — matching the section-by-section spec.
- **Enquiry API**: `POST /api/website-enquiry` — validates input, sanitises
  HTML, blocks obvious duplicate submissions and spam bots (honeypot), rate
  limits by IP, stores the enquiry, and returns a reference number.
- **Bonus (from an earlier, broader pass at this same feature) — optional,
  not required by the current spec, but functional and left in place**:
  a promotion-status API, demo-website gallery API, and a token-protected
  admin lead-management page at `/admin/website-leads` for browsing/updating
  enquiries. You can ignore or delete these (`app/routers/promotion.py`,
  `app/routers/admin.py`, `app/seed.py`, `src/pages/AdminLeadsPage.tsx`) if you
  only want the exact scope described in the current request.

## Project layout

```
webite_offer/
├── backend/                      FastAPI service
│   ├── app/
│   │   ├── config.py              env-driven settings
│   │   ├── database.py            SQLAlchemy engine/session (SQLite or Postgres)
│   │   ├── models.py              ORM models
│   │   ├── schemas.py             Pydantic request/response models + validation
│   │   ├── utils.py               reference-number generator, rate limiter
│   │   ├── seed.py                default demo/settings rows (bonus feature)
│   │   ├── main.py                FastAPI app, CORS, error handling
│   │   └── routers/
│   │       ├── enquiry.py         POST /api/website-enquiry  (core deliverable)
│   │       ├── promotion.py       status/demos endpoints      (bonus)
│   │       └── admin.py           admin lead endpoints         (bonus)
│   ├── migrations/001_website_promotion.sql   PostgreSQL schema
│   ├── requirements.txt
│   └── .env.example
└── frontend/                     React + Vite + TypeScript
    ├── index.html                 SEO/OG/Twitter meta (env-templated)
    ├── src/
    │   ├── config.ts               all env-driven business config
    │   ├── analytics.ts            provider-agnostic event tracking
    │   ├── App.tsx / main.tsx      routing entry
    │   ├── api/
    │   │   ├── client.ts            fetch wrapper with typed errors
    │   │   └── enquiry.ts           POST /api/website-enquiry client
    │   ├── content/pageContent.ts   all page copy (services, categories, FAQ…)
    │   ├── utils/
    │   │   ├── validation.ts        mobile/email/URL validation
    │   │   └── whatsapp.ts          wa.me link + message builders
    │   ├── components/
    │   │   ├── OfferHeader.tsx / HeroSection.tsx
    │   │   ├── OfferSection.tsx     offer explanation + disclaimers
    │   │   ├── IncludedServices.tsx / BusinessCategories.tsx / CardGrid.tsx
    │   │   ├── HowItWorks.tsx (4 steps) / FAQSection.tsx
    │   │   ├── EnquiryForm.tsx      validated form + honeypot
    │   │   ├── SuccessModal.tsx     confirmation + WhatsApp continue
    │   │   ├── WhatsAppButton.tsx   floating click-to-chat
    │   │   └── OfferFooter.tsx
    │   ├── pages/
    │   │   ├── BusinessWebsiteOfferPage.tsx   composes the route
    │   │   └── AdminLeadsPage.tsx              bonus admin UI
    │   └── styles/offer.css         full stylesheet, CSS custom-property theme
    ├── .env.example
    ├── package.json / vite.config.ts / tsconfig.json
```

## Notes on integration into your real portal

No existing hosted-portal repository was found under `C:\Users\Admin` (the
`webite_offer` folder only contained an empty `Untitled-1.py`), so this was
built as a runnable standalone project rather than edited in place. To merge
it into your actual portal:

- **Frontend**: copy `src/components`, `src/pages`, `src/content`,
  `src/utils`, `src/api`, `src/analytics.ts`, `src/config.ts` and
  `src/styles/offer.css` into your portal's `src/`. Add the single route
  (`<Route path={config.offerRoute} element={<BusinessWebsiteOfferPage />} />`)
  into your **existing** router instead of using the throwaway `App.tsx`
  here. Merge `offer.css`'s CSS custom properties (`:root { --color-primary: … }`)
  with your portal's existing theme tokens instead of duplicating them.
- **Backend**: copy `app/routers/enquiry.py` (and optionally `promotion.py` /
  `admin.py`), `app/models.py`'s `WebsitePromotionApplication` model, and the
  relevant `schemas.py` classes into your existing FastAPI app; run them
  through your existing `Base.metadata` / Alembic setup instead of the
  standalone `database.py` here. Replace `require_admin` in `admin.py` with
  your portal's real authentication dependency (it currently uses a bearer
  token from `ADMIN_API_TOKEN` purely so it works standalone).

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env          # then edit values
uvicorn app.main:app --reload --port 8000
```

By default `DATABASE_URL` in `.env.example` points at a local SQLite file
(`sqlite:///./website_promotion.db`) so no database setup is needed for local
testing. For PostgreSQL, set `DATABASE_URL=postgresql+psycopg2://user:pass@host/db`
and apply `migrations/001_website_promotion.sql`.

### Frontend

```bash
cd frontend
npm install
copy .env.example .env          # then edit values, especially VITE_WHATSAPP_NUMBER
npm run dev                     # http://localhost:5173/business-website-offer
```

`vite.config.ts` proxies `/api/*` to `http://127.0.0.1:8000` in dev, so the
frontend and backend talk to each other with no extra CORS configuration
needed locally. In production, set `VITE_API_BASE_URL` if the API is on a
different origin than the portal.

## Testing performed

- **Backend**: started with `uvicorn`, then via HTTP:
  - `GET /api/website-promotion/health` → `{"status":"ok"}`
  - `POST /api/website-enquiry` with valid data → `201`, JSON body with a
    generated reference number (e.g. `WD-20260720-ZXT99`), status `new`.
  - `POST /api/website-enquiry` with invalid data (short name, bad mobile,
    malformed email, short description, invalid URL) → `422` with a
    `field_errors` map keyed by field name, which `ApplicationForm`'s error
    handling on the frontend reads directly.
  - Re-submitting the same mobile/email within the duplicate window → `409`
    with a clear message, confirming the anti-duplicate guard works.
- **Frontend**: `npm run build` (TypeScript check + Vite build) completes
  with no errors; `vite preview` serves `/business-website-offer` with a
  `200` and the correct env-templated `<title>`.

### Manual QA checklist for the browser

- [ ] Header nav buttons smooth-scroll to each section; mobile menu opens/closes.
- [ ] Hero's "Apply Now" / "View Services" scroll correctly; WhatsApp button
      opens `wa.me` with the pre-filled message (requires `VITE_WHATSAPP_NUMBER` set).
- [ ] Submitting the enquiry form with missing/invalid fields shows inline
      errors and does not call the API.
- [ ] Submitting a valid enquiry shows the success modal with the reference
      number and a "Continue on WhatsApp" button carrying the reference,
      name, business, category and city.
- [ ] Re-submitting immediately is blocked (duplicate detection) and the
      form's entered values are preserved so the user can correct and retry.
- [ ] FAQ accordion items expand/collapse independently.
- [ ] Floating WhatsApp button is visible on all screen sizes and doesn't
      overlap the footer content.

## Sample API requests and responses

**Submit an enquiry**

```
POST /api/website-enquiry
Content-Type: application/json

{
  "full_name": "Test Owner",
  "business_name": "Test Business",
  "mobile_number": "9876543210",
  "whatsapp_number": "9876543210",
  "email": "test@example.com",
  "business_category": "Consultants",
  "city": "Mumbai",
  "business_description": "A consulting business that helps clients with financial planning.",
  "required_features": "Enquiry form, WhatsApp button",
  "existing_website_url": "",
  "additional_requirements": "",
  "company_website": "",
  "source": "promo_page"
}
```

```json
{
  "reference_number": "WD-20260720-ZXT99",
  "status": "new",
  "submitted_at": "2026-07-20T07:01:09.173871",
  "message": "Your website application has been submitted successfully. Our team will review your business requirements and contact you if additional details are required."
}
```

**Validation error (422)**

```json
{
  "detail": "Please correct the highlighted fields.",
  "field_errors": {
    "mobile_number": "Enter a valid 10-digit Indian mobile number.",
    "email": "value is not a valid email address: An email address must have an @-sign."
  }
}
```

**Duplicate submission (409)**

```json
{
  "detail": "An enquiry with this mobile number or email address was already submitted recently. Our team will contact you regarding it."
}
```

## Files created

### Backend
- `backend/requirements.txt`
- `backend/.env.example`
- `backend/app/__init__.py`
- `backend/app/config.py`
- `backend/app/database.py`
- `backend/app/models.py`
- `backend/app/schemas.py`
- `backend/app/utils.py`
- `backend/app/seed.py`
- `backend/app/main.py`
- `backend/app/routers/__init__.py`
- `backend/app/routers/enquiry.py` — **core**: `POST /api/website-enquiry`
- `backend/app/routers/promotion.py` — bonus
- `backend/app/routers/admin.py` — bonus
- `backend/migrations/001_website_promotion.sql`

### Frontend
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/index.html`
- `frontend/.env.example`
- `frontend/src/vite-env.d.ts`
- `frontend/src/config.ts`
- `frontend/src/analytics.ts`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/api/client.ts`
- `frontend/src/api/enquiry.ts`
- `frontend/src/content/pageContent.ts`
- `frontend/src/utils/validation.ts`
- `frontend/src/utils/whatsapp.ts`
- `frontend/src/components/OfferHeader.tsx`
- `frontend/src/components/HeroSection.tsx`
- `frontend/src/components/OfferSection.tsx`
- `frontend/src/components/CardGrid.tsx`
- `frontend/src/components/IncludedServices.tsx`
- `frontend/src/components/BusinessCategories.tsx`
- `frontend/src/components/HowItWorks.tsx`
- `frontend/src/components/EnquiryForm.tsx`
- `frontend/src/components/SuccessModal.tsx`
- `frontend/src/components/WhatsAppButton.tsx`
- `frontend/src/components/FAQSection.tsx`
- `frontend/src/components/OfferFooter.tsx`
- `frontend/src/pages/BusinessWebsiteOfferPage.tsx`
- `frontend/src/pages/AdminLeadsPage.tsx` — bonus
- `frontend/src/styles/offer.css`

### Root
- `.gitignore`
- `README.md` (this file)
