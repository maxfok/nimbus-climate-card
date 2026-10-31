#!/usr/bin/env node
// Produce an isolated card variant; the production source is never modified.
const fs = require('node:fs');
const path = require('node:path');
const source = path.join(__dirname, '..', 'nimbus-climate-card.js');
const output = process.argv[2];
if (!output) { console.error('Usage: node scripts/build-damper-test-card.cjs OUTPUT.js'); process.exit(2); }
let code = fs.readFileSync(source, 'utf8');
const replace = (from, to, expected) => {
  const matches = code.split(from).length - 1;
  if (matches !== expected) throw new Error(`Unexpected occurrence count for ${from}: ${matches} (expected ${expected})`);
  code = code.split(from).join(to);
};
replace('nimbus-climate-card-editor', 'nimbus-climate-damper-test-card-editor', 2);
replace("'nimbus-climate-card'", "'nimbus-climate-damper-test-card'", 3);
replace('__nimbusClimateRows', '__nimbusClimateDamperTestRows', 3);
replace("const CARD_VERSION = '1.3.3';", "const CARD_VERSION = '1.3.3-damper-test';", 1);
replace("name: 'Nimbus Climate Card',", "name: 'Nimbus Climate Card — Damper Test',", 1);
fs.writeFileSync(output, code);
console.log(`Built isolated test card: ${output}`);
