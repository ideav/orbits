/**
 * Experiment script to reproduce issue #58
 * Error: Cannot read properties of undefined (reading 'reqs')
 *
 * The issue occurs when the API returns metadata as an object (not array),
 * but the code tries to access metadata[0] which results in undefined.
 */

(function() {
    'use strict';

    console.log('=== Testing Issue #58: Metadata Response Format ===\n');

    // This is the actual response from the API as shown in issue #58
    const actualApiResponse = {
        "id": "663",
        "up": "0",
        "type": "3",
        "val": "Проект",
        "unique": "0",
        "reqs": [
            {
                "num": 1,
                "id": "664",
                "orig": "119",
                "val": "Описание",
                "type": "12"
            },
            {
                "num": 2,
                "id": "667",
                "orig": "665",
                "val": "Заказчик",
                "type": "3",
                "ref": "665",
                "ref_id": "666"
            }
            // ... more fields
        ]
    };

    console.log('1. Actual API response type:', typeof actualApiResponse);
    console.log('   Is array?', Array.isArray(actualApiResponse));
    console.log('   Has reqs?', 'reqs' in actualApiResponse);
    console.log('   reqs.length:', actualApiResponse.reqs?.length);

    console.log('\n--- Testing CURRENT (BUGGY) code pattern ---');

    // This is what the current code does (BUGGY)
    const metadata = actualApiResponse;  // API returns object directly
    const projectMetadata = metadata[0]; // Trying to access [0] on object!

    console.log('2. metadata[0] =', projectMetadata);
    console.log('   Type:', typeof projectMetadata);

    try {
        console.log('3. Trying to access projectMetadata.reqs.length...');
        const length = projectMetadata.reqs.length;
        console.log('   SUCCESS: length =', length);
    } catch (error) {
        console.error('   ✗ ERROR:', error.message);
        console.error('   This is the bug from issue #58!');
    }

    console.log('\n--- Testing FIXED code pattern ---');

    // Fix approach 1: Check if response is array or object
    const metadataFixed = actualApiResponse;
    const projectMetadataFixed = Array.isArray(metadataFixed) ? metadataFixed[0] : metadataFixed;

    console.log('4. Fixed metadata access:');
    console.log('   Type:', typeof projectMetadataFixed);
    console.log('   Has reqs?', 'reqs' in projectMetadataFixed);

    try {
        console.log('5. Trying to access projectMetadataFixed.reqs.length...');
        const length = projectMetadataFixed.reqs.length;
        console.log('   ✓ SUCCESS: length =', length);
    } catch (error) {
        console.error('   ✗ ERROR:', error.message);
    }

    console.log('\n--- Testing both response formats ---');

    // Test with array response (if API sometimes returns array)
    const arrayResponse = [actualApiResponse];
    console.log('6. Testing with array-wrapped response:');
    console.log('   Is array?', Array.isArray(arrayResponse));

    const metadataFromArray = Array.isArray(arrayResponse) ? arrayResponse[0] : arrayResponse;
    console.log('   Extracted metadata has reqs?', 'reqs' in metadataFromArray);
    console.log('   reqs.length:', metadataFromArray.reqs.length);

    // Test with object response (current issue)
    console.log('\n7. Testing with object response (issue #58):');
    console.log('   Is array?', Array.isArray(actualApiResponse));

    const metadataFromObject = Array.isArray(actualApiResponse) ? actualApiResponse[0] : actualApiResponse;
    console.log('   Extracted metadata has reqs?', 'reqs' in metadataFromObject);
    console.log('   reqs.length:', metadataFromObject.reqs.length);

    console.log('\n=== Conclusion ===');
    console.log('The fix: Use Array.isArray() check to handle both formats:');
    console.log('  const projectMetadata = Array.isArray(metadata) ? metadata[0] : metadata;');
    console.log('\nThis will work whether API returns:');
    console.log('  - Object directly: { id: "663", reqs: [...] }');
    console.log('  - Array with object: [{ id: "663", reqs: [...] }]');

})();
