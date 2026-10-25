// Settings + conditional theming — pure (no DOM). Resolves the visual style
// overrides for a node from an ordered list of rules. Later matching rules win.
//
// A rule:
//   { enabled?: true, field: 'level', value: 'division',
//     style: { bg?: '#e0524d', text?: '#ffffff', border?: '#991b1b' } }
//
// field is matched against, in order of preference:
//   'type' | 'status' | 'id'                -> node[field]
//   'level' / 'unit' / any other key        -> node.data[field]
//   'data.<key>'                            -> node.data[key]

export const DEFAULT_SETTINGS = {
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  orientation: 'TopToBottom',
  subtreeMode: 'AutoSmart',
  showToolbar: true,
  showGrid: false,
  snapGrid: false,
  alignGrid: false,
  themeRules: [],   // [{ enabled, field, value, style:{bg,text,border} }]
};

export function normalizeSettings(partial = {}) {
  const s = Object.assign({}, DEFAULT_SETTINGS, partial);
  s.themeRules = Array.isArray(partial.themeRules)
    ? partial.themeRules.map(normalizeRule)
    : [];
  return s;
}

// Colours end up in CSS custom properties, inline legend styles and the
// settings drawer, so only plain colour literals are accepted: #rgb, #rgba,
// #rrggbb, #rrggbbaa and rgb()/rgba()/hsl()/hsla() with numeric arguments.
const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NUM = '[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:%|deg)?';
const FUNC_COLOR = new RegExp(`^(?:rgba?|hsla?)\\(\\s*${NUM}(?:\\s*[,\\s/]\\s*${NUM}){2,3}\\s*\\)$`, 'i');

export function isSafeColor(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  return HEX_COLOR.test(v) || FUNC_COLOR.test(v);
}

/* style keys whose colour value normalizeRule will drop */
export function invalidRuleColors(r = {}) {
  const style = (r && r.style) || {};
  return ['bg', 'text', 'border'].filter((k) => style[k] != null && style[k] !== '' && !isSafeColor(style[k]));
}

export function normalizeRule(r = {}) {
  const style = (r && r.style) || {};
  const color = (v) => (isSafeColor(v) ? v.trim() : '');
  return {
    enabled: r.enabled !== false,
    field: r.field ? String(r.field) : 'type',
    value: r.value != null ? String(r.value) : '',
    style: {
      bg: color(style.bg),
      text: color(style.text),
      border: color(style.border),
    },
  };
}

function fieldValue(node, field) {
  if (!field) return undefined;
  if (field.indexOf('data.') === 0) return node.data ? node.data[field.slice(5)] : undefined;
  if (field === 'type' || field === 'status' || field === 'id' || field === 'label' || field === 'personName') {
    return node[field];
  }
  return node.data ? node.data[field] : undefined;
}

/* resolve the effective {bg, text, border} for a node from the rules.
   Returns null when no rule matches (use the default card styling). */
export function resolveNodeStyle(node, rules) {
  if (!rules || !rules.length) return null;
  let out = null;
  for (const r of rules) {
    if (r.enabled === false) continue;
    const v = fieldValue(node, r.field);
    if (v == null) continue;
    if (String(v).toLowerCase() !== String(r.value).toLowerCase()) continue;
    out = out || {};
    if (r.style.bg) out.bg = r.style.bg;
    if (r.style.text) out.text = r.style.text;
    if (r.style.border) out.border = r.style.border;
  }
  return out;
}
