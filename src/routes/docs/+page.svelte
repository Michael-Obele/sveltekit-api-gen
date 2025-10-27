<script lang="ts">
	import { onMount } from 'svelte';
	import spec from 'virtual:openapi-spec';
	import 'swagger-ui-dist/swagger-ui.css';

	let containerElement: HTMLElement;

	// Debug: Log the spec to see what we're getting
	console.log('Loaded spec:', spec);
	console.log('Spec paths:', spec.paths);
	console.log('Path count:', Object.keys(spec.paths || {}).length);

	onMount(async () => {
		if (!containerElement) {
			console.error('Container element not found!');
			return;
		}

		try {
			// @ts-ignore - swagger-ui-dist doesn't have types
			const { SwaggerUIBundle, SwaggerUIStandalonePreset } = await import('swagger-ui-dist');

			console.log('Initializing Swagger UI with spec:', spec);

			SwaggerUIBundle({
				spec: spec,
				domNode: containerElement,
				deepLinking: true,
				presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset]
			});

			console.log('Swagger UI initialized');
		} catch (error) {
			console.error('Failed to initialize Swagger UI:', error);
		}
	});
</script>

<svelte:head>
	<title>API Documentation - Swagger UI</title>
	<meta name="description" content="Interactive API documentation for this SvelteKit application" />
</svelte:head>

<div class="docs-page">
	<header class="header">
		<h1>API Documentation</h1>
		<p class="subtitle">Explore and test the API endpoints</p>
	</header>

	<!-- Debug: Show if spec is loaded -->
	{#if spec}
		<div style="padding: 1rem; background: #e0f7fa; margin: 1rem;">
			<strong>Debug:</strong> Spec loaded with {Object.keys(spec.paths || {}).length} paths
		</div>
	{:else}
		<div style="padding: 1rem; background: #ffebee; margin: 1rem;">
			<strong>Error:</strong> No spec loaded
		</div>
	{/if}

	<div id="swagger-ui-container" bind:this={containerElement}></div>
</div>

<style>
	.docs-page {
		min-height: 100vh;
		background: #fafafa;
	}

	.header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 2rem;
		text-align: center;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.header h1 {
		margin: 0;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.subtitle {
		margin: 0.5rem 0 0 0;
		font-size: 1.1rem;
		opacity: 0.9;
	}

	#swagger-ui-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	/* Override some Swagger UI styles for better integration */
	:global(.swagger-ui .topbar) {
		display: none;
	}

	:global(.swagger-ui .information-container) {
		margin: 2rem 0;
	}
</style>
