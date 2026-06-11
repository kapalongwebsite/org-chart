// Framework-independent constants for the org-chart layout engine.
// No DOM, no window — safe to import anywhere.

export const VIRTUAL_ROOT_ID = '__virtual_root__';
export const SNAKE_STUB = 26;   // horizontal gap between spine and a snake child
export const CANVAS_PAD = 80;   // padding around the normalized layout

export const SUBTREE_MODES = [
  'Balanced', 'Center', 'Left', 'Right',
  'Alternate', 'AlternateLeft', 'AlternateRight', 'Matrix',
];
export const ORIENTATIONS = ['TopToBottom', 'BottomToTop', 'LeftToRight', 'RightToLeft'];

export const DEFAULTS = {
  orientation: 'TopToBottom',
  subtreeMode: 'Balanced',
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  alignGrid: false,
};

// default card sizes (consumers can override per node)
export const DEPT_SIZE = { width: 230, height: 64 };
export const POS_SIZE = { width: 180, height: 150 };
