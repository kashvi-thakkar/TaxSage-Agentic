# TaxSage AI Tax Filing — AI Agent Instructions

## Purpose
This file helps AI coding agents understand the workspace layout, key responsibilities, and where to run commands. It is intentionally minimal and links to the existing project README for setup and architecture details.

## Workspace layout
- `backend/` — Express.js backend server and API logic.
- `frontend/` — Frontend dependencies container.
- `frontend/client/` — React app created with Create React App.

## What to know first
- There is no root-level `package.json` for the full project.
- Backend work should be done in `backend/`.
- Frontend work should be done in `frontend/client/`.
- The root `README.md` contains the main project overview, setup instructions, and API endpoint list.

## Backend
- `backend/server.js` is the entrypoint.
- API routes are organized under `backend/routes/` with controllers in `backend/controllers/`.
- Data models are in `backend/models/` and middleware is in `backend/middleware/`.
- AI and document parsing logic lives in `backend/services/`, `backend/prompts/`, and `backend/parsers/`.
- Use `npm install` and `npm run dev` from `backend/` to run locally.

## Frontend
- The React app is under `frontend/client/`.
- Important frontend folders:
  - `frontend/client/src/components/`
  - `frontend/client/src/pages/`
  - `frontend/client/src/context/`
  - `frontend/client/src/services/`
- Use `npm install` and `npm start` from `frontend/client/` to run the UI.

## Important conventions
- Backend and frontend are separated; avoid assuming top-level scripts.
- Authentication uses JWT and user/CA roles.
- AI flows are implemented with Gemini, LangChain, and Groq in the backend.
- Use the root `README.md` as the canonical source for setup and endpoint behavior.

## Recommended next customization
- Create a targeted `.github/copilot-instructions.md` or skill for backend-only work if you want deeper enforcement of backend API conventions or AI prompt structure.
