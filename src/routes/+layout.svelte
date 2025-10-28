<script lang="ts">
	import '../app.css';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { page } from '$app/state';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

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
		class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95"
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
							class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 {currentPath ===
							'/'
								? 'bg-gray-100 dark:bg-gray-800'
								: ''}"
						>
							Home
						</a>
						<a
							href="/docs"
							class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 {currentPath ===
							'/docs'
								? 'bg-gray-100 dark:bg-gray-800'
								: ''}"
						>
							API Docs
						</a>
						<a
							href="/api/todos"
							target="_blank"
							class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							API
						</a>
					</nav>
				</div>

				<!-- Theme Toggle Button -->
				<button
					onclick={toggleMode}
					class="relative inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
					aria-label="Toggle theme"
				>
					<SunIcon
						class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
					/>
					<MoonIcon
						class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</button>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main>
		{@render children()}
	</main>

	<!-- Footer -->
	<footer
		class="mt-12 border-t border-gray-200 bg-gray-50 py-6 dark:border-gray-800 dark:bg-gray-900"
	>
		<div class="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
			<p>Built with SvelteKit, TypeScript, and Tailwind CSS</p>
		</div>
	</footer>
</div>
