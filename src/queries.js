exports.GET_PACKAGES = `
  query($versions: Int = 25, $orgName: String!, $pkgName: String!) {
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
