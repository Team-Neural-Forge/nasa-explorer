# Challenge Alignment — Space Mission Design Game

The challenge describes mission design as a set of interlocking decisions:

> "Designing a mission involves decisions about the spacecraft, scientific instruments, launch vehicle, orbit, power, mass, communications, budget, and mission lifetime. A decision that improves one aspect of a mission can create limitations in another."

NASA Explorer maps those dimensions onto playable systems. The table below is the single source of truth for how each dimension is covered.

| Dimension | How NASA Explorer covers it | Status |
|---|---|---|
| **Spacecraft** | The player travels in a spacecraft; upgrades are bought in the mission store and affect how the journey plays. | Implemented (core) |
| **Scientific instruments** | The mission store offers a menu of space tools / instruments that the player buys with a limited budget. | Implemented (core) |
| **Launch vehicle** | Launch vehicles are available in the store; the player controls launch power and direction. | Implemented (core) |
| **Orbit** | Movement and trajectories follow physics; reaching and holding an orbit is part of the journey. | Implemented (physics-based) |
| **Power** | Power is a gameplay constraint modelled through physics and upgrades. | Implemented (physics-based) |
| **Mass** | Mass affects movement and performance in the physics simulation; heavier loadouts behave differently. | Implemented (physics-based) |
| **Budget** | The player has a budget that slowly increases over time and is spent in the store; slow growth forces exploration while saving. | Implemented (core) |
| **Communications** | Not implemented in the current build. | NIL |
| **Mission lifetime** | Not implemented in the current build. | NIL |

## The trade-off principle

The challenge's central idea — *a decision that improves one aspect can create limitations in another* — is expressed through the store economy and physics:

- **Instruments vs. budget:** better science tools cost more, delaying other purchases.
- **Power vs. mass:** more capability often means more mass, which changes movement.
- **Reach vs. launch:** reaching farther destinations demands more launch power and a better vehicle.
- **Exploration vs. saving:** slow budget growth pushes the player to explore while saving for the next upgrade.

These tensions are what make the game a *mission design* game rather than a simple explorer.

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
- **GMAT / Mission Viz** informed the physics-and-orbit framing and the ambition for real orbital values.
- **Design and Develop Science Missions / CubeSat 101** informed the instrument and trade-off vocabulary used in the store and quizzes.

## Scope notes

- **Communications** and **mission lifetime** are deliberately **NIL** for this build. They are listed as future work in [`project_overview.md`](project_overview.md).
- Exact numeric tuning (budget rate, mass values, power costs) is refined during implementation.
