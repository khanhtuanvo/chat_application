from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy import Boolean
from ..models.user import UserRole 
from datetime import datetime


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-z0-9_]+$", examples=["john"])
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

    @staticmethod
    def is_special_character(c):
        if c in r"!@#$%^&*()_+-=[]{}|;:'\",.<>/?\\":
            return True
        return False

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must be at least one uppercase character")
        if not any(c.islower() for c in v):
            raise ValueError("Password must be at least one lowercase character")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must be at least one digit")
        if not any(cls.is_special_character(c) for c in v):
            raise ValueError("Password must be at least one special character")
        return v 


class UserLogin(BaseModel):
    email: EmailStr
    password: str 

class UserResponse(UserBase):
    id: int 
    isActive: bool = Field(alias="is_active")
    isVerified: bool = Field(alias="is_verified")
    canChat: bool = Field(alias="can_chat")
    role: UserRole
    createdAt: datetime = Field(alias="created_at")
    updatedAt: datetime = Field(alias="updated_at")
    lastLoginAt: datetime | None = Field(alias="last_login_at")

    class Config:
        from_attributes = True
        populate_by_name = True

class UserRoleUpdate(BaseModel):
    role: UserRole | None = None

class UserLoginPermissionUpdate(BaseModel):
    is_active: bool
    
class UserCanChatPermissionUpdate(BaseModel):
    can_chat: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=50, pattern=r"^[a-zA-z0-9_]+$", examples=["john"])
    email: EmailStr | None = None
