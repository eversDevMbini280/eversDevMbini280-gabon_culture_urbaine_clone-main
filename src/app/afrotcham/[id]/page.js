'use client';
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ArrowLeft, Calendar, User, Tag, Share2, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import Head from 'next/head';

const STATIC_FALLBACK_IMAGE = "/static/fallback-placeholder.png";

// Memoized Related Article Component
const RelatedArticle = memo(({ article, apiUrl, handleImageError, onVideoHover }) => {
  return (
    <div
      className="flex-none w-[250px]"
      onMouseEnter={() => !article.isMobile && article.video_url && onVideoHover(article.id, 'start')}
      onMouseLeave={() => !article.isMobile && article.video_url && onVideoHover(article.id, 'stop')}
      onTouchStart={() => article.isMobile && article.video_url && onVideoHover(article.id, 'start')}
      onTouchEnd={() => article.isMobile && article.video_url && onVideoHover(article.id, 'stop')}
    >
      <Link href={`/afrotcham/${article.id}`} className="block group">
        <div className="relative rounded-xl overflow-hidden aspect-[2/3]">
          {article.video_url ? (
            <>
              <img
                src={article.image_url || `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(article.title || 'Article')}&color=ce8426`}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => handleImageError(e, article.title, { width: 250, height: 375 }, 'ce8426')}
                loading="lazy"
              />
              <video
                ref={(el) => (article.videoRef.current[article.id] = el)}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                muted
                playsInline
                loop
                preload="metadata"
                poster={article.image_url}
              >
                <source src={article.video_url} type="video/mp4" />
                <source src={article.video_url.replace('.mp4', '.webm')} type="video/webm" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Play className="w-8 h-8 text-white opacity-80" />
              </div>
            </>
          ) : (
            <img
              src={article.image_url || `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(article.title || 'Article')}&color=ce8426`}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => handleImageError(e, article.title, { width: 250, height: 375 }, 'ce8426')}
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
            {article.duration && (
              <div className="flex items-center text-amber-200">
                <Play className="w-4 h-4 mr-2" />
                <span>{article.duration}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
});

const AfroTchamArticlePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [relatedVideoHover, setRelatedVideoHover] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [previewVideoError, setPreviewVideoError] = useState(false);
  const sliderRef = useRef(null);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const relatedVideoRefs = useRef({});

  // AfroTcham brand color
  const afroTchamColor = "#ce8426";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleImageError = useCallback((e, placeholderText, size = { width: 800, height: 400 }, color = 'ce8426') => {
    const src = e.target.src;
    if (loadedImages.current.has(src)) {
      console.log(`Image already processed: ${src}`);
      return;
    }
    loadedImages.current.add(src);
    console.warn(`Image failed to load: ${src}`);

    if (!e.target.dataset.placeholderAttempted) {
      const { width, height } = size;
      const placeholderUrl = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText || 'Article')}&color=${color}`;
      e.target.src = placeholderUrl;
      e.target.dataset.placeholderAttempted = 'true';
      e.target.className = `${e.target.className} object-contain`;
      e.target.loading = 'lazy';
    } else {
      e.target.src = STATIC_FALLBACK_IMAGE;
      e.target.dataset.placeholderAttempted = 'static';
      e.target.className = `${e.target.className} object-contain bg-gray-200`;
      e.target.loading = 'lazy';
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching article with ID: ${id}`);

      // Fetch main article
      const articleRes = await fetch(`${apiUrl}/api/articles/${id}?status=published`);
      if (!articleRes.ok) {
        throw new Error("Failed to fetch article");
      }
      const articleData = await articleRes.json();

      if (!articleData.is_afrotcham) {
        throw new Error("Article is not an AfroTcham article");
      }

      // Normalize media URLs
      let imageUrl = articleData.image_url;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
        imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
      } else if (!imageUrl) {
        imageUrl = `${apiUrl}/api/placeholder/1200/720?text=${encodeURIComponent(articleData.title || 'Article')}&color=ce8426`;
      }

      let videoUrl = articleData.video_url;
      if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('//')) {
        videoUrl = `${apiUrl}${videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}`;
      }

      setArticle({
        id: articleData.id,
        title: articleData.title,
        image_url: imageUrl,
        video_url: videoUrl || null,
        category: articleData.category?.name || 'Événement',
        author_name: articleData.author_name,
        author: articleData.author?.username || 'Auteur inconnu',
        date: new Date(articleData.created_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        content: articleData.content,
        duration: articleData.duration || null,
      });

      // Fetch related articles
      const relatedRes = await fetch(`${apiUrl}/api/articles/afrotcham?status=published&limit=6&exclude=${id}`);
      if (!relatedRes.ok) {
        console.warn('Failed to fetch related articles:', relatedRes.status);
        setRelatedArticles([]);
      } else {
        const relatedData = await relatedRes.json();
        console.log('Related articles fetched:', relatedData);
        const processedRelated = relatedData.map((rel) => {
          let rImageUrl = rel.image_url;
          if (rImageUrl && !rImageUrl.startsWith('http') && !rImageUrl.startsWith('//')) {
            rImageUrl = `${apiUrl}${rImageUrl.startsWith('/') ? rImageUrl : `/${rImageUrl}`}`;
          } else if (!rImageUrl) {
            rImageUrl = `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(rel.title || 'Article')}&color=ce8426`;
          }

          let rVideoUrl = rel.video_url;
          if (rVideoUrl && !rVideoUrl.startsWith('http') && !rVideoUrl.startsWith('//')) {
            rVideoUrl = `${apiUrl}${rVideoUrl.startsWith('/') ? rVideoUrl : `/${rVideoUrl}`}`;
          }

          return {
            id: rel.id,
            title: rel.title,
            image_url: rImageUrl,
            video_url: rVideoUrl || null,
            category: rel.category?.name || 'Événement',
            date: new Date(rel.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }),
            duration: rel.duration || null,
            uniqueKey: `related-${rel.id}-${Date.now()}`,
            isMobile,
            videoRef: relatedVideoRefs,
          };
        });
        setRelatedArticles(processedRelated);
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, apiUrl, isMobile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset video state when article changes
  useEffect(() => {
    setVideoPlaying(false);
    setShowVideoModal(false);
    setIsMuted(true);
    setVideoError(null);
    setIsVideoLoading(false);
    setPreviewVideoError(false);
  }, [article]);

  // Main video event listeners
  useEffect(() => {
    if (videoRef.current && article?.video_url) {
      const video = videoRef.current;
      const handleError = () => {
        console.error('Main video error:', video.error);
        setVideoError(video.error?.message || 'Error loading video');
        setIsVideoLoading(false);
      };
      const handleLoadedMetadata = () => {
        console.log('Main video metadata loaded');
        setIsVideoLoading(false);
      };
      const handleCanPlay = () => {
        console.log('Main video can play');
        setIsVideoLoading(false);
      };
      const handleLoadStart = () => {
        console.log('Main video load start');
        setIsVideoLoading(true);
      };
      video.addEventListener('error', handleError);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('loadstart', handleLoadStart);
      const timeout = setTimeout(() => {
        if (isVideoLoading) {
          console.warn('Video loading timeout');
          setIsVideoLoading(false);
        }
      }, 10000);
      return () => {
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('loadstart', handleLoadStart);
        clearTimeout(timeout);
      };
    }
  }, [videoRef.current, article, isVideoLoading]);

  // Preview video event listeners
  useEffect(() => {
    if (previewVideoRef.current && article?.video_url && !previewVideoError) {
      const video = previewVideoRef.current;
      const handleError = () => {
        console.error('Preview video error:', video.error);
        setPreviewVideoError(true);
      };
      const handleLoadedMetadata = () => {
        console.log('Preview video metadata loaded');
        video.play().catch((err) => {
          console.warn('Preview video autoplay failed:', err);
          setPreviewVideoError(true);
        });
      };
      video.addEventListener('error', handleError);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.pause();
      };
    }
  }, [previewVideoRef.current, article, previewVideoError]);

  // Pause preview video when modal opens
  useEffect(() => {
    if (previewVideoRef.current && showVideoModal) {
      previewVideoRef.current.pause();
    } else if (previewVideoRef.current && !showVideoModal && !previewVideoError) {
      previewVideoRef.current.play().catch((err) => {
        console.warn('Preview video resume failed:', err);
        setPreviewVideoError(true);
      });
    }
  }, [showVideoModal, previewVideoError]);

  const maxPossibleSlide = relatedArticles.length - (isMobile ? 1 : 3);

  const handlePrev = useCallback(() => {
    const newSlide = Math.max(0, currentSlide - 1);
    setCurrentSlide(newSlide);
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3);
      sliderRef.current.scrollTo({ left: newSlide * itemWidth, behavior: 'smooth' });
    }
  }, [currentSlide, isMobile]);

  const handleNext = useCallback(() => {
    const newSlide = Math.min(maxPossibleSlide, currentSlide + 1);
    setCurrentSlide(newSlide);
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3);
      sliderRef.current.scrollTo({ left: newSlide * itemWidth, behavior: 'smooth' });
    }
  }, [currentSlide, isMobile, maxPossibleSlide]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (sliderRef.current) sliderRef.current.style.cursor = 'grab';
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - sliderRef.current.offsetLeft;
      const distance = (x - startX) * 2;
      sliderRef.current.scrollLeft = scrollLeft - distance;
    },
    [isDragging, startX, scrollLeft]
  );

  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const scrollPosition = sliderRef.current.scrollLeft;
    const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3);
    const newSlide = Math.round(scrollPosition / itemWidth);
    setCurrentSlide(Math.min(maxPossibleSlide, Math.max(0, newSlide)));
  }, [isMobile, maxPossibleSlide]);

  const handleVideoPlay = useCallback(() => {
    if (!videoRef.current || !article?.video_url) {
      console.warn('Video reference or URL not available');
      return;
    }
    setShowVideoModal(true);
    videoRef.current.muted = true;
    setIsMuted(true);
    setIsVideoLoading(true);
    videoRef.current
      .play()
      .then(() => {
        setVideoPlaying(true);
        setVideoError(null);
        setIsVideoLoading(false);
        console.log('Video started playing successfully (muted)');
      })
      .catch((err) => {
        console.error('Main video play failed:', err);
        setVideoError('Unable to play video. Try again.');
        setIsVideoLoading(false);
      });
  }, [article]);

  const toggleMute = useCallback((e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      console.log('Video mute state toggled:', newMutedState);
    }
  }, []);

  const handleRelatedVideoHover = useCallback(
    (articleId, action) => {
      const videoElement = relatedVideoRefs.current[articleId];
      if (!videoElement) return;
      if (action === 'start') {
        if (relatedVideoHover && relatedVideoHover !== articleId) {
          const prevVideo = relatedVideoRefs.current[relatedVideoHover];
          if (prevVideo) {
            prevVideo.pause();
            prevVideo.currentTime = 0;
          }
        }
        setRelatedVideoHover(articleId);
        videoElement.muted = true;
        videoElement.currentTime = 0;
        videoElement.play().catch((err) => console.log('Related video preview failed:', err));
      } else if (action === 'stop') {
        if (relatedVideoHover === articleId) setRelatedVideoHover(null);
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    },
    [relatedVideoHover]
  );

  const formatTime = useCallback((timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const closeVideoModal = useCallback(() => {
    if (videoRef.current) videoRef.current.pause();
    setShowVideoModal(false);
    setVideoPlaying(false);
    setIsVideoLoading(false);
  }, []);

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
      router.push('/#afrotcham');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ce8426] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#ce8426] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#ce8426] mb-4">Article Non Trouvé</h1>
          <p className="text-gray-600 mb-6">{error || "L'article que vous recherchez n'existe pas ou a été déplacé."}</p>
          <button
            onClick={handleBack}
            className="bg-[#ce8426] text-white px-6 py-2 rounded-lg hover:bg-[#b27220] transition flex items-center mx-auto"
          >
            <ArrowLeft className="inline mr-2" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#ce8426]">
        <div className="relative h-[60vh] w-full">
          {article?.video_url && !previewVideoError ? (
            <div className="relative w-full h-full" onClick={handleVideoPlay}>
              <video
                ref={previewVideoRef}
                className="w-full h-full object-cover"
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                poster={article.image_url}
              >
                <source src={article.video_url} type="video/mp4" />
                <source src={article.video_url.replace('.mp4', '.webm')} type="video/webm" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
                <div className="bg-black/50 rounded-full p-4 transform transition-transform hover:scale-110">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full" onClick={article.video_url ? handleVideoPlay : undefined}>
              <img
                src={article.image_url || `${apiUrl}/api/placeholder/1200/720?text=${encodeURIComponent(article.title || 'Article')}&color=ce8426`}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, article.title, { width: 1200, height: 720 }, 'ce8426')}
                loading="eager"
              />
              {article.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
                  <div className="bg-black/50 rounded-full p-4 transform transition-transform hover:scale-110">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={handleBack}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={handleShare}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition">
              <Share2 className="w-6 h-6" />
            </button>
            <span className="bg-[#ce8426] text-white text-sm font-medium px-3 py-1 rounded-full">{article.category}</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
          <article className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8">
            <h1 className="text-3xl font-bold text-[#ce8426] mb-4">{article.title}</h1>
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
            </div>

            {/* Scrollable Article Content */}
            <div className="mb-8">
              <div
                className="max-h-96 md:max-h-[500px] overflow-y-auto overflow-x-hidden pr-4 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-gray-100 hover:scrollbar-thumb-amber-400"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#fcd34d #f3f4f6'
                }}
              >
                <div
                  className="prose max-w-none prose-img:rounded-xl text-black prose-p:text-base prose-p:leading-relaxed prose-h1:text-[#ce8426] prose-h2:text-[#ce8426] prose-h3:text-[#b27220]"
                  style={{
                    '--tw-prose-links': '#ce8426',
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
          </article>

          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-[#ce8426] mb-6 flex items-center">
                <span className="w-2 h-8 bg-[#ce8426] mr-3 rounded-full"></span>
                Articles similaires
              </h2>
              <div className="relative">
                <div
                  ref={sliderRef}
                  className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                  style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  onScroll={handleScroll}
                >
                  {relatedArticles.map((related) => (
                    <RelatedArticle
                      key={related.uniqueKey}
                      article={related}
                      apiUrl={apiUrl}
                      handleImageError={handleImageError}
                      onVideoHover={handleRelatedVideoHover}
                    />
                  ))}
                  {isMobile && (
                    <div className="min-w-[25vw] flex items-center justify-start pr-4">
                      <div className="w-8 h-full flex items-center justify-center">
                        <ChevronRight className="w-6 h-6 text-[#ce8426] animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
                {relatedArticles.length > (isMobile ? 1 : 3) && (
                  <div className="flex justify-center mt-4 gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={currentSlide === 0}
                      className="p-2 bg-[#ce8426] text-white rounded-full disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentSlide >= maxPossibleSlide}
                      className="p-2 bg-[#ce8426] text-white rounded-full disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {isMobile && (
                  <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* <div className="max-w-4xl mx-auto px-4 my-8">
          <div className="relative">
            <img
              src={`${apiUrl}/api/images/pub-banner.jpg`}
              alt="Publicité"
              className="w-full h-full object-contain"
              onError={(e) => handleImageError(e, 'pub-banner', 'Espace publicitaire disponible', { width: 1200, height: 80 })}
              loading="lazy"
            />
          </div>
        </div> */}

        {article?.video_url && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 ${showVideoModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            onClick={closeVideoModal}
          >
            <div className="relative w-full max-w-5xl mx-auto p-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeVideoModal}
                className="absolute -top-12 right-4 text-white hover:text-gray-300 z-10"
                aria-label="Close video"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative w-full bg-black rounded-lg overflow-hidden flex justify-center">
                {videoError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white text-center p-4">
                    <p className="mb-4">{videoError}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoPlay();
                      }}
                      className="bg-[#429261] hover:bg-[#347048] text-white px-4 py-2 rounded-lg transition"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative w-full">
                      {isVideoLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        </div>
                      )}
                      <video
                        ref={videoRef}
                        className="max-h-[80vh] object-contain"
                        playsInline
                        muted={isMuted}
                        onEnded={() => setVideoPlaying(false)}
                        poster={article.image_url}
                        preload="metadata"
                        controls={false}
                        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                      >
                        <source src={article.video_url} type="video/mp4" />
                        <source src={article.video_url.replace('.mp4', '.webm')} type="video/webm" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-4 px-4">
                      <div className="flex justify-between text-white text-sm mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(videoRef.current?.duration || 0)}</span>
                      </div>
                      <div
                        className="mt-2 w-full bg-gray-600 rounded-full h-2 overflow-hidden cursor-pointer"
                        onClick={(e) => {
                          if (videoRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            videoRef.current.currentTime = pos * videoRef.current.duration;
                          }
                        }}
                        onTouchStart={(e) => {
                          if (videoRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.touches[0].clientX - rect.left) / rect.width;
                            videoRef.current.currentTime = pos * videoRef.current.duration;
                          }
                        }}
                      >
                        <div
                          className="bg-[#429261] h-full"
                          style={{
                            width: videoRef.current && videoRef.current.duration
                              ? `${(currentTime / videoRef.current.duration) * 100}%`
                              : '0%',
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (videoRef.current) {
                              if (videoRef.current.paused) {
                                videoRef.current.play().catch((err) => console.error('Play failed:', err));
                                setVideoPlaying(true);
                              } else {
                                videoRef.current.pause();
                                setVideoPlaying(false);
                              }
                            }
                          }}
                          className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
                          aria-label={videoPlaying ? 'Pause' : 'Play'}
                        >
                          {videoPlaying ? (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                            </svg>
                          ) : (
                            <Play className="w-6 h-6 text-white" />
                          )}
                        </button>
                        <button
                          onClick={toggleMute}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#429261] hover:bg-[#347048]'
                            }`}
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? (
                            <>
                              <VolumeX className="w-5 h-5 text-white" />
                              <span className="text-white text-sm font-medium">Unmute</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-5 h-5 text-white" />
                              <span className="text-white text-sm font-medium">Mute</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="w-full px-4 mt-8">
          <div className="max-w-7xl mx-auto">
            <AdBanner position="bottom" page="homepage" />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AfroTchamArticlePage;