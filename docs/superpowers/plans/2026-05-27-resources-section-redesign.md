# Resources Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Claude's Brain-only homepage section with a category-grouped AI Tools directory drawn from the `AiTool` DB model, while keeping Claude's Brain as a featured card.

**Architecture:** Add a `category` column to `AiTool`, pass active tools to the homepage route, and rewrite the `#claudes-brain` section in `index.html` to render category-grouped tool cards below a hardcoded Claude's Brain featured card. Admin tool form gains a Category field with a datalist.

**Tech Stack:** Flask, SQLAlchemy, Jinja2, SQLite (dev) / PostgreSQL (prod), pytest

---

## File Map

| File | What changes |
|---|---|
| `app.py` | Add `category` to `AiTool` model; update `admin_tool_new` and `admin_tool_edit` to read `category`; pass `ai_tools` to `index()` route |
| `templates/index.html` | Rewrite `#claudes-brain` section (lines 799–841); update top nav + mobile nav link text from "Claude's Brain" to "Resources" |
| `templates/admin/tool_form.html` | Add Category field with datalist between Tags and Active checkbox |
| `tests/test_resources.py` | New file — pytest tests for the model field, route, and template rendering |

---

### Task 1: Add `category` field to `AiTool` and update admin routes

**Files:**
- Modify: `app.py` (AiTool model ~line 214, admin_tool_new ~line 927, admin_tool_edit ~line 945)
- Create: `tests/test_resources.py`

Context: The app uses Flask-SQLAlchemy with SQLite in dev. There are no migrations — `db.create_all()` is called at startup, so adding a nullable column just requires adding it to the model. The existing `AiTool` model is at line 214 of `app.py`.

- [ ] **Step 1: Create the test file**

Create `tests/__init__.py` (empty) and `tests/test_resources.py`:

```python
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import app, db, AiTool


@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()


def test_aitool_has_category_field(client):
    with app.app_context():
        tool = AiTool(name='TestTool', url='https://example.com',
                      description='A test tool', category='General AI')
        db.session.add(tool)
        db.session.commit()
        fetched = AiTool.query.filter_by(name='TestTool').first()
        assert fetched.category == 'General AI'


def test_aitool_category_defaults_to_none(client):
    with app.app_context():
        tool = AiTool(name='NoCat', url='https://example.com', description='no cat')
        db.session.add(tool)
        db.session.commit()
        fetched = AiTool.query.filter_by(name='NoCat').first()
        assert fetched.category is None
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd C:\Users\mark\projects\stpeteai
python -m pytest tests/test_resources.py -v
```

Expected: `FAILED tests/test_resources.py::test_aitool_has_category_field` — `AiTool` has no `category` attribute.

- [ ] **Step 3: Add `category` to `AiTool` model**

In `app.py`, find the `AiTool` class (around line 214). The current last field before the closing line is:

```python
    active      = db.Column(db.Boolean, default=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
```

Change it to:

```python
    active      = db.Column(db.Boolean, default=True)
    category    = db.Column(db.String(100), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
```

- [ ] **Step 4: Update `admin_tool_new` to save `category`**

Find `admin_tool_new` (~line 925). The `AiTool(...)` constructor call currently sets `name`, `url`, `description`, `tags`, `active`. Add `category`:

```python
        tool = AiTool(
            name        = request.form.get('name', '').strip()[:200],
            url         = request.form.get('url', '').strip()[:500],
            description = request.form.get('description', '').strip(),
            tags        = request.form.get('tags', '').strip()[:500],
            category    = request.form.get('category', '').strip()[:100] or None,
            active      = 'active' in request.form,
        )
```

- [ ] **Step 5: Update `admin_tool_edit` to save `category`**

Find `admin_tool_edit` (~line 943). The block that sets fields currently sets `name`, `url`, `description`, `tags`, `active`. Add:

```python
        tool.name        = request.form.get('name', '').strip()[:200]
        tool.url         = request.form.get('url', '').strip()[:500]
        tool.description = request.form.get('description', '').strip()
        tool.tags        = request.form.get('tags', '').strip()[:500]
        tool.category    = request.form.get('category', '').strip()[:100] or None
        tool.active      = 'active' in request.form
```

- [ ] **Step 6: Run tests to verify they pass**

```
python -m pytest tests/test_resources.py::test_aitool_has_category_field tests/test_resources.py::test_aitool_category_defaults_to_none -v
```

Expected: both PASS.

- [ ] **Step 7: Commit**

```
git add app.py tests/__init__.py tests/test_resources.py
git commit -m "feat: add category field to AiTool model and admin routes"
```

---

### Task 2: Pass active tools to homepage route

**Files:**
- Modify: `app.py` (index route ~line 272)
- Modify: `tests/test_resources.py`

Context: The `index()` route currently returns `render_template('index.html', events=events, slots=slots)`. We need to add `ai_tools` — a list of active `AiTool` objects ordered by category then name.

- [ ] **Step 1: Add test for homepage route passing tools**

Append to `tests/test_resources.py`:

```python
def test_index_route_passes_ai_tools(client):
    with app.app_context():
        tool = AiTool(name='Gemini', url='https://gemini.google.com',
                      description='Google AI', category='General AI', active=True)
        db.session.add(tool)
        db.session.commit()

    resp = client.get('/')
    assert resp.status_code == 200
    assert b'Gemini' in resp.data


def test_index_route_excludes_inactive_tools(client):
    with app.app_context():
        tool = AiTool(name='HiddenTool', url='https://example.com',
                      description='inactive', category='Other', active=False)
        db.session.add(tool)
        db.session.commit()

    resp = client.get('/')
    assert resp.status_code == 200
    assert b'HiddenTool' not in resp.data
```

- [ ] **Step 2: Run new tests to verify they fail**

```
python -m pytest tests/test_resources.py::test_index_route_passes_ai_tools tests/test_resources.py::test_index_route_excludes_inactive_tools -v
```

Expected: `test_index_route_passes_ai_tools` FAIL (tool name not in response — template not yet updated) or PASS trivially if name happens to appear. Either way, verify the route runs without error before continuing. If both pass already, the template work in Task 3 will make them meaningful.

- [ ] **Step 3: Update `index()` route**

Find the `index()` function (~line 272). Change:

```python
@app.route('/')
def index():
    events = (Event.query
              .filter_by(active=True)
              .order_by(Event.event_date.desc())
              .limit(3).all())
    slots = (LessonSlot.query
             .filter_by(active=True)
             .filter(LessonSlot.slot_date >= date.today())
             .order_by(LessonSlot.slot_date, LessonSlot.start_time)
             .all())
    return render_template('index.html', events=events, slots=slots)
```

To:

```python
@app.route('/')
def index():
    events = (Event.query
              .filter_by(active=True)
              .order_by(Event.event_date.desc())
              .limit(3).all())
    slots = (LessonSlot.query
             .filter_by(active=True)
             .filter(LessonSlot.slot_date >= date.today())
             .order_by(LessonSlot.slot_date, LessonSlot.start_time)
             .all())
    ai_tools = (AiTool.query
                .filter_by(active=True)
                .order_by(AiTool.category, AiTool.name)
                .all())
    return render_template('index.html', events=events, slots=slots, ai_tools=ai_tools)
```

- [ ] **Step 4: Run tests**

```
python -m pytest tests/test_resources.py -v
```

Expected: all tests PASS (the new route tests pass once the template is updated in Task 3 — if the tool name renders in raw HTML it will pass now, otherwise they'll pass after Task 3).

- [ ] **Step 5: Commit**

```
git add app.py tests/test_resources.py
git commit -m "feat: pass active ai_tools to homepage route"
```

---

### Task 3: Rewrite `#claudes-brain` section in `index.html`

**Files:**
- Modify: `templates/index.html` (lines 799–841 for the section, lines 487–490 for the nav)

Context: The current section is a two-column promo for Claude's Brain with a book cover image and chapter list. Replace the entire section content with the new Resources layout. Keep the `id="claudes-brain"` and `<section>` tag. The existing CSS classes `.brain-grid`, `.brain-left`, etc. will no longer be used after this change — leave the CSS in place (it's inlined in a `<style>` block and won't cause visual issues if unused).

The section background should be `#eef1f7` (matches other light sections on the page). Use inline styles throughout — this is the pattern used by the existing page.

- [ ] **Step 1: Replace the `#claudes-brain` section**

Find lines 799–841 in `templates/index.html`. Replace the entire block from `<!-- Claude's Brain Promo -->` through the closing `</section>` with:

```html
<!-- Resources -->
<section id="claudes-brain" style="padding:80px 0;background:#eef1f7">
  <div class="container">

    <!-- Section header -->
    <div style="text-align:center;margin-bottom:48px">
      <span style="display:inline-block;background:rgba(30,95,196,.1);border:1px solid rgba(30,95,196,.3);border-radius:100px;padding:5px 14px;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:#1e5fc4;margin-bottom:16px">Community Resources</span>
      <h2 style="font-family:'Roboto',sans-serif;font-size:clamp(2rem,4vw,2.8rem);font-weight:900;letter-spacing:-.02em;line-height:1;color:#141c2e;margin-bottom:12px;margin-top:0">AI TOOLS FOR<br><span style="color:#1e5fc4">EVERYONE.</span></h2>
      <p style="color:#5c6680;font-size:1rem;max-width:520px;margin:0 auto">A curated directory of AI tools for the St. Pete community — from beginners to builders.</p>
    </div>

    <!-- Featured: Claude's Brain -->
    <div style="background:#0d1220;border-radius:12px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;margin-bottom:48px;gap:24px;flex-wrap:wrap">
      <div>
        <div style="font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:#0ca5a5;margin-bottom:8px">From Our Founder</div>
        <div style="font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:6px">Building Claude's Brain</div>
        <div style="font-size:.88rem;color:rgba(255,255,255,.5);max-width:400px">The complete field guide to every layer that makes Claude Code smarter. Written for developers and vibe coders alike.</div>
      </div>
      <a href="https://www.claudesbrain.com" target="_blank" rel="noopener" style="background:#1e5fc4;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:.85rem;font-weight:600;white-space:nowrap;flex-shrink:0">Get the Guide &rarr;</a>
    </div>

    <!-- Category-grouped tool cards -->
    {% if ai_tools %}
      {% set ns = namespace(current_cat=None) %}
      {% for tool in ai_tools %}
        {% set cat = tool.category or 'Other' %}
        {% if cat != ns.current_cat %}
          {% if ns.current_cat is not none %}
            </div>{# close previous grid #}
          {% endif %}
          {% set ns.current_cat = cat %}
          <div style="margin-bottom:32px">
            <div style="font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#5c6680;font-weight:600;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #c4ccdc">{{ cat }}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
        {% endif %}
            <div style="background:#fff;border:1px solid #c4ccdc;border-radius:8px;padding:16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
              <div>
                <div style="font-weight:600;font-size:.92rem;color:#141c2e">{{ tool.name }}</div>
                {% if tool.description %}
                <div style="font-size:.78rem;color:#5c6680;margin-top:2px">{{ tool.description[:80] }}</div>
                {% endif %}
              </div>
              {% if tool.url %}
              <a href="{{ tool.url }}" target="_blank" rel="noopener" style="font-size:.78rem;color:#1e5fc4;text-decoration:none;font-weight:600;white-space:nowrap;flex-shrink:0">Visit &rarr;</a>
              {% endif %}
            </div>
      {% endfor %}
      {% if ns.current_cat is not none %}
          </div>{# close last grid #}
        </div>{# close last category block #}
      {% endif %}
    {% endif %}

    <!-- Bottom CTA -->
    <div style="text-align:center;margin-top:16px">
      <a href="/match" style="font-size:.88rem;color:#1e5fc4;text-decoration:none;font-weight:600">Have a tool to suggest? Submit via the Showcase &rarr;</a>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Update top nav label**

Find the nav link (around line 490):

```html
      <a href="#claudes-brain">Resources</a>
```

This already says "Resources" (it was changed when the Shop link was removed). Verify it reads "Resources" — if it still says "Claude's Brain", change it to "Resources". No change needed if already correct.

- [ ] **Step 3: Check mobile nav**

Search `index.html` for any other occurrence of `Claude's Brain` in nav links (mobile menu). If found, update the text to "Resources" while keeping `href="#claudes-brain"`.

- [ ] **Step 4: Run the app and verify visually**

```
python app.py
```

Open `http://localhost:5000` in a browser. Scroll to the Resources section. Verify:
- Section header "AI TOOLS FOR EVERYONE." renders correctly
- Claude's Brain featured dark card appears
- If no tools are active in the local DB, only the featured card and CTA show (no errors)
- Nav link says "Resources" and scrolls to the section

- [ ] **Step 5: Run tests**

```
python -m pytest tests/test_resources.py -v
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```
git add templates/index.html tests/test_resources.py
git commit -m "feat: rewrite resources section with AI tools directory"
```

---

### Task 4: Add Category field to admin tool form

**Files:**
- Modify: `templates/admin/tool_form.html`

Context: The admin tool form at `/admin/tools/new` and `/admin/tools/<id>/edit` needs a Category field. Use a free-text `<input>` with a `<datalist>` for suggestions. The field goes between the Tags field and the Active checkbox.

- [ ] **Step 1: Add Category field to `tool_form.html`**

Find the Tags `<div class="form-group">` block in `templates/admin/tool_form.html` (lines 24–28). Add the following immediately after the closing `</div>` of the Tags group and before the Active checkbox group:

```html
    <div class="form-group">
      <label for="category">Category</label>
      <input type="text" id="category" name="category" maxlength="100"
        list="category-suggestions"
        value="{{ tool.category if tool and tool.category else '' }}"
        placeholder="e.g. General AI">
      <datalist id="category-suggestions">
        <option value="General AI">
        <option value="Writing">
        <option value="Image Generation">
        <option value="Coding">
        <option value="Automation">
        <option value="Data &amp; Research">
        <option value="Video">
        <option value="Other">
      </datalist>
    </div>
```

Also update the Active checkbox label text to clarify it covers both matching and the public directory:

Find:
```html
        Active (visible in match results)
```

Change to:
```html
        Active (visible in match results and resources directory)
```

- [ ] **Step 2: Verify in browser**

Start the app (`python app.py`), log in as admin, go to `/admin/tools/new`. Verify:
- Category field appears between Tags and the Active checkbox
- Clicking the field shows the datalist suggestions
- Submitting the form saves the category (check via Edit — value should pre-populate)

- [ ] **Step 3: Commit**

```
git add templates/admin/tool_form.html
git commit -m "feat: add category field to admin tool form"
```

---

### Task 5: End-to-end smoke test and push

**Files:**
- No code changes — verification and deploy

- [ ] **Step 1: Run full test suite**

```
python -m pytest tests/ -v
```

Expected: all tests PASS.

- [ ] **Step 2: Manual smoke test**

Start the app and verify this full flow:
1. Go to `/admin/tools/new` — add a tool with category "General AI", name "ChatGPT", URL "https://chatgpt.com", description "General AI assistant". Submit.
2. Add another tool: category "Automation", name "Make.com", URL "https://make.com", description "No-code workflow builder". Submit.
3. Go to `http://localhost:5000`, scroll to Resources section.
4. Verify two category groups appear: "General AI" with ChatGPT, "Automation" with Make.com.
5. Verify Claude's Brain featured card is above the tool groups.
6. Click "Visit →" on a tool card — should open in new tab.
7. Click "Have a tool to suggest?" — should navigate to `/match`.

- [ ] **Step 3: Push to GitHub**

```
git push origin master
```

- [ ] **Step 4: Deploy to Elastic Beanstalk**

```
cd C:\Users\mark\projects\stpetexo
eb deploy
```

Wait for "Successfully deployed" message.

- [ ] **Step 5: Verify on production**

Open `https://www.stpeteai.org`, scroll to Resources section. Verify the new layout renders. Existing tools in the DB will appear without a category (grouped under "Other") until you set their categories via `/admin/tools/<id>/edit`.
