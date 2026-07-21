import os
import sys
from unittest.mock import MagicMock

# Setup mock environment before importing app
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.credentials'] = MagicMock()
sys.modules['firebase_admin.db'] = MagicMock()
os.environ["SECRET_KEY"] = "mock_secret_key"
os.environ["FIREBASE_CREDENTIALS_PATH"] = "mock-credentials.json"
os.environ["FIREBASE_DATABASE_URL"] = "https://mock.firebaseio.com"

# Ensure backend directory is in path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

def main():
    from app.main import app

    print("[API Discovery] Inspecting FastAPI app routes...")

    routes_markdown = [
        "# 🛰️ OrbitX API Endpoint Inventory",
        "",
        "This file is dynamically generated during the CI/CD API Discovery phase.",
        "",
        "| Endpoint Path | HTTP Method | Route Tag | Description | Handler Function |",
        "|---|---|---|---|---|",
    ]

    for route in sorted(app.routes, key=lambda r: r.path):
        # We only care about API routes, not static assets or built-ins like /openapi.json
        if hasattr(route, "methods") and hasattr(route, "endpoint"):
            methods = ", ".join(route.methods - {"HEAD", "OPTIONS"})
            if not methods:
                continue

            # Extract tags and summary/description
            tags = ", ".join(getattr(route, "tags", [])) or "None"
            doc = route.endpoint.__doc__ or "No description provided."
            doc = doc.strip().replace("\n", " ")
            # Truncate docstring for cleaner table rendering
            if len(doc) > 100:
                doc = doc[:97] + "..."

            handler_name = f"{route.endpoint.__module__}.{route.endpoint.__name__}"

            routes_markdown.append(
                f"| `{route.path}` | **{methods}** | {tags} | {doc} | `{handler_name}` |"
            )

    # Write to reports directory
    os.makedirs("reports", exist_ok=True)
    report_path = "reports/api-inventory.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(routes_markdown))

    print(f"[API Discovery] Successfully generated registry at {report_path}")

if __name__ == "__main__":
    main()
