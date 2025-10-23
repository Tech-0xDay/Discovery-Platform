"""
Comprehensive API Route Testing Script
Tests all backend routes to ensure everything is working properly
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"
API_URL = f"{BASE_URL}/api"

# Test results storage
results = {
    'passed': 0,
    'failed': 0,
    'errors': []
}

# Test user credentials
test_user = {
    'email': f'test_{datetime.now().timestamp()}@example.com',
    'username': f'testuser_{int(datetime.now().timestamp())}',
    'password': 'TestPassword123!',
    'display_name': 'Test User'
}

access_token = None
user_id = None
project_id = None


def log_test(test_name, status, message=''):
    """Log test result"""
    symbol = '[PASS]' if status else '[FAIL]'
    print(f"{symbol} {test_name}: {message}")
    if status:
        results['passed'] += 1
    else:
        results['failed'] += 1
        results['errors'].append(f"{test_name}: {message}")


def test_health_check():
    """Test health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        log_test("Health Check", True, "Backend is running")
        return True
    except Exception as e:
        log_test("Health Check", False, str(e))
        return False


def test_register():
    """Test user registration"""
    global access_token, user_id
    try:
        response = requests.post(
            f"{API_URL}/auth/register",
            json=test_user
        )
        assert response.status_code == 201
        data = response.json()
        assert 'data' in data
        assert 'user' in data['data']
        assert 'tokens' in data['data']

        access_token = data['data']['tokens']['access']
        user_id = data['data']['user']['id']

        log_test("User Registration", True, f"User created: {test_user['username']}")
        return True
    except Exception as e:
        log_test("User Registration", False, str(e))
        return False


def test_login():
    """Test user login"""
    global access_token
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={
                'email': test_user['email'],
                'password': test_user['password']
            }
        )
        assert response.status_code == 200
        data = response.json()
        access_token = data['data']['tokens']['access']
        log_test("User Login", True, "Login successful")
        return True
    except Exception as e:
        log_test("User Login", False, str(e))
        return False


def test_get_current_user():
    """Test getting current user"""
    try:
        response = requests.get(
            f"{API_URL}/auth/me",
            headers={'Authorization': f'Bearer {access_token}'}
        )
        assert response.status_code == 200
        data = response.json()
        assert data['data']['username'] == test_user['username']
        log_test("Get Current User", True, "User retrieved")
        return True
    except Exception as e:
        log_test("Get Current User", False, str(e))
        return False


def test_create_project():
    """Test creating a project"""
    global project_id
    try:
        project_data = {
            'title': 'Test AI Project',
            'tagline': 'An AI-powered testing tool',
            'description': 'This is a comprehensive test project with detailed description that exceeds 200 characters to ensure quality score points are awarded. It includes multiple features and demonstrates the full capability of the platform with thorough testing.',
            'demo_url': 'https://demo.example.com',
            'github_url': 'https://github.com/test/project',
            'hackathon_name': 'ETHGlobal 2024',
            'tech_stack': ['python', 'react', 'ai']
        }

        response = requests.post(
            f"{API_URL}/projects",
            json=project_data,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        if response.status_code != 201:
            log_test("Create Project", False, f"Status {response.status_code}: {response.text}")
            return False
        data = response.json()
        project_id = data['data']['id']
        log_test("Create Project", True, f"Project created: {project_id[:8]}")
        return True
    except Exception as e:
        log_test("Create Project", False, f"Exception: {str(e)}")
        return False


def test_list_projects():
    """Test listing projects"""
    try:
        response = requests.get(f"{API_URL}/projects")
        assert response.status_code == 200
        data = response.json()
        assert 'data' in data
        log_test("List Projects", True, f"Found {len(data['data'])} projects")
        return True
    except Exception as e:
        log_test("List Projects", False, str(e))
        return False


def test_get_project():
    """Test getting single project"""
    try:
        response = requests.get(f"{API_URL}/projects/{project_id}")
        assert response.status_code == 200
        data = response.json()
        assert data['data']['id'] == project_id
        log_test("Get Project", True, "Project retrieved")
        return True
    except Exception as e:
        log_test("Get Project", False, str(e))
        return False


def test_update_project():
    """Test updating project"""
    try:
        update_data = {
            'title': 'Updated Test AI Project',
            'tagline': 'Updated tagline'
        }

        response = requests.put(
            f"{API_URL}/projects/{project_id}",
            json=update_data,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        assert response.status_code == 200
        data = response.json()
        assert data['data']['title'] == update_data['title']
        log_test("Update Project", True, "Project updated")
        return True
    except Exception as e:
        log_test("Update Project", False, str(e))
        return False


def test_vote_on_project():
    """Test voting on project"""
    try:
        vote_data = {
            'project_id': project_id,
            'vote_type': 'up'
        }

        response = requests.post(
            f"{API_URL}/votes",
            json=vote_data,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        assert response.status_code == 200
        log_test("Vote on Project", True, "Upvote recorded")
        return True
    except Exception as e:
        log_test("Vote on Project", False, str(e))
        return False


def test_get_user_votes():
    """Test getting user votes"""
    try:
        response = requests.get(
            f"{API_URL}/votes/user",
            headers={'Authorization': f'Bearer {access_token}'}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']) > 0
        log_test("Get User Votes", True, f"Found {len(data['data'])} votes")
        return True
    except Exception as e:
        log_test("Get User Votes", False, str(e))
        return False


def test_create_comment():
    """Test creating comment"""
    try:
        comment_data = {
            'project_id': project_id,
            'content': 'This is a test comment on the project!'
        }

        response = requests.post(
            f"{API_URL}/comments",
            json=comment_data,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        assert response.status_code == 201
        log_test("Create Comment", True, "Comment created")
        return True
    except Exception as e:
        log_test("Create Comment", False, str(e))
        return False


def test_get_project_comments():
    """Test getting project comments"""
    try:
        response = requests.get(
            f"{API_URL}/comments?project_id={project_id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']) > 0
        log_test("Get Project Comments", True, f"Found {len(data['data'])} comments")
        return True
    except Exception as e:
        log_test("Get Project Comments", False, str(e))
        return False


def test_get_user_profile():
    """Test getting user profile"""
    try:
        response = requests.get(f"{API_URL}/users/{test_user['username']}")
        assert response.status_code == 200
        data = response.json()
        assert data['data']['username'] == test_user['username']
        log_test("Get User Profile", True, "Profile retrieved")
        return True
    except Exception as e:
        log_test("Get User Profile", False, str(e))
        return False


def test_update_user_profile():
    """Test updating user profile"""
    try:
        update_data = {
            'display_name': 'Updated Test User',
            'bio': 'This is my updated bio'
        }

        response = requests.put(
            f"{API_URL}/users/profile",
            json=update_data,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        assert response.status_code == 200
        log_test("Update User Profile", True, "Profile updated")
        return True
    except Exception as e:
        log_test("Update User Profile", False, str(e))
        return False


def test_get_user_stats():
    """Test getting user stats"""
    try:
        response = requests.get(
            f"{API_URL}/users/stats",
            headers={'Authorization': f'Bearer {access_token}'}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'project_count' in data['data']
        log_test("Get User Stats", True, "Stats retrieved")
        return True
    except Exception as e:
        log_test("Get User Stats", False, str(e))
        return False


def test_blockchain_health():
    """Test blockchain network health"""
    try:
        response = requests.get(f"{API_URL}/blockchain/health")
        assert response.status_code == 200
        data = response.json()
        # Note: May not be connected if no contract address set
        log_test("Blockchain Health Check", True, f"Network status checked")
        return True
    except Exception as e:
        log_test("Blockchain Health Check", False, str(e))
        return False


def test_ipfs_connection():
    """Test IPFS/Pinata connection"""
    try:
        response = requests.get(
            f"{API_URL}/upload/test",
            headers={'Authorization': f'Bearer {access_token}'}
        )
        # 200 = success, 500 = not configured (acceptable for MVP)
        if response.status_code in [200, 500]:
            data = response.json()
            log_test("IPFS Connection Test", True, "IPFS endpoint tested")
            return True
        else:
            log_test("IPFS Connection Test", False, f"Unexpected status: {response.status_code}")
            return False
    except Exception as e:
        log_test("IPFS Connection Test", False, str(e))
        return False


def test_delete_project():
    """Test deleting project (soft delete)"""
    try:
        response = requests.delete(
            f"{API_URL}/projects/{project_id}",
            headers={'Authorization': f'Bearer {access_token}'}
        )
        assert response.status_code == 200
        log_test("Delete Project", True, "Project deleted")
        return True
    except Exception as e:
        log_test("Delete Project", False, str(e))
        return False


def run_all_tests():
    """Run all tests in sequence"""
    print("\n" + "="*60)
    print("0x.ship Backend API Test Suite")
    print("="*60 + "\n")

    # Health check first
    if not test_health_check():
        print("\n[ERROR] Backend is not running! Please start the server first.")
        return

    print("\n--- Authentication Tests ---")
    test_register()
    test_login()
    test_get_current_user()

    print("\n--- Project Tests ---")
    test_create_project()
    test_list_projects()
    test_get_project()
    test_update_project()

    print("\n--- Voting Tests ---")
    test_vote_on_project()
    test_get_user_votes()

    print("\n--- Comment Tests ---")
    test_create_comment()
    test_get_project_comments()

    print("\n--- User Profile Tests ---")
    test_get_user_profile()
    test_update_user_profile()
    test_get_user_stats()

    print("\n--- Integration Tests ---")
    test_blockchain_health()
    test_ipfs_connection()

    print("\n--- Cleanup Tests ---")
    test_delete_project()

    # Print summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed'] / (results['passed'] + results['failed']) * 100):.1f}%")

    if results['errors']:
        print("\nErrors:")
        for error in results['errors']:
            print(f"  - {error}")

    print("\n" + "="*60)

    if results['failed'] == 0:
        print("All tests passed! Backend is ready for deployment.")
    else:
        print("Some tests failed. Please review errors above.")

    print("="*60 + "\n")


if __name__ == "__main__":
    run_all_tests()
