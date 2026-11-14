"""Keyless NASA data proxy with in-memory caching and offline fallbacks.

The frontend can use these endpoints for optional live data, but the game must
remain fully playable offline using the bundled snapshots under ``data/``.
"""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Any

import httpx
from fastapi import APIRouter, Query

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/nasa", tags=["nasa"])

FALLBACK_DIR = Path(__file__).resolve().parent.parent / "data" / "fallback"
APOD_URL = "https://science.nasa.gov/wp-json/wp/v2/apod-basic"
IMAGES_URL = "https://images-api.nasa.gov/search"
APOD_TTL_SECONDS = 24 * 60 * 60
MEDIA_TTL_SECONDS = 7 * 24 * 60 * 60
REQUEST_TIMEOUT_SECONDS = 5.0

_cache: dict[str, tuple[float, Any]] = {}


def _cached(key: str, ttl_seconds: int) -> Any | None:
    entry = _cache.get(key)
    if entry is None:
        return None
    stored_at, value = entry
    if time.monotonic() - stored_at > ttl_seconds:
        return None
    return value


def _store(key: str, value: Any) -> None:
    _cache[key] = (time.monotonic(), value)


def _load_fallback(name: str) -> dict[str, Any]:
    path = FALLBACK_DIR / name
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


async def _get_json(url: str, params: dict[str, Any] | None = None) -> Any:
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


@router.get("/facts/daily")
async def facts_daily() -> dict[str, Any]:
    """Astronomy Picture of the Day, cached for 24 hours."""
    cached = _cached("apod", APOD_TTL_SECONDS)
    if cached is not None:
        return {"data": cached, "stale": False}
    try:
        payload = await _get_json(APOD_URL, {"count": 1})
        if isinstance(payload, list):
            item: Any = payload[0] if payload else None
        else:
            item = payload
        _store("apod", item)
        return {"data": item, "stale": False}
    except Exception:
        logger.warning("APOD fetch failed; serving bundled fallback", exc_info=True)
        return {"data": _load_fallback("apod.json"), "stale": True}


@router.get("/media/search")
async def media_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(8, ge=1, le=20),
) -> dict[str, Any]:
    """Search NASA's image library, cached for 7 days."""
    cache_key = f"media:{q.lower()}:{limit}"
    cached = _cached(cache_key, MEDIA_TTL_SECONDS)
    if cached is not None:
        return {"items": cached, "stale": False}
    try:
        payload = await _get_json(IMAGES_URL, {"media_type": "image", "q": q})
        items = []
        for entry in payload.get("collection", {}).get("items", [])[:limit]:
            data = (entry.get("data") or [{}])[0]
            links = entry.get("links") or [{}]
            nasa_id = data.get("nasa_id")
            items.append(
                {
                    "nasa_id": nasa_id,
                    "title": data.get("title"),
                    "description": data.get("description"),
                    "image_url": links[0].get("href"),
                    "source_url": (
                        f"https://images.nasa.gov/details/{nasa_id}"
                        if nasa_id
                        else None
                    ),
                }
            )
        _store(cache_key, items)
        return {"items": items, "stale": False}
    except Exception:
        logger.warning("Image search failed; serving bundled fallback", exc_info=True)
        fallback = _load_fallback("media.json").get("items", [])
        return {"items": fallback[:limit], "stale": True}
