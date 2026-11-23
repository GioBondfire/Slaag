# Campaign Plan — Slaag Pilot & Term 1 Launch (2027)

_Created 2026-11-23 using the Marketing plugin's `campaign-plan` method (Objective → Audience → Message → Channel → Measure). Sources: [PRD](../PRD.md), [Architecture: v1 Scope & Staging](../logical-design/ARCHITECTURE.md#v1-scope--staging), [Design Brief](../../DESIGN-BRIEF.md). Update this file when a decision changes._

> **Open inputs.** Anything marked **⟨OPEN-n⟩** is a decision that hasn't been made yet; see [Open decisions](#11-open-decisions). The plan is built to work whatever the answers, and the decisions change the numbers, not the structure.

---

## 1. Campaign Overview

| | |
|---|---|
| **Campaign name** | **"Ons het dit."** ("We've got this." Tone: unflappable, from the Design Brief.) Pilot phase: **Slaag Stigtersgesinne** (Slaag founding families) |
| **One-line summary** | Get Afrikaans parents of Grade 4–7 children to swap the night-before textbook quizzing for Slaag: first a paid pilot in January, then a partner-led, Meta-supported launch in February, carried through the Term 1 test season. |
| **Primary objective** | **⟨OPEN-4⟩ paying families by 31 March 2027** (end of Term 1). The working proposal is in §7. |
| **Secondary objectives** | 1. Fill the January pilot with **30–50 paying families** who use the pilot textbooks. 2. Build a **waitlist of 300+ parents** by 10 January. 3. Get each confirmed partner campaign live by launch. 4. Prove the activation and retention bar from PRD AC-L4: ≥ 60% of tests added get ≥ 1 completed session, and ≥ 70% of paying families renew in month 2. |

### Phases at a glance

| Phase | Dates (2026–27) | Goal | What's live in the product |
|---|---|---|---|
| **0 Foundations** | 30 Nov – 18 Dec | Everything the campaign depends on is ready | Nothing public yet |
| **1 Pilot recruitment** | 7 Dec – 10 Jan (paid ads paused 22 Dec – 2 Jan) | Waitlist → 30–50 pilot families | Waitlist page only |
| **2 Pilot** | ~11 Jan – 31 Jan | Pilot families succeed; collect proof | Pilot scope: **one textbook per subject per grade, Term 1**, full billing |
| **3 Launch** | 1 Feb – 21 Feb | Convert waitlist + partner members + Meta audiences | All launch textbooks (Term 1), **partner campaigns, landing pages, codes**, weekly digest |
| **4 Test-season sustain** | 22 Feb – 31 Mar | Ride the Term 1 tests; month-2 renewals | Same |

**Hard constraint from the architecture doc:** if the pilot isn't ready, the **pilot date moves**, not its scope. Every date below is therefore relative to the pilot start (**P-day**, currently ~11 January). If P-day moves, slide Phases 1–4 with it; don't compress them.

---

## 2. Target Audience

### Primary: "Marelize", the worried parent
> Working mother of a Grade 4–7 child in an Afrikaans or dual-medium school, typically in a town or suburb. She checks her phone in short bursts. She worries about whether her child is ready for Friday's test, and today she handles it by quizzing from the textbook the night before and reading the class WhatsApp group. She finds solutions through **Facebook, mother and school groups, word of mouth, and her civic organisation's newsletters** (AfriForum, Solidariteit, OUTA). She cares most about **"are we on track?"**, peace at home, and her child's confidence.

- **Pain points:** the evening battle and tears at the kitchen table; not knowing what will be tested; finding out about a test too late; feeling guilty that she can't help enough; tutors that are expensive and hard to schedule.
- **Motivations:** a calm home, a child who feels capable, a good report, credible Afrikaans help that fits *her child's* textbook.
- **Objections:** "Another app with screen time", "Will my child actually use it?", "Is it our textbook?", "What does it cost every month?", "I'm on an iPhone".
- **Buying stage:** mostly **problem-aware, solution-unaware**. She isn't looking for an app; she's looking for less stress around tests. Ads must open on the problem, not the product.

### Secondary: the child as the influencer ("Anja", 10)
The child doesn't buy, but a child who **wants** to keep using Slaag drives renewals and word of mouth. Marketing **never targets children directly** (Meta policy, plus our values). The child's experience appears in parent-facing creative ("your child won't believe it's homework").

### Tertiary: the gatekeepers and multipliers
Partner organisations (their members, newsletters and events), Afrikaans teachers and parent associations (*ouerverenigings*) as **referrers** (schools are reference data only, not customers in year 1), and Afrikaans media.

---

## 3. Key Messages

**Core message (Afrikaans / English)**
> **Slaag maak jou kind toetsgereed, uit hul eie handboek, en jy weet altyd waar julle staan.**
> *Slaag gets your child test-ready from their own textbook, and you always know where you stand.*

| # | Supporting message | Pain it answers | Proof point (what we can show) |
|---|---|---|---|
| 1 | **It's their textbook, in Afrikaans.** Not generic exercises: the test scope you enter, from the book on their desk. | "Is it relevant to our school?" | Supported textbooks list per grade; teacher-reviewed content (AC-C); pilot families' schools |
| 2 | **You know where you stand.** An alert when a session is done, with the score, weak spots and the next step. A readiness answer, not charts. | "Are we on track?" / guilt | Parent dashboard readiness card; session-complete alert (AC-O4) |
| 3 | **Your child actually wants to do it.** Short sessions, instant feedback, credits, badges and Snippie, never shaming. | "Will my child use it?" / screen-time worry | Pilot completion rate (AC-L4 ≥ 60%); child quotes (with parental consent) |
| 4 | **Calmer than the night before.** Add the test date; Slaag plans one session at a time, even when it's last-minute. | Evening battles, late discovery | The three strategies (Incremental, Standard, Last-minute); pilot parent testimonials |

**Message hierarchy for every ad and page:** *Why should I care?* (the evening before the test) → *What is it?* (test prep from their own textbook) → *Why Slaag?* (Afrikaans, their textbook, you see progress) → *What do I do?* (join the waitlist / subscribe).

**Variations by channel**
- **Meta ads:** problem first, conversational, one emoji at most, short. Parent's point of view.
- **Partner newsletters:** credible and warm, with the partner's member benefit up front: "As a member you get ⟨OPEN-1 discount⟩ for 12 months."
- **Organic and mother groups:** a founder's personal voice, asking for help ("we're looking for 50 founding families"), not ad copy.
- **Media/PR:** the bigger story: an Afrikaans ed-tech startup making exam stress smaller for families.

**Voice guardrails (from the Design Brief):** the cool older cousin, not a teacher or a cartoon. Address parents as **"jy"**, never guilt-tripping, no "don't let your child fall behind" fear copy, no flags or heritage symbols, and never a pronoun for Snippie.

---

## 4. Channel Strategy

**Decision (2026-11-23):** paid media is **Meta only** (Facebook and Instagram), set up by hand in Ads Manager using click-by-click guides from this repo. **No ad-management connector for now**: the ~$49/month goes into ad spend instead. Reconsider when we run more than ~3 campaigns at once or the weekly reporting loop becomes a chore.

| Channel | Type | Why it fits | Formats | Effort | Phases |
|---|---|---|---|---|---|
| **Partner campaigns** (AfriForum, Solidariteit, OUTA: ⟨OPEN-3⟩) | Earned/partner | The PRD names partners as **the key distribution channel**: trusted, matches the target audience, low cost per family | Newsletter feature, member email, social post, event QR code, co-branded landing page + campaign code (product feature from **launch**) | Medium–High (relationship work) | Pitch in 0–2; live in 3–4 |
| **Meta ads** | Paid | Where Marelize spends her time; precise targeting (parents, Afrikaans language, age of children where available, regions) | Static 1:1 and 9:16, short screen-recording video, carousel; lead → conversion objectives | Medium | 1 (test), 3–4 (scale) |
| **Waitlist + email** | Owned | Captures demand before checkout exists; nurtures through the holidays; the cheapest conversion at launch | Welcome email, 3–4 nurture emails, launch email, month-2 renewal emails | Low–Medium | 1–4 |
| **Landing pages** (waitlist → launch → partner) | Owned | Web-only checkout means **every** journey ends on the web | Waitlist page (Phase 1), launch page with checkout (3), partner pages (product, 3) | Medium | 0–4 |
| **Facebook page + Instagram (organic)** | Owned | Needed for ads anyway; gives credibility when a parent checks us out | 3 posts/week: tips for test season, behind the scenes, Snippie, pilot stories | Medium | 1–4 |
| **Mother and school Facebook groups, personal networks** | Earned/community | Highest trust for pilot recruitment; costs nothing | Founder post asking for founding families (check each group's rules on promotion) | Low | 1–2 |
| **Afrikaans media** (e.g. Maroela Media, Netwerk24/Rapport, RSG) | Earned/PR | Credibility with parents and partners; launch spike | Press release, founder interview, "pilot results" story | Medium | 3 |
| **Teachers and parent associations** (as referrers) | Earned | Teachers are credible voices on test prep | One-page information leaflet + QR code for school newsletters (with the principal's permission) | Medium | 3–4 |

**Not now:** Google Search (needs budget and a search-intent baseline; revisit after launch), TikTok (wrong audience for the buyer), influencers (revisit with pilot proof), WhatsApp broadcasts (the PRD excludes WhatsApp notifications; parents may *share* links themselves, which we encourage).

### Measurement plumbing (must be live before any paid spend)
- **Meta Pixel + Conversions API** on the waitlist page, sign-up and **after the PayFast return** (the purchase event).
- **UTM convention:** `utm_source=meta|partner-<code>|email|organic|press`, `utm_campaign=pilot-waitlist|launch-feb27|sustain-t1`, `utm_content=<ad-variant-id>`.
- The product already records each family's **acquisition entry point** (AC-A30) and, from launch, **partner reports** (AC-A35). Marketing reads those; don't build a parallel system.

---

## 5. Content Calendar

Week numbers start Monday. **W1 = 30 Nov 2026.** P-day (pilot start) ≈ W7. Leave ~20% of slots free for reactive content.

| Week | Content piece | Channel | Owner / notes | Status |
|---|---|---|---|---|
| **W1** 30 Nov | Lock positioning + this plan; decide ⟨OPEN-1…4⟩ | — | Founder | ☐ |
| W1 | Create Meta Business account, ad account (ZAR), Facebook page + Instagram; install Pixel | Meta | Founder (guide from Claude) | ☐ |
| W1–2 | **Waitlist landing page** live (copy: Content Pack 01) + email tool + welcome email | Web, email | Claude drafts, Founder publishes. **Must be live before any ad or post** | ☐ |
| W2 7 Dec | Founder post seeking **founding families** in 5–10 mother/school groups + personal networks | Organic/community | Founder; check group rules | ☐ |
| W2 | **Meta test campaign** (objective: leads → waitlist), 3 ad variants, small daily budget | Meta | Claude: setup guide + copy; Founder: launches | ☐ |
| W2 | Partner pitch pack (one page: member benefit, audience fit, reporting we provide) | Partner | Claude drafts; Founder sends ⟨OPEN-3⟩ | ☐ |
| W3 14 Dec | Review Meta results (CSV export) → kill the weakest variant, shift budget | Meta | Weekly loop | ☐ |
| W3 | Nurture email 1: "What Slaag is and isn't" + handbook screener (which textbook does your child use?) | Email | Screens for pilot textbooks | ☐ |
| W4–5 22 Dec – 2 Jan | **Paid ads paused** (holidays). 1–2 light organic posts. | Organic | Low attention; save budget | ☐ |
| **W6** 4 Jan | "Back to school" push: Meta ads resume, nurture email 2, organic "new year, new term, calmer tests" | Meta, email, organic | Back-to-school planning is a natural moment | ☐ |
| W6 | **Invite pilot families** (screened for supported textbooks), checkout link, onboarding email | Email | Pilot is paid; price ⟨OPEN-1⟩ | ☐ |
| **W7** 11 Jan | **P-day: pilot starts.** Onboarding check-ins; ask permission for testimonials | Email, phone | Founder | ☐ |
| W7–9 | Organic: pilot diary ("week 1 with our founding families"), tips for test season | Organic | 3 posts/week | ☐ |
| W8 | Partner agreements signed; campaign terms (window, discount, period) entered in back office | Partner | Product feature ships at launch | ☐ |
| W9 25 Jan | **Launch creative** produced from pilot proof: 3–5 new ads, launch landing page, press release | All | Needs testimonials + consent | ☐ |
| **W10** 1 Feb | **Launch.** Waitlist launch email; Meta switches to **conversion** objective; partner newsletters go out; press release | All | Partner pages and codes live (product) | ☐ |
| W10–11 | Media interviews; parent-association leaflet to friendly schools | PR, earned | Founder | ☐ |
| W12 15 Feb | First full weekly report: CPA by channel, partner conversion, activation | Analytics | Claude analyses the CSVs + product reports | ☐ |
| W13–14 | **Creative refresh 1**; retargeting of landing-page visitors who didn't subscribe | Meta | Refresh every 2–3 weeks | ☐ |
| W14 1 Mar | Month-2 **renewal** emails for pilot families: "here's what your child mastered" | Email | Retention, AC-L4 ≥ 70% | ☐ |
| W15–16 | "Test next week?" timely ads + organic; partner reminder (window closing, if applicable) | Meta, partner | Genuine urgency only | ☐ |
| W16–17 | **Creative refresh 2**; lookalike audience from paying families (once there are 100+) | Meta | | ☐ |
| W18 29 Mar | End-of-term **"look what you did"** recap per family (Spotify Wrapped-style, Design Brief) → shareable; campaign retrospective | Email, organic | Feeds the Term 2 plan | ☐ |

### Dependencies (hard order)
1. **Positioning + price ⟨OPEN-1⟩ → landing-page copy → page live → ads and posts.** No traffic before the page exists.
2. **Pixel + CAPI on the page and after PayFast → any paid spend.** Otherwise we can't tell which ads produce paying families.
3. **Pilot textbooks known → screener in the email → pilot invitations.** Pilot content covers only the most-used textbook per subject per grade.
4. **Parent consent (POPIA: children's data) → any testimonial, child quote or child image in creative.**
5. **"Snippie" trademark clearance (open item in the Design Brief) → Snippie as the face of paid ads.** Until then, lead with app screens and parents.
6. **Partner agreement + campaign configured → partner newsletters**, which point at the partner landing page (a launch feature).

---

## 6. Content Pieces Needed

| # | Asset | Type | Contents | Priority | Needed by |
|---|---|---|---|---|---|
| A1 | Waitlist / founding-family page | Landing page | Problem → solution → 4 value props → founding-family offer → short form → FAQ | **Must** | W1 |
| A2 | Meta ad set v1 (3 variants) | Ad creative + copy | Peace of mind / child experience / founding families | **Must** | W2 |
| A3 | Welcome email | Email | Thanks, what's next, the textbook question | **Must** | W1 |
| A4 | Founder post for groups | Social (organic) | Personal ask for founding families | **Must** | W2 |
| A5 | Ads Manager setup guide | Internal how-to | Click by click, every field filled in | **Must** | W2 |
| A6 | Pixel + CAPI implementation | Code | Events: Lead, CompleteRegistration, Purchase (after PayFast) | **Must** | W2 |
| A7 | Nurture emails 1–3 | Email | What it is; how a session works; back to school | **Must** | W3, W6 |
| A8 | Partner pitch pack | One-pager | Member benefit, audience, reporting, co-branding rules | **Must** | W2 |
| A9 | Pilot invitation + onboarding emails | Email | Checkout link, set-up steps, support | **Must** | W6 |
| A10 | Launch landing page | Landing page | A1 + proof + price + checkout | **Must** | W9 |
| A11 | Launch ad set v2 (3–5 variants) | Ad creative | Built on pilot proof | **Must** | W9 |
| A12 | Partner newsletter copy (per partner) | Email/article | Member benefit, co-branded | **Must** | W9 |
| A13 | Press release + media kit | PR | Story, founder quote, screenshots, Snippie | Nice | W9 |
| A14 | Organic post bank (≈ 30 posts) | Social | Test-season tips, behind the scenes, Snippie, stories | Nice → Must by W7 | W5 |
| A15 | Parent-association leaflet | Print/PDF | One page + QR | Nice | W10 |
| A16 | Renewal emails (month 2) | Email | Progress made, next tests | **Must** | W13 |
| A17 | End-of-term recap | Email + shareable | "Look what you did" | Nice | W17 |

**Content Pack 01** ([content/01-pilot-recruitment.md](content/01-pilot-recruitment.md)) drafts A1–A4.

---

## 7. Success Metrics

| KPI | Target (proposal) | How it's tracked | Cadence |
|---|---|---|---|
| **Primary: paying families by 31 Mar 2027** | ⟨OPEN-4⟩. Working proposal: **250** (pilot 40 + waitlist conversion 60 + partners 100 + Meta 50) | Product: active subscriptions by acquisition entry point (AC-A30) | Weekly |
| Waitlist sign-ups by 10 Jan | 300 | Email tool + Pixel `Lead` | Weekly |
| Pilot families (paying, active) | 30–50 | Product | Weekly in January |
| Cost per waitlist lead (Meta) | Planning assumption R40–R100; replace with W2–3 actuals | Ads Manager CSV | Weekly |
| Cost per paying family (Meta) | Planning assumption R200–R500; replace with launch actuals | Pixel `Purchase` + entry point | Weekly from W10 |
| Partner conversion (landing visit → subscription) | ≥ 5% | Partner reports (AC-A35) | Weekly from W10 |
| Activation | ≥ 60% of tests added get ≥ 1 completed session (AC-L4) | Product | Weekly |
| Month-2 renewal | ≥ 70% (AC-L4) | Product | Monthly |

**Reporting loop (no connector):** every Monday, export last week's Ads Manager results as CSV into `docs/marketing/reports/YYYY-MM-DD-meta.csv`. Claude analyses it together with the product numbers and writes a one-page summary with up to three actions.

---

## 8. Budget Allocation

Budget is ⟨OPEN-2⟩. Three tiers, all for **30 Nov 2026 – 31 Mar 2027**:

| | **Lean: R5,000** | **Base: R15,000** | **Plus: R30,000** |
|---|---|---|---|
| Meta ad spend (70%) | R3,500 | R10,500 | R21,000 |
| Creative production (15%): mascot art for ads, simple video edits, a stock photo or two | R750 | R2,250 | R4,500 |
| Testing + contingency (15%) | R750 | R2,250 | R4,500 |

**Meta spend by phase:** Phase 1 test 15% · Phase 3 launch 45% · Phase 4 sustain 40%. Within each phase, put 60–70% behind the best-performing variant and keep 15–20% for new tests.

**Tools:** free tiers only (an email tool with a free plan, Meta Business Suite for scheduling). No paid ad-management connector (decision of 2026-11-23).

---

## 9. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| **The pilot slips** (the architecture doc says the date moves, not the scope) | Plan relative to P-day; email messaging doesn't promise a date before W6; the waitlist nurture continues |
| **Textbook mismatch:** a parent signs up, but their child's textbook isn't supported (the pilot covers one per subject per grade) | Screen for textbooks before inviting pilot families; the launch page lists supported textbooks; keep a "notify me when my textbook is added" list |
| **Partner deals don't land by launch** | The launch works without them: waitlist + Meta + PR. Partners become a Phase 4 boost, not a dependency |
| **Political association.** Partner co-branding could make Slaag read as political | Slaag-branded everywhere; co-branding only on partner landing pages and partner channels (Design Brief); no heritage symbols |
| **Meta targeting for Afrikaans speakers is imprecise** | Use language + regions + parent/interest signals; let the Afrikaans copy self-select; use a lookalike audience from paying families once there are 100+ |
| **iPhone parents** (no iOS app; web only) | Name it in the FAQ: works in the browser on iPhone; the onboarding email explains "add to home screen" |
| **Children's privacy** | Never target children; no child faces or names without written parental consent; POPIA-compliant waitlist consent |

---

## 10. Next Steps

1. **Decide ⟨OPEN-1…4⟩** (price + partner discount, budget tier, partners, target), ideally this week.
2. Review and approve **Content Pack 01** (waitlist page, ads, welcome email, founder post).
3. Set up Meta Business + ad account + pages; Claude writes the **Ads Manager setup guide** (A5) and the **Pixel/CAPI** code (A6).
4. Publish the waitlist page → start the founder posts → start the Meta test (W2).
5. Send the partner pitch pack (A8) to confirmed contacts.

---

## 11. Open decisions

| ID | Decision | Why it matters | Needed by |
|---|---|---|---|
| ⟨OPEN-1⟩ | Standard monthly family fee (the PRD makes it a config value) and the partner discount (% or rand, period) | Landing page, FAQ, ads, partner pitch | W1 |
| ⟨OPEN-2⟩ | Marketing budget tier (§8) | Meta spend, creative | W1 |
| ⟨OPEN-3⟩ | Which partners are in discussion or agreed, and contacts | Partner track timing | W2 |
| ⟨OPEN-4⟩ | Paying-family target for 31 March 2027 (the PRD leaves it to the business, AC-L4) | Primary KPI, budget sizing | W1 |
| ⟨OPEN-5⟩ | Founding-family offer (e.g. a price lock, a founder badge, early access) within what billing supports in the pilot | Pilot recruitment hook | W1 |
| ⟨OPEN-6⟩ | Pilot size cap (proposal: 50) | Honest scarcity in copy | W1 |

---

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-11-23 | Paid media is **Meta only**, managed by hand; **no ad-management connector** (e.g. Adspirer) for now | ~$49/month is better spent on ads at this scale; Claude provides setup guides and analyses CSV exports |
| 2026-11-23 | Campaign planning follows the Marketing plugin's `campaign-plan` method; content follows `content-creation` / `draft-content` | A consistent, executable structure |
