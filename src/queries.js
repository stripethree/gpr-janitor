exports.DELETE_PACKAGE_VERSION = `
  mutation($clientId: String!, $packageVersionId: String! ) {
    deletePackageVersion(input:{ clientMutationId: $clientId, packageVersionId: $packageVersionId }) {
      success
    }
  }
`;

exports.GET_PACKAGES = `
  query($orgName: String!, $pkgName: String!, $versions: Int = 25) {
    organization(login: $orgName) {
      id
      registryPackages(first: 1, name: $pkgName) {
        edges {
          node {
            id
            name
            versions(first: $versions) {
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
                }
              }
            }
          }
        }
        totalCount
      }
    }
  }
`;
