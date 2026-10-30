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
    expect(model('cover.room', undefined)).toEqual({ domain: 'cover', available: false });
  });
  it('reads cover position and capability flags without inventing position', () => {
    expect(model('cover.room', 'open', { current_position: 35, supported_features: 7 })).toMatchObject({ position: .35, value: 35, canSetPosition: true, canOpen: true, canClose: true });
    expect(model('cover.room', 'open', { supported_features: 3 })).toMatchObject({ position: null, value: null, canSetPosition: false, canOpen: true, canClose: true });
    expect(model('cover.room', 'open', { current_position: null })).toMatchObject({ position: null });
    expect(model('cover.room', 'open', { current_position: ' ' })).toMatchObject({ position: null });
    expect(model('cover.room', 'invalid')).toMatchObject({ available: false });
  });
  it('normalizes number values and rejects missing or invalid bounds', () => {
    expect(model('number.room', '15', { min: 10, max: 30, step: 2.5, unit_of_measurement: '°' })).toMatchObject({ value: 15, position: .25, step: 2.5, unit: '°' });
    expect(model('number.room', '15', { min: 10, max: 30 })).toMatchObject({ available: false });
    expect(model('number.room', '15', { min: ' ', max: 30, step: 1 })).toMatchObject({ available: false });
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
    ['number.room', '-5', { min: -10, max: 10, step: .25 }, .61, 'number', 'set_value', { value: 2.25 }],
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
    expect(card.shadowRoot.querySelectorAll('.hac-damper-vmark')).toHaveLength(3);
  });
  it('aligns each select V pair with the illuminated fill position', () => {
    for (const [index, value] of ['low', 'medium', 'high'].entries()) {
      const card = setup('select.room', value, { options: ['low', 'medium', 'high'] });
      const ticks = [...card.shadowRoot.querySelectorAll('.hac-damper-vmark')];
      const fill = card.shadowRoot.querySelector('.hac-damper-fill');
      expect(ticks).toHaveLength(3);
      expect(ticks[index].style.getPropertyValue('--tick')).toBe(fill.style.getPropertyValue('--position'));
      expect(card.shadowRoot.querySelector('.hac-damper-marker')).toBeNull();
      card.remove();
    }
  });
  it.each([1, 2, 3, 5, 7])('uses one coordinate area for %i option markers, labels, input and fill', async count => {
    const options = Array.from({ length: count }, (_, i) => `option-${i}`);
    for (let index = 0; index < count; index++) {
      const card = setup('select.room', options[index], { options });
      const area = card.shadowRoot.querySelector('.hac-damper-select-area');
      const markers = [...area.querySelectorAll('.hac-damper-vmark')];
      const labels = [...area.querySelectorAll('.hac-damper-select-labels span')];
      const fraction = count === 1 ? 0 : index / (count - 1);
      const position = `${fraction * 100}%`;
      expect(markers[index].style.getPropertyValue('--tick')).toBe(position);
      expect(labels[index].style.getPropertyValue('--tick')).toBe(position);
      expect(area.querySelector('.hac-damper-fill').style.getPropertyValue('--position')).toBe(position);
      expect(Number(area.querySelector('.hac-damper-range').value)).toBeCloseTo(fraction * 1000, 6);
      const next = (index + 1) % count;
      await card._commitDamper('select.room', count === 1 ? 0 : next / (count - 1));
      if (count === 1) expect(card._hass.callService).not.toHaveBeenCalled();
      else expect(card._hass.callService).toHaveBeenCalledWith('select', 'select_option', { entity_id: 'select.room', option: options[next] });
      card.remove();
    }
  });
  it.each([['off', '2px'], ['on', '50%']])('highlights only the %s switch half', (state, left) => {
    const card = setup('switch.room', state);
    const fill = card.shadowRoot.querySelector('.hac-damper-fill');
    expect(fill.style.getPropertyValue('--switch-start')).toBe(left);
    expect(card.shadowRoot.querySelector('.hac-damper-marker')).toBeNull();
    expect(card.shadowRoot.querySelector('.hac-damper-value').textContent).toBe('');
    expect(card.shadowRoot.querySelector('.hac-damper-labels').textContent).toBe('OFFON');
    expect(card.shadowRoot.querySelectorAll('.hac-damper-tick')).toHaveLength(0);
  });
  it('moves the switch half while previewing without dispatching a service', () => {
    const card = setup('switch.room', 'off'); const input = card.shadowRoot.querySelector('.hac-damper-range');
    input.value = '1000'; input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(card.shadowRoot.querySelector('.hac-damper-fill').style.getPropertyValue('--switch-start')).toBe('50%');
    expect(card.shadowRoot.querySelector('.hac-damper-marker')).toBeNull();
    expect(card._hass.callService).not.toHaveBeenCalled();
  });
  it.each(['cover.room', 'number.room', 'select.room', 'switch.room'])('renders %s without an end indicator', id => {
    const cases = { 'cover.room': ['open', { current_position: 30, supported_features: 7 }], 'number.room': ['30', { min: 0, max: 100, step: 1 }], 'select.room': ['low', { options: ['low', 'high'] }], 'switch.room': ['off', {}] };
    const [state, attrs] = cases[id]; const card = setup(id, state, attrs);
    expect(card.shadowRoot.querySelector('.hac-damper-marker')).toBeNull();
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
  it('commits a select pointer gesture once if the browser omits change', async () => {
    const card = setup('select.room', 'low', { options: ['low', 'mid', 'high'] });
    const input = card.shadowRoot.querySelector('.hac-damper-range');
    input.dispatchEvent(new Event('pointerdown')); input.value = '1000';
    input.dispatchEvent(new Event('input')); input.dispatchEvent(new Event('pointerup'));
    await Promise.resolve();
    expect(card._hass.callService).toHaveBeenCalledTimes(1);
    expect(card._hass.callService).toHaveBeenCalledWith('select', 'select_option', { entity_id: 'select.room', option: 'high' });
    input.dispatchEvent(new Event('change'));
    expect(card._hass.callService).toHaveBeenCalledTimes(1);
  });
  it.each([
    ['cover.room', 'open', { current_position: 20, supported_features: 4 }, 'cover', 'set_cover_position', { position: 100 }],
    ['number.room', '0', { min: 0, max: 100, step: 1 }, 'number', 'set_value', { value: 100 }],
    ['switch.room', 'off', {}, 'switch', 'turn_on', {}],
  ])('commits %s once when pointer change is omitted', async (id, state, attrs, domain, service, extra) => {
    const card = setup(id, state, attrs); const input = card.shadowRoot.querySelector('.hac-damper-range');
    input.dispatchEvent(new Event('pointerdown')); input.value = '1000';
    input.dispatchEvent(new Event('input')); input.dispatchEvent(new Event('pointerup'));
    await Promise.resolve();
    expect(card._hass.callService).toHaveBeenCalledTimes(1);
    expect(card._hass.callService).toHaveBeenCalledWith(domain, service, { entity_id: id, ...extra });
    input.dispatchEvent(new Event('change'));
    expect(card._hass.callService).toHaveBeenCalledTimes(1);
  });
  it('restores actual feedback when a drag is cancelled', () => {
    const card = setup('number.room', '20', { min: 0, max: 100, step: 1 });
    const input = card.shadowRoot.querySelector('.hac-damper-range');
    input.dispatchEvent(new Event('pointerdown')); input.value = '800'; input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('pointercancel'));
    expect(card.shadowRoot.querySelector('.hac-damper-fill').style.getPropertyValue('--position')).toBe('20%');
    expect(card._hass.callService).not.toHaveBeenCalled();
  });
  it.each([
    ['cover.room', 'closed', { current_position: 0, supported_features: 7 }, 'open', { current_position: 70, supported_features: 7 }, '70%'],
    ['switch.room', 'off', {}, 'on', {}, '50%'],
  ])('refreshes externally changed %s state', (id, initial, attrs, next, nextAttrs, expected) => {
    const card = setup(id, initial, attrs);
    card.hass = { ...card._hass, states: { ...card._hass.states, [id]: { state: next, attributes: nextAttrs } } };
    const style = card.shadowRoot.querySelector('.hac-damper-fill').style;
    expect(style.getPropertyValue(id.startsWith('switch') ? '--switch-start' : '--position')).toBe(expected);
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
  it('preserves HVAC and temperature control calls with a damper present', () => {
    const card = setup('switch.room', 'off');
    Object.assign(card._hass.states['climate.room'].attributes, { supported_features: 9, temperature: 20, min_temp: 10, max_temp: 30, target_temp_step: .5 });
    card._setMode('cool'); card._changeTemp(.5);
    expect(card._hass.callService).toHaveBeenCalledWith('climate', 'set_hvac_mode', { entity_id: 'climate.room', hvac_mode: 'cool' });
    expect(card._hass.callService).toHaveBeenCalledWith('climate', 'set_temperature', { entity_id: 'climate.room', temperature: 20.5 });
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
