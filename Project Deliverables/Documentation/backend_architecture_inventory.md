# OrbitX Backend Architecture Inventory

This document provides a comprehensive inventory and architectural overview of the OrbitX backend application. It details the technologies, structure, APIs, authentication mechanisms, database mappings, configurations, and integrations currently built into the backend service.

---

## Project Overview

The OrbitX backend is a high-performance web service designed to power a real-time satellite tracking, telemetry calculation, and astronomical learning application. 

The service performs several primary roles:
1. **User Management and Authentication**: Registers users, authenticates sessions via JWTs, manages profiles, and handles password reset requests.
2. **Satellite Tracking and Orbit Telemetry**: Feeds live coordinates of space objects, tracks user favorites, fetches orbital Two-Line Element (TLE) datasets, and registers/serves telemetry logs.
3. **AI Space Tutor Integration**: Connects queries directly with a conversational AI engine (Groq) configured with specialized astronomical and space education system instructions.
4. **Learning Progress Management**: Manages course resources, user progress percentages, and quiz submissions.

---

## Technology Stack

The active backend service is developed in the following environment:

| Layer | Component / Technology | Purpose |
| :--- | :--- | :--- |
| **Language** | Python 3 | Main development language for API routes, logic, and integrations. |
| **Framework** | FastAPI | Async-first web framework for rapid, typed API design and routing. |
| **ASGI Server** | Uvicorn | High-performance ASGI web server implementing ASGI specifications. |
| **Database** | Firebase Realtime Database | Core operational store for real-time document-like JSON nodes. |
| **Firebase SDK** | `firebase-admin` | Admin SDK to manage queries, authentication sessions, and node values. |
| **Security / JWT** | `python-jose[cryptography]` | Creates, signs, and decodes JSON Web Tokens (JWT) for session management. |
| **Crypto Hashing** | `passlib[bcrypt]` / `bcrypt` | Strong, CPU-intensive password hashing and verification. |
| **HTTP Clients** | `httpx` (async) & `requests` | Handles external REST queries to orbital platforms and TLE providers. |
| **Configuration** | `pydantic-settings` | Manages environment-based configuration variables cleanly. |
| **AI Integration** | `groq` | Manages async client calls to the Groq API. |

### Legacy or Scaffolded Components (Inactive)
- **PostgreSQL / SQLAlchemy**: Remnants of local relational database support are present (e.g., `psycopg2` dependencies in scripts/tests, Alembic migrations, database initialization scripts) but are **inactive** and not utilized by the operational runtime code.
- **Node.js / Express Controllers**: A boilerplate Node.js auth helper (`forgot-password.js`) and duplicate JavaScript service skeletons (`issService.js`, `ocationService.js`) are located in the codebase directories but are not part of the active Python backend server.

---

## Directory Structure

Below is the directory map of the `backend/` folder detailing component locations:

```text
backend/
├── alembic/                      # Scaffolded Alembic configuration (Inactive)
│   ├── env.py                    # Migration environment runner
│   ├── script.py.mako            # Migration template
│   └── versions/                 # DB migrations directory (Empty)
├── alembic.ini                   # Alembic configurations (Inactive)
├── app/                          # Core Python FastAPI Application
│   ├── api/                      # Routing layer
│   │   ├── v1/                   # API v1 routes
│   │   │   ├── api.py            # Aggregated v1 Router definitions
│   │   │   └── endpoints/        # Individual endpoint handlers
│   │   │       ├── auth.py       # Authentication, profiles, and admin listings
│   │   │       ├── learning.py   # Courses management and quiz submissions
│   │   │       ├── progress.py   # User learning progress trackers
│   │   │       ├── satellites.py # Satellite metadata, favorites, TLE, telemetry
│   │   │       └── tracking.py   # Telemetry lookups and pass predictions
│   │   └── __init__.py
│   ├── core/                     # Security, dependencies, and settings config
│   │   ├── config.py             # Pydantic BaseSettings config
│   │   ├── deps.py               # Dependency injection helpers (get_current_user)
│   │   └── security.py           # Bcrypt hashing and JWT generation
│   ├── db/                       # Database sessions
│   │   └── session.py            # Firebase Admin SDK initialization & DB handle
│   ├── models/                   # Plain Python classes for mapping database nodes
│   │   ├── base.py               # Aggregate models import
│   │   ├── learning.py           # Course, Quiz, UserProgress models
│   │   ├── satellite.py          # Satellite, SatelliteTracking, Favorite models
│   │   └── user.py               # User and UserRole structures
│   ├── schemas/                  # Pydantic schemas for data serialization/validation
│   │   ├── learning.py           # UserProgress schemas
│   │   ├── satellite.py          # Satellite validation schemas
│   │   ├── token.py              # JWT token serialization schemas
│   │   └── user.py               # User input/output validation schemas
│   ├── services/                 # Services and third-party API configurations
│   │   ├── groq_service.py       # Groq AI completion client and system prompts
│   │   ├── satellite_service.py  # Local backup satellite fetcher (alternative logic)
│   │   ├── issService.js         # Misplaced frontend JS file
│   │   └── ocationService.js     # Misplaced frontend JS file
│   ├── __init__.py
│   └── main.py                   # Application entry point and root-level routes
├── controllers/                  # Legacy Node.js controllers
│   └── auth/                     # Node.js auth handlers
│       └── forgot-password.js    # Node.js nodemailer forgot-password controller
├── scripts/                      # DB initialization utilities
│   └── init_postgres.py          # PostgreSQL database creator (Inactive)
├── .env                          # Local environment settings (Ignored)
├── .env.example                  # Template environment settings
...
```
*(Remainder of path details and diagrams omitted for length but summarized in README)*
