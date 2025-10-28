"""
Test database performance and connection pooling
"""
import time
from app import create_app
from extensions import db
from sqlalchemy import text
from models.project import Project
from models.user import User

app = create_app()

def test_connection_pool():
    """Test if connection pooling is working"""
    print("\n=== Testing Connection Pool ===")
    with app.app_context():
        pool = db.engine.pool
        print(f"Pool Size: {pool.size()}")
        print(f"Pool Timeout: {pool._timeout}")
        print(f"Pool Overflow: {pool._overflow}")
        print(f"Pool Recycle: {db.engine.pool._recycle}")
        print(f"Pre-ping enabled: {db.engine.pool._pre_ping}")
        print(f"\nConnections checked out: {pool.checkedout()}")
        print(f"Connections in pool: {pool.size() - pool.checkedout()}")


def test_query_performance():
    """Test actual query speeds"""
    print("\n=== Testing Query Performance ===")

    with app.app_context():
        # Test 1: Simple count
        start = time.time()
        count = db.session.execute(text("SELECT COUNT(*) FROM projects")).scalar()
        duration = (time.time() - start) * 1000
        print(f"\n1. Simple COUNT query: {duration:.2f}ms ({count} projects)")

        # Test 2: Project list with creator (JOIN)
        start = time.time()
        from sqlalchemy.orm import joinedload
        projects = Project.query.options(joinedload(Project.creator)).limit(20).all()
        duration = (time.time() - start) * 1000
        print(f"2. Project list with JOIN (20 items): {duration:.2f}ms")

        # Test 3: Project list WITHOUT eager loading (N+1 problem)
        start = time.time()
        projects = Project.query.limit(20).all()
        # Access creator to trigger lazy load
        for p in projects:
            _ = p.creator.username if p.creator else None
        duration = (time.time() - start) * 1000
        print(f"3. Project list WITHOUT joinedload (N+1): {duration:.2f}ms")

        # Test 4: Sorted query with indexes
        start = time.time()
        projects = Project.query.filter_by(is_deleted=False)\
            .order_by(Project.proof_score.desc(), Project.created_at.desc())\
            .limit(20).all()
        duration = (time.time() - start) * 1000
        print(f"4. Sorted query (trending): {duration:.2f}ms")

        # Test 5: Complex query (leaderboard)
        start = time.time()
        from sqlalchemy import func
        result = db.session.query(
            User.id,
            User.username,
            func.sum(Project.proof_score).label('total_score'),
            func.count(Project.id).label('project_count')
        ).join(Project, User.id == Project.user_id).filter(
            Project.is_deleted == False
        ).group_by(User.id, User.username).order_by(
            func.sum(Project.proof_score).desc()
        ).limit(50).all()
        duration = (time.time() - start) * 1000
        print(f"5. Complex aggregation (leaderboard): {duration:.2f}ms")


def test_network_latency():
    """Test network latency to NeonDB"""
    print("\n=== Testing Network Latency ===")

    with app.app_context():
        # Ping test
        times = []
        for i in range(5):
            start = time.time()
            db.session.execute(text("SELECT 1"))
            duration = (time.time() - start) * 1000
            times.append(duration)
            print(f"Ping {i+1}: {duration:.2f}ms")

        avg = sum(times) / len(times)
        print(f"\nAverage latency: {avg:.2f}ms")

        if avg > 100:
            print("⚠️  HIGH LATENCY! Network to NeonDB is slow.")
            print("   This is normal for free-tier NeonDB (US servers)")
        elif avg > 50:
            print("⚠️  MODERATE LATENCY. Could be improved with:")
            print("   - Connection pooling (already configured)")
            print("   - Local caching (Redis)")
        else:
            print("✅ Low latency - network is good!")


def test_connection_reuse():
    """Test if connections are being reused"""
    print("\n=== Testing Connection Reuse ===")

    with app.app_context():
        pool = db.engine.pool

        print(f"Before queries - Checked out: {pool.checkedout()}")

        # Make 5 queries
        for i in range(5):
            db.session.execute(text("SELECT 1"))
            print(f"Query {i+1} - Checked out: {pool.checkedout()}")

        # Commit to release connection
        db.session.commit()
        print(f"After commit - Checked out: {pool.checkedout()}")

        if pool.checkedout() > 1:
            print("⚠️  PROBLEM: Connections not being released!")
        else:
            print("✅ Connection pooling working correctly")


def test_explain_analyze():
    """Check if queries are using indexes"""
    print("\n=== Testing Query Plans (EXPLAIN) ===")

    with app.app_context():
        # Test trending query
        query = """
        EXPLAIN ANALYZE
        SELECT * FROM projects
        WHERE is_deleted = false
        ORDER BY proof_score DESC, created_at DESC
        LIMIT 20
        """

        print("\nTrending query plan:")
        result = db.session.execute(text(query))
        for row in result:
            print(row[0])


def diagnose_slowness():
    """Main diagnostic function"""
    print("="*60)
    print("DATABASE PERFORMANCE DIAGNOSTICS")
    print("="*60)

    test_connection_pool()
    test_network_latency()
    test_connection_reuse()
    test_query_performance()

    # Skip EXPLAIN ANALYZE on NeonDB (might not work)
    try:
        test_explain_analyze()
    except Exception as e:
        print(f"\nEXPLAIN ANALYZE skipped: {e}")

    print("\n" + "="*60)
    print("DIAGNOSIS COMPLETE")
    print("="*60)


if __name__ == "__main__":
    diagnose_slowness()
