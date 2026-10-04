# ADR 0002: Identität per Magic Link und Teilen-Link

- Status: angenommen
- Datum: 2026-10-04

## Kontext

Wishlist ist ein kleiner Dienst. Für ein paar Geschenke im Jahr legt sich niemand ein Konto an oder merkt sich ein Passwort. Trotzdem müssen wir wissen, wem eine Liste gehört, wer was reserviert hat, und den Spoilerschutz serverseitig durchsetzen.

## Entscheidung

**Besitzer\*in: Magic Link per E-Mail**

- E-Mail eingeben → einmaliger Link per Mail (gültig 15 Minuten, nur einmal nutzbar) → angemeldet.
- Danach Sitzungs-Cookie (`httpOnly`, `secure`, `sameSite=lax`), gültig 30 Tage, verlängert sich bei Nutzung.
- Tokens werden nur gehasht (SHA-256) gespeichert. Anfragen pro E-Mail und IP sind begrenzt.
- In der Entwicklung wird der Link in der Konsole ausgegeben statt verschickt.

**Schenkende: Teilen-Link + Name**

- Jede Liste hat einen Teilen-Link `/l/<token>` mit einem zufälligen, nicht erratbaren Token (mindestens 128 Bit).
- Beim ersten Öffnen trägt man den eigenen Namen ein. Der Server legt eine Gast-Identität an und setzt ein Geräte-Cookie (zufälliges Token, gehasht gespeichert).
- Für ein zweites Gerät gibt es einen persönlichen Link, der diese Gast-Identität wiederherstellt.
- Die Besitzerin oder der Besitzer kann den Teilen-Link neu erzeugen. Der alte Link wird dann ungültig, bestehende Gast-Identitäten bleiben erhalten.

**Spoilerschutz**

- Öffnet eine angemeldete Besitzerin oder ein angemeldeter Besitzer den eigenen Teilen-Link, wird sie oder er in die Besitzer-Ansicht umgeleitet.
- Reservierungen, Beiträge und Hinweise werden an die Besitzer-Ansicht nur ausgeliefert, wenn der Spoiler-Schalter aktiv ist.

**Umsetzung**

- Eigene, kleine Implementierung (Tabellen für Nutzer, Sitzungen, Login-Tokens, Gäste) statt eines großen Auth-Frameworks. Der Umfang ist überschaubar und wir behalten die volle Kontrolle über den Gast-Mechanismus.

## Konsequenzen

- Wer den Teilen-Link hat, kann reservieren. Weitergeleitete Links sind also gewollt, aber nicht kontrollierbar. Das Neu-Erzeugen des Links ist die Notbremse.
- Ohne E-Mail-Versand funktioniert die Anmeldung in Produktion nicht. Wir brauchen einen Mail-Anbieter (offene Frage im Feature-Inventar).
- Löscht jemand Cookies und hat den persönlichen Link nicht gespeichert, muss er oder sie den Namen neu eintragen. Eigene Reservierungen sind dann nicht mehr zurücknehmbar. Für diesen Fall kann die Besitzerin oder der Besitzer später Gast-Identitäten zusammenführen.

## Umsetzungsnotizen (M2)

- **Einlösen nur per Knopf:** Der Link aus der Mail (`/anmelden/<token>`) öffnet eine Seite mit „Jetzt anmelden“. Eingelöst wird erst per POST. Viele Mailprogramme und Virenscanner rufen Links vorab auf und würden einen Einmal-Link sonst verbrauchen. Dasselbe gilt für den persönlichen Link der Schenkenden.
- **Cookies:** `session` (Besitzer\*in, `httpOnly`, `sameSite=lax`, 30 Tage, verlängert sich ab 15 Tagen Restlaufzeit) und `guest_<listId>` (Schenkende, Pfad `/l`, 400 Tage, das Browser-Maximum).
- **Spoilerschutz auf dem Server:** `/liste` lädt Reservierungen nur mit `?spoiler=1`. Ohne den Parameter verlassen weder Namen noch Status den Server.
- **Gleiche Namen:** Ein eindeutiger Index auf `(list_id, name_key)` verhindert Doppelungen auch bei gleichzeitigen Anmeldungen.
- **Begrenzung:** Höchstens 3 Anmeldelinks pro E-Mail-Adresse in 15 Minuten. Eine Begrenzung pro IP fehlt noch und kommt mit dem Deployment.
- **Tests:** `LOGIN_LINK_ON_PAGE=1` zeigt den Link auf der Seite, damit E2E-Tests ohne Mailversand anmelden können. Das greift nur ohne `RESEND_API_KEY` und nur, wenn die Seite über `localhost` aufgerufen wird. Auf einem echten Server darf die Variable trotzdem nie gesetzt sein.
