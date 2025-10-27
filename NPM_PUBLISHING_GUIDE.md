# npm Publishing Guide (2025 Edition)

> Complete reference guide for publishing `sveltekit-openapi-generator` and future npm packages

## 📋 Pre-Publication Checklist

### 1. Build Your Package
```bash
npm run package
```
- Automatically runs via `prepublishOnly` hook
- Verify it completes without errors
- Check that `dist/` folder is generated

### 2. Preview Package Contents
```bash
npm pack
```
- Creates `.tgz` file (e.g., `sveltekit-openapi-generator-0.1.0.tgz`)
- Shows exactly what will be published
- Verify it includes:
  - ✅ `dist/` folder with compiled code
  - ✅ `README.md`
  - ✅ `LICENSE`
  - ✅ `CHANGELOG.md`

### 3. Test Package Locally (Recommended)
```bash
# Create a test project
mkdir ../test-project
cd ../test-project
npm init -y

# Install the packed version
npm install ../sveltekit-api-gen/sveltekit-openapi-generator-0.1.0.tgz

# Test importing and using the package
```

### 4. Verify Package Name Availability
```bash
npm view sveltekit-openapi-generator
```
- If it shows `npm error 404`, the name is available! ✅
- If it shows package info, the name is taken ❌

---

## 🚀 Publishing Steps

### 1. Login to npm (Modern Browser Flow)
```bash
npm login
```
- Opens browser for OAuth authentication (no terminal prompts in 2025!)
- Requires 2FA code from authenticator app
- Verify login with: `npm whoami`

### 2. Dry Run (Optional but Recommended)
```bash
npm publish --dry-run
```
- Shows what would happen without actually publishing
- Final safety check before real publish

### 3. Publish to npm Registry
```bash
npm publish
```
**For this package:**
- No `--access=public` flag needed (unscoped package)
- Public by default

**For scoped packages** (`@username/package`):
```bash
npm publish --access public
```

---

## 📌 Post-Publication Steps

### 1. Tag Your Release in Git
```bash
git tag v0.1.0
git push origin v0.1.0
```

### 2. Create GitHub Release
1. Go to: https://github.com/Michael-Obele/sveltekit-api-gen/releases/new
2. Select tag: `v0.1.0`
3. Release title: `v0.1.0`
4. Description: Copy from `CHANGELOG.md`
5. Click **"Publish release"**

### 3. Verify Publication
- Visit: https://www.npmjs.com/package/sveltekit-openapi-generator
- Test installation: `npm install sveltekit-openapi-generator`

### 4. Share the News! 🎉
- Post on Twitter/X with #SvelteKit #OpenAPI
- Share on Reddit r/sveltejs
- Update project README with npm badge

---

## 🔄 Future Updates & Versioning

### Understanding Semantic Versioning (semver)
Format: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **PATCH** (0.1.0 → 0.1.1): Bug fixes, no API changes
- **MINOR** (0.1.0 → 0.2.0): New features, backward compatible
- **MAJOR** (0.1.0 → 1.0.0): Breaking changes

### Patch Release (Bug Fixes)
```bash
# Update CHANGELOG.md first!
npm version patch
npm publish
git push origin main --tags
```

### Minor Release (New Features)
```bash
# Update CHANGELOG.md first!
npm version minor
npm publish
git push origin main --tags
```

### Major Release (Breaking Changes)
```bash
# Update CHANGELOG.md first!
npm version major
npm publish
git push origin main --tags
```

---

## 🛠️ Troubleshooting

### "npm error 403: You do not have permission to publish"
**Solutions:**
- Run `npm whoami` to verify you're logged in
- Check if package name is already taken: `npm view <package-name>`
- Ensure you own the package (if updating)

### "npm error 401: Unauthorized"
**Solutions:**
- Your npm session expired, run `npm login` again
- Verify 2FA codes are working
- Check that you're using the correct npm account

### "Package already published with this version"
**Solutions:**
- You can't republish the same version
- Run `npm version patch` to bump version
- Update `CHANGELOG.md` before versioning

### "ENOENT: no such file or directory, open 'dist/index.js'"
**Solutions:**
- Run `npm run package` to build the package
- Check that `dist/` folder is generated
- Verify `prepublishOnly` script is configured

### Build Fails During `npm publish`
**Solutions:**
- Test build locally: `npm run package`
- Check for TypeScript errors: `npm run check`
- Ensure all dependencies are installed: `npm install`

---

## ⚙️ Configuration Reference

### package.json Key Fields
```json
{
  "name": "sveltekit-openapi-generator",
  "version": "0.1.0",
  "description": "Generate OpenAPI 3.0 specifications from SvelteKit server endpoints",
  "type": "module",
  "license": "MIT",
  "author": "Michael Obele <https://github.com/Michael-Obele>",
  "repository": {
    "type": "git",
    "url": "https://github.com/Michael-Obele/sveltekit-api-gen"
  },
  "keywords": [
    "sveltekit",
    "openapi",
    "swagger",
    "vite-plugin",
    "api-documentation"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "scripts": {
    "package": "svelte-kit sync && svelte-package && publint",
    "prepublishOnly": "npm run package"
  }
}
```

### Important Scripts
- `prepublishOnly`: Runs automatically before `npm publish`
- `package`: Builds the library for distribution
- Always runs before publishing to ensure fresh build

---

## 🔐 Security Best Practices (2025)

### Authentication
- ✅ **Browser-based OAuth** is now standard (no terminal prompts)
- ✅ **2FA is required** for all npm accounts
- ✅ Use **automation tokens** for CI/CD (not personal tokens)

### Package Security
- Run `npm audit` before publishing
- Keep dependencies updated
- Review `npm pack` output for sensitive files
- Use `.npmignore` or `files` field to control what's published

### Access Tokens
**For CI/CD (GitHub Actions):**
1. Go to: https://www.npmjs.com/settings/your-username/tokens
2. Create new token → Type: **Automation**
3. Add to GitHub secrets: `NPM_TOKEN`

**Never commit tokens to git!**

---

## 📊 Monitoring Your Package

### Check Package Stats
- Downloads: https://www.npmjs.com/package/sveltekit-openapi-generator
- npm trends: https://npmtrends.com/sveltekit-openapi-generator
- Bundlephobia: https://bundlephobia.com/package/sveltekit-openapi-generator

### Update README with Badges
```markdown
[![npm version](https://badge.fury.io/js/sveltekit-openapi-generator.svg)](https://www.npmjs.com/package/sveltekit-openapi-generator)
[![npm downloads](https://img.shields.io/npm/dm/sveltekit-openapi-generator.svg)](https://www.npmjs.com/package/sveltekit-openapi-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

---

## 📝 Pre-Publish Workflow (Recommended)

### Step-by-Step Checklist
- [ ] Update version in `CHANGELOG.md`
- [ ] Document all changes in `CHANGELOG.md`
- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Build package: `npm run package`
- [ ] Preview contents: `npm pack`
- [ ] Test locally: Install `.tgz` in test project
- [ ] Commit all changes: `git commit -am "chore: prepare v0.1.0 release"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Ensure CI passes (GitHub Actions)
- [ ] Login to npm: `npm login`
- [ ] Dry run: `npm publish --dry-run`
- [ ] Publish: `npm publish`
- [ ] Tag release: `git tag v0.1.0 && git push origin v0.1.0`
- [ ] Create GitHub release
- [ ] Verify on npmjs.com
- [ ] Test installation: `npm install sveltekit-openapi-generator`
- [ ] Share announcement 🎉

---

## 🔗 Useful Resources

### Official Documentation
- npm CLI: https://docs.npmjs.com/cli/v10
- Publishing packages: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- Semantic versioning: https://semver.org/

### Tools
- Package name checker: https://www.npmjs.com/package/<package-name>
- Bundle size checker: https://bundlephobia.com/
- npm trends: https://npmtrends.com/
- publint (linter): https://publint.dev/

### Community
- npm support: https://www.npmjs.com/support
- GitHub issues: https://github.com/Michael-Obele/sveltekit-api-gen/issues

---

## 📅 Version History

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | 2025-10-27 | Initial release |

---

**Last Updated:** October 27, 2025  
**Package:** sveltekit-openapi-generator  
**Repository:** https://github.com/Michael-Obele/sveltekit-api-gen
