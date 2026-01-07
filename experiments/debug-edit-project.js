/**
 * Debug script to simulate editProject() behavior
 * Issue: #160 - Duration and End Date fields not populated when reopening form
 */

// Mock the DOM elements
const mockDOM = {
    projectStart: { value: '' },
    projectDuration: { value: '' },
    projectDeadline: { value: '' }
};

// Mock the formatDateForInput function
function formatDateForInput(dateStr) {
    // Convert "DD.MM.YYYY" to "YYYY-MM-DD"
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
    console.log(`    startDate: "${startDate}"`);
    console.log(`    endDate: "${endDate}"`);

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Calculate difference in days
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
            mockDOM.projectDuration.value = diffDays;
            console.log(`    ✓ Duration calculated: ${diffDays} days`);
        } else {
            console.log(`    ✗ Duration is negative: ${diffDays}`);
        }
    } else {
        console.log(`    ✗ Missing dates - cannot calculate`);
    }
}

// Simulate the editProject() function
function simulateEditProject(selectedProject) {
    console.log('\n=== Simulating editProject() ===');
    console.log('Selected project:', selectedProject);
    console.log('');

    // Set dates (lines 1327-1332 in projects.js)
    if (selectedProject['Старт']) {
        mockDOM.projectStart.value = formatDateForInput(selectedProject['Старт']);
        console.log(`1. Set projectStart: "${mockDOM.projectStart.value}"`);
    }
    if (selectedProject['Срок']) {
        mockDOM.projectDeadline.value = formatDateForInput(selectedProject['Срок']);
        console.log(`2. Set projectDeadline: "${mockDOM.projectDeadline.value}"`);
    }

    console.log('');

    // Calculate duration from start and end dates (lines 1334-1337)
    if (selectedProject['Старт'] && selectedProject['Срок']) {
        console.log('3. Calling calculateDurationFromEndDate()...');
        calculateDurationFromEndDate();
    } else {
        console.log('3. ✗ Skipping calculateDurationFromEndDate() - missing dates');
    }

    console.log('');
    console.log('=== Final DOM state ===');
    console.log(`projectStart: "${mockDOM.projectStart.value}"`);
    console.log(`projectDuration: "${mockDOM.projectDuration.value}"`);
    console.log(`projectDeadline: "${mockDOM.projectDeadline.value}"`);
}

// Test case 1: Normal project with both dates
console.log('\n' + '='.repeat(60));
console.log('TEST 1: Normal project with both dates');
console.log('='.repeat(60));
simulateEditProject({
    'ПроектID': '123',
    'Проект': 'Test Project',
    'Старт': '01.01.2026',
    'Срок': '11.01.2026'
});

// Test case 2: Project with only start date
console.log('\n' + '='.repeat(60));
console.log('TEST 2: Project with only start date');
console.log('='.repeat(60));
simulateEditProject({
    'ПроектID': '124',
    'Проект': 'Test Project 2',
    'Старт': '01.01.2026',
    'Срок': null
});

// Test case 3: Project with empty string dates
console.log('\n' + '='.repeat(60));
console.log('TEST 3: Project with empty string dates');
console.log('='.repeat(60));
simulateEditProject({
    'ПроектID': '125',
    'Проект': 'Test Project 3',
    'Старт': '',
    'Срок': ''
});

// Test case 4: Project with date in wrong format
console.log('\n' + '='.repeat(60));
console.log('TEST 4: Project with date in YYYY-MM-DD format (wrong)');
console.log('='.repeat(60));
simulateEditProject({
    'ПроектID': '126',
    'Проект': 'Test Project 4',
    'Старт': '2026-01-01',
    'Срок': '2026-01-11'
});
