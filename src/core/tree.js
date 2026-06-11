// Tree building & pruning — pure data transforms (no DOM).
import { VIRTUAL_ROOT_ID } from './constants.js';

export function indexNodes(list) {
  const m = Object.create(null);
  for (const n of list) m[n.id] = n;
  return m;
}

/* flat nodes -> nested tree under a hidden virtual root (supports forests) */
export function buildTree(nodes) {
  const wrap = Object.create(null);
  for (const n of nodes) wrap[n.id] = { node: n, children: [] };

  const virtual = {
    node: { id: VIRTUAL_ROOT_ID, isVirtual: true, width: 0, height: 0,
            type: 'virtual', collapsed: false, layoutMode: 'Balanced' },
    children: [],
  };

  for (const n of nodes) {
    const entry = wrap[n.id];
    const pid = n.parentId;
    if (pid && wrap[pid]) wrap[pid].children.push(entry);  // real parent
    else virtual.children.push(entry);                      // a real root
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

/* absolute depth of every node from the flat list (used by collapseAll) */
export function computeDepths(nodes, nodeById) {
  const d = Object.create(null);
  function dep(id) {
    if (id in d) return d[id];
    const n = nodeById[id];
    if (!n || !n.parentId) return (d[id] = 0);
    return (d[id] = dep(n.parentId) + 1);
  }
  for (const n of nodes) dep(n.id);
  return d;
}

export function childCount(nodes, id) {
  let k = 0;
  for (const n of nodes) if (n.parentId === id) k++;
  return k;
}
