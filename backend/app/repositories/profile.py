from app.repositories.base import BaseRepository
from app.models.profile import Profile
from app.schemas.portfolio import ProfileCreate, ProfileUpdate

class ProfileRepository(BaseRepository[Profile, ProfileCreate, ProfileUpdate]):
    pass

profile_repo = ProfileRepository(Profile)
