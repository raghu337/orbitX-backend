#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
"""
orbitx_autofix_all.py
=====================
Self-healing automation loop for the OrbitX project workspace.

Performs the following actions autonomously:
  1. Verifies required structural directories exist (creates if missing).
  2. Validates Python dependency files (requirements.txt / pyproject.toml).
  3. Checks Node.js package manifests in orbitx-web and root workspace.
  4. Validates that the Vite config exposes port 5173.
  5. Verifies Firebase config is structurally sound.
  6. Clears the Vite build cache (.vite folder).
  7. Confirms all orbitx-web component source files are present.
  8. Prints a final status report with the local dev URL.

Usage:
    python scripts/orbitx_autofix_all.py
"""

import os
import sys
import json
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

# ─── Colour helpers ──────────────────────────────────────────────────────────
class C:
    RESET  = "\033[0m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    RED    = "\033[91m"
    CYAN   = "\033[96m"
    BOLD   = "\033[1m"

def ok(msg):   print(f"  {C.GREEN}[OK]  {msg}{C.RESET}")
def warn(msg): print(f"  {C.YELLOW}[WARN] {msg}{C.RESET}")
def err(msg):  print(f"  {C.RED}[ERR] {msg}{C.RESET}")
def info(msg): print(f"  {C.CYAN}[-->] {msg}{C.RESET}")
def header(msg):
    bar = "-" * 60
    print(f"\n{C.BOLD}{C.CYAN}{bar}{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}  {msg}{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}{bar}{C.RESET}")

# ─── Constants ───────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[1]
WEB_ROOT  = REPO_ROOT / "orbitx-web"

REQUIRED_DIRS = [
    "backend", "scripts", "tests", "src", "config",
    "orbitx-web/src", "orbitx-web/src/components",
    "orbitx-web/src/firebase", "orbitx-web/public",
    "reports", "automation",
]

REQUIRED_WEB_COMPONENTS = [
    "Sidebar.jsx", "SpaceNotesAI.jsx", "LiveTracker.jsx",
    "SolarSystem.jsx", "SpaceChat.jsx", "LaunchHub.jsx", "Settings.jsx",
]

REQUIRED_WEB_FILES = [
    "index.html", "vite.config.js", "package.json",
    "src/main.jsx", "src/App.jsx", "src/index.css",
    "src/firebase/config.js",
]

issues   = []
warnings = []

# ─── Step 1: Structural directory check ──────────────────────────────────────
header("STEP 1 — Structural Directory Verification")
for d in REQUIRED_DIRS:
    path = REPO_ROOT / d
    if path.exists():
        ok(f"Directory present: {d}")
    else:
        path.mkdir(parents=True, exist_ok=True)
        warn(f"Created missing directory: {d}")
        warnings.append(f"Created missing directory: {d}")

# ─── Step 2: Python dependency files ─────────────────────────────────────────
header("STEP 2 — Python Dependency Validation")
req_txt = REPO_ROOT / "requirements.txt"
pyproject = REPO_ROOT / "pyproject.toml"

if req_txt.exists():
    lines = [l.strip() for l in req_txt.read_text().splitlines() if l.strip() and not l.startswith("#")]
    ok(f"requirements.txt present ({len(lines)} packages)")
else:
    warn("requirements.txt not found — creating minimal stub")
    req_txt.write_text("# OrbitX Python dependencies\nfastapi>=0.111.0\nuvicorn[standard]>=0.29.0\nhttpx>=0.27.0\npytest>=8.2.0\n")
    warnings.append("requirements.txt was missing — stub created")

if pyproject.exists():
    ok("pyproject.toml present")
else:
    warn("pyproject.toml not found — skipping (optional)")

# ─── Step 3: Node.js package manifest check ──────────────────────────────────
header("STEP 3 — Node.js Package Manifest Check")

for label, pkg_path in [("root workspace", REPO_ROOT / "package.json"),
                         ("orbitx-web", WEB_ROOT / "package.json")]:
    if pkg_path.exists():
        try:
            data = json.loads(pkg_path.read_text(encoding="utf-8"))
            scripts = data.get("scripts", {})
            ok(f"{label} package.json valid — scripts: {list(scripts.keys())}")
        except json.JSONDecodeError as e:
            err(f"{label} package.json is malformed: {e}")
            issues.append(f"{label} package.json malformed")
    else:
        warn(f"{label} package.json not found")
        warnings.append(f"{label} package.json missing")

# node_modules presence
nm = WEB_ROOT / "node_modules"
if nm.exists():
    ok("orbitx-web/node_modules present")
else:
    warn("node_modules absent — run `npm install` inside orbitx-web")
    warnings.append("node_modules absent in orbitx-web")

# ─── Step 4: Vite config port verification ───────────────────────────────────
header("STEP 4 — Vite Configuration Verification")
vite_cfg = WEB_ROOT / "vite.config.js"
if vite_cfg.exists():
    content = vite_cfg.read_text(encoding="utf-8")
    if "5173" in content:
        ok("vite.config.js explicitly pins port 5173")
    else:
        # Patch: inject server port block
        patched = content.replace(
            "export default defineConfig({",
            "export default defineConfig({\n  server: { port: 5173, strictPort: true },"
        )
        if patched != content:
            vite_cfg.write_text(patched, encoding="utf-8")
            warn("vite.config.js patched — server.port: 5173 injected")
            warnings.append("vite.config.js patched with port 5173")
        else:
            warn("vite.config.js present but port not pinned and auto-patch skipped")
else:
    err("vite.config.js MISSING — this will prevent Vite from starting")
    issues.append("vite.config.js missing")

# ─── Step 5: Firebase config structural check ────────────────────────────────
header("STEP 5 — Firebase Configuration Structural Audit")
fb_cfg = WEB_ROOT / "src" / "firebase" / "config.js"
if fb_cfg.exists():
    fb_text = fb_cfg.read_text(encoding="utf-8")
    required_keys = ["apiKey", "authDomain", "projectId", "databaseURL", "appId"]
    missing_keys = [k for k in required_keys if k not in fb_text]
    placeholder_keys = []
    if "YOUR_FIREBASE_API_KEY_PLACEHOLDER" in fb_text:
        placeholder_keys.append("apiKey")

    if missing_keys:
        err(f"Firebase config missing keys: {missing_keys}")
        issues.append(f"Firebase config missing keys: {missing_keys}")
    else:
        ok(f"Firebase config contains all required keys: {required_keys}")

    if placeholder_keys:
        warn(f"Firebase placeholder values detected for: {placeholder_keys}")
        warn("App will still compile — Firebase will throw auth errors at runtime only")
        warnings.append("Firebase apiKey is still a placeholder")
    else:
        ok("No placeholder values detected in Firebase config")

    # Check exports
    if "export {" in fb_text or "export default" in fb_text:
        ok("Firebase config exports are structurally valid")
    else:
        err("Firebase config has no export statement")
        issues.append("Firebase config missing export")
else:
    err("src/firebase/config.js MISSING")
    issues.append("Firebase config file missing")

# ─── Step 6: Clear Vite build cache ──────────────────────────────────────────
header("STEP 6 — Vite Cache Cleanup")
vite_cache = WEB_ROOT / "node_modules" / ".vite"
if vite_cache.exists():
    shutil.rmtree(vite_cache, ignore_errors=True)
    ok(f"Vite cache cleared: {vite_cache}")
else:
    ok("No stale Vite cache found — skipping")

# ─── Step 7: Component source file verification ───────────────────────────────
header("STEP 7 — React Component Source File Verification")
comp_dir = WEB_ROOT / "src" / "components"
missing_components = []
for comp in REQUIRED_WEB_COMPONENTS:
    cp = comp_dir / comp
    if cp.exists():
        size_kb = cp.stat().st_size / 1024
        ok(f"{comp} ({size_kb:.1f} KB)")
    else:
        err(f"MISSING component: {comp}")
        missing_components.append(comp)
        issues.append(f"Component missing: {comp}")

for rel_file in REQUIRED_WEB_FILES:
    fp = WEB_ROOT / rel_file
    if fp.exists():
        ok(f"Web file present: {rel_file}")
    else:
        err(f"MISSING web file: {rel_file}")
        issues.append(f"Web file missing: {rel_file}")

# ─── Step 8: Python compile check on scripts ─────────────────────────────────
header("STEP 8 — Python Script Syntax Validation")
scripts_dir = REPO_ROOT / "scripts"
py_files = list(scripts_dir.glob("*.py"))
compile_errors = []
for pf in py_files:
    result = subprocess.run(
        [sys.executable, "-m", "py_compile", str(pf)],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        ok(f"Syntax OK: scripts/{pf.name}")
    else:
        err(f"Syntax ERROR: scripts/{pf.name} — {result.stderr.strip()}")
        compile_errors.append(pf.name)

if compile_errors:
    issues.append(f"Python syntax errors in: {compile_errors}")

# ─── Final Report ─────────────────────────────────────────────────────────────
header("FINAL STATUS REPORT")
ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"\n  Scan completed at: {C.BOLD}{ts}{C.RESET}")
print(f"  Warnings  : {C.YELLOW}{len(warnings)}{C.RESET}")
print(f"  Issues    : {C.RED}{len(issues)}{C.RESET}")

if warnings:
    print(f"\n  {C.YELLOW}Warnings:{C.RESET}")
    for w in warnings:
        print(f"    • {w}")

if issues:
    print(f"\n  {C.RED}Blocking Issues:{C.RESET}")
    for i in issues:
        print(f"    ✖ {i}")
    print(f"\n  {C.RED}Build check FAILED — resolve the issues above before starting the dev server.{C.RESET}")
    sys.exit(1)
else:
    print(f"\n  {C.GREEN}{C.BOLD}[PASS] All checks passed -- build is clean!{C.RESET}")
    print(f"\n  {C.BOLD}{'-'*50}{C.RESET}")
    print(f"  {C.CYAN}{C.BOLD}[DEV] Local dev server URL:{C.RESET}")
    print(f"  {C.GREEN}{C.BOLD}      http://localhost:5173/{C.RESET}")
    print(f"  {C.BOLD}{'-'*50}{C.RESET}")
    print(f"\n  To start the server, run:")
    print(f"  {C.CYAN}  cd orbitx-web && npm run dev{C.RESET}\n")
    sys.exit(0)
