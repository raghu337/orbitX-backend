# OrbitX Deployment Guide

This guide details deployment options for the OrbitX application, including local setups, containerized environments, and CI/CD pipelines.

---

## 1. Local Development Setup

### A. Python Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and active virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   alembic upgrade head
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### B. React Web Frontend Setup
1. Navigate to the `orbitx-web/` directory:
   ```bash
   cd orbitx-web
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the hot-reloading dev server:
   ```bash
   npm run dev
   ```

---

## 2. Docker & Containerized Deployment

Using Docker Compose compiles the services, links local network interfaces, and injects runtime configurations.

### Build and Run with Compose
From the project root:
```bash
# Build the container images
docker-compose build

# Run all container services in background
docker-compose up -d
```

---

## 3. Environment Variables Reference

Create a `.env` file in the appropriate directory to configure the runtime environment.

### Backend Configurations
- `DATABASE_URL`: Link to SQL database (e.g. `sqlite:///./sql_app.db`).
- `SECRET_KEY`: Secret string to sign auth JWTs.
- `ALGORITHM`: Token signature encoding (e.g., `HS256`).
- `FIREBASE_CREDENTIALS_PATH`: Path to Firestore credentials JSON.

### Frontend Configurations
- `VITE_API_BASE_URL`: Route to access backend APIs (e.g. `http://localhost:8000`).
- `VITE_FIREBASE_API_KEY`: Secret token linking client Web views to Firebase authentication.
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth URL.
