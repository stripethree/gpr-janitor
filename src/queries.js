exports.DELETE_PACKAGE_VERSION = `
  mutation($clientId: String!, $packageVersionId: String! ) {
    deletePackageVersion(input:{ clientMutationId: $clientId, packageVersionId: $packageVersionId }) {
      success
    }
  }
`;

exports.GET_PACKAGES = `
  query($owner: String!, $repoName: String!, $numPackages: Int = 10, $numVersions: Int = 100) {
    repository(name: $repoName owner: $owner) {
        isPrivate
        packages(first: $numPackages orderBy:{field: CREATED_AT direction: DESC}) {
            nodes {
                name
                latestVersion {
                    version
                }
                versions(first: $numVersions, orderBy: {field: CREATED_AT direction: DESC}) {
                    totalCount
                    nodes {
                        id
                        files(first: 10) {
                            totalCount
                            nodes {
                                name
                                updatedAt
                            }
                        }
                        version
                    }
                }
            }
        }
    }
  }
`;
