# Changelog

All notable changes to this project are documented in this file.

## [3.0.0] - 2026-10-06

### Breaking

- Replaced the GitHub Packages **GraphQL** integration with the **REST** Packages API (required for modern npm/container packages).
- Runner updated from **Node 12** to **Node 24** (`runs.using: node24`).
- Removed inputs `packages-to-fetch` and `versions-to-fetch` in favor of full pagination.
- Added required input `package-name` (package name without scope).
- Prefer `stripethree/gpr-janitor@v3` (tags point at the `dist` branch). `@main` remains source-only.

### Added

- Inputs: `package-type`, `owner`, `owner-type`, `token`.
- Outputs: `candidate-count`, `deleted-count`.
- Retain floor via `keep-versions` (always keeps at least one version).
- Age filtering via version `updated_at` / `created_at` and `min-age-days`.
- Unit tests for config parsing and version selection.
- Branch Build Validation, Update Distribution, and Dependabot Automerge workflows.
- eslint, prettier, husky, lint-staged, and `.nvmrc`.

### Changed

- Dry-run remains the default (`dry-run: true`).
- Distribution continues to publish the compiled bundle to the `dist` branch (not committed on `main`).

## [2.1.0] - 2020-07-20

- Input / output improvements (legacy GraphQL release).

## [2.0.1] - 2020-07-08

- Input / output improvements (legacy GraphQL release).

## [2.0.0] - 2020-06-15

- Replaced deprecated GraphQL APIs used by v1 (legacy GraphQL release).

## [1.0.0] - 2020-06-05

- Initial GPR Janitor release.
