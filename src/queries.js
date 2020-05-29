exports.PACKAGE_QUERY = `
  query($first: Int = 10, $orgName: String!, $pkgName: String!) {
    organization(login: $orgName) {
      id
      registryPackages(first: $first, name: $pkgName) {
        edges {
          node {
            id
            name
            versions(first: $first) {
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
