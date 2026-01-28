const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: '[name].cjs', 
      },
    },
  },
});