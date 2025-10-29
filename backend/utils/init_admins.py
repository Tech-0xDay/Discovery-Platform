"""
Initialize default admin accounts
"""
from models.user import User
from extensions import db
from datetime import datetime


DEFAULT_ADMIN_EMAILS = [
    'sameerkatte@gmail.com',
    'saijadhav148@gmail.com',
    'sarankumar.0x@gmail.com'
]


def init_default_admins():
    """
    Initialize default admin accounts for specified emails.
    If account doesn't exist, it will be created on first OTP login.
    If account exists, grant admin access.
    """
    try:
        for email in DEFAULT_ADMIN_EMAILS:
            user = User.query.filter_by(email=email).first()

            if user:
                # User exists - ensure admin status
                if not user.is_admin:
                    user.is_admin = True
                    print(f"[Admin Init] Admin access granted to existing user: {email}")
                else:
                    print(f"[Admin Init] Admin already exists: {email}")
            else:
                # User doesn't exist - will be prompted to create account
                print(f"[Admin Init] Account not found for admin email: {email} - User needs to register first")

        db.session.commit()
        print("[Admin Init] Default admin initialization completed")

    except Exception as e:
        db.session.rollback()
        # Silently skip during migrations when schema doesn't match
        if "does not exist" in str(e) or "UndefinedColumn" in str(e):
            print("[Admin Init] Skipping admin initialization (database schema not yet migrated)")
        else:
            print(f"[Admin Init] Error initializing default admins: {str(e)}")


def check_and_promote_admin(email):
    """
    Check if an email should be auto-promoted to admin on registration/login.
    Returns True if user should be admin.
    """
    return email.lower().strip() in [e.lower() for e in DEFAULT_ADMIN_EMAILS]
