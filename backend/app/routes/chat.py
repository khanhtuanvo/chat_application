from fastapi import APIRouter, HTTPException, status, Depends, Query, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from ..schemas.conversation import ConversationUpdate, ConversationCreate, ConversationResponse, PaginatedConversationResponse
from ..schemas.message import MessageCreate, MessageResponse, PaginatedMessageResponse
from ..database import get_db
from ..models.conversation import Conversation
from ..models.message import Message
try:
    from ..services.openai_service import openai_service
except Exception as e:
    print(f"Warning: OpenAI service not available: {e}")
    openai_service = None
from fastapi.responses import StreamingResponse
from ..dependencies.auth import require_authenticated
from ..models import User

router = APIRouter()
security = HTTPBearer()

#Create new conversation 
@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    conversation: ConversationCreate, 
    db: Session = Depends(get_db), 
    user: User = Depends(require_authenticated), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Check if user has chat permission
    if not user.can_chat:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chat access denied"
        )
    # Ensure conversation has a default title if none provided
    conversation_data = conversation.model_dump()
    if not conversation_data.get('title') or conversation_data.get('title') == '':
        conversation_data['title'] = 'New Chat'
    conversation_data['user_id'] = user.id
    db_conversation = Conversation(**conversation_data)
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

#Get all conversations with exclusion support
@router.get("/conversations", response_model=PaginatedConversationResponse)
def get_conversations(
    page: int = Query(1, ge=1, description="Page number starts from 1"), 
    limit: int = Query(10, ge=1, le=100, description="Number of conversations per page"),
    exclude_ids: str = Query(None, description="Comma-separated list of conversation IDs to exclude"),
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Allow reading conversations even if can_chat is false
    exclude_conversation_ids = []
    if exclude_ids:
        try:
            exclude_conversation_ids = [int(id.strip()) for id in exclude_ids.split(',') if id.strip()]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid exclude_ids format. Use comma-separated integers."
            )
    # Only get conversations for the current user
    query = db.query(Conversation).filter(Conversation.user_id == user.id).order_by(Conversation.updated_at.desc())
    if exclude_conversation_ids:
        query = query.filter(~Conversation.id.in_(exclude_conversation_ids))
    total_conversations = query.count()
    total_pages = (total_conversations + limit - 1) // limit
    has_more = page < total_pages
    conversations = query.offset((page-1) * limit).limit(limit).all()
    return PaginatedConversationResponse(
        conversations=[ConversationResponse.model_validate(conv) for conv in conversations],
        hasMore=has_more,
        page=page,
        total=total_conversations,
        totalPages=total_pages
    )

#Get a specific conversation
@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int, 
    db: Session = Depends(get_db), 
    user: User = Depends(require_authenticated), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Allow reading conversation even if can_chat is false
    conversation = db.query(Conversation).filter(Conversation.user_id == user.id, Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return conversation

#Get messages with pagination
@router.get("/conversations/{conversation_id}/messages", response_model=PaginatedMessageResponse)
def get_conversation_messages(
    conversation_id: int, 
    page: int = Query(1, ge=1, description="Page number starts from 1"), 
    limit: int = Query(10, ge=1, le=100, description="Number of messages per page"), 
    db: Session = Depends(get_db), 
    user: User = Depends(require_authenticated), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Allow reading messages even if can_chat is false
    conversation = db.query(Conversation).filter(Conversation.user_id == user.id, Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    offset = (page-1) * limit 
    total_messages =  db.query(Message).filter(Message.conversation_id == conversation_id).count()
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.timestamp.asc()).offset(offset).limit(limit).all()
    total_pages = (total_messages + limit - 1) // limit
    has_more = page < total_pages 
    return PaginatedMessageResponse(
        messages=[MessageResponse.model_validate(msg) for msg in messages],
        hasMore=has_more,
        page=page,
        total=total_messages,
        totalPages=total_pages
    )

#Update a specific conversation 
@router.put("/conversations/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: int, 
    conversation_update: ConversationUpdate, 
    db: Session = Depends(get_db), 
    user: User = Depends(require_authenticated), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Check if user has chat permission
    # if not user.can_chat:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Chat access denied"
    #     )
    conversation = db.query(Conversation).filter(Conversation.user_id == user.id, Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if conversation_update.title is not None:
        conversation.title = conversation_update.title
        conversation.updated_at = func.now()
    db.commit()
    db.refresh(conversation)
    return conversation

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int, 
    user: User = Depends(require_authenticated), 
    db: Session = Depends(get_db), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # # Check if user has chat permission
    # if not user.can_chat:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Chat access denied"
    #     )
    conversation = db.query(Conversation).filter(Conversation.user_id == user.id, Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    db.delete(conversation)
    db.commit()
    return {"ok": True}

# @router.post("/send", response_model=MessageResponse)
# def send_message(message: MessageCreate, user: User = Depends(AuthMiddleware.authenticate_user), db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)):
#     conversation = db.query(Conversation).filter(Conversation.user_id == user.id, Conversation.id == message.conversation_id).first()
#     if not conversation:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
#     # Save user message
#     db_message = Message(**message.model_dump(), user_id=user.id) if hasattr(Message, 'user_id') else Message(**message.model_dump())
#     db.add(db_message)
#     conversation.updated_at = func.now()
#     db.commit()
#     db.refresh(db_message)
#     conversation_messages = db.query(Message).filter(
#         Message.conversation_id == message.conversation_id
#     ).order_by(Message.timestamp).all()
#     message_dicts = [
#         {"role": msg.role, "content": msg.content} 
#         for msg in conversation_messages
#     ]
#     formatted_messages = openai_service.format_conversation_history(message_dicts)
#     ai_response = openai_service.get_chat_response(formatted_messages)
#     ai_message = Message(
#         conversation_id=message.conversation_id,
#         user_id=user.id,
#         content=ai_response,
#         role="assistant"
#     )
#     db.add(ai_message)
#     conversation.updated_at = func.now()
#     db.commit()
#     db.refresh(ai_message)
#     if conversation.title == "New Chat" or conversation.title is None:
#         updated_messages = db.query(Message).filter(
#             Message.conversation_id == message.conversation_id
#         ).order_by(Message.timestamp).all()
#         if len(updated_messages) >= 2:
#             try:
#                 message_dicts = [
#                     {"role": msg.role, "content": msg.content} 
#                     for msg in updated_messages
#                 ]
#                 if openai_service.should_generate_title(message_dicts):
#                     generated_title = openai_service.generate_conversation_title(message_dicts)
#                     conversation.title = generated_title
#                     db.commit()
#             except Exception as e:
#                 pass
#     return ai_message

@router.post("/conversations/{conversation_id}/title", response_model=ConversationResponse)
def create_conversation_title(
    conversation_id: int, 
    db: Session = Depends(get_db), 
    user: User = Depends(require_authenticated), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Check if user has chat permission
    # if not user.can_chat:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Chat access denied"
    #     )
    conversation = db.query(Conversation).filter(Conversation.user_id == user.id, Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).all()
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cannot generate title for empty conversation"
        )
    messages_dict = [
        {"role": msg.role, "content": msg.content} for msg in messages
    ]
    
    # Check if OpenAI service is available
    if not openai_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not available. Please try again later."
        )
    
    if not openai_service.should_generate_title(messages_dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conversation content is not substantial enough for title generation. Try adding more meaningful content to your conversation."
        )
    
    try:
        generated_title = openai_service.generate_conversation_title(messages_dict)
        conversation.title = generated_title
        db.commit()
        db.refresh(conversation)
        return conversation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate title: {str(e)}"
        )

@router.post("/send_stream")
async def send_message_stream(
    message: MessageCreate, 
    db: Session = Depends(get_db), 
    user: User = Depends(require_authenticated), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Check if user has chat permission
    if not user.can_chat:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chat access denied"
        )
    conversation = db.query(Conversation).filter(Conversation.user_id == user.id, Conversation.id == message.conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    db_message = Message(**message.model_dump(), user_id=user.id) if hasattr(Message, 'user_id') else Message(**message.model_dump())
    db.add(db_message)
    conversation.updated_at = func.now()
    db.commit()
    db.refresh(db_message)
    conversation_messages = db.query(Message).filter(
        Message.conversation_id == message.conversation_id
    ).order_by(Message.timestamp).all()
    message_dicts = [
        {"role": msg.role, "content": msg.content} 
        for msg in conversation_messages
    ]
    
    # Check if OpenAI service is available
    if not openai_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not available. Please try again later."
        )
    
    try:
        formatted_messages = openai_service.format_conversation_history(message_dicts)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to format conversation: {str(e)}"
        )
    assistant_message = Message(
        conversation_id=message.conversation_id,
        user_id=user.id,
        content="",
        role="assistant"
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)
    try:
        if not openai_service.client:
            raise Exception("OpenAI client not initialized")
            
        response = openai_service.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=formatted_messages,
            max_tokens=1000,
            temperature=0.7,
            stream=True
        )
        full_content = ""
        def event_generator():
            nonlocal full_content
            for chunk in response:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_content += content
                    assistant_message.content = full_content
                    db.commit()
                    yield f"data: {content}\n\n"
            assistant_message.content = full_content
            conversation.updated_at = func.now()
            db.commit()
            if conversation.title == "New Chat" or conversation.title is None:
                updated_messages = db.query(Message).filter(
                    Message.conversation_id == message.conversation_id
                ).order_by(Message.timestamp).all()
                if len(updated_messages) >= 2:
                    try:
                        message_dicts = [
                            {"role": msg.role, "content": msg.content} 
                            for msg in updated_messages
                        ]
                        if openai_service.should_generate_title(message_dicts):
                            generated_title = openai_service.generate_conversation_title(message_dicts)
                            conversation.title = generated_title
                            db.commit()
                    except Exception as e:
                        pass
            yield f"data: [DONE]\n\n"
        return StreamingResponse(event_generator(), media_type="text/event-stream")
    except Exception as e:
        db.delete(assistant_message)
        db.commit()
        raise HTTPException(status_code=500, detail="Streaming failed")

