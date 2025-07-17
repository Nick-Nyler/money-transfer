from models.user import User
from schemas.user_schema import user_schema

def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")
    return user_schema.dump(user)
