# Simon's Dog Sitting — Roadmap

## Design direction (decided)
**Keep the warm, branded identity** (cream + terracotta + paw mark, rounded display type).
Rationale: in a market owned by Rover/Wag (utilitarian, transactional), a distinctive
*warm & trust-forward* identity is the differentiation — not a generic native look.
- A native-iOS restyle of the sitter profile was explored as a proof and reverted to stay
  consistent. It lives in git history (commit `4ccc09b`) if we ever want to mine ideas
  (system font, grouped inset lists, monogram avatars).

## How we work (cadence)
1. Pick **one** idea, smallest shippable slice.
2. Build on the warm base → verify in the browser preview.
3. Push to `main` → Vercel auto-deploys → test on the **Vercel web URL** (no Expo Go / no local server).
4. Iterate. Keep this file updated.

## ✅ Shipped
- 9-screen flow + sitter messaging (warm identity).
- Live on Vercel via GitHub auto-deploy (repo: `dog-sitting-app-claude`).
- **Supabase**: sitter list loads from the `sitters` table (with static fallback). Client in
  `flow/supabase.ts`.
- **Real map background (Mapbox Static Images API)** on Discover + LiveWalk, pins/route
  overlaid; falls back to the stylized map without a token. Helper in `flow/map.ts`.
- **Bookings persisted to Supabase** — `bookings` table; `createBooking()` inserts on
  "Confirm booking" (best-effort, non-blocking). Sitter list also loads from `sitters`.
- **Secrets are env vars only** — `.env` is gitignored (kept locally); the 3 `EXPO_PUBLIC_*`
  vars (Supabase URL/key, Mapbox token) are set in **Vercel → Settings → Environment Variables**.

## ⭐ Next action plan (updated order)
1. ~~Real map background (Mapbox)~~ — ✅ done.
2. **AI post-walk report card (Claude).** At "Walk complete!", generate a warm recap from the
   walk data (duration/distance/photos/mood). Call the Anthropic API from a **Supabase Edge
   Function** so the API key stays server-side. Use **Haiku 4.5** (`claude-haiku-4-5`) for
   cheap recaps, or **Opus 4.8** (`claude-opus-4-8`) for top quality. On-brand (warmth/trust),
   something Rover doesn't have.
3. Then continue down the trust pillar (health record, bookings table, real auth).

## Feature backlog (prioritized)

### P1 — Trust pillar (our angle; what wins vs Rover)
- [ ] **Post-walk report card** — mood, pee/poo, distance, photos after each walk.
      *(Quick win: extends the existing live-walk completion screen. Great first build.)*
- [ ] **Dog health record** — vaccines, allergies, vet contact; shared with the sitter.
- [ ] **Insurance (AXA-style)** — coverage badge + claim flow. High trust value, but heavy
      (partnership + legal) → design the UX, stub the backend.
- [ ] **Live GPS + SOS** during the walk (extends the live tracking we already have).

### P2 — Retention / habit
- [ ] **Recurring walks / subscription** ("every Mon & Wed") — the real revenue engine.
- [ ] **"Paw passport" loyalty** — stamps per walk → tiers → discount. (Gamification done
      tastefully, not gadget badges.)
- [ ] **Referral** — invite a friend, both get credit.

### P3 — Core marketplace (table stakes to not lose users)
- [ ] **Multi-day boarding** (pension) — beyond single walks.
- [ ] **Vetted professional sitters** — pro tier / verification levels.
- [ ] **Sitter dashboard** — availability calendar, earnings, requests.
- [ ] **Instant book** vs request-to-book.

### P4 — Monetization & expansion
- [ ] **Add-ons**: bath, treats, photo package, premium long walk.
- [ ] **Premium placement** for sitters.
- [ ] **Local community**: park meetups, lost-dog alerts (warm/local edge vs Rover).
- [ ] **Tele-vet** consultation partnership.

## Integrations & services (decision lens: does it work without a dev build, in the Vercel-web loop?)

### Works NOW — pure JS / server-side, no dev build
| Service | For | Effort |
|---|---|---|
| **Mapbox Static Images API** | Real map *image* background (Discover + live walk), marker overlaid on top | Low |
| **Supabase Auth** | Real "Log in" (email / magic link) | Low |
| **Supabase Realtime** | Live chat + live walk position | Low–Med |
| **Supabase Storage** | Real photos (dog, walk) | Low |
| **Claude API (Anthropic)** | AI walk report card, smart "good with anxious dogs" matching, support assistant — call via a Supabase Edge Function to keep the key server-side; Haiku 4.5 cheap / Opus 4.8 top | Med |
| **Stripe (web Checkout)** | Pay for a booking | Med |
| **Resend / Postmark** | Transactional email ("booking confirmed") via Edge Function | Low–Med |
| **PostHog / Sentry** | Product analytics + error tracking | Low |

### Needs a DEVELOPMENT BUILD (the "native" track, later)
- **Interactive Mapbox / Apple / Google maps** (pan/zoom, live tiles). NB: native map modules
  also **don't render on web** — would need a separate Mapbox GL JS impl for the Vercel preview.
  → This is why we start with the **Static Images API** instead.
- **Push notifications** (`expo-notifications`).
- **Real background GPS** for genuine live-walk tracking (`expo-location` + task manager).
- **Native Apple/Google sign-in**, **Stripe native payment sheet**.
- **Liquid Glass** materials & true **SF Symbols**.

## Tech notes
- Expo **SDK 56** (latest). Flow code in `flow/`, routes in `app/`.
- **Testing = Vercel web URL** (same code, full-screen in Safari) — no Expo Go / no local `expo start` needed.
- True **SF Symbols** and **Liquid Glass** materials need a *development build* (separate, later track).
- Deploy: `git push` → Vercel (`vercel.json`: `expo export -p web` → `dist/`).
