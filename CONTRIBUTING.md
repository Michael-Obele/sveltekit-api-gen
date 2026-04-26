# Contributing

Thanks for helping improve `sveltekit-openapi-generator`.

## Before You Commit

Run the test suite before committing changes:

```bash
bunx vitest run
```

If your change touches package output or published files, also run:

```bash
npm run package
```

## Recommended Workflow

1. Make your change.
2. Run `bunx vitest run`.
3. Fix any failing tests.
4. Run `npm run package` if the change affects built output.
5. Commit once both checks are green.

## Good PRs

Keep changes focused, include tests for behavioral changes, and call out any generated artifacts that changed as a result of the update.
