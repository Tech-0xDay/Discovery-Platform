"""
Project Model
"""
from datetime import datetime
from uuid import uuid4
from sqlalchemy.dialects.postgresql import ARRAY
from extensions import db


class Project(db.Model):
    """Project model"""

    __tablename__ = 'projects'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    # Basic Info
    title = db.Column(db.String(200), nullable=False, index=True)
    tagline = db.Column(db.String(300))
    description = db.Column(db.Text, nullable=False)

    # Links
    demo_url = db.Column(db.Text)
    github_url = db.Column(db.Text)

    # Hackathon Info
    hackathon_name = db.Column(db.String(200))
    hackathon_date = db.Column(db.Date)

    # Tech Stack (Array)
    tech_stack = db.Column(ARRAY(db.String(50)), default=[])

    # Team Members (Array of JSON objects with name and role)
    team_members = db.Column(db.JSON, default=[])

    # Proof Score Components
    proof_score = db.Column(db.Integer, default=0, index=True)
    verification_score = db.Column(db.Integer, default=0)
    community_score = db.Column(db.Integer, default=0)
    validation_score = db.Column(db.Integer, default=0)
    quality_score = db.Column(db.Integer, default=0)
    trending_score = db.Column(db.Float, default=0.0, index=True)  # Reddit-style hot score

    # Engagement Metrics
    upvotes = db.Column(db.Integer, default=0, index=True)
    downvotes = db.Column(db.Integer, default=0)
    comment_count = db.Column(db.Integer, default=0)
    view_count = db.Column(db.Integer, default=0)
    share_count = db.Column(db.Integer, default=0)

    # Status
    is_featured = db.Column(db.Boolean, default=False, index=True)
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    featured_at = db.Column(db.DateTime)
    featured_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    screenshots = db.relationship('ProjectScreenshot', backref='project', lazy='dynamic',
                                   cascade='all, delete-orphan')
    votes = db.relationship('Vote', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    badges = db.relationship('ValidationBadge', backref='project', lazy='dynamic',
                              cascade='all, delete-orphan')
    intros = db.relationship('Intro', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    event_associations = db.relationship('EventProject', backref='project', lazy='dynamic',
                                          cascade='all, delete-orphan')

    def calculate_proof_score(self):
        """Recalculate proof score from components"""
        self.proof_score = (
            self.verification_score +
            self.community_score +
            self.validation_score +
            self.quality_score
        )
        return self.proof_score

    def get_upvote_ratio(self):
        """Calculate upvote ratio as percentage"""
        total_votes = self.upvotes + self.downvotes
        if total_votes == 0:
            return 0
        return (self.upvotes / total_votes) * 100

    def to_dict(self, include_creator=False, user_id=None):
        """Convert to dictionary

        Args:
            include_creator: Include creator/author information
            user_id: If provided, includes user's vote on this project
        """
        data = {
            'id': self.id,
            'title': self.title,
            'tagline': self.tagline,
            'description': self.description,
            'demo_url': self.demo_url,
            'github_url': self.github_url,
            'hackathon_name': self.hackathon_name,
            'hackathon_date': self.hackathon_date.isoformat() if self.hackathon_date else None,
            'tech_stack': self.tech_stack or [],
            'team_members': self.team_members or [],
            'proof_score': self.proof_score,
            'verification_score': self.verification_score,
            'community_score': self.community_score,
            'validation_score': self.validation_score,
            'quality_score': self.quality_score,
            'trending_score': self.trending_score,
            'upvotes': self.upvotes,
            'downvotes': self.downvotes,
            'upvote_ratio': round(self.get_upvote_ratio(), 2),
            'comment_count': self.comment_count,
            'view_count': self.view_count,
            'share_count': self.share_count,
            'is_featured': self.is_featured,
            'is_deleted': self.is_deleted,
            'featured_at': self.featured_at.isoformat() if self.featured_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'user_id': self.user_id,
            'screenshots': [ss.to_dict() for ss in self.screenshots],
            'badge_count': self.badges.count(),
        }

        if include_creator:
            data['creator'] = self.creator.to_dict()

        # Include user's vote if user_id is provided
        if user_id:
            from models.vote import Vote
            vote = Vote.query.filter_by(user_id=user_id, project_id=self.id).first()
            data['user_vote'] = vote.vote_type if vote else None
        else:
            data['user_vote'] = None

        return data

    def __repr__(self):
        return f'<Project {self.title}>'


class ProjectScreenshot(db.Model):
    """Project screenshot model"""

    __tablename__ = 'project_screenshots'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    url = db.Column(db.Text, nullable=False)
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'url': self.url,
            'order_index': self.order_index,
        }

    def __repr__(self):
        return f'<Screenshot {self.id}>'
