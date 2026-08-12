import assert from 'node:assert/strict';
import test from 'node:test';

globalThis.HTMLElement = class {};
globalThis.window = {
  customCards: [],
};
globalThis.customElements = {
  define() {},
};

const { roundTemperatureForDisplay } = await import('../nimbus-climate-card.js');

test('preserves the climate entity value when display rounding is disabled', () => {
  assert.equal(roundTemperatureForDisplay(25.2), 25.2);
  assert.equal(roundTemperatureForDisplay('unavailable'), null);
});

test('supports opt-in half-degree display rounding', () => {
  assert.equal(roundTemperatureForDisplay(25.3, 0.5), 25.5);
  assert.equal(roundTemperatureForDisplay(13.1, 0.5), 13);
  assert.equal(roundTemperatureForDisplay(24.4, 0.5), 24.5);
});

test('can compensate for a source that was already rounded to tenths', () => {
  assert.equal(roundTemperatureForDisplay(25.2, 0.5, 0.05), 25.5);
  assert.equal(roundTemperatureForDisplay(25.3, 0.5, 0.05), 25.5);
  assert.equal(roundTemperatureForDisplay(13.1, 0.5, 0.05), 13);
  assert.equal(roundTemperatureForDisplay(24.4, 0.5, 0.05), 24.5);
  assert.equal(roundTemperatureForDisplay(23.9, 0.5, 0.05), 24);
  assert.equal(roundTemperatureForDisplay(19.8, 0.5, 0.05), 20);
});

test('uses symmetric half-up rounding for negative temperatures', () => {
  assert.equal(roundTemperatureForDisplay(-25.2, 0.5, -0.05), -25.5);
});
