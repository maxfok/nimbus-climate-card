// Nimbus Climate Card v1.3.2.3
// A Home Assistant Lovelace card for climate entities

const CARD_VERSION = '1.3.2.3';
const NIMBUS_GRID_ROW_HEIGHT = 56;
const NIMBUS_GRID_ROW_GAP = 8;
const NIMBUS_GRID_ROW_PADDING = 4;

const rowCache = () => {
  window.__nimbusClimateRows = window.__nimbusClimateRows || new Map();
  return window.__nimbusClimateRows;
};

const CLIMATE_FEATURE = {
  TARGET_TEMPERATURE:       1,
  TARGET_TEMPERATURE_RANGE: 2,
  TARGET_HUMIDITY:          4,
  FAN_MODE:                 8,
  PRESET_MODE:              16,
  SWING_MODE:               32,
  TURN_OFF:                 128,
  TURN_ON:                  256,
  SWING_HORIZONTAL_MODE:    512,
};

// ── i18n ──────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    actions:  { heating: 'Heating', cooling: 'Cooling', drying: 'Drying', fan: 'Fan running', preheating: 'Preheating', defrosting: 'Defrosting', idle: 'Idle', off: 'Off' },
    modes:    { off: 'off', heat: 'heat', cool: 'cool', auto: 'auto', dry: 'dry', fan_only: 'fan only', heat_cool: 'h/c' },
    ui: {
      indoor: 'Indoor', outdoor: 'Outdoor', humidity: 'Humidity', targetRH: 'Target RH',
      speed: 'Speed', swingV: 'Swing V', swingH: 'Swing H', preset: 'Preset',
      target: 'Target', range: 'Range', noTarget: 'No target',
      atTarget: 'at target', reachingTarget: 'reaching target',
      unavailable: 'Entity unavailable', addThermostat: '＋ Add thermostat',
    },
  },
  el: {
    actions:  { heating: '\u0398\u03ad\u03c1\u03bc\u03b1\u03bd\u03c3\u03b7', cooling: '\u03a8\u03cd\u03be\u03b7', drying: '\u0391\u03c0\u03bf\u03be\u03ae\u03c1\u03b1\u03bd\u03c3\u03b7', fan: '\u0391\u03bd\u03b5\u03bc\u03b9\u03c3\u03bc\u03cc\u03c2', preheating: '\u03a0\u03c1\u03bf\u03b8\u03ad\u03c1\u03bc\u03b1\u03bd\u03c3\u03b7', defrosting: '\u0391\u03c0\u03bf\u03c0\u03ac\u03b3\u03c9\u03bc\u03b1', idle: '\u0391\u03bd\u03b5\u03bd\u03b5\u03c1\u03b3\u03cc', off: '\u039f\u03c6\u03c6' },
    modes:    { off: '\u03bf\u03c6\u03c6', heat: '\u03b8\u03ad\u03c1\u03bc\u03b1\u03bd\u03c3\u03b7', cool: '\u03c8\u03cd\u03be\u03b7', auto: '\u03b1\u03c5\u03c4\u03cc\u03bc\u03b1\u03c4\u03bf', dry: '\u03b1\u03c6\u03cd\u03b3\u03c1\u03b1\u03bd\u03c3\u03b7', fan_only: '\u03b1\u03bd\u03b5\u03bc\u03b9\u03c3\u03bc\u03cc\u03c2', heat_cool: '\u03b8/\u03c8' },
    ui: {
      indoor: '\u0395\u03c3\u03c9\u03c4\u03b5\u03c1\u03b9\u03ba\u03cc', outdoor: '\u0395\u03be\u03c9\u03c4\u03b5\u03c1\u03b9\u03ba\u03cc', humidity: '\u03a5\u03b3\u03c1\u03b1\u03c3\u03af\u03b1', targetRH: '\u03a3\u03c4\u03cc\u03c7\u03bf\u03c2 \u03a5\u03b3\u03c1',
      speed: '\u03a4\u03b1\u03c7\u03cd\u03c4\u03b7\u03c4\u03b1', swingV: '\u039f\u03c3\u03ba. \u039a\u03ac\u03b8.', swingH: '\u039f\u03c3\u03ba. \u039f\u03c1\u03b9\u03b6.', preset: '\u03a1\u03cd\u03b8\u03bc\u03b9\u03c3\u03b7',
      target: '\u03a3\u03c4\u03cc\u03c7\u03bf\u03c2', range: '\u0395\u03cd\u03c1\u03bf\u03c2', noTarget: '\u03a7\u03c9\u03c1\u03af\u03c2 \u03c3\u03c4\u03cc\u03c7\u03bf',
      atTarget: '\u03c3\u03c4\u03bf \u03c3\u03c4\u03cc\u03c7\u03bf', reachingTarget: '\u03c0\u03c1\u03bf\u03c3\u03ad\u03b3\u03b3\u03b9\u03c3\u03b7 \u03c3\u03c4\u03cc\u03c7\u03bf\u03c5',
      unavailable: '\u039c\u03b7 \u03b4\u03b9\u03b1\u03b8\u03ad\u03c3\u03b9\u03bc\u03b7 \u03bf\u03bd\u03c4\u03cc\u03c4\u03b7\u03c4\u03b1', addThermostat: '\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03b8\u03b5\u03c1\u03bc\u03bf\u03c3\u03c4\u03ac\u03c4\u03b7',
    },
  },
  de: {
    actions:  { heating: 'Heizen', cooling: 'K\u00fchlen', drying: 'Trocknen', fan: 'L\u00fcfter', preheating: 'Vorheizen', defrosting: 'Abtauen', idle: 'Bereit', off: 'Aus' },
    modes:    { off: 'aus', heat: 'heizen', cool: 'k\u00fchlen', auto: 'auto', dry: 'trocknen', fan_only: 'l\u00fcfter', heat_cool: 'h/k' },
    ui: {
      indoor: 'Innen', outdoor: 'Au\u00dfen', humidity: 'Luftfeuchte', targetRH: 'Ziel-LF',
      speed: 'Stufe', swingV: 'Lamellenst. V', swingH: 'Lamellenst. H', preset: 'Programm',
      target: 'Ziel', range: 'Bereich', noTarget: 'Kein Ziel',
      atTarget: 'am Ziel', reachingTarget: 'Ziel wird erreicht',
      unavailable: 'Ger\u00e4t nicht verf\u00fcgbar', addThermostat: '＋ Thermostat hinzuf\u00fcgen',
    },
  },
  es: {
    actions:  { heating: 'Calentando', cooling: 'Enfriando', drying: 'Secando', fan: 'Ventilador', preheating: 'Precalentando', defrosting: 'Descongelando', idle: 'Inactivo', off: 'Apagado' },
    modes:    { off: 'apagado', heat: 'calor', cool: 'fr\u00edo', auto: 'auto', dry: 'seco', fan_only: 'ventilador', heat_cool: 'c/f' },
    ui: {
      indoor: 'Interior', outdoor: 'Exterior', humidity: 'Humedad', targetRH: 'HR objetivo',
      speed: 'Velocidad', swingV: 'Oscil. V', swingH: 'Oscil. H', preset: 'Programa',
      target: 'Objetivo', range: 'Rango', noTarget: 'Sin objetivo',
      atTarget: 'en objetivo', reachingTarget: 'alcanzando objetivo',
      unavailable: 'Entidad no disponible', addThermostat: '＋ A\u00f1adir termostato',
    },
  },
  fr: {
    actions:  { heating: 'Chauffage', cooling: 'Climatisation', drying: 'S\u00e9chage', fan: 'Ventilateur', preheating: 'Pr\u00e9chauffage', defrosting: 'D\u00e9givrage', idle: 'Inactif', off: 'Arr\u00eat' },
    modes:    { off: 'arr\u00eat', heat: 'chaud', cool: 'froid', auto: 'auto', dry: 'sec', fan_only: 'ventilateur', heat_cool: 'ch/fr' },
    ui: {
      indoor: 'Int\u00e9rieur', outdoor: 'Ext\u00e9rieur', humidity: 'Humidit\u00e9', targetRH: 'HR cible',
      speed: 'Vitesse', swingV: 'Oscil. V', swingH: 'Oscil. H', preset: 'Programme',
      target: 'Cible', range: 'Plage', noTarget: 'Sans cible',
      atTarget: '\u00e0 la cible', reachingTarget: 'approche de la cible',
      unavailable: 'Entit\u00e9 indisponible', addThermostat: '＋ Ajouter un thermostat',
    },
  },
};
const getT = (hass) => TRANSLATIONS[hass?.language?.split('-')[0]] || TRANSLATIONS.en;

// hvac_action → human readable status (kept for backwards compat, resolved at render time)
const HVAC_ACTION_STATUS = {
  heating: 'Heating', cooling: 'Cooling', drying: 'Drying', fan: 'Fan running',
  preheating: 'Preheating', defrosting: 'Defrosting', idle: 'Idle', off: 'Off',
};
const supports = (attrs, feature) => ((attrs.supported_features ?? 0) & feature) !== 0;

const MODES = {
  off:      { label: 'off',  accent: 'oklch(0.72 0.01 60)',  glow: 'oklch(0.55 0.02 60 / 0.18)',  icon: 'M12 3v9M5.5 7.5a8 8 0 1 0 13 0' },
  heat:     { label: 'heat', accent: 'oklch(0.78 0.16 45)',  glow: 'oklch(0.65 0.18 45 / 0.32)',  icon: 'M12 2.5c.7 3.2 3 4.6 4 6.5 1.4 2.5 1.5 5.5-.4 7.8a6.4 6.4 0 0 1-9.7-.4C4 14 5 10.5 7.2 9c.4 1.1 1.3 1.7 2 1.7-.4-2 .3-5.4 2.8-8.2Z' },
  cool:     { label: 'cool', accent: 'oklch(0.78 0.13 235)', glow: 'oklch(0.65 0.16 235 / 0.32)', icon: 'M12 3v18M5 6.5l14 11M5 17.5l14-11M12 6.5 9.5 4M12 6.5 14.5 4M12 17.5 9.5 20M12 17.5 14.5 20M5 12H2.5M5 12 3 9.5M5 12 3 14.5M21.5 12H19M19 12l2-2.5M19 12l2 2.5' },
  auto:     { label: 'auto', accent: 'oklch(0.80 0.13 180)', glow: 'oklch(0.65 0.14 180 / 0.28)', icon: 'M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3ZM12 8v4l3 3' },
  dry:      { label: 'dry',  accent: 'oklch(0.80 0.12 260)', glow: 'oklch(0.65 0.13 260 / 0.28)', icon: 'M12 3.5c-3 4-6 7-6 10a6 6 0 0 0 12 0c0-3-3-6-6-10Z' },
  fan_only: { label: 'fan only', accent: 'oklch(0.80 0.10 200)', glow: 'oklch(0.65 0.11 200 / 0.28)', icon: 'M12 10c0-3 .5-6 2.5-7-1 0-3 1-3 4M12 14c0 3-.5 6-2.5 7 1 0 3-1 3-4M14 12c3 0 6 .5 7 2.5 0-1-1-3-4-3M10 12c-3 0-6-.5-7-2.5 0 1 1 3 4 3M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0' },
  heat_cool:{ label: 'h/c',  accent: 'oklch(0.78 0.14 60)',  glow: 'oklch(0.65 0.15 60 / 0.28)',  icon: 'M12 3v18M5 6.5l14 11M19 6.5 5 17.5' },
};

const SVG = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d.split('M').filter(Boolean).map(p=>`<path d="M${p}"/>`).join('')}</svg>`;

const ICONS = {
  drop:    SVG('M12 3.5c-3 4-6 7-6 10a6 6 0 0 0 12 0c0-3-3-6-6-10Z'),
  wave:    SVG('M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0'),
  up:      SVG('M6 14l6-6 6 6'),
  down:    SVG('M6 10l6 6 6-6'),
  outdoor: SVG('M12 2a7 7 0 0 1 7 7c0 4-7 13-7 13S5 13 5 9a7 7 0 0 1 7-7Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'),
  preset:  SVG('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z'),
  fan:     SVG('M12 10c0-3 .5-6 2.5-7-1 0-3 1-3 4M12 14c0 3-.5 6-2.5 7 1 0 3-1 3-4M14 12c3 0 6 .5 7 2.5 0-1-1-3-4-3M10 12c-3 0-6-.5-7-2.5 0 1 1 3 4 3M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0'),
  swing:   SVG('M4 12h16M4 6l4 6-4 6M20 6l-4 6 4 6'),
  thermometer: SVG('M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'),
  co2:     '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="1" y="15" font-size="11" font-weight="600" fill="currentColor" font-family="system-ui,sans-serif">CO</text><text x="16" y="17" font-size="7" font-weight="600" fill="currentColor" font-family="system-ui,sans-serif">2</text></svg>',
  power:   SVG('M13 2L4 14h7l-1 8 9-12h-7l2-8Z'),
  pm25:    SVG('M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0M7 8m-1 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0M17 8m-1 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0M7 16m-1 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0M17 16m-1 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0'),
};

const SENSOR_ICON = {
  humidity:                    'wave',
  temperature:                 'thermometer',
  carbon_dioxide:              'co2',
  power:                       'power',
  energy:                      'power',
  pm25:                        'pm25',
  pm10:                        'pm25',
  volatile_organic_compounds:  'pm25',
};

const CSS = `
  :host { display: block; margin: 0 !important; padding: 0 !important; width: 100%; }
  * { box-sizing: border-box; }

  .hac {
    position: relative;
    width: 100%;
    font-family: -apple-system, 'Manrope', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    --accent: oklch(0.78 0.16 45);
    --glow:   oklch(0.65 0.18 45 / 0.32);
    --surface:   #1b1d22;
    --surface-2: #232529;
    --surface-3: #2a2c32;
    --line:   rgba(255,255,255,.06);
    --line-2: rgba(255,255,255,.10);
    --ink:   #ecebe7;
    --ink-2: #c2c0bb;
    --ink-3: #8a8884;
    --ink-4: #5e5d59;
    background: transparent;
    border-radius: 20px;
    overflow: visible;
    padding: 0;
  }

  .hac-ambient {
    position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
    background: radial-gradient(50% 40% at 50% 100%, var(--glow), transparent 70%);
    filter: blur(12px);
    transition: background .6s ease;
  }

  .hac-tabs {
    position: relative; z-index: 2;
    display: flex; gap: 4px; padding: 3px;
    margin: 0 0 10px;
    background: rgba(255,255,255,.025);
    border: 1px solid var(--line);
    border-radius: 14px;
    width: fit-content; max-width: 100%;
    overflow-x: auto;
  }
  .hac-tab {
    appearance: none; border: 0; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 11px; border-radius: 10px;
    background: transparent; color: var(--ink-3);
    font: 600 12px/1 inherit; letter-spacing: .005em;
    transition: color .2s, background .2s; white-space: nowrap;
  }
  .hac-tab:hover { color: var(--ink-2); }
  .hac-tab.is-active {
    background: var(--surface-2); color: var(--ink);
    box-shadow: 0 1px 0 rgba(255,255,255,.04) inset, 0 1px 2px rgba(0,0,0,.25);
  }

  .hac-card {
    position: relative; z-index: 1;
    width: 100%;
    background: linear-gradient(180deg, var(--surface) 0%, #181a1e 100%);
    border: 1px solid var(--line-2);
    border-radius: 20px;
    padding: 20px 20px 16px;
  }

  .hac-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
  .hac-id { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .hac-avatar {
    width: 40px; height: 40px; border-radius: 13px; flex: none;
    display: grid; place-items: center;
    background: radial-gradient(120% 120% at 30% 20%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 70%), var(--surface-3);
    color: var(--accent);
    border: 1px solid color-mix(in oklch, var(--accent) 35%, transparent);
    transition: color .3s, background .3s, border-color .3s;
  }
  .hac-avatar svg { width: 20px; height: 20px; }
  .hac-name { font: 700 16px/1.2 inherit; letter-spacing: -.01em; color: var(--ink); }
  .hac-sub { margin-top: 3px; display: flex; align-items: center; gap: 6px; font: 500 11px/1.2 inherit; color: var(--ink-3); }
  .hac-dot {
    width: 6px; height: 6px; border-radius: 99px;
    background: var(--accent); box-shadow: 0 0 8px var(--accent);
    animation: pulse 2.4s ease-in-out infinite; flex-shrink: 0;
  }
  .hac[data-mode="off"] .hac-dot { animation: none; opacity: .4; box-shadow: none; }
  @keyframes pulse {
    0%,100% { opacity: .55; transform: scale(.85); }
    50%      { opacity: 1;   transform: scale(1.15); }
  }
  .hac-pill {
    flex: none; display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 10px 5px 8px; border-radius: 99px;
    background: color-mix(in oklch, var(--accent) 14%, transparent);
    color: var(--accent);
    border: 1px solid color-mix(in oklch, var(--accent) 25%, transparent);
    font: 600 11px/1 inherit; letter-spacing: .04em; text-transform: uppercase;
    transition: background .3s, color .3s, border-color .3s;
  }
  .hac-pill-dot { width: 5px; height: 5px; border-radius: 99px; background: var(--accent); }

  .hac-body {
    display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px;
    background: rgba(255,255,255,.02);
    border: 1px solid var(--line);
    border-radius: 16px; padding: 16px;
    margin-bottom: 12px;
  }
  .hac-divider-v {
    width: 1px; align-self: stretch;
    background: linear-gradient(180deg, transparent, var(--line-2) 30%, var(--line-2) 70%, transparent);
  }
  .hac-divider-h {
    height: 1px; margin: 2px 0;
    background: linear-gradient(90deg, transparent, var(--line-2), transparent);
  }

  .hac-readings { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .hac-reading { display: flex; flex-direction: column; gap: 4px; }
  .hac-ricon { display:flex; align-items:center; opacity:.6; flex-shrink:0; }
  .hac-ricon svg { width:13px; height:13px; stroke:var(--ink-2); fill:none; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
  .hac-rval { display:flex; align-items:baseline; gap:3px; }
  .hac-rval-secondary { margin-top:5px; }
  .hac-num-sm { font:600 15px/1 inherit !important; }
  .hac-rlabel {
    display: inline-flex; align-items: center; gap: 5px;
    color: var(--ink-3); font: 500 10.5px/1 inherit; letter-spacing: .06em; text-transform: uppercase;
  }
  .hac-rlabel svg { width: 12px; height: 12px; opacity: .7; }
  .hac-rval { display: flex; align-items: baseline; gap: 2px; }
  .hac-num { font: 700 32px/1 inherit; letter-spacing: -.02em; color: var(--ink); font-variant-numeric: tabular-nums; }
  .hac-unit { font: 600 12px/1 inherit; color: var(--ink-3); letter-spacing: .02em; }

  .hac-target {
    display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 12px;
    padding: 0 8px;
  }
  .hac-step {
    appearance: none; border: 0; cursor: pointer;
    width: 40px; height: 40px; border-radius: 13px;
    display: grid; place-items: center;
    background: var(--surface-3); color: var(--ink-2);
    border: 1px solid var(--line-2);
    transition: transform .12s ease, background .2s, color .2s, border-color .2s;
  }
  .hac-step:hover {
    background: color-mix(in oklch, var(--accent) 14%, var(--surface-3));
    color: var(--accent);
    border-color: color-mix(in oklch, var(--accent) 35%, transparent);
  }
  .hac-step:active { transform: scale(.94); }
  .hac-step svg { width: 20px; height: 20px; }

  .hac-tval { text-align: center; }
  .hac-tnum {
    font: 800 44px/1 inherit; letter-spacing: -.04em; color: var(--ink);
    font-variant-numeric: tabular-nums;
    display: inline-flex; align-items: flex-start;
  }
  .hac-tunit { font-size: 11px; font-weight: 700; line-height: 1; color: var(--accent); margin-left: 2px; transition: color .3s; align-self: flex-start; margin-top: 6px; }
  .hac-tlabel { margin-top: 4px; font: 500 10px/1 inherit; color: var(--ink-3); letter-spacing: .12em; text-transform: uppercase; }
  .hac-delta { margin-top: 6px; font: 500 10.5px/1 inherit; padding: 3px 8px; border-radius: 99px; display: inline-block; }
  .hac-delta.up   { color: oklch(0.78 0.16 45);  background: oklch(0.78 0.16 45 / 0.12); }
  .hac-delta.down { color: oklch(0.78 0.13 235); background: oklch(0.78 0.13 235 / 0.12); }
  .hac-delta.neutral { color: var(--ink-3); background: rgba(255,255,255,.04); }
  .hac[data-mode="off"] .hac-tnum,
  .hac[data-mode="fan_only"] .hac-tnum { color: var(--ink-2); }

  .hac-modes { display: grid; gap: 8px; margin-bottom: 8px; }
  .hac-mode {
    appearance: none; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 12px 8px;
    background: rgba(255,255,255,.025);
    border: 1px solid var(--line);
    border-radius: 13px;
    color: var(--ink-3);
    font: 600 11.5px/1 inherit; letter-spacing: .02em;
    transition: background .2s, border-color .2s, color .2s, transform .12s;
  }
  .hac-mode:hover { color: var(--ink-2); background: rgba(255,255,255,.04); }
  .hac-mode:active { transform: scale(.97); }
  .hac-mode.is-active {
    background: linear-gradient(180deg,
      color-mix(in oklch, var(--m-accent) 18%, transparent),
      color-mix(in oklch, var(--m-accent) 8%, transparent));
    border-color: color-mix(in oklch, var(--m-accent) 45%, transparent);
    color: var(--m-accent);
    box-shadow: inset 0 1px 0 color-mix(in oklch, var(--m-accent) 25%, transparent),
                0 6px 20px -8px color-mix(in oklch, var(--m-accent) 60%, transparent);
  }
  .hac-mode.is-off-active {
    background: rgba(255,255,255,.04);
    border-color: rgba(255,255,255,.12);
    color: var(--ink-3);
  }
  .hac-mode svg { width: 18px; height: 18px; opacity: .95; }

  .hac-extras {
    display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;
  }
  .hac-damper { display:flex; align-items:center; gap:10px; padding:10px 12px; margin:0 0 8px; min-width:0; border:1px solid var(--line); border-radius:11px; background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.01)); color:var(--ink-2); }
  .hac-damper-icon { width:26px; height:26px; flex:none; color:var(--ink-2); }
  .hac-damper-icon svg { display:block; width:100%; height:100%; }
  .hac-damper-name { min-width:52px; font-size:12px; line-height:1.2; color:var(--ink); }
  .hac-damper-kind { display:block; color:var(--ink-3); font-size:10px; }
  .hac-damper-control { flex:1; min-width:0; position:relative; padding:6px 0; }
  .hac-damper-track { position:relative; height:22px; border-radius:14px; border:1px solid var(--line-2); background:linear-gradient(180deg,rgba(0,0,0,.65) 0%,rgba(255,255,255,.08) 45%,rgba(0,0,0,.5) 100%); box-shadow:inset 0 1px 3px rgba(255,255,255,.13),inset 0 -2px 4px rgba(0,0,0,.65),0 1px 0 rgba(255,255,255,.04); overflow:visible; }
  .hac-damper-fill { position:absolute; inset:2px auto 2px 2px; width:calc(var(--position) - 4px); max-width:calc(100% - 4px); border-radius:inherit; background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 70%,white 30%) 0%,var(--accent) 40%,color-mix(in srgb,var(--accent) 60%,transparent) 100%); box-shadow:0 0 10px var(--glow),inset 0 1px rgba(255,255,255,.25); transition:width .18s ease; }
  .hac-damper[data-damper-domain="switch"] .hac-damper-fill { left:var(--switch-start); width:calc(50% - 4px); transition:left .18s ease; }
  .hac-damper-range { position:absolute; inset:0; width:100%; height:100%; margin:0; opacity:0; cursor:pointer; touch-action:pan-y; }
  .hac-damper-range:focus-visible + .hac-damper-outline { position:absolute; inset:2px -3px; border:2px solid var(--accent); border-radius:13px; pointer-events:none; }
  .hac-damper-ticks { position:absolute; inset:4px 0 auto; height:24px; pointer-events:none; }
  .hac-damper-tick { position:absolute; left:var(--tick); top:0; bottom:0; width:1px; background:var(--ink-2); opacity:.55; }
  .hac-damper-select-area { position:absolute; inset:0 2px; }
  .hac-damper-select-area .hac-damper-fill { left:0; width:var(--position); max-width:100%; }
  .hac-damper-select-area .hac-damper-range { -webkit-appearance:none; appearance:none; inset:-6px 0; width:100%; height:calc(100% + 12px); }
  .hac-damper-select-area .hac-damper-range::-webkit-slider-thumb { -webkit-appearance:none; width:0; height:0; }
  .hac-damper-select-area .hac-damper-range::-moz-range-thumb { width:0; height:0; border:0; }
  .hac-damper-vmark { position:absolute; left:var(--tick); top:0; bottom:0; width:0; pointer-events:none; }
  .hac-damper-vmark::before, .hac-damper-vmark::after { content:''; position:absolute; left:-2px; width:3px; height:3px; border-right:1px solid rgba(165,165,165,.68); border-bottom:1px solid rgba(165,165,165,.68); filter:drop-shadow(0 1px 0 rgba(0,0,0,.85)); }
  .hac-damper-vmark::before { top:-6px; transform:rotate(45deg); }
  .hac-damper-vmark::after { bottom:-6px; transform:rotate(225deg); }
  .hac-damper-select-labels { position:absolute; inset:calc(100% + 5px) 0 auto; height:12px; font-size:10px; line-height:1.2; color:var(--ink-3); pointer-events:none; }
  .hac-damper-select-labels span { position:absolute; left:var(--tick); transform:translateX(-50%); white-space:nowrap; max-width:var(--label-width); overflow:hidden; text-overflow:ellipsis; text-align:center; }
  .hac-damper-select-spacer { height:17px; }
  .hac-damper-labels { display:flex; justify-content:space-between; gap:2px; padding-top:5px; font-size:10px; line-height:1.2; color:var(--ink-3); overflow:hidden; }
  .hac-damper-labels span { flex:1; min-width:0; overflow:hidden; text-align:center; text-overflow:ellipsis; white-space:nowrap; }
  .hac-damper-value { flex:none; max-width:32%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; }
  .hac-damper-error { color:var(--ink-2); font-size:11px; margin:0 0 8px; }
  .hac-extra {
    flex: 1; min-width: 80px;
    appearance: none; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    padding: 11px 12px;
    background: rgba(255,255,255,.025);
    border: 1px solid var(--line);
    border-radius: 11px;
    color: var(--ink-3);
    font: 500 11px/1 inherit;
    transition: background .2s, color .2s;
    position: relative;
  }
  .hac-extra svg { width: 14px; height: 14px; flex-shrink: 0; }
  .hac-extra-label { font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-4); display: block; }
  .hac-extra-val { font: 600 12px/1 inherit; color: var(--ink-2); display: block; margin-top: 2px; }
  .hac-extra:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .hac-extra[aria-expanded="true"] { border-color: var(--accent); color: var(--ink); }

  .hac-hum {
    flex: 1; min-width: 80px;
    display: flex; align-items: center; gap: 6px;
    padding: 8px 10px;
    background: rgba(255,255,255,.025);
    border: 1px solid var(--line);
    border-radius: 11px;
    color: var(--ink-3);
    font: 500 11px/1 inherit;
  }
  .hac-hum svg { width: 14px; height: 14px; flex-shrink: 0; }
  .hac-hum-mid { flex: 1; }
  .hac-hum-btn {
    appearance: none; border: 0; cursor: pointer;
    width: 24px; height: 24px; border-radius: 7px;
    display: grid; place-items: center;
    background: var(--surface-3); color: var(--ink-2);
    border: 1px solid var(--line-2);
    font-size: 14px; line-height: 1;
    transition: background .2s, color .2s;
    flex-shrink: 0;
  }
  .hac-hum-btn:hover {
    background: color-mix(in oklch, var(--accent) 14%, var(--surface-3));
    color: var(--accent);
    border-color: color-mix(in oklch, var(--accent) 35%, transparent);
  }
  .hac-hum-btn:active { transform: scale(.94); }

  .hac-unavailable { text-align: center; padding: 32px 16px; color: var(--ink-3); font: 500 13px/1.5 inherit; }
`;

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));

const _safeNum = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

// Convert the reported HA state into one visual range without inventing feedback.
function _damperModel(entityId, entity) {
  const domain = String(entityId || '').split('.')[0];
  if (!['cover', 'number', 'select', 'switch'].includes(domain)) return null;
  const state = entity?.state;
  const attrs = entity?.attributes || {};
  if (!entity || state == null || String(state).trim() === '' || ['unknown', 'unavailable'].includes(state)) return { domain, available: false };
  if (domain === 'cover') {
    const features = Number(attrs.supported_features) || 0;
    const raw = attrs.current_position;
    const position = raw === null || raw === undefined || raw === '' ? NaN : Number(raw);
    const validPosition = Number.isFinite(position) && position >= 0 && position <= 100;
    return { domain, available: true, position: validPosition ? position / 100 : null,
      value: validPosition ? position : null, canSetPosition: !!(features & 4),
      canOpen: !!(features & 1), canClose: !!(features & 2), state };
  }
  if (domain === 'number') {
    const min = Number(attrs.min), max = Number(attrs.max), step = Number(attrs.step), value = Number(state);
    if ([attrs.min, attrs.max, attrs.step, state].some(x => x === null || x === undefined || x === '') ||
        ![min, max, step, value].every(Number.isFinite) || max <= min || step <= 0 || value < min || value > max) {
      return { domain, available: false };
    }
    return { domain, available: true, min, max, step, value, unit: attrs.unit_of_measurement || '', position: (value - min) / (max - min) };
  }
  if (domain === 'select') {
    const options = Array.isArray(attrs.options) ? attrs.options.filter(x => typeof x === 'string') : [];
    const index = options.indexOf(state);
    if (!options.length || index < 0) return { domain, available: false };
    return { domain, available: true, options, value: state, index, position: options.length === 1 ? 0 : index / (options.length - 1) };
  }
  if (!['on', 'off'].includes(state)) return { domain, available: false };
  return { domain, available: true, value: state, position: state === 'on' ? 1 : 0 };
}

const _historyTimeMs = (row) => {
  const raw = row?.lu ?? row?.last_updated ?? row?.last_changed;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return null;
    return raw < 1e12 ? raw * 1000 : raw;
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

// Convert recorder state changes into time-weighted 30-minute samples. A
// one-minute sensor dip then occupies one minute of its bucket instead of the
// same horizontal width as a twelve-hour plateau.
const _resampleTempHistory = (rows, startMs, endMs, bucketCount = 48) => {
  if (!(endMs > startMs) || bucketCount < 2) return [];
  const events = (rows || [])
    .map((row) => ({
      t: _historyTimeMs(row),
      v: _safeNum(row?.s ?? row?.state),
    }))
    .filter((event) => Number.isFinite(event.t) && event.t <= endMs)
    .sort((a, b) => a.t - b.t);
  if (!events.length) return [];

  // The recorder can return multiple updates at the same timestamp. The last
  // one is authoritative and avoids zero-duration spikes.
  const compact = [];
  for (const event of events) {
    if (compact.length && compact[compact.length - 1].t === event.t) {
      compact[compact.length - 1] = event;
    } else {
      compact.push(event);
    }
  }

  const step = (endMs - startMs) / bucketCount;
  const points = [];
  let eventIndex = 0;
  let currentValue = null;

  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = startMs + i * step;
    const bucketEnd = i === bucketCount - 1 ? endMs : bucketStart + step;
    while (eventIndex < compact.length && compact[eventIndex].t <= bucketStart) {
      currentValue = compact[eventIndex].v;
      eventIndex++;
    }

    let cursor = bucketStart;
    let weightedValue = 0;
    let validDuration = 0;
    let nextIndex = eventIndex;
    let value = currentValue;

    while (nextIndex < compact.length && compact[nextIndex].t < bucketEnd) {
      const changeAt = Math.max(cursor, compact[nextIndex].t);
      if (Number.isFinite(value) && changeAt > cursor) {
        const duration = changeAt - cursor;
        weightedValue += value * duration;
        validDuration += duration;
      }
      cursor = changeAt;
      value = compact[nextIndex].v;
      nextIndex++;
    }
    if (Number.isFinite(value) && bucketEnd > cursor) {
      const duration = bucketEnd - cursor;
      weightedValue += value * duration;
      validDuration += duration;
    }

    eventIndex = nextIndex;
    currentValue = value;
    if (validDuration > 0) {
      points.push({ t: (bucketStart + bucketEnd) / 2, v: weightedValue / validDuration });
    }
  }

  // Pin the right edge to the latest real reading rather than the final
  // bucket average, so it agrees with the numeric current-temperature label.
  const latest = [...compact].reverse().find((event) => event.t <= endMs && Number.isFinite(event.v));
  if (latest) points.push({ t: endMs, v: latest.v });
  return points;
};

class NimbusClimateCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._activeIdx = 0;
    this._hass = null;
    this._holdTimer = null;
    this._holdInterval = null;
    this._history = {};
    this._historyPending = {};
    this._historyInterval = null;
    this.shadowRoot.addEventListener('click', (event) => {
      const tab = event.target?.closest?.('.hac-tab');
      if (!tab || !this.shadowRoot.contains(tab)) return;
      event.preventDefault();
      this._selectTab(Number.parseInt(tab.dataset.idx, 10));
    });
  }

  connectedCallback() {
    this._historyInterval = setInterval(() => {
      if (!this._config?.entities || !this._hass) return;
      this._config.entities.forEach(e => {
        if (e.entity) {
          delete this._history[e.entity];
          delete this._historyPending[e.entity];
          this._historyPending[e.entity] = true;
          this._fetchHistory(e.entity);
        }
      });
    }, 5 * 60 * 1000);
  }

  disconnectedCallback() {
    if (this._historyInterval) {
      clearInterval(this._historyInterval);
      this._historyInterval = null;
    }
    // A +/- button held when the card is removed (tab/dashboard switch)
    // would otherwise keep firing set_temperature forever on a detached card.
    this._stopHold();
    this._closeDropdown();
  }

  setConfig(config) {
    if (!config.entities || !config.entities.length) throw new Error('At least one entity required');
    const previousEntity = this._activeEntityId || this._config?.entities?.[this._activeIdx]?.entity;
    this._config = config;
    const preservedIdx = previousEntity
      ? this._config.entities.findIndex((entry) => entry.entity === previousEntity)
      : -1;
    this._activeIdx = preservedIdx >= 0
      ? preservedIdx
      : Math.min(this._activeIdx || 0, this._config.entities.length - 1);
    this._activeEntityId = this._config.entities[this._activeIdx]?.entity;
    const cachedRows = rowCache().get(this._rowKey());
    if (cachedRows) this._lastRows = cachedRows;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config?.entities?.length) return;
    this._ensureActiveIndex();
    // Only re-render if relevant state changed
    const fp = (() => {
      return this._config.entities.map((e, i) => {
        const s = hass.states[e.entity];
        if (!s) return e.entity + ':?';
        const a = s.attributes;
        return [i === this._activeIdx ? 'A' : 'I', s.state,
          a.current_temperature, a.temperature, a.hvac_action,
          a.fan_mode, a.swing_mode, a.swing_horizontal_mode, a.preset_mode, a.current_humidity,
          JSON.stringify([a.fan_modes, a.swing_modes, a.swing_horizontal_modes, a.preset_modes]),
          e.damper_entity ? JSON.stringify(hass.states[e.damper_entity] ?? null) : '',
          e.outdoor_sensor ? hass.states[e.outdoor_sensor]?.state : ''
        ].join(':');
      }).join('|');
    })();
    if (fp !== this._lastFP) {
      this._lastFP = fp;
      if (this._damperInteracting) this._damperRefreshPending = true;
      else this._render();
    }
    if (this._config.entities) {
      const e = this._config.entities[this._activeIdx]?.entity;
      if (e && !this._history[e] && !this._historyPending[e]) {
        this._historyPending[e] = true;
        this._fetchHistory(e);
      }
    }
  }

  _getTempUnit() {
    return this._hass?.config?.unit_system?.temperature || '°C';
  }

  _getDamperModel(entityId) {
    return _damperModel(entityId, this._hass?.states?.[entityId]);
  }

  _renderDamper(entityId) {
    if (!entityId) return '';
    const model = this._getDamperModel(entityId);
    if (!model) return '';
    const binaryCover = model.domain === 'cover' && !model.canSetPosition;
    const binary = binaryCover || model.domain === 'switch';
    const options = model.domain === 'select' ? model.options || [] : binary ? ['OFF', 'ON'] : [];
    const canControl = model.available && (model.domain !== 'cover' || model.canSetPosition || model.canOpen || model.canClose);
    const display = !model.available ? 'Unavailable' : model.domain === 'number' ? `${model.value}${model.unit ? ' ' + model.unit : ''}` :
      model.domain === 'select' ? model.value : model.domain === 'switch' ? model.value.toUpperCase() :
      model.value !== null ? `${model.value}%` : model.state;
    const pos = binaryCover && model.position === null ? (model.state === 'open' ? 1 : model.state === 'closed' ? 0 : null) : model.position ?? null;
    const shownPos = binary && pos !== null ? (pos >= .5 ? .75 : .25) : pos;
    const ticks = (model.domain === 'switch' ? [] : options).map((option, i) => {
      const fraction = binary ? (i + .5) / 2 : options.length > 1 ? i / (options.length - 1) : 0;
      return `<span class="${model.domain === 'select' ? 'hac-damper-vmark' : 'hac-damper-tick'}" style="--tick:${fraction * 100}%"></span>`;
    }).join('');
    const labels = options.map((option, i) => model.domain === 'select'
      ? `<span style="--tick:${options.length > 1 ? i / (options.length - 1) * 100 : 0}%;--label-width:${100 / Math.max(options.length, 1)}%">${escapeHtml(option)}</span>`
      : `<span>${escapeHtml(option)}</span>`).join('');
    const rangeStep = binary ? 1000 : model.domain === 'select' && options.length > 1 ? 1000 / (options.length - 1) : model.domain === 'number' ? Math.min(1000, 1000 * model.step / (model.max - model.min)) : 10;
    const icon = SVG('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM12 2v20M3 7l18 10M21 7 3 17');
    const switchStart = model.domain === 'switch' && model.available ? (model.value === 'on' ? '50%' : '2px') : '2px';
    const visibleValue = model.domain === 'switch' && model.available ? '' : display;
    const fill = `<div class="hac-damper-fill" style="--position:${(shownPos ?? 0) * 100}%;--switch-start:${switchStart};${model.domain === 'switch' && !model.available ? 'visibility:hidden;' : ''}"></div>`;
    const input = `<input class="hac-damper-range" type="range" min="0" max="1000" step="${rangeStep || 1}" value="${(pos ?? 0) * 1000}" aria-label="Damper" aria-valuetext="${escapeHtml(display)}" ${canControl && !this._damperBusy ? '' : 'disabled'}><span class="hac-damper-outline"></span>`;
    const track = model.domain === 'select'
      ? `<div class="hac-damper-track"><div class="hac-damper-select-area">${fill}${ticks}${input}<div class="hac-damper-select-labels">${labels}</div></div></div><div class="hac-damper-select-spacer"></div>`
      : `<div class="hac-damper-track">${fill}</div><div class="hac-damper-ticks">${ticks}</div>${input}${labels ? `<div class="hac-damper-labels">${labels}</div>` : ''}`;
    return `<div class="hac-damper" data-damper-domain="${model.domain}">
      <span class="hac-damper-icon">${icon}</span><span class="hac-damper-name">Damper<span class="hac-damper-kind">(${model.domain})</span></span>
      <div class="hac-damper-control">${track}</div><span class="hac-damper-value">${escapeHtml(visibleValue)}</span>
    </div>${this._damperError ? `<div class="hac-damper-error" role="alert">${escapeHtml(this._damperError)}</div>` : ''}`;
  }

  async _commitDamper(entityId, fraction) {
    if (this._damperBusy) return;
    const m = this._getDamperModel(entityId);
    if (!m?.available) return;
    fraction = Math.max(0, Math.min(1, fraction));
    let domain = m.domain, service, data = { entity_id: entityId };
    if (domain === 'cover') {
      if (m.canSetPosition) { service = 'set_cover_position'; data.position = Math.round(fraction * 100); if (m.value === data.position) return; }
      else { const open = fraction >= .5; if ((open && !m.canOpen) || (!open && !m.canClose)) return; service = open ? 'open_cover' : 'close_cover'; }
    } else if (domain === 'number') {
      service = 'set_value';
      const steps = Math.min(Math.floor((m.max - m.min) / m.step + 1e-9), Math.round(fraction * (m.max - m.min) / m.step));
      data.value = Number((m.min + steps * m.step).toPrecision(12));
      if (data.value === m.value) return;
    } else if (domain === 'select') {
      service = 'select_option'; data.option = m.options[Math.round(fraction * (m.options.length - 1))];
      if (data.option === m.value) return;
    } else {
      const on = fraction >= .5; service = on ? 'turn_on' : 'turn_off';
      if (m.value === (on ? 'on' : 'off')) return;
    }
    this._damperBusy = true; this._damperError = null;
    try { await this._hass.callService(domain, service, data); }
    catch (error) { this._damperError = `Damper control failed: ${error?.message || 'service error'}`; }
    finally { this._damperBusy = false; if (this.isConnected) this._render(); }
  }

  _ensureActiveIndex() {
    const entities = this._config?.entities || [];
    if (!entities.length) {
      this._activeIdx = 0;
      this._activeEntityId = undefined;
      return;
    }
    const entityIdx = this._activeEntityId
      ? entities.findIndex((entry) => entry.entity === this._activeEntityId)
      : -1;
    if (entityIdx >= 0) {
      this._activeIdx = entityIdx;
    } else if (this._activeIdx < 0 || this._activeIdx >= entities.length) {
      this._activeIdx = 0;
    }
    this._activeEntityId = entities[this._activeIdx]?.entity;
  }

  _selectTab(idx) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= (this._config?.entities || []).length) return;
    this._activeIdx = idx;
    this._activeEntityId = this._config.entities[idx]?.entity;
    const entityId = this._activeEntityId;
    if (entityId && !this._history[entityId] && !this._historyPending[entityId]) {
      this._historyPending[entityId] = true;
      this._fetchHistory(entityId);
    }
    this._render();
  }

  _getEntityData(idx) {
    const entry = this._config.entities[idx];
    if (!entry?.entity) return null;
    const s = this._hass?.states[entry.entity];
    if (!s) return null;
    const a = s.attributes;
    return {
      entity:       entry.entity,
      name:         entry.name || a.friendly_name || entry.entity,
      state:        s.state,
      currentTemp:  _safeNum(a.current_temperature),
      outdoorTemp:  entry.outdoor_sensor ? _safeNum(this._hass?.states[entry.outdoor_sensor]?.state) : null,
      targetTemp:   _safeNum(a.temperature),
      humidity:     _safeNum(a.current_humidity),
      hvacModes:    a.hvac_modes || ['off', 'heat'],
      hvacAction:   a.hvac_action,
      fanModes:     supports(a, CLIMATE_FEATURE.FAN_MODE) ? (a.fan_modes || null) : null,
      fanMode:      a.fan_mode || null,
      swingModes:   supports(a, CLIMATE_FEATURE.SWING_MODE) ? (a.swing_modes || null) : null,
      swingMode:    a.swing_mode || null,
      swingHModes:  supports(a, CLIMATE_FEATURE.SWING_HORIZONTAL_MODE) ? (a.swing_horizontal_modes || null) : null,
      swingHMode:   a.swing_horizontal_mode || null,
      presetModes:  supports(a, CLIMATE_FEATURE.PRESET_MODE) ? (a.preset_modes || null) : null,
      presetMode:   a.preset_mode || null,
      canSetTemp:   supports(a, CLIMATE_FEATURE.TARGET_TEMPERATURE),
      canSetRange:  supports(a, CLIMATE_FEATURE.TARGET_TEMPERATURE_RANGE),
      canSetHumidity: supports(a, CLIMATE_FEATURE.TARGET_HUMIDITY),
      canTurnOff:   supports(a, CLIMATE_FEATURE.TURN_OFF),
      canTurnOn:    supports(a, CLIMATE_FEATURE.TURN_ON),
      sensorRows:   (entry.sensors || []).map(se => {
        const ss = this._hass?.states[se.entity];
        if (!ss) return null;
        const dc = ss.attributes?.device_class || '';
        const unit = ss.attributes?.unit_of_measurement || '';
        const raw = parseFloat(ss.state);
        const val = isNaN(raw) ? ss.state : raw.toFixed(dc === 'carbon_dioxide' ? 0 : 1);
        return { icon: SENSOR_ICON[dc] || 'drop', value: val, unit };
      }).filter(Boolean),
      tempLow:      _safeNum(a.target_temp_low),
      tempHigh:     _safeNum(a.target_temp_high),
      tempStep:     a.target_temp_step ?? 0.5,
      targetHumidity: a.humidity ?? null,
      minTemp:      a.min_temp ?? 5,
      maxTemp:      a.max_temp ?? 40,
    };
  }

  _changeTemp(delta) {
    const data = this._getEntityData(this._activeIdx);
    if (!data) return;
    const step = data.tempStep || 0.5;
    const min  = data.minTemp ?? 5;
    const max  = data.maxTemp ?? 40;
    const roundToStep = (v) => min + Math.round((v - min) / step) * step;
    const clamp = (v) => Math.max(min, Math.min(max, roundToStep(v)));

    if (data.canSetRange && data.tempLow != null && data.tempHigh != null) {
      // Range mode — κινούμε και τα δύο bounds μαζί
      const newLow  = clamp(data.tempLow  + delta);
      const newHigh = clamp(data.tempHigh + delta);
      this._hass.callService('climate', 'set_temperature', {
        entity_id: data.entity,
        target_temp_low:  +newLow.toFixed(1),
        target_temp_high: +newHigh.toFixed(1),
      });
    } else if (data.canSetTemp && data.targetTemp != null) {
      const newTemp = clamp(data.targetTemp + delta);
      this._hass.callService('climate', 'set_temperature', {
        entity_id: data.entity,
        temperature: +newTemp.toFixed(1),
      });
    }
  }

  _setMode(mode) {
    const data = this._getEntityData(this._activeIdx);
    if (!data) return;
    this._hass.callService('climate', 'set_hvac_mode', { entity_id: data.entity, hvac_mode: mode });
  }

  _setFanMode(mode) {
    const data = this._getEntityData(this._activeIdx);
    if (!data) return;
    this._hass.callService('climate', 'set_fan_mode', { entity_id: data.entity, fan_mode: mode });
  }

  _setSwingMode(mode) {
    const data = this._getEntityData(this._activeIdx);
    if (!data) return;
    this._hass.callService('climate', 'set_swing_mode', { entity_id: data.entity, swing_mode: mode });
  }

  _setPresetMode(mode) {
    const data = this._getEntityData(this._activeIdx);
    if (!data) return;
    this._hass.callService('climate', 'set_preset_mode', { entity_id: data.entity, preset_mode: mode });
  }

  _closeDropdown(restoreFocus = false) {
    const open = this._dropdown;
    if (!open) return;
    this._dropdown = null;
    document.removeEventListener('pointerdown', open.outside, true);
    document.removeEventListener('scroll', open.reposition, true);
    window.removeEventListener('resize', open.reposition);
    open.menu.remove();
    open.button.setAttribute('aria-expanded', 'false');
    if (restoreFocus && open.button.isConnected) open.button.focus();
  }

  _toggleDropdown(button, choices, selected, service, entity, keyboard = false) {
    if (this._dropdown?.button === button) {
      if (keyboard) this._dropdown.focusOption();
      else this._closeDropdown(true);
      return;
    }
    this._closeDropdown();
    const menu = document.createElement('div');
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', button.getAttribute('aria-label'));
    // A body-level fixed popup is not clipped by dashboard/card containers.
    Object.assign(menu.style, {
      position: 'fixed', zIndex: '10000', overflowY: 'auto', overflowX: 'hidden',
      boxSizing: 'border-box', borderRadius: '11px', padding: '4px',
      boxShadow: '0 8px 24px rgba(0,0,0,.35)', overscrollBehavior: 'contain',
      font: getComputedStyle(button).font,
    });
    const theme = getComputedStyle(button);
    menu.style.background = theme.getPropertyValue('--surface-3').trim() || '#2a2c32';
    menu.style.color = theme.getPropertyValue('--ink').trim() || '#ecebe7';
    menu.style.border = `1px solid ${theme.getPropertyValue('--line-2').trim() || 'rgba(255,255,255,.1)'}`;
    const accent = theme.getPropertyValue('--accent').trim() || '#f6aa71';
    const options = choices.map((value, index) => {
      const option = document.createElement('button');
      option.type = 'button'; option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(value === selected));
      option.tabIndex = -1; option.textContent = value;
      Object.assign(option.style, { display: 'block', width: '100%', border: '0', borderRadius: '7px', padding: '8px', textAlign: 'left', whiteSpace: 'normal', overflowWrap: 'anywhere', cursor: 'pointer', font: 'inherit', color: value === selected ? accent : 'inherit', background: value === selected ? 'rgba(127,127,127,.16)' : 'transparent' });
      option.addEventListener('click', () => {
        this._closeDropdown(true);
        if (service === 'fan') this._setFanMode(value);
        else if (service === 'swing') this._setSwingMode(value);
        else if (service === 'swingh') this._hass.callService('climate', 'set_swing_horizontal_mode', { entity_id: entity, swing_horizontal_mode: value });
        else if (service === 'preset') this._setPresetMode(value);
      });
      menu.append(option);
      return option;
    });
    let active = Math.max(0, choices.indexOf(selected));
    const focusOption = () => { options[active]?.focus(); options[active]?.scrollIntoView?.({ block: 'nearest' }); };
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); this._closeDropdown(true); return; }
      if (event.key === 'Tab') { this._closeDropdown(true); return; }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); options[active]?.click(); return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        active = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (active + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        focusOption();
      }
    });
    const reposition = event => {
      if (event?.type === 'scroll' && menu.contains(event.target)) return;
      const rect = button.getBoundingClientRect();
      const gap = 4, margin = 4;
      const width = Math.max(0, Math.min(rect.width, window.innerWidth - margin * 2));
      const below = Math.max(0, window.innerHeight - rect.bottom - gap - margin);
      const above = Math.max(0, rect.top - gap - margin);
      const desired = Math.min(240, choices.length * 36 + 8);
      const upward = below < desired && above > below;
      const available = upward ? above : below;
      menu.style.width = `${width}px`;
      menu.style.left = `${Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin))}px`;
      menu.style.maxHeight = `${Math.min(desired, available)}px`;
      menu.style.top = upward ? `${Math.max(margin, rect.top - gap - Math.min(desired, available))}px` : `${rect.bottom + gap}px`;
    };
    const outside = event => { if (!event.composedPath().includes(button) && !event.composedPath().includes(menu)) this._closeDropdown(); };
    this._dropdown = { button, menu, outside, reposition, focusOption };
    button.setAttribute('aria-expanded', 'true');
    document.body.append(menu);
    reposition();
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    focusOption();
  }

  _setHumidity(delta) {
    const data = this._getEntityData(this._activeIdx);
    if (!data || data.targetHumidity == null) return;
    const newVal = Math.max(30, Math.min(80, Math.round(data.targetHumidity + delta)));
    this._hass.callService('climate', 'set_humidity', { entity_id: data.entity, humidity: newVal });
  }

  _startHold(delta) {
    this._changeTemp(delta);
    this._holdTimer = setTimeout(() => {
      this._holdInterval = setInterval(() => this._changeTemp(delta), 90);
    }, 380);
  }

  _stopHold() {
    clearTimeout(this._holdTimer);
    clearInterval(this._holdInterval);
    this._holdTimer = null;
    this._holdInterval = null;
  }

  _fetchHistory(entityId) {
    if (!this._hass) return;
    const now = new Date();
    const start = new Date(now - 24 * 3600 * 1000);
    const entry = this._config.entities.find(e => e.entity === entityId);
    const base = entityId.replace('climate.', '');
    const sensorId = entry?.temperature_sensor || `sensor.${base}_air_temperature`;
    this._hass.callWS({
      type: 'history/history_during_period',
      entity_ids: [sensorId],
      start_time: start.toISOString(),
      end_time: now.toISOString(),
      minimal_response: true,
      no_attributes: true,
    }).then(result => {
      const series = _resampleTempHistory(
        result?.[sensorId] || [],
        start.getTime(),
        now.getTime(),
      );
      if (series.length >= 2) { this._history[entityId] = series; this._render(); }
    }).catch(() => {});
  }

  _sparklineSVG(pts) {
    if (!pts || pts.length < 2) return '';
    const w = 120, h = 52, pad = 3;
    const points = pts.map((point, index) => typeof point === 'number'
      ? { t:index, v:point }
      : { t:Number(point?.t), v:Number(point?.v) })
      .filter((point) => Number.isFinite(point.t) && Number.isFinite(point.v));
    if (points.length < 2) return '';

    const rawMin = Math.min(...points.map((point) => point.v));
    const rawMax = Math.max(...points.map((point) => point.v));
    const minimumRange = this._getTempUnit().includes('F') ? 4 : 2;
    const dataRange = rawMax - rawMin;
    let min, max;
    if (dataRange < minimumRange) {
      const centre = (rawMin + rawMax) / 2;
      min = centre - minimumRange / 2;
      max = centre + minimumRange / 2;
    } else {
      const margin = dataRange * 0.08;
      min = rawMin - margin;
      max = rawMax + margin;
    }

    const range = max - min || minimumRange;
    const firstTime = points[0].t;
    const timeRange = points[points.length - 1].t - firstTime || 1;
    const x = (point) => pad + ((point.t - firstTime) / timeRange) * (w - pad * 2);
    const y = (value) => pad + (1 - (value - min) / range) * (h - pad * 2);

    // At this size 48 half-hour samples leave only ~2.5px between points.
    // A small five-point weighted average softens recorder steps visually,
    // while remaining local and bounded by the real readings.
    const weights = [1, 2, 3, 2, 1];
    const displayPoints = points.map((point, index) => {
      let weightedValue = 0;
      let totalWeight = 0;
      for (let offset = -2; offset <= 2; offset++) {
        const neighbour = points[index + offset];
        if (!neighbour) continue;
        const weight = weights[offset + 2];
        weightedValue += neighbour.v * weight;
        totalWeight += weight;
      }
      return { t:point.t, v:weightedValue / totalWeight };
    });

    const smooth = (series) => {
      let d = `M ${x(series[0]).toFixed(1)} ${y(series[0].v).toFixed(1)}`;
      for (let i = 1; i < series.length; i++) {
        const x0 = x(series[i-1]), y0 = y(series[i-1].v);
        const x1 = x(series[i]), y1 = y(series[i].v);
        const cpx = (x0 + x1) / 2;
        d += ` C ${cpx.toFixed(1)} ${y0.toFixed(1)}, ${cpx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      }
      return d;
    };
    const linePath = smooth(displayPoints);
    const areaPath = `${linePath} L ${x(displayPoints[displayPoints.length-1]).toFixed(1)} ${h} L ${x(displayPoints[0]).toFixed(1)} ${h} Z`;
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" style="margin-top:10px;opacity:.9;" preserveAspectRatio="none">
      <defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity=".3"/>
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${areaPath}" fill="url(#sg)"/>
      <path d="${linePath}" fill="none" stroke="var(--accent)" stroke-opacity=".9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  _modeIcon(modeKey) {
    const m = MODES[modeKey];
    if (!m) return '';
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${m.icon.split('M').filter(Boolean).map(p=>`<path d="M${p}"/>`).join('')}</svg>`;
  }

  _render() {
    if (!this._config.entities) return;
    const focusedControl = this._dropdown?.menu.contains(document.activeElement)
      ? this._dropdown.button.dataset.service : null;
    this._closeDropdown();
    this._ensureActiveIndex();

    const t = getT(this._hass);
    const data = this._getEntityData(this._activeIdx);
    const mode = data?.state || 'off';
    const m = MODES[mode] || MODES.off;

    const hasTarget = data?.targetTemp != null;
    const delta = (data && hasTarget) ? +((data.targetTemp - (data.currentTemp || 0)).toFixed(1)) : null;
    const reaching = delta !== null && ((mode === 'heat' && delta > 0) || (mode === 'cool' && delta < 0));

    const tabs = this._config.entities.map((e, i) => {
      const active = i === this._activeIdx ? 'is-active' : '';
      const name = e.name || this._hass?.states[e.entity]?.attributes?.friendly_name || e.entity;
      return `<button class="hac-tab ${active}" data-idx="${i}">${name}</button>`;
    }).join('');

    // HVAC mode buttons — Off πάντα τελευταίο, preferred order
    const MODE_ORDER = ['auto','cool','heat','heat_cool','dry','fan_only','off'];
    const rawModes = (data?.hvacModes || ['off','heat']).filter(mk => MODES[mk]);
    const validModes = [
      ...MODE_ORDER.filter(m => m !== 'off' && rawModes.includes(m)),
      ...rawModes.filter(m => !MODE_ORDER.includes(m) && m !== 'off'),
      ...(rawModes.includes('off') ? ['off'] : []),
    ];
    const n = validModes.length;
    const cols = n <= 3 ? n : n === 4 ? 4 : n <= 6 ? 3 : 4;
    const modeButtons = validModes.map(mk => {
      const mi = MODES[mk];
      const isActive = mk === mode;
      const isOff = mk === 'off';
      const active = isActive ? (isOff ? 'is-off-active' : 'is-active') : '';
      const accentStyle = (isActive && !isOff) ? `style="--m-accent:${mi.accent}"` : '';
      return `<button class="hac-mode ${active}" data-mode="${mk}" ${accentStyle}>
        ${this._modeIcon(mk)}<span>${t.modes[mk] || mi.label}</span>
      </button>`;
    }).join('');

    // Extra controls: fan, swing, preset
    const extras = [];
    if (data?.canSetHumidity && data?.targetHumidity != null) {
      extras.push(`<div class="hac-hum">
        ${ICONS.wave}
        <div class="hac-hum-mid">
          <span class="hac-extra-label">${t.ui.targetRH}</span>
          <span class="hac-extra-val">${data.targetHumidity}%</span>
        </div>
        <button class="hac-hum-btn" id="hum-down">−</button>
        <button class="hac-hum-btn" id="hum-up">+</button>
      </div>`);
    }
    const extraControl = (service, label, icon, value) => `<button type="button" class="hac-extra" data-service="${service}" aria-haspopup="listbox" aria-expanded="false" aria-label="${label}">
      ${icon}<span><span class="hac-extra-label">${label}</span><span class="hac-extra-val">${escapeHtml(value || '--')}</span></span>
    </button>`;
    if (data?.fanModes?.length) extras.push(extraControl('fan', t.ui.speed, ICONS.fan, data.fanMode));
    if (data?.swingModes?.length) extras.push(extraControl('swing', t.ui.swingV, ICONS.swing, data.swingMode));
    if (data?.swingHModes?.length) extras.push(extraControl('swingh', t.ui.swingH, ICONS.swing, data.swingHMode));
    if (data?.presetModes?.length) extras.push(extraControl('preset', t.ui.preset, ICONS.preset, data.presetMode));

    const body = data ? `
      <div class="hac-body">
        <div class="hac-readings">
          <div class="hac-reading">
            <div class="hac-rval">
              <span class="hac-ricon">${ICONS.thermometer}</span>
              <span class="hac-num">${data.currentTemp?.toFixed(1) ?? '--'}</span>
              <span class="hac-unit">${this._getTempUnit()}</span>
            </div>
            ${data.humidity != null ? `
            <div class="hac-rval hac-rval-secondary">
              <span class="hac-ricon">${ICONS.drop}</span>
              <span class="hac-num hac-num-sm">${data.humidity}</span>
              <span class="hac-unit">%</span>
            </div>` : ''}
          </div>
          ${data.outdoorTemp != null ? `
          <div class="hac-divider-h"></div>
          <div class="hac-reading">
            <div class="hac-rval">
              <span class="hac-ricon">${ICONS.outdoor}</span>
              <span class="hac-num">${parseFloat(data.outdoorTemp).toFixed(1)}</span>
              <span class="hac-unit">${this._getTempUnit()}</span>
            </div>
          </div>` : ''}
          ${(data.sensorRows || []).length ? `
          <div class="hac-divider-h"></div>
          ${(data.sensorRows).map(row => `
          <div class="hac-rval hac-rval-secondary">
            <span class="hac-ricon">${ICONS[row.icon] || ICONS.drop}</span>
            <span class="hac-num hac-num-sm">${row.value}</span>
            <span class="hac-unit">${row.unit}</span>
          </div>`).join('')}` : ''}
          ${this._sparklineSVG(this._history[data.entity])}
        </div>

        <div class="hac-divider-v"></div>

        <div class="hac-target">
          <button class="hac-step" id="btn-up" ${(!data.canSetTemp && !data.canSetRange) ? 'disabled style="opacity:.3;cursor:default"' : ''}>${ICONS.up}</button>
          <div class="hac-tval">
            ${(!data.canSetTemp && !data.canSetRange) ? `
              <div class="hac-tnum" style="color:var(--ink-4);">--</div>
              <div class="hac-tlabel">${t.ui.noTarget}</div>
            ` : data.canSetRange && data.tempLow != null && data.tempHigh != null ? `
              <div style="font:600 13px/1 inherit;color:var(--ink-3);margin-bottom:2px;">
                <span style="color:oklch(0.78 0.16 45)">${data.tempLow.toFixed(1)}</span>
                <span style="color:var(--ink-4);padding:0 4px;">–</span>
                <span style="color:oklch(0.78 0.13 235)">${data.tempHigh?.toFixed(1)}${this._getTempUnit()}</span>
              </div>
              <div class="hac-tlabel">${t.ui.range}</div>
            ` : `
              <div class="hac-tnum">
                ${data.targetTemp?.toFixed(1) ?? '--'}
                <span class="hac-tunit">${this._getTempUnit()}</span>
              </div>
              <div class="hac-tlabel">${t.ui.target}</div>
              ${delta !== null
                ? (delta !== 0
                  ? `<div class="hac-delta ${delta>0?'up':'down'}">${delta>0?'+':''}${delta.toFixed(1)}${this._getTempUnit()}</div>`
                  : `<div class="hac-delta neutral">${t.ui.atTarget}</div>`)
                : ''}
            `}
          </div>
          <button class="hac-step" id="btn-down" ${(!data.canSetTemp && !data.canSetRange) ? 'disabled style="opacity:.3;cursor:default"' : ''}>${ICONS.down}</button>
        </div>
      </div>
      <div class="hac-modes" style="grid-template-columns:repeat(${cols},1fr)">${modeButtons}</div>
      ${this._renderDamper(this._config.entities[this._activeIdx]?.damper_entity)}
      ${extras.length ? `<div class="hac-extras">${extras.join('')}</div>` : ''}
    ` : `<div class="hac-unavailable">${t.ui.unavailable}</div>`;

    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="hac" data-mode="${mode}" style="--accent:${m.accent};--glow:${m.glow};">
        <div class="hac-ambient"></div>
        ${this._config.entities.length > 1 ? `<div class="hac-tabs">${tabs}</div>` : ''}
        <div class="hac-card">
          ${data ? `
          <div class="hac-hd">
            <div class="hac-id">
              <div class="hac-avatar">${this._modeIcon(mode)}</div>
              <div>
                <div class="hac-name">${data.name}</div>
                <div class="hac-sub">
                  <span class="hac-dot"></span>
                  ${mode === 'off' ? t.actions.off : (() => {
                    const actionLabel = t.actions[data.hvacAction] || HVAC_ACTION_STATUS[data.hvacAction] || '';
                    const showTarget = data.hvacAction === 'heating' || data.hvacAction === 'cooling';
                    return showTarget ? `${actionLabel} · ${reaching ? t.ui.reachingTarget : t.ui.atTarget}` : actionLabel;
                  })()}
                </div>
              </div>
            </div>
            <div class="hac-pill"><span class="hac-pill-dot"></span>${mode==='off' ? t.actions.off.toUpperCase() : (t.actions[data.hvacAction] || HVAC_ACTION_STATUS[data.hvacAction] || '').toUpperCase()}</div>
          </div>` : ''}
          ${body}
        </div>
      </div>`;

    if (focusedControl) this.shadowRoot.querySelector(`button.hac-extra[data-service="${focusedControl}"]`)?.focus();

    // Events
    const damperInput = this.shadowRoot.querySelector('.hac-damper-range');
    if (damperInput) {
      const entityId = this._config.entities[this._activeIdx]?.damper_entity;
      damperInput.addEventListener('pointerdown', event => { this._damperInteracting = true; damperInput.setPointerCapture?.(event.pointerId); });
      const finish = () => {
        this._damperInteracting = false;
        if (this._damperRefreshPending) { this._damperRefreshPending = false; this._render(); }
      };
      damperInput.addEventListener('pointercancel', finish);
      damperInput.addEventListener('lostpointercapture', finish);
      damperInput.addEventListener('pointerup', () => { queueMicrotask(finish); });
      damperInput.addEventListener('input', () => {
        const model = this._getDamperModel(entityId);
        const fraction = Number(damperInput.value) / 1000;
        const shown = model?.domain === 'switch' || (model?.domain === 'cover' && !model.canSetPosition) ? (fraction >= .5 ? .75 : .25) : model?.domain === 'select' && model.options?.length > 1 ? Math.round(fraction * (model.options.length - 1)) / (model.options.length - 1) : fraction;
        const container = damperInput.closest('.hac-damper');
        container.querySelector('.hac-damper-fill')?.style.setProperty('--position', `${shown * 100}%`);
        if (model?.domain === 'switch') container.querySelector('.hac-damper-fill')?.style.setProperty('--switch-start', fraction >= .5 ? '50%' : '2px');
      });
      damperInput.addEventListener('change', () => { this._commitDamper(entityId, Number(damperInput.value) / 1000); });
    }
    this.shadowRoot.querySelectorAll('.hac-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this._selectTab(Number.parseInt(btn.dataset.idx, 10));
      });
    });

    this.shadowRoot.querySelectorAll('.hac-mode').forEach(btn => {
      btn.addEventListener('click', () => this._setMode(btn.dataset.mode));
    });

    this.shadowRoot.querySelectorAll('button.hac-extra').forEach(button => {
      const service = button.dataset.service;
      const choices = { fan: data.fanModes, swing: data.swingModes, swingh: data.swingHModes, preset: data.presetModes }[service];
      const selected = { fan: data.fanMode, swing: data.swingMode, swingh: data.swingHMode, preset: data.presetMode }[service];
      button.addEventListener('click', () => this._toggleDropdown(button, choices, selected, service, data.entity));
      button.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          this._toggleDropdown(button, choices, selected, service, data.entity, true);
        }
      });
    });

    const btnUp = this.shadowRoot.getElementById('btn-up');
    const btnDown = this.shadowRoot.getElementById('btn-down');
    const step = data?.tempStep || 0.5;
    if (btnUp) {
      btnUp.addEventListener('mousedown',  () => this._startHold(step));
      btnUp.addEventListener('touchstart', () => this._startHold(step), { passive: true });
      btnUp.addEventListener('mouseup',    () => this._stopHold());
      btnUp.addEventListener('mouseleave', () => this._stopHold());
      btnUp.addEventListener('touchend',   () => this._stopHold());
      btnUp.addEventListener('touchcancel',() => this._stopHold());
    }
    if (btnDown) {
      btnDown.addEventListener('mousedown',  () => this._startHold(-step));
      btnDown.addEventListener('touchstart', () => this._startHold(-step), { passive: true });
      btnDown.addEventListener('mouseup',    () => this._stopHold());
      btnDown.addEventListener('mouseleave', () => this._stopHold());
      btnDown.addEventListener('touchend',   () => this._stopHold());
      btnDown.addEventListener('touchcancel',() => this._stopHold());
    }
    const humUp   = this.shadowRoot.getElementById('hum-up');
    const humDown = this.shadowRoot.getElementById('hum-down');
    if (humUp)   humUp.addEventListener('click',   () => this._setHumidity(+1));
    if (humDown) humDown.addEventListener('click', () => this._setHumidity(-1));

    this._measureRows(8);
  }

  getCardSize() { return this._lastRows || 8; }
  getGridOptions() {
    return { columns: 12, rows: 'auto', min_columns: 6 };
  }

  _rowKey() {
    return `${CARD_VERSION}:${(this._config?.entities || []).map((entity) => entity.entity || entity.name || '').filter(Boolean).join('|') || 'nimbus-climate-card'}`;
  }

  _notifyRowChange(rows) {
    const cache = rowCache();
    const key = this._rowKey();
    const cachedRows = cache.get(key);
    this._lastRows = rows;
    if (cachedRows === rows) return;
    cache.set(key, rows);
    // Sections auto-height handles the actual layout; rebuilding while scrolling can reset mobile scroll position.
  }

  _measureRows(fallbackRows = 8) {
    const measure = () => {
      const card = this.shadowRoot?.querySelector('.hac');
      const rect = card?.getBoundingClientRect?.();
      const children = card ? [...card.children].filter((child) => child.getBoundingClientRect?.().height > 0) : [];
      const last = children[children.length - 1];
      const contentHeight = rect && last ? last.getBoundingClientRect().bottom - rect.top : 0;
      const height = contentHeight || rect?.height || 0;
      if (!height) return;
      const measuredRows = Math.min(
        24,
        Math.max(Math.max(6, fallbackRows - 1), Math.ceil((height + NIMBUS_GRID_ROW_PADDING) / (NIMBUS_GRID_ROW_HEIGHT + NIMBUS_GRID_ROW_GAP)))
      );
      this._notifyRowChange(measuredRows <= 8 ? 8 : measuredRows);
    };
    if (window.requestAnimationFrame) window.requestAnimationFrame(measure);
    else window.setTimeout(measure, 0);
    window.setTimeout(measure, 220);
  }

  static getConfigElement() { return document.createElement('nimbus-climate-card-editor'); }
  static getStubConfig() {
    return { entities: [{ entity: 'climate.bedroom_thermostat', name: 'Bedroom' }] };
  }
}

// ── Visual Editor ─────────────────────────────────────────────────────────
class NimbusClimateCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._dirty = false;
    this._refreshPending = false;
    this.shadowRoot.addEventListener('focusout', () => {
      queueMicrotask(() => {
        if (this._refreshPending && !this._dirty && !this._editingControl()) {
          this._refreshPending = false;
          this._render();
        }
      });
    });
  }

  setConfig(config) {
    const incoming = JSON.parse(JSON.stringify(config));
    const active = this.shadowRoot.activeElement;
    if (!this._dirty && active?.tagName === 'SELECT' && active.dataset.idx !== undefined) {
      const previous = this._config.entities?.[Number.parseInt(active.dataset.idx, 10)];
      const match = incoming.entities?.findIndex(entry => entry.entity === previous?.entity) ?? -1;
      if (match >= 0) active.dataset.idx = String(match);
      else if (previous && Array.isArray(incoming.entities)) {
        const target = Math.min(Number.parseInt(active.dataset.idx, 10), incoming.entities.length);
        incoming.entities.splice(target, 0, previous);
        active.dataset.idx = String(target);
      }
    }
    if (this._dirty) {
      const input = this.shadowRoot.activeElement;
      const idx = Number.parseInt(input?.dataset?.idx, 10);
      const field = input?.dataset?.field;
      const edited = this._config.entities?.[idx];
      if (edited && field && Array.isArray(incoming.entities)) {
        const match = incoming.entities.findIndex(entry => entry.entity === edited.entity);
        if (match < 0) {
          const target = Math.min(idx, incoming.entities.length);
          incoming.entities.splice(target, 0, edited);
          input.dataset.idx = String(target);
        } else {
          incoming.entities[match][field] = edited[field];
          input.dataset.idx = String(match);
        }
      } else {
        // Keep the local edit when an incoming configuration cannot be reconciled.
        this._refreshPending = true;
        return;
      }
    }
    this._config = incoming;
    this._refreshEditor();
  }

  set hass(hass) {
    this._hass = hass;
    this._refreshEditor();
  }

  _editingControl() {
    return ['INPUT', 'SELECT', 'TEXTAREA'].includes(this.shadowRoot.activeElement?.tagName);
  }

  _refreshEditor() {
    if (this._dirty || this._editingControl()) {
      this._refreshPending = true;
      return;
    }
    this._refreshPending = false;
    this._render();
  }

  _dispatch() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }, bubbles: true, composed: true,
    }));
  }

  _getArea(entityId) {
    // Βρίσκω area από device registry μέσω hass
    const entity = this._hass?.entities?.[entityId];
    if (!entity?.area_id) {
      // Fallback: ψάχνω device
      const device = entity?.device_id ? this._hass?.devices?.[entity.device_id] : null;
      const areaId = device?.area_id;
      if (areaId) return this._hass?.areas?.[areaId]?.name || '';
    }
    return this._hass?.areas?.[entity?.area_id]?.name || '';
  }

  _render() {
    const entities = this._config.entities || [];

    const climateEntities = this._hass
      ? Object.keys(this._hass.states).filter(e => e.startsWith('climate.')).sort()
      : [];
    const tempSensors = this._hass
      ? Object.keys(this._hass.states).filter(e =>
          e.startsWith('sensor.') && this._hass.states[e].attributes?.device_class === 'temperature'
        ).sort()
      : [];
    const damperEntities = Object.keys(this._hass?.states || {}).filter(id => /^(cover|number|select|switch)\./.test(id)).sort();

    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; }
        .ed { font-family: -apple-system, system-ui, sans-serif; }
        select, input {
          width: 100%; padding: 8px 10px; border-radius: 8px;
          border: 1px solid #2a2c32; background: #131418;
          color: #ecebe7; font-size: 13px; font-family: inherit; outline: none;
        }
        input:focus { border-color: oklch(0.78 0.16 45 / 0.5); }
        .entry {
          background: #1b1d22; border: 1px solid #2a2c32;
          border-radius: 14px; margin-bottom: 10px; overflow: hidden;
        }
        .entry-head {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-bottom: 1px solid #2a2c32;
          background: #131418;
        }
        .entry-title { font-size: 13px; font-weight: 600; color: #ecebe7; flex: 1; }
        .entry-sub { font-size: 11px; color: #5e5d59; }
        .rm-btn {
          width: 28px; height: 28px; border-radius: 7px;
          border: 1px solid #2a2c32; background: transparent;
          color: #5e5d59; cursor: pointer; font-size: 13px;
          display: grid; place-items: center; flex-shrink: 0;
          transition: color .2s, border-color .2s;
        }
        .rm-btn:hover { color: #ecebe7; border-color: #555; }
        .entry-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field-label { font-size: 10px; color: #5e5d59; text-transform: uppercase; letter-spacing: .06em; }
        .add-btn {
          width: 100%; padding: 11px; border-radius: 12px;
          border: 1px dashed #2a2c32; background: transparent;
          color: #5e5d59; cursor: pointer; font-size: 13px;
          transition: color .2s, border-color .2s;
        }
        .add-btn:hover { color: #ecebe7; border-color: #555; }
      </style>
      <div class="ed">
        ${entities.map((e, i) => {
          const area = this._getArea(e.entity);
          const displayName = e.name || area || e.entity.replace('climate.','');
          return `<div class="entry">
            <div class="entry-head">
              <div>
                <div class="entry-title">${displayName}</div>
                <div class="entry-sub">${e.entity}</div>
              </div>
              <button class="rm-btn" data-remove="${i}">✕</button>
            </div>
            <div class="entry-body">
              <div class="field">
                <span class="field-label">Entity</span>
                <select data-idx="${i}" data-field="entity">
                  ${climateEntities.map(ce => `<option value="${ce}" ${ce===e.entity?'selected':''}>${ce}</option>`).join('')}
                </select>
              </div>
              <div class="field">
                <span class="field-label">Damper entity (optional)</span>
                <select data-idx="${i}" data-field="damper_entity">
                  <option value="">— None —</option>
                  ${e.damper_entity && !damperEntities.includes(e.damper_entity) ? `<option value="${escapeHtml(e.damper_entity)}" selected>${escapeHtml(e.damper_entity)}</option>` : ''}
                  ${damperEntities.map(id => `<option value="${escapeHtml(id)}" ${id === e.damper_entity ? 'selected' : ''}>${escapeHtml(id)}</option>`).join('')}
                </select>
              </div>
              <div class="field">
                <span class="field-label">Display name${area?` · area: ${area}`:''}</span>
                <input type="text" data-idx="${i}" data-field="name" value="${e.name||''}" placeholder="${area||'e.g. Living Room'}">
              </div>
              <div class="field">
                <span class="field-label">Temperature sensor (for graph)</span>
                <select data-idx="${i}" data-field="temperature_sensor">
                  <option value="">Auto · sensor.${e.entity.replace('climate.','')}_air_temperature</option>
                  ${tempSensors.map(s=>`<option value="${s}" ${s===(e.temperature_sensor||'')?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="field">
                <span class="field-label">Outdoor temperature sensor</span>
                <select data-idx="${i}" data-field="outdoor_sensor">
                  <option value="">None</option>
                  ${tempSensors.map(s=>`<option value="${s}" ${s===(e.outdoor_sensor||'')?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="field">
                <span class="field-label">Extra sensors (CO₂, power, PM2.5…)</span>
                ${(e.sensors||[]).map((se,si)=>`
                <div style="display:flex;gap:6px;margin-bottom:6px;">
                  <select data-idx="${i}" data-sensor-idx="${si}" data-sensor-field="entity" style="flex:1;">
                    <option value="">— select sensor —</option>
                    ${Object.keys(this._hass?.states||{}).filter(id=>id.startsWith('sensor.')).sort().map(s=>`<option value="${s}" ${s===se.entity?'selected':''}>${s}</option>`).join('')}
                  </select>
                  <button class="rm-btn" data-idx="${i}" data-remove-sensor="${si}">✕</button>
                </div>`).join('')}
                <button class="add-sensor-btn add-btn" data-idx="${i}" style="margin-top:2px;">+ Add sensor</button>
              </div>
            </div>
          </div>`;
        }).join('')}
        <button class="add-btn" id="add-btn">${getT(this._hass).ui.addThermostat}</button>
      </div>`;

    // Events — χωρίς re-render σε input για να μην κλείνει το πεδίο
    this.shadowRoot.querySelectorAll('select[data-field]').forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = parseInt(sel.dataset.idx);
        this._config.entities[idx][sel.dataset.field] = sel.value;
        this._dispatch();
      });
    });

    // Sensor selects
    this.shadowRoot.querySelectorAll('select[data-sensor-field]').forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = parseInt(sel.dataset.idx);
        const si  = parseInt(sel.dataset.sensorIdx);
        if (!this._config.entities[idx].sensors) this._config.entities[idx].sensors = [];
        this._config.entities[idx].sensors[si] = { entity: sel.value };
        this._dispatch();
        this._render();
      });
    });

    // Add sensor button
    this.shadowRoot.querySelectorAll('.add-sensor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (!this._config.entities[idx].sensors) this._config.entities[idx].sensors = [];
        this._config.entities[idx].sensors.push({ entity: '' });
        this._dirty = true;
        this._render();
        this._dirty = false;
      });
    });

    // Remove sensor button
    this.shadowRoot.querySelectorAll('[data-remove-sensor]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const si  = parseInt(btn.dataset.removeSensor);
        this._config.entities[idx].sensors.splice(si, 1);
        this._dispatch();
        this._render();
      });
    });

    this.shadowRoot.querySelectorAll('input[type="text"]').forEach(inp => {
      inp.addEventListener('input', () => {
        this._dirty = true;
        const idx = parseInt(inp.dataset.idx);
        this._config.entities[idx][inp.dataset.field] = inp.value;
        this._dispatch();
      });
      inp.addEventListener('blur', () => {
        this._dirty = false;
      });
    });

    this.shadowRoot.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._config.entities.splice(parseInt(btn.dataset.remove), 1);
        this._dirty = false;
        this._dispatch();
        this._render();
      });
    });

    this.shadowRoot.getElementById('add-btn').addEventListener('click', () => {
      this._config.entities = this._config.entities || [];
      const firstClimate = climateEntities[0] || 'climate.thermostat';
      const area = this._getArea(firstClimate);
      this._config.entities.push({ entity: firstClimate, name: area || '' });
      this._dirty = false;
      this._dispatch();
      this._render();
    });
  }
}

customElements.define('nimbus-climate-card', NimbusClimateCard);
customElements.define('nimbus-climate-card-editor', NimbusClimateCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'nimbus-climate-card',
  name: 'Nimbus Climate Card',
  description: 'Apple-inspired climate card for Home Assistant',
  preview: true,
});
