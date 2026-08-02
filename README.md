# GDD Tool

[![Latest release](https://img.shields.io/github/v/release/ogtknscn/gdd-tool?label=release)](https://github.com/ogtknscn/gdd-tool/releases/latest)
[![Windows release](https://github.com/ogtknscn/gdd-tool/actions/workflows/release.yml/badge.svg)](https://github.com/ogtknscn/gdd-tool/actions/workflows/release.yml)
[![License: unspecified](https://img.shields.io/badge/license-unspecified-lightgrey)](#license)

**GDD Tool** is a local-first Windows desktop application that lets game design teams
organize their ideas as connected, structured GDD objects instead of long, linear
documents.

> [!IMPORTANT]
> GDD Tool is in early development. The current release offers a working
> foundation for project creation, a visual canvas, detailed GDD cards,
> relations, validation, and local file storage. The playable-sandbox and
> advanced-simulation features on the long-term roadmap are not part of the
> product yet.

The application runs fully offline. There is no AI, no OpenAI API, no model
calls, no cloud account, and no API key anywhere in the product.

## Quick links

- [Download the latest release](https://github.com/ogtknscn/gdd-tool/releases/latest)
- [Installation and first use](#installation)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Development setup](#development)
- [Known limitations](#known-limitations)

## Why GDD Tool?

Traditional GDDs tend to become long, linear, and hard to keep up to date as a
project grows. It becomes difficult to see, at a glance, how a single
mechanic affects tasks, UI, levels, and asset requirements.

GDD Tool combines two complementary ways of working:

- A zoomable visual canvas for seeing systems and the relationships between
  them
- A structured detail panel for defining every game design element in depth

This lets a team keep both the game's overall system map and the design
details of any selected element in the same project. The goal is not to be a
general-purpose whiteboard clone; it is to combine free-form thinking space
with GDD-specific data and relationships.

## Current features

### Visual GDD workspace

- Zoom in, zoom out, fit-to-screen, and a minimap-assisted canvas
- Draggable, freely-positioned GDD cards
- Compact, standard, and detailed card views that adapt to zoom level
- Multiple pages, with add, rename, and delete support
- Outline, Inspector, and a Notion-style detail panel
- A local command palette, opened with `Ctrl+K`
- Undo/redo history
- Confirmation, error, and notification dialogs consistent with the app's design

### GDD objects

Six structured object types are supported:

| Object | Typical use |
| --- | --- |
| Mechanic | Rules, player inputs, and feedback |
| Entity | Characters, enemies, resources, and behaviors |
| Level | Goal, flow, pacing, and constraints |
| Quest | Trigger, objective steps, and rewards |
| UI | UI intent, states, and accessibility notes |
| Asset | Resource type, production requirements, and dependencies |

Every card carries a title, a short summary, a status, and tags. The detail
panel additionally holds design intent, target player experience, a detailed
description, test notes, and object-type-specific fields.

Card status is tracked as **Draft**, **In progress**, **Validated**, and
**Archived**.

### Relations

Four relation types can be created between cards:

- Requires
- Affects
- Produces
- Tested by

Relations can be selected from the canvas and removed from the canvas, the
Inspector, or the card detail panel. A selected connection can also be
removed with `Delete` or `Backspace`. Deletion always asks for confirmation
first and can be undone.

### Starting templates

Three starting points are available when creating a new project:

- **Blank workspace:** a free-form start
- **Core loop:** a base player loop with mechanic, reward, and UI connections
- **Quest flow:** quest steps, UI, and reward flow

Templates are currently new-project starting points only; they are not a
module system that can be added onto an already-open page.

### Project validation

The built-in **Validate** tool detects the following kinds of data issues:

- Invalid active page or page references
- Duplicate object IDs or connections
- Orphaned, hidden, or page-mismatched placements
- Connections whose source or target cannot be found
- An object connected to itself
- Invalid connections across pages
- Cycles in `requires` relations

Clicking a validation result navigates the app to the relevant page and card
whenever possible.

## Installation

The only supported prebuilt distribution target is **Windows x64**. Download
the latest release from the **Assets** section of the
[GitHub Releases](https://github.com/ogtknscn/gdd-tool/releases/latest) page.

| File | Use case |
| --- | --- |
| `GDD-Tool-<version>-x64-setup.exe` | Standard Windows installer; recommended for most users |
| `GDD-Tool-portable.exe` | Runs directly, no installation required |

### Installer build

1. Open the latest release page.
2. Download `GDD-Tool-<version>-x64-setup.exe`.
3. Run the installer.
4. Complete setup and launch GDD Tool from the Start menu.

### Portable build

1. Download `GDD-Tool-portable.exe`.
2. Move it to a folder you have write access to.
3. Run the file directly.

The portable build does not perform a traditional Windows install. Projects
are saved to standalone `.gdd.json` files independent of the application;
recovery data is still kept in the Windows application-data directory.

### Windows SmartScreen warning

Because current packages are not signed with a commercial code-signing
certificate, Windows SmartScreen may show the app as an unrecognized
publisher on first run. This warning means Windows could not verify a
publisher signature, or the file does not yet have enough reputation - it is
not, by itself, evidence of a problem.

Only download the file from this repository's official GitHub Releases page.
If you trust the source, you can proceed after checking the file name under
**More info**. Do not run copies obtained from a source you do not trust.

## First use

1. Open the application.
2. Choose the **Blank workspace**, **Core loop**, or **Quest flow** template.
3. Add a GDD object from the left creation bar.
4. Drag the card to the desired position on the canvas.
5. Select a card for quick actions, or double-click it to open the detail panel.
6. Fill in status, tags, design intent, player experience, and type-specific fields.
7. Choose a connection type and link cards together.
8. Create new pages with `+` as needed; double-click a page name to rename it.
9. Review project issues with **Validate** in the top bar.
10. Use **Save** or **Save As** to write the project to a `.gdd.json` file.

When creating a new project or opening another file with unsaved changes, the
app offers **Save**, **Continue without saving**, and **Cancel**.

## Project files and data safety

### The `.gdd.json` format

GDD Tool projects are stored as human-readable JSON snapshots. The current
schema version is V3. The core data model keeps the following sections
separate:

| Field | Contents |
| --- | --- |
| `pages` | Project pages |
| `objects` | Structured GDD objects |
| `placements` | Object positions per page and canvas coordinates |
| `relations` | Typed connections between objects |
| `activePageId` | Last active page |
| `schemaVersion` | File format version |

Because content and canvas position are stored separately, a card's design
information and its visual placement are independent in the data model.

### Atomic save

The desktop app does not write the project over the target file piece by
piece. It first creates a temporary JSON file in the same location, then
replaces the target file with it using Windows' replace/write-through
behavior. This reduces the risk of a half-written file during a save, though
backing up important projects separately is still recommended.

### Local recovery snapshot

The app keeps a recovery snapshot separate from the project file the user
explicitly saved. Shortly after a project changes, this data is written to
`autosave.gdd.json` in the Windows application-data directory.

When the app is reopened, the existing recovery snapshot is loaded and marked
as an unsaved change. This recovery record does not replace the normal
**Save** action or the `.gdd.json` file the user chose.

In the browser-based development environment, `localStorage` is used only as
a development and test fallback. The packaged desktop app performs all file
operations through Tauri/Rust commands.

### Legacy project files

V1 and V2 project files are upgraded to the V3 format in memory when opened:

- V1 content is moved into a single **Overview** page.
- V2 objects receive safe defaults for the status, tags, and detail fields
  introduced in V3.
- Existing objects, placements, relations, and core properties are preserved.

An upgraded project is written back as V3 the next time it is saved. Before
opening an older, important project for the first time, making a copy of the
file first is good practice.

### Privacy boundary

- Project content is stored in local files only.
- There is no AI or remote model call in the product.
- There is no cloud account and no mandatory sign-in.
- There is no automatic cloud backup or real-time team sync.
- Project files are not encrypted; protect sensitive content with normal
  local file security practices.

Sharing a `.gdd.json` file with a teammate means sharing the project content
itself.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+N` | New project |
| `Ctrl+O` | Open project |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save as |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` or `Ctrl+Y` | Redo |
| `Ctrl+K` | Open the command palette |
| `?` | Open in-app shortcut help |
| Arrow keys | Move the selected card |
| `Delete` / `Backspace` | Delete the selected connection (with confirmation) |
| `Esc` | Close the active dialog, palette, or detail panel |

Text input fields are guarded separately so global shortcuts and connection
deletion do not fire unintentionally while typing.

## Development

### Tech stack

- **React 19 + TypeScript + Vite:** UI and production build
- **React Flow / XYFlow:** canvas, cards, and relations
- **Zustand:** project, UI, and feedback state
- **Zod:** data validation and schema migrations
- **Tauri 2 + Rust:** desktop shell, file pickers, and atomic save
- **Vitest:** automated frontend and domain tests

### Prerequisites

To develop on Windows you need:

- Git
- Node.js 22 and npm
- A stable Rust MSVC toolchain and Cargo
- The **Desktop development with C++** workload from Microsoft C++ Build Tools
- Microsoft Edge WebView2 Runtime

Node.js 22 is the version used in the automated release pipeline and the
recommended version for this project. See Tauri's
[official prerequisites documentation](https://v2.tauri.app/start/prerequisites/)
for its current system requirements.

### Preparing the repository

```powershell
git clone https://github.com/ogtknscn/gdd-tool.git
cd gdd-tool
npm ci
```

`npm ci` installs a reproducible set of dependencies using the versions
pinned in `package-lock.json`.

### Development modes

To run only the web UI:

```powershell
npm run dev
```

To run the full Tauri desktop app in development mode:

```powershell
npm run tauri dev
```

Web development mode does not fully represent desktop behaviors such as
opening and saving files. Use Tauri mode to validate filesystem flows.

### Testing and building

```powershell
# Frontend/domain tests
npm test

# Tests in watch mode
npm run test:watch

# TypeScript check and production frontend build
npm run build

# Windows app and NSIS installer package
npm run tauri build
```

Rust checks:

```powershell
cd src-tauri
cargo fmt --check
cargo check
cargo test
cd ..
```

Tauri build output lands under `src-tauri/target/release/`. The `target/`,
`dist/`, and local `artifacts/` folders are not tracked by Git. Always point
end users to the official [GitHub Releases](https://github.com/ogtknscn/gdd-tool/releases/latest)
page rather than to local build output.

### Quality checks

Before sharing a change, at least the following checks are expected to pass:

```powershell
npm ci
npm test
npm run build

cd src-tauri
cargo fmt --check
cargo check
cargo test
cd ..
```

For changes affecting the Windows distribution, also run
`npm run tauri build`. The test suite covers the project store, data
migration, save, validation, templates, the command palette, title editing,
the dialog system, card drag reconciliation, and relation-deletion behavior.
A regression check also prevents raw `window.alert`, `window.confirm`, and
`window.prompt` calls from being reintroduced.

## Architecture

```text
gdd-tool/
├─ .codex/                  Codex development agent definitions
├─ .github/workflows/       GitHub Actions release workflows
├─ docs/                    Research and development documentation
├─ examples/                Example development requests
├─ src/
│  ├─ commands/             Application and relation commands
│  ├─ components/           React UI components
│  ├─ domain/               Schema, data migration, validation, and templates
│  └─ stores/               Project, UI, and feedback state
├─ src-tauri/
│  ├─ src/                  Rust file and application commands
│  └─ tauri.conf.json       Desktop and packaging configuration
└─ test/                    Vitest tests
```

### Layers

- `src/domain`: the UI-independent project model - Zod schemas, data
  migration, validation, type fields, and starting templates
- `src/stores/projectStore.ts`: project mutations, selection, save state,
  undo/redo, and active-file info
- `src/stores/uiStore.ts`: open panels, card density, connection mode, and
  canvas view state
- `src/stores/feedbackStore.ts`: the in-app dialog and notification queue
- `src/components`: canvas, cards, panels, dialogs, and the application shell
- `src-tauri/src/lib.rs`: Windows file pickers, opening projects, atomic save,
  and the recovery snapshot
- `test`: automated checks for domain, store, and critical UI behavior

### Data flow

```text
User action
    ↓
React component
    ↓
Zustand store mutation
    ↓
V3 project model
    ├─→ Zod validation
    ├─→ Undo/redo history
    ├─→ Local recovery snapshot
    └─→ Atomic .gdd.json save via Tauri
```

## Windows release CI

`.github/workflows/release.yml` automatically produces a Windows release
whenever a `v*`-formatted Git tag is pushed:

1. Checks out the source on a clean Windows runner.
2. Installs Node.js 22 and stable Rust.
3. Runs `npm ci` and `npm test`.
4. Verifies the tag matches the `package.json` version.
5. Compares the `src-tauri/tauri.conf.json` and `package.json` versions.
6. Builds the Tauri app and the NSIS installer package.
7. Prepares the portable and installer EXEs.
8. Creates the GitHub Release or updates the existing release assets.

When preparing a new release, update the `package.json`,
`package-lock.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`
versions together. After the checks pass and the changes are pushed to
`main`, create a tag with the matching version:

```powershell
git tag -a v0.2.0 -m "GDD Tool v0.2.0"
git push origin v0.2.0
```

If the tag and package version do not match, CI fails without creating a
release. The workflow does not use a personal API key or GitHub PAT; it
relies on the token GitHub Actions provides during the run and the
`contents: write` permission needed only to publish the release.

## Codex development router

The names **Sol**, **Terra**, and **Luna** in this repository do not refer to
an AI system exposed to end users. They are project roles used only to route
Codex tasks while GDD Tool itself is being developed.

1. Sol turns a raw development request into an actionable execution brief.
2. The main Codex session picks an executor based on scope and risk.
3. Terra handles research, architecture, ambiguous, or multi-file work.
4. Luna handles clear, mechanical, low-risk work.
5. The main session verifies the result and delivers the finished output.

This router:

- Is not part of the compiled application.
- Makes no model calls while the app is running.
- Requires no OpenAI SDK or API key.
- Never sends GDD project data to an AI service.

See the [Development Router](docs/DEVELOPMENT_ROUTER.md) document for
details.

## Known limitations

In the current early release:

- The prebuilt distribution targets Windows x64 and NSIS only.
- Packages are not yet signed with a code-signing certificate.
- There is no automatic application update.
- There is no cloud sync, account system, or real-time collaborative editing.
- There is no AI feature in the product.
- A project is saved as a single `.gdd.json` snapshot; there is no
  object-level Git diff format yet.
- Templates are new-project starting points only, not a module system.
- Semantic containers/frames and advanced page organization do not exist yet.
- There are no View/Edit/Play modes and no playable simulation.
- macOS and Linux packages are not published.

The early-release file format is being developed with backward compatibility
in mind, but you should still back up important project files separately.

## Roadmap

The long-term goal is to turn GDD Tool into an offline desktop playground
that combines structured game design knowledge with a Miro-like free-form
workspace.

Directions under exploration:

- GDD templates and modules that can be added to an already-open page
- Semantic containers such as systems, features, or chapters
- Cross-page portals and reference cards
- Advanced search, filtering, and outline organization
- A clear separation of View, Edit, and Play working modes
- Testable variables, conditions, and flows
- A simulation view to help run design ideas
- Event logging and runtime-moment validation
- Performance and virtualization improvements for large projects
- Object-level, Git-friendly project storage options

These items are not a current release commitment or delivery date. Use the
**Current features** and **Known limitations** sections as the source of
truth for current scope. See the
[Modern UI Research](docs/MODERN_UI_RESEARCH.md) document for interface
research and staged decisions.

## Contributing

There is no separate `CONTRIBUTING.md` or formal contribution process yet.
When preparing a contribution:

1. Keep the change within the current product scope.
2. Clarify intent and scope with an issue first, if possible.
3. Prepare a small, focused change.
4. Add or update relevant tests.
5. Run the frontend and Rust quality checks.
6. Do not commit secrets, API keys, or personal file paths.
7. Open a pull request describing the change.

Do not add an AI, model, or network dependency to the product unless the
user explicitly requests it.

## License

This repository does not yet define a `LICENSE` file or an open-source
license. The source code being viewable does not, by itself, grant
permission to redistribute, modify, or use it commercially. Contact the
project owner for usage and contribution terms.
