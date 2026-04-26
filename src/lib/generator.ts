import { glob } from 'glob';
import swaggerJsdoc from 'swagger-jsdoc';
import type { OpenAPIV3 } from 'openapi-types';
import { resolve } from 'path';
import { createBaseSpec, type BaseSpecOptions } from './base-spec.js';
import { writeFileSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import ts from 'typescript';
import { tmpdir } from 'os';
import { createLogger } from './logger.js';

export interface GeneratorOptions {
	/**
	 * Root directory of the SvelteKit project
	 */
	rootDir: string;
	/**
	 * OpenAPI info section
	 */
	info?: OpenAPIV3.InfoObject;
	/**
	 * OpenAPI servers section
	 */
	servers?: OpenAPIV3.ServerObject[];
	/**
	 * Path to a file containing shared schema definitions
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
	 * Whether to fail on JSDoc parsing errors
	 */
	failOnErrors?: boolean;
	/**
	 * Output path for writing the spec during build (optional)
	 */
	outputPath?: string;
	/**
	 * Whether to suppress logging output
	 */
	silent?: boolean;
}

/**
 * Strip TypeScript type annotations from code
 * This allows swagger-jsdoc to parse TypeScript files
 */
function stripTypeScript(code: string): string {
	const result = ts.transpileModule(code, {
		compilerOptions: {
			target: ts.ScriptTarget.ESNext,
			module: ts.ModuleKind.ESNext,
			removeComments: false, // Keep JSDoc comments
			isolatedModules: true
		}
	});
	return result.outputText;
}

/**
 * Generate OpenAPI specification from SvelteKit server files
 */
export function generateSpec(options: GeneratorOptions): OpenAPIV3.Document {
	const {
		rootDir,
		info,
		servers,
		baseSchemasPath,
		yamlFiles = [],
		prependPath = '',
		include = ['src/routes/**/{+server,+page.server}.{js,ts}'],
		exclude = ['**/node_modules/**', '**/.svelte-kit/**'],
		failOnErrors = false,
		silent = true
	} = options;

	const logger = createLogger(silent);

	const baseSpecOptions: BaseSpecOptions = {
		info,
		servers,
		baseSchemasPath,
		yamlFiles,
		rootDir,
		silent
	};

	const baseSpec = createBaseSpec(baseSpecOptions);

	const files = glob.sync(include, {
		cwd: rootDir,
		ignore: exclude,
		absolute: false
	});

	logger.log(`[openapi] Found ${files.length} server endpoint files`);

	const tempDir = join(tmpdir(), `openapi-${Date.now()}-${Math.random().toString(36).slice(2)}`);
	mkdirSync(tempDir, { recursive: true });

	try {
		for (const file of files) {
			const fullPath = resolve(rootDir, file);
			const sourceCode = readFileSync(fullPath, 'utf-8');
			const transformedCode = file.endsWith('.ts') ? stripTypeScript(sourceCode) : sourceCode;
			const safeRelativePath = file.endsWith('.ts') ? file.replace(/\.ts$/, '.js') : file;
			const tempPath = join(tempDir, safeRelativePath.replace(/[[\]]/g, '_'));
			mkdirSync(dirname(tempPath), { recursive: true });
			writeFileSync(tempPath, transformedCode, 'utf-8');
		}

		const partial = swaggerJsdoc({
			definition: {
				openapi: '3.0.0',
				info: baseSpec.info
			},
			apis: [join(tempDir, '**/*.js')],
			failOnErrors
		}) as OpenAPIV3.Document;

		const hasPaths = partial.paths && Object.keys(partial.paths).length > 0;
		const hasSchemas =
			partial.components?.schemas && Object.keys(partial.components.schemas).length > 0;

		if (!hasPaths && !hasSchemas) {
			logger.warn('[openapi] No @swagger docs found in any files');
			return baseSpec;
		}

		logger.log(`[openapi] Parsed files: found ${Object.keys(partial.paths || {}).length} paths`);


			const prefixedPaths = Object.fromEntries(
				Object.entries(partial.paths ?? {}).map(([path, pathItem]) => {
					const normalizedPath = prependPath
						? `${prependPath}${path.startsWith('/') ? path : `/${path}`}`
						: path;
					return [normalizedPath, pathItem];
				})
			);

			const mergedComponents: NonNullable<OpenAPIV3.Document['components']> = {};
			const baseComponents = baseSpec.components ?? {};
			const partialComponents = partial.components ?? {};
			const componentKeys: Array<keyof OpenAPIV3.ComponentsObject> = [
				'schemas',
				'securitySchemes',
				'responses',
				'parameters',
				'requestBodies',
				'headers'
			];

			for (const key of componentKeys) {
				const mergedValue = {
					...(baseComponents[key] ?? {}),
					...(partialComponents[key] ?? {})
				};

				if (Object.keys(mergedValue).length > 0) {
					mergedComponents[key] = mergedValue as never;
				}
			}

			const mergedSpec: OpenAPIV3.Document = {
				...baseSpec,
				...partial,
				paths: {
					...(baseSpec.paths ?? {}),
					...prefixedPaths
				}
			};

			if (Object.keys(mergedComponents).length > 0) {
				mergedSpec.components = mergedComponents;
			}

			logger.log(
				`[openapi] Successfully merged with ${Object.keys(mergedSpec.paths || {}).length} total paths`
			);

		return mergedSpec;
	} catch (error) {
		logger.error(
			'[openapi] Failed to generate spec:',
			error instanceof Error ? error.message : error
		);
		if (failOnErrors) {
			throw error;
		}
		return baseSpec;
	} finally {
		try {
			rmSync(tempDir, { recursive: true, force: true });
		} catch (error) {
			// Ignore cleanup errors
		}
	}
}

/**
 * Write the generated spec to a file
 */
export function writeSpec(spec: OpenAPIV3.Document, outputPath: string, silent = true): void {
	const logger = createLogger(silent);

	try {
		const dir = dirname(outputPath);
		mkdirSync(dir, { recursive: true });
		writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf-8');
		logger.log(`[openapi] Wrote spec to ${outputPath}`);
	} catch (error) {
		logger.error(
			`[openapi] Failed to write spec to ${outputPath}:`,
			error instanceof Error ? error.message : error
		);
		throw error;
	}
}
