# Learning Design — NASA Explorer

> How the game teaches mission design to players who may know little about spaceflight.

## Design intent

NASA Explorer is **educational by default**. The player should finish a journey able to explain, in plain language, why a mission is hard: why rockets are mostly fuel, why orbits are falling, why the Moon landing was a powered descent, and why every instrument costs mass and money.

The teaching is **just-in-time**: a concept appears when the player is about to use it, not in a front-loaded tutorial. The guiding voice is a calm **mission-control coach** — short prompts, no jargon without a plain-language gloss, and never a wall of text.

## Principles

- **Teach by doing.** The player manipulates a value and sees the physical consequence.
- **Plain language first.** Define a term the first time it appears, then use it.
- **One idea at a time.** Each prompt carries a single concept.
- **Cite everything.** Every science card and quiz answer links to a NASA source in [`nasa_data_sources.md`](nasa_data_sources.md).
- **Failure is feedback.** A crash explains what went wrong with the player's own numbers.
- **Optional, not mandatory.** Quizzes and deep-dive cards are opt-in; the journey never blocks on a test.
- **Respect the audience.** No condescension; the goal is real intuition, not trivia.

## The three teaching layers

### 1. Mission-control coaching (during play)

Short, contextual prompts delivered at the moment of use.

| Moment | Concept | Example prompt |
|---|---|---|
| Assembly — choosing parts | Mass vs thrust | "More instruments add mass. More mass means less Δv from the same rocket." |
| Assembly — TWR readout | Thrust-to-weight ratio | "TWR below 1 means gravity wins. Add thrust or remove mass." |
| Launch — liftoff | TWR and acceleration | "You are climbing because thrust is now greater than your weight." |
| Launch — 10 km | Gravity turn | "Pitch over gradually. Tilting lets you build sideways speed without fighting the air." |
| Launch — fuel low | Staging | "Spent stages are dead weight. Drop them to accelerate more easily." |
| Orbit — circularising | Orbital insertion | "You are falling around Earth, not away from it. Speed sideways to raise the far side of your orbit." |
| Cruise | Scale and time | "The distance is real; the clock is accelerated. Your trajectory is still being simulated." |
| Approach | Gravity well | "The body's gravity is pulling you in. Arrive too fast and you will not be able to slow down in time." |
| Landing | Safe touchdown | "Safe landing on the Moon is under about 3 m/s. You are at 40 m/s." |
| Crash | Cause and remedy | "You hit at 180 m/s. A powered descent burn would have shed that speed before contact." |

### 2. Science cards (discovery)

Cards triggered by location and movement: launching, crossing a region, landing, EVA, swimming, arriving at the far side of a body, or opening the whole-planet view.

Each card contains:

- A **headline** (one sentence).
- A **short explanation** (2–4 sentences, plain language).
- A **NASA source link** and credit.
- Optionally a **"try this"** hook tying the fact to an action.

Planned topics (grows with content):

- **Earth / launch:** how rockets reach orbit; why most of a rocket is propellant.
- **Low Earth orbit:** free-fall, microgravity, why astronauts float.
- **Moon:** one-sixth gravity, Apollo powered descent, why the far side looks different.
- **Mars:** thin atmosphere, Phobos and Deimos, why transfers take months, rovers.
- **Europa:** subsurface ocean, ice shell, Europa Clipper.
- **Enceladus:** plumes, ocean world, Cassini's fly-throughs.
- **Living on Mars:** life support, radiation, in-situ resources.

### 3. Optional quizzes (reflection)

An **optional quiz icon** appears at every planet or moon. Quizzes:

- Never block progress.
- Draw from the committed bank in [`quizzes.json`](../data/quizzes.json).
- Show an explanation after each answer, plus a source link.
- Reinforce the specific mechanics the player just used at that body.

Existing quiz coverage: Mars (moons, transfer time), Moon (gravity), Low Earth orbit (what keeps a craft in orbit), Europa (ocean), Enceladus (plumes). Coverage is expected to grow to match the science cards.

## Lesson sequence by stage

| Stage | Lesson goal | Key ideas |
|---|---|---|
| Assembly | Mission design is trade-offs | Mass, thrust, Δv, cost, budget |
| Launch | Getting to orbit is about speed, not height | TWR, gravity turn, staging, drag |
| Low Earth orbit | Orbits are controlled falling | Free-fall, sideways velocity, insertion |
| Moon | Landing is a controlled deceleration | Low gravity, descent burn, touchdown limits |
| Mars | Distance and conditions shape the mission | Transfer time, thin atmosphere, rovers |
| Europa | Ocean worlds may be habitable | Ice shell, subsurface ocean, habitability |
| Enceladus | Small worlds can be scientifically huge | Plumes, ocean worlds, Cassini |
| Living on Mars | Humans need systems, not just a rocket | Life support, radiation, resources |

## Difficulty and pacing

- **New players:** coaching prompts are on by default; the first launch is guided step by step; quizzes are skippable.
- **Experienced players:** prompts collapse into a compact checklist; quizzes remain optional; advanced numbers (Δv, apoapsis/periapsis, fuel fractions) are always available in a details panel.
- **No fail-gating:** a crash teaches and respawns; it does not erase progress or require a quiz.
- **Reduced cognitive load:** one prompt at a time; dismissible; no timed decisions outside of active flight.

## Accessibility

- Text alternatives for all prompts; captions for any narration.
- Reduced-motion option that simplifies camera transitions and warp effects.
- Keyboard-remappable controls and touch controls on mobile.
- Readable type and contrast on both desktop and mobile.
- Color is never the only signal (safe/unsafe landing cues use text and shape too).

## Content and citation policy

- Every scientific claim in a card or quiz must have a NASA source URL.
- Sources are recorded in [`nasa_data_sources.md`](nasa_data_sources.md) and on the card itself.
- Gameplay tuning values (mass, cost, thrust) are labelled as gameplay values, not NASA specifications.
- AI-assisted content is reviewed and cited; see [`ai_usage_disclosure.md`](ai_usage_disclosure.md).

## Success criteria

A player who finishes the core spine should be able to:

- Explain why a rocket needs a high thrust-to-weight ratio.
- Explain why most of a rocket is propellant and why staging helps.
- Describe an orbit as continuous free-fall rather than "no gravity".
- Explain why landing requires slowing down to a safe speed.
- Give one reason each for studying the Moon, Mars, Europa, and Enceladus.
- Point to the NASA sources for the facts they encountered.

## Open questions / TODO

- Final voice/tone guide and whether prompts are text-only or voiced.
- Exact science-card wording and source links per body (fill the `_TODO_` entries in [`journey_map.md`](journey_map.md)).
- Quiz difficulty curve and whether to add per-stage question sets.
- Localisation plan (English first).
