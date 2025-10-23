"""
Check if team_members are being saved
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
    # Get most recent projects
    projects = Project.query.order_by(Project.created_at.desc()).limit(5).all()

    print("Recent Projects:\n")
    for p in projects:
        print(f"Title: {p.title}")
        print(f"ID: {p.id}")
        print(f"Team Members: {p.team_members}")
        print(f"Created: {p.created_at}")
        print("---")
