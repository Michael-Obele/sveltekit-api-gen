import type { Plugin, ViteDevServer, ResolvedConfig } from 'vite';
import type { OpenAPIV3 } from 'openapi-types';
import { generateSpec, writeSpec, type GeneratorOptions } from './generator.js';
import { resolve } from 'path';
import { debounce } from 'lodash-es';

/**
 * Plugin options for the OpenAPI generator
 */
export interface OpenAPIPluginOptions {
	/**
	 * OpenAPI info section (title, version, description)
	 */
	info?: OpenAPIV3.InfoObject;
	/**
	 * OpenAPI servers configuration
	 */
	servers?: OpenAPIV3.ServerObject[];
	/**
	 * Path to file containing shared schema definitions
	 */
	baseSchemasPath?: string;
	/**
	 * Additional YAML files to include
	 */
	yamlFiles?: string[];
	/**
	 * Path prefix to prepend to all routes (e.g., '/api')
	 */
	prependPath?: string;
	/**
	 * Glob patterns to include (default: all +server and +page.server files)
	 */
	include?: string[];
	/**
	 * Glob patterns to exclude
	 */
	exclude?: string[];
	/**
	 * Whether to fail on JSDoc parsing errors (default: false)
	 */
	failOnErrors?: boolean;
	/**
	 * Output path for the spec file during build (e.g., 'static/openapi.json')
	 */
	outputPath?: string;
	/**
	 * Debounce delay in milliseconds for file watching (default: 200)
	 */
	debounceMs?: number;
}

// Virtual module ID constants
const VIRTUAL_ID = 'virtual:openapi-spec';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Vite plugin for generating OpenAPI specifications from SvelteKit endpoints
 */
export default function openapiPlugin(options: OpenAPIPluginOptions = {}): Plugin {
	let config: ResolvedConfig;
	let devServer: ViteDevServer | undefined;
	let cachedSpec: OpenAPIV3.Document | null = null;
	let cachedSpecJson: string | null = null;

	const debounceMs = options.debounceMs ?? 200;

	/**
	 * Generate the OpenAPI spec and update caches
	 */
	function regenerateSpec(): void {
		const generatorOptions: GeneratorOptions = {
			rootDir: config.root,
			info: options.info,
			servers: options.servers,
			baseSchemasPath: options.baseSchemasPath,
			yamlFiles: options.yamlFiles,
			prependPath: options.prependPath,
			include: options.include,
			exclude: options.exclude,
			failOnErrors: options.failOnErrors,
			outputPath: options.outputPath
		};

		cachedSpec = generateSpec(generatorOptions);
		cachedSpecJson = JSON.stringify(cachedSpec, null, 0);
	}

	return {
		name: 'sveltekit-openapi-generator',
		enforce: 'pre',

		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},

		buildStart() {
			// Generate spec at the start of both dev and build
			regenerateSpec();
		},

		configureServer(server) {
			devServer = server;

			// File watcher patterns
			const serverFilePattern = /src\/routes\/.*\/\+(page\.server|server)\.(js|ts)$/;
			const yamlPaths = options.yamlFiles?.map((f) => resolve(config.root, f)) || [];
			const baseSchemasPath = options.baseSchemasPath
				? resolve(config.root, options.baseSchemasPath)
				: null;

			// Debounced regeneration for HMR
			const regenerateDebounced = debounce(() => {
				if (!devServer) return;

				console.log('[openapi] Regenerating spec due to file changes...');
				regenerateSpec();

				// Find the virtual module in the module graph
				const moduleNode = devServer.moduleGraph.getModuleById(RESOLVED_ID);

				if (moduleNode) {
					// Invalidate the module
					devServer.moduleGraph.invalidateModule(moduleNode);

					// Send HMR update
					devServer.ws.send({
						type: 'update',
						updates: [
							{
								type: 'js-update',
								path: moduleNode.url,
								acceptedPath: moduleNode.url,
								timestamp: Date.now()
							}
						]
					});
				} else {
					// Fallback to full reload if module not found
					devServer.ws.send({ type: 'full-reload', path: '*' });
				}
			}, debounceMs);

			// Watch for changes to server files
			server.watcher.on('change', (path: string) => {
				const isServerFile = serverFilePattern.test(path);
				const isYamlFile = yamlPaths.some((p) => path.includes(p));
				const isBaseSchemasFile = baseSchemasPath && path.includes(baseSchemasPath);

				if (isServerFile || isYamlFile || isBaseSchemasFile) {
					regenerateDebounced();
				}
			});

			server.watcher.on('add', (path: string) => {
				if (serverFilePattern.test(path)) {
					regenerateDebounced();
				}
			});

			server.watcher.on('unlink', (path: string) => {
				if (serverFilePattern.test(path)) {
					regenerateDebounced();
				}
			});

			// Serve the spec via middleware endpoint
			server.middlewares.use('/openapi-spec.json', (req, res) => {
				if (!cachedSpecJson) {
					regenerateSpec();
				}

				res.setHeader('Content-Type', 'application/json');
				res.setHeader('Cache-Control', 'no-cache');
				res.end(cachedSpecJson);
			});
		},

		resolveId(id: string) {
			if (id === VIRTUAL_ID) {
				return RESOLVED_ID;
			}
		},

		load(id: string) {
			if (id === RESOLVED_ID) {
				if (!cachedSpecJson) {
					regenerateSpec();
				}
				return `export default ${cachedSpecJson};`;
			}
		},

		buildEnd() {
			// Write spec to disk if outputPath is specified
			if (options.outputPath && cachedSpec) {
				const outputFilePath = resolve(config.root, options.outputPath);
				writeSpec(cachedSpec, outputFilePath);
			}
		}
	};
}

// Re-export types for consumers
export type { OpenAPIV3 } from 'openapi-types';
export type { GeneratorOptions } from './generator.js';
