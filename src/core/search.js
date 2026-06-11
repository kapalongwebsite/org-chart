// Search helpers — pure (no DOM). Returns the set of matching node ids.
export function searchNodes(nodes, query) {
  const q = (query || '').trim().toLowerCase();
  const matches = new Set();
  if (!q) return matches;
  for (const n of nodes) {
    const hay = [n.label, n.personName, n.type, n.status, n.id]
      .filter(Boolean).join(' ').toLowerCase();
    if (hay.includes(q)) matches.add(n.id);
  }
  return matches;
}
