"""
Search routes
"""
from flask import Blueprint, request
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from extensions import db
from models.project import Project
from models.user import User
from utils.decorators import optional_auth
from utils.helpers import success_response, error_response

search_bp = Blueprint('search', __name__)


@search_bp.route('', methods=['GET'])
@optional_auth
def search(user_id):
    """Search for projects and users"""
    try:
        query = request.args.get('q', '').strip()

        if not query:
            return error_response('Validation error', 'Search query is required', 400)

        if len(query) < 2:
            return error_response('Validation error', 'Search query must be at least 2 characters', 400)

        # Search projects - eager load creator to avoid N+1 queries
        search_pattern = f'%{query}%'
        projects = Project.query.options(joinedload(Project.creator)).filter(
            Project.is_deleted == False,
            or_(
                Project.title.ilike(search_pattern),
                Project.tagline.ilike(search_pattern),
                Project.description.ilike(search_pattern),
                Project.hackathon_name.ilike(search_pattern)
            )
        ).order_by(Project.created_at.desc()).limit(20).all()

        # Search users
        users = User.query.filter(
            User.is_active == True,
            or_(
                User.username.ilike(search_pattern),
                User.display_name.ilike(search_pattern),
                User.bio.ilike(search_pattern)
            )
        ).limit(10).all()

        # Format results
        project_results = [p.to_dict(include_creator=True, user_id=user_id) for p in projects]
        user_results = [u.to_dict(include_email=False) for u in users]

        return success_response({
            'projects': project_results,
            'users': user_results,
            'total': len(project_results) + len(user_results)
        }, 'Search completed', 200)

    except Exception as e:
        return error_response('Error', str(e), 500)
