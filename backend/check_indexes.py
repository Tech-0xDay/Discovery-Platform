"""
Check current database indexes
"""
from app import create_app
from extensions import db
from sqlalchemy import inspect, text

app = create_app()
with app.app_context():
    inspector = inspect(db.engine)

    print("=== DATABASE TABLES ===")
    tables = inspector.get_table_names()
    for table in tables:
        print(f"- {table}")

    print("\n=== INDEXES ON 'projects' TABLE ===")
    try:
        indexes = inspector.get_indexes('projects')
        if indexes:
            for idx in indexes:
                print(f"Name: {idx['name']}")
                print(f"  Columns: {idx['column_names']}")
                print(f"  Unique: {idx['unique']}")
                print()
        else:
            print("No indexes found on 'projects' table")
    except Exception as e:
        print(f"Error checking projects indexes: {e}")

    print("\n=== INDEXES ON 'users' TABLE ===")
    try:
        indexes = inspector.get_indexes('users')
        if indexes:
            for idx in indexes:
                print(f"Name: {idx['name']}")
                print(f"  Columns: {idx['column_names']}")
                print(f"  Unique: {idx['unique']}")
                print()
        else:
            print("No indexes found on 'users' table")
    except Exception as e:
        print(f"Error checking users indexes: {e}")

    print("\n=== INDEXES ON 'votes' TABLE ===")
    try:
        indexes = inspector.get_indexes('votes')
        if indexes:
            for idx in indexes:
                print(f"Name: {idx['name']}")
                print(f"  Columns: {idx['column_names']}")
                print(f"  Unique: {idx['unique']}")
                print()
        else:
            print("No indexes found on 'votes' table")
    except Exception as e:
        print(f"Error checking votes indexes: {e}")

    print("\n=== COLUMNS IN 'projects' TABLE ===")
    columns = inspector.get_columns('projects')
    for col in columns:
        print(f"- {col['name']}: {col['type']}")
