# Wishlist – Hinweise für Claude

- Sprache: Oberfläche, Doku und Commit-Beschreibungen auf Deutsch; Code-Bezeichner auf Englisch.
- Paketmanager ist **pnpm** (gepinnt), niemals npm oder yarn für Installationen benutzen.
- Vor jedem Abschluss: `pnpm run verify` (Lint, Typen, Unit- und E2E-Tests).
- Svelte 5 mit Runes (`$state`, `$derived`, `$props`), keine Legacy-Syntax (`export let`, `$:`).
- Datenbankzugriff nur serverseitig unter `src/lib/server/`. Schemaänderungen immer mit `pnpm run db:generate` als Migration.
- Rechte (Besitzer\*in / Schenkende) werden auf dem Server geprüft, nie nur in der UI.
- Spoilerschutz ist eine Kernanforderung: Daten über Reservierungen, Beiträge und Hinweise dürfen nicht an die Besitzerin oder den Besitzer der Liste ausgeliefert werden, solange der Spoiler-Schalter aus ist.
- Features und Status pflegen in `docs/produkt/feature-inventar.md`; technische Entscheidungen als ADR in `docs/adr/`.
- Windows-Entwicklung: Node kommt über fnm, Zeilenenden sind LF (`.gitattributes`).
