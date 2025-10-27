# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- CLI command for manual spec generation
- OpenAPI schema validation
- Support for OpenAPI 3.1
- Plugin options validation

## [0.1.0] - 2025-10-26

### Added

- Initial release of SvelteKit OpenAPI Generator
- Vite plugin for automatic OpenAPI spec generation
- Support for `+page.server.{js,ts}` and `+server.{js,ts}` files
- Virtual module (`virtual:openapi-spec`) for importing specs
- Dev middleware serving spec at `/openapi-spec.json`
- HMR support for live spec regeneration
- Base spec support for shared schemas and metadata
- External YAML file integration
- Route path transformation (SvelteKit → OpenAPI format)
- TypeScript declarations for virtual module
- Build-time spec file generation

### Dependencies

- swagger-jsdoc@^6.2.8 for JSDoc parsing
- openapi-merge@^1.3.3 for spec merging
- glob@^10.3.12 for file scanning

[Unreleased]: https://github.com/Michael-Obele/sveltekit-api-gen/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Michael-Obele/sveltekit-api-gen/releases/tag/v0.1.0
