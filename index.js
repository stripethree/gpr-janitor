const { graphql } = require("@octokit/graphql");
const { GET_PACKAGES } = require("./src/queries");

async function deletePackageVersion(token, clientId, packageVersionId) {
  return graphql(DELETE_PACKAGE_VERSION, {
    clientId,
    packageVersionId,
    headers: {
      accept: "application/vnd.github.package-deletes-preview+json",
      authorization: `token ${token}`
    }
  });
}

async function getRepoPackages(token, orgName, pkgName) {
  return graphql(GET_PACKAGES, {
    orgName,
    pkgName,
    first: 25,
    headers: {
      authorization: `token ${token}`
    }
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
const [orgName, pkgName] = process.env.GITHUB_REPOSITORY.split("/");
if (!orgName || !pkgName) {
  console.error("Invalid GITHUB_REPOSITORY value");
  return;
}

const clientId = "stripethree/gpr-janitor";
const dryRun = true;
const minAgeDays = 30;
const minVersionsToKeep = 5;

getRepoPackages(token, orgName, pkgName)
  .then(data => {
    const key = "organization"; // "user" for packages that are owned by a user
    const registryPackages = data[key].registryPackages;
    const totalCount = registryPackages.totalCount;

    const packageVersions = registryPackages.edges[0].node.versions.edges;
    packageVersions.sort(
      (a, b) => new Date(b.node.updatedAt) - new Date(a.node.updatedAt)
    );

    const versionsToKeep = packageVersions.slice(0, minVersionsToKeep);
    const keeperVersions = versionsToKeep
      .map(version => `\n - ${version.node.version}`)
      .join();
    console.log(
      `These most recent ${minVersionsToKeep} package versions will be kept: ${keeperVersions}`
    );

    const currentTime = new Date().getTime();
    const msPerDay = 1000 * 60 * 60 * 24;

    const oldVersions = packageVersions.slice(minVersionsToKeep).filter(pv => {
      const pkgUpdatedTime = new Date(pv.node.updatedAt).getTime();
      return (
        ((currentTime - pkgUpdatedTime) / msPerDay).toFixed(2) > minAgeDays
      );
    });

    if (!oldVersions.length) {
      console.log("There are no package versions to delete at this time.");
      return;
    }

    const targetVersions = oldVersions
      .map(
        version =>
          `\n - ${version.node.version} (${version.node.id}) last updated on ${version.node.updatedAt}`
      )
      .join();
    console.log(
      `These package versions are marked for deletion: ${targetVersions}`
    );
    return oldVersions;
  })
  .then(versionsToDelete => {
    if (dryRun) {
      console.log("***** Dry run mode: no packages will be deleted. *****");
      return [];
    }

    return Promise.all(
      versionsToDelete.map(version =>
        deletePackageVersion(token, clientId, version.node.id)
      )
    );
  })
  .then(deletions => {
    console.log(deletions);
  });
