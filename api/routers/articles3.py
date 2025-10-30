from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Form, Response, Path, status as http_status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pathlib import Path as PathLib
import shutil
import uuid
from PIL import Image, ImageDraw, ImageFont
import io
import logging
import os
import models, schemas
from database import get_db
from .auth import get_current_user, create_access_token, verify_password

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["Entrepreneurship"]
)

# Directory setup
UPLOAD_BASE = PathLib("static/uploads")
UPLOAD_BASE.mkdir(exist_ok=True)
IMAGE_DIR = UPLOAD_BASE / "images"
VIDEO_DIR = UPLOAD_BASE / "videos"
IMAGE_DIR.mkdir(exist_ok=True)
VIDEO_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg', '.gif'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi'}

def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    ext = PathLib(filename).suffix.lower()
    return ext in allowed_extensions

async def save_upload_file(upload_file: UploadFile, directory: PathLib, allowed_extensions: set) -> str:
    if not upload_file:
        return None
        
    try:
        if not validate_file_extension(upload_file.filename, allowed_extensions):
            logger.error(f"Invalid file extension for {upload_file.filename}. Allowed: {allowed_extensions}")
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        file_ext = PathLib(upload_file.filename).suffix
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = directory / filename
        
        directory.mkdir(parents=True, exist_ok=True)
        if not os.access(directory, os.W_OK):
            logger.error(f"Directory not writable: {directory}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Server cannot write to directory: {directory}"
            )
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        if not file_path.exists():
            logger.error(f"File not found after saving: {file_path}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save file: File not found"
            )
        if not os.access(file_path, os.R_OK):
            logger.error(f"File not readable after saving: {file_path}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Saved file is not readable"
            )
        
        logger.info(f"Saved file: {file_path}")
        return f"/static/uploads/{directory.name}/{filename}"
    except Exception as e:
        logger.error(f"Error saving file {upload_file.filename}: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

# Placeholder Image Endpoint
@router.get("/placeholder/{width}/{height}", response_class=Response)
async def generate_placeholder(
    width: int = Path(ge=10, le=2000),
    height: int = Path(ge=10, le=2000),
    text: str = Query("Placeholder"),
    color: str = Query("2563eb")
):
    try:
        color = color.lstrip("#")
        if not all(c in "0123456789abcdefABCDEF" for c in color) or len(color) not in [3, 6]:
            color = "2563eb"
        if len(color) == 3:
            color = "".join(c * 2 for c in color)
        
        img = Image.new("RGB", (width, height), f"#{color}")
        draw = ImageDraw.Draw(img)
        font = ImageFont.load_default()
        
        max_text_width = width - 20
        lines = []
        words = text.split()
        current_line = ""
        for word in words:
            test_line = f"{current_line} {word}".strip()
            bbox = draw.textbbox((0, 0), test_line, font=font)
            text_width = bbox[2] - bbox[0]
            if text_width <= max_text_width:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)
        
        total_text_height = sum(draw.textbbox((0, 0), line, font=font)[3] - draw.textbbox((0, 0), line, font=font)[1] for line in lines)
        y = (height - total_text_height) / 2
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            x = (width - text_width) / 2
            draw.text((x, y), line, fill="white", font=font)
            y += text_height + 2
        
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return Response(content=buffer.getvalue(), media_type="image/png")
    except Exception as e:
        logger.error(f"Failed to generate placeholder: {str(e)}")
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate placeholder")

# Categories Endpoint
@router.get("/categories/", response_model=List[schemas.CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()
    return categories

# Success Stories Endpoints
@router.get("/success-stories/", response_model=List[schemas.ArticleResponse])
async def get_success_stories(
    category_name: Optional[str] = Query("Success Story"),
    exclude_id: Optional[int] = Query(None),
    limit: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    category = db.query(models.Category).filter(models.Category.name == category_name).first()
    if not category:
        return []  # Return empty list if category not found
    
    query = db.query(models.Article).filter(models.Article.category_id == category.id, models.Article.is_entrepreneurship == True)
    if exclude_id:
        query = query.filter(models.Article.id != exclude_id)
    
    success_stories = query.order_by(models.Article.created_at.desc())
    if limit:
        success_stories = success_stories.limit(limit)
    
    return success_stories.all()

@router.get("/success-stories/{story_id}", response_model=schemas.ArticleDetailResponse)
async def get_success_story(story_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.name == "Success Story").first()
    if not category:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    story = db.query(models.Article).filter(
        models.Article.id == story_id,
        models.Article.category_id == category.id,
        models.Article.is_entrepreneurship == True
    ).first()
    if not story:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Success story not found")
    
    if not story.image_url:
        story.image_url = "/api/placeholder/400/300?text=Success+Story&color=2563eb"
    return story

@router.post("/success-stories/", response_model=schemas.ArticleResponse, status_code=http_status.HTTP_201_CREATED)
async def create_success_story(
    title: str = Form(...),
    content: str = Form(...),
    category_id: int = Form(32),  # Default to Success Story (ID 32)
    status: schemas.ArticleStatus = Form(schemas.ArticleStatus.draft),
    author_name: Optional[str] = Form(None),  # Allow custom author_name
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    logger.info(f"POST /api/success-stories/ - title: {title}, category_id: {category_id}, status: {status}, user: {current_user.username}")
    
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        logger.error(f"Category not found: category_id={category_id}")
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Category not found")
    
    section = db.query(models.Section).filter(models.Section.name == "success_stories").first()
    if not section:
        logger.error("Success Stories section not found")
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Success Stories section not found")
    
    image_url = await save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS) if image else None
    video_url = await save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS) if video else None
    
    # Use provided author_name for admins, otherwise default to username
    final_author_name = author_name if current_user.role == "admin" and author_name is not None else current_user.username
    
    story_data = {
        "title": title.strip(),
        "content": content.strip(),
        "category_id": category_id,
        "section_id": section.id,
        "status": status,
        "image_url": image_url or "/api/placeholder/400/300?text=Success+Story&color=2563eb",
        "video_url": video_url,
        "author_id": current_user.id,
        "author_name": final_author_name,
        "is_entrepreneurship": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    try:
        db_story = models.Article(**story_data)
        db.add(db_story)
        db.commit()
        db.refresh(db_story)
        logger.info(f"Success story created: id={db_story.id}, title={db_story.title}, author_name={db_story.author_name}")
        return db_story
    except Exception as e:
        logger.error(f"Failed to create success story: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=f"Failed to create success story: {str(e)}")

@router.put("/success-stories/{story_id}", response_model=schemas.ArticleResponse)
async def update_success_story(
    story_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category_id: Optional[int] = Form(32),  # Default to Success Story
    status: Optional[schemas.ArticleStatus] = Form(None),
    author_name: Optional[str] = Form(None),  # Allow custom author_name
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    remove_image: Optional[bool] = Form(False),
    remove_video: Optional[bool] = Form(False),
    is_entrepreneurship: Optional[bool] = Form(True),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Category not found")
    
    story = db.query(models.Article).filter(
        models.Article.id == story_id,
        models.Article.category_id == category.id
    ).first()
    if not story:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Success story not found")
    
    if story.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    update_data = {}
    if title:
        update_data["title"] = title.strip()
    if content:
        update_data["content"] = content.strip()
    if category_id:
        update_data["category_id"] = category_id
    if status:
        update_data["status"] = status
    if is_entrepreneurship is not None:
        update_data["is_entrepreneurship"] = is_entrepreneurship 
    if current_user.role == "admin" and author_name is not None:
        update_data["author_name"] = author_name  # Only update if admin and provided   
    
    if remove_image and story.image_url:
        try:
            file_path = story.image_url.lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Removed image: {file_path}")
            update_data["image_url"] = None
        except Exception as e:
            logger.error(f"Error removing image: {str(e)}")
    
    if image:
        update_data["image_url"] = await save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
    elif image is not None and not remove_image:
        update_data["image_url"] = "/api/placeholder/400/300?text=Success+Story&color=2563eb"
    
    if remove_video and story.video_url:
        try:
            file_path = story.video_url.lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Removed video: {file_path}")
            update_data["video_url"] = None
        except Exception as e:
            logger.error(f"Error removing video: {str(e)}")
    
    if video:
        update_data["video_url"] = await save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
    
    for key, value in update_data.items():
        setattr(story, key, value)
    
    story.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(story)
    logger.info(f"Updated success story: id={story.id}, title={story.title}, author_name={story.author_name}")
    return story

@router.delete("/success-stories/{story_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_success_story(
    story_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    category = db.query(models.Category).filter(models.Category.name == "Success Story").first()
    if not category:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    story = db.query(models.Article).filter(
        models.Article.id == story_id,
        models.Article.category_id == category.id
    ).first()
    if not story:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Success story not found")
    
    if story.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    for file_url in [story.image_url, story.video_url]:
        if file_url:
            file_path = file_url.lstrip('/')
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    logger.info(f"Deleted file: {file_path}")
                except Exception as e:
                    logger.error(f"Error deleting file {file_path}: {str(e)}")
    
    db.delete(story)
    db.commit()
    logger.info(f"Deleted success story: id={story_id}")
    return None

# Resources Endpoints
@router.get("/resources/", response_model=List[schemas.ArticleResponse])
async def get_resources(db: Session = Depends(get_db)):
    section = db.query(models.Section).filter(models.Section.name == "resources").first()
    if not section:
        return []  # Return empty list if section not found
    
    resources = db.query(models.Article).filter(
        models.Article.section_id == section.id,
        models.Article.is_entrepreneurship == True
    ).all()
    for resource in resources:
        if not resource.image_url:
            resource.image_url = "/api/placeholder/400/300?text=Resource&color=2563eb"
    return resources

@router.get("/resources/{resource_id}", response_model=schemas.ArticleDetailResponse)
async def get_resource(resource_id: int, db: Session = Depends(get_db)):
    section = db.query(models.Section).filter(models.Section.name == "resources").first()
    if not section:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Resources section not found")
    
    resource = db.query(models.Article).filter(
        models.Article.id == resource_id,
        models.Article.section_id == section.id,
        models.Article.is_entrepreneurship == True
    ).first()
    if not resource:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Resource not found")
    
    if not resource.image_url:
        resource.image_url = "/api/placeholder/400/300?text=Resource&color=2563eb"
    return resource

@router.post("/resources/", response_model=schemas.ArticleResponse, status_code=http_status.HTTP_201_CREATED)
async def create_resource(
    title: str = Form(...),
    content: str = Form(...),
    category_id: int = Form(...),
    status: schemas.ArticleStatus = Form(schemas.ArticleStatus.draft),
    author_name: Optional[str] = Form(None),  # Allow custom author_name
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    section = db.query(models.Section).filter(models.Section.name == "resources").first()
    if not section:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Resources section not found")
    
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
    
    image_url = await save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS) if image else None
    video_url = await save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS) if video else None
    
    # Use provided author_name for admins, otherwise default to username
    final_author_name = author_name if current_user.role == "admin" and author_name is not None else current_user.username
    
    resource_data = {
        "title": title.strip(),
        "content": content.strip(),
        "category_id": category_id,
        "section_id": section.id,
        "status": status,
        "image_url": image_url or "/api/placeholder/400/300?text=Resource&color=2563eb",
        "video_url": video_url,
        "author_id": current_user.id,
        "author_name": final_author_name,
        "is_entrepreneurship": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    db_resource = models.Article(**resource_data)
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    logger.info(f"Created resource: id={db_resource.id}, title={db_resource.title}, author_name={db_resource.author_name}")
    return db_resource

@router.put("/resources/{resource_id}", response_model=schemas.ArticleResponse)
async def update_resource(
    resource_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    status: Optional[schemas.ArticleStatus] = Form(None),
    author_name: Optional[str] = Form(None),  # Allow custom author_name
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    remove_image: Optional[bool] = Form(False),
    remove_video: Optional[bool] = Form(False),
    is_entrepreneurship: Optional[bool] = Form(True),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    section = db.query(models.Section).filter(models.Section.name == "resources").first()
    if not section:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Resources section not found")
    
    resource = db.query(models.Article).filter(
        models.Article.id == resource_id,
        models.Article.section_id == section.id
    ).first()
    if not resource:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Resource not found")
    
    if resource.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    update_data = {}
    if title:
        update_data["title"] = title.strip()
    if content:
        update_data["content"] = content.strip()
    if category_id:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
        update_data["category_id"] = category_id
    if status:
        update_data["status"] = status
    if is_entrepreneurship is not None:
        update_data["is_entrepreneurship"] = is_entrepreneurship
    if current_user.role == "admin" and author_name is not None:
        update_data["author_name"] = author_name  
    
    if remove_image and resource.image_url:
        try:
            file_path = resource.image_url.lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Removed image: {file_path}")
            update_data["image_url"] = None
        except Exception as e:
            logger.error(f"Error removing image: {str(e)}")
    
    if image:
        update_data["image_url"] = await save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
    elif image is not None and not remove_image:
        update_data["image_url"] = "/api/placeholder/400/300?text=Resource&color=2563eb"
    
    if remove_video and resource.image_url:
        try:
            file_path = resource.video_url.lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Removed video: {file_path}")
            update_data["video_url"] = None
        except Exception as e:
            logger.error(f"Error removing video: {str(e)}")
    
    if video:
        update_data["video_url"] = await save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
    
    for key, value in update_data.items():
        setattr(resource, key, value)
    
    resource.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(resource)
    logger.info(f"Updated resource: id={resource.id}, title={resource.title}, author_name={resource.author_name}")
    return resource

@router.delete("/resources/{resource_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    section = db.query(models.Section).filter(models.Section.name == "resources").first()
    if not section:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Resources section not found")
    
    resource = db.query(models.Article).filter(
        models.Article.id == resource_id,
        models.Article.section_id == section.id
    ).first()
    if not resource:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Resource not found")
    
    if resource.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    for file_url in [resource.image_url, resource.video_url]:
        if file_url:
            file_path = file_url.lstrip('/')
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    logger.info(f"Deleted file: {file_path}")
                except Exception as e:
                    logger.error(f"Error deleting file {file_path}: {str(e)}")
    
    db.delete(resource)
    db.commit()
    logger.info(f"Deleted resource: id={resource_id}")
    return None

# Programmes de Soutien Endpoints
@router.get("/programmes/", response_model=List[schemas.ArticleResponse])
async def get_programmes(db: Session = Depends(get_db)):
    section = db.query(models.Section).filter(models.Section.name == "programmes_de_soutien").first()
    if not section:
        return []  # Return empty list if section not found
    
    programmes = db.query(models.Article).filter(
        models.Article.section_id == section.id,
        models.Article.is_entrepreneurship == True
    ).all()
    for programme in programmes:
        if not programme.image_url:
            programme.image_url = "/api/placeholder/400/300?text=Programme&color=2563eb"
    return programmes

@router.get("/programmes/{programme_id}", response_model=schemas.ArticleDetailResponse)
async def get_programme(programme_id: int, db: Session = Depends(get_db)):
    section = db.query(models.Section).filter(models.Section.name == "programmes_de_soutien").first()
    if not section:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Programmes section not found")
    
    programme = db.query(models.Article).filter(
        models.Article.id == programme_id,
        models.Article.section_id == section.id,
        models.Article.is_entrepreneurship == True
    ).first()
    if not programme:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Programme not found")
    
    if not programme.image_url:
        programme.image_url = "/api/placeholder/400/300?text=Programme&color=2563eb"
    return programme

@router.post("/programmes/", response_model=schemas.ArticleResponse, status_code=http_status.HTTP_201_CREATED)
async def create_programme(
    title: str = Form(...),
    content: str = Form(...),
    category_id: int = Form(...),
    status: schemas.ArticleStatus = Form(schemas.ArticleStatus.draft),
    author_name: Optional[str] = Form(None),  # Allow custom author_name
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    section = db.query(models.Section).filter(models.Section.name == "programmes_de_soutien").first()
    if not section:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Programmes section not found")
    
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
    
    image_url = await save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS) if image else None
    video_url = await save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS) if video else None
    
    # Use provided author_name for admins, otherwise default to username
    final_author_name = author_name if current_user.role == "admin" and author_name is not None else current_user.username
    
    programme_data = {
        "title": title.strip(),
        "content": content.strip(),
        "category_id": category_id,
        "section_id": section.id,
        "status": status,
        "image_url": image_url or "/api/placeholder/400/300?text=Programme&color=2563eb",
        "video_url": video_url,
        "author_id": current_user.id,
        "author_name": final_author_name,
        "is_entrepreneurship": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    db_programme = models.Article(**programme_data)
    db.add(db_programme)
    db.commit()
    db.refresh(db_programme)
    logger.info(f"Created programme: id={db_programme.id}, title={db_programme.title}, author_name={db_programme.author_name}")
    return db_programme

@router.put("/programmes/{programme_id}", response_model=schemas.ArticleResponse)
async def update_programme(
    programme_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    status: Optional[schemas.ArticleStatus] = Form(None),
    author_name: Optional[str] = Form(None),  # Allow custom author_name
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    remove_image: Optional[bool] = Form(False),
    remove_video: Optional[bool] = Form(False),
    is_entrepreneurship: Optional[bool] = Form(True),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    section = db.query(models.Section).filter(models.Section.name == "programmes_de_soutien").first()
    if not section:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Programmes section not found")
    
    programme = db.query(models.Article).filter(
        models.Article.id == programme_id,
        models.Article.section_id == section.id
    ).first()
    if not programme:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Programme not found")
    
    if programme.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    update_data = {}
    if title:
        update_data["title"] = title.strip()
    if content:
        update_data["content"] = content.strip()
    if category_id:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
        update_data["category_id"] = category_id
    if status:
        update_data["status"] = status
    if is_entrepreneurship is not None:
        update_data["is_entrepreneurship"] = is_entrepreneurship
    if current_user.role == "admin" and author_name is not None:
        update_data["author_name"] = author_name  
    
    if remove_image and programme.image_url:
        try:
            file_path = programme.image_url.lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Removed image: {file_path}")
            update_data["image_url"] = None
        except Exception as e:
            logger.error(f"Error removing image: {str(e)}")
    
    if image:
        update_data["image_url"] = await save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
    elif image is not None and not remove_image:
        update_data["image_url"] = "/api/placeholder/400/300?text=Programme&color=2563eb"
    
    if remove_video and programme.video_url:
        try:
            file_path = programme.video_url.lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Removed video: {file_path}")
            update_data["video_url"] = None
        except Exception as e:
            logger.error(f"Error removing video: {str(e)}")
    
    if video:
        update_data["video_url"] = await save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
    
    for key, value in update_data.items():
        setattr(programme, key, value)
    
    programme.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(programme)
    logger.info(f"Updated programme: id={programme.id}, title={programme.title}, author_name={programme.author_name}")
    return programme

@router.delete("/programmes/{programme_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_programme(
    programme_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    section = db.query(models.Section).filter(models.Section.name == "programmes_de_soutien").first()
    if not section:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Programmes section not found")
    
    programme = db.query(models.Article).filter(
        models.Article.id == programme_id,
        models.Article.section_id == section.id
    ).first()
    if not programme:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Programme not found")
    
    if programme.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    for file_url in [programme.image_url, programme.video_url]:
        if file_url:
            file_path = file_url.lstrip('/')
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    logger.info(f"Deleted file: {file_path}")
                except Exception as e:
                    logger.error(f"Error deleting file {file_path}: {str(e)}")
    
    db.delete(programme)
    db.commit()
    logger.info(f"Deleted programme: id={programme_id}")
    return None