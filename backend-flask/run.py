from app import create_app

app = create_app()

@app.shell_context_processor
def make_shell_context():
    # Import inside function to avoid circular imports
    from app.models import User, Room, RoomType, Booking, Rating, Facility, RoomPhoto, FacilityRoom, BookingRoom
    return {
        'db': app.extensions['sqlalchemy'].db,
        'User': User,
        'Room': Room,
        'RoomType': RoomType,
        'Booking': Booking,
        'Rating': Rating,
        'Facility': Facility,
        'RoomPhoto': RoomPhoto,
        'FacilityRoom': FacilityRoom,
        'BookingRoom': BookingRoom
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)