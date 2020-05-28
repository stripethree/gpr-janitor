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
                name
              }
            }
            nodes {
              latestVersion {
                version
                updatedAt
              }
            }
            totalCount
          }
          name
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

const token = process.env.TOKEN;
const orgName = process.env.ORG_NAME;
const pkgName = process.env.PKG_NAME;

getRepoPackages(token, orgName, pkgName).then(repoPackages => {
  console.log(JSON.stringify(repoPackages, "\n", "  "));
  console.log(repoPackages.organization.name);
});
