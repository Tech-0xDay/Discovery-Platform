"""
Badge Schemas
"""
from marshmallow import Schema, fields, validate


class BadgeSchema(Schema):
    """Badge response schema"""
    id = fields.Str()
    project_id = fields.Str()
    badge_type = fields.Str()
    points = fields.Int()
    rationale = fields.Str()
    is_featured = fields.Bool()
    created_at = fields.DateTime()
    validator = fields.Nested(lambda: UserSchema(partial=True))


class BadgeAwardSchema(Schema):
    """Badge award schema"""
    project_id = fields.Str(required=True)
    badge_type = fields.Str(required=True, validate=validate.OneOf(['silver', 'gold', 'platinum']))
    rationale = fields.Str()

    class Meta:
        fields = ('project_id', 'badge_type', 'rationale')


# Import after defining schemas
from .user import UserSchema
