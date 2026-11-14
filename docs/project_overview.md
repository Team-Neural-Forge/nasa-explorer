# Project Overview — NASA Explorer

## Project

- **Name:** NASA Explorer
- **Tagline:** The Inquisitive Explorer of NASA
- **Challenge:** [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/2026/) — Space Mission Design Game
- **Genre:** Interactive, physics-based space exploration game
- **Platform:** Web (React + TypeScript)

## Summary

NASA Explorer is an interactive, physics-based space exploration game built for the NASA Space Apps Challenge 2026 "Space Mission Design Game" challenge. Players step into the role of a NASA astronaut and journey from an Earth launch pad through low Earth orbit, the Moon, and Mars, branching onward to Europa, Enceladus, and a colony on Mars. Along the way the game quietly introduces new movement abilities — jetpack flight, swimming, and more — while environmental interactions surface real NASA science. A mission-store menu lets players spend a slowly growing budget on scientific instruments, spacecraft upgrades, and launch vehicles, so every purchase reflects the trade-offs between power, mass, orbit, and budget that real mission designers face. With melodic music, physics-driven environments, and a light quiz between journeys, NASA Explorer makes mission design feel like an adventure.

## What does it do and how does it work?

The game turns **mission design** into a playable journey:

1. The player controls a NASA astronaut and spacecraft across a series of destinations: **Rocket launch → Low Earth orbit → Moon → Mars → { Europa · Living on Mars · Enceladus }**.
2. Movement is **physics-based**. Gravity, mass, collisions, and forces change per environment, so moving on the Moon feels different from moving on Mars or swimming on Europa.
3. A **mission store** offers scientific instruments, spacecraft upgrades, and launch vehicles. The player's **budget grows slowly**, encouraging exploration while saving for purchases.
4. **Player movement triggers environmental information**, so NASA facts are discovered in context rather than delivered as a wall of text.
5. A short **quiz between journeys** reinforces learning.
6. **Launch mechanics** let the player tune launch power and direction and choose a launch vehicle, tying gameplay directly to real mission constraints.

The result is a game where the player *feels* the trade-offs of mission design: spending on instruments, saving mass, reaching orbit, and staying within budget.

## What benefits does it have?

- **Makes mission design tangible.** Abstract ideas (power, mass, orbit, budget) become choices the player makes and consequences they feel.
- **Teaches through play.** Physics-based movement gives intuitive, durable understanding.
- **Accessible and calm.** Melodic music, readable art, and gradual controls welcome non-experts.
- **Encourages curiosity.** Environmental information and quizzes reward exploration.
- **Extensible.** New stages, instruments, and facts can be added without redesigning the core loop.

## What is the intended impact?

- **Inspire** a broader audience — especially young players — to engage with space exploration and NASA science.
- **Build intuition** for the real constraints of mission design, so players understand why space missions are hard.
- **Showcase NASA data and history** in a form that is memorable and enjoyable.
- **Model a friendly, curious astronaut** who learns by exploring — the "inquisitive explorer" of the title.

## How is the project creative?

- **Physics as storytelling.** Movement abilities are revealed by changing environments rather than tutorials.
- **Mission store as a teaching tool.** Budget pressure turns shopping into mission planning.
- **Art and sound as atmosphere.** A GRIS-inspired, music-led presentation makes space feel contemplative rather than frantic.
- **Learning by moving.** Facts are triggered by the player's own exploration, not front-loaded lore.
- **A playful framing of a serious challenge.** The challenge asks for mission design; the game answers with an adventure.

## What factors did our team consider?

- **Physics fidelity vs. fun.** Enough realism to teach, enough tuning to keep movement satisfying.
- **Onboarding.** Introducing controls gradually so new players are never overwhelmed.
- **Scope vs. the weekend.** Prioritising the launch → Moon → Mars → branch spine, with content that can grow.
- **Accessibility.** Readable art, calm pacing, and responsive UI across devices.
- **Learning design.** Balancing environmental info, quizzes, and store explanations so learning is spread out, not repetitive.
- **Mission dimensions.** Mapping the challenge's dimensions (spacecraft, instruments, launch vehicle, orbit, power, mass, budget) to game systems; communications and mission lifetime are intentionally out of scope for this build.

## Future implementation

- Complete all journey branches (**Europa**, **Living on Mars**, **Enceladus**) with distinct mechanics.
- Deepen the **mission store** with more instruments, vehicles, and meaningful trade-offs.
- Add **communications** and **mission lifetime** as mission dimensions.
- Expand **NASA data** coverage and tie each fact to a cited source.
- Add progression, replayability, and accessibility options (remapping, reduced motion).
- Polish audio, art, and performance across devices.

## Links

| Item | Link |
|---|---|
| Play the game (Vercel) | _TODO_ |
| Backend API (Render) | _TODO_ |
| Source code | https://github.com/Team-Neural-Forge/space-explorer-cheat |
