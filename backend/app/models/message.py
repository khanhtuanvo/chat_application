from ..database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Integer, DateTime, Text
from sqlalchemy.sql import func
import datetime 

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("conversations.id", ondelete="CASCADE"), 
        nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="messages")
    conversation: Mapped["Conversation"] = relationship(back_populates="messages")

    def __repr__(self):
        return (f"<Message(id={self.id}, conversation_id={self.conversation_id}, "
                f"role='{self.role}', content='{self.content[:50]}...')>")
