# OrbitX API Endpoints Inventory

This document represents the complete inventory of all API endpoints discovered within the OrbitX repository. It details active Python FastAPI endpoints, legacy JavaScript Mock endpoints, route-level attributes, parameters, and access validations.

---

## 1. Active FastAPI Endpoints (Python)

All active endpoints are hosted on the Python FastAPI service, prefixed by `/api/v1` (with the exception of root-level endpoints in `app/main.py`).

| Endpoint | HTTP Method | Controller/File | Authentication Required | Expected Role (if defined) | Request Parameters | Response Type |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `/` | `GET` | `app/main.py` | No | None | None | `dict` (`{"message": ..., "api_root": ..., "timestamp": ...}`) |
| `/health` | `GET` | `app/main.py` | No | None | None | `dict` (`{"status": "ok"}`) |
| `/api/search` | `POST` | `app/main.py` | No | None | **Body (JSON)**:<br>- `query`: `str` (required)<br>- `history`: `list` (optional) | `dict` (`{"response": ..., "results": [...]}`) |
| `/api/auth/forgot-password` | `POST` | `app/main.py` | No | None | **Body (JSON)**:<br>- `email`: `str` (required) | `dict` (`{"success": bool, "message": str}`) |
| `/api/v1/auth/login` | `POST` | `app/api/v1/endpoints/auth.py` | No | None | **Body (Form)**:<br>- `username`: `str` (required)<br>- `password`: `str` (required) | `Token` schema (`{"access_token": str, "token_type": "bearer"}`) |
| `/api/v1/auth/signup` | `POST` | `app/api/v1/endpoints/auth.py` | No | None | **Body (JSON - UserCreate)**:<br>- `email`: `str` (required)<br>- `password`: `str` (required)<br>- `name`: `str` (optional)<br>- `role`: `str` (optional) | `User` schema (`{"id": int/str, "email": str, "name": str, "role": str, "created_at": datetime}`) |
| `/api/v1/auth/me` | `GET` | `app/api/v1/endpoints/auth.py` | **Yes** (`deps.get_current_user`) | None | **Headers**:<br>- `Authorization: Bearer <token>` | `User` schema (`{"id": int/str, "email": str, "name": str, "role": str, "created_at": datetime}`) |
| `/api/v1/auth/ping` | `GET` | `app/api/v1/endpoints/auth.py` | No | None | None | `dict` (`{"status": "ok", "service": "auth"}`) |
| `/api/v1/auth/users` | `GET` | `app/api/v1/endpoints/auth.py` | **Yes** (`deps.get_current_user`) | Admin *(noted in description, but not enforced)* | **Headers**:<br>- `Authorization: Bearer <token>` | `List[User]` |
| `/api/v1/auth/forgot-password` | `POST` | `app/api/v1/endpoints/auth.py` | No | None | **Body (JSON - ForgotPasswordRequest)**:<br>- `email`: `str` (required) | `dict` (`{"success": bool, "message": str}`) |
| `/api/v1/satellites/n2yo-positions` | `GET` | `app/api/v1/endpoints/satellites.py` | No | None | **Query**:<br>- `ids`: `str` (required)<br>- `lat`: `float` (required)<br>- `lng`: `float` (required)<br>- `alt`: `float` (optional) | `List[dict]` (Position coordinates list) |
| `/api/v1/satellites/` | `GET` | `app/api/v1/endpoints/satellites.py` | No | None | **Query**:<br>- `skip`: `int` (optional)<br>- `limit`: `int` (optional) | `List[Satellite]` |
| `/api/v1/satellites/{id}` | `GET` | `app/api/v1/endpoints/satellites.py` | No | None | **Path**:<br>- `id`: `int` (required) | `Satellite` schema |
| `/api/v1/satellites/favorite` | `POST` | `app/api/v1/endpoints/satellites.py` | **Yes** (`deps.get_current_user`) | None | **Query**:<br>- `satellite_id`: `int` (required)<br>**Headers**:<br>- `Authorization: Bearer <token>` | `Satellite` schema |
| `/api/v1/satellites/{id}/tle` | `GET` | `app/api/v1/endpoints/satellites.py` | No | None | **Path**:<br>- `id`: `int` (required) | `dict` (`{"tle1": str, "tle2": str}`) |
| `/api/v1/satellites/{id}/telemetry` | `GET` | `app/api/v1/endpoints/satellites.py` | No | None | **Path**:<br>- `id`: `int` (required) | `List[SatelliteTracking]` |
| `/api/v1/satellites/{id}/telemetry` | `POST` | `app/api/v1/endpoints/satellites.py` | No | None | **Path**:<br>- `id`: `int` (required)<br>**Body (JSON)**:<br>- `SatelliteTracking` schema | `SatelliteTracking` schema |
| `/api/v1/tracking/live` | `GET` | `app/api/v1/endpoints/tracking.py` | No | None | None | `List[SatelliteTracking]` |
| `/api/v1/tracking/{satellite_id}` | `GET` | `app/api/v1/endpoints/tracking.py` | No | None | **Path**:<br>- `satellite_id`: `int` (required) | `List[SatelliteTracking]` |
| `/api/v1/tracking/live/realtime/demo` | `GET` | `app/api/v1/endpoints/tracking.py` | No | None | None | `dict` (Simulated tracking fields) |
| `/api/v1/tracking/health` | `GET` | `app/api/v1/endpoints/tracking.py` | No | None | None | `dict` (`{"status": "ONLINE", ...}`) |
| `/api/v1/tracking/pass_prediction` | `GET` | `app/api/v1/endpoints/tracking.py` | No | None | **Query**:<br>- `satellite_id`: `int` (required)<br>- `observer_lat`: `float` (required)<br>- `observer_lng`: `float` (required)<br>- `observer_alt`: `float` (optional)<br>- `days`: `int` (optional) | `dict` |
| `/api/v1/courses/courses` | `GET` | `app/api/v1/endpoints/learning.py` | No | None | **Query**:<br>- `skip`: `int` (optional)<br>- `limit`: `int` (optional) | `List[Course]` |
| `/api/v1/courses/courses/{id}` | `GET` | `app/api/v1/endpoints/learning.py` | No | None | **Path**:<br>- `id`: `int` (required) | `Course` schema |
| `/api/v1/courses/quiz/submit` | `POST` | `app/api/v1/endpoints/learning.py` | **Yes** (`deps.get_current_user`) | None | **Query**:<br>- `course_id`: `int` (required)<br>- `score`: `int` (required)<br>**Headers**:<br>- `Authorization: Bearer <token>` | `dict` (`{"message": "Quiz submitted successfully", "score": score}`) |
| `/api/v1/progress/{user_id}` | `GET` | `app/api/v1/endpoints/progress.py` | **Yes** (`deps.get_current_user`) | None | **Path**:<br>- `user_id`: `int` (required)<br>**Headers**:<br>- `Authorization: Bearer <token>` | `List[UserProgressBase]` |
| `/api/v1/progress/update` | `POST` | `app/api/v1/endpoints/progress.py` | **Yes** (`deps.get_current_user`) | None | **Body (JSON - UserProgressUpdate)**:<br>- `course_id`: `int`<br>- `progress_percentage`: `float`<br>- `score`: `int`<br>**Headers**:<br>- `Authorization: Bearer <token>` | `dict` (`{"message": "Progress updated successfully"}`) |
