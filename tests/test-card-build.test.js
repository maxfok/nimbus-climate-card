import { it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

it('builds a separate card and editor that coexist with production registrations', () => {
  const dir = mkdtempSync(join(tmpdir(), 'nimbus-test-build-'));
  try {
    const output = join(dir, 'card.js');
    execFileSync(process.execPath, [resolve('scripts/build-damper-test-card.cjs'), output]);
    class ProductionCard extends HTMLElement {}
    class ProductionEditor extends HTMLElement {}
    customElements.define('nimbus-climate-card', ProductionCard);
    customElements.define('nimbus-climate-card-editor', ProductionEditor);
    window.customCards = [];
    new Function(readFileSync(output, 'utf8'))();
    expect(customElements.get('nimbus-climate-card')).toBe(ProductionCard);
    expect(customElements.get('nimbus-climate-card-editor')).toBe(ProductionEditor);
    const TestCard = customElements.get('nimbus-climate-damper-test-card');
    expect(TestCard).toBeDefined();
    expect(TestCard.getConfigElement().localName).toBe('nimbus-climate-damper-test-card-editor');
    expect(window.customCards.map(x => x.type)).toEqual(['nimbus-climate-damper-test-card']);
    expect(readFileSync(output, 'utf8')).not.toContain('window.__nimbusClimateRows');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
