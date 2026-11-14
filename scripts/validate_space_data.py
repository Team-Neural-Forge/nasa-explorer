#!/usr/bin/env python3
"""Validate the committed NASA data snapshots (offline, no network)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

errors: list[str] = []


def fail(message: str) -> None:
    errors.append(message)


def load(path: Path) -> dict:
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"{path.relative_to(ROOT)}: {exc}")
        return {}


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def check_bodies() -> None:
    payload = load(DATA_DIR / "bodies.json")
    bodies = payload.get("bodies")
    require(isinstance(bodies, dict) and bodies, "bodies.json: missing bodies")
    for body_id, body in (bodies or {}).items():
        for key in ("name", "mass_kg", "radius_km", "gm_km3_s2", "gravity_m_s2", "source_url"):
            require(key in body, f"bodies.json: {body_id} missing {key}")
        require(
            str(body.get("source_url", "")).startswith("https://"),
            f"bodies.json: {body_id} source_url must be https",
        )


def check_transfer_legs() -> None:
    payload = load(DATA_DIR / "transfer_legs.json")
    legs = payload.get("legs")
    require(isinstance(legs, list) and legs, "transfer_legs.json: missing legs")
    for leg in legs or []:
        for key in ("id", "from", "to", "source_url"):
            require(key in leg, f"transfer_legs.json: leg missing {key}")
        if leg.get("approximate"):
            require(
                "method" in leg,
                f"transfer_legs.json: {leg.get('id', '?')} approximate leg missing method",
            )


def check_quizzes() -> None:
    payload = load(DATA_DIR / "quizzes.json")
    quizzes = payload.get("quizzes")
    require(isinstance(quizzes, list) and quizzes, "quizzes.json: missing quizzes")
    for quiz in quizzes or []:
        for key in ("id", "stage", "question", "options", "answer", "source_url"):
            require(key in quiz, f"quizzes.json: {quiz.get('id', '?')} missing {key}")
        require(
            isinstance(quiz.get("options"), list) and len(quiz["options"]) >= 2,
            f"quizzes.json: {quiz.get('id', '?')} needs >= 2 options",
        )


def check_catalogs() -> None:
    for name in ("launch_vehicles.json", "instruments.json", "spacecraft.json"):
        payload = load(DATA_DIR / "catalog" / name)
        entries = payload.get("vehicles") or payload.get("instruments") or payload.get("spacecraft")
        require(isinstance(entries, list) and entries, f"catalog/{name}: missing entries")
        for entry in entries or []:
            require("id" in entry, f"catalog/{name}: entry missing id")
            require("source_url" in entry, f"catalog/{name}: {entry.get('id', '?')} missing source_url")


def check_gameplay_tuning() -> None:
    payload = load(DATA_DIR / "gameplay_tuning.json")
    economy = payload.get("economy")
    require(isinstance(economy, dict), "gameplay_tuning.json: missing economy")
    if isinstance(economy, dict):
        require(
            economy.get("starting_budget_usd_m", 0) > 0,
            "gameplay_tuning.json: starting budget must be positive",
        )
    descent_stage = payload.get("descent_stage")
    require(isinstance(descent_stage, dict), "gameplay_tuning.json: missing descent_stage")
    if isinstance(descent_stage, dict):
        for key in ("dry_mass_kg", "propellant_kg", "thrust_kn", "isp_s"):
            require(
                descent_stage.get(key, 0) > 0,
                f"gameplay_tuning.json: descent_stage needs positive {key}",
            )
    for group in ("launch_vehicles", "spacecraft", "instruments"):
        entries = payload.get(group)
        require(isinstance(entries, dict) and entries, f"gameplay_tuning.json: missing {group}")
        for entry_id, entry in (entries or {}).items():
            require(
                isinstance(entry, dict) and entry.get("cost_usd_m", 0) > 0,
                f"gameplay_tuning.json: {group}/{entry_id} needs a positive cost_usd_m",
            )
    for vehicle_id, vehicle in (payload.get("launch_vehicles") or {}).items():
        for key in ("dry_mass_kg", "propellant_kg", "thrust_kn", "isp_s"):
            require(
                vehicle.get(key, 0) > 0,
                f"gameplay_tuning.json: launch_vehicles/{vehicle_id} needs positive {key}",
            )
    destinations = payload.get("destinations")
    require(
        isinstance(destinations, list) and destinations,
        "gameplay_tuning.json: missing destinations",
    )
    for destination in destinations or []:
        require(
            destination.get("id") and destination.get("required_delta_v_m_s", 0) > 0,
            "gameplay_tuning.json: destination needs id and positive required_delta_v_m_s",
        )


def check_credits() -> None:
    payload = load(DATA_DIR / "assets" / "credits.json")
    images = payload.get("images")
    require(isinstance(images, list) and images, "assets/credits.json: missing images")
    for image in images or []:
        require("id" in image, "assets/credits.json: image missing id")
        require("credit" in image, f"assets/credits.json: {image.get('id', '?')} missing credit")
        file_name = image.get("file")
        if file_name:
            asset = DATA_DIR / "assets" / file_name
            require(asset.is_file(), f"assets/credits.json: missing file {file_name}")


def main() -> int:
    check_bodies()
    check_transfer_legs()
    check_quizzes()
    check_catalogs()
    check_gameplay_tuning()
    check_credits()

    if errors:
        print("data validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("data validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
