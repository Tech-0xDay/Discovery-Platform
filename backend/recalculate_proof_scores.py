"""
Migration script to recalculate proof scores for all projects
This ensures all projects have proper verification, community, validation, and quality scores
"""
from extensions import db
from app import create_app
from models.project import Project
from utils.scores import ProofScoreCalculator

# Create app context
app = create_app()

with app.app_context():
    try:
        # Get all non-deleted projects
        projects = Project.query.filter_by(is_deleted=False).all()
        total_projects = len(projects)

        print(f"Found {total_projects} projects to update...")

        for idx, project in enumerate(projects, 1):
            # Update all score components
            ProofScoreCalculator.update_project_scores(project)

            if idx % 10 == 0:
                print(f"Progress: {idx}/{total_projects} projects processed...")

        # Commit all changes
        db.session.commit()
        print(f"\n✅ Successfully recalculated scores for all {total_projects} projects!")
        print("Score breakdown:")
        print("- Verification Score: User email/GitHub/OxCert verification")
        print("- Community Score: Upvote ratio + comments")
        print("- Validation Score: Badges from validators")
        print("- Quality Score: Demo URL, GitHub link, screenshots, description")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
