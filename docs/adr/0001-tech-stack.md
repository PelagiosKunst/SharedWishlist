# ADR 0001: Tech-Stack

- Status: angenommen
- Datum: 2026-10-04

## Kontext

Der Prototyp (`docs/prototype/`) ist eine einzelne HTML-Seite, die Speicherung, Rechte und Nutzerprofile der Claude-Artefakt-Laufzeit nutzt. Für ein eigenständiges Produkt brauchen wir ein eigenes Backend mit Datenbank, Authentifizierung und Rechteprüfung, eine stabile Testbasis und eine reproduzierbare Umgebung unter Windows und in CI.

## Entscheidung

- **SvelteKit 3 / Svelte 5 + TypeScript**: Frontend und Server-Logik (Load-Funktionen, Form-Actions) in einem Projekt, wenig Boilerplate. `adapter-node` für einen normalen Node-Server.
- **Drizzle ORM + SQLite über libSQL** (`@libsql/client`): keine Datenbank-Infrastruktur für die Entwicklung, fertige Binaries für Windows, später ohne Codeänderung auf Turso und mit überschaubarem Aufwand auf Postgres umstellbar. Der Treiber `node:sqlite` wurde verworfen, weil Drizzle ihn nur in der 1.0-RC unterstützt.
- **Vitest** für Unit-Tests (Node) und Komponententests (echter Browser über Playwright), **Playwright** für E2E.
- **pnpm** mit gepinnter Version über corepack, **Node 24 LTS** gepinnt über `.node-version`.
- **GitHub Actions** als CI (Lint, Typen, Tests, Build).

## Konsequenzen

- Zwei Laufzeiten werden gepinnt (Node, pnpm), alle Entwickler brauchen fnm (oder ein Äquivalent) und corepack.
- SQLite heißt: ein Schreibprozess. Für die erwartete Last reicht das; ein Umstieg ist über ein neues ADR möglich.
- Docker ist für die Entwicklung nicht nötig. Ein Devcontainer kann später ergänzt werden.
