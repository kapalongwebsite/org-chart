// Node module hooks for the test runner. The renderer imports its layout
// worker through Vite's `?worker` suffix and the entry points import CSS;
// neither resolves under plain Node, so tests get small stand-in modules.
// A test can install `globalThis.__testLayoutWorker` (a Worker-like class) to
// exercise the renderer's worker protocol; otherwise constructing one throws.
const WORKER_STUB = 'data:text/javascript,export default class LayoutWorkerStub { constructor() { const Impl = globalThis.__testLayoutWorker; if (!Impl) throw new Error("Layout worker is unavailable under node --test"); return new Impl(); } }';
const CSS_STUB = 'data:text/javascript,export default ""';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('?worker')) return { url: WORKER_STUB, shortCircuit: true };
  if (specifier.endsWith('.css')) return { url: CSS_STUB, shortCircuit: true };
  return nextResolve(specifier, context);
}
