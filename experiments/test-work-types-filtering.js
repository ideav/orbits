/**
 * Test script to verify work types filtering logic for issue #319
 *
 * This simulates the filtering logic used in openCreateOperationModal
 * to understand why extra work types might be shown.
 */

// Sample data from issue #319
const workTypesFromAPI = [
    {
        "Смета": "Монтаж каркаса",
        "СметаID": "6972",
        "СметаOrder": "1",
        "Ед.изм.ID": "1037",
        "К-во": "5.00",
        "Цена за ед.": "",
        "Виды работ": "5623,5234"
    },
    {
        "Смета": "Монтаж заполнений",
        "СметаID": "6976",
        "СметаOrder": "2",
        "Ед.изм.ID": "1037",
        "К-во": "15.00",
        "Цена за ед.": "1200.00",
        "Виды работ": "5364,5356"
    },
    {
        "Смета": "Монтаж примыканий",
        "СметаID": "6973",
        "СметаOrder": "3",
        "Ед.изм.ID": "1038",
        "К-во": "5.00",
        "Цена за ед.": "",
        "Виды работ": "5234,5348"
    },
    {
        "Смета": "Отдирание пленки",
        "СметаID": "7295",
        "СметаOrder": "4",
        "Ед.изм.ID": "",
        "К-во": "",
        "Цена за ед.": "",
        "Виды работ": "5632"
    }
];

// Mock work types reference (just IDs for this test)
const workTypesReference = [
    { "Вид работID": "5623", "Вид работ": "Work Type A" },
    { "Вид работID": "5234", "Вид работ": "Work Type B" },
    { "Вид работID": "5364", "Вид работ": "Work Type C" },
    { "Вид работID": "5356", "Вид работ": "Work Type D" },
    { "Вид работID": "5348", "Вид работ": "Work Type E" },
    { "Вид работID": "5632", "Вид работ": "Work Type F" }
];

console.log("=== Test Case 1: Correct estimateId (6972) ===");
testFiltering("6972");

console.log("\n=== Test Case 2: Empty string estimateId ===");
testFiltering("");

console.log("\n=== Test Case 3: Null estimateId ===");
testFiltering(null);

console.log("\n=== Test Case 4: Undefined estimateId ===");
testFiltering(undefined);

console.log("\n=== Test Case 5: Whitespace estimateId ===");
testFiltering("  ");

console.log("\n=== Test Case 6: Wrong estimateId (9999) ===");
testFiltering("9999");

function testFiltering(estimateId) {
    console.log(`Input estimateId: "${estimateId}" (type: ${typeof estimateId})`);

    // OLD LOGIC (from before the fix)
    const oldRelevantEstimates = estimateId
        ? workTypesFromAPI.filter(estimate => String(estimate['СметаID']) === String(estimateId))
        : workTypesFromAPI;

    // NEW LOGIC (with the fix)
    const hasEstimateId = estimateId && String(estimateId).trim() !== '';
    const newRelevantEstimates = hasEstimateId
        ? workTypesFromAPI.filter(estimate => String(estimate['СметаID']) === String(estimateId))
        : workTypesFromAPI;

    // Collect work types
    const oldWorkTypes = new Map();
    oldRelevantEstimates.forEach(estimate => {
        if (estimate['Виды работ']) {
            const workTypeIds = estimate['Виды работ'].split(',').filter(Boolean);
            workTypeIds.forEach(id => {
                const workType = workTypesReference.find(wt => String(wt['Вид работID']) === String(id));
                if (workType && !oldWorkTypes.has(id)) {
                    oldWorkTypes.set(id, workType['Вид работ']);
                }
            });
        }
    });

    const newWorkTypes = new Map();
    newRelevantEstimates.forEach(estimate => {
        if (estimate['Виды работ']) {
            const workTypeIds = estimate['Виды работ'].split(',').filter(Boolean);
            workTypeIds.forEach(id => {
                const workType = workTypesReference.find(wt => String(wt['Вид работID']) === String(id));
                if (workType && !newWorkTypes.has(id)) {
                    newWorkTypes.set(id, workType['Вид работ']);
                }
            });
        }
    });

    console.log(`OLD LOGIC:`);
    console.log(`  - Filtered estimates: ${oldRelevantEstimates.length}`);
    console.log(`  - Work types count: ${oldWorkTypes.size}`);
    console.log(`  - Work type IDs: [${Array.from(oldWorkTypes.keys()).join(', ')}]`);

    console.log(`NEW LOGIC (hasEstimateId: ${hasEstimateId}):`);
    console.log(`  - Filtered estimates: ${newRelevantEstimates.length}`);
    console.log(`  - Work types count: ${newWorkTypes.size}`);
    console.log(`  - Work type IDs: [${Array.from(newWorkTypes.keys()).join(', ')}]`);

    const different = oldWorkTypes.size !== newWorkTypes.size;
    console.log(`RESULT: ${different ? '⚠️  DIFFERENT' : '✓ SAME'}`);
}

console.log("\n=== Expected Result for estimateId='6972' ===");
console.log("Should show ONLY 2 work types: 5623, 5234");
console.log("from estimate 'Монтаж каркаса'");
