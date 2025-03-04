import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    build: {
      rollupOptions: {
        external: ['wxt/storage'],
      },
    },
  }),
  extensionApi: 'chrome',
  manifest: {
    name: 'Rapidfire',
  },
  modules: ['@wxt-dev/module-react'],
})
