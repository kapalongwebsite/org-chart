import { layoutOrgChart } from './layout.js';

self.addEventListener('message', (event) => {
  const message = event.data || {};
  const startedAt = performance.now();

  try {
    const result = layoutOrgChart(message.nodes || [], message.options || {});
    // posById duplicates the positioned objects and is cheap to rebuild on the
    // receiving side. Omitting it keeps the worker payload smaller and avoids
    // relying on structured-clone reference identity.
    self.postMessage({
      id: message.id,
      ok: true,
      durationMs: performance.now() - startedAt,
      result: {
        positioned: result.positioned,
        bounds: result.bounds,
        framingBounds: result.framingBounds,
        familyNetworks: result.familyNetworks || [],
        cfg: result.cfg,
      },
    });
  } catch (error) {
    self.postMessage({
      id: message.id,
      ok: false,
      error: {
        name: error?.name || 'Error',
        message: error?.message || String(error),
        stack: error?.stack || '',
      },
    });
  }
});
