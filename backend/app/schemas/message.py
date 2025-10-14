from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class MessageBase(BaseModel):
    content: str = Field(..., min_length=1)
    role: MessageRole

class MessageCreate(MessageBase):
    conversation_id: int

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class PaginatedMessageResponse(BaseModel):
    messages: list[MessageResponse]
    hasMore: bool
    page: int
    total: int
    totalPages: int