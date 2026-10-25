// Tree building & pruning — pure data transforms (no DOM).
import { VIRTUAL_ROOT_ID } from './constants.js';

export function indexNodes(list) {
  const m = Object.create(null);
  for (const n of list) m[n.id] = n;
  return m;
}

function hasParent(n) {
  return n.parentId !== '' && n.parentId != null && n.parentId !== false;
}

/* Structural problems that make a flat node list impossible to draw as a
   forest: repeated ids, self-parents and parent cycles. A parentId that names
   no node is not a problem — that node is a root. Returns null when the list
   is valid, otherwise { duplicateIds, cycleIds } (string ids, sorted). */
export function findInvalidNodes(nodes) {
  const byId = new Map();
  const duplicates = new Set();
  for (const n of nodes || []) {
    const id = String(n.id);
    if (byId.has(id)) duplicates.add(id);
    else byId.set(id, n);
  }
  // Walk each parent chain once. 1 = on the current chain, 2 = known to reach
  // a root; meeting a 1 again closes a cycle.
  const mark = new Map();
  const cycles = new Set();
  for (const id of byId.keys()) {
    if (mark.has(id)) continue;
    const chain = [];
    let cur = id;
    while (cur != null && byId.has(cur) && !mark.has(cur)) {
      mark.set(cur, 1);
      chain.push(cur);
      const n = byId.get(cur);
      cur = hasParent(n) ? String(n.parentId) : null;
    }
    if (cur != null && mark.get(cur) === 1) {
      for (let i = chain.indexOf(cur); i < chain.length; i++) cycles.add(chain[i]);
    }
    for (const c of chain) mark.set(c, 2);
  }
  if (!duplicates.size && !cycles.size) return null;
  return { duplicateIds: [...duplicates].sort(), cycleIds: [...cycles].sort() };
}

/* Error raised for node data that cannot be laid out. `code` is stable for
   consumers; `details` names the offending ids. */
export function invalidNodeDataError(problems) {
  const parts = [];
  if (problems.duplicateIds.length) parts.push(`duplicate ids: ${problems.duplicateIds.join(', ')}`);
  if (problems.cycleIds.length) parts.push(`parent cycles through: ${problems.cycleIds.join(', ')}`);
  const error = new Error(`Invalid org chart data (${parts.join('; ')}).`);
  error.code = 'INVALID_DATA';
  error.details = { duplicateIds: problems.duplicateIds.slice(), cycleIds: problems.cycleIds.slice() };
  return error;
}

/* flat nodes -> nested tree under a hidden virtual root (supports forests).
   Throws an INVALID_DATA error for duplicate ids or parent cycles. */
export function buildTree(nodes) {
  const problems = findInvalidNodes(nodes);
  if (problems) throw invalidNodeDataError(problems);
  const wrap = Object.create(null);
  for (const n of nodes) wrap[n.id] = { node: n, children: [] };

  const virtual = {
    node: { id: VIRTUAL_ROOT_ID, isVirtual: true, width: 0, height: 0,
            type: 'virtual', collapsed: false, layoutMode: 'Balanced' },
    children: [],
  };

  for (const n of nodes) {
    const entry = wrap[n.id];
    if (hasParent(n) && wrap[n.parentId]) wrap[n.parentId].children.push(entry);  // real parent
    else virtual.children.push(entry);                                           // a real root
  }
  return virtual;
}

/* drop children under collapsed parents (collapsed parent itself stays) */
export function getVisibleTree(entry) {
  const out = { node: entry.node, children: [] };
  if (!entry.node.collapsed) {
    for (const c of entry.children) out.children.push(getVisibleTree(c));
  }
  return out;
}

/* depth of every visible node (real roots = 0); virtual root skipped */
export function visibleDepths(visibleRoot) {
  const d = Object.create(null);
  (function walk(entry, depth) {
    if (!entry.node.isVirtual) d[entry.node.id] = depth;
    const childDepth = entry.node.isVirtual ? 0 : depth + 1;
    for (const c of entry.children) walk(c, childDepth);
  })(visibleRoot, 0);
  return d;
}

/* absolute depth of every node from the flat list (used by collapseAll).
   Iterative, so deep chains cannot overflow the stack; members of a parent
   cycle get depth 0. */
export function computeDepths(nodes, nodeById) {
  const d = Object.create(null);
  for (const n of nodes) {
    if (n.id in d) continue;
    const chain = [];
    const onChain = new Set();
    let cur = n;
    let base = 0;
    while (cur) {
      if (cur.id in d) { base = d[cur.id] + 1; break; }
      if (onChain.has(cur.id)) { base = 0; break; }
      onChain.add(cur.id);
      chain.push(cur);
      cur = hasParent(cur) ? nodeById[cur.parentId] : null;
    }
    for (let i = chain.length - 1; i >= 0; i--) d[chain[i].id] = base + (chain.length - 1 - i);
  }
  return d;
}

export function childCount(nodes, id) {
  let k = 0;
  for (const n of nodes) if (n.parentId === id) k++;
  return k;
}
