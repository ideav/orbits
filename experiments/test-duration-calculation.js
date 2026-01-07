/**
 * Test script to verify duration calculation logic
 * Issue: #160 - Duration and End Date fields not populated when reopening form
 */

// Simulate the calculateDurationFromEndDate function
function calculateDurationFromEndDate(startDate, endDate) {
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Calculate difference in days
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
            return diffDays;
        }
    }
    return null;
}

// Test cases
console.log('Test 1: Normal case - 10 days between dates');
const result1 = calculateDurationFromEndDate('2026-01-01', '2026-01-11');
console.log(`Result: ${result1} days (expected: 10)`);

console.log('\nTest 2: Same day');
const result2 = calculateDurationFromEndDate('2026-01-01', '2026-01-01');
console.log(`Result: ${result2} days (expected: 0)`);

console.log('\nTest 3: Empty values');
const result3 = calculateDurationFromEndDate('', '');
console.log(`Result: ${result3} (expected: null)`);

console.log('\nTest 4: From issue #159 - typical project duration');
const result4 = calculateDurationFromEndDate('2026-01-07', '2026-02-07');
console.log(`Result: ${result4} days (expected: 31)`);

// Simulate the issue scenario
console.log('\n=== Simulating Issue #160 ===');
console.log('Scenario: Project has Старт=2026-01-01 and Срок=2026-01-11 in DB');
console.log('Expected: Duration field should show 10 days');
console.log('Actual behavior: Duration field is empty (not calculated)');
console.log('\nRoot cause hypothesis:');
console.log('- calculateDurationFromEndDate() is called at line 1336');
console.log('- But the date inputs might not be fully set yet');
console.log('- The function needs the values to be in the input fields, not just set via .value');
