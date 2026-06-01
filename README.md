# AI-Powered Personal Portfolio & JD Matcher

A production-ready full-stack portfolio website featuring an AI-powered Job Description (JD) matching engine for HR professionals and recruiters. 

Built with **FastAPI**, **PostgreSQL**, **React**, **Vite**, **Tailwind CSS**, and a bespoke Admin Dashboard.

## Features

- **Public Portfolio**: Showcase your projects, experience, skills, and certifications.
- **JD Match Engine**: HR professionals can paste a Job Description to get an instant match score, missing skills gap analysis, and automatically highlighted relevant past projects/experience.
- **Admin Dashboard**: Full CRUD management of portfolio content, JD query analytics, contact leads, and resume uploads.
- **Soft Deletes**: Active/inactive toggle for portfolio entities instead of permanent deletion.
- **Resume Management**: Direct PDF upload endpoint with 10MB size limit validation.
- **Rate Limiting**: Protection against abuse on public endpoints using `slowapi`.

## Environment Variables (.env)

You must create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/portfolio_db
JWT_SECRET_KEY=your_super_secret_key_here
JWT_EXPIRE_MINUTES=1440
```

You must also create a `.env` file in the `frontend/` directory (or use `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Step-by-Step Setup Instructions

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python (3.12+)

### 2. Database & Backend Setup

1. Start the PostgreSQL database using Docker Compose:
   ```bash
   docker-compose up -d postgres
   ```
2. Navigate to the backend directory and set up a virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run Alembic migrations to initialize the database tables:
   ```bash
   alembic revision --autogenerate -m "Initial schema"
   alembic upgrade head
   ```
5. Seed the initial admin user:
   ```bash
   python ../scripts/create_admin.py admin mysecurepassword123
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```

## Step-by-Step Execution Instructions

### Local Development

1. **Start the Backend server**:
   From the `backend` directory, run:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000`. You can view the Swagger UI at `http://localhost:8000/docs`.

2. **Start the Frontend development server**:
   From the `frontend` directory, run:
   ```bash
   npm run dev
   ```
   The website will be available at `http://localhost:5173`.

### Docker Production Deployment

You can run both the frontend, backend, and postgres services fully containerized:

```bash
# From the project root
docker-compose up -d
```
Note: Ensure you've mounted the `uploads` directory properly for persistent resume storage if not using cloud storage.
