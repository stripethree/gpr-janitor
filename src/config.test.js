const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseBoolean, parsePositiveInt } = require('./config');

describe('parsePositiveInt', () => {
  it('parses positive integers', () => {
    assert.equal(parsePositiveInt('min-age-days', '30'), 30);
  });

  it('rejects zero unless allowZero is set', () => {
    assert.throws(() => parsePositiveInt('min-age-days', '0'), />= 1/);
    assert.equal(
      parsePositiveInt('keep-versions', '0', { allowZero: true }),
      0
    );
  });

  it('rejects non-integers', () => {
    assert.throws(() => parsePositiveInt('min-age-days', '1.5'));
    assert.throws(() => parsePositiveInt('min-age-days', '-1'));
  });
});

describe('parseBoolean', () => {
  it('accepts true/false strings', () => {
    assert.equal(parseBoolean('dry-run', 'true'), true);
    assert.equal(parseBoolean('dry-run', 'false'), false);
  });

  it('rejects other values', () => {
    assert.throws(() => parseBoolean('dry-run', 'yes'), /true/);
  });
});
