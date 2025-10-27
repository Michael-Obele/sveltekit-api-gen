/**
 * Ambient type declarations for the virtual:openapi-spec module
 *
 * This file allows TypeScript to recognize imports from the virtual module:
 * ```typescript
 * import spec from 'virtual:openapi-spec';
 * ```
 */

declare module 'virtual:openapi-spec' {
	import type { OpenAPIV3 } from 'openapi-types';

	/**
	 * The generated OpenAPI 3.0 specification
	 */
	const spec: OpenAPIV3.Document;
	export default spec;
}
