# OrbitX Selenium Automation Containerization

This directory contains configurations to package and run the OrbitX Selenium Page Object Model (POM) E2E suite inside a Docker container. 

---

## 1. Quickstart (Docker Compose)

The easiest way to execute tests is via **Docker Compose**. It automatically sets up the build context, maps report paths, and prevents Chrome memory crashes.

### Step 1: Copy and Edit `.env`
Create a `.env` file from the template:
```bash
cp docker/.env.example docker/.env
```
Inside `docker/.env`, configure your target base URL and credentials:
```ini
BASE_URL=http://localhost:8080
USERNAME=astronaut@orbitx.com
PASSWORD=password123
```

### Step 2: Build and Run the Tests
From the **repository root directory**, run:
```bash
# Build the automation image
docker-compose -f docker/docker-compose.yml build

# Run the test execution suite
docker-compose -f docker/docker-compose.yml up
```

All test outcomes, screenshots, and logs will be written to the host directory:
`reports/` (at the root of the project).

---

## 2. Running with Native Docker CLI

If you prefer to run using standard Docker commands:

### Step 1: Build the Image
From the **repository root directory**, execute:
```bash
docker build -t orbitx-automation -f docker/Dockerfile .
```

### Step 2: Run the Container with Volume Mounts
On **Linux/macOS**:
```bash
docker run --rm \
  -v "$(pwd)/reports:/app/reports" \
  -e BASE_URL="http://host.docker.internal:8080" \
  -e USERNAME="astronaut@orbitx.com" \
  -e PASSWORD="password123" \
  --shm-size=2gb \
  orbitx-automation
```

On **Windows (PowerShell)**:
```powershell
docker run --rm `
  -v "${PWD}/reports:/app/reports" `
  -e BASE_URL="http://host.docker.internal:8080" `
  -e USERNAME="astronaut@orbitx.com" `
  -e PASSWORD="password123" `
  --shm-size=2gb `
  orbitx-automation
```

---

## 3. Configuration & Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `BASE_URL` | `http://127.0.0.1:8080` | Address of target application. Set to `http://host.docker.internal:8080` to access localhost services running on your host machine. |
| `USERNAME` | `astronaut@orbitx.com` | Email account username. |
| `PASSWORD` | `password123` | Account authentication password. |

---

## 4. Troubleshooting Guide

### A. Chrome Crashes with "Session deleted because of page crash"
- **Cause**: Chrome runs out of memory inside Docker. Docker containers restrict the shared memory space (`/dev/shm`) to 64MB by default.
- **Remediation**: 
  - If using Docker Compose, the `shm_size: 2gb` flag is already configured.
  - If using raw `docker run`, make sure to append `--shm-size=2gb`.
  - Alternatively, keep `--disable-dev-shm-usage` active inside your ChromeOptions configuration in `driver_factory.py`.

### B. "WebDriverException: Message: DevToolsActivePort file to start"
- **Cause**: Chrome fails to spin up headless processes or permissions are restricted.
- **Remediation**: Make sure the following Chrome flags are set:
  - `--no-sandbox`
  - `--headless=new`
  - `--disable-gpu`

### C. M1/M2/M3 Apple Silicon Architecture Warnings
- **Cause**: Google Chrome stable binaries are compiled for `amd64` (x86_64). When running on ARM64 Apple Silicon chips, you might see warning signs or execution delays.
- **Remediation**:
  - Docker Desktop handles x86_64 virtualization automatically via Rosetta 2.
  - You can force x86 emulation during build/run by appending the platform flag:
    ```bash
    docker build --platform linux/amd64 -t orbitx-automation -f docker/Dockerfile .
    docker run --platform linux/amd64 ... orbitx-automation
    ```

### D. "Connection Refused" when accessing host's localhost (e.g. 127.0.0.1:3000)
- **Cause**: `127.0.0.1` inside the container refers to the container's loopback interface, not your host computer.
- **Remediation**:
  - Change `BASE_URL` from `http://127.0.0.1:8080` to `http://host.docker.internal:8080`. This maps traffic directly to your host's network.
  - Ensure your host server binds to all interfaces (`0.0.0.0`) and is not limited to localhost loopbacks.

### E. Permission write errors on `reports/` folder
- **Cause**: The folder inside container has root ownership, while your host developer user has different permission keys on Windows/Linux.
- **Remediation**:
  - Make sure the folder exists on the host *before* mounting it: `mkdir -p reports`.
  - If on Linux, you can assign correct UID/GID run arguments:
    ```bash
    docker run --user "$(id -u):$(id -g)" ...
    ```
