# AI Project Showcase & Matching Tool — Design Spec

**Date:** 2026-05-21  
**Project:** stpeteai.org  
**Status:** Approved

---

## Overview

An AI-powered matching tool on stpeteai.org that lets anyone in the community describe a problem they're facing. Claude reads the submission and returns:

1. Up to 3 St. Pete AI members who could help build a solution
2. Up to 3 existing AI tools or datasets relevant to the problem

Matched members receive an email notification with the submitter's contact details. Members opt in to the match pool; admins approve them before they appear in results.

---

## Architecture

Single-page Flask approach — new routes and templates added to the existing `app.py` and `templates/` structure. No new infrastructure. Consistent with the existing Jinja2 + SQLAlchemy + SES pattern.

---

## Data Models

Three new SQLAlchemy models added to `app.py`.

### `MatchProfile`
Member opt-in record.

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer PK | |
| `name` | String(120) | |
| `email` | String(200) | unique |
| `bio` | Text | What they can help with |
| `skills` | Text | Comma-separated tags (e.g. "NLP, automation, computer vision") |
| `active` | Boolean | Default False; admin must approve |
| `created_at` | DateTime | |

Separate from the existing `Member` model. A paying member and a match pool volunteer are independent concepts.

### `AiTool`
Admin-curated tool/resource records.

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer PK | |
| `name` | String(200) | e.g. "Make.com" |
| `url` | String(500) | |
| `description` | Text | Brief description |
| `tags` | Text | Comma-separated |
| `active` | Boolean | Default True |
| `created_at` | DateTime | |

### `MatchSubmission`
Audit log of every problem submitted.

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer PK | |
| `name` | String(120) | Submitter name |
| `email` | String(200) | Submitter email |
| `org` | String(200) | Optional organization name |
| `domain` | String(50) | Category: Healthcare, Education, Retail, Nonprofit, Government, Other |
| `problem` | Text | Free-text problem description |
| `matched_profiles` | Text | JSON — list of `{id, name, reason}` |
| `matched_tools` | Text | JSON — list of `{id, name, reason}` |
| `created_at` | DateTime | |

---

## Routes

### Public

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/match` | Submission form |
| POST | `/match` | Process submission, call Claude, render results |
| GET | `/match/apply` | Member opt-in form |
| POST | `/match/apply` | Save `MatchProfile` (inactive), notify admin via SES |

### Admin (behind `@admin_required`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/match-profiles` | List pending and active profiles |
| POST | `/admin/match-profiles/<id>/approve` | Set `active=True` |
| POST | `/admin/match-profiles/<id>/reject` | Delete profile |
| GET | `/admin/tools` | List AI tools |
| POST | `/admin/tools` | Add new tool |
| GET | `/admin/tools/<id>/edit` | Edit tool form |
| POST | `/admin/tools/<id>/edit` | Save edits |
| POST | `/admin/tools/<id>/deactivate` | Set `active=False` |

---

## Matching Logic

**Inside `POST /match`:**

1. Load all active `MatchProfile` and `AiTool` records from the database.
2. Build a Claude prompt containing:
   - The submitter's domain and problem description
   - All active member profiles (name, bio, skills)
   - All active AI tools (name, description, tags)
3. Instruct Claude to return a JSON object:
   ```json
   {
     "members": [
       {"id": 1, "name": "Jane Smith", "reason": "One sentence why."},
       ...
     ],
     "tools": [
       {"id": 3, "name": "Make.com", "reason": "One sentence why."},
       ...
     ]
   }
   ```
   Top 3 each, ranked by relevance.
4. Parse the JSON response. On failure, catch exception and fall through to error handling.
5. Save `MatchSubmission` with matched results.
6. Email each matched member via SES: submitter's name, org, problem, and contact email.
7. Render `match_results.html`.

**Claude model:** `claude-haiku-4-5-20251001` (fast, low cost for this use case).

---

## Templates

### Public

- **`templates/match.html`** — Submission form. Fields: Name, Email, Organization (optional), Domain (dropdown), Problem (textarea, 20–2000 chars). Submit button: "Find Matches". Matches existing site nav and visual style.

- **`templates/match_results.html`** — Two card sections: "Members Who Can Help" and "AI Tools to Explore". Each card shows name, bio/description snippet, and Claude's one-sentence match reason. Footer note: "Matched members have been notified." Link to submit another problem.

- **`templates/match_apply.html`** — Member opt-in form. Fields: Name, Email, Bio, Skills (comma-separated free text). On submit: confirmation message "Your application is under review — we'll be in touch."

### Admin

- **`templates/admin/match_profiles.html`** — Table of profiles grouped by status (Pending / Active). Approve and Reject buttons per row. Follows existing admin layout template.

- **`templates/admin/tools.html`** — List of AI tools with Add, Edit, and Deactivate actions. Same pattern as existing admin events table.

---

## Navigation

- Add "Showcase" link to the main nav in `templates/index.html` pointing to `/match`.
- Add "Join the Match Pool" link in the membership/community section of `index.html`.
- Add "Match Profiles" and "AI Tools" links to the admin dashboard sidebar.

---

## Error Handling & Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty match pool | Claude still runs; results page shows friendly "no members yet / no tools yet" messages. Submission is still saved. |
| Claude API failure | Catch exception; save submission with empty match fields; show user "We couldn't generate matches — we've saved your submission and will follow up manually." Admin notified via SES. |
| Malformed Claude JSON | Same as API failure — treat parse error as failure. |
| Duplicate opt-in email | Return friendly message: "We already have an application for that email." |
| Problem too short/long | Validate 20–2000 characters client-side and server-side. |
| Invalid email | Validated with existing `EMAIL_RE` regex. |
| Abuse prevention | Flask-Limiter: `POST /match` at 5/hour per IP; `POST /match/apply` at 3/day per IP. |
| Input sanitization | Strip HTML from all free-text fields before passing to Claude. |

---

## Email Notifications (SES)

| Trigger | Recipient | Content |
|---------|-----------|---------|
| New opt-in application | Admin (`ADMIN_NOTIFY_EMAIL`) | Applicant name, email, bio, skills |
| Submission processed | Each matched member | Submitter name, org, domain, problem text, contact email |
| Claude failure | Admin | Submission details for manual follow-up |

All sent via the existing `_ses_send()` helper.

---

## Out of Scope

- Public showcase/gallery of past submissions (can be added later)
- Member profiles being publicly browsable
- Submitter accounts or login
- Payment or compensation between submitters and members
- Next.js frontend
