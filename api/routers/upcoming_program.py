from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from database import get_db
from models import User, UpcomingProgram
from schemas import UpcomingProgramResponse
from .auth import get_current_user
import logging

# Create router
router = APIRouter(prefix="/api/upcoming", tags=["Upcoming Programs"])

logger = logging.getLogger(__name__)

@router.post("/", response_model=UpcomingProgramResponse, status_code=status.HTTP_201_CREATED)
async def set_upcoming_program(
    title: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set the upcoming program title (requires admin/editor privileges)"""
    # Check if user has admin privileges
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to set upcoming program"
        )
    
    try:
        # Check if an upcoming program already exists
        existing = db.query(UpcomingProgram).first()
        
        if existing:
            # Update existing record
            existing.title = title
            existing.updated_at = datetime.utcnow()
            existing.updated_by = current_user.id
            db.commit()
            db.refresh(existing)
            logger.info(f"Upcoming program updated by {current_user.username}: {title}")
            return existing
        else:
            # Create new record
            upcoming = UpcomingProgram(
                title=title,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                created_by=current_user.id,
                updated_by=current_user.id
            )
            db.add(upcoming)
            db.commit()
            db.refresh(upcoming)
            logger.info(f"Upcoming program created by {current_user.username}: {title}")
            return upcoming
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error setting upcoming program: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to set upcoming program")

@router.get("/", response_model=UpcomingProgramResponse)
async def get_upcoming_program(
    db: Session = Depends(get_db)
):
    """Get the current upcoming program (public endpoint)"""
    try:
        upcoming = db.query(UpcomingProgram).first()
        
        if not upcoming:
            # Return empty response if no upcoming program is set
            return {"id": 0, "title": "", "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()}
            
        return upcoming
    except Exception as e:
        logger.error(f"Error fetching upcoming program: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch upcoming program")
