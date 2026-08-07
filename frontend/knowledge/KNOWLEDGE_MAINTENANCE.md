# Keeping the Website Assistant accurate

The Advisor answers from files in this repository. It does not learn, and it
cannot look anything up. If a fact changes here and nowhere else, the Advisor
carries on repeating the old one — so this document is the checklist.

**Golden rule:** edit `knowledge/website-knowledge.md` first, then mirror the
change into the matching file under `src/data/`. The Markdown file is for
humans; the JSON is what the Advisor actually reads.

After any change run `npm run build` in `frontend/` before deploying.

---

## Where each thing lives

| What you want to change | File |
|---|---|
| A common question or its answer | `src/data/faq.json` |
| A service you offer | `src/data/services.json` |
| A kind of website you build | `src/data/website-types.json` |
| A technology explanation | `src/data/technologies.json` |
| A development stage | `src/data/roadmap.json` |
| What the Advisor must never say | `src/data/business-rules.json` |
| Portfolio / project showcase status | `src/data/portfolio.json` |
| Your public professional details | `src/data/profile.json` |
| Which architecture is recommended | `src/data/recommendations.json` |
| Quick-action buttons and limits | `src/data/lead-flow.json` |
| Version stamp | `src/data/knowledge-meta.json` |

WhatsApp number, phone and email are **not** here. They come from the site's
environment variables via `src/config.ts`, so there is one place to change them.

---

## Common tasks

### Add a new FAQ

Add an object to `src/data/faq.json`:

```json
{
  "id": "unique-kebab-id",
  "category": "Pricing",
  "question": "The question as a visitor would ask it",
  "answer": "Two or three sentences. Business language, no jargon.",
  "keywords": ["words", "a visitor", "might type"],
  "followUpQuestions": ["another-faq-id"],
  "status": "verified"
}
```

- `keywords` matter most — they are what the matcher scores highest. Include the
  words a customer would actually type, not the words you would use.
- Every id in `followUpQuestions` must exist, or the follow-up button disappears
  silently. Check with:
  `node -e "const f=require('./src/data/faq.json');console.log(f.flatMap(x=>x.followUpQuestions).filter(id=>!f.some(y=>y.id===id)))"`
  An empty array means all references are valid.

### Change a service, or add one

Edit `src/data/services.json`. Keep `requiresBackend` honest — it feeds the
Advisor's architecture advice, and marking a brochure site as needing a backend
would have it recommending infrastructure nobody needs.

### Publish the project showcase

In `src/data/portfolio.json`:

1. Set `publicPortfolioStatus` to `"live"`.
2. Set `communityPageUrl` to the real route.
3. Set `verifiedPublicProjectCount` to the approved number.
4. Add entries to `publicProjects` — **only** projects the client has agreed to
   publish.
5. Update the `portfolio-examples` and `portfolio-count` entries in `faq.json`,
   and change their `status` from `planned` / `unknown` to `verified`.

Until step 5 is done the Advisor keeps saying the showcase is being prepared,
even if the page exists.

### Change the public project count

Only `src/data/portfolio.json` → `verifiedPublicProjectCount`. Leave it `null`
rather than guessing. Null makes the Advisor say the figure is not published,
which is true; a wrong number is a claim you would have to defend.

### Change the WhatsApp number

Not in these files. Update `VITE_WHATSAPP_NUMBER` in the Vercel project's
environment variables and redeploy. Everything — the Advisor, the floating
button, the header, the footer — reads from that one value.

### Add WordPress development as a service

1. Add a service to `src/data/services.json`.
2. Add WordPress to `src/data/technologies.json`, being honest in `whenNotToUse`.
3. Update the `tech-wordpress` FAQ, which currently explains why it is usually
   *not* used.
4. If it should be recommended for some projects, add a rule to
   `src/data/recommendations.json` with an appropriate `priority`.

### Change what architecture is recommended

`src/data/recommendations.json` → `rules`. Rules are evaluated highest
`priority` first, and the first match wins. The final rule has no `when`
condition and is the fallback — leave it last and leave it simple.

Always write the `reason` in business terms. "Use Next.js" tells a client
nothing; "because your site is informational and does not need customer
accounts, this avoids paying for a server you would not use" tells them why.

### Change pricing philosophy

`src/data/business-rules.json` → `refusals.pricing`, plus the Pricing FAQs.
Do not add figures unless you intend the Advisor to quote them to strangers.

### Add another AI provider later

1. Create `api/_lib/<provider>.ts` implementing the `AiProvider` interface from
   `api/_lib/provider.ts`.
2. Switch on an environment variable in `api/advisor/chat.ts`.

The Advisor UI does not change — it only ever calls `/api/advisor/chat`.

---

## After editing

1. `cd frontend && npm run build` — catches malformed JSON immediately.
2. Bump `knowledgeVersion` and `lastUpdated` in `src/data/knowledge-meta.json`.
3. Open the Advisor and ask the question you just changed.

## The four statuses

- `verified` — confirmed and approved to state publicly.
- `planned` — intended but not available. The Advisor must not present it as available.
- `estimated` — an approximation. Always labelled as such, never a commitment.
- `unknown` — not established. The Advisor says so rather than guessing.

If you are unsure which applies, `unknown` is always the safe choice. The
Advisor handles it gracefully, and an honest "not published" costs far less
trust than a confident answer that turns out to be wrong.
