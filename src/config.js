const core = require('@actions/core');

function parsePositiveInt(name, raw, { allowZero = false } = {}) {
  if (!/^\d+$/.test(raw)) {
    throw new Error(`${name} must be an integer >= ${allowZero ? 0 : 1}`);
  }
  const value = Number.parseInt(raw, 10);
  if (!allowZero && value < 1) {
    throw new Error(`${name} must be an integer >= 1`);
  }
  return value;
}

function parseBoolean(name, raw) {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  throw new Error(`${name} must be 'true' or 'false'`);
}

function getConfig() {
  const token = core.getInput('token') || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('Missing token. Set inputs.token or GITHUB_TOKEN.');
  }

  const owner = core.getInput('owner') || process.env.GITHUB_REPOSITORY_OWNER;
  if (!owner) {
    throw new Error('Missing owner. Set inputs.owner or GITHUB_REPOSITORY_OWNER.');
  }

  const ownerType = (core.getInput('owner-type') || 'org').toLowerCase();
  if (ownerType !== 'org' && ownerType !== 'user') {
    throw new Error("owner-type must be 'org' or 'user'");
  }

  const packageName = core.getInput('package-name', { required: true });
  const packageType = (core.getInput('package-type') || 'npm').toLowerCase();
  const allowedTypes = new Set(['npm', 'container', 'maven', 'nuget', 'rubygems']);
  if (!allowedTypes.has(packageType)) {
    throw new Error(
      `package-type must be one of: ${Array.from(allowedTypes).join(', ')}`
    );
  }

  return {
    token,
    owner,
    ownerType,
    packageName,
    packageType,
    dryRun: parseBoolean('dry-run', core.getInput('dry-run') || 'true'),
    keepVersions: parsePositiveInt(
      'keep-versions',
      core.getInput('keep-versions') || '5',
      { allowZero: true }
    ),
    minAgeDays: parsePositiveInt(
      'min-age-days',
      core.getInput('min-age-days') || '30'
    ),
  };
}

module.exports = { getConfig, parseBoolean, parsePositiveInt };
