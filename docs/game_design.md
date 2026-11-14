# Game Design — NASA Explorer

> The Inquisitive Explorer of NASA: a physics-based adventure that teaches mission design by letting players live it.

## Concept

NASA Explorer is a single-player, physics-based exploration game. The player is a NASA astronaut travelling from Earth into the solar system, learning new ways to move and new facts about space as the journey unfolds. Between journeys, a light quiz reinforces what the player has seen, and a mission store turns exploration into mission design: spend a slowly growing budget on instruments, spacecraft upgrades, and launch vehicles.

The design goal is to make the **trade-offs of real mission design** feel intuitive — a decision that improves one aspect of a mission can create limitations in another.

## Inspirations

- **GRIS** — wordless, music-driven storytelling and a calm, painterly art direction.
- **herCode Space** — playful, accessible space exploration for a broad audience.

## Player role

The player is a **NASA astronaut**. The astronaut moves through hand-crafted environments, triggering information, collecting discoveries, and gradually unlocking abilities that mirror real spaceflight challenges (launch, microgravity, jetpack manoeuvring, surface traversal, swimming in subsurface oceans).

## Core loop

1. **Travel** through a journey stage using physics-based movement.
2. **Discover** — moving through the environment reveals NASA facts and mission information.
3. **Spend** — use the budget in the mission store for instruments, upgrades, and vehicles.
4. **Launch** — tune launch power and direction, then fly the spacecraft toward the next destination.
5. **Reflect** — answer a short quiz between journeys, then continue.

## Controls and progression

Controls are **introduced gradually from journey to journey**, so the game teaches itself without a heavy tutorial.

| Journey | New ability / mechanic | Notes |
|---|---|---|
| Rocket launch | Launch power, direction | The first interaction: control the ascent. |
| Low Earth orbit | Basic drifting / microgravity movement | Movement in a low-gravity environment. |
| Moon | Jumping / low-gravity surface traversal | Lighter gravity changes how movement feels. |
| Mars | Surface traversal with heavier gravity | Contrast with the Moon. |
| Living on Mars | Base interaction / colony systems | _TODO: define exact interactions._ |
| Europa | Swimming | Movement in a subsurface ocean. |
| Enceladus | Jetpack flight / icy-surface movement | _TODO: confirm ability assigned to each branch._ |

> The control list above is the intended progression; exact bindings and abilities per stage are refined during implementation.

## Physics-based movement

Movement is driven by a real physics engine (`matter.js`), not scripted animation:

- Bodies have mass, velocity, and collisions.
- Gravity differs by location (Earth launch, microgravity, Moon, Mars, subsurface ocean).
- Player input applies forces; the environment responds consistently.

This keeps the game honest: abilities feel different because the underlying physics is different.

## Physics-based environment

The world reacts to the player through physics rather than pre-baked cutscenes:

- Collisions, floats, and drags behave predictably.
- Environmental objects respond to the player's movement.
- Passing through regions triggers **environmental information** tied to real NASA science.

## Art direction

**Simple yet decent** — a clean, readable style that stays performant and readable in motion:

- Painterly, atmospheric environments in the spirit of GRIS.
- Clear silhouettes so physics-driven movement reads well.
- Consistent palette across journey stages.
- Assets produced with Nano Banana 2.1, Krita, and Figma / Lovable. See [`ai_usage_disclosure.md`](ai_usage_disclosure.md).

## Music and sound

- **Melodic soundtrack** that carries the emotional tone of each journey.
- Audio produced with Suno. See [`ai_usage_disclosure.md`](ai_usage_disclosure.md).
- Sound supports the "calm exploration" feel and signals ability changes.

## Learning through play

Three complementary learning devices:

1. **Movement-triggered environmental info** — walking, flying, or swimming through a region reveals facts.
2. **Quiz between journeys** — short, low-pressure questions that reinforce mission-design and NASA facts.
3. **Mission store** — instruments and upgrades are explained in context, so learning happens through choices.

NASA facts are surfaced throughout (for example, how long NASA has operated and what it has explored). Exact facts and their sources are tracked in [`nasa_data_sources.md`](nasa_data_sources.md).

## Mission store and economy

- The store contains **scientific instruments**, **spacecraft upgrades**, and **launch vehicles**.
- The player has a **budget** that grows slowly over time.
- Because the budget grows slowly, the player is **encouraged to explore** while saving for the next purchase.
- Purchases trade off:
  - **Power** vs **mass**
  - **Instruments** vs **budget**
  - **Orbit reach** vs **propellant / launch power**

This economy is the heart of the challenge's "a decision that improves one aspect can create limitations in another" idea.

## Launch mechanics

- The player controls **launch power** and **direction**.
- The **launch vehicle** is chosen from the store and affects performance.
- Launch outcomes feed into the trajectory toward the next destination.

Mission dimensions such as **communications** and **mission lifetime** are intentionally out of scope for the current build (see [`challenge_alignment.md`](challenge_alignment.md)).

## Design principles

- **Teach by doing** — controls and concepts appear when they are needed.
- **Physics over spectacle** — behaviour is emergent and consistent.
- **Calm, melodic, readable** — approachable for a wide audience.
- **Every choice has a cost** — budget and mass force real trade-offs.
- **Responsive** — UI and layout work across desktop and mobile.
