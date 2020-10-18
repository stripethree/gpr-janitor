# GitHub Package Registry (GPR) Janitor

A GitHub Action to clean up old package versions

![Build PRs](https://github.com/stripethree/gpr-janitor/workflows/Build%20PRs/badge.svg)
![Package and publish](https://github.com/stripethree/gpr-janitor/workflows/Package%20and%20publish/badge.svg)

## Install

To use this action, create a workflow and reference the action repository via the `use` syntax.

```yaml
name: Clean up old package versions
on: push

jobs:
  package-cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Clean up old package versions
        id: clean-up-old-package-versions
        uses: stripethree/gpr-janitor@dist
        with:
          dry-run: true
          keep-versions: 5
          min-age-days: 30
          # packages-to-fetch: 1 - (default)
          versions-to-fetch: 10

        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Alternatively, the action can be periodically scheduled using the [`on.schedule` syntax](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#onschedule). A sample workflow demonstrating this this can be found [here](https://github.com/stripethree/github-workflows/blob/main/workflows/gpr-janitor.yml).

## Usage

### Required environment variables

#### `GITHUB_REPOSITORY`

One of the [default environment variables](https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables) provided to any Action, this does not need to be explicitly added to the workflow.

#### `GITHUB_TOKEN`

An [automatically generated token](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#about-the-github_token-secret) allowing access to the GitHub GraphQL API.

### Options

### `dry-run`

When set to `true`, the action outputs information and package versions marked for removal based on the configuration, but does not remove them. When set to `false`, package versions will be removed. Defaults to `true`.

### `keep-versions`

The minimum number of versions to keep in the registry, when ordered by most recently updated. Defaults to `5`.

### `min-age-days`

The minimum number of days since last update (based on the `updatedAt` field) for a version to be marked for deletion. Defaults to `30`.

### `packages-to-fetch`

The maximum number of packages to fetch and evaluate. If you did not know, yes, you can [publish multiple packages to the same repository](https://help.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages#publishing-multiple-packages-to-the-same-repository). Defaults to `1`.

### `versions-to-fetch`

The maximum number of versions to fetch and evaluate for potential deletion. If the repository contains more than one package, this value applies _per package_. Defaults to `25`

## Caveats

Version 1 of this Action fetched packages through the [`Organizations` object](https://developer.github.com/v4/object/organization/) of the GitHub GraphQL API. The design decisions was made in order to access data about the package that is not yet available via the [`PackageVersion` preview object](https://developer.github.com/v4/object/packageversion/). Specifically, while the `PackageVersion` object allows sorting by the `CREATED_AT` field, it does not provide `createdAt` or `updatedAt` as fields.

About a week after I published v1, I recieved an email notification that GitHub was shutting down the deprecated APIs that v1 was using. Thus, I embarked on updating this to use the aforementioned `PackageVersion` object via its connection to the [`Repository` object](https://developer.github.com/v4/object/repository/).

To re-implement the 'minimum age' criteria is where things got a little creative. Using the [`PackageFile`](https://developer.github.com/v4/object/packagefile/), the Action uses the latest `updatedAt` timestamp of files that are associated with a specific package version in the comparison against the `min-age-days` attribute. My assumption is that the majority of packages will have a single file, presumably an archive, associated with a version.

### Prior art

The idea for this Action came after moving an engineering organization over to the GitHub Package Registry, which I wrote a [blog post about](https://medium.com/@stripethree/migrating-to-the-github-package-registry-948d4df756f1). Within a month, we updated and published our React component library frequently enough that we exhausted the included storage with just the activity on this single package. We thought it might be a good idea to look into ways to prune versions we did not need to keep around since this package is not public.

In my research for similar actions, the [`remove-package-versions`](https://github.com/navikt/remove-package-versions) Action developed by the Norwegian Labour and Welfare Directorate stood out. I referred back to it frequently as I figured out how to develop this Action, and would be remiss to not highlight their work as an inspiration.

While testing this action, I also found a version published by [GitHub](https://github.com/actions/delete-package-versions)!
