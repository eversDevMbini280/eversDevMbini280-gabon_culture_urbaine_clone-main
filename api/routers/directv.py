from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import uuid
import shutil
import re
import asyncio
from database import get_db
from models import DirectTV, User, Category, DirectTVStatus
from schemas import DirectTVResponse, DirectTVCreate, DirectTVUpdate, DirectTVDetailResponse, DirectTVStatus as SchemasDirectTVStatus
from .auth import get_current_user
import logging

# Create router with trailing slash handling
router = APIRouter(prefix="/api/directtv", tags=["DirectTV"], redirect_slashes=False)

logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads"
os.makedirs(f"{UPLOAD_DIR}/images", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/videos", exist_ok=True)

# Maximum file sizes
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500MB

def normalize_time_format(time_str: str) -> str:
    """Convert time format from '10h30' to '10:30' or validate '10:30' format"""
    if 'h' in time_str:
        # Convert from "10h30" to "10:30"
        return time_str.replace('h', ':')
    # Validate HH:MM format
    if not re.match(r'^\d{1,2}:\d{2}$', time_str):
        raise ValueError('Time must be in HH:MM format or HhMM format')
    return time_str

def save_file_sync(file: UploadFile, file_path: str) -> str:
    """Save uploaded file synchronously"""
    try:
        with open(file_path, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)
        return file_path
    except Exception as e:
        logger.error(f"Error saving file {file_path}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

def process_uploads_sync(image: Optional[UploadFile], video: UploadFile) -> tuple:
    """Process file uploads synchronously"""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    image_url = None
    video_url = None
    
    # Process image if provided
    if image:
        if image.size and image.size > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=400, detail=f"Image file too large (max {MAX_IMAGE_SIZE // (1024*1024)}MB)")
        
        image_ext = image.filename.split(".")[-1].lower()
        if image_ext not in ["jpg", "jpeg", "png", "webp"]:
            raise HTTPException(status_code=400, detail="Invalid image format. Supported: JPG, JPEG, PNG, WEBP")
        
        image_filename = f"image_{timestamp}_{uuid.uuid4()}.{image_ext}"
        image_path = os.path.join(UPLOAD_DIR, "images", image_filename)
        save_file_sync(image, image_path)
        image_url = f"/{image_path}"
    
    # Process video
    if video.size and video.size > MAX_VIDEO_SIZE:
        raise HTTPException(status_code=400, detail=f"Video file too large (max {MAX_VIDEO_SIZE // (1024*1024)}MB)")
    
    video_ext = video.filename.split(".")[-1].lower()
    if video_ext not in ["mp4", "avi", "mov", "webm", "mkv"]:
        raise HTTPException(status_code=400, detail="Invalid video format. Supported: MP4, AVI, MOV, WEBM, MKV")
    
    video_filename = f"video_{timestamp}_{uuid.uuid4()}.{video_ext}"
    video_path = os.path.join(UPLOAD_DIR, "videos", video_filename)
    save_file_sync(video, video_path)
    video_url = f"/{video_path}"
    
    return image_url, video_url

# Get optional current user dependency function
async def get_optional_current_user(db: Session = Depends(get_db)) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    try:
        # Try to get the current user, but don't raise an exception if not authenticated
        from fastapi import Request
        from fastapi.security import HTTPBearer
        
        # This is a placeholder - you'll need to implement the actual logic
        # based on your auth system to optionally get the user
        return None
    except:
        return None

@router.post("/", response_model=DirectTVResponse, status_code=status.HTTP_201_CREATED)
async def create_directtv(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(...),
    category_id: int = Form(...),
    time: str = Form(...),
    date: str = Form(...),
    duration: str = Form(None),
    is_live: bool = Form(False),
    is_featured: bool = Form(False),
    # FIXED: Default status to published instead of draft
    status: Optional[str] = Form("published"),
    image: Optional[UploadFile] = File(None),
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate category
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    # Normalize time format
    try:
        time = normalize_time_format(time)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Validate date format
    try:
        date_obj = datetime.fromisoformat(date.replace("Z", "+00:00"))
    except ValueError:
        try:
            # Try parsing as date only (YYYY-MM-DD)
            date_obj = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD or ISO format")

    # Process file uploads synchronously
    try:
        image_url, video_url = process_uploads_sync(image, video)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during file upload: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process file uploads")

    # Create DirectTV record
    try:
        # FIXED: Use the provided status instead of defaulting to draft
        direct_tv = DirectTV(
            title=title,
            description=description,
            category_id=category_id,
            time=time,
            date=date_obj,
            duration=duration,
            status=status,  # Use the provided status
            is_live=is_live,
            is_featured=is_featured,
            image_url=image_url,
            video_url=video_url,
            author_id=current_user.id,
            author_name=current_user.username,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(direct_tv)
        db.commit()
        db.refresh(direct_tv)
        
        logger.info(f"DirectTV program created successfully: {direct_tv.id}")
        return direct_tv
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating DirectTV program: {str(e)}")
        
        # Clean up uploaded files on database error
        if image_url and os.path.exists(image_url[1:]):  # Remove leading slash
            os.remove(image_url[1:])
        if video_url and os.path.exists(video_url[1:]):  # Remove leading slash
            os.remove(video_url[1:])
            
        raise HTTPException(status_code=500, detail="Failed to create program")

# Main endpoint with optional authentication
@router.get("/", response_model=List[DirectTVResponse])
async def get_directtv(
    skip: int = 0,
    limit: int = 10,
    category_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    try:
        query = db.query(DirectTV)
        
        # Apply filters based on user role
        if not current_user or current_user.role not in ["admin", "editor"]:
            query = query.filter(DirectTV.status == "published")
        elif status_filter:
            query = query.filter(DirectTV.status == status_filter)
        
        # Filter by category if specified
        if category_id:
            query = query.filter(DirectTV.category_id == category_id)
        
        # Order by date descending and apply pagination
        directtv = query.order_by(DirectTV.date.desc()).offset(skip).limit(limit).all()
        return directtv
    except Exception as e:
        logger.error(f"Error fetching Direct TV programs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch programs")

# Admin endpoint that requires admin authentication
@router.get("/admin", response_model=List[DirectTVResponse])
async def get_admin_directtv(
    skip: int = 0,
    limit: int = 100,  # Higher limit for admin view
    category_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user has admin privileges
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access admin resources"
        )
    
    try:
        query = db.query(DirectTV)
        
        # Apply filters if specified
        if status_filter:
            query = query.filter(DirectTV.status == status_filter)
        
        if category_id:
            query = query.filter(DirectTV.category_id == category_id)
        
        # Order by date descending and apply pagination
        directtv = query.order_by(DirectTV.date.desc()).offset(skip).limit(limit).all()
        return directtv
    except Exception as e:
        logger.error(f"Error fetching admin Direct TV programs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch admin programs")

# Public endpoint that doesn't require authentication at all
@router.get("/public", response_model=List[DirectTVResponse])
async def get_public_directtv(
    skip: int = 0,
    limit: int = 10,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Public endpoint for published DirectTV programs only"""
    try:
        query = db.query(DirectTV).filter(DirectTV.status == "published")
        
        if category_id:
            query = query.filter(DirectTV.category_id == category_id)
        
        directtv = query.order_by(DirectTV.date.desc()).offset(skip).limit(limit).all()
        return directtv
    except Exception as e:
        logger.error(f"Error fetching public Direct TV programs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch programs")

@router.get("/{id}", response_model=DirectTVDetailResponse)
async def get_directtv_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    directtv = db.query(DirectTV).filter(DirectTV.id == id).first()
    if not directtv:
        raise HTTPException(status_code=404, detail="Direct TV program not found")
    
    # Check permissions
    if directtv.status != "published" and (not current_user or current_user.role not in ["admin", "editor"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this program")
    
    return directtv

@router.put("/{id}", response_model=DirectTVResponse)
async def update_directtv(
    id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    time: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    duration: Optional[str] = Form(None),
    status: Optional[SchemasDirectTVStatus] = Form(None),
    is_live: Optional[bool] = Form(None),
    is_featured: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    directtv = db.query(DirectTV).filter(DirectTV.id == id).first()
    if not directtv:
        raise HTTPException(status_code=404, detail="Direct TV program not found")

    # Prepare update data
    update_data = {"updated_at": datetime.utcnow()}
    
    # Handle text fields
    if title is not None:
        update_data["title"] = title
    if description is not None:
        update_data["description"] = description
    if category_id is not None:
        update_data["category_id"] = category_id
    if duration is not None:
        update_data["duration"] = duration
    if status is not None:
        update_data["status"] = status
    if is_live is not None:
        update_data["is_live"] = is_live
    if is_featured is not None:
        update_data["is_featured"] = is_featured
    
    # Handle time
    if time is not None:
        try:
            update_data["time"] = normalize_time_format(time)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    # Handle date
    if date is not None:
        try:
            update_data["date"] = datetime.fromisoformat(date.replace("Z", "+00:00"))
        except ValueError:
            try:
                update_data["date"] = datetime.strptime(date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format")

    # Handle file uploads
    old_image_url = directtv.image_url
    old_video_url = directtv.video_url
    
    try:
        # Process new image
        if image:
            if image.size and image.size > MAX_IMAGE_SIZE:
                raise HTTPException(status_code=400, detail=f"Image file too large (max {MAX_IMAGE_SIZE // (1024*1024)}MB)")
            
            image_ext = image.filename.split(".")[-1].lower()
            if image_ext not in ["jpg", "jpeg", "png", "webp"]:
                raise HTTPException(status_code=400, detail="Invalid image format")
            
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            image_filename = f"image_{timestamp}_{uuid.uuid4()}.{image_ext}"
            image_path = os.path.join(UPLOAD_DIR, "images", image_filename)
            save_file_sync(image, image_path)
            update_data["image_url"] = f"/{image_path}"

        # Process new video
        if video:
            if video.size and video.size > MAX_VIDEO_SIZE:
                raise HTTPException(status_code=400, detail=f"Video file too large (max {MAX_VIDEO_SIZE // (1024*1024)}MB)")
            
            video_ext = video.filename.split(".")[-1].lower()
            if video_ext not in ["mp4", "avi", "mov", "webm", "mkv"]:
                raise HTTPException(status_code=400, detail="Invalid video format")
            
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            video_filename = f"video_{timestamp}_{uuid.uuid4()}.{video_ext}"
            video_path = os.path.join(UPLOAD_DIR, "videos", video_filename)
            save_file_sync(video, video_path)
            update_data["video_url"] = f"/{video_path}"

        # Handle is_live constraint (only one can be live at a time)
        if update_data.get("is_live", directtv.is_live):
            db.query(DirectTV).filter(DirectTV.is_live == True).update({"is_live": False})

        # Apply updates
        for key, value in update_data.items():
            setattr(directtv, key, value)
        
        db.commit()
        db.refresh(directtv)
        
        # Clean up old files after successful update
        if image and old_image_url and os.path.exists(old_image_url[1:]):
            os.remove(old_image_url[1:])
        if video and old_video_url and os.path.exists(old_video_url[1:]):
            os.remove(old_video_url[1:])
        
        logger.info(f"DirectTV program updated successfully: {directtv.id}")
        return directtv
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating Direct TV program: {str(e)}")
        
        # Clean up new files on error
        if "image_url" in update_data and os.path.exists(update_data["image_url"][1:]):
            os.remove(update_data["image_url"][1:])
        if "video_url" in update_data and os.path.exists(update_data["video_url"][1:]):
            os.remove(update_data["video_url"][1:])
            
        raise HTTPException(status_code=500, detail="Failed to update program")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_directtv(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    directtv = db.query(DirectTV).filter(DirectTV.id == id).first()
    if not directtv:
        raise HTTPException(status_code=404, detail="Direct TV program not found")

    try:
        # Store file paths for cleanup
        image_path = directtv.image_url[1:] if directtv.image_url else None
        video_path = directtv.video_url[1:] if directtv.video_url else None
        
        # Delete from database
        db.delete(directtv)
        db.commit()
        
        # Clean up files
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
            
        logger.info(f"DirectTV program deleted successfully: {id}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting Direct TV program: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete program")
