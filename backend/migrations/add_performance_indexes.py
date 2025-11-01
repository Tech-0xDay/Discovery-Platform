"""
Migration: Add performance indexes for faster queries
Run this with: python migrations/add_performance_indexes.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from sqlalchemy import text

def migrate():
    """Add performance indexes to database"""
    app = create_app()

    with app.app_context():
        print("=== Adding Performance Indexes ===\n")

        with db.engine.connect() as conn:
            indexes = [
                ("idx_projects_trending", """
                    CREATE INDEX IF NOT EXISTS idx_projects_trending 
                    ON projects(proof_score DESC, created_at DESC) 
                    WHERE is_deleted=false
                """),
                ("idx_projects_created_at", """
                    CREATE INDEX IF NOT EXISTS idx_projects_created_at 
                    ON projects(created_at DESC) 
                    WHERE is_deleted=false
                """),
                ("idx_projects_proof_score", """
                    CREATE INDEX IF NOT EXISTS idx_projects_proof_score 
                    ON projects(proof_score DESC) 
                    WHERE is_deleted=false
                """),
                ("idx_projects_featured", """
                    CREATE INDEX IF NOT EXISTS idx_projects_featured 
                    ON projects(is_featured) 
                    WHERE is_deleted=false
                """),
                ("idx_projects_user_id", """
                    CREATE INDEX IF NOT EXISTS idx_projects_user_id 
                    ON projects(user_id, created_at DESC) 
                    WHERE is_deleted=false
                """),
                ("idx_users_karma", """
                    CREATE INDEX IF NOT EXISTS idx_users_karma 
                    ON users(karma DESC)
                """),
                ("idx_users_username", """
                    CREATE INDEX IF NOT EXISTS idx_users_username 
                    ON users(username)
                """),
                ("idx_users_email", """
                    CREATE INDEX IF NOT EXISTS idx_users_email 
                    ON users(email)
                """),
                ("idx_votes_project_user", """
                    CREATE INDEX IF NOT EXISTS idx_votes_project_user 
                    ON votes(project_id, user_id)
                """),
                ("idx_badges_project_id", """
                    CREATE INDEX IF NOT EXISTS idx_badges_project_id 
                    ON validation_badges(project_id)
                """),
                ("idx_comments_project_id", """
                    CREATE INDEX IF NOT EXISTS idx_comments_project_id 
                    ON comments(project_id, created_at DESC) 
                    WHERE is_deleted=false
                """),
            ]

            for idx_name, idx_sql in indexes:
                try:
                    conn.execute(text(idx_sql))
                    conn.commit()
                    print(f"   [SUCCESS] {idx_name}")
                except Exception as e:
                    print(f"   [INFO] {idx_name}: {str(e)[:50]}")

        print("\n=== Indexes Added! ===")

if __name__ == "__main__":
    migrate()
