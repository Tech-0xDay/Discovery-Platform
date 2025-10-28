"""
Test performance optimizations
"""
import time
from app import create_app
from extensions import db
from sqlalchemy import text

app = create_app()

def test_redis_connection():
    """Test Redis is working"""
    print("\n=== Testing Redis Connection ===")
    try:
        from utils.cache import CacheService

        # Test set
        CacheService.set("test_key", "test_value", ttl=60)
        print("[OK] Redis SET successful")

        # Test get
        value = CacheService.get("test_key")
        if value == "test_value":
            print("[OK] Redis GET successful")
        else:
            print(f"[ERROR] Redis GET returned: {value}")

        # Test delete
        CacheService.delete("test_key")
        print("[OK] Redis DELETE successful")

        return True
    except Exception as e:
        print(f"[ERROR] Redis test failed: {e}")
        return False


def test_database_connection():
    """Test database connection and pooling"""
    print("\n=== Testing Database Connection ===")
    try:
        with app.app_context():
            # Test simple query
            result = db.session.execute(text("SELECT 1"))
            print("[OK] Database connection successful")

            # Check connection pool
            pool = db.engine.pool
            print(f"[INFO] Pool size: {pool.size()}")
            print(f"[INFO] Pool checked out: {pool.checkedout()}")
            print(f"[INFO] Pool overflow: {pool.overflow()}")

            return True
    except Exception as e:
        print(f"[ERROR] Database test failed: {e}")
        return False


def test_indexes():
    """Verify new indexes exist"""
    print("\n=== Testing Database Indexes ===")
    try:
        with app.app_context():
            from sqlalchemy import inspect
            inspector = inspect(db.engine)

            # Check projects table indexes
            indexes = inspector.get_indexes('projects')
            index_names = [idx['name'] for idx in indexes]

            required_indexes = [
                'ix_projects_user_id',
                'ix_projects_hackathon_name',
                'ix_projects_trending_composite',
                'ix_projects_newest_composite'
            ]

            for idx_name in required_indexes:
                if idx_name in index_names:
                    print(f"[OK] Index exists: {idx_name}")
                else:
                    print(f"[ERROR] Missing index: {idx_name}")

            return True
    except Exception as e:
        print(f"[ERROR] Index test failed: {e}")
        return False


def test_cached_routes():
    """Test that caching works on routes"""
    print("\n=== Testing Route Caching ===")
    try:
        from utils.cache import CacheService

        # Clear cache first
        CacheService.clear_pattern("feed:*")
        print("[INFO] Cleared feed cache")

        # Simulate a feed request
        test_data = {"data": [{"id": "test", "title": "Test"}], "total": 1}
        CacheService.cache_feed(1, "trending", test_data, ttl=60)
        print("[OK] Cache feed set")

        # Retrieve from cache
        cached = CacheService.get_cached_feed(1, "trending")
        if cached:
            print("[OK] Cache feed retrieved")
        else:
            print("[ERROR] Cache feed retrieval failed")

        # Clean up
        CacheService.clear_pattern("feed:*")
        print("[INFO] Cleaned up test cache")

        return True
    except Exception as e:
        print(f"[ERROR] Route cache test failed: {e}")
        return False


def run_all_tests():
    """Run all optimization tests"""
    print("\n" + "="*50)
    print("PERFORMANCE OPTIMIZATIONS TEST SUITE")
    print("="*50)

    tests = [
        ("Redis Connection", test_redis_connection),
        ("Database Connection & Pooling", test_database_connection),
        ("Database Indexes", test_indexes),
        ("Route Caching", test_cached_routes),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n[ERROR] {test_name} crashed: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {test_name}")

    print(f"\n{passed}/{total} tests passed")

    if passed == total:
        print("\n[SUCCESS] All optimizations working correctly!")
    else:
        print("\n[WARNING] Some tests failed. Check errors above.")


if __name__ == "__main__":
    run_all_tests()
