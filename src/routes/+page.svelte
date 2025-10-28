<script lang="ts">
	import spec from 'virtual:openapi-spec';

	const pathCount = Object.keys(spec.paths || {}).length;
	const schemaCount = Object.keys(spec.components?.schemas || {}).length;
</script>

<svelte:head>
	<title>SvelteKit OpenAPI Generator Demo</title>
</svelte:head>

<div
	class="bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900"
>
	<div class="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
		<!-- Hero Section -->
		<header class="mb-12 text-center text-white">
			<h1 class="mb-3 text-5xl font-bold drop-shadow-lg">🚀 SvelteKit OpenAPI Generator</h1>
			<p class="text-xl opacity-90">Auto-generate OpenAPI specs from your SvelteKit endpoints</p>
		</header>

		<!-- Stats Cards -->
		<section class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
			<div
				class="transform rounded-xl bg-white p-6 text-center shadow-lg transition hover:scale-105 dark:bg-gray-800"
			>
				<div class="mb-2 text-5xl font-bold text-indigo-600 dark:text-indigo-400">{pathCount}</div>
				<div class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
					API Endpoints
				</div>
			</div>
			<div
				class="transform rounded-xl bg-white p-6 text-center shadow-lg transition hover:scale-105 dark:bg-gray-800"
			>
				<div class="mb-2 text-5xl font-bold text-indigo-600 dark:text-indigo-400">
					{schemaCount}
				</div>
				<div class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
					Schemas
				</div>
			</div>
			<div
				class="transform rounded-xl bg-white p-6 text-center shadow-lg transition hover:scale-105 dark:bg-gray-800"
			>
				<div class="mb-2 text-5xl font-bold text-indigo-600 dark:text-indigo-400">
					{spec.info.version}
				</div>
				<div class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
					Version
				</div>
			</div>
		</section>

		<!-- Info Section -->
		<section class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
			<h2 class="mb-4 text-3xl font-bold text-gray-800 dark:text-white">📚 {spec.info.title}</h2>
			<p class="text-lg text-gray-600 dark:text-gray-300">{spec.info.description}</p>
		</section>

		<!-- Endpoints Section -->
		<section class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-800 dark:text-white">🔗 Available Endpoints</h2>
			<div class="space-y-8">
				{#each Object.entries(spec.paths || {}) as [path, operations]}
					{#if operations}
						<div class="border-l-4 border-indigo-600 pl-4 dark:border-indigo-400">
							<h3 class="mb-4 font-mono text-lg font-semibold text-indigo-600 dark:text-indigo-400">
								{path}
							</h3>
							<div class="space-y-3">
								{#each Object.entries(operations) as [method, operation]}
									{#if typeof operation === 'object' && 'summary' in operation}
										<div class="flex items-start gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
											<span
												class="shrink-0 rounded px-3 py-1 text-xs font-bold text-white uppercase
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
												<div class="font-semibold text-gray-800 dark:text-white">
													{operation.summary || 'No summary'}
												</div>
												{#if operation.description}
													<div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
														{operation.description}
													</div>
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
		<section class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-800 dark:text-white">📋 Schemas</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				{#each Object.entries(spec.components?.schemas || {}) as [name, schema]}
					<div
						class="rounded-lg border-2 border-gray-200 p-6 transition hover:border-indigo-400 dark:border-gray-600 dark:hover:border-indigo-500"
					>
						<h3 class="mb-4 font-mono text-xl font-semibold text-indigo-600 dark:text-indigo-400">
							{name}
						</h3>
						{#if typeof schema === 'object' && 'properties' in schema}
							<ul class="space-y-2">
								{#each Object.entries(schema.properties || {}) as [propName, prop]}
									<li
										class="flex items-center gap-2 border-b border-gray-100 pb-2 last:border-0 dark:border-gray-700"
									>
										<code class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">
											{propName}
										</code>
										{#if typeof prop === 'object' && 'type' in prop}
											<span class="text-sm text-gray-600 dark:text-gray-400">: {prop.type}</span>
										{/if}
										{#if schema.required?.includes(propName)}
											<span
												class="rounded bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800 uppercase dark:bg-yellow-900 dark:text-yellow-200"
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
		<section class="mb-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-800 dark:text-white">🔍 View OpenAPI Spec</h2>
			<div class="flex flex-wrap gap-4">
				<a
					href="/docs"
					class="inline-block transform rounded-lg bg-linear-to-r from-indigo-600 to-purple-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:from-indigo-500 dark:to-purple-600"
				>
					📖 Interactive API Docs (Swagger UI)
				</a>
				<a
					href="/openapi-spec.json"
					target="_blank"
					class="inline-block transform rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-1 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
				>
					View JSON (Dev Mode)
				</a>
				<a
					href="/openapi.json"
					target="_blank"
					class="inline-block transform rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-1 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
				>
					View JSON (Build)
				</a>
			</div>
		</section>

		<!-- Raw Spec Section -->
		<section class="rounded-xl bg-gray-900 p-8 shadow-lg dark:bg-gray-950">
			<details class="group">
				<summary class="cursor-pointer list-none select-none">
					<h2 class="inline text-3xl font-bold text-white">📄 Raw OpenAPI Specification</h2>
					<span class="ml-2 text-sm text-gray-400 group-open:hidden">(click to expand)</span>
					<span class="ml-2 hidden text-sm text-gray-400 group-open:inline"
						>(click to collapse)</span
					>
				</summary>
				<pre
					class="mt-4 overflow-x-auto rounded-lg bg-gray-950 p-6 font-mono text-sm leading-relaxed text-gray-200 dark:bg-black dark:text-gray-300">{JSON.stringify(
						spec,
						null,
						2
					)}</pre>
			</details>
		</section>
	</div>
</div>
