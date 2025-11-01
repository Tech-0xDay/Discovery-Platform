"""
Verify database state for validator assignment system
This script checks the database directly without needing authentication
"""
import sys
import os
sys.path.insert(0, '.')

# Force UTF-8 encoding for Windows
if os.name == 'nt':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from app import app
from extensions import db
from models.user import User
from models.project import Project
from models.validator_permissions import ValidatorPermissions
from models.validator_assignment import ValidatorAssignment
from sqlalchemy import inspect, text

print("="*80)
print("DATABASE STATE VERIFICATION")
print("="*80)

with app.app_context():
    print("\n[1] Checking validator_permissions table schema...")
    try:
        inspector = inspect(db.engine)
        columns = inspector.get_columns('validator_permissions')
        column_names = [col['name'] for col in columns]

        print(f"✓ validator_permissions columns: {', '.join(column_names)}")

        if 'allowed_categories' in column_names:
            print("✓ allowed_categories column exists")
        else:
            print("✗ allowed_categories column MISSING")

    except Exception as e:
        print(f"✗ Error checking schema: {e}")

    print("\n[2] Checking projects table schema...")
    try:
        columns = inspector.get_columns('projects')
        column_names = [col['name'] for col in columns]

        if 'categories' in column_names:
            print("✓ categories column exists in projects table")
        else:
            print("✗ categories column MISSING from projects table")

    except Exception as e:
        print(f"✗ Error checking projects schema: {e}")

    print("\n[3] Checking validator_assignments table schema...")
    try:
        columns = inspector.get_columns('validator_assignments')
        column_names = [col['name'] for col in columns]

        if 'validated_by' in column_names:
            print("✓ validated_by column exists in validator_assignments table")
        else:
            print("✗ validated_by column MISSING from validator_assignments table")

    except Exception as e:
        print(f"✗ Error checking validator_assignments schema: {e}")

    print("\n[4] Checking validators and their permissions...")
    try:
        validators = User.query.filter_by(is_validator=True).all()
        print(f"✓ Found {len(validators)} validators\n")

        for validator in validators:
            print(f"  Validator: {validator.username} ({validator.email})")

            # Get permissions
            permissions = ValidatorPermissions.query.filter_by(validator_id=validator.id).first()

            if permissions:
                print(f"    - Permissions ID: {permissions.id}")
                print(f"    - can_validate_all: {permissions.can_validate_all}")
                print(f"    - allowed_categories: {permissions.allowed_categories}")
                print(f"    - allowed_badge_types: {permissions.allowed_badge_types}")
            else:
                print(f"    ! No permissions record found")

            # Get assignment counts
            total = ValidatorAssignment.query.filter_by(validator_id=validator.id).count()
            pending = ValidatorAssignment.query.filter_by(validator_id=validator.id, status='pending').count()
            in_review = ValidatorAssignment.query.filter_by(validator_id=validator.id, status='in_review').count()
            validated = ValidatorAssignment.query.filter_by(validator_id=validator.id, status='validated').count()

            print(f"    - Assignments: Total={total}, Pending={pending}, InReview={in_review}, Validated={validated}")
            print()

    except Exception as e:
        print(f"✗ Error checking validators: {e}")
        import traceback
        traceback.print_exc()

    print("\n[5] Checking projects with categories...")
    try:
        # Get all projects
        projects = Project.query.limit(10).all()
        print(f"✓ Found {len(projects)} recent projects\n")

        for project in projects[:5]:  # Show first 5
            print(f"  Project: {project.title}")
            print(f"    - ID: {project.id}")
            print(f"    - Categories: {project.categories}")

            # Check assignments for this project
            assignments = ValidatorAssignment.query.filter_by(project_id=project.id).all()
            print(f"    - Assignments: {len(assignments)}")

            for assignment in assignments:
                validator = User.query.get(assignment.validator_id)
                print(f"      * {validator.username} - Status: {assignment.status}")

            print()

    except Exception as e:
        print(f"✗ Error checking projects: {e}")
        import traceback
        traceback.print_exc()

    print("\n[6] Testing auto-assignment logic (dry run)...")
    try:
        from utils.auto_assignment import auto_assign_project_to_validators

        # Find a project with categories
        project = Project.query.filter(Project.categories.isnot(None)).first()

        if project and project.categories:
            print(f"✓ Testing with project: {project.title}")
            print(f"  Categories: {project.categories}")

            # Get validators
            validators = User.query.filter_by(is_validator=True).all()
            print(f"\n  Checking which validators should receive this project:")

            for validator in validators:
                permissions = ValidatorPermissions.query.filter_by(validator_id=validator.id).first()

                if not permissions:
                    print(f"    {validator.username}: NO PERMISSIONS")
                    continue

                should_assign = False

                if permissions.can_validate_all:
                    should_assign = True
                    reason = "can_validate_all = True"
                elif permissions.allowed_categories:
                    matching = [cat for cat in project.categories if cat in permissions.allowed_categories]
                    if matching:
                        should_assign = True
                        reason = f"matching categories: {matching}"
                    else:
                        reason = f"no matching categories (has {permissions.allowed_categories})"
                else:
                    reason = "no category preferences set"

                status = "✓ YES" if should_assign else "✗ NO"
                print(f"    {validator.username}: {status} - {reason}")

        else:
            print("! No projects with categories found")

    except Exception as e:
        print(f"✗ Error testing auto-assignment: {e}")
        import traceback
        traceback.print_exc()

print("\n" + "="*80)
print("VERIFICATION COMPLETE")
print("="*80)
