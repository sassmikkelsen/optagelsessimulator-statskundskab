# Optagelseslaboratoriet

En statisk, browserbaseret scenariemodel til at undersøge mulig adgangsgrænse på en tænkt statskundskabsuddannelse. Åbn `index.html` eller udgiv mappen med GitHub Pages. Ingen data sendes til en server. Skrifttyper forsøges hentet fra Google Fonts; lokale reservefonte bruges ellers.

## Antagelser

- De oplyste 358 optagne fordelt på 4/53/188/101/12 i karakterintervallerne 2–4/4–6/6–8/8–10/10–12 bruges som tilnærmet fordeling. Uniform fordeling antages inden for hvert interval. Andelen i 10+ antages ligge mellem 10 og 12.
- 80 er et antaget effektivt ansøgerfelt for karakteroptag, ikke det faktiske antal ansøgere. Kvote 2-optagne antages at komme fra et særskilt felt.
- Effekten kan enten skaleres som antal ansøgere eller som en forskydning af andelen med 10+ mod den nationale andel på 27 %. En effekt på 5 % betyder 5 % af afstanden fra 3,4 % til 27 %, svarende til ca. 4,5 % på 10+. Fordelingen under 10 holdes uændret i indbyrdes forhold. Dette er en tænkt fordeling, ikke den fulde nationale profil. Kilden gælder alle optagne, inkl. optagne med ukendt karakter, ikke ansøgere; Sambach-tallene har en anden nævner.
- Intervallet viser 5.- til 95.-percentilen af 3.000 simulerede tilfældige felter givet fordelingerne. Det omfatter ikke usikkerheden om fordelingernes form eller fremtidig søgning.
- Når der er mindst lige så mange karakterpladser som ansøgere, vises ingen konkurrencebestemt adgangsgrænse. Modellen tager ikke højde for adgangskrav, prioriteter eller faktisk optagelsespraksis.

Kilde til national profil: [Professionshøjskolerne i tal 2025, figur 2.4.1](https://xn--danskeprofessionshjskoler-xtc.dk/wp-content/uploads/2026/02/Professionshoejskolerne-i-tal-2025_261158_0.33.pdf), baseret på Uddannelses- og Forskningsministeriets datavarehus, studiestart 2024.
