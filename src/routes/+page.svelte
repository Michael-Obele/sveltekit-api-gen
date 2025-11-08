<script lang="ts">
	import spec from 'virtual:openapi-spec';
	import RocketIcon from '@lucide/svelte/icons/rocket';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import PackageIcon from '@lucide/svelte/icons/package';
	import CodeIcon from '@lucide/svelte/icons/code';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import GithubIcon from '@lucide/svelte/icons/github';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import FileCodeIcon from '@lucide/svelte/icons/file-code';

	const pathCount = Object.keys(spec.paths || {}).length;
	const schemaCount = Object.keys(spec.components?.schemas || {}).length;

	// State for copy buttons
	let copiedStates = $state({
		install: false,
		config: false,
		endpoint: false,
		schema: false
	});

	function copyToClipboard(text: string, key: keyof typeof copiedStates) {
		navigator.clipboard.writeText(text);
		copiedStates[key] = true;
		setTimeout(() => {
			copiedStates[key] = false;
		}, 2000);
	}

	const installCommand = 'npm install -D sveltekit-openapi-generator';

	const configExample = `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import openapiPlugin from 'sveltekit-openapi-generator';

export default defineConfig({
  plugins: [
    openapiPlugin({
      baseSchemasPath: 'src/lib/schemas.js',
      prependPath: '/api',
      outputPath: 'static/openapi.json'
    }),
    sveltekit()
  ]
});`;

	const endpointExample = `/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export async function GET({ url }) {
  const users = await db.getUsers();
  return json({ users });
}`;

	const schemaExample = `/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 */`;

	const features = [
		{
			icon: RefreshCwIcon,
			title: 'Hot Module Replacement',
			description:
				'Specs update live as you edit JSDoc comments. See changes instantly in dev mode.'
		},
		{
			icon: PackageIcon,
			title: 'Virtual Module',
			description:
				'Import spec directly with import spec from "virtual:openapi-spec". No file I/O needed.'
		},
		{
			icon: ZapIcon,
			title: 'Smart Merging',
			description:
				'Combines multiple specs intelligently using openapi-merge for unified documentation.'
		},
		{
			icon: ShieldCheckIcon,
			title: 'TypeScript Support',
			description:
				'Full type support with automatic type stripping for .ts files. Type-safe by default.'
		},
		{
			icon: CodeIcon,
			title: 'SvelteKit Native',
			description:
				'Handles route parameters, groups, and optional segments automatically from file structure.'
		},
		{
			icon: BookOpenIcon,
			title: 'Swagger UI Ready',
			description: 'Easy integration with Swagger UI for beautiful, interactive API documentation.'
		}
	];
</script>

<svelte:head>
	<title>SvelteKit OpenAPI Generator - Auto-generate OpenAPI specs from SvelteKit endpoints</title>
	<meta
		name="description"
		content="Automatically generate OpenAPI 3.0 specifications from your SvelteKit server endpoints using JSDoc @swagger annotations. Hot Module Replacement, TypeScript support, and more."
	/>
</svelte:head>

<!-- Hero Section -->
<section
	class="relative overflow-hidden bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900"
>
	<div class="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center text-white">
			<div
				class="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur"
			>
				<RocketIcon class="h-4 w-4" />
				<span>Auto-generate OpenAPI 3.0 specs from your SvelteKit endpoints</span>
			</div>

			<h1 class="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
				SvelteKit OpenAPI<br />Generator
			</h1>

			<p class="mb-10 text-xl opacity-95 sm:text-2xl">
				Document your APIs effortlessly with JSDoc annotations.<br />
				Live updates, TypeScript support, and zero configuration needed.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<a
					href="#installation"
					class="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-lg transition hover:scale-105 hover:shadow-xl dark:bg-gray-900 dark:text-indigo-400"
				>
					<TerminalIcon class="h-5 w-5" />
					Get Started
				</a>
				<a
					href="/docs"
					class="inline-flex items-center gap-2 rounded-lg border-2 border-white bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20"
				>
					<BookOpenIcon class="h-5 w-5" />
					View Demo Docs
				</a>
				<a
					href="https://github.com/Michael-Obele/sveltekit-api-gen"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-lg border-2 border-white bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20"
				>
					<GithubIcon class="h-5 w-5" />
					View on GitHub
				</a>
			</div>
		</div>
	</div>

	<!-- Stats Banner -->
	<div class="border-t border-white/20 bg-white/10 backdrop-blur">
		<div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-6 text-center text-white sm:grid-cols-3">
				<div>
					<div class="text-4xl font-bold">{pathCount}</div>
					<div class="mt-1 text-sm opacity-90">API Endpoints (Demo)</div>
				</div>
				<div>
					<div class="text-4xl font-bold">{schemaCount}</div>
					<div class="mt-1 text-sm opacity-90">Schemas (Demo)</div>
				</div>
				<div>
					<div class="text-4xl font-bold">{spec.info.version}</div>
					<div class="mt-1 text-sm opacity-90">API Version</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="bg-gray-50 py-20 dark:bg-gray-900">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mb-16 text-center">
			<h2 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
				Powerful Features Out of the Box
			</h2>
			<p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
				Everything you need to create professional API documentation for your SvelteKit applications
			</p>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each features as feature (feature.title)}
				<div
					class="group rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-indigo-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950 dark:hover:border-indigo-700"
				>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900 dark:text-indigo-400 dark:group-hover:bg-indigo-600"
					>
						<feature.icon class="h-6 w-6" />
					</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						{feature.title}
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						{feature.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Installation Section -->
<section id="installation" class="py-20">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Quick Installation</h2>
				<p class="text-lg text-gray-600 dark:text-gray-400">
					Get started in minutes with npm, yarn, or pnpm
				</p>
			</div>

			<!-- Install Command -->
			<div class="mb-8">
				<div
					class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700"
				>
					<div
						class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2"
					>
						<span class="text-sm font-medium text-gray-300">Terminal</span>
						<button
							onclick={() => copyToClipboard(installCommand, 'install')}
							class="inline-flex items-center gap-2 rounded px-3 py-1 text-sm text-gray-300 transition hover:bg-gray-700"
						>
							{#if copiedStates.install}
								<CheckIcon class="h-4 w-4 text-green-400" />
								<span>Copied!</span>
							{:else}
								<CopyIcon class="h-4 w-4" />
								<span>Copy</span>
							{/if}
						</button>
					</div>
					<pre class="overflow-x-auto p-4"><code class="text-sm text-gray-100"
							>{installCommand}</code
						></pre>
				</div>
			</div>

			<!-- Steps -->
			<div class="space-y-8">
				<!-- Step 1: Configure Plugin -->
				<div>
					<div class="mb-4 flex items-start gap-4">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
						>
							1
						</div>
						<div>
							<h3 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
								Configure the Plugin
							</h3>
							<p class="text-gray-600 dark:text-gray-400">
								Add the plugin to your <code
									class="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800"
									>vite.config.js</code
								> before the SvelteKit plugin
							</p>
						</div>
					</div>
					<div
						class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700"
					>
						<div
							class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2"
						>
							<span class="flex items-center gap-2 text-sm font-medium text-gray-300">
								<FileCodeIcon class="h-4 w-4" />
								vite.config.js
							</span>
							<button
								onclick={() => copyToClipboard(configExample, 'config')}
								class="inline-flex items-center gap-2 rounded px-3 py-1 text-sm text-gray-300 transition hover:bg-gray-700"
							>
								{#if copiedStates.config}
									<CheckIcon class="h-4 w-4 text-green-400" />
									<span>Copied!</span>
								{:else}
									<CopyIcon class="h-4 w-4" />
									<span>Copy</span>
								{/if}
							</button>
						</div>
						<pre class="overflow-x-auto p-4"><code class="text-sm text-gray-100"
								>{configExample}</code
							></pre>
					</div>
				</div>

				<!-- Step 2: Document Endpoints -->
				<div>
					<div class="mb-4 flex items-start gap-4">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
						>
							2
						</div>
						<div>
							<h3 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
								Document Your Endpoints
							</h3>
							<p class="text-gray-600 dark:text-gray-400">
								Add <code class="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800"
									>@swagger</code
								> JSDoc blocks to your server files
							</p>
						</div>
					</div>
					<div
						class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700"
					>
						<div
							class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2"
						>
							<span class="flex items-center gap-2 text-sm font-medium text-gray-300">
								<FileCodeIcon class="h-4 w-4" />
								src/routes/api/users/+server.js
							</span>
							<button
								onclick={() => copyToClipboard(endpointExample, 'endpoint')}
								class="inline-flex items-center gap-2 rounded px-3 py-1 text-sm text-gray-300 transition hover:bg-gray-700"
							>
								{#if copiedStates.endpoint}
									<CheckIcon class="h-4 w-4 text-green-400" />
									<span>Copied!</span>
								{:else}
									<CopyIcon class="h-4 w-4" />
									<span>Copy</span>
								{/if}
							</button>
						</div>
						<pre class="overflow-x-auto p-4"><code class="text-sm text-gray-100"
								>{endpointExample}</code
							></pre>
					</div>
				</div>

				<!-- Step 3: Define Schemas -->
				<div>
					<div class="mb-4 flex items-start gap-4">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
						>
							3
						</div>
						<div>
							<h3 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
								Define Shared Schemas (Optional)
							</h3>
							<p class="text-gray-600 dark:text-gray-400">
								Create reusable component schemas to avoid duplication
							</p>
						</div>
					</div>
					<div
						class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700"
					>
						<div
							class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2"
						>
							<span class="flex items-center gap-2 text-sm font-medium text-gray-300">
								<FileCodeIcon class="h-4 w-4" />
								src/lib/schemas.js
							</span>
							<button
								onclick={() => copyToClipboard(schemaExample, 'schema')}
								class="inline-flex items-center gap-2 rounded px-3 py-1 text-sm text-gray-300 transition hover:bg-gray-700"
							>
								{#if copiedStates.schema}
									<CheckIcon class="h-4 w-4 text-green-400" />
									<span>Copied!</span>
								{:else}
									<CopyIcon class="h-4 w-4" />
									<span>Copy</span>
								{/if}
							</button>
						</div>
						<pre class="overflow-x-auto p-4"><code class="text-sm text-gray-100"
								>{schemaExample}</code
							></pre>
					</div>
				</div>
			</div>

			<!-- Success Message -->
			<div
				class="mt-12 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950"
			>
				<div class="flex items-start gap-4">
					<CheckIcon class="h-6 w-6 shrink-0 text-green-600 dark:text-green-400" />
					<div>
						<h4 class="mb-2 text-lg font-semibold text-green-900 dark:text-green-100">
							You're all set!
						</h4>
						<p class="text-green-700 dark:text-green-300">
							Your OpenAPI spec is now available at <code
								class="rounded bg-green-100 px-2 py-1 text-sm dark:bg-green-900"
								>/openapi-spec.json</code
							>
							during development. Import it with
							<code class="rounded bg-green-100 px-2 py-1 text-sm dark:bg-green-900"
								>import spec from 'virtual:openapi-spec'</code
							> in your components.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Live Demo Section -->
<section class="bg-gray-50 py-20 dark:bg-gray-900">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">See It In Action</h2>
			<p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
				This website itself is built with SvelteKit OpenAPI Generator. Explore the generated
				documentation and API endpoints.
			</p>
		</div>

		<div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
			<a
				href="/docs"
				class="group block rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-indigo-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950 dark:hover:border-indigo-700"
			>
				<div
					class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900 dark:text-indigo-400 dark:group-hover:bg-indigo-600"
				>
					<BookOpenIcon class="h-6 w-6" />
				</div>
				<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
					Interactive API Docs
				</h3>
				<p class="text-gray-600 dark:text-gray-400">
					Explore the Swagger UI powered by the auto-generated OpenAPI spec
				</p>
			</a>

			<a
				href="/openapi-spec.json"
				target="_blank"
				rel="noopener noreferrer"
				class="group block rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-indigo-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950 dark:hover:border-indigo-700"
			>
				<div
					class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900 dark:text-indigo-400 dark:group-hover:bg-indigo-600"
				>
					<CodeIcon class="h-6 w-6" />
				</div>
				<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">View Raw Spec</h3>
				<p class="text-gray-600 dark:text-gray-400">
					See the generated OpenAPI 3.0 JSON specification
				</p>
			</a>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section
	class="bg-linear-to-br from-indigo-600 to-purple-600 py-20 dark:from-indigo-900 dark:to-purple-900"
>
	<div class="container mx-auto px-4 text-center sm:px-6 lg:px-8">
		<h2 class="mb-6 text-4xl font-bold text-white">Ready to Get Started?</h2>
		<p class="mb-10 text-xl text-white/90">
			Join developers who are already using SvelteKit OpenAPI Generator
		</p>
		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<a
				href="https://www.npmjs.com/package/sveltekit-openapi-generator"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-lg transition hover:scale-105 hover:shadow-xl"
			>
				<PackageIcon class="h-5 w-5" />
				View on NPM
			</a>
			<a
				href="https://github.com/Michael-Obele/sveltekit-api-gen"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-lg border-2 border-white bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20"
			>
				<GithubIcon class="h-5 w-5" />
				Star on GitHub
			</a>
		</div>
	</div>
</section>
