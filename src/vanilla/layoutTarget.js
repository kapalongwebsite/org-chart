function measuredViewportSize(viewport) {
  const width = Number(viewport?.clientWidth);
  const height = Number(viewport?.clientHeight);
  return width > 0 && height > 0 ? { width, height } : null;
}

/**
 * Resolve the shape supplied to the layout solver for an interactive chart.
 *
 * The host element is a camera, not a layout constraint. Its dimensions only
 * become a solver target when responsive geometry was explicitly requested.
 * This keeps a chart's node and connector geometry stable across desktop,
 * tablet, mobile, fullscreen, and ordinary container resizes.
 */
export function resolveInteractiveLayoutTarget(options = {}, viewport = null) {
  return {
    targetAspect: options.targetAspect,
    targetSize: options.targetSize || (
      options.reflowOnResize ? measuredViewportSize(viewport) : null
    ),
  };
}
