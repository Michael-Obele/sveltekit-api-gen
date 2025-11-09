# SvelteKit OpenAPI Generator

[![npm version](https://img.shields.io/npm/v/sveltekit-openapi-generator.svg)](https://www.npmjs.com/package/sveltekit-openapi-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Automatically generate OpenAPI 3.0 specifications from your SvelteKit server endpoints using JSDoc `@swagger` annotations.**

This Vite plugin scans your SvelteKit `+page.server.{js,ts}` and `+server.{js,ts}` files, extracts `@swagger` JSDoc blocks, and produces a unified OpenAPI spec with Hot Module Replacement (HMR) support.

## 📋 Table of Contents

- [🔗 Links](#links)
- [✨ Features](#features)
- [🔄 Migration from SwaggerUI-Svelte](#migration-from-swaggerui-svelte)
- [🎨 Styling](#styling)
- [📦 Installation](#installation)
- [🚀 Quick Start](#quick-start)
- [📚 Documentation](#documentation)
- [🛠️ Integration with Swagger UI](#integration-with-swagger-ui)
- [⚠️ Limitations & Best Practices](#limitations--best-practices)
- [🔧 Troubleshooting](#troubleshooting)
- [🤝 Contributing](#contributing)
- [📄 License](#license)
- [🔗 Links (External)](#links-2)
- [💬 Support](#support)

<a name="links"></a>

## 🔗 Links

- **📖 Documentation & Demo**: [https://sveltekit-openapi-generator.netlify.app](https://sveltekit-openapi-generator.netlify.app)
- **📦 npm Package**: [https://www.npmjs.com/package/sveltekit-openapi-generator](https://www.npmjs.com/package/sveltekit-openapi-generator)
- **🐙 GitHub Repository**: [https://github.com/Michael-Obele/sveltekit-api-gen](https://github.com/Michael-Obele/sveltekit-api-gen)

<a name="features"></a>

## ✨ Features

- 🔥 **Hot Module Replacement** - Specs update live as you edit JSDoc
- 📦 **Virtual Module** - Import the spec directly: `import spec from 'virtual:openapi-spec'`
- 🛠️ **Dev Middleware** - Access spec at `/openapi-spec.json` during development
- 🏗️ **Build Support** - Generate static spec files during build
- 🔗 **Smart Merging** - Combines multiple specs using `openapi-merge`
- 📝 **TypeScript Support** - Full type support with automatic type stripping for .ts files
- 🎯 **SvelteKit Native** - Handles route parameters, groups, and optional segments
- 🧩 **Shared Schemas** - Centralize component definitions to avoid duplication
- 📖 **Swagger UI Ready** - Easy integration with Swagger UI for interactive docs

<a name="migration-from-swaggerui-svelte"></a>

## 🔄 Migration from SwaggerUI-Svelte

If you're migrating from the deprecated [SwaggerUI-Svelte](https://github.com/Michael-Obele/SwaggerUI-Svelte) project, this library offers more control and features for generating OpenAPI specifications from your SvelteKit endpoints.

### Key Changes

- **JSDoc Annotations**: Instead of automatic scanning, use `@swagger` JSDoc blocks above your endpoint handlers for precise documentation.
- **Plugin-Based Generation**: Configure the Vite plugin to generate specs with HMR support.
- **Swagger UI Integration**: Use `swagger-ui-dist` for displaying the generated spec, as detailed in the [Integration with Swagger UI](#integration-with-swagger-ui) section below.

### Migration Steps

1. **Install Dependencies**:

   ```bash
   npm install -D sveltekit-openapi-generator swagger-ui-dist
   ```

2. **Configure the Plugin**:
   Add the plugin to your `vite.config.js` before the SvelteKit plugin:

   ```javascript
   import { sveltekit } from '@sveltejs/kit/vite';
   import { defineConfig } from 'vite';
   import openapiPlugin from 'sveltekit-openapi-generator';

   export default defineConfig({
   	plugins: [
   		openapiPlugin({
   			// Optional: path to shared schema definitions
   			baseSchemasPath: 'src/lib/schemas.js'
   		}),
   		sveltekit()
   	]
   });
   ```

3. **Document Your Endpoints**:
   Add `@swagger` JSDoc to your server files:

   ```javascript
   /**
    * @swagger
    * /api/users:
    *   get:
    *     summary: Get all users
    *     responses:
    *       200:
    *         description: Success
    */
   export async function GET({}) {
   	// Your implementation
   }
   ```

4. **Integrate Swagger UI**:
   Follow the steps in the [Integration with Swagger UI](#integration-with-swagger-ui) section to display your API documentation.

For more details, refer to the [Quick Start](#quick-start) guide.

<a name="styling"></a>

## 🎨 Styling

Demo pages use Tailwind CSS for modern, responsive styling. **Package size: 14.80KB packed / 59.96KB unpacked** - Tailwind is a devDependency only, and demo routes are excluded from the npm package.

This project is compatible with Tailwind CSS v4. If upgrading to v4, follow the [official upgrade guide](https://tailwindcss.com/docs/upgrade-guide), which includes using `@import "tailwindcss";` instead of `@tailwind` directives and configuring themes in CSS with `@theme`.

Since the package does not ship pre-built components with Tailwind classes, no additional Tailwind configuration is required for this library.

<a name="installation"></a>

## 📦 Installation

```bash
npm install -D sveltekit-openapi-generator
```

<a name="quick-start"></a>

## 🚀 Quick Start

### 1. Configure the Plugin

Add the plugin to your `vite.config.js` **before** the SvelteKit plugin:

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import openapiPlugin from 'sveltekit-openapi-generator';

export default defineConfig({
	plugins: [
		openapiPlugin({
			// Optional: path to shared schema definitions
			baseSchemasPath: 'src/lib/schemas.js',

			// Optional: external YAML files to include
			yamlFiles: ['src/specs/external.yaml'],

			// Optional: prepend to all paths (useful for /api prefix)
			prependPath: '/api',

			// Optional: output file during build
			outputPath: 'static/openapi.json',

			// Optional: debounce delay for HMR (ms)
			debounceMs: 100
		}),
		sveltekit()
	]
});
```

### 2. Document Your Endpoints

Add `@swagger` JSDoc blocks to your server files:

```javascript
// src/routes/api/users/+server.js

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export async function GET({ url }) {
	const limit = Number(url.searchParams.get('limit') || 10);
	// Your implementation
	return json({ users: [] });
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a user
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
 */
export async function POST({ request }) {
	const data = await request.json();
	// Your implementation
	return json(data, { status: 201 });
}
```

### 3. Define Shared Schemas (Optional)

Create a file for shared component schemas:

```javascript
// src/lib/schemas.js

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

### 4. Use the Spec

#### In Your Svelte Components

```html
<script lang="ts">
	import spec from 'virtual:openapi-spec';

	console.log('Available paths:', Object.keys(spec.paths));
</script>

<h1>API Documentation</h1>
<pre>{JSON.stringify(spec, null, 2)}</pre>
```

#### Via Dev Middleware

During development, access the spec at:

```
http://localhost:5173/openapi-spec.json
```

#### After Build

If you set `outputPath`, the spec will be written to that location:

```
static/openapi.json
```

<a name="documentation"></a>

## 📚 Documentation

### Plugin Options

| Option            | Type       | Default     | Description                                           |
| ----------------- | ---------- | ----------- | ----------------------------------------------------- |
| `baseSchemasPath` | `string`   | `undefined` | Path to file with shared `@swagger` component schemas |
| `yamlFiles`       | `string[]` | `[]`        | Additional YAML files to merge into the spec          |
| `prependPath`     | `string`   | `''`        | Prefix to prepend to all paths (e.g., `/api`)         |
| `outputPath`      | `string`   | `undefined` | File path to write spec during build                  |
| `debounceMs`      | `number`   | `100`       | Debounce delay for HMR regeneration                   |

### SvelteKit Route Mapping

The plugin automatically converts SvelteKit route conventions to OpenAPI paths:

| SvelteKit Route                   | OpenAPI Path        | Notes                                     |
| --------------------------------- | ------------------- | ----------------------------------------- |
| `/api/users/+server.js`           | `/api/users`        | Standard route                            |
| `/api/users/[id]/+server.js`      | `/api/users/{id}`   | Path parameter                            |
| `/api/posts/[[page]]/+server.js`  | `/api/posts/{page}` | Optional parameter (document as optional) |
| `/api/(admin)/logs/+server.js`    | `/api/logs`         | Route groups ignored                      |
| `/api/files/[...path]/+server.js` | `/api/files/{path}` | Rest parameters                           |

### TypeScript Support

✅ **The plugin fully supports TypeScript files!** It automatically strips type annotations before parsing JSDoc, so you can write endpoints in TypeScript without issues.

**Example TypeScript endpoint:**

```typescript
// src/routes/api/posts/[id]/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Not found
 */
export const GET: RequestHandler = async ({ params }: { params: { id: string } }) => {
	const post = await getPost(params.id);
	if (!post) throw error(404, 'Post not found');
	return json(post);
};
```

The plugin handles TypeScript syntax internally using the TypeScript compiler API to ensure `@swagger` JSDoc blocks are properly extracted.

**Type definitions** for the virtual module are automatically available. If you need to explicitly reference them:

```typescript
/// <reference types="sveltekit-openapi-generator/ambient" />
```

### Path Parameters Example

```javascript
// src/routes/api/users/[id]/+server.js

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
 *         description: User found
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

<a name="integration-with-swagger-ui"></a>

## 🛠️ Integration with Swagger UI

You can easily add Swagger UI to visualize and test your API interactively:

### Installation

```bash
npm install swagger-ui-dist
```

### Create a Docs Route

Here's a production-ready example with reactive server URLs and robust error handling:

```html
<!-- src/routes/docs/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	import 'swagger-ui-dist/swagger-ui.css';

	let containerElement: HTMLElement | undefined;
	let spec: any = $state();

	// Get the current server URL reactively
	let currentOrigin = $derived(page.url.origin);

	// Create a modified spec with the current server URL
	let specWithServer = $derived({
		...spec,
		servers: [
			{
				url: currentOrigin,
				description: dev ? 'Development server' : 'Production server'
			}
		]
	});

	async function initializeSwaggerUI() {
		if (!containerElement) return;

		try {
			// Attempt to load a virtual spec module (Vite plugin) first
			try {
				// @ts-ignore - virtual import may not exist in all environments
				const virtualSpec = await import('virtual:openapi-spec');
				spec = virtualSpec?.default ?? virtualSpec;
			} catch (e) {
				// Fallback: fetch the openapi spec from the dev middleware
				try {
					const res = await fetch('/openapi-spec.json');
					if (res.ok) spec = await res.json();
					else spec = { openapi: '3.0.0', info: { title: 'API' }, paths: {} };
				} catch (fetchErr) {
					spec = { openapi: '3.0.0', info: { title: 'API' }, paths: {} };
				}
			}

			// @ts-ignore - swagger-ui-dist doesn't have types
			const { SwaggerUIBundle, SwaggerUIStandalonePreset } = await import('swagger-ui-dist');

			SwaggerUIBundle({
				spec: specWithServer,
				domNode: containerElement,
				deepLinking: true,
				presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset]
			});
		} catch (error) {
			console.error('Failed to initialize Swagger UI:', error);
		}
	}

	onMount(() => {
		initializeSwaggerUI();
	});
</script>

<svelte:head>
	<title>API Documentation</title>
</svelte:head>

<div class="swagger-container">
	<div id="swagger-ui-container" bind:this="{containerElement}"></div>
</div>

<style>
	.swagger-container {
		min-height: 600px;
		padding: 2rem;
	}

	/* Hide the default Swagger UI top bar */
	:global(.swagger-ui .topbar) {
		display: none;
	}

	/* Dark mode support for Swagger UI */
	@media (prefers-color-scheme: dark) {
		:global(.swagger-ui) {
			filter: invert(0.9) hue-rotate(180deg);
		}
	}
</style>
```

### Access Your Docs

Navigate to `/docs` in your browser to see the interactive API documentation!

The Swagger UI will automatically stay in sync with your spec changes during development thanks to HMR.

<a name="limitations--best-practices"></a>

## ⚠️ Limitations & Best Practices

### Known Limitations

1. **Manual Documentation Required** - The plugin does not infer types from your code; you must write `@swagger` JSDoc blocks
2. **No Runtime Validation** - The spec is generated at build/dev time and does not validate actual responses
3. **Client Bundle Size** - Importing the spec client-side adds to your bundle (~10-50KB gzipped)
4. **SvelteKit Actions** - Form action names must be manually documented

### Best Practices

✅ **Centralize Schemas**: Use `baseSchemasPath` to define shared types once  
✅ **Reference Components**: Use `$ref: '#/components/schemas/User'` instead of inline schemas  
✅ **Dev-Only Imports**: Consider only importing the spec in development mode  
✅ **Security**: Don't expose sensitive internal API details in public builds  
✅ **Route Groups**: Use `(groups)` for organization without affecting paths

<a name="troubleshooting"></a>

## 🔧 Troubleshooting

### Spec not updating?

- Check that files match the pattern: `src/routes/**/+{page.server,server}.{js,ts}`
- Verify `@swagger` blocks are present (not `@openapi`)
- Check browser console for plugin warnings

### TypeScript errors on import?

```typescript
// Add to src/app.d.ts
declare module 'virtual:openapi-spec' {
	import type { OpenAPIV3 } from 'openapi-types';
	const spec: OpenAPIV3.Document;
	export default spec;
}
```

### Paths not appearing?

- Ensure `prependPath` matches your actual route structure
- Check that path parameters use curly braces: `{id}` not `[id]`
- Verify the `@swagger` block is directly above the export function

<a name="contributing"></a>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

<a name="license"></a>

## 📄 License

MIT © Michael Obele

<a name="links-2"></a>

## 🔗 Links

- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [SvelteKit Documentation](https://kit.svelte.dev)

<a name="support"></a>

## 💬 Support

- [GitHub Issues](https://github.com/Michael-Obele/sveltekit-api-gen/issues)
- [Discussions](https://github.com/Michael-Obele/sveltekit-api-gen/discussions)
