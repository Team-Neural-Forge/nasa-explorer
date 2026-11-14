# Flight Model — NASA Explorer

> Specification for the physics simulation, time warp, scale presentation, and landing/failure model. The committed NASA constants in [`bodies.json`](../data/bodies.json) and leg references in [`transfer_legs.json`](../data/transfer_legs.json) are the source of truth.

## Design intent

The long-term goal is a full numerical simulation. The current build uses separate approximations for launch, orbit, guided cruise and lunar landing; these are not yet a single continuous physical trajectory. Time acceleration and changes of visual scale make long journeys playable.

Two requirements run in tension:

1. **Fidelity** — positions and travel times should be recognisably real.
2. **Playability** — a month-long transfer must not take a month of wall-clock time.

The model below resolves that tension: adaptive integration plus step-budgeted time warp.

## Units and frames

- **Internal units:** SI (metres, seconds, kilograms, newtons). NASA constants are converted on load.
  - `gm_km3_s2` → `GM` in m³/s² (× `1e9`).
  - `radius_km`, `semi_major_axis_km`, `distance_km` → metres (× `1e3`).
- **World frame:** heliocentric inertial frame; bodies are placed from their orbital elements/leg references and propagated by the same integrator.
- **Local frames:** each body has a body-centred inertial frame for approach and surface operations (e.g. launch, landing, EVA). Switching frames does not change the physics, only the reference point used for rendering and control.

### Navigation display in the current build

The clock starts from the player's system time when a mission starts or restarts. It advances with gameplay: Earth and lunar descent at ×1, launch at the existing ×4 simulation rate, and orbit and cruise at their selected warp rate. During the guided cruise the clock advances only by the transfer time actually simulated, and returns to ×1 after arrival. It is paused on the main menu and when the browser/game loop is not running; it is not a persistent real-time clock.

The navigation guide calculates geometric Solar System barycentric body centers in the J2000 mean equator (EQJ) frame using the offline [Astronomy Engine](https://github.com/cosinekitty/astronomy) model. EQJ is approximately aligned with ICRF, not identical. Compare with [NASA/JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) when precision is important. The model is an approximation, not a live NASA feed; accuracy outside the tested dates is not guaranteed.

The surface, launch, orbit and lunar descent simulations do not specify their local axes or landing sites in EQJ. The displayed spacecraft Solar System position therefore uses the Earth or Moon center as a clearly marked proxy. During guided cruise, a clearly marked estimate interpolates between those moving body centers; it is not the simulated spacecraft trajectory. Europa and Enceladus positions are not available yet. Local launch, orbital and lunar position information is displayed separately.

The navigation panel's restart control returns the player to a fresh Earth scene and starter selection and resets the clock to the current system time. Budget and purchases are not implemented yet.

## Gravity model

Acceleration on a point mass is the vector sum of the gravitational pull of every active body:

```
a(r) = Σ_i  GM_i * (r_i - r) / |r_i - r|³
```

- `GM_i` comes from `bodies.json` (`gm_km3_s2`).
- Bodies included: Earth, Moon, Mars, Europa, Enceladus, plus the Sun and remaining planets as background sources once their data is added.
- Near a body, the local term dominates automatically; no ad-hoc "gravity switch" is required. A **sphere of influence (SOI)** may still be used to choose the *presentation* frame and to relax step size, but the force sum always includes the other bodies.

Surface gravity (`gravity_m_s2`) is used for **surface gameplay** (walking, rovers, jumps) and for validating landing thresholds, because integrating at planetary-surface resolution is wasteful in a heliocentric simulation.

## Integrator

**Symplectic velocity Verlet** with an adaptive step:

```
v_half = v + a(x) * dt/2
x_new  = x + v_half * dt
a_new  = a(x_new)
v_new  = v_half + a_new * dt/2
```

- **Why symplectic:** bounded energy error over long orbital integrations; stable for orbit after orbit.
- **Adaptive step:** `dt` is chosen from the local dynamical time `t_dyn ≈ sqrt(r³ / GM_local)` and clamped to a per-context range:
  - Surface / landing: small steps (high accuracy, short distance).
  - Orbital: medium steps.
  - Deep cruise far from a body: larger steps, since acceleration is smooth and small.
- **Step budget:** the loop never integrates more than a fixed number of steps per rendered frame. If the requested warp cannot complete within the budget, it finishes over multiple frames (and the HUD shows a **simulating…** indicator).

## Time warp

Time warp multiplies the **number of simulated steps**, not the step size:

| Warp | Use |
|---|---|
| ×1 | Launch, landing, EVA — real time |
| ×10 | Orbital manoeuvres |
| ×100 | Nearby transfers |
| ×1,000 | Earth→Moon cruise |
| ×10,000 | Inner-system cruise |
| ×100,000 | Earth→Mars / outer-system cruise |

Rules:

- Warp is available during cruise and suspended automatically when a critical event is near (atmosphere entry, SOI transition, landing burn window). The game may also drop warp if the step budget is exceeded.
- Warp changes perceived time only; forces, trajectories, and fuel burn per simulated second are unchanged.
- **Realistic durations** come from `transfer_legs.json`:

| Leg | Distance | Approx. travel time |
|---|---|---|
| Earth → Moon | 384,400 km | ~3 days |
| Earth → Mars | 225,000,000 km | ~259 days |
| Mars → Europa | ~550,600,000 km | ~1,127 days |
| Mars → Enceladus | ~1,205,600,000 km | ~2,390 days |

These are reference targets for the integrator; the actual simulated duration depends on the player's trajectory and launch window.

### Current implementation note

The first cruise build advances along the real Earth→Moon leg (`384,400 km`, `~3 days`) at the average speed implied by its transfer time, with time warp from ×1 to ×100,000. This is a **guided transfer**, not yet a patched-conic integration. The next refinement integrates the cruise under Earth and Moon gravity.

## Performance

- The integrator should run in a **Web Worker** when warp is high, posting position snapshots to the render thread. The render loop interpolates between snapshots.
- Per-frame step budgets keep the UI responsive; warp is best-effort, not guaranteed.
- Rendering never blocks on the full step count: the world draws the latest state and continues.
- At extreme warp, the render may show a compressed "system map" rather than every body at true screen distance.

## Scale and view tricks

Space is mostly empty, so the game changes **what it shows** while keeping coordinates real:

| View | When | What it shows |
|---|---|---|
| Launch / local | Surface and ascent | Earth, launch site, sky gradient, rocket at human scale |
| Surface | Landed | Astronaut/rover at human scale, terrain silhouette |
| Orbital | In orbit around a body | The body filling part of the screen, stars, vehicle |
| Cruise | Between bodies | Vehicle, starfield, distant target marker |
| System map | High warp / navigation | Compressed positions, orbit arcs, distance/time labels |
| Whole-planet | On arrival | Entire body, landing site, far-side discoveries |

The transition between views is a **camera/frame change**, not a teleport. Compressed views use nonlinear scaling for display only; physics keeps SI coordinates.

The post-start game is a single persistent sandbox. Phase changes crossfade inside the same canvas; the same rocket geometry is drawn on the pad and during ascent. The Earth scene publishes a store direction and distance for the HUD arrow.

## Rocket flight model

- **Thrust:** `F = throttle * thrust_max(stage)`; fuel burns at `mdot = F / (Isp * g0)`.
- **Mass:** `m = dry_mass + remaining_propellant + payload`; acceleration follows `a = F/m + gravity + drag`.
- **Staging:** discarding a stage removes its dry mass and stops its thrust; the next stage ignites. The current build models a single stage, so the stage control is a placeholder until multi-stage vehicles arrive.
- **Atmosphere:** exponential density model; drag `F_d = 0.5 * ρ * v² * Cd * A`, acting opposite the velocity vector. Density falls with altitude, so the gravity turn becomes efficient above the thick lower atmosphere.
- **Gravity turn:** the HUD coaches the player to pitch over gradually; rotating too early wastes Δv to drag, too late wastes it fighting gravity. The guidance line leads the velocity vector so following it produces a working gravity turn.
- **Orbital insertion:** the vehicle must reach roughly 100 km with orbital velocity and a mostly horizontal trajectory. For playability, a **circularization assist** then finishes the insertion so the player gets a stable, readable orbit; the HUD still shows altitude, apoapsis, periapsis, and speed so the result is explainable.

Gameplay-only part values (thrust, Isp, dry mass, propellant, cost) live in `gameplay_tuning.json` and are clearly marked as tuning, not NASA specifications.

## Landing and failure

Landing is evaluated against per-body thresholds:

- **Vertical speed** at contact must be below the body's safe limit.
- **Horizontal speed** and **tilt** must be within tolerance.
- **Landing site** must be valid (not a cliff/water unless the vehicle supports it).

On failure:

1. The vehicle is destroyed and the astronaut dies.
2. The game shows a short cause-of-failure card with the actual numbers and the safe limit for that body.
3. The player respawns at a safe checkpoint (last stable orbit or previous body); mission progress and budget are not lost.

Illustrative safe-descent limits (tuned during implementation):

| Body | Gravity (m/s²) | Approx. safe touchdown |
|---|---|---|
| Moon | 1.62 | ≤ 3 m/s |
| Mars | 3.71 | ≤ 3 m/s (with parachute/retro assist) |
| Europa | 1.315 | ≤ 2 m/s |
| Enceladus | 0.113 | ≤ 1 m/s |

### Current implementation note (lunar descent)

The lunar descent build starts `2 km` above the surface with a small horizontal drift. Safe touchdown requires vertical ≤ `3 m/s`, horizontal ≤ `1.5 m/s`, and tilt ≤ `15°`. An optional **auto-land** assist flies the same physics for players who want to watch a nominal descent; manual control uses throttle and pitch.

## EVA and surface vehicles

- **EVA:** the astronaut is a rigid body with a small thrust/impulse budget; movement follows microgravity physics near the vehicle. Re-entry into the vehicle requires proximity and low relative velocity.
- **On foot / rover:** movement is governed by local `gravity_m_s2`, surface friction/traction, and slope. A rover carries its own mass and fuel, so range is finite.
- **Earth launch site (current build):** a meter-scale kinematic controller applies 9.81 m/s² gravity, 3 m/s walking, and a 60 kg mass-derived jump impulse for an approximately 0.8 m apex. Invisible walls at ±200 m stop the astronaut; the ground visual continues to ±1,200 m so its end is never visible.
- **Transitions:** entering/exiting a vehicle is a state change that preserves position and velocity relative to the parent frame.

## Numerical validation

- Compare simulated Earth→Moon and Earth→Mars durations against `transfer_legs.json` within an agreed tolerance (target: ±10% for a nominal trajectory).
- Energy drift check over many orbits (symplectic sanity).
- Regression tests for the integrator, gravity sum, rocket mass/staging math, and landing thresholds.
- Warp stress test: ×100,000 must remain responsive under the per-frame step budget.

## Open questions / TODO

- Final choice of background bodies (Sun + all planets vs relevant subset).
- Exact step ranges per context after profiling on low-end devices.
- Whether to expose a "trajectory planner" hint during cruise.
- Tuning of atmosphere density, drag coefficients, and launch-window phasing for fun.
- Multiplayer determinism requirements (deferred; single-player now).
