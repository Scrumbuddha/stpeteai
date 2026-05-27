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
