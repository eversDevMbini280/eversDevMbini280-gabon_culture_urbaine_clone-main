# from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Query
# from fastapi.responses import Response
# from sqlalchemy.orm import Session
# from typing import List, Optional
# import os
# import shutil
# from datetime import datetime, timedelta
# import uuid
# from pathlib import Path
# import logging
# from PIL import Image, ImageDraw, ImageFont
# import io

# import models, schemas, database
# from . import auth  

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# router = APIRouter(
#     prefix="/api/articles",
#     tags=["articles"],
# )

# UPLOAD_BASE = Path("uploads")
# UPLOAD_BASE.mkdir(exist_ok=True)
# IMAGE_DIR = UPLOAD_BASE / "images"
# VIDEO_DIR = UPLOAD_BASE / "videos"
# IMAGE_DIR.mkdir(exist_ok=True)
# VIDEO_DIR.mkdir(exist_ok=True)

# ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg'}
# ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm', '.ogg'}

# def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
#     """Validate file extension against allowed extensions"""
#     ext = Path(filename).suffix.lower()
#     return ext in allowed_extensions

# def save_upload_file(upload_file: UploadFile, directory: Path, allowed_extensions: set) -> str:
#     """Save uploaded file with unique filename after validation"""
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

# @router.get("/", response_model=List[schemas.ArticleResponse])
# def get_articles(
#     skip: int = 0,
#     limit: int = Query(100, le=100),
#     is_story: Optional[bool] = None,
#     is_cinema: Optional[bool] = None,
#     is_comedy: Optional[bool] = None,
#     is_sport: Optional[bool] = None,
#     is_rap: Optional[bool] = None,
#     is_afrotcham: Optional[bool] = None,
#     is_buzz: Optional[bool] = None,
#     is_alaune: Optional[bool] = None,
#     videoactual: Optional[bool] = None,
#     alauneactual: Optional[bool] = None,
#     eventactual: Optional[bool] = None,
#     science: Optional[bool] = None,
#     is_artist: Optional[bool] = None,
#     contenurecent: Optional[bool] = None,
#     # featured: Optional[bool] = None,
#     status: Optional[str] = None,
#     section_id: Optional[int] = None,
#     exclude: Optional[int] = None,
#     category_id: Optional[int] = None,
#     db: Session = Depends(database.get_db)
# ):
#     try:
#         query = db.query(models.Article)
        
#         if is_story is not None:
#             query = query.filter(models.Article.is_story == is_story)
#         else:
#             query = query.filter(models.Article.is_story == False)
#         # if featured is not None:
#         #     query = query.filter(models.Article.featured == featured)
#         if status:
#             query = query.filter(models.Article.status == status)
#         if section_id:
#             query = query.filter(models.Article.section_id == section_id)
#         if is_artist is not None:
#            query = query.filter(models.Article.is_artist == is_artist)
#         if exclude is not None:
#             query = query.filter(models.Article.id != exclude)
#         if category_id is not None:
#             query = query.filter(models.Article.category_id == category_id)
        
#         articles = query.order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} articles (section_id={section_id}, exclude={exclude}, category_id={category_id})")
#         return articles or []
#     except Exception as e:
#         logger.error(f"Error fetching articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch articles")

# @router.get("/story", response_model=List[schemas.ArticleResponse])
# def get_story_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.is_story == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} story articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching story articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch story articles")




# @router.get("/mostread", response_model=List[schemas.ArticleResponse])
# def get_mostread_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.mostread == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} mostread articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching mostread articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch story articles")

# # @router.get("/most-read", response_model=List[schemas.ArticleResponse])
# # def get_most_read_articles(
# #     limit: int = Query(10, gt=0, le=100, description="Number of items to return (1-100)"),
# #     db: Session = Depends(database.get_db)
# # ):
# #     try:
# #         db_query = db.query(models.Article).filter(
# #             models.Article.status == schemas.ArticleStatus.published,
# #             models.Article.is_story == False,
# #             models.Article.is_cinema == False,
# #             models.Article.is_comedy == False,
# #             models.Article.is_sport == False,
# #             models.Article.is_rap == False,
# #             models.Article.is_afrotcham == False,
# #             models.Article.is_buzz == False,
# #             models.Article.is_alaune == False,
# #             models.Article.alauneactual == False,
# #             models.Articles.videoactual == False,
# #             models.Articles.eventactual == False,
# #             (models.Article.image_url.isnot(None) | models.Article.video_url.isnot(None))
# #         )
# #         articles = db_query.order_by(models.Article.views.desc()).limit(limit).all()
        
# #         article_details = [
# #             f"ID={a.id}, Title={a.title}, is_cinema={a.is_cinema}, is_comedy={a.is_comedy}, is_sport={a.is_sport}, views={a.views}, section_id={a.section_id}"
# #             for a in articles
# #         ]
# #         logger.info(f"Most-read articles retrieved: Count={len(articles)}, Limit={limit}, Articles=[{'; '.join(article_details)}]")
        
# #         for article in articles:
# #             if isinstance(article.views, str):
# #                 try:
# #                     article.views = int(article.views)
# #                 except ValueError:
# #                     article.views = 0
        
# #         return articles
# #     except Exception as e:
# #         logger.error(f"Error fetching most-read articles: {str(e)}")
# #         raise HTTPException(status_code=500, detail="Failed to fetch most-read articles")

# @router.get("/cinema", response_model=List[schemas.ArticleResponse])
# def get_cinema_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.is_cinema == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} cinema articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching cinema articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch cinema articles")

# @router.get("/comedy", response_model=List[schemas.ArticleResponse])
# def get_comedy_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.is_comedy == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} comedy articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching comedy articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch comedy articles")

# @router.get("/sport", response_model=List[schemas.ArticleResponse])
# async def get_sport_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)   
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.is_sport == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
   
#         logger.info(f"Retrieved {len(articles)} sport articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching sport articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch sport articles")



# @router.get("/rap", response_model=List[schemas.ArticleResponse])
# async def get_rap_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.is_rap == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} rap articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching rap articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch rap articles")


# @router.get("/afrotcham", response_model=List[schemas.ArticleResponse])
# async def get_afrotcham_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.is_afrotcham == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} afrotcham articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching afrotcham articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch afrotcham articles")


# @router.get("/buzz", response_model=List[schemas.ArticleResponse])
# async def get_buzz_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.is_buzz == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} buzz articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching buzz articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch buzz articles")


# @router.get("/alaune", response_model=List[schemas.ArticleResponse])
# async def get_alaune_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.is_alaune == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} alaune articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching alaune articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch alaune articles")
  


# @router.get("/alauneactual", response_model=List[schemas.ArticleResponse])
# async def get_alauneactual_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.alauneactual == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} alauneactual articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching alauneactual articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch alauneactual articles")



# @router.get("/videoactual", response_model=List[schemas.ArticleResponse])
# async def get_videoactual_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.videoactual == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} videoactual articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching videoactual articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch videoactual articles")



# @router.get("/eventactual", response_model=List[schemas.ArticleResponse])
# async def get_eventactual_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.eventactual == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} eventactual articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching eventactual articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch eventactual articles")



# @router.get("/science", response_model=List[schemas.ArticleResponse])
# async def get_science_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.science == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} science articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching science articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch science articles")

# @router.get("/contenurecent", response_model=List[schemas.ArticleResponse])
# async def get_contenurecent_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).filter(
#             models.Article.contenurecent == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()

#         logger.info(f"Retrieved {len(articles)} contenurecent articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching contenurecent articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch contenurecent articles")




#         raise HTTPException(status_code=500, detail="Failed to fetch is_artist articles")
    


# @router.get("/{article_id}", response_model=schemas.ArticleDetailResponse)
# def get_article_detail(
#     article_id: int,
#     section_id: Optional[int] = None,
#     db: Session = Depends(database.get_db)
# ):
#     try:
#         query = db.query(models.Article).filter(models.Article.id == article_id)
        
#         if section_id is not None:
#             query = query.filter(models.Article.section_id == section_id)
        
#         article = query.first()
#         if not article:
#             logger.warning(f"Article not found: ID={article_id}, section_id={section_id}")
#             raise HTTPException(status_code=404, detail="Article not found")
        
#         current_views = article.views
#         if isinstance(current_views, str):
#             try:
#                 current_views = int(current_views)
#             except ValueError:
#                 logger.warning(f"Invalid views value for article {article_id}: {current_views}")
#                 current_views = 0
#         article.views = (current_views or 0) + 1
        
#         db.commit()
#         db.refresh(article)
        
#         return article
#     except Exception as e:
#         logger.error(f"Error fetching article {article_id}: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch article")

# @router.post("/", response_model=schemas.ArticleResponse, status_code=status.HTTP_201_CREATED)
# async def create_article(
#     title: str = Form(...),
#     content: str = Form(...),
#     category_id: int = Form(...),
#     section_id: Optional[int] = Form(None),
#     mostread: bool = Form(False),
#     is_story: bool = Form(False),
#     is_cinema: bool = Form(False),
#     is_comedy: bool = Form(False),
#     is_sport: bool = Form(False),
#     is_rap: bool = Form(False),
#     is_afrotcham: bool = Form(False),
#     is_buzz: bool = Form(False),
#     is_alaune: bool = Form(False),
#     alauneactual: bool = Form(False),
#     videoactual: bool = Form(False),
#     eventactual: bool = Form(False),
#     science: bool = Form(False),
#     is_artist: bool = Form(False),
#     contenurecent: bool = Form(False),
#     # featured: bool = Form(False),
#     status: str = Form("draft"),
#     story_expires_at: Optional[datetime] = Form(None),
#     image: Optional[UploadFile] = File(None),
#     video: Optional[UploadFile] = File(None),
#     db: Session = Depends(database.get_db),
#     current_user: models.User = Depends(auth.get_current_active_user)
# ):
#     try:
#         category = db.query(models.Category).filter(models.Category.id == category_id).first()
#         if not category:
#             logger.warning(f"Category not found: ID={category_id}")
#             raise HTTPException(status_code=404, detail="Category not found")
        
#         if section_id:
#             section = db.query(models.Section).filter(models.Section.id == section_id).first()
#             if not section:
#                 logger.warning(f"Section not found: ID={section_id}")
#                 raise HTTPException(status_code=404, detail="Section not found")
        
#         expires_at = story_expires_at
#         if is_story and not story_expires_at:
#             expires_at = datetime.now() + timedelta(hours=24)
        
#         image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS) if image else None
#         video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS) if video else None
        
#         if is_story and not (image_url or video_url):
#             logger.warning("Story created without media")
#             raise HTTPException(status_code=400, detail="Stories must have an image or video")
        
#         article = models.Article(
#             title=title,
#             content=content,
#             category_id=category_id,
#             section_id=section_id,
#             mostread=mostread,
#             is_story=is_story,
#             is_cinema=is_cinema,
#             is_comedy=is_comedy,
#             is_sport=is_sport,
#             alauneactual=alauneactual,
#             videoactual=videoactual,
#             eventactual=eventactual,
#             is_rap=is_rap,
#             is_afrotcham=is_afrotcham,
#             is_buzz=is_buzz,
#             is_alaune=is_alaune,
#             # featured=featured,
#             science=science,
#             is_artist=is_artist,
#             contenurecent=contenurecent,
#             status=status,
#             story_expires_at=expires_at,
#             image_url=image_url,
#             video_url=video_url,
#             author_id=current_user.id,
#             views=0
#         )
        
#         db.add(article)
#         db.commit()
#         db.refresh(article)
#         logger.info(f"Created article: ID={article.id}, Title={title}, Section={section_id}, IsStory={is_story}, IsComedy={is_comedy}, IsSport={is_sport}")
#         return article
#     except Exception as e:
#         logger.error(f"Error creating article: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to create article")

# @router.put("/{article_id}", response_model=schemas.ArticleResponse)
# async def update_article(
#     article_id: int,
#     title: Optional[str] = Form(None),
#     content: Optional[str] = Form(None),
#     category_id: Optional[int] = Form(None),
#     section_id: Optional[int] = Form(None),
#     mostread: Optional[bool] = Form(None),
#     is_story: Optional[bool] = Form(None),
#     is_cinema: Optional[bool] = Form(None),
#     is_comedy: Optional[bool] = Form(None),
#     is_sport: Optional[bool] = Form(None),
#     is_rap: Optional[bool] = Form(None),
#     is_afrotcham: Optional[bool] = Form(None),
#     is_buzz: Optional[bool] = Form(None),
#     is_alaune: Optional[bool] = Form(None),
#     alauneactual: Optional[bool] = Form(None),
#     videoactual: Optional[bool] = Form(None),
#     eventactual: Optional[bool] = Form(None),
#     science: Optional[bool] = Form(None),
#     is_artist: Optional[bool] = Form(None),
#     contenurecent: Optional[bool] = Form(None),
#     status: Optional[str] = Form(None),
#     story_expires_at: Optional[datetime] = Form(None),
#     image: Optional[UploadFile] = File(None),
#     video: Optional[UploadFile] = File(None),
#     remove_image: Optional[bool] = Form(False),
#     remove_video: Optional[bool] = Form(False),
#     db: Session = Depends(database.get_db),
#     current_user: models.User = Depends(auth.get_current_active_user)
# ):
#     try:
#         article = db.query(models.Article).filter(models.Article.id == article_id).first()
#         if not article:
#             logger.warning(f"Article not found: ID={article_id}")
#             raise HTTPException(status_code=404, detail="Article not found")
        
#         if article.author_id != current_user.id and current_user.role != "admin":
#             logger.warning(f"Unauthorized update attempt: User={current_user.id}, Article={article_id}")
#             raise HTTPException(status_code=403, detail="Not authorized to update this article")
        
#         if title is not None:
#             article.title = title
#         if content is not None:
#             article.content = content
#         if category_id is not None:
#             category = db.query(models.Category).filter(models.Category.id == category_id).first()
#             if not category:
#                 logger.warning(f"Category not found: ID={category_id}")
#                 raise HTTPException(status_code=404, detail="Category not found")
#             article.category_id = category_id
#         if section_id is not None:
#             if section_id:
#                 section = db.query(models.Section).filter(models.Section.id == section_id).first()
#                 if not section:
#                     logger.warning(f"Section not found: ID={section_id}")
#                     raise HTTPException(status_code=404, detail="Section not found")
#             article.section_id = section_id
#         if mostread is not None:
#             article.mostread = mostread
#         if is_story is not None:
#             article.is_story = is_story
#         if is_cinema is not None:
#             article.is_cinema = is_cinema
#         if is_comedy is not None:
#             article.is_comedy = is_comedy
#         if is_sport is not None:
#             article.is_sport = is_sport
#         if is_rap is not None:
#             article.is_rap = is_rap
#         if is_afrotcham is not None:
#             article.is_afrotcham = is_afrotcham
#         if is_buzz is not None:
#             article.is_buzz = is_buzz
#         if is_alaune is not None:
#             article.is_alaune = is_alaune
#         if alauneactual is not None:
#             article.alauneactual = alauneactual
#         if videoactual is not None:
#             article.videoactual = videoactual  
#         if eventactual is not None:
#             article.eventactual = eventactual    
#         if science is not None:
#             article.science = science
#         if is_artist is not None:
#             article.is_artist = is_artist
#         if contenurecent is not None:
#             article.contenurecent = contenurecent
#         if status is not None:
#             article.status = status
#         if story_expires_at is not None:
#             article.story_expires_at = story_expires_at
        
#         if remove_image and article.image_url:
#             try:
#                 file_path = article.image_url.lstrip('/')
#                 if os.path.exists(file_path):
#                     os.remove(file_path)
#                     logger.info(f"Removed image: {file_path}")
#                 article.image_url = None
#             except Exception as e:
#                 logger.error(f"Error removing image: {str(e)}")
        
#         if image:
#             article.image_url = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
        
#         if remove_video and article.video_url:
#             try:
#                 file_path = article.video_url.lstrip('/')
#                 if os.path.exists(file_path):
#                     os.remove(file_path)
#                     logger.info(f"Removed video: {file_path}")
#                 article.video_url = None
#             except Exception as e:
#                 logger.error(f"Error removing video: {str(e)}")
        
#         if video:
#             article.video_url = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
        
#         # Ensure stories have media
#         if article.is_story and not (article.image_url or article.video_url):
#             logger.warning(f"Story ID={article.id} updated without media")
#             raise HTTPException(status_code=400, detail="Stories must have an image or video")
        
#         article.updated_at = datetime.now()
#         db.commit()
#         db.refresh(article)
#         logger.info(f"Updated article: ID={article_id}, Section={section_id}, IsStory={article.is_story}, IsComedy={article.is_comedy}, IsSport={article.is_sport}")
#         return article
#     except Exception as e:
#         logger.error(f"Error updating article {article_id}: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to update article")

# @router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_article(
#     article_id: int,
#     db: Session = Depends(database.get_db),
#     current_user: models.User = Depends(auth.get_current_active_user)
# ):
#     try:
#         article = db.query(models.Article).filter(models.Article.id == article_id).first()
#         if not article:
#             logger.warning(f"Article not found: ID={article_id}")
#             raise HTTPException(status_code=404, detail="Article not found")
        
#         if article.author_id != current_user.id and current_user.role != "admin":
#             logger.warning(f"Unauthorized delete attempt: User={current_user.id}, Article={article_id}")
#             raise HTTPException(status_code=403, detail="Not authorized to delete this article")
        
#         # Delete associated files
#         for file_url in [article.image_url, article.video_url]:
#             if file_url:
#                 file_path = file_url.lstrip('/')
#                 if os.path.exists(file_path):
#                     try:
#                         os.remove(file_path)
#                         logger.info(f"Deleted file: {file_path}")
#                     except Exception as e:
#                         logger.error(f"Error deleting file {file_path}: {str(e)}")
        
#         db.delete(article)
#         db.commit()
#         logger.info(f"Deleted article: ID={article_id}")
#         return Response(status_code=status.HTTP_204_NO_CONTENT)
#     except Exception as e:
#         logger.error(f"Error deleting article {article_id}: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to delete article")

# @router.get("/placeholder/{width}/{height}")
# async def get_placeholder_image(width: int, height: int, text: str = "Placeholder", color: str = "4f46e5"):
#     try:
#         if width < 10 or height < 10 or width > 2000 or height > 2000:
#             raise HTTPException(status_code=400, detail="Invalid dimensions. Width and height must be between 10 and 2000.")

#         if color.startswith("#"):
#             color = color[1:]
#         try:
#             r = int(color[:2], 16)
#             g = int(color[2:4], 16)
#             b = int(color[4:6], 16)
#         except ValueError:
#             raise HTTPException(status_code=400, detail="Invalid color format. Use hex (e.g., '4f46e5').")

#         image = Image.new("RGB", (width, height), (r, g, b))
#         draw = ImageDraw.Draw(image)

#         font_size = min(width, height) // 10
#         try:
#             font = ImageFont.truetype("arial.ttf", font_size)
#         except IOError:
#             font = ImageFont.load_default()

#         text_bbox = draw.textbbox((0, 0), text, font=font)
#         text_width = text_bbox[2] - text_bbox[0]
#         text_height = text_bbox[3] - text_bbox[1]
#         text_x = (width - text_width) / 2
#         text_y = (height - text_height) / 2

#         draw.text((text_x, text_y), text, fill="white", font=font)

#         buffer = io.BytesIO()
#         image.save(buffer, format="PNG")
#         buffer.seek(0)

#         return Response(content=buffer.getvalue(), media_type="image/png")

#     except Exception as e:
#         logger.error(f"Error generating placeholder image: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to generate placeholder image")




# from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Query
# from fastapi.responses import Response
# from sqlalchemy.orm import Session, joinedload
# from typing import List, Optional
# import os
# import shutil
# from datetime import datetime, timedelta
# import uuid
# from pathlib import Path
# import logging
# from PIL import Image, ImageDraw, ImageFont
# import io
# import subprocess
# from tempfile import NamedTemporaryFile

# import models, schemas, database
# from . import auth  

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# router = APIRouter(
#     prefix="/api/articles",
#     tags=["articles"],
# )

# UPLOAD_BASE = Path("uploads")
# UPLOAD_BASE.mkdir(exist_ok=True)
# IMAGE_DIR = UPLOAD_BASE / "images"
# VIDEO_DIR = UPLOAD_BASE / "videos"
# IMAGE_DIR.mkdir(exist_ok=True)
# VIDEO_DIR.mkdir(exist_ok=True)

# ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg'}
# ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm'}  # Aligned with frontend
# MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB
# MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

# def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
#     ext = Path(filename).suffix.lower()
#     return ext in allowed_extensions

# def save_upload_file(upload_file: UploadFile, directory: Path, allowed_extensions: set) -> tuple[str, Optional[float]]:
#     if not upload_file:
#         return None, None
        
#     try:
#         if not validate_file_extension(upload_file.filename, allowed_extensions):
#             logger.error(f"Invalid file extension for {upload_file.filename}. Allowed: {allowed_extensions}")
#             raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")
        
#         if directory == VIDEO_DIR and upload_file.size > MAX_VIDEO_SIZE:
#             raise HTTPException(
#                 status_code=413,
#                 detail=f"Video file too large. Max size: {MAX_VIDEO_SIZE // (1024 * 1024)}MB"
#             )
#         if directory == IMAGE_DIR and upload_file.size > MAX_IMAGE_SIZE:
#             raise HTTPException(
#                 status_code=413,
#                 detail=f"Image file too large. Max size: {MAX_IMAGE_SIZE // (1024 * 1024)}MB"
#             )
        
#         file_ext = Path(upload_file.filename).suffix
#         filename = f"{uuid.uuid4()}{file_ext}"
#         file_path = directory / filename
        
#         directory.mkdir(parents=True, exist_ok=True)
#         if not os.access(directory, os.W_OK):
#             logger.error(f"Directory not writable: {directory}")
#             raise HTTPException(status_code=500, detail=f"Server cannot write to directory: {directory}")
        
#         duration = None
#         if directory == VIDEO_DIR:
#             try:
#                 with NamedTemporaryFile(delete=False) as temp_file:
#                     shutil.copyfileobj(upload_file.file, temp_file)
#                     temp_path = temp_file.name
                
#                 result = subprocess.run(
#                     ['ffprobe', '-v', 'error', '-show_entries', 
#                      'format=duration', '-of', 
#                      'default=noprint_wrappers=1:nokey=1', temp_path],
#                     stdout=subprocess.PIPE,
#                     stderr=subprocess.PIPE,
#                     text=True
#                 )
#                 duration = float(result.stdout.strip())
#                 logger.info(f"Video duration: {duration} seconds")
                
#                 with open(temp_path, 'rb') as temp_file:
#                     with file_path.open("wb") as buffer:
#                         shutil.copyfileobj(temp_file, buffer)
#                 os.unlink(temp_path)
#             except Exception as e:
#                 logger.error(f"Error getting video duration: {str(e)}")
#                 raise HTTPException(status_code=500, detail="Failed to process video metadata")
#         else:
#             with file_path.open("wb") as buffer:
#                 shutil.copyfileobj(upload_file.file, buffer)
        
#         if not file_path.exists():
#             logger.error(f"File not found after saving: {file_path}")
#             raise HTTPException(status_code=500, detail="Failed to save file: File not found")
#         if not os.access(file_path, os.R_OK):
#             logger.error(f"File not readable after saving: {file_path}")
#             raise HTTPException(status_code=500, detail="Saved file is not readable")
        
#         logger.info(f"Saved file: {file_path}")
#         return f"/static/uploads/{directory.name}/{filename}", duration
#     except Exception as e:
#         logger.error(f"Error saving file {upload_file.filename}: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

# @router.get("/", response_model=List[schemas.ArticleResponse])
# def get_articles(
#     skip: int = 0,
#     limit: int = Query(100, le=100),
#     is_story: Optional[bool] = None,
#     is_cinema: Optional[bool] = None,
#     is_comedy: Optional[bool] = None,
#     is_sport: Optional[bool] = None,
#     is_rap: Optional[bool] = None,
#     is_afrotcham: Optional[bool] = None,
#     is_buzz: Optional[bool] = None,
#     is_alaune: Optional[bool] = None,
#     videoactual: Optional[bool] = None,
#     alauneactual: Optional[bool] = None,
#     eventactual: Optional[bool] = None,
#     science: Optional[bool] = None,
#     is_artist: Optional[bool] = None,
#     contenurecent: Optional[bool] = None,
#     status: Optional[str] = None,
#     section_id: Optional[int] = None,
#     exclude: Optional[int] = None,
#     category_id: Optional[int] = None,
#     db: Session = Depends(database.get_db),
# ):
#     try:
#             query = db.query(models.Article).options(joinedload(models.Article.author))
            
#             if isStory is not None:
#                 query = query.filter(models.Article.isStory = False)
#             if status:
#                 query = query.filter(models.Status == status)
#             if section_id:
#  query = query.filter(models.Article.section_id == section_id)
#             if isArtist is not None:
#                 query = query.filter(models.Article.is_artist == is_artist)
#             if exclude is not None:
#                 query = query.filter(models.Article.id != exclude)
#             if category_id is not None:
#                 query = query.filter(models.Article.category_id == category_id)
            
#             articles = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
#             logger.info(f"Retrieved {len(articles)} articles (section_id={section_id}, exclude={exclude}, category_id={category_id})")
#             return articles or []
#     except Exception as e:
#         logger.error(f"Error fetching articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch articles")

# @router.get("/story", response_model=List[schemas.ArticleResponse])
# def get_story_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.is_story == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} story articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching story articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch story articles")

# @router.get("/mostread", response_model=List[schemas.ArticleResponse])
# def get_mostread_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.mostread == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} mostread articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching mostread articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch mostread articles")

# @router.get("/cinema", response_model=List[schemas.ArticleResponse])
# def get_cinema_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.is_cinema == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} cinema articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching cinema articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch cinema articles")

# @router.get("/comedy", response_model=List[schemas.ArticleResponse])
# def get_comedy_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.is_comedy == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} comedy articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching comedy articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch comedy articles")

# @router.get("/sport", response_model=List[schemas.ArticleResponse])
# async def get_sport_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)   
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.is_sport == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} sport articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching sport articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch sport articles")

# @router.get("/rap", response_model=List[schemas.ArticleResponse])
# async def get_rap_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.is_rap == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} rap articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching rap articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch rap articles")

# @router.get("/afrotcham", response_model=List[schemas.ArticleResponse])
# async def get_afrotcham_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.is_afrotcham == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} afrotcham articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching afrotcham articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch afrotcham articles")

# @router.get("/buzz", response_model=List[schemas.ArticleResponse])
# async def get_buzz_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.is_buzz == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} buzz articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching buzz articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch buzz articles")

# @router.get("/alaune", response_model=List[schemas.ArticleResponse])
# async def get_alaune_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.is_alaune == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} alaune articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching alaune articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch alaune articles")

# @router.get("/alauneactual", response_model=List[schemas.ArticleResponse])
# async def get_alauneactual_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.alauneactual == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} alauneactual articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching alauneactual articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch alauneactual articles")

# @router.get("/videoactual", response_model=List[schemas.ArticleResponse])
# async def get_videoactual_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.videoactual == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} videoactual articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching videoactual articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch videoactual articles")

# @router.get("/eventactual", response_model=List[schemas.ArticleResponse])
# async def get_eventactual_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.eventactual == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} eventactual articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching eventactual articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch eventactual articles")

# @router.get("/science", response_model=List[schemas.ArticleResponse])
# async def get_science_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.science == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} science articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching science articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch science articles")

# @router.get("/contenurecent", response_model=List[schemas.ArticleResponse])
# async def get_contenurecent_articles(
#     db: Session = Depends(database.get_db),
#     skip: int = 0,
#     limit: int = Query(10, le=100)
# ):
#     try:
#         articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
#             models.Article.contenurecent == True,
#             models.Article.status == "published"
#         ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
#         logger.info(f"Retrieved {len(articles)} contenurecent articles")
#         return articles
#     except Exception as e:
#         logger.error(f"Error fetching contenurecent articles: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch contenurecent articles")

# @router.get("/{article_id}", response_model=schemas.ArticleDetailResponse)
# def get_article_detail(
#     article_id: int,
#     section_id: Optional[int] = None,
#     db: Session = Depends(database.get_db)
# ):
#     try:
#         query = db.query(models.Article).options(joinedload(models.Article.author)).filter(models.Article.id == article_id)
        
#         if section_id is not None:
#             query = query.filter(models.Article.section_id == section_id)
        
#         article = query.first()
#         if not article:
#             logger.warning(f"Article not found: ID={article_id}, section_id={section_id}")
#             raise HTTPException(status_code=404, detail="Article not found")
        
#         current_views = article.views
#         if isinstance(current_views, str):
#             try:
#                 current_views = int(current_views)
#             except ValueError:
#                 logger.warning(f"Invalid views value for article {article_id}: {current_views}")
#                 current_views = 0
#         article.views = (current_views or 0) + 1
        
#         db.commit()
#         db.refresh(article)
        
#         return article
#     except Exception as e:
#         logger.error(f"Error fetching article {article_id}: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to fetch article")

# @router.post("/", response_model=schemas.ArticleResponse, status_code=status.HTTP_201_CREATED)
# async def create_article(
#     title: str = Form(...),
#     content: str = Form(...),
#     category_id: int = Form(...),
#     section_id: Optional[int] = Form(None),
#     mostread: bool = Form(False),
#     is_story: bool = Form(False),
#     is_cinema: bool = Form(False),
#     is_comedy: bool = Form(False),
#     is_sport: bool = Form(False),
#     is_rap: bool = Form(False),
#     is_afrotcham: bool = Form(False),
#     is_buzz: bool = Form(False),
#     is_alaune: bool = Form(False),
#     alauneactual: bool = Form(False),
#     videoactual: bool = Form(False),
#     eventactual: bool = Form(False),
#     science: bool = Form(False),
#     is_artist: bool = Form(False),
#     contenurecent: bool = Form(False),
#     status: str = Form("draft"),
#     story_expires_at: Optional[datetime] = Form(None),
#     author_name: Optional[str] = Form(None),
#     image: Optional[UploadFile] = File(None),
#     video: Optional[UploadFile] = File(None),
#     db: Session = Depends(database.get_db),
#     current_user: models.User = Depends(auth.get_current_active_user)
# ):
#     try:
#         if author_name and current_user.role != "admin":
#             logger.warning(f"Non-admin user {current_user.id} attempted to set author_name")
#             raise HTTPException(status_code=403, detail="Only admins can set author name")
        
#         if status not in ["draft", "pending", "published"]:
#             logger.warning(f"Invalid status: {status}")
#             raise HTTPException(status_code=400, detail="Status must be 'draft', 'pending', or 'published'")
        
#         category = db.query(models.Category).filter(models.Category.id == category_id).first()
#         if not category:
#             logger.warning(f"Category not found: ID={category_id}")
#             raise HTTPException(status_code=404, detail="Category not found")
        
#         if section_id:
#             section = db.query(models.Section).filter(models.Section.id == section_id).first()
#             if not section:
#                 logger.warning(f"Section not found: ID={section_id}")
#                 raise HTTPException(status_code=404, detail="Section not found")
        
#         expires_at = story_expires_at
#         if is_story and not story_expires_at:
#             expires_at = datetime.utcnow() + timedelta(hours=24)
        
#         image_url, _ = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS) if image else (None, None)
#         video_url, duration = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS) if video else (None, None)
        
#         if is_story and not (image_url or video_url):
#             logger.warning("Story created without media")
#             raise HTTPException(status_code=400, detail="Stories must have an image or video")
        
#         logger.info(f"Creating article with author_name={author_name} by user {current_user.id} (role={current_user.role})")
        
#         article = models.Article(
#             title=title,
#             content=content,
#             category_id=category_id,
#             section_id=section_id,
#             mostread=mostread,
#             is_story=is_story,
#             is_cinema=is_cinema,
#             is_comedy=is_comedy,
#             is_sport=is_sport,
#             is_rap=is_rap,
#             is_afrotcham=is_afrotcham,
#             is_buzz=is_buzz,
#             is_alaune=is_alaune,
#             alauneactual=alauneactual,
#             videoactual=videoactual,
#             eventactual=eventactual,
#             science=science,
#             is_artist=is_artist,
#             contenurecent=contenurecent,
#             status=status,
#             story_expires_at=expires_at,
#             image_url=image_url,
#             video_url=video_url,
#             duration=duration,
#             author_id=current_user.id,
#             author_name=author_name,
#             views=0,
#             created_at=datetime.utcnow(),
#             updated_at=datetime.utcnow()
#         )
        
#         db.add(article)
#         db.commit()
#         db.refresh(article)
#         logger.info(f"Created article: ID={article.id}, Title={title}, Section={section_id}, IsStory={is_story}, IsComedy={is_comedy}, IsSport={is_sport}, AuthorName={article.author_name}")
#         return article
#     except Exception as e:
#         logger.error(f"Error creating article: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to create article")

# @router.put("/{article_id}", response_model=schemas.ArticleResponse)
# async def update_article(
#     article_id: int,
#     title: Optional[str] = Form(None),
#     content: Optional[str] = Form(None),
#     category_id: Optional[int] = Form(None),
#     section_id: Optional[int] = Form(None),
#     mostread: Optional[bool] = Form(None),
#     is_story: Optional[bool] = Form(None),
#     is_cinema: Optional[bool] = Form(None),
#     is_comedy: Optional[bool] = Form(None),
#     is_sport: Optional[bool] = Form(None),
#     is_rap: Optional[bool] = Form(None),
#     is_afrotcham: Optional[bool] = Form(None),
#     is_buzz: Optional[bool] = Form(None),
#     is_alaune: Optional[bool] = Form(None),
#     alauneactual: Optional[bool] = Form(None),
#     videoactual: Optional[bool] = Form(None),
#     eventactual: Optional[bool] = Form(None),
#     science: Optional[bool] = Form(None),
#     is_artist: Optional[bool] = Form(None),
#     contenurecent: Optional[bool] = Form(None),
#     status: Optional[str] = Form(None),
#     story_expires_at: Optional[datetime] = Form(None),
#     author_name: Optional[str] = Form(None),
#     image: Optional[UploadFile] = File(None),
#     video: Optional[UploadFile] = File(None),
#     remove_image: Optional[bool] = Form(False),
#     remove_video: Optional[bool] = Form(False),
#     db: Session = Depends(database.get_db),
#     current_user: models.User = Depends(auth.get_current_active_user)
# ):
#     try:
#         if author_name and current_user.role != "admin":
#             logger.warning(f"Non-admin user {current_user.id} attempted to set author_name")
#             raise HTTPException(status_code=403, detail="Only admins can set author name")
        
#         if status and status not in ["draft", "pending", "published"]:
#             logger.warning(f"Invalid status: {status}")
#             raise HTTPException(status_code=400, detail="Status must be 'draft', 'pending', or 'published'")
        
#         article = db.query(models.Article).filter(models.Article.id == article_id).first()
#         if not article:
#             logger.warning(f"Article not found: ID={article_id}")
#             raise HTTPException(status_code=404, detail="Article not found")
        
#         if article.author_id != current_user.id and current_user.role != "admin":
#             logger.warning(f"Unauthorized update attempt: User={current_user.id}, Article={article_id}")
#             raise HTTPException(status_code=403, detail="Not authorized to update this article")
        
#         if title is not None:
#             article.title = title
#         if content is not None:
#             article.content = content
#         if category_id is not None:
#             category = db.query(models.Category).filter(models.Category.id == category_id).first()
#             if not category:
#                 logger.warning(f"Category not found: ID={category_id}")
#                 raise HTTPException(status_code=404, detail="Category not found")
#             article.category_id = category_id
#         if section_id is not None:
#             if section_id:
#                 section = db.query(models.Section).filter(models.Section.id == section_id).first()
#                 if not section:
#                     logger.warning(f"Section not found: ID={section_id}")
#                     raise HTTPException(status_code=404, detail="Section not found")
#             article.section_id = section_id
#         if mostread is not None:
#             article.mostread = mostread
#         if is_story is not None:
#             article.is_story = is_story
#         if is_cinema is not None:
#             article.is_cinema = is_cinema
#         if is_comedy is not None:
#             article.is_comedy = is_comedy
#         if is_sport is not None:
#             article.is_sport = is_sport
#         if is_rap is not None:
#             article.is_rap = is_rap
#         if is_afrotcham is not None:
#             article.is_afrotcham = is_afrotcham
#         if is_buzz is not None:
#             article.is_buzz = is_buzz
#         if is_alaune is not None:
#             article.is_alaune = is_alaune
#         if alauneactual is not None:
#             article.alauneactual = alauneactual
#         if videoactual is not None:
#             article.videoactual = videoactual  
#         if eventactual is not None:
#             article.eventactual = eventactual    
#         if science is not None:
#             article.science = science
#         if is_artist is not None:
#             article.is_artist = is_artist
#         if contenurecent is not None:
#             article.contenurecent = contenurecent
#         if status is not None:
#             article.status = status
#         if story_expires_at is not None:
#             article.story_expires_at = story_expires_at
#         if author_name is not None:
#             article.author_name = author_name
        
#         if remove_image and article.image_url:
#             try:
#                 file_path = article.image_url.lstrip('/')
#                 if os.path.exists(file_path):
#                     os.remove(file_path)
#                     logger.info(f"Removed image: {file_path}")
#                 article.image_url = None
#             except Exception as e:
#                 logger.error(f"Error removing image: {str(e)}")
        
#         if image:
#             image_url, _ = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
#             article.image_url = image_url
        
#         if remove_video and article.video_url:
#             try:
#                 file_path = article.video_url.lstrip('/')
#                 if os.path.exists(file_path):
#                     os.remove(file_path)
#                     logger.info(f"Removed video: {file_path}")
#                 article.video_url = None
#                 article.duration = None
#             except Exception as e:
#                 logger.error(f"Error removing video: {str(e)}")
        
#         if video:
#             video_url, duration = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
#             article.video_url = video_url
#             article.duration = duration
        
#         if article.is_story and not (article.image_url or article.video_url):
#             logger.warning(f"Story ID={article.id} updated without media")
#             raise HTTPException(status_code=400, detail="Stories must have an image or video")
        
#         article.updated_at = datetime.utcnow()
#         db.commit()
#         db.refresh(article)
#         logger.info(f"Updated article: ID={article_id}, Section={section_id}, IsStory={article.is_story}, IsComedy={article.is_comedy}, IsSport={article.is_sport}, AuthorName={article.author_name}")
#         return article
#     except Exception as e:
#         logger.error(f"Error updating article {article_id}: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to update article")

# @router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_article(
#     article_id: int,
#     db: Session = Depends(database.get_db),
#     current_user: models.User = Depends(auth.get_current_active_user)
# ):
#     try:
#         article = db.query(models.Article).filter(models.Article.id == article_id).first()
#         if not article:
#             logger.warning(f"Article not found: ID={article_id}")
#             raise HTTPException(status_code=404, detail="Article not found")
        
#         if article.author_id != current_user.id and current_user.role != "admin":
#             logger.warning(f"Unauthorized delete attempt: User={current_user.id}, Article={article_id}")
#             raise HTTPException(status_code=403, detail="Not authorized to delete this article")
        
#         for file_url in [article.image_url, article.video_url]:
#             if file_url:
#                 file_path = file_url.lstrip('/')
#                 if os.path.exists(file_path):
#                     try:
#                         os.remove(file_path)
#                         logger.info(f"Deleted file: {file_path}")
#                     except Exception as e:
#                         logger.error(f"Error deleting file {file_path}: {str(e)}")
        
#         db.delete(article)
#         db.commit()
#         logger.info(f"Deleted article: ID={article_id}")
#         return Response(status_code=status.HTTP_204_NO_CONTENT)
#     except Exception as e:
#         logger.error(f"Error deleting article {article_id}: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to delete article")

# @router.get("/placeholder/{width}/{height}")
# async def get_placeholder_image(width: int, height: int, text: str = "Placeholder", color: str = "4f46e5"):
#     try:
#         if width < 10 or height < 10 or width > 2000 or height > 2000:
#             raise HTTPException(status_code=400, detail="Invalid dimensions. Width and height must be between 10 and 2000.")

#         if color.startswith("#"):
#             color = color[1:]
#         try:
#             r = int(color[:2], 16)
#             g = int(color[2:4], 16)
#             b = int(color[4:6], 16)
#         except ValueError:
#             raise HTTPException(status_code=400, detail="Invalid color format. Use hex (e.g., '4f46e5').")

#         image = Image.new("RGB", (width, height), (r, g, b))
#         draw = ImageDraw.Draw(image)

#         font_size = min(width, height) // 10
#         try:
#             font = ImageFont.truetype("arial.ttf", font_size)
#         except IOError:
#             font = ImageFont.load_default()

#         text_bbox = draw.textbbox((0, 0), text, font=font)
#         text_width = text_bbox[2] - text_bbox[0]
#         text_height = text_bbox[3] - text_bbox[1]
#         text_x = (width - text_width) / 2
#         text_y = (height - text_height) / 2

#         draw.text((text_x, text_y), text, fill="white", font=font)

#         buffer = io.BytesIO()
#         image.save(buffer, format="PNG")
#         buffer.seek(0)

#         return Response(content=buffer.getvalue(), media_type="image/png")

#     except Exception as e:
#         logger.error(f"Error generating placeholder image: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to generate placeholder image")

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Query
from fastapi.responses import Response
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import os
import shutil
from datetime import datetime, timedelta
import uuid
from pathlib import Path
import logging
from PIL import Image, ImageDraw, ImageFont
import io
import subprocess
from tempfile import NamedTemporaryFile

import models, schemas, database
from database import get_db
from . import auth  

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/articles",
    tags=["articles"],
)

UPLOAD_BASE = Path("uploads")
UPLOAD_BASE.mkdir(exist_ok=True)
IMAGE_DIR = UPLOAD_BASE / "images"
VIDEO_DIR = UPLOAD_BASE / "videos"
IMAGE_DIR.mkdir(exist_ok=True)
VIDEO_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpeg', '.jpg'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm'}
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in allowed_extensions

def save_upload_file(upload_file: UploadFile, directory: Path, allowed_extensions: set) -> tuple[str, Optional[float]]:
    if not upload_file:
        return None, None
        
    try:
        if not validate_file_extension(upload_file.filename, allowed_extensions):
            logger.error(f"Invalid file extension for {upload_file.filename}. Allowed: {allowed_extensions}")
            raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")
        
        if directory == VIDEO_DIR and upload_file.size > MAX_VIDEO_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Video file too large. Max size: {MAX_VIDEO_SIZE // (1024 * 1024)}MB"
            )
        if directory == IMAGE_DIR and upload_file.size > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Image file too large. Max size: {MAX_IMAGE_SIZE // (1024 * 1024)}MB"
            )
        
        file_ext = Path(upload_file.filename).suffix
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = directory / filename
        
        directory.mkdir(parents=True, exist_ok=True)
        if not os.access(directory, os.W_OK):
            logger.error(f"Directory not writable: {directory}")
            raise HTTPException(status_code=500, detail=f"Server cannot write to directory: {directory}")
        
        duration = None
        if directory == VIDEO_DIR:
            try:
                with NamedTemporaryFile(delete=False) as temp_file:
                    shutil.copyfileobj(upload_file.file, temp_file)
                    temp_path = temp_file.name
                
                result = subprocess.run(
                    ['ffprobe', '-v', 'error', '-show_entries', 
                     'format=duration', '-of', 
                     'default=noprint_wrappers=1:nokey=1', temp_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                duration = float(result.stdout.strip())
                logger.info(f"Video duration: {duration} seconds")
                
                with open(temp_path, 'rb') as temp_file:
                    with file_path.open("wb") as buffer:
                        shutil.copyfileobj(temp_file, buffer)
                os.unlink(temp_path)
            except Exception as e:
                logger.error(f"Error getting video duration: {str(e)}")
                raise HTTPException(status_code=500, detail="Failed to process video metadata")
        else:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
        
        if not file_path.exists():
            logger.error(f"File not found after saving: {file_path}")
            raise HTTPException(status_code=500, detail="Failed to save file: File not found")
        if not os.access(file_path, os.R_OK):
            logger.error(f"File not readable after saving: {file_path}")
            raise HTTPException(status_code=500, detail="Saved file is not readable")
        
        logger.info(f"Saved file: {file_path}")
        return f"/static/uploads/{directory.name}/{filename}", duration
    except Exception as e:
        logger.error(f"Error saving file {upload_file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
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
        query = query.filter(models.Article.is_story == is_story, 
                           (models.Article.story_expires_at.is_(None) | 
                            (models.Article.story_expires_at > datetime.now())))
    if status:
        query = query.filter(models.Article.status == status)
    
    articles = query.order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    logger.info(f"Retrieved {len(articles)} articles (is_story={is_story}, status={status})")
    logger.info(f"Article IDs: {[article.id for article in articles]}")
    logger.info(f"Story Articles: {[article.id for article in articles if article.is_active_story]}")
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
    logger.info(f"Retrieved {len(articles)} story articles")
    logger.info(f"Story Article IDs: {[article.id for article in articles]}")
    return articles

@router.get("/mostread", response_model=List[schemas.ArticleResponse])
def get_mostread_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    """
    Retrieve articles with at least 50 views, ordered by view count in descending order.
    Only published articles are included.
    """
    try:
        # Calculate average views to determine what's "most read"
        avg_views = db.query(func.avg(models.Article.views)).filter(
            models.Article.status == "published"
        ).scalar() or 0
        
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.views >= 50,  # Minimum 50 views threshold
            models.Article.status == "published"
        ).order_by(
            models.Article.views.desc(),
            models.Article.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(articles)} most read articles with at least 50 views")
        return articles
    except Exception as e:
        logger.error(f"Error fetching most read articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch most read articles")

@router.get("/cinema", response_model=List[schemas.ArticleResponse])
def get_cinema_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_cinema == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} cinema articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching cinema articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch cinema articles")

@router.get("/comedy", response_model=List[schemas.ArticleResponse])
def get_comedy_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_comedy == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} comedy articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching comedy articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch comedy articles")

@router.get("/sport", response_model=List[schemas.ArticleResponse])
async def get_sport_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)   
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_sport == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} sport articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching sport articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch sport articles")

@router.get("/rap", response_model=List[schemas.ArticleResponse])
async def get_rap_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_rap == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} rap articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching rap articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch rap articles")

@router.get("/afrotcham", response_model=List[schemas.ArticleResponse])
async def get_afrotcham_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_afrotcham == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} afrotcham articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching afrotcham articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch afrotcham articles")

@router.get("/buzz", response_model=List[schemas.ArticleResponse])
async def get_buzz_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_buzz == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} buzz articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching buzz articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch buzz articles")

@router.get("/alaune", response_model=List[schemas.ArticleResponse])
async def get_alaune_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.is_alaune == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} alaune articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching alaune articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch alaune articles")

@router.get("/alauneactual", response_model=List[schemas.ArticleResponse])
async def get_alauneactual_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.alauneactual == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} alauneactual articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching alauneactual articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch alauneactual articles")

@router.get("/videoactual", response_model=List[schemas.ArticleResponse])
async def get_videoactual_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.videoactual == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} videoactual articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching videoactual articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch videoactual articles")

@router.get("/eventactual", response_model=List[schemas.ArticleResponse])
async def get_eventactual_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.eventactual == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} eventactual articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching eventactual articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch eventactual articles")

@router.get("/science", response_model=List[schemas.ArticleResponse])
async def get_science_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.science == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} science articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching science articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch science articles")

@router.get("/contenurecent", response_model=List[schemas.ArticleResponse])
async def get_contenurecent_articles(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = Query(10, le=100)
):
    try:
        articles = db.query(models.Article).options(joinedload(models.Article.author)).filter(
            models.Article.contenurecent == True,
            models.Article.status == "published"
        ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(articles)} contenurecent articles")
        return articles
    except Exception as e:
        logger.error(f"Error fetching contenurecent articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch contenurecent articles")

@router.get("/{article_id}", response_model=schemas.ArticleDetailResponse)
def get_article_detail(
    article_id: int,
    section_id: Optional[int] = None,
    db: Session = Depends(database.get_db)
):
    try:
        query = db.query(models.Article).options(joinedload(models.Article.author)).filter(models.Article.id == article_id)
        
        if section_id is not None:
            query = query.filter(models.Article.section_id == section_id)
        
        article = query.first()
        if not article:
            logger.warning(f"Article not found: ID={article_id}, section_id={section_id}")
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Increment view count
        current_views = article.views or 0
        article.views = current_views + 1
        
        db.commit()
        db.refresh(article)
        
        return article
    except Exception as e:
        logger.error(f"Error fetching article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch article")

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
            logger.warning(f"Non-admin user {current_user.id} attempted to set author_name")
            raise HTTPException(status_code=403, detail="Only admins can set author name")
        
        if status not in ["draft", "pending", "published"]:
            logger.warning(f"Invalid status: {status}")
            raise HTTPException(status_code=400, detail="Status must be 'draft', 'pending', or 'published'")
        
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            logger.warning(f"Category not found: ID={category_id}")
            raise HTTPException(status_code=404, detail="Category not found")
        
        if section_id:
            section = db.query(models.Section).filter(models.Section.id == section_id).first()
            if not section:
                logger.warning(f"Section not found: ID={section_id}")
                raise HTTPException(status_code=404, detail="Section not found")
        
        expires_at = story_expires_at
        if is_story and not story_expires_at:
            expires_at = datetime.utcnow() + timedelta(hours=24)
        
        image_url, _ = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS) if image else (None, None)
        video_url, duration = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS) if video else (None, None)
        
        if is_story and not (image_url or video_url):
            logger.warning("Story created without media")
            raise HTTPException(status_code=400, detail="Stories must have an image or video")
        
        logger.info(f"Creating article with author_name={author_name} by user {current_user.id} (role={current_user.role})")
        
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
        logger.info(f"Created article: ID={article.id}, Title={title}, Section={section_id}, IsStory={is_story}, IsComedy={is_comedy}, IsSport={is_sport}, AuthorName={article.author_name}")
        return article
    except Exception as e:
        logger.error(f"Error creating article: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create article")
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
            logger.warning(f"Article not found: ID={article_id}")
            raise HTTPException(status_code=404, detail="Article not found")
        
        if article.author_id != current_user.id and current_user.role != "admin":
            logger.warning(f"Unauthorized update attempt: User={current_user.id}, Article={article_id}")
            raise HTTPException(status_code=403, detail="Not authorized to update this article")

        # Update fields if provided
        if title is not None:
            article.title = title
        if content is not None:
            article.content = content
        if category_id is not None:
            category = db.query(models.Category).filter(models.Category.id == category_id).first()
            if not category:
                logger.warning(f"Category not found: ID={category_id}")
                raise HTTPException(status_code=404, detail="Category not found")
            article.category_id = category_id
        if section_id is not None:
            if section_id:
                section = db.query(models.Section).filter(models.Section.id == section_id).first()
                if not section:
                    logger.warning(f"Section not found: ID={section_id}")
                    raise HTTPException(status_code=404, detail="Section not found")
            article.section_id = section_id
        if mostread is not None:
            article.mostread = mostread
        if is_story is not None:
            article.is_story = is_story
        if is_cinema is not None:
            article.is_cinema = is_cinema
        if is_comedy is not None:
            article.is_comedy = is_comedy
        if is_sport is not None:
            article.is_sport = is_sport
        if is_rap is not None:
            article.is_rap = is_rap
        if is_afrotcham is not None:
            article.is_afrotcham = is_afrotcham
        if is_buzz is not None:
            article.is_buzz = is_buzz
        if is_alaune is not None:
            article.is_alaune = is_alaune
        if alauneactual is not None:
            article.alauneactual = alauneactual
        if videoactual is not None:
            article.videoactual = videoactual
        if eventactual is not None:
            article.eventactual = eventactual
        if science is not None:
            article.science = science
        if is_artist is not None:
            article.is_artist = is_artist
        if contenurecent is not None:
            article.contenurecent = contenurecent
        if status is not None:
            article.status = status
        if story_expires_at is not None:
            article.story_expires_at = story_expires_at
        if author_name is not None and current_user.role == "admin":
            article.author_name = author_name

        # Handle image updates
        if remove_image and article.image_url:
            try:
                file_path = article.image_url.lstrip('/')
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Removed image: {file_path}")
                article.image_url = None
            except Exception as e:
                logger.error(f"Error removing image: {str(e)}")
        
        if image:
            image_url, _ = save_upload_file(image, IMAGE_DIR, ALLOWED_IMAGE_EXTENSIONS)
            article.image_url = image_url

        # Handle video updates
        if remove_video and article.video_url:
            try:
                file_path = article.video_url.lstrip('/')
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Removed video: {file_path}")
                article.video_url = None
                article.duration = None
            except Exception as e:
                logger.error(f"Error removing video: {str(e)}")
        
        if video:
            video_url, duration = save_upload_file(video, VIDEO_DIR, ALLOWED_VIDEO_EXTENSIONS)
            article.video_url = video_url
            article.duration = duration

        # Automatically promote to most read if views >= 50
        if article.views and article.views >= 50 and not article.mostread:
            article.mostread = True
            logger.info(f"Automatically promoting article {article_id} to most read (views: {article.views})")

        # Validate story has media if it's a story
        if article.is_story and not (article.image_url or article.video_url):
            logger.warning(f"Story ID={article.id} updated without media")
            raise HTTPException(status_code=400, detail="Stories must have an image or video")

        article.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(article)
        
        logger.info(f"Updated article: ID={article_id}, Title={article.title}, "
                   f"MostRead={article.mostread}, Views={article.views}")
        return article
        
    except Exception as e:
        logger.error(f"Error updating article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update article")

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    try:
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if not article:
            logger.warning(f"Article not found: ID={article_id}")
            raise HTTPException(status_code=404, detail="Article not found")
        
        if article.author_id != current_user.id and current_user.role != "admin":
            logger.warning(f"Unauthorized delete attempt: User={current_user.id}, Article={article_id}")
            raise HTTPException(status_code=403, detail="Not authorized to delete this article")
        
        for file_url in [article.image_url, article.video_url]:
            if file_url:
                file_path = file_url.lstrip('/')
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        logger.info(f"Deleted file: {file_path}")
                    except Exception as e:
                        logger.error(f"Error deleting file {file_path}: {str(e)}")
        
        db.delete(article)
        db.commit()
        logger.info(f"Deleted article: ID={article_id}")
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        logger.error(f"Error deleting article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete article")

@router.get("/placeholder/{width}/{height}")
async def get_placeholder_image(width: int, height: int, text: str = "Placeholder", color: str = "4f46e5"):
    try:
        if width < 10 or height < 10 or width > 2000 or height > 2000:
            raise HTTPException(status_code=400, detail="Invalid dimensions. Width and height must be between 10 and 2000.")

        if color.startswith("#"):
            color = color[1:]
        try:
            r = int(color[:2], 16)
            g = int(color[2:4], 16)
            b = int(color[4:6], 16)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid color format. Use hex (e.g., '4f46e5').")

        image = Image.new("RGB", (width, height), (r, g, b))
        draw = ImageDraw.Draw(image)

        font_size = min(width, height) // 10
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        text_x = (width - text_width) / 2
        text_y = (height - text_height) / 2

        draw.text((text_x, text_y), text, fill="white", font=font)

        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)

        return Response(content=buffer.getvalue(), media_type="image/png")

    except Exception as e:
        logger.error(f"Error generating placeholder image: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate placeholder image")
