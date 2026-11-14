# Game Design — NASA Explorer

> NASAExplorer: a physics-based adventure that teaches mission design by letting players live it.

## Concept

NASA Explorer is a single-player, physics-based space exploration game. The player is a NASA astronaut who assembles a rocket on Earth, launches into space, and travels the solar system with realistic physics. Along the way the game teaches, in context, the real constraints of mission design: launch power, mass, thrust, propellant, gravity, orbital motion, landing, and budget.

The design goal is to make the **trade-offs of real mission design** feel intuitive — a decision that improves one aspect of a mission creates limitations in another — while remaining approachable for players who know little about spaceflight.

The game is designed to be **educational by default**: every mechanic is paired with a short, plain-language explanation, and every NASA fact is cited. See [`learning_design.md`](learning_design.md).

## Inspirations

- **GRIS** — wordless, music-driven storytelling and a calm, painterly art direction.
- **herCode Space** — playful, accessible space exploration for a broad audience.
- **Black Myth: Wukong** — its smooth intro, where the menu and the live world share the same space, directly inspired the live-menu presentation.

## Player role

The player is a **NASA astronaut**. The astronaut designs and launches a rocket, flies it, can leave and re-enter the vehicle, lands on other worlds, and explores them on foot or by surface vehicle. Abilities mirror real spaceflight challenges: atmospheric ascent, orbital insertion, microgravity, EVA, powered descent, surface traversal, and swimming in subsurface oceans.

## Presentation: the live menu

The game opens on a **menu that is also the game**. There is no separate menu scene and no full-screen menu background:

- On **desktop**, the menu options sit on the **left** of the screen with **no panel or backdrop** behind them. The world itself — an idle Earth, the launch site, drifting stars — is already running as the background.
- Starting the game does **not** load a new scene. It simply retires the menu; the background was the game all along.
- The transition should feel smooth and continuous, in the spirit of Black Myth: Wukong's intro, rather than a hard cut.

**Menu options (current build):**

| Option | Status | Behaviour |
|---|---|---|
| Start Game | Implemented | Retires the menu and begins Earth-side rocket assembly. |
| Start Multiplayer | Stub | Shows "coming soon" for this build. |
| Login | Stub | Shows "coming soon"; guest profile is used locally. |
| Settings | Implemented (basic) | Audio/video/accessibility placeholders. |
| Credits | Implemented | Team, NASA data sources, and AI disclosure links. |

Multiplayer and account login are intentionally **stubs** for this build; the menu keeps space for them and the architecture leaves room for real networking later.

## Core loop

1. **Assemble** — on Earth, choose a launch vehicle, stages, and instruments; balance budget, mass, and thrust.
2. **Launch** — control power and direction through atmospheric ascent, staging, and orbital insertion.
3. **Cruise** — travel to another body using realistic physics, accelerating time when needed.
4. **Approach & land** — enter the body's gravity well and land carefully; a bad landing is fatal.
5. **Explore** — switch between a character-level view and a whole-planet view, discovering what humanity has found there.
6. **Reflect** — optionally answer a per-body quiz, then choose the next destination.

## Rocket assembly (Earth only)

Assembly happens **only on Earth**, before launch. Once the player leaves Earth, the design is locked; later changes are limited to what the mission carried.

The player assembles a rocket from parts:

- **Launch vehicle / stages** — lift capability and propellant.
- **Spacecraft** — the vehicle the astronaut flies and lands in.
- **Scientific instruments** — capability that adds mass, power draw, and cost.
- **Surface equipment** — rover/spacecar, EVA supplies (as content grows).

Assembly exposes live, plain-language readouts:

- **Mass** (dry + propellant) and **thrust-to-weight ratio (TWR)**.
- **Δv budget** versus the Δv needed for the selected destination.
- **Cost** versus the available budget.
- Warnings such as *"TWR below 1 — this rocket cannot lift off"* or *"Not enough propellant to reach orbit."*

Assembly is where the challenge's trade-off idea is most visible: more instruments mean more mass; more mass means less Δv; a bigger vehicle costs more budget. See [`challenge_alignment.md`](challenge_alignment.md).

## Flight controls and progression

Controls are introduced gradually so the game teaches itself. The table below is the intended progression; exact bindings and abilities per stage are refined during implementation.

| Journey | New ability / mechanic | Notes |
|---|---|---|
| Rocket launch | Rotation, throttle/power, staging | The first interaction: control the ascent. |
| Low Earth orbit | Orbital motion, EVA enter/exit | Momentum, free-fall, and leaving the vehicle. |
| Moon | Low-gravity surface traversal | Lighter gravity changes how movement feels. |
| Mars | Surface traversal with heavier gravity | Contrast with the Moon; rover use. |
| Living on Mars | Base interaction / colony systems | _TODO: define exact interactions._ |
| Europa | Swimming | Movement in a subsurface ocean. |
| Enceladus | Jetpack flight / icy-surface movement | _TODO: confirm ability assigned to each branch._ |

**Vehicle controls (flight):**

- **Rotation** — orient the rocket for a gravity turn and for landing burns.
- **Power / throttle** — control thrust and fuel burn.
- **Staging** — discard spent stages to shed mass.
- **Enter / exit** — the astronaut can leave and re-enter the rocket, including in space.

The astronaut is a **playable character**, not just a cockpit camera: EVA, surface walking, swimming, jetpack flight, and rover driving are all first-class movement modes.

## Physics and simulation

Movement is driven by a **full numerical physics simulation**, not scripted animation:

- Bodies have mass, velocity, and gravitational influence.
- Gravity differs by location (Earth, microgravity, Moon, Mars, subsurface ocean, icy moon).
- Player input applies forces; the environment responds consistently.
- Long-distance motion uses the same integrator, so trajectories are physical rather than cinematic.

This keeps the game honest: abilities feel different because the underlying physics is different. The detailed simulation model — integrator, time warp, scale handling, and landing thresholds — is specified in [`flight_model.md`](flight_model.md).

## Time and scale

Space is enormous, and the game does not hide it by shortening the physics. Instead:

- **Travel takes realistic time.** An Earth→Moon transfer is measured in days; Earth→Mars in months; the outer system in years. Timings are drawn from [`transfer_legs.json`](../data/transfer_legs.json).
- **The player accelerates time** with warp factors (planned: ×1, ×10, ×100, ×1,000, ×10,000, ×100,000). Warping changes how many simulation steps run, not the laws of motion.
- **Visual tricks keep the screen alive.** Because most of space is empty, the game changes what it shows while the simulation continues underneath: a local launch view, an orbital view, a compressed system map, and body-centred views. The coordinates are always real; only the presentation changes.
- **A simulation indicator** appears at high warp so the player understands that time, not the game, is passing quickly.

## Landing and failure

Every body has **realistic gravity**, and arriving is not automatic:

- The player must slow down and touch down within safe **velocity and angle limits** for that body.
- A landing that is too fast, too steep, or badly oriented **destroys the vehicle and kills the astronaut**.
- Death is a teaching moment, not a punishment: the game explains *why* the landing failed (for example, "you hit the surface at 180 m/s; a safe landing on the Moon is under about 3 m/s") and offers a respawn.
- Respawn returns the player to a safe checkpoint — typically the last stable orbit or the previous body — without erasing mission progress.

Landing thresholds and the crash model live in [`flight_model.md`](flight_model.md).

## Planet views

On arriving at a planet or moon, the player gets **two complementary views**:

1. **Character-level view** — the astronaut (or rover) on the surface, at human scale. This is where movement, landing, and close-up exploration happen.
2. **Whole-planet view** — the entire body, showing the landing site, regions of interest, and what humanity has discovered. This is where the game shares **far-side discoveries**: places the player has not yet visited are marked with facts about real missions, and reaching them may require flying the rocket or driving a surface vehicle.

Switching between the two views is a core interaction, not a menu. The character view keeps the player grounded; the whole-planet view gives context and curiosity.

## EVA and surface vehicles

- The astronaut can **exit and re-enter the rocket at any point**, including in space. EVA movement uses microgravity physics.
- On a surface, the astronaut can move on foot; a **rover/spacecar** is available where the mission carries one, and helps reach distant regions revealed in the whole-planet view.
- Vehicles obey the same physics as everything else: mass, traction, gravity, and momentum.

## Progression and optional quizzes

- Progression follows **Earth → Low Earth orbit → Moon → Mars → { Living on Mars · Europa · Enceladus }**.
- At every planet or moon there is an **optional quiz icon**. Answering is never required to advance; the quiz reinforces what the player has just seen and explains each answer.
- Quiz content is sourced and cited in [`learning_design.md`](learning_design.md) and [`nasa_data_sources.md`](nasa_data_sources.md).

## Learning through play

Three complementary learning devices:

1. **Movement- and location-triggered science cards** — flying, landing, walking, or swimming through a region reveals cited NASA facts.
2. **Mission-control coaching** — short, plain-language prompts during assembly and flight (TWR, gravity turn, staging, Δv, landing limits).
3. **Optional quizzes** — low-pressure questions that reinforce mission-design and NASA facts, with explanations.

The full teaching approach, lesson sequence, and content plan are in [`learning_design.md`](learning_design.md).

## Mission store and economy

- The player has a **budget** that grows slowly over time.
- Because the budget grows slowly, the player is **encouraged to explore** while saving for better parts.
- The store is the **assembly screen on Earth**: launch vehicles, stages, instruments, spacecraft, and surface equipment.
- Purchases trade off:
  - **Power** vs **mass**
  - **Instruments** vs **budget**
  - **Orbit reach** vs **propellant / launch power**

This economy is the heart of the challenge's "a decision that improves one aspect can create limitations in another" idea.

## Launch mechanics

- The player controls **rotation**, **power/throttle**, and **staging**.
- The **launch vehicle** chosen during assembly determines performance.
- Ascent includes atmospheric drag and a gravity-turn lesson; outcomes feed directly into the trajectory toward the next destination.

Mission dimensions such as **communications** and **mission lifetime** are intentionally out of scope for the current build (see [`challenge_alignment.md`](challenge_alignment.md)).

## Art direction

**Simple yet decent** — a clean, readable style that stays performant and readable in motion:

- Painterly, atmospheric environments in the spirit of GRIS.
- Clear silhouettes so physics-driven movement reads well.
- A consistent palette across journey stages.
- The live menu shares the same visual language as the game so the intro feels continuous.
- Initial build uses **procedural p5/canvas visuals** (gradients, parallax starfields, silhouettes). Generated art is swapped in later without rearchitecting.
- Assets produced with Nano Banana 2.1, Krita, and Figma / Lovable. See [`ai_usage_disclosure.md`](ai_usage_disclosure.md).

## Music and sound

- **Melodic soundtrack** that carries the emotional tone of each journey.
- Audio produced with Suno. See [`ai_usage_disclosure.md`](ai_usage_disclosure.md).
- Sound supports the "calm exploration" feel and signals ability changes.

## Design principles

- **Teach by doing** — controls and concepts appear when they are needed.
- **Physics over spectacle** — behaviour is emergent and consistent.
- **The menu is the game** — no cut between menu and play.
- **Calm, melodic, readable** — approachable for a wide audience.
- **Every choice has a cost** — budget and mass force real trade-offs.
- **Failure teaches** — crashes explain themselves and never trap the player.
- **Responsive** — UI and layout work across desktop and mobile.

## Scope and future work

Implemented in the current build:

- Live menu, Earth-only assembly with budget trade-offs, launch and ascent, orbital insertion, low Earth orbit with time warp, and EVA enter/exit.

Next up:

- Interplanetary cruise, planet approach and landing, two planet views, and optional quizzes.

Stubbed or deferred:

- **Multiplayer** — menu entry present, networking not implemented.
- **Login** — menu entry present, guest profile only.
- **Communications** and **mission lifetime** — mission dimensions intentionally NIL.
- Full content for **Living on Mars**, **Europa**, and **Enceladus** grows after the core spine.
