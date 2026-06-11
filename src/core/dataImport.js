// Data normalization & multi-format import — pure (no DOM, no sample data).
import { DEPT_SIZE, POS_SIZE } from './constants.js';

/* normalize a loose node record into a full internal node */
export function makeNode(src) {
  return {
    id: src.id,
    parentId: src.parentId || '',
    type: src.type || 'position',
    label: src.label || '',
    personName: src.personName || '',
    status: src.status || '',
    width: src.width || POS_SIZE.width,
    height: src.height || POS_SIZE.height,
    collapsed: !!src.collapsed,
    layoutMode: src.layoutMode || null,   // per-node subtree override
    data: src.data || {},
  };
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
               width: DEPT_SIZE.width, height: DEPT_SIZE.height, data: { level: org.level } });
    const positions = (org.positions || []).slice().sort((a, b) => (a.org_order || 0) - (b.org_order || 0));
    for (const p of positions) {
      out.push({ id: 'pos-' + p.id, parentId: orgId, type: 'position',
                 label: p.position_title || 'POSITION', personName: personNameFromPos(p),
                 status: p.status || '', width: POS_SIZE.width, height: POS_SIZE.height,
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
                 width: DEPT_SIZE.width, height: DEPT_SIZE.height,
                 data: { level: n.meta && n.meta.level, srcId: n.id } });
    } else {
      const vacant = n.type === 'vacant';
      out.push({ id: myId, parentId, type: 'position', label: n.position || 'POSITION',
                 personName: vacant ? '— VACANT —' : (n.name || '—'),
                 status: vacant ? 'VACANT' : 'FILLED', width: POS_SIZE.width, height: POS_SIZE.height,
                 data: { photo_url: n.photo_url || null, srcId: n.id } });
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
