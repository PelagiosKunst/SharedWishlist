# Feature-Inventar

Abgeleitet aus dem Prototyp v1 (`docs/prototype/wunschliste-prototyp-v1.html`). Diese Datei ist die Grundlage für die Planung: Wir priorisieren hier, schneiden Meilensteine und pflegen den Status.

Status: `offen` · `geplant` · `in Arbeit` · `fertig`

## Rollen

| Rolle        | Beschreibung                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Besitzer\*in | Die Person, der die Liste gehört. Pflegt Wünsche und Profil, sieht standardmäßig keine Reservierungen. |
| Schenkende   | Eingeladene Personen. Reservieren, legen zusammen, schreiben Hinweise.                                 |
| Betrachtende | Haben nur Lesezugriff (im Prototyp: „Zum Reservieren fehlt dir der Zugriff“).                          |

## Funktionen aus dem Prototyp

### A. Liste und Profil (Besitzer\*in)

| ID  | Funktion                                                                      | Status |
| --- | ----------------------------------------------------------------------------- | ------ |
| A1  | Titel der Liste festlegen                                                     | offen  |
| A2  | „Gut zu wissen“: Größen, „Mag ich“, „Bitte nicht“                             | offen  |
| A3  | Bis zu 3 Anlässe mit Datum; Countdown, vergangene Anlässe werden ausgeblendet | offen  |

### B. Wünsche (Besitzer\*in)

| ID  | Funktion                                                                                     | Status |
| --- | -------------------------------------------------------------------------------------------- | ------ |
| B1  | Wunsch anlegen, bearbeiten: Titel (Pflicht), Shop-Link, Preis, Kategorie, Notiz              | offen  |
| B2  | Priorität: Wichtig / Gern / Irgendwann                                                       | offen  |
| B3  | Wunsch einem Anlass zuordnen (oder „für jeden Anlass“)                                       | offen  |
| B4  | Preisstand merken (Datum der letzten Preisänderung)                                          | offen  |
| B5  | Bild hochladen oder einfügen (Strg+V), verkleinert gespeichert                               | offen  |
| B6  | Wunsch als „Gemeinsam schenken“ markieren                                                    | offen  |
| B7  | Wunsch löschen mit Bestätigung; zugehörige Reservierungen, Beiträge und Hinweise mit löschen | offen  |
| B8  | „Bekommen“: Wunsch ins Archiv, mit Datum und Schenkenden; zurück auf die Liste möglich       | offen  |
| B9  | Spoilerschutz: Reservierungen, Beiträge und Hinweise ausgeblendet, per Schalter einblendbar  | offen  |

### C. Schenken (Schenkende)

| ID  | Funktion                                                                                     | Status |
| --- | -------------------------------------------------------------------------------------------- | ------ |
| C1  | Wunsch reservieren; gleichzeitige Reservierungen werden sicher abgewiesen                    | offen  |
| C2  | Eigene Reservierung zurücknehmen (solange nicht gekauft)                                     | offen  |
| C3  | Eigene Reservierung als gekauft markieren                                                    | offen  |
| C4  | Gruppengeschenk: Betrag beitragen, Fortschritt sehen, nicht über den Preis hinaus            | offen  |
| C5  | Eigenen Beitrag zurückziehen                                                                 | offen  |
| C6  | Hinweise für andere Schenkende schreiben und eigene löschen (Besitzer\*in kann alle löschen) | offen  |

### D. Finden und Filtern

| ID  | Funktion                                                           | Status |
| --- | ------------------------------------------------------------------ | ------ |
| D1  | Filter nach Kategorie                                              | offen  |
| D2  | Filter nach Anlass                                                 | offen  |
| D3  | Budget-Obergrenze                                                  | offen  |
| D4  | Nur freie Wünsche (für Schenkende)                                 | offen  |
| D5  | Sortierung: Wichtigkeit, Preis auf- und absteigend, neueste zuerst | offen  |

### E. Querschnitt

| ID  | Funktion                                                              | Status |
| --- | --------------------------------------------------------------------- | ------ |
| E1  | Rechte serverseitig prüfen (Besitzer\*in / Schenkende / Betrachtende) | offen  |
| E2  | Live-Aktualisierung, wenn andere reservieren                          | offen  |
| E3  | Helles und dunkles Design, mobil nutzbar, barrierearm                 | offen  |
| E4  | Oberfläche auf Deutsch                                                | offen  |

## Neu für das eigenständige Produkt

Im Prototyp hat die Claude-Laufzeit das übernommen; hier müssen wir es selbst bauen.

| ID  | Funktion                                                                 | Status |
| --- | ------------------------------------------------------------------------ | ------ |
| N1  | Konto und Anmeldung                                                      | offen  |
| N2  | Liste teilen (Einladungslink oder Einladung per E-Mail), Rollen vergeben | offen  |
| N3  | Mehrere Listen pro Person                                                | offen  |
| N4  | Bildspeicher (statt Bilder in der Datenbank)                             | offen  |

## Offene Produktfragen

1. **Anmeldung:** Magic Link, Passkeys, Passwort oder Login über Google/Apple?
2. **Schenkende ohne Konto:** Reicht ein geheimer Link mit Namenseingabe, oder brauchen alle ein Konto?
3. **Teilen:** Ein Link pro Liste oder persönliche Einladungen (widerrufbar)?
4. **Mehrere Listen:** Eine Liste pro Person oder z. B. auch für Kinder oder Paare?
5. **Benachrichtigungen:** E-Mail, wenn ein Anlass näher rückt oder ein Gruppengeschenk voll ist?
6. **Später:** Preis und Bild automatisch aus dem Shop-Link übernehmen?

## Meilensteine (Vorschlag)

| Meilenstein | Inhalt                                                                  |
| ----------- | ----------------------------------------------------------------------- |
| M0          | Entwicklungsumgebung, CI, Doku: **fertig**                              |
| M1          | Datenmodell, eine Liste mit Wünschen pflegen (A1–A2, B1–B3, B7)         |
| M2          | Anmeldung, Teilen, Reservieren mit Spoilerschutz (N1–N2, C1–C3, B9, E1) |
| M3          | Gruppengeschenke und Hinweise (B6, C4–C6)                               |
| M4          | Anlässe, Filter, Archiv, Bilder (A3, B4–B5, B8, D1–D5, N4)              |
