# ARLAS-wui Developer Guide

ARLAS-wui (ARLAS Web User Interface) is an open-source, web-based geospatial analytics and data exploration application developed by [Gisaïa](https://github.com/gisaia). It enables fluid, interactive exploration of massive spatio-temporal datasets via cartocentric views, histograms, powerbars, donuts, swimlanes, fulltext search, and geocoding.

---

## 1. Architecture & Tech Stack

- **Framework:** Angular 21 (`@angular/core` ~21.2) bootstrapped via standalone API (`bootstrapApplication`).
- **Language / Runtime:** TypeScript 5.9, Node.js 24 (`v24.x`), npm workspaces.
- **Build System:** Angular Application Builder (`@angular/build:application`) with esbuild / Vite, plus `ng-packagr` for library distribution.
- **Testing:** Vitest (`@angular/build:unit-test` using `vitest`).
- **Linting:** ESLint 9 (flat configuration in `eslint.config.mjs`) with `@angular-eslint`, `@typescript-eslint`, and `@stylistic`.
- **Styling:** SCSS, Angular Material 21, custom theme definitions in `src/styles/`.
- **ARLAS Ecosystem Libraries:**
  - `arlas-wui-toolkit`: Core services (config, startup, persistence, auth, tagger, walkthrough).
  - `arlas-web-components`: Visual analytic widgets (histogram, donut, powerbars).
  - `arlas-web-core`: Core collaborative search and contributors.
- **Dual Flavor Packaging (Workspaces):**
  - **Open Source (`packages/opensource`):** Powered by `arlas-maplibre` and MapLibre GL.
  - **Cloud (`packages/cloud`):** Powered by `arlas-mapbox` and Mapbox GL.
  - Map services are injected via abstract tokens (`AbstractArlasMapService`, `BasemapService`, `LegendService`, `ArlasMapFrameworkService`), allowing seamless swapping between MapLibre and Mapbox.
- **Library Target (`arlas-wui-lib`):** Builds reusable ARLAS-wui components into `dist/arlas-wui`.

---

## 2. Directory Structure

```
ARLAS-wui/
├── packages/
│   ├── cloud/               # Cloud workspace package (Mapbox GL)
│   └── opensource/          # Open-source workspace package (MapLibre GL)
├── docker/
│   └── Dockerfile           # Multi-stage production build (Node 24 + Nginx Alpine)
├── docs/                    # Architectural and configuration documentation
├── nginx/                   # Nginx reverse proxy and virtual host configurations
├── patches/                 # patch-package definitions (e.g., hopscotch)
├── scripts/
│   └── start.sh             # Docker entrypoint script performing runtime env substitutions
├── src/
│   ├── app/
│   │   ├── components/      # UI components (arlas-map, arlas-analytics, arlas-list, etc.)
│   │   ├── pipes/           # Angular pipes (aoi-dimensions, get-resultlist-config)
│   │   ├── services/        # Application services (map, contributors, cog, visualize, etc.)
│   │   ├── tools/           # Helpers, loaders, and test mock utilities
│   │   ├── app.module.ts    # Base shared module & configurations
│   │   ├── app.module.opensource.ts # Open source module configuration
│   │   └── app.module.cloud.ts      # Cloud module configuration
│   ├── assets/              # Translations (i18n), basemaps, processes, tours, icons
│   ├── environments/        # Environment configurations (dev/prod, local overrides)
│   ├── styles/              # SCSS theme files, variables, and widget styling overrides
│   ├── config.json          # Default dashboard / contributor configuration
│   ├── settings.yaml        # Application runtime settings (auth, persistence, etc.)
│   ├── main-opensource.ts   # Entrypoint for Open Source edition
│   ├── main-cloud.ts        # Entrypoint for Cloud edition
│   ├── main.ts              # Default dev entrypoint
│   └── public-api.ts        # Export definitions for the library build
├── angular.json             # Angular CLI workspace configuration
├── eslint.config.mjs        # ESLint 9 configuration
└── license-check-and-add.json # License header enforcement configuration
```

---

## 3. Setup & Installation

### Prerequisites
- Node.js: **24.x** (managed via nvm or equivalent)
- npm: bundled with Node 24

### Installation
Standard installation (executes `patch-package` on postinstall):
```bash
npm install
```

When building or working specifically on a workspace:
```bash
# Open Source
npm install --workspace=packages/opensource --include-workspace-root=true

# Cloud
npm install --workspace=packages/cloud --include-workspace-root=true

# Library
npm install --workspaces=false --include-workspace-root=true
```

---

## 4. Development & Running

### Dev Servers
```bash
# Start Open Source edition (MapLibre) - default
npm run start
# Alternatively:
ng serve --configuration=development-opensource

# Start Cloud edition (Mapbox)
npm run start:cloud

# Start Cloud with SSL (Keycloak authentication)
export EXPLO_SSL_CERT=/path/to/cert.crt
export EXPLO_SSL_KEY=/path/to/key.key
npm run start:cloud-kc

# Start Open Source with SSL (IAM authentication)
npm run start:iam
```

### Production Builds
```bash
# Build Open Source application
npm run build-opensource

# Build Cloud application
npm run build-cloud

# Build reusable library (arlas-wui-lib)
npm run build-lib

# Build Open Source with bundle stats metadata
npm run build-opensource-stats

# Visualize bundle composition
npm run analyze-opensource
```

*Note: For production builds, ensure memory limits are adequate: `export NODE_OPTIONS=--max_old_space_size=8192`.*

### Docker Builds
```bash
# Open Source Docker image
docker build -f docker/Dockerfile --build-arg WORKSPACE=opensource -t gisaia/arlas-wui:latest-os .

# Cloud Docker image
docker build -f docker/Dockerfile --build-arg WORKSPACE=cloud -t gisaia/arlas-wui:latest-cloud .
```

---

## 5. Testing & Code Quality

### Unit Tests
Tests are executed using Vitest through Angular's `@angular/build:unit-test` builder:
```bash
# Run unit tests once (watch disabled by default)
npm test
```
*Note: Test files are named `*.spec.ts` and use Vitest APIs (`describe`, `it`, `expect`, `vi.fn()` from `'vitest'`).*

### Linting
```bash
npm run lint
```
Linter is configured via ESLint 9 (`eslint.config.mjs`). Key rules:
- Explicit member accessibility modifiers required (`public`, `protected`, `private`).
- Maximum line length: 146 characters.
- Single quotes with template literal allowance.
- No unused expressions, strict type interfaces.

### License Check
All source files (`.ts`, `.js`, `.css`, `.scss`) must contain the Gisaïa Apache-2.0 license header:
```bash
npm run license-check
```

### Internationalization (i18n)
Translations are stored in `src/assets/i18n/{en,fr,es}.json`.
```bash
# Extract translation markers into translation files
npm run i18n:extract

# Verify that no empty translation keys exist
./checki18n.sh
```

---

## 6. Coding Conventions & Standards

1. **License Headers:** Every newly created source code file (`.ts`, `.scss`, etc.) must start with the Apache-2.0 header:
   ```ts
   /*
    * Licensed to Gisaïa under one or more contributor
    * license agreements. See the NOTICE.txt file distributed with
    * this work for additional information regarding copyright
    * ownership. Gisaïa licenses this file to you under
    * the Apache License, Version 2.0 (the "License"); you may
    * not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *    http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing,
    * software distributed under the License is distributed on an
    * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    * KIND, either express or implied.  See the License for the
    * specific language governing permissions and limitations
    * under the License.
    */
   ```
2. **Angular & Component Architecture:**
   - Component prefix: `arlas-`.
   - Prefer standalone component composition and dependency injection through Angular's modern providers.
   - Separate concerns cleanly between components, services (`src/app/services`), and utility tools (`src/app/tools`).
   - Use abstract service tokens for map interactions (`AbstractArlasMapService`, etc.) to maintain dual compatibility between MapLibre and Mapbox.
3. **Commit Messages:**
   - Adhere to the Conventional Commits specification: `feat:`, `fix:`, `chore:`, `build(deps):`, `docs:`, `refactor:`.
   - Include issue references where applicable (e.g. `fix: resolve layer opacity in list view (#1120)`).
4. **Validation Checklist Before Submitting PRs:**
   1. `npm run lint`
   2. `npm run license-check`
   3. `npm run test`
   4. `npm run build-opensource` and `npm run build-cloud`
