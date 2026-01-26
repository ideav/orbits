/**
 * Test for Issue #394: При выборе двух Позиций сметы таблица ломается
 * (When selecting two estimate positions, the table breaks)
 *
 * Problem: When filtering by two non-consecutive estimate positions,
 *          the table structure breaks. This is related to issue #390 but
 *          the fix in #390 has a bug.
 *
 * Bug in the fix: Lines 4202-4208 in project.js
 *
 * Current logic:
 * ```
 * const existingCells = targetRow.querySelectorAll('td');
 * const cellIndex = Array.from(row.children).indexOf(cell);
 * if (cellIndex < existingCells.length) {
 *     // Cell position already occupied, skip
 *     continue;
 * }
 * ```
 *
 * This check is WRONG because:
 * 1. It compares cell INDEX with EXISTING CELLS LENGTH
 * 2. Doesn't check if the SAME TYPE of cell already exists
 * 3. Can incorrectly skip cloning when cells should be added
 */

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  Test: Issue #394 - Two Estimate Positions Break Table   ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

console.log('=== Scenario from Issue Log ===');
console.log('First filter: "Монтаж заполнений"');
console.log('  Result: 7 visible, 22 hidden ✓');
console.log('');
console.log('Second filter: "Монтаж заполнений" + "Монтаж примыканий"');
console.log('  Result: 12 visible, 17 hidden');
console.log('  Problem: Table structure breaks');
console.log('');

console.log('=== Example Table Structure ===');
console.log('');
console.log('Construction ВВ-1:');
console.log('  Row 0: [№1][☐][ВВ-1][Монтаж заполнений][Product A]  VISIBLE');
console.log('  Row 1: [Монтаж каркаса][Product B]                 HIDDEN');
console.log('  Row 2: [Монтаж примыканий][Product C]              VISIBLE');
console.log('');

console.log('=== Bug in Issue #390 Fix ===');
console.log('');
console.log('Location: project.js lines 4196-4208');
console.log('');
console.log('Code:');
console.log('  for (let i = lastConsecutiveVisible + 1; i < rowIndex + originalRowspan; i++) {');
console.log('    if (rows[i].style.display !== "none") {');
console.log('      const targetRow = rows[i];');
console.log('      ');
console.log('      // Check if this cell type already exists in target row');
console.log('      const existingCells = targetRow.querySelectorAll("td");');
console.log('      const cellIndex = Array.from(row.children).indexOf(cell);');
console.log('      if (cellIndex < existingCells.length) {  ← BUG!');
console.log('        continue;  // Skip cloning');
console.log('      }');
console.log('      ');
console.log('      // Clone and add cell');
console.log('      ...');
console.log('    }');
console.log('  }');
console.log('');

console.log('=== Why This Check is Wrong ===');
console.log('');
console.log('Example: Row 0 has cells [№, ☐, ВВ-1, Estimate, Product]');
console.log('         Row 2 (after gap) has cells [Estimate, Product]');
console.log('');
console.log('Processing Row 0, need to clone [№, ☐, ВВ-1] to Row 2:');
console.log('');
console.log('Cell: № (index 0 in Row 0)');
console.log('  existingCells.length in Row 2 = 2  (Estimate, Product)');
console.log('  cellIndex = 0');
console.log('  Check: if (0 < 2) → TRUE');
console.log('  Action: SKIP cloning');
console.log('  ❌ WRONG! № cell should be cloned!');
console.log('');
console.log('Cell: ☐ (index 1 in Row 0)');
console.log('  existingCells.length in Row 2 = 2');
console.log('  cellIndex = 1');
console.log('  Check: if (1 < 2) → TRUE');
console.log('  Action: SKIP cloning');
console.log('  ❌ WRONG! ☐ cell should be cloned!');
console.log('');
console.log('Cell: ВВ-1 (index 2 in Row 0)');
console.log('  existingCells.length in Row 2 = 2');
console.log('  cellIndex = 2');
console.log('  Check: if (2 < 2) → FALSE');
console.log('  Action: Clone cell');
console.log('  ✓ Would be cloned, but previous cells missing!');
console.log('');

console.log('=== Result ===');
console.log('Row 2 after processing:');
console.log('  Expected: [№][☐][ВВ-1][Монтаж примыканий][Product C]');
console.log('  Actual:   [ВВ-1][Монтаж примыканий][Product C]');
console.log('  ❌ Missing № and ☐ cells!');
console.log('');

console.log('=== The Real Problem ===');
console.log('');
console.log('The check "cellIndex < existingCells.length" assumes:');
console.log('  1. Cells are always in order (№, ☐, Construction, ...)');
console.log('  2. If target row has N cells, positions 0..N-1 are "occupied"');
console.log('  3. Only clone cells at positions >= N');
console.log('');
console.log('But this is WRONG because:');
console.log('  - Target row might have [Estimate, Product] at positions 0-1');
console.log('  - These are NOT the same as [№, ☐] that should be at 0-1');
console.log('  - We need to check cell CLASSES, not just count!');
console.log('');

console.log('=== Correct Solution ===');
console.log('');
console.log('Instead of:');
console.log('  if (cellIndex < existingCells.length) continue;');
console.log('');
console.log('We should check if a cell of the SAME CLASS already exists:');
console.log('');
console.log('Code:');
console.log('  // Get the class name of the cell to clone');
console.log('  const cellClass = Array.from(cell.classList)');
console.log('    .find(cls => cls.endsWith("-cell"));');
console.log('  ');
console.log('  // Check if target row already has a cell with this class');
console.log('  // This includes both original cells and cloned cells');
console.log('  const alreadyExists = targetRow.querySelector(');
console.log('    `td.${cellClass}, td[data-cloned].${cellClass}`');
console.log('  );');
console.log('  ');
console.log('  if (alreadyExists) {');
console.log('    continue;  // Skip - cell type already exists');
console.log('  }');
console.log('');

console.log('=== Alternative Solution (Simpler) ===');
console.log('');
console.log('Just check if the cell has a specific class identifier:');
console.log('');
console.log('  // Cell classes: number-cell, checkbox-cell, construction-cell');
console.log('  const cellClasses = ["number-cell", "checkbox-cell", "construction-cell"];');
console.log('  const cellType = cellClasses.find(cls => cell.classList.contains(cls));');
console.log('  ');
console.log('  if (cellType) {');
console.log('    const exists = targetRow.querySelector(`td.${cellType}`);');
console.log('    if (exists) continue;  // Already has this cell type');
console.log('  }');
console.log('');

console.log('=== Expected Result After Fix ===');
console.log('');
console.log('Filter: "Монтаж заполнений" + "Монтаж примыканий"');
console.log('');
console.log('┌────┬───┬──────┬────────────────────────┬───────────┐');
console.log('│ №  │ ☐ │ Кон. │ Позиция сметы          │ Изделие   │');
console.log('├────┼───┼──────┼────────────────────────┼───────────┤');
console.log('│ 1  │ ☐ │ ВВ-1 │ Монтаж заполнений      │ Product A │');
console.log('│ 1  │ ☐ │ ВВ-1 │ Монтаж примыканий      │ Product C │');
console.log('└────┴───┴──────┴────────────────────────┴───────────┘');
console.log('');
console.log('✓ All cells present in both rows');
console.log('✓ [№, ☐, Construction] cells properly cloned to Row 2');
console.log('✓ Table structure intact');
console.log('');

console.log('=== Implementation Steps ===');
console.log('1. Remove buggy check at lines 4202-4208');
console.log('2. Add proper check for cell class existence');
console.log('3. Test with multiple estimate positions');
console.log('4. Verify table structure remains intact');
