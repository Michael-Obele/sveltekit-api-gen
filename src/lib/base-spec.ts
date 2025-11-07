import swaggerJsdoc from 'swagger-jsdoc';
import type { OpenAPIV3 } from 'openapi-types';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';

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
			title: 'SvelteKit API',
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
		paths: {}
	};

	// Only add components if we have schemas to add
	let hasComponents = false;
	const components: OpenAPIV3.ComponentsObject = {};

	// If baseSchemasPath is provided, parse it for shared schemas
	if (baseSchemasPath) {
		try {
			const schemaFilePath = resolve(rootDir, baseSchemasPath);
			const apis = [schemaFilePath];

			const schemaSpec = swaggerJsdoc({
				definition: {
					openapi: '3.0.0',
					info
				},
				apis,
				failOnErrors: false
			}) as OpenAPIV3.Document;

			// Merge schemas from the schema file
			if (schemaSpec.components?.schemas && Object.keys(schemaSpec.components.schemas).length > 0) {
				components.schemas = { ...components.schemas, ...schemaSpec.components.schemas };
				hasComponents = true;
			}

			// Also merge other component types if present
			if (schemaSpec.components?.securitySchemes) {
				components.securitySchemes = {
					...components.securitySchemes,
					...schemaSpec.components.securitySchemes
				};
				hasComponents = true;
			}

			if (schemaSpec.components?.responses) {
				components.responses = { ...components.responses, ...schemaSpec.components.responses };
				hasComponents = true;
			}

			if (schemaSpec.components?.parameters) {
				components.parameters = { ...components.parameters, ...schemaSpec.components.parameters };
				hasComponents = true;
			}

			if (schemaSpec.components?.requestBodies) {
				components.requestBodies = {
					...components.requestBodies,
					...schemaSpec.components.requestBodies
				};
				hasComponents = true;
			}

			if (schemaSpec.components?.headers) {
				components.headers = { ...components.headers, ...schemaSpec.components.headers };
				hasComponents = true;
			}

			console.log(
				`[openapi] Loaded ${Object.keys(components.schemas || {}).length} shared schemas from ${baseSchemasPath}`
			);
		} catch (error) {
			console.error(
				`[openapi] Failed to parse base schemas from ${baseSchemasPath}:`,
				error instanceof Error ? error.message : error
			);
		}
	}

	// Parse YAML files separately
	for (const yamlFile of yamlFiles) {
		try {
			const yamlFilePath = resolve(rootDir, yamlFile);
			const yamlContent = readFileSync(yamlFilePath, 'utf-8');
			const yamlData = yaml.load(yamlContent) as Partial<OpenAPIV3.Document>;

			// Merge components from YAML file
			if (yamlData.components?.schemas) {
				components.schemas = { ...components.schemas, ...yamlData.components.schemas };
				hasComponents = true;
			}

			if (yamlData.components?.securitySchemes) {
				components.securitySchemes = {
					...components.securitySchemes,
					...yamlData.components.securitySchemes
				};
				hasComponents = true;
			}

			if (yamlData.components?.responses) {
				components.responses = { ...components.responses, ...yamlData.components.responses };
				hasComponents = true;
			}

			if (yamlData.components?.parameters) {
				components.parameters = { ...components.parameters, ...yamlData.components.parameters };
				hasComponents = true;
			}

			if (yamlData.components?.requestBodies) {
				components.requestBodies = {
					...components.requestBodies,
					...yamlData.components.requestBodies
				};
				hasComponents = true;
			}

			if (yamlData.components?.headers) {
				components.headers = { ...components.headers, ...yamlData.components.headers };
				hasComponents = true;
			}

			console.log(`[openapi] Loaded components from YAML file ${yamlFile}`);
		} catch (error) {
			console.error(
				`[openapi] Failed to parse YAML file ${yamlFile}:`,
				error instanceof Error ? error.message : error
			);
		}
	}

	// Only add components to baseSpec if we actually have components
	if (hasComponents) {
		baseSpec.components = components;
	}

	return baseSpec;
}
