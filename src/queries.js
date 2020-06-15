exports.DELETE_PACKAGE_VERSION = `
  mutation($clientId: String!, $packageVersionId: String! ) {
    deletePackageVersion(input:{ clientMutationId: $clientId, packageVersionId: $packageVersionId }) {
      success
    }
  }
`;

exports.GET_PACKAGES = `
  query($owner: String!, $repoName: String!, $maxPackages: Int!, $maxVersions: Int!) {
    repository(name: $repoName owner: $owner) {
        isPrivate
        packages(first: $maxPackages orderBy:{field: CREATED_AT direction: DESC}) {
            nodes {
                name
                latestVersion {
                    version
                }
                versions(first: $maxVersions, orderBy: {field: CREATED_AT direction: DESC}) {
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
