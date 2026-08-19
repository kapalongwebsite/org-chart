import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Library build with five entry points:
//   .         -> core engine + vanilla factory (no CSS side-effect)
//   ./core    -> framework-independent layout engine
//   ./vanilla -> plain-JS DOM renderer (pulls in CSS)
//   ./vue     -> Vue 3 component + plugin (pulls in CSS; Vue is external)
//   ./print   -> deterministic physical-canvas print layout + PDF exporter
// CSS is emitted once as dist/local-org-chart.css (cssCodeSplit: false).
export default defineConfig({
  // Library assets (including the layout worker) must resolve beside the
  // installed bundle, not from the consuming application's domain root.
  base: './',
  build: {
    cssCodeSplit: false,
    sourcemap: false,
    emptyOutDir: true,
    lib: {
      entry: {
        'local-org-chart': resolve(__dirname, 'src/index.js'),
        core: resolve(__dirname, 'src/core/index.js'),
        vanilla: resolve(__dirname, 'src/vanilla/index.js'),
        vue: resolve(__dirname, 'src/vue/index.js'),
        print: resolve(__dirname, 'src/print/index.js'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, name) => `${name}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // Vue is a peer dependency — never bundle it into the output.
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        assetFileNames: (asset) =>
          asset.name && asset.name.endsWith('.css')
            ? 'local-org-chart.css'
            : 'assets/[name][extname]',
      },
    },
  },
});
