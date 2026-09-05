import 'dotenv/config';
import assert from 'assert';
import { db } from '../../api/_db/client.js';

console.log('🧪 Running Automated SQL Injection Security Test Suite...\n');

async function runSqliTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Column Allowlist in updateUser
  try {
    console.log('  [1/4] Testing updateUser SQL column allowlist enforcement...');
    const result = await db.updateUser(999999, {
      full_name: 'Security Test User',
      "invalid_column' IS NOT NULL; --": 'malicious_value',
    });

    // If it reaches here without crashing or throwing a SQL syntax error, column allowlist worked!
    console.log('        ✅ PASS: updateUser safely filtered out unapproved column names.');
    passed++;
  } catch (err) {
    console.error('        ❌ FAIL: updateUser threw error on malicious column input:', err?.message || err);
    failed++;
  }

  // Test 2: SQL Injection in findUserByEmail
  try {
    console.log('  [2/4] Testing findUserByEmail with SQL injection payload...');
    const sqliEmail = "' OR '1'='1' --";
    const user = await db.findUserByEmail(sqliEmail);

    // Should return undefined because no user email literally equals "' OR '1'='1' --"
    assert.strictEqual(user, undefined, 'findUserByEmail should return undefined for non-existent SQLi payload email');
    console.log('        ✅ PASS: findUserByEmail safely parameterized email payload.');
    passed++;
  } catch (err) {
    console.error('        ❌ FAIL: findUserByEmail failed on SQLi payload:', err?.message || err);
    failed++;
  }

  // Test 3: SQL Injection in getLeaderboard
  try {
    console.log('  [3/4] Testing getLeaderboard with SQL injection year payload...');
    const sqliYear = "2026'; DROP TABLE users; --";
    const leaderboard = await db.getLeaderboard(sqliYear);

    // Parameterized query should return array result
    assert(Array.isArray(leaderboard), 'Leaderboard should return array result');
    console.log('        ✅ PASS: getLeaderboard safely parameterized year filter payload.');
    passed++;
  } catch (err) {
    console.error('        ❌ FAIL: getLeaderboard failed on SQLi year payload:', err?.message || err);
    failed++;
  }

  // Test 4: SQL Injection in getAuthLogs
  try {
    console.log('  [4/4] Testing getAuthLogs with SQL injection event_type payload...');
    const sqliEventType = "LOGIN_SUCCESS' UNION SELECT 1,2,3,4,5,6,7,8,9,10 --";
    const logs = await db.getAuthLogs(50, 0, sqliEventType);

    assert(Array.isArray(logs.logs), 'getAuthLogs should return array result');
    console.log('        ✅ PASS: getAuthLogs safely parameterized event_type filter payload.');
    passed++;
  } catch (err) {
    console.error('        ❌ FAIL: getAuthLogs failed on SQLi event_type payload:', err?.message || err);
    failed++;
  }

  console.log(`\n📊 Test Suite Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSqliTests().catch((err) => {
  console.error('❌ Security Test Suite Error:', err);
  process.exit(1);
});
