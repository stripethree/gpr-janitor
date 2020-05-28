const { graphql } = require("@octokit/graphql");

async function getRepoPackages(token, orgName, pkgName) {
  return graphql(
    `
      query($orgName: String!, $pkgName: String!) {
        organization(login: $orgName) {
          id
          registryPackages(first: 10, name: $pkgName) {
            edges {
              node {
                id
                name
                versions(first: 10) {
                  edges {
                    node {
                      id
                      version
                      statistics {
                        downloadsThisMonth
                        downloadsThisWeek
                        downloadsTotalCount
                        downloadsToday
                        downloadsThisYear
                      }
                      updatedAt
                      size
                    }
                  }
                }
              }
            }
            nodes {
              latestVersion {
                version
                updatedAt
                id
                registryPackage {
                  name
                }
              }
            }
            totalCount
          }
        }
      }
    `,
    {
      orgName: orgName,
      pkgName: pkgName,
      headers: {
        authorization: `token ${token}`
      }
    }
  );
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
