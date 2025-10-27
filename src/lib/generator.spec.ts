import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateSpec, writeSpec } from './generator.js';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { OpenAPIV3 } from 'openapi-types';

describe('generator', () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), 'openapi-test-'));
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	describe('generateSpec', () => {
		it('should generate a basic spec with no endpoints', () => {
			const spec = generateSpec({
				rootDir: tempDir,
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(spec.openapi).toBe('3.0.0');
			expect(spec.info.title).toBe('Test API');
			expect(spec.paths).toEqual({});
		});

		it('should parse JavaScript server files with @swagger docs', () => {
			// Create a test route
			const routesDir = join(tempDir, 'src', 'routes', 'api', 'test');
			mkdirSync(routesDir, { recursive: true });

			writeFileSync(
				join(routesDir, '+server.js'),
				`
/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test endpoint
 *     responses:
 *       200:
 *         description: Success
 */
export async function GET() {
	return new Response('test');
}
`,
				'utf-8'
			);

			const spec = generateSpec({
				rootDir: tempDir,
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(Object.keys(spec.paths || {})).toContain('/api/test');
			expect(spec.paths?.['/api/test']?.get?.summary).toBe('Test endpoint');
		});

		it('should parse TypeScript server files with type annotations', () => {
			// Create a test route with TypeScript
			const routesDir = join(tempDir, 'src', 'routes', 'api', 'users');
			mkdirSync(routesDir, { recursive: true });

			writeFileSync(
				join(routesDir, '+server.ts'),
				`
import type { RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 */
export const GET: RequestHandler = async ({ params }: { params: { id: string } }) => {
	return new Response('users');
};
`,
				'utf-8'
			);

			const spec = generateSpec({
				rootDir: tempDir,
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(Object.keys(spec.paths || {})).toContain('/api/users');
			expect(spec.paths?.['/api/users']?.get?.summary).toBe('Get all users');
		});

		it('should merge shared schemas from baseSchemasPath', () => {
			// Create shared schemas file
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
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 */
export const UserSchema = {};
`,
				'utf-8'
			);

			const spec = generateSpec({
				rootDir: tempDir,
				baseSchemasPath: 'src/lib/schemas.js',
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(spec.components?.schemas).toHaveProperty('User');
			expect(spec.components?.schemas?.User).toMatchObject({
				type: 'object',
				properties: {
					id: { type: 'string' },
					name: { type: 'string' }
				}
			});
		});

		it('should apply prependPath to all routes', () => {
			// Create a test route
			const routesDir = join(tempDir, 'src', 'routes', 'test');
			mkdirSync(routesDir, { recursive: true });

			writeFileSync(
				join(routesDir, '+server.js'),
				`
/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 */
export async function GET() {
	return new Response('test');
}
`,
				'utf-8'
			);

			const spec = generateSpec({
				rootDir: tempDir,
				prependPath: '/api/v1',
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(Object.keys(spec.paths || {})).toContain('/api/v1/test');
			expect(spec.paths?.['/api/v1/test']?.get?.summary).toBe('Test endpoint');
		});

		it('should skip files without @swagger docs', () => {
			// Create a route without docs
			const routesDir = join(tempDir, 'src', 'routes', 'nodocs');
			mkdirSync(routesDir, { recursive: true });

			writeFileSync(
				join(routesDir, '+server.js'),
				`
export async function GET() {
	return new Response('no docs');
}
`,
				'utf-8'
			);

			const spec = generateSpec({
				rootDir: tempDir,
				info: {
					title: 'Test API',
					version: '1.0.0'
				}
			});

			expect(Object.keys(spec.paths || {})).toHaveLength(0);
		});

		it('should include servers configuration', () => {
			const spec = generateSpec({
				rootDir: tempDir,
				info: {
					title: 'Test API',
					version: '1.0.0'
				},
				servers: [
					{ url: 'https://api.example.com', description: 'Production' },
					{ url: 'http://localhost:5173', description: 'Development' }
				]
			});

			expect(spec.servers).toHaveLength(2);
			expect(spec.servers?.[0]?.url).toBe('https://api.example.com');
		});
	});

	describe('writeSpec', () => {
		it('should write spec to file', () => {
			const spec: OpenAPIV3.Document = {
				openapi: '3.0.3',
				info: {
					title: 'Test API',
					version: '1.0.0'
				},
				paths: {}
			};

			const outputPath = join(tempDir, 'openapi.json');
			writeSpec(spec, outputPath);

			const written = JSON.parse(readFileSync(outputPath, 'utf-8'));
			expect(written.info.title).toBe('Test API');
		});

		it('should create directories if they do not exist', () => {
			const spec: OpenAPIV3.Document = {
				openapi: '3.0.3',
				info: {
					title: 'Test API',
					version: '1.0.0'
				},
				paths: {}
			};

			const outputPath = join(tempDir, 'deeply', 'nested', 'path', 'openapi.json');
			writeSpec(spec, outputPath);

			expect(readFileSync(outputPath, 'utf-8')).toBeTruthy();
		});

		it('should format JSON with proper indentation', () => {
			const spec: OpenAPIV3.Document = {
				openapi: '3.0.3',
				info: {
					title: 'Test API',
					version: '1.0.0'
				},
				paths: {}
			};

			const outputPath = join(tempDir, 'openapi.json');
			writeSpec(spec, outputPath);

			const content = readFileSync(outputPath, 'utf-8');
			expect(content).toContain('\n');
			expect(content).toContain('  '); // 2-space indentation
		});
	});
});
