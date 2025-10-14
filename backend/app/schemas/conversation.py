from pydantic import BaseModel
from datetime import datetime


class ConversationCreate(BaseModel):
    title: str | None = None

class ConversationUpdate(BaseModel):
    title: str | None

class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedConversationResponse(BaseModel):
    conversations: list[ConversationResponse]
    hasMore: bool
    page: int
    total: int
    totalPages: int
    