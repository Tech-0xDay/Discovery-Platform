"""
Project Schemas
"""
from marshmallow import Schema, fields, validate


class ProjectScreenshotSchema(Schema):
    """Project screenshot schema"""
    id = fields.Str()
    url = fields.Str()
    order_index = fields.Int()


class ProjectSchema(Schema):
    """Project response schema"""
    id = fields.Str()
    title = fields.Str()
    tagline = fields.Str()
    description = fields.Str()
    demo_url = fields.Str()
    github_url = fields.Str()
    hackathon_name = fields.Str()
    hackathon_date = fields.Date()
    tech_stack = fields.List(fields.Str())
    proof_score = fields.Int()
    verification_score = fields.Int()
    community_score = fields.Int()
    validation_score = fields.Int()
    quality_score = fields.Int()
    upvotes = fields.Int()
    downvotes = fields.Int()
    upvote_ratio = fields.Float()
    comment_count = fields.Int()
    view_count = fields.Int()
    share_count = fields.Int()
    is_featured = fields.Bool()
    is_deleted = fields.Bool()
    featured_at = fields.DateTime()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    user_id = fields.Str()
    creator = fields.Nested(lambda: UserSchema(partial=True))
    screenshots = fields.List(fields.Nested(ProjectScreenshotSchema))
    badge_count = fields.Int()


class ProjectCreateSchema(Schema):
    """Project creation schema"""
    title = fields.Str(required=True, validate=validate.Length(min=5, max=200))
    tagline = fields.Str(validate=validate.Length(max=300))
    description = fields.Str(required=True, validate=validate.Length(min=50))
    demo_url = fields.Url()
    github_url = fields.Url()
    hackathon_name = fields.Str(validate=validate.Length(max=200))
    hackathon_date = fields.Date()
    tech_stack = fields.List(fields.Str())
    screenshot_urls = fields.List(fields.Url())

    class Meta:
        fields = (
            'title', 'tagline', 'description', 'demo_url',
            'github_url', 'hackathon_name', 'hackathon_date',
            'tech_stack', 'screenshot_urls'
        )


class ProjectUpdateSchema(Schema):
    """Project update schema"""
    title = fields.Str(validate=validate.Length(min=5, max=200))
    tagline = fields.Str(validate=validate.Length(max=300))
    description = fields.Str(validate=validate.Length(min=50))
    demo_url = fields.Url()
    github_url = fields.Url()
    hackathon_name = fields.Str(validate=validate.Length(max=200))
    hackathon_date = fields.Date()
    tech_stack = fields.List(fields.Str())


# Import after defining ProjectSchema to avoid circular imports
from .user import UserSchema
