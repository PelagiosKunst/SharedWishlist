# Arbeitsweise

## Branches und Commits

- `main` ist immer grün und auslieferbar. Gearbeitet wird auf kurzlebigen Branches: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
- Commit-Nachrichten nach [Conventional Commits](https://www.conventionalcommits.org/de/): `feat: Wunsch reservieren`, `fix: …`, `test: …`, `docs: …`, `chore: …`.
- Merge nach `main` nur, wenn `pnpm run verify` lokal und die CI grün sind.

## Definition of Done für ein Feature

1. Akzeptanzkriterien im Feature-Inventar sind erfüllt.
2. Fachlogik hat Unit-Tests (`*.spec.ts` neben dem Code), UI-Komponenten mit Logik haben Komponententests (`*.svelte.spec.ts`).
3. Der wichtigste Nutzerpfad hat einen E2E-Test (`*.e2e.ts`).
4. Schemaänderungen sind als Migration eingecheckt (`pnpm run db:generate`), kein `db:push` auf geteilten Datenbanken.
5. Das Feature-Inventar ist aktualisiert (Status).

## Versionierung

- [Semantic Versioning](https://semver.org/lang/de/) in `package.json`; Releases werden als Git-Tag `vX.Y.Z` markiert.
- Bis zur ersten öffentlichen Version bleiben wir bei `0.x`.

## Reproduzierbarkeit

- Node-Version: `.node-version`, pnpm-Version: `packageManager` in `package.json`. Bitte nicht lokal abweichen.
- Abhängigkeiten nur mit `pnpm add` hinzufügen; `pnpm-lock.yaml` wird immer mit eingecheckt.
- Installation in CI und beim Setup mit `--frozen-lockfile`.
- Zeilenenden sind über `.gitattributes` auf LF festgelegt.
- Größere technische Entscheidungen werden als ADR in `docs/adr/` festgehalten.
