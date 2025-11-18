# SvelteKit OpenAPI Generator Plugin Plan

## Goal

Build a Vite plugin tailored for SvelteKit projects that scans server endpoints (`+page.server.{js,ts}`, `+server.{js,ts}`), extracts `@swagger` JSDoc blocks, and produces a unified OpenAPI 3.0 document. The plugin should support development-time HMR, virtual module imports, and optional build-time snapshotting.

## Architecture Overview

- **Plugin Type:** Vite plugin registered before `sveltekit()` with `enforce: 'pre'`.
- **Core Steps:**
  1. Glob server entry files and optional YAML schema files.
  2. Parse `@swagger` blocks with `swagger-jsdoc@^6.2.8` (stable release).
  3. Merge partial specs via `openapi-merge@^1.3.3`, using a base spec for shared metadata and schemas.
  4. Cache and expose the merged spec through a virtual module (`virtual:openapi-spec`) and a dev middleware endpoint (`/openapi-spec.json`).
  5. Rebuild and emit the spec during `vite build`, optionally writing to disk (e.g., `static/openapi.json`).

## Key Decisions & Corrections

- **swagger-jsdoc Version:** Use stable `^6.2.8` instead of RC v7 to avoid unresolved bugs.
- **HMR Handling:**
  - Track the virtual module node via `server.moduleGraph.getModuleById()`.
  - Invalidate and push updates with `server.moduleGraph.invalidateModule()` plus `server.ws.send()`.
  - Remove usage of the non-existent `server.reloadModule()` API.
- **Plugin Application:** Drop invalid `apply: 'build, serve'`; default behavior already covers both modes.
- **Cached Output:** Maintain both parsed spec and stringified JSON for efficient middleware responses.
- **Typing:** Provide ambient TypeScript declarations for `virtual:openapi-spec` using `openapi-types`.
- **Watcher Filters:** Normalize watch patterns to avoid redundant regenerations and ensure YAML dependencies trigger updates.

## Implementation Breakdown

### 1. Project Scaffolding

- Initialize with `@sveltejs/package` template (TS, Skeleton, no Kit) for library distribution.
- Directory structure:
  ```
  src/lib/
    index.ts          # Plugin factory
    generator.ts      # Spec generation logic
    base-spec.ts      # Base spec creator/shared schemas
    ambient.d.ts      # Virtual module typings (emitted with package)
  plan/               # This planning documentation
  ```

### 2. Base Spec (`src/lib/base-spec.ts`)

- Accept options: `info`, `servers`, `baseSchemasPath`, `yamlFiles`.
- Use `swagger-jsdoc` to parse shared schema definitions only.
- Return a partial OpenAPI object `{ openapi: '3.0.0', info, servers, components, paths: {} }`.

### 3. Generator (`src/lib/generator.ts`)

- Glob target files with `glob@^10`, honoring the project root.
- Parse each file via `swagger-jsdoc` (failOnErrors configurable, default false).
- Warn when a file lacks `@swagger` content.
- Merge `[baseSpec, ...partials]` using `openapi-merge` and handle `isErrorResult`.
- Optionally write output during build when `outputPath` is provided.

### 4. Plugin (`src/lib/index.ts`)

- Constants: `VIRTUAL_ID`, `RESOLVED_ID`, cached spec/JSON, debounce interval.
- Hooks:
  - `configResolved`: Capture command (`serve` vs `build`).
  - `buildStart`: Initial spec generation for both dev and build.
  - `configureServer`: Setup watchers, middleware, and HMR regeneration.
  - `resolveId`/`load`: Serve the virtual module with cached JSON.
  - `buildEnd`: Persist spec to `outputPath` when building.
- HMR Flow: On change, regenerate spec, update caches, invalidate module, send `ws` update (fall back to full reload if module unavailable).

### 5. Type Declarations

- `src/lib/ambient.d.ts`:
  ```ts
  declare module 'virtual:openapi-spec' {
  	import type { OpenAPIV3 } from 'openapi-types';
  	const spec: OpenAPIV3.Document;
  	export default spec;
  }
  ```

### 6. Host Integration Example

- `svelte.config.js` (vite plugins array):

  ```ts
  import { sveltekit } from '@sveltejs/kit/vite';
  import openapiPlugin from 'sveltekit-openapi-generator';

  export default {
  	plugins: [
  		openapiPlugin({
  			baseSchemasPath: 'src/lib/schemas.js',
  			yamlFiles: ['src/specs/external.yaml'],
  			prependPath: '/api',
  			outputPath: 'static/openapi.json',
  			debounceMs: 100
  		}),
  		sveltekit()
  	]
  };
  ```

- Example usage in Svelte component:
  ```svelte
  <script lang="ts">
  	import spec from 'virtual:openapi-spec';
  	console.log(spec.paths);
  </script>
  ```

### 7. Testing & Validation

- Unit tests (Vitest) for generator logic with mock files.
- Integration test using Playwright or Vitest to ensure virtual module import works and middleware responds.
- Validate emitted spec using `openapi-schema-validator` (future enhancement).

### 8. Documentation Tasks

- Update README with usage instructions, limitations (e.g., JSDoc block requirements), and troubleshooting tips.
- Document how to extend with additional YAML files or change route prefixes.

### 9. Future Enhancements

- CLI command for manual spec generation.
- Optional schema validation step with `openapi-types` or `swagger-parser`.
- Configurable warning/error reporting for duplicate paths/components.
- Support for custom file extensions (e.g., `+page.server.ts` in nested directories with alternative patterns).

## Dependencies

- **Runtime:** `swagger-jsdoc@^6.2.8`, `openapi-merge@^1.3.3`, `glob@^10.3.12`.
- **Dev:** `lodash-es@^4.17.21`, `openapi-types@^12.1.3`, `@sveltejs/package` build tooling.
- **Peer:** `vite@^5`, `@sveltejs/kit@^2`, `svelte@^4`.

## Technical Implementation Details

### HMR Update Pattern

```typescript
// In regenerateDebounced callback
const regenerateDebounced = debounce(() => {
  if (!devServer) return;

  cachedSpec = generateSpec({...});
  cachedSpecJson = JSON.stringify(cachedSpec, null, 2);

  const moduleNode = devServer.moduleGraph.getModuleById(RESOLVED_ID);
  if (moduleNode) {
    devServer.moduleGraph.invalidateModule(moduleNode);
    devServer.ws.send({
      type: 'update',
      updates: [{
        type: 'js-update',
        path: moduleNode.url,
        acceptedPath: moduleNode.url,
        timestamp: Date.now()
      }]
    });
  } else {
    // Fallback to full reload if module not found
    devServer.ws.send({ type: 'full-reload' });
  }
}, options.debounceMs);
```

### Module Node Tracking

```typescript
load(id: string) {
  if (id === RESOLVED_ID) {
    if (!cachedSpec) {
      cachedSpec = generateSpec({...});
      cachedSpecJson = JSON.stringify(cachedSpec, null, 0);
    }
    return `export default ${cachedSpecJson};`;
  }
}
```

### File Watcher Pattern

```typescript
const serverFilePattern = /src\/routes\/.*\/\+(page\.server|server)\.(js|ts)$/;
const yamlPaths = options.yamlFiles?.map((f) => resolve(server.config.root, f)) || [];

server.watcher.on('change', (path: string) => {
	const isServerFile = serverFilePattern.test(path);
	const isYamlFile = yamlPaths.some((p) => path.includes(p));

	if (isServerFile || isYamlFile) {
		regenerateDebounced();
	}
});

server.watcher.on('add', (path: string) => {
	if (serverFilePattern.test(path)) regenerateDebounced();
});

server.watcher.on('unlink', (path: string) => {
	if (serverFilePattern.test(path)) regenerateDebounced();
});
```

### Error Handling

```typescript
// In generator.ts
for (const file of files) {
	const fullPath = resolve(rootDir, file);
	try {
		const partial = swaggerJsdoc({
			definition: { openapi: '3.0.0', info: base.info },
			apis: [fullPath, ...yamlFiles.map((f) => resolve(rootDir, f))],
			failOnErrors: false
		});

		if (
			Object.keys(partial.paths || {}).length === 0 &&
			Object.keys(partial.components?.schemas || {}).length === 0
		) {
			console.warn(`[openapi] No @swagger docs in ${file}; skipping.`);
		} else {
			partials.push({
				oas: partial,
				pathModification: { prepend: prependPath }
			});
		}
	} catch (error) {
		console.error(`[openapi] Failed to parse ${file}:`, error.message);
		// Continue processing other files
	}
}
```

### SvelteKit Route to OpenAPI Path Mapping

```typescript
// Helper function to convert SvelteKit route to OpenAPI path
function svelteKitRouteToOpenAPIPath(filePath: string): string {
	// Extract route from file path: src/routes/api/users/[id]/+server.ts -> /api/users/{id}
	const routeMatch = filePath.match(/src\/routes(.*)\/\+(page\.server|server)\.(js|ts)$/);
	if (!routeMatch) return '/';

	let path = routeMatch[1];

	// Remove route groups: (admin) -> ""
	path = path.replace(/\/\([^)]+\)/g, '');

	// Convert required params: [id] -> {id}
	path = path.replace(/\[([^\]]+)\]/g, '{$1}');

	// Convert optional params: [[id]] -> {id} (mark as optional in schema)
	path = path.replace(/\[\[([^\]]+)\]\]/g, '{$1}');

	// Convert rest params: [...rest] -> {rest} (mark as path in schema)
	path = path.replace(/\[\.\.\.([^\]]+)\]/g, '{$1}');

	return path || '/';
}
```

## Limitations & Caveats

### Known Limitations

1. **JSDoc Required**: Every endpoint must have `@swagger` JSDoc blocks; no automatic inference.
2. **No Runtime Validation**: The plugin doesn't validate that your actual endpoints match the spec.
3. **Build Size**: Importing the spec client-side adds to bundle size; consider loading dynamically or using only in dev.
4. **SSR Compatibility**: The virtual module should only be imported client-side or in universal load functions, not in server-only code.
5. **Route Parameter Inference**: The plugin cannot infer parameter types from TypeScript; you must document them in JSDoc.
6. **SvelteKit Actions**: Form actions must be manually documented; no automatic detection of action names.

### Best Practices

- **Centralize Schemas**: Use `baseSchemasPath` to define shared component schemas and reference them via `$ref` to avoid duplication.
- **YAML for Complex Types**: For complex schemas, use external YAML files and reference them in JSDoc.
- **Security Schemes**: Define authentication in base spec, not individual routes.
- **Route Groups**: Use SvelteKit route groups `(group)` for organization; they won't appear in paths.
- **Dev Only**: Consider importing the spec only in dev mode for documentation/testing tools.

### Security Considerations

⚠️ **Warning**: The generated OpenAPI spec may expose sensitive API structure:

- Don't include internal-only endpoints in public builds
- Review the spec before deploying to production
- Consider adding authentication to the `/openapi-spec.json` endpoint
- Use environment-based configuration to exclude sensitive routes

### Performance Notes

- **Large APIs**: For APIs with 100+ endpoints, consider:
  - Splitting specs by domain/module
  - Using `include`/`exclude` glob patterns to limit scanning
  - Disabling HMR regeneration (set `debounceMs` higher)
- **Bundle Size**: The virtual module adds ~10-50KB (gzipped) depending on API size
- **Build Time**: Spec generation adds ~100-500ms to build time

## Example JSDoc Syntax (v6)

### Basic GET Endpoint

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
export async function GET({ url }) {
	// Implementation
}
```

### POST with Request Body

```javascript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */
export async function POST({ request }) {
	// Implementation
}
```

### Path Parameters

```javascript
// File: src/routes/api/users/[id]/+server.ts
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
export async function GET({ params }) {
	// Implementation
}
```

### Shared Schemas (baseSchemasPath)

```javascript
// File: src/lib/schemas.js
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
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     UserInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 */
```

## Publishing Workflow

### Package Configuration

Update `package.json`:

```json
{
	"name": "sveltekit-openapi-generator",
	"version": "0.1.0",
	"description": "Generate OpenAPI specs from SvelteKit endpoints",
	"type": "module",
	"license": "MIT",
	"author": "Your Name",
	"repository": {
		"type": "git",
		"url": "https://github.com/yourorg/sveltekit-openapi-generator"
	},
	"keywords": ["sveltekit", "openapi", "swagger", "vite-plugin", "api-documentation"],
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"default": "./dist/index.js"
		}
	},
	"files": ["dist", "README.md", "LICENSE"],
	"scripts": {
		"dev": "vite dev",
		"build": "vite build && npm run package",
		"package": "svelte-kit sync && svelte-package && publint",
		"prepublishOnly": "npm run package",
		"test": "vitest",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
	},
	"peerDependencies": {
		"vite": "^5.0.0",
		"@sveltejs/kit": "^2.0.0",
		"svelte": "^4.0.0 || ^5.0.0"
	},
	"dependencies": {
		"swagger-jsdoc": "^6.2.8",
		"openapi-merge": "^1.3.3",
		"glob": "^10.3.12"
	},
	"devDependencies": {
		"@sveltejs/package": "^2.0.0",
		"lodash-es": "^4.17.21",
		"openapi-types": "^12.1.3",
		"publint": "^0.2.0",
		"svelte": "^4.0.0",
		"svelte-check": "^3.0.0",
		"vitest": "^1.0.0"
	}
}
```

### Files to Include

Create `.npmignore`:

```
src/
.env*
.DS_Store
node_modules/
/plan
/tests
*.test.ts
*.spec.ts
vite.config.ts
vitest.config.ts
tsconfig.json
playwright.config.ts
```

### Pre-Publish Checklist

- [x] Add MIT LICENSE file
- [x] Write comprehensive README.md with usage examples
- [x] Test package locally with `npm link`
- [x] Run `npm run package` and verify dist/ output
- [X] Run `publint` to check package exports
- [x] Test in a real SvelteKit project
- [x] Set up GitHub repository with proper description/topics
- [x] Add CHANGELOG.md for version tracking
- [ ] Configure GitHub Actions for CI (test + build)

### Local Testing Workflow

```bash
# In plugin directory
npm run package
npm link

# In test SvelteKit project
npm link sveltekit-openapi-generator

# Make changes to plugin
npm run package  # Rebuilds dist/

# Test project will pick up changes automatically
```

### Publishing Steps

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run tests: `npm test`
4. Build: `npm run package`
5. Dry run: `npm publish --dry-run`
6. Publish: `npm publish --access public`
7. Tag release: `git tag v0.1.0 && git push --tags`

## Deliverables Checklist

- [x] `src/lib/base-spec.ts`
- [x] `src/lib/generator.ts`
- [x] `src/lib/index.ts`
- [x] `src/lib/ambient.d.ts`
- [ ] Tests (unit + integration)
- [x] README + usage docs
- [x] CHANGELOG.md
- [x] LICENSE (MIT)
- [x] `.npmignore`
- [x] Package.json configuration
- [ ] Dist build via `npm run package`
- [ ] Example SvelteKit consumer project
- [ ] GitHub repository setup
- [ ] CI/CD configuration (optional)
