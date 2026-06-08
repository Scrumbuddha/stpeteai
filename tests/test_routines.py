import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from routines_data import ROUTINES, CATEGORIES, ROLES, TRIGGERS
from app import app, db


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
    # Role select should be pre-populated with 'Investor' selected
    assert b'selected' in resp.data
    assert b'Daily Portfolio Summary' in resp.data  # Always rendered (client-side filtering)


def test_routines_filter_by_category(client):
    resp = client.get('/routines?category=Documentation')
    assert resp.status_code == 200
    # Category pill should be pre-selected
    assert b'Documentation' in resp.data
    assert b'Daily Portfolio Summary' in resp.data  # Always rendered (client-side filtering)


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


def test_generate_rate_limited(client, monkeypatch):
    monkeypatch.delenv('ANTHROPIC_API_KEY', raising=False)
    payload = {'selected_ids': [1], 'role': 'Engineer', 'tools': '', 'goal': ''}
    for _ in range(5):
        client.post('/routines/generate', json=payload,
                    content_type='application/json')
    resp = client.post('/routines/generate', json=payload,
                       content_type='application/json')
    assert resp.status_code == 429
