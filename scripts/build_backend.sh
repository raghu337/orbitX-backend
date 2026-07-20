#!/usr/bin/env bash
# OrbitX Backend Automated Framework Detector & Builder

set -euo pipefail

echo "============================================="
echo "⚙️ Detecting Backend Framework & Building..."
echo "============================================="

# Detect Framework
BACKEND_DIR="backend"
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: Backend directory '$BACKEND_DIR' not found."
    exit 1
fi

if [ -f "$BACKEND_DIR/requirements.txt" ]; then
    echo "✅ Detected Python Backend (FastAPI)"
    FRAMEWORK="fastapi"
else
    echo "❌ Error: Unknown backend structure. Missing requirements.txt."
    exit 1
fi

# Prepare environment
echo "📦 Installing Dependencies..."
python -m pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt"
pip install uvicorn httpx

# Compile Check
echo "🔍 Checking Code Syntax (Compilation)..."
python -m compileall "$BACKEND_DIR"

# Launch & Verification check
echo "🚀 Booting FastAPI for Build Verification..."
export SECRET_KEY="build_verification_secret_key"
export FIREBASE_CREDENTIALS_PATH="mock-credentials.json"
export FIREBASE_DATABASE_URL="https://mock.firebaseio.com"

# Run Uvicorn in background
cd "$BACKEND_DIR"
uvicorn app.main:app --host 127.0.0.1 --port 8000 > build_server.log 2>&1 &
UVICORN_PID=$!
cd ..

# Helper cleanup function
cleanup() {
    echo "🧹 Cleaning up background processes..."
    kill -9 "$UVICORN_PID" || true
}
trap cleanup EXIT

# Wait and Ping Health check
echo "⏱️ Waiting for server to boot..."
max_attempts=30
attempt=1
success=false

while [ $attempt -le $max_attempts ]; do
    if curl -s http://127.0.0.1:8000/health > /dev/null; then
        echo "🟢 Server responded successfully on http://127.0.0.1:8000/health"
        success=true
        break
    fi
    echo "  (Attempt $attempt/$max_attempts) Waiting..."
    sleep 1
    attempt=$((attempt + 1))
done

if [ "$success" = false ]; then
    echo "❌ Error: Server failed to start or respond to health check. Logs:"
    cat "$BACKEND_DIR/build_server.log" || true
    exit 1
fi

echo "✅ Build verification PASSED!"
