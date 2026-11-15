# Project Overview — NASA Explorer

## Project

- **Name:** NASA Explorer
- **Tagline:** NASAExplorer
- **Challenge:** [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/2026/) — Space Mission Design Game
- **Genre:** Interactive, physics-based space exploration game
- **Platform:** Web (React + TypeScript)

## Summary

NASA Explorer is an interactive, physics-based space exploration game built for the NASA Space Apps Challenge 2026 "Space Mission Design Game" challenge. The game opens on a live menu — there is no cut between menu and play, because the world behind the menu is already the game. Players assemble a rocket on Earth, balancing mass, thrust, and budget, then launch into a fully simulated solar system. Travel takes realistic time, but players can accelerate it from real time up to ×100,000,000; space stays enormous while the presentation changes scale and the real coordinates are computed underneath. The astronaut can leave and re-enter the rocket, land carefully on other worlds (or crash and learn why), and switch between a character-level view and a whole-planet view that reveals what humanity has discovered on the far side. A slowly growing budget turns assembly into mission design, so every choice reflects the trade-offs between power, mass, reach, and budget. With melodic music, cited NASA science, and optional per-body quizzes, NASA Explorer makes mission design feel like an adventure.

## What does it do and how does it work?

The game turns **mission design** into a playable journey:

1. The player starts from a **live menu** — the world behind it is already running — then **assembles a rocket on Earth**. Assembly is the only place where the design can change, and it balances budget, mass, and thrust.
2. The player **launches**, controlling rotation, power, and staging through atmospheric ascent to orbit.
3. The player travels a series of destinations: **Low Earth orbit → Moon → Mars → { Europa · Living on Mars · Enceladus }**, with **realistic travel times** and **time acceleration** up to ×100,000,000.
4. Movement is **fully physics-simulated**. Gravity, mass, and forces change per body, so moving on the Moon feels different from moving on Mars or swimming on Europa. The astronaut can **exit and re-enter the rocket**, including in space.
5. Arrival is dangerous: the player must **land within safe speed and angle limits** or crash — and the game explains why.
6. Each body offers **two views**: a **character-level view** and a **whole-planet view** that reveals what humanity has discovered on the far side.
7. **Mission-control coaching, science cards, and optional quizzes** surface cited NASA facts in context rather than as a wall of text.

The result is a game where the player *feels* the trade-offs of mission design: spending on instruments, saving mass, reaching orbit, landing safely, and staying within budget.

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
- **Model a friendly, curious astronaut** who learns by exploring — the curious astronaut at the heart of NASAExplorer.

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
- Deepen **Earth-side assembly** with more parts, instruments, and meaningful trade-offs.
- Add **communications** and **mission lifetime** as mission dimensions.
- Implement **multiplayer** and **account login** (present as menu stubs in this build).
- Expand **NASA data** coverage and tie each fact to a cited source.
- Add replayability and deeper accessibility options (remapping, reduced motion).
- Replace procedural visuals with generated art; polish audio and performance across devices.

See [`game_design.md`](game_design.md), [`flight_model.md`](flight_model.md), and [`learning_design.md`](learning_design.md) for the detailed design.

## Links

| Item | Link |
|---|---|
| Play the game (Vercel) | https://nasa-explorer-8s6l.vercel.app |
| Backend API (Render) | https://nasa-explorer-cpd9.onrender.com/health |
| Source code | https://github.com/Team-Neural-Forge/nasa-explorer |
