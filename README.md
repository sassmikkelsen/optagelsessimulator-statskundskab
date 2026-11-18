# Optagelseslaboratoriet

En statisk, browserbaseret scenariemodel for en tænkt statskundskabsuddannelse. Åbn `index.html` eller udgiv mappen med GitHub Pages. Ingen data sendes til en server. Skrifttyper forsøges hentet fra Google Fonts; lokale reservefonte bruges ellers.

Man vælger samlet optag, andel kvote 2, et uafhængigt antal ansøgere til karakteroptag og en tiltrækningseffekt. Et scenario kan gemmes som sammenligningskurve i browserens lokale lager. Ældre gemte scenarier med den tidligere model bevares under deres oprindelige nøgle, men vises ikke som direkte sammenlignelige med den nye model.

## Beregning og antagelser

- 80 er det omtrentlige tidligere antal optagne på Politik og Forvaltning; det er ikke et registreret ansøgertal. Procentændringen i brugerfladen sammenligner derfor scenariets antal ansøgere med et antal optagne.
- Det valgte ansøgertal betegner kvalificerede ansøgere, som er til rådighed for karakteroptag, ikke alle KOT-ansøgninger. Kvote 2-optagne antages at komme fra et særskilt felt. Kvote 1-pladserne er samlet optag × (1 − kvote 2-andel), afrundet til nærmeste hele person.
- De oplyste 358 optagne fordelt på 4/53/188/101/12 i karakterintervallerne 2–4/4–6/6–8/8–10/10–12 bruges som tilnærmet Sambach-fordeling. Uniform fordeling antages inden for hvert interval. Andelen i 10+ antages at ligge mellem 10 og 12.
- Den **konstruerede nationale reference**, som ikke er en observeret fuld fordeling, er kalibreret til 27 % i 10–12 og et gennemsnit på 8,8. De to nøgletal dækker forskellige populationer: 27 % er af alle universitetsoptagne i 2024, inkl. ukendt karakter; 8,8 er gennemsnittet blandt dem med en registreret karakter. Tilnærmelsen er derfor kun illustrativ. De resterende 73 % fordeles på de lavere intervaller ved at vægte de fire oprindelige kategorier med `exp(0.4519323 × midtpunkt)` og normalisere. Dette giver omtrentlige andele 0,104 %, 3,410 %, 29,867 %, 39,619 % og 27 % i de fem intervaller.
- Tiltrækningseffekten `e` er en blanding: `(1 − e/100) × Sambach + (e/100) × reference`. Ansøgertallet fastholdes. Ved 5 % er det 95 % Sambach-profil og 5 % af den konstruerede reference. Hverken profilen eller effekten er en prognose.
- For hver optagsstørrelse simuleres 3.000 ansøgerfelter. Kurven viser medianen og båndet 5.- til 95.-percentilen. Intervallet omfatter tilfældig variation givet modellen, ikke usikkerhed om fordelingernes form eller fremtidig søgning.
- Når der er mindst lige så mange karakterpladser som ansøgere, vises ingen konkurrencebestemt adgangsgrænse. Modellen tager ikke højde for faktisk overlap mellem kvoter, adgangskrav, prioriteter eller optagelsespraksis.

Kilder til de nationale referencepunkter: [Professionshøjskolerne i tal 2025, figur 2.4.1](https://xn--danskeprofessionshjskoler-xtc.dk/wp-content/uploads/2026/02/Professionshoejskolerne-i-tal-2025_261158_0.33.pdf), baseret på Uddannelses- og Forskningsministeriets datavarehus (kildens link var utilgængeligt ved kontrol), og [AAU's strategiske uddannelsesdata, figur 12](https://www.aaudxp-cms.aau.dk/media/3wfbvgv1/m%C3%B8dematerialer-www-bm-5-2025-d4982762.pdf), baseret på Uddannelses- og Forskningsministeriets Datavarehus (ElevBasis).
