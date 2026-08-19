// Type definitions for local-org-chart (hand-written, framework-independent core + vanilla).

export type Orientation = 'TopToBottom' | 'BottomToTop' | 'LeftToRight' | 'RightToLeft';
export type OrientationInput = Orientation | 'Top' | 'Bottom' | 'Left' | 'Right';
export type SubtreeMode =
  | 'AutoSmart' | 'GridSmart' | 'Auto' | 'Balanced' | 'Center' | 'Left' | 'Right'
  | 'Alternate' | 'AlternateLeft' | 'AlternateRight' | 'Matrix' | 'Custom';

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
  autoEdgeSide?: boolean;
  /** Stable interactive layout width / height used by AutoSmart and GridSmart. Default 1.6. */
  targetAspect?: number;
  /** Explicit output/layout shape; takes precedence over targetAspect. */
  targetSize?: { width: number; height: number } | null;
  /** Opt into viewport-driven automatic geometry after material aspect changes. Default false. */
  reflowOnResize?: boolean;
  familyRouteOverrides?: Record<string, FamilyRouteOverride> | null;
}

export interface FamilyRouteOverride { trunkOffset: number; }
export interface FamilyRouteSegment {
  id?: string;
  a: { x: number; y: number };
  b: { x: number; y: number };
  d?: string;
  childIds: string[];
  role?: 'shared' | 'branch';
}
export interface FamilyNetwork {
  model: 'shared-family-network';
  parentId: string;
  childIds: string[];
  source: { x: number; y: number };
  segments: FamilyRouteSegment[];
  stemSegments: FamilyRouteSegment[];
  sharedSegments: FamilyRouteSegment[];
  buses: FamilyRouteSegment[];
  branches: Array<{ childId: string; segments: FamilyRouteSegment[] }>;
  junctions: Array<{ point: { x: number; y: number }; segmentIds: string[] }>;
  trunk: FamilyRouteSegment | null;
  horizontalFlow: boolean;
}

export interface ConnectorPath {
  id: string;
  d: string;
  style?: any;
}

export interface PositionedNode {
  node: OrgNode;
  cx: number; cy: number; w: number; h: number;
  parentId: string; routeType: 'bus' | 'packed' | 'spine-left' | 'spine-right';
  routePoints?: Array<{ x: number; y: number }> | null;
  resolvedLayoutMode?: SubtreeMode;
}

export interface Bounds { x: number; y: number; w: number; h: number; }
export interface LayoutResult {
  positioned: PositionedNode[];
  posById: Record<string, PositionedNode>;
  cfg: {
    orientation: Orientation; subtreeMode: SubtreeMode;
    spacingX: number; spacingY: number; gridSize: number;
    alignGrid: boolean; autoEdgeSide: boolean; targetAspect: number;
    familyRouteOverrides: Record<string, FamilyRouteOverride> | null;
  };
  bounds: Bounds;
  framingBounds: Bounds;
  familyNetworks: FamilyNetwork[];
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
export function buildChartSVG(positioned: PositionedNode[], paths: Array<string | ConnectorPath>, opts?: { manualOffsets?: any; raster?: boolean; measureText?: (t: string, font: string) => number; fitOf?: (n: OrgNode) => number; familyNetworks?: FamilyNetwork[]; rebuildFamilyIds?: Iterable<string>; bounds?: Bounds }): string;
export function buildVisibleConnectorSegments(paths: Array<string | ConnectorPath>, options?: { sharedStyle?: any; preserveMembership?: boolean }): Array<FamilyRouteSegment & { memberIds: string[]; shared: boolean; style?: any }>;
export function buildFamilyConnectorNetwork(parentId: string, childPaths: Array<ConnectorPath | { id: string; points: Array<{ x: number; y: number }>; style?: any }>, options?: { horizontalFlow?: boolean }): FamilyNetwork | null;
export function resolveConnectorGeometry(paths: Array<string | ConnectorPath>, familyNetworks?: FamilyNetwork[], options?: { sharedStyle?: any; rebuildFamilyIds?: Iterable<string> }): { segments: Array<FamilyRouteSegment & { memberIds: string[]; shared: boolean; style?: any }>; familyNetworks: FamilyNetwork[]; standaloneIds: string[] };

export const SUBTREE_MODES: SubtreeMode[];
export const ORIENTATIONS: Orientation[];

// ---- deterministic physical-canvas print engine ----
export type PrintLayoutFamily = 'portrait-sectioned' | 'wide-row' | 'portrait-spine' | 'custom';
export interface PrintProfile {
  schemaVersion?: 1;
  templateId?: string;
  templateVersion?: number;
  widthMm: number;
  heightMm: number;
  safeMarginMm?: number;
  headerHeightMm?: number;
  footerHeightMm?: number;
  preferredUnit?: 'mm' | 'cm' | 'in' | 'ft';
  dpi?: number;
  minFontMm?: number;
  layoutFamily: PrintLayoutFamily;
  layout?: Record<string, any>;
}
export interface PrintDiagnostic { level: 'error' | 'warning'; code: string; message: string; }
export interface PrintLayoutResult {
  ok: boolean;
  profile: Required<Omit<PrintProfile, 'layout'>> & { layout: Record<string, any> };
  diagnostics: PrintDiagnostic[];
  positioned?: PositionedNode[];
  contentBox: { x: number; y: number; width: number; height: number };
  transform?: { scale: number; x: number; y: number };
  effectiveFontMm?: number;
  [key: string]: any;
}
export const PRINT_LAYOUT_FAMILIES: readonly PrintLayoutFamily[];
export function recommendPrintLayout(nodes: OrgNode[], canvas: { widthMm: number; heightMm: number }): { family: PrintLayoutFamily; reasons: string[]; stats: { count: number; maxDepth: number; maxChildren: number }; canvasAspect: number };
export function normalizePrintProfile(profile: PrintProfile): Required<Omit<PrintProfile, 'layout'>> & { layout: Record<string, any> };
export function layoutPrintChart(nodes: OrgNode[], profile: PrintProfile): PrintLayoutResult;
export function renderPrintChartFragment(layout: PrintLayoutResult, options?: { photoDataByUrl?: Record<string, string>; allowRemotePhotos?: boolean }): string;
export function renderPrintChartSvg(layout: PrintLayoutResult, options?: { photoDataByUrl?: Record<string, string>; allowRemotePhotos?: boolean; background?: string; ariaLabel?: string }): string;
export function svgElementToPdfBlob(svgElement: SVGElement, dimensions: { widthMm: number; heightMm: number }): Promise<Blob>;

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
  /** Show legacy per-node subtree strategy overrides in the inspector. Default false. */
  advancedLayoutControls?: boolean;
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
  /** Snap a dragged node/waypoint to the parent's connector axis + sibling centers, with guide lines. Default true. */
  snapAlign?: boolean;
  settings?: ChartSettings;
  fitOnInit?: boolean;
  /** Run editor-triggered full layouts in a Web Worker. Default true. */
  layoutWorker?: boolean;
  /** Reuse exact completed layout results from a bounded in-memory cache. Default true. */
  layoutCache?: boolean;
  /** Built-in toolbar groups. The subtree strategy group is hidden unless explicitly set to true. */
  toolbar?: boolean | Partial<Record<'subtree' | 'orient' | 'history' | 'actions' | 'search' | 'grid' | 'mode' | 'export', boolean>>;
  persist?: boolean;
  storageKey?: string;
}

export type OrgChartEventName =
  | 'node-click' | 'node-select' | 'node-drag-start' | 'node-drag' | 'node-drag-end'
  | 'layout-change' | 'orientation-change' | 'subtree-mode-change'
  | 'relayout' | 'layout-start' | 'layout-complete' | 'layout-cancel' | 'layout-error'
  | 'edit-mode-change' | 'node-change' | 'settings-change'
  | 'family-route-select' | 'family-route-change' | 'family-route-reset'
  | 'inspector-open' | 'inspector-close' | 'settings-open' | 'settings-close' | 'fullscreen-change';

export interface ScreenRect { left: number; top: number; right: number; bottom: number; width: number; height: number; }

export interface OrgChartInstance {
  root: HTMLElement;
  setNodes(nodes: OrgNode[], meta?: any, options?: { resetEdits?: boolean }): Promise<boolean>;
  loadJSON(data: any): number;
  setOrientation(o: OrientationInput): Promise<boolean>;
  setSubtreeMode(m: SubtreeMode): Promise<boolean>;
  setSpacing(x?: number, y?: number): Promise<boolean>;
  setOption(key: string, val: any): void;
  setShowGrid(on: boolean): boolean;
  setSnapToGrid(on: boolean): boolean;
  setAlignToGrid(on: boolean): boolean;
  toggleGrid(force?: boolean): boolean;
  fitToScreen(): void;
  relayout(): Promise<boolean>;
  forceRelayout(): Promise<boolean>;
  resetView(): Promise<boolean>;
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
  addChild(parentId: string): string | null;
  deleteNode(id: string): void;
  reparentNode(id: string, newParentId: string): void;
  detachNode(id: string): void;
  getFamilyRouteSelection(): string | null;
  getFamilyNetworks(): FamilyNetwork[];
  getFamilyRouteOverrides(): Record<string, FamilyRouteOverride>;
  setFamilyRouteOverride(parentId: string, override: FamilyRouteOverride): boolean;
  resetFamilyRoute(parentId?: string): boolean;
  openInspector(id: string): void;
  closeInspector(): void;
  /** The selected node's on-screen rectangle (viewport coords), or null. */
  nodeScreenRect(id: string): ScreenRect | null;
  getSettings(): ChartSettings;
  setSettings(settings: ChartSettings): void;
  toggleSettings(force?: boolean): void;
  /** Restore spacing / grid / theme rules to the as-configured defaults. */
  resetSettings(): void;
  getLayout(options?: { full?: boolean }): any;
  applyLayout(layout: any): Promise<boolean>;
  getState(): any;
  getNodes(): OrgNode[];
  getPositioned(): PositionedNode[];
  isLayoutBusy(): boolean;
  whenLayoutSettled(): Promise<boolean>;
  cancelLayout(): boolean;
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
  relayout(): Promise<boolean> | null;
  forceRelayout(): Promise<boolean> | null;
  resetView(): Promise<boolean> | null;
  expandAll(): void;
  collapseAll(): void;
  toggleCollapse(id: string): void;
  centerOnNode(id: string): void;

  // search
  search(query: string): number;
  clearSearch(): void;

  // orientation / subtree
  setOrientation(o: OrientationInput): Promise<boolean> | null;
  setSubtreeMode(m: SubtreeMode): Promise<boolean> | null;
  setSpacing(x?: number, y?: number): Promise<boolean> | null;

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
  addChild(parentId: string): string | null;
  deleteNode(id: string): void;
  reparentNode(id: string, newParentId: string): void;
  detachNode(id: string): void;
  getFamilyRouteSelection(): string | null;
  getFamilyNetworks(): FamilyNetwork[];
  getFamilyRouteOverrides(): Record<string, FamilyRouteOverride>;
  setFamilyRouteOverride(parentId: string, override: FamilyRouteOverride): boolean;
  resetFamilyRoute(parentId?: string): boolean;
  openInspector(id: string): void;
  closeInspector(): void;
  nodeScreenRect(id: string): ScreenRect | null;
  getSettings(): ChartSettings;
  setSettings(settings: ChartSettings): void;
  toggleSettings(force?: boolean): void;
  resetSettings(): void;
  getLayout(options?: { full?: boolean }): any;
  applyLayout(layout: any): Promise<boolean> | null;

  // data
  setNodes(nodes: OrgNode[], meta?: any, options?: { resetEdits?: boolean }): Promise<boolean> | null;
  loadJSON(data: any): number;
  getState(): any;
  getNodes(): OrgNode[];
  getPositioned(): PositionedNode[];
  isLayoutBusy(): boolean;
  whenLayoutSettled(): Promise<boolean>;
  cancelLayout(): boolean;

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
