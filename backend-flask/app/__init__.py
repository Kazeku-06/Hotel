from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from app.models import User  # IMPORT DI DALAM FUNGSI
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def member_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from app.models import User  # IMPORT DI DALAM FUNGSI
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'member':
            return jsonify({'message': 'Member access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function