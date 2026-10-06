# GitHub Package Registry (GPR) Janitor

A GitHub Action to clean up old package versions from [GitHub Packages](https://docs.github.com/en/packages) using the REST API.

![Branch Build Validation](https://github.com/stripethree/gpr-janitor/actions/workflows/branch-build-validation.yml/badge.svg)

> **v3** rewrites the action for current GitHub Packages. npm/container packages no longer work with the old GraphQL Packages API, so v3 uses REST, runs on **Node 24**, paginates all versions, and keeps a configurable newest-N retain floor.

The compiled bundle lives on the [`dist`](https://github.com/stripethree/gpr-janitor/tree/dist) branch (not on `main`). CI rebuilds and pushes that branch when `main` changes. Version tags such as `@v3` / `@v3.0.0` point at `dist` commits.

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Install

```yaml
name: Package version cleanup

on:
  schedule:
    # 09:00 UTC on the 1st of each month
    - cron: '0 9 1 * *'
  workflow_dispatch:

permissions:
  contents: read
  packages: write

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Clean up old package versions
        uses: stripethree/gpr-janitor@v3
        with:
          # Package name without scope, e.g. my-lib for @my-org/my-lib
          package-name: my-lib
          owner: ${{ github.repository_owner }}
          owner-type: org
          package-type: npm
          keep-versions: 20
          min-age-days: 365
          # Keep true until you trust the candidate list; then set false for real deletes.
          dry-run: true
          token: ${{ secrets.GITHUB_TOKEN }}
```

**Pinning**

| Ref | Use when |
| --- | --- |
| `@v3` | Recommended floating major pin |
| `@v3.0.0` | Exact release pin |
| `@dist` | Latest published bundle from `main` (may move between releases) |
| `@main` | Do not use — source only, no compiled `index.js` |

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `token` | `${{ github.token }}` | Token that can list/delete package versions |
| `dry-run` | `true` | When `true`, only report candidates |
| `keep-versions` | `5` | Newest versions to always keep (at least 1 is always retained) |
| `min-age-days` | `30` | Minimum age before a version is eligible for deletion |
| `package-name` | _(required)_ | Package name **without** scope (`my-lib`, not `@my-org/my-lib`) |
| `package-type` | `npm` | `npm`, `container`, `maven`, `nuget`, or `rubygems` |
| `owner` | `${{ github.repository_owner }}` | Org or user that owns the package |
| `owner-type` | `org` | `org` or `user` |

## Outputs

| Output | Description |
| --- | --- |
| `candidate-count` | Versions selected for deletion |
| `deleted-count` | Versions deleted (`0` in dry-run mode) |

## Behavior

1. Paginate **all** active versions for the package (REST).
2. Sort by `updated_at` / `created_at`, newest first.
3. Protect the newest `keep-versions` (and never leave zero versions).
4. From the remainder, select versions older than `min-age-days`.
5. Delete only when `dry-run` is `false`.

## Authentication

For packages linked to the workflow repository, `permissions.packages: write` with `GITHUB_TOKEN` is usually enough when the repo has **admin** on the package.

If deletes fail with 403, use a classic PAT (or GitHub App token) with `read:packages` and `delete:packages`, stored as a secret, and pass it via `token`.

## Migrating from v2

| v2 | v3 |
| --- | --- |
| GraphQL Packages API | REST Packages API |
| `runs: node12` | `runs: node24` |
| `uses: ...@dist` (GraphQL-era bundle) | `uses: ...@v3` or `@dist` (REST bundle) |
| `packages-to-fetch` / `versions-to-fetch` | Full pagination; set `package-name` explicitly |
| Age via package file `updatedAt` | Age via version `updated_at` / `created_at` |

v2 cannot clean modern npm packages on GitHub’s current Packages architecture. Upgrade to v3.

## Development

```bash
nvm use
npm ci
npm run lint
npm run prettier
npm test
npm run build   # writes local dist/ (gitignored); CI publishes it to the dist branch
```

Pre-commit runs `lint-staged` (eslint + prettier) via husky.

## Prior art

- Inspired by early GitHub Package Registry storage limits when publishing frequently.
- Related work: [navikt/remove-package-versions](https://github.com/navikt/remove-package-versions), [actions/delete-package-versions](https://github.com/actions/delete-package-versions).
