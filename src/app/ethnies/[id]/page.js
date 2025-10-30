'use client';
import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { ArrowLeft, Calendar, User, Tag, Share2, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Head from 'next/head';
import sanitizeHtml from 'sanitize-html';


// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Memoized Related Item Component
const RelatedItem = memo(({ item, apiUrl, handleImageError, onVideoHover }) => {
  return (
    <Link href={`/ethnies/${item.id}`}>
      <div
        className="group cursor-pointer snap-start mr-4"
        style={{
          width: item.isMobile ? 'calc(75vw - 2rem)' : '250px',
          minWidth: item.isMobile ? 'calc(75vw - 2rem)' : '250px',
        }}
        onMouseEnter={() => !item.isMobile && item.video_url && onVideoHover(item.id, 'start')}
        onMouseLeave={() => !item.isMobile && item.video_url && onVideoHover(item.id, 'stop')}
        onTouchStart={() => item.isMobile && item.video_url && onVideoHover(item.id, 'start')}
        onTouchEnd={() => item.isMobile && item.video_url && onVideoHover(item.id, 'stop')}
      >
        <div className="rounded-xl overflow-hidden aspect-[2/3] relative">
          {item.video_url ? (
            <div className="relative w-full h-full">
              <img
                src={item.image || `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(item.title || 'Item')}&color=2563eb`}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => handleImageError(e, item.id, item.title, { width: 250, height: 375 })}
                loading="lazy"
              />
              <video
                ref={(el) => (item.videoRef.current[item.id] = el)}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                muted
                playsInline
                loop
                preload="none"
                poster={item.image}
              >
                <source type="video/mp4" />
                <source type="video/webm" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Play className="w-8 h-8 text-white opacity-80" />
              </div>
            </div>
          ) : (
            <img
              src={item.image || `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(item.title || 'Item')}&color=2563eb`}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => handleImageError(e, item.id, item.title, { width: 250, height: 375 })}
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">Ethnies</span>
          </div>
        </div>
        <h4 className="mt-3 font-medium text-blue-600 group-hover:text-blue-800 transition line-clamp-2">{item.title}</h4>
        <p className="text-sm text-gray-500">{item.date}</p>
      </div>
    </Link>
  );
});

const EthnieArticlePage = () => {
  const { id } = useParams();
  const router = useRouter();  
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
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
  const [relatedVideoHover, setRelatedVideoHover] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [previewVideoError, setPreviewVideoError] = useState(false);
  const sliderRef = useRef(null);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const relatedVideoRefs = useRef({});
  const loadedImages = useRef(new Set());
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com';

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch ethnie article data
  useEffect(() => {
    if (id) {
      const getItemData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch main ethnie article
          const response = await fetch(`${apiUrl}/api/arts-traditions-articles/${id}`);
          if (!response.ok) {
            throw new Error('Article ethnie not found');
          }
          const data = await response.json();

          // Verify arts_traditions_type is 'ethnie'
          if (data.arts_traditions_type !== 'ethnie') {
            throw new Error('Article is not an ethnie item');
          }

          // Normalize image
          let imageUrl = data.image_url;
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
            imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
          } else if (!imageUrl) {
            imageUrl = `${apiUrl}/api/placeholder/1200/600?text=${encodeURIComponent(data.title || 'Ethnie')}&color=2563eb`;
          }

          // Normalize video_url
          let videoUrl = data.video_url;
          if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('//')) {
            videoUrl = `${apiUrl}${videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}`;
          }

          setItem({
            id: data.id,
            title: data.title,
            image: imageUrl,
            video_url: videoUrl || null,
            author: data.author_name || 'Anonyme',
            date: data.date ? new Date(data.date).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : new Date(data.created_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            content: data.content,
          });

          // Fetch related items
          const relatedResponse = await fetch(`${apiUrl}/api/arts-traditions-articles/?arts_traditions_type=ethnie&exclude=${id}&limit=6`);
          if (!relatedResponse.ok) {
            throw new Error('Failed to fetch related items');
          }
          const relatedData = await relatedResponse.json();

          const processedRelated = relatedData.map((related) => {
            let relatedImageUrl = related.image_url;
            if (relatedImageUrl && !relatedImageUrl.startsWith('http') && !relatedImageUrl.startsWith('//')) {
              relatedImageUrl = `${apiUrl}${relatedImageUrl.startsWith('/') ? relatedImageUrl : `/${relatedImageUrl}`}`;
            } else if (!relatedImageUrl) {
              relatedImageUrl = `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(related.title || 'Item')}&color=2563eb`;
            }

            let relatedVideoUrl = related.video_url;
            if (relatedVideoUrl && !relatedVideoUrl.startsWith('http') && !relatedVideoUrl.startsWith('//')) {
              relatedVideoUrl = `${apiUrl}${relatedVideoUrl.startsWith('/') ? relatedVideoUrl : `/${relatedVideoUrl}`}`;
            }

            return {
              id: related.id,
              title: related.title,
              image: relatedImageUrl,
              video_url: relatedVideoUrl || null,
              date: related.date ? new Date(related.date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : new Date(related.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              isMobile,
              uniqueKey: `related-${related.id}-${Date.now()}`,
              videoRef: relatedVideoRefs,
            };
          });

          setRelatedItems(processedRelated);
        } catch (err) {
          console.error('Error fetching ethnie data:', err);
          setError(err.message);
          setItem(null);
        } finally {
          setLoading(false);
        }
      };

      getItemData();
    }
  }, [id, apiUrl, isMobile]);

  // Reset video state when item changes
  useEffect(() => {
    setVideoPlaying(false);
    setShowVideoModal(false);
    setIsMuted(true);
    setVideoError(null);
    setIsVideoLoading(false);
    setPreviewVideoError(false);
  }, [item]);

  // Main video event listeners
  useEffect(() => {
    if (videoRef.current && item?.video_url) {
      const video = videoRef.current;

      const handleError = () => {
        console.error('Main video error:', video.error);
        setVideoError(video.error?.message || 'Error loading video');
        setIsVideoLoading(false);
      };

      const handleLoadedMetadata = () => {
        console.log('Main video metadata loaded:', {
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        });
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
          console.warn('Video loading timeout, clearing spinner');
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
  }, [item, isVideoLoading]);

  // Preview video event listeners
  useEffect(() => {
    if (videoRef.current && previewVideoRef.current && item?.video_url && !previewVideoError) {
      const video = previewVideoRef.current;

      const handlePreviewError = () => {
        console.error('Preview video error:', video.error);
        setPreviewVideoError(true);
      };

      const handlePreviewLoadedMetadata = () => {
        console.log('Preview video metadata loaded');
        video.play().catch((err) => {
          console.warn('Preview video autoplay failed:', err);
          setPreviewVideoError(true);
        });
      };

      video.addEventListener('error', handlePreviewError);
      video.addEventListener('loadedmetadata', handlePreviewLoadedMetadata);

      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection && connection.saveData) {
        console.log('Data saver mode detected, disabling preview video');
        setPreviewVideoError(true);
      }

      return () => {
        video.removeEventListener('error', handlePreviewError);
        video.removeEventListener('loadedmetadata', handlePreviewLoadedMetadata);
        video.pause();
      };
    }
  }, [item, previewVideoError, previewVideoRef]);

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

  // Image error handler
  const handleImageError = useCallback((e, itemId, placeholderText, size = { width: 800, height: 300 }, color = '2563eb') => {
    const src = e.target.src;
    if (!loadedImages.current.has(src)) {
      console.warn(`Image failed to load for item ${itemId}:`, src);
      loadedImages.current.add(src);
      const { width, height } = size;
      if (!src.includes('/api/placeholder/') && src !== FALLBACK_IMAGE) {
        e.target.src = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText || 'Item')}&color=${color}`;
      } else {
        e.target.src = FALLBACK_IMAGE;
      }
      e.target.className = `${e.target.className} object-contain bg-gray-200`;
      e.target.loading = 'lazy';
    }
  }, [apiUrl]);

  // Video play handler
  const handleVideoPlay = useCallback(() => {
    if (!videoRef.current || !item?.video_url) {
      console.warn('Video reference or URL not available');
      return;
    }

    setShowVideoModal(true);
    console.log(`Attempting to play main video:`, {
      src: videoRef.current.src || videoRef.current.querySelector('source')?.src,
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
        console.log('Main video started playing successfully (muted)');
      })
      .catch((err) => {
        console.error('Main video play failed:', err);
        setVideoError('Unable to play video. Tap the play button to try again.');
        setIsVideoLoading(false);
      });
  }, [item, isMuted]);

  // Mute toggle handler
  const toggleMute = useCallback((e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      console.log('Main video mute state toggled:', newMutedState);
    }
  }, []);

  // Related video hover handler
  const handleRelatedVideoHover = useCallback((itemId, action) => {
    const videoElement = relatedVideoRefs.current[itemId];
    if (!videoElement) return;

    if (action === 'start') {
      if (relatedVideoHover && relatedVideoHover !== itemId) {
        const prevVideo = relatedVideoRefs.current[relatedVideoHover];
        if (prevVideo) {
          prevVideo.pause();
          prevVideo.currentTime = 0;
          prevVideo.querySelector('source').src = '';
        }
      }

      setRelatedVideoHover(itemId);
      videoElement.muted = true;
      videoElement.currentTime = 0;
      const source = videoElement.querySelector('source');
      if (!source.src) source.src = relatedItems.find(i => i.id === itemId)?.video_url;

      console.log(`Attempting to play related video ${itemId}:`, {
        src: videoElement.querySelector('source')?.src,
        readyState: videoElement.readyState,
      });

      videoElement.load();
      videoElement.play().catch((err) => {
        console.log('Related video preview failed:', err);
      });
    } else if (action === 'stop') {
      if (relatedVideoHover === itemId) {
        setRelatedVideoHover(null);
      }
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  }, [relatedVideoHover, relatedItems]);

  // Format time for video
  const formatTime = useCallback((timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Share handler
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.title,
          text: `Découvrez cet article sur ${item?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  }, [item]);

  // Close video modal
  const closeVideoModal = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
    setVideoPlaying(false);
    setIsVideoLoading(false);
  }, []);

  // Carousel navigation
  const visibleItems = isMobile ? 1 : Math.floor(sliderRef.current?.offsetWidth / (250 + 16) || 3);
  const maxPossibleSlide = relatedItems.length - visibleItems;

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      const slideWidth = isMobile ? window.innerWidth * 0.75 : 250;
      sliderRef.current.scrollLeft -= slideWidth;
    }
  }, [currentSlide, isMobile]);

  const handleNext = useCallback(() => {
    if (currentSlide < maxPossibleSlide) {
      setCurrentSlide(currentSlide + 1);
      const slideWidth = isMobile ? window.innerWidth * 0.75 : 250;
      sliderRef.current.scrollLeft += slideWidth;
    }
  }, [currentSlide, isMobile, maxPossibleSlide]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleScroll = useCallback(() => {
    const slideWidth = isMobile ? window.innerWidth * 0.75 : 250;
    setCurrentSlide(Math.round(sliderRef.current.scrollLeft / slideWidth));
  }, [isMobile]);

  const handleBack = useCallback(() => {
      // Navigate to the previous page in history
      if (window.history.length > 1) {
        router.back();
      } else {
        // Fallback to AfroTcham section if no history
        router.push('/#ethnies');
      }
    }, [router]);

  // Strip HTML for meta description
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  const description = stripHtml(item?.content || '').substring(0, 160);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || "L'article que vous recherchez n'existe pas ou a été déplacé."}</p>
          <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            <span className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Ethnies
            </span>
          </button>
        </div>
      </div>
    );
  }

  const sanitizedContent = sanitizeHtml(item.content, {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'img'],
    allowedAttributes: {
      a: ['href', 'target'],
      img: ['src', 'alt'],
    },
  });

  return (
    <>
      <Head>
        <title>{item.title} | Ethnies</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={item.title} />
        <meta property="og:image" content={item.image} />
        <meta property="og:description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen bg-blue-900">
        {/* Header Section */}
        <div className="relative h-[50vh] w-full">
          {item?.video_url && !previewVideoError ? (
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
                  poster={item.image}
                >
                  <source src={item.video_url} type="video/mp4" />
                  <source src={item.video_url.replace('.mp4', '.webm')} type="video/webm" />
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
              <div className="relative w-full h-full" onClick={item.video_url ? handleVideoPlay : undefined}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, item.id, item.title, { width: 1200, height: 600 })}
                  loading="eager"
                />
                {item.video_url && (
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
              onClick={handleBack}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition"
                aria-label="Retour aux Ethnies"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
          </div>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={handleShare}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition"
              aria-label="Partager l'article"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <span className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">Ethnies</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto -mt-20 relative z-10 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            {/* Content Section */}
            <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-4">{item.title}</h1>
            <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-y-2">
              <div className="flex items-center mr-6">
                <User className="w-4 h-4 mr-2" />
                <span>{item.author}</span>
              </div>
              <div className="flex items-center mr-6">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{item.date}</span>
              </div>
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                <span>Ethnies</span>
              </div>
              <div className="ml-auto">
                <button
                  onClick={handleShare}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                  aria-label="Partager l’article"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  <span>Partager</span>
                </button>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                <div className="w-2 h-6 bg-blue-500 mr-3 rounded-full"></div>Contenu
              </h2>
              <div 
                className="max-h-96 md:max-h-[500px] overflow-y-auto overflow-x-hidden pr-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-400"
              >
                <div
                  className="prose max-w-none prose-img:rounded-xl text-black prose-p:text-base prose-p:leading-relaxed prose-h1:text-blue-600 prose-h2:text-blue-600 prose-h3:text-blue-600"
                  style={{
                    '--tw-prose-links': '#2563eb',
                    '--tw-prose-body': '#000000',
                    '--tw-prose-headings': '#000000',
                    color: '#000000',
                    WebkitTextFillColor: 'initial'
                  }}
                >
                  <div 
                    className="item-content text-black leading-relaxed" 
                    style={{ color: '#000000', lineHeight: '1.7' }}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <div className="text-sm text-gray-400 flex items-center">
                  <span>Faites défiler pour lire la suite</span>
                  <svg className="w-4 h-4 ml-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14 l-7 7m0 0 l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
            {relatedItems.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center">
                  <div className="w-2 h-8 bg-blue-500 mr-3 rounded-full" />
                  Contenu Similaire
                </h3>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handlePrev}
                    className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={currentSlide === 0}
                    aria-label="Item précédent"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={currentSlide >= maxPossibleSlide}
                    aria-label="Item suivant"
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
                    {relatedItems.map((related) => (
                      <RelatedItem
                        key={related.uniqueKey || related.id}
                        item={related}
                        apiUrl={apiUrl}
                        handleImageError={handleImageError}
                        onVideoHover={handleRelatedVideoHover}
                      />
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
                    <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Modal */}
        {item?.video_url && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 ${
              showVideoModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6L18 18" />
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
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition text-lg md:text-base"
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
                        poster={item.image}
                        preload="metadata"
                        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                      >
                        <source src={item.video_url} type="video/mp4" />
                        <source src={item.video_url.replace('.mp4', '.webm')} type="video/webm" />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-6 md:py-4 px-6 md:px-4">
                      <div className="flex justify-between text-white text-lg md:text-sm mb-3 md:mb-1">
                        <span>{formatTime(currentTime)}</span>
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
                        role="progressbar"
                        aria-label="Video progress"
                        aria-valuenow={videoRef.current && videoRef.current.duration ? (currentTime / videoRef.current.duration) * 100 : 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        <div
                          className="bg-blue-600 h-full"
                          style={{
                            width: videoRef.current && videoRef.current.duration
                              ? `${(currentTime / videoRef.current.duration) * 100}%`
                              : '0%',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-4 md:mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (videoRef.current) {
                              if (videoPlaying) {
                                videoRef.current.pause();
                                setVideoPlaying(false);
                              } else {
                                videoRef.current.play().then(() => {
                                  setVideoPlaying(true);
                                }).catch((err) => {
                                  console.error('Play failed:', err);
                                });
                              }
                            }
                          }}
                          className="bg-white/20 hover:bg-blue-600 rounded-full p-3 md:p-2 transition"
                          aria-label={videoPlaying ? 'Pause' : 'Play'}
                        >
                          {videoPlaying ? (
                            <svg
                              className="w-8 h-8 md:w-6 md:h-6 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                            </svg>
                          ) : (
                            <Play className="w-8 h-8 md:w-6 md:h-6 text-white" />
                          )}
                        </button>
                        <button
                          onClick={toggleMute}
                          className={`flex items-center gap-3 md:gap-2 px-4 md:px-3 py-2 md:py-1 rounded-full transition ${
                            isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
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

        <div className="h-20" />
        <Footer />
      </div>
    </>
  );
};

export default EthnieArticlePage;