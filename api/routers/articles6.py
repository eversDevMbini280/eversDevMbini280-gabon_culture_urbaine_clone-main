from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import models, schemas
import os
from datetime import datetime, date
import uuid
from database import get_db
from routers.auth import get_current_user
from fastapi.security import OAuth2PasswordBearer
from pathlib import Path
import shutil
import logging

router = APIRouter(
    prefix="/api/arts-traditions-articles",
    tags=["Arts Traditions Articles"]
)

UPLOAD_BASE = Path("static/uploads")
UPLOAD_BASE.mkdir(exist_ok=True)
IMAGE_DIR = UPLOAD_BASE / "images"
IMAGE_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg'}

logger = logging.getLogger(__name__)

def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in allowed_extensions

def save_upload_file(upload_file: UploadFile, directory: Path, allowed_extensions: set) -> str:
    if not upload_file:
        return None
    try:
        if not validate_file_extension(upload_file.filename, allowed_extensions):
            logger.error(f"Invalid file extension for {upload_file.filename}")
            raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")
        
        file_ext = Path(upload_file.filename).suffix
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = directory / filename
        directory.mkdir(parents=True, exist_ok=True)
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        logger.info(f"Saved file: {file_path}")
        return f"/static/uploads/{directory.name}/{filename}"
    except Exception as e:
        logger.error(f"Error saving file {upload_file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


@router.get("/art-culinaire/{id}", response_model=schemas.ArtsTraditionsArticleDetailResponse)
async def get_art_culinaire_article(
    id: int,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
):
    valid_culinary_types = ["recipe", "ingredient", "chef", "culinaire"]
    
    article = db.query(models.ArtsTraditionsArticle)\
        .options(
            joinedload(models.ArtsTraditionsArticle.category),
            joinedload(models.ArtsTraditionsArticle.section),
            joinedload(models.ArtsTraditionsArticle.author)
        )\
        .filter(
            models.ArtsTraditionsArticle.id == id,
            models.ArtsTraditionsArticle.arts_traditions_type.in_(valid_culinary_types)
        )\
        .first()
    
    if not article:
        logger.error(f"Article not found for id={id} or not a valid culinary type: {valid_culinary_types}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Art Culinaire article not found or not a recipe, ingredient, chef, or culinaire"
        )
    
    if article.status != "published" and not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view unpublished articles"
        )
    
    if not article.author:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Article author not found"
        )
    
    return schemas.ArtsTraditionsArticleDetailResponse(
        id=article.id,
        title=article.title,
        content=article.content,
        category_id=article.category_id,
        category=schemas.CategoryResponse(
            id=article.category.id,
            name=article.category.name,
            slug=article.category.slug,
            description=article.category.description,
            created_at=article.category.created_at
        ),
        section_id=article.section_id,
        section=schemas.SectionResponse(
            id=article.section.id,
            name=article.section.name,
            description=article.section.description,
            created_at=article.section.created_at
        ),
        arts_traditions_type=article.arts_traditions_type,
        status=article.status,
        image_url=article.image_url,
        video_url=article.video_url,
        views=article.views,
        author_id=article.author_id,
        author=schemas.UserResponse(
            id=article.author.id,
            username=article.author.username,
            email=article.author.email,
            role=article.author.role.value,
            status=article.author.status,
            disabled=article.author.disabled,
            last_login=article.author.last_login,
            last_activity=article.author.last_activity
        ),
        author_name=article.author_name,
        author_username=article.author.username,
        created_at=article.created_at,
        updated_at=article.updated_at,
        date=article.date,
        prep_time=article.prep_time,
        cook_time=article.cook_time,
        difficulty=article.difficulty,
        rating=article.rating,
        reviews=article.reviews,
        recipe_author=article.recipe_author,
        specialty=article.specialty,
        recipes_count=article.recipes_count
    )

@router.get("/", response_model=List[schemas.ArtsTraditionsArticleResponse])
async def get_arts_traditions_articles(
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    arts_traditions_type: Optional[str] = None,
    exclude: Optional[int] = None,
    limit: int = 10,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
):
    query = db.query(models.ArtsTraditionsArticle)\
        .options(
            joinedload(models.ArtsTraditionsArticle.category),
            joinedload(models.ArtsTraditionsArticle.section),
            joinedload(models.ArtsTraditionsArticle.author)
        )
    
    if not token:
        query = query.filter(models.ArtsTraditionsArticle.status == "published")
    else:
        if status and status not in [e.value for e in schemas.ArticleStatus]:
            raise HTTPException(status_code=400, detail="Invalid status value")
        if status:
            query = query.filter(models.ArtsTraditionsArticle.status == status)
    
    if category_id:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        query = query.filter(models.ArtsTraditionsArticle.category_id == category_id)
    
    if arts_traditions_type:
        valid_types = [
            "tradition",
            "artisanat",
            "rite",
            "coutume",
            "ethnie",
            "festival",
            "recipe",
            "ingredient",
            "chef"
        ]
        if arts_traditions_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid arts traditions type. Allowed: {', '.join(valid_types)}")
        query = query.filter(models.ArtsTraditionsArticle.arts_traditions_type == arts_traditions_type)
    
    if exclude:
        query = query.filter(models.ArtsTraditionsArticle.id != exclude)
    
    articles = query.limit(limit).all()
    
    return [
        schemas.ArtsTraditionsArticleResponse(
            id=article.id,
            title=article.title,
            content=article.content,
            category_id=article.category_id,
            category=schemas.CategoryResponse(
                id=article.category.id,
                name=article.category.name,
                slug=article.category.slug,
                description=article.category.description,
                created_at=article.category.created_at
            ),
            section_id=article.section_id,
            section=schemas.SectionResponse(
                id=article.section.id,
                name=article.section.name,
                description=article.section.description,
                created_at=article.section.created_at
            ),
            arts_traditions_type=article.arts_traditions_type,
            status=article.status,
            image_url=article.image_url,
            video_url=article.video_url,
            views=article.views,
            author_id=article.author_id,
            author_name=article.author_name,
            author_username=article.author.username,
            created_at=article.created_at,
            updated_at=article.updated_at,
            date=article.date,
            prep_time=article.prep_time,
            cook_time=article.cook_time,
            difficulty=article.difficulty,
            rating=article.rating,
            reviews=article.reviews,
            recipe_author=article.recipe_author,
            specialty=article.specialty,
            recipes_count=article.recipes_count
        ) for article in articles
    ] or []

@router.get("/{id}", response_model=schemas.ArtsTraditionsArticleDetailResponse)
async def get_arts_traditions_article(
    id: int,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
):
    article = db.query(models.ArtsTraditionsArticle)\
        .options(
            joinedload(models.ArtsTraditionsArticle.category),
            joinedload(models.ArtsTraditionsArticle.section),
            joinedload(models.ArtsTraditionsArticle.author)
        )\
        .filter(models.ArtsTraditionsArticle.id == id)\
        .first()
    
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arts traditions article not found")
    
    if article.status != "published" and not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                          detail="Authentication required to view unpublished articles")
    
    if not article.author:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                          detail="Article author not found")

    # Validate arts_traditions_type against models.py enum
    valid_types = [
        "tradition",
        "artisanat",
        "rite",
        "coutume",
        "ethnie",
        "festival",
        "recipe",
        "ingredient",
        "chef"
    ]
    if article.arts_traditions_type not in valid_types:
        logger.error(f"Invalid arts_traditions_type: {article.arts_traditions_type}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                          detail=f"Invalid arts traditions type. Allowed: {', '.join(valid_types)}")
    
    return schemas.ArtsTraditionsArticleDetailResponse(
        id=article.id,
        title=article.title,
        content=article.content,
        category_id=article.category_id,
        category=schemas.CategoryResponse(
            id=article.category.id,
            name=article.category.name,
            slug=article.category.slug,
            description=article.category.description,
            created_at=article.category.created_at
        ),
        section_id=article.section_id,
        section=schemas.SectionResponse(
            id=article.section.id,
            name=article.section.name,
            description=article.section.description,
            created_at=article.section.created_at
        ),
        arts_traditions_type=article.arts_traditions_type,
        status=article.status,
        image_url=article.image_url,
        video_url=article.video_url,
        views=article.views,
        author_id=article.author_id,
        author=schemas.UserResponse(
            id=article.author.id,
            username=article.author.username,
            email=article.author.email,
            role=article.author.role.value,  # Convert Enum to string
            status=article.author.status,    # Include status
            disabled=article.author.disabled,
            last_login=article.author.last_login,
            last_activity=article.author.last_activity
        ),
        author_name=article.author_name,
        author_username=article.author.username,
        created_at=article.created_at,
        updated_at=article.updated_at,
        date=article.date,
        prep_time=article.prep_time,
        cook_time=article.cook_time,
        difficulty=article.difficulty,
        rating=article.rating,
        reviews=article.reviews,
        recipe_author=article.recipe_author,
        specialty=article.specialty,
        recipes_count=article.recipes_count
    )

@router.post("/", response_model=schemas.ArtsTraditionsArticleResponse)
async def create_arts_traditions_article(
    title: str = Form(...),
    content: str = Form(...),
    category_id: int = Form(...),
    section_id: int = Form(...),
    arts_traditions_type: str = Form(...),
    status: str = Form(default="draft"),
    author_name: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    video_url: Optional[str] = Form(None),  # Add video_url as an optional form field
    date: Optional[date] = Form(None),
    prep_time: Optional[str] = Form(None),
    cook_time: Optional[str] = Form(None),
    difficulty: Optional[str] = Form(None),
    rating: Optional[float] = Form(None),
    reviews: Optional[int] = Form(None),
    recipe_author: Optional[str] = Form(None),
    specialty: Optional[str] = Form(None),
    recipes_count: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Not authorized to create arts traditions articles")
    
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    valid_types = [
        "tradition",
        "artisanat",
        "rite",
        "coutume",
        "ethnie",
        "festival",
        "recipe",
        "ingredient",
        "chef"
    ]
    if arts_traditions_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid arts traditions type. Allowed: {', '.join(valid_types)}")
    
    if status not in [e.value for e in schemas.ArticleStatus]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    
    image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS) if image else None
    
    new_article = models.ArtsTraditionsArticle(
        title=title.strip(),
        content=content.strip(),
        category_id=category_id,
        section_id=section_id,
        arts_traditions_type=arts_traditions_type,
        status=status,
        image_url=image_url,
        video_url=video_url,  # Explicitly set video_url
        author_id=current_user.id,
        author_name=author_name.strip() if current_user.role == "admin" and author_name else current_user.username,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        date=date,
        prep_time=prep_time,
        cook_time=cook_time,
        difficulty=difficulty,
        rating=rating,
        reviews=reviews,
        recipe_author=recipe_author,
        specialty=specialty,
        recipes_count=recipes_count
    )
    
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    
    return schemas.ArtsTraditionsArticleResponse(
        id=new_article.id,
        title=new_article.title,
        content=new_article.content,
        category_id=new_article.category_id,
        category=schemas.CategoryResponse(
            id=new_article.category.id,
            name=new_article.category.name,
            slug=new_article.category.slug,
            description=new_article.category.description,
            created_at=new_article.category.created_at
        ),
        section_id=new_article.section_id,
        section=schemas.SectionResponse(
            id=new_article.section.id,
            name=new_article.section.name,
            description=new_article.section.description,
            created_at=new_article.section.created_at
        ),
        arts_traditions_type=new_article.arts_traditions_type,
        status=new_article.status,
        image_url=new_article.image_url,
        video_url=new_article.video_url,  # Explicitly pass video_url
        views=new_article.views,
        author_id=new_article.author_id,
        author_name=new_article.author_name,
        author_username=current_user.username,
        created_at=new_article.created_at,
        updated_at=new_article.updated_at,
        date=new_article.date,
        prep_time=new_article.prep_time,
        cook_time=new_article.cook_time,
        difficulty=new_article.difficulty,
        rating=new_article.rating,
        reviews=new_article.reviews,
        recipe_author=new_article.recipe_author,
        specialty=new_article.specialty,
        recipes_count=new_article.recipes_count
    )

@router.put("/{id}", response_model=schemas.ArtsTraditionsArticleResponse)
async def update_arts_traditions_article(
    id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    section_id: Optional[int] = Form(None),
    arts_traditions_type: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    author_name: Optional[str] = Form(None),
    remove_image: bool = Form(False),
    image: Optional[UploadFile] = File(None),
    video_url: Optional[str] = Form(None),  # Add video_url as a form parameter
    date: Optional[date] = Form(None),
    prep_time: Optional[str] = Form(None),
    cook_time: Optional[str] = Form(None),
    difficulty: Optional[str] = Form(None),
    rating: Optional[float] = Form(None),
    reviews: Optional[int] = Form(None),
    recipe_author: Optional[str] = Form(None),
    specialty: Optional[str] = Form(None),
    recipes_count: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Not authorized to update arts traditions articles")
    
    article = db.query(models.ArtsTraditionsArticle).filter(
        models.ArtsTraditionsArticle.id == id
    ).first()
    
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="Arts traditions article not found")
    
    if title is not None:
        article.title = title.strip()
    if content is not None:
        article.content = content.strip()
    if category_id is not None:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        article.category_id = category_id
    if section_id is not None:
        section = db.query(models.Section).filter(models.Section.id == section_id).first()
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
        article.section_id = section_id
    if arts_traditions_type is not None:
        valid_types = [
            "tradition",
            "artisanat",
            "rite",
            "coutume",
            "ethnie",
            "festival",
            "recipe",
            "ingredient",
            "chef"
        ]
        if arts_traditions_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid arts traditions type. Allowed: {', '.join(valid_types)}")
        article.arts_traditions_type = arts_traditions_type
    if status is not None:
        if status not in [e.value for e in schemas.ArticleStatus]:
            raise HTTPException(status_code=400, detail="Invalid status value")
        article.status = status
    if current_user.role == "admin" and author_name is not None:
        article.author_name = author_name.strip() if author_name else None
    
    if remove_image and article.image_url:
        try:
            os.remove(article.image_url.lstrip("/"))
            article.image_url = None
        except Exception:
            pass
    
    if image:
        article.image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
    
    # Update video_url if provided
    if video_url is not None:
        article.video_url = video_url.strip() if video_url else None
    
    # Update new fields
    if date is not None:
        article.date = date
    if prep_time is not None:
        article.prep_time = prep_time
    if cook_time is not None:
        article.cook_time = cook_time
    if difficulty is not None:
        article.difficulty = difficulty
    if rating is not None:
        article.rating = rating
    if reviews is not None:
        article.reviews = reviews
    if recipe_author is not None:
        article.recipe_author = recipe_author
    if specialty is not None:
        article.specialty = specialty
    if recipes_count is not None:
        article.recipes_count = recipes_count
    
    article.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(article)
    
    return schemas.ArtsTraditionsArticleResponse(
        id=article.id,
        title=article.title,
        content=article.content,
        category_id=article.category_id,
        category=schemas.CategoryResponse(
            id=article.category.id,
            name=article.category.name,
            slug=article.category.slug,
            description=article.category.description,
            created_at=article.category.created_at
        ),
        section_id=article.section_id,
        section=schemas.SectionResponse(
            id=article.section.id,
            name=article.section.name,
            description=article.section.description,
            created_at=article.section.created_at
        ),
        arts_traditions_type=article.arts_traditions_type,
        status=article.status,
        image_url=article.image_url,
        video_url=article.video_url,  
        views=article.views,
        author_id=article.author_id,
        author_name=article.author_name,
        author_username=current_user.username,
        created_at=article.created_at,
        updated_at=article.updated_at,
        date=article.date,
        prep_time=article.prep_time,
        cook_time=article.cook_time,
        difficulty=article.difficulty,
        rating=article.rating,
        reviews=article.reviews,
        recipe_author=article.recipe_author,
        specialty=article.specialty,
        recipes_count=article.recipes_count
    )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_arts_traditions_article(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                          detail="Not authorized to delete arts traditions articles")
    
    article = db.query(models.ArtsTraditionsArticle).filter(
        models.ArtsTraditionsArticle.id == id
    ).first()
    
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                          detail="Arts traditions article not found")
    
    if article.image_url:
        try:
            os.remove(article.image_url.lstrip("/"))
        except Exception:
            pass
    
    db.delete(article)
    db.commit()
    
    return {}