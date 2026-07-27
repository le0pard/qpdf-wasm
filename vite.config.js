import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import adapter from '@sveltejs/adapter-static'

export default defineConfig({
	preprocess: [vitePreprocess()],
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: true
			},
			paths: {
				relative: false
			},
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				precompress: false,
				strict: true
			}),
			prerender: {
				origin: 'https://qpdf-wasm.leopard.in.ua'
			}
		})
	]
})
