import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createBaseSpec } from './base-spec.js';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('base-spec', () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), 'base-spec-test-'));
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	describe('createBaseSpec', () => {
		it('should create a minimal spec with only info', () => {
			const spec = createBaseSpec({
				rootDir: tempDir,
				info: {
					title: 'Test API',
					version: '1.0.0',
					description: 'A test API'
				}
			});

			expect(spec.openapi).toBe('3.0.0');
			expect(spec.info.title).toBe('Test API');
			expect(spec.info.version).toBe('1.0.0');
			expect(spec.info.description).toBe('A test API');
			expect(spec.paths).toEqual({});
		});

		it('should include servers when provided', () => {
			const spec = createBaseSpec({
				rootDir: tempDir,
				info: {
					title: 'Test API',
					version: '1.0.0'
				},
				servers: [
					{ url: 'https://api.example.com', description: 'Production' },
					{ url: 'http://localhost:3000', description: 'Development' }
				]
			});

			expect(spec.servers).toHaveLength(2);
			expect(spec.servers?.[0]?.url).toBe('https://api.example.com');
			expect(spec.servers?.[1]?.description).toBe('Development');
		});

		it('should load and merge schemas from baseSchemasPath', () => {
			// Create schemas file
			const libDir = join(tempDir, 'src', 'lib');
			mkdirSync(libDir, { recursive: true });

			writeFileSync(
				join(libDir, 'schemas.js'),
				`
/**
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
 *         email:
 *           type: string
 *           format: email
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */
`,
				'utf-8'
			);

			const spec = createBaseSpec({
				rootDir: tempDir,
				baseSchemasPath: 'src/lib/schemas.js',
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(spec.components?.schemas).toHaveProperty('User');
			expect(spec.components?.schemas).toHaveProperty('Error');
			expect(spec.components?.schemas?.User).toMatchObject({
				type: 'object',
				required: ['id', 'email'],
				properties: {
					id: { type: 'string' },
					email: { type: 'string', format: 'email' }
				}
			});
		});

		it('should merge security schemes from baseSchemasPath', () => {
			// Create schemas file with security schemes
			const libDir = join(tempDir, 'src', 'lib');
			mkdirSync(libDir, { recursive: true });

			writeFileSync(
				join(libDir, 'schemas.js'),
				`
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     apiKey:
 *       type: apiKey
 *       in: header
 *       name: X-API-Key
 */
`,
				'utf-8'
			);

			const spec = createBaseSpec({
				rootDir: tempDir,
				baseSchemasPath: 'src/lib/schemas.js',
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(spec.components?.securitySchemes).toHaveProperty('bearerAuth');
			expect(spec.components?.securitySchemes).toHaveProperty('apiKey');
		});

		it('should handle missing baseSchemasPath gracefully', () => {
			const spec = createBaseSpec({
				rootDir: tempDir,
				baseSchemasPath: 'nonexistent/file.js',
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(spec.openapi).toBe('3.0.0');
			expect(spec.components?.schemas).toBeUndefined();
		});

		it('should load and merge multiple YAML files', () => {
			// Create YAML directory
			const yamlDir = join(tempDir, 'yaml');
			mkdirSync(yamlDir, { recursive: true });

			writeFileSync(
				join(yamlDir, 'schemas.yaml'),
				`
components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
`,
				'utf-8'
			);

			writeFileSync(
				join(yamlDir, 'responses.yaml'),
				`
components:
  responses:
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
`,
				'utf-8'
			);

			const spec = createBaseSpec({
				rootDir: tempDir,
				yamlFiles: ['yaml/schemas.yaml', 'yaml/responses.yaml'],
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(spec.components?.schemas).toHaveProperty('Product');
			expect(spec.components?.responses).toHaveProperty('NotFound');
		});

		it('should use default values when no options provided', () => {
			const spec = createBaseSpec({
				rootDir: tempDir
			});

			expect(spec.openapi).toBe('3.0.0');
			expect(spec.info.title).toBe('SvelteKit API');
			expect(spec.info.version).toBe('1.0.0');
		});

		it('should merge components from multiple sources correctly', () => {
			// Create base schemas
			const libDir = join(tempDir, 'src', 'lib');
			mkdirSync(libDir, { recursive: true });

			writeFileSync(
				join(libDir, 'schemas.js'),
				`
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *   securitySchemes:
 *     apiKey:
 *       type: apiKey
 *       in: header
 *       name: X-API-Key
 */
`,
				'utf-8'
			);

			// Create YAML file
			const yamlDir = join(tempDir, 'yaml');
			mkdirSync(yamlDir, { recursive: true });

			writeFileSync(
				join(yamlDir, 'extra.yaml'),
				`
components:
  schemas:
    Product:
      type: object
  parameters:
    limitParam:
      name: limit
      in: query
      schema:
        type: integer
`,
				'utf-8'
			);

			const spec = createBaseSpec({
				rootDir: tempDir,
				baseSchemasPath: 'src/lib/schemas.js',
				yamlFiles: ['yaml/extra.yaml'],
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(spec.components?.schemas).toHaveProperty('User');
			expect(spec.components?.schemas).toHaveProperty('Product');
			expect(spec.components?.securitySchemes).toHaveProperty('apiKey');
			expect(spec.components?.parameters).toHaveProperty('limitParam');
		});
	});
});
