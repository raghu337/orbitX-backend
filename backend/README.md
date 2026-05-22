# OrbitX Backend (FastAPI)

This is the backend for OrbitX, built with FastAPI and PostgreSQL.

## Prerequisites
- Python 3.10+
- PostgreSQL

## Setup

1. **Create Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment:**
   Copy `.env` and fill in your database credentials:
   ```bash
   # .env
   DATABASE_URL=postgresql://user:password@localhost:5432/orbitx
   SECRET_KEY=yoursupersecretkey
   ```

4. **Run Migrations:**
   ```bash
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

5. **Start the Server:**
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation
Once the server is running, visit:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Features implemented
- JWT Authentication (Signup/Login/Me)
- Satellite Management
- Satellite Tracking Data
- Space Learning (Courses/Quizzes)
- User Progress Tracking
- Alerts & Favorites
- CORS enabled for frontend integration
