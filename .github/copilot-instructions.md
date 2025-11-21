# Copilot Instructions for crm-no-country

## Project Overview
This is a CRM platform for startups, featuring real-time contact management, multi-channel communication (WhatsApp, email), and analytics. The architecture is split into a Java/Spring Boot backend and a Next.js/React frontend.

## Architecture & Key Components
- **Backend** (`Backend/backend`):
  - Java 17, Spring Boot 3.5, MySQL, Spring Security (JWT auth).
  - Main entry: `BackendApplication.java`.
  - Config: `application.properties` (DB, Hibernate, etc).
  - Build: Use Maven (`mvnw.cmd` for Windows).
  - REST APIs for contacts, messages, authentication, metrics.
  - Integrations: WhatsApp Cloud API, SMTP/Brevo for email.
- **Frontend** (`frontend`):
  - Next.js 16, React 19, TailwindCSS.
  - Main app: `app/` (pages, API routes), `components/` (UI, sidebar, etc).
  - Auth flow: `app/login/page.jsx` (calls backend `/api/auth/login`).
  - Sidebar navigation: `components/sidebar/sidebar.tsx`.
  - Build/dev: `npm run dev`, `npm run build`, `npm start`.

## Developer Workflows
- **Backend**
  - Build: `./mvnw.cmd clean install` (Windows)
  - Run: `./mvnw.cmd spring-boot:run`
  - DB: MySQL, config in `application.properties`.
  - Test: Standard Spring Boot test structure in `src/test/java/...`.
- **Frontend**
  - Dev: `npm run dev` (Next.js hot reload)
  - Build: `npm run build`
  - Start: `npm start`
  - Lint: `npx eslint .`

## Conventions & Patterns
- **Backend**
  - Use Lombok for boilerplate reduction.
  - REST controllers follow `/api/*` route pattern.
  - JWT authentication for protected endpoints.
  - Entity classes in `src/main/java/com/nocountry/backend/model` (if present).
- **Frontend**
  - Use Next.js app router (`app/` structure).
  - UI components in `components/ui/`.
  - Sidebar and navigation in `components/sidebar/`.
  - API calls use fetch to backend (see `login/page.jsx`).
  - CSS modules for page-specific styles (e.g., `login.css`).

## Integration Points
- **WhatsApp Cloud API**: Backend integration for messaging.
- **Email**: SMTP/Brevo API for sending emails.
- **Frontend-backend communication**: Fetch calls to backend REST endpoints, e.g., login.

## Examples
- To add a new contact API:
  - Backend: Create a REST controller in `src/main/java/com/nocountry/backend/controller`.
  - Frontend: Add fetch logic in `app/contacts/page.tsx` (or similar).
- To add a sidebar item:
  - Edit `components/sidebar/sidebar.tsx` and update the `menuItems` array.

## References
- See `Backend/backend/README.md` for backend tech and requirements.
- See `frontend/package.json` for scripts and dependencies.
- See `frontend/app/login/page.jsx` for auth flow example.

---
_If any section is unclear or missing, please provide feedback to improve these instructions._
