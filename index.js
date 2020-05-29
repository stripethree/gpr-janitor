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

const minAgeDays = 30;
const minVersionsToKeep = 5;

const data = require("./fixtures.js");
const registryPackages = data.organization.registryPackages;
const totalCount = registryPackages.totalCount;

const packageVersions = registryPackages.edges[0].node.versions.edges;
packageVersions.sort(
  (a, b) => new Date(b.node.updatedAt) - new Date(a.node.updatedAt)
);

const targetVersions = packageVersions.slice(minVersionsToKeep);
const versionsToKeep = packageVersions.slice(0, minVersionsToKeep);

const currentTime = new Date().getTime();
const msPerDay = 1000 * 60 * 60 * 24;

const oldVersions = targetVersions.filter(pv => {
  const pkgUpdatedTime = new Date(pv.node.updatedAt).getTime();
  const ageInDays = ((currentTime - pkgUpdatedTime) / msPerDay).toFixed(2);
  return ageInDays > minAgeDays;
});

oldVersions.forEach(oldVersion => {
  console.log(oldVersion.node);
});
