# German and French terminology comparison

Compared on 6 October 2026 against the previous website, which the site owner
identifies as auditor-proofread. This comparison covers general website text, not
news/event article bodies. The reference is the published website; no separate
auditor sign-off document was available.

## Result

Updated 112 dictionary entries across German and French: 92 existing translations
and 20 newly covered work-package number labels. The German generated news category
and empty-state labels also now use **Nachrichten** consistently.

The [per-entry comparison](translation-alignment.json) records the original text,
replacement, reference URL, reference wording and whether the change copies a
corresponding passage/label or adapts terminology in newly written text. It also
lists the source pages consulted. Unchanged entries are not certified as reviewed
by this comparison.

| English concept | German reference wording | French reference wording |
| --- | --- | --- |
| Work packages | Arbeitsgruppen (AG) | Modules de Travail (MT) |
| Research focus | Forschungsfokus | Recherche axée |
| Midlands | Mittelland | Moyen-pays |
| Energy transition | Energiewende | transition énergétique |
| SWEET funding programme | Förderprogramm | programme d’encouragement |
| Advisory board | Beirat | Conseil Consultatif |
| Project management team | Einheit Projektmanagement | Unité de gestion de projet |
| Media & outreach | Medien & Wissenstransfer | Médias et Diffusion |

Main references: [German home](https://www.sweet-edge.ch/de/home),
[French home](https://www.sweet-edge.ch/fr/home),
[German work packages](https://www.sweet-edge.ch/de/work-packages/overview),
[French work packages](https://www.sweet-edge.ch/fr/modules-de-travail/vue-d-ensemble),
[German team](https://www.sweet-edge.ch/de/team),
[French team](https://www.sweet-edge.ch/fr/team),
[German media](https://www.sweet-edge.ch/de/artikel-produkte/medien-et-wissenstransfer),
[French media](https://www.sweet-edge.ch/fr/repertoire/medias-et-diffusion).
Individual work-package pages provide the technical terminology recorded in the JSON.

## What is and is not reviewed wording

- Corresponding homepage tagline and SWEET funding-programme paragraph reuse the
  published translations. Corresponding work-package headings and navigation/role
  labels reuse the source wording where the meaning matches.
- The new website contains rewritten summaries. Their terminology now follows the
  reference, but the complete new sentences have not been proofread by the auditors.
  For example, the new WP7 heading includes “renewable”; this meaning was retained
  while adopting the source terminology.
- Regional and technical terms were aligned across the dictionaries, including
  French *micro-réseaux*, *multi-énergie*, *socio-économique*, *chauffage urbain*,
  *acceptation sociale* and *modèles commerciaux*. These are adaptations, not copies
  of approved full paragraphs.
- Bibliographic titles, names, links, images and English source text were preserved.
  This work does not revise the separately stored news/event translations.

## Source differences requiring a content decision

1. The previous website lists **11 work packages**, including
   [WP11: coordination of scenarios and modeling](https://www.sweet-edge.ch/en/work-packages/wp-11).
   The new website describes 10. This is an English content/scope difference;
   translation changes alone cannot resolve it.
2. The current [legacy WP5 description](https://www.sweet-edge.ch/en/work-packages/wp-5)
   specifically describes work in Wittenbach, including rooftop PV deployment and
   biomass activities. The new English summary is different. Its translated body
   was not replaced wholesale with the legacy description.
3. The legacy German/French disclaimer and imprint pages retain English body text.
   They do not establish reviewed German/French legal wording. The new privacy text
   also describes different website services and should not inherit old claims.
4. New interface labels, accessibility text, metadata and rewritten sections do not
   always have a direct legacy counterpart. They retain their translations unless
   covered by an evidenced terminology correction. The legacy acronym-list URL
   returned 404 and could not be used as a reference.

## Editing policy

Edit `translations/de.json` and `translations/fr.json` for general website text.
Keep the English keys intact. Use the reviewed terminology above when adding new
text, but distinguish terminology alignment from proofreading of a full passage.
