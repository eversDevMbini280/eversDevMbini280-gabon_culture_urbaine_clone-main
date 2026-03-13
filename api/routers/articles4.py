from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import models, schemas
import os
from datetime import datetime
import uuid
from database import get_db
from routers.auth import get_current_user
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func
import sqlalchemy
from pathlib import Path
import shutil
import logging

router = APIRouter(
    prefix="/api/science-articles",
    tags=["Science Articles"]
)

UPLOAD_BASE = Path("uploads")
UPLOAD_BASE.mkdir(exist_ok=True)
IMAGE_DIR = UPLOAD_BASE / "images"
VIDEO_DIR = UPLOAD_BASE / "videos"
IMAGE_DIR.mkdir(exist_ok=True)
VIDEO_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm', '.ogg'}

logger = logging.getLogger(__name__)

def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in allowed_extensions

def save_upload_file(upload_file: UploadFile, directory: Path, allowed_extensions: set) -> str:
    if not upload_file:
        return None
        
    try:
        if not validate_file_extension(upload_file.filename, allowed_extensions):
            logger.error(f"Invalid file extension for {upload_file.filename}. Allowed: {allowed_extensions}")
            raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")
        
        file_ext = Path(upload_file.filename).suffix
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = directory / filename
        
        directory.mkdir(parents=True, exist_ok=True)
        if not os.access(directory, os.W_OK):
            logger.error(f"Directory not writable: {directory}")
            raise HTTPException(status_code=500, detail=f"Server cannot write to directory: {directory}")
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        if not file_path.exists():
            logger.error(f"File not found after saving: {file_path}")
            raise HTTPException(status_code=500, detail="Failed to save file: File not found")
        if not os.access(file_path, os.R_OK):
            logger.error(f"File not readable after saving: {file_path}")
            raise HTTPException(status_code=500, detail="Saved file is not readable")
        
        logger.info(f"Saved file: {file_path}")
        return f"/static/uploads/{directory.name}/{filename}"
    except Exception as e:
        logger.error(f"Error saving file {upload_file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

@router.get("/", response_model=List[schemas.ScienceArticleResponse])  
async def get_science_articles(
    status: Optional[str] = None,
    section_id: Optional[int] = None,
    science_section: Optional[str] = None,
    exclude: Optional[int] = None,
    limit: int = 10,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
):
    query = db.query(models.ScienceArticle).join(models.User, models.ScienceArticle.author_id == models.User.id)
    
    if not token:
        query = query.filter(models.ScienceArticle.status == "published")
    else:
        if status:
            if status not in [e.value for e in schemas.ArticleStatus]:
                raise HTTPException(status_code=400, detail="Invalid status value")
            query = query.filter(models.ScienceArticle.status == status)
    
    if section_id:
        section = db.query(models.Section).filter(models.Section.id == section_id).first()
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
        query = query.filter(models.ScienceArticle.section_id == section_id)
    
    if science_section:
        if science_section not in [e.value for e in schemas.ScienceSection]:
            raise HTTPException(status_code=400, detail="Invalid science section value")
        query = query.filter(func.cast(models.ScienceArticle.science_section, sqlalchemy.String).ilike(science_section))
    
    if exclude:
        query = query.filter(models.ScienceArticle.id != exclude)
    
    science_articles = query.limit(limit).all()
    
    return [
        schemas.ScienceArticleResponse(
            id=article.id,
            title=article.title,
            content=article.content,
            category_id=article.category_id,
            section_id=article.section_id,
            science_section=article.science_section,
            status=article.status,
            image_url=article.image_url,
            video_url=article.video_url,
            views=article.views,
            author_id=article.author_id,
            author_name=article.author_name,
            author_username=article.author.username,
            created_at=article.created_at,
            updated_at=article.updated_at
        ) for article in science_articles
    ] or []

@router.get("/{id}", response_model=schemas.ScienceArticleDetailResponse)
async def get_science_article(
    id: int,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
):
    science_article = db.query(models.ScienceArticle)\
        .options(
            joinedload(models.ScienceArticle.category),
            joinedload(models.ScienceArticle.author),
            joinedload(models.ScienceArticle.section)
        )\
        .filter(models.ScienceArticle.id == id)\
        .first()
    
    if not science_article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Science article not found")
    
    if science_article.status != "published" and not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                          detail="Authentication required to view unpublished articles")
    
    # Build category response
    category = schemas.CategoryResponse(
        id=science_article.category.id,
        name=science_article.category.name,
        description=science_article.category.description,
        created_at=science_article.category.created_at
    )
    
    # Build section response if exists
    section = None
    if science_article.section:
        section = schemas.SectionResponse(
            id=science_article.section.id,
            name=science_article.section.name,
            description=science_article.section.description,
            created_at=science_article.section.created_at
        )
    
    # Build author response
    author = schemas.UserResponse(
        id=science_article.author.id,
        username=science_article.author.username,
        email=science_article.author.email,
        role=science_article.author.role,
        status=science_article.author.status,
        disabled=science_article.author.disabled,
        last_login=science_article.author.last_login,
        last_activity=science_article.author.last_activity
    )
    
    return schemas.ScienceArticleDetailResponse(
        id=science_article.id,
        title=science_article.title,
        content=science_article.content,
        category=category,
        section=section,
        science_section=science_article.science_section,
        status=science_article.status,
        image_url=science_article.image_url,
        video_url=science_article.video_url,
        views=science_article.views,
        author=author,
        author_name=science_article.author_name,
        # Ensure these required fields are included
        category_id=science_article.category_id,
        author_id=science_article.author_id,
        author_username=science_article.author.username,
        created_at=science_article.created_at,
        updated_at=science_article.updated_at
    )

@router.post("/", response_model=schemas.ScienceArticleResponse)
async def create_science_article(
    title: str = Form(...),
    content: str = Form(...),
    category_id: int = Form(...),
    section_id: Optional[int] = Form(None),
    science_section: str = Form(...),
    status: str = Form(default="draft"),
    author_name: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                          detail="Not authorized to create science articles")
    
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if section_id:
        section = db.query(models.Section).filter(models.Section.id == section_id).first()
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
    
    if science_section not in [e.value for e in schemas.ScienceSection]:
        raise HTTPException(status_code=400, detail="Invalid science section value")
    
    if status not in [e.value for e in schemas.ArticleStatus]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    
    image_url = None
    video_url = None
    
    if image:
        image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
    
    if video:
        video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
    
    new_science_article = models.ScienceArticle(
        title=title.strip(),
        content=content.strip(),
        category_id=category_id,
        section_id=section_id,
        science_section=science_section,
        status=status,
        image_url=image_url,
        video_url=video_url,
        author_id=current_user.id,
        author_name=author_name.strip() if current_user.role == "admin" and author_name else current_user.username,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_science_article)
    db.commit()
    db.refresh(new_science_article)
    
    return schemas.ScienceArticleResponse(
        id=new_science_article.id,
        title=new_science_article.title,
        content=new_science_article.content,
        category_id=new_science_article.category_id,
        section_id=new_science_article.section_id,
        science_section=new_science_article.science_section,
        status=new_science_article.status,
        image_url=new_science_article.image_url,
        video_url=new_science_article.video_url,
        views=new_science_article.views,
        author_id=new_science_article.author_id,
        author_name=new_science_article.author_name,
        author_username=current_user.username,
        created_at=new_science_article.created_at,
        updated_at=new_science_article.updated_at
    )

@router.put("/{id}", response_model=schemas.ScienceArticleResponse)
async def update_science_article(
    id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    section_id: Optional[int] = Form(None),
    science_section: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    author_name: Optional[str] = Form(None),
    remove_image: bool = Form(False),
    remove_video: bool = Form(False),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                          detail="Not authorized to update science articles")
    
    science_article = db.query(models.ScienceArticle).filter(models.ScienceArticle.id == id).first()
    
    if not science_article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                          detail="Science article not found")
    
    if title is not None:
        science_article.title = title.strip()
    if content is not None:
        science_article.content = content.strip()
    if category_id is not None:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        science_article.category_id = category_id
    if section_id is not None:
        section = db.query(models.Section).filter(models.Section.id == section_id).first()
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
        science_article.section_id = section_id
    if science_section is not None:
        if science_section not in [e.value for e in schemas.ScienceSection]:
            raise HTTPException(status_code=400, detail="Invalid science section value")
        science_article.science_section = science_section
    if status is not None:
        if status not in [e.value for e in schemas.ArticleStatus]:
            raise HTTPException(status_code=400, detail="Invalid status value")
        science_article.status = status
    if current_user.role == "admin" and author_name is not None:
        science_article.author_name = author_name.strip() if author_name else None
    
    if remove_image and science_article.image_url:
        try:
            os.remove(science_article.image_url.lstrip("/"))
            science_article.image_url = None
        except Exception:
            pass
    
    if remove_video and science_article.video_url:
        try:
            os.remove(science_article.video_url.lstrip("/"))
            science_article.video_url = None
        except Exception:
            pass
    
    if image:
        science_article.image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
    
    if video:
        video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
        science_article.video_url = video_url
    
    science_article.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(science_article)
    
    return schemas.ScienceArticleResponse(
        id=science_article.id,
        title=science_article.title,
        content=science_article.content,
        category_id=science_article.category_id,
        section_id=science_article.section_id,
        science_section=science_article.science_section,
        status=science_article.status,
        image_url=science_article.image_url,
        video_url=science_article.video_url,
        views=science_article.views,
        author_id=science_article.author_id,
        author_name=science_article.author_name,
        author_username=current_user.username,
        created_at=science_article.created_at,
        updated_at=science_article.updated_at
    )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_science_article(
    id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                          detail="Not authorized to delete science articles")
    
    science_article = db.query(models.ScienceArticle).filter(models.ScienceArticle.id == id).first()
    
    if not science_article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                          detail="Science article not found")
    
    if science_article.image_url:
        try:
            os.remove(science_article.image_url.lstrip("/"))
        except Exception:
            pass
    
    if science_article.video_url:
        try:
            os.remove(science_article.video_url.lstrip("/"))
        except Exception:
            pass
    
    db.delete(science_article)
    db.commit()
    
    return None