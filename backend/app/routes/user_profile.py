from ..database import get_db 
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import UserResponse, UserUpdate
from ..models.user import User
from ..dependencies.auth import require_authenticated
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

router = APIRouter(tags=["User Profile"])
security = HTTPBearer()

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(require_authenticated),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current user profile"""
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update current user profile"""
    try:
        # Check if email is being updated and if it already exists
        if user_data.email and user_data.email != current_user.email:
            existing_email = db.query(User).filter(
                User.email == user_data.email,
                User.id != current_user.id
            ).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, 
                    detail="Email already exists"
                )
            current_user.email = user_data.email
        
        # Check if username is being updated and if it already exists
        if user_data.username and user_data.username != current_user.username:
            existing_username = db.query(User).filter(
                User.username == user_data.username,
                User.id != current_user.id
            ).first()
            if existing_username:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, 
                    detail="Username already exists"
                )
            current_user.username = user_data.username
        
        # Only commit if there are actual changes
        if user_data.email or user_data.username:
            db.commit()
            db.refresh(current_user)
        
        return UserResponse.model_validate(current_user)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.delete("/me")
async def delete_user_profile(
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete current user profile"""
    try:
        db.delete(current_user)
        db.commit()
        return {"message": "User profile deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete profile: {str(e)}"
        )
