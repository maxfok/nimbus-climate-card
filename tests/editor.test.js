import { beforeAll, afterEach, describe, it, expect } from 'vitest';

beforeAll(async () => { await import('../nimbus-climate-card.js'); });
afterEach(() => document.body.replaceChildren());

function makeEditor() {
  const editor = document.createElement('nimbus-climate-card-editor');
  const config = { entities: [{ entity: 'climate.room', name: 'Room', sensors: [{ entity: 'sensor.power' }] }] };
  const hass = { states: { 'climate.room': { attributes: {} }, 'climate.other': { attributes: {} }, 'sensor.power': { attributes: {} }, 'sensor.temp': { attributes: { device_class: 'temperature' } } } };
  editor.setConfig(config); editor.hass = hass; document.body.append(editor);
  return { editor, config, hass };
}

describe('configuration editor refresh', () => {
  it.each(['select[data-field="entity"]', 'select[data-field="temperature_sensor"]', 'select[data-sensor-field="entity"]', 'input[data-field="name"]'])('preserves focused %s during hass and identical config updates', selector => {
    const { editor, hass, config } = makeEditor();
    const control = editor.shadowRoot.querySelector(selector); control.focus();
    editor.hass = { ...hass }; editor.setConfig(config);
    expect(editor.shadowRoot.querySelector(selector)).toBe(control);
    expect(editor.shadowRoot.activeElement).toBe(control);
  });

  it('retains the typed name through config echoes and refreshes after blur', async () => {
    const { editor, hass, config } = makeEditor();
    const input = editor.shadowRoot.querySelector('input[data-field="name"]');
    input.focus(); input.value = 'Bedroom'; input.dispatchEvent(new Event('input', { bubbles: true }));
    editor.hass = { ...hass }; editor.setConfig(config);
    expect(editor.shadowRoot.querySelector('input[data-field="name"]')).toBe(input);
    expect(editor._config.entities[0].name).toBe('Bedroom');
    input.blur(); await Promise.resolve();
    expect(editor.shadowRoot.querySelector('input[data-field="name"]').value).toBe('Bedroom');
  });

  it('updates available entities after the focused select is left', async () => {
    const { editor, hass } = makeEditor();
    const select = editor.shadowRoot.querySelector('select[data-field="entity"]');
    select.focus();
    editor.hass = { ...hass, states: { ...hass.states, 'climate.new': { attributes: {} } } };
    expect(editor.shadowRoot.querySelector('select[data-field="entity"]')).toBe(select);
    select.blur(); await Promise.resolve();
    expect([...editor.shadowRoot.querySelector('select[data-field="entity"]').options].map(option => option.value)).toContain('climate.new');
  });

  it('preserves a changed selection and dispatches the existing configuration', async () => {
    const { editor, hass } = makeEditor();
    let result; editor.addEventListener('config-changed', event => { result = structuredClone(event.detail.config); editor.setConfig(event.detail.config); });
    const select = editor.shadowRoot.querySelector('select[data-field="entity"]');
    select.focus(); editor.hass = { ...hass }; select.value = 'climate.other';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(result.entities[0].entity).toBe('climate.other');
    expect(editor.shadowRoot.querySelector('select[data-field="entity"]')).toBe(select);
    select.blur(); await Promise.resolve();
    expect(editor.shadowRoot.querySelector('select[data-field="entity"]').value).toBe('climate.other');
  });
});
