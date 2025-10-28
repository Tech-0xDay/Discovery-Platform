"""
Test Suite for Event/Organizer Features

Tests all event routes and functionality including:
- Event creation, listing, and management
- Project associations with events
- Event subscriptions
- Filtering and sorting
"""

import sys
import json
from datetime import datetime, timedelta
from app import create_app
from extensions import db
from models.user import User
from models.project import Project
from models.event import Event, EventProject, EventSubscriber


class EventTestSuite:
    """Test suite for event features"""

    def __init__(self):
        # Use development config for testing since testing config uses SQLite
        # which doesn't support ARRAY types used in events/projects models
        self.app = create_app('development')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

        self.test_data = {}
        self.passed = 0
        self.failed = 0

    def setup(self):
        """Set up test database and test data"""
        print("Setting up test database...")
        # Clean up existing test data (instead of dropping all tables)
        EventSubscriber.query.filter(EventSubscriber.user_id.in_(
            db.session.query(User.id).filter(User.email.like('%@example.com'))
        )).delete(synchronize_session=False)
        EventProject.query.delete()
        Event.query.filter(Event.name.like('%Test%')).delete()
        Event.query.filter(Event.name.like('%ETH Global%')).delete()
        Project.query.filter(Project.title.like('%Test%')).delete()
        User.query.filter(User.email.like('%@example.com')).delete()
        db.session.commit()

        # Create test users
        organizer = User(
            email='organizer@example.com',
            username='organizer',
            display_name='Event Organizer'
        )
        organizer.set_password('password123')

        user2 = User(
            email='builder@example.com',
            username='builder',
            display_name='Builder User'
        )
        user2.set_password('password123')

        db.session.add_all([organizer, user2])
        db.session.commit()

        # Login organizer
        response = self.client.post('/api/auth/login', json={
            'email': 'organizer@example.com',
            'password': 'password123'
        })
        data = json.loads(response.data)
        # Handle different response structures
        if 'data' in data and 'tokens' in data['data'] and 'access' in data['data']['tokens']:
            self.test_data['organizer_token'] = data['data']['tokens']['access']
        elif 'data' in data and 'access_token' in data['data']:
            self.test_data['organizer_token'] = data['data']['access_token']
        elif 'access_token' in data:
            self.test_data['organizer_token'] = data['access_token']
        else:
            raise Exception(f"Unexpected login response: {data}")
        self.test_data['organizer_id'] = organizer.id

        # Login builder
        response = self.client.post('/api/auth/login', json={
            'email': 'builder@example.com',
            'password': 'password123'
        })
        data = json.loads(response.data)
        # Handle different response structures
        if 'data' in data and 'tokens' in data['data'] and 'access' in data['data']['tokens']:
            self.test_data['builder_token'] = data['data']['tokens']['access']
        elif 'data' in data and 'access_token' in data['data']:
            self.test_data['builder_token'] = data['data']['access_token']
        elif 'access_token' in data:
            self.test_data['builder_token'] = data['access_token']
        else:
            raise Exception(f"Unexpected login response: {data}")
        self.test_data['builder_id'] = user2.id

        # Create test project
        project = Project(
            user_id=user2.id,
            title='Test DeFi Project',
            description='A decentralized finance platform for testing',
            tech_stack=['solidity', 'react', 'hardhat']
        )
        db.session.add(project)
        db.session.commit()
        self.test_data['project_id'] = project.id

        print("[OK] Setup complete\n")

    def teardown(self):
        """Clean up test database"""
        # Clean up test data
        try:
            EventSubscriber.query.filter(EventSubscriber.user_id.in_(
                db.session.query(User.id).filter(User.email.like('%@example.com'))
            )).delete(synchronize_session=False)
            EventProject.query.delete()
            Event.query.filter(Event.name.like('%Test%')).delete()
            Event.query.filter(Event.name.like('%ETH Global%')).delete()
            Project.query.filter(Project.title.like('%Test%')).delete()
            Project.query.filter(Project.title.like('%Builder%')).delete()
            User.query.filter(User.email.like('%@example.com')).delete()
            db.session.commit()
        except:
            db.session.rollback()

        db.session.remove()
        self.app_context.pop()

    def run_test(self, name, test_func):
        """Run a single test and track results"""
        try:
            test_func()
            print(f"[PASS] {name}")
            self.passed += 1
            return True
        except AssertionError as e:
            print(f"[FAIL] {name}")
            print(f"  Error: {str(e)}")
            self.failed += 1
            return False
        except Exception as e:
            print(f"[ERROR] {name}")
            print(f"  Error: {str(e)}")
            self.failed += 1
            return False

    def print_summary(self):
        """Print test summary"""
        total = self.passed + self.failed
        success_rate = (self.passed / total * 100) if total > 0 else 0

        print()
        print("=" * 60)
        print("Test Summary")
        print("=" * 60)
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {success_rate:.1f}%")
        print("=" * 60)

    # ========== Event Tests ==========

    def test_create_event(self):
        """Test creating a new event"""
        response = self.client.post(
            '/api/events',
            headers={'Authorization': f'Bearer {self.test_data["organizer_token"]}'},
            json={
                'name': 'ETH Global Hackathon',
                'tagline': 'Build the future of Ethereum',
                'description': 'A global hackathon for Ethereum developers to build innovative dApps',
                'event_type': 'hackathon',
                'location': 'Virtual',
                'prize_pool': '$100,000',
                'categories': ['DeFi', 'NFT', 'Gaming']
            }
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['slug'] == 'eth-global-hackathon'
        self.test_data['event_id'] = data['data']['id']
        self.test_data['event_slug'] = data['data']['slug']

    def test_get_event(self):
        """Test retrieving a single event"""
        response = self.client.get(f'/api/events/{self.test_data["event_slug"]}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['name'] == 'ETH Global Hackathon'
        assert data['data']['organizer']['username'] == 'organizer'

    def test_list_events(self):
        """Test listing all events"""
        response = self.client.get('/api/events')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert len(data['data']['events']) >= 1

    def test_search_events(self):
        """Test searching events"""
        response = self.client.get('/api/events?search=ETH')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert len(data['data']['events']) >= 1
        assert 'ETH' in data['data']['events'][0]['name']

    def test_filter_events_by_type(self):
        """Test filtering events by type"""
        response = self.client.get('/api/events?event_type=hackathon')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        for event in data['data']['events']:
            assert event['event_type'] == 'hackathon'

    def test_filter_events_by_category(self):
        """Test filtering events by category"""
        response = self.client.get('/api/events?category=DeFi')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert len(data['data']['events']) >= 1

    def test_update_event(self):
        """Test updating an event"""
        response = self.client.put(
            f'/api/events/{self.test_data["event_slug"]}',
            headers={'Authorization': f'Bearer {self.test_data["organizer_token"]}'},
            json={
                'tagline': 'Updated tagline for the hackathon',
                'prize_pool': '$150,000'
            }
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['tagline'] == 'Updated tagline for the hackathon'
        assert data['data']['prize_pool'] == '$150,000'

    def test_update_event_unauthorized(self):
        """Test that non-organizers cannot update events"""
        response = self.client.put(
            f'/api/events/{self.test_data["event_slug"]}',
            headers={'Authorization': f'Bearer {self.test_data["builder_token"]}'},
            json={'tagline': 'Hacked tagline'}
        )
        assert response.status_code == 403

    # ========== Event Project Association Tests ==========

    def test_add_project_to_event(self):
        """Test adding a project to an event"""
        response = self.client.post(
            f'/api/events/{self.test_data["event_slug"]}/projects',
            headers={'Authorization': f'Bearer {self.test_data["organizer_token"]}'},
            json={
                'project_id': self.test_data['project_id'],
                'track': 'DeFi Track',
                'rank': 1,
                'prize': '1st Place',
                'is_winner': True
            }
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['data']['project_id'] == self.test_data['project_id']

    def test_get_event_projects(self):
        """Test retrieving projects for an event"""
        response = self.client.get(f'/api/events/{self.test_data["event_slug"]}/projects')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert len(data['data']['projects']) >= 1
        assert data['data']['projects'][0]['project']['title'] == 'Test DeFi Project'

    def test_get_event_projects_filtered_by_track(self):
        """Test filtering event projects by track"""
        response = self.client.get(f'/api/events/{self.test_data["event_slug"]}/projects?track=DeFi Track')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert len(data['data']['projects']) >= 1

    def test_get_event_projects_winners_only(self):
        """Test retrieving only winner projects"""
        response = self.client.get(f'/api/events/{self.test_data["event_slug"]}/projects?sort=winners')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert len(data['data']['projects']) >= 1
        assert data['data']['projects'][0]['is_winner'] == True

    def test_add_duplicate_project_to_event(self):
        """Test that duplicate projects cannot be added"""
        response = self.client.post(
            f'/api/events/{self.test_data["event_slug"]}/projects',
            headers={'Authorization': f'Bearer {self.test_data["organizer_token"]}'},
            json={'project_id': self.test_data['project_id']}
        )
        assert response.status_code == 400

    def test_project_owner_can_add_own_project(self):
        """Test that project owners can add their own projects to events"""
        # Create new project for builder
        project = Project(
            user_id=self.test_data['builder_id'],
            title='Builder Project',
            description='A project built by the builder user',
            tech_stack=['react', 'node']
        )
        db.session.add(project)
        db.session.commit()

        response = self.client.post(
            f'/api/events/{self.test_data["event_slug"]}/projects',
            headers={'Authorization': f'Bearer {self.test_data["builder_token"]}'},
            json={'project_id': project.id}
        )
        assert response.status_code == 201

    def test_remove_project_from_event(self):
        """Test removing a project from an event"""
        response = self.client.delete(
            f'/api/events/{self.test_data["event_slug"]}/projects/{self.test_data["project_id"]}',
            headers={'Authorization': f'Bearer {self.test_data["organizer_token"]}'}
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'

        # Re-add for other tests
        self.client.post(
            f'/api/events/{self.test_data["event_slug"]}/projects',
            headers={'Authorization': f'Bearer {self.test_data["organizer_token"]}'},
            json={'project_id': self.test_data['project_id']}
        )

    # ========== Event Subscription Tests ==========

    def test_subscribe_to_event(self):
        """Test subscribing to an event"""
        response = self.client.post(
            f'/api/events/{self.test_data["event_slug"]}/subscribe',
            headers={'Authorization': f'Bearer {self.test_data["builder_token"]}'}
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'

    def test_check_subscription_status(self):
        """Test that subscription status is returned"""
        response = self.client.get(
            f'/api/events/{self.test_data["event_slug"]}',
            headers={'Authorization': f'Bearer {self.test_data["builder_token"]}'}
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['data']['is_subscribed'] == True

    def test_subscribe_twice_fails(self):
        """Test that subscribing twice fails"""
        response = self.client.post(
            f'/api/events/{self.test_data["event_slug"]}/subscribe',
            headers={'Authorization': f'Bearer {self.test_data["builder_token"]}'}
        )
        assert response.status_code == 400

    def test_unsubscribe_from_event(self):
        """Test unsubscribing from an event"""
        response = self.client.delete(
            f'/api/events/{self.test_data["event_slug"]}/subscribe',
            headers={'Authorization': f'Bearer {self.test_data["builder_token"]}'}
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'

    def test_unsubscribe_when_not_subscribed_fails(self):
        """Test that unsubscribing when not subscribed fails"""
        response = self.client.delete(
            f'/api/events/{self.test_data["event_slug"]}/subscribe',
            headers={'Authorization': f'Bearer {self.test_data["builder_token"]}'}
        )
        assert response.status_code == 400

    # ========== Additional Feature Tests ==========

    def test_get_featured_events(self):
        """Test retrieving featured events"""
        # Mark event as featured
        event = Event.query.get(self.test_data['event_id'])
        event.is_featured = True
        db.session.commit()

        response = self.client.get('/api/events/featured')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert len(data['data']['events']) >= 1

    def test_get_event_types(self):
        """Test retrieving available event types"""
        response = self.client.get('/api/events/types')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'event_types' in data['data']
        assert 'hackathon' in data['data']['event_types']

    def test_event_view_count_increments(self):
        """Test that view count increments on each view"""
        initial_response = self.client.get(f'/api/events/{self.test_data["event_slug"]}')
        initial_data = json.loads(initial_response.data)
        initial_views = initial_data['data']['view_count']

        self.client.get(f'/api/events/{self.test_data["event_slug"]}')
        final_response = self.client.get(f'/api/events/{self.test_data["event_slug"]}')
        final_data = json.loads(final_response.data)
        final_views = final_data['data']['view_count']

        assert final_views > initial_views

    def test_event_project_count_updates(self):
        """Test that project count updates correctly"""
        event = Event.query.get(self.test_data['event_id'])
        assert event.project_count >= 1

    # ========== Run All Tests ==========

    def run_all(self):
        """Run all tests"""
        print("=" * 60)
        print("Event/Organizer Features Test Suite")
        print("=" * 60)
        print()

        self.setup()

        print("--- Event Management Tests ---")
        self.run_test("Create Event", self.test_create_event)
        self.run_test("Get Event", self.test_get_event)
        self.run_test("List Events", self.test_list_events)
        self.run_test("Search Events", self.test_search_events)
        self.run_test("Filter Events by Type", self.test_filter_events_by_type)
        self.run_test("Filter Events by Category", self.test_filter_events_by_category)
        self.run_test("Update Event", self.test_update_event)
        self.run_test("Update Event Unauthorized", self.test_update_event_unauthorized)
        print()

        print("--- Event-Project Association Tests ---")
        self.run_test("Add Project to Event", self.test_add_project_to_event)
        self.run_test("Get Event Projects", self.test_get_event_projects)
        self.run_test("Filter Event Projects by Track", self.test_get_event_projects_filtered_by_track)
        self.run_test("Get Winners Only", self.test_get_event_projects_winners_only)
        self.run_test("Prevent Duplicate Projects", self.test_add_duplicate_project_to_event)
        self.run_test("Project Owner Can Add Own Project", self.test_project_owner_can_add_own_project)
        self.run_test("Remove Project from Event", self.test_remove_project_from_event)
        print()

        print("--- Event Subscription Tests ---")
        self.run_test("Subscribe to Event", self.test_subscribe_to_event)
        self.run_test("Check Subscription Status", self.test_check_subscription_status)
        self.run_test("Prevent Duplicate Subscription", self.test_subscribe_twice_fails)
        self.run_test("Unsubscribe from Event", self.test_unsubscribe_from_event)
        self.run_test("Prevent Unsubscribe When Not Subscribed", self.test_unsubscribe_when_not_subscribed_fails)
        print()

        print("--- Additional Features Tests ---")
        self.run_test("Get Featured Events", self.test_get_featured_events)
        self.run_test("Get Event Types", self.test_get_event_types)
        self.run_test("View Count Increments", self.test_event_view_count_increments)
        self.run_test("Project Count Updates", self.test_event_project_count_updates)
        print()

        self.print_summary()
        self.teardown()

        return self.failed == 0


if __name__ == '__main__':
    suite = EventTestSuite()
    success = suite.run_all()
    sys.exit(0 if success else 1)
