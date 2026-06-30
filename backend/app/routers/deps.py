from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.exceptions import ErrorCodes, PortfolioException
from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.admin import AdminUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/admin/login")

def get_current_admin(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> AdminUser:
    payload = decode_access_token(token)
    # Refresh tokens must not be accepted as access tokens.
    if payload.get("type") == "refresh":
        raise PortfolioException("Invalid authentication credentials", ErrorCodes.AUTH_ERROR, 401)
    email = payload.get("sub")
    if email is None:
        raise PortfolioException("Invalid authentication credentials", ErrorCodes.AUTH_ERROR, 401)
        
    admin = db.query(AdminUser).filter(AdminUser.email == email, AdminUser.is_active == True).first()
    if admin is None:
        raise PortfolioException("Admin user not found or inactive", ErrorCodes.AUTH_ERROR, 401)
        
    return admin
