// Validation for portable layout data — pure (no DOM).
//
// A saved layout (getLayout() / a backend copy of it), an exported JSON file
// and a settings object all arrive from outside the chart. Every value read
// here ends up in geometry, CSS or SVG markup, so each field is checked for
// its exact type: geometry must be a finite number, flags must be booleans,
// enums must be known and colours must be colour literals. Anything else is
// dropped and described in `problems` so the caller can report it.
import { SUBTREE_MODES, ORIENTATIONS } from './constants.js';
import { isSafeColor, invalidRuleColors, normalizeRule } from './theme.js';
import { makeNode, nodeInputProblems, normalizeParentId, isCollapsedFlag } from './dataImport.js';

const ORIENTATION_ALIASES = { Top: 'TopToBottom', Bottom: 'BottomToTop', Left: 'LeftToRight', Right: 'RightToLeft' };
const LAYOUT_MODES = new Set([...SUBTREE_MODES, 'Auto']);

const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const positive = (v) => finite(v) && v > 0;

/* Saved maps come back from PHP/JSON backends as [] when empty. */
function asMap(value) {
  if (Array.isArray(value) && value.length === 0) return {};
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

// view keys -> validator. Numbers carry the range the renderer can draw.
const VIEW_NUMBERS = {
  spacingX: [0, 2000], spacingY: [0, 2000], gridSize: [2, 400],
  cardWidth: [20, 4000], photoHeight: [20, 4000], textHeight: [20, 4000],
  departmentWidth: [20, 4000], departmentHeight: [20, 4000],
};
const VIEW_FLAGS = ['showGrid', 'snapGrid', 'alignGrid', 'showImages', 'autoEdgeSide', 'photoContain'];

/* Validate a view/settings object. Unknown keys are ignored (newer versions
   may add fields); known keys with bad values are reported. */
export function sanitizeView(view, problems = [], where = 'view') {
  const out = {};
  if (view == null) return out;
  if (typeof view !== 'object' || Array.isArray(view)) { problems.push(`${where} (not an object)`); return out; }
  const bad = (key, value) => problems.push(`${where}.${key} ${JSON.stringify(value)}`);
  if (view.subtreeMode != null) {
    if (LAYOUT_MODES.has(view.subtreeMode)) out.subtreeMode = view.subtreeMode; else bad('subtreeMode', view.subtreeMode);
  }
  if (view.orientation != null) {
    const o = ORIENTATION_ALIASES[view.orientation] || view.orientation;
    if (ORIENTATIONS.includes(o)) out.orientation = o; else bad('orientation', view.orientation);
  }
  for (const [key, [min, max]] of Object.entries(VIEW_NUMBERS)) {
    if (view[key] == null) continue;
    if (finite(view[key]) && view[key] >= min && view[key] <= max) out[key] = view[key]; else bad(key, view[key]);
  }
  for (const key of VIEW_FLAGS) {
    if (view[key] == null) continue;
    if (typeof view[key] === 'boolean') out[key] = view[key]; else bad(key, view[key]);
  }
  if (view.contain != null) {
    if (typeof view.contain === 'boolean') out.contain = view.contain; else bad('contain', view.contain);
  }
  if (view.photoBackground != null) {
    if (isSafeColor(view.photoBackground)) out.photoBackground = view.photoBackground.trim(); else bad('photoBackground', view.photoBackground);
  }
  for (const key of ['width', 'photoFrameWidth', 'photoFrameHeight', 'photoImageWidth', 'photoImageHeight']) {
    if (view[key] == null) continue;
    if (positive(view[key])) out[key] = view[key]; else bad(key, view[key]);
  }
  for (const key of ['photoOffsetX', 'photoOffsetY']) {
    if (view[key] == null) continue;
    if (finite(view[key])) out[key] = view[key]; else bad(key, view[key]);
  }
  const box = (key, fields) => {
    if (view[key] == null) return;
    if (typeof view[key] !== 'object' || Array.isArray(view[key])) { bad(key, view[key]); return; }
    const clean = {};
    for (const [f, check] of Object.entries(fields)) {
      const v = view[key][f];
      if (v == null) continue;
      if (check(v)) clean[f] = v; else bad(`${key}.${f}`, v);
    }
    out[key] = clean;
  };
  box('virtualPhotoFrame', { width: positive, height: positive });
  box('renderedImage', {
    width: positive, height: positive, offsetX: finite, offsetY: finite,
    fit: (v) => v === 'contain' || v === 'cover', align: (v) => v === 'center',
  });
  box('node', { width: positive, photoHeight: positive, textHeight: positive, totalHeight: positive });
  box('departmentNode', { width: positive, height: positive });
  if (view.themeRules != null) {
    if (!Array.isArray(view.themeRules)) bad('themeRules', view.themeRules);
    else {
      out.themeRules = view.themeRules.filter((r, i) => {
        if (!r || typeof r !== 'object') { problems.push(`${where}.themeRules[${i}] (not an object)`); return false; }
        for (const k of invalidRuleColors(r)) problems.push(`${where}.themeRules[${i}].style.${k} ${JSON.stringify(r.style[k])}`);
        return true;
      }).map(normalizeRule);
    }
  }
  return out;
}

function point(v) {
  return v && typeof v === 'object' && finite(v.x) && finite(v.y) ? { x: v.x, y: v.y } : null;
}
function anchor(v) {
  return v && typeof v === 'object' && finite(v.nx) && finite(v.ny)
    && Math.abs(v.nx) <= 1 && Math.abs(v.ny) <= 1 ? { nx: v.nx, ny: v.ny } : null;
}

/* Copy a per-id map, keeping only entries whose value passes `clean`. */
function cleanMap(value, where, problems, clean) {
  const out = Object.create(null);
  if (value == null) return out;
  const map = asMap(value);
  if (!map) { problems.push(`${where} (not an object)`); return out; }
  for (const id of Object.keys(map)) {
    const v = clean(map[id]);
    if (v == null) problems.push(`${where}.${id}`);
    else out[id] = v;
  }
  return out;
}

const OVERRIDE_TEXT = ['label', 'personName', 'status'];

/* One node-override entry (a manual inspector edit, an added or a deleted
   node). Returns null when nothing usable remains. */
function cleanOverride(ov, id, problems, where) {
  if (!ov || typeof ov !== 'object' || Array.isArray(ov)) return null;
  if (ov.__deleted === true) return { __deleted: true };
  const out = {};
  const bad = (key) => problems.push(`${where}.${id}.${key}`);
  if (ov.__new === true) {
    for (const p of nodeInputProblems(ov)) problems.push(`${where}.${id} ${p}`);
    const node = makeNode(Object.assign({}, ov, { id: ov.id != null ? ov.id : id }));
    return Object.assign({ __new: true }, node);
  }
  for (const key of Object.keys(ov)) {
    const v = ov[key];
    if (key === 'parentId') {
      if (v == null || typeof v === 'string' || finite(v)) out.parentId = normalizeParentId(v); else bad(key);
    } else if (OVERRIDE_TEXT.includes(key)) {
      if (v == null || typeof v === 'string' || finite(v)) out[key] = v == null ? '' : String(v); else bad(key);
    } else if (key === 'type') {
      if (typeof v === 'string' && /^[A-Za-z][\w-]*$/.test(v)) out.type = v; else bad(key);
    } else if (key === 'width' || key === 'height') {
      if (positive(v)) out[key] = v; else bad(key);
    } else if (key === 'collapsed') {
      if (typeof v === 'boolean' || v === 'true' || v === 'false') out.collapsed = isCollapsedFlag(v); else bad(key);
    } else if (key === 'layoutMode') {
      if (v == null || v === '') out.layoutMode = null;
      else if (LAYOUT_MODES.has(v)) out.layoutMode = v; else bad(key);
    } else if (key === 'data') {
      if (!v || typeof v !== 'object' || Array.isArray(v)) { bad(key); continue; }
      const data = Object.assign({}, v);
      if (data.photo_url != null && typeof data.photo_url !== 'string') { bad('data.photo_url'); delete data.photo_url; }
      out.data = data;
    } else if (key !== 'id') {
      bad(key);
    }
  }
  return Object.keys(out).length ? out : null;
}

/* Validate the `layout` part of a saved layout (manual geometry + overlays). */
export function sanitizeManualLayout(layout, problems = [], where = 'layout') {
  const src = layout && typeof layout === 'object' && !Array.isArray(layout) ? layout : {};
  if (layout != null && src !== layout) problems.push(`${where} (not an object)`);
  const out = {
    manualOffsets: cleanMap(src.manualOffsets, `${where}.manualOffsets`, problems,
      (v) => (v && finite(v.dx) && finite(v.dy) ? { dx: v.dx, dy: v.dy } : null)),
    edgeWaypoints: cleanMap(src.edgeWaypoints, `${where}.edgeWaypoints`, problems, (v) => {
      if (!Array.isArray(v)) return null;
      const pts = v.map(point);
      return pts.length && pts.every(Boolean) ? pts : null;
    }),
    edgeAnchors: cleanMap(src.edgeAnchors, `${where}.edgeAnchors`, problems, (v) => {
      if (!v || typeof v !== 'object') return null;
      const out2 = {};
      if (v.p != null) { const a = anchor(v.p); if (!a) return null; out2.p = a; }
      if (v.c != null) { const a = anchor(v.c); if (!a) return null; out2.c = a; }
      return Object.keys(out2).length ? out2 : null;
    }),
    familyRouteOverrides: cleanMap(src.familyRouteOverrides, `${where}.familyRouteOverrides`, problems,
      (v) => (v && finite(v.trunkOffset) ? { trunkOffset: v.trunkOffset } : null)),
    nodeOverrides: Object.create(null),
    collapsed: [],
  };
  const overrides = src.nodeOverrides == null ? {} : asMap(src.nodeOverrides);
  if (!overrides) problems.push(`${where}.nodeOverrides (not an object)`);
  else {
    for (const id of Object.keys(overrides)) {
      const v = cleanOverride(overrides[id], id, problems, `${where}.nodeOverrides`);
      if (v) out.nodeOverrides[id] = v;
      else if (overrides[id] && typeof overrides[id] === 'object' && !Object.keys(overrides[id]).length) continue;
      else problems.push(`${where}.nodeOverrides.${id}`);
    }
  }
  if (src.collapsed != null) {
    if (!Array.isArray(src.collapsed)) problems.push(`${where}.collapsed (not an array)`);
    else {
      for (const id of src.collapsed) {
        if (typeof id === 'string' || finite(id)) out.collapsed.push(id); else problems.push(`${where}.collapsed ${JSON.stringify(id)}`);
      }
    }
  }
  return out;
}

/* Validate a complete saved layout ({ full, view, layout }). */
export function sanitizeSavedLayout(obj) {
  const problems = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { layout: null, problems: ['layout (not an object)'] };
  }
  // Only an explicit full layout carries manual geometry; a pattern-only
  // layout (full false/absent) restores the view and a fresh automatic layout.
  if (obj.full != null && typeof obj.full !== 'boolean') problems.push(`full ${JSON.stringify(obj.full)}`);
  const full = obj.full === true && obj.layout != null;
  const layout = { full, view: sanitizeView(obj.view, problems, 'view') };
  if (full) layout.layout = sanitizeManualLayout(obj.layout, problems, 'layout');
  return { layout, problems };
}
