import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync } from 'node:fs'
const favicon = `data:image/svg+xml;base64,${Buffer.from(readFileSync('public/icon.svg')).toString('base64')}`
export default defineConfig({
  base: './',
  plugins: [react(), { name: 'portable-favicon', enforce: 'post', transformIndexHtml(html) { return html.replace('href="./icon.svg"', `href="${favicon}"`) } }, viteSingleFile()],
  build: { outDir: 'dist-portable', target: 'esnext', assetsInlineLimit: 100_000_000, cssCodeSplit: false },
})
