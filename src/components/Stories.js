'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight, Volume2, VolumeX, ArrowRight, Pause } from 'lucide-react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

const Stories = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://gabon-culture-urbaine-1.onrender.com";
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const [hasDragged, setHasDragged] = useState(false);
  
  // Video playing states
  const [playingVideos, setPlayingVideos] = useState(new Set());
  const [videoMuteStates, setVideoMuteStates] = useState({});
  const videoRefs = useRef({});
  const [currentTime, setCurrentTime] = useState({});
  const timeUpdateIntervals = useRef({});

  // IMPROVED: Dynamic drag threshold based on device type
  const DRAG_THRESHOLD = isMobile ? 25 : 10; // Higher threshold for mobile
  const VERTICAL_SCROLL_THRESHOLD = 15; // Threshold to detect vertical scrolling intent

  // Touch tracking refs
  const touchStartTime = useRef(0);
  const isVerticalScroll = useRef(false);
  const touchMoved = useRef(false);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch stories data with proper error handling
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`${API_BASE_URL}/api/articles/story?status=published`, {
          cache: 'no-store'
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Stories fetch error details:', errorData);
          throw new Error(`Failed to fetch stories: ${res.status} ${errorData.detail || res.statusText}`);
        }
        
        const data = await res.json();
        console.log('Stories API response:', data);
        
        if (!Array.isArray(data) || data.length === 0) {
          setError('No stories found. Please check if stories are published and have valid media.');
          setStories([]);
          return;
        }
        
        // Process stories with guaranteed image URLs
        const processedStories = data.map(story => {
          let imageUrl = story.image_url;
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
            imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
          }
          
          let videoUrl = story.video_url;
          if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('//')) {
            videoUrl = `${API_BASE_URL}${videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}`;
          }
          
          return {
            ...story,
            image_url: imageUrl || null,
            video_url: videoUrl || null,
            uniqueKey: `story-${story.id}-${Date.now()}`
          };
        });
        
        setStories(processedStories);
        
        // Initialize mute states for all videos (start muted)
        const initialMuteStates = {};
        processedStories.forEach(story => {
          if (story.video_url) {
            initialMuteStates[story.id] = true; // Start muted
          }
        });
        setVideoMuteStates(initialMuteStates);
        
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
  }, [API_BASE_URL]);

  // Format time for display
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Image error handler
  const handleImageError = (e, storyId) => {
    if (!failedImages.has(storyId)) {
      setFailedImages(prev => new Set(prev).add(storyId));
      e.target.style.display = 'none';
      e.target.parentElement.querySelector('.default-icon')?.classList.remove('hidden');
    }
  };

  // IMPROVED: Handle story click with better mobile detection
  const handleStoryClick = (e, story) => {
    // Prevent click if user was dragging or scrolling vertically
    if (hasDragged || dragDistance > DRAG_THRESHOLD || isVerticalScroll.current) {
      console.log('Click prevented due to drag/scroll operation');
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    console.log(`Story ${story.id} clicked. Has video: ${!!story.video_url}, Is playing: ${playingVideos.has(story.id)}`);
    
    // If story has video and it's not currently playing, start playing it
    if (story.video_url && !playingVideos.has(story.id)) {
      console.log(`Starting video for story ${story.id}`);
      playVideo(story.id);
      return false;
    } else if (story.video_url && playingVideos.has(story.id)) {
      // If video is already playing, navigate to article (second click)
      console.log(`Navigating to article for story ${story.id}`);
      window.location.href = `/stories/${story.id}`;
    } else {
      // If no video, navigate directly to article
      console.log(`No video, navigating directly to article for story ${story.id}`);
      window.location.href = `/stories/${story.id}`;
    }
  };

  // IMPROVED: Better touch handling with vertical scroll detection
  const handleTouchStart = (e, story) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
    setHasDragged(false);
    setDragDistance(0);
    touchStartTime.current = Date.now();
    touchMoved.current = false;
    isVerticalScroll.current = false;
    
    // Don't prevent default to allow natural scrolling
  };

  const handleTouchMove = (e) => {
    if (!startX || !startY) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    setDragDistance(distance);
    touchMoved.current = true;
    
    // Detect if this is primarily vertical scrolling
    if (deltaY > VERTICAL_SCROLL_THRESHOLD && deltaY > deltaX * 1.5) {
      isVerticalScroll.current = true;
      console.log('Vertical scroll detected');
    }
    
    // Only consider it a drag if horizontal movement exceeds threshold
    if (distance > DRAG_THRESHOLD && !isVerticalScroll.current) {
      setHasDragged(true);
    }
  };

  const handleTouchEnd = (e, story) => {
    const touchDuration = Date.now() - touchStartTime.current;
    
    // Conditions for a valid tap:
    // 1. Short duration (less than 300ms)
    // 2. Minimal movement (less than threshold)
    // 3. Not detected as vertical scroll
    // 4. Actually moved very little
    const isValidTap = touchDuration < 300 && 
                      dragDistance <= DRAG_THRESHOLD && 
                      !isVerticalScroll.current && 
                      !touchMoved.current;
    
    console.log('Touch end analysis:', {
      duration: touchDuration,
      distance: dragDistance,
      isVerticalScroll: isVerticalScroll.current,
      touchMoved: touchMoved.current,
      isValidTap
    });
    
    // Small delay to ensure all state updates are complete
    setTimeout(() => {
      if (isValidTap) {
        console.log(`Touch end - valid tap for story ${story.id}`);
        handleStoryClick(e, story);
      } else {
        console.log(`Touch end - prevented due to movement/scroll`);
      }
      
      // Reset all touch tracking states
      setHasDragged(false);
      setDragDistance(0);
      setStartX(0);
      setStartY(0);
      touchMoved.current = false;
      isVerticalScroll.current = false;
      touchStartTime.current = 0;
    }, 50);
  };

  // Play video function with better state management
  const playVideo = (storyId) => {
    const videoElement = videoRefs.current[storyId];
    if (!videoElement) {
      console.error(`Video element not found for story ${storyId}`);
      return;
    }
    
    console.log(`Playing video ${storyId}`, { 
      currentlyPlaying: Array.from(playingVideos),
      videoSrc: videoElement.src 
    });
    
    // Stop all other playing videos first
    playingVideos.forEach(playingId => {
      if (playingId !== storyId) {
        console.log(`Stopping video ${playingId} to play ${storyId}`);
        stopVideo(playingId);
      }
    });
    
    // Set playing state BEFORE starting video
    setPlayingVideos(prev => {
      const newSet = new Set(prev);
      newSet.add(storyId);
      console.log(`Updated playing videos:`, Array.from(newSet));
      return newSet;
    });
    
    videoElement.muted = videoMuteStates[storyId] !== false;
    videoElement.currentTime = 0;
    
    console.log(`Video ${storyId} play attempt:`, {
      src: videoElement.src,
      muted: videoElement.muted,
      readyState: videoElement.readyState
    });
    
    // Force a small delay to ensure state is updated
    setTimeout(() => {
      videoElement.play().then(() => {
        console.log(`Video ${storyId} started playing successfully`);
      }).catch(err => {
        console.log('Video play failed:', err);
        videoElement.muted = true;
        setVideoMuteStates(prev => ({ ...prev, [storyId]: true }));
        
        videoElement.play().then(() => {
          console.log(`Video ${storyId} started playing muted`);
        }).catch(innerErr => {
          console.error('Video play failed even when muted:', innerErr);
          setPlayingVideos(prev => {
            const newSet = new Set(prev);
            newSet.delete(storyId);
            return newSet;
          });
        });
      });
    }, 100);

    // Set up time tracking interval
    if (timeUpdateIntervals.current[storyId]) {
      clearInterval(timeUpdateIntervals.current[storyId]);
    }
    
    timeUpdateIntervals.current[storyId] = setInterval(() => {
      if (videoElement && !videoElement.paused) {
        setCurrentTime(prev => ({
          ...prev,
          [storyId]: videoElement.currentTime
        }));
      }
    }, 250);
  };

  // Stop video function with better cleanup
  const stopVideo = (storyId) => {
    const videoElement = videoRefs.current[storyId];
    if (!videoElement) return;
    
    console.log(`Stopping video ${storyId}`);
    
    setPlayingVideos(prev => {
      const newSet = new Set(prev);
      newSet.delete(storyId);
      console.log(`Updated playing videos after stop:`, Array.from(newSet));
      return newSet;
    });
    
    videoElement.pause();
    videoElement.currentTime = 0;
    
    // Clear the time update interval
    if (timeUpdateIntervals.current[storyId]) {
      clearInterval(timeUpdateIntervals.current[storyId]);
      delete timeUpdateIntervals.current[storyId];
    }
    
    setCurrentTime(prev => ({
      ...prev,
      [storyId]: 0
    }));
  };

  // Toggle mute for specific video
  const toggleVideoMute = (e, storyId) => {
    e.stopPropagation();
    e.preventDefault();
    
    const videoElement = videoRefs.current[storyId];
    if (!videoElement) return;
    
    const newMutedState = !videoMuteStates[storyId];
    setVideoMuteStates(prev => ({ ...prev, [storyId]: newMutedState }));
    videoElement.muted = newMutedState;
  };

  // Pause/Play toggle for playing video
  const togglePlayPause = (e, storyId) => {
    e.stopPropagation();
    e.preventDefault();
    
    const videoElement = videoRefs.current[storyId];
    if (!videoElement) return;
    
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  };

  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      Object.values(timeUpdateIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

  // IMPROVED: Mouse handlers for slider with better drag detection
  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX);
    setStartY(e.pageY);
    setScrollLeft(sliderRef.current.scrollLeft);
    setHasDragged(false);
    setDragDistance(0);
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.userSelect = 'auto';
    }
    
    // Reset drag states after a short delay
    setTimeout(() => {
      setHasDragged(false);
      setDragDistance(0);
    }, 100);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    
    const deltaX = Math.abs(e.pageX - startX);
    const deltaY = Math.abs(e.pageY - startY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    setDragDistance(distance);
    
    if (distance > DRAG_THRESHOLD) {
      setHasDragged(true);
    }
    
    const x = e.pageX;
    const walk = startX - x;
    sliderRef.current.scrollLeft = scrollLeft + walk;
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const slideWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 4);
    setCurrentSlide(Math.round(sliderRef.current.scrollLeft / slideWidth));
  };

  const handlePrev = () => {
    const slideWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 4);
    sliderRef.current.scrollBy({ left: -slideWidth, behavior: 'smooth' });
  };

  const handleNext = () => {
    const slideWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 4);
    sliderRef.current.scrollBy({ left: slideWidth, behavior: 'smooth' });
  };

  // Video error handler
  const handleVideoError = (e, storyId) => {
    console.error(`Video error for story ${storyId}:`, e.target.error);
    setPlayingVideos(prev => {
      const newSet = new Set(prev);
      newSet.delete(storyId);
      return newSet;
    });
    
    const videoContainer = e.target.parentElement;
    if (videoContainer) {
      const fallbackImg = videoContainer.querySelector('img');
      if (fallbackImg) fallbackImg.style.display = 'block';
      e.target.style.display = 'none';
    }
  };

  if (loading) {
    return (
      <section className="py-10 bg-blue-900 flex justify-center">
        <div className="animate-pulse text-white">Loading stories...</div>
      </section>
    );
  }

  if (stories.length === 0) {
    return (
      <section className="py-10 bg-blue-900 text-center text-white">
        <p>No stories available at the moment.</p>
      </section>
    );
  }

  return (
    <section className="py-10 bg-blue-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Stories</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={currentSlide === 0}
              aria-label="Previous story"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button 
              onClick={handleNext}
              className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={currentSlide >= Math.max(0, stories.length - (isMobile ? 1 : 3))}
              aria-label="Next story"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div 
          ref={sliderRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onScroll={handleScroll}
          aria-label="Stories carousel"
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            // IMPROVED: Better touch handling on mobile
            touchAction: isMobile ? 'pan-y pan-x' : 'auto'
          }}
        >
          {stories.map((story) => {
            const isVideoPlaying = playingVideos.has(story.id);
            const isVideoMuted = videoMuteStates[story.id] !== false;
            
            return (
              <div 
                key={story.uniqueKey || story.id} 
                className="flex-none w-[300px] snap-start"
              >
                <div 
                  onTouchStart={(e) => handleTouchStart(e, story)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={(e) => handleTouchEnd(e, story)}
                  onClick={(e) => handleStoryClick(e, story)}
                  className="block group cursor-pointer" 
                  aria-label={`Story: ${story.title}`}
                  style={{ 
                    // IMPROVED: Better touch handling
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    touchAction: 'manipulation' // Prevents double-tap zoom
                  }}
                >
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                    {story.video_url ? (
                      <div className="relative w-full h-full">
                        {/* Static image - always visible as background */}
                        <img
                          src={story.image_url || `${API_BASE_URL}/api/placeholder/300/400?text=${encodeURIComponent(story.title || 'Story')}&color=4f46e5`}
                          alt={story.title}
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            isVideoPlaying ? 'opacity-0' : 'opacity-100 group-hover:scale-105'
                          }`}
                          onError={(e) => handleImageError(e, story.id)}
                          loading="lazy"
                          decoding="async"
                        />
                        
                        {/* Video element */}
                        <video
                          ref={(el) => videoRefs.current[story.id] = el}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                            isVideoPlaying ? 'opacity-100' : 'opacity-0'
                          }`}
                          poster={story.image_url}
                          muted={isVideoMuted}
                          playsInline
                          preload="metadata"
                          onError={(e) => handleVideoError(e, story.id)}
                          onEnded={() => stopVideo(story.id)}
                        >
                          <source src={story.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        
                        {/* Play button overlay - shown when video is not playing */}
                        {!isVideoPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/50 rounded-full p-4">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 text-center">
                              <div className="text-white text-xs bg-black/60 rounded px-2 py-1 inline-block">
                                Tap to play video
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Video controls - shown when video is playing */}
                        {isVideoPlaying && (
                          <div className="absolute inset-0">
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                            
                            {/* Top controls */}
                            <div className="absolute top-4 right-4 flex gap-2 z-20">
                              <button
                                onClick={(e) => toggleVideoMute(e, story.id)}
                                className="bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-colors"
                                aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
                              >
                                {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                              </button>
                            </div>
                            
                            {/* Center play/pause button */}
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <button
                                onClick={(e) => togglePlayPause(e, story.id)}
                                className="bg-black/50 rounded-full p-4 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Toggle play/pause"
                              >
                                {videoRefs.current[story.id]?.paused ? 
                                  <Play className="w-8 h-8" /> : 
                                  <Pause className="w-8 h-8" />
                                }
                              </button>
                            </div>
                            
                            {/* Bottom time display */}
                            <div className="absolute bottom-4 left-4 right-4 z-20">
                              <div className="text-white text-sm font-medium bg-black/50 rounded px-3 py-1 inline-block">
                                {formatTime(currentTime[story.id] || 0)} / {formatTime(videoRefs.current[story.id]?.duration || 0)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : story.image_url ? (
                      <div className="relative w-full h-full">
                        <img
                          src={story.image_url}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => handleImageError(e, story.id)}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Content overlay - always visible */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                      <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                        {story.title}
                      </h3>
                      <div className="flex items-center mt-3 text-white/80 text-sm">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {isVideoPlaying ? "Tap again to lire article" : (story.video_url ? "Tap to play video" : "Lire article")}
                      </div>
                      {story.duration && (
                        <div className="flex items-center text-blue-200 mt-1">
                          <Play className="w-4 h-4 mr-2" />
                          <span>{story.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Fixed Ad Banner Container */}
        <div className="w-full">
          <AdBanner position="bottom" page="homepage" />
        </div>
    </section>
  );
};

export default Stories;