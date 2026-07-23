import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

const testPassword = 'demo123';
const hashed = hashPassword(testPassword);

assert.equal(hashed.length > 0, true);
assert.equal(typeof hashed, 'string');
console.log('auth test passed');
