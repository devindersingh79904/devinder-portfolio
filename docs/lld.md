# Low-Level Design (LLD)
## AI-Powered Personal Portfolio

### 1. Database Schema (PostgreSQL)

The database utilizes `psycopg[binary]` as the driver and `Alembic` for migrations. Models inherit from SQLAlchemy's declarative base.

**Key Tables & Relationships**:
- `admin_users`: Authentication credentials (`id`, `username`, `password_hash`).
- `profile`: Core user details (`name`, `bio`, `resume_url`).
- `projects`, `experience`, `education`, `certifications`, `skills`: Entities describing the portfolio content. All implement soft-deletes via an `is_active` boolean field.
- `jd_queries`: Tracks JD Match submissions (`hr_name`, `match_score`, `result_json`).
- `contact_leads`: Form submissions (`email`, `subject`, `message`).

### 2. Backend Module Structure (FastAPI)

```text
backend/app/
├── core/         # Settings, Security (JWT, bcrypt), Rate Limiting (slowapi), Exceptions
├── db/           # Session management, declarative base
├── models/       # SQLAlchemy models
├── repositories/ # Abstracted CRUD operations (Generic Repository Pattern)
├── schemas/      # Pydantic validation models
├── services/     # Business logic (JD Match calculation)
└── routers/      # API Endpoints (Public & Admin split)
```

### 3. JD Match Engine Logic

Defined in `services/jd_match.py`.
- **Score Calculation Algorithm**:
  - `70%`: Skill Matching (text search intersection between extracted JD keywords and DB `skills`).
  - `20%`: Project & Experience relevance (checks if matched skills appear in project/experience descriptions).
  - `10%`: Base Domain/Certification completeness.
- **Process**: Normalizes text, cross-references dictionaries, determines missing skills, scores the profile, and logs the query event in `jd_queries` for Admin analytics.

### 4. Frontend Component Architecture

- **State Management**: `TanStack Query` orchestrates data fetching, caching, and optimistic updates across the React tree.
- **Routing**: `react-router-dom` handles isolated trees (`PublicLayout` and `AdminLayout`). Unauthenticated users attempting to hit `/admin/*` are automatically redirected to login by the Axios response interceptor.
- **UI System**: Utility-first CSS via `Tailwind CSS`, utilizing `class-variance-authority` (cva) and `tailwind-merge` to build reusable primitives (`Button`, `Card`, `Input`, etc.) mimicking standard component libraries.
- **Responsive Navigation**: Implementation of Tailwind's breakpoint grids and mobile-friendly hamburger menus.
