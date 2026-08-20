// Framework-independent constants for the org-chart layout engine.
// No DOM, no window — safe to import anywhere.

export const VIRTUAL_ROOT_ID = '__virtual_root__';
export const SNAKE_STUB = 26;   // horizontal gap between spine and a snake child
export const CANVAS_PAD = 80;   // padding around the normalized layout

export const SUBTREE_MODES = [
  'AutoSmart', 'GridSmart',
  'Balanced', 'Center', 'Left', 'Right',
  'Alternate', 'AlternateLeft', 'AlternateRight', 'Matrix',
];
export const ORIENTATIONS = ['TopToBottom', 'BottomToTop', 'LeftToRight', 'RightToLeft'];

export const DEFAULTS = {
  orientation: 'TopToBottom',
  subtreeMode: 'AutoSmart',
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  alignGrid: false,
};

// Default card and portrait geometry (consumers can still override it).
// The logical 400×400 photo frame with a centred 420×420 image is a 5%
// overscan. It hides transparent/rounded source-image edges without stretching
// the portrait, while the card itself clips the result to its 240×240 frame.
export const VIRTUAL_PHOTO_FRAME = { width: 400, height: 400 };
export const RENDERED_PHOTO = {
  width: 420,
  height: 420,
  fit: 'contain',
  align: 'center',
  offsetX: 0,
  offsetY: 0,
};
export const PHOTO_BACKGROUND = '#004264';
export const PERSON_TEXT_HEIGHT = 140;
export const DEPT_SIZE = { width: 240, height: 100 };
export const POS_SIZE = { width: 240, height: 380 };
