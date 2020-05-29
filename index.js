const { graphql } = require("@octokit/graphql");
const { PACKAGE_QUERY } = require("./src/queries");

async function getRepoPackages(token, orgName, pkgName) {
  return graphql(PACKAGE_QUERY, {
    orgName: orgName,
    pkgName: pkgName,
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

/*
getRepoPackages(token, orgName, pkgName).then(organization => {
  console.log(JSON.stringify(organization, "\n", "  "));
});
*/

const dryRun = true;
const minAgeDays = 10;
const minVersionsToKeep = 5;

const data = require("./fixtures.js");
const registryPackages = data.organization.registryPackages;
const totalCount = registryPackages.totalCount;

const packageVersions = registryPackages.edges[0].node.versions.edges;
packageVersions.sort(
  (a, b) => new Date(b.node.updatedAt) - new Date(a.node.updatedAt)
);

const versionsToKeep = packageVersions.slice(0, minVersionsToKeep);
const keeperVersions = versionsToKeep
  .map(version => version.node.version)
  .join(", ");
console.log(
  `These most recent ${minVersionsToKeep} package versions will be kept: ${keeperVersions}.`
);

const currentTime = new Date().getTime();
const msPerDay = 1000 * 60 * 60 * 24;

const oldVersions = packageVersions.slice(minVersionsToKeep).filter(pv => {
  const pkgUpdatedTime = new Date(pv.node.updatedAt).getTime();
  return ((currentTime - pkgUpdatedTime) / msPerDay).toFixed(2) > minAgeDays;
});

if (!oldVersions.length) {
  console.log("There are no package versions to delete at this time.");
  return;
}

const targetVersions = oldVersions
  .map(version => version.node.version)
  .join(", ");
console.log(
  `These package versions are marked for deletion: ${targetVersions}.`
);

if (dryRun) {
  console.log("Dry run mode: no packages will be deleted.");
  return;
}
