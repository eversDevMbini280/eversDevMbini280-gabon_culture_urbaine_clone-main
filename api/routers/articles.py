from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Query
from fastapi.responses import Response
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import os
from datetime import datetime, timedelta
from pathlib import Path
import logging
from PIL import Image, ImageDraw, ImageFont
import io

import models, schemas, database
from database import get_db
from . import auth

import cloudinary
import cloudinary.uploader
import cloudinary.api

# ─── Configuration Cloudinary ───────────────────────────────────────────────
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "dnpzxmzjq"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "231479671936767"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "q9oiNmrF3Ya9YM-1k3Ncjd1QO4s")
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/articles",
    tags=["articles"],
)

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm'}
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB
MAX_IMAGE_SIZE = 10 * 1024 * 1024   # 10MB


# ─── Utilitaires ────────────────────────────────────────────────────────────

def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in allowed_extensions


def save_upload_file(upload_file: UploadFile, directory: Path, allowed_extensions: set) -> tuple[str, Optional[float]]:
    """Upload le fichier sur Cloudinary et retourne (url, duration)."""
    if not upload_file or not upload_file.filename:
        return None, None

    if not validate_file_extension(upload_file.filename, allowed_extensions):
        logger.error(f"Extension invalide: {upload_file.filename}")
        raise HTTPException(status_code=400, detail=f"Type de fichier invalide. Autorisés: {', '.join(allowed_extensions)}")

    is_video = upload_file.filename.lower().endswith(('.mp4', '.webm'))

    if is_video and upload_file.size and upload_file.size > MAX_VIDEO_SIZE:
        raise HTTPException(status_code=413, detail=f"Vidéo trop lourde. Max: {MAX_VIDEO_SIZE // (1024*1024)}MB")
    if not is_video and upload_file.size and upload_file.size > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail=f"Image trop lourde. Max: {MAX_IMAGE_SIZE // (1024*1024)}MB")

    try:
        result = cloudinary.uploader.upload(
            upload_file.file,
            folder="gcutv",
            resource_type="video" if is_video else "image"
        )
        url = result["secure_url"]
        logger.info(f"Fichier uploadé sur Cloudinary: {url}")
        return url, None
    except Exception as e:
        logger.error(f"Erreur upload Cloudinary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Échec de l'upload: {str(e)}")


def delete_cloudinary_file(url: str):
    """Supprime un fichier Cloudinary à partir de son URL."""
    if not url or "cloudinary.com" not in url:
        return
    try:
        # Extraire le public_id depuis l'URL Cloudinary
        parts = url.split("/upload/")
        if len(parts) == 2:
            public_id_with_ext = parts[1]
            # Supprimer la version éventuelle (v1234567890/)
            if public_id_with_ext.startswith("v") and "/" in public_id_with_ext:
                public_id_with_ext = public_id_with_ext.split("/", 1)[1]
            # Supprimer l'extension
            public_id = os.path.splitext(public_id_with_ext)[0]
            cloudinary.uploader.destroy(public_id)
            logger.info(f"Fichier Cloudinary supprimé: {public_id}")
    except Exception as e:
        logger.error(f"Erreur suppression Cloudinary: {str(e)}")


# ─── Endpoints GET ───────────────────────────────────────────────────────────

@router.get("/", response_model=List[schemas.ArticleResponse])
def get_articles(
    skip: int = 0,
    limit: int = Query(100, le=100),
    is_story: Optional[bool] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Article).options(joinedload(models.Article.author))
    if is_story is not None:
        query = query.filter(
            models.Article.is_story == is_story,
            (models.Article.story_expires_at.is_(None) |
             (models.Article.story_expires_at > datetime.now()))
        )
    if status:
        query = query.filter(models.Article.status == status)

    articles = query.order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    logger.info(f"Retrieved {len(articles)} articles")
    return articles or []


@router.get("/story", response_model=List[schemas.ArticleResponse])
def get_story_articles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
        models.Article.is_story == True,
        models.Article.status == "published",
        (models.Article.story_expires_at.is_(None) |
         (models.Article.story_expires_at > datetime.now()))
    ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    return articles


@router.get("/mostread", response_model=List[schemas.ArticleResponse])
def get_mostread_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.views >= 50,
            models.Article.status == "published"
        ).order_by(
            models.Article.views.desc(),
            models.Article.created_at.desc()
        ).offset(skip).limit(limit).all()
        return articles
    except Exception as e:
        logger.error(f"Error fetching most read articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch most read articles")


@router.get("/cinema", response_model=List[schemas.ArticleResponse])
def get_cinema_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_cinema == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch cinema articles")


@router.get("/comedy", response_model=List[schemas.ArticleResponse])
def get_comedy_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_comedy == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch comedy articles")


@router.get("/sport", response_model=List[schemas.ArticleResponse])
async def get_sport_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_sport == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch sport articles")


@router.get("/rap", response_model=List[schemas.ArticleResponse])
async def get_rap_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_rap == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch rap articles")


@router.get("/afrotcham", response_model=List[schemas.ArticleResponse])
async def get_afrotcham_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_afrotcham == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch afrotcham articles")


@router.get("/buzz", response_model=List[schemas.ArticleResponse])
async def get_buzz_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_buzz == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch buzz articles")


@router.get("/alaune", response_model=List[schemas.ArticleResponse])
async def get_alaune_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_alaune == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch alaune articles")


@router.get("/alauneactual", response_model=List[schemas.ArticleResponse])
async def get_alauneactual_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.alauneactual == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch alauneactual articles")


@router.get("/videoactual", response_model=List[schemas.ArticleResponse])
async def get_videoactual_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.videoactual == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch videoactual articles")


@router.get("/eventactual", response_model=List[schemas.ArticleResponse])
async def get_eventactual_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.eventactual == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch eventactual articles")


@router.get("/science", response_model=List[schemas.ArticleResponse])
async def get_science_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.science == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch science articles")


@router.get("/contenurecent", response_model=List[schemas.ArticleResponse])
async def get_contenurecent_articles(db: Session = Depends(database.get_db), skip: int = 0, limit: int = Query(10, le=100)):
    try:
        return db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.contenurecent == True, models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch contenurecent articles")


@router.get("/{article_id}", response_model=schemas.ArticleDetailResponse)
def get_article_detail(
    article_id: int,
    section_id: Optional[int] = None,
    db: Session = Depends(database.get_db)
):
    try:
        query = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.id == article_id
        )
        if section_id is not None:
            query = query.filter(models.Article.section_id == section_id)

        article = query.first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        article.views = (article.views or 0) + 1
        db.commit()
        db.refresh(article)
        return article
    except Exception as e:
        logger.error(f"Error fetching article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch article")


# ─── Endpoint POST (créer) ───────────────────────────────────────────────────

@router.post("/", response_model=schemas.ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    title: str = Form(...),
    content: str = Form(...),
    category_id: int = Form(...),
    section_id: Optional[int] = Form(None),
    mostread: bool = Form(False),
    is_story: bool = Form(False),
    is_cinema: bool = Form(False),
    is_comedy: bool = Form(False),
    is_sport: bool = Form(False),
    is_rap: bool = Form(False),
    is_afrotcham: bool = Form(False),
    is_buzz: bool = Form(False),
    is_alaune: bool = Form(False),
    alauneactual: bool = Form(False),
    videoactual: bool = Form(False),
    eventactual: bool = Form(False),
    science: bool = Form(False),
    is_artist: bool = Form(False),
    contenurecent: bool = Form(False),
    status: str = Form("draft"),
    story_expires_at: Optional[datetime] = Form(None),
    author_name: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    try:
        if author_name and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Only admins can set author name")

        if status not in ["draft", "pending", "published"]:
            raise HTTPException(status_code=400, detail="Status must be 'draft', 'pending', or 'published'")

        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        if section_id:
            section = db.query(models.Section).filter(models.Section.id == section_id).first()
            if not section:
                raise HTTPException(status_code=404, detail="Section not found")

        expires_at = story_expires_at
        if is_story and not story_expires_at:
            expires_at = datetime.utcnow() + timedelta(hours=24)

        # ✅ Upload sur Cloudinary
        image_url, _ = save_upload_file(image, Path("images"), ALLOWED_IMAGE_EXTENSIONS) if image and image.filename else (None, None)
        video_url, duration = save_upload_file(video, Path("videos"), ALLOWED_VIDEO_EXTENSIONS) if video and video.filename else (None, None)

        if is_story and not (image_url or video_url):
            raise HTTPException(status_code=400, detail="Stories must have an image or video")

        article = models.Article(
            title=title,
            content=content,
            category_id=category_id,
            section_id=section_id,
            mostread=mostread,
            is_story=is_story,
            is_cinema=is_cinema,
            is_comedy=is_comedy,
            is_sport=is_sport,
            is_rap=is_rap,
            is_afrotcham=is_afrotcham,
            is_buzz=is_buzz,
            is_alaune=is_alaune,
            alauneactual=alauneactual,
            videoactual=videoactual,
            eventactual=eventactual,
            science=science,
            is_artist=is_artist,
            contenurecent=contenurecent,
            status=status,
            story_expires_at=expires_at,
            image_url=image_url,
            video_url=video_url,
            duration=duration,
            author_id=current_user.id,
            author_name=author_name,
            views=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(article)
        db.commit()
        db.refresh(article)
        logger.info(f"Article créé: ID={article.id}, Title={title}, image_url={image_url}")
        return article
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur création article: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create article")


# ─── Endpoint PUT (modifier) ─────────────────────────────────────────────────

@router.put("/{article_id}", response_model=schemas.ArticleResponse)
async def update_article(
    article_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    section_id: Optional[int] = Form(None),
    mostread: Optional[bool] = Form(None),
    is_story: Optional[bool] = Form(None),
    is_cinema: Optional[bool] = Form(None),
    is_comedy: Optional[bool] = Form(None),
    is_sport: Optional[bool] = Form(None),
    is_rap: Optional[bool] = Form(None),
    is_afrotcham: Optional[bool] = Form(None),
    is_buzz: Optional[bool] = Form(None),
    is_alaune: Optional[bool] = Form(None),
    alauneactual: Optional[bool] = Form(None),
    videoactual: Optional[bool] = Form(None),
    eventactual: Optional[bool] = Form(None),
    science: Optional[bool] = Form(None),
    is_artist: Optional[bool] = Form(None),
    contenurecent: Optional[bool] = Form(None),
    status: Optional[str] = Form(None),
    story_expires_at: Optional[datetime] = Form(None),
    author_name: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    remove_image: Optional[bool] = Form(False),
    remove_video: Optional[bool] = Form(False),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    try:
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        if article.author_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to update this article")

        if title is not None: article.title = title
        if content is not None: article.content = content
        if category_id is not None:
            if not db.query(models.Category).filter(models.Category.id == category_id).first():
                raise HTTPException(status_code=404, detail="Category not found")
            article.category_id = category_id
        if section_id is not None:
            if section_id and not db.query(models.Section).filter(models.Section.id == section_id).first():
                raise HTTPException(status_code=404, detail="Section not found")
            article.section_id = section_id
        if mostread is not None: article.mostread = mostread
        if is_story is not None: article.is_story = is_story
        if is_cinema is not None: article.is_cinema = is_cinema
        if is_comedy is not None: article.is_comedy = is_comedy
        if is_sport is not None: article.is_sport = is_sport
        if is_rap is not None: article.is_rap = is_rap
        if is_afrotcham is not None: article.is_afrotcham = is_afrotcham
        if is_buzz is not None: article.is_buzz = is_buzz
        if is_alaune is not None: article.is_alaune = is_alaune
        if alauneactual is not None: article.alauneactual = alauneactual
        if videoactual is not None: article.videoactual = videoactual
        if eventactual is not None: article.eventactual = eventactual
        if science is not None: article.science = science
        if is_artist is not None: article.is_artist = is_artist
        if contenurecent is not None: article.contenurecent = contenurecent
        if status is not None: article.status = status
        if story_expires_at is not None: article.story_expires_at = story_expires_at
        if author_name is not None and current_user.role == "admin":
            article.author_name = author_name

        # ✅ Suppression image sur Cloudinary
        if remove_image and article.image_url:
            delete_cloudinary_file(article.image_url)
            article.image_url = None

        # ✅ Nouvel upload image sur Cloudinary
        if image and image.filename:
            if article.image_url:
                delete_cloudinary_file(article.image_url)
            image_url, _ = save_upload_file(image, Path("images"), ALLOWED_IMAGE_EXTENSIONS)
            article.image_url = image_url

        # ✅ Suppression vidéo sur Cloudinary
        if remove_video and article.video_url:
            delete_cloudinary_file(article.video_url)
            article.video_url = None
            article.duration = None

        # ✅ Nouvel upload vidéo sur Cloudinary
        if video and video.filename:
            if article.video_url:
                delete_cloudinary_file(article.video_url)
            video_url, duration = save_upload_file(video, Path("videos"), ALLOWED_VIDEO_EXTENSIONS)
            article.video_url = video_url
            article.duration = duration

        if article.views and article.views >= 50 and not article.mostread:
            article.mostread = True

        if article.is_story and not (article.image_url or article.video_url):
            raise HTTPException(status_code=400, detail="Stories must have an image or video")

        article.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(article)
        logger.info(f"Article mis à jour: ID={article_id}")
        return article

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur mise à jour article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update article")


# ─── Endpoint DELETE ─────────────────────────────────────────────────────────

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    try:
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        if article.author_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to delete this article")

        # ✅ Suppression des fichiers sur Cloudinary
        delete_cloudinary_file(article.image_url)
        delete_cloudinary_file(article.video_url)

        db.delete(article)
        db.commit()
        logger.info(f"Article supprimé: ID={article_id}")
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur suppression article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete article")


# ─── Placeholder image ───────────────────────────────────────────────────────

@router.get("/placeholder/{width}/{height}")
async def get_placeholder_image(width: int, height: int, text: str = "Placeholder", color: str = "4f46e5"):
    try:
        if width < 10 or height < 10 or width > 2000 or height > 2000:
            raise HTTPException(status_code=400, detail="Dimensions invalides (10-2000).")

        if color.startswith("#"):
            color = color[1:]
        r = int(color[:2], 16)
        g = int(color[2:4], 16)
        b = int(color[4:6], 16)

        img = Image.new("RGB", (width, height), (r, g, b))
        draw = ImageDraw.Draw(img)
        font_size = min(width, height) // 10
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_x = (width - (text_bbox[2] - text_bbox[0])) / 2
        text_y = (height - (text_bbox[3] - text_bbox[1])) / 2
        draw.text((text_x, text_y), text, fill="white", font=font)

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return Response(content=buffer.getvalue(), media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate placeholder image")