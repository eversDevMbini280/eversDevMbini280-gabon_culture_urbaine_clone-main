'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, Calendar, User, Tag, Share2, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';

const STATIC_FALLBACK_IMAGE = "/static/fallback-placeholder.png";

const ArticleunePage = () => { 
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const sliderRef = useRef(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://gabon-culture-urbaine-1.onrender.com";
  const router = useRouter();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleImageError = (e, itemId, placeholderText, size = { width: 800, height: 300 }, color = '4f46e5') => {
    if (!failedImages.has(itemId)) {
      console.log(`Image failed for item ${itemId}: ${e.target.src}`);
      setFailedImages(prev => new Set(prev).add(itemId));
      const width = size.width;
      const height = size.height;
      const placeholderUrl = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText)}&color=${color}`;
      if (e.target.src !== placeholderUrl) {
        console.log(`Setting placeholder for item ${itemId}: ${placeholderUrl}`);
        e.target.src = placeholderUrl;
        e.target.className = `${e.target.className} object-contain bg-gray-200`;
        e.target.loading = "lazy";
      }
    }
  };

  // Handler functions for the slider (add these back)
  const handlePrev = () => {
    if (sliderRef.current && currentSlide > 0) {
      const slideWidth = isMobile ? window.innerWidth * 0.75 : 250;
      const newScrollLeft = sliderRef.current.scrollLeft - slideWidth - 16;
      sliderRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      setCurrentSlide(prev => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      const slideWidth = isMobile ? window.innerWidth * 0.75 : 250;
      const newScrollLeft = sliderRef.current.scrollLeft + slideWidth + 16;
      sliderRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

   const handleShare = useCallback(() => {
      if (navigator.share) {
        navigator
          .share({
            title: article?.title,
            text: article?.content?.substring(0, 100) + '...',
            url: window.location.href,
          })
          .catch((err) => console.error('Share failed:', err));
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papier!');
      }
    }, [article]);

    const handleBack = useCallback(() => {
        // Navigate to the previous page in history
        if (window.history.length > 1) {
          router.back();
        } else {
          // Fallback to AfroTcham section if no history
          router.push('/#alaune');
        }
      }, [router]);

  const handleScroll = () => {
    if (sliderRef.current && !isDragging) {
      const slideWidth = isMobile ? window.innerWidth * 0.75 : 250;
      const newSlide = Math.round(sliderRef.current.scrollLeft / (slideWidth + 16));
      setCurrentSlide(newSlide);
    }
  };

  const maxPossibleSlide = Math.max(0, relatedArticles.length - (isMobile ? 1 : 3));

  useEffect(() => {
    const getArticleData = async () => {
      setLoading(true);
      try {
        // Fetch main article
        const articleResponse = await fetch(`${apiUrl}/api/articles/${id}?status=published`);
        if (!articleResponse.ok) {
          throw new Error('Article not found');
        }
        const articleData = await articleResponse.json();

        // Process article with video support
        const processedArticle = {
          id: articleData.id,
          title: articleData.title,
          image: articleData.image_url
            ? articleData.image_url.startsWith('http') || articleData.image_url.startsWith('//')
              ? articleData.image_url
              : `${apiUrl}${articleData.image_url.startsWith('/') ? articleData.image_url : `/${articleData.image_url}`}`
            : `${apiUrl}/api/placeholder/1200/600?text=${encodeURIComponent(articleData.title || 'Article')}&color=1e40af`,
          video_url: articleData.video_url
            ? articleData.video_url.startsWith('http') || articleData.video_url.startsWith('//')
              ? articleData.video_url
              : `${apiUrl}${articleData.video_url.startsWith('/') ? articleData.video_url : `/${articleData.video_url}`}`
            : null,
          category: articleData.category?.name || 'Général',
          author_name: articleData.author_name,
          author: articleData.author?.username || 'Unknown Author',
          date: new Date(articleData.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          content: articleData.content,
          duration: articleData.duration || null
        };

        setArticle(processedArticle);

        // Fetch related articles with video support
        const relatedResponse = await fetch(
          `${apiUrl}/api/articles/alaune?status=published&limit=6`
        );
        if (!relatedResponse.ok) {
          throw new Error('Failed to fetch related articles');
        }
        const relatedData = await relatedResponse.json();

        const processedRelated = relatedData.map(item => ({
          id: item.id,
          title: item.title,
          image: item.image_url
            ? item.image_url.startsWith('http') || item.image_url.startsWith('//')
              ? item.image_url
              : `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
            : `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(item.title || 'Article')}&color=1e40af`,
          video_url: item.video_url
            ? item.video_url.startsWith('http') || item.video_url.startsWith('//')
              ? item.video_url
              : `${apiUrl}${item.video_url.startsWith('/') ? item.video_url : `/${item.video_url}`}`
            : null,
          category: item.category?.name || 'Général',
          date: new Date(item.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          duration: item.duration || null
        }));

        setRelatedArticles(processedRelated);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getArticleData();
    }
  }, [id, apiUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Article non trouvé</h1>
          <p className="text-gray-600 mb-6">L'article que vous recherchez n'existe pas ou a été déplacé.</p>
          <button               
           onClick={handleBack}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900">
      <div className="relative h-[50vh] w-full">
        {article.video_url ? (
          <div className="relative w-full h-full">
            <video
              className="w-full h-full object-cover"
              poster={article.image}
              muted
              loop
              playsInline
              autoPlay
            >
              <source src={article.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-3">
                <Play className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e, article.id, article.title, { width: 1200, height: 600 }, '1e40af')}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        <div className="absolute top-4 left-4 z-10">
            <button
             onClick={handleBack}
             className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
        </div>

        <div className="absolute top-4 right-4">
          <span className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
            {article.category}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-20 relative z-10 px-4">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">{article.title}</h1>

          <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-y-2">
            <div className="flex items-center mr-6">
              <User className="w-4 h-4 mr-2" />
              <span>{article.author_name || article.author || 'Auteur inconnu'}</span>
            </div>
            <div className="flex items-center mr-6">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              <span>{article.category}</span>
            </div>

            <div className="ml-auto">
              <button 
              onClick={handleShare}
              className="flex items-center text-blue-600 hover:text-blue-800">
                <Share2 className="w-4 h-4 mr-1" />
                <span>Partager</span>
              </button>
            </div>
          </div>

          {/* Scrollable Article Content */}
          <div className="mb-8">
            <div 
              className="max-h-96 md:max-h-[500px] overflow-y-auto overflow-x-hidden pr-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-400"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#93c5fd #f3f4f6'
              }}
            >
              <div
                className="prose max-w-none prose-img:rounded-xl text-black prose-p:text-base prose-p:leading-relaxed prose-h1:text-blue-900 prose-h2:text-blue-800 prose-h3:text-blue-700"
                style={{
                  '--tw-prose-links': '#1e40af',
                  '--tw-prose-body': '#000000',
                  '--tw-prose-headings': '#000000',
                  color: '#000000',
                  WebkitTextFillColor: 'initial'
                }}
              >
                <div 
                  className="article-content text-black leading-relaxed" 
                  style={{ color: '#000000', lineHeight: '1.7' }}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-4">
              <div className="text-sm text-gray-400 flex items-center">
                <span>Faites défiler pour lire la suite</span>
                <svg className="w-4 h-4 ml-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                <div className="w-2 h-8 bg-blue-400 mr-3 rounded-full"></div>
                Articles similaires
              </h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handlePrev}
                  className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={currentSlide >= maxPossibleSlide}
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="relative">
                <div
                  ref={sliderRef}
                  className="flex overflow-x-auto pb-6 pl-4 pr-4 md:pr-0 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                  style={{
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  onScroll={handleScroll}
                >
                  {relatedArticles.map((related) => (
                    <Link href={`/article/${related.id}`} key={related.id}>
                      <div 
                        className="group cursor-pointer snap-start mr-4" 
                        style={{ 
                          width: isMobile ? 'calc(75vw - 2rem)' : '250px',
                          minWidth: isMobile ? 'calc(75vw - 2rem)' : '250px',
                        }}
                      >
                        <div className="rounded-xl overflow-hidden aspect-[2/3] relative">
                          {related.video_url ? (
                            <>
                              <img
                                src={related.image}
                                alt={related.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => handleImageError(e, related.id, related.title, { 
                                  width: 250,
                                  height: 375 
                                }, '1e40af')}
                                loading="lazy"
                              />
                              <video
                                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                muted
                                playsInline
                                loop
                                preload="metadata"
                                poster={related.image}
                              >
                                <source src={related.video_url} type="video/mp4" />
                              </video>
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Play className="w-8 h-8 text-white opacity-80" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={related.image}
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => handleImageError(e, related.id, related.title, { 
                                width: 250,
                                height: 375 
                              }, '1e40af')}
                              loading="lazy"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                              {related.category}
                            </span>
                          </div>
                        </div>
                        <h4 className="mt-3 font-medium text-blue-900 group-hover:text-blue-700 transition line-clamp-2">
                          {related.title}
                        </h4>
                        <p className="text-sm text-gray-500">{related.date}</p>
                      </div>
                    </Link>
                  ))}
                  {isMobile && (
                    <div className="min-w-[25vw] flex items-center justify-start pr-4">
                      <div className="w-8 h-full flex items-center justify-center">
                        <ChevronRight className="w-6 h-6 text-blue-600 animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
                {isMobile && (
                  <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-20"></div>

      {/* Ad Banner Section */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="relative w-full h-32 md:h-40 bg-gray-100 rounded-xl overflow-hidden">
          <img 
            src={`${apiUrl}/api/images/pub-banner.jpg`}
            alt="Publicité"
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e, 'pub-banner-footer', 'Espace publicitaire disponible', { width: 1200, height: 200 }, '4f46e5')}
            loading="lazy"
          />
          {/* <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="px-4 py-1 bg-black/50 text-white text-sm rounded">
              Publicité
            </div>
          </div> */}
        </div>
      </div>

       <div className="w-full px-4 mt-8">
              <div className="max-w-7xl mx-auto">
                <AdBanner position="bottom" page="homepage" />
              </div>
        </div>
      
      <Footer />
    </div>
  );
};

export default ArticleunePage;