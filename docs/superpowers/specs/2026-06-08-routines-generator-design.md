# Claude Code Routines Generator — Design Spec

## Overview

Add a `/routines` page to stpeteai.org that lets community members browse a curated library of 150 Claude Code automation routines (user stories), filter by role/category/trigger, select the ones relevant to them, and receive a Claude-generated personalized implementation plan. The feature is server-side rendered using Flask + Jinja2, consistent with the rest of the site.

## Goals

- Give the St. Pete AI community a practical, immediately useful AI automation tool
- Surface the Claude Code Routines concept to non-technical and technical users alike
- Drive engagement with the site beyond events and membership
- Use the existing `anthropic` SDK integration already in `app.py` — no new dependencies

## What Gets Built

### 1. `routines_data.py` — Story library

A new Python module containing all 150 routines as a list of dicts. Each entry:

```python
{
    "id": 1,
    "title": "Code Review Automation",
    "role": "Engineer",           # matches a filter bucket
    "category": "Code & Development",
    "trigger": "GitHub Events",   # Scheduled | GitHub Events | API/On Demand
    "frequency": "Immediate",
    "as_a": "QA Lead",
    "i_want": "Claude to review every PR for security issues",
    "so_that": "vulnerabilities are caught before merge",
}
```

Categories (10): Code & Development, Project Management & Agile, Documentation, Communication & Reporting, Quality Assurance & Testing, Deployment & Operations, Security & Compliance, Business & Analytics, Stock Market & Investment, Small Business Operations.

Roles (8): Engineer, Product Manager, Manager, DevOps, QA, Security, Investor, Small Business Owner.

Triggers (3): Scheduled, GitHub Events, API/On Demand.

### 2. Two new Flask routes

**`GET /routines`**
- Accepts optional query params `?category=` and `?role=` for server-side filtering
- Passes filtered stories + all filter options to `templates/routines.html`
- No authentication required — public page

**`POST /routines/generate`**
- Accepts JSON: `{ "selected_ids": [1, 5, 16], "role": "Engineer", "tools": "GitHub, Slack", "goal": "reduce manual reporting" }`
- Validates: at least 1 story selected, role present
- Calls Claude (claude-haiku-4-5-20251001, max_tokens=1500)
- Returns JSON: `{ "plan": "<generated text>" }` or `{ "error": "<message>" }`
- Rate-limited: 5 per hour per IP (same pattern as `/match`)

### 3. `templates/routines.html` — Directory page

**Layout:** Two-column grid (left panel sticky, right panel scrollable) — matches the `#programs` / `#meetup` / `#lessons` grid pattern.

**Left panel — Profile + Filter:**
- Role `<select>` (All Roles + 8 role options)
- Category filter pills (All + 10 categories)
- Trigger filter pills (All + 3 trigger types)
- "Your context" fields: `tools` (text input, placeholder "GitHub, Slack, Jira…"), `goal` (text input, placeholder "reduce manual reporting time")
- Selected count badge: "X routines selected"
- "Generate My Plan" button — disabled until ≥1 story selected

**Right panel — Story directory:**
- Stories grouped by category, each as a card with:
  - Checkbox (for selection)
  - Story title
  - Role badge + trigger type badge
  - Frequency label
  - Full "As a [role], I want [action], so that [benefit]" text
- Filtered live by left-panel selectors via vanilla JS (no framework)
- Maintains checkbox state across filter changes

**Results area:** Full-width dark card below both panels. Hidden until a plan is generated. Shows Claude output as formatted text. Loading state shows a spinner/pulse animation while the POST request is in flight (fetch API).

### 4. Claude prompt design

```
You are helping a {role} at a community AI organization set up Claude Code automation routines.

Their tools: {tools}
Their goal: {goal}

They have selected these {n} routines:
{for each story: "- [{id}] {title}: As a {as_a}, I want {i_want}, so that {so_that}. Trigger: {trigger}. Frequency: {frequency}."}

Generate a personalized implementation plan with these sections:

1. WHY THESE FIT YOU (2-3 sentences): Why this set of routines matches their role and goal.
2. ROUTINE BREAKDOWN: For each selected routine, provide:
   - What Claude does in this routine
   - What data source or integration it needs
   - What the output looks like
   - Estimated setup time
   - Estimated weekly time saved
3. START HERE: Which 1-2 routines to implement first and why.
4. QUICK-START CHECKLIST: 3-5 concrete action items to get the first routine running.

Be specific and practical. Write for someone who may be new to Claude Code automation.
```

**Failure handling:**
- No API key → return `{"error": "Plan generation temporarily unavailable."}`, show flash error
- Claude exception → same error
- No stories selected → return 400 `{"error": "Please select at least one routine."}`

### 5. Site integration

**Nav (`templates/index.html`):** Add "Routines" link to `.nav-links` between "Resources" and "Showcase".

**Footer:** Add "Routines" link under the "Resources" footer column.

**Homepage programs section:** Add a 6th program item in `#programs`:
> **06 — Claude Code Routines**
> Browse 150 AI automation routines by role and category. Select the ones that fit your workflow and get a Claude-generated implementation plan. [Browse Routines →]

**Sitemap (`GET /sitemap.xml`):** Add entry for `https://www.stpeteai.org/routines` with `changefreq=weekly`, `priority=0.8`, `lastmod=2026-06-08`.

## Data Flow

```
User visits /routines
  → Flask renders routines.html with all 150 stories
  → User filters by role/category/trigger (vanilla JS, no server round-trip)
  → User selects stories + fills in tools/goal
  → JS POSTs to /routines/generate
  → Flask validates, calls Claude, returns plan JSON
  → JS renders plan in results card below the panels
```

## Error Handling

| Scenario | Behavior |
|---|---|
| No stories selected | Button disabled; JS prevents submit |
| API key missing | Flash error: "Plan generation temporarily unavailable" |
| Claude API error | Same flash error; logged server-side |
| Rate limit hit | Flash error: "Too many requests. Please try again later." |
| Network error on fetch | Inline error in results card |

## Out of Scope

- Saving/persisting generated plans (no auth, no user accounts)
- Editing or customizing individual routines in the app
- Exporting plans as files
- Admin management of the story library (static data file, not DB)
- React or any JS build step
