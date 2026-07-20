# OrbitX Project Overview

OrbitX is an advanced space exploration tracking, simulation, and collaboration platform designed for astronauts, research mission operators, and space enthusiasts. It provides tools for real-time satellite radar telemetry mapping, 3D solar system modeling, interactive chat boards, and note organization.

---

## 1. Objectives

- **Mission Operations Visibility**: Deliver unified, interactive dashboards displaying telemetry tracking updates for operational satellites.
- **Dynamic Orbital Simulations**: Provide interactive 3D planet views to simulate orbital pathways.
- **AI-Driven Note Management**: Offer localized, fallback-safe search mechanics to store and query mission parameters.
- **Secure Collaborations**: Enable authenticated space chat boards for team communications.

---

## 2. Key Capabilities & Features

### A. Live Satellite Tracking (Radar)
- Real-time geospatial location mappings of satellites across Mercator grids.
- Dynamic telemetry cards listing latitude, longitude, and orbit speed metadata.
- Interactive status widgets indicating connectivity state.

### B. 3D Solar System Simulator
- High-fidelity visual modeling of planetary orbits.
- Scalable canvas grids supporting real-time rotation and orbit path rendering.

### C. Space Notes AI Module
- Search queries over astronomic data repositories.
- Interactive educational flashcards with flip-to-reveal answers.
- Fallback local databases ensuring operability during network failures.

### D. Space Chat Workspace
- Interactive team collaboration channels.
- Support for message history, automated AI alerts, and multimedia asset sharing.

---

## 3. Technology Stack

### Backend
- **Core**: Python 3.11 / FastAPI
- **Database**: SQLite (local development) / Firebase Firestore (production telemetry and chat data)
- **Migrations**: Alembic
- **Utilities**: PyJWT, Pydantic, SQLAlchemy

### Web Frontend
- **Framework**: React / Vite
- **Styling**: Vanilla CSS (TailwindCSS optional)
- **Interactive Modeling**: Three.js / WebGL (for 3D simulator)
- **State Management**: React Hooks & Context API

### Mobile Frontend
- **Framework**: React Native / Expo

### Quality & DevOps
- **Secret Scanning**: Gitleaks
- **Static Analysis**: Semgrep & CodeQL
- **Composition Analysis**: pip-audit, npm audit, and Trivy
- **End-to-End Automation**: Python SeleniumPOM & pytest
- **Deployment**: Docker & Docker Compose
