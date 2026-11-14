# AI Usage Disclosure — NASA Explorer

The challenge asks teams to disclose how AI was used for images, audio, code, and data. This document records that usage.

## Summary

| Category | Tools used | Human review |
|---|---|---|
| Images / visual art | Nano Banana 2.1, Krita, Figma / Lovable | Reviewed and edited by the team |
| Audio / music | Suno | Curated and arranged by the team |
| Code | OpenCode, Kilocode, Claude Code | Reviewed, tested, and approved via PR |
| Data | NASA and partner sources | Verified and cited (see [`nasa_data_sources.md`](nasa_data_sources.md)) |

## Images

- **Nano Banana 2.1** — generated concept art and visual assets.
- **Krita** — hand-editing, painting, and cleanup of assets.
- **Figma / Lovable** — layout and UI/asset composition.
- **Watermark:** _TODO — state whether generated images carry a watermark and where it appears (and confirm compliance with the challenge's AI image rules)._

## Audio

- **Suno** — generated melodic music and sound.
- _TODO — list the tracks used, their role (menu, journey, transitions), and confirm licensing/attribution requirements are met._

## Code

- **OpenCode, Kilocode, Claude Code** — AI coding assistants used to scaffold, refactor, and document the project.
- All AI-assisted code is reviewed, tested, and merged through pull requests with CI gates (lint, format, typecheck, security).
- Project rules for each assistant live in `.opencode/`, `.kilo/`, and `.claude/`.

## Data

- **NASA data** (NSSDCA fact sheets, JPL Horizons, NASA Image & Video Library, APOD) powers physics constants, journey timing, imagery, and quiz content. No NASA-partner datasets are currently used.
- AI assisted in curating, formatting, and documenting the data snapshots; values are checked against the cited NASA sources.
- Sources and attribution are tracked in [`nasa_data_sources.md`](nasa_data_sources.md).

## Human oversight

- Generated assets are selected and refined by humans, not used unedited.
- Code changes require review and green CI before merge.
- NASA facts are checked against cited sources before shipping.

> _TODO: confirm the exact disclosure format required by the submission form and mirror it here._
