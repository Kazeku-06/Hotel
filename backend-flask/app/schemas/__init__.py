from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from datetime import datetime, date

class UserSchema(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))
    phone = fields.Str(validate=validate.Length(max=20))
    role = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

# ... (schema lainnya tetap sama seperti sebelumnya)

# Initialize schemas
user_schema = UserSchema()
room_type_schema = RoomTypeSchema()
room_schema = RoomSchema()
booking_schema = BookingSchema()
rating_schema = RatingSchema()
facility_schema = FacilitySchema()