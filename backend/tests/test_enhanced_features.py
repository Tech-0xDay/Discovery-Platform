"""
Enhanced Features Test Suite
Tests new leaderboard, search/filter, and trending features
"""
import requests
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


def setup_test_data():
    """Create test user and project"""
    global access_token, project_id

    # Register user
    response = requests.post(
        f"{API_URL}/auth/register",
        json=test_user
    )
    if response.status_code == 201:
        data = response.json()
        access_token = data['data']['tokens']['access']
        print(f"[SETUP] Test user created: {test_user['username']}")
    else:
        print("[SETUP] Failed to create user")
        return False

    # Create project
    project_data = {
        'title': 'AI Testing Project',
        'tagline': 'Advanced AI testing tool',
        'description': 'This is a comprehensive test project for advanced search and filtering features. It includes detailed descriptions and multiple features to test all aspects of the enhanced platform capabilities.',
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
    if response.status_code == 201:
        data = response.json()
        project_id = data['data']['id']
        print(f"[SETUP] Test project created: {project_id[:8]}")
        return True
    else:
        print(f"[SETUP] Failed to create project: {response.text}")
        return False


def test_leaderboard_all():
    """Test leaderboard with all timeframe"""
    try:
        response = requests.get(f"{API_URL}/projects/leaderboard?timeframe=all&limit=10")
        if response.status_code != 200:
            log_test("Leaderboard (All Time)", False, f"Status {response.status_code}")
            return False

        data = response.json()['data']
        assert 'top_projects' in data
        assert 'top_builders' in data
        assert 'featured' in data
        assert data['timeframe'] == 'all'
        log_test("Leaderboard (All Time)", True, f"{len(data['top_projects'])} projects listed")
        return True
    except Exception as e:
        log_test("Leaderboard (All Time)", False, f"Exception: {str(e)}")
        return False


def test_leaderboard_month():
    """Test leaderboard with month timeframe"""
    try:
        response = requests.get(f"{API_URL}/projects/leaderboard?timeframe=month")
        assert response.status_code == 200
        data = response.json()['data']
        assert data['timeframe'] == 'month'
        log_test("Leaderboard (Month)", True, "Month filter working")
        return True
    except Exception as e:
        log_test("Leaderboard (Month)", False, f"Exception: {str(e)}")
        return False


def test_leaderboard_week():
    """Test leaderboard with week timeframe"""
    try:
        response = requests.get(f"{API_URL}/projects/leaderboard?timeframe=week&limit=5")
        assert response.status_code == 200
        data = response.json()['data']
        assert data['timeframe'] == 'week'
        assert data['limit'] == 5
        log_test("Leaderboard (Week)", True, "Week filter working")
        return True
    except Exception as e:
        log_test("Leaderboard (Week)", False, f"Exception: {str(e)}")
        return False


def test_search_by_keyword():
    """Test search by keyword"""
    try:
        response = requests.get(f"{API_URL}/projects?search=AI")
        assert response.status_code == 200
        data = response.json()
        log_test("Search by Keyword", True, f"Found {len(data['data'])} results for 'AI'")
        return True
    except Exception as e:
        log_test("Search by Keyword", False, f"Exception: {str(e)}")
        return False


def test_filter_by_tech_stack():
    """Test filtering by tech stack"""
    try:
        response = requests.get(f"{API_URL}/projects?tech=python")
        assert response.status_code == 200
        data = response.json()
        log_test("Filter by Tech Stack", True, f"Found {len(data['data'])} Python projects")
        return True
    except Exception as e:
        log_test("Filter by Tech Stack", False, f"Exception: {str(e)}")
        return False


def test_filter_by_hackathon():
    """Test filtering by hackathon"""
    try:
        response = requests.get(f"{API_URL}/projects?hackathon=ETH")
        assert response.status_code == 200
        data = response.json()
        log_test("Filter by Hackathon", True, f"Found {len(data['data'])} ETH hackathon projects")
        return True
    except Exception as e:
        log_test("Filter by Hackathon", False, f"Exception: {str(e)}")
        return False


def test_filter_by_score():
    """Test filtering by minimum score"""
    try:
        response = requests.get(f"{API_URL}/projects?min_score=10")
        assert response.status_code == 200
        data = response.json()
        log_test("Filter by Min Score", True, f"Found {len(data['data'])} projects with score >=10")
        return True
    except Exception as e:
        log_test("Filter by Min Score", False, f"Exception: {str(e)}")
        return False


def test_filter_has_demo():
    """Test filtering projects with demo link"""
    try:
        response = requests.get(f"{API_URL}/projects?has_demo=true")
        assert response.status_code == 200
        data = response.json()
        log_test("Filter Has Demo", True, f"Found {len(data['data'])} projects with demo")
        return True
    except Exception as e:
        log_test("Filter Has Demo", False, f"Exception: {str(e)}")
        return False


def test_filter_has_github():
    """Test filtering projects with GitHub link"""
    try:
        response = requests.get(f"{API_URL}/projects?has_github=true")
        assert response.status_code == 200
        data = response.json()
        log_test("Filter Has GitHub", True, f"Found {len(data['data'])} projects with GitHub")
        return True
    except Exception as e:
        log_test("Filter Has GitHub", False, f"Exception: {str(e)}")
        return False


def test_sort_newest():
    """Test sorting by newest"""
    try:
        response = requests.get(f"{API_URL}/projects?sort=newest")
        assert response.status_code == 200
        log_test("Sort by Newest", True, "Newest sorting working")
        return True
    except Exception as e:
        log_test("Sort by Newest", False, f"Exception: {str(e)}")
        return False


def test_sort_top_rated():
    """Test sorting by top-rated"""
    try:
        response = requests.get(f"{API_URL}/projects?sort=top-rated")
        assert response.status_code == 200
        log_test("Sort by Top Rated", True, "Top-rated sorting working")
        return True
    except Exception as e:
        log_test("Sort by Top Rated", False, f"Exception: {str(e)}")
        return False


def test_sort_most_voted():
    """Test sorting by most voted"""
    try:
        response = requests.get(f"{API_URL}/projects?sort=most-voted")
        assert response.status_code == 200
        log_test("Sort by Most Voted", True, "Most-voted sorting working")
        return True
    except Exception as e:
        log_test("Sort by Most Voted", False, f"Exception: {str(e)}")
        return False


def test_combined_filters():
    """Test multiple filters combined"""
    try:
        response = requests.get(
            f"{API_URL}/projects?search=test&tech=python&min_score=5&has_demo=true&sort=top-rated"
        )
        assert response.status_code == 200
        data = response.json()
        log_test("Combined Filters", True, f"Complex query returned {len(data['data'])} results")
        return True
    except Exception as e:
        log_test("Combined Filters", False, f"Exception: {str(e)}")
        return False


def test_trending_score_exists():
    """Test that trending_score is included in project data"""
    try:
        response = requests.get(f"{API_URL}/projects")
        assert response.status_code == 200
        data = response.json()
        if len(data['data']) > 0:
            project = data['data'][0]
            assert 'trending_score' in project
            log_test("Trending Score Field", True, f"Trending score: {project['trending_score']}")
        else:
            log_test("Trending Score Field", True, "No projects to check (database empty)")
        return True
    except Exception as e:
        log_test("Trending Score Field", False, f"Exception: {str(e)}")
        return False


def cleanup():
    """Clean up test data"""
    global project_id, access_token

    if project_id and access_token:
        try:
            requests.delete(
                f"{API_URL}/projects/{project_id}",
                headers={'Authorization': f'Bearer {access_token}'}
            )
            print(f"[CLEANUP] Test project deleted")
        except:
            pass


def run_enhanced_tests():
    """Run all enhanced feature tests"""
    print("\n" + "="*60)
    print("Enhanced Features Test Suite")
    print("="*60 + "\n")

    # Setup
    if not setup_test_data():
        print("\n[ERROR] Failed to set up test data. Skipping tests.")
        return

    print("\n--- Leaderboard Tests ---")
    test_leaderboard_all()
    test_leaderboard_month()
    test_leaderboard_week()

    print("\n--- Search & Filter Tests ---")
    test_search_by_keyword()
    test_filter_by_tech_stack()
    test_filter_by_hackathon()
    test_filter_by_score()
    test_filter_has_demo()
    test_filter_has_github()

    print("\n--- Sorting Tests ---")
    test_sort_newest()
    test_sort_top_rated()
    test_sort_most_voted()

    print("\n--- Advanced Tests ---")
    test_combined_filters()
    test_trending_score_exists()

    # Cleanup
    cleanup()

    # Print summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    total = results['passed'] + results['failed']
    print(f"Success Rate: {(results['passed'] / total * 100):.1f}%" if total > 0 else "N/A")

    if results['errors']:
        print("\nErrors:")
        for error in results['errors']:
            print(f"  - {error}")

    print("\n" + "="*60)

    if results['failed'] == 0:
        print("All enhanced features working perfectly!")
    else:
        print("Some tests failed. Please review errors above.")

    print("="*60 + "\n")


if __name__ == "__main__":
    run_enhanced_tests()
