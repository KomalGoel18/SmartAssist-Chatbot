# Implementation Plan - Button-Driven Decision-Tree Chatbot (Supabase Edition)

This plan outlines the distinct technical steps to build a non-conversational, state-driven chatbot using **Next.js**, **Tailwind CSS**, and **Supabase**.

## User Review Required

> [!NOTE]
> **Supabase Setup**: The full SQL schema is in **Section 2** below. Run it in your Supabase SQL Editor to create tables and RLS policies.
> **Environment Variables**: Add to `.env.local`:
> - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (client-safe).
> - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key (client-safe).
> - `SUPABASE_SERVICE_ROLE_KEY` — Server-only; use in API routes for table writes. **Do not** expose via `NEXT_PUBLIC_*`.

---

## Proposed Changes

### 1. Project Initialization & Infrastructure

#### [NEW] [package.json](file:///c:/Users/arnav/OneDrive/Desktop/Arula/package.json)
- **Technical Detail**: Initialize a new Next.js 14+ app (App Router).
- **Key Dependencies**:
    - `@supabase/supabase-js`: Official client for DB interactions (client + server).
    - `framer-motion`: Fluid message bubble entry animations and layout shifts.
    - `lucide-react`: Lightweight SVG icons for UI polish.
    - *(No `uuid` package for sessions: session IDs are generated only by the database; the client receives and stores the ID returned from POST `/api/session`.)*

#### [NEW] [.env.local](file:///c:/Users/arnav/OneDrive/Desktop/Arula/.env.local)
- **Purpose**: Secure configuration; never commit this file.
- **Content**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

#### [NEW] [utils/supabase/client.ts](file:///c:/Users/arnav/OneDrive/Desktop/Arula/utils/supabase/client.ts)
- **Technical Detail**: Singleton Supabase client for **browser** use (anon key).
- **Why**: Prevents multiple client reinits during re-renders. Use for read-only or for calls that respect RLS. **Do not** use for writing sessions/events/leads from the client; all writes go through API routes.

#### [NEW] [utils/supabase/server.ts](file:///c:/Users/arnav/OneDrive/Desktop/Arula/utils/supabase/server.ts) *(optional but recommended)*
- **Technical Detail**: Supabase client for **server** (API routes) using `SUPABASE_SERVICE_ROLE_KEY`.
- **Why**: Bypasses RLS for trusted server-side inserts into `sessions`, `tracking_events`, and `leads`. Keeps anon key safe on client.

---

### 2. Database Schema (The Backend Foundation)

#### [NEW] [supabase_schema.sql](file:///c:/Users/arnav/OneDrive/Desktop/Arula/supabase_schema.sql)
- **Purpose**: Defines the persistence layer and security. Run this script in the Supabase SQL Editor once per project.

**Tables**:
1. **`sessions`** — Unique user visits.
    - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
    - `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
    - `metadata` JSONB (e.g. user_agent, referrer)
2. **`tracking_events`** — Granular behavior logs.
    - `id` BIGSERIAL PRIMARY KEY
    - `session_id` UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE
    - `node_id` TEXT NOT NULL
    - `choice_path` TEXT (breadcrumb of choices)
    - `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
3. **`leads`** — Final booking/conversion data.
    - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
    - `session_id` UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE
    - `data` JSONB NOT NULL (dynamic fields: date, time, service, etc.)
    - `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

**Full SQL to run in Supabase**:

```sql
-- Sessions: one row per chat session
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Tracking events: one row per button/node visit
CREATE TABLE IF NOT EXISTS tracking_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  choice_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_session_id ON tracking_events(session_id);

-- Leads: one row per completed flow (e.g. booking)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_session_id ON leads(session_id);

-- RLS: Enable so anon has no access by default; service role (used in API) bypasses RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Do NOT create any policy for anon. No policy = no access for anon.
-- Supabase service_role bypasses RLS, so API routes using the service role key have full access.
```

> **Note**: Supabase’s service role bypasses RLS. The policies above document intent; in practice, only your API routes (using the service role key) should write to these tables. Do not grant anon any policies on `sessions`, `tracking_events`, or `leads` if you want API-only writes.

---

### 3. Session Lifecycle (Critical Flow)

- **Creation**: On first load of the chat UI, the client calls **POST `/api/session`** (no body required, or optional `metadata`). The API creates a row in `sessions` using **only** `gen_random_uuid()` (database-led); the client **never** sends a session UUID. The API returns `{ session_id: string }`.
- **Storage**: The client stores the returned `session_id` in React state; optionally persist in `sessionStorage` so refresh keeps the same session.
- **Usage**: Every **POST `/api/track-event`** and **POST `/api/submit-lead`** request body must include `session_id`. The API validates that the session exists (optional) and then performs the insert.
- **No client-side session table writes**: The browser never writes to `sessions` directly; only the API route does, using the service role client.

---

### 4. Knowledge Graph (The Logic Store)

#### [NEW] [data/knowledge-graph.json](file:///c:/Users/arnav/OneDrive/Desktop/Arula/data/knowledge-graph.json)
- **Technical Detail**: The “program ROM” of the chatbot. Decouples flow logic from code and allows non-dev edits.
- **Loading**: Import statically in the engine or hook, e.g. `import graph from '@/data/knowledge-graph.json'`, so it’s bundled at build time and there is no runtime fetch latency.

**Structure**:
- **`root`**: string — Node id to show first.
- **`nodes`**: object — Map of node id → node.
- **Node types**:
  - **`info`** / **`choice`**: Display content and optional `options` (buttons). Each option has `label` and `next` (node id).
  - **`input`**: Display content and collect one value (e.g. text, date). Use `dataKey` to store the value in `sessionData[dataKey]`; `next` can be a single string (next node) or omitted if terminal.
  - **`terminal`**: End of flow. No `options`, or `options: []`. Engine calls **POST `/api/submit-lead`** with `sessionData` and shows a success (or thank-you) state.

**Example**:

```json
{
  "root": "welcome_node_1",
  "nodes": {
    "welcome_node_1": {
      "id": "welcome_node_1",
      "type": "info",
      "content": "Hello! How can we help?",
      "options": [
        { "label": "Book Appointment", "next": "booking_date" },
        { "label": "FAQs", "next": "faq_root" }
      ]
    },
    "booking_date": {
      "id": "booking_date",
      "type": "input",
      "content": "Choose a date",
      "dataKey": "booking_date",
      "next": "booking_confirm"
    },
    "booking_confirm": {
      "id": "booking_confirm",
      "type": "terminal",
      "content": "Thanks! We’ll confirm your booking."
    }
  }
}
```

**Terminal detection**: A node is terminal **only** when `type === 'terminal'`. Do **not** use the presence or absence of `options` to decide terminality: input nodes have no options but are not terminal—they lead to a `next` node. For terminal nodes, the engine must not render choice buttons; it calls submit-lead and shows the terminal content.

---

### 5. Frontend Engine (“The Interpreter”)

#### [NEW] [hooks/useChatLogic.ts](file:///c:/Users/arnav/OneDrive/Desktop/Arula/hooks/useChatLogic.ts)
- **Technical Detail**: Custom hook that holds the graph traversal FSM logic, separate from UI.
- **Responsibilities**: Load graph (static import), manage `history`, `currentNode`, `sessionData`, `sessionId`, and **`choicePath`** (array of option labels or node ids representing the path from root). On “option selected”: append the chosen option’s `label` (or `next` node id) to `choicePath`, navigate, append to history, and **always** call POST `/api/track-event` with `node_id` (the new node) and `choice_path: choicePath.join(' > ')`. **Always** call track-event when the current node changes (including when navigating to an input node or after input submit)—never optionally—so analytics have no “black holes.” Detect terminal (only `type === 'terminal'`) and call submit-lead; create session on mount (POST `/api/session`) and store the returned `session_id`.
- **Returns**: `{ history, currentNode, sessionData, sessionId, choicePath, onSelectOption, onInputSubmit, isLoading, error }` (or equivalent) so `ChatEngine` only renders.

#### [NEW] [components/ChatEngine.tsx](file:///c:/Users/arnav/OneDrive/Desktop/Arula/components/ChatEngine.tsx)
- **Technical Detail**: Main React component; consumes `useChatLogic` and renders the conversation.
- **State**: All FSM state lives in the hook. This component renders `history` as a list of `MessageBubble`s and, for the current node, either `OptionGrid` (buttons), an input component (for `input` nodes), or terminal content (no buttons, success message).

#### [NEW] [components/MessageBubble.tsx](file:///c:/Users/arnav/OneDrive/Desktop/Arula/components/MessageBubble.tsx)
- **Technical Detail**: Functional component using `framer-motion`.
- **Props**: `type` ('bot' | 'user'), `content` (string or JSX), `delay` (number, ms) for staggered animation (e.g. derived from history index).
- **Visuals**: Tailwind: distinct styling for user vs bot (e.g. user `rounded-br-none`, bot `rounded-bl-none`).

#### [NEW] [components/OptionGrid.tsx](file:///c:/Users/arnav/OneDrive/Desktop/Arula/components/OptionGrid.tsx)
- **Technical Detail**: Renders a grid of buttons from the current node’s `options`.
- **Behavior**: When the user clicks a button, call `onSelect(option)`. If `options` is missing or empty, render nothing (or a single “Start over” link if desired). Do not render the grid when the node is terminal.

#### [NEW] [components/InputCapture.tsx](file:///c:/Users/arnav/OneDrive/Desktop/Arula/components/InputCapture.tsx)
- **Technical Detail**: Used for nodes with `type: 'input'`.
- **Behavior**: Renders a single input (text, date, etc. from node config), and on submit stores the value in `sessionData` under the node’s `dataKey`, then navigates to `next`. The engine has already recorded a track-event when the user *landed* on this node; when the user submits, the engine navigates and records a track-event for the new node (track-event is fired on every node change by the hook, not optionally).

---

### 6. Backend Services (Next.js API Routes)

All three routes use the **server** Supabase client (`SUPABASE_SERVICE_ROLE_KEY`) to insert data. Validate inputs and return clear status codes and error bodies.

#### [NEW] [app/api/session/route.ts](file:///c:/Users/arnav/OneDrive/Desktop/Arula/app/api/session/route.ts)
- **Method**: POST.
- **Body**: Optional `{ metadata?: object }` (e.g. user_agent, referrer).
- **Logic**: Insert one row into `sessions` (id from `gen_random_uuid()`, created_at default, metadata from body). Return `{ session_id: "<uuid>" }` with status 201.
- **Validation**: If `metadata` is sent, ensure it’s an object (or omit). No strict schema required for metadata.
- **Errors**: 500 on DB failure; return `{ error: "message" }`.

#### [NEW] [app/api/track-event/route.ts](file:///c:/Users/arnav/OneDrive/Desktop/Arula/app/api/track-event/route.ts)
- **Method**: POST.
- **Role**: Fire-and-forget logging; do not block the UI.
- **Body**: `{ session_id: string (UUID), node_id: string, choice_path?: string }`. `choice_path` is the breadcrumb built by the client: the hook maintains a path array and sends `choice_path: path.join(' > ')` (e.g. `"Book Appointment > Choose date > Confirm"`).
- **Validation**: Require `session_id` (valid UUID format) and `node_id` (non-empty string). On failure return 400 `{ error: "Invalid session_id or node_id" }`.
- **Logic**: Insert into `tracking_events`. Return 204 No Content or 200 with `{ ok: true }`.
- **Errors**: 500 on DB failure; return `{ error: "message" }`.

#### [NEW] [app/api/submit-lead/route.ts](file:///c:/Users/arnav/OneDrive/Desktop/Arula/app/api/submit-lead/route.ts)
- **Method**: POST.
- **Role**: Called when the user reaches a terminal node; commits the lead.
- **Body**: `{ session_id: string (UUID), data: object }`. `data` holds the collected booking/conversion fields (e.g. date, time, service).
- **Validation**: Require `session_id` (valid UUID) and `data` (object, can be empty). Return 400 `{ error: "Invalid session_id or data" }` if invalid.
- **Logic**: Insert into `leads`. Return 201 with `{ lead_id: "<uuid>" }` or 200 with `{ ok: true }`.
- **Errors**: 500 on DB failure; return `{ error: "message" }` so the UI can show “Try again”.

---

## Verification Plan

### Automated Tests
- **Database connection**: Script at **`scripts/verify-supabase.ts`** (or `verify-db.ts`). Run with `npx ts-node scripts/verify-supabase.ts` or `npm run verify:db`. It should (1) create a Supabase client with service role, (2) run a simple query (e.g. `select 1`, or `from sessions limit 1`), (3) exit 0 if OK, 1 on failure.
- **Flow validation**: Unit test (e.g. in `__tests__/knowledge-graph.test.ts`) that loads `knowledge-graph.json` and checks: every node’s `next` (and `options[].next`) points to an existing node or is absent for terminal nodes; no dead ends unless terminal; `root` exists in `nodes`.

### Manual Verification
1. **Session**: Open app in incognito → trigger chat load → call POST `/api/session` → check `sessions` table for new row; confirm client receives `session_id`.
2. **Clickstream**: With same session, click 3 buttons → confirm 3 rows in `tracking_events` with correct `session_id` and `node_id`.
3. **Lead**: Complete a flow to a terminal node → confirm one new row in `leads` with correct `session_id` and expected `data` blob.

---

## Checklist Summary

| Area | Deliverable |
|------|-------------|
| Infra | `package.json`, `.env.local`, `utils/supabase/client.ts`, `utils/supabase/server.ts` |
| DB | `supabase_schema.sql` run in Supabase (tables + RLS) |
| Session | POST `/api/session`; client stores `session_id`; used in track-event and submit-lead |
| Graph | `data/knowledge-graph.json` with `root`, `nodes`, types `info`/`choice`/`input`/`terminal` |
| Engine | `hooks/useChatLogic.ts`, `components/ChatEngine.tsx`, `MessageBubble.tsx`, `OptionGrid.tsx`, `InputCapture.tsx` |
| API | `app/api/session/route.ts`, `app/api/track-event/route.ts`, `app/api/submit-lead/route.ts` |
| Verify | `scripts/verify-supabase.ts`, flow validation test, manual session/events/lead checks |
