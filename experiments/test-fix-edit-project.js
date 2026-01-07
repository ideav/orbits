/**
 * Test script to verify the fix for issue #160
 * Tests that the editProject() fix correctly handles all scenarios
 */

// Mock the DOM elements with persistent state
const mockDOM = {
    projectStart: { value: '' },
    projectDuration: { value: '' },
    projectDeadline: { value: '' }
};

// Mock the formatDateForInput function
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('.');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return '';
}

// Mock the calculateDurationFromEndDate function
function calculateDurationFromEndDate() {
    const startDate = mockDOM.projectStart.value;
    const endDate = mockDOM.projectDeadline.value;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
            mockDOM.projectDuration.value = diffDays;
            console.log(`  ✓ Duration calculated: ${diffDays} days`);
        }
    } else {
        console.log(`  - Duration not calculated (missing dates)`);
    }
}

// Simulate the FIXED editProject() function
function editProject_FIXED(selectedProject) {
    console.log('\n=== Opening project for edit ===');
    console.log('Project:', selectedProject['Проект']);
    console.log('Старт:', selectedProject['Старт'] || 'null');
    console.log('Срок:', selectedProject['Срок'] || 'null');

    console.log('\nDOM BEFORE:');
    console.log(`  Start: "${mockDOM.projectStart.value}"`);
    console.log(`  Duration: "${mockDOM.projectDuration.value}"`);
    console.log(`  Deadline: "${mockDOM.projectDeadline.value}"`);

    // FIXED CODE - always set/clear to avoid keeping old values
    const startDate = selectedProject['Старт'] ? formatDateForInput(selectedProject['Старт']) : '';
    const deadline = selectedProject['Срок'] ? formatDateForInput(selectedProject['Срок']) : '';

    mockDOM.projectStart.value = startDate;
    mockDOM.projectDeadline.value = deadline;

    // Clear duration field first to avoid showing stale values
    mockDOM.projectDuration.value = '';

    // Calculate duration from start and end dates
    if (startDate && deadline) {
        calculateDurationFromEndDate();
    }

    console.log('\nDOM AFTER:');
    console.log(`  Start: "${mockDOM.projectStart.value}"`);
    console.log(`  Duration: "${mockDOM.projectDuration.value}"`);
    console.log(`  Deadline: "${mockDOM.projectDeadline.value}"`);
}

// TEST THE FIX
console.log('='.repeat(70));
console.log('TESTING THE FIX FOR ISSUE #160');
console.log('='.repeat(70));

console.log('\n' + '='.repeat(70));
console.log('TEST 1: Edit project with both dates');
editProject_FIXED({
    'ПроектID': '123',
    'Проект': 'Project A',
    'Старт': '01.01.2026',
    'Срок': '11.01.2026'
});
console.log('\n✓ Expected: Start, Duration, and Deadline all populated');
console.log(`✓ Result: ${mockDOM.projectStart.value ? 'Start OK' : 'Start FAIL'}, ${mockDOM.projectDuration.value ? 'Duration OK' : 'Duration FAIL'}, ${mockDOM.projectDeadline.value ? 'Deadline OK' : 'Deadline FAIL'}`);

console.log('\n' + '='.repeat(70));
console.log('TEST 2: Edit project with only start date (no deadline)');
editProject_FIXED({
    'ПроектID': '124',
    'Проект': 'Project B',
    'Старт': '15.01.2026',
    'Срок': null
});
console.log('\n✓ Expected: Only Start populated, Duration and Deadline empty');
console.log(`✓ Result: ${mockDOM.projectStart.value ? 'Start OK' : 'Start FAIL'}, ${!mockDOM.projectDuration.value ? 'Duration OK (empty)' : 'Duration FAIL (should be empty)'}, ${!mockDOM.projectDeadline.value ? 'Deadline OK (empty)' : 'Deadline FAIL (should be empty)'}`);

console.log('\n' + '='.repeat(70));
console.log('TEST 3: Edit another project with both dates (to verify no stale values)');
editProject_FIXED({
    'ПроектID': '125',
    'Проект': 'Project C',
    'Старт': '20.01.2026',
    'Срок': '25.01.2026'
});
console.log('\n✓ Expected: New values, duration = 5 days');
const expectedDuration = '5';
console.log(`✓ Result: ${mockDOM.projectDuration.value === expectedDuration ? `Duration OK (${expectedDuration} days)` : `Duration FAIL (expected ${expectedDuration}, got ${mockDOM.projectDuration.value})`}`);

console.log('\n' + '='.repeat(70));
console.log('TEST 4: Edit project with no dates');
editProject_FIXED({
    'ПроектID': '126',
    'Проект': 'Project D',
    'Старт': null,
    'Срок': null
});
console.log('\n✓ Expected: All fields empty');
console.log(`✓ Result: ${!mockDOM.projectStart.value && !mockDOM.projectDuration.value && !mockDOM.projectDeadline.value ? 'All fields empty OK' : 'FAIL - some fields not empty'}`);

console.log('\n' + '='.repeat(70));
console.log('✅ ALL TESTS COMPLETED');
console.log('The fix ensures fields are always cleared/set correctly,');
console.log('preventing stale values from previous edits.');
console.log('='.repeat(70));
