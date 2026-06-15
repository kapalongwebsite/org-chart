// Type definitions for local-org-chart (hand-written, framework-independent core + vanilla).

export type Orientation = 'TopToBottom' | 'BottomToTop' | 'LeftToRight' | 'RightToLeft';
export type OrientationInput = Orientation | 'Top' | 'Bottom' | 'Left' | 'Right';
export type SubtreeMode =
  | 'Balanced' | 'Center' | 'Left' | 'Right'
  | 'Alternate' | 'AlternateLeft' | 'AlternateRight' | 'Matrix';

export interface OrgNode {
  id: string;
  parentId?: string;
  type?: 'department' | 'position' | string;
  label?: string;
  personName?: string;
  status?: 'FILLED' | 'VACANT' | 'UNFUNDED' | string;
  width?: number;
  height?: number;
  collapsed?: boolean;
  layoutMode?: SubtreeMode | null;
  data?: Record<string, any>;
}

export interface LayoutOptions {
  orientation?: OrientationInput;
  subtreeMode?: SubtreeMode;
  spacingX?: number;
  spacingY?: number;
  gridSize?: number;
  alignGrid?: boolean;
}

export interface PositionedNode {
  node: OrgNode;
  cx: number; cy: number; w: number; h: number;
  parentId: string; routeType: 'bus' | 'spine-left' | 'spine-right';
}

export interface Bounds { x: number; y: number; w: number; h: number; }
export interface LayoutResult {
  positioned: PositionedNode[];
  posById: Record<string, PositionedNode>;
  cfg: Omit<Required<LayoutOptions>, 'orientation'> & { orientation: Orientation };
  bounds: Bounds;
}

// ---- core ----
export function layoutOrgChart(nodes: OrgNode[], options?: LayoutOptions): LayoutResult;
export function buildTree(nodes: OrgNode[]): any;
export function searchNodes(nodes: OrgNode[], query: string): Set<string>;
export function calculateBounds(positioned: PositionedNode[], manualOffsets?: Record<string, { dx: number; dy: number }>, pad?: number): Bounds;
export function fitBounds(bounds: Bounds, viewportW: number, viewportH: number, opts?: { maxZoom?: number; margin?: number }): { zoom: number; panX: number; panY: number };
export function normalizeImported(data: any): { nodes: OrgNode[]; meta: any };
export function makeNode(src: OrgNode): OrgNode;
export function exportLayout(state: any, nodes: OrgNode[], manualOffsets?: any, edgeWaypoints?: any): any;
export function buildChartSVG(positioned: PositionedNode[], paths: string[], opts?: { manualOffsets?: any; raster?: boolean; measureText?: (t: string, font: string) => number; fitOf?: (n: OrgNode) => number }): string;

export const SUBTREE_MODES: SubtreeMode[];
export const ORIENTATIONS: Orientation[];

// ---- vanilla ----
export interface ThemeRule {
  enabled?: boolean;
  field: 'type' | 'status' | 'level' | 'unit' | 'id' | 'label' | string;
  value: string;
  style: { bg?: string; text?: string; border?: string };
}
export interface ChartSettings {
  spacingX?: number; spacingY?: number; gridSize?: number;
  orientation?: OrientationInput; subtreeMode?: SubtreeMode;
  showGrid?: boolean; snapGrid?: boolean; alignGrid?: boolean;
  themeRules?: ThemeRule[];
}

export interface CreateOptions extends LayoutOptions {
  nodes?: OrgNode[];
  showGrid?: boolean;
  snapGrid?: boolean;
  enableDragging?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  readonly?: boolean;
  editMode?: boolean;
  inspector?: boolean;
  /** Mount the inspector drawer into an external element (selector or node) instead of the canvas. */
  inspectorTarget?: string | HTMLElement | null;
  inspectorSlot?: boolean;
  /** Mount the settings drawer into an external element (selector or node) instead of the canvas. */
  settingsTarget?: string | HTMLElement | null;
  settingsSlot?: boolean;
  nodeSlots?: boolean;
  /** Show the floating fullscreen button on the canvas (default true). */
  fullscreenControl?: boolean;
  /** Re-frame the view after a mode/orientation/re-layout change. `true`/`'fit'` (default), `'recenter'` (keep zoom), `false`/`'none'`. */
  fitOnLayoutChange?: boolean | 'fit' | 'recenter' | 'none';
  settings?: ChartSettings;
  fitOnInit?: boolean;
  toolbar?: boolean | Partial<Record<'subtree' | 'orient' | 'actions' | 'search' | 'grid' | 'mode' | 'export', boolean>>;
  persist?: boolean;
  storageKey?: string;
}

export type OrgChartEventName =
  | 'node-click' | 'node-select' | 'node-drag-start' | 'node-drag' | 'node-drag-end'
  | 'layout-change' | 'orientation-change' | 'subtree-mode-change'
  | 'edit-mode-change' | 'node-change' | 'settings-change'
  | 'inspector-open' | 'inspector-close' | 'settings-open' | 'settings-close' | 'fullscreen-change';

export interface ScreenRect { left: number; top: number; right: number; bottom: number; width: number; height: number; }

export interface OrgChartInstance {
  root: HTMLElement;
  setNodes(nodes: OrgNode[], meta?: any, options?: { resetEdits?: boolean }): void;
  loadJSON(data: any): number;
  setOrientation(o: OrientationInput): void;
  setSubtreeMode(m: SubtreeMode): void;
  setSpacing(x?: number, y?: number): void;
  setOption(key: string, val: any): void;
  setShowGrid(on: boolean): boolean;
  setSnapToGrid(on: boolean): boolean;
  setAlignToGrid(on: boolean): boolean;
  toggleGrid(force?: boolean): boolean;
  fitToScreen(): void;
  relayout(): void;
  resetView(): void;
  expandAll(): void;
  collapseAll(): void;
  toggleCollapse(id: string): void;
  centerOnNode(id: string): void;
  enterFullscreen(): void;
  exitFullscreen(): void;
  toggleFullscreen(force?: boolean): boolean;
  isFullscreen(): boolean;
  search(query: string): number;
  clearSearch(): void;
  exportJSON(download?: boolean): any;
  exportSVG(): string;
  exportPNG(scale?: number): void;
  exportPDF(): void;
  buildSVG(raster?: boolean): string;
  setEditMode(on: boolean): void;
  isEditMode(): boolean;
  updateNode(id: string, patch: Partial<OrgNode>): void;
  addChild(parentId: string): void;
  deleteNode(id: string): void;
  reparentNode(id: string, newParentId: string): void;
  detachNode(id: string): void;
  openInspector(id: string): void;
  closeInspector(): void;
  /** The selected node's on-screen rectangle (viewport coords), or null. */
  nodeScreenRect(id: string): ScreenRect | null;
  getSettings(): ChartSettings;
  setSettings(settings: ChartSettings): void;
  toggleSettings(force?: boolean): void;
  /** Restore spacing / grid / theme rules to the as-configured defaults. */
  resetSettings(): void;
  getState(): any;
  getNodes(): OrgNode[];
  getPositioned(): PositionedNode[];
  on(name: OrgChartEventName, cb: (payload: any) => void): OrgChartInstance;
  off(name: OrgChartEventName, cb: (payload: any) => void): OrgChartInstance;
  destroy(): void;
}

export function createOrgChart(host: HTMLElement, options?: CreateOptions): OrgChartInstance;

// ---- Vue component ref type ----
// Use this when typing the ref in a consuming Vue app:
//   const chartRef = ref<OrgChartVueInstance | null>(null)
export interface OrgChartVueInstance {
  // view / layout
  fitToScreen(): void;
  relayout(): void;
  resetView(): void;
  expandAll(): void;
  collapseAll(): void;
  toggleCollapse(id: string): void;
  centerOnNode(id: string): void;

  // search
  search(query: string): number;
  clearSearch(): void;

  // orientation / subtree
  setOrientation(o: OrientationInput): void;
  setSubtreeMode(m: SubtreeMode): void;
  setSpacing(x?: number, y?: number): void;

  // grid (single canonical name each)
  setShowGrid(on: boolean): boolean;
  setSnapToGrid(on: boolean): boolean;
  setAlignToGrid(on: boolean): boolean;
  toggleGrid(force?: boolean): boolean;

  // fullscreen
  enterFullscreen(): void;
  exitFullscreen(): void;
  toggleFullscreen(force?: boolean): boolean;
  isFullscreen(): boolean;

  // edit mode / inspector / settings
  setEditMode(on: boolean): void;
  isEditMode(): boolean;
  updateNode(id: string, patch: Partial<OrgNode>): void;
  addChild(parentId: string): void;
  deleteNode(id: string): void;
  reparentNode(id: string, newParentId: string): void;
  detachNode(id: string): void;
  openInspector(id: string): void;
  closeInspector(): void;
  nodeScreenRect(id: string): ScreenRect | null;
  getSettings(): ChartSettings;
  setSettings(settings: ChartSettings): void;
  toggleSettings(force?: boolean): void;
  resetSettings(): void;

  // data
  setNodes(nodes: OrgNode[], meta?: any, options?: { resetEdits?: boolean }): void;
  loadJSON(data: any): number;
  getState(): any;
  getNodes(): OrgNode[];
  getPositioned(): PositionedNode[];

  // export
  exportJSON(download?: boolean): any;
  exportSVG(): string;
  exportPNG(scale?: number): void;
  exportPDF(): void;
  buildSVG(raster?: boolean): string;

  // generic / advanced
  setOption(key: string, val: any): void;
  on(name: OrgChartEventName, cb: (payload: any) => void): void;
  off(name: OrgChartEventName, cb: (payload: any) => void): void;

  /** Access the underlying vanilla OrgChartInstance (escape hatch). */
  instance(): OrgChartInstance;
}
