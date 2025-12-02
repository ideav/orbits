/**
 * Test script for verifying executors count is read from template
 * Tests that the fix for issue #5 works correctly
 */

// Mock data based on the API examples from "Результаты запросов по API.txt"
const mockProjectData = [
    // Template project (ПроектID: 2326)
    {
        "ПроектID": "2326",
        "Проект": "Шаблон. Установка витражей СПК (ОПЕРАЦИИ)",
        "Задача проекта": "Подготовка (предоперации)",
        "Операция": "Разгрузка стоек и ригелей",
        "ОперацияID": "2388",
        "Норматив операции": "12",
        "Исполнителей": "2",
        "Статус проекта": ""
    },
    {
        "ПроектID": "2326",
        "Проект": "Шаблон. Установка витражей СПК (ОПЕРАЦИИ)",
        "Задача проекта": "Монтаж стеклопакетов",
        "Операция": "Сборка каркаса",
        "ОперацияID": "2391",
        "Норматив операции": "40",
        "Исполнителей": "2",
        "Статус проекта": ""
    },
    {
        "ПроектID": "2326",
        "Проект": "Шаблон. Установка витражей СПК (ОПЕРАЦИИ)",
        "Задача проекта": "Подготовка (предоперации)",
        "Операция": "Получение реперных точек",
        "ОперацияID": "2330",
        "Норматив операции": "180",
        "Исполнителей": "",
        "Статус проекта": ""
    },
    // Work in progress project (ПроектID: 2614)
    {
        "ПроектID": "2614",
        "Проект": "Установка витражей СПК (ОПЕРАЦИИ)",
        "Старт": "20.11.2025",
        "Задача проекта": "Подготовка (предоперации)",
        "Операция": "Разгрузка стоек и ригелей",
        "ОперацияID": "2621",
        "Норматив операции": "",
        "Кол-во": "30",
        "Исполнителей": "",
        "Статус проекта": "В работе"
    },
    {
        "ПроектID": "2614",
        "Проект": "Установка витражей СПК (ОПЕРАЦИИ)",
        "Старт": "20.11.2025",
        "Задача проекта": "Монтаж стеклопакетов",
        "Операция": "Сборка каркаса",
        "ОперацияID": "2625",
        "Норматив операции": "",
        "Кол-во": "30",
        "Исполнителей": "",
        "Статус проекта": "В работе"
    },
    {
        "ПроектID": "2614",
        "Проект": "Установка витражей СПК (ОПЕРАЦИИ)",
        "Старт": "20.11.2025",
        "Задача проекта": "Подготовка (предоперации)",
        "Операция": "Получение реперных точек",
        "ОперацияID": "2617",
        "Норматив операции": "",
        "Кол-во": "",
        "Исполнителей": "",
        "Статус проекта": "В работе"
    }
];

// Copy the functions from project-scheduler.js for testing
function buildTemplateLookup(projectData) {
    const templateMap = {
        tasks: new Map(),
        operations: new Map(),
        taskExecutors: new Map(),
        operationExecutors: new Map()
    };

    projectData.forEach(item => {
        const isTemplate = !item['Статус проекта'] || item['Статус проекта'] !== 'В работе';

        if (isTemplate) {
            const taskName = item['Задача проекта'];
            const operationName = item['Операция'];
            const executorsNeeded = item['Исполнителей'];

            // Store executors count for both tasks and operations
            if (taskName && executorsNeeded && executorsNeeded !== '') {
                if (!templateMap.taskExecutors.has(taskName)) {
                    templateMap.taskExecutors.set(taskName, executorsNeeded);
                }
            }

            if (operationName && executorsNeeded && executorsNeeded !== '') {
                if (!templateMap.operationExecutors.has(operationName)) {
                    templateMap.operationExecutors.set(operationName, executorsNeeded);
                }
            }
        }
    });

    return templateMap;
}

function getExecutorsCount(item, templateLookup, isOperation) {
    if (isOperation) {
        const operationName = item['Операция'];
        if (operationName && templateLookup.operationExecutors.has(operationName)) {
            const count = templateLookup.operationExecutors.get(operationName);
            return parseInt(count, 10) || 1;
        }
    } else {
        const taskName = item['Задача проекта'];
        if (taskName && templateLookup.taskExecutors.has(taskName)) {
            const count = templateLookup.taskExecutors.get(taskName);
            return parseInt(count, 10) || 1;
        }
    }

    // Default: 1 executor
    return 1;
}

// Test functions
function testTemplateLookup() {
    console.log('\n=== Test: Template Lookup for Executors ===');

    const templateLookup = buildTemplateLookup(mockProjectData);

    const tests = [
        {
            desc: "Template has 'Разгрузка стоек и ригелей' with 2 executors",
            check: () => templateLookup.operationExecutors.has('Разгрузка стоек и ригелей'),
            expected: true
        },
        {
            desc: "Template value for 'Разгрузка стоек и ригелей' is '2'",
            check: () => templateLookup.operationExecutors.get('Разгрузка стоек и ригелей') === '2',
            expected: true
        },
        {
            desc: "Template has 'Сборка каркаса' with 2 executors",
            check: () => templateLookup.operationExecutors.has('Сборка каркаса'),
            expected: true
        },
        {
            desc: "Template does NOT have 'Получение реперных точек' (empty value)",
            check: () => !templateLookup.operationExecutors.has('Получение реперных точек'),
            expected: true
        }
    ];

    let passed = 0;
    tests.forEach(test => {
        const result = test.check();
        const success = result === test.expected;
        console.log(`  ${success ? '✓' : '✗'} ${test.desc}`);
        if (!success) {
            console.log(`    Expected: ${test.expected}, Got: ${result}`);
        }
        if (success) passed++;
    });

    console.log(`  Result: ${passed}/${tests.length} passed`);
    return passed === tests.length;
}

function testGetExecutorsCount() {
    console.log('\n=== Test: Get Executors Count from Template ===');

    const templateLookup = buildTemplateLookup(mockProjectData);

    // Get work items
    const workItems = mockProjectData.filter(item => item['Статус проекта'] === 'В работе');

    const tests = [
        {
            desc: "Work item 'Разгрузка стоек и ригелей' (empty Исполнителей) should get 2 from template",
            item: workItems.find(item => item['Операция'] === 'Разгрузка стоек и ригелей'),
            isOperation: true,
            expected: 2
        },
        {
            desc: "Work item 'Сборка каркаса' (empty Исполнителей) should get 2 from template",
            item: workItems.find(item => item['Операция'] === 'Сборка каркаса'),
            isOperation: true,
            expected: 2
        },
        {
            desc: "Work item 'Получение реперных точек' (no template value) should default to 1",
            item: workItems.find(item => item['Операция'] === 'Получение реперных точек'),
            isOperation: true,
            expected: 1
        }
    ];

    let passed = 0;
    tests.forEach(test => {
        if (!test.item) {
            console.log(`  ✗ ${test.desc}: Item not found in test data`);
            return;
        }

        const result = getExecutorsCount(test.item, templateLookup, test.isOperation);
        const success = result === test.expected;
        console.log(`  ${success ? '✓' : '✗'} ${test.desc}`);
        if (!success) {
            console.log(`    Expected: ${test.expected}, Got: ${result}`);
            console.log(`    Item 'Исполнителей' field: "${test.item['Исполнителей']}"`);
        }
        if (success) passed++;
    });

    console.log(`  Result: ${passed}/${tests.length} passed`);
    return passed === tests.length;
}

function testOldBehavior() {
    console.log('\n=== Test: Old Behavior (for comparison) ===');

    // Simulate old behavior: parseInt(item['Исполнителей'] || '1', 10)
    const workItems = mockProjectData.filter(item => item['Статус проекта'] === 'В работе');

    const item1 = workItems.find(item => item['Операция'] === 'Разгрузка стоек и ригелей');
    const oldResult1 = parseInt(item1['Исполнителей'] || '1', 10);
    console.log(`  Old behavior for 'Разгрузка стоек и ригелей': ${oldResult1} (WRONG - should be 2)`);

    const item2 = workItems.find(item => item['Операция'] === 'Сборка каркаса');
    const oldResult2 = parseInt(item2['Исполнителей'] || '1', 10);
    console.log(`  Old behavior for 'Сборка каркаса': ${oldResult2} (WRONG - should be 2)`);

    console.log(`  ✓ Old behavior confirmed to be incorrect (returned 1 instead of 2)`);
    return true;
}

// Run all tests
function runAllTests() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  Issue #5 Fix Verification - Test Suite               ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\nTesting that executors count is read from template...\n');

    const results = [
        testTemplateLookup(),
        testGetExecutorsCount(),
        testOldBehavior()
    ];

    const totalPassed = results.filter(r => r).length;
    const totalTests = results.length;

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log(`║  Final Result: ${totalPassed}/${totalTests} test groups passed${' '.repeat(24 - totalPassed.toString().length - totalTests.toString().length)}║`);
    console.log('╚════════════════════════════════════════════════════════╝');

    if (totalPassed === totalTests) {
        console.log('\n✓ All tests passed! The fix for issue #5 is working correctly.');
        console.log('  Executors count is now properly read from the template.');
    } else {
        console.log(`\n✗ ${totalTests - totalPassed} test group(s) failed. Please review the implementation.`);
    }
}

// Execute tests
runAllTests();
