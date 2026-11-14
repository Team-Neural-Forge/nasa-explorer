# Challenge Alignment — Space Mission Design Game

The challenge describes mission design as a set of interlocking decisions:

> "Designing a mission involves decisions about the spacecraft, scientific instruments, launch vehicle, orbit, power, mass, communications, budget, and mission lifetime. A decision that improves one aspect of a mission can create limitations in another."

NASA Explorer maps those dimensions onto playable systems. The table below is the single source of truth for how each dimension is covered.

| Dimension | How NASA Explorer covers it | Status |
|---|---|---|
| **Spacecraft** | The player assembles the spacecraft **on Earth** before launch; it carries the astronaut, determines landing capability, and is locked once launched. | Implemented (core) |
| **Scientific instruments** | Instruments are chosen during Earth-side assembly and add mass, power draw, and cost, directly affecting the rocket's performance. | Implemented (core) |
| **Launch vehicle** | Launch vehicles and stages are selected during assembly; the player then controls rotation, power, and staging through ascent. | Implemented (core) |
| **Orbit** | Motion is **fully numerically integrated** (not scripted); reaching and holding an orbit is a physical result of the player's ascent. | Implemented (physics-based) |
| **Power** | Power is a gameplay constraint modelled through physics and assembly choices. | Implemented (physics-based) |
| **Mass** | Mass affects thrust-to-weight, acceleration, propellant budget, and surface movement; heavier loadouts behave differently. | Implemented (physics-based) |
| **Budget** | The player has a budget that slowly increases over time and is spent during Earth-side assembly; slow growth forces exploration while saving. | Implemented (core) |
| **Communications** | Not implemented in the current build. | NIL |
| **Mission lifetime** | Not implemented in the current build. | NIL |

## The trade-off principle

The challenge's central idea — *a decision that improves one aspect can create limitations in another* — is expressed through Earth-only assembly and full physics:

- **Instruments vs. budget:** better science tools cost more and add mass, delaying other purchases and reducing performance.
- **Power vs. mass:** more capability often means more mass, which lowers thrust-to-weight and Δv.
- **Reach vs. launch:** reaching farther destinations demands more propellant and a better vehicle, which costs more budget.
- **Exploration vs. saving:** slow budget growth pushes the player to explore while saving for the next upgrade.
- **Speed vs. safety:** arriving with more speed shortens the trip but makes landing harder; the player must shed velocity before touchdown or crash.
- **Design vs. commitment:** assembly happens only on Earth, so the player must anticipate the mission before launch.

These tensions are what make the game a *mission design* game rather than a simple explorer. Because trajectories are fully simulated, the consequences of these choices are physical, not scripted.

## Official challenge resources we used

The challenge's Resources tab lists mission-design guides and tools rather than datasets. We used them for framing:

- **Design and Develop Science Missions:** https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf
- **General Mission Analysis Tool (GMAT):** https://software.nasa.gov/software/GSC-19468-1
- **Concept Maturity Levels (CMLs):** https://dataverse.jpl.nasa.gov/dataset.xhtml?persistentId=hdl:2014/44299
- **Mission Design Lab:** https://etd.gsfc.nasa.gov/capabilities/integrated-design-center/mission-design-lab/
- **NASA Mission Viz:** https://nasa.github.io/mission-viz/
- **CubeSat 101:** https://www3.nasa.gov/sites/default/files/atoms/files/nasa_csli_cubesat_101_508.pdf

How they shaped the design:

- **CMLs** informed how mission maturity grows from concept to a concrete, budgeted design — mirrored by the store and budget pacing.
- **GMAT / Mission Viz** informed the physics-and-orbit framing (GMAT is a reference only — not run). Transfer-leg numbers are idealised Hohmann approximations from NSSDCA semi-major axes.
- **Design and Develop Science Missions / CubeSat 101** informed the instrument and trade-off vocabulary used in the store and quizzes.

## Scope notes

- **Communications** and **mission lifetime** are deliberately **NIL** for this build. They are listed as future work in [`project_overview.md`](project_overview.md).
- Exact numeric tuning (budget rate, mass values, power costs) is refined during implementation.
