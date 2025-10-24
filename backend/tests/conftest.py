"""
Pytest configuration and fixtures
"""
import pytest
from app import create_app
from extensions import db
from models.user import User


@pytest.fixture
def app():
    """Create Flask app for testing"""
    app = create_app('testing')

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create Flask test client"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create Flask CLI runner"""
    return app.test_cli_runner()


@pytest.fixture
def auth_headers(client):
    """Create authenticated request headers"""
    # Register and login a test user
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'TestPassword123'
    })

    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'TestPassword123'
    })

    token = response.get_json()['data']['tokens']['access']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def admin_user(app):
    """Create admin user for testing"""
    with app.app_context():
        user = User(
            email='admin@test.com',
            username='admin_test',
            is_admin=True
        )
        user.set_password('AdminPassword123')
        db.session.add(user)
        db.session.commit()
        return user
