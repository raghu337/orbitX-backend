# OrbitX System Architecture

This document describes the high-level structure of the OrbitX application, mapping components, data flow interactions, and runtime dependencies.

---

## 1. High-Level Architecture

OrbitX uses a **decoupled three-tier architecture** comprising React/React Native clients, a Python FastAPI backend, and SQL/Firebase databases.

```mermaid
graph TD
    subgraph Client Tier [Client Tier]
        A[React Web Client - Vite]
        B[React Native Mobile - Expo]
    end

    subgraph Service Tier [Service Tier]
        C[FastAPI API Gateway]
        D[Auth Middleware - PyJWT]
        E[Controllers & Routers]
    end

    subgraph Database Tier [Database Tier]
        F[(SQLite Local DB)]
        G[(Firebase Firestore)]
        H[Firebase Auth Provider]
    end

    A -->|HTTP / WebSockets| C
    B -->|HTTP / REST| C
    C --> D
    D --> E
    E -->|SQLAlchemy ORM| F
    E -->|Firebase Admin SDK| G
    A -->|OAuth Token Verification| H
    B -->|OAuth Token Verification| H
```

---

## 2. Component Descriptions

### A. Client Tier
- **React Web Application**: Served by Vite, provides the main desktop dashboard, interactive WebGL 3D views, and chat channels.
- **React Native Mobile App**: Expo-based app replicating satellite mapping, chats, and note-taking interfaces for mobile devices.

### B. Service Tier (FastAPI Gateway)
- **Routers**: Map HTTP endpoints to controllers.
- **Middleware**: Intercepts requests, validates JWT tokens, manages CORS, and logs transactions.
- **Services/Controllers**: Process core business logic (e.g. computing satellite trajectories, parsing database records).

### C. Database Tier
- **SQLite**: Local relational database handling migrations via Alembic for structured records (user data, local settings).
- **Firebase Firestore**: Dynamic real-time database hosting real-time tracking streams and Chat messages.
- **Firebase Auth**: Manages credentials and JWT token sign-ons.

---

## 3. Request/Response Lifecycle

The request/response lifecycle for authenticated resources follows these steps:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Application
    participant Gateway as FastAPI Router
    participant Auth as Auth Middleware
    participant Controller as Endpoint Controller
    participant DB as SQLite / Firestore
    
    User->>Gateway: HTTP Request + Bearer JWT Token
    Gateway->>Auth: Intercept Request
    alt Token is Valid
        Auth->>Controller: Forward Request (User Details)
        Controller->>DB: Query Telemetry/Settings
        DB-->>Controller: Return Database Model
        Controller-->>User: Return HTTP 200 (JSON payload)
    else Token is Expired / Invalid
        Auth-->>User: Return HTTP 401 Unauthorized
    end
```
