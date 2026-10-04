# Feature-Inventar

Abgeleitet aus dem Prototyp v1 (`docs/prototype/wunschliste-prototyp-v1.html`). Diese Datei ist die Grundlage für die Planung: Wir priorisieren hier, schneiden Meilensteine und pflegen den Status.

Status: `offen` · `geplant` · `in Arbeit` · `fertig`

## Rollen

| Rolle        | Beschreibung                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Besitzer\*in | Die Person, der die Liste gehört. Meldet sich per Magic Link an (nur E-Mail, kein Passwort). Pflegt Wünsche und Profil, sieht standardmäßig keine Reservierungen.        |
| Schenkende   | Bekommen nur den Teilen-Link, tragen ihren Namen ein und sind damit auf diesem Gerät bekannt. Kein Konto, keine E-Mail. Reservieren, legen zusammen, schreiben Hinweise. |

Die Rolle „Betrachtende“ aus dem Prototyp entfällt: Wer den Link hat, darf schenken. Siehe [ADR 0002](../adr/0002-identitaet-magic-link-und-teilen-link.md).

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

| ID  | Funktion                                                                                                                                                                        | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| N1  | Besitzer\*in meldet sich per Magic Link an (E-Mail eingeben → Link anklicken → angemeldet)                                                                                      | offen  |
| N2  | Teilen-Link pro Liste (geheimes Token in der URL); Besitzer\*in kann ihn neu erzeugen, der alte wird ungültig                                                                   | offen  |
| N3  | Schenkende tragen beim ersten Öffnen ihren Namen ein; das Gerät merkt sich das per Cookie. Ist der Name in der Liste schon vergeben, wird ein Zusatz verlangt (z. B. „Anna M.“) | offen  |
| N4  | Persönlicher Link für Schenkende, um auf einem anderen Gerät weiterzumachen                                                                                                     | offen  |
| N5  | Öffnet die Besitzerin oder der Besitzer den Teilen-Link, landet sie oder er in der eigenen Ansicht (Spoilerschutz)                                                              | offen  |
| N6  | E-Mail-Versand für Magic Links über Resend (in der Entwicklung nur Ausgabe in der Konsole)                                                                                      | offen  |
| N7  | Genau eine Liste pro Person                                                                                                                                                     | offen  |
| N8  | Bildspeicher (statt Bilder in der Datenbank)                                                                                                                                    | offen  |

## Offene Produktfragen

Entschieden (2026-10-04):

- Besitzer\*in per Magic Link, Schenkende nur per Teilen-Link mit Namenseingabe, ein Link pro Liste (ADR 0002).
- Genau eine Liste pro Person.
- E-Mail-Versand über Resend.
- Gleiche Namen in einer Liste: Zusatz wird verlangt.
- Keine Benachrichtigungen. Die einzige E-Mail ist der Magic Link. Kann später nachgerüstet werden.

Noch offen:

1. **Später:** Preis und Bild automatisch aus dem Shop-Link übernehmen?

## Meilensteine (Vorschlag)

| Meilenstein | Inhalt                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| M0          | Entwicklungsumgebung, CI, Doku: **fertig**                                    |
| M1          | Datenmodell, eine Liste mit Wünschen pflegen (A1–A2, B1–B3, B7)               |
| M2          | Magic Link, Teilen-Link, Reservieren mit Spoilerschutz (N1–N6, C1–C3, B9, E1) |
| M3          | Gruppengeschenke und Hinweise (B6, C4–C6)                                     |
| M4          | Anlässe, Filter, Archiv, Bilder (A3, B4–B5, B8, D1–D5, N8)                    |
