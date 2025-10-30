# from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Enum, CheckConstraint, Date, Float, BigInteger
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.sql import func
# from sqlalchemy.orm import relationship
# import enum
# from datetime import datetime

# Base = declarative_base()

# # Existing enums (unchanged)
# class ArticleStatus(str, enum.Enum):
#     draft = "draft"
#     published = "published"
#     pending = "pending"

# class UserRole(str, enum.Enum):
#     admin = "admin"
#     editor = "editor"

# class EventStatus(str, enum.Enum):
#     draft = "draft"
#     published = "published"
#     processing = "processing"



# class ArtsTraditionsType(str, enum.Enum):
#     artisanat = "artisanat"
#     spiritualite = "spiritualite"
#     tradition = "tradition"
#     culinaire = "culinaire"
#     ethnie = "ethnie"
#     rite = "rite"
#     coutume = "coutume"
#     festival = "festival"
#     recipe = "recipe"
#     ingredient = "ingredient"
#     chef = "chef"
    
# class DirectTVStatus(str, enum.Enum):
#     draft = "draft"
#     published = "published"
#     processing = "processing"

# class AdvertisementStatus(str, enum.Enum):
#     draft = "draft"
#     published = "published"
#     expired = "expired"

# class AdvertisementPage(str, enum.Enum):
#     homepage = "homepage"
#     actualite = "actualite"
#     culture_urbaine = "culture_urbaine"
#     arts_traditions = "arts_traditions"
#     sciences = "sciences"
#     evenements = "evenements"
#     entrepreneuriat = "entrepreneuriat"
#     direct_tv = "direct_tv"
#     all = "all"

# # New enum for ScienceArticle sections
# class ScienceSection(str, enum.Enum):
#     science = "science"
#     technologie = "technologie"
#     innovation = "innovation"
#     recherche = "recherche"
#     developpement_durable = "developpement_durable"
#     biotechnologie = "biotechnologie"
#     intelligence_artificielle = "intelligence_artificielle"
#     sante_numerique = "sante_numerique"

# # Existing classes (unchanged)
# class User(Base):
#     __tablename__ = "users"
    
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String(50), unique=True, nullable=False)
#     email = Column(String(100), unique=True, nullable=False)
#     password_hash = Column(String(255), nullable=False)
#     role = Column(Enum(UserRole), default=UserRole.editor, nullable=False)
#     status = Column(String, default="active", nullable=False)
#     disabled = Column(Boolean, default=False, nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     last_login = Column(DateTime(timezone=True), nullable=True)
#     last_activity = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
#     articles = relationship("Article", back_populates="author")
#     events = relationship("Event", back_populates="organizer")
#     directtv = relationship("DirectTV", back_populates="author")
#     advertisements = relationship("Advertisement", back_populates="created_by")
#     science_articles = relationship("ScienceArticle", back_populates="author")
#     culture_urbaine_articles = relationship("CultureUrbaineArticle", back_populates="author")
#     arts_traditions_articles = relationship("ArtsTraditionsArticle", back_populates="author")

    
#     __table_args__ = (
#         CheckConstraint('last_activity <= NOW()', name='check_last_activity'),
#     )

# class Category(Base):
#     __tablename__ = "categories"
    
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(100), nullable=False, unique=True)
#     slug = Column(String(50), nullable=False, unique=True)
#     description = Column(Text, nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
    
#     articles = relationship("Article", back_populates="category")
#     events = relationship("Event", back_populates="category")
#     directtv = relationship("DirectTV", back_populates="category")
#     advertisements = relationship("Advertisement", back_populates="category")
#     science_articles = relationship("ScienceArticle", back_populates="category")
#     culture_urbaine_articles = relationship("CultureUrbaineArticle", back_populates="category")
#     arts_traditions_articles = relationship("ArtsTraditionsArticle", back_populates="category")

# class Section(Base):
#     __tablename__ = "sections"
    
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(100), nullable=False, unique=True)
#     slug = Column(String(50), nullable=False, unique=True)
#     description = Column(Text, nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
    
#     articles = relationship("Article", back_populates="section")
#     science_articles = relationship("ScienceArticle", back_populates="section")
#     culture_urbaine_articles = relationship("CultureUrbaineArticle", back_populates="section")
#     arts_traditions_articles = relationship("ArtsTraditionsArticle", back_populates="section")  

# class Article(Base):
#     __tablename__ = "articles"
    
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(Text, nullable=False)
#     content = Column(Text, nullable=False)
#     category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
#     section_id = Column(Integer, ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
#     status = Column(Enum(ArticleStatus), default=ArticleStatus.draft, nullable=False)
#     image_url = Column(Text, nullable=True)
#     video_url = Column(Text, nullable=True)
#     views = Column(Integer, default=0)
#     author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
#     author_name = Column(String(100), nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
#     mostread = Column(Boolean, default=False)
#     is_story = Column(Boolean, default=False)
#     is_cinema = Column(Boolean, default=False)
#     is_comedy = Column(Boolean, default=False)
#     is_sport = Column(Boolean, default=False)
#     is_rap = Column(Boolean, default=False)
#     is_afrotcham = Column(Boolean, default=False)
#     is_buzz = Column(Boolean, default=False)
#     is_alaune = Column(Boolean, default=False)
#     alauneactual = Column(Boolean, default=False)
#     videoactual = Column(Boolean, default=False)
#     eventactual = Column(Boolean, default=False)
#     science = Column(Boolean, default=False)
#     is_artist = Column(Boolean, default=False)
#     contenurecent = Column(Boolean, default=False)
#     story_expires_at = Column(DateTime(timezone=True), nullable=True)
#     duration = Column(String(50), nullable=True)
    
#     category = relationship("Category", back_populates="articles")
#     section = relationship("Section", back_populates="articles")
#     author = relationship("User", back_populates="articles")

#     @property
#     def is_most_read(self):
#         return (self.views or 0) >= 50

# class Artist(Base):
#     __tablename__ = "artists"
    
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(100), nullable=False)
#     type = Column(String(50), nullable=False)
#     role = Column(String(100), nullable=True)
#     image_url = Column(Text, nullable=True)
#     followers = Column(Integer, default=0)
#     description = Column(Text, nullable=True)
#     bio = Column(Text, nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# class Event(Base):
#     __tablename__ = "events"
    
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(Text, nullable=False)
#     description = Column(Text, nullable=False)
#     category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
#     location = Column(String(100), nullable=False)
#     venue = Column(String(100), nullable=False)
#     date = Column(DateTime(timezone=True), nullable=False)
#     end_date = Column(DateTime(timezone=True), nullable=True)
#     time = Column(String(50), nullable=False)
#     status = Column(Enum(EventStatus), default=EventStatus.draft, nullable=False)
#     is_featured = Column(Boolean, default=False, nullable=False)
#     attendees = Column(Integer, default=0)
#     contact = Column(String(50), nullable=False)
#     tickets_available = Column(Boolean, default=False, nullable=False)
#     ticket_price = Column(String(50), nullable=True)
#     ticket_url = Column(Text, nullable=True)
#     organizer_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
#     image_url = Column(Text, nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
#     category = relationship("Category", back_populates="events")
#     organizer = relationship("User", back_populates="events")

# class DirectTV(Base):
#     __tablename__ = "direct_tv"
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, index=True)
#     description = Column(String)
#     category_id = Column(Integer, ForeignKey("categories.id"))
#     time = Column(String)
#     date = Column(DateTime)
#     duration = Column(String, nullable=True)
#     image_url = Column(String, nullable=True)
#     video_url = Column(String, nullable=True)
#     status = Column(Enum(DirectTVStatus), default=DirectTVStatus.draft)
#     is_live = Column(Boolean, default=False)
#     is_featured = Column(Boolean, default=False, nullable=False)
#     author_id = Column(Integer, ForeignKey("users.id"))
#     author_name = Column(String)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
#     author = relationship("User", back_populates="directtv")
#     category = relationship("Category", back_populates="directtv")

# class UpcomingProgram(Base):
#     __tablename__ = "upcoming_programs"
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, nullable=False)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
#     created_by = Column(Integer, ForeignKey("users.id"))
#     updated_by = Column(Integer, ForeignKey("users.id"))

# class Advertisement(Base):
#     __tablename__ = "advertisements"
    
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String(200), nullable=False)
#     image_url = Column(Text, nullable=False)
#     redirect_url = Column(Text, nullable=True)
#     status = Column(Enum(AdvertisementStatus), default=AdvertisementStatus.draft, nullable=False)
#     category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=True)
#     created_by_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
#     page = Column(Enum(AdvertisementPage), default=AdvertisementPage.all, nullable=False)
    
#     category = relationship("Category", back_populates="advertisements")
#     created_by = relationship("User", back_populates="advertisements")

# class TeamMember(Base):
#     __tablename__ = "team_members"
    
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(100), nullable=False)
#     role = Column(String(100), nullable=False)
#     image_url = Column(Text, nullable=True)
#     bio = Column(Text, nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# class Milestone(Base):
#     __tablename__ = "milestones"
    
#     id = Column(Integer, primary_key=True, index=True)
#     year = Column(String(4), nullable=False)
#     title = Column(Text, nullable=False)
#     description = Column(Text, nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# class Stat(Base):
#     __tablename__ = "stats"
    
#     id = Column(Integer, primary_key=True, index=True)
#     number = Column(String(50), nullable=False)
#     label = Column(Text, nullable=False)
#     icon_name = Column(String(50), nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# class Value(Base):
#     __tablename__ = "values"
    
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String(100), nullable=False)
#     description = Column(Text, nullable=False)
#     icon_name = Column(String(50), nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# class ContactInfo(Base):
#     __tablename__ = "contact_info"
    
#     id = Column(Integer, primary_key=True, index=True)
#     address = Column(Text, nullable=False)
#     email = Column(String(100), nullable=False)
#     phone = Column(String(50), nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# class Studio(Base):
#     __tablename__ = "studios"
    
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String(200), nullable=False)
#     description = Column(Text, nullable=False)
#     features = Column(Text, nullable=False)
#     collaboration_text = Column(Text, nullable=False)
#     image_path = Column(Text, nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# class AboutContent(Base):
#     __tablename__ = "about_content"
    
#     id = Column(Integer, primary_key=True, index=True)
#     history_title = Column(String(200), nullable=False)
#     history_subtitle = Column(String(200), nullable=False)
#     history_text1 = Column(Text, nullable=False)
#     history_text2 = Column(Text, nullable=False)
#     mission_title = Column(String(200), nullable=False)
#     mission_subtitle = Column(String(200), nullable=False)
#     mission_text = Column(Text, nullable=False)
#     vision_title = Column(String(200), nullable=False)
#     vision_text = Column(Text, nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# # New ScienceArticle class
# class ScienceArticle(Base):
#     __tablename__ = "science_articles"
    
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(Text, nullable=False)
#     content = Column(Text, nullable=False)
#     category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
#     section_id = Column(Integer, ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
#     science_section = Column(Enum(ScienceSection), default=ScienceSection.science, nullable=False)
#     status = Column(Enum(ArticleStatus), default=ArticleStatus.draft, nullable=False)
#     image_url = Column(Text, nullable=True)
#     video_url = Column(Text, nullable=True)
#     views = Column(Integer, default=0)
#     author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
#     author_name = Column(String(100), nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
#     category = relationship("Category", back_populates="science_articles")
#     section = relationship("Section", back_populates="science_articles")
#     author = relationship("User", back_populates="science_articles")



# class Song(Base):
#     __tablename__ = "songs"

#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, nullable=False)
#     artist_name = Column(String, nullable=True)
#     audio_url = Column(String, nullable=True)
#     image_url = Column(String, nullable=True)
#     category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
#     status = Column(String, default="published")
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     category = relationship("Category", back_populates="songs")

# # Update the Category model to include a relationship with Song
# class Category(Base):
#     __tablename__ = "categories"
#     # ... existing fields ...
#     songs = relationship("Song", back_populates="category")





# class CultureUrbaineArticle(Base):
#     __tablename__ = "culture_urbaine_articles"
    
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String(255), nullable=False)
#     content = Column(Text, nullable=False)
#     category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
#     section_id = Column(Integer, ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
#     status = Column(Enum(ArticleStatus), default=ArticleStatus.draft, nullable=False)
#     image_url = Column(Text, nullable=True)
#     video_url = Column(Text, nullable=True)
#     audio_url = Column(Text, nullable=True)  # Added audio_url column
#     author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
#     author_name = Column(String(100), nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
#     Lmusic = Column(Boolean, default=False, nullable=False)
#     Ldance = Column(Boolean, default=False, nullable=False)
#     Lafrotcham = Column(Boolean, default=False, nullable=False)
#     Lrap = Column(Boolean, default=False, nullable=False)
    
#     author = relationship("User", back_populates="culture_urbaine_articles")
#     category = relationship("Category", back_populates="culture_urbaine_articles")
#     section = relationship("Section", back_populates="culture_urbaine_articles")
    
#     @property
#     def author_username(self):
#         return self.author_name or (self.author.username if self.author else "Inconnu")


# class ArtsTraditionsArticle(Base):
#     __tablename__ = "arts_traditions_articles"
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, nullable=False)
#     content = Column(Text, nullable=False)
#     category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
#     section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
#     arts_traditions_type = Column(Enum(ArtsTraditionsType), nullable=False)   
#     status = Column(String, nullable=False, default="draft")
#     image_url = Column(String, nullable=True)
#     video_url = Column(String, nullable=True)
#     views = Column(Integer, default=0)
#     author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     author_name = Column(String, nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow)
#     date = Column(Date, nullable=True)  # For festivals
#     prep_time = Column(String, nullable=True)  # For recipes
#     cook_time = Column(String, nullable=True)  # For recipes
#     difficulty = Column(String, nullable=True)  # For recipes
#     rating = Column(Float, nullable=True)  # For recipes
#     reviews = Column(Integer, nullable=True)  # For recipes
#     recipe_author = Column(String, nullable=True)  # For recipes
#     specialty = Column(String, nullable=True)  # For chefs
#     recipes_count = Column(Integer, nullable=True)  # For chefs
#     category = relationship("Category")
#     section = relationship("Section")
#     author = relationship("User")



# class ActualiteHome(Base):
#     __tablename__ = "actualitehome"
    
#     id = Column(BigInteger, primary_key=True, index=True)
#     title = Column(String(255), nullable=False)
#     description = Column(Text, nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
#     status = Column(Enum(ArticleStatus), default=ArticleStatus.draft, nullable=False)






from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Enum, CheckConstraint, Date, Float, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

Base = declarative_base()

# Existing enums (unchanged)
class ArticleStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    pending = "pending"

class UserRole(str, enum.Enum):
    admin = "admin"
    editor = "editor"

class EventStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    processing = "processing"

class ArtsTraditionsType(str, enum.Enum):
    artisanat = "artisanat"
    spiritualite = "spiritualite"
    tradition = "tradition"
    culinaire = "culinaire"
    ethnie = "ethnie"
    rite = "rite"
    coutume = "coutume"
    festival = "festival"
    recipe = "recipe"
    ingredient = "ingredient"
    chef = "chef"

class DirectTVStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    processing = "processing"

class AdvertisementStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    expired = "expired"

class AdvertisementPage(str, enum.Enum):
    homepage = "homepage"
    actualite = "actualite"
    culture_urbaine = "culture_urbaine"
    arts_traditions = "arts_traditions"
    sciences = "sciences"
    evenements = "evenements"
    entrepreneuriat = "entrepreneuriat"
    direct_tv = "direct_tv"
    all = "all"

class ScienceSection(str, enum.Enum):
    science = "science"
    technologie = "technologie"
    innovation = "innovation"
    recherche = "recherche"
    developpement_durable = "developpement_durable"
    biotechnologie = "biotechnologie"
    intelligence_artificielle = "intelligence_artificielle"
    sante_numerique = "sante_numerique"

# Existing classes (unchanged except where noted)
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.editor, nullable=False)
    status = Column(String, default="active", nullable=False)
    disabled = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    last_activity = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    articles = relationship("Article", back_populates="author")
    events = relationship("Event", back_populates="organizer")
    directtv = relationship("DirectTV", back_populates="author")
    advertisements = relationship("Advertisement", back_populates="created_by")
    science_articles = relationship("ScienceArticle", back_populates="author")
    culture_urbaine_articles = relationship("CultureUrbaineArticle", back_populates="author")
    arts_traditions_articles = relationship("ArtsTraditionsArticle", back_populates="author")
    
    __table_args__ = (
        CheckConstraint('last_activity <= NOW()', name='check_last_activity'),
    )

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    articles = relationship("Article", back_populates="category")
    events = relationship("Event", back_populates="category")
    directtv = relationship("DirectTV", back_populates="category")
    advertisements = relationship("Advertisement", back_populates="category")
    science_articles = relationship("ScienceArticle", back_populates="category")
    culture_urbaine_articles = relationship("CultureUrbaineArticle", back_populates="category")
    arts_traditions_articles = relationship("ArtsTraditionsArticle", back_populates="category")
    songs = relationship("Song", back_populates="category")

class Section(Base):
    __tablename__ = "sections"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    articles = relationship("Article", back_populates="section")
    science_articles = relationship("ScienceArticle", back_populates="section")
    culture_urbaine_articles = relationship("CultureUrbaineArticle", back_populates="section")
    arts_traditions_articles = relationship("ArtsTraditionsArticle", back_populates="section")

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(ArticleStatus), default=ArticleStatus.draft, nullable=False)
    image_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    views = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    author_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    mostread = Column(Boolean, default=False)
    is_story = Column(Boolean, default=False)
    is_cinema = Column(Boolean, default=False)
    is_comedy = Column(Boolean, default=False)
    is_sport = Column(Boolean, default=False)
    is_rap = Column(Boolean, default=False)
    is_afrotcham = Column(Boolean, default=False)
    is_buzz = Column(Boolean, default=False)
    is_alaune = Column(Boolean, default=False)
    alauneactual = Column(Boolean, default=False)
    videoactual = Column(Boolean, default=False)
    eventactual = Column(Boolean, default=False)
    science = Column(Boolean, default=False)
    is_artist = Column(Boolean, default=False)
    contenurecent = Column(Boolean, default=False)
    story_expires_at = Column(DateTime(timezone=True), nullable=True)
    duration = Column(String(50), nullable=True)
    
    category = relationship("Category", back_populates="articles")
    section = relationship("Section", back_populates="articles")
    author = relationship("User", back_populates="articles")

    __table_args__ = (
        CheckConstraint("is_story = false OR story_expires_at IS NOT NULL", name="check_story_expiration"),
    )

    @property
    def is_active_story(self):
        """Check if the article is a story and has not expired."""
        if not self.is_story:
            return False
        if self.story_expires_at is None:
            return True
        return self.story_expires_at > datetime.now(self.story_expires_at.tzinfo)

    @property
    def is_most_read(self):
        return (self.views or 0) >= 50

class Artist(Base):
    __tablename__ = "artists"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    role = Column(String(100), nullable=True)
    image_url = Column(Text, nullable=True)
    followers = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    location = Column(String(100), nullable=False)
    venue = Column(String(100), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    time = Column(String(50), nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.draft, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    attendees = Column(Integer, default=0)
    contact = Column(String(50), nullable=False)
    tickets_available = Column(Boolean, default=False, nullable=False)
    ticket_price = Column(String(50), nullable=True)
    ticket_url = Column(Text, nullable=True)
    organizer_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    category = relationship("Category", back_populates="events")
    organizer = relationship("User", back_populates="events")

class DirectTV(Base):
    __tablename__ = "direct_tv"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    time = Column(String)
    date = Column(DateTime)
    duration = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    status = Column(Enum(DirectTVStatus), default=DirectTVStatus.draft)
    is_live = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    author_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    author = relationship("User", back_populates="directtv")
    category = relationship("Category", back_populates="directtv")

class UpcomingProgram(Base):
    __tablename__ = "upcoming_programs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"))

class Advertisement(Base):
    __tablename__ = "advertisements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    image_url = Column(Text, nullable=False)
    redirect_url = Column(Text, nullable=True)
    status = Column(Enum(AdvertisementStatus), default=AdvertisementStatus.draft, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    page = Column(Enum(AdvertisementPage), default=AdvertisementPage.all, nullable=False)
    
    category = relationship("Category", back_populates="advertisements")
    created_by = relationship("User", back_populates="advertisements")

class TeamMember(Base):
    __tablename__ = "team_members"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    image_url = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Milestone(Base):
    __tablename__ = "milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    year = Column(String(4), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Stat(Base):
    __tablename__ = "stats"
    
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(50), nullable=False)
    label = Column(Text, nullable=False)
    icon_name = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Value(Base):
    __tablename__ = "values"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon_name = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ContactInfo(Base):
    __tablename__ = "contact_info"
    
    id = Column(Integer, primary_key=True, index=True)
    address = Column(Text, nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Studio(Base):
    __tablename__ = "studios"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    features = Column(Text, nullable=False)
    collaboration_text = Column(Text, nullable=False)
    image_path = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class AboutContent(Base):
    __tablename__ = "about_content"
    
    id = Column(Integer, primary_key=True, index=True)
    history_title = Column(String(200), nullable=False)
    history_subtitle = Column(String(200), nullable=False)
    history_text1 = Column(Text, nullable=False)
    history_text2 = Column(Text, nullable=False)
    mission_title = Column(String(200), nullable=False)
    mission_subtitle = Column(String(200), nullable=False)
    mission_text = Column(Text, nullable=False)
    vision_title = Column(String(200), nullable=False)
    vision_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ScienceArticle(Base):
    __tablename__ = "science_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
    science_section = Column(Enum(ScienceSection), default=ScienceSection.science, nullable=False)
    status = Column(Enum(ArticleStatus), default=ArticleStatus.draft, nullable=False)
    image_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    views = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    author_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_story = Column(Boolean, default=False)  # Added is_story field
    story_expires_at = Column(DateTime(timezone=True), nullable=True)  # Added story_expires_at field
    
    category = relationship("Category", back_populates="science_articles")
    section = relationship("Section", back_populates="science_articles")
    author = relationship("User", back_populates="science_articles")

    __table_args__ = (
        CheckConstraint("is_story = false OR story_expires_at IS NOT NULL", name="check_science_story_expiration"),
    )

    @property
    def is_active_story(self):
        """Check if the article is a story and has not expired."""
        if not self.is_story:
            return False
        if self.story_expires_at is None:
            return True
        return self.story_expires_at > datetime.now(self.story_expires_at.tzinfo)

class Song(Base):
    __tablename__ = "songs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    artist_name = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    status = Column(String, default="published")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    category = relationship("Category", back_populates="songs")

class CultureUrbaineArticle(Base):
    __tablename__ = "culture_urbaine_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(ArticleStatus), default=ArticleStatus.draft, nullable=False)
    image_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    audio_url = Column(Text, nullable=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    author_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    Lmusic = Column(Boolean, default=False, nullable=False)
    Ldance = Column(Boolean, default=False, nullable=False)
    Lafrotcham = Column(Boolean, default=False, nullable=False)
    Lrap = Column(Boolean, default=False, nullable=False)
    is_story = Column(Boolean, default=False)  # Added is_story field
    story_expires_at = Column(DateTime(timezone=True), nullable=True)  # Added story_expires_at field
    
    author = relationship("User", back_populates="culture_urbaine_articles")
    category = relationship("Category", back_populates="culture_urbaine_articles")
    section = relationship("Section", back_populates="culture_urbaine_articles")

    __table_args__ = (
        CheckConstraint("is_story = false OR story_expires_at IS NOT NULL", name="check_culture_urbaine_story_expiration"),
    )

    @property
    def is_active_story(self):
        """Check if the article is a story and has not expired."""
        if not self.is_story:
            return False
        if self.story_expires_at is None:
            return True
        return self.story_expires_at > datetime.now(self.story_expires_at.tzinfo)

    @property
    def author_username(self):
        return self.author_name or (self.author.username if self.author else "Inconnu")

class ArtsTraditionsArticle(Base):
    __tablename__ = "arts_traditions_articles"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    arts_traditions_type = Column(Enum(ArtsTraditionsType), nullable=False)
    status = Column(String, nullable=False, default="draft")
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    views = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    date = Column(Date, nullable=True)
    prep_time = Column(String, nullable=True)
    cook_time = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    reviews = Column(Integer, nullable=True)
    recipe_author = Column(String, nullable=True)
    specialty = Column(String, nullable=True)
    recipes_count = Column(Integer, nullable=True)
    is_story = Column(Boolean, default=False)  # Added is_story field
    story_expires_at = Column(DateTime(timezone=True), nullable=True)  # Added story_expires_at field
    
    category = relationship("Category", back_populates="arts_traditions_articles")
    section = relationship("Section", back_populates="arts_traditions_articles")
    author = relationship("User", back_populates="arts_traditions_articles")

    __table_args__ = (
        CheckConstraint("is_story = false OR story_expires_at IS NOT NULL", name="check_arts_traditions_story_expiration"),
    )

    @property
    def is_active_story(self):
        """Check if the article is a story and has not expired."""
        if not self.is_story:
            return False
        if self.story_expires_at is None:
            return True
        return self.story_expires_at > datetime.now(self.story_expires_at.tzinfo)

class ActualiteHome(Base):
    __tablename__ = "actualitehome"
    
    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    status = Column(Enum(ArticleStatus), default=ArticleStatus.draft, nullable=False)