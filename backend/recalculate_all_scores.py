"""
Script to recalculate proof scores for all projects
This ensures all projects have accurate scores based on current data
"""
from extensions import db
from app import create_app
from models.project import Project
from utils.scores import ProofScoreCalculator

# Create app context
app = create_app()

with app.app_context():
    try:
        # Get all projects
        projects = Project.query.filter_by(is_deleted=False).all()
        print(f"Found {len(projects)} projects to recalculate scores for...")

        updated_count = 0
        for i, project in enumerate(projects, 1):
            try:
                # Recalculate all score components
                ProofScoreCalculator.update_project_scores(project)
                updated_count += 1

                if i % 100 == 0:
                    print(f"  Processed {i} projects...")

            except Exception as e:
                print(f"  Error processing project {project.id}: {e}")

        # Commit all changes
        db.session.commit()
        print(f"\nSuccessfully recalculated scores for {updated_count}/{len(projects)} projects!")

    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
