import json, sys, glob

path = glob.glob(r"C:\Users\rajir\.gemini\antigravity\brain\f58350e0-e67e-464e-87fe-6bbd5fa1b706\.system_generated\steps\807\content.md")[0]
with open(path, "r", encoding="utf-8") as f:
    raw = f.read()

start = raw.find("{")
data = json.loads(raw[start:])
for job in data["jobs"]:
    name = job["name"]
    conclusion = job.get("conclusion", "N/A")
    print(f"{conclusion:10s} | {name}")
    if conclusion == "failure":
        for step in job.get("steps", []):
            sc = step.get("conclusion", "")
            if sc == "failure":
                sname = step["name"]
                print(f"           FAILED STEP: {sname}")
