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
