# OrbitX Backend Design

The OrbitX backend is constructed as a modern RESTful API powered by Python 3.11 and FastAPI. It follows clean architecture guidelines separating endpoints, models, business services, and database utilities.

---

## 1. Directory Structure

The structure of the `backend/` directory is as follows:

```
backend/
├── app/
│   ├── api/                 # API router configurations
│   │   └── v1/
│   │       ├── endpoints/   # Endpoint controllers (auth, notes, tracking)
│   │       └── router.py    # Main API router mapping
│   │
│   ├── core/                # Configuration and JWT security
│   │   ├── config.py        # Environment variables parser
│   │   └── security.py      # Encryption & Token helpers
│   │
│   ├── db/                  # Relational and Firebase DB configurations
│   │   ├── base.py
│   │   ├── session.py       # SQLite session & Firebase init
│   │   └── base_class.py
│   │
│   ├── models/              # SQLAlchemy database models
│   ├── schemas/             # Pydantic schemas for serialization
│   ├── services/            # Core business logic services
│   └── main.py              # Application setup and gateway configuration
│
├── alembic/                 # Database migrations setup
├── requirements.txt         # Package dependencies file
└── alembic.ini              # Alembic config settings
```

---

## 2. Architectural Components

### A. Controllers (Endpoints)
Located under `app/api/v1/endpoints/`, controllers receive HTTP requests, parse query parameters or payloads using Pydantic, and trigger corresponding business logic:
- **`auth.py`**: Handles user login, profile retrieval, and security token refresh.
- **`tracking.py`**: Interacts with the satellite telemetry services to fetch coordinate locations.
- **`notes.py`**: Stores, queries, and edits astronaut notes.

### B. Core Services
Located under `app/services/`, services contain the main business logic (e.g. coordinates calculation, external NASA API requests, caching policies).

### C. Database Models
- **SQLAlchemy Models (`app/models/`)**: Define tables (Users, Notes, LaunchPlans) stored in the relational SQLite database.
- **Pydantic Schemas (`app/schemas/`)**: Handle request payload validation and response serialization.

### D. Middleware and Security
- **CORS Middleware**: Manages access control headers.
- **JWT Verification Middleware**: Intercepts requests to protected endpoints, parses Bearer tokens, and injects authenticated user metadata into the request context.
