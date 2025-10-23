"""
User Model
"""
from datetime import datetime
from uuid import uuid4
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db


class User(db.Model):
    """User model for authentication and profile"""

    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    email_verified = db.Column(db.Boolean, default=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # Wallet & Blockchain
    wallet_address = db.Column(db.String(42), unique=True, nullable=True)
    has_oxcert = db.Column(db.Boolean, default=False)

    # GitHub
    github_username = db.Column(db.String(255), nullable=True)
    github_connected = db.Column(db.Boolean, default=False)

    # Profile
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(100))
    avatar_url = db.Column(db.Text)
    bio = db.Column(db.Text)

    # Status & Roles
    karma = db.Column(db.Integer, default=0)
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    projects = db.relationship('Project', backref='creator', lazy='dynamic', foreign_keys='Project.user_id')
    votes = db.relationship('Vote', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    badges_awarded = db.relationship('ValidationBadge', backref='validator', lazy='dynamic',
                                      foreign_keys='ValidationBadge.validator_id')
    intros_sent = db.relationship('Intro', backref='requester', lazy='dynamic',
                                    foreign_keys='Intro.requester_id')
    intros_received = db.relationship('Intro', backref='recipient', lazy='dynamic',
                                        foreign_keys='Intro.recipient_id')

    def set_password(self, password: str):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Check if password matches hash"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_email=False):
        """Convert to dictionary"""
        data = {
            'id': self.id,
            'username': self.username,
            'display_name': self.display_name,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'karma': self.karma,
            'is_admin': self.is_admin,
            'email_verified': self.email_verified,
            'has_oxcert': self.has_oxcert,
            'github_connected': self.github_connected,
            'wallet_address': self.wallet_address[:6] + '...' + self.wallet_address[-4:] if self.wallet_address else None,
            'created_at': self.created_at.isoformat(),
        }
        if include_email:
            data['email'] = self.email
        return data

    def __repr__(self):
        return f'<User {self.username}>'
