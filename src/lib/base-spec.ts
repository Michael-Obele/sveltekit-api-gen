import swaggerJsdoc from 'swagger-jsdoc';
import type { OpenAPIV3 } from 'openapi-types';
import { resolve } from 'path';

export interface BaseSpecOptions {
	/**
	 * OpenAPI info section
	 */
	info?: OpenAPIV3.InfoObject;
	/**
	 * OpenAPI servers section
	 */
	servers?: OpenAPIV3.ServerObject[];
	/**
	 * Path to a file containing shared schema definitions (components/schemas)
	 * Can be a .js, .ts, or .yaml file with @swagger JSDoc blocks
	 */
	baseSchemasPath?: string;
	/**
	 * Additional YAML files to include for schema definitions
	 */
	yamlFiles?: string[];
	/**
	 * Root directory for resolving paths
	 */
	rootDir: string;
}

/**
 * Creates a base OpenAPI specification with shared metadata and schemas
 */
export function createBaseSpec(options: BaseSpecOptions): OpenAPIV3.Document {
	const {
		info = {
			title: 'API Documentation',
			version: '1.0.0',
			description: 'Auto-generated API documentation from SvelteKit endpoints'
		},
		servers = [],
		baseSchemasPath,
		yamlFiles = [],
		rootDir
	} = options;

	// Start with minimal base spec
	const baseSpec: OpenAPIV3.Document = {
		openapi: '3.0.0',
		info,
		servers,
		paths: {},
		components: {
			schemas: {}
		}
	};

	// If baseSchemasPath is provided, parse it for shared schemas
	if (baseSchemasPath) {
		try {
			const schemaFilePath = resolve(rootDir, baseSchemasPath);
			const apis = [schemaFilePath, ...yamlFiles.map((f) => resolve(rootDir, f))];

			const schemaSpec = swaggerJsdoc({
				definition: {
					openapi: '3.0.0',
					info
				},
				apis,
				failOnErrors: false
			}) as OpenAPIV3.Document;

			// Merge schemas from the schema file
			if (schemaSpec.components?.schemas) {
				baseSpec.components = {
					...baseSpec.components,
					schemas: {
						...baseSpec.components?.schemas,
						...schemaSpec.components.schemas
					}
				};
			}

			// Also merge other component types if present
			if (schemaSpec.components?.securitySchemes) {
				baseSpec.components = {
					...baseSpec.components,
					securitySchemes: schemaSpec.components.securitySchemes
				};
			}

			if (schemaSpec.components?.responses) {
				baseSpec.components = {
					...baseSpec.components,
					responses: schemaSpec.components.responses
				};
			}

			if (schemaSpec.components?.parameters) {
				baseSpec.components = {
					...baseSpec.components,
					parameters: schemaSpec.components.parameters
				};
			}

			if (schemaSpec.components?.requestBodies) {
				baseSpec.components = {
					...baseSpec.components,
					requestBodies: schemaSpec.components.requestBodies
				};
			}

			if (schemaSpec.components?.headers) {
				baseSpec.components = {
					...baseSpec.components,
					headers: schemaSpec.components.headers
				};
			}

			console.log(
				`[openapi] Loaded ${Object.keys(baseSpec.components?.schemas || {}).length} shared schemas from ${baseSchemasPath}`
			);
		} catch (error) {
			console.error(
				`[openapi] Failed to parse base schemas from ${baseSchemasPath}:`,
				error instanceof Error ? error.message : error
			);
		}
	}

	return baseSpec;
}
