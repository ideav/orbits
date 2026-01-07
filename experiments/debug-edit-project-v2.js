/**
 * Debug script to demonstrate the ACTUAL bug in editProject()
 * Issue: #160 - Fields retain old values when editing different projects
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

    console.log(`  calculateDurationFromEndDate called:`);
    console.log(`    startDate from field: "${startDate}"`);
    console.log(`    endDate from field: "${endDate}"`);

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
            mockDOM.projectDuration.value = diffDays;
            console.log(`    ✓ Duration calculated: ${diffDays} days`);
        }
    } else {
        console.log(`    ✗ Cannot calculate - missing dates`);
    }
}

// Simulate the CURRENT (buggy) editProject() function
function editProject_BUGGY(selectedProject) {
    console.log('\n=== Opening project for edit ===');
    console.log('Project:', selectedProject['Проект']);
    console.log('Старт:', selectedProject['Старт']);
    console.log('Срок:', selectedProject['Срок']);
    console.log('');

    console.log('DOM state BEFORE editing:');
    console.log(`  projectStart: "${mockDOM.projectStart.value}"`);
    console.log(`  projectDuration: "${mockDOM.projectDuration.value}"`);
    console.log(`  projectDeadline: "${mockDOM.projectDeadline.value}"`);
    console.log('');

    // Set dates (BUGGY CODE - doesn't clear fields if value is missing!)
    if (selectedProject['Старт']) {
        mockDOM.projectStart.value = formatDateForInput(selectedProject['Старт']);
        console.log(`Set projectStart: "${mockDOM.projectStart.value}"`);
    } else {
        console.log(`⚠️  Старт is missing - field NOT cleared!`);
    }
    if (selectedProject['Срок']) {
        mockDOM.projectDeadline.value = formatDateForInput(selectedProject['Срок']);
        console.log(`Set projectDeadline: "${mockDOM.projectDeadline.value}"`);
    } else {
        console.log(`⚠️  Срок is missing - field NOT cleared!`);
    }

    console.log('');

    // Calculate duration
    if (selectedProject['Старт'] && selectedProject['Срок']) {
        console.log('Calling calculateDurationFromEndDate()...');
        calculateDurationFromEndDate();
    } else {
        console.log('⚠️  Not calling calculateDurationFromEndDate() - missing dates in selectedProject');
        console.log('   BUT the fields might still have old values!');
    }

    console.log('');
    console.log('DOM state AFTER editing:');
    console.log(`  projectStart: "${mockDOM.projectStart.value}"`);
    console.log(`  projectDuration: "${mockDOM.projectDuration.value}"`);
    console.log(`  projectDeadline: "${mockDOM.projectDeadline.value}"`);
}

// DEMONSTRATE THE BUG
console.log('\n' + '='.repeat(70));
console.log('DEMONSTRATING THE BUG');
console.log('='.repeat(70));

console.log('\nStep 1: Edit Project A (has both dates)');
editProject_BUGGY({
    'ПроектID': '123',
    'Проект': 'Project A',
    'Старт': '01.01.2026',
    'Срок': '11.01.2026'
});

console.log('\n' + '-'.repeat(70));
console.log('Step 2: User closes modal');
console.log('(Fields keep their values - no form reset)');

console.log('\n' + '-'.repeat(70));
console.log('Step 3: Edit Project B (has only start date, NO deadline)');
editProject_BUGGY({
    'ПроектID': '124',
    'Проект': 'Project B',
    'Старт': '15.01.2026',
    'Срок': null  // This project has NO deadline!
});

console.log('\n' + '='.repeat(70));
console.log('🐛 BUG RESULT:');
console.log('   Project B has no Срок, but the form shows deadline from Project A!');
console.log('   The duration field also shows old value!');
console.log('='.repeat(70));
