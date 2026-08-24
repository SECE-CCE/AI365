import {
  isValidSeceEmail,
  isValidId,
  isValidNumber,
  isValidPagination,
  isValidDate,
  isValidMonthlyResearchBoundary,
  isValidDocumentFile,
  isValidGithubUrl,
} from './api/_validators/index.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('---------------------------------------------------------');
console.log('🧪 RUNNING CENTRALIZED SERVER-SIDE VALIDATION TEST SUITE');
console.log('---------------------------------------------------------');

// 1. SECE Email Restriction Tests
console.log('\n📧 1. SECE Email Validation (@sece.ac.in):');
assert(isValidSeceEmail('student@sece.ac.in') === true, 'Accept valid student email (student@sece.ac.in)');
assert(isValidSeceEmail('FACULTY.NAME@SECE.AC.IN') === true, 'Accept uppercase faculty email (FACULTY.NAME@SECE.AC.IN)');
assert(isValidSeceEmail('alex.24cc009@sece.ac.in') === true, 'Accept sub-formatted student email');
assert(isValidSeceEmail('user@gmail.com') === false, 'Reject @gmail.com domain');
assert(isValidSeceEmail('user@yahoo.com') === false, 'Reject @yahoo.com domain');
assert(isValidSeceEmail('user@outlook.com') === false, 'Reject @outlook.com domain');
assert(isValidSeceEmail('user@sece.com') === false, 'Reject @sece.com fake domain');
assert(isValidSeceEmail('user@sece.ac.in.other.com') === false, 'Reject domain spoofing bypass');
assert(isValidSeceEmail('invalid-email') === false, 'Reject malformed non-email string');

// 2. Out-of-Bound & Parameter Validation Tests
console.log('\n🔢 2. Out-of-Bound Request Parameter Validation:');
assert(isValidId(1) === true, 'Accept valid ID 1');
assert(isValidId(500) === true, 'Accept valid ID 500');
assert(isValidId(0) === false, 'Reject ID 0');
assert(isValidId(-15) === false, 'Reject negative ID -15');
assert(isValidId('invalid') === false, 'Reject non-numeric ID');
assert(isValidId(3.14) === false, 'Reject float ID');
assert(isValidId(999999999999) === false, 'Reject excessive ID');

assert(isValidNumber(10, { min: 0.5, max: 100 }) === true, 'Accept number within bounds (10 in [0.5, 100])');
assert(isValidNumber(-5, { min: 0 }) === false, 'Reject negative number when min=0');
assert(isValidNumber(5000, { max: 1000 }) === false, 'Reject excessive number above max=1000');

assert(isValidPagination({ page: 1, limit: 20 }).valid === true, 'Accept valid pagination (page=1, limit=20)');
assert(isValidPagination({ page: -1 }).valid === false, 'Reject negative page (-1)');
assert(isValidPagination({ limit: 500 }).valid === false, 'Reject excessive limit (500)');
assert(isValidPagination({ offset: -10 }).valid === false, 'Reject negative offset (-10)');

assert(isValidDate('2026-08-24') === true, 'Accept valid calendar date 2026-08-24');
assert(isValidDate('2026-02-31') === false, 'Reject invalid calendar date Feb 31');
assert(isValidDate('invalid-date') === false, 'Reject malformed date string');
assert(isValidDate('0000-00-00') === false, 'Reject 0000-00-00');

// 3. File Extensions & GitHub Link Validation
console.log('\n📁 3. File Extensions, MIME Types & GitHub Links:');
assert(isValidDocumentFile('certificate.pdf').valid === true, 'Accept .pdf extension');
assert(isValidDocumentFile('document.doc').valid === true, 'Accept .doc extension');
assert(isValidDocumentFile('paper.docx').valid === true, 'Accept .docx extension');
assert(isValidDocumentFile('malware.exe').valid === false, 'Reject .exe extension');
assert(isValidDocumentFile('archive.zip').valid === false, 'Reject .zip extension');
assert(isValidDocumentFile('script.js').valid === false, 'Reject .js extension');
assert(isValidDocumentFile('image.png').valid === false, 'Reject .png extension for document uploads');
assert(isValidDocumentFile('double.pdf.exe').valid === false, 'Reject double extension bypass (double.pdf.exe)');
assert(isValidDocumentFile('file.pdf', 'data:application/pdf;base64,JVBERi...', 1000).valid === true, 'Accept valid PDF base64 payload');
assert(isValidDocumentFile('file.pdf', 'data:application/x-executable;base64,EX...', 1000).valid === false, 'Reject executable MIME type payload');
assert(isValidDocumentFile('file.pdf', undefined, 20 * 1024 * 1024).valid === false, 'Reject oversized file (>10MB)');

assert(isValidGithubUrl('https://github.com/SECE-CCE/AI365') === true, 'Accept valid GitHub repo URL');
assert(isValidGithubUrl('https://github.com/owner/repository.git') === true, 'Accept valid GitHub .git URL');
assert(isValidGithubUrl('https://github.com/owner/repository/tree/main') === true, 'Accept valid GitHub branch URL');
assert(isValidGithubUrl('https://gitlab.com/owner/repo') === false, 'Reject non-GitHub URL (gitlab.com)');
assert(isValidGithubUrl('invalid-url') === false, 'Reject invalid URL string');
assert(isValidGithubUrl('javascript:alert(1)') === false, 'Reject XSS pseudo-protocol URL');

// 4. Research Paper Monthly Boundary Validation Tests
console.log('\n📅 4. Research Paper Monthly Boundary Validation:');
assert(isValidMonthlyResearchBoundary('2026-08-01').valid === true, 'Accept month start date (2026-08-01)');
assert(isValidMonthlyResearchBoundary('2026-08-31').valid === true, 'Accept month end date (2026-08-31)');
assert(isValidMonthlyResearchBoundary('2026-02-28').valid === true, 'Accept Feb month end date (2026-02-28)');
assert(isValidMonthlyResearchBoundary('2026-02-31').valid === false, 'Reject Feb 31 invalid calendar date');

// Month Transition Tests
assert(isValidMonthlyResearchBoundary('2026-01-31').valid === true, 'Transition Test: Jan 31 (Jan->Feb transition)');
assert(isValidMonthlyResearchBoundary('2026-02-01').valid === true, 'Transition Test: Feb 01 (Jan->Feb transition)');
assert(isValidMonthlyResearchBoundary('2026-02-28').valid === true, 'Transition Test: Feb 28 (Feb->Mar transition)');
assert(isValidMonthlyResearchBoundary('2026-03-01').valid === true, 'Transition Test: Mar 01 (Feb->Mar transition)');
assert(isValidMonthlyResearchBoundary('2025-12-31').valid === true, 'Transition Test: Dec 31 (Dec->Jan transition)');
assert(isValidMonthlyResearchBoundary('2026-01-01').valid === true, 'Transition Test: Jan 01 (Dec->Jan transition)');

assert(isValidMonthlyResearchBoundary('2099-12-01').valid === false, 'Reject future month date (2099-12-01)');
assert(isValidMonthlyResearchBoundary('1999-05-15').valid === false, 'Reject historical year before program start (<2020)');

console.log('\n---------------------------------------------------------');
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('---------------------------------------------------------');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✨ All validation rules passed successfully!');
  process.exit(0);
}
