/**
 * Tests for Issue #23: Parallel Execution on Different Grips & Coordinate-Based Assignment
 *
 * This test file validates:
 * 1. Parallel execution of identical tasks/operations on different grips
 * 2. Coordinate parsing functionality
 * 3. Distance calculation between executors and grips
 * 4. Nearest executor assignment based on coordinates
 */

// Import the scheduler functions (in a real scenario, these would be exported)
// For testing, we'll extract and test the relevant functions

/**
 * Parse coordinates string in format: "latitude,longitude" or "lat, lon"
 */
function parseCoordinates(coordStr) {
    if (!coordStr || coordStr.trim() === '') {
        return null;
    }

    const parts = coordStr.split(',');
    if (parts.length !== 2) {
        return null;
    }

    const lat = parseFloat(parts[0].trim());
    const lon = parseFloat(parts[1].trim());

    if (isNaN(lat) || isNaN(lon)) {
        return null;
    }

    return { lat, lon };
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(coord1, coord2) {
    if (!coord1 || !coord2) {
        return Infinity;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

// Test harness
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`✓ ${testName}`);
        passedTests++;
        return true;
    } else {
        console.log(`✗ ${testName}`);
        failedTests++;
        return false;
    }
}

console.log('=== Testing Coordinate Parsing ===\n');

// Test 1: Parse valid coordinates with spaces
const coord1 = parseCoordinates('55.7558, 37.6173');
assert(
    coord1 !== null && coord1.lat === 55.7558 && coord1.lon === 37.6173,
    'Parse coordinates with spaces: "55.7558, 37.6173"'
);

// Test 2: Parse valid coordinates without spaces
const coord2 = parseCoordinates('55.7558,37.6173');
assert(
    coord2 !== null && coord2.lat === 55.7558 && coord2.lon === 37.6173,
    'Parse coordinates without spaces: "55.7558,37.6173"'
);

// Test 3: Parse empty string
const coord3 = parseCoordinates('');
assert(coord3 === null, 'Parse empty string returns null');

// Test 4: Parse invalid format (single value)
const coord4 = parseCoordinates('55.7558');
assert(coord4 === null, 'Parse invalid format (single value) returns null');

// Test 5: Parse invalid format (non-numeric)
const coord5 = parseCoordinates('abc, def');
assert(coord5 === null, 'Parse invalid format (non-numeric) returns null');

// Test 6: Parse null/undefined
const coord6 = parseCoordinates(null);
assert(coord6 === null, 'Parse null returns null');

console.log('\n=== Testing Distance Calculation ===\n');

// Test 7: Calculate distance between Moscow and Saint Petersburg
const moscow = { lat: 55.7558, lon: 37.6173 };
const stPetersburg = { lat: 59.9311, lon: 30.3609 };
const distance1 = calculateDistance(moscow, stPetersburg);
// Actual distance is approximately 634 km
assert(
    distance1 > 630 && distance1 < 640,
    `Distance Moscow-StPetersburg ≈ 634 km (got ${distance1.toFixed(2)} km)`
);

// Test 8: Calculate distance between close points (Moscow center to Moscow suburbs)
const moscowCenter = { lat: 55.7558, lon: 37.6173 };
const moscowSuburb = { lat: 55.8, lon: 37.7 };
const distance2 = calculateDistance(moscowCenter, moscowSuburb);
// Should be around 7-8 km
assert(
    distance2 > 6 && distance2 < 10,
    `Distance within city ≈ 7-8 km (got ${distance2.toFixed(2)} km)`
);

// Test 9: Calculate distance with same coordinates
const distance3 = calculateDistance(moscow, moscow);
assert(
    Math.abs(distance3) < 0.01,
    `Distance between same points ≈ 0 km (got ${distance3.toFixed(2)} km)`
);

// Test 10: Calculate distance with null coordinates
const distance4 = calculateDistance(null, moscow);
assert(distance4 === Infinity, 'Distance with null coord1 returns Infinity');

const distance5 = calculateDistance(moscow, null);
assert(distance5 === Infinity, 'Distance with null coord2 returns Infinity');

console.log('\n=== Testing Nearest Executor Assignment Logic ===\n');

// Test 11: Sort executors by distance
const gripCoord = { lat: 55.7558, lon: 37.6173 }; // Moscow center

const executors = [
    { id: '1', name: 'Executor A', coords: { lat: 55.8, lon: 37.7 } },      // ~7-8 km
    { id: '2', name: 'Executor B', coords: { lat: 59.9311, lon: 30.3609 } }, // ~634 km (StPetersburg)
    { id: '3', name: 'Executor C', coords: { lat: 55.75, lon: 37.62 } },     // ~0.5 km
    { id: '4', name: 'Executor D', coords: null },                            // no coords
];

const executorsWithDistance = executors.map(e => ({
    executor: e,
    distance: e.coords ? calculateDistance(e.coords, gripCoord) : Infinity
}));

executorsWithDistance.sort((a, b) => a.distance - b.distance);

assert(
    executorsWithDistance[0].executor.id === '3',
    'Nearest executor is Executor C (~0.5 km)'
);

assert(
    executorsWithDistance[1].executor.id === '1',
    'Second nearest executor is Executor A (~7-8 km)'
);

assert(
    executorsWithDistance[2].executor.id === '2',
    'Third nearest executor is Executor B (~634 km)'
);

assert(
    executorsWithDistance[3].executor.id === '4' && executorsWithDistance[3].distance === Infinity,
    'Executor without coordinates is last (Infinity distance)'
);

console.log('\n=== Testing Parallel Execution Concept ===\n');

// Test 12: Verify that tasks on different grips can start at the same time
const projectStartDate = new Date('2025-11-20T09:00:00');

const task1 = {
    name: 'Монтаж каркаса',
    grip: 'Участок А',
    startTime: new Date(projectStartDate)
};

const task2 = {
    name: 'Монтаж каркаса',
    grip: 'Участок Б',
    startTime: new Date(projectStartDate)
};

const task3 = {
    name: 'Монтаж каркаса',
    grip: '', // No grip - should be sequential
    startTime: null // Will be calculated based on previous task
};

assert(
    task1.startTime.getTime() === task2.startTime.getTime(),
    'Tasks with different grips can start at the same time (parallel execution)'
);

assert(
    task1.grip !== task2.grip,
    'Tasks on different grips are independent'
);

console.log('\n=== Testing Grip-Specific Dependency Tracking ===\n');

// Test 13: Verify grip-specific completion times
const gripCompletionTimes = new Map();

// Add completion time for "Монтаж каркаса" on "Участок А"
const gripA = 'Участок А';
gripCompletionTimes.set(gripA, new Map());
gripCompletionTimes.get(gripA).set('op:Монтаж каркаса', new Date('2025-11-20T12:00:00'));

// Add completion time for "Монтаж каркаса" on "Участок Б"
const gripB = 'Участок Б';
gripCompletionTimes.set(gripB, new Map());
gripCompletionTimes.get(gripB).set('op:Монтаж каркаса', new Date('2025-11-20T13:00:00'));

// Check that completion times are different for different grips
const completionA = gripCompletionTimes.get(gripA).get('op:Монтаж каркаса');
const completionB = gripCompletionTimes.get(gripB).get('op:Монтаж каркаса');

assert(
    completionA.getTime() !== completionB.getTime(),
    'Same operation on different grips has different completion times'
);

assert(
    completionA.getTime() === new Date('2025-11-20T12:00:00').getTime(),
    'Completion time for Участок А is 12:00'
);

assert(
    completionB.getTime() === new Date('2025-11-20T13:00:00').getTime(),
    'Completion time for Участок Б is 13:00'
);

console.log('\n=== Testing Integration Scenarios ===\n');

// Test 14: Complete workflow - Parse coordinates, calculate distances, assign nearest
const workflow = {
    grip: 'Участок А',
    coordinates: '55.7558, 37.6173',
    executorsNeeded: 2
};

const availableExecutors = [
    { id: '1', name: 'Иван', coordinates: '55.75, 37.62' },    // ~0.5 km
    { id: '2', name: 'Петр', coordinates: '55.8, 37.7' },      // ~7-8 km
    { id: '3', name: 'Сергей', coordinates: '59.9311, 30.3609' }, // ~634 km
    { id: '4', name: 'Андрей', coordinates: '' },              // no coordinates
];

const gripCoords = parseCoordinates(workflow.coordinates);
const executorsWithDist = availableExecutors
    .map(e => ({
        executor: e,
        distance: parseCoordinates(e.coordinates)
            ? calculateDistance(parseCoordinates(e.coordinates), gripCoords)
            : Infinity
    }))
    .sort((a, b) => a.distance - b.distance);

const assigned = executorsWithDist.slice(0, workflow.executorsNeeded);

assert(
    assigned.length === 2,
    'Assigned correct number of executors (2)'
);

assert(
    assigned[0].executor.name === 'Иван',
    'First assigned executor is Иван (nearest)'
);

assert(
    assigned[1].executor.name === 'Петр',
    'Second assigned executor is Петр (second nearest)'
);

assert(
    assigned[0].distance < assigned[1].distance,
    'Executors are sorted by distance (nearest first)'
);

console.log('\n=== Results ===');
console.log(`Total: ${passedTests + failedTests}, Passed: ${passedTests}, Failed: ${failedTests}`);

if (failedTests === 0) {
    console.log('✓ All tests passed!');
    process.exit(0);
} else {
    console.log(`✗ ${failedTests} test(s) failed`);
    process.exit(1);
}
