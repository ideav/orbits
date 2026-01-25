/**
 * Debug script for issue #321
 * Investigate work types filtering for estimateID 6972
 */

const https = require('https');

// Configuration
const db = 'integram';
const host = 'integram.io';
const projectId = '7213'; // From screenshot console

async function fetchReport(reportId, params = '') {
    return new Promise((resolve, reject) => {
        const url = `https://${host}/${db}/report/${reportId}?JSON_KV${params}`;
        console.log(`Fetching: ${url}`);

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}

async function main() {
    console.log('=== Debugging Issue #321 ===\n');

    try {
        // Fetch report/6631 (work types by estimate)
        console.log('Fetching report/6631 (work types by estimate)...');
        const workTypes = await fetchReport('6631', `&FR_ProjectID=${projectId}`);

        console.log(`Total estimates in report: ${workTypes.length}\n`);

        // Find estimate with ID 6972
        const estimate6972 = workTypes.find(e => String(e['СметаID']) === '6972');

        if (estimate6972) {
            console.log('Found estimate 6972:');
            console.log(JSON.stringify(estimate6972, null, 2));
            console.log('\nWork types for this estimate:', estimate6972['Виды работ']);

            if (estimate6972['Виды работ']) {
                const workTypeIds = estimate6972['Виды работ'].split(',').filter(Boolean);
                console.log('Work type IDs:', workTypeIds);
                console.log('Expected count: 2 (should be 5623, 5234)');
                console.log('Actual count:', workTypeIds.length);
            }
        } else {
            console.log('Estimate 6972 NOT FOUND!');
            console.log('\nAll estimate IDs in report:');
            workTypes.forEach(e => {
                console.log(`  - СметаID: ${e['СметаID']}, Смета: ${e['Смета']}`);
            });
        }

        // Also fetch work types reference
        console.log('\n\nFetching report/5909 (work types reference)...');
        const workTypesRef = await fetchReport('5909', `&FR_ProjectID=${projectId}`);
        console.log(`Total work types in reference: ${workTypesRef.length}`);

        // Find work types 5623 and 5234
        const wt5623 = workTypesRef.find(w => String(w['Вид работID']) === '5623');
        const wt5234 = workTypesRef.find(w => String(w['Вид работID']) === '5234');

        console.log('\nExpected work types:');
        if (wt5623) {
            console.log(`  5623: ${wt5623['Вид работ']}`);
        } else {
            console.log('  5623: NOT FOUND');
        }

        if (wt5234) {
            console.log(`  5234: ${wt5234['Вид работ']}`);
        } else {
            console.log('  5234: NOT FOUND');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
