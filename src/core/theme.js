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
  subtreeMode: 'Balanced',
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

export function normalizeRule(r = {}) {
  return {
    enabled: r.enabled !== false,
    field: r.field || 'type',
    value: r.value != null ? String(r.value) : '',
    style: {
      bg: (r.style && r.style.bg) || '',
      text: (r.style && r.style.text) || '',
      border: (r.style && r.style.border) || '',
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
