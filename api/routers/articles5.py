# from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
# from sqlalchemy.orm import Session
# from sqlalchemy import or_
# from typing import List, Optional
# from datetime import datetime
# import models, schemas
# from database import get_db
# from .auth import get_current_active_user, UserResponse
# import os
# from pathlib import Path
# import shutil
# import uuid
# import logging

# router = APIRouter(
#     prefix="/culture_urbaine_articles",
#     tags=["Culture Urbaine Articles"],
# )

# # Setup upload directories
# UPLOAD_BASE = Path("uploads")
# UPLOAD_BASE.mkdir(exist_ok=True)
# IMAGE_DIR = UPLOAD_BASE / "images"
# VIDEO_DIR = UPLOAD_BASE / "videos"
# IMAGE_DIR.mkdir(exist_ok=True)
# VIDEO_DIR.mkdir(exist_ok=True)

# ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg'}
# ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm', '.ogg'}

# logger = logging.getLogger(__name__)

# def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
#     ext = Path(filename).suffix.lower()
#     return ext in allowed_extensions

# def save_upload_file(upload_file: UploadFile, directory: Path, allowed_extensions: set) -> str:
#     if not upload_file:
#         return None
        
#     try:
#         if not validate_file_extension(upload_file.filename, allowed_extensions):
#             logger.error(f"Invalid file extension for {upload_file.filename}. Allowed: {allowed_extensions}")
#             raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")
        
#         file_ext = Path(upload_file.filename).suffix
#         filename = f"{uuid.uuid4()}{file_ext}"
#         file_path = directory / filename
        
#         directory.mkdir(parents=True, exist_ok=True)
#         if not os.access(directory, os.W_OK):
#             logger.error(f"Directory not writable: {directory}")
#             raise HTTPException(status_code=500, detail=f"Server cannot write to directory: {directory}")
        
#         with file_path.open("wb") as buffer:
#             shutil.copyfileobj(upload_file.file, buffer)
        
#         if not file_path.exists():
#             logger.error(f"File not found after saving: {file_path}")
#             raise HTTPException(status_code=500, detail="Failed to save file: File not found")
#         if not os.access(file_path, os.R_OK):
#             logger.error(f"File not readable after saving: {file_path}")
#             raise HTTPException(status_code=500, detail="Saved file is not readable")
        
#         logger.info(f"Saved file: {file_path}")
#         return f"/static/uploads/{directory.name}/{filename}"
#     except Exception as e:
#         logger.error(f"Error saving file {upload_file.filename}: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

# @router.get("/", response_model=List[schemas.CultureUrbaineArticleResponse])
# def read_articles(
#     skip: int = 0,
#     limit: int = 100,
#     category_id: Optional[int] = None,
#     recent: Optional[bool] = None,  # New parameter to fetch recent articles
#     Lafrotcham: Optional[bool] = None,
#     Lmusic: Optional[bool] = None,
#     Ldance: Optional[bool] = None,
#     Lrap: Optional[bool] = None,
#     status: Optional[str] = None,
#     db: Session = Depends(get_db)
# ):
#     query = db.query(models.CultureUrbaineArticle)
#     if category_id is not None:
#         query = query.filter(models.CultureUrbaineArticle.category_id == category_id)
#     if status is not None:
#         query = query.filter(models.CultureUrbaineArticle.status == status)
    
#     # Handle artist-related tags (Lmusic, Ldance, Lafrotcham, Lrap)
#     artist_filters = []
#     if Lmusic is not None:
#         artist_filters.append(models.CultureUrbaineArticle.Lmusic == Lmusic)
#     if Ldance is not None:
#         artist_filters.append(models.CultureUrbaineArticle.Ldance == Ldance)
#     if Lafrotcham is not None:
#         artist_filters.append(models.CultureUrbaineArticle.Lafrotcham == Lafrotcham)
#     if Lrap is not None:
#         artist_filters.append(models.CultureUrbaineArticle.Lrap == Lrap)
    
#     if artist_filters:
#         query = query.filter(or_(*artist_filters))
    
#     # Order by created_at for recent articles
#     if recent:
#         query = query.order_by(models.CultureUrbaineArticle.created_at.desc())
    
#     articles = query.offset(skip).limit(limit).all()
#     return articles

# @router.get("/{id}", response_model=schemas.CultureUrbaineArticleDetailResponse)
# def read_article(id: int, db: Session = Depends(get_db)):
#     article = db.query(models.CultureUrbaineArticle).filter(models.CultureUrbaineArticle.id == id).first()
#     if not article:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
#     return article

# @router.post("/", response_model=schemas.CultureUrbaineArticleResponse, status_code=status.HTTP_201_CREATED)
# def create_article(
#     title: str = Form(...),
#     content: str = Form(...),
#     category_id: int = Form(...),
#     section_id: Optional[int] = Form(None),
#     status: str = Form(default="draft"),
#     author_name: Optional[str] = Form(None),
#     Lmusic: bool = Form(False),
#     Ldance: bool = Form(False),
#     Lafrotcham: bool = Form(False),
#     Lrap: bool = Form(False),
#     image: Optional[UploadFile] = File(None),
#     video: Optional[UploadFile] = File(None),
#     db: Session = Depends(get_db),
#     current_user: UserResponse = Depends(get_current_active_user)
# ):
#     # Verify category exists
#     category = db.query(models.Category).filter(models.Category.id == category_id).first()
#     if not category:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Catégorie invalide")
    
#     # Verify section exists if provided
#     if section_id:
#         section = db.query(models.Section).filter(models.Section.id == section_id).first()
#         if not section:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Section invalide")
    
#     # Validate status
#     if status not in [e.value for e in schemas.ArticleStatus]:
#         raise HTTPException(status_code=400, detail="Invalid status value")
    
#     # Handle file uploads
#     image_url = None
#     video_url = None
#     if image:
#         image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
#     if video:
#         video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
    
#     # Create article
#     db_article = models.CultureUrbaineArticle(
#         title=title.strip(),
#         content=content.strip(),
#         category_id=category_id,
#         section_id=section_id,
#         status=status,
#         image_url=image_url,
#         video_url=video_url,
#         author_id=current_user.id,
#         author_name=author_name.strip() if current_user.role == "admin" and author_name else current_user.username,
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow(),
#         Lmusic=Lmusic,
#         Ldance=Ldance,
#         Lafrotcham=Lafrotcham,
#         Lrap=Lrap
#     )
#     db.add(db_article)
#     db.commit()
#     db.refresh(db_article)
#     return db_article

# @router.put("/{id}", response_model=schemas.CultureUrbaineArticleResponse)
# def update_article(
#     id: int,
#     title: Optional[str] = Form(None),
#     content: Optional[str] = Form(None),
#     category_id: Optional[int] = Form(None),
#     section_id: Optional[int] = Form(None),
#     status: Optional[str] = Form(None),
#     author_name: Optional[str] = Form(None),
#     Lmusic: Optional[bool] = Form(None),
#     Ldance: Optional[bool] = Form(None),
#     Lafrotcham: Optional[bool] = Form(None),
#     Lrap: Optional[bool] = Form(None),
#     remove_image: bool = Form(False),
#     remove_video: bool = Form(False),
#     image: Optional[UploadFile] = File(None),
#     video: Optional[UploadFile] = File(None),
#     db: Session = Depends(get_db),
#     current_user: UserResponse = Depends(get_current_active_user)
# ):
#     db_article = db.query(models.CultureUrbaineArticle).filter(models.CultureUrbaineArticle.id == id).first()
#     if not db_article:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
    
#     # Verify user is author or admin
#     if db_article.author_id != current_user.id and current_user.role != "admin":
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé à modifier cet article")
    
#     # Verify category exists if provided
#     if category_id is not None:
#         category = db.query(models.Category).filter(models.Category.id == category_id).first()
#         if not category:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Catégorie invalide")
#         db_article.category_id = category_id
    
#     # Verify section exists if provided
#     if section_id is not None:
#         section = db.query(models.Section).filter(models.Section.id == section_id).first()
#         if not section:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Section invalide")
#         db_article.section_id = section_id
    
#     # Update fields if provided
#     if title is not None:
#         db_article.title = title.strip()
#     if content is not None:
#         db_article.content = content.strip()
#     if status is not None:
#         if status not in [e.value for e in schemas.ArticleStatus]:
#             raise HTTPException(status_code=400, detail="Invalid status value")
#         db_article.status = status
#     if current_user.role == "admin" and author_name is not None:
#         db_article.author_name = author_name.strip() if author_name else None
#     if Lmusic is not None:
#         db_article.Lmusic = Lmusic
#     if Ldance is not None:
#         db_article.Ldance = Ldance
#     if Lafrotcham is not None:
#         db_article.Lafrotcham = Lafrotcham
#     if Lrap is not None:
#         db_article.Lrap = Lrap
    
#     # Handle file removals
#     if remove_image and db_article.image_url:
#         try:
#             os.remove(db_article.image_url.lstrip("/"))
#             db_article.image_url = None
#         except Exception as e:
#             logger.warning(f"Failed to remove image {db_article.image_url}: {str(e)}")
    
#     if remove_video and db_article.video_url:
#         try:
#             os.remove(db_article.video_url.lstrip("/"))
#             db_article.video_url = None
#         except Exception as e:
#             logger.warning(f"Failed to remove video {db_article.video_url}: {str(e)}")
    
#     # Handle file uploads
#     if image:
#         db_article.image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
#     if video:
#         db_article.video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
    
#     db_article.updated_at = datetime.utcnow()
    
#     db.commit()
#     db.refresh(db_article)
#     return db_article

# @router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_article(id: int, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_active_user)):
#     db_article = db.query(models.CultureUrbaineArticle).filter(models.CultureUrbaineArticle.id == id).first()
#     if not db_article:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
    
#     # Verify user is author or admin
#     if db_article.author_id != current_user.id and current_user.role != "admin":
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé à supprimer cet article")
    
#     # Remove associated files
#     if db_article.image_url:
#         try:
#             os.remove(db_article.image_url.lstrip("/"))
#         except Exception as e:
#             logger.warning(f"Failed to remove image {db_article.image_url}: {str(e)}")
    
#     if db_article.video_url:
#         try:
#             os.remove(db_article.video_url.lstrip("/"))
#         except Exception as e:
#             logger.warning(f"Failed to remove video {db_article.video_url}: {str(e)}")
    
#     db.delete(db_article)
#     db.commit()
#     return







from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
import models, schemas
from database import get_db
from .auth import get_current_active_user, UserResponse
import os
from pathlib import Path
import shutil
import uuid
import logging

router = APIRouter(
    prefix="/culture_urbaine_articles",
    tags=["Culture Urbaine Articles"],
)

# Setup upload directories
UPLOAD_BASE = Path("uploads")
UPLOAD_BASE.mkdir(exist_ok=True)
IMAGE_DIR = UPLOAD_BASE / "images"
VIDEO_DIR = UPLOAD_BASE / "videos"
AUDIO_DIR = UPLOAD_BASE / "audio"  # New audio directory
IMAGE_DIR.mkdir(exist_ok=True)
VIDEO_DIR.mkdir(exist_ok=True)
AUDIO_DIR.mkdir(exist_ok=True)  # Create audio directory

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm', '.ogg'}
ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.aac'}  # New audio extensions

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

@router.get("/", response_model=List[schemas.CultureUrbaineArticleResponse])
def read_articles(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    recent: Optional[bool] = None,  # New parameter to fetch recent articles
    Lafrotcham: Optional[bool] = None,
    Lmusic: Optional[bool] = None,
    Ldance: Optional[bool] = None,
    Lrap: Optional[bool] = None,
    status: Optional[str] = None,
    has_audio: Optional[bool] = None,  # New parameter to filter articles with audio
    db: Session = Depends(get_db)
):
    query = db.query(models.CultureUrbaineArticle)
    if category_id is not None:
        query = query.filter(models.CultureUrbaineArticle.category_id == category_id)
    if status is not None:
        query = query.filter(models.CultureUrbaineArticle.status == status)
    if has_audio is not None:
        if has_audio:
            query = query.filter(models.CultureUrbaineArticle.audio_url.isnot(None))
        else:
            query = query.filter(models.CultureUrbaineArticle.audio_url.is_(None))
    
    # Handle artist-related tags (Lmusic, Ldance, Lafrotcham, Lrap)
    artist_filters = []
    if Lmusic is not None:
        artist_filters.append(models.CultureUrbaineArticle.Lmusic == Lmusic)
    if Ldance is not None:
        artist_filters.append(models.CultureUrbaineArticle.Ldance == Ldance)
    if Lafrotcham is not None:
        artist_filters.append(models.CultureUrbaineArticle.Lafrotcham == Lafrotcham)
    if Lrap is not None:
        artist_filters.append(models.CultureUrbaineArticle.Lrap == Lrap)
    
    if artist_filters:
        query = query.filter(or_(*artist_filters))
    
    # Order by created_at for recent articles
    if recent:
        query = query.order_by(models.CultureUrbaineArticle.created_at.desc())
    
    articles = query.offset(skip).limit(limit).all()
    return articles

@router.get("/songs", response_model=List[schemas.CultureUrbaineArticleResponse])
def read_songs(
    skip: int = 0,
    limit: int = 20,
    category_id: Optional[int] = None,
    status: str = "published",
    db: Session = Depends(get_db)
):
    """Get articles that have audio files (songs) for the main page"""
    query = db.query(models.CultureUrbaineArticle).filter(
        models.CultureUrbaineArticle.audio_url.isnot(None),
        models.CultureUrbaineArticle.status == status
    )
    
    if category_id is not None:
        query = query.filter(models.CultureUrbaineArticle.category_id == category_id)
    
    # Order by created_at desc to show newest songs first
    query = query.order_by(models.CultureUrbaineArticle.created_at.desc())
    
    songs = query.offset(skip).limit(limit).all()
    return songs

@router.get("/{id}", response_model=schemas.CultureUrbaineArticleDetailResponse)
def read_article(id: int, db: Session = Depends(get_db)):
    article = db.query(models.CultureUrbaineArticle).filter(models.CultureUrbaineArticle.id == id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
    return article

@router.post("/", response_model=schemas.CultureUrbaineArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(
    title: str = Form(...),
    content: str = Form(...),
    category_id: int = Form(...),
    section_id: Optional[int] = Form(None),
    status: str = Form(default="draft"),
    author_name: Optional[str] = Form(None),
    Lmusic: bool = Form(False),
    Ldance: bool = Form(False),
    Lafrotcham: bool = Form(False),
    Lrap: bool = Form(False),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),  # New audio parameter
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_active_user)
):
    # Verify category exists
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Catégorie invalide")
    
    # Verify section exists if provided
    if section_id:
        section = db.query(models.Section).filter(models.Section.id == section_id).first()
        if not section:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Section invalide")
    
    # Validate status
    if status not in [e.value for e in schemas.ArticleStatus]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    
    # Handle file uploads
    image_url = None
    video_url = None
    audio_url = None  # New audio URL
    if image:
        image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
    if video:
        video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
    if audio:  # Handle audio upload
        audio_url = save_upload_file(audio, AUDIO_DIR, ALLOWED_AUDIO_EXTENSIONS)
    
    # Create article
    db_article = models.CultureUrbaineArticle(
        title=title.strip(),
        content=content.strip(),
        category_id=category_id,
        section_id=section_id,
        status=status,
        image_url=image_url,
        video_url=video_url,
        audio_url=audio_url,  # Add audio URL to model
        author_id=current_user.id,
        author_name=author_name.strip() if current_user.role == "admin" and author_name else current_user.username,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        Lmusic=Lmusic,
        Ldance=Ldance,
        Lafrotcham=Lafrotcham,
        Lrap=Lrap
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

@router.put("/{id}", response_model=schemas.CultureUrbaineArticleResponse)
def update_article(
    id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    section_id: Optional[int] = Form(None),
    status: Optional[str] = Form(None),
    author_name: Optional[str] = Form(None),
    Lmusic: Optional[bool] = Form(None),
    Ldance: Optional[bool] = Form(None),
    Lafrotcham: Optional[bool] = Form(None),
    Lrap: Optional[bool] = Form(None),
    remove_image: bool = Form(False),
    remove_video: bool = Form(False),
    remove_audio: bool = Form(False),  # New audio removal parameter
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),  # New audio parameter
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_active_user)
):
    db_article = db.query(models.CultureUrbaineArticle).filter(models.CultureUrbaineArticle.id == id).first()
    if not db_article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
    
    # Verify user is author or admin
    if db_article.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé à modifier cet article")
    
    # Verify category exists if provided
    if category_id is not None:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Catégorie invalide")
        db_article.category_id = category_id
    
    # Verify section exists if provided
    if section_id is not None:
        section = db.query(models.Section).filter(models.Section.id == section_id).first()
        if not section:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Section invalide")
        db_article.section_id = section_id
    
    # Update fields if provided
    if title is not None:
        db_article.title = title.strip()
    if content is not None:
        db_article.content = content.strip()
    if status is not None:
        if status not in [e.value for e in schemas.ArticleStatus]:
            raise HTTPException(status_code=400, detail="Invalid status value")
        db_article.status = status
    if current_user.role == "admin" and author_name is not None:
        db_article.author_name = author_name.strip() if author_name else None
    if Lmusic is not None:
        db_article.Lmusic = Lmusic
    if Ldance is not None:
        db_article.Ldance = Ldance
    if Lafrotcham is not None:
        db_article.Lafrotcham = Lafrotcham
    if Lrap is not None:
        db_article.Lrap = Lrap
    
    # Handle file removals
    if remove_image and db_article.image_url:
        try:
            os.remove(db_article.image_url.lstrip("/"))
            db_article.image_url = None
        except Exception as e:
            logger.warning(f"Failed to remove image {db_article.image_url}: {str(e)}")
    
    if remove_video and db_article.video_url:
        try:
            os.remove(db_article.video_url.lstrip("/"))
            db_article.video_url = None
        except Exception as e:
            logger.warning(f"Failed to remove video {db_article.video_url}: {str(e)}")
    
    if remove_audio and db_article.audio_url:  # Handle audio removal
        try:
            os.remove(db_article.audio_url.lstrip("/"))
            db_article.audio_url = None
        except Exception as e:
            logger.warning(f"Failed to remove audio {db_article.audio_url}: {str(e)}")
    
    # Handle file uploads
    if image:
        db_article.image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
    if video:
        db_article.video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
    if audio:  # Handle audio upload
        db_article.audio_url = save_upload_file(audio, AUDIO_DIR, ALLOWED_AUDIO_EXTENSIONS)
    
    db_article.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_article)
    return db_article

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(id: int, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_active_user)):
    db_article = db.query(models.CultureUrbaineArticle).filter(models.CultureUrbaineArticle.id == id).first()
    if not db_article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
    
    # Verify user is author or admin
    if db_article.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé à supprimer cet article")
    
    # Remove associated files
    if db_article.image_url:
        try:
            os.remove(db_article.image_url.lstrip("/"))
        except Exception as e:
            logger.warning(f"Failed to remove image {db_article.image_url}: {str(e)}")
    
    if db_article.video_url:
        try:
            os.remove(db_article.video_url.lstrip("/"))
        except Exception as e:
            logger.warning(f"Failed to remove video {db_article.video_url}: {str(e)}")
    
    if db_article.audio_url:  # Remove audio file
        try:
            os.remove(db_article.audio_url.lstrip("/"))
        except Exception as e:
            logger.warning(f"Failed to remove audio {db_article.audio_url}: {str(e)}")
    
    db.delete(db_article)
    db.commit()
    return




# @router.post("/songs", response_model=schemas.SongResponse, status_code=status.HTTP_201_CREATED)
# def create_song(
#     title: str = Form(...),
#     artist_name: Optional[str] = Form(None),
#     category_id: Optional[int] = Form(None),
#     status: str = Form(default="published"),
#     audio: UploadFile = File(...),
#     image: Optional[UploadFile] = File(None),
#     db: Session = Depends(get_db),
#     current_user: UserResponse = Depends(get_current_active_user)
# ):
#     # Verify category exists if provided
#     if category_id:
#         category = db.query(models.Category).filter(models.Category.id == category_id).first()
#         if not category:
#             raise HTTPException(status_code=400, detail="Invalid category")

#     # Validate status
#     if status not in ["draft", "published"]:
#         raise HTTPException(status_code=400, detail="Invalid status value")

#     # Handle file uploads
#     audio_url = save_upload_file(audio, AUDIO_DIR, ALLOWED_AUDIO_EXTENSIONS)
#     image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS) if image else None

#     # Create song
#     db_song = models.Song(
#         title=title.strip(),
#         artist_name=artist_name.strip() if artist_name else None,
#         audio_url=audio_url,
#         image_url=image_url,
#         category_id=category_id,
#         status=status,
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow()
#     )
#     db.add(db_song)
#     db.commit()
#     db.refresh(db_song)
#     return db_song

# @router.get("/songs", response_model=List[schemas.SongResponse])
# def read_songs(
#     skip: int = 0,
#     limit: int = 20,
#     category_id: Optional[int] = None,
#     status: str = "published",
#     db: Session = Depends(get_db)
# ):
#     """Get standalone songs for the main page"""
#     query = db.query(models.Song).filter(models.Song.status == status)
    
#     if category_id is not None:
#         query = query.filter(models.Song.category_id == category_id)
    
#     # Order by created_at desc to show newest songs first
#     query = query.order_by(models.Song.created_at.desc())
    
#     songs = query.offset(skip).limit(limit).all()
#     return songs

# @router.put("/songs/{id}", response_model=schemas.SongResponse)
# def update_song(
#     id: int,
#     title: Optional[str] = Form(None),
#     artist_name: Optional[str] = Form(None),
#     category_id: Optional[int] = Form(None),
#     status: Optional[str] = Form(None),
#     remove_audio: bool = Form(False),
#     remove_image: bool = Form(False),
#     audio: Optional[UploadFile] = File(None),
#     image: Optional[UploadFile] = File(None),
#     db: Session = Depends(get_db),
#     current_user: UserResponse = Depends(get_current_active_user)
# ):
#     db_song = db.query(models.Song).filter(models.Song.id == id).first()
#     if not db_song:
#         raise HTTPException(status_code=404, detail="Song not found")

#     # Verify category exists if provided
#     if category_id is not None:
#         category = db.query(models.Category).filter(models.Category.id == category_id).first()
#         if not category:
#             raise HTTPException(status_code=400, detail="Invalid category")
#         db_song.category_id = category_id

#     # Update fields if provided
#     if title is not None:
#         db_song.title = title.strip()
#     if artist_name is not None:
#         db_song.artist_name = artist_name.strip() if artist_name else None
#     if status is not None:
#         if status not in ["draft", "published"]:
#             raise HTTPException(status_code=400, detail="Invalid status value")
#         db_song.status = status

#     # Handle file removals
#     if remove_audio and db_song.audio_url:
#         try:
#             os.remove(db_song.audio_url.lstrip("/"))
#             db_song.audio_url = None
#         except Exception as e:
#             logger.warning(f"Failed to remove audio {db_song.audio_url}: {str(e)}")
    
#     if remove_image and db_song.image_url:
#         try:
#             os.remove(db_song.image_url.lstrip("/"))
#             db_song.image_url = None
#         except Exception as e:
#             logger.warning(f"Failed to remove image {db_song.image_url}: {str(e)}")

#     # Handle file uploads
#     if audio:
#         db_song.audio_url = save_upload_file(audio, AUDIO_DIR, ALLOWED_AUDIO_EXTENSIONS)
#     if image:
#         db_song.image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)

#     db_song.updated_at = datetime.utcnow()
    
#     db.commit()
#     db.refresh(db_song)
#     return db_song

# @router.delete("/songs/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_song(id: int, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_active_user)):
#     db_song = db.query(models.Song).filter(models.Song.id == id).first()
#     if not db_song:
#         raise HTTPException(status_code=404, detail="Song not found")

#     # Remove associated files
#     if db_song.audio_url:
#         try:
#             os.remove(db_song.audio_url.lstrip("/"))
#         except Exception as e:
#             logger.warning(f"Failed to remove audio {db_song.audio_url}: {str(e)}")
    
#     if db_song.image_url:
#         try:
#             os.remove(db_song.image_url.lstrip("/"))
#         except Exception as e:
#             logger.warning(f"Failed to remove image {db_song.image_url}: {str(e)}")

#     db.delete(db_song)
#     db.commit()
#     return



# from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
# from sqlalchemy.orm import Session
# from sqlalchemy import or_
# from typing import List, Optional
# from datetime import datetime
# import models, schemas
# from database import get_db
# from .auth import get_current_active_user, UserResponse
# import os
# from pathlib import Path
# import shutil
# import uuid
# import logging

# router = APIRouter(
#     prefix="/culture_urbaine_articles",
#     tags=["Culture Urbaine Articles"],
# )

# # Setup upload directories
# UPLOAD_BASE = Path("uploads")
# UPLOAD_BASE.mkdir(exist_ok=True)
# IMAGE_DIR = UPLOAD_BASE / "images"
# VIDEO_DIR = UPLOAD_BASE / "videos"
# AUDIO_DIR = UPLOAD_BASE / "audio"
# IMAGE_DIR.mkdir(exist_ok=True)
# VIDEO_DIR.mkdir(exist_ok=True)
# AUDIO_DIR.mkdir(exist_ok=True)

# ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg'}
# ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm', '.ogg'}
# ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.aac'}

# logger = logging.getLogger(__name__)

# def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
#     ext = Path(filename).suffix.lower()
#     return ext in allowed_extensions

# def save_upload_file(upload_file: UploadFile, directory: Path, allowed_extensions: set) -> str:
#     if not upload_file:
#         return None
#     try:
#         if not validate_file_extension(upload_file.filename, allowed_extensions):
#             logger.error(f"Invalid file extension for {upload_file.filename}. Allowed: {allowed_extensions}")
#             raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")
#         file_ext = Path(upload_file.filename).suffix
#         filename = f"{uuid.uuid4()}{file_ext}"
#         file_path = directory / filename
#         directory.mkdir(parents=True, exist_ok=True)
#         if not os.access(directory, os.W_OK):
#             logger.error(f"Directory not writable: {directory}")
#             raise HTTPException(status_code=500, detail=f"Server cannot write to directory: {directory}")
#         with file_path.open("wb") as buffer:
#             shutil.copyfileobj(upload_file.file, buffer)
#         if not file_path.exists():
#             logger.error(f"File not found after saving: {file_path}")
#             raise HTTPException(status_code=500, detail="Failed to save file: File not found")
#         if not os.access(file_path, os.R_OK):
#             logger.error(f"File not readable after saving: {file_path}")
#             raise HTTPException(status_code=500, detail="Saved file is not readable")
#         logger.info(f"Saved file: {file_path}")
#         return f"/static/uploads/{directory.name}/{filename}"
#     except Exception as e:
#         logger.error(f"Error saving file {upload_file.filename}: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

# # Songs endpoints (moved to top to avoid conflict with /{id})
# @router.get("/songs", response_model=List[schemas.SongResponse])
# def read_songs(
#     skip: int = 0,
#     limit: int = 20,
#     category_id: Optional[int] = None,
#     status: str = "published",
#     db: Session = Depends(get_db)
# ):
#     """Get songs, defaulting to Culture Urbaine if no category_id"""
#     query = db.query(models.Song).filter(models.Song.status == status)
    
#     # Default to Culture Urbaine if no category_id
#     if category_id is None:
#         culture_urbaine_id = get_culture_urbaine_category_id(db)
#         if culture_urbaine_id:
#             query = query.filter(models.Song.category_id == culture_urbaine_id)
#     elif category_id > 0:
#         category = db.query(models.Category).filter(models.Category.id == category_id).first()
#         if category:
#             query = query.filter(models.Song.category_id == category_id)
#         else:
#             logger.warning(f"Invalid category_id: {category_id}")
    
#     query = query.order_by(models.Song.created_at.desc())
#     songs = query.offset(skip).limit(limit).all()
#     return songs

# @router.post("/songs", response_model=schemas.SongResponse, status_code=status.HTTP_201_CREATED)
# def create_song(
#     title: str = Form(...),
#     artist_name: Optional[str] = Form(None),
#     category_id: Optional[int] = Form(None),
#     status: str = Form(default="published"),
#     audio: UploadFile = File(...),
#     image: Optional[UploadFile] = File(None),
#     db: Session = Depends(get_db),
#     current_user: UserResponse = Depends(get_current_active_user)
# ):
#     """Create a song, defaulting to Culture Urbaine"""
#     final_category_id = None
    
#     # Use provided category_id if valid
#     if category_id and category_id > 0:
#         category = db.query(models.Category).filter(models.Category.id == category_id).first()
#         if not category:
#             raise HTTPException(status_code=400, detail="Invalid category ID")
#         final_category_id = category_id
#     else:
#         # Default to Culture Urbaine
#         culture_urbaine_id = get_culture_urbaine_category_id(db)
#         if culture_urbaine_id:
#             final_category_id = culture_urbaine_id
#         elif category_id is not None:
#             raise HTTPException(status_code=400, detail="Invalid category ID")

#     if status not in ["draft", "published"]:
#         raise HTTPException(status_code=400, detail="Invalid status value")
    
#     audio_url = save_upload_file(audio, AUDIO_DIR, ALLOWED_AUDIO_EXTENSIONS)
#     image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS) if image else None
    
#     db_song = models.Song(
#         title=title.strip(),
#         artist_name=artist_name.strip() if artist_name else None,
#         audio_url=audio_url,
#         image_url=image_url,
#         category_id=final_category_id,
#         status=status,
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow()
#     )
#     db.add(db_song)
#     db.commit()
#     db.refresh(db_song)
#     return db_song

# @router.put("/songs/{id}", response_model=schemas.SongResponse)
# def update_song(
#     id: int,
#     title: Optional[str] = Form(None),
#     artist_name: Optional[str] = Form(None),
#     category_id: Optional[int] = Form(None),
#     status: Optional[str] = Form(None),
#     remove_audio: bool = Form(False),
#     remove_image: bool = Form(False),
#     audio: Optional[UploadFile] = File(None),
#     image: Optional[UploadFile] = File(None),
#     db: Session = Depends(get_db),
#     current_user: UserResponse = Depends(get_current_active_user)
# ):
#     db_song = db.query(models.Song).filter(models.Song.id == id).first()
#     if not db_song:
#         raise HTTPException(status_code=404, detail="Song not found")
    
#     if category_id is not None and category_id > 0:
#         category = db.query(models.Category).filter(models.Category.id == category_id).first()
#         if not category:
#             raise HTTPException(status_code=400, detail="Invalid category ID")
#         db_song.category_id = category_id
#     elif category_id == 0 or category_id is not None:
#         # Default to Culture Urbaine if category_id is explicitly set to null/0
#         culture_urbaine_id = get_culture_urbaine_category_id(db)
#         db_song.category_id = culture_urbaine_id if culture_urbaine_id else None
    
#     if title is not None:
#         db_song.title = title.strip()
#     if artist_name is not None:
#         db_song.artist_name = artist_name.strip() if artist_name else None
#     if status is not None:
#         if status not in ["draft", "published"]:
#             raise HTTPException(status_code=400, detail="Invalid status value")
#         db_song.status = status
#     if remove_audio and db_song.audio_url:
#         try:
#             os.remove(db_song.audio_url.lstrip("/"))
#             db_song.audio_url = None
#         except Exception as e:
#             logger.warning(f"Failed to remove audio {db_song.audio_url}: {str(e)}")
#     if remove_image and db_song.image_url:
#         try:
#             os.remove(db_song.image_url.lstrip("/"))
#             db_song.image_url = None
#         except Exception as e:
#             logger.warning(f"Failed to remove image {db_song.image_url}: {str(e)}")
#     if audio:
#         db_song.audio_url = save_upload_file(audio, AUDIO_DIR, ALLOWED_AUDIO_EXTENSIONS)
#     if image:
#         db_song.image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
#     db_song.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(db_song)
#     return db_song

# @router.delete("/songs/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_song(id: int, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_active_user)):
#     db_song = db.query(models.Song).filter(models.Song.id == id).first()
#     if not db_song:
#         raise HTTPException(status_code=404, detail="Song not found")
#     if db_song.audio_url:
#         try:
#             os.remove(db_song.audio_url.lstrip("/"))
#         except Exception as e:
#             logger.warning(f"Failed to remove audio {db_song.audio_url}: {str(e)}")
#     if db_song.image_url:
#         try:
#             os.remove(db_song.image_url.lstrip("/"))
#         except Exception as e:
#             logger.warning(f"Failed to remove image {db_song.image_url}: {str(e)}")
#     db.delete(db_song)
#     db.commit()
#     return

# # Article endpoints
# @router.get("/", response_model=List[schemas.CultureUrbaineArticleResponse])
# def read_articles(
#     skip: int = 0,
#     limit: int = 100,
#     category_id: Optional[int] = None,
#     recent: Optional[bool] = None,
#     Lafrotcham: Optional[bool] = None,
#     Lmusic: Optional[bool] = None,
#     Ldance: Optional[bool] = None,
#     Lrap: Optional[bool] = None,
#     status: Optional[str] = None,
#     has_audio: Optional[bool] = None,
#     db: Session = Depends(get_db)
# ):
#     query = db.query(models.CultureUrbaineArticle)
#     if category_id is not None:
#         query = query.filter(models.CultureUrbaineArticle.category_id == category_id)
#     if status is not None:
#         query = query.filter(models.CultureUrbaineArticle.status == status)
#     if has_audio is not None:
#         if has_audio:
#             query = query.filter(models.CultureUrbaineArticle.audio_url.isnot(None))
#         else:
#             query = query.filter(models.CultureUrbaineArticle.audio_url.is_(None))
#     artist_filters = []
#     if Lmusic is not None:
#         artist_filters.append(models.CultureUrbaineArticle.Lmusic == Lmusic)
#     if Ldance is not None:
#         artist_filters.append(models.CultureUrbaineArticle.Ldance == Ldance)
#     if Lafrotcham is not None:
#         artist_filters.append(models.CultureUrbaineArticle.Lafrotcham == Lafrotcham)
#     if Lrap is not None:
#         artist_filters.append(models.CultureUrbaineArticle.Lrap == Lrap)
#     if artist_filters:
#         query = query.filter(or_(*artist_filters))
#     if recent:
#         query = query.order_by(models.CultureUrbaineArticle.created_at.desc())
#     articles = query.offset(skip).limit(limit).all()
#     return articles

# @router.get("/{id}", response_model=schemas.CultureUrbaineArticleDetailResponse)
# def read_article(id: int, db: Session = Depends(get_db)):
#     article = db.query(models.CultureUrbaineArticle).filter(models.CultureUrbaineArticle.id == id).first()
#     if not article:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
#     return article

# @router.post("/", response_model=schemas.CultureUrbaineArticleResponse, status_code=status.HTTP_201_CREATED)
# def create_article(
#     title: str = Form(...),
#     content: str = Form(...),
#     category_id: int = Form(...),
#     section_id: Optional[int] = Form(None),
#     status: str = Form(default="draft"),
#     author_name: Optional[str] = Form(None),
#     Lmusic: bool = Form(False),
#     Ldance: bool = Form(False),
#     Lafrotcham: bool = Form(False),
#     Lrap: bool = Form(False),
#     image: Optional[UploadFile] = File(None),
#     video: Optional[UploadFile] = File(None),
#     audio: Optional[UploadFile] = File(None),
#     db: Session = Depends(get_db),
#     current_user: UserResponse = Depends(get_current_active_user)
# ):
#     category = db.query(models.Category).filter(models.Category.id == category_id).first()
#     if not category:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Catégorie invalide")
#     if section_id:
#         section = db.query(models.Section).filter(models.Section.id == section_id).first()
#         if not section:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Section invalide")
#     if status not in [e.value for e in schemas.ArticleStatus]:
#         raise HTTPException(status_code=400, detail="Invalid status value")
#     image_url = None
#     video_url = None
#     audio_url = None
#     if image:
#         image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
#     if video:
#         video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
#     if audio:
#         audio_url = save_upload_file(audio, AUDIO_DIR, ALLOWED_AUDIO_EXTENSIONS)
#     db_article = models.CultureUrbaineArticle(
#         title=title.strip(),
#         content=content.strip(),
#         category_id=category_id,
#         section_id=section_id,
#         status=status,
#         image_url=image_url,
#         video_url=video_url,
#         audio_url=audio_url,
#         author_id=current_user.id,
#         author_name=author_name.strip() if current_user.role == "admin" and author_name else current_user.username,
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow(),
#         Lmusic=Lmusic,
#         Ldance=Ldance,
#         Lafrotcham=Lafrotcham,
#         Lrap=Lrap
#     )
#     db.add(db_article)
#     db.commit()
#     db.refresh(db_article)
#     return db_article

# @router.put("/{id}", response_model=schemas.CultureUrbaineArticleResponse)
# def update_article(
#     id: int,
#     title: Optional[str] = Form(None),
#     content: Optional[str] = Form(None),
#     category_id: Optional[int] = Form(None),
#     section_id: Optional[int] = Form(None),
#     status: Optional[str] = Form(None),
#     author_name: Optional[str] = Form(None),
#     Lmusic: Optional[bool] = Form(None),
#     Ldance: Optional[bool] = Form(None),
#     Lafrotcham: Optional[bool] = Form(None),
#     Lrap: Optional[bool] = Form(None),
#     remove_image: bool = Form(False),
#     remove_video: bool = Form(False),
#     remove_audio: bool = Form(False),
#     image: Optional[UploadFile] = File(None),
#     video: Optional[UploadFile] = File(None),
#     audio: Optional[UploadFile] = File(None),
#     db: Session = Depends(get_db),
#     current_user: UserResponse = Depends(get_current_active_user)
# ):
#     db_article = db.query(models.CultureUrbaineArticle).filter(models.CultureUrbaineArticle.id == id).first()
#     if not db_article:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
#     if db_article.author_id != current_user.id and current_user.role != "admin":
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé à modifier cet article")
#     if category_id is not None:
#         category = db.query(models.Category).filter(models.Category.id == category_id).first()
#         if not category:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Catégorie invalide")
#         db_article.category_id = category_id
#     if section_id is not None:
#         section = db.query(models.Section).filter(models.Section.id == section_id).first()
#         if not section:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Section invalide")
#         db_article.section_id = section_id
#     if title is not None:
#         db_article.title = title.strip()
#     if content is not None:
#         db_article.content = content.strip()
#     if status is not None:
#         if status not in [e.value for e in schemas.ArticleStatus]:
#             raise HTTPException(status_code=400, detail="Invalid status value")
#         db_article.status = status
#     if current_user.role == "admin" and author_name is not None:
#         db_article.author_name = author_name.strip() if author_name else None
#     if Lmusic is not None:
#         db_article.Lmusic = Lmusic
#     if Ldance is not None:
#         db_article.Ldance = Ldance
#     if Lafrotcham is not None:
#         db_article.Lafrotcham = Lafrotcham
#     if Lrap is not None:
#         db_article.Lrap = Lrap
#     if remove_image and db_article.image_url:
#         try:
#             os.remove(db_article.image_url.lstrip("/"))
#             db_article.image_url = None
#         except Exception as e:
#             logger.warning(f"Failed to remove image {db_article.image_url}: {str(e)}")
#     if remove_video and db_article.video_url:
#         try:
#             os.remove(db_article.video_url.lstrip("/"))
#             db_article.video_url = None
#         except Exception as e:
#             logger.warning(f"Failed to remove video {db_article.video_url}: {str(e)}")
#     if remove_audio and db_article.audio_url:
#         try:
#             os.remove(db_article.audio_url.lstrip("/"))
#             db_article.audio_url = None
#         except Exception as e:
#             logger.warning(f"Failed to remove audio {db_article.audio_url}: {str(e)}")
#     if image:
#         db_article.image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
#     if video:
#         db_article.video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
#     if audio:
#         db_article.audio_url = save_upload_file(audio, AUDIO_DIR, ALLOWED_AUDIO_EXTENSIONS)
#     db_article.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(db_article)
#     return db_article

# @router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_article(id: int, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_active_user)):
#     db_article = db.query(models.CultureUrbaineArticle).filter(models.CultureUrbaineArticle.id == id).first()
#     if not db_article:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
#     if db_article.author_id != current_user.id and current_user.role != "admin":
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé à supprimer cet article")
#     if db_article.image_url:
#         try:
#             os.remove(db_article.image_url.lstrip("/"))
#         except Exception as e:
#             logger.warning(f"Failed to remove image {db_article.image_url}: {str(e)}")
#     if db_article.video_url:
#         try:
#             os.remove(db_article.video_url.lstrip("/"))
#         except Exception as e:
#             logger.warning(f"Failed to remove video {db_article.video_url}: {str(e)}")
#     if db_article.audio_url:
#         try:
#             os.remove(db_article.audio_url.lstrip("/"))
#         except Exception as e:
#             logger.warning(f"Failed to remove audio {db_article.audio_url}: {str(e)}")
#     db.delete(db_article)
#     db.commit()
#     return