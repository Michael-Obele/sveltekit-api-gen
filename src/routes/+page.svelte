<script lang="ts">
	import spec from 'virtual:openapi-spec';

	const pathCount = Object.keys(spec.paths || {}).length;
	const schemaCount = Object.keys(spec.components?.schemas || {}).length;
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>

<svelte:head>
	<title>SvelteKit OpenAPI Generator Demo</title>
</svelte:head>

<div class="container">
	<header>
		<h1>🚀 SvelteKit OpenAPI Generator</h1>
		<p class="subtitle">Auto-generate OpenAPI specs from your SvelteKit endpoints</p>
	</header>

	<section class="stats">
		<div class="stat-card">
			<div class="stat-value">{pathCount}</div>
			<div class="stat-label">API Endpoints</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{schemaCount}</div>
			<div class="stat-label">Schemas</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{spec.info.version}</div>
			<div class="stat-label">Version</div>
		</div>
	</section>

	<section class="info">
		<h2>📚 {spec.info.title}</h2>
		<p>{spec.info.description}</p>
	</section>

	<section class="endpoints">
		<h2>🔗 Available Endpoints</h2>
		<div class="endpoint-list">
			{#each Object.entries(spec.paths || {}) as [path, operations]}
				{#if operations}
					<div class="endpoint-group">
						<h3 class="path">{path}</h3>
						<div class="methods">
							{#each Object.entries(operations) as [method, operation]}
								{#if typeof operation === 'object' && 'summary' in operation}
									<div class="method-card {method.toLowerCase()}">
										<span class="method-badge">{method.toUpperCase()}</span>
										<div class="method-info">
											<div class="method-summary">{operation.summary || 'No summary'}</div>
											{#if operation.description}
												<div class="method-description">{operation.description}</div>
											{/if}
										</div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</section>

	<section class="schemas">
		<h2>📋 Schemas</h2>
		<div class="schema-list">
			{#each Object.entries(spec.components?.schemas || {}) as [name, schema]}
				<div class="schema-card">
					<h3>{name}</h3>
					{#if typeof schema === 'object' && 'properties' in schema}
						<ul class="properties">
							{#each Object.entries(schema.properties || {}) as [propName, prop]}
								<li>
									<code>{propName}</code>
									{#if typeof prop === 'object' && 'type' in prop}
										<span class="type">: {prop.type}</span>
									{/if}
									{#if schema.required?.includes(propName)}
										<span class="required">required</span>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<section class="links">
		<h2>🔍 View OpenAPI Spec</h2>
		<div class="link-buttons">
			<a href="/docs" class="button primary">📖 Interactive API Docs (Swagger UI)</a>
			<a href="/openapi-spec.json" target="_blank" class="button">View JSON (Dev Mode)</a>
			<a href="/openapi.json" target="_blank" class="button">View JSON (Build)</a>
		</div>
	</section>

	<section class="raw-spec">
		<details>
			<summary><h2>📄 Raw OpenAPI Specification</h2></summary>
			<pre>{JSON.stringify(spec, null, 2)}</pre>
		</details>
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		color: white;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 3rem;
		margin: 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.subtitle {
		font-size: 1.25rem;
		opacity: 0.9;
		margin-top: 0.5rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.stat-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		text-align: center;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.stat-value {
		font-size: 3rem;
		font-weight: bold;
		color: #667eea;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		color: #666;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	section {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	h2 {
		margin-top: 0;
		color: #333;
	}

	.endpoint-list {
		margin-top: 1.5rem;
	}

	.endpoint-group {
		margin-bottom: 2rem;
		border-left: 3px solid #667eea;
		padding-left: 1rem;
	}

	.path {
		color: #667eea;
		font-family: 'Courier New', monospace;
		font-size: 1.1rem;
		margin: 0 0 1rem 0;
	}

	.methods {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.method-card {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		border-radius: 8px;
		background: #f8f9fa;
	}

	.method-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-weight: bold;
		font-size: 0.75rem;
		color: white;
		flex-shrink: 0;
	}

	.method-card.get .method-badge {
		background: #61affe;
	}
	.method-card.post .method-badge {
		background: #49cc90;
	}
	.method-card.put .method-badge {
		background: #fca130;
	}
	.method-card.delete .method-badge {
		background: #f93e3e;
	}

	.method-info {
		flex: 1;
	}

	.method-summary {
		font-weight: 600;
		color: #333;
	}

	.method-description {
		font-size: 0.875rem;
		color: #666;
		margin-top: 0.25rem;
	}

	.schema-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	.schema-card {
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.schema-card h3 {
		margin: 0 0 1rem 0;
		color: #667eea;
		font-family: 'Courier New', monospace;
	}

	.properties {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.properties li {
		padding: 0.5rem 0;
		border-bottom: 1px solid #f0f0f0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.properties li:last-child {
		border-bottom: none;
	}

	.properties code {
		background: #f8f9fa;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.type {
		color: #666;
		font-size: 0.875rem;
	}

	.required {
		background: #fef3c7;
		color: #92400e;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.link-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}

	.button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #667eea;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.2s;
	}

	.button.primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		font-size: 1.1rem;
		padding: 1rem 2rem;
	}

	.button:hover {
		background: #5568d3;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.button.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
	}

	.raw-spec {
		background: #1e293b;
	}

	.raw-spec summary {
		cursor: pointer;
		user-select: none;
	}

	.raw-spec summary h2 {
		color: white;
		display: inline;
	}

	.raw-spec pre {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.6;
	}
</style>
