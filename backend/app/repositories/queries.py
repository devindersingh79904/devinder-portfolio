from app.repositories.base import BaseRepository
from app.models.queries import ContactLead, JDQuery
from app.schemas.portfolio import ContactLeadCreate

class ContactLeadRepository(BaseRepository[ContactLead, ContactLeadCreate, ContactLeadCreate]):
    pass

class JDQueryRepository(BaseRepository[JDQuery, dict, dict]):
    pass

contact_lead_repo = ContactLeadRepository(ContactLead)
jd_query_repo = JDQueryRepository(JDQuery)
