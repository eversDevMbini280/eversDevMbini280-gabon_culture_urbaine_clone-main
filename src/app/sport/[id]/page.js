'use client';
import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Calendar, User, Tag, Share2, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

const SportArticlePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [previewVideoError, setPreviewVideoError] = useState(false);
  const [relatedVideoHover, setRelatedVideoHover] = useState(null);
  const sliderRef = useRef(null);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const relatedVideoRefs = useRef({});
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://gabon-culture-urbaine-1.onrender.com";

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Image error handler
  const handleImageError = (e, itemId, placeholderText, size = { width: 800, height: 300 }, color = '3e884c') => {
    console.log(`Image error loading for ${itemId}: ${e.target.src}`);
    const width = size.width;
    const height = size.height;
    const placeholderUrl = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText)}&color=${color}`;
    if (e.target.src !== placeholderUrl) {
      console.log(`Using placeholder: ${placeholderUrl}`);
      e.target.src = placeholderUrl;
      e.target.className = `${e.target.className} object-contain bg-gray-200`;
      e.target.loading = "lazy";
    }
  };

  // Process article data
  const processItem = (item, isSport = false) => {
    let imageUrl = item.image_url;
    if (!imageUrl || imageUrl === '') {
      imageUrl = `${apiUrl}/api/placeholder/1200/600?text=${encodeURIComponent(item.title || 'Article')}&color=3e884c`;
    } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
      imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
    }

    let videoUrl = item.video_url;
    if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('//')) {
      videoUrl = `${apiUrl}${videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}`;
    }

    return {
      id: item.id,
      title: item.title,
      image: imageUrl,
      video_url: videoUrl || null,
      category: item.category?.name || "Sport",
      author_name: item.author_name || 'Auteur inconnu',
      author: item.author?.username || "Anonyme",
      date: new Date(item.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      content: item.content || "<p>Contenu non disponible.</p>",
      isSport: isSport || item.is_sport || false,
      uniqueKey: `related-${item.id}-${Date.now()}`
    };
  };

  // Fetch article and related articles
  useEffect(() => {
    if (id) {
      const getArticleData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch main article
          const articleRes = await fetch(`${apiUrl}/api/articles/${id}`);
          if (!articleRes.ok) {
            throw new Error("Failed to fetch article");
          }
          const articleData = await articleRes.json();
          if (!articleData.is_sport) {
            throw new Error("Article is not a sport article");
          }
          const processedArticle = processItem(articleData, true);
          setArticle(processedArticle);

          // Fetch related articles
          const relatedRes = await fetch(
            `${apiUrl}/api/articles/sport?status=published&category_id=${articleData.category_id || ''}&exclude_id=${id}`
          );
          if (!relatedRes.ok) {
            throw new Error("Failed to fetch related articles");
          }
          const relatedData = await relatedRes.json();
          const processedRelated = relatedData
            .filter(item => item.id !== parseInt(id))
            .map(item => processItem(item, true));
          setRelatedArticles(processedRelated);
        } catch (err) {
          console.error("Error fetching article:", err);
          setError(err.message || "Erreur de chargement de l'article.");
        } finally {
          setLoading(false);
        }
      };

      getArticleData();
    }
  }, [id, apiUrl]);

  // Reset video state when article changes
  useEffect(() => {
    setVideoPlaying(false);
    setShowVideoModal(false);
    setIsMuted(true);
    setVideoError(null);
    setIsVideoLoading(false);
    setPreviewVideoError(false);
  }, [article]);

  // Video event listeners for main video
  useEffect(() => {
    if (videoRef.current && article?.video_url) {
      const video = videoRef.current;

      const handleError = () => {
        console.error("Main video error:", video.error);
        setVideoError(video.error?.message || "Error loading video");
        setIsVideoLoading(false);
      };

      const handleLoadedMetadata = () => {
        console.log("Main video metadata loaded:", {
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        });
        setIsVideoLoading(false);
      };

      const handleCanPlay = () => {
        console.log("Main video can play");
        setIsVideoLoading(false);
      };

      const handleLoadStart = () => {
        console.log("Main video load start");
        setIsVideoLoading(true);
      };

      video.addEventListener("error", handleError);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadstart", handleLoadStart);

      // Fallback timeout to prevent spinner from getting stuck
      const timeout = setTimeout(() => {
        if (isVideoLoading) {
          console.warn("Video loading timeout, clearing spinner");
          setIsVideoLoading(false);
        }
      }, 10000);

      return () => {
        video.removeEventListener("error", handleError);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadstart", handleLoadStart);
        clearTimeout(timeout);
      };
    }
  }, [videoRef.current, article, isVideoLoading]);

  // Preview video event listeners
  useEffect(() => {
    if (previewVideoRef.current && article?.video_url && !previewVideoError) {
      const video = previewVideoRef.current;

      const handleError = () => {
        console.error("Preview video error:", video.error);
        setPreviewVideoError(true);
      };

      const handleLoadedMetadata = () => {
        console.log("Preview video metadata loaded");
        video.play().catch((err) => {
          console.warn("Preview video autoplay failed:", err);
          setPreviewVideoError(true);
        });
      };

      video.addEventListener("error", handleError);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      // Check for data saver mode
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection && connection.saveData) {
        console.log("Data saver mode detected, disabling preview video");
        setPreviewVideoError(true);
      }

      return () => {
        video.removeEventListener("error", handleError);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
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
        console.warn("Preview video resume failed:", err);
        setPreviewVideoError(true);
      });
    }
  }, [showVideoModal, previewVideoError]);

  // Video play handler
  const handleVideoPlay = () => {
    if (!videoRef.current || !article?.video_url) {
      console.warn("Video reference or URL not available");
      return;
    }

    setShowVideoModal(true);
    console.log(`Attempting to play main video:`, {
      src: videoRef.current.src || videoRef.current.querySelector("source")?.src,
      muted: isMuted,
      readyState: videoRef.current.readyState,
      networkState: videoRef.current.networkState,
    });

    videoRef.current.muted = true;
    setIsMuted(true);
    setIsVideoLoading(true);

    videoRef.current
      .play()
      .then(() => {
        setVideoPlaying(true);
        setVideoError(null);
        setIsVideoLoading(false);
        console.log("Main video started playing successfully (muted)");
      })
      .catch((err) => {
        console.error("Main video play failed:", err);
        setVideoError("Unable to play video. Tap the play button to try again.");
        setIsVideoLoading(false);
      });
  };

  // Mute toggle handler
  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      console.log("Main video mute state toggled:", newMutedState);
    }
  };

  // Related video hover handler
  const handleRelatedVideoHover = (articleId, action) => {
    const videoElement = relatedVideoRefs.current[articleId];
    if (!videoElement) return;

    if (action === "start") {
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

      console.log(`Attempting to play related video ${articleId}:`, {
        src: videoElement.querySelector("source")?.src,
        readyState: videoElement.readyState,
      });

      videoElement.play().catch((err) => {
        console.log("Related video preview failed:", err);
      });
    } else if (action === "stop") {
      if (relatedVideoHover === articleId) {
        setRelatedVideoHover(null);
      }
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  };

  // Format time for video
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Share handler
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title,
          text: article?.content?.substring(0, 100) + "...",
          url: window.location.href,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Close video modal
  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
    setVideoPlaying(false);
    setIsVideoLoading(false);
  };

  // Carousel navigation
  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      const slideWidth = isMobile ? window.innerWidth * 0.75 : 250;
      sliderRef.current.scrollLeft -= slideWidth;
    }
  };

  const handleNext = () => {
    const maxSlides = relatedArticles.length - (isMobile ? 1 : 3);
    if (currentSlide < maxSlides) {
      setCurrentSlide(currentSlide + 1);
      const slideWidth = isMobile ? window.innerWidth * 0.75 : 250;
      sliderRef.current.scrollLeft += slideWidth;
    }
  };

  // Drag handling
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

  const handleScroll = () => {
    const slideWidth = isMobile ? window.innerWidth * 0.75 : 250;
    setCurrentSlide(Math.round(sliderRef.current.scrollLeft / slideWidth));
  };

  const maxPossibleSlide = relatedArticles.length - (isMobile ? 1 : 3);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#3e884c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#3e884c] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-[#3e884c] mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || "L'article que vous recherchez n'existe pas ou a été déplacé."}</p>
          <Link href="/" className="bg-[#3e884c] text-white px-6 py-2 rounded-lg hover:bg-[#2d6b3a] transition">
            <span className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3e884c]">
      {/* Header Section */}
      <div className="relative h-[50vh] w-full">
        {article?.video_url && !previewVideoError ? (
          <div className="relative w-full h-full">
            <div className="relative w-full h-full" onClick={handleVideoPlay}>
              <video
                ref={previewVideoRef}
                className="w-full h-full object-cover"
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                poster={article.image}
              >
                <source src={article.video_url} type="video/mp4" />
                <source src={article.video_url.replace(".mp4", ".webm")} type="video/webm" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
                <div className="bg-black/50 rounded-full p-6 md:p-4 transform transition-transform hover:scale-110">
                  <Play className="w-16 h-16 md:w-12 md:h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <div className="relative w-full h-full" onClick={article.video_url ? handleVideoPlay : undefined}>
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, article.id, article.title, { width: 1200, height: 600 })}
                loading="lazy"
              />
              {article.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
                  <div className="bg-black/50 rounded-full p-6 md:p-4 transform transition-transform hover:scale-110">
                    <Play className="w-16 h-16 md:w-12 md:h-12 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleShare}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <span className="bg-[#3e884c] text-white text-sm font-medium px-3 py-1 rounded-full">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto -mt-20 relative z-10 px-4">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#3e884c] mb-4">{article.title}</h1>

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
              className="max-h-96 md:max-h-[500px] overflow-y-auto overflow-x-hidden pr-4 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100 hover:scrollbar-thumb-green-400"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#86efac #f3f4f6'
              }}
            >
              <div
                className="prose max-w-none prose-img:rounded-xl text-black prose-p:text-base prose-p:leading-relaxed prose-h1:text-[#3e884c] prose-h2:text-[#2d6b3a] prose-h3:text-[#4a8a5a]"
                style={{
                  '--tw-prose-links': '#3e884c',
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

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-[#3e884c] mb-6 flex items-center">
                <div className="w-2 h-8 bg-[#5d9c6b] mr-3 rounded-full"></div>
                Articles similaires
              </h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handlePrev}
                  className="p-2 bg-[#3e884c] rounded-lg hover:bg-[#2d6b3a] transition-colors"
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 bg-[#3e884c] rounded-lg hover:bg-[#2d6b3a] transition-colors"
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
                    <div
                      key={related.uniqueKey || related.id}
                      className="group cursor-pointer snap-start mr-4"
                      style={{ 
                        width: isMobile ? 'calc(75vw - 2rem)' : '250px',
                        minWidth: isMobile ? 'calc(85vw - 2rem)' : '250px',
                      }}
                      onMouseEnter={() => !isMobile && related.video_url && handleRelatedVideoHover(related.id, "start")}
                      onMouseLeave={() => !isMobile && related.video_url && handleRelatedVideoHover(related.id, "stop")}
                      onTouchStart={() => isMobile && related.video_url && handleRelatedVideoHover(related.id, "start")}
                      onTouchEnd={() => isMobile && related.video_url && handleRelatedVideoHover(related.id, "stop")}
                    >
                      <Link href={`/sport/${related.id}`}>
                        <div className="rounded-xl overflow-hidden aspect-[2/3] relative">
                          {related.video_url ? (
                            <div className="relative w-full h-full">
                              <img
                                src={related.image}
                                alt={related.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => handleImageError(e, related.id, related.title, { width: 250, height: 375 })}
                                loading="lazy"
                              />
                              <video
                                ref={(el) => (relatedVideoRefs.current[related.id] = el)}
                                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                muted
                                playsInline
                                loop
                                preload="metadata"
                                poster={related.image}
                              >
                                <source src={related.video_url} type="video/mp4" />
                                <source src={related.video_url.replace(".mp4", ".webm")} type="video/webm" />
                              </video>
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Play className="w-8 h-8 text-white opacity-80" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={related.image}
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => handleImageError(e, related.id, related.title, { width: 250, height: 375 })}
                              loading="lazy"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-[#3e884c] text-white text-xs font-medium px-2 py-1 rounded">
                              {related.category}
                            </span>
                          </div>
                        </div>
                        <h4 className="mt-3 font-medium text-[#3e884c] group-hover:text-[#2d6b3a] transition line-clamp-2">
                          {related.title}
                        </h4>
                        <p className="text-sm text-gray-500">{related.date}</p>
                      </Link>
                    </div>
                  ))}
                  {isMobile && (
                    <div className="min-w-[25vw] flex items-center justify-start pr-4">
                      <div className="w-8 h-full flex items-center justify-center">
                        <ChevronRight className="w-6 h-6 text-[#3e884c] animate-pulse" />
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

      {/* Video Modal */}
      {article?.video_url && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 ${
            showVideoModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeVideoModal}
        >
          <div
            className="relative w-full max-w-[90vw] md:max-w-5xl mx-auto p-6 md:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideoModal}
              className="absolute -top-12 right-4 text-white hover:text-gray-300 z-10"
              aria-label="Close video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 md:h-8 md:w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-full bg-black rounded-lg overflow-hidden flex justify-center">
              {videoError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white text-center p-6">
                  <p className="mb-4 text-lg md:text-base">{videoError}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoPlay();
                    }}
                    className="bg-[#3e884c] hover:bg-[#2d6b3a] text-white px-6 py-3 rounded-lg transition text-lg md:text-base"
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
                      className="w-full max-h-[80vh] md:max-h-[70vh] object-contain"
                      playsInline
                      muted={isMuted}
                      onEnded={() => setVideoPlaying(false)}
                      poster={article.image}
                      preload="metadata"
                      controls={false}
                      onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                    >
                      <source src={article.video_url} type="video/mp4" />
                      <source src={article.video_url.replace(".mp4", ".webm")} type="video/webm" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-6 md:py-4 px-6 md:px-4">
                    <div className="flex justify-between text-white text-lg md:text-sm mb-3 md:mb-1">
                      <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
                      <span>{formatTime(videoRef.current?.duration || 0)}</span>
                    </div>
                    <div
                      className="mt-3 md:mt-2 w-full bg-gray-600 rounded-full h-3 md:h-2 overflow-hidden cursor-pointer"
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
                        className="bg-[#3e884c] h-full"
                        style={{
                          width: `${(videoRef.current?.currentTime / videoRef.current?.duration) * 100}%` || 0,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-4 md:mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (videoRef.current) {
                            if (videoRef.current.paused) {
                              videoRef.current.play().catch((err) => console.error("Play failed:", err));
                              setVideoPlaying(true);
                            } else {
                              videoRef.current.pause();
                              setVideoPlaying(false);
                            }
                          }
                        }}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-3 md:p-2 transition"
                        aria-label={videoPlaying ? "Pause" : "Play"}
                      >
                        {videoPlaying ? (
                          <svg
                            className="w-8 h-8 md:w-6 md:h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6h4v-6m0 6v-6" />
                          </svg>
                        ) : (
                          <Play className="w-8 h-8 md:w-6 md:h-6 text-white" />
                        )}
                      </button>
                      <button
                        onClick={toggleMute}
                        className={`flex items-center gap-3 md:gap-2 px-4 md:px-3 py-2 md:py-1 rounded-full transition ${
                          isMuted ? "bg-red-500 hover:bg-red-600" : "bg-[#3e884c] hover:bg-[#2d6b3a]"
                        }`}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="w-6 h-6 md:w-5 md:h-5 text-white" />
                            <span className="text-white text-lg md:text-sm font-medium">Unmute</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-6 h-6 md:w-5 md:h-5 text-white" />
                            <span className="text-white text-lg md:text-sm font-medium">Mute</span>
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

      <div className="h-20"></div>
      <div className="space-y-8">
        <div className="relative">
          <img
            src={`${apiUrl}/api/images/sport-pub-banner.jpg`}
            alt="Publicité"
            className="w-full h-full object-contain"
            onError={(e) => handleImageError(e, 'pub-banner', 'Espace publicitaire disponible', { width: 1200, height: 80 })}
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-4 py-1 bg-black bg-opacity-30 rounded"></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SportArticlePage;