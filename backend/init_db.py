"""
Initialize database - Create all tables
Run this script to create all database tables
"""
from app import create_app
from extensions import db
from models.user import User
from models.project import Project, ProjectScreenshot
from models.vote import Vote
from models.comment import Comment
from models.badge import ValidationBadge
from models.intro import Intro

def init_database():
    """Initialize database with all tables"""
    print("🔧 Initializing database...")

    app = create_app()

    with app.app_context():
        print("📋 Creating tables...")

        # Drop all tables (optional - comment out if you don't want to drop)
        # db.drop_all()
        # print("🗑️  Dropped existing tables")

        # Create all tables
        db.create_all()
        print("✅ All tables created successfully!")

        # List all tables
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()

        print(f"\n📊 Database tables ({len(tables)}):")
        for table in tables:
            print(f"   ✓ {table}")

        print("\n🎉 Database initialization complete!")

if __name__ == '__main__':
    init_database()
