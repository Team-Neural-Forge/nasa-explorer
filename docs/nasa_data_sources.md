# NASA Data Sources

> **Compulsory section.** This project uses NASA data and links the specific sources below, as required by the NASA Space Apps Challenge.

## Challenge resources

- Challenge brief and resources: https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources
- The official Resources tab is a set of mission-design **guides and tools** (not raw datasets). We used it for design framing: *Design and Develop Science Missions*, **GMAT**, **Concept Maturity Levels (CMLs)**, **Mission Design Lab**, **NASA Mission Viz**, and *CubeSat 101*. See [`challenge_alignment.md`](challenge_alignment.md).

## NASA data used

| # | Dataset / resource | Source (URL) | What we use it for |
|---|---|---|---|
| 1 | NSSDCA Planetary Fact Sheets | https://nssdc.gsfc.nasa.gov/planetary/factsheet/ | Body mass, radius, GM/gravity, semi-major axis, eccentricity, inclination, orbital period, temperature, pressure, and albedo → `data/bodies.json`. `GM` and mass drive the **full numerical gravity model**; surface gravity drives surface movement and landing limits. |
| 2 | JPL Horizons | https://ssd.jpl.nasa.gov/api/horizons.api | Real orbital elements and leg/travel references → `data/transfer_legs.json` (approximate gameplay values; regenerate with `scripts/build_space_data.py`). Used to validate simulated travel times. |
| 3 | NASA Image and Video Library | https://images-api.nasa.gov | Destination imagery for cards, reveals, and quiz visuals → `GET /nasa/media/search` (+ bundled fallbacks) |
| 4 | NASA Astronomy Picture of the Day (new endpoint) | https://science.nasa.gov/wp-json/wp/v2/apod-basic | Daily NASA fact/loading screen → `GET /nasa/facts/daily` |
| 5 | NSSDC Master Catalog, NASA TechPort, KSC ELV Performance | https://nssdc.gsfc.nasa.gov/nmc/ · https://techport.nasa.gov/api/projects?format=json · https://elvperf.ksc.nasa.gov/ | Curated spacecraft, instruments, and launch-vehicle catalogs → `data/catalog/*.json` |
| 6 | NASA Science mission and topic pages | https://science.nasa.gov/ (per-topic URLs on each card) | Science cards, far-side discoveries, and quiz explanations → `data/science_cards.json`, `data/quizzes.json`. Every claim carries its own source URL. |

> **Approximations and tools.** The outer-solar legs (Mars → Europa, Mars → Enceladus) are filled with an idealised Hohmann approximation computed from NSSDCA semi-major axes (each leg carries a `method` field and `approximate: true`); they ignore gravity assists, so real tours are cheaper. **GMAT is referenced as design inspiration only and is not run** at build or runtime.

All core sources are accessed **without an API key**. Live endpoints are proxied through the FastAPI backend and cached; the critical data is committed as snapshots so the game runs fully offline.

## Data from NASA partners

No NASA-partner datasets are currently used. If partner data is added, list it here with its source link.

## How the data is used

The in-game navigation guide uses the third-party, offline [Astronomy Engine](https://github.com/cosinekitty/astronomy) approximation for time-dependent barycentric positions; it does not query JPL at runtime. Its EQJ axes are approximately aligned with ICRF. Earth and Mars results for 2026-11-14 and 2026-11-15 are checked against geometric [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) vectors with a 5,000 km tolerance; these are selected-date checks, not an accuracy guarantee for other dates.

- **Physics and movement** — body mass and `GM` from NSSDCA feed the full numerical gravity model, so gravity and trajectories are physical. Surface gravity drives walking, rovers, and landing limits.
- **Journey pace and scoring** — Horizons-derived leg metrics provide reference travel times for Earth → Moon → Mars → Europa / Enceladus / Living on Mars, and validate the integrator.
- **Earth-side assembly** — curated spacecraft, instruments, and launch vehicles provide authentic choices with gameplay trade-offs.
- **Learning** — science cards, far-side discoveries, and quizzes draw on the cited NASA pages.
- **Art and atmosphere** — NASA imagery (credited) supports destination cards and reveals.

## Gameplay values (not NASA data)

Some numbers are tuned for play rather than taken from NASA: spacecraft dry mass, thrust, specific impulse, propellant load, part costs, budget growth, drag coefficients, descent-stage mass/thrust/Isp/propellant, and safe-landing thresholds. These live in `data/gameplay_tuning.json` (and are marked as gameplay values in [`flight_model.md`](flight_model.md)). They are derived from public specs where possible but must **not** be presented as official NASA figures.

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
