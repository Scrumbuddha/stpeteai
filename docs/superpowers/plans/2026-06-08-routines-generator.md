# Claude Code Routines Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/routines` page to stpeteai.org where users browse 150 Claude Code automation routines, filter by role/category/trigger, select stories, and receive a Claude-generated personalized implementation plan.

**Architecture:** Static routine data lives in `routines_data.py` (a Python list of dicts). Two Flask routes handle GET (render directory) and POST (call Claude, return plan JSON). The Jinja2 template uses vanilla JS for client-side filtering and fetch for the plan generation call — no build step, no framework, consistent with the rest of the site.

**Tech Stack:** Python/Flask, Jinja2, SQLAlchemy (no new tables), Anthropic SDK (`anthropic` already imported in `app.py`), vanilla JS, existing CSS design tokens.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `routines_data.py` | Create | All 150 routine dicts |
| `app.py` | Modify | Two new routes + import |
| `templates/routines.html` | Create | Directory UI + filter + results |
| `templates/index.html` | Modify | Nav link, footer link, programs item, sitemap |
| `tests/test_routines.py` | Create | Route + data + generate endpoint tests |

---

## Task 1: Create `routines_data.py` with all 150 stories

**Files:**
- Create: `routines_data.py`
- Test: `tests/test_routines.py`

- [ ] **Step 1: Write the failing test**

Create `tests/test_routines.py`:

```python
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from routines_data import ROUTINES, CATEGORIES, ROLES, TRIGGERS


def test_routines_count():
    assert len(ROUTINES) == 150


def test_each_routine_has_required_keys():
    required = {'id', 'title', 'role', 'category', 'trigger', 'frequency',
                'as_a', 'i_want', 'so_that'}
    for r in ROUTINES:
        missing = required - r.keys()
        assert not missing, f"Routine {r.get('id')} missing keys: {missing}"


def test_ids_are_unique():
    ids = [r['id'] for r in ROUTINES]
    assert len(ids) == len(set(ids))


def test_all_roles_valid():
    for r in ROUTINES:
        assert r['role'] in ROLES, f"Unknown role '{r['role']}' in routine {r['id']}"


def test_all_categories_valid():
    for r in ROUTINES:
        assert r['category'] in CATEGORIES, f"Unknown category '{r['category']}' in routine {r['id']}"


def test_all_triggers_valid():
    for r in ROUTINES:
        assert r['trigger'] in TRIGGERS, f"Unknown trigger '{r['trigger']}' in routine {r['id']}"


def test_constants_correct():
    assert len(CATEGORIES) == 10
    assert len(ROLES) == 8
    assert len(TRIGGERS) == 3
```

- [ ] **Step 2: Run test to verify it fails**

```
cd c:\Users\mark\projects\stpeteai
python -m pytest tests/test_routines.py -v
```

Expected: ImportError — `routines_data` not found.

- [ ] **Step 3: Create `routines_data.py`**

```python
CATEGORIES = [
    "Code & Development",
    "Project Management & Agile",
    "Documentation",
    "Communication & Reporting",
    "Quality Assurance & Testing",
    "Deployment & Operations",
    "Security & Compliance",
    "Business & Analytics",
    "Stock Market & Investment",
    "Small Business Operations",
]

ROLES = [
    "Engineer",
    "Product Manager",
    "Manager",
    "DevOps",
    "QA",
    "Security",
    "Investor",
    "Small Business Owner",
]

TRIGGERS = ["Scheduled", "GitHub Events", "API/On Demand"]

ROUTINES = [
    # ── Code & Development (1-15) ────────────────────────────────
    {"id": 1, "title": "Code Review Automation", "role": "Engineer",
     "category": "Code & Development", "trigger": "GitHub Events", "frequency": "Immediate",
     "as_a": "QA Lead", "i_want": "Claude to review every PR for security issues",
     "so_that": "vulnerabilities are caught before merge"},
    {"id": 2, "title": "Test Coverage Monitoring", "role": "Engineer",
     "category": "Code & Development", "trigger": "Scheduled", "frequency": "On commit",
     "as_a": "Developer", "i_want": "Claude to alert me when test coverage drops below 80%",
     "so_that": "code quality doesn't degrade"},
    {"id": 3, "title": "Performance Regression Detection", "role": "Engineer",
     "category": "Code & Development", "trigger": "GitHub Events", "frequency": "On every new PR",
     "as_a": "Engineering Manager", "i_want": "Claude to run performance benchmarks on every PR",
     "so_that": "we catch slowdowns early"},
    {"id": 4, "title": "Dependency Security Scanning", "role": "Security",
     "category": "Code & Development", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Security Engineer", "i_want": "Claude to scan new dependencies for known vulnerabilities",
     "so_that": "we don't introduce unsafe packages"},
    {"id": 5, "title": "API Endpoint Documentation", "role": "Engineer",
     "category": "Code & Development", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Backend Developer", "i_want": "Claude to auto-generate API documentation from code comments",
     "so_that": "docs stay synchronized with code"},
    {"id": 6, "title": "Breaking Change Detection", "role": "Engineer",
     "category": "Code & Development", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "Platform Lead", "i_want": "Claude to flag any breaking changes in a PR",
     "so_that": "API consumers get warnings"},
    {"id": 7, "title": "Code Style Enforcement", "role": "Engineer",
     "category": "Code & Development", "trigger": "GitHub Events", "frequency": "Immediate",
     "as_a": "Tech Lead", "i_want": "Claude to check every PR for style violations",
     "so_that": "code stays consistent without manual review"},
    {"id": 8, "title": "Merge Conflict Resolution", "role": "Engineer",
     "category": "Code & Development", "trigger": "GitHub Events", "frequency": "On conflict",
     "as_a": "Developer", "i_want": "Claude to identify and suggest fixes for merge conflicts",
     "so_that": "I spend less time untangling them"},
    {"id": 9, "title": "Dead Code Detection", "role": "Engineer",
     "category": "Code & Development", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Refactoring Champion", "i_want": "Claude to identify unused functions and classes monthly",
     "so_that": "we keep the codebase clean"},
    {"id": 10, "title": "SQL Query Optimization", "role": "Engineer",
     "category": "Code & Development", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "Database Administrator", "i_want": "Claude to review new SQL queries for performance issues",
     "so_that": "slow queries don't reach production"},
    {"id": 11, "title": "Multi-SDK Sync", "role": "Engineer",
     "category": "Code & Development", "trigger": "GitHub Events", "frequency": "On merge",
     "as_a": "Platform Team Lead", "i_want": "Claude to port changes from our Python SDK to our Go SDK",
     "so_that": "libraries stay synchronized"},
    {"id": 12, "title": "Changelog Generation", "role": "Product Manager",
     "category": "Code & Development", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Product Manager", "i_want": "Claude to generate a changelog from merged PRs weekly",
     "so_that": "we have release notes ready"},
    {"id": 13, "title": "Architecture Violation Detection", "role": "Engineer",
     "category": "Code & Development", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "Architect", "i_want": "Claude to flag violations of our ADRs in code reviews",
     "so_that": "architecture decisions are enforced"},
    {"id": 14, "title": "Complexity Analysis", "role": "Engineer",
     "category": "Code & Development", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "Tech Lead", "i_want": "Claude to calculate cyclomatic complexity for new code",
     "so_that": "I can identify overly complex functions"},
    {"id": 15, "title": "Licensing Compliance Check", "role": "Security",
     "category": "Code & Development", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Legal/Compliance Officer", "i_want": "Claude to verify all dependencies have approved licenses",
     "so_that": "we avoid legal issues"},

    # ── Project Management & Agile (16-35) ───────────────────────
    {"id": 16, "title": "Daily Standup Digest", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Scrum Master", "i_want": "Claude to generate a standup summary from git commits",
     "so_that": "our team has a daily brief"},
    {"id": 17, "title": "Sprint Planning Assistance", "role": "Product Manager",
     "category": "Project Management & Agile", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Product Owner", "i_want": "Claude to suggest sprint stories based on our backlog and team velocity",
     "so_that": "planning meetings are shorter"},
    {"id": 18, "title": "Issue Triage Automation", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Engineering Manager", "i_want": "Claude to categorize and label new GitHub issues nightly",
     "so_that": "backlog is organized each morning"},
    {"id": 19, "title": "Blocker Identification", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Twice daily",
     "as_a": "Scrum Master", "i_want": "Claude to identify blockers from PR comments and Jira",
     "so_that": "risks surface early"},
    {"id": 20, "title": "Sprint Burndown Analysis", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Agile Coach", "i_want": "Claude to analyze sprint progress and predict completion",
     "so_that": "we can course-correct mid-sprint"},
    {"id": 21, "title": "Retrospective Report Generation", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Scrum Master", "i_want": "Claude to compile sprint data for retrospectives",
     "so_that": "I have talking points ready"},
    {"id": 22, "title": "Story Point Estimation", "role": "Engineer",
     "category": "Project Management & Agile", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Tech Lead", "i_want": "Claude to suggest story point estimates based on historical velocity",
     "so_that": "estimation is faster"},
    {"id": 23, "title": "Capacity Planning", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Engineering Manager", "i_want": "Claude to forecast team capacity for the next 3 sprints",
     "so_that": "we can commit with confidence"},
    {"id": 24, "title": "Dependency Mapping", "role": "Product Manager",
     "category": "Project Management & Agile", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Product Owner", "i_want": "Claude to identify dependencies between stories in a sprint",
     "so_that": "we sequence work correctly"},
    {"id": 25, "title": "On-Demand Team Report", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Engineering Manager", "i_want": "Claude to generate team health reports on demand",
     "so_that": "I can answer leadership questions quickly"},
    {"id": 26, "title": "Release Planning", "role": "Product Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "On release",
     "as_a": "Product Manager", "i_want": "Claude to group completed stories into release notes",
     "so_that": "customers know what's new"},
    {"id": 27, "title": "Velocity Trending", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Scrum Master", "i_want": "Claude to track velocity trends over 10 sprints",
     "so_that": "we can identify team improvement"},
    {"id": 28, "title": "Priority Conflict Resolution", "role": "Product Manager",
     "category": "Project Management & Agile", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Product Owner", "i_want": "Claude to identify conflicting priorities in the backlog",
     "so_that": "we align on sequencing"},
    {"id": 29, "title": "Epic Breakdown", "role": "Product Manager",
     "category": "Project Management & Agile", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Product Manager", "i_want": "Claude to break down epics into user stories",
     "so_that": "they're ready for sprint planning"},
    {"id": 30, "title": "Stakeholder Status Update", "role": "Product Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Product Manager", "i_want": "Claude to generate weekly stakeholder updates",
     "so_that": "leadership is informed without my effort"},
    {"id": 31, "title": "Sprint Goal Tracking", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Scrum Master", "i_want": "Claude to remind the team of sprint goals daily",
     "so_that": "focus is maintained"},
    {"id": 32, "title": "Action Item Follow-up", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Scrum Master", "i_want": "Claude to remind owners of action items from standups",
     "so_that": "nothing falls through cracks"},
    {"id": 33, "title": "Team Workload Balancing", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Engineering Manager", "i_want": "Claude to suggest story assignments based on workload",
     "so_that": "team load is even"},
    {"id": 34, "title": "Milestone Tracking", "role": "Product Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Product Manager", "i_want": "Claude to track progress toward major milestones",
     "so_that": "we stay on schedule"},
    {"id": 35, "title": "Unplanned Work Identification", "role": "Manager",
     "category": "Project Management & Agile", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Scrum Master", "i_want": "Claude to flag unplanned work added to the sprint",
     "so_that": "scope creep is visible"},

    # ── Documentation (36-48) ────────────────────────────────────
    {"id": 36, "title": "Documentation Drift Detection", "role": "Engineer",
     "category": "Documentation", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Tech Lead", "i_want": "Claude to scan for API documentation that doesn't match code",
     "so_that": "docs stay accurate"},
    {"id": 37, "title": "README Update Suggestions", "role": "Engineer",
     "category": "Documentation", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Developer", "i_want": "Claude to suggest README updates based on recent code changes",
     "so_that": "setup instructions stay current"},
    {"id": 38, "title": "ADR Suggestions", "role": "Engineer",
     "category": "Documentation", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "Architect", "i_want": "Claude to identify missing ADRs for significant architectural changes",
     "so_that": "decisions are documented"},
    {"id": 39, "title": "API Client Library Documentation", "role": "Engineer",
     "category": "Documentation", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "DevRel Engineer", "i_want": "Claude to auto-generate API client docs from OpenAPI specs",
     "so_that": "SDKs are always documented"},
    {"id": 40, "title": "Troubleshooting Guide Generation", "role": "Manager",
     "category": "Documentation", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Support Manager", "i_want": "Claude to generate troubleshooting guides from common support tickets",
     "so_that": "documentation helps customers"},
    {"id": 41, "title": "Code Comment Quality Check", "role": "Engineer",
     "category": "Documentation", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "Code Reviewer", "i_want": "Claude to flag functions with missing comments",
     "so_that": "code is self-documenting"},
    {"id": 42, "title": "Runbook Creation", "role": "DevOps",
     "category": "Documentation", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "On-Call Engineer", "i_want": "Claude to create runbooks for common operational procedures",
     "so_that": "incident response is faster"},
    {"id": 43, "title": "Migration Guide Generation", "role": "Product Manager",
     "category": "Documentation", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Product Manager", "i_want": "Claude to create migration guides when APIs change",
     "so_that": "customers can upgrade smoothly"},
    {"id": 44, "title": "FAQ From Slack", "role": "Manager",
     "category": "Documentation", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Support Lead", "i_want": "Claude to build an FAQ from repeated Slack questions",
     "so_that": "self-service improves"},
    {"id": 45, "title": "Feature Documentation", "role": "Product Manager",
     "category": "Documentation", "trigger": "Scheduled", "frequency": "On release",
     "as_a": "Product Manager", "i_want": "Claude to document new features automatically",
     "so_that": "docs are complete at launch"},
    {"id": 46, "title": "Deprecation Notices", "role": "Engineer",
     "category": "Documentation", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Platform Lead", "i_want": "Claude to generate deprecation notices for old APIs",
     "so_that": "users plan migrations"},
    {"id": 47, "title": "Configuration Guide", "role": "DevOps",
     "category": "Documentation", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "DevOps Engineer", "i_want": "Claude to generate configuration guides from infrastructure code",
     "so_that": "admins know how to operate systems"},
    {"id": 48, "title": "Onboarding Checklist Generation", "role": "Manager",
     "category": "Documentation", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Engineering Manager", "i_want": "Claude to auto-generate onboarding checklists for new team members",
     "so_that": "they get up to speed faster"},

    # ── Communication & Reporting (49-65) ────────────────────────
    {"id": 49, "title": "Weekly Team Newsletter", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Team Lead", "i_want": "Claude to compile wins and metrics into a weekly newsletter",
     "so_that": "the team celebrates progress"},
    {"id": 50, "title": "Executive Summary", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Engineering Director", "i_want": "Claude to create executive summaries of technical progress",
     "so_that": "leadership understands impact"},
    {"id": 51, "title": "Customer Success Update", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Customer Success Manager", "i_want": "Claude to generate customer health summaries",
     "so_that": "I can proactively support accounts"},
    {"id": 52, "title": "Incident Post-Mortem", "role": "DevOps",
     "category": "Communication & Reporting", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Incident Commander", "i_want": "Claude to compile incident data into a post-mortem",
     "so_that": "we learn from outages"},
    {"id": 53, "title": "Code Contributor Recognition", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Manager", "i_want": "Claude to identify top contributors monthly",
     "so_that": "I can recognize and celebrate them"},
    {"id": 54, "title": "Team Metrics Dashboard", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Engineering Manager", "i_want": "Claude to generate team metrics weekly",
     "so_that": "I have data for 1-on-1s"},
    {"id": 55, "title": "Customer Feature Request Summary", "role": "Product Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Product Manager", "i_want": "Claude to summarize feature requests by category monthly",
     "so_that": "we see demand patterns"},
    {"id": 56, "title": "Community Engagement Report", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Developer Relations Manager", "i_want": "Claude to track community contributions weekly",
     "so_that": "I see who's engaged"},
    {"id": 57, "title": "Conference Talk Suggestions", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Developer Relations Manager", "i_want": "Claude to identify interesting technical topics from PRs",
     "so_that": "we find talks worth proposing"},
    {"id": 58, "title": "Partner Integration Status", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Partnerships Manager", "i_want": "Claude to summarize partner integration progress weekly",
     "so_that": "stakeholders are informed"},
    {"id": 59, "title": "Product Launch Announcement", "role": "Product Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "On release",
     "as_a": "Product Manager", "i_want": "Claude to draft launch announcements from completed stories",
     "so_that": "marketing has copy ready"},
    {"id": 60, "title": "Engineering Hiring Needs", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Engineering Manager", "i_want": "Claude to identify skills gaps from PR patterns",
     "so_that": "we know what to hire for"},
    {"id": 61, "title": "Technical Debt Summary", "role": "Engineer",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Tech Lead", "i_want": "Claude to summarize technical debt monthly",
     "so_that": "I can advocate for refactoring time"},
    {"id": 62, "title": "Competitive Analysis", "role": "Product Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Product Manager", "i_want": "Claude to track competitor features mentioned in issues",
     "so_that": "we stay competitive"},
    {"id": 63, "title": "Team Bandwidth Alert", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Scrum Master", "i_want": "Claude to alert me when the team is over-capacity",
     "so_that": "we can reduce scope"},
    {"id": 64, "title": "Risk Register Update", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Program Manager", "i_want": "Claude to identify risks from sprint data",
     "so_that": "the risk register stays current"},
    {"id": 65, "title": "Board Meeting Prep", "role": "Manager",
     "category": "Communication & Reporting", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Executive", "i_want": "Claude to prepare board meeting materials on demand",
     "so_that": "I'm ready for investor questions"},

    # ── Quality Assurance & Testing (66-76) ──────────────────────
    {"id": 66, "title": "Flaky Test Detection", "role": "QA",
     "category": "Quality Assurance & Testing", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "QA Engineer", "i_want": "Claude to identify flaky tests from CI logs",
     "so_that": "we fix unreliable tests"},
    {"id": 67, "title": "Test Case Generation", "role": "QA",
     "category": "Quality Assurance & Testing", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "QA Lead", "i_want": "Claude to suggest test cases for new features",
     "so_that": "coverage is comprehensive"},
    {"id": 68, "title": "Cross-Browser Testing Summary", "role": "QA",
     "category": "Quality Assurance & Testing", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "QA Engineer", "i_want": "Claude to summarize cross-browser test results",
     "so_that": "we know which browsers are broken"},
    {"id": 69, "title": "Bug Severity Classification", "role": "QA",
     "category": "Quality Assurance & Testing", "trigger": "GitHub Events", "frequency": "On issue creation",
     "as_a": "QA Manager", "i_want": "Claude to classify bugs by severity",
     "so_that": "critical issues get priority"},
    {"id": 70, "title": "Regression Test Suite Recommendation", "role": "QA",
     "category": "Quality Assurance & Testing", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "QA Lead", "i_want": "Claude to suggest regression tests based on code changes",
     "so_that": "we test the right areas"},
    {"id": 71, "title": "Test Coverage Report", "role": "QA",
     "category": "Quality Assurance & Testing", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Tech Lead", "i_want": "Claude to generate test coverage reports",
     "so_that": "we can see gaps"},
    {"id": 72, "title": "Accessibility Compliance Check", "role": "QA",
     "category": "Quality Assurance & Testing", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "Compliance Officer", "i_want": "Claude to check for accessibility violations",
     "so_that": "our product is accessible"},
    {"id": 73, "title": "Load Testing Report", "role": "DevOps",
     "category": "Quality Assurance & Testing", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Infrastructure Engineer", "i_want": "Claude to run load tests weekly",
     "so_that": "we know if performance degrades"},
    {"id": 74, "title": "Security Vulnerability Report", "role": "Security",
     "category": "Quality Assurance & Testing", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Security Officer", "i_want": "Claude to run security scans weekly",
     "so_that": "we catch vulnerabilities early"},
    {"id": 75, "title": "Usability Issue Detection", "role": "QA",
     "category": "Quality Assurance & Testing", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "UX Designer", "i_want": "Claude to flag potential UX issues from code changes",
     "so_that": "we can test them"},
    {"id": 76, "title": "QA Triage Summary", "role": "QA",
     "category": "Quality Assurance & Testing", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "QA Manager", "i_want": "Claude to triage bugs daily",
     "so_that": "they're ready for team assignment"},

    # ── Deployment & Operations (77-86) ──────────────────────────
    {"id": 77, "title": "Deployment Verification", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "API/On Demand", "frequency": "On each deployment",
     "as_a": "DevOps Engineer", "i_want": "Claude to verify production deployments with smoke tests",
     "so_that": "bad deployments are caught immediately"},
    {"id": 78, "title": "Log Analysis & Alerting", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "Scheduled", "frequency": "Continuous",
     "as_a": "On-Call Engineer", "i_want": "Claude to analyze error logs and alert on spikes",
     "so_that": "I catch issues before customers do"},
    {"id": 79, "title": "Database Migration Review", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "DBA", "i_want": "Claude to review database migrations for safety",
     "so_that": "we avoid data loss"},
    {"id": 80, "title": "Infrastructure Cost Optimization", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Finance Manager", "i_want": "Claude to identify over-provisioned resources monthly",
     "so_that": "we optimize cloud spend"},
    {"id": 81, "title": "Backup Verification", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "DBA", "i_want": "Claude to verify backups completed successfully",
     "so_that": "we're protected from data loss"},
    {"id": 82, "title": "DNS & Certificate Expiration", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "DevOps Engineer", "i_want": "Claude to monitor for expiring certificates and DNS issues",
     "so_that": "we avoid service disruptions"},
    {"id": 83, "title": "Configuration Drift Detection", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "DevOps Engineer", "i_want": "Claude to detect configuration drift from infrastructure as code",
     "so_that": "production matches our spec"},
    {"id": 84, "title": "Disaster Recovery Testing", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Disaster Recovery Manager", "i_want": "Claude to run DR tests monthly",
     "so_that": "we know we can recover from disasters"},
    {"id": 85, "title": "Blue-Green Deployment Validation", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "API/On Demand", "frequency": "On each deployment",
     "as_a": "Deployment Lead", "i_want": "Claude to validate blue-green deployments",
     "so_that": "we can roll back quickly if needed"},
    {"id": 86, "title": "Rollback Recommendation", "role": "DevOps",
     "category": "Deployment & Operations", "trigger": "API/On Demand", "frequency": "On anomaly detection",
     "as_a": "On-Call Engineer", "i_want": "Claude to recommend rollbacks when errors spike",
     "so_that": "we recover quickly"},

    # ── Security & Compliance (87-95) ────────────────────────────
    {"id": 87, "title": "Secrets Scanning", "role": "Security",
     "category": "Security & Compliance", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Security Officer", "i_want": "Claude to scan code for exposed secrets",
     "so_that": "credentials aren't leaked"},
    {"id": 88, "title": "Compliance Audit Trail", "role": "Security",
     "category": "Security & Compliance", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Compliance Officer", "i_want": "Claude to generate audit trails for compliance",
     "so_that": "we pass audits"},
    {"id": 89, "title": "GDPR Data Processing Review", "role": "Security",
     "category": "Security & Compliance", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "Data Protection Officer", "i_want": "Claude to review code for GDPR compliance",
     "so_that": "we protect customer data"},
    {"id": 90, "title": "Security Incident Response", "role": "Security",
     "category": "Security & Compliance", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Security Officer", "i_want": "Claude to assist with incident response by gathering evidence",
     "so_that": "investigations are thorough"},
    {"id": 91, "title": "Access Control Review", "role": "Security",
     "category": "Security & Compliance", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Security Officer", "i_want": "Claude to review access control logs monthly",
     "so_that": "we catch unauthorized access"},
    {"id": 92, "title": "Vulnerability Disclosure Coordination", "role": "Security",
     "category": "Security & Compliance", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Security Officer", "i_want": "Claude to manage vulnerability disclosures",
     "so_that": "we respond responsibly"},
    {"id": 93, "title": "Third-Party Security Assessment", "role": "Security",
     "category": "Security & Compliance", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Security Officer", "i_want": "Claude to assess third-party vendor security",
     "so_that": "we manage supply chain risk"},
    {"id": 94, "title": "Security Training Reminder", "role": "Security",
     "category": "Security & Compliance", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Security Officer", "i_want": "Claude to send security training reminders quarterly",
     "so_that": "team stays aware"},
    {"id": 95, "title": "Code Security Baseline", "role": "Security",
     "category": "Security & Compliance", "trigger": "GitHub Events", "frequency": "On PR open",
     "as_a": "Security Officer", "i_want": "Claude to enforce security baselines across all services",
     "so_that": "we maintain standards"},

    # ── Business & Analytics (96-100) ────────────────────────────
    {"id": 96, "title": "Product Usage Analytics", "role": "Product Manager",
     "category": "Business & Analytics", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Product Manager", "i_want": "Claude to summarize user behavior weekly",
     "so_that": "we see adoption trends"},
    {"id": 97, "title": "Revenue Impact Analysis", "role": "Product Manager",
     "category": "Business & Analytics", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Finance Manager", "i_want": "Claude to calculate revenue impact of features",
     "so_that": "we prioritize high-ROI work"},
    {"id": 98, "title": "Customer Churn Analysis", "role": "Product Manager",
     "category": "Business & Analytics", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Customer Success Manager", "i_want": "Claude to identify at-risk customers",
     "so_that": "we can intervene early"},
    {"id": 99, "title": "Market Opportunity Assessment", "role": "Product Manager",
     "category": "Business & Analytics", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Product Manager", "i_want": "Claude to identify market opportunities from customer feedback",
     "so_that": "we know what to build"},
    {"id": 100, "title": "Competitive Feature Parity Check", "role": "Product Manager",
     "category": "Business & Analytics", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Product Manager", "i_want": "Claude to compare our features to competitors monthly",
     "so_that": "we know where we lag"},

    # ── Stock Market & Investment (101-120) ──────────────────────
    {"id": 101, "title": "Daily Portfolio Summary", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Investor", "i_want": "Claude to generate a daily portfolio summary with gains/losses",
     "so_that": "I see my investments at a glance"},
    {"id": 102, "title": "Stock Price Alert", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Every 15 minutes",
     "as_a": "Trader", "i_want": "Claude to alert me when stocks hit target prices",
     "so_that": "I don't miss buy/sell opportunities"},
    {"id": 103, "title": "Dividend Tracker", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Income Investor", "i_want": "Claude to track upcoming dividend payments",
     "so_that": "I know when to expect income"},
    {"id": 104, "title": "Tax Loss Harvesting Recommendations", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Tax-Conscious Investor", "i_want": "Claude to identify tax loss harvesting opportunities",
     "so_that": "I minimize taxes"},
    {"id": 105, "title": "Earnings Report Analysis", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "API/On Demand", "frequency": "On report release",
     "as_a": "Stock Picker", "i_want": "Claude to analyze earnings reports and flag surprises",
     "so_that": "I see investment implications"},
    {"id": 106, "title": "Portfolio Rebalancing Alert", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Passive Investor", "i_want": "Claude to alert me when allocations drift > 5%",
     "so_that": "I know when to rebalance"},
    {"id": 107, "title": "Sector Performance Tracking", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Diversified Investor", "i_want": "Claude to track sector performance weekly",
     "so_that": "I see which areas are hot"},
    {"id": 108, "title": "Correlation Analysis", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Risk Manager", "i_want": "Claude to analyze correlation between my holdings",
     "so_that": "I can reduce portfolio risk"},
    {"id": 109, "title": "IPO Screening", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Growth Investor", "i_want": "Claude to screen upcoming IPOs for my criteria",
     "so_that": "I find investment opportunities"},
    {"id": 110, "title": "Debt vs. Equity Analysis", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Fundamental Analyst", "i_want": "Claude to compare company debt levels",
     "so_that": "I assess financial health"},
    {"id": 111, "title": "Interest Rate Impact Analysis", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Fixed Income Investor", "i_want": "Claude to analyze how rate changes affect my bonds",
     "so_that": "I understand risks"},
    {"id": 112, "title": "Dividend History Analysis", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Dividend Investor", "i_want": "Claude to track dividend history of my holdings",
     "so_that": "I spot cuts before they happen"},
    {"id": 113, "title": "Year-to-Date Performance Report", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Self-Directed Investor", "i_want": "Claude to generate YTD performance reports",
     "so_that": "I track progress toward goals"},
    {"id": 114, "title": "Insider Trading Alerts", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Contrarian Investor", "i_want": "Claude to alert me to insider buys/sells",
     "so_that": "I see what insiders think"},
    {"id": 115, "title": "Volatility Spike Detection", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Hourly",
     "as_a": "Risk-Aware Investor", "i_want": "Claude to alert me to unusual volatility",
     "so_that": "I can investigate causes"},
    {"id": 116, "title": "Competitor Comparison", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Sector Investor", "i_want": "Claude to compare competitors' metrics monthly",
     "so_that": "I identify the best positioned"},
    {"id": 117, "title": "Economic Calendar Tracking", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Macro Investor", "i_want": "Claude to alert me to important economic releases",
     "so_that": "I prepare for market moves"},
    {"id": 118, "title": "Valuation Metric Analysis", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Value Investor", "i_want": "Claude to track P/E, P/B, PEG ratios",
     "so_that": "I find undervalued stocks"},
    {"id": 119, "title": "Crypto Portfolio Tracking", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Digital Asset Investor", "i_want": "Claude to track crypto holdings across exchanges",
     "so_that": "I see consolidated portfolio"},
    {"id": 120, "title": "Investment Goal Progress Report", "role": "Investor",
     "category": "Stock Market & Investment", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Goal-Focused Investor", "i_want": "Claude to report progress toward retirement/college/goals",
     "so_that": "I know if I'm on track"},

    # ── Small Business Operations (121-150) ──────────────────────
    {"id": 121, "title": "Daily Sales Summary", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Small Business Owner", "i_want": "Claude to summarize daily sales by product/customer",
     "so_that": "I know how business is doing"},
    {"id": 122, "title": "Customer Order Tracking", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Twice daily",
     "as_a": "Fulfillment Manager", "i_want": "Claude to track order status and flag delays",
     "so_that": "customers aren't left wondering"},
    {"id": 123, "title": "Inventory Low Stock Alerts", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Warehouse Manager", "i_want": "Claude to alert when inventory falls below thresholds",
     "so_that": "I reorder before stockouts"},
    {"id": 124, "title": "Supplier Performance Scorecard", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Procurement Manager", "i_want": "Claude to track supplier metrics (on-time, quality)",
     "so_that": "I hold suppliers accountable"},
    {"id": 125, "title": "Cash Flow Forecast", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Business Owner", "i_want": "Claude to forecast cash flow monthly",
     "so_that": "I manage working capital"},
    {"id": 126, "title": "Expense Categorization", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "API/On Demand", "frequency": "On expense entry",
     "as_a": "Accountant", "i_want": "Claude to automatically categorize expenses",
     "so_that": "accounting is faster and more accurate"},
    {"id": 127, "title": "Overdue Invoice Collection", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Finance Manager", "i_want": "Claude to track overdue invoices and alert on collection",
     "so_that": "I improve cash collection"},
    {"id": 128, "title": "Profitability by Product", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Product Manager", "i_want": "Claude to calculate profitability by product/SKU",
     "so_that": "I know what to promote"},
    {"id": 129, "title": "Customer Lifetime Value Analysis", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Marketing Manager", "i_want": "Claude to calculate CLV by customer segment",
     "so_that": "I focus on high-value customers"},
    {"id": 130, "title": "Payroll Compliance Check", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "HR Manager", "i_want": "Claude to review payroll for compliance (tax withholding, breaks)",
     "so_that": "we stay compliant"},
    {"id": 131, "title": "Employee Performance Review Prep", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "API/On Demand", "frequency": "Quarterly",
     "as_a": "Manager", "i_want": "Claude to compile performance data for reviews",
     "so_that": "reviews are data-driven"},
    {"id": 132, "title": "Customer Support Ticket Triage", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "3 times daily",
     "as_a": "Support Manager", "i_want": "Claude to categorize and prioritize support tickets",
     "so_that": "urgent issues get attention"},
    {"id": 133, "title": "Website Traffic Analysis", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Marketing Manager", "i_want": "Claude to analyze website traffic weekly",
     "so_that": "I see what content resonates"},
    {"id": 134, "title": "Social Media Engagement Report", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Social Media Manager", "i_want": "Claude to summarize engagement metrics daily",
     "so_that": "I see what content performs"},
    {"id": 135, "title": "Email Campaign Performance", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "API/On Demand", "frequency": "On demand",
     "as_a": "Marketing Manager", "i_want": "Claude to analyze email campaign results",
     "so_that": "I improve open/click rates"},
    {"id": 136, "title": "Customer Feedback Compilation", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Product Manager", "i_want": "Claude to compile customer feedback into themes",
     "so_that": "I see improvement opportunities"},
    {"id": 137, "title": "Competitive Price Monitoring", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Pricing Manager", "i_want": "Claude to monitor competitor prices daily",
     "so_that": "I stay competitive"},
    {"id": 138, "title": "Warranty & Returns Analysis", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Quality Manager", "i_want": "Claude to track warranty claims and returns",
     "so_that": "I spot quality issues"},
    {"id": 139, "title": "License & Permit Compliance", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Operations Manager", "i_want": "Claude to track business license and permit expirations",
     "so_that": "we don't lose credentials"},
    {"id": 140, "title": "Insurance Policy Review", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Risk Manager", "i_want": "Claude to review insurance coverage monthly",
     "so_that": "we maintain proper protection"},
    {"id": 141, "title": "Contract Renewal Alerts", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Contracts Manager", "i_want": "Claude to alert on contract renewals",
     "so_that": "we don't miss deadlines or price increases"},
    {"id": 142, "title": "Vendor Invoice Reconciliation", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Daily",
     "as_a": "Accounts Payable Manager", "i_want": "Claude to match invoices to POs and receipts",
     "so_that": "payments are accurate"},
    {"id": 143, "title": "Budget vs. Actual Variance", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Finance Manager", "i_want": "Claude to analyze budget variances monthly",
     "so_that": "I manage to budget"},
    {"id": 144, "title": "Quarterly Tax Estimate", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Business Owner", "i_want": "Claude to calculate quarterly tax estimates",
     "so_that": "I set aside proper tax amounts"},
    {"id": 145, "title": "Growth Metrics Dashboard", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Business Owner", "i_want": "Claude to compile growth metrics (MoM, YoY)",
     "so_that": "I see business trajectory"},
    {"id": 146, "title": "Employee Handbook Updates", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "HR Manager", "i_want": "Claude to flag policy updates needed based on new regulations",
     "so_that": "handbook stays compliant"},
    {"id": 147, "title": "Seasonal Planning Recommendations", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Quarterly",
     "as_a": "Retail Manager", "i_want": "Claude to suggest seasonal staffing and inventory based on history",
     "so_that": "I prepare proactively"},
    {"id": 148, "title": "Customer Win/Loss Analysis", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Sales Manager", "i_want": "Claude to analyze why customers were won or lost",
     "so_that": "I improve sales strategy"},
    {"id": 149, "title": "Business Insurance Claims Tracking", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Weekly",
     "as_a": "Risk Manager", "i_want": "Claude to track filed insurance claims",
     "so_that": "we follow up to resolution"},
    {"id": 150, "title": "Annual Business Plan Progress", "role": "Small Business Owner",
     "category": "Small Business Operations", "trigger": "Scheduled", "frequency": "Monthly",
     "as_a": "Business Owner", "i_want": "Claude to track progress toward annual goals monthly",
     "so_that": "I course-correct as needed"},
]
```

- [ ] **Step 4: Run tests to verify they pass**

```
python -m pytest tests/test_routines.py -v
```

Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```
git add routines_data.py tests/test_routines.py
git commit -m "feat: add routines_data.py with 150 routine stories and tests"
```

---

## Task 2: Add Flask routes in `app.py`

**Files:**
- Modify: `app.py` (after the existing `/match/apply` route, before the admin routes)
- Test: `tests/test_routines.py` (add to existing file)

- [ ] **Step 1: Write failing route tests**

Append to `tests/test_routines.py`:

```python
from app import app, db


@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()


def test_routines_page_loads(client):
    resp = client.get('/routines')
    assert resp.status_code == 200
    assert b'Routines' in resp.data


def test_routines_page_shows_all_stories(client):
    resp = client.get('/routines')
    assert b'Code Review Automation' in resp.data
    assert b'Annual Business Plan Progress' in resp.data


def test_routines_filter_by_role(client):
    resp = client.get('/routines?role=Investor')
    assert resp.status_code == 200
    assert b'Daily Portfolio Summary' in resp.data
    assert b'Code Review Automation' not in resp.data


def test_routines_filter_by_category(client):
    resp = client.get('/routines?category=Documentation')
    assert resp.status_code == 200
    assert b'README Update Suggestions' in resp.data
    assert b'Daily Portfolio Summary' not in resp.data


def test_generate_requires_selected_ids(client):
    resp = client.post('/routines/generate',
                       json={'selected_ids': [], 'role': 'Engineer',
                             'tools': 'GitHub', 'goal': 'save time'},
                       content_type='application/json')
    assert resp.status_code == 400
    data = resp.get_json()
    assert 'error' in data


def test_generate_requires_role(client):
    resp = client.post('/routines/generate',
                       json={'selected_ids': [1], 'role': '',
                             'tools': 'GitHub', 'goal': 'save time'},
                       content_type='application/json')
    assert resp.status_code == 400
    data = resp.get_json()
    assert 'error' in data


def test_generate_returns_error_without_api_key(client, monkeypatch):
    monkeypatch.delenv('ANTHROPIC_API_KEY', raising=False)
    resp = client.post('/routines/generate',
                       json={'selected_ids': [1], 'role': 'Engineer',
                             'tools': 'GitHub', 'goal': 'save time'},
                       content_type='application/json')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'error' in data
```

- [ ] **Step 2: Run tests to verify they fail**

```
python -m pytest tests/test_routines.py::test_routines_page_loads -v
```

Expected: FAIL — `404` (route doesn't exist yet).

- [ ] **Step 3: Add import and routes to `app.py`**

At the top of `app.py`, after the existing imports, add:

```python
from routines_data import ROUTINES, CATEGORIES, ROLES, TRIGGERS
```

Then add these two routes after the `/match/apply` route and before the `# ── Admin auth` comment block:

```python
# ── Routines ──────────────────────────────────────────────────────────────

@app.route('/routines')
def routines():
    role     = request.args.get('role', '').strip()
    category = request.args.get('category', '').strip()

    stories = ROUTINES
    if role and role in ROLES:
        stories = [r for r in stories if r['role'] == role]
    if category and category in CATEGORIES:
        stories = [r for r in stories if r['category'] == category]

    return render_template('routines.html',
                           routines=stories,
                           all_routines=ROUTINES,
                           categories=CATEGORIES,
                           roles=ROLES,
                           triggers=TRIGGERS,
                           active_role=role,
                           active_category=category)


@app.route('/routines/generate', methods=['POST'])
@limiter.limit('5 per hour', error_message='Too many requests. Please try again later.')
def routines_generate():
    data = request.get_json(silent=True) or {}
    selected_ids = data.get('selected_ids', [])
    role  = (data.get('role') or '').strip()
    tools = (data.get('tools') or '').strip()
    goal  = (data.get('goal') or '').strip()

    if not selected_ids or not role:
        return json.dumps({'error': 'Please select at least one routine and choose your role.'}), 400, {'Content-Type': 'application/json'}

    id_set   = set(selected_ids)
    selected = [r for r in ROUTINES if r['id'] in id_set]
    if not selected:
        return json.dumps({'error': 'No matching routines found.'}), 400, {'Content-Type': 'application/json'}

    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        return json.dumps({'error': 'Plan generation is temporarily unavailable. Please try again shortly.'}), 200, {'Content-Type': 'application/json'}

    stories_block = '\n'.join(
        f"- [{r['id']}] {r['title']}: As a {r['as_a']}, I want {r['i_want']}, "
        f"so that {r['so_that']}. Trigger: {r['trigger']}. Frequency: {r['frequency']}."
        for r in selected
    )

    prompt = f"""You are helping a {role} at a community AI organization set up Claude Code automation routines.

Their tools: {tools or 'not specified'}
Their goal: {goal or 'not specified'}

They have selected these {len(selected)} routines:
{stories_block}

Generate a personalized implementation plan with these exact sections:

1. WHY THESE FIT YOU (2-3 sentences): Why this set of routines matches their role and goal.

2. ROUTINE BREAKDOWN: For each selected routine, provide:
   - What Claude does in this routine
   - What data source or integration it needs
   - What the output looks like
   - Estimated setup time
   - Estimated weekly time saved

3. START HERE: Which 1-2 routines to implement first and why.

4. QUICK-START CHECKLIST: 3-5 concrete action items to get the first routine running.

Be specific and practical. Write for someone who may be new to Claude Code automation."""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=1500,
            messages=[{'role': 'user', 'content': prompt}],
        )
        plan = message.content[0].text.strip()
        return json.dumps({'plan': plan}), 200, {'Content-Type': 'application/json'}
    except Exception:
        return json.dumps({'error': 'Plan generation is temporarily unavailable. Please try again shortly.'}), 200, {'Content-Type': 'application/json'}
```

- [ ] **Step 4: Run tests to verify they pass**

```
python -m pytest tests/test_routines.py -v
```

Expected: All tests PASS (the `test_generate_returns_error_without_api_key` test passes because no API key is set in the test environment).

- [ ] **Step 5: Commit**

```
git add app.py tests/test_routines.py
git commit -m "feat: add /routines and /routines/generate Flask routes"
```

---

## Task 3: Create `templates/routines.html`

**Files:**
- Create: `templates/routines.html`

- [ ] **Step 1: Create the template**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Claude Code Routines — St. Pete AI</title>
<meta name="description" content="Browse 150 Claude Code automation routines by role and category. Get a personalized implementation plan for your workflow.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700;900&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
:root{
  --cream:#eef1f7;--dark:#0d1220;--dark-card:#131929;--dark-card2:#1a2235;
  --white:#f4f7fc;--blue:#1e5fc4;--blue-lt:#3b7de0;--blue-dim:#0d2e6b;
  --sky:#5b9cf6;--teal:#0ca5a5;--indigo:#818cf8;--text:#141c2e;
  --text-muted:#5c6680;--text-light:#8a96b0;--border:#c4ccdc;
  --border-dark:#1e2a40;--green:#2d7a4f;
}
body{background:var(--cream);color:var(--text);font-family:'Roboto',sans-serif;font-size:16px;line-height:1.6;overflow-x:hidden}
.container{max-width:1140px;margin:0 auto;padding:0 32px}
.tag{display:inline-flex;align-items:center;gap:8px;background:rgba(0,0,0,.07);border:1px solid rgba(0,0,0,.12);border-radius:100px;padding:5px 14px;font-family:'Roboto Mono',monospace;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted)}
.tag-blue{background:rgba(30,95,196,.1);border-color:rgba(30,95,196,.3);color:var(--blue)}

/* Nav */
nav{position:sticky;top:0;z-index:100;background:rgba(238,241,247,.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 32px}
.nav-inner{max-width:1140px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:64px}
.nav-brand{font-family:'Roboto',sans-serif;font-weight:700;font-size:1.15rem;letter-spacing:-.01em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:10px}
.nav-logo{width:38px;height:38px;border-radius:8px;object-fit:cover;flex-shrink:0}
.nav-links{display:flex;align-items:center;gap:32px}
.nav-links a{color:var(--text-muted);font-size:.9rem;font-weight:500;text-decoration:none;transition:color .2s}
.nav-links a:hover,.nav-links a.active{color:var(--blue)}
.nav-cta{background:var(--dark);color:#fff;font-weight:600;font-size:.85rem;padding:10px 22px;border-radius:6px;text-decoration:none;transition:all .2s;white-space:nowrap}
.nav-cta:hover{background:var(--blue)}
.nav-menu-btn{display:none;background:none;border:none;cursor:pointer;padding:6px;flex-direction:column;gap:5px}
.nav-menu-btn span{display:block;width:22px;height:2px;background:var(--text);border-radius:2px}

/* Flash */
.flash-bar{position:fixed;top:0;left:0;right:0;z-index:999;display:flex;flex-direction:column;gap:0;pointer-events:none}
.flash-msg{padding:14px 24px;font-size:.9rem;font-weight:600;text-align:center;pointer-events:all;animation:slideDown .3s ease}
.flash-msg.success{background:#1a3d2b;color:#6ee0a0;border-bottom:2px solid #2a9d5c}
.flash-msg.error{background:#3d1a1a;color:#f09090;border-bottom:2px solid #e05252}
.flash-close{float:right;background:none;border:none;color:inherit;cursor:pointer;font-size:1.1rem;opacity:.7;margin-left:16px}
@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}

/* Page header */
.routines-hero{background:var(--dark);padding:64px 0 48px;text-align:center}
.routines-hero h1{font-family:'Roboto',sans-serif;font-weight:900;font-size:clamp(2.4rem,5vw,3.6rem);letter-spacing:-.02em;line-height:.95;margin:16px 0 14px;background:linear-gradient(130deg,#fff 0%,#c8d8fc 55%,var(--sky) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.routines-hero p{font-size:1rem;color:#7a93c8;max-width:520px;margin:0 auto}

/* Main layout */
.routines-layout{display:grid;grid-template-columns:300px 1fr;gap:32px;padding:40px 0 80px;align-items:start}

/* Left panel */
.routines-sidebar{position:sticky;top:88px;background:#fff;border:1px solid var(--border);border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:20px}
.sidebar-section h4{font-family:'Roboto Mono',monospace;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px}
.sidebar-select{width:100%;background:var(--cream);border:1px solid var(--border);color:var(--text);padding:9px 12px;border-radius:7px;font-size:.88rem;font-family:'Roboto',sans-serif;outline:none;transition:border-color .15s;cursor:pointer}
.sidebar-select:focus{border-color:var(--blue)}
.filter-pills{display:flex;flex-wrap:wrap;gap:6px}
.filter-pill{display:inline-flex;align-items:center;padding:4px 10px;border-radius:100px;border:1px solid var(--border);background:var(--cream);font-size:.72rem;font-family:'Roboto Mono',monospace;letter-spacing:.06em;cursor:pointer;transition:all .15s;color:var(--text-muted);white-space:nowrap}
.filter-pill:hover{border-color:var(--blue);color:var(--blue)}
.filter-pill.active{background:rgba(30,95,196,.1);border-color:rgba(30,95,196,.35);color:var(--blue)}
.context-field{display:flex;flex-direction:column;gap:6px}
.context-field label{font-size:.78rem;color:var(--text-muted);font-weight:500}
.context-field input{background:var(--cream);border:1px solid var(--border);color:var(--text);padding:9px 12px;border-radius:7px;font-size:.88rem;font-family:'Roboto',sans-serif;outline:none;transition:border-color .15s}
.context-field input:focus{border-color:var(--blue)}
.selected-count{font-family:'Roboto Mono',monospace;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--blue);background:rgba(30,95,196,.08);border:1px solid rgba(30,95,196,.2);border-radius:6px;padding:6px 10px;text-align:center}
.btn-generate{width:100%;padding:13px;border-radius:8px;border:none;font-size:.95rem;font-weight:700;cursor:pointer;font-family:'Roboto',sans-serif;background:var(--blue);color:#fff;transition:all .2s}
.btn-generate:hover:not(:disabled){background:var(--blue-lt);transform:translateY(-1px)}
.btn-generate:disabled{opacity:.4;cursor:not-allowed;transform:none}

/* Story cards */
.routines-main{}
.category-group{margin-bottom:36px}
.category-label{font-family:'Roboto Mono',monospace;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);font-weight:600;padding-bottom:8px;border-bottom:1px solid var(--border);margin-bottom:14px}
.story-card{background:#fff;border:1px solid var(--border);border-radius:10px;padding:16px 18px;display:flex;gap:14px;align-items:flex-start;margin-bottom:10px;transition:border-color .2s,box-shadow .2s;cursor:pointer}
.story-card:hover{border-color:rgba(30,95,196,.35);box-shadow:0 2px 8px rgba(30,95,196,.08)}
.story-card.selected{border-color:var(--blue);background:rgba(30,95,196,.03);box-shadow:0 0 0 1px var(--blue)}
.story-card.hidden{display:none}
.story-check{width:18px;height:18px;border-radius:4px;border:2px solid var(--border);flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;transition:all .15s;background:#fff}
.story-card.selected .story-check{background:var(--blue);border-color:var(--blue)}
.story-check::after{content:'✓';color:#fff;font-size:.65rem;font-weight:700;opacity:0;transition:opacity .1s}
.story-card.selected .story-check::after{opacity:1}
.story-body{flex:1;min-width:0}
.story-title{font-weight:700;font-size:.95rem;color:var(--text);margin-bottom:6px;line-height:1.3}
.story-badges{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px}
.badge{font-family:'Roboto Mono',monospace;font-size:.6rem;letter-spacing:.07em;text-transform:uppercase;padding:2px 7px;border-radius:3px;border:1px solid}
.badge-role{background:rgba(12,165,165,.08);border-color:rgba(12,165,165,.25);color:var(--teal)}
.badge-trigger{background:rgba(30,95,196,.08);border-color:rgba(30,95,196,.2);color:var(--blue)}
.badge-freq{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.1);color:var(--text-muted)}
.story-text{font-size:.82rem;color:var(--text-muted);line-height:1.55}
.story-text em{font-style:normal;color:var(--text);font-weight:500}

/* Results area */
.routines-results{display:none;margin-top:32px;background:var(--dark);border-radius:14px;padding:36px;position:relative;overflow:hidden}
.routines-results.visible{display:block}
.routines-results::before{content:'';position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(30,95,196,.12),transparent 70%);pointer-events:none}
.results-tag{font-family:'Roboto Mono',monospace;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--teal);margin-bottom:14px}
.results-content{font-size:.92rem;color:#a8c0e8;line-height:1.75;white-space:pre-wrap;position:relative;z-index:1}
.results-content strong,.results-content b{color:#fff}
.results-loading{display:flex;align-items:center;gap:12px;color:#7a93c8;font-size:.9rem}
.spinner{width:18px;height:18px;border:2px solid rgba(91,156,246,.3);border-top-color:var(--sky);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}

/* No results */
.no-stories{padding:40px 0;text-align:center;color:var(--text-muted);font-size:.9rem}

/* Responsive */
@media(max-width:900px){
  .routines-layout{grid-template-columns:1fr}
  .routines-sidebar{position:relative;top:0}
}
@media(max-width:768px){
  .container{padding:0 20px}
  nav{padding:0 20px}
  .nav-links{display:none}
  .nav-menu-btn{display:flex}
}
</style>
</head>
<body>

{% with messages = get_flashed_messages(with_categories=true) %}
{% if messages %}
<div class="flash-bar">
  {% for cat, msg in messages %}
  <div class="flash-msg {{ cat }}">{{ msg }}<button class="flash-close" onclick="this.parentElement.remove()">✕</button></div>
  {% endfor %}
</div>
{% endif %}
{% endwith %}

<nav>
  <div class="nav-inner">
    <a class="nav-brand" href="/"><img src="/static/images/Logo_0.0.png" alt="St. Pete AI" class="nav-logo">ST. PETE AI</a>
    <div class="nav-links">
      <a href="/#mission">Mission</a>
      <a href="/#programs">Programs</a>
      <a href="/#membership">Membership</a>
      <a href="/#meetup">Meetup</a>
      <a href="/#lessons">Book a Lesson</a>
      <a href="/#claudes-brain">Resources</a>
      <a href="/routines" class="active">Routines</a>
      <a href="/match">Showcase</a>
      <a href="/#contact">Contact</a>
    </div>
    <a class="nav-cta" href="/#membership">Join</a>
    <button class="nav-menu-btn" id="menuBtn" aria-label="Menu"><span></span><span></span><span></span></button>
  </div>
</nav>

<div class="routines-hero">
  <div class="container">
    <span class="tag tag-blue">Claude Code Automation</span>
    <h1>150 Routines.<br>Your Workflow.</h1>
    <p>Browse automation routines by role, pick the ones that fit, and get a Claude-generated implementation plan tailored to your tools and goals.</p>
  </div>
</div>

<div class="container">
  <div class="routines-layout">

    <!-- Left panel -->
    <aside class="routines-sidebar">
      <div class="sidebar-section">
        <h4>Your Role</h4>
        <select class="sidebar-select" id="roleSelect">
          <option value="">All Roles</option>
          {% for r in roles %}<option value="{{ r }}" {% if active_role == r %}selected{% endif %}>{{ r }}</option>{% endfor %}
        </select>
      </div>
      <div class="sidebar-section">
        <h4>Category</h4>
        <div class="filter-pills" id="categoryPills">
          <span class="filter-pill {% if not active_category %}active{% endif %}" data-cat="">All</span>
          {% for cat in categories %}
          <span class="filter-pill {% if active_category == cat %}active{% endif %}" data-cat="{{ cat }}">{{ cat }}</span>
          {% endfor %}
        </div>
      </div>
      <div class="sidebar-section">
        <h4>Trigger Type</h4>
        <div class="filter-pills" id="triggerPills">
          <span class="filter-pill active" data-trigger="">All</span>
          {% for t in triggers %}
          <span class="filter-pill" data-trigger="{{ t }}">{{ t }}</span>
          {% endfor %}
        </div>
      </div>
      <div class="sidebar-section">
        <h4>Your Context</h4>
        <div class="context-field">
          <label for="toolsInput">Your tools</label>
          <input type="text" id="toolsInput" placeholder="GitHub, Slack, Jira…">
        </div>
        <div class="context-field" style="margin-top:10px">
          <label for="goalInput">Your goal</label>
          <input type="text" id="goalInput" placeholder="Reduce manual reporting time…">
        </div>
      </div>
      <div class="selected-count" id="selectedCount">0 routines selected</div>
      <button class="btn-generate" id="generateBtn" disabled onclick="generatePlan()">Generate My Plan</button>
    </aside>

    <!-- Right panel -->
    <div class="routines-main" id="routinesMain">
      {% set ns = namespace(current_cat=None) %}
      {% for routine in all_routines %}
        {% if routine.category != ns.current_cat %}
          {% if ns.current_cat is not none %}</div></div>{% endif %}
          {% set ns.current_cat = routine.category %}
          <div class="category-group" data-category="{{ routine.category }}">
          <div class="category-label">{{ routine.category }}</div>
        {% endif %}
        <div class="story-card"
             data-id="{{ routine.id }}"
             data-role="{{ routine.role }}"
             data-category="{{ routine.category }}"
             data-trigger="{{ routine.trigger }}"
             onclick="toggleCard(this)">
          <div class="story-check"></div>
          <div class="story-body">
            <div class="story-title">{{ routine.title }}</div>
            <div class="story-badges">
              <span class="badge badge-role">{{ routine.role }}</span>
              <span class="badge badge-trigger">{{ routine.trigger }}</span>
              <span class="badge badge-freq">{{ routine.frequency }}</span>
            </div>
            <div class="story-text">As a <em>{{ routine.as_a }}</em>, I want {{ routine.i_want }}, so that {{ routine.so_that }}.</div>
          </div>
        </div>
      {% endfor %}
      {% if ns.current_cat is not none %}</div></div>{% endif %}
      <div class="no-stories" id="noStories" style="display:none">No routines match your filters.</div>
    </div>

  </div>

  <!-- Results -->
  <div class="routines-results" id="resultsArea">
    <div class="results-tag">Your Personalized Plan</div>
    <div class="results-content" id="resultsContent"></div>
  </div>
</div>

<!-- Footer -->
<footer style="background:var(--dark);border-top:1px solid #1e2a40;padding:48px 32px 32px;margin-top:40px">
  <div style="max-width:1140px;margin:0 auto">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:48px;padding-bottom:40px;border-bottom:1px solid #1e2a40">
      <div>
        <a href="/" style="font-family:'Roboto',sans-serif;font-weight:700;font-size:1.15rem;color:#fff;display:flex;align-items:center;gap:10px;margin-bottom:14px;text-decoration:none"><img src="/static/images/Logo_0.0.png" alt="St. Pete AI" style="width:44px;height:44px;border-radius:10px;object-fit:cover">ST. PETE AI</a>
        <div style="font-size:.88rem;color:#7a93c8;line-height:1.6;max-width:240px">AI education, ethics, and community resources for Saint Petersburg, Florida.</div>
      </div>
      <div>
        <h5 style="font-family:'Roboto Mono',monospace;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:#5b9cf6;margin-bottom:16px;opacity:.7">Organization</h5>
        <a href="/#mission" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none;margin-bottom:9px">Mission</a>
        <a href="/#programs" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none;margin-bottom:9px">Programs</a>
        <a href="/#membership" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none;margin-bottom:9px">Membership</a>
        <a href="/#contact" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none">Contact</a>
      </div>
      <div>
        <h5 style="font-family:'Roboto Mono',monospace;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:#5b9cf6;margin-bottom:16px;opacity:.7">Resources</h5>
        <a href="/#claudes-brain" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none;margin-bottom:9px">Resources</a>
        <a href="/routines" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none;margin-bottom:9px">Routines</a>
        <a href="https://www.claudesbrain.com" target="_blank" rel="noopener" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none">claudesbrain.com</a>
      </div>
      <div>
        <h5 style="font-family:'Roboto Mono',monospace;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:#5b9cf6;margin-bottom:16px;opacity:.7">Connect</h5>
        <a href="mailto:info@stpeteai.org" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none;margin-bottom:9px">info@stpeteai.org</a>
        <a href="https://twitter.com" target="_blank" rel="noopener" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none;margin-bottom:9px">Twitter / X</a>
        <a href="https://linkedin.com" target="_blank" rel="noopener" style="display:block;color:#7a93c8;font-size:.88rem;text-decoration:none">LinkedIn</a>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:24px">
      <div style="font-size:.78rem;color:#4a5880">&copy; 2026 St. Pete AI &middot; Saint Petersburg, Florida</div>
      <div style="font-family:'Roboto Mono',monospace;font-size:.65rem;color:#4a5880;letter-spacing:.08em;text-transform:uppercase">501(c)(3) Nonprofit Organization</div>
    </div>
  </div>
</footer>

<script>
const selected = new Set();
let activeRole = '';
let activeCat  = '';
let activeTrig = '';

function updateCount() {
  const n = selected.size;
  document.getElementById('selectedCount').textContent = n + ' routine' + (n === 1 ? '' : 's') + ' selected';
  document.getElementById('generateBtn').disabled = n === 0;
}

function toggleCard(card) {
  const id = parseInt(card.dataset.id);
  if (selected.has(id)) {
    selected.delete(id);
    card.classList.remove('selected');
  } else {
    selected.add(id);
    card.classList.add('selected');
  }
  updateCount();
}

function applyFilters() {
  const cards = document.querySelectorAll('.story-card');
  const groups = document.querySelectorAll('.category-group');
  cards.forEach(card => {
    const roleMatch = !activeRole || card.dataset.role === activeRole;
    const catMatch  = !activeCat  || card.dataset.category === activeCat;
    const trigMatch = !activeTrig || card.dataset.trigger === activeTrig;
    card.classList.toggle('hidden', !(roleMatch && catMatch && trigMatch));
  });
  let anyVisible = false;
  groups.forEach(group => {
    const visible = [...group.querySelectorAll('.story-card')].some(c => !c.classList.contains('hidden'));
    group.style.display = visible ? '' : 'none';
    if (visible) anyVisible = true;
  });
  document.getElementById('noStories').style.display = anyVisible ? 'none' : 'block';
}

// Role select
document.getElementById('roleSelect').addEventListener('change', function() {
  activeRole = this.value;
  applyFilters();
});

// Category pills
document.getElementById('categoryPills').addEventListener('click', function(e) {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;
  this.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  activeCat = pill.dataset.cat;
  applyFilters();
});

// Trigger pills
document.getElementById('triggerPills').addEventListener('click', function(e) {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;
  this.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  activeTrig = pill.dataset.trigger;
  applyFilters();
});

// Mobile nav
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.querySelector('.nav-links');
menuBtn.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  Object.assign(navLinks.style, open ? {display:''} : {
    display:'flex',flexDirection:'column',position:'absolute',
    top:'64px',left:'0',right:'0',background:'var(--cream)',
    padding:'16px 20px 24px',borderBottom:'1px solid var(--border)',
    gap:'16px',zIndex:'99'
  });
});

async function generatePlan() {
  const resultsArea    = document.getElementById('resultsArea');
  const resultsContent = document.getElementById('resultsContent');
  resultsArea.classList.add('visible');
  resultsContent.innerHTML = '<div class="results-loading"><div class="spinner"></div>Claude is building your plan…</div>';
  resultsArea.scrollIntoView({behavior:'smooth', block:'start'});

  try {
    const resp = await fetch('/routines/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        selected_ids: [...selected],
        role:  document.getElementById('roleSelect').value,
        tools: document.getElementById('toolsInput').value,
        goal:  document.getElementById('goalInput').value,
      })
    });
    const data = await resp.json();
    if (data.error) {
      resultsContent.innerHTML = '<span style="color:#f09090">' + data.error + '</span>';
    } else {
      resultsContent.textContent = data.plan;
    }
  } catch (err) {
    resultsContent.innerHTML = '<span style="color:#f09090">Network error — please try again.</span>';
  }
}

// Initialise filters from server-side active values (for bookmarked URLs)
applyFilters();
</script>

</body>
</html>
```

- [ ] **Step 2: Verify the page renders locally**

```
python app.py
```

Open `http://localhost:5001/routines` in a browser. Confirm:
- All 150 story cards appear grouped by category
- Role select filters cards correctly
- Category pills filter cards correctly
- Trigger pills filter cards correctly
- Selecting cards increments the count badge
- "Generate My Plan" button becomes enabled after selecting ≥1 card

- [ ] **Step 3: Commit**

```
git add templates/routines.html
git commit -m "feat: add routines.html directory page with filter and generate UI"
```

---

## Task 4: Update `templates/index.html` — nav, footer, programs, sitemap

**Files:**
- Modify: `templates/index.html`
- Modify: `app.py` (sitemap route)

- [ ] **Step 1: Add "Routines" to the nav**

In `templates/index.html`, find the `.nav-links` block (around line 484) and add the Routines link between "Resources" and "Showcase":

```html
<!-- Before -->
<a href="#claudes-brain">Resources</a>
<a href="/match">Showcase</a>

<!-- After -->
<a href="#claudes-brain">Resources</a>
<a href="/routines">Routines</a>
<a href="/match">Showcase</a>
```

- [ ] **Step 2: Add "Routines" to the footer Resources column**

Find the footer Resources column (around line 943) and add the link:

```html
<!-- Before -->
<div class="footer-col">
  <h5>Resources</h5>
  <a href="#claudes-brain">Resources</a>
  <a href="https://www.claudesbrain.com" target="_blank" rel="noopener">claudesbrain.com</a>
</div>

<!-- After -->
<div class="footer-col">
  <h5>Resources</h5>
  <a href="#claudes-brain">Resources</a>
  <a href="/routines">Routines</a>
  <a href="https://www.claudesbrain.com" target="_blank" rel="noopener">claudesbrain.com</a>
</div>
```

- [ ] **Step 3: Add program item 06 in the `#programs` section**

Find the last `<div class="program-item">` block (program 05, around line 596) and add after its closing `</div>`:

```html
<div class="program-item">
  <span class="program-num">06</span>
  <div class="program-body">
    <h4>Claude Code Routines</h4>
    <p>Browse 150 AI automation routines by role and category. Select the ones that fit your workflow and get a Claude-generated implementation plan. <a href="/routines" style="color:var(--blue);text-decoration:none;font-weight:600">Browse Routines &rarr;</a></p>
  </div>
</div>
```

- [ ] **Step 4: Add `/routines` to the sitemap in `app.py`**

Find the `pages` list in the `sitemap()` route (around line 294) and add:

```python
('https://www.stpeteai.org/routines', '2026-06-08', 'weekly', '0.8'),
```

- [ ] **Step 5: Verify nav and footer links in browser**

```
python app.py
```

Open `http://localhost:5001/` and confirm:
- "Routines" appears in the nav between "Resources" and "Showcase"
- "Routines" appears in the footer Resources column
- Program item 06 appears in the Programs section
- `http://localhost:5001/sitemap.xml` includes the `/routines` entry

- [ ] **Step 6: Run the full test suite**

```
python -m pytest tests/ -v
```

Expected: All tests PASS.

- [ ] **Step 7: Commit**

```
git add templates/index.html app.py
git commit -m "feat: add Routines to nav, footer, programs section, and sitemap"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by |
|---|---|
| `routines_data.py` with all 150 stories | Task 1 |
| Each story has id, title, role, category, trigger, frequency, as_a, i_want, so_that | Task 1 step 3 |
| `GET /routines` with `?role=` and `?category=` filtering | Task 2 step 3 |
| `POST /routines/generate` validates selected_ids and role | Task 2 step 3 |
| Rate limit 5/hour on generate | Task 2 step 3 (`@limiter.limit`) |
| Returns `{"plan": ...}` or `{"error": ...}` | Task 2 step 3 |
| Claude prompt with WHY/BREAKDOWN/START HERE/CHECKLIST sections | Task 2 step 3 |
| Left panel: role select, category pills, trigger pills, tools, goal, count, button | Task 3 |
| Right panel: story cards grouped by category with checkbox, badges, text | Task 3 |
| Button disabled until ≥1 selected | Task 3 JS |
| Client-side filtering via vanilla JS | Task 3 JS |
| Checkbox state maintained across filter changes | Task 3 JS (Set-based selection, filters only toggle `.hidden`) |
| Results area hidden until plan generated | Task 3 |
| Loading spinner during fetch | Task 3 |
| Nav link (between Resources and Showcase) | Task 4 step 1 |
| Footer link (Resources column) | Task 4 step 2 |
| Programs section item 06 | Task 4 step 3 |
| Sitemap entry | Task 4 step 4 |
| No API key → error response | Task 2 step 3 |
| Claude exception → error response | Task 2 step 3 |
| Network error on fetch → inline error | Task 3 JS |

**Placeholder scan:** No TBDs, TODOs, or "implement later" in any step. All code is complete.

**Type consistency:** `ROUTINES`, `CATEGORIES`, `ROLES`, `TRIGGERS` defined in Task 1 and imported in Task 2. Template receives `all_routines`, `categories`, `roles`, `triggers`, `active_role`, `active_category` — all match what `routines()` passes in Task 2. JS `selected` Set uses `parseInt(card.dataset.id)` — matches integer IDs in the data. POST body `selected_ids` is an array of integers — matches `id_set = set(selected_ids)` in the route.
