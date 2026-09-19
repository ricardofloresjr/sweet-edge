# SFOE communication and dissemination review

Reviewed: 17 September 2026. Basis: user-supplied *SWEET Programme — Communication & Dissemination Guideline*, version 4, June 2026, all 15 pages (visual review of logo and website specifications on pp. 12–15).

Scope: local website source, shared header/footer, homepage, translation mechanism and dictionaries, consortium description, output pages and publication-link structure. This is a technical/editorial review, not SFOE approval. The live deployment, individual external publications, social accounts and consortium approval records were not audited in full.

## Website requirements (§6.4)

| Requirement | Finding and action | Status |
| --- | --- | --- |
| Consortium-specific SWEET logo | Existing `images/sweet-edge-logo.png` is used in the shared header; visually consistent with the supplied example. User confirmed SFOE supplied the logo. | Present; provenance confirmed by user |
| SFOE logo | Existing `images/logo-SFOE.png` appears in the shared footer on the landing page, separate from the SWEET logo. Retained without alteration. | Present |
| Funding acknowledgement (§6.2) | Shared footer and homepage now identify EDGE, the SFOE SWEET programme and joint coordination by University of Geneva and EPFL. French and German versions added. | Corrected locally |
| SWEET programme link | Added explicit footer link to https://www.bfe.admin.ch/en/sweet, verified against the official SFOE programme page. | Corrected locally |
| Website disclaimer | Added exact English wording from §6.4 to the shared footer and disclaimer page, plus French/German translations. | Corrected locally |
| Short project-portfolio description | Added explicit summary of modelling, grid integration, pilots/demonstrators, policy, markets and acceptance across cities, midlands and Alps. | Corrected locally |
| White background and banner image | Global page background and landing-page content are white; image carousel is present. Decorative gradient strips and light panels remain. Final acceptance of the visual design belongs to SFOE. | Present |
| English and at least one national language | EN/FR/DE selector exists. Previously only headings, lead paragraphs and selected labels were translated. Main homepage description, portfolio, programme text, funding acknowledgement and disclaimer are now translated; inner-page body text, controls, news and some embedded banner text still require translation/review. | Partial — not full multilingual compliance |
| Domain `www.sweet-acronym.ch` | Website refers to `sweet-edge.ch`; actual domain configuration and live deployment are outside this local review. | Deployment verification needed |

## Content and publication findings

- **§2.2.2: evidence, interpretations and assumptions.** REO cards contain source links. Added a note distinguishing scenario results from forecasts/guarantees. This does not independently validate each scientific claim. In particular, the affordability figure and cross-scenario generalisations need checking against the cited report sections.
- **§2.2.2: recommendations.** Policy cards use imperative wording (for example, “Adopt MuKEn 2025 quickly”) without individual report/page citations. Added an explanatory note that they are policy options rather than government positions. Before publication, map each recommendation to robust, relevant results, identify the intended stakeholder and use an appropriate advisory formulation. A general note does not cure unsupported recommendations. Substantive scientific/policy wording was not rewritten without that evidence mapping.
- **§6.6: terminology.** Corrected homepage hyphenated self-references and the overview's use of “project” for the consortium; clarified the portfolio of projects. Corrected the overview's expansion of EDGE to “Enabling Decentralized renewable GEneration in the Swiss cities, midlands, and the Alps.” Bibliographic titles and third-party titles were preserved as published. Further editorial review should distinguish official names and quoted titles from the site's own prose.
- **§6.3: public access.** Replaced the expiring authentication-token URL for White Paper 2 with its persistent DOI (`10.48620/96056`). Many Publications entries have no public link; a DOI alone also does not establish open access. Check each output for a public full-text copy, any embargo, reason for restricted access, and opening date. Check data availability, including anonymised/aggregated versions where required. No availability or embargo dates were invented.
- **§6.2 and §6.5: external reports.** The website disclaimer does not substitute for acknowledgements, sole-author-responsibility statements or correct templates inside downloadable reports, videos or slides. Those external files require a separate output-level check.
- **§3.1: policy brief/white paper language.** The guideline specifies German or French, with separate documents per language when multiple languages are needed. Confirm applicable national-language editions of linked white papers; translating website labels does not satisfy this document requirement. The treatment of pre-June-2026 outputs should be confirmed with SFOE rather than assumed retroactive.
- **Site maintenance (§4.1.3).** Corrected malformed section/container nesting in the policy page. Newsletter form still contains `YOUR_NEWSLETTER_FORM_ID`; it needs a real endpoint before the subscription flow can be used. News freshness and partner placeholders also need the consortium's current content.

## Evidence/actions still needed from the consortium

1. **Website approval (§4.1.3):** retain SFOE's pre-launch approval and confirm the reviewed version covers the intended site. Logo provenance confirmation is not website approval.
2. **Policy-content approval (§§3, 4.1.1):** obtain or retain SFOE/Monitoring Panel Head review records for applicable policy-relevant outputs. The guideline describes approximately four working weeks per review cycle, and roughly two for press releases (§4.1.2). No approval was inferred, and nothing was submitted or published by this review.
3. **Internal QA (§2.1.1):** document review by at least two consortium members from different work packages for applicable outputs, with reviewer names in reports. Peer-reviewed publications and short social posts have the stated exceptions. An automated code check does not satisfy this requirement.
4. **Language completion:** finish and have a fluent reviewer check national-language body content, not just navigation/hero headings; check national-language report editions separately.
5. **Output inventory:** document public full-text/data links, funding/author-responsibility statements, source citations, reviewers and approval status for each applicable output.
6. **Off-site procedures (§§4.1.4, 4.2, 5):** verify social-channel logo/acknowledgement and approvals, newsletter coordination, event notifications, treatment of external mandates, and special procedures around popular votes and diplomatic contacts. These cannot be established from website source.

## Release status

Clear local website gaps have been corrected. **Full compliance is not yet established** because language coverage, recommendation evidence, output-level requirements and procedural approval records remain incomplete or unverified. No deployment or external communication was performed.
