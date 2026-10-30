import { beforeAll, afterEach, describe, it, expect, vi } from 'vitest';

beforeAll(async () => { await import('../nimbus-climate-card.js'); });
afterEach(() => { document.body.replaceChildren(); });

function setup() {
  const card = document.createElement('nimbus-climate-card');
  card.setConfig({ entities: [{ entity: 'climate.room' }] });
  const hass = { config: { unit_system: { temperature: '°C' } }, states: { 'climate.room': {
    state: 'heat', attributes: { friendly_name: 'Room', supported_features: 8 + 16 + 32 + 512,
      current_temperature: 20, fan_modes: ['low', 'high'], fan_mode: 'low',
      swing_modes: ['off', 'on'], swing_mode: 'off', swing_horizontal_modes: ['left', 'right'], swing_horizontal_mode: 'left',
      preset_modes: ['eco', 'boost'], preset_mode: 'eco', hvac_modes: ['off', 'heat'] }
  } }, callService: vi.fn(), callWS: vi.fn().mockResolvedValue({}), callApi: vi.fn().mockResolvedValue([]) };
  card.hass = hass; document.body.append(card);
  return { card, hass, button: service => card.shadowRoot.querySelector(`[data-service="${service}"]`) };
}
const menu = () => document.querySelector('[role="listbox"]');
const options = () => [...menu().querySelectorAll('[role="option"]')];
const key = (node, value) => node.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));

describe('climate control menus', () => {
  it.each([
    ['fan', 'set_fan_mode', 'fan_mode', 'high'],
    ['swing', 'set_swing_mode', 'swing_mode', 'on'],
    ['swingh', 'set_swing_horizontal_mode', 'swing_horizontal_mode', 'right'],
    ['preset', 'set_preset_mode', 'preset_mode', 'boost'],
  ])('selects %s using the existing climate service', (control, service, field, value) => {
    const { button, hass } = setup(); button(control).click();
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    options()[1].click();
    expect(hass.callService).toHaveBeenCalledWith('climate', service, { entity_id: 'climate.room', [field]: value });
    expect(menu()).toBeNull(); expect(document.activeElement.shadowRoot.activeElement).toBe(button(control));
  });
  it('navigates with arrows and selects with Enter or Space', () => {
    const { button, hass } = setup(); const trigger = button('fan');
    key(trigger, 'ArrowDown'); expect(document.activeElement).toBe(options()[0]);
    key(menu(), 'ArrowDown'); expect(document.activeElement).toBe(options()[1]);
    key(menu(), 'Enter'); expect(hass.callService).toHaveBeenCalledWith('climate', 'set_fan_mode', expect.objectContaining({ fan_mode: 'high' }));
    trigger.click(); key(menu(), 'End'); key(menu(), ' '); expect(hass.callService).toHaveBeenCalledTimes(2);
  });
  it('closes on Escape and outside pointerdown', () => {
    const { button, hass } = setup(); const trigger = button('fan');
    trigger.click(); key(menu(), 'Escape'); expect(menu()).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click(); document.body.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    expect(menu()).toBeNull(); expect(hass.callService).not.toHaveBeenCalled();
  });
  it('updates the displayed and selected value on Home Assistant changes', () => {
    const { card, hass, button } = setup(); button('swingh').click();
    hass.states['climate.room'].attributes.swing_horizontal_mode = 'right'; card.hass = { ...hass };
    expect(menu()).toBeNull(); expect(button('swingh').textContent).toContain('right');
    button('swingh').click(); expect(options()[1].getAttribute('aria-selected')).toBe('true');
  });
  it('opens upward and stays within a narrow viewport', () => {
    const { button } = setup(); const trigger = button('fan');
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({ left: 290, top: 180, bottom: 210, width: 120 });
    vi.stubGlobal('innerWidth', 320); vi.stubGlobal('innerHeight', 220);
    trigger.click(); expect(parseFloat(menu().style.top)).toBeLessThan(180);
    expect(parseFloat(menu().style.left) + parseFloat(menu().style.width)).toBeLessThanOrEqual(316);
    vi.unstubAllGlobals();
  });
});
