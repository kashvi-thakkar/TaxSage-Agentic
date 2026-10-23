# TaxSage: AI-Assisted Tax Filing with a Human-in-the-Loop CA Review

TaxSage helps people file income tax in India with less friction. AI reads an uploaded **Form-16** and pre-fills the return; a **Chartered Accountant (CA)** then reviews the draft, comments, requests changes or approves. The AI does the tedious part, and a qualified human stays accountable for the result.

---

## Why this exists

Most people don't trust what they typed into a tax form, and CAs spend hours re-keying numbers from PDFs. TaxSage shifts the AI's job from *deciding* to *drafting*: extracted values arrive as editable drafts, and nothing is final until a CA signs off.

## Key features

### For users
- **Form-16 upload → pre-filled return** (`VERIFY`: describe the extraction method actually used, e.g. LLM-based parsing / OCR, and what happens when extraction fails)
- **Guided multi-step filing:** personal info, income, deductions, final review
- **Dashboard:** filing status, documents and key stats in one place
- **Document management:** upload, categorise and manage tax documents
- **Find a CA:** search and filter registered CAs and send service requests
- **Tax calculator:** compare estimated liability under the old vs. new regime
- **AI help guide:** tax Q&A chatbot (`VERIFY`: model/provider, currently Gemini)

### For Chartered Accountants
- **CA dashboard:** assigned clients, pending reviews, revenue stats
- **Filing review workflow:** inspect auto-filled data, comment, approve or request changes
- **Request management:** accept or reject incoming service requests
- **Public profile:** specialisations, fees, experience

## Architecture

```
TaxSage-Agentic/
├── frontend/    # VERIFY: framework (old README: React + Tailwind) and entry point
├── backend/     # VERIFY: framework(s) (old README: Node/Express + MongoDB); agent/AI service if separate
├── research/    # VERIFY: one line on what lives here (experiments? evaluation? notebooks?)
├── AGENTS.md    # VERIFY: one line on its purpose
└── README.md
```

`VERIFY`: add a short diagram or 3–4 sentences covering the request path, e.g. *Upload → extraction service → draft filing saved → user edits → sent to CA → CA review → approved.* If the "agentic" part is a distinct component (multi-step agent, tool use, orchestration), describe it here. It is the most interesting part of the repo.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | `VERIFY` (previously React, React Router, Context API, Axios, Tailwind CSS) |
| Backend | `VERIFY` (previously Node.js, Express.js) |
| Database | `VERIFY` (previously MongoDB, Mongoose) |
| Auth | `VERIFY` (previously JWT + bcrypt.js, with separate user and CA roles) |
| AI | `VERIFY` (Google Gemini for the help guide; add the extraction model/tooling) |

## Design decisions

*Keep this section: it's what interviewers will ask about.*

- **AI output is a draft, never a decision.** Extracted values are editable and reviewed by a CA before approval.
- **Two roles, one filing.** Users and CAs have separate auth and dashboards, but share a single filing record with a status flow (`VERIFY`: list your actual statuses).
- `VERIFY`: add 1–2 more (e.g. how you handle extraction errors, validation, or the old-vs-new regime calculation).

## Getting started

### Prerequisites
`VERIFY` versions: Node.js / Python, npm, a MongoDB Atlas cluster, API keys.

### Backend
```bash
git clone https://github.com/kashvi-thakkar/TaxSage-Agentic.git
cd TaxSage-Agentic/backend
# VERIFY: install + run commands
```

### Frontend
```bash
cd ../frontend
# VERIFY: install + run commands
```

### Environment variables
Create a `.env` in `backend/` (never commit it). `VERIFY` against your code; the old README listed:

```env
MONGO_URI=
JWT_SECRET=
PORT=
FRONTEND_URL=
NODE_ENV=development
GEMINI_API_KEY=
# Optional / planned: GOOGLE_VISION_API_KEY, CLOUDINARY_*, EMAIL_*, GOOGLE_CLIENT_*
```

## API overview

`VERIFY` against your routes (old README listed these groups):

| Area | Examples |
|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/api/ca/auth/register`, `/login` |
| Filings | `POST /api/tax/start-filing`, `GET /api/tax/my-filings`, `PUT /api/tax/update-filing/:id`, `POST /api/tax/:id/invite-ca` |
| Documents | `GET/POST /api/documents`, `DELETE /api/documents/:id` |
| CA & requests | `GET /api/ca/search`, `POST /api/ca-requests`, `PUT /api/ca-requests/:id` |
| CA review | `GET/POST /api/tax/review/:id`, `GET /api/ca/dashboard` |

## Status & roadmap

- **Working today:** `VERIFY` (be specific and honest)
- **In progress / planned:** `VERIFY` (e.g. tests, deployment, richer document parsing)

## Limitations

TaxSage is a portfolio/learning project, not a certified tax product. AI-extracted values can be wrong, which is why CA review is built in. It does not file returns with the Income Tax Department.

## Author

**Kashvi Thakkar** · [GitHub](https://github.com/kashvi-thakkar)
