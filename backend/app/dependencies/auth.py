from fastapi import Request, HTTPException, status, Depends
from starlette.status import HTTP_401_UNAUTHORIZED
from ..services.auth_service import auth_service  
from ..database import get_db
from ..models.user import User, UserRole
from typing import Callable
from sqlalchemy.orm import Session

class AuthMiddleware:
    @staticmethod
    async def authenticate_user(
        request: Request,
        db: Session = Depends(get_db)
    ):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing"
            )
        
        if not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format"
            )
        
        try:
            token = auth_header.split(" ")[1]
            payload = auth_service.verify_token(token)

            if not payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            # Use user ID instead of email for token validation
            user_id = payload.get('sub')
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token format"
                )
            
            # Query user by ID instead of email
            user = db.query(User).filter(User.id == int(user_id)).first()

            if not user:
                raise HTTPException(
                    status_code=HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            if not user.is_active:
                raise HTTPException(
                    status_code=HTTP_401_UNAUTHORIZED,
                    detail="User account is inactive"
                )

            # Store user info in request state for debugging
            request.state.user = user 
            request.state.role = user.role

            return user
        except HTTPException:
            raise
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )
    
    @staticmethod
    def require_role(allowed_roles: list[UserRole]):
        def role_checker(
            request: Request,
            user: User = Depends(AuthMiddleware.authenticate_user)
        ):
            if user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required roles: {[role.value for role in allowed_roles]}"
                )
            return user
        return role_checker

# Convenience functions for common role checks
def require_admin():
    return AuthMiddleware.require_role([UserRole.ADMIN])

def require_user_or_admin():
    return AuthMiddleware.require_role([UserRole.ADMIN, UserRole.USER])

async def require_authenticated(request: Request, db: Session = Depends(get_db)) -> User:
    """Dependency to require authentication and return the current user"""
    return await AuthMiddleware.authenticate_user(request, db)


