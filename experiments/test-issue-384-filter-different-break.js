/**
 * Test for Issue #384: Filter breaks table in a different way than #382
 *
 * Problem: Filter still breaks the table, but differently than issue #382
 * Previous fix (#382) handled cell insertion order, but there's another edge case
 *
 * Hypothesis 1: Multiple hidden rows need to move cells to the same target
 * Hypothesis 2: Target row already has moved cells from previous iteration
 * Hypothesis 3: Cell position calculation is wrong when target row changes
 */

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  Test: Issue #384 - Filter Breaks Table (Different Way)  ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

console.log('=== Analyzing Potential Issues ===');
console.log('');

console.log('Current code (from fix #382):');
console.log('rows.forEach((row, rowIndex) => {');
console.log('  cellsWithRowspan.forEach(cell => {');
console.log('    if (row.style.display === "none" && visibleCount > 0) {');
console.log('      cellsToMove.push({cell, firstVisibleRowIndex, visibleCount});');
console.log('    }');
console.log('  });');
console.log('  if (cellsToMove.length > 0) {');
console.log('    // Move cells in reverse order to maintain correct sequence');
console.log('    for (let i = cellsToMove.length - 1; i >= 0; i--) {');
console.log('      targetRow.insertBefore(cell, targetRow.firstChild);');
console.log('    }');
console.log('  }');
console.log('});');
console.log('');

console.log('=== Hypothesis 1: Processing order matters when target row changes ===');
console.log('');
console.log('Scenario: Multiple rows move cells to same target');
console.log('This CANNOT happen because:');
console.log('- Each construction has its own rowspan cells');
console.log('- Rowspan cells from different constructions go to different target rows');
console.log('- Even if same construction has multiple hidden rows, only the FIRST row');
console.log('  of each construction has the rowspan cells (№, ☐, Конструкция)');
console.log('→ Hypothesis 1: UNLIKELY');
console.log('');

console.log('=== Hypothesis 2: Cells moved to row that gets processed later ===');
console.log('');
console.log('Scenario:');
console.log('Row 1 (hidden, has rowspan cells) → move cells to Row 3');
console.log('Row 2 (visible)');
console.log('Row 3 (visible) → now has moved cells from Row 1');
console.log('');
console.log('When we process Row 3:');
console.log('  cellsWithRowspan = querySelectorAll("td[rowspan], td[data-original-rowspan]")');
console.log('  This WILL find the cells we just moved from Row 1!');
console.log('  But Row 3 is visible (style.display !== "none")');
console.log('  So we go to the "else" branch and just update rowspan');
console.log('  → No issue here');
console.log('→ Hypothesis 2: UNLIKELY');
console.log('');

console.log('=== Hypothesis 3: Moving cells to wrong position in target row ===');
console.log('');
console.log('Current logic:');
console.log('  targetRow.insertBefore(cell, targetRow.firstChild)');
console.log('');
console.log('This inserts at THE VERY BEGINNING of the row.');
console.log('But what if target row ALREADY has cells at the beginning?');
console.log('');
console.log('Example:');
console.log('Target row BEFORE moving (Row 3):');
console.log('  [Estimate Cell][Product Cell]');
console.log('');
console.log('Cells to move from Row 1:');
console.log('  [№1][☐][Construction]');
console.log('');
console.log('After moving (inserting in reverse order):');
console.log('  1. Insert [Construction] at firstChild → [Construction][Estimate][Product]');
console.log('  2. Insert [☐] at firstChild → [☐][Construction][Estimate][Product]');
console.log('  3. Insert [№1] at firstChild → [№1][☐][Construction][Estimate][Product]');
console.log('');
console.log('Result: [№1][☐][Construction][Estimate][Product] ✓ CORRECT!');
console.log('→ Hypothesis 3: This should work correctly');
console.log('');

console.log('=== Hypothesis 4: Cells moved but target row changes during iteration ===');
console.log('');
console.log('When we do cell.remove() and targetRow.insertBefore():');
console.log('- cell.remove() removes the cell from DOM');
console.log('- targetRow.insertBefore() adds it to new location');
console.log('- The rows array is created BEFORE we start moving cells');
console.log('- So rows[index] should still point to the correct row object');
console.log('');
console.log('BUT: What if the targetRow is ALSO being iterated over in the forEach?');
console.log('JavaScript forEach behavior:');
console.log('- forEach iterates over the array as it was when forEach started');
console.log('- Modifying the array during iteration does NOT affect the iteration');
console.log('- We are NOT modifying the rows array itself');
console.log('- We are modifying the ROW CONTENTS (adding/removing cells)');
console.log('→ Should be safe');
console.log('');

console.log('=== Hypothesis 5: MULTIPLE constructions with gaps ===');
console.log('');
console.log('Scenario that COULD cause issues:');
console.log('');
console.log('Construction A:');
console.log('  Row 1: [№1][☐][A][Est A1][Prod A1] rowspan=2');
console.log('  Row 2: [Est A2][Prod A2]');
console.log('');
console.log('Construction B:');
console.log('  Row 3: [№2][☐][B][Est B1][Prod B1] rowspan=2');
console.log('  Row 4: [Est B2][Prod B2]');
console.log('');
console.log('Filter by "Est A2" (only Row 2 visible):');
console.log('  Row 1: HIDDEN');
console.log('  Row 2: VISIBLE (target for cells from Row 1)');
console.log('  Row 3: HIDDEN');
console.log('  Row 4: HIDDEN');
console.log('');
console.log('Processing:');
console.log('  Row 1 (hidden): Move [№1][☐][A] to Row 2 ✓');
console.log('  Row 2 (visible): Update rowspan for moved cells ✓');
console.log('  Row 3 (hidden): No visible rows in span → hide cells ✓');
console.log('  Row 4 (hidden): No rowspan cells (spanned by Row 3) ✓');
console.log('');
console.log('This should work correctly!');
console.log('');

console.log('=== Hypothesis 6: The REAL issue - cells inserted AFTER processing ===');
console.log('');
console.log('WAIT! I think I found it!');
console.log('');
console.log('When we move cells from Row 1 to Row 2:');
console.log('1. We are in the forEach loop processing Row 1');
console.log('2. We collect cellsToMove from Row 1');
console.log('3. We insert them into Row 2 (targetRow)');
console.log('4. Row 2 now has these cells at the beginning');
console.log('');
console.log('Later, when we process Row 2 itself:');
console.log('1. cellsWithRowspan = querySelectorAll("td[rowspan], ...")');
console.log('2. This FINDS the cells we just moved!');
console.log('3. But these cells have data-original-rowspan attribute');
console.log('4. We check: originalRowspan = parseInt(cell.getAttribute("data-original-rowspan"))');
console.log('5. For each cell, we count visible rows in range [rowIndex, rowIndex+originalRowspan)');
console.log('6. BUT rowIndex is NOW the index of Row 2, not Row 1!');
console.log('7. So we are counting from the WRONG starting position!');
console.log('');
console.log('Example:');
console.log('  Cell [№1] originally in Row 1 (index 0) with rowspan=3');
console.log('  Moved to Row 2 (index 1)');
console.log('  When processing Row 2:');
console.log('    originalRowspan = 3');
console.log('    Counting visible rows from index 1 to index 1+3=4');
console.log('    But the ORIGINAL span was from index 0 to 3!');
console.log('    We are counting the WRONG range!');
console.log('');
console.log('→ Hypothesis 6: THIS IS THE BUG! ✓✓✓');
console.log('');

console.log('=== The Fix ===');
console.log('');
console.log('Solution: Mark cells that have been moved to prevent reprocessing');
console.log('');
console.log('Option 1: Add a data-moved="true" attribute when moving cells');
console.log('  if (cell.hasAttribute("data-moved")) return; // Skip moved cells');
console.log('');
console.log('Option 2: Track original row index in data attribute');
console.log('  cell.setAttribute("data-original-row-index", rowIndex);');
console.log('  Use this for counting instead of current rowIndex');
console.log('');
console.log('Option 3 (BEST): Remove cells from DOM tree during processing');
console.log('  After moving cells, they are in the target row');
console.log('  When we later process target row, skip cells that:');
console.log('  - Have data-original-rowspan AND');
console.log('  - Were moved from a different row');
console.log('');
console.log('ACTUALLY: Simpler fix - only process cells that are ORIGINALLY in this row');
console.log('Check if cell.parentElement === row BEFORE processing');
console.log('After moving, cell.parentElement will be the target row, not the original row');
console.log('');

console.log('=== Expected Fix ===');
console.log('Add a check at the start of cellsWithRowspan.forEach:');
console.log('');
console.log('cellsWithRowspan.forEach(cell => {');
console.log('  // Skip cells that were moved here from another row');
console.log('  // (they will be processed when we iterate over their original row)');
console.log('  if (!row.contains(cell)) return;');
console.log('  ');
console.log('  // ... rest of processing');
console.log('});');
console.log('');
console.log('This ensures we only process cells that are CURRENTLY in the row');
console.log('we are iterating over, not cells that were moved here.');
