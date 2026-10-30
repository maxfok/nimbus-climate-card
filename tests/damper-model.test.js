import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => { await import('../nimbus-climate-card.js'); });
const model = (id, state, attributes = {}) => {
  const card = document.createElement('nimbus-climate-card');
  card._hass = { states: { [id]: { state, attributes } } };
  return card._getDamperModel(id);
};

describe('damper entity state', () => {
  it('detects only supported domains', () => {
    expect(model('light.room', 'on')).toBeNull();
    for (const domain of ['cover', 'number', 'select', 'switch']) {
      expect(model(`${domain}.room`, 'unavailable')).toEqual({ domain, available: false });
    }
  });
  it('reads cover position and capability flags without inventing position', () => {
    expect(model('cover.room', 'open', { current_position: 35, supported_features: 7 })).toMatchObject({ position: .35, value: 35, canSetPosition: true, canOpen: true, canClose: true });
    expect(model('cover.room', 'open', { supported_features: 3 })).toMatchObject({ position: null, value: null, canSetPosition: false, canOpen: true, canClose: true });
    expect(model('cover.room', 'open', { current_position: null })).toMatchObject({ position: null });
  });
  it('normalizes number values and rejects missing or invalid bounds', () => {
    expect(model('number.room', '15', { min: 10, max: 30, step: 2.5, unit_of_measurement: '°' })).toMatchObject({ value: 15, position: .25, step: 2.5, unit: '°' });
    expect(model('number.room', '15', { min: 10, max: 30 })).toMatchObject({ available: false });
  });
  it('maps select choices and requires a reported current option', () => {
    expect(model('select.room', 'medium', { options: ['low', 'medium', 'high'] })).toMatchObject({ index: 1, position: .5 });
    expect(model('select.room', 'medium', { options: ['low', 'high'] })).toMatchObject({ available: false });
  });
  it('uses on and off as states rather than opening percentages', () => {
    expect(model('switch.room', 'on')).toMatchObject({ value: 'on', position: 1 });
    expect(model('switch.room', 'off')).toMatchObject({ value: 'off', position: 0 });
    expect(model('switch.room', 'unknown')).toMatchObject({ available: false });
  });
});

describe('damper integration', () => {
  const setup = (id, state, attributes = {}) => {
    const card = document.createElement('nimbus-climate-card');
    card.setConfig({ entities: [{ entity: 'climate.room', damper_entity: id }] });
    card._hass = { states: { 'climate.room': { state: 'heat', attributes: { supported_features: 8, fan_modes: ['auto'], fan_mode: 'auto', hvac_modes: ['heat'] } }, [id]: { state, attributes } }, callService: vi.fn().mockResolvedValue(), callWS: vi.fn().mockResolvedValue({}), config: {} };
    document.body.append(card); card._render();
    return card;
  };
  afterEach(() => document.body.replaceChildren());
  it.each([
    ['cover.room', 'open', { supported_features: 7, current_position: 20 }, .65, 'cover', 'set_cover_position', { position: 65 }],
    ['cover.room', 'open', { supported_features: 3 }, 0, 'cover', 'close_cover', {}],
    ['number.room', '10', { min: 10, max: 30, step: 2.5 }, .33, 'number', 'set_value', { value: 17.5 }],
    ['select.room', 'low', { options: ['low', 'mid', 'high'] }, .55, 'select', 'select_option', { option: 'mid' }],
    ['switch.room', 'off', {}, .7, 'switch', 'turn_on', {}],
    ['switch.room', 'on', {}, .1, 'switch', 'turn_off', {}],
  ])('dispatches %s safely', async (id, state, attrs, fraction, domain, service, extra) => {
    const card = setup(id, state, attrs);
    await card._commitDamper(id, fraction);
    expect(card._hass.callService).toHaveBeenCalledWith(domain, service, { entity_id: id, ...extra });
    expect(card.shadowRoot.querySelector('.hac-damper')).not.toBeNull();
    expect(card.shadowRoot.querySelector('.hac-extra[data-service="fan"]')).not.toBeNull();
  });
  it('reflects external updates and dynamic options', () => {
    const card = setup('select.room', 'low', { options: ['low', 'high'] });
    card.hass = { ...card._hass, states: { ...card._hass.states, 'select.room': { state: 'medium', attributes: { options: ['low', 'medium', 'high'] } } } };
    expect(card.shadowRoot.querySelector('.hac-damper-value').textContent).toBe('medium');
    expect(card.shadowRoot.querySelectorAll('.hac-damper-tick')).toHaveLength(3);
  });
  it('surfaces a failed service and returns to the reported value', async () => {
    const card = setup('number.room', '15', { min: 10, max: 30, step: 1 });
    card._hass.callService.mockRejectedValue(new Error('denied'));
    await card._commitDamper('number.room', .9);
    expect(card.shadowRoot.querySelector('[role="alert"]').textContent).toContain('denied');
    expect(card.shadowRoot.querySelector('.hac-damper-value').textContent).toBe('15');
  });
  it('does not send overlapping calls', async () => {
    const card = setup('switch.room', 'off'); let resolve;
    card._hass.callService.mockReturnValue(new Promise(r => { resolve = r; }));
    const first = card._commitDamper('switch.room', 1);
    await card._commitDamper('switch.room', 1);
    expect(card._hass.callService).toHaveBeenCalledTimes(1); resolve(); await first;
  });
  it('sends no services while moving, and one on change', async () => {
    const card = setup('number.room', '10', { min: 10, max: 30, step: 2 });
    const input = card.shadowRoot.querySelector('.hac-damper-range');
    input.value = '500'; input.dispatchEvent(new Event('input', { bubbles: true }));
    input.value = '700'; input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(card._hass.callService).not.toHaveBeenCalled();
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await Promise.resolve();
    expect(card._hass.callService).toHaveBeenCalledTimes(1);
    expect(card._hass.callService).toHaveBeenCalledWith('number', 'set_value', { entity_id: 'number.room', value: 24 });
  });
  it('never dispatches an off-step number above its allowed step range', async () => {
    const card = setup('number.room', '0', { min: 0, max: 10, step: 6 });
    await card._commitDamper('number.room', 1);
    expect(card._hass.callService).toHaveBeenCalledWith('number', 'set_value', { entity_id: 'number.room', value: 6 });
  });
  it('disables unavailable entities without sending commands', async () => {
    const card = setup('switch.room', 'unavailable');
    expect(card.shadowRoot.querySelector('.hac-damper-range').disabled).toBe(true);
    await card._commitDamper('switch.room', 1);
    expect(card._hass.callService).not.toHaveBeenCalled();
  });
  it('leaves the control absent for existing configurations', () => {
    const card = setup('switch.room', 'on'); card.setConfig({ entities: [{ entity: 'climate.room' }] });
    expect(card.shadowRoot.querySelector('.hac-damper')).toBeNull();
  });
});

describe('damper editor', () => {
  it('lists only supported domains and persists selection and removal', () => {
    const editor = document.createElement('nimbus-climate-card-editor');
    const states = Object.fromEntries(['climate.room', 'cover.vent', 'number.vent', 'select.vent', 'switch.vent', 'light.vent'].map(id => [id, { attributes: {} }]));
    editor.setConfig({ entities: [{ entity: 'climate.room', name: 'Room' }] }); editor.hass = { states }; document.body.append(editor);
    const select = editor.shadowRoot.querySelector('[data-field="damper_entity"]');
    expect([...select.options].map(option => option.value)).toEqual(['', 'cover.vent', 'number.vent', 'select.vent', 'switch.vent']);
    let result; editor.addEventListener('config-changed', event => { result = structuredClone(event.detail.config); });
    select.value = 'cover.vent'; select.dispatchEvent(new Event('change')); expect(result.entities[0]).toMatchObject({ entity: 'climate.room', name: 'Room', damper_entity: 'cover.vent' });
    select.value = ''; select.dispatchEvent(new Event('change')); expect(result.entities[0].damper_entity).toBe(''); editor.remove();
  });
});
