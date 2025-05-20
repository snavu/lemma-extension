import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  outDir: 'dist',
  manifest: {
    manifest_version: 3,
    name: 'Lemma Extension',
    version: '1.0.0',
    permissions: ['tabs', 'scripting'],
    host_permissions: ['<all_urls>'],
    background: {
      service_worker: 'background.js',
    },
  },
});
