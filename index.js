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

getRepoPackages(token, orgName, pkgName).then(organization => {
  console.log(JSON.stringify(organization, "\n", "  "));
});
