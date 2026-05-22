# AI Project Showcase & Matching Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI-powered problem submission and member/tool matching feature to stpeteai.org using Claude Haiku.

**Architecture:** New routes, models, and templates added directly to the existing Flask app (`app.py` + `templates/`). Claude Haiku reads problem descriptions and returns ranked JSON matches from a pool of admin-approved member profiles and curated AI tools. Results display on a dedicated results page; matched members receive SES email notifications.

**Tech Stack:** Python/Flask, SQLAlchemy (SQLite dev / PostgreSQL prod), Jinja2, Anthropic Python SDK (`anthropic`), boto3 SES, Flask-Limiter, re (stdlib)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `app.py` | Add 3 models, 10 routes, matching logic, emails |
| Modify | `requirements.txt` | Add `anthropic>=0.25.0` |
| Create | `templates/match.html` | Public submission form |
| Create | `templates/match_results.html` | Results page (members + tools) |
| Create | `templates/match_apply.html` | Member opt-in form |
| Create | `templates/admin/match_profiles.html` | Admin: approve/reject profiles |
| Create | `templates/admin/tools.html` | Admin: CRUD for AI tools |
| Modify | `templates/admin/layout.html` | Add sidebar nav links |
| Modify | `templates/index.html` | Add nav link + membership CTA |

---

## Task 1: Add `anthropic` dependency

**Files:**
- Modify: `requirements.txt`

- [ ] **Step 1: Add the Anthropic SDK to requirements**

Open `requirements.txt` and add one line:

```
anthropic>=0.25.0
```

Final file should look like:
```
flask>=3.0.0
flask-sqlalchemy>=3.1.0
gunicorn==23.0.0
flask-limiter>=3.5.0
psycopg2-binary>=2.9.0
boto3>=1.34.0
anthropic>=0.25.0
```

- [ ] **Step 2: Install locally**

```
pip install anthropic
```

Expected: Package installs without error.

- [ ] **Step 3: Commit**

```
git add requirements.txt
git commit -m "feat: add anthropic SDK dependency"
```

---

## Task 2: Add database models

**Files:**
- Modify: `app.py` (after the `LessonBooking` model, before `# ── Seed data`)

- [ ] **Step 1: Add the three new models to `app.py`**

Insert the following block immediately after the `LessonBooking` model definition (around line 131), before the `# ── Seed data` comment:

```python
class MatchProfile(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(200), nullable=False, unique=True)
    bio        = db.Column(db.Text, default='')
    skills     = db.Column(db.Text, default='')
    active     = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AiTool(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(200), nullable=False)
    url         = db.Column(db.String(500), default='')
    description = db.Column(db.Text, default='')
    tags        = db.Column(db.Text, default='')
    active      = db.Column(db.Boolean, default=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)


class MatchSubmission(db.Model):
    id               = db.Column(db.Integer, primary_key=True)
    name             = db.Column(db.String(120), nullable=False)
    email            = db.Column(db.String(200), nullable=False)
    org              = db.Column(db.String(200), default='')
    domain           = db.Column(db.String(50), default='')
    problem          = db.Column(db.Text, nullable=False)
    matched_profiles = db.Column(db.Text, default='[]')
    matched_tools    = db.Column(db.Text, default='[]')
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)
```

- [ ] **Step 2: Verify the app starts and creates the new tables**

```
python app.py
```

Expected: Flask dev server starts, no `OperationalError`. Check that the SQLite file now has the new tables:

```
python -c "from app import db, app; app.app_context().push(); print([t for t in db.engine.table_names()])"
```

Expected output includes: `match_profile`, `ai_tool`, `match_submission`

- [ ] **Step 3: Commit**

```
git add app.py
git commit -m "feat: add MatchProfile, AiTool, MatchSubmission models"
```

---

## Task 3: Add matching helper function

**Files:**
- Modify: `app.py` (add helper after `_ses_send` / `send_booking_confirmation` block, before `# ── Seed data`)

- [ ] **Step 1: Add `import re` and `import anthropic` at the top of `app.py`**

`re` is already imported. Add `anthropic` to the imports block (after `import boto3`):

```python
import anthropic
```

- [ ] **Step 2: Add the `_strip_html` and `_run_matching` helpers**

Insert after `send_booking_confirmation` and before the `db = SQLAlchemy(app)` line... wait — `db` is already defined earlier. Insert these helpers after `send_booking_confirmation` (around line 70), before `db = SQLAlchemy(app)`. Actually `db` is defined at line 73, so insert these two functions between `send_booking_confirmation` and `db = SQLAlchemy(app)`:

```python
_HTML_TAG_RE = re.compile(r'<[^>]+>')

def _strip_html(text):
    return _HTML_TAG_RE.sub('', text).strip()


def _run_matching(problem_text, domain, profiles, tools):
    """Call Claude Haiku and return (member_matches, tool_matches).
    Each match is a dict with keys: id, name, reason.
    Returns ([], []) on any failure.
    """
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        return [], []

    profiles_block = '\n'.join(
        f"  - ID {p.id}: {p.name} | Skills: {p.skills} | Bio: {p.bio[:200]}"
        for p in profiles
    ) or '  (none)'

    tools_block = '\n'.join(
        f"  - ID {t.id}: {t.name} | Tags: {t.tags} | Desc: {t.description[:200]}"
        for t in tools
    ) or '  (none)'

    prompt = f"""A community member needs help. Match them to the best resources.

Problem domain: {domain}
Problem description: {problem_text}

Available St. Pete AI members (ID | name | skills | bio):
{profiles_block}

Available AI tools (ID | name | tags | description):
{tools_block}

Return ONLY valid JSON with this exact structure — no prose, no markdown fences:
{{
  "members": [
    {{"id": <integer>, "name": "<string>", "reason": "<one sentence>"}}
  ],
  "tools": [
    {{"id": <integer>, "name": "<string>", "reason": "<one sentence>"}}
  ]
}}

Rules:
- Include up to 3 members and up to 3 tools, ranked by relevance.
- If none are relevant, return empty arrays.
- Only include IDs that appear in the lists above.
- Reasons must be one sentence explaining why this match fits the problem.
"""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=512,
            messages=[{'role': 'user', 'content': prompt}],
        )
        raw = message.content[0].text.strip()
        data = __import__('json').loads(raw)
        members = data.get('members', [])[:3]
        tools   = data.get('tools',   [])[:3]
        return members, tools
    except Exception:
        return [], []
```

- [ ] **Step 3: Verify syntax**

```
python -c "import app; print('OK')"
```

Expected: `OK`

- [ ] **Step 4: Commit**

```
git add app.py
git commit -m "feat: add Claude Haiku matching helper"
```

---

## Task 4: Add public routes — submission form and results

**Files:**
- Modify: `app.py` (add routes after the `book_lesson` route, before `# ── Admin auth`)

- [ ] **Step 1: Add `GET /match` and `POST /match` routes**

Insert the following after the `book_lesson` route (around line 311) and before `# ── Admin auth`:

```python
# ── Match / Showcase ──────────────────────────────────────────────────────

ALLOWED_DOMAINS = {'Healthcare', 'Education', 'Retail', 'Nonprofit', 'Government', 'Other'}

import json as _json

@app.route('/match', methods=['GET', 'POST'])
@limiter.limit('5 per hour', methods=['POST'],
               error_message='Too many submissions. Please try again later.')
def match():
    if request.method == 'GET':
        return render_template('match.html')

    # Honeypot
    if request.form.get('h_field', ''):
        return render_template('match.html')

    name    = _strip_html(request.form.get('name',    '').strip())[:120]
    email   = _strip_html(request.form.get('email',   '').strip())[:200]
    org     = _strip_html(request.form.get('org',     '').strip())[:200]
    domain  = request.form.get('domain', 'Other').strip()
    problem = _strip_html(request.form.get('problem', '').strip())[:2000]

    if not name or not email:
        flash('Please fill in your name and email.', 'error')
        return render_template('match.html')
    if not EMAIL_RE.match(email):
        flash('Please enter a valid email address.', 'error')
        return render_template('match.html')
    if domain not in ALLOWED_DOMAINS:
        domain = 'Other'
    if len(problem) < 20:
        flash('Please describe your problem in at least 20 characters.', 'error')
        return render_template('match.html')

    profiles = MatchProfile.query.filter_by(active=True).all()
    tools    = AiTool.query.filter_by(active=True).all()

    member_matches, tool_matches = _run_matching(problem, domain, profiles, tools)
    had_pool = bool(profiles or tools)
    api_key_set = bool(os.environ.get('ANTHROPIC_API_KEY'))
    no_results = not member_matches and not tool_matches
    claude_failed = had_pool and api_key_set and no_results

    submission = MatchSubmission(
        name=name, email=email, org=org, domain=domain, problem=problem,
        matched_profiles=_json.dumps(member_matches),
        matched_tools=_json.dumps(tool_matches),
    )
    db.session.add(submission)
    db.session.commit()

    # Email each matched member
    profile_map = {p.id: p for p in profiles}
    for m in member_matches:
        p = profile_map.get(m.get('id'))
        if p:
            body = (
                f"Hi {p.name},\n\n"
                f"Someone from the St. Pete AI community needs your help!\n\n"
                f"  Name:    {name}\n"
                f"  Email:   {email}\n"
                + (f"  Org:     {org}\n" if org else "")
                + f"  Domain:  {domain}\n\n"
                f"Problem:\n{problem}\n\n"
                f"Reply directly to {email} to get in touch.\n\n"
                f"-- St. Pete AI\nhttps://stpeteai.org/match\n"
            )
            _ses_send(p.email, f"St. Pete AI: Someone needs your help — {domain}", body)

    if claude_failed:
        _ses_send(ADMIN_EMAIL,
                  "Match failure — manual follow-up needed",
                  f"Claude failed for submission #{submission.id}.\n\n"
                  f"Name: {name}\nEmail: {email}\nOrg: {org}\n"
                  f"Domain: {domain}\nProblem:\n{problem}\n")

    # Resolve matched profile/tool objects for template
    tool_map = {t.id: t for t in tools}
    resolved_members = [
        {'profile': profile_map.get(m['id']), 'reason': m.get('reason', '')}
        for m in member_matches if profile_map.get(m.get('id'))
    ]
    resolved_tools = [
        {'tool': tool_map.get(t['id']), 'reason': t.get('reason', '')}
        for t in tool_matches if tool_map.get(t.get('id'))
    ]

    return render_template('match_results.html',
                           name=name,
                           members=resolved_members,
                           tools=resolved_tools,
                           claude_failed=claude_failed)
```

- [ ] **Step 2: Verify syntax**

```
python -c "import app; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```
git add app.py
git commit -m "feat: add GET/POST /match routes"
```

---

## Task 5: Add public route — member opt-in

**Files:**
- Modify: `app.py` (add after the `/match` route, still inside the Match section)

- [ ] **Step 1: Add `GET/POST /match/apply` route**

Insert after the `/match` route, still before `# ── Admin auth`:

```python
@app.route('/match/apply', methods=['GET', 'POST'])
@limiter.limit('3 per day', methods=['POST'],
               error_message='Too many applications. Please try again tomorrow.')
def match_apply():
    if request.method == 'GET':
        return render_template('match_apply.html', submitted=False)

    if request.form.get('h_field', ''):
        return render_template('match_apply.html', submitted=True)

    name   = _strip_html(request.form.get('name',   '').strip())[:120]
    email  = _strip_html(request.form.get('email',  '').strip())[:200]
    bio    = _strip_html(request.form.get('bio',    '').strip())[:1000]
    skills = _strip_html(request.form.get('skills', '').strip())[:500]

    if not name or not email:
        flash('Please fill in your name and email.', 'error')
        return render_template('match_apply.html', submitted=False)
    if not EMAIL_RE.match(email):
        flash('Please enter a valid email address.', 'error')
        return render_template('match_apply.html', submitted=False)

    existing = MatchProfile.query.filter_by(email=email).first()
    if existing:
        flash('We already have an application for that email.', 'info')
        return render_template('match_apply.html', submitted=False)

    profile = MatchProfile(name=name, email=email, bio=bio, skills=skills)
    db.session.add(profile)
    db.session.commit()

    _ses_send(ADMIN_EMAIL,
              f"New match pool application: {name}",
              f"New volunteer for the match pool!\n\n"
              f"  Name:   {name}\n"
              f"  Email:  {email}\n"
              f"  Skills: {skills}\n\n"
              f"Bio:\n{bio}\n\n"
              f"Approve at: https://stpeteai.org/admin/match-profiles\n")

    return render_template('match_apply.html', submitted=True)
```

- [ ] **Step 2: Verify syntax**

```
python -c "import app; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```
git add app.py
git commit -m "feat: add GET/POST /match/apply route"
```

---

## Task 6: Add admin routes — match profiles

**Files:**
- Modify: `app.py` (add after admin contacts/bookings routes, near end of file)

- [ ] **Step 1: Add admin match profile routes**

Insert before the `if __name__ == '__main__'` block at the end of `app.py`:

```python
# ── Admin match profiles ──────────────────────────────────────────────────

@app.route('/admin/match-profiles')
@admin_required
def admin_match_profiles():
    pending = MatchProfile.query.filter_by(active=False).order_by(MatchProfile.created_at.desc()).all()
    active  = MatchProfile.query.filter_by(active=True).order_by(MatchProfile.created_at.desc()).all()
    return render_template('admin/match_profiles.html', pending=pending, active=active)


@app.route('/admin/match-profiles/<int:pid>/approve', methods=['POST'])
@admin_required
def admin_match_profile_approve(pid):
    profile = MatchProfile.query.get_or_404(pid)
    profile.active = True
    db.session.commit()
    flash(f'{profile.name} approved and added to the match pool.', 'success')
    return redirect(url_for('admin_match_profiles'))


@app.route('/admin/match-profiles/<int:pid>/reject', methods=['POST'])
@admin_required
def admin_match_profile_reject(pid):
    profile = MatchProfile.query.get_or_404(pid)
    db.session.delete(profile)
    db.session.commit()
    flash(f'Application from {profile.name} rejected and removed.', 'info')
    return redirect(url_for('admin_match_profiles'))
```

- [ ] **Step 2: Verify syntax**

```
python -c "import app; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```
git add app.py
git commit -m "feat: add admin match profile routes (approve/reject)"
```

---

## Task 7: Add admin routes — AI tools CRUD

**Files:**
- Modify: `app.py` (add after admin match profiles, before `if __name__`)

- [ ] **Step 1: Add admin AI tools routes**

```python
# ── Admin AI tools ────────────────────────────────────────────────────────

@app.route('/admin/tools')
@admin_required
def admin_tools():
    tools = AiTool.query.order_by(AiTool.active.desc(), AiTool.name).all()
    return render_template('admin/tools.html', tools=tools)


@app.route('/admin/tools/new', methods=['GET', 'POST'])
@admin_required
def admin_tool_new():
    if request.method == 'POST':
        tool = AiTool(
            name        = request.form.get('name', '').strip()[:200],
            url         = request.form.get('url', '').strip()[:500],
            description = request.form.get('description', '').strip(),
            tags        = request.form.get('tags', '').strip()[:500],
            active      = 'active' in request.form,
        )
        db.session.add(tool)
        db.session.commit()
        flash(f'Tool "{tool.name}" added.', 'success')
        return redirect(url_for('admin_tools'))
    return render_template('admin/tool_form.html', tool=None, action='New')


@app.route('/admin/tools/<int:tid>/edit', methods=['GET', 'POST'])
@admin_required
def admin_tool_edit(tid):
    tool = AiTool.query.get_or_404(tid)
    if request.method == 'POST':
        tool.name        = request.form.get('name', '').strip()[:200]
        tool.url         = request.form.get('url', '').strip()[:500]
        tool.description = request.form.get('description', '').strip()
        tool.tags        = request.form.get('tags', '').strip()[:500]
        tool.active      = 'active' in request.form
        db.session.commit()
        flash(f'Tool "{tool.name}" updated.', 'success')
        return redirect(url_for('admin_tools'))
    return render_template('admin/tool_form.html', tool=tool, action='Edit')


@app.route('/admin/tools/<int:tid>/deactivate', methods=['POST'])
@admin_required
def admin_tool_deactivate(tid):
    tool = AiTool.query.get_or_404(tid)
    tool.active = False
    db.session.commit()
    flash(f'Tool "{tool.name}" deactivated.', 'info')
    return redirect(url_for('admin_tools'))
```

- [ ] **Step 2: Verify syntax**

```
python -c "import app; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```
git add app.py
git commit -m "feat: add admin AI tools CRUD routes"
```

---

## Task 8: Create public templates

**Files:**
- Create: `templates/match.html`
- Create: `templates/match_results.html`
- Create: `templates/match_apply.html`

The existing site uses a standalone `templates/index.html` with inline CSS. These templates must use the same visual variables and nav structure. Copy the `<nav>` and `<head>` from `index.html` for reference — the key CSS variables are:

```css
--dark: #060d1a
--blue: #1a56db
--text: #e8edf8
--border: rgba(255,255,255,.08)
--card-bg: rgba(255,255,255,.03)
```

- [ ] **Step 1: Create `templates/match.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Find AI Help — St. Pete AI</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--dark:#060d1a;--blue:#1a56db;--blue-lt:#3b82f6;--text:#e8edf8;--muted:#7a93c8;--border:rgba(255,255,255,.08);--card:rgba(255,255,255,.03)}
body{background:var(--dark);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(6,13,26,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0 5vw;height:64px;display:flex;align-items:center;justify-content:space-between}
.nav-logo{font-weight:800;font-size:1.1rem;color:#fff;text-decoration:none;letter-spacing:.02em}
.nav-links{display:flex;gap:24px;align-items:center}
.nav-links a{color:var(--muted);text-decoration:none;font-size:.9rem;font-weight:500;transition:color .15s}
.nav-links a:hover{color:#fff}
.hero{padding:120px 5vw 60px;max-width:760px;margin:0 auto;text-align:center}
.hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;line-height:1.15;margin-bottom:16px}
.hero p{color:var(--muted);font-size:1.05rem;line-height:1.7;margin-bottom:40px}
.form-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:40px;max-width:620px;margin:0 auto 80px}
.form-group{margin-bottom:20px;text-align:left}
label{display:block;font-size:.82rem;color:var(--muted);margin-bottom:6px;font-weight:500}
input,select,textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);color:#fff;padding:11px 14px;border-radius:8px;font-size:.92rem;font-family:'Inter',sans-serif;outline:none;transition:border-color .15s}
input:focus,select:focus,textarea:focus{border-color:var(--blue-lt)}
select option{background:#0d1a2e}
textarea{resize:vertical;min-height:120px}
.char-hint{font-size:.75rem;color:var(--muted);margin-top:4px;text-align:right}
.btn-submit{width:100%;background:var(--blue);color:#fff;border:none;padding:14px;border-radius:8px;font-size:1rem;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;transition:background .15s;margin-top:8px}
.btn-submit:hover{background:var(--blue-lt)}
.flashes{max-width:620px;margin:0 auto 16px;display:flex;flex-direction:column;gap:8px}
.flash{padding:11px 16px;border-radius:8px;font-size:.88rem;font-weight:500;border:1px solid}
.flash.error{background:rgba(224,82,82,.12);border-color:rgba(224,82,82,.3);color:#f09090}
.flash.info{background:rgba(30,86,219,.12);border-color:rgba(30,86,219,.3);color:#93b4fb}
.apply-link{text-align:center;margin-top:16px;font-size:.85rem;color:var(--muted)}
.apply-link a{color:var(--blue-lt);text-decoration:none}
.apply-link a:hover{text-decoration:underline}
.honeypot{display:none}
</style>
</head>
<body>
<nav>
  <a class="nav-logo" href="/">ST. PETE AI</a>
  <div class="nav-links">
    <a href="/#mission">Mission</a>
    <a href="/#programs">Programs</a>
    <a href="/#membership">Membership</a>
    <a href="/match">Showcase</a>
    <a href="/#contact">Contact</a>
  </div>
</nav>

<div class="hero">
  <h1>Find AI Help for Your Problem</h1>
  <p>Describe your challenge and we'll match you with St. Pete AI community members who can help — and AI tools that might already solve it.</p>
</div>

{% with messages = get_flashed_messages(with_categories=true) %}
  {% if messages %}
    <div class="flashes">
      {% for cat, msg in messages %}
        <div class="flash {{ cat }}">{{ msg }}</div>
      {% endfor %}
    </div>
  {% endif %}
{% endwith %}

<form class="form-card" method="post" action="/match">
  <input class="honeypot" type="text" name="h_field" tabindex="-1" autocomplete="off">

  <div class="form-group">
    <label for="name">Your Name *</label>
    <input type="text" id="name" name="name" required maxlength="120" placeholder="Jane Smith">
  </div>

  <div class="form-group">
    <label for="email">Your Email *</label>
    <input type="email" id="email" name="email" required maxlength="200" placeholder="jane@example.com">
  </div>

  <div class="form-group">
    <label for="org">Organization <span style="color:var(--muted);font-weight:400">(optional)</span></label>
    <input type="text" id="org" name="org" maxlength="200" placeholder="Nonprofit name, business, school, etc.">
  </div>

  <div class="form-group">
    <label for="domain">Domain / Category *</label>
    <select id="domain" name="domain" required>
      <option value="">Select a category...</option>
      <option value="Healthcare">Healthcare</option>
      <option value="Education">Education</option>
      <option value="Retail">Retail</option>
      <option value="Nonprofit">Nonprofit</option>
      <option value="Government">Government</option>
      <option value="Other">Other</option>
    </select>
  </div>

  <div class="form-group">
    <label for="problem">Describe Your Problem *</label>
    <textarea id="problem" name="problem" required minlength="20" maxlength="2000"
      placeholder="What challenge are you trying to solve? The more detail you give, the better the match."></textarea>
    <div class="char-hint">20 – 2,000 characters</div>
  </div>

  <button class="btn-submit" type="submit">Find Matches</button>
</form>

<div class="apply-link">
  Are you an AI practitioner? <a href="/match/apply">Join the match pool</a>
</div>
</body>
</html>
```

- [ ] **Step 2: Create `templates/match_results.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Matches — St. Pete AI</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--dark:#060d1a;--blue:#1a56db;--blue-lt:#3b82f6;--text:#e8edf8;--muted:#7a93c8;--border:rgba(255,255,255,.08);--card:rgba(255,255,255,.03);--green:#2a9d5c}
body{background:var(--dark);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(6,13,26,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0 5vw;height:64px;display:flex;align-items:center;justify-content:space-between}
.nav-logo{font-weight:800;font-size:1.1rem;color:#fff;text-decoration:none;letter-spacing:.02em}
.nav-links{display:flex;gap:24px;align-items:center}
.nav-links a{color:var(--muted);text-decoration:none;font-size:.9rem;font-weight:500;transition:color .15s}
.nav-links a:hover{color:#fff}
.page{padding:100px 5vw 80px;max-width:800px;margin:0 auto}
h1{font-size:clamp(1.6rem,4vw,2.4rem);font-weight:800;margin-bottom:8px}
.subtitle{color:var(--muted);font-size:1rem;margin-bottom:48px}
h2{font-size:1.15rem;font-weight:700;margin-bottom:20px;color:#fff;display:flex;align-items:center;gap:10px}
.section{margin-bottom:48px}
.match-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:16px}
.match-card h3{font-size:1rem;font-weight:700;color:#fff;margin-bottom:4px}
.match-card .bio{font-size:.85rem;color:var(--muted);margin-bottom:12px;line-height:1.5}
.match-card .reason{font-size:.88rem;color:#a8c4f0;line-height:1.55;border-left:3px solid var(--blue);padding-left:12px}
.match-card .tool-link{display:inline-block;margin-top:10px;font-size:.82rem;color:var(--blue-lt);text-decoration:none}
.match-card .tool-link:hover{text-decoration:underline}
.empty{color:var(--muted);font-size:.9rem;padding:20px 0}
.failure-box{background:rgba(224,82,82,.08);border:1px solid rgba(224,82,82,.2);border-radius:10px;padding:20px;margin-bottom:32px;font-size:.9rem;color:#f09090;line-height:1.6}
.footer-note{font-size:.82rem;color:var(--muted);border-top:1px solid var(--border);padding-top:24px;margin-top:8px}
.btn-back{display:inline-block;margin-top:32px;padding:12px 24px;background:var(--blue);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:.9rem;transition:background .15s}
.btn-back:hover{background:var(--blue-lt)}
</style>
</head>
<body>
<nav>
  <a class="nav-logo" href="/">ST. PETE AI</a>
  <div class="nav-links">
    <a href="/#mission">Mission</a>
    <a href="/#programs">Programs</a>
    <a href="/#membership">Membership</a>
    <a href="/match">Showcase</a>
    <a href="/#contact">Contact</a>
  </div>
</nav>

<div class="page">
  <h1>Your Matches, {{ name }}</h1>
  <p class="subtitle">Here's what we found based on your problem description.</p>

  {% if claude_failed %}
  <div class="failure-box">
    We couldn't generate matches right now — we've saved your submission and will follow up manually. Sorry for the inconvenience!
  </div>
  {% endif %}

  <div class="section">
    <h2>👥 Members Who Can Help</h2>
    {% if members %}
      {% for m in members %}
      <div class="match-card">
        <h3>{{ m.profile.name }}</h3>
        {% if m.profile.skills %}
          <div class="bio">{{ m.profile.skills }}</div>
        {% endif %}
        <div class="reason">{{ m.reason }}</div>
      </div>
      {% endfor %}
      <p class="footer-note">Matched members have been notified and may reach out to you directly.</p>
    {% else %}
      <p class="empty">No member matches found yet — the pool is still growing. Check back soon or <a href="/match/apply" style="color:#3b82f6">join the pool yourself</a>.</p>
    {% endif %}
  </div>

  <div class="section">
    <h2>🛠 AI Tools to Explore</h2>
    {% if tools %}
      {% for t in tools %}
      <div class="match-card">
        <h3>{{ t.tool.name }}</h3>
        {% if t.tool.description %}
          <div class="bio">{{ t.tool.description[:200] }}</div>
        {% endif %}
        <div class="reason">{{ t.reason }}</div>
        {% if t.tool.url %}
          <a class="tool-link" href="{{ t.tool.url }}" target="_blank" rel="noopener">Visit {{ t.tool.name }} →</a>
        {% endif %}
      </div>
      {% endfor %}
    {% else %}
      <p class="empty">No tool matches found for this problem domain yet.</p>
    {% endif %}
  </div>

  <a class="btn-back" href="/match">Submit Another Problem</a>
</div>
</body>
</html>
```

- [ ] **Step 3: Create `templates/match_apply.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Join the Match Pool — St. Pete AI</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--dark:#060d1a;--blue:#1a56db;--blue-lt:#3b82f6;--text:#e8edf8;--muted:#7a93c8;--border:rgba(255,255,255,.08);--card:rgba(255,255,255,.03)}
body{background:var(--dark);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(6,13,26,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0 5vw;height:64px;display:flex;align-items:center;justify-content:space-between}
.nav-logo{font-weight:800;font-size:1.1rem;color:#fff;text-decoration:none;letter-spacing:.02em}
.nav-links{display:flex;gap:24px;align-items:center}
.nav-links a{color:var(--muted);text-decoration:none;font-size:.9rem;font-weight:500;transition:color .15s}
.nav-links a:hover{color:#fff}
.hero{padding:120px 5vw 60px;max-width:760px;margin:0 auto;text-align:center}
.hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;line-height:1.15;margin-bottom:16px}
.hero p{color:var(--muted);font-size:1.05rem;line-height:1.7;margin-bottom:40px}
.form-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:40px;max-width:620px;margin:0 auto 80px}
.form-group{margin-bottom:20px;text-align:left}
label{display:block;font-size:.82rem;color:var(--muted);margin-bottom:6px;font-weight:500}
input,textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);color:#fff;padding:11px 14px;border-radius:8px;font-size:.92rem;font-family:'Inter',sans-serif;outline:none;transition:border-color .15s}
input:focus,textarea:focus{border-color:var(--blue-lt)}
textarea{resize:vertical;min-height:100px}
.btn-submit{width:100%;background:var(--blue);color:#fff;border:none;padding:14px;border-radius:8px;font-size:1rem;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;transition:background .15s;margin-top:8px}
.btn-submit:hover{background:var(--blue-lt)}
.flashes{max-width:620px;margin:0 auto 16px;display:flex;flex-direction:column;gap:8px}
.flash{padding:11px 16px;border-radius:8px;font-size:.88rem;font-weight:500;border:1px solid}
.flash.error{background:rgba(224,82,82,.12);border-color:rgba(224,82,82,.3);color:#f09090}
.flash.info{background:rgba(30,86,219,.12);border-color:rgba(30,86,219,.3);color:#93b4fb}
.success-box{background:rgba(42,157,92,.08);border:1px solid rgba(42,157,92,.25);border-radius:12px;padding:32px;text-align:center;max-width:620px;margin:0 auto 80px}
.success-box h2{font-size:1.3rem;font-weight:700;margin-bottom:8px;color:#6ee0a0}
.success-box p{color:var(--muted);font-size:.92rem;line-height:1.6}
.hint{font-size:.78rem;color:var(--muted);margin-top:4px}
.honeypot{display:none}
</style>
</head>
<body>
<nav>
  <a class="nav-logo" href="/">ST. PETE AI</a>
  <div class="nav-links">
    <a href="/#mission">Mission</a>
    <a href="/#programs">Programs</a>
    <a href="/#membership">Membership</a>
    <a href="/match">Showcase</a>
    <a href="/#contact">Contact</a>
  </div>
</nav>

<div class="hero">
  <h1>Join the Match Pool</h1>
  <p>List your AI skills and we'll connect you with community members who need your help. Applications are reviewed by our team before you're added.</p>
</div>

{% if submitted %}
<div class="success-box">
  <h2>Application Received!</h2>
  <p>Your application is under review — we'll be in touch at your email. Thanks for offering to help the community.</p>
</div>
{% else %}

{% with messages = get_flashed_messages(with_categories=true) %}
  {% if messages %}
    <div class="flashes">
      {% for cat, msg in messages %}
        <div class="flash {{ cat }}">{{ msg }}</div>
      {% endfor %}
    </div>
  {% endif %}
{% endwith %}

<form class="form-card" method="post" action="/match/apply">
  <input class="honeypot" type="text" name="h_field" tabindex="-1" autocomplete="off">

  <div class="form-group">
    <label for="name">Your Name *</label>
    <input type="text" id="name" name="name" required maxlength="120" placeholder="Jane Smith">
  </div>

  <div class="form-group">
    <label for="email">Your Email *</label>
    <input type="email" id="email" name="email" required maxlength="200" placeholder="jane@example.com">
  </div>

  <div class="form-group">
    <label for="bio">What can you help with? *</label>
    <textarea id="bio" name="bio" required maxlength="1000"
      placeholder="Describe the types of problems you can help solve, your experience, and what you enjoy working on."></textarea>
  </div>

  <div class="form-group">
    <label for="skills">Skills / Keywords *</label>
    <input type="text" id="skills" name="skills" required maxlength="500"
      placeholder="e.g. computer vision, automation, NLP, Python, ChatGPT, data analysis">
    <div class="hint">Comma-separated — these help us match you to the right problems.</div>
  </div>

  <button class="btn-submit" type="submit">Submit Application</button>
</form>

{% endif %}
</body>
</html>
```

- [ ] **Step 4: Start the dev server and test all three pages load**

```
python app.py
```

Visit in browser:
- `http://localhost:5000/match` — form renders with all fields
- `http://localhost:5000/match/apply` — opt-in form renders
- Submit the match form with a short problem (< 20 chars) — should flash error

- [ ] **Step 5: Commit**

```
git add templates/match.html templates/match_results.html templates/match_apply.html
git commit -m "feat: add public match/apply templates"
```

---

## Task 9: Create admin templates

**Files:**
- Create: `templates/admin/match_profiles.html`
- Create: `templates/admin/tools.html`
- Create: `templates/admin/tool_form.html`

- [ ] **Step 1: Create `templates/admin/match_profiles.html`**

```html
{% extends "admin/layout.html" %}
{% block title %}Match Pool{% endblock %}
{% block page_title %}Match Pool{% endblock %}
{% block page_sub %}Volunteer applications for the AI matching tool{% endblock %}

{% block content %}
<div class="section" style="margin-bottom:40px">
  <div class="page-header">
    <h1 style="font-size:1.1rem;color:var(--text-muted)">Pending Applications</h1>
  </div>
  {% if pending %}
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Skills</th><th>Applied</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {% for p in pending %}
        <tr>
          <td style="font-weight:600;color:#fff">{{ p.name }}</td>
          <td style="color:#7a93c8">{{ p.email }}</td>
          <td style="color:#7a93c8;font-size:.82rem">{{ p.skills[:80] }}{% if p.skills|length > 80 %}…{% endif %}</td>
          <td style="color:#5c6680;font-family:'Roboto Mono',monospace;font-size:.78rem">{{ p.created_at.strftime('%b %d, %Y') }}</td>
          <td>
            <form method="post" action="/admin/match-profiles/{{ p.id }}/approve" style="display:inline">
              <button class="btn btn-success btn-sm" type="submit">Approve</button>
            </form>
            <form method="post" action="/admin/match-profiles/{{ p.id }}/reject" style="display:inline;margin-left:6px">
              <button class="btn btn-danger btn-sm" type="submit" onclick="return confirm('Reject and delete this application?')">Reject</button>
            </form>
          </td>
        </tr>
        {% if p.bio %}
        <tr>
          <td colspan="5" style="padding:4px 14px 16px;color:#5c6680;font-size:.82rem;line-height:1.5">{{ p.bio }}</td>
        </tr>
        {% endif %}
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% else %}
  <p style="color:#5c6680;font-size:.88rem;padding:16px 0">No pending applications.</p>
  {% endif %}
</div>

<div class="section">
  <div class="page-header">
    <h1 style="font-size:1.1rem;color:var(--text-muted)">Active Members</h1>
  </div>
  {% if active %}
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Skills</th><th>Approved</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {% for p in active %}
        <tr>
          <td style="font-weight:600;color:#fff">{{ p.name }}</td>
          <td style="color:#7a93c8">{{ p.email }}</td>
          <td style="color:#7a93c8;font-size:.82rem">{{ p.skills[:80] }}{% if p.skills|length > 80 %}…{% endif %}</td>
          <td style="color:#5c6680;font-family:'Roboto Mono',monospace;font-size:.78rem">{{ p.created_at.strftime('%b %d, %Y') }}</td>
          <td>
            <form method="post" action="/admin/match-profiles/{{ p.id }}/reject" style="display:inline">
              <button class="btn btn-danger btn-sm" type="submit" onclick="return confirm('Remove {{ p.name }} from the pool?')">Remove</button>
            </form>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% else %}
  <p style="color:#5c6680;font-size:.88rem;padding:16px 0">No active members in the pool yet.</p>
  {% endif %}
</div>
{% endblock %}
```

- [ ] **Step 2: Create `templates/admin/tools.html`**

```html
{% extends "admin/layout.html" %}
{% block title %}AI Tools{% endblock %}
{% block page_title %}AI Tools{% endblock %}
{% block page_sub %}Curated tools matched to community problems{% endblock %}

{% block content %}
<div class="page-header">
  <div></div>
  <a class="btn btn-primary btn-sm" href="/admin/tools/new">+ Add Tool</a>
</div>

{% if tools %}
<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>Name</th><th>Tags</th><th>Status</th><th>Added</th><th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {% for t in tools %}
      <tr>
        <td>
          <div style="font-weight:600;color:#fff">{{ t.name }}</div>
          {% if t.url %}<div style="font-size:.78rem;color:#5c6680">{{ t.url[:60] }}</div>{% endif %}
        </td>
        <td style="color:#7a93c8;font-size:.82rem">{{ t.tags[:60] }}{% if t.tags|length > 60 %}…{% endif %}</td>
        <td><span class="badge badge-{{ 'active' if t.active else 'inactive' }}">{{ 'Active' if t.active else 'Inactive' }}</span></td>
        <td style="color:#5c6680;font-family:'Roboto Mono',monospace;font-size:.78rem">{{ t.created_at.strftime('%b %d, %Y') }}</td>
        <td>
          <a class="btn btn-ghost btn-sm" href="/admin/tools/{{ t.id }}/edit">Edit</a>
          {% if t.active %}
          <form method="post" action="/admin/tools/{{ t.id }}/deactivate" style="display:inline;margin-left:6px">
            <button class="btn btn-danger btn-sm" type="submit">Deactivate</button>
          </form>
          {% endif %}
        </td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>
{% else %}
<div class="card">
  <p style="color:#5c6680;font-size:.88rem;padding:16px 0">No tools yet. <a href="/admin/tools/new" style="color:#5b9cf6">Add the first one.</a></p>
</div>
{% endif %}
{% endblock %}
```

- [ ] **Step 3: Create `templates/admin/tool_form.html`**

```html
{% extends "admin/layout.html" %}
{% block title %}{{ action }} Tool{% endblock %}
{% block page_title %}{{ action }} Tool{% endblock %}
{% block page_sub %}{% if tool %}Editing {{ tool.name }}{% else %}Add a new AI tool to the match pool{% endif %}{% endblock %}

{% block content %}
<div class="card" style="max-width:600px">
  <form method="post">
    <div class="form-group">
      <label for="name">Tool Name *</label>
      <input type="text" id="name" name="name" required maxlength="200"
        value="{{ tool.name if tool else '' }}" placeholder="e.g. Make.com">
    </div>
    <div class="form-group">
      <label for="url">URL</label>
      <input type="text" id="url" name="url" maxlength="500"
        value="{{ tool.url if tool else '' }}" placeholder="https://...">
    </div>
    <div class="form-group">
      <label for="description">Description</label>
      <textarea id="description" name="description" maxlength="2000"
        placeholder="Brief description of what this tool does">{{ tool.description if tool else '' }}</textarea>
    </div>
    <div class="form-group">
      <label for="tags">Tags (comma-separated)</label>
      <input type="text" id="tags" name="tags" maxlength="500"
        value="{{ tool.tags if tool else '' }}" placeholder="e.g. automation, no-code, workflow">
    </div>
    <div class="form-group">
      <label class="form-check">
        <input type="checkbox" name="active" {% if not tool or tool.active %}checked{% endif %}>
        Active (visible in match results)
      </label>
    </div>
    <div style="display:flex;gap:12px;margin-top:24px">
      <button class="btn btn-primary" type="submit">{{ action }} Tool</button>
      <a class="btn btn-ghost" href="/admin/tools">Cancel</a>
    </div>
  </form>
</div>
{% endblock %}
```

- [ ] **Step 4: Test admin pages in the browser**

With `python app.py` running, log in at `http://localhost:5000/admin` and visit:
- `/admin/match-profiles` — renders two sections (Pending / Active), both empty
- `/admin/tools` — renders empty state with "Add the first one" link
- `/admin/tools/new` — renders the add form

- [ ] **Step 5: Commit**

```
git add templates/admin/match_profiles.html templates/admin/tools.html templates/admin/tool_form.html
git commit -m "feat: add admin match profiles and AI tools templates"
```

---

## Task 10: Update navigation

**Files:**
- Modify: `templates/admin/layout.html`
- Modify: `templates/index.html`

- [ ] **Step 1: Add Match Pool and AI Tools to admin sidebar**

In `templates/admin/layout.html`, find the sidebar nav section containing the `Site` nav-section div. Insert the new links in the `Manage` section, after the Messages link:

```html
    <a href="/admin/match-profiles" class="{% if 'match_profile' in request.endpoint %}active{% endif %}">
      <span class="ico">🤝</span> Match Pool
    </a>
    <a href="/admin/tools" class="{% if 'tool' in request.endpoint %}active{% endif %}">
      <span class="ico">🛠</span> AI Tools
    </a>
```

Insert these two `<a>` tags after:
```html
    <a href="/admin/contacts" class="{% if request.endpoint == 'admin_contacts' %}active{% endif %}">
      <span class="ico">✉️</span> Messages
    </a>
```

- [ ] **Step 2: Add "Showcase" nav link to `templates/index.html`**

Find the nav links block in `index.html` (around line 490). Add the Showcase link before the Contact link:

```html
      <a href="/match">Showcase</a>
```

- [ ] **Step 3: Add "Join the Match Pool" CTA to membership section of `index.html`**

Find the membership section in `index.html` (search for `id="membership"`). After the existing join form or near the bottom of the section, add:

```html
<p style="text-align:center;margin-top:24px;font-size:.9rem;color:#5c6680">
  Are you an AI practitioner? <a href="/match/apply" style="color:#1a56db">Join the match pool</a> and help your community.
</p>
```

- [ ] **Step 4: Add "Showcase" to sitemap in `app.py`**

In the `sitemap()` route, add:

```python
('https://www.stpeteai.org/match',  '2026-05-21', 'weekly',  '0.8'),
```

- [ ] **Step 5: Verify nav renders correctly**

Start the dev server and confirm:
- Main site nav shows "Showcase" link
- Clicking it loads `/match`
- Admin sidebar shows "Match Pool" and "AI Tools"

- [ ] **Step 6: Commit**

```
git add templates/admin/layout.html templates/index.html app.py
git commit -m "feat: add Showcase and Match Pool links to nav"
```

---

## Task 11: Set `ANTHROPIC_API_KEY` environment variable and end-to-end test

**Files:**
- No code changes — environment setup and manual test

- [ ] **Step 1: Set the API key locally**

In your terminal (or `.env` / EB environment config):

```
set ANTHROPIC_API_KEY=sk-ant-...
```

On Elastic Beanstalk, add via the EB console → Environment → Configuration → Software → Environment properties:
```
ANTHROPIC_API_KEY = sk-ant-...
```

- [ ] **Step 2: Seed one AI tool via the admin panel**

Log in to `/admin`, go to AI Tools → Add Tool:
- Name: `ChatGPT`
- URL: `https://chat.openai.com`
- Description: `General-purpose AI assistant for writing, analysis, and problem-solving`
- Tags: `general, writing, analysis, chatbot`
- Active: checked

- [ ] **Step 3: Submit a test problem**

Go to `/match` and submit:
- Name: `Test User`
- Email: `test@example.com`
- Domain: `Education`
- Problem: `We run an after-school tutoring program and want to automatically generate personalized quiz questions for students based on their recent lesson topics.`

Expected: Results page loads showing matched tools (and members if any are active). No 500 error.

- [ ] **Step 4: Verify submission saved in admin**

Check that a `MatchSubmission` was created. You can verify via the Python shell:

```
python -c "from app import app, db, MatchSubmission; app.app_context().push(); print(MatchSubmission.query.all())"
```

Expected: One submission record printed.

- [ ] **Step 5: Test error path — no API key**

```
set ANTHROPIC_API_KEY=
python app.py
```

Submit a problem. Expected: Results page shows empty matches but no 500. Submission is still saved.

- [ ] **Step 6: Final commit**

```
git add -A
git commit -m "feat: AI Project Showcase & Matching Tool — complete"
```

---

## Task 12: Deploy to AWS

- [ ] **Step 1: Push to GitHub**

```
git push origin master
```

- [ ] **Step 2: Deploy to Elastic Beanstalk**

```
eb deploy
```

Expected: `Environment update completed successfully.`

- [ ] **Step 3: Set `ANTHROPIC_API_KEY` on EB**

Via the EB Console → your environment → Configuration → Software → Environment properties:
Add `ANTHROPIC_API_KEY` with your production API key value. Save and allow the environment to update.

- [ ] **Step 4: Smoke test production**

Visit `https://stpeteai.org/match` and submit a real test problem. Confirm results render and the matched member email fires (check your inbox if you have an active match profile).
