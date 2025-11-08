<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	import spec from 'virtual:openapi-spec';
	import 'swagger-ui-dist/swagger-ui.css';

	let containerElement: HTMLElement;

	// Get the current server URL reactively
	let currentOrigin = $derived(page.url.origin);

	// Create a modified spec with the current server URL
	let specWithServer = $derived({
		...spec,
		servers: [
			{
				url: currentOrigin,
				description: dev ? 'Development server' : 'Production server'
			}
		]
	});

	onMount(async () => {
		if (!containerElement) {
			console.error('Container element not found!');
			return;
		}

		try {
			// @ts-ignore - swagger-ui-dist doesn't have types
			const { SwaggerUIBundle, SwaggerUIStandalonePreset } = await import('swagger-ui-dist');

			SwaggerUIBundle({
				spec: specWithServer,
				domNode: containerElement,
				deepLinking: true,
				presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset]
			});
		} catch (error) {
			console.error('Failed to initialize Swagger UI:', error);
		}
	});
</script>

<svelte:head>
	<title>API Documentation - SvelteKit OpenAPI Generator</title>
	<meta
		name="description"
		content="Interactive API documentation for SvelteKit OpenAPI Generator. Explore and test the API endpoints with Swagger UI."
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
	<header
		class="bg-linear-to-br from-indigo-600 via-purple-600 to-purple-700 px-4 py-16 text-center text-white shadow-lg dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900"
	>
		<div class="container mx-auto">
			<h1 class="mb-4 text-5xl font-bold">API Documentation</h1>
			<p class="text-xl opacity-90">
				Explore and test the API endpoints interactively with Swagger UI
			</p>
			<div class="mt-6 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row">
				<div class="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur">
					<span class="font-semibold">Endpoints:</span>
					<span>{Object.keys(spec.paths || {}).length}</span>
				</div>
				<div class="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur">
					<span class="font-semibold">Schemas:</span>
					<span>{Object.keys(spec.components?.schemas || {}).length}</span>
				</div>
				<div class="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur">
					<span class="font-semibold">Version:</span>
					<span>{spec.info.version}</span>
				</div>
			</div>
		</div>
	</header>

	<div
		id="swagger-ui-container"
		class="mx-auto max-w-7xl p-4 sm:p-8"
		bind:this={containerElement}
	></div>
</div>

<style>
	/* Override some Swagger UI styles for better integration */
	:global(.swagger-ui .topbar) {
		display: none;
	}

	:global(.swagger-ui .information-container) {
		margin: 2rem 0;
	}

	:global(.swagger-ui) {
		font-family: inherit;
	}

	/* Dark mode support for Swagger UI */
	:global(.dark .swagger-ui) {
		filter: invert(0.9) hue-rotate(180deg);
	}

	:global(.dark .swagger-ui .opblock-tag) {
		filter: invert(0.9) hue-rotate(180deg);
	}

	:global(.dark .swagger-ui .model-box) {
		filter: invert(0.9) hue-rotate(180deg);
	}
</style>
