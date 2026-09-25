# dragref

Monorepo for [`dragref`](packages/dragref), a library that makes elements in a web app draggable into
AI clients such as Claude desktop. Usage docs live in the [package README](packages/dragref/README.md);
the payload rules and their evidence are in [docs/contract.md](docs/contract.md).

| Path               | Contents                                                     |
| ------------------ | ------------------------------------------------------------ |
| `packages/dragref` | The published package (`dragref`, `dragref/react`, `dragref/testing`) |
| `apps/playground`  | Next.js app with a `/library` page for manual drag checks    |

## Development

```sh
pnpm install
pnpm dev        # builds the package, then serves the playground on http://localhost:3100
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## Releasing

1. Bump `version` in `packages/dragref/package.json`.
2. From `packages/dragref`, run `npm publish`. `prepublishOnly` builds, tests, and runs `publint` and
   `attw` first.
