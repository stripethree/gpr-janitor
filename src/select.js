/**
 * Select package versions eligible for deletion.
 *
 * @param {Array<{ id: number|string, name: string, created_at?: string, updated_at?: string }>} versions
 * @param {{ keepVersions: number, minAgeDays: number, now?: Date }} options
 */
function selectVersionsForDeletion(versions, options) {
  const { keepVersions, minAgeDays, now = new Date() } = options;
  const msPerDay = 1000 * 60 * 60 * 24;

  const sorted = [...versions].sort((a, b) => {
    const aTime = Date.parse(a.updated_at || a.created_at || 0);
    const bTime = Date.parse(b.updated_at || b.created_at || 0);
    return bTime - aTime;
  });

  // Always retain at least one version.
  const retainCount = Math.max(keepVersions, 1);
  if (sorted.length <= retainCount) {
    return [];
  }

  const protectedVersions = new Set(
    sorted.slice(0, retainCount).map((version) => String(version.id))
  );

  return sorted.filter((version) => {
    if (protectedVersions.has(String(version.id))) {
      return false;
    }

    const timestamp = Date.parse(version.updated_at || version.created_at || 0);
    if (Number.isNaN(timestamp)) {
      return false;
    }

    const ageDays = (now.getTime() - timestamp) / msPerDay;
    return ageDays > minAgeDays;
  });
}

module.exports = { selectVersionsForDeletion };
