from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
