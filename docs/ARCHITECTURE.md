# Wall Backend Plan: Next.js + Supabase

**Status:** Planned. The frontend has already been merged into `master` (commit `82ce1bb`). The `/wall` route is available, but the navigation/footer entry points are currently hidden with CSS. The data layer at `website/app/services/wall.ts` currently runs using local seed data. This plan switches it to a real Supabase backend.

**Architecture:** Next.js static/client frontend + Supabase Postgres + Supabase Realtime + Supabase Edge Functions where server-side logic is required.

**Audience:** The next session implementing this plan and future maintainers.

---

# 1. Goal

Persist public sticky notes in Supabase and allow visitors to explore a shared, real-time wall.

The backend must support:

- Public note creation
- Anonymous or identified display names
- Real-time note creation
- Note reactions/interactions
- Note ranking
- Note expiration
- Ownership detection for the creator
- Abuse protection
- Moderation
- Normalized canvas positions
- Color-coded notes

The frontend remains a Next.js application.

Supabase becomes responsible for:

- PostgreSQL database
- Realtime subscriptions
- Authentication, if/when accounts are enabled
- Row Level Security
- Edge Functions for trusted server-side operations
- Scheduled cleanup
- Storage if future media support is added

---

# 2. Architecture

```text
                    ┌─────────────────────┐
                    │       Browser       │
                    │      Next.js UI     │
                    └──────────┬──────────┘
                               │
                 Supabase JS Client
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
      ┌───────────────┐                 ┌────────────────┐
      │   Supabase    │                 │    Supabase    │
      │   Postgres    │◄───────────────►│    Realtime    │
      └───────┬───────┘                 └────────────────┘
              │
              │
      ┌───────▼──────────┐
      │ Supabase Edge    │
      │ Functions        │
      │                  │
      │ • create note    │
      │ • reactions      │
      │ • rate limiting  │
      │ • moderation     │
      └──────────────────┘
              │
              ▼
      External services
      if required
      • Turnstile
      • moderation API
```

The important distinction is:

### Client-safe operations

The browser can directly:

- Subscribe to realtime changes
- Read public notes
- Read public rankings

### Trusted operations

The browser should **not** directly control:

- Rate-limit counters
- Moderation state
- Expiration timestamps
- Interaction counts
- Abuse detection
- Anything that can be manipulated to inflate ranking

Those should go through Supabase Edge Functions or carefully designed Postgres functions/RLS policies.

---

# 3. Database Model

Unlike the original D1 design, I would take advantage of Postgres and separate concerns instead of putting everything into one `notes` table.

## `wall_notes`

```sql
CREATE TABLE wall_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  body TEXT NOT NULL,

  color TEXT NOT NULL,

  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,

  name TEXT,

  user_id UUID REFERENCES auth.users(id),

  owner_token_hash TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  last_interaction_at TIMESTAMPTZ,

  expires_at TIMESTAMPTZ NOT NULL,

  hidden BOOLEAN NOT NULL DEFAULT false
);
```

### Constraints

```sql
CHECK (char_length(body) BETWEEN 1 AND 180)

CHECK (char_length(name) <= 24)

CHECK (x >= 0 AND x <= 1)

CHECK (y >= 0 AND y <= 1)
```

For `color`, I would either use a Postgres enum or a check constraint:

```sql
CHECK (
  color IN (
    'amber',
    'rose',
    'sky',
    'mint',
    'lilac',
    'blush'
  )
)
```

---

# 4. Ownership

The original owner-token concept is still useful because users should be able to post anonymously.

However, **do not store the raw owner token in Postgres.**

Generate a browser-side token:

```ts
crypto.randomUUID();
```

Store it locally:

```text
wall_owner
```

Before sending it to Supabase, hash it.

```text
Browser
   │
   │ owner token
   ▼
Edge Function
   │
   │ SHA-256
   ▼
owner_token_hash
   │
   ▼
Postgres
```

This means even if the database is exposed, the anonymous ownership token isn't sitting there in plaintext.

---

# 5. Anonymous vs Identified Users

There are two possible identities:

### Anonymous

```text
user_id = NULL
owner_token_hash = SHA256(browser_token)
name = "Anonymous"
```

### Authenticated

```text
user_id = auth.uid()
owner_token_hash = optional
name = user's chosen display name
```

I would **not require authentication for MVP**.

The entire point of the Wall is low friction:

> Open → write thought → stick it.

Accounts can come later.

---

# 6. API / Backend Contract

Because Supabase is being used, you don't necessarily need to build a traditional REST API for everything.

Use:

```text
Supabase Client
        │
        ├── SELECT → public notes
        │
        ├── Realtime → new/updated/deleted notes
        │
        └── Edge Functions
                │
                ├── create-note
                ├── react-to-note
                └── moderate-note
```

---

# 7. Fetch Notes

The frontend can query Supabase directly.

Conceptually:

```ts
const { data } = await supabase
  .from("wall_notes")
  .select(
    `
    id,
    body,
    color,
    x,
    y,
    name,
    created_at,
    last_interaction_at
  `,
  )
  .eq("hidden", false)
  .order("created_at", { ascending: false })
  .limit(800);
```

The database/RLS policy must ensure that clients only receive:

```text
hidden = false
```

notes.

Moderated notes should never be returned publicly.

---

# 8. Real-Time

This is one of the biggest reasons Supabase is a good fit.

Subscribe to:

```text
wall_notes
```

for inserts/deletes.

Conceptually:

```ts
supabase
  .channel("wall")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "wall_notes",
      filter: "hidden=eq.false",
    },
    (payload) => {
      // Add note to canvas
    },
  )
  .subscribe();
```

The flow becomes:

```text
User A
   │
   │ Create note
   ▼
Edge Function
   │
   ▼
Postgres
   │
   ▼
Supabase Realtime
   │
   ├──────────────┐
   ▼              ▼
User B          User C
Canvas          Canvas
```

This gives you the "alive" feeling you wanted without managing WebSockets yourself.

---

# 9. Creating a Note

I recommend using an Edge Function instead of allowing anonymous users to directly `INSERT`.

```text
POST /functions/v1/create-wall-note
```

Payload:

```json
{
  "body": "I wonder what everyone is thinking today",
  "color": "sky",
  "x": 0.42,
  "y": 0.31,
  "name": "Lin",
  "owner": "client-token",
  "turnstileToken": "..."
}
```

The Edge Function:

1. Validate payload
2. Validate Turnstile
3. Hash owner token
4. Check rate limit
5. Validate content
6. Calculate expiration
7. Insert note
8. Return created note

---

# 10. Expiration

Your original rule is interesting:

> Notes disappear after 24 hours if nobody interacts with them, but survive up to 7 days.

I would formalize it as:

```text
Maximum lifetime:
7 days

Inactive lifetime:
24 hours
```

So:

```text
created_at = Monday 10:00

last_interaction_at = Monday 10:00

                    ↓

Tuesday 10:00
No interaction

                    ↓

DELETE
```

But if someone interacts:

```text
Monday 10:00
Created

Tuesday 09:00
Interaction

                    ↓

Wednesday 09:00
Potential expiration

                    ↓

Maximum:
Monday + 7 days
```

Therefore:

```text
expires_at =
MIN(
  created_at + 7 days,
  last_interaction_at + 24 hours
)
```

However, I would **not physically delete immediately from the request path**.

Instead use a scheduled cleanup job.

```text
Supabase Scheduled Function
        ↓
Every 10–15 minutes
        ↓
DELETE FROM wall_notes
WHERE expires_at < now()
```

This keeps the user-facing API fast.

---

# 11. Interactions

This is where I'd expand your original architecture.

Create:

```sql
CREATE TABLE wall_note_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  note_id UUID NOT NULL
    REFERENCES wall_notes(id)
    ON DELETE CASCADE,

  user_id UUID
    REFERENCES auth.users(id),

  visitor_token_hash TEXT,

  type TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

For MVP, you could just have:

```text
like
```

or:

```text
upvote
```

Don't build five reaction types yet.

---

# 12. Prevent Reaction Spam

You need some kind of identity.

For anonymous visitors:

```text
visitor_token
```

Hash it:

```text
SHA256(visitor_token)
```

Then enforce:

```sql
UNIQUE(note_id, visitor_token_hash, type)
```

That gives you:

> One anonymous user can only upvote a note once.

---

# 13. Ranking

Don't store a manually maintained `rank` value.

Calculate ranking from interactions.

For example:

```text
score =
    interactions
    /
    (hours_since_creation + 2)
```

This gives newer notes a chance to compete.

You could expose:

```text
/trending
```

with a Postgres function/view.

Eventually:

```text
🔥 Trending
🌎 New
💭 Random
```

could become different ways of exploring the Wall.

---

# 14. Interaction Updates

When somebody interacts:

```text
User
 │
 ▼
Edge Function
 │
 ├── validate interaction
 ├── prevent duplicate
 ├── insert interaction
 └── update last_interaction_at
          │
          ▼
       Postgres
```

Update:

```sql
last_interaction_at = now()
```

and:

```sql
expires_at = LEAST(
  created_at + interval '7 days',
  now() + interval '24 hours'
)
```

This is important because interaction should **actually keep the thought alive**.

---

# 15. RLS

This is one of the biggest advantages over the Worker/D1 design.

Enable RLS:

```sql
ALTER TABLE wall_notes ENABLE ROW LEVEL SECURITY;
```

Public users can read visible notes:

```sql
CREATE POLICY "Public can read visible notes"
ON wall_notes
FOR SELECT
USING (hidden = false);
```

But don't allow anonymous users to freely insert:

```text
❌ anon INSERT
```

Instead:

```text
Browser
   ↓
Edge Function
   ↓
service role
   ↓
Postgres
```

This gives you a much cleaner trust boundary.

---

# 16. Moderation

Keep:

```sql
hidden BOOLEAN DEFAULT false
```

This is still useful.

Potential future fields:

```sql
moderation_status TEXT
moderation_reason TEXT
moderated_at TIMESTAMPTZ
```

But **don't add these yet** unless you actually need them.

MVP:

```text
hidden = false
```

or:

```text
hidden = true
```

is enough.

---

# 17. Rate Limiting

This is one place where Supabase/Postgres isn't as naturally suited as Redis.

For the MVP, you can maintain a rate-limit table:

```sql
CREATE TABLE wall_rate_limits (
  key_hash TEXT PRIMARY KEY,

  minute_count INTEGER NOT NULL DEFAULT 0,
  hour_count INTEGER NOT NULL DEFAULT 0,

  minute_started_at TIMESTAMPTZ NOT NULL,
  hour_started_at TIMESTAMPTZ NOT NULL
);
```

But I'd actually keep this logic inside the Edge Function and use Postgres carefully.

Your existing limits can remain:

```text
1 post / minute
20 posts / hour
```

If the Wall gets significant traffic, move rate limiting to a dedicated edge/rate-limit service rather than abusing Postgres as a high-frequency counter.

---

# 18. Turnstile

If you're keeping Cloudflare Turnstile, that's completely fine.

The architecture becomes:

```text
Browser
   │
   │ Turnstile token
   ▼
Supabase Edge Function
   │
   │ verify
   ▼
Cloudflare Turnstile
```

The secret stays server-side as an Edge Function secret.

The browser only receives:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

So Cloudflare is **only providing bot verification**, not hosting your backend.

---

# 19. Derived Rotation

Keep your existing decision.

Do not store:

```text
rotation
```

Generate it from:

```text
note.id
```

```ts
rotFromId(id);
```

This remains a good design.

---

# 20. Position

Keep:

```text
x: 0 → 1
y: 0 → 1
```

rather than pixels.

For example:

```text
x = 0.42
y = 0.31
```

This means the Wall can render correctly on:

```text
mobile
tablet
desktop
```

without storing device-specific dimensions.

And according to your D3 decision:

> Once a note is posted, its position is locked.

So there is **no update endpoint**.

---

# 21. Frontend Migration

### `website/app/services/wall.ts`

Replace local seed data with Supabase.

Responsibilities:

```text
fetchNotes()
subscribeToNotes()
postNote()
reactToNote()
getOwner()
rotFromId()
```

The client owns:

```text
owner token
```

but never knows another user's token.

---

# 22. `wall-client.tsx`

Replace:

```text
myIds Set
```

with:

```text
note.mine
```

The UI:

```text
Draft
 ↓
Position
 ↓
Color
 ↓
Name
 ↓
Turnstile
 ↓
Stick it
 ↓
Supabase
 ↓
Realtime
 ↓
Everyone sees it
```

Once posted:

```text
🔒 Note is locked
```

No dragging/editing.

---

# 23. Suggested Supabase Project Structure

I would structure the Supabase side like this:

```text
supabase/
│
├── config.toml
│
├── migrations/
│   ├── 0001_wall_notes.sql
│   ├── 0002_wall_interactions.sql
│   └── 0003_wall_rls.sql
│
├── functions/
│   ├── create-wall-note/
│   │   └── index.ts
│   │
│   ├── interact-wall-note/
│   │   └── index.ts
│   │
│   └── cleanup-wall-notes/
│       └── index.ts
│
└── seed.sql
```

Your Next.js project remains:

```text
website/
├── app/
│   ├── wall/
│   └── services/
│       └── wall.ts
│
└── ...
```

---

# 24. Environment Variables

Remove:

```text
NEXT_PUBLIC_SERVER_URL
```

You no longer need a custom Worker URL.

Use:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

Server-side Supabase secrets belong only in Edge Functions:

```text
SUPABASE_SERVICE_ROLE_KEY
TURNSTILE_SECRET
IP_SALT
```

Never expose those through `NEXT_PUBLIC_*`.

---

# 25. Deployment

Supabase handles:

```text
Postgres
Realtime
Edge Functions
Auth
Scheduled jobs
```

The deployment becomes roughly:

```bash
supabase db push

supabase functions deploy create-wall-note

supabase functions deploy interact-wall-note

supabase functions deploy cleanup-wall-notes
```

Then configure:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

in the Next.js deployment environment.
