"""
Tests for authentication routes
"""
import pytest


def test_register_user(client):
    """Test user registration"""
    response = client.post('/api/auth/register', json={
        'email': 'newuser@example.com',
        'username': 'newuser',
        'password': 'Password123',
        'display_name': 'New User'
    })

    assert response.status_code == 201
    data = response.get_json()['data']
    assert data['user']['email'] == 'newuser@example.com'
    assert 'access' in data['tokens']
    assert 'refresh' in data['tokens']


def test_register_duplicate_email(client):
    """Test registration with duplicate email"""
    client.post('/api/auth/register', json={
        'email': 'user@example.com',
        'username': 'user1',
        'password': 'Password123'
    })

    response = client.post('/api/auth/register', json={
        'email': 'user@example.com',
        'username': 'user2',
        'password': 'Password123'
    })

    assert response.status_code == 409


def test_login_user(client):
    """Test user login"""
    # Register first
    client.post('/api/auth/register', json={
        'email': 'user@example.com',
        'username': 'testuser',
        'password': 'Password123'
    })

    # Login
    response = client.post('/api/auth/login', json={
        'email': 'user@example.com',
        'password': 'Password123'
    })

    assert response.status_code == 200
    data = response.get_json()['data']
    assert data['user']['email'] == 'user@example.com'
    assert 'access' in data['tokens']


def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post('/api/auth/login', json={
        'email': 'nonexistent@example.com',
        'password': 'WrongPassword'
    })

    assert response.status_code == 401


def test_get_current_user(client, auth_headers):
    """Test getting current user info"""
    response = client.get('/api/auth/me', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()['data']
    assert 'username' in data
    assert 'email' in data
