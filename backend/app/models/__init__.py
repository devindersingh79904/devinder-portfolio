from app.db.base import Base  # noqa
from app.models.admin import AdminUser  # noqa
from app.models.profile import Profile  # noqa
from app.models.portfolio import Project, Experience, Education, Certification, Skill  # noqa
from app.models.queries import JDQuery, ContactLead  # noqa
from app.models.analytics import AnalyticsEvent  # noqa
from app.models.settings import SiteSettings  # noqa

# Limit `from app.models import *` to the model classes so submodules (e.g. the
# `settings` module) don't shadow same-named imports like the config `settings`.
__all__ = [
    "Base",
    "AdminUser",
    "Profile",
    "Project",
    "Experience",
    "Education",
    "Certification",
    "Skill",
    "JDQuery",
    "ContactLead",
    "AnalyticsEvent",
    "SiteSettings",
]
