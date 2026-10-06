const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { selectVersionsForDeletion } = require('./select');

const now = new Date('2026-10-06T12:00:00.000Z');

function version(id, name, daysAgo) {
  const updated = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    id,
    name,
    updated_at: updated.toISOString(),
    created_at: updated.toISOString()
  };
}

describe('selectVersionsForDeletion', () => {
  it('keeps the newest keepVersions and deletes older eligible versions', () => {
    const versions = [
      version(1, '1.0.5', 1),
      version(2, '1.0.4', 10),
      version(3, '1.0.3', 40),
      version(4, '1.0.2', 50),
      version(5, '1.0.1', 60)
    ];

    const selected = selectVersionsForDeletion(versions, {
      keepVersions: 2,
      minAgeDays: 30,
      now
    });

    assert.deepEqual(
      selected.map((v) => v.name),
      ['1.0.3', '1.0.2', '1.0.1']
    );
  });

  it('returns no candidates when all versions are within the keep window', () => {
    const versions = [version(1, '1.0.2', 100), version(2, '1.0.1', 200)];
    const selected = selectVersionsForDeletion(versions, {
      keepVersions: 5,
      minAgeDays: 30,
      now
    });
    assert.deepEqual(selected, []);
  });

  it('never deletes the newest version even when keepVersions is 0', () => {
    const versions = [version(1, '2.0.0', 1), version(2, '1.0.0', 100)];
    const selected = selectVersionsForDeletion(versions, {
      keepVersions: 0,
      minAgeDays: 30,
      now
    });
    assert.deepEqual(
      selected.map((v) => v.name),
      ['1.0.0']
    );
  });

  it('skips versions that are younger than min-age-days', () => {
    const versions = [
      version(1, '1.0.3', 1),
      version(2, '1.0.2', 5),
      version(3, '1.0.1', 10)
    ];
    const selected = selectVersionsForDeletion(versions, {
      keepVersions: 1,
      minAgeDays: 30,
      now
    });
    assert.deepEqual(selected, []);
  });
});
