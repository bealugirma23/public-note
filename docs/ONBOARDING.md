# Wall Project — AI Onboarding Overview

You are joining an existing project called **Wall**.

## Product

Wall is a public, infinite canvas where people can anonymously or publicly share short thoughts as sticky notes.

The product concept is:

> **Twitter + Figma canvas + Post-it wall**

A visitor opens the Wall, explores thoughts from other people, and can leave their own thought. The experience should feel lightweight, spontaneous, visual, and alive.

The first target audience is primarily users in Ethiopia, with an Ethiopia-focused discovery experience planned.

## Core Experience

Users should be able to:

- Explore an infinite canvas of sticky notes.
- Pan and zoom around the canvas.
- Create a sticky note.
- Choose a sticky-note color.
- Optionally provide a display name.
- Post anonymously without creating an account.
- See newly created notes in real time.
- Interact with notes.
- See notes ranked based on interactions.
- Have inactive notes disappear automatically.
- Eventually explore notes geographically through an Ethiopia map.

Published notes are **immutable**:

- Their content cannot be edited.
- Their position cannot be changed after publishing.
- Their rotation is derived deterministically from the note ID.

## Current MVP Features

The first version focuses on:

1. Infinite canvas
2. Sticky-note creation
3. Custom sticky-note nodes
4. Pan and zoom
5. Real-time note updates
6. Anonymous posting
7. Optional display names
8. Color-coded notes
9. Note interactions
10. Ranking
11. Automatic expiration

The Ethiopia map should be treated as a planned feature unless explicitly requested.

## Frontend Architecture

The application uses:

- Next.js
- React
- TypeScript
- React Flow for the infinite canvas
- Supabase for backend functionality

React Flow should be treated primarily as the **canvas engine**, not as a diagram editor.

Each sticky note is a custom React Flow node.

Conceptually:

```text
React Flow
├── Canvas
│   ├── Pan
│   ├── Zoom
│   └── Viewport
│
├── Custom Sticky Nodes
│   ├── Content
│   ├── Author
│   ├── Color
│   ├── Interactions
│   └── Timestamp
│
└── Custom UI
```

React Flow's internal node coordinates should not become the database model.

The database stores normalized coordinates:

```text
x: 0..1
y: 0..1
```

The frontend converts these into React Flow positions.

## Backend Architecture

Supabase is the backend platform.

Use:

- Supabase Postgres
- Supabase Realtime
- Supabase Edge Functions
- Supabase Row Level Security
- Supabase Auth only when authentication is actually needed

Do not introduce a separate Node.js server, Cloudflare Worker, or D1 database unless explicitly requested.

Architecture:

```text
Browser
   │
   ▼
Next.js
   │
   ├── React Flow
   │
   └── Supabase Client
          │
          ├── Postgres
          ├── Realtime
          └── Edge Functions
                    │
                    ├── Validation
                    ├── Rate limiting
                    ├── Abuse prevention
                    └── Trusted mutations
```

## Data Model

The main entity is a Wall note.

A note conceptually contains:

```text
id
body
color
x
y
name
user_id
owner_token_hash
created_at
last_interaction_at
expires_at
hidden
```

Rules:

- Body: 1–180 characters.
- Name: optional, maximum 24 characters.
- X/Y are normalized between 0 and 1.
- Color must come from the approved palette.
- `hidden` is used for moderation.
- Published notes cannot be edited or repositioned.
- Rotation is not stored.

## Anonymous Ownership

Anonymous users receive a random browser token.

Example:

```ts
crypto.randomUUID();
```

Store the token locally.

Never expose another user's ownership token.

The backend should store a hash of the token rather than the raw token whenever possible.

The frontend can use the server-provided `mine` property to determine whether a note belongs to the current visitor.

## Note Rotation

Do not store rotation in the database.

Derive it deterministically from the note ID.

This guarantees that the same note has the same visual rotation after refresh.

The rotation should remain subtle, approximately:

```text
-4° → +4°
```

## Realtime

Supabase Realtime should broadcast newly created notes.

The intended flow is:

```text
User A creates note
       ↓
Supabase Edge Function
       ↓
Postgres INSERT
       ↓
Supabase Realtime
       ↓
Other connected users
       ↓
React Flow adds custom node
```

The UI should make new notes feel like they are appearing naturally on a living public wall.

## Note Expiration

Notes have two expiration rules:

- Maximum lifetime: 7 days.
- If nobody interacts with a note for 24 hours, it expires.

Interaction should extend the active lifetime, but never beyond the seven-day maximum.

Cleanup should happen server-side using a scheduled Supabase job/function.

Do not rely on the frontend to delete expired notes.

## Interactions

The initial interaction system should remain simple.

A user can interact with a note, and interactions contribute to its ranking.

Anonymous visitors should have a stable visitor identity so they cannot repeatedly interact with the same note without restriction.

Prevent duplicate interactions using database constraints where appropriate.

## Ranking

Ranking should favor notes that are both:

- Recently created
- Highly interacted with

Avoid a simple lifetime interaction count because old notes would permanently dominate.

A time-decay formula can be used, for example:

```text
score = interactions / (hours_since_creation + 2)
```

The exact ranking algorithm can evolve later.

## Abuse Prevention

Because the Wall is public and anonymous, abuse prevention is important.

Initial protections:

- Rate limiting
- Request validation
- Content-length limits
- Basic content filtering
- Turnstile/bot protection
- Database constraints
- RLS
- Moderation support

Initial posting limits:

```text
1 post per minute
20 posts per hour
```

Do not trust client-side validation.

All important validation must happen server-side.

## Security Principles

Never trust:

- Client-provided ownership
- Client-provided expiration dates
- Client-provided interaction counts
- Client-provided ranking scores
- Client-provided moderation state

The client can request an operation.

The backend decides whether that operation is valid.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
TURNSTILE_SECRET
IP hashing secrets
```

through `NEXT_PUBLIC_*` environment variables.

## UI Philosophy

The Wall should feel:

- Fast
- Minimal
- Playful
- Slightly chaotic
- Human
- Visual

Avoid making it look like an admin dashboard or traditional social-media feed.

Sticky notes should feel physical.

Consider:

- Slight rotation
- Soft shadows
- Subtle paper texture
- Natural spacing
- Small entrance animations
- Hover/tap interactions
- Smooth canvas movement

Do not over-animate the interface.

## Important Product Constraint

Do not over-engineer the first version.

The core loop is:

```text
Open Wall
   ↓
Explore thoughts
   ↓
Find something interesting
   ↓
React
   ↓
Write your own thought
   ↓
Stick it
   ↓
See it appear for everyone
```

Everything that does not improve this loop should be questioned before being added.

## Existing Project

The existing frontend has already been implemented.

The `/wall` route exists.

The current data layer uses local seed data and needs to be migrated to Supabase.

Do not rewrite the existing Wall UI unnecessarily.

Before making changes:

1. Inspect the existing implementation.
2. Understand the current component structure.
3. Identify existing abstractions.
4. Preserve working UI and interaction behavior.
5. Change only what is necessary for backend integration.

## Expected Engineering Style

Use the existing project's conventions.

Prefer:

- TypeScript
- Small focused modules
- Strong typing
- Server-side validation
- Explicit data transformations
- Reusable Supabase helpers
- Feature-oriented organization

Avoid:

- Premature abstractions
- Generic repositories for everything
- Unnecessary API layers
- Global state when local state is sufficient
- Duplicating backend business logic in the client
- Introducing new infrastructure without a clear need

## Key Principle

The Wall is a **product first and an architecture exercise second**.

Build the smallest system that can reliably support:

> **A public, real-time, infinite canvas of human thoughts.**
