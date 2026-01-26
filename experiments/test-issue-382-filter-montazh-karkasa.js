/**
 * Test for Issue #382: Filter by "Монтаж каркаса" breaks table
 *
 * Problem: When filtering by "Позиция сметы" = "Монтаж каркаса", the table breaks
 * Symptom: Table structure is corrupted, cells are in wrong positions
 *
 * Test scenario to reproduce:
 * Construction ВВ-1 has multiple estimates in order:
 *   Row 1: [№1][☐][ВВ-1][Монтаж заполнений][Product A]  (rowspan=3 on №, ☐, ВВ-1)
 *   Row 2: ----  ----  ----  [Монтаж каркаса][Product B]
 *   Row 3: ----  ----  ----  [Монтаж каркаса][Product C]
 *
 * Filter: "Монтаж каркаса" only
 *
 * Expected result:
 *   Row 1: HIDDEN (filtered out)
 *   Row 2: VISIBLE [№1][☐][ВВ-1][Монтаж каркаса][Product B] (rowspan=2)
 *   Row 3: VISIBLE [Монтаж каркаса][Product C]
 *
 * Actual bug:
 *   Table structure is broken - cells appear in wrong order or duplicated
 */

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  Test: Issue #382 - Filter Монтаж каркаса Breaks Table   ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

console.log('=== Problem Description ===');
console.log('Filter set to: "Монтаж каркаса"');
console.log('Expected: Only rows with "Монтаж каркаса" visible with proper table structure');
console.log('Bug: Table structure is broken');
console.log('');

console.log('=== Test Data Structure ===');
console.log('');
console.log('Construction ВВ-1 with 3 estimate positions:');
console.log('┌────┬───┬──────┬────────────────────────┬───────────┐');
console.log('│ №  │ ☐ │ Кон. │ Позиция сметы          │ Изделие   │');
console.log('├────┼───┼──────┼────────────────────────┼───────────┤');
console.log('│ 1  │ ☐ │ ВВ-1 │ Монтаж заполнений      │ Product A │ Row 1');
console.log('│ ↓  │ ↓ │  ↓   │ Монтаж каркаса         │ Product B │ Row 2');
console.log('│ ↓  │ ↓ │  ↓   │ Монтаж каркаса         │ Product C │ Row 3');
console.log('└────┴───┴──────┴────────────────────────┴───────────┘');
console.log('(↓ indicates rowspan=3 for №, ☐, and Конструкция cells)');
console.log('');

console.log('=== Filtering by "Монтаж каркаса" ===');
console.log('');
console.log('Step 1: First pass (applyFilters)');
console.log('  Row 1: estimate="Монтаж заполнений" NOT in filter → HIDE');
console.log('  Row 2: estimate="Монтаж каркаса" IN filter → SHOW');
console.log('  Row 3: estimate="Монтаж каркаса" IN filter → SHOW');
console.log('  Result: Row 1 hidden, Rows 2-3 visible');
console.log('');

console.log('Step 2: adjustRowspansAfterFilter()');
console.log('  Processing Row 1 (hidden):');
console.log('    Found cells with rowspan: №1, ☐, ВВ-1 (originalRowspan=3)');
console.log('    Count visible rows in span (Rows 1-3): 2 (Rows 2-3)');
console.log('    Row 1 is hidden, visibleCount=2 > 0');
console.log('    Find first visible row: Row 2');
console.log('    Action: MOVE cells from Row 1 to Row 2');
console.log('      - cell.remove() from Row 1');
console.log('      - firstVisibleRow.insertBefore(cell, firstChild)');
console.log('');

console.log('=== Problem Analysis ===');
console.log('');
console.log('The issue is in the ORDER of cell insertion:');
console.log('');
console.log('Row 2 BEFORE moving cells:');
console.log('  [Монтаж каркаса][Product B]');
console.log('');
console.log('Moving 3 cells from Row 1 to Row 2:');
console.log('  1. Move №1 → insertBefore(firstChild) → [№1][Монтаж каркаса][Product B]');
console.log('  2. Move ☐  → insertBefore(firstChild) → [☐][№1][Монтаж каркаса][Product B]');
console.log('  3. Move ВВ-1 → insertBefore(firstChild) → [ВВ-1][☐][№1][Монтаж каркаса][Product B]');
console.log('');
console.log('Result: WRONG ORDER! ❌');
console.log('Expected: [№1][☐][ВВ-1][Монтаж каркаса][Product B]');
console.log('Actual:   [ВВ-1][☐][№1][Монтаж каркаса][Product B]');
console.log('');
console.log('The cells are inserted in REVERSE order because each new cell');
console.log('is inserted BEFORE the previous one!');
console.log('');

console.log('=== Root Cause ===');
console.log('');
console.log('cellsWithRowspan.forEach(cell => {');
console.log('  // ... move logic');
console.log('  firstVisibleRow.insertBefore(cell, firstVisibleRow.firstChild);');
console.log('});');
console.log('');
console.log('When we have multiple cells to move (№, ☐, Конструкция):');
console.log('- First cell (№) is inserted at position 0');
console.log('- Second cell (☐) is ALSO inserted at position 0, pushing № to position 1');
console.log('- Third cell (Конструкция) is ALSO inserted at position 0, pushing others right');
console.log('- Result: Cells end up in REVERSE order');
console.log('');

console.log('=== The Fix ===');
console.log('');
console.log('Solution: Collect cells to move first, then insert them in correct order');
console.log('');
console.log('OPTION 1: Track insertion position and increment it');
console.log('  let insertPosition = 0;');
console.log('  cellsToMove.forEach((cell, index) => {');
console.log('    if (index === 0) {');
console.log('      firstVisibleRow.insertBefore(cell, firstVisibleRow.firstChild);');
console.log('    } else {');
console.log('      firstVisibleRow.insertBefore(cell, firstVisibleRow.children[index]);');
console.log('    }');
console.log('  });');
console.log('');
console.log('OPTION 2: Collect and insert in reverse order');
console.log('  const cellsToMove = Array.from(cellsWithRowspan);');
console.log('  cellsToMove.reverse().forEach(cell => {');
console.log('    firstVisibleRow.insertBefore(cell, firstVisibleRow.firstChild);');
console.log('  });');
console.log('');
console.log('OPTION 3 (BEST): Move cells after removing all, preserving order');
console.log('  // Collect cells with their original indices');
console.log('  const cellsToMove = [];');
console.log('  cellsWithRowspan.forEach((cell, index) => {');
console.log('    cellsToMove.push({cell, originalIndex: index});');
console.log('  });');
console.log('  // Remove all cells first');
console.log('  cellsToMove.forEach(({cell}) => cell.remove());');
console.log('  // Insert in order');
console.log('  cellsToMove.forEach(({cell}) => {');
console.log('    firstVisibleRow.appendChild(cell);');
console.log('  });');
console.log('');

console.log('=== Expected Result After Fix ===');
console.log('');
console.log('Filter: "Монтаж каркаса"');
console.log('┌────┬───┬──────┬────────────────────────┬───────────┐');
console.log('│ №  │ ☐ │ Кон. │ Позиция сметы          │ Изделие   │');
console.log('├────┼───┼──────┼────────────────────────┼───────────┤');
console.log('│ 1  │ ☐ │ ВВ-1 │ Монтаж каркаса         │ Product B │ Row 2 (visible)');
console.log('│ ↓  │ ↓ │  ↓   │ Монтаж каркаса         │ Product C │ Row 3 (visible)');
console.log('└────┴───┴──────┴────────────────────────┴───────────┘');
console.log('');
console.log('✓ Cells in correct order: №, ☐, Конструкция, Смета, Изделие');
console.log('✓ Rowspan values correct (2 for №, ☐, Конструкция)');
console.log('✓ Table structure intact');
console.log('');

console.log('=== Test Verification ===');
console.log('To verify the fix:');
console.log('1. Create table with Construction having estimates in order:');
console.log('   - Монтаж заполнений (first)');
console.log('   - Монтаж каркаса (second, third, ...)');
console.log('2. Apply filter: "Монтаж каркаса"');
console.log('3. Check first visible row has cells in order:');
console.log('   [№][☐][Конструкция][Позиция сметы][Изделие]');
console.log('4. Verify no cells are missing or duplicated');
console.log('5. Verify rowspan values are correct');
