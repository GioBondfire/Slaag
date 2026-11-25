# Ad Set 1 — Term 1 2027: Warm-up and Base

_Drafted 2026-11-24 with the Marketing plugin's `draft-content` method, from the angles chosen by the product owner. Campaign context: [CAMPAIGN-PLAN.md](../CAMPAIGN-PLAN.md) (Part B, asset C2). Images: [`../creative/term1-set1/`](../creative/term1-set1/), built with `node docs/marketing/creative/build.mjs term1-set1` (definitions in `creative/ads.mjs`)._

**Voice applied:** the cool older cousin, "jy", no guilt or fear copy, no Snippie (Design Brief and campaign decisions 11–14). **On every image:** the logo with the fixed descriptor **"Slim toetsvoorbereiding · Graad 4–7"**, and the price line R149 per month for the whole family, cancel any time.

## Running order

| Ad | Phase | Dates | Budget share | Angle |
|---|---|---|---|---|
| **A1 Terug skool toe** | Warm-up | 5–12 Jan | 100% of warm-up (R600) | New term, calmer tests |
| **A5 Geen tyd** | Base | 13 Jan – 3 Feb | ⅓ each of base (R2,400), then 60–70% to the winner after the first weekly report | No time to quiz every evening |
| **A6 Ek het geleer** | Base | 13 Jan – 3 Feb | ⅓ | "I studied, Mom" — but do you really know? |
| **A7 Nie die eksaminator nie** | Base | 13 Jan – 3 Feb | ⅓ | Stop being the bad cop |

A1 keeps running at a low share in the base phase only if it beats one of the base ads.

## Settings for every ad

- **Placements:** Facebook and Instagram Feed (1:1 image), Stories and Reels (9:16 image).
- **Audience:** women 28–50, South Africa, language Afrikaans, parent signals where available. **Exclude** the active-subscriber audience. **Never target children.**
- **Optimisation event:** `Subscribe` (sent from Slaag's server). If Meta reports too few events in the first week, temporarily optimise for `InitiateCheckout`.
- **CTA button:** *Sign Up* (shown in the viewer's language).
- **Destination:** `https://slaag.co.za/toetse?utm_source=meta&utm_medium=paid_social&utm_campaign=t1-2027&utm_term=<phase>&utm_content=<ad-id>`

---

## A1 — Terug skool toe (warm-up)
`utm_term=warm-up` · `utm_content=a1-terug-skool` · images `a1-terug-skool-1x1.png`, `a1-terug-skool-9x16.png`

**Primary text:**
> Die nuwe kwartaal begin. Hierdie keer sonder die paniek die aand voor die toets. 🎒
>
> Slaag maak jou kind toetsgereed, uit hul eie handboek – en jy weet altyd waar julle staan.
>
> R149 per maand vir die hele gesin. Kanselleer enige tyd.

**Headline:** Nuwe kwartaal. Kalmer toetse.
**Description:** Graad 4–7 · In Afrikaans

*English gloss: The new term starts. This time without the panic the night before the test. Slaag gets your child test-ready from their own textbook, and you always know where you stand.*

## A5 — Geen tyd (base)
`utm_term=base` · `utm_content=a5-geen-tyd` · images `a5-geen-tyd-1x1.png`, `a5-geen-tyd-9x16.png`

**Primary text:**
> Werk, kos, huiswerk, bad – en dan nog die handboek uithaal om vrae te vra? 😮‍💨
>
> Slaag vra jou kind die vrae uit hul eie handboek, in kort sessies. Jy kry net 'n boodskap: klaar, en hoe dit gegaan het.
>
> R149 per maand vir die hele gesin. Kanselleer enige tyd.

**Headline:** Geen tyd om elke aand vrae te vra nie?
**Description:** Slaag vra die vrae. Jy sien die uitslag.

*English gloss: Work, dinner, homework, bath – and then still getting the textbook out to quiz them? Slaag asks your child the questions from their own textbook, in short sessions. You just get a message: done, and how it went.*

## A6 — Ek het geleer (base)
`utm_term=base` · `utm_content=a6-ek-het-geleer` · images `a6-ek-het-geleer-1x1.png`, `a6-ek-het-geleer-9x16.png`

**Primary text:**
> "Ek het geleer, Ma." Maar weet jy regtig? 🤔
>
> Slaag wys jou wat sit al en wat nog nie. Ná elke sessie sien jy die telling, die swak plekke en die volgende stap – op jou foon, met een kyk.
>
> R149 per maand vir die hele gesin. Kanselleer enige tyd.

**Headline:** "Ek het geleer, Ma." Maar weet jy regtig?
**Description:** Sien met een kyk of julle op koers is.

*English gloss: "I studied, Mom." But do you really know? Slaag shows you what has stuck and what hasn't yet. After every session you see the score, the weak spots and the next step — on your phone, at a glance.*

## A7 — Nie die eksaminator nie (base)
`utm_term=base` · `utm_content=a7-nie-eksaminator` · images `a7-nie-eksaminator-1x1.png`, `a7-nie-eksaminator-9x16.png`

**Primary text:**
> Niemand hou daarvan om te sê "nee, dis nie heeltemal reg nie" – nie jy nie, en nie jou kind nie.
>
> Slaag merk die antwoorde, wys wat reg was en wat nog kort, en moedig aan. Jy kan weer die een wees wat trots is. 💚
>
> R149 per maand vir die hele gesin. Kanselleer enige tyd.

**Headline:** Wees weer net Ma, nie die eksaminator nie.
**Description:** Slaag merk. Jy moedig aan.

*English gloss: Nobody likes saying "no, that's not quite right" — not you, and not your child. Slaag marks the answers, shows what was right and what's still missing, and encourages. You get to be the proud one again.*

---

## Checks before publishing
1. A second Afrikaans speaker reads every line aloud (tone and idiom).
2. The image mock-ups show a fictional child ("Anja") and a sample Natural Sciences question; no real child, name or photo.
3. Landing page live with R149 and the privacy-notice line; server-side `Subscribe` reaches Meta in a test checkout.
4. Ads are built **paused** in W5 and switched on at the 5 January start gate.
