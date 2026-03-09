# from pydantic import BaseModel, Field, validator, EmailStr, HttpUrl
# from typing import Optional, List
# from datetime import datetime, date
# from enum import Enum
# import enum

# # Existing enums (unchanged)
# class ArticleStatus(str, Enum):
#     draft = "draft"
#     published = "published"
#     pending = "pending"

# class UserRole(str, Enum):
#     admin = "admin"
#     editor = "editor"

# class ArtsTraditionsType(str, enum.Enum):
#     artisanat = "artisanat"
#     spiritualite = "spiritualite"
#     tradition = "tradition"
#     culinaire = "culinaire"
#     ethnie = "ethnie"  # Changed from "ethnique"
#     rite = "rite"
#     coutume = "coutume"
#     festival = "festival"
#     recipe = "recipe"
#     ingredient = "ingredient"
#     chef = "chef"



# class EventStatus(str, Enum):
#     draft = "draft"
#     published = "published"
#     processing = "processing"

# class DirectTVStatus(str, Enum):
#     draft = "draft"
#     published = "published"
#     processing = "processing"

# class AdvertisementStatus(str, Enum):
#     draft = "draft"
#     published = "published"
#     expired = "expired"

# class AdvertisementPage(str, Enum):
#     homepage = "homepage"
#     actualite = "actualite"
#     culture_urbaine = "culture_urbaine"
#     arts_traditions = "arts_traditions"
#     sciences = "sciences"
#     evenements = "evenements"
#     entrepreneuriat = "entrepreneuriat"
#     direct_tv = "direct_tv"
#     all = "all"

# class ScienceSection(str, Enum):
#     science = "science"
#     technologie = "technologie"
#     innovation = "innovation"
#     recherche = "recherche"
#     developpement_durable = "developpement_durable"
#     biotechnologie = "biotechnologie"
#     intelligence_artificielle = "intelligence_artificielle"
#     sante_numerique = "sante_numerique"

# # Existing schemas (unchanged)
# class UserBase(BaseModel):
#     username: str = Field(..., min_length=3, max_length=50)
#     email: str = Field(..., max_length=100)
#     role: UserRole = UserRole.editor

# class CategoryBase(BaseModel):
#     name: str = Field(..., min_length=1, max_length=100)
#     description: Optional[str] = Field(None, max_length=500)

# class SectionBase(BaseModel):
#     name: str = Field(..., min_length=1, max_length=100)
#     description: Optional[str] = Field(None, max_length=500)

# class ArticleBase(BaseModel):
#     title: str = Field(..., min_length=1, max_length=200)
#     content: str = Field(..., min_length=1)
#     category_id: int
#     section_id: Optional[int] = None
#     status: ArticleStatus = ArticleStatus.draft
#     mostread: bool = False
#     is_story: bool = False
#     is_cinema: bool = False 
#     is_comedy: bool = False
#     is_sport: bool = False
#     is_rap: bool = False  
#     is_afrotcham: bool = False
#     alauneactual: bool = False
#     eventactual: bool = False
#     videoactual: bool = False
#     is_alaune: bool = False
#     is_buzz: bool = False
#     science: bool = False
#     is_artist: bool = False
#     contenurecent: bool = False
#     duration: Optional[str] = Field(None, max_length=50)
#     author_name: Optional[str] = Field(None, max_length=100)

# class EventBase(BaseModel):
#     title: str = Field(..., min_length=1, max_length=200)
#     description: str = Field(..., min_length=1, max_length=1000)
#     category_id: int
#     location: str = Field(..., max_length=200)
#     venue: str = Field(..., max_length=200)
#     date: datetime
#     end_date: Optional[datetime] = None
#     time: str = Field(..., max_length=20)
#     status: EventStatus = EventStatus.draft
#     is_featured: bool = False
#     attendees: int = 0
#     contact: str = Field(..., max_length=100)
#     tickets_available: bool = False
#     ticket_price: Optional[str] = Field(None, max_length=50)
#     ticket_url: Optional[str] = Field(None, max_length=500)

# class DirectTVBase(BaseModel):
#     title: str = Field(..., min_length=1, max_length=200)
#     description: str = Field(..., min_length=1, max_length=1000)
#     category_id: int
#     time: str = Field(..., max_length=20)
#     date: datetime
#     duration: Optional[str] = Field(None, max_length=50)
#     status: DirectTVStatus = DirectTVStatus.draft
#     author_name: Optional[str] = Field(None, max_length=100)
#     is_live: bool = False
#     is_featured: bool = False

#     @validator('time')
#     def normalize_time_format(cls, v):
#         """Convert time format from '10h30' to '10:30' or validate '10:30' format"""
#         if 'h' in v:
#             return v.replace('h', ':')
#         import re
#         if re.match(r'^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$', v):
#             return re.sub(r'\s*-\s*', '-', v)
#         if not re.match(r'^\d{1,2}:\d{2}$', v):
#             raise ValueError('Time must be in HH:MM format, HhMM format, or HH:MM-HH:MM range format')
#         return v

# class AdvertisementBase(BaseModel):
#     title: str = Field(..., min_length=1, max_length=200)
#     image_url: str = Field(..., max_length=500)
#     redirect_url: Optional[str] = Field(None, max_length=500)
#     status: AdvertisementStatus = AdvertisementStatus.draft
#     category_id: Optional[int] = None
#     page: AdvertisementPage = AdvertisementPage.all

#     @validator('image_url')
#     def validate_image_url(cls, v):
#         if not v:
#             raise ValueError('Image URL is required')
#         return v

# class UserCreate(UserBase):
#     password: str = Field(..., min_length=8)

# class CategoryCreate(CategoryBase):
#     pass

# class SectionCreate(SectionBase):
#     pass

# class ArticleCreate(ArticleBase):
#     author_id: int

# class EventCreate(EventBase):
#     organizer_id: int

# class DirectTVCreate(DirectTVBase):
#     author_id: int
#     date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}')

# class AdvertisementCreate(AdvertisementBase):
#     created_by_id: int

# class UserUpdate(BaseModel):
#     username: Optional[str] = Field(None, min_length=3, max_length=50)
#     email: Optional[str] = Field(None, max_length=100)
#     role: Optional[UserRole] = None
#     password: Optional[str] = Field(None, min_length=8)
#     disabled: Optional[bool] = None

# class CategoryUpdate(BaseModel):
#     name: Optional[str] = Field(None, min_length=1, max_length=100)
#     description: Optional[str] = Field(None, max_length=500)

# class SectionUpdate(BaseModel):
#     name: Optional[str] = Field(None, min_length=1, max_length=100)
#     description: Optional[str] = Field(None, max_length=500)

# class ArticleUpdate(BaseModel):
#     title: Optional[str] = Field(None, min_length=1, max_length=200)
#     content: Optional[str] = None
#     category_id: Optional[int] = None
#     section_id: Optional[int] = None
#     mostread: Optional[bool] = None
#     is_story: Optional[bool] = None
#     is_cinema: Optional[bool] = None  
#     is_comedy: Optional[bool] = None  
#     is_sport: Optional[bool] = None
#     is_rap: Optional[bool] = None  
#     is_afrotcham: Optional[bool] = None
#     is_buzz: Optional[bool] = None
#     is_alaune: Optional[bool] = None
#     alauneactual: Optional[bool] = None
#     videoactual: Optional[bool] = None
#     eventactual: Optional[bool] = None
#     science: Optional[bool] = None
#     is_artist: Optional[bool] = None
#     contenurecent: Optional[bool] = None
#     status: Optional[ArticleStatus] = None
#     duration: Optional[str] = Field(None, max_length=50)
#     author_name: Optional[str] = Field(None, max_length=100)

# class EventUpdate(BaseModel):
#     title: Optional[str] = Field(None, min_length=1, max_length=200)
#     description: Optional[str] = Field(None, max_length=1000)
#     category_id: Optional[int] = None
#     location: Optional[str] = Field(None, max_length=200)
#     venue: Optional[str] = Field(None, max_length=200)
#     date: Optional[datetime] = None
#     end_date: Optional[datetime] = None
#     time: Optional[str] = Field(None, max_length=20)
#     status: Optional[EventStatus] = None
#     is_featured: Optional[bool] = None
#     attendees: Optional[int] = None
#     contact: Optional[str] = Field(None, max_length=100)
#     tickets_available: Optional[bool] = None
#     ticket_price: Optional[str] = Field(None, max_length=50)
#     ticket_url: Optional[str] = Field(None, max_length=500)

# class DirectTVUpdate(BaseModel):
#     title: Optional[str] = Field(None, min_length=1, max_length=200)
#     description: Optional[str] = Field(None, max_length=1000)
#     category_id: Optional[int] = None
#     time: Optional[str] = Field(None, max_length=20)
#     date: Optional[str] = Field(None, pattern=r'^\d{4}-\d{2}-\d{2}')
#     duration: Optional[str] = Field(None, max_length=50)
#     status: Optional[DirectTVStatus] = None
#     author_name: Optional[str] = Field(None, max_length=100)
#     is_live: Optional[bool] = None
#     is_featured: Optional[bool] = None

#     @validator('time')
#     def normalize_time_format(cls, v):
#         if v is None:
#             return v
#         if 'h' in v:
#             return v.replace('h', ':')
#         import re
#         if re.match(r'^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$', v):
#             return re.sub(r'\s*-\s*', '-', v)
#         if not re.match(r'^\d{1,2}:\d{2}$', v):
#             raise ValueError('Time must be in HH:MM format, HhMM format, or HH:MM-HH:MM range format')
#         return v

# class AdvertisementUpdate(BaseModel):
#     title: Optional[str] = Field(None, min_length=1, max_length=200)
#     image_url: Optional[str] = Field(None, max_length=500)
#     redirect_url: Optional[str] = Field(None, max_length=500)
#     status: Optional[AdvertisementStatus] = None
#     category_id: Optional[int] = None
#     page: Optional[AdvertisementPage] = None

# class UserResponse(BaseModel):
#     id: int
#     username: str
#     email: str
#     role: str
#     status: str
#     disabled: bool = False  
#     last_login: Optional[datetime] = None  
#     last_activity: Optional[datetime] = None 
    
#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         } 

# class CategoryResponse(CategoryBase):
#     id: int
#     created_at: datetime
    
#     class Config:
#         from_attributes = True

# class SectionResponse(SectionBase):
#     id: int
#     created_at: datetime
    
#     class Config:
#         from_attributes = True

# class ArticleResponse(ArticleBase):
#     id: int
#     views: Optional[int] = 0
#     mostread: bool = False
#     is_story: bool = False
#     is_comedy: bool = False  
#     is_sport: bool = False
#     is_rap: bool = False  
#     is_afrotcham: bool = False
#     is_buzz: bool = False
#     is_alaune: bool = False
#     alauneactual: bool = False
#     videoactual: bool = False
#     eventactual: bool = False
#     science: bool = False
#     is_artist: bool = False
#     contenurecent: bool = False
#     story_expires_at: Optional[datetime] = None
#     image_url: Optional[str] = None
#     video_url: Optional[str] = None
#     author_id: int
#     author_name: Optional[str] = None
#     created_at: datetime
#     updated_at: Optional[datetime] = None
    
#     class Config:
#         from_attributes = True

# class ArticleDetailResponse(ArticleResponse):
#     category: CategoryResponse
#     section: Optional[SectionResponse] = None
#     author: UserResponse
    
#     class Config:
#         from_attributes = True

# class EventResponse(EventBase):
#     id: int
#     organizer_id: int
#     image_url: Optional[str] = None
#     created_at: datetime
#     updated_at: Optional[datetime] = None
    
#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class EventDetailResponse(EventResponse):
#     category: CategoryResponse
#     organizer: UserResponse
    
#     class Config:
#         from_attributes = True

# class DirectTVResponse(DirectTVBase):
#     id: int
#     image_url: Optional[str] = None
#     video_url: Optional[str] = None
#     author_id: int
#     is_featured: bool
#     created_at: datetime
#     updated_at: Optional[datetime] = None
    
#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class DirectTVDetailResponse(DirectTVResponse):
#     category: CategoryResponse
#     author: UserResponse
    
#     class Config:
#         from_attributes = True

# class AdvertisementResponse(AdvertisementBase):
#     id: int
#     created_by_id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None
#     page: AdvertisementPage
    
#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class AdvertisementDetailResponse(AdvertisementResponse):
#     category: Optional[CategoryResponse] = None
#     created_by: UserResponse
    
#     class Config:
#         from_attributes = True

# class UpcomingProgramBase(BaseModel):
#     title: str

# class UpcomingProgramCreate(UpcomingProgramBase):
#     pass

# class UpcomingProgramUpdate(BaseModel):
#     title: Optional[str] = None

# class UpcomingProgramResponse(UpcomingProgramBase):
#     id: int
#     created_at: datetime
#     updated_at: datetime
#     created_by: Optional[int] = None
#     updated_by: Optional[int] = None

#     class Config:
#         orm_mode = True

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class TokenData(BaseModel):
#     username: Optional[str] = None
#     user_id: Optional[int] = None
#     role: Optional[str] = None

# class ArtistBase(BaseModel):
#     name: str = Field(..., min_length=1, max_length=100)
#     type: str = Field(..., max_length=50)
#     role: Optional[str] = Field(None, max_length=100)
#     image_url: Optional[str] = Field(None, max_length=500)
#     followers: int = 0
#     description: Optional[str] = Field(None, max_length=1000)
#     bio: Optional[str] = Field(None, max_length=2000)

# class ArtistResponse(ArtistBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None
    
#     class Config:
#         from_attributes = True

# class TeamMemberBase(BaseModel):
#     name: str = Field(..., min_length=1, max_length=100)
#     role: str = Field(..., min_length=1, max_length=100)
#     image_url: Optional[str] = Field(None, max_length=500)
#     bio: Optional[str] = Field(None, max_length=1000)

# class TeamMemberCreate(TeamMemberBase):
#     pass

# class TeamMemberUpdate(BaseModel):
#     name: Optional[str] = Field(None, min_length=1, max_length=100)
#     role: Optional[str] = Field(None, min_length=1, max_length=100)
#     image_url: Optional[str] = Field(None, max_length=500)
#     bio: Optional[str] = Field(None, max_length=1000)

# class TeamMemberResponse(TeamMemberBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class MilestoneBase(BaseModel):
#     year: str = Field(..., pattern=r'^\d{4}$')
#     title: str = Field(..., min_length=1, max_length=200)
#     description: str = Field(..., min_length=1, max_length=1000)

# class MilestoneCreate(MilestoneBase):
#     pass

# class MilestoneUpdate(BaseModel):
#     year: Optional[str] = Field(None, pattern=r'^\d{4}$')
#     title: Optional[str] = Field(None, min_length=1, max_length=200)
#     description: Optional[str] = Field(None, min_length=1, max_length=1000)

# class MilestoneResponse(MilestoneBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class StatBase(BaseModel):
#     number: str = Field(..., min_length=1, max_length=50)
#     label: str = Field(..., min_length=1, max_length=200)
#     icon_name: Optional[str] = Field(None, max_length=50)

# class StatCreate(StatBase):
#     pass

# class StatUpdate(BaseModel):
#     number: Optional[str] = Field(None, min_length=1, max_length=50)
#     label: Optional[str] = Field(None, min_length=1, max_length=200)
#     icon_name: Optional[str] = Field(None, max_length=50)

# class StatResponse(StatBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class ValueBase(BaseModel):
#     title: str = Field(..., min_length=1, max_length=100)
#     description: str = Field(..., min_length=1, max_length=1000)
#     icon_name: Optional[str] = Field(None, max_length=50)

# class ValueCreate(ValueBase):
#     pass

# class ValueUpdate(BaseModel):
#     title: Optional[str] = Field(None, min_length=1, max_length=100)
#     description: Optional[str] = Field(None, min_length=1, max_length=1000)
#     icon_name: Optional[str] = Field(None, max_length=50)

# class ValueResponse(ValueBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class ContactInfoBase(BaseModel):
#     address: str = Field(..., min_length=1, max_length=500)
#     email: str = Field(..., max_length=100)
#     phone: str = Field(..., max_length=50)

# class ContactInfoCreate(ContactInfoBase):
#     pass

# class ContactInfoUpdate(BaseModel):
#     address: Optional[str] = Field(None, min_length=1, max_length=500)
#     email: Optional[str] = Field(None, max_length=100)
#     phone: Optional[str] = Field(None, max_length=50)

# class ContactInfoResponse(ContactInfoBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class StudioBase(BaseModel):
#     title: str = Field(..., min_length=1, max_length=200)
#     description: str = Field(..., min_length=1, max_length=1000)
#     features: str = Field(..., min_length=1, max_length=1000)
#     collaboration_text: str = Field(..., min_length=1, max_length=1000)
#     image_path: Optional[str] = Field(None, max_length=500)

# class StudioCreate(StudioBase):
#     pass

# class StudioUpdate(BaseModel):
#     title: Optional[str] = Field(None, min_length=1, max_length=200)
#     description: Optional[str] = Field(None, min_length=1, max_length=1000)
#     features: Optional[str] = Field(None, min_length=1, max_length=1000)
#     collaboration_text: Optional[str] = Field(None, min_length=1, max_length=1000)
#     image_path: Optional[str] = Field(None, max_length=500)

# class StudioResponse(StudioBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class AboutContentBase(BaseModel):
#     history_title: str
#     history_subtitle: str
#     history_text1: str
#     history_text2: str
#     mission_title: str
#     mission_subtitle: str
#     mission_text: str
#     vision_title: str
#     vision_text: str

# class AboutContentCreate(AboutContentBase):
#     pass

# class AboutContentUpdate(BaseModel):
#     history_title: Optional[str] = None
#     history_subtitle: Optional[str] = None
#     history_text1: Optional[str] = None
#     history_text2: Optional[str] = None
#     mission_title: Optional[str] = None
#     mission_subtitle: Optional[str] = None
#     mission_text: Optional[str] = None
#     vision_title: Optional[str] = None
#     vision_text: Optional[str] = None

# class AboutContentResponse(AboutContentBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# # Updated ScienceArticle schemas
# class ScienceArticleBase(BaseModel):
#     title: str = Field(..., min_length=1, max_length=200)
#     content: str = Field(..., min_length=1)
#     category_id: int
#     section_id: Optional[int] = None
#     science_section: ScienceSection = ScienceSection.science
#     status: ArticleStatus = ArticleStatus.draft
#     image_url: Optional[str] = Field(None, max_length=500)
#     video_url: Optional[str] = Field(None, max_length=500)
#     author_name: Optional[str] = Field(None, max_length=100)

# class ScienceArticleCreate(ScienceArticleBase):
#     author_id: int

# class ScienceArticleUpdate(BaseModel):
#     title: Optional[str] = Field(None, min_length=1, max_length=200)
#     content: Optional[str] = None
#     category_id: Optional[int] = None
#     section_id: Optional[int] = None
#     science_section: Optional[ScienceSection] = None
#     status: Optional[ArticleStatus] = None
#     image_url: Optional[str] = Field(None, max_length=500)
#     video_url: Optional[str] = Field(None, max_length=500)
#     author_name: Optional[str] = Field(None, max_length=100)

# class ScienceArticleResponse(ScienceArticleBase):
#     id: int
#     views: Optional[int] = 0
#     author_id: int
#     author_username: str  # Added to include username
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     class Config:
#         from_attributes = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class ScienceArticleDetailResponse(ScienceArticleResponse):
#     category: CategoryResponse
#     section: Optional[SectionResponse] = None
#     author: UserResponse

#     category_id: int
#     author_id: int
#     author_username: str

#     class Config:
#         from_attributes = True








# class SongBase(BaseModel):
#     title: str
#     artist_name: Optional[str] = None
#     audio_url: Optional[str] = None
#     image_url: Optional[str] = None
#     category_id: Optional[int] = None
#     status: Optional[str] = "published"

# class SongCreate(SongBase):
#     pass

# class SongResponse(SongBase):
#     id: int
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         orm_mode = True
# # Culture Urbaine Article Schemas
# class CultureUrbaineArticleBase(BaseModel):
#     title: str
#     content: str
#     category_id: int
#     section_id: Optional[int]
#     status: ArticleStatus = ArticleStatus.draft
#     image_url: Optional[str]
#     video_url: Optional[str]
#     audio_url: Optional[str]  
#     author_name: Optional[str]
#     Lmusic: bool = False
#     Ldance: bool = False
#     Lafrotcham: bool = False
#     Lrap: bool = False

# class CultureUrbaineArticleCreate(CultureUrbaineArticleBase):
#     author_id: int

# # class CultureUrbaineArticleUpdate(CultureUrbaineArticleBase):
# #     title: Optional[str]
# #     content: Optional[str]
# #     category_id: Optional[int]
# #     status: Optional[ArticleStatus]
# #     Lmusic: Optional[bool]
# #     Ldance: Optional[bool]
# #     Lafrotcham: Optional[bool]
# #     Lrap: Optional[bool]


# class CultureUrbaineArticleUpdate(BaseModel):
#     title: Optional[str]
#     content: Optional[str]
#     category_id: Optional[int]
#     section_id: Optional[int]
#     status: Optional[ArticleStatus]
#     image_url: Optional[str]
#     video_url: Optional[str]
#     audio_url: Optional[str]  # Added audio_url field
#     author_name: Optional[str]
#     Lmusic: Optional[bool]
#     Ldance: Optional[bool]
#     Lafrotcham: Optional[bool]
#     Lrap: Optional[bool]
#     remove_image: Optional[bool] = False
#     remove_video: Optional[bool] = False
#     remove_audio: Optional[bool] = False  # Added remove_audio field

# class CultureUrbaineArticleResponse(CultureUrbaineArticleBase):
#     id: int
#     author_id: int
#     author_username: str
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         orm_mode = True

# class CultureUrbaineArticleDetailResponse(CultureUrbaineArticleResponse):
#     category: CategoryResponse
#     section: Optional[SectionResponse]
#     author: UserResponse

#     class Config:
#         orm_mode = True



# # ArtsTraditionsArticle Schemas
# class ArtsTraditionsArticleBase(BaseModel):
#     title: str
#     content: str
#     category_id: int
#     section_id: int
#     arts_traditions_type: ArtsTraditionsType
#     status: ArticleStatus = ArticleStatus.draft
#     author_name: Optional[str]
#     video_url: Optional[str]
#     date: Optional[date]
#     prep_time: Optional[str]
#     cook_time: Optional[str]
#     difficulty: Optional[str]
#     rating: Optional[float]
#     reviews: Optional[int]
#     recipe_author: Optional[str]
#     specialty: Optional[str]
#     recipes_count: Optional[int]

# class ArtsTraditionsArticleResponse(ArtsTraditionsArticleBase):
#     id: int
#     category: CategoryResponse
#     section: SectionResponse
#     image_url: Optional[str]
#     views: int
#     author_id: int
#     author_username: Optional[str]
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         from_attributes = True

# class ArtsTraditionsArticleDetailResponse(ArtsTraditionsArticleResponse):
#     author: UserResponse

#     class Config:
#         from_attributes = True

# class ArtsTraditionsArticleCreate(ArtsTraditionsArticleBase):
#     pass

# class ArtsTraditionsArticleUpdate(BaseModel):
#     title: Optional[str]
#     content: Optional[str]
#     category_id: Optional[int]
#     section_id: Optional[int]
#     arts_traditions_type: Optional[ArtsTraditionsType]
#     status: Optional[ArticleStatus]
#     author_name: Optional[str]
#     video_url: Optional[str]
#     remove_image: Optional[bool] = False
#     date: Optional[date]
#     prep_time: Optional[str]
#     cook_time: Optional[str]
#     difficulty: Optional[str]
#     rating: Optional[float]
#     reviews: Optional[int]
#     recipe_author: Optional[str]
#     specialty: Optional[str]
#     recipes_count: Optional[int]


# class ActualiteHomeBase(BaseModel):
#     title: str = Field(..., min_length=1, max_length=255)
#     description: str
#     status: ArticleStatus = ArticleStatus.draft

# class ActualiteHomeCreate(ActualiteHomeBase):
#     pass

# class ActualiteHomeUpdate(BaseModel):
#     title: Optional[str] = Field(None, min_length=1, max_length=255)
#     description: Optional[str]
#     status: Optional[ArticleStatus]

# class ActualiteHomeResponse(ActualiteHomeBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime]

#     class Config:
#         from_attributes = True




from pydantic import BaseModel, Field, validator, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
import enum

# Existing enums (unchanged)
class ArticleStatus(str, Enum):
    draft = "draft"
    published = "published"
    pending = "pending"

class UserRole(str, Enum):
    admin = "admin"
    editor = "editor"

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

class EventStatus(str, Enum):
    draft = "draft"
    published = "published"
    processing = "processing"

class DirectTVStatus(str, Enum):
    draft = "draft"
    published = "published"
    processing = "processing"

class AdvertisementStatus(str, Enum):
    draft = "draft"
    published = "published"
    expired = "expired"

class AdvertisementPage(str, Enum):
    homepage = "homepage"
    actualite = "actualite"
    culture_urbaine = "culture_urbaine"
    arts_traditions = "arts_traditions"
    sciences = "sciences"
    evenements = "evenements"
    entrepreneuriat = "entrepreneuriat"
    direct_tv = "direct_tv"
    all = "all"

class ScienceSection(str, Enum):
    science = "science"
    technologie = "technologie"
    innovation = "innovation"
    recherche = "recherche"
    developpement_durable = "developpement_durable"
    biotechnologie = "biotechnologie"
    intelligence_artificielle = "intelligence_artificielle"
    sante_numerique = "sante_numerique"

# Existing schemas (unchanged except where noted)
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=100)
    role: UserRole = UserRole.editor

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class SectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class ArticleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category_id: int
    section_id: Optional[int] = None
    status: ArticleStatus = ArticleStatus.draft
    mostread: bool = False
    is_story: bool = False
    is_cinema: bool = False
    is_comedy: bool = False
    is_sport: bool = False
    is_rap: bool = False
    is_afrotcham: bool = False
    alauneactual: bool = False
    eventactual: bool = False
    videoactual: bool = False
    is_alaune: bool = False
    is_buzz: bool = False
    science: bool = False
    is_artist: bool = False
    contenurecent: bool = False
    duration: Optional[str] = Field(None, max_length=50)
    author_name: Optional[str] = Field(None, max_length=100)
    story_expires_at: Optional[datetime] = None

    @validator("story_expires_at")
    def validate_story_expires_at(cls, v, values):
        if values.get("is_story", False) and v is None:
            raise ValueError("story_expires_at must be set when is_story is True")
        return v

class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    category_id: int
    location: str = Field(..., max_length=200)
    venue: str = Field(..., max_length=200)
    date: datetime
    end_date: Optional[datetime] = None
    time: str = Field(..., max_length=20)
    status: EventStatus = EventStatus.draft
    is_featured: bool = False
    attendees: int = 0
    contact: str = Field(..., max_length=100)
    tickets_available: bool = False
    ticket_price: Optional[str] = Field(None, max_length=50)
    ticket_url: Optional[str] = Field(None, max_length=500)

class DirectTVBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    category_id: int
    time: str = Field(..., max_length=20)
    date: datetime
    duration: Optional[str] = Field(None, max_length=50)
    status: DirectTVStatus = DirectTVStatus.draft
    author_name: Optional[str] = Field(None, max_length=100)
    is_live: bool = False
    is_featured: bool = False

    @validator('time')
    def normalize_time_format(cls, v):
        if 'h' in v:
            return v.replace('h', ':')
        import re
        if re.match(r'^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$', v):
            return re.sub(r'\s*-\s*', '-', v)
        if not re.match(r'^\d{1,2}:\d{2}$', v):
            raise ValueError('Time must be in HH:MM format, HhMM format, or HH:MM-HH:MM range format')
        return v

class AdvertisementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    image_url: str = Field(..., max_length=500)
    redirect_url: Optional[str] = Field(None, max_length=500)
    status: AdvertisementStatus = AdvertisementStatus.draft
    category_id: Optional[int] = None
    page: AdvertisementPage = AdvertisementPage.all

    @validator('image_url')
    def validate_image_url(cls, v):
        if not v:
            raise ValueError('Image URL is required')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class CategoryCreate(CategoryBase):
    pass

class SectionCreate(SectionBase):
    pass

class ArticleCreate(ArticleBase):
    author_id: int

class EventCreate(EventBase):
    organizer_id: int

class DirectTVCreate(DirectTVBase):
    author_id: int
    date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}')

class AdvertisementCreate(AdvertisementBase):
    created_by_id: int

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    role: Optional[UserRole] = None
    password: Optional[str] = Field(None, min_length=8)
    disabled: Optional[bool] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class SectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    category_id: Optional[int] = None
    section_id: Optional[int] = None
    mostread: Optional[bool] = None
    is_story: Optional[bool] = None
    is_cinema: Optional[bool] = None
    is_comedy: Optional[bool] = None
    is_sport: Optional[bool] = None
    is_rap: Optional[bool] = None
    is_afrotcham: Optional[bool] = None
    is_buzz: Optional[bool] = None
    is_alaune: Optional[bool] = None
    alauneactual: Optional[bool] = None
    videoactual: Optional[bool] = None
    eventactual: Optional[bool] = None
    science: Optional[bool] = None
    is_artist: Optional[bool] = None
    contenurecent: Optional[bool] = None
    status: Optional[ArticleStatus] = None
    duration: Optional[str] = Field(None, max_length=50)
    author_name: Optional[str] = Field(None, max_length=100)
    story_expires_at: Optional[datetime] = None

    @validator("story_expires_at")
    def validate_story_expires_at(cls, v, values):
        if values.get("is_story", False) and v is None:
            raise ValueError("story_expires_at must be set when is_story is True")
        return v

class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    category_id: Optional[int] = None
    location: Optional[str] = Field(None, max_length=200)
    venue: Optional[str] = Field(None, max_length=200)
    date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    time: Optional[str] = Field(None, max_length=20)
    status: Optional[EventStatus] = None
    is_featured: Optional[bool] = None
    attendees: Optional[int] = None
    contact: Optional[str] = Field(None, max_length=100)
    tickets_available: Optional[bool] = None
    ticket_price: Optional[str] = Field(None, max_length=50)
    ticket_url: Optional[str] = Field(None, max_length=500)

class DirectTVUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    category_id: Optional[int] = None
    time: Optional[str] = Field(None, max_length=20)
    date: Optional[str] = Field(None, pattern=r'^\d{4}-\d{2}-\d{2}')
    duration: Optional[str] = Field(None, max_length=50)
    status: Optional[DirectTVStatus] = None
    author_name: Optional[str] = Field(None, max_length=100)
    is_live: Optional[bool] = None
    is_featured: Optional[bool] = None

    @validator('time')
    def normalize_time_format(cls, v):
        if v is None:
            return v
        if 'h' in v:
            return v.replace('h', ':')
        import re
        if re.match(r'^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$', v):
            return re.sub(r'\s*-\s*', '-', v)
        if not re.match(r'^\d{1,2}:\d{2}$', v):
            raise ValueError('Time must be in HH:MM format, HhMM format, or HH:MM-HH:MM range format')
        return v

class AdvertisementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    image_url: Optional[str] = Field(None, max_length=500)
    redirect_url: Optional[str] = Field(None, max_length=500)
    status: Optional[AdvertisementStatus] = None
    category_id: Optional[int] = None
    page: Optional[AdvertisementPage] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    status: str
    disabled: bool = False
    last_login: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SectionResponse(SectionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ArticleResponse(ArticleBase):
    id: int
    views: Optional[int] = 0
    mostread: bool = False
    is_story: bool = False
    is_comedy: bool = False
    is_sport: bool = False
    is_rap: bool = False
    is_afrotcham: bool = False
    is_buzz: bool = False
    is_alaune: bool = False
    alauneactual: bool = False
    videoactual: bool = False
    eventactual: bool = False
    science: bool = False
    is_artist: bool = False
    contenurecent: bool = False
    story_expires_at: Optional[datetime] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    author_id: int
    author_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ArticleDetailResponse(ArticleResponse):
    category: CategoryResponse
    section: Optional[SectionResponse] = None
    author: UserResponse
    
    class Config:
        from_attributes = True

class EventResponse(EventBase):
    id: int
    organizer_id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class EventDetailResponse(EventResponse):
    category: CategoryResponse
    organizer: UserResponse
    
    class Config:
        from_attributes = True

class DirectTVResponse(DirectTVBase):
    id: int
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    author_id: int
    is_featured: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class DirectTVDetailResponse(DirectTVResponse):
    category: CategoryResponse
    author: UserResponse
    
    class Config:
        from_attributes = True

class AdvertisementResponse(AdvertisementBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    page: AdvertisementPage
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AdvertisementDetailResponse(AdvertisementResponse):
    category: Optional[CategoryResponse] = None
    created_by: UserResponse
    
    class Config:
        from_attributes = True

class UpcomingProgramBase(BaseModel):
    title: str

class UpcomingProgramCreate(UpcomingProgramBase):
    pass

class UpcomingProgramUpdate(BaseModel):
    title: Optional[str] = None

class UpcomingProgramResponse(UpcomingProgramBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

class ArtistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., max_length=50)
    role: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = Field(None, max_length=500)
    followers: int = 0
    description: Optional[str] = Field(None, max_length=1000)
    bio: Optional[str] = Field(None, max_length=2000)

class ArtistResponse(ArtistBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TeamMemberBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=100)
    image_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = Field(None, max_length=1000)

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[str] = Field(None, min_length=1, max_length=100)
    image_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = Field(None, max_length=1000)

class TeamMemberResponse(TeamMemberBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class MilestoneBase(BaseModel):
    year: str = Field(..., pattern=r'^\d{4}$')
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    year: Optional[str] = Field(None, pattern=r'^\d{4}$')
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)

class MilestoneResponse(MilestoneBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class StatBase(BaseModel):
    number: str = Field(..., min_length=1, max_length=50)
    label: str = Field(..., min_length=1, max_length=200)
    icon_name: Optional[str] = Field(None, max_length=50)

class StatCreate(StatBase):
    pass

class StatUpdate(BaseModel):
    number: Optional[str] = Field(None, min_length=1, max_length=50)
    label: Optional[str] = Field(None, min_length=1, max_length=200)
    icon_name: Optional[str] = Field(None, max_length=50)

class StatResponse(StatBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ValueBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    icon_name: Optional[str] = Field(None, max_length=50)

class ValueCreate(ValueBase):
    pass

class ValueUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    icon_name: Optional[str] = Field(None, max_length=50)

class ValueResponse(ValueBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ContactInfoBase(BaseModel):
    address: str = Field(..., min_length=1, max_length=500)
    email: str = Field(..., max_length=100)
    phone: str = Field(..., max_length=50)

class ContactInfoCreate(ContactInfoBase):
    pass

class ContactInfoUpdate(BaseModel):
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)

class ContactInfoResponse(ContactInfoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class StudioBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    features: str = Field(..., min_length=1, max_length=1000)
    collaboration_text: str = Field(..., min_length=1, max_length=1000)
    image_path: Optional[str] = Field(None, max_length=500)

class StudioCreate(StudioBase):
    pass

class StudioUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    features: Optional[str] = Field(None, min_length=1, max_length=1000)
    collaboration_text: Optional[str] = Field(None, min_length=1, max_length=1000)
    image_path: Optional[str] = Field(None, max_length=500)

class StudioResponse(StudioBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AboutContentBase(BaseModel):
    history_title: str
    history_subtitle: str
    history_text1: str
    history_text2: str
    mission_title: str
    mission_subtitle: str
    mission_text: str
    vision_title: str
    vision_text: str

class AboutContentCreate(AboutContentBase):
    pass

class AboutContentUpdate(BaseModel):
    history_title: Optional[str] = None
    history_subtitle: Optional[str] = None
    history_text1: Optional[str] = None
    history_text2: Optional[str] = None
    mission_title: Optional[str] = None
    mission_subtitle: Optional[str] = None
    mission_text: Optional[str] = None
    vision_title: Optional[str] = None
    vision_text: Optional[str] = None

class AboutContentResponse(AboutContentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ScienceArticleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category_id: int
    section_id: Optional[int] = None
    science_section: ScienceSection = ScienceSection.science
    status: ArticleStatus = ArticleStatus.draft
    image_url: Optional[str] = Field(None, max_length=500)
    video_url: Optional[str] = Field(None, max_length=500)
    author_name: Optional[str] = Field(None, max_length=100)
    is_story: bool = False  # Added is_story field
    story_expires_at: Optional[datetime] = None  # Added story_expires_at field

    @validator("story_expires_at")
    def validate_story_expires_at(cls, v, values):
        if values.get("is_story", False) and v is None:
            raise ValueError("story_expires_at must be set when is_story is True")
        return v

class ScienceArticleCreate(ScienceArticleBase):
    author_id: int

class ScienceArticleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    category_id: Optional[int] = None
    section_id: Optional[int] = None
    science_section: Optional[ScienceSection] = None
    status: Optional[ArticleStatus] = None
    image_url: Optional[str] = Field(None, max_length=500)
    video_url: Optional[str] = Field(None, max_length=500)
    author_name: Optional[str] = Field(None, max_length=100)
    is_story: Optional[bool] = None
    story_expires_at: Optional[datetime] = None

    @validator("story_expires_at")
    def validate_story_expires_at(cls, v, values):
        if values.get("is_story", False) and v is None:
            raise ValueError("story_expires_at must be set when is_story is True")
        return v

class ScienceArticleResponse(ScienceArticleBase):
    id: int
    views: Optional[int] = 0
    author_id: int
    author_username: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ScienceArticleDetailResponse(ScienceArticleResponse):
    category: CategoryResponse
    section: Optional[SectionResponse] = None
    author: UserResponse
    category_id: int
    author_id: int
    author_username: str

    class Config:
        from_attributes = True

class SongBase(BaseModel):
    title: str
    artist_name: Optional[str] = None
    audio_url: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = "published"

class SongCreate(SongBase):
    pass

class SongResponse(SongBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CultureUrbaineArticleBase(BaseModel):
    title: str
    content: str
    category_id: int
    section_id: Optional[int]
    status: ArticleStatus = ArticleStatus.draft
    image_url: Optional[str]
    video_url: Optional[str]
    audio_url: Optional[str]
    author_name: Optional[str]
    Lmusic: bool = False
    Ldance: bool = False
    Lafrotcham: bool = False
    Lrap: bool = False
    is_story: bool = False  # Added is_story field
    story_expires_at: Optional[datetime] = None  # Added story_expires_at field

    @validator("story_expires_at")
    def validate_story_expires_at(cls, v, values):
        if values.get("is_story", False) and v is None:
            raise ValueError("story_expires_at must be set when is_story is True")
        return v

class CultureUrbaineArticleCreate(CultureUrbaineArticleBase):
    author_id: int

class CultureUrbaineArticleUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    category_id: Optional[int]
    section_id: Optional[int]
    status: Optional[ArticleStatus]
    image_url: Optional[str]
    video_url: Optional[str]
    audio_url: Optional[str]
    author_name: Optional[str]
    Lmusic: Optional[bool]
    Ldance: Optional[bool]
    Lafrotcham: Optional[bool]
    Lrap: Optional[bool]
    is_story: Optional[bool] = None
    story_expires_at: Optional[datetime] = None
    remove_image: Optional[bool] = False
    remove_video: Optional[bool] = False
    remove_audio: Optional[bool] = False

    @validator("story_expires_at")
    def validate_story_expires_at(cls, v, values):
        if values.get("is_story", False) and v is None:
            raise ValueError("story_expires_at must be set when is_story is True")
        return v

class CultureUrbaineArticleResponse(CultureUrbaineArticleBase):
    id: int
    author_id: int
    author_username: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CultureUrbaineArticleDetailResponse(CultureUrbaineArticleResponse):
    category: CategoryResponse
    section: Optional[SectionResponse]
    author: UserResponse

    class Config:
        from_attributes = True

class ArtsTraditionsArticleBase(BaseModel):
    title: str
    content: str
    category_id: int
    section_id: int
    arts_traditions_type: ArtsTraditionsType
    status: ArticleStatus = ArticleStatus.draft
    author_name: Optional[str]
    video_url: Optional[str]
    date: Optional[date]
    prep_time: Optional[str]
    cook_time: Optional[str]
    difficulty: Optional[str]
    rating: Optional[float]
    reviews: Optional[int]
    recipe_author: Optional[str]
    specialty: Optional[str]
    recipes_count: Optional[int]
    is_story: bool = False  # Added is_story field
    story_expires_at: Optional[datetime] = None  # Added story_expires_at field

    @validator("story_expires_at")
    def validate_story_expires_at(cls, v, values):
        if values.get("is_story", False) and v is None:
            raise ValueError("story_expires_at must be set when is_story is True")
        return v

class ArtsTraditionsArticleResponse(ArtsTraditionsArticleBase):
    id: int
    category: CategoryResponse
    section: SectionResponse
    image_url: Optional[str]
    views: int
    author_id: int
    author_username: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ArtsTraditionsArticleDetailResponse(ArtsTraditionsArticleResponse):
    author: UserResponse

    class Config:
        from_attributes = True

class ArtsTraditionsArticleCreate(ArtsTraditionsArticleBase):
    pass

class ArtsTraditionsArticleUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    category_id: Optional[int]
    section_id: Optional[int]
    arts_traditions_type: Optional[ArtsTraditionsType]
    status: Optional[ArticleStatus]
    author_name: Optional[str]
    video_url: Optional[str]
    remove_image: Optional[bool] = False
    date: Optional[date]
    prep_time: Optional[str]
    cook_time: Optional[str]
    difficulty: Optional[str]
    rating: Optional[float]
    reviews: Optional[int]
    recipe_author: Optional[str]
    specialty: Optional[str]
    recipes_count: Optional[int]
    is_story: Optional[bool] = None
    story_expires_at: Optional[datetime] = None

    @validator("story_expires_at")
    def validate_story_expires_at(cls, v, values):
        if values.get("is_story", False) and v is None:
            raise ValueError("story_expires_at must be set when is_story is True")
        return v

class ActualiteHomeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str
    status: ArticleStatus = ArticleStatus.draft

class ActualiteHomeCreate(ActualiteHomeBase):
    pass

class ActualiteHomeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str]
    status: Optional[ArticleStatus]

class ActualiteHomeResponse(ActualiteHomeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True