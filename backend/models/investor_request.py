"""
Investor Request Model
"""
from datetime import datetime
from uuid import uuid4
from extensions import db


class InvestorRequest(db.Model):
    """Model for tracking investor account applications"""

    __tablename__ = 'investor_requests'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    plan_type = db.Column(db.String(20), nullable=False)  # free, professional, enterprise
    company_name = db.Column(db.String(200))
    linkedin_url = db.Column(db.Text)
    reason = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    reviewed_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    reviewed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='investor_request')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])

    __table_args__ = (
        db.CheckConstraint("plan_type IN ('free', 'professional', 'enterprise')"),
        db.CheckConstraint("status IN ('pending', 'approved', 'rejected')"),
        db.UniqueConstraint('user_id'),
    )

    def to_dict(self, include_user=True):
        """Convert to dictionary"""
        from models.user import User

        data = {
            'id': self.id,
            'user_id': self.user_id,
            'plan_type': self.plan_type,
            'company_name': self.company_name,
            'linkedin_url': self.linkedin_url,
            'reason': self.reason,
            'status': self.status,
            'reviewed_by': self.reviewed_by,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }

        if include_user:
            try:
                user = User.query.get(self.user_id)
                if user:
                    data['user'] = user.to_dict()
            except:
                data['user'] = None

        if self.reviewed_by:
            try:
                reviewer = User.query.get(self.reviewed_by)
                if reviewer:
                    data['reviewer'] = {
                        'id': reviewer.id,
                        'username': reviewer.username,
                    }
            except:
                data['reviewer'] = None

        return data

    def __repr__(self):
        return f'<InvestorRequest {self.id} - {self.status}>'
