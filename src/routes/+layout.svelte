<script lang="ts">
	import '../app.css';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { page } from '$app/state';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import GithubIcon from '@lucide/svelte/icons/github';
	import PackageIcon from '@lucide/svelte/icons/package';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import HeartIcon from '@lucide/svelte/icons/heart';

	let { children } = $props();

	// Derive current path for active link styling
	let currentPath = $derived(page.url.pathname);
</script>

<ModeWatcher />

<div
	class="min-h-screen bg-white text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100"
>
	<!-- Navigation Header -->
	<header
		class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:border-gray-800 dark:bg-gray-950/95 dark:supports-backdrop-filter:bg-gray-950/80"
	>
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<!-- Logo and Site Title -->
				<div class="flex items-center gap-6">
					<a
						href="/"
						class="flex items-center space-x-2 text-xl font-bold transition hover:opacity-80"
					>
						<span class="text-2xl">🚀</span>
						<span
							class="hidden bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent sm:inline dark:from-indigo-400 dark:to-purple-400"
						>
							SvelteKit OpenAPI
						</span>
					</a>

					<!-- Navigation Links -->
					<nav class="hidden items-center gap-1 md:flex">
						<a
							href="/"
							class={{
								'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800': true,
								'bg-gray-100 dark:bg-gray-800': currentPath === '/'
							}}
						>
							Home
						</a>
						<a
							href="/docs"
							class={{
								'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800': true,
								'bg-gray-100 dark:bg-gray-800': currentPath === '/docs'
							}}
						>
							API Docs
						</a>
						<a
							href="/api/todos"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							Demo API
						</a>
					</nav>
				</div>

				<!-- Right Side Actions -->
				<div class="flex items-center gap-2">
					<!-- GitHub Link -->
					<a
						href="https://github.com/Michael-Obele/sveltekit-api-gen"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
						aria-label="View on GitHub"
					>
						<GithubIcon class="h-5 w-5" />
					</a>

					<!-- NPM Link -->
					<a
						href="https://www.npmjs.com/package/sveltekit-openapi-generator"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
						aria-label="View on NPM"
					>
						<PackageIcon class="h-5 w-5" />
					</a>

					<!-- Theme Toggle Button -->
					<button
						onclick={toggleMode}
						class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
						aria-label="Toggle theme"
					>
						<SunIcon
							class="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
						/>
						<MoonIcon
							class="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
						/>
						<span class="sr-only">Toggle theme</span>
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main>
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
		<div class="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				<!-- About -->
				<div>
					<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
						<span class="text-2xl">🚀</span>
						SvelteKit OpenAPI
					</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Automatically generate OpenAPI 3.0 specifications from your SvelteKit server endpoints
						using JSDoc annotations.
					</p>
				</div>

				<!-- Resources -->
				<div>
					<h3 class="mb-4 text-lg font-semibold">Resources</h3>
					<ul class="space-y-2 text-sm">
						<li>
							<a
								href="/docs"
								class="flex items-center gap-2 text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
							>
								<BookOpenIcon class="h-4 w-4" />
								API Documentation
							</a>
						</li>
						<li>
							<a
								href="https://github.com/Michael-Obele/sveltekit-api-gen"
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-2 text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
							>
								<GithubIcon class="h-4 w-4" />
								GitHub Repository
							</a>
						</li>
						<li>
							<a
								href="https://www.npmjs.com/package/sveltekit-openapi-generator"
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-2 text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
							>
								<PackageIcon class="h-4 w-4" />
								NPM Package
							</a>
						</li>
					</ul>
				</div>

				<!-- Links -->
				<div>
					<h3 class="mb-4 text-lg font-semibold">Community</h3>
					<ul class="space-y-2 text-sm">
						<li>
							<a
								href="https://github.com/Michael-Obele/sveltekit-api-gen/issues"
								target="_blank"
								rel="noopener noreferrer"
								class="text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
							>
								Report Issues
							</a>
						</li>
						<li>
							<a
								href="https://github.com/Michael-Obele/sveltekit-api-gen/discussions"
								target="_blank"
								rel="noopener noreferrer"
								class="text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
							>
								Discussions
							</a>
						</li>
						<li>
							<a
								href="https://github.com/Michael-Obele"
								target="_blank"
								rel="noopener noreferrer"
								class="text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
							>
								About Author
							</a>
						</li>
					</ul>
				</div>
			</div>

			<!-- Bottom Bar -->
			<div
				class="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 text-sm text-gray-600 sm:flex-row dark:border-gray-800 dark:text-gray-400"
			>
				<p>
					Built with
					<HeartIcon class="mx-1 inline h-4 w-4 text-red-500" />
					using SvelteKit, TypeScript, and Tailwind CSS
				</p>
				<p>
					MIT License © 2024
					<a
						href="https://github.com/Michael-Obele"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
					>
						Michael Obele
					</a>
				</p>
			</div>
		</div>
	</footer>
</div>
