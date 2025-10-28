<script lang="ts">
	import spec from 'virtual:openapi-spec';

	const pathCount = Object.keys(spec.paths || {}).length;
	const schemaCount = Object.keys(spec.components?.schemas || {}).length;
</script>

<svelte:head>
	<title>SvelteKit OpenAPI Generator Demo</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-indigo-600 to-purple-700">
	<div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<header class="text-center text-white mb-12">
			<h1 class="text-5xl font-bold mb-3 drop-shadow-lg">🚀 SvelteKit OpenAPI Generator</h1>
			<p class="text-xl opacity-90">Auto-generate OpenAPI specs from your SvelteKit endpoints</p>
		</header>

		<!-- Stats Cards -->
		<section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div
				class="bg-white rounded-xl shadow-lg p-6 text-center transform transition hover:scale-105"
			>
				<div class="text-5xl font-bold text-indigo-600 mb-2">{pathCount}</div>
				<div class="text-gray-600 text-sm font-semibold uppercase tracking-wide">API Endpoints</div>
			</div>
			<div
				class="bg-white rounded-xl shadow-lg p-6 text-center transform transition hover:scale-105"
			>
				<div class="text-5xl font-bold text-indigo-600 mb-2">{schemaCount}</div>
				<div class="text-gray-600 text-sm font-semibold uppercase tracking-wide">Schemas</div>
			</div>
			<div
				class="bg-white rounded-xl shadow-lg p-6 text-center transform transition hover:scale-105"
			>
				<div class="text-5xl font-bold text-indigo-600 mb-2">{spec.info.version}</div>
				<div class="text-gray-600 text-sm font-semibold uppercase tracking-wide">Version</div>
			</div>
		</section>

		<!-- Info Section -->
		<section class="bg-white rounded-xl shadow-lg p-8 mb-8">
			<h2 class="text-3xl font-bold text-gray-800 mb-4">📚 {spec.info.title}</h2>
			<p class="text-gray-600 text-lg">{spec.info.description}</p>
		</section>

		<!-- Endpoints Section -->
		<section class="bg-white rounded-xl shadow-lg p-8 mb-8">
			<h2 class="text-3xl font-bold text-gray-800 mb-6">🔗 Available Endpoints</h2>
			<div class="space-y-8">
				{#each Object.entries(spec.paths || {}) as [path, operations]}
					{#if operations}
						<div class="border-l-4 border-indigo-600 pl-4">
							<h3 class="text-indigo-600 font-mono text-lg font-semibold mb-4">{path}</h3>
							<div class="space-y-3">
								{#each Object.entries(operations) as [method, operation]}
									{#if typeof operation === 'object' && 'summary' in operation}
										<div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
											<span
												class="px-3 py-1 rounded text-white text-xs font-bold uppercase shrink-0
												{method.toLowerCase() === 'get'
													? 'bg-blue-500'
													: method.toLowerCase() === 'post'
														? 'bg-green-500'
														: method.toLowerCase() === 'put'
															? 'bg-orange-500'
															: method.toLowerCase() === 'delete'
																? 'bg-red-500'
																: 'bg-gray-500'}"
											>
												{method.toUpperCase()}
											</span>
											<div class="flex-1">
												<div class="font-semibold text-gray-800">
													{operation.summary || 'No summary'}
												</div>
												{#if operation.description}
													<div class="text-sm text-gray-600 mt-1">{operation.description}</div>
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

		<!-- Schemas Section -->
		<section class="bg-white rounded-xl shadow-lg p-8 mb-8">
			<h2 class="text-3xl font-bold text-gray-800 mb-6">📋 Schemas</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each Object.entries(spec.components?.schemas || {}) as [name, schema]}
					<div class="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 transition">
						<h3 class="text-xl font-mono font-semibold text-indigo-600 mb-4">{name}</h3>
						{#if typeof schema === 'object' && 'properties' in schema}
							<ul class="space-y-2">
								{#each Object.entries(schema.properties || {}) as [propName, prop]}
									<li class="flex items-center gap-2 pb-2 border-b border-gray-100 last:border-0">
										<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
											{propName}
										</code>
										{#if typeof prop === 'object' && 'type' in prop}
											<span class="text-gray-600 text-sm">: {prop.type}</span>
										{/if}
										{#if schema.required?.includes(propName)}
											<span
												class="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-semibold uppercase"
											>
												required
											</span>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<!-- Links Section -->
		<section class="bg-white rounded-xl shadow-lg p-8 mb-8">
			<h2 class="text-3xl font-bold text-gray-800 mb-6">🔍 View OpenAPI Spec</h2>
			<div class="flex flex-wrap gap-4">
				<a
					href="/docs"
					class="inline-block bg-linear-to-r from-indigo-600 to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition"
				>
					📖 Interactive API Docs (Swagger UI)
				</a>
				<a
					href="/openapi-spec.json"
					target="_blank"
					class="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transform hover:-translate-y-1 transition"
				>
					View JSON (Dev Mode)
				</a>
				<a
					href="/openapi.json"
					target="_blank"
					class="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transform hover:-translate-y-1 transition"
				>
					View JSON (Build)
				</a>
			</div>
		</section>

		<!-- Raw Spec Section -->
		<section class="bg-gray-900 rounded-xl shadow-lg p-8">
			<details class="group">
				<summary class="cursor-pointer select-none list-none">
					<h2 class="text-3xl font-bold text-white inline">📄 Raw OpenAPI Specification</h2>
					<span class="text-gray-400 ml-2 text-sm group-open:hidden">(click to expand)</span>
					<span class="text-gray-400 ml-2 text-sm hidden group-open:inline"
						>(click to collapse)</span
					>
				</summary>
				<pre
					class="mt-4 bg-gray-950 text-gray-200 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed font-mono">{JSON.stringify(
						spec,
						null,
						2
					)}</pre>
			</details>
		</section>
	</div>
</div>
