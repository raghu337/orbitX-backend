# 🛰️ OrbitX API Endpoint Inventory

This file is dynamically generated during the CI/CD API Discovery phase.

| Endpoint Path | HTTP Method | Route Tag | Description | Handler Function |
|---|---|---|---|---|
| `/` | **GET** | root | No description provided. | `app.main.root` |
| `/api/auth/forgot-password` | **POST** | None | Root level forgot password endpoint.     Routes to standard /api/auth/forgot-password structure. | `app.main.forgot_password_root` |
| `/api/search` | **POST** | None | No description provided. | `app.main.search_space` |
| `/api/v1/auth/forgot-password` | **POST** | auth | Password reset request endpoint.     Checks if email exists in database and triggers a mock reset... | `app.api.v1.endpoints.auth.forgot_password` |
| `/api/v1/auth/login` | **POST** | auth | OAuth2-compatible login.     Returns a JWT bearer token on success. | `app.api.v1.endpoints.auth.login_access_token` |
| `/api/v1/auth/me` | **GET** | auth | Return the currently authenticated user's profile. | `app.api.v1.endpoints.auth.read_user_me` |
| `/api/v1/auth/ping` | **GET** | auth | Lightweight auth service check. No auth required. | `app.api.v1.endpoints.auth.auth_ping` |
| `/api/v1/auth/signup` | **POST** | auth | Register a new user account. | `app.api.v1.endpoints.auth.create_user` |
| `/api/v1/auth/users` | **GET** | auth | Retrieve all registered users for the Admin user directory panel. | `app.api.v1.endpoints.auth.read_users` |
| `/api/v1/courses/courses` | **GET** | learning | No description provided. | `app.api.v1.endpoints.learning.read_courses` |
| `/api/v1/courses/courses/{id}` | **GET** | learning | No description provided. | `app.api.v1.endpoints.learning.read_course_by_id` |
| `/api/v1/courses/quiz/submit` | **POST** | learning | No description provided. | `app.api.v1.endpoints.learning.submit_quiz` |
| `/api/v1/progress/update` | **POST** | progress | No description provided. | `app.api.v1.endpoints.progress.update_progress` |
| `/api/v1/progress/{user_id}` | **GET** | progress | No description provided. | `app.api.v1.endpoints.progress.get_user_progress` |
| `/api/v1/satellites/` | **GET** | satellites | No description provided. | `app.api.v1.endpoints.satellites.read_satellites` |
| `/api/v1/satellites/favorite` | **POST** | satellites | No description provided. | `app.api.v1.endpoints.satellites.favorite_satellite` |
| `/api/v1/satellites/n2yo-positions` | **GET** | satellites | No description provided. | `app.api.v1.endpoints.satellites.get_n2yo_positions` |
| `/api/v1/satellites/{id}` | **GET** | satellites | No description provided. | `app.api.v1.endpoints.satellites.read_satellite_by_id` |
| `/api/v1/satellites/{id}/telemetry` | **GET** | satellites | No description provided. | `app.api.v1.endpoints.satellites.get_satellite_telemetry` |
| `/api/v1/satellites/{id}/telemetry` | **POST** | satellites | No description provided. | `app.api.v1.endpoints.satellites.post_telemetry` |
| `/api/v1/satellites/{id}/tle` | **GET** | satellites | No description provided. | `app.api.v1.endpoints.satellites.get_tle_for_satellite` |
| `/api/v1/tracking/health` | **GET** | tracking | No description provided. | `app.api.v1.endpoints.tracking.health` |
| `/api/v1/tracking/live` | **GET** | tracking | No description provided. | `app.api.v1.endpoints.tracking.get_live_tracking` |
| `/api/v1/tracking/live/realtime/demo` | **GET** | tracking | No description provided. | `app.api.v1.endpoints.tracking.realtime_demo` |
| `/api/v1/tracking/pass_prediction` | **GET** | tracking | Proxy pass prediction via N2YO if API key configured. Returns N2YO response or a fallback message. | `app.api.v1.endpoints.tracking.pass_prediction` |
| `/api/v1/tracking/{satellite_id}` | **GET** | tracking | No description provided. | `app.api.v1.endpoints.tracking.get_satellite_tracking` |
| `/docs` | **GET** | None | No description provided. | `fastapi.applications.swagger_ui_html` |
| `/docs/oauth2-redirect` | **GET** | None | No description provided. | `fastapi.applications.swagger_ui_redirect` |
| `/health` | **GET** | None | No description provided. | `app.main.health` |
| `/openapi.json` | **GET** | None | No description provided. | `fastapi.applications.openapi` |
| `/redoc` | **GET** | None | No description provided. | `fastapi.applications.redoc_html` |