# Resources Section Redesign — Design Spec

## Overview

Replace the current Claude's Brain-only section on the stpeteai.org homepage with a broader "AI Tools for the Community" resource directory. The section becomes a category-grouped, admin-managed directory of AI tools drawn from the existing `AiTool` database model, with Claude's Brain retained as a hardcoded featured card at the top.

## Goals

- Surface useful AI tools to the St. Pete community (beginners to builders)
- Leverage the `AiTool` model already built for the matching feature — no duplicate data management
- Give admins full control via the existing admin panel (add/edit/deactivate tools)
- Keep Claude's Brain visible as a featured resource from the founder

## What Changes

### 1. `AiTool` model — add `category` field

Add a nullable `category` string column to `AiTool`. Existing rows default to `NULL` (rendered as "Other" in the template).

### 2. Admin tool form — add Category input

The `/admin/tools/new` and `/admin/tools/<id>/edit` forms gain a Category field. Implemented as a free-text `<input>` with a `<datalist>` suggesting common values:

> General AI, Writing, Image Generation, Coding, Automation, Data & Research, Video, Other

### 3. Homepage route — query and group tools

The `GET /` route queries `AiTool.query.filter_by(active=True).order_by(AiTool.category, AiTool.name)` and passes the results to `index.html`. The template groups tools by category using a Jinja2 loop.

### 4. `index.html` — replace `#claudes-brain` section content

The section with `id="claudes-brain"` is rewritten:

- **Section header**: badge "Community Resources", headline "AI TOOLS FOR EVERYONE.", subtitle copy
- **Featured card** (hardcoded): dark background card for Claude's Brain with "From Our Founder" label and "Get the Guide →" link
- **Category groups**: for each category, a section header (uppercase label + divider) followed by a 3-column grid of tool cards
- **Each tool card**: tool name, 1-line description, "Visit →" link (opens in new tab)
- **Bottom CTA**: "Have a tool to suggest? Submit via the Showcase →" linking to `/match`
- If no active tools exist, the category grid is omitted gracefully (featured card still shows)

### 5. Nav label change

The top nav and mobile nav link text changes from "Claude's Brain" to "Resources". The `href="#claudes-brain"` anchor is unchanged to avoid breaking existing links.

## What Does NOT Change

- `AiTool` model fields other than adding `category`
- Admin tools list/deactivate behavior
- The `/match` and `/match/apply` routes
- Any other section of `index.html`
- The `#claudes-brain` anchor ID (kept for link compatibility)

## Visual Design

Matches the existing homepage aesthetic (dark navy/blue palette, Roboto font, inline CSS pattern used throughout `index.html`):

- Section background: `#eef1f7` (light blue-grey, consistent with other sections)
- Featured card: `#0d1220` dark background, teal "From Our Founder" label, white text
- Tool cards: white background, `#c4ccdc` border, `#141c2e` text, `#1e5fc4` links
- Category labels: uppercase, `#5c6680`, with `#c4ccdc` bottom border

## Data Migration

No automatic migration needed. After deploy, admin sets the `category` field for existing tools via `/admin/tools/<id>/edit`. Tools with no category render under an "Other" group or are omitted from the grouped display (implementation choice: render uncategorized tools under "Other").

## File Impact

| File | Change |
|---|---|
| `app.py` | Add `category` column to `AiTool`; pass active tools to `/` route |
| `templates/index.html` | Rewrite `#claudes-brain` section; update nav label |
| `templates/admin/tool_form.html` | Add Category field with datalist |
