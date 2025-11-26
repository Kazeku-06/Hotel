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

class RoomTypeSchema(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str()
    created_at = fields.DateTime(dump_only=True)

class RoomPhotoSchema(Schema):
    id = fields.Str(dump_only=True)
    room_id = fields.Str(dump_only=True)
    photo_path = fields.Str(dump_only=True)
    photo_url = fields.Method("get_photo_url")
    
    def get_photo_url(self, obj):
        return f"/uploads/rooms/{obj.room_id}/{obj.photo_path}"

class FacilitySchema(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    icon = fields.Str()
    created_at = fields.DateTime(dump_only=True)

class RoomSchema(Schema):
    id = fields.Str(dump_only=True)
    room_type_id = fields.Str(required=True)
    room_number = fields.Str(required=True, validate=validate.Length(min=1, max=10))
    capacity = fields.Int(required=True, validate=validate.Range(min=1))
    price_no_breakfast = fields.Float(required=True, validate=validate.Range(min=0))
    price_with_breakfast = fields.Float(required=True, validate=validate.Range(min=0))
    status = fields.Str(validate=validate.OneOf(['available', 'unavailable']))
    description = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    
    room_type = fields.Nested(RoomTypeSchema, dump_only=True)
    photos = fields.Nested(RoomPhotoSchema, many=True, dump_only=True)
    facilities = fields.Nested(FacilitySchema, many=True, dump_only=True)

class BookingRoomSchema(Schema):
    id = fields.Str(dump_only=True)
    room_id = fields.Str(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1))
    breakfast_option = fields.Str(required=True, validate=validate.OneOf(['with', 'without']))
    price_per_night = fields.Float(dump_only=True)
    subtotal = fields.Float(dump_only=True)
    room = fields.Nested(RoomSchema, dump_only=True)

class BookingSchema(Schema):
    id = fields.Str(dump_only=True)
    user_id = fields.Str(dump_only=True)
    nik = fields.Str(required=True, validate=validate.Length(min=1, max=20))
    guest_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    phone = fields.Str(required=True, validate=validate.Length(min=1, max=20))
    check_in = fields.Date(required=True)
    check_out = fields.Date(required=True)
    total_guests = fields.Int(required=True, validate=validate.Range(min=1))
    payment_method = fields.Str(required=True, validate=validate.OneOf(['cash', 'credit_card', 'debit_card', 'transfer']))
    total_price = fields.Float(dump_only=True)
    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    
    booking_rooms = fields.Nested(BookingRoomSchema, many=True, required=True)
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        if data.get('check_in') and data.get('check_out'):
            if data['check_in'] < date.today():
                raise ValidationError('Check-in date cannot be in the past')
            if data['check_in'] >= data['check_out']:
                raise ValidationError('Check-out date must be after check-in date')

class RatingSchema(Schema):
    id = fields.Str(dump_only=True)
    user_id = fields.Str(dump_only=True)
    booking_id = fields.Str(required=True)
    star = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.Str(validate=validate.Length(max=500))
    created_at = fields.DateTime(dump_only=True)
    
    user = fields.Nested(UserSchema, dump_only=True)

# Initialize schemas
user_schema = UserSchema()
room_type_schema = RoomTypeSchema()
room_schema = RoomSchema()
booking_schema = BookingSchema()
rating_schema = RatingSchema()
facility_schema = FacilitySchema()