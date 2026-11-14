# NASA Data Sources

> **Compulsory section.** This project uses NASA data and links the specific sources below, as required by the NASA Space Apps Challenge.

## Challenge resources

- Challenge brief and resources: https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources
- The official Resources tab is a set of mission-design **guides and tools** (not raw datasets). We used it for design framing: *Design and Develop Science Missions*, **GMAT**, **Concept Maturity Levels (CMLs)**, **Mission Design Lab**, **NASA Mission Viz**, and *CubeSat 101*. See [`challenge_alignment.md`](challenge_alignment.md).

## NASA data used

| # | Dataset / resource | Source (URL) | What we use it for |
|---|---|---|---|
| 1 | NSSDCA Planetary Fact Sheets | https://nssdc.gsfc.nasa.gov/planetary/factsheet/ | Body mass, radius, GM/gravity, semi-major axis, eccentricity, inclination, orbital period, temperature, pressure, and albedo → `data/bodies.json` |
| 2 | JPL Horizons | https://ssd.jpl.nasa.gov/api/horizons.api | Real orbital elements and leg/travel references → `data/transfer_legs.json` (approximate gameplay values; regenerate with `scripts/build_space_data.py`) |
| 3 | NASA Image and Video Library | https://images-api.nasa.gov | Destination imagery for cards, reveals, and quiz visuals → `GET /nasa/media/search` (+ bundled fallbacks) |
| 4 | NASA Astronomy Picture of the Day (new endpoint) | https://science.nasa.gov/wp-json/wp/v2/apod-basic | Daily NASA fact/loading screen → `GET /nasa/facts/daily` |
| 5 | NSSDC Master Catalog, NASA TechPort, KSC ELV Performance | https://nssdc.gsfc.nasa.gov/nmc/ · https://techport.nasa.gov/api/projects?format=json · https://elvperf.ksc.nasa.gov/ | Curated spacecraft, instruments, and launch-vehicle catalogs → `data/catalog/*.json` |

All core sources are accessed **without an API key**. Live endpoints are proxied through the FastAPI backend and cached; the critical data is committed as snapshots so the game runs fully offline.

## Data from NASA partners

No NASA-partner datasets are currently used. If partner data is added, list it here with its source link.

## How the data is used

- **Physics and movement** — real surface gravity and body constants from NSSDCA drive scaled `matter.js` gravity, so each world feels physically distinct.
- **Journey pace and scoring** — Horizons-derived leg metrics inform travel time and distance for Earth → Moon → Mars → Europa / Enceladus / Living on Mars.
- **Mission store** — curated spacecraft, instruments, and launch vehicles provide authentic choices with gameplay trade-offs.
- **Learning** — quizzes and movement-triggered facts draw on the cited NASA pages.
- **Art and atmosphere** — NASA imagery (credited) supports destination cards and reveals.

## Attribution

- NASA media is generally not subject to U.S. copyright and may be used for educational and informational purposes, **with attribution to NASA** (e.g., "NASA/JPL-Caltech").
- The NASA insignia, logotype, and seal are **not** public domain and are **not** used as branding; the game does not imply NASA endorsement.
- Per-image credits live in `data/assets/credits.json` and are rendered by the frontend `ImageCredit` component.
- Reference: https://www.nasa.gov/nasa-brand-center/images-and-media/

## Reproducing the snapshots

```sh
just data_build   # refresh timestamps, query Horizons (network), mirror client data
just data_check   # offline validation of the committed data
```
