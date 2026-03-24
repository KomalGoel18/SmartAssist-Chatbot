# ARULA Chatbot — Product Roadmap

> What needs to change to make this chatbot sellable as a startup product.

---

## Tier 1 — Must-Haves

Without these, no one buys.

### 1. Embeddable Script Tag

The chatbot currently only works inside this Next.js app. Clients need a single line they can drop onto **any** website:

```html
<script src="https://arula.co/widget.js" data-key="client_xxx"></script>
```

**What this requires:**

- Build the widget as a standalone JS bundle (Vite/Rollup)
- Render inside an iframe or shadow DOM to avoid CSS conflicts with host sites
- Accept a `data-key` attribute to identify the client and load their config
- Host the bundle on a CDN

**Why it matters:** This is the core delivery mechanism. Without it, every "customer" requires a custom deployment.

---

### 2. Admin Dashboard

Clients need a self-serve portal to manage their chatbot. Minimum viable dashboard:

- **Lead table** — View all captured leads (name, phone, email, timestamp) with search and filters
- **CSV export** — Download leads for use in external tools
- **Basic analytics** — Total sessions, total leads, conversion rate
- **Auth** — Login/signup via Supabase Auth (email + password to start)

**Why it matters:** No client will log into Supabase to check their leads. The dashboard is where they see value.

---

### 3. Landing Page

`app/page.tsx` is currently blank. This is the storefront. It needs:

- Hero section with a clear value proposition
- Live demo widget (the chatbot itself, running on the page)
- How-it-works section (3 steps)
- Pricing section (even if "Contact Us" for now)
- CTA to sign up or book a demo
- Mobile-responsive design

**Why it matters:** First impressions. If the website looks empty, no one trusts the product.

---

### 4. Lead Notifications

When a user completes the booking flow, the client currently gets **nothing** — they have to check the dashboard manually.

**Minimum:**

- Email notification on every new lead (via Resend, SendGrid, or Supabase Edge Functions)
- Include: name, phone, email, timestamp, conversation path

**Stretch:**

- WhatsApp notification (strong differentiator in the Indian market)
- Slack webhook integration

**Why it matters:** Leads go cold fast. Instant notification = faster follow-up = higher close rate.

---

### 5. Multi-Tenancy

Support multiple clients from a single deployment.

**What this requires:**

- `orgs` table — each client is an org with an `org_id`
- All existing tables (`sessions`, `tracking_events`, `leads`) get an `org_id` foreign key
- Each org has its own knowledge graph (stored in DB, not a JSON file)
- API routes scope all queries by `org_id`
- Widget `data-key` maps to an org

**Why it matters:** Without this, scaling means manually deploying per customer. That doesn't work past 2-3 clients.

---

## Tier 2 — Expected by Buyers

These separate a real product from a demo project.

### 6. Visual Decision-Tree Editor

Clients should edit the conversation flow from the dashboard — no JSON editing.

- Drag-and-drop node editor (or at minimum a form-based editor)
- Add/remove/reorder nodes and options
- Preview changes before publishing
- Libraries to consider: React Flow, Xyflow

**Why it matters:** The knowledge graph is the product's core value. Clients need to own it without developer help.

---

### 7. Theming & Branding Config

Everything is currently hardcoded (purple, "ARULA Support", emojis). Clients need to customize:

- Brand color (header, buttons, accents)
- Bot name and avatar
- Welcome message
- Font (optional)

Store as a `theme` JSON column on the `orgs` table. Widget reads it on init.

**Why it matters:** A chatbot that says "ARULA Support" on a dental clinic's website is not a good look.

---

### 8. Calendly / Booking Integration

The git history mentions Calendly but it's not implemented. Options:

- **Option A:** Embed Calendly inline widget directly in the chat at the booking step
- **Option B:** Generate a Calendly link with pre-filled name/email from the chat and open in a new tab
- Store the Calendly URL per org in the dashboard

**Why it matters:** Closes the loop from lead capture to booked call without manual follow-up.

---

### 9. Mobile UX Polish

The 350px fixed widget works on desktop but needs attention on mobile:

- Full-screen takeover on viewports < 480px
- Proper keyboard handling — viewport should adjust when input fields focus
- Auto-scroll to bottom on new messages
- Touch-friendly button sizes (min 44px tap targets)
- Safe area handling for notched phones

**Why it matters:** Most users in the target market (parents seeking child development help) will be on phones.

---

### 10. Input Validation in Chat

Phone and email fields currently accept anything. Add inline validation:

- Phone: 10-digit format check, numeric only
- Email: basic format validation
- Show inline error messages ("Please enter a valid 10-digit number")
- Prevent advancing to next node until valid

**Why it matters:** Bad data = worthless leads. Clients lose trust when they get junk submissions.

---

## Tier 3 — Competitive Advantages

These make the product stand out.

### 11. Analytics Funnel Visualization

The tracking data is already being collected — surface it visually:

- Funnel chart showing drop-off per node ("80% reach `not_speaking`, only 30% reach `booking_name`")
- Session timeline view (replay a user's journey)
- Date range filters
- Conversion rate trends over time

**Why it matters:** This is the insight clients pay for. "Where are we losing people?" is the question every business asks.

---

### 12. Richer Node Types

The current text-only chat feels limited. Add support for:

- **Image nodes** — Show product photos, diagrams, infographics
- **Video nodes** — Embed YouTube/Vimeo clips
- **Carousel nodes** — Swipeable cards (services, testimonials)
- **Link nodes** — Buttons that open external URLs
- **File upload nodes** — Let users attach documents/photos

**Why it matters:** Competitors (Intercom, Tidio, Landbot) all support rich media. Text-only feels like 2018.

---

### 13. AI Fallback

When the decision tree doesn't cover a user's question:

- Detect free-text input that doesn't match any option
- Fall back to an LLM (Claude API) with the client's knowledge base as context
- Keep the conversation going instead of dead-ending
- Log AI interactions separately for review

**Why it matters:** This is where the market is heading. A hybrid decision-tree + AI approach gets the best of both worlds — structured funnels with flexible fallback.

---

### 14. CRM Integrations

Push leads to the tools clients already use:

- **Google Sheets** — Auto-append rows (huge for Indian SMBs)
- **HubSpot** — Create contacts on lead capture
- **Zoho CRM** — Popular in the Indian market
- **Webhook** — Generic POST to any URL for custom integrations

**Why it matters:** Leads trapped in the dashboard are less useful than leads flowing into existing workflows.

---

### 15. Conversation Handoff

Let a human agent take over when the bot can't handle it:

- "Talk to a human" option in the chat
- Real-time agent interface in the dashboard
- Notification to available agents
- Chat history preserved during handoff

**Why it matters:** Some conversations need a human. The ability to seamlessly transition builds trust with both clients and end users.

---

## Suggested Build Order

| Priority | Feature                  | Estimated Effort |
| -------- | ------------------------ | ---------------- |
| 1        | Landing page             | Small            |
| 2        | Embeddable widget        | Medium           |
| 3        | Lead email notifications | Small            |
| 4        | Admin dashboard + auth   | Large            |
| 5        | Multi-tenancy + theming  | Large            |
| 6        | Input validation         | Small            |
| 7        | Mobile UX polish         | Small            |
| 8        | Calendly integration     | Small            |
| 9        | Decision-tree editor     | Large            |
| 10       | Analytics funnel         | Medium           |
| 11       | CRM integrations         | Medium           |
| 12       | Richer node types        | Medium           |
| 13       | AI fallback              | Medium           |
| 14       | Conversation handoff     | Large            |
