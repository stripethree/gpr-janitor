const core = require('@actions/core');
const github = require('@actions/github');
const { getConfig } = require('./config');
const { listPackageVersions, deletePackageVersion } = require('./packages');
const { selectVersionsForDeletion } = require('./select');

async function run() {
  const config = getConfig();
  const octokit = github.getOctokit(config.token);

  core.info(
    `Target: ${config.ownerType}:${config.owner}/${config.packageType}/${config.packageName}`
  );
  core.info(`Dry run: ${config.dryRun}`);
  core.info(`Keep newest versions: ${config.keepVersions}`);
  core.info(`Minimum age (days): ${config.minAgeDays}`);

  const versions = await listPackageVersions(octokit, {
    owner: config.owner,
    ownerType: config.ownerType,
    packageType: config.packageType,
    packageName: config.packageName,
  });

  core.info(`Fetched ${versions.length} active version(s).`);

  const candidates = selectVersionsForDeletion(versions, {
    keepVersions: config.keepVersions,
    minAgeDays: config.minAgeDays,
  });

  core.setOutput('candidate-count', String(candidates.length));
  core.info(`Selected ${candidates.length} version(s) for deletion.`);

  if (candidates.length === 0) {
    core.setOutput('deleted-count', '0');
    core.info('No versions to process.');
    return;
  }

  for (const version of candidates) {
    core.info(
      `Candidate id=${version.id} name=${version.name} updated_at=${version.updated_at || version.created_at}`
    );
  }

  if (config.dryRun) {
    core.setOutput('deleted-count', '0');
    core.info('Dry run complete. No versions deleted.');
    return;
  }

  let deleted = 0;
  for (const version of candidates) {
    core.info(`Deleting id=${version.id} name=${version.name}`);
    await deletePackageVersion(octokit, {
      owner: config.owner,
      ownerType: config.ownerType,
      packageType: config.packageType,
      packageName: config.packageName,
      versionId: version.id,
    });
    deleted += 1;
  }

  core.setOutput('deleted-count', String(deleted));
  core.info(`Deleted ${deleted} version(s).`);
}

if (require.main === module) {
  run().catch((error) => {
    core.setFailed(error instanceof Error ? error.message : String(error));
  });
}

module.exports = { run };
