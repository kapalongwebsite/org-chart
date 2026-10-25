// Data normalization & multi-format import — pure (no DOM, no sample data).
import { DEPT_SIZE, POS_SIZE, SUBTREE_MODES } from './constants.js';

// Per-node subtree overrides the layout engine understands ('Auto' is the
// legacy alias of AutoSmart).
const LAYOUT_MODES = new Set([...SUBTREE_MODES, 'Auto']);
// A node type becomes a CSS class token (`loc-<type>`), so only plain word
// characters are kept; anything else renders as a position card.
const TYPE_TOKEN = /^[A-Za-z][\w-]*$/;

function positiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}
function textField(value) {
  return value == null ? '' : String(value);
}
/* '' marks a root. 0 is a real id, so only null/undefined/false/'' mean "no parent". */
export function normalizeParentId(value) {
  return value === undefined || value === null || value === false ? '' : value;
}
/* `collapsed` is a strict flag: the string "false" (or any other truthy junk)
   must not collapse a branch. */
export function isCollapsedFlag(value) {
  return value === true || value === 'true';
}

/* normalize a loose node record into a full internal node (idempotent) */
export function makeNode(src) {
  const type = src.type == null ? 'position' : (TYPE_TOKEN.test(String(src.type)) ? String(src.type) : 'position');
  const defaultSize = type === 'department' ? DEPT_SIZE : POS_SIZE;
  return {
    id: src.id,
    parentId: normalizeParentId(src.parentId),
    type,
    label: textField(src.label),
    personName: textField(src.personName),
    status: textField(src.status),
    width: positiveNumber(src.width) || defaultSize.width,
    height: positiveNumber(src.height) || defaultSize.height,
    collapsed: isCollapsedFlag(src.collapsed),
    layoutMode: LAYOUT_MODES.has(src.layoutMode) ? src.layoutMode : null,   // per-node subtree override
    data: src.data && typeof src.data === 'object' && !Array.isArray(src.data) ? src.data : {},
  };
}

/* Fields of a loose node record that makeNode cannot honour. Returned as
   human-readable entries so the renderer can report them once. */
export function nodeInputProblems(src) {
  const out = [];
  if (!src || typeof src !== 'object') return ['not an object'];
  if (src.width != null && !positiveNumber(src.width)) out.push(`width ${JSON.stringify(src.width)}`);
  if (src.height != null && !positiveNumber(src.height)) out.push(`height ${JSON.stringify(src.height)}`);
  if (src.collapsed != null && typeof src.collapsed !== 'boolean' && src.collapsed !== 'true' && src.collapsed !== 'false') {
    out.push(`collapsed ${JSON.stringify(src.collapsed)}`);
  }
  if (src.layoutMode != null && src.layoutMode !== '' && !LAYOUT_MODES.has(src.layoutMode)) out.push(`layoutMode ${JSON.stringify(src.layoutMode)}`);
  if (src.type != null && !TYPE_TOKEN.test(String(src.type))) out.push(`type ${JSON.stringify(src.type)}`);
  if (src.data != null && (typeof src.data !== 'object' || Array.isArray(src.data))) out.push('data');
  return out;
}

export function personNameFromPos(p) {
  const nm = [p.firstname, p.lastname].filter(Boolean).join(' ').trim();
  if (p.status === 'VACANT') return '— VACANT —';
  if (p.status === 'UNFUNDED') return nm || '— UNFUNDED —';
  return nm || '—';
}

/* nested org tree { org_id, name, positions[], children[] } -> flat nodes */
export function convertNestedTree(roots) {
  const out = [];
  function walk(org, parentId) {
    const orgId = 'org-' + (org.org_id != null ? org.org_id : org.id);
    out.push({ id: orgId, parentId, type: 'department', label: org.name || org.label || 'UNIT',
               data: { level: org.level } });
    const positions = (org.positions || []).slice().sort((a, b) => (a.org_order || 0) - (b.org_order || 0));
    for (const p of positions) {
      out.push({ id: 'pos-' + p.id, parentId: orgId, type: 'position',
                 label: p.position_title || 'POSITION', personName: personNameFromPos(p),
                 status: p.status || '',
                 data: { photo_url: p.photo_url || p.photo || null } });
    }
    const kids = (org.children || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    for (const c of kids) walk(c, orgId);
  }
  for (const r of roots) walk(r, '');
  return out;
}

/* recursive API tree { type, name, position, photo_url, meta, children } -> flat */
export function convertMoTree(roots) {
  const out = [];
  let seq = 0;
  function walk(n, parentId) {
    const myId = 'mo-' + (seq++);
    if (n.type === 'organization') {
      out.push({ id: myId, parentId, type: 'department', label: n.name || 'UNIT',
                 data: { is_head: Boolean(n.is_head), level: n.meta && n.meta.level, srcId: n.id } });
    } else {
      const vacant = n.type === 'vacant';
      out.push({ id: myId, parentId, type: 'position', label: n.position || 'POSITION',
                 personName: vacant ? '— VACANT —' : (n.name || '—'),
                 status: vacant ? 'VACANT' : 'FILLED',
                 data: { is_head: Boolean(n.is_head), photo_url: n.photo_url || null, srcId: n.id } });
    }
    const kids = (n.children || []).slice()
      .sort((a, b) => ((a.meta && a.meta.sort_order) || 0) - ((b.meta && b.meta.sort_order) || 0));
    for (const c of kids) walk(c, myId);
  }
  for (const r of roots) walk(r, '');
  return out;
}

export function isMoArray(arr) {
  return arr.some((n) => n && !('parentId' in n) &&
    (n.type === 'organization' || n.type === 'filled' || n.type === 'vacant' ||
     (Array.isArray(n.children) && ('position' in n || 'photo_url' in n))));
}

/* auto-detect the shape of imported JSON and return { nodes, meta } */
export function normalizeImported(data) {
  let nodes, meta = null;
  if (Array.isArray(data)) {
    if (data.length && isMoArray(data)) nodes = convertMoTree(data);
    else nodes = data;
  } else if (data && Array.isArray(data.nodes)) {
    nodes = data.nodes; meta = data;
  } else if (data && Array.isArray(data.tree)) {
    nodes = convertNestedTree(data.tree);
  } else if (data && data.tree && typeof data.tree === 'object') {
    nodes = convertNestedTree([data.tree]);
  } else if (data && data.org_id != null) {
    nodes = convertNestedTree([data]);
  } else if (data && Array.isArray(data.children) && data.type) {
    nodes = convertMoTree([data]);
  } else {
    throw new Error('Unrecognized JSON. Expected a flat node array, {nodes:[…]}, {tree:[…]}, or an API tree of {type,children}.');
  }
  if (!nodes.length) throw new Error('No nodes found in data.');
  const missing = nodes.find((n) => !n || n.id == null);
  if (missing) throw new Error('Every node needs an "id" field.');
  return { nodes, meta };
}
