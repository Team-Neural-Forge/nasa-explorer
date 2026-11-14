#!/usr/bin/env python3
"""Build the NASA data snapshots used by NASA Explorer.

This script is run manually (or in a scheduled job), never at game runtime.
It:
  1. Refreshes `fetched_at` timestamps on the committed snapshots.
  2. Best-effort queries JPL Horizons for orbital elements of journey bodies.
  3. Mirrors client-side data into `frontend-web/src/data/` so the frontend
     can bundle it and run fully offline.

Requires only the Python standard library.
"""

from __future__ import annotations

import datetime as dt
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
FRONTEND_DATA_DIR = ROOT / "frontend-web" / "src" / "data"

HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api"

HORIZONS_BODIES = {
    "moon": ("301", "500@399"),
    "mars": ("499", "500@10"),
    "europa": ("502", "500@10"),
    "enceladus": ("602", "500@10"),
}


def today() -> str:
    return dt.date.today().isoformat()


def read_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent="\t", ensure_ascii=False)
        handle.write("\n")


def fetch(url: str, timeout: int = 30) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "nasa-explorer-data/0.1"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8", errors="replace")


def horizons_elements(body_id: str, center: str) -> dict:
    params = {
        "format": "text",
        "COMMAND": f"'{body_id}'",
        "OBJ_DATA": "'NO'",
        "MAKE_EPHEM": "'YES'",
        "EPHEM_TYPE": "'ELEMENTS'",
        "CENTER": f"'{center}'",
        "START_TIME": "'2026-11-14'",
        "STOP_TIME": "'2026-11-15'",
        "STEP_SIZE": "'1 d'",
    }
    url = f"{HORIZONS_API}?{urllib.parse.urlencode(params)}"
    text = fetch(url)
    fields = {}
    for key in ("EC", "IN", "A", "QR", "MA"):
        match = re.search(rf"\b{key}=\s*([-+0-9.Ee]+)", text)
        if match:
            fields[key] = match.group(1)
    return {"body_id": body_id, "center": center, "fields": fields}


def update_timestamps() -> None:
    for path in sorted(DATA_DIR.rglob("*.json")):
        payload = read_json(path)
        meta = payload.get("meta")
        if isinstance(meta, dict):
            meta["fetched_at"] = today()
            write_json(path, payload)
            print(f"updated {path.relative_to(ROOT)}")


def build_horizons_snapshot() -> None:
    snapshot = {"meta": {"source": HORIZONS_API, "fetched_at": today()}, "bodies": {}}
    for name, (body_id, center) in HORIZONS_BODIES.items():
        try:
            snapshot["bodies"][name] = horizons_elements(body_id, center)
            print(f"horizons ok: {name}")
        except Exception as exc:  # noqa: BLE001 - network best-effort
            snapshot["bodies"][name] = {"body_id": body_id, "center": center, "error": str(exc)}
            print(f"horizons failed: {name}: {exc}")
    write_json(DATA_DIR / "horizons_elements.json", snapshot)


def mirror_to_frontend() -> None:
    mirrored = ["bodies.json", "transfer_legs.json", "quizzes.json"]
    catalogs = ["launch_vehicles.json", "instruments.json", "spacecraft.json"]
    for name in mirrored:
        write_json(FRONTEND_DATA_DIR / name, read_json(DATA_DIR / name))
    for name in catalogs:
        write_json(
            FRONTEND_DATA_DIR / "catalog" / name,
            read_json(DATA_DIR / "catalog" / name),
        )
    write_json(FRONTEND_DATA_DIR / "credits.json", read_json(DATA_DIR / "assets" / "credits.json"))
    print(f"mirrored client data to {FRONTEND_DATA_DIR.relative_to(ROOT)}")


def main() -> int:
    if not DATA_DIR.is_dir():
        print(f"missing data directory: {DATA_DIR}", file=sys.stderr)
        return 1

    update_timestamps()
    if "--offline" not in sys.argv:
        build_horizons_snapshot()
    mirror_to_frontend()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
