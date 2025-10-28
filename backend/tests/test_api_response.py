"""
Test what the API returns for a project
"""
import sys
import io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app import create_app
from extensions import db
from models.project import Project
import json

app = create_app()

with app.app_context():
    # Get the QWERTY project
    project = Project.query.filter_by(title='QWERTY').first()

    if project:
        print("Project found!")
        print(f"Database team_members: {project.team_members}")
        print("\nAPI Response (to_dict):")
        print(json.dumps(project.to_dict(include_creator=True), indent=2, default=str))
    else:
        print("Project not found")
