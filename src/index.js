const core = require("@actions/core");
const { graphql } = require("@octokit/graphql");
const { DELETE_PACKAGE_VERSION, GET_PACKAGES } = require("./queries");

async function deletePackageVersion(token, clientId, versionId) {
  return graphql(DELETE_PACKAGE_VERSION, {
    clientId,
    packageVersionId: versionId,
    headers: {
      accept: "application/vnd.github.package-deletes-preview+json",
      authorization: `token ${token}`,
    },
  })
    .then((data) => {
      return { versionId, data };
    })
    .catch((error) => {
      return { versionId, error };
    });
}

async function getRepoPackages(
  token,
  owner,
  repoName,
  maxPackages,
  maxVersions
) {
  return graphql(GET_PACKAGES, {
    owner,
    repoName,
    maxPackages,
    maxVersions,
    headers: {
      accept: "application/vnd.github.packages-preview+json",
      authorization: `token ${token}`,
    },
  });
}

if (!process.env.GITHUB_TOKEN) {
  console.error("Missing GITHUB_TOKEN");
  return;
}
const token = process.env.GITHUB_TOKEN;

if (!process.env.GITHUB_REPOSITORY) {
  console.error("Missing GITHUB_REPOSITORY");
  return;
}

const [owner, repoName] = process.env.GITHUB_REPOSITORY.split("/");
if (!owner || !repoName) {
  console.error("Invalid GITHUB_REPOSITORY value");
  return;
}

const clientId = "stripethree/gpr-janitor";
const dryRun = core.getInput("dry-run") === "true";
const maxPackagesToFetch = parseInt(core.getInput("packages-to-fetch"));
const maxVersionsToFetch = parseInt(core.getInput("versions-to-fetch"));
const minAgeDays = parseInt(core.getInput("min-age-days"));
const minVersionsToKeep = parseInt(core.getInput("keep-versions"));

getRepoPackages(token, owner, repoName, maxPackagesToFetch, maxVersionsToFetch)
  .then((data) => {
    const packages = data.repository.packages;

    const versionsToDelete = [];

    // for each package...
    packages.nodes.forEach((pkg) => {
      const currentTime = new Date().getTime();
      const msPerDay = 1000 * 60 * 60 * 24;

      const pkgName = pkg.name;

      const latestVersion = pkg.latestVersion.version;
      const pkgVersions = pkg.versions.nodes;

      console.log(
        `Found ${pkgVersions.length} versions of package '${owner}/${pkgName}'.`
      );

      const oldVersions = pkgVersions
        .slice(minVersionsToKeep)
        .filter((pkgVersion) => {
          const pkgUpdatedTime = new Date(
            Math.max.apply(
              null,
              pkgVersion.files.nodes.map(function (e) {
                return new Date(e.updatedAt);
              })
            )
          ).getTime();
          return (
            ((currentTime - pkgUpdatedTime) / msPerDay).toFixed(2) > minAgeDays
          );
        })
        .filter((pkgVersion) => {
          // never delete the current version
          return pkgVersion.version !== latestVersion;
        })
        .forEach((pkgVersion) => {
          console.log(
            `Version ${pkgVersion.version} of package '${owner}/${pkgName}' (id: ${pkgVersion.id}) marked for deletion.`
          );
          versionsToDelete.push(pkgVersion.id);
        });
    });

    if (dryRun) {
      console.log("***** Dry run mode: no packages will be deleted. *****");
      return [];
    }

    if (!versionsToDelete.length) {
      console.log("There are no package versions to delete.");
      return [];
    }

    return Promise.all(
      versionsToDelete.map((versionId) =>
        deletePackageVersion(token, clientId, versionId)
      )
    );
  })
  .then((deletions) => {
    outputs = deletions.map((item) => {
      if (item.data && item.data.deletePackageVersion.success === true) {
        return `Version id ${item.versionId} deleted.`;
      }
      if (item.error) {
        return `Failed to delete version id ${item.versionId}. Error: ${item.error}`;
      }
      return `Unexpected result for version id ${item.versionId}. Details: ${item.data}`;
    });
    console.log(outputs.join("\n"));
  })
  .catch((err) => {
    console.log(err);
  });
