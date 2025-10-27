import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import openapiPlugin from './src/lib/index.js';

export default defineConfig({
	plugins: [
		openapiPlugin({
			baseSchemasPath: 'src/lib/schemas.js',
			prependPath: '',
			info: {
				title: 'SvelteKit OpenAPI Generator Demo',
				version: '1.0.0',
				description: 'Demo API showing OpenAPI spec generation from SvelteKit endpoints'
			},
			servers: [
				{
					url: 'http://localhost:5173',
					description: 'Development server'
				}
			],
			outputPath: 'static/openapi.json',
			debounceMs: 100
		}),
		sveltekit()
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
