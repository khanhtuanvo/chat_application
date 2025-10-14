from sqlalchemy.orm import mapped_column, Mapped, relationship
from ..database import Base
from sqlalchemy import String, Integer, DateTime, Boolean, Enum 
from sqlalchemy.sql import func  
import datetime
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    # Authentication fields
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    username: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Status fields
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Role and permissions
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER, nullable=False)
    can_chat: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Verification fields
    # Timestamps
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Chat relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")
