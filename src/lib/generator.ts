import { glob } from 'glob';
import swaggerJsdoc from 'swagger-jsdoc';
import { merge, isErrorResult } from 'openapi-merge';
import type { OpenAPIV3 } from 'openapi-types';
import { resolve } from 'path';
import { createBaseSpec, type BaseSpecOptions } from './base-spec.js';
import { writeFileSync, mkdirSync, readFileSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import ts from 'typescript';
import { tmpdir } from 'os';

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
		failOnErrors = false
	} = options;

	// Create base spec with shared schemas
	const baseSpecOptions: BaseSpecOptions = {
		info,
		servers,
		baseSchemasPath,
		yamlFiles,
		rootDir
	};

	const baseSpec = createBaseSpec(baseSpecOptions);

	// Find all server endpoint files
	const files = glob.sync(include, {
		cwd: rootDir,
		ignore: exclude,
		absolute: false
	});

	console.log(`[openapi] Found ${files.length} server endpoint files`);

	// Parse each file and collect partial specs
	const partials: Array<{ oas: OpenAPIV3.Document }> = [];
	const tempFiles: string[] = [];

	for (const file of files) {
		const fullPath = resolve(rootDir, file);
		let apiPath = fullPath;

		try {
			// For TypeScript files, we need to strip type annotations
			// because swagger-jsdoc doesn't understand TypeScript syntax
			if (file.endsWith('.ts')) {
				const sourceCode = readFileSync(fullPath, 'utf-8');
				const strippedCode = stripTypeScript(sourceCode);

				// Write to a temporary .js file
				const tempPath = join(
					tmpdir(),
					`openapi-${Date.now()}-${Math.random().toString(36).slice(2)}.js`
				);
				writeFileSync(tempPath, strippedCode, 'utf-8');
				tempFiles.push(tempPath);
				apiPath = tempPath;
			}

			const partial = swaggerJsdoc({
				definition: {
					openapi: '3.0.0',
					info: baseSpec.info
				},
				apis: [apiPath],
				failOnErrors
			}) as OpenAPIV3.Document;

			// Check if the file actually has any swagger documentation
			const hasPaths = partial.paths && Object.keys(partial.paths).length > 0;
			const hasSchemas =
				partial.components?.schemas && Object.keys(partial.components.schemas).length > 0;

			if (!hasPaths && !hasSchemas) {
				console.warn(`[openapi] No @swagger docs found in ${file}; skipping.`);
				continue;
			}

			partials.push({ oas: partial });
			console.log(
				`[openapi] Parsed ${file}: found ${Object.keys(partial.paths || {}).length} paths`
			);
		} catch (error) {
			console.error(
				`[openapi] Failed to parse ${file}:`,
				error instanceof Error ? error.message : error
			);
			if (failOnErrors) {
				throw error;
			}
		}
	}

	// Clean up temporary files
	for (const tempFile of tempFiles) {
		try {
			unlinkSync(tempFile);
		} catch (error) {
			// Ignore cleanup errors
		}
	}

	// Merge all specs together
	if (partials.length === 0) {
		console.warn('[openapi] No API documentation found in any files');
		return baseSpec;
	}

	try {
		const mergeResult = merge([
			{
				oas: baseSpec as any
			},
			...partials.map((p) => ({
				oas: p.oas as any,
				pathModification: prependPath ? { prepend: prependPath } : undefined
			}))
		]);

		if (isErrorResult(mergeResult)) {
			console.error('[openapi] Merge errors:', mergeResult.message);
			if (failOnErrors) {
				throw new Error(`OpenAPI merge failed: ${mergeResult.message}`);
			}
			return baseSpec;
		}

		const mergedSpec = mergeResult.output as OpenAPIV3.Document;
		console.log(
			`[openapi] Successfully merged ${partials.length} specs with ${Object.keys(mergedSpec.paths || {}).length} total paths`
		);

		return mergedSpec;
	} catch (error) {
		console.error('[openapi] Merge failed:', error instanceof Error ? error.message : error);
		if (failOnErrors) {
			throw error;
		}
		return baseSpec;
	}
}

/**
 * Write the generated spec to a file
 */
export function writeSpec(spec: OpenAPIV3.Document, outputPath: string): void {
	try {
		const dir = dirname(outputPath);
		mkdirSync(dir, { recursive: true });
		writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf-8');
		console.log(`[openapi] Wrote spec to ${outputPath}`);
	} catch (error) {
		console.error(
			`[openapi] Failed to write spec to ${outputPath}:`,
			error instanceof Error ? error.message : error
		);
		throw error;
	}
}
