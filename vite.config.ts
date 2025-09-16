import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), devtoolsJson(), tailwindcss()],
	build: {
		rollupOptions: {
			external: ['@internationalized/date'],
		},
	},
});
