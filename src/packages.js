/**
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {{ owner: string, ownerType: 'org'|'user', packageType: string, packageName: string }} params
 */
async function listPackageVersions(octokit, params) {
  const { owner, ownerType, packageType, packageName } = params;

  if (ownerType === 'org') {
    return octokit.paginate(
      octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
      {
        org: owner,
        package_type: packageType,
        package_name: packageName,
        per_page: 100,
        state: 'active'
      }
    );
  }

  return octokit.paginate(
    octokit.rest.packages.getAllPackageVersionsForPackageOwnedByUser,
    {
      username: owner,
      package_type: packageType,
      package_name: packageName,
      per_page: 100,
      state: 'active'
    }
  );
}

/**
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {{ owner: string, ownerType: 'org'|'user', packageType: string, packageName: string, versionId: number|string }} params
 */
async function deletePackageVersion(octokit, params) {
  const { owner, ownerType, packageType, packageName, versionId } = params;

  if (ownerType === 'org') {
    await octokit.rest.packages.deletePackageVersionForOrg({
      org: owner,
      package_type: packageType,
      package_name: packageName,
      package_version_id: versionId
    });
    return;
  }

  await octokit.rest.packages.deletePackageVersionForUser({
    username: owner,
    package_type: packageType,
    package_name: packageName,
    package_version_id: versionId
  });
}

module.exports = { listPackageVersions, deletePackageVersion };
