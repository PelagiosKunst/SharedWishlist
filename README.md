# Wishlist

Wunschlisten teilen, ohne die Überraschung zu verderben: Die Person, der die Liste gehört, pflegt ihre Wünsche. Schenkende reservieren, legen bei Gruppengeschenken zusammen und hinterlassen sich Hinweise, ohne dass die Besitzerin oder der Besitzer der Liste davon etwas sieht.

- Produkt und Features: [docs/produkt/feature-inventar.md](docs/produkt/feature-inventar.md)
- Architekturentscheidungen: [docs/adr/](docs/adr/)
- Referenz-Prototyp aus der Konzeptphase: [docs/prototype/wunschliste-prototyp-v1.html](docs/prototype/wunschliste-prototyp-v1.html)

## Stack

SvelteKit 3 (Svelte 5, TypeScript) · Drizzle ORM mit SQLite (libSQL) · Vitest (Unit + Komponenten im Browser) · Playwright (E2E) · ESLint + Prettier · pnpm · Node 24 LTS

## Voraussetzungen

| Tool | Version   | Woher                                                                                      |
| ---- | --------- | ------------------------------------------------------------------------------------------ |
| Node | `24.21.0` | gepinnt in [.node-version](.node-version), z. B. über [fnm](https://github.com/Schniz/fnm) |
| pnpm | `12.9.1`  | gepinnt in `package.json` → `packageManager`, über `corepack enable pnpm`                  |
| Git  | aktuell   | –                                                                                          |

fnm wechselt beim Betreten des Ordners automatisch auf die richtige Node-Version, wenn es im Shell-Profil eingerichtet ist (PowerShell):

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

## Loslegen

```bash
corepack enable pnpm
cp .env.example .env
pnpm run setup      # Abhängigkeiten aus dem Lockfile, Chromium für Tests, Datenbank migrieren
pnpm run dev
```

Lokal wird keine Mail verschickt. Nach „Anmeldelink schicken“ steht der Link direkt auf der Seite (`LOGIN_LINK_ON_PAGE=1`) und zusätzlich im Server-Log.

## Umgebungsvariablen

| Variable             | Pflicht | Zweck                                                                                                    |
| -------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | ja      | libSQL-Adresse, lokal `file:local.db`, später Turso                                                      |
| `RESEND_API_KEY`     | nein    | Verschickt Anmeldelinks über Resend. Ohne Schlüssel nur Ausgabe im Log                                   |
| `MAIL_FROM`          | nein    | Absender, Standard `SharedWishlist <onboarding@resend.dev>` (geht nur an die eigene Adresse)             |
| `LOGIN_LINK_ON_PAGE` | nein    | `1` zeigt den Anmeldelink auf der Seite. Nur für Entwicklung und Tests, wirkungslos mit `RESEND_API_KEY` |

## Seiten

| Pfad               | Für          | Inhalt                                                       |
| ------------------ | ------------ | ------------------------------------------------------------ |
| `/anmelden`        | Besitzer\*in | E-Mail eingeben, Magic Link anfordern                        |
| `/liste`           | Besitzer\*in | Eigene Liste, „Über mich“, Teilen-Link, Spoiler-Schalter     |
| `/l/<token>`       | Schenkende   | Namen eintragen, Ideen ansehen, reservieren                  |
| `/l/<token>/g/<…>` | Schenkende   | Persönlicher Link, um auf einem zweiten Gerät weiterzumachen |

## Befehle

| Befehl                                | Zweck                                                       |
| ------------------------------------- | ----------------------------------------------------------- |
| `pnpm run dev`                        | Dev-Server mit Hot Reload                                   |
| `pnpm run verify`                     | **Alles prüfen** (Lint, Typen, Unit- und E2E-Tests), wie CI |
| `pnpm run test:unit`                  | Vitest im Watch-Modus                                       |
| `pnpm run test:e2e`                   | Playwright-Tests gegen einen Produktions-Build              |
| `pnpm run format`                     | Code formatieren                                            |
| `pnpm run db:generate` / `db:migrate` | Migration aus dem Schema erzeugen / anwenden                |
| `pnpm run db:studio`                  | Datenbank im Browser ansehen                                |

## Arbeitsweise

Siehe [CONTRIBUTING.md](CONTRIBUTING.md).
