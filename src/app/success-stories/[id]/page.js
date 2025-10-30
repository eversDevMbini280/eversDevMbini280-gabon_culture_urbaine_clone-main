"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Calendar, User, Tag, Share2, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const SuccessStoryPage = () => {
  const API_BASE_URL = 'https://gabon-culture-urbaine-1.onrender.com';
  const { id } = useParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [relatedStories, setRelatedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [relatedVideoHover, setRelatedVideoHover] = useState(null);
  const relatedVideoRefs = useRef({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [previewVideoError, setPreviewVideoError] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch story and related data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log(`Fetching story with ID: ${id}`);

        const storyRes = await fetch(`${API_BASE_URL}/api/success-stories/${id}`, {
          cache: 'no-store',
          headers: { 'Accept': 'application/json' }
        });
        if (!storyRes.ok) {
          const errorData = await storyRes.json().catch(() => ({}));
          console.error('Story fetch error:', errorData);
          throw new Error(errorData.detail || `Failed to fetch story (Status: ${storyRes.status})`);
        }
        const storyData = await storyRes.json();
        console.log("Story fetched:", storyData);

        let imageUrl = storyData.image_url;
        if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("//")) {
          imageUrl = `${API_BASE_URL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
        }

        let videoUrl = storyData.video_url;
        if (videoUrl && !videoUrl.startsWith("http") && !videoUrl.startsWith("//")) {
          videoUrl = `${API_BASE_URL}${videoUrl.startsWith("/") ? videoUrl : `/${videoUrl}`}`;
        }

        console.log("Processed video URL:", videoUrl);

        setStory({
          ...storyData,
          image_url: imageUrl || null,
          video_url: videoUrl || null,
          author_name: storyData.author_name || 'Anonyme',
          category: storyData.category || { id: 32, name: 'Success Story' },
          title: storyData.title || 'Histoire sans titre',
          content: storyData.content || 'Aucun contenu disponible',
          created_at: storyData.created_at || null
        });

        const relatedRes = await fetch(
          `${API_BASE_URL}/api/success-stories/?limit=4&exclude_id=${id}`,
          { cache: 'no-store', headers: { 'Accept': 'application/json' } }
        );
        if (!relatedRes.ok) {
          console.warn("Failed to fetch related stories:", relatedRes.status);
        } else {
          const relatedData = await relatedRes.json();
          const processedRelated = relatedData
            .filter((s) => s.id !== storyData.id)
            .map((s) => {
              let rImageUrl = s.image_url;
              if (rImageUrl && !rImageUrl.startsWith("http") && !rImageUrl.startsWith("//")) {
                rImageUrl = `${API_BASE_URL}${rImageUrl.startsWith("/") ? rImageUrl : `/${rImageUrl}`}`;
              }

              let rVideoUrl = s.video_url;
              if (rVideoUrl && !rVideoUrl.startsWith("http") && !rVideoUrl.startsWith("//")) {
                rVideoUrl = `${API_BASE_URL}${rVideoUrl.startsWith("/") ? rVideoUrl : `/${rVideoUrl}`}`;
              }

              if (rVideoUrl) console.log(`Related story ${s.id} video URL:`, rVideoUrl);

              return {
                ...s,
                image_url: rImageUrl || null,
                video_url: rVideoUrl || null,
                author_name: s.author_name || 'Anonyme',
                category: s.category || { id: 32, name: 'Success Story' },
                title: s.title || 'Histoire sans titre',
                content: s.content || 'Aucun contenu disponible',
                uniqueKey: `related-${s.id}-${Date.now()}`
              };
            });
          setRelatedStories(processedRelated);
        }
      } catch (err) {
        console.error("Error fetching story:", err);
        setError(err.message);
        if (err.message.includes('not found') || err.message.includes('404') || err.message.includes('invalide')) {
          notFound();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, API_BASE_URL]);

  // Reset video state
  useEffect(() => {
    setVideoPlaying(false);
    setShowVideoModal(false);
    setIsMuted(true);
    setVideoError(null);
    setIsVideoLoading(false);
    setPreviewVideoError(false);
  }, [story]);

  // Video event listeners for main video
  useEffect(() => {
    if (videoRef.current && story?.video_url) {
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
          videoHeight: video.videoHeight
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
  }, [videoRef.current, story, isVideoLoading]);

  // Preview video event listeners
  useEffect(() => {
    if (previewVideoRef.current && story?.video_url && !previewVideoError) {
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
  }, [previewVideoRef.current, story, previewVideoError]);

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

  const handleImageError = (e, storyId) => {
    if (!failedImages.has(storyId)) {
      console.warn(`Image failed to load for story ${storyId}`);
      setFailedImages((prev) => new Set(prev).add(storyId));
      e.target.style.display = "none";

      const defaultIcon = e.target.parentElement.querySelector(".default-icon");
      if (defaultIcon) defaultIcon.classList.remove("hidden");
    }
  };

  const handleVideoPlay = () => {
    if (!videoRef.current || !story?.video_url) {
      console.warn("Video reference or URL not available");
      return;
    }

    setShowVideoModal(true);
    console.log(`Attempting to play main video:`, {
      src: videoRef.current.src || videoRef.current.querySelector("source")?.src,
      muted: isMuted,
      readyState: videoRef.current.readyState,
      networkState: videoRef.current.networkState
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

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      console.log("Main video mute state toggled:", newMutedState);
    }
  };

  const handleRelatedVideoHover = (storyId, action) => {
    const videoElement = relatedVideoRefs.current[storyId];
    if (!videoElement) return;

    if (action === "start") {
      if (relatedVideoHover && relatedVideoHover !== storyId) {
        const prevVideo = relatedVideoRefs.current[relatedVideoHover];
        if (prevVideo) {
          prevVideo.pause();
          prevVideo.currentTime = 0;
        }
      }

      setRelatedVideoHover(storyId);
      videoElement.muted = true;
      videoElement.currentTime = 0;

      console.log(`Attempting to play related video ${storyId}:`, {
        src: videoElement.querySelector("source")?.src,
        readyState: videoElement.readyState
      });

      videoElement.play().catch((err) => {
        console.log("Related video preview failed:", err);
      });
    } else if (action === "stop") {
      if (relatedVideoHover === storyId) {
        setRelatedVideoHover(null);
      }
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: story?.title,
          text: story?.content?.substring(0, 100) + "...",
          url: window.location.href
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
    setVideoPlaying(false);
    setIsVideoLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Histoire Non Trouvée</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/entrepreneuriat")}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            <ArrowLeft className="inline mr-2" />
            Retour à l'Entrepreneuriat
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-blue-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />

      {/* Story Header */}
      <div className="relative h-[60vh] w-full">
        {story?.video_url && !previewVideoError ? (
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
                poster={story.image_url}
              >
                <source src={story.video_url} type="video/mp4" />
                <source src={story.video_url.replace(".mp4", ".webm")} type="video/webm" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
                <div className="bg-black/50 rounded-full p-6 md:p-4 transform transition-transform hover:scale-110">
                  <Play className="w-16 h-16 md:w-12 md:h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        ) : story?.image_url ? (
          <div className="relative w-full h-full">
            <div className="relative w-full h-full" onClick={story.video_url ? handleVideoPlay : undefined}>
              <img
                src={story.image_url || FALLBACK_IMAGE}
                alt={story.title}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, story.id)}
              />
              {story.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
                  <div className="bg-black/50 rounded-full p-6 md:p-4 transform transition-transform hover:scale-110">
                    <Play className="w-16 h-16 md:w-12 md:h-12 text-white" />
                  </div>
                </div>
              )}
              <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Play className="w-16 h-16 text-white bg-black/50 rounded-full p-4" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
            <Play className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

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
          <span className="bg-blue-900 text-white text-sm font-medium px-3 py-1 rounded-full">
            {story.category?.name || "Success Story"}
          </span>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <motion.article
          className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-blue-900 mb-4">{story.title}</h1>

          <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-y-2">
            <div className="flex items-center mr-6">
              <User className="w-4 h-4 mr-2" />
              <span>{story.author_name}</span>
            </div>
            <div className="flex items-center mr-6">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{story.created_at ? new Date(story.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              <span>{story.category?.name || 'Success Story'}</span>
            </div>
          </div>

          {/* Scrollable Story Content */}
          <div className="mb-8">
            <div 
              className="max-h-96 md:max-h-[500px] overflow-y-auto overflow-x-hidden pr-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-400"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#93c5fd #f3f4f6'
              }}
            >
              <div
                className="prose max-w-none prose-lg text-black prose-img:rounded-xl prose-p:text-base prose-p:leading-relaxed prose-h1:text-blue-900 prose-h2:text-blue-800 prose-h3:text-blue-700"
                style={{
                  '--tw-prose-links': '#4f46e5',
                  '--tw-prose-body': '#000000',
                  '--tw-prose-headings': '#000000',
                  color: '#000000',
                  WebkitTextFillColor: 'initial'
                }}
              >
                <div 
                  className="article-content text-black leading-relaxed" 
                  style={{ color: '#000000', lineHeight: '1.7' }}
                  dangerouslySetInnerHTML={{ __html: story.content }}
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
        </motion.article>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <motion.div
            className="bg-white rounded-xl shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
              <span className="w-2 h-8 bg-purple-600 mr-3 rounded-full"></span>
              Histoires Similaires
            </h2>

            <div className="relative">
              <div
                ref={sliderRef}
                className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
                onScroll={() => {
                  if (sliderRef.current) {
                    const slideWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3);
                    setCurrentSlide(Math.round(sliderRef.current.scrollLeft / slideWidth));
                  }
                }}
              >
                {relatedStories.map((related) => (
                  <div
                    key={related.uniqueKey || related.id}
                    className="flex-none w-[300px]"
                    onMouseEnter={() => !isMobile && related.video_url && handleRelatedVideoHover(related.id, "start")}
                    onMouseLeave={() => !isMobile && related.video_url && handleRelatedVideoHover(related.id, "stop")}
                    onTouchStart={() => isMobile && related.video_url && handleRelatedVideoHover(related.id, "start")}
                    onTouchEnd={() => isMobile && related.video_url && handleRelatedVideoHover(related.id, "stop")}
                  >
                    <Link href={`/success-stories/${related.id}`} className="block group">
                      <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                        {related.video_url ? (
                          <div className="relative w-full h-full">
                            <img
                              src={related.image_url || FALLBACK_IMAGE}
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => handleImageError(e, related.id)}
                            />
                            <video
                              ref={(el) => (relatedVideoRefs.current[related.id] = el)}
                              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              muted
                              playsInline
                              loop
                              preload="metadata"
                              poster={related.image_url}
                            >
                              <source src={related.video_url} type="video/mp4" />
                              <source src={related.video_url.replace(".mp4", ".webm")} type="video/webm" />
                            </video>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <Play className="w-8 h-8 text-white opacity-80" />
                            </div>
                            <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <Play className="w-8 h-8 text-white opacity-80" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={related.image_url || FALLBACK_IMAGE}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => handleImageError(e, related.id)}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{related.title}</h3>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {relatedStories.length > (isMobile ? 1 : 3) && (
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    onClick={() => sliderRef.current.scrollBy({ left: -300, behavior: "smooth" })}
                    disabled={currentSlide === 0}
                    className="p-2 bg-purple-900 text-white rounded-full disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => sliderRef.current.scrollBy({ left: 300, behavior: "smooth" })}
                    disabled={currentSlide >= relatedStories.length - (isMobile ? 1 : 3)}
                    className="p-2 bg-purple-900 text-white rounded-full disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Video Modal */}
      {story?.video_url && (
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
              aria-label="Fermer la vidéo"
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
                    className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition text-lg md:text-base"
                  >
                    Réessayer
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
                      poster={story.image_url}
                      preload="metadata"
                      controls={false}
                      onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                    >
                      <source src={story.video_url} type="video/mp4" />
                      <source src={story.video_url.replace(".mp4", ".webm")} type="video/webm" />
                      Votre navigateur ne supporte pas la balise vidéo.
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
                        className="bg-purple-500 h-full"
                        style={{
                          width: videoRef.current && videoRef.current.duration
                            ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%`
                            : "0%"
                        }}
                      ></div>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                          </svg>
                        ) : (
                          <Play className="w-8 h-8 md:w-6 md:h-6 text-white" />
                        )}
                      </button>
                      <button
                        onClick={toggleMute}
                        className={`flex items-center gap-3 md:gap-2 px-4 md:px-3 py-2 md:py-1 rounded-full transition ${
                          isMuted ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                        }`}
                        aria-label={isMuted ? "Activer le son" : "Couper le son"}
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="w-6 h-6 md:w-5 md:h-5 text-white" />
                            <span className="text-white text-lg md:text-sm font-medium">Activer</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-6 h-6 md:w-5 md:h-5 text-white" />
                            <span className="text-white text-lg md:text-sm font-medium">Couper</span>
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

      <Footer />
    </motion.div>
  );
};

export default SuccessStoryPage;