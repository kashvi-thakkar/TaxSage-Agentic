# TaxSage: AI-Assisted Tax Filing with a Human-in-the-Loop CA Review

TaxSage helps people file income tax in India with less friction. AI reads an uploaded **Form-16** and pre-fills the return; a **Chartered Accountant (CA)** then reviews the draft, comments, requests changes or approves. The AI does the tedious part, and a qualified human stays accountable for the result.

---

## Why this exists

Most people don't trust what they typed into a tax form, and CAs spend hours re-keying numbers from PDFs. TaxSage shifts the AI's job from *deciding* to *drafting*: extracted values arrive as editable drafts, and nothing is final until a CA signs off.

## Key features

### For users
- **Form-16 upload → pre-filled return** 
- **Guided multi-step filing:** personal info, income, deductions, final review
- **Dashboard:** filing status, documents and key stats in one place
- **Document management:** upload, categorise and manage tax documents
- **Find a CA:** search and filter registered CAs and send service requests
- **Tax calculator:** compare estimated liability under the old vs. new regime
- **AI help guide:** tax Q&A chatbot 

### For Chartered Accountants
- **CA dashboard:** assigned clients, pending reviews, revenue stats
- **Filing review workflow:** inspect auto-filled data, comment, approve or request changes
- **Request management:** accept or reject incoming service requests
- **Public profile:** specialisations, fees, experience

## Architecture

```
TaxSage-Agentic/
├── frontend/    
├── backend/    
├── research/    
├── AGENTS.md    
└── README.md
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Context API, Axios, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcrypt.js, with separate user and CA roles |
| AI | Google Gemini for the help guide; add the extraction model/tooling |

## Design decisions

- **AI output is a draft, never a decision.** Extracted values are editable and reviewed by a CA before approval.
- **Two roles, one filing.** Users and CAs have separate auth and dashboards, but share a single filing record with a status flow (`VERIFY`: list your actual statuses).

## Getting started


### Backend
```bash
git clone https://github.com/kashvi-thakkar/TaxSage-Agentic.git
cd TaxSage-Agentic/backend
```

### Frontend
```bash
cd ../frontend
```

### Environment variables
Create a `.env` in `backend/` (never commit it).
## API overview


| Area | Examples |
|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/api/ca/auth/register`, `/login` |
| Filings | `POST /api/tax/start-filing`, `GET /api/tax/my-filings`, `PUT /api/tax/update-filing/:id`, `POST /api/tax/:id/invite-ca` |
| Documents | `GET/POST /api/documents`, `DELETE /api/documents/:id` |
| CA & requests | `GET /api/ca/search`, `POST /api/ca-requests`, `PUT /api/ca-requests/:id` |
| CA review | `GET/POST /api/tax/review/:id`, `GET /api/ca/dashboard` |

## Status & roadmap


## Limitations

TaxSage is a portfolio/learning project, not a certified tax product. AI-extracted values can be wrong, which is why CA review is built in. It does not file returns with the Income Tax Department.

## Author

**Kashvi Thakkar** · [GitHub](https://github.com/kashvi-thakkar)
