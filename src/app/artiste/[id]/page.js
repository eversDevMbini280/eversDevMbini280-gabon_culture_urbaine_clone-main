'use client'
import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import { ArrowLeft, User, Tag, Share2, Music, Video, Mic, Camera, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import Head from 'next/head'
import AdBanner from '@/components/AdBanner'

const ArtisteArticlePage = () => {
  const { id } = useParams()
  const router = useRouter()
  const [artist, setArtist] = useState(null)
  const [relatedArtists, setRelatedArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [urbanCategoryId, setUrbanCategoryId] = useState(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com'
  const sliderRef = useRef(null)
  const videoRef = useRef(null)
  const previewVideoRef = useRef(null)
  const relatedVideoRefs = useRef({})
  const loadedImages = useRef(new Set())
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [videoError, setVideoError] = useState(null)
  const [relatedVideoHover, setRelatedVideoHover] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const [previewVideoError, setPreviewVideoError] = useState(false)
  const STATIC_FALLBACK_IMAGE = '/static/fallback-placeholder.png'

  // Memoized Related Artist Component
  const RelatedArtist = memo(({ artist, apiUrl, handleImageError, onVideoHover, getTypeIcon }) => {
    return (
      <div className="group cursor-pointer snap-start mr-4" style={{ width: artist.isMobile ? 'calc(75vw - 2rem)' : '250px', minWidth: artist.isMobile ? 'calc(75vw - 2rem)' : '250px' }}>
        <Link href={`/artiste/${artist.id}`}>
          <div
            className="rounded-lg overflow-hidden aspect-[2/3] relative"
            onMouseEnter={() => !artist.isMobile && artist.video_url && onVideoHover(artist.id, 'start')}
            onMouseLeave={() => !artist.isMobile && artist.video_url && onVideoHover(artist.id, 'stop')}
            onTouchStart={() => artist.isMobile && artist.video_url && onVideoHover(artist.id, 'start')}
            onTouchEnd={() => artist.isMobile && artist.video_url && onVideoHover(artist.id, 'stop')}
          >
            {artist.video_url ? (
              <div className="relative w-full h-full">
                <img
                  src={artist.image_url || `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(artist.title || 'Artiste')}&color=cf8426`}
                  alt={artist.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => handleImageError(e, artist.id, artist.title, { width: 250, height: 375 })}
                  loading="lazy"
                />
                <video
                  ref={(el) => (relatedVideoRefs.current[artist.id] = el)}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  poster={artist.image_url}
                >
                  <source src={artist.video_url} type="video/mp4" />
                  <source src={artist.video_url.replace('.mp4', '.webm')} type="video/webm" />
                </video>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Play className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            ) : (
              <img
                src={artist.image_url || `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(artist.title || 'Artiste')}&color=cf8426`}
                alt={artist.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => handleImageError(e, artist.id, artist.title, { width: 250, height: 375 })}
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="bg-[#cf8426] text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                {getTypeIcon(artist.Lmusic ? 'music' : artist.Ldance ? 'dance' : artist.Lrap ? 'rap' : artist.Lafrotcham ? 'afrotcham' : 'artist')}
                {(artist.Lmusic ? 'MUSIC' : artist.Ldance ? 'DANCE' : artist.Lrap ? 'RAP' : artist.Lafrotcham ? 'AFROTCHAM' : 'ARTIST').toUpperCase()}
              </span>
            </div>
          </div>
          <h4 className="mt-3 font-semibold text-[#cf8426] group-hover:text-[#b57322] transition line-clamp-2">{artist.title}</h4>
          <p className="text-sm text-gray-500">{artist.role || 'Artist'}</p>
        </Link>
      </div>
    )
  })

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const fetchArtistData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)

      // Fetch categories to find "Culture Urbaine"
      const categoriesRes = await fetch(`${apiUrl}/api/categories/`)
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories')
      const categoriesData = await categoriesRes.json()
      const urbanCategory = categoriesData.find((c) => c.name === 'Culture Urbaine')
      if (!urbanCategory) throw new Error('Culture Urbaine category not found')
      setUrbanCategoryId(urbanCategory.id)

      // Fetch artist by ID
      const artistRes = await fetch(`${apiUrl}/culture_urbaine_articles/${id}`)
      if (!artistRes.ok) {
        const errorData = await artistRes.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Artist not found')
      }
      const artistData = await artistRes.json()
      // Normalize media URLs
      const imageUrl = artistData.image_url
        ? artistData.image_url.startsWith('http') || artistData.image_url.startsWith('//')
          ? artistData.image_url
          : `${apiUrl}${artistData.image_url.startsWith('/') ? artistData.image_url : `/${artistData.image_url}`}`
        : `${apiUrl}/api/placeholder/1200/600?text=${encodeURIComponent(artistData.title || 'Artiste')}&color=cf8426`
      const videoUrl = artistData.video_url
        ? artistData.video_url.startsWith('http') || artistData.video_url.startsWith('//')
          ? artistData.video_url
          : `${apiUrl}${artistData.video_url.startsWith('/') ? artistData.video_url : `/${artistData.video_url}`}`
        : null
      setArtist({ ...artistData, image_url: imageUrl, video_url: videoUrl })

      // Fetch related artists
      const relatedUrl = `${apiUrl}/culture_urbaine_articles/?category_id=${urbanCategory.id}&limit=4&Lmusic=true&Ldance=true&Lafrotcham=true&Lrap=true`
      const relatedRes = await fetch(relatedUrl)
      if (!relatedRes.ok) {
        console.warn('Failed to fetch related artists:', relatedRes.status)
        setRelatedArtists([])
      } else {
        const relatedData = await relatedRes.json()
        const normalizedRelated = relatedData
          .filter((a) => a.id !== parseInt(id)) // Exclude current artist
          .map((a) => ({
            ...a,
            image_url: a.image_url
              ? a.image_url.startsWith('http') || a.image_url.startsWith('//')
                ? a.image_url
                : `${apiUrl}${a.image_url.startsWith('/') ? a.image_url : `/${a.image_url}`}`
              : `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(a.title || 'Artiste')}&color=cf8426`,
            video_url: a.video_url
              ? a.video_url.startsWith('http') || a.video_url.startsWith('//')
                ? a.video_url
                : `${apiUrl}${a.video_url.startsWith('/') ? a.video_url : `/${a.video_url}`}`
              : null,
            isMobile,
            uniqueKey: `related-${a.id}-${Date.now()}`,
            videoRef: relatedVideoRefs,
          }))
        setRelatedArtists(normalizedRelated)
      }
    } catch (err) {
      console.error('Error fetching artist:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, apiUrl])

  useEffect(() => {
    fetchArtistData()
  }, [fetchArtistData])

  // Reset video state when artist changes
  useEffect(() => {
    setVideoPlaying(false)
    setShowVideoModal(false)
    setIsMuted(true)
    setVideoError(null)
    setIsVideoLoading(false)
    setPreviewVideoError(false)
  }, [artist])

  // Main video event listeners
  useEffect(() => {
    if (videoRef.current && artist?.video_url) {
      const video = videoRef.current
      const handleError = () => {
        console.error('Main video error:', video.error?.message)
        setVideoError(video.error?.message || 'Error loading video')
        setIsVideoLoading(false)
      }
      const handleLoadedMetadata = () => {
        console.log('Main video metadata loaded')
        setIsVideoLoading(false)
      }
      const handleCanPlay = () => {
        console.log('Main video can play')
        setIsVideoLoading(false)
      }
      const handleLoadStart = () => {
        console.log('Main video load start')
        setIsVideoLoading(true)
      }
      video.addEventListener('error', handleError)
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('loadstart', handleLoadStart)
      const timeout = setTimeout(() => {
        if (isVideoLoading) {
          console.warn('Video loading timeout')
          setIsVideoLoading(false)
        }
      }, 10000)
      return () => {
        video.removeEventListener('error', handleError)
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('loadstart', handleLoadStart)
        clearTimeout(timeout)
      }
    }
  }, [videoRef.current, artist, isVideoLoading])

  // Preview video event listeners
  useEffect(() => {
    if (previewVideoRef.current && artist?.video_url && !previewVideoError) {
      const video = previewVideoRef.current
      const handleError = () => {
        console.error('Preview video error:', video.error?.message)
        setPreviewVideoError(true)
      }
      const handleLoadedMetadata = () => {
        console.log('Preview video metadata loaded')
        video.play().catch((err) => {
          console.warn('Preview video autoplay failed:', err)
          setPreviewVideoError(true)
        })
      }
      video.addEventListener('error', handleError)
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      return () => {
        video.removeEventListener('error', handleError)
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.pause()
      }
    }
  }, [previewVideoRef.current, artist, previewVideoError])

  // Pause preview video when modal opens
  useEffect(() => {
    if (previewVideoRef.current && showVideoModal) {
      previewVideoRef.current.pause()
    } else if (previewVideoRef.current && !showVideoModal && !previewVideoError) {
      previewVideoRef.current.play().catch((err) => {
        console.warn('Preview video resume failed:', err)
        setPreviewVideoError(true)
      })
    }
  }, [showVideoModal, previewVideoError])

  const handleImageError = useCallback(
    (e, itemId, placeholderText, size = { width: 800, height: 400 }, color = 'cf8426') => {
      const src = e.target.src
      if (loadedImages.current.has(src)) {
        console.log(`Image already processed for item ${itemId}: ${src}`)
        return
      }
      loadedImages.current.add(src)
      if (e.target.dataset.placeholderAttempted === 'static') {
        console.log(`Static fallback already used for item ${itemId}`)
        return
      }
      if (!e.target.dataset.placeholderAttempted) {
        console.log(`Image failed for item ${itemId}: ${src}`)
        const { width, height } = size
        const placeholderUrl = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText)}&color=${color}`
        console.log(`Setting placeholder for item ${itemId}: ${placeholderUrl}`)
        e.target.src = placeholderUrl
        e.target.dataset.placeholderAttempted = 'true'
        e.target.className = `${e.target.className} object-contain bg-gray-200`
        e.target.loading = 'lazy'
      } else {
        console.log(`Placeholder failed for item ${itemId}, using static: ${STATIC_FALLBACK_IMAGE}`)
        e.target.src = STATIC_FALLBACK_IMAGE
        e.target.dataset.placeholderAttempted = 'static'
        e.target.className = `${e.target.className} object-contain bg-gray-200`
        e.target.loading = 'lazy'
      }
    },
    [apiUrl]
  )

  const handleSliderNav = useCallback(
    (direction) => {
      if (!sliderRef.current) return
      const container = sliderRef.current
      const itemsPerView = isMobile ? 1 : 3
      const itemWidth = container.clientWidth / itemsPerView
      const maxSlide = Math.max(0, relatedArtists.length - itemsPerView)
      const newSlide = direction === 'prev' ? Math.max(0, currentSlide - 1) : Math.min(maxSlide, currentSlide + 1)
      container.scrollTo({ left: newSlide * itemWidth, behavior: 'smooth' })
      setCurrentSlide(newSlide)
    },
    [isMobile, relatedArtists.length, currentSlide]
  )

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true)
    setStartX(e.pageX - sliderRef.current.offsetLeft)
    setScrollLeft(sliderRef.current.scrollLeft)
    sliderRef.current.style.cursor = 'grabbing'
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab'
    }
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return
      e.preventDefault()
      const x = e.pageX - sliderRef.current.offsetLeft
      const distance = (x - startX) * 2
      sliderRef.current.scrollLeft = scrollLeft - distance
    },
    [isDragging, startX, scrollLeft]
  )

  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return
    const scrollPosition = sliderRef.current.scrollLeft
    const itemsPerView = isMobile ? 1 : 3
    const itemWidth = sliderRef.current.clientWidth / itemsPerView
    const newSlide = Math.round(scrollPosition / itemWidth)
    const maxSlide = Math.max(0, relatedArtists.length - itemsPerView)
    setCurrentSlide(Math.min(maxSlide, Math.max(0, newSlide)))
  }, [isMobile, relatedArtists.length])

  const getTypeIcon = useCallback((type) => {
    switch (type) {
      case 'music':
        return <Music className="w-4 h-4 mr-1" />
      case 'dance':
        return <Video className="w-4 h-4 mr-1" />
      case 'rap':
        return <Mic className="w-4 h-4 mr-1" />
      case 'afrotcham':
        return <Camera className="w-4 h-4 mr-1" />
      default:
        return <User className="w-4 h-4 mr-1" />
    }
  }, [])

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: artist?.title,
          text: artist?.description?.substring(0, 100) + '...',
          url: window.location.href,
        })
        .catch((err) => console.error('Share failed:', err))
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }, [artist])

  const handleVideoPlay = useCallback(() => {
    if (!videoRef.current || !artist?.video_url) {
      console.warn('Video reference or URL not available')
      return
    }
    setShowVideoModal(true)
    videoRef.current.muted = true
    setIsMuted(true)
    setIsVideoLoading(true)
    videoRef.current
      .play()
      .then(() => {
        setVideoPlaying(true)
        setVideoError(null)
        setIsVideoLoading(false)
      })
      .catch((err) => {
        console.error('Main video play failed:', err)
        setVideoError('Unable to play video. Try again.')
        setIsVideoLoading(false)
      })
  }, [artist])

  const toggleMute = useCallback((e) => {
    e.stopPropagation()
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
    }
  }, [])

  const handleRelatedVideoHover = useCallback(
    (artistId, action) => {
      const videoElement = relatedVideoRefs.current[artistId]
      if (!videoElement) return
      if (action === 'start') {
        if (relatedVideoHover && relatedVideoHover !== artistId) {
          const prevVideo = relatedVideoRefs.current[relatedVideoHover]
          if (prevVideo) {
            prevVideo.pause()
            prevVideo.currentTime = 0
          }
        }
        setRelatedVideoHover(artistId)
        videoElement.muted = true
        videoElement.currentTime = 0
        videoElement.play().catch((err) => {
          console.log('Related video preview failed:', err)
        })
      } else if (action === 'stop') {
        if (relatedVideoHover === artistId) {
          setRelatedVideoHover(null)
        }
        videoElement.pause()
        videoElement.currentTime = 0
      }
    },
    [relatedVideoHover]
  )

  const formatTime = useCallback((timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00'
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const closeVideoModal = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setShowVideoModal(false)
    setVideoPlaying(false)
    setIsVideoLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#cf8426] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }


  const handleBack = useCallback(() => {
    // Navigate to the previous page in history
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to AfroTcham section if no history
      router.push('/#artiste');
    }
  }, [router]);

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-[#cf8426] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#cf8426] mb-4">Artist Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The artist you are looking for does not exist or has been removed.'}</p>
          <button  
          onClick={handleBack}
          className="bg-[#cf8426] text-white px-6 py-2 rounded-lg hover:bg-[#b57322] transition">
            <span className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Culture Urbaine
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{artist.title} | Gabon Culture Urbaine</title>
        <meta name="description" content={artist.description?.substring(0, 0, 160) || 'Artist profile'} />
        <meta property="og:title" content={artist.title} />
        <meta property="og:image" content={artist.image_url} />
        <meta property="og:description" content={artist.description?.substring(0, 160) || 'Artist profile'} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen bg-[#cf8426]">
        <div className="relative h-[50vh] w-full">
          {artist?.video_url && !previewVideoError ? (
            <div className="relative w-full h-full" onClick={handleVideoPlay}>
              <video
                ref={previewVideoRef}
                className="w-full h-full object-cover"
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                poster={artist.image_url}
              >
                <source src={artist.video_url} type="video/mp4" />
                <source src={artist.video_url.replace('.mp4', '.webm')} type="video/webm" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
                <div className="bg-black/50 rounded-full p-4 transform transition-transform hover:scale-110">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full" onClick={artist.video_url ? handleVideoPlay : undefined}>
              <img
                src={artist.image_url || `${apiUrl}/api/placeholder/1200/600?text=${encodeURIComponent(artist.title || 'Artiste')}&color=cf8426`}
                alt={artist.title}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, artist.id, artist.title, { width: 1200, height: 600 })}
                loading="eager"
              />
              {artist.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
                  <div className="bg-black/50 rounded-full p-4 transform transition-transform hover:scale-110">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            </div>
          )}
          <div className="absolute top-4 left-4 z-10">
              <button
              onClick={handleBack}
               className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition">
                <ArrowLeft className="w-6 h-6" />
              </button>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-[#cf8426] text-white text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              {getTypeIcon(artist.Lmusic ? 'music' : artist.Ldance ? 'dance' : artist.Lrap ? 'rap' : artist.Lafrotcham ? 'afrotcham' : 'artist')}
              {(artist.Lmusic ? 'MUSIC' : artist.Ldance ? 'DANCE' : artist.Lrap ? 'RAP' : artist.Lafrotcham ? 'AFROTCHAM' : 'ARTIST').toUpperCase()}
            </span>
          </div>
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{artist.title}</h1>
            <p className="text-white/90 mb-4 line-clamp-2">{artist.description}</p>
            <div className="flex items-center text-white">
              <User className="w-4 h-4 mr-2" />
              <span>{artist.views || 0} views</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto -mt-20 relative z-10 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-4">
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                <span>{artist.role || 'Artist'}</span>
              </div>
              <div className="ml-auto">
                <button onClick={handleShare} className="flex items-center text-[#cf8426] hover:text-[#b57322] transition">
                  <Share2 className="w-4 h-4 mr-1" />
                  <span>Partager</span>
                </button>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#cf8426] mb-4 flex items-center">
                <div className="w-2 h-6 bg-[#e0a76a] mr-3 rounded-full"></div>
                Biographie
              </h2>
              <div className="max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100 hover:scrollbar-thumb-orange-400">
                <div
                  className="prose max-w-none prose-img:rounded-lg text-black"
                  style={{
                    '--tw-prose-links': '#cf8426',
                    '--tw-prose-body': '#000000',
                    '--tw-prose-headings': '#000000',
                    color: '#000000',
                  }}
                  dangerouslySetInnerHTML={{ __html: artist.content || '<p>No biography available.</p>' }}
                />
              </div>
              <div className="flex justify-center mt-4">
                <div className="text-sm font-semibold text-orange-500 flex items-center gap-2">
                  <span>Scroll to read more</span>
                  <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
            {relatedArtists.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-[#cf8426] mb-6 flex items-center">
                  <div className="w-2 h-8 bg-[#e0a76a] mr-3 rounded-full"></div>
                  Artistes similaires
                </h3>
                <div className="flex gap-2 mb-4 justify-center">
                  <button
                    onClick={() => handleSliderNav('prev')}
                    className="p-2 bg-[#cf8426] rounded-lg hover:bg-[#b57322] transition-colors disabled:opacity-50"
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => handleSliderNav('next')}
                    className="p-2 bg-[#cf8426] rounded-lg hover:bg-[#b57322] transition-colors disabled:opacity-50"
                    disabled={currentSlide >= relatedArtists.length - (isMobile ? 1 : 3)}
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="relative">
                  <div
                    ref={sliderRef}
                    className="flex overflow-x-auto pb-6 pl-4 pr-4 md:pr-0 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                    style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onScroll={handleScroll}
                  >
                    {relatedArtists.map((related) => (
                      <RelatedArtist
                        key={related.uniqueKey || related.id}
                        artist={related}
                        apiUrl={apiUrl}
                        handleImageError={handleImageError}
                        onVideoHover={handleRelatedVideoHover}
                        getTypeIcon={getTypeIcon}
                      />
                    ))}
                    {isMobile && (
                      <div className="min-w-[25vw] flex items-center justify-start pr-4">
                        <ChevronRight className="w-6 h-6 text-[#cf8426] animate-pulse" />
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

        {artist?.video_url && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 ${
              showVideoModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closeVideoModal}
          >
            <div className="relative w-full max-w-4xl mx-auto p-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeVideoModal}
                className="absolute -top-10 right-4 text-white hover:text-gray-300 z-20"
                aria-label="Close video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative w-full bg-black rounded-lg overflow-hidden">
                {videoError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white text-center p-6">
                    <p className="mb-4">{videoError}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVideoPlay()
                      }}
                      className="bg-[#cf8426] hover:bg-[#b57322] text-white px-6 py-2 rounded-lg transition"
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
                        className="w-full max-h-[70vh] object-contain"
                        playsInline
                        muted={isMuted}
                        onEnded={() => setVideoPlaying(false)}
                        poster={artist.image_url}
                        preload="metadata"
                        controls={false}
                        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                      >
                        <source src={artist.video_url} type="video/mp4" />
                        <source src={artist.video_url.replace('.mp4', '.webm')} type="video/webm" />
                      </video>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-4 px-4">
                      <div className="flex justify-between text-white text-sm mb-2">
                        <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
                        <span>{formatTime(videoRef.current?.duration || 0)}</span>
                      </div>
                      <div
                        className="w-full bg-gray-600 rounded-full h-2 overflow-hidden cursor-pointer"
                        onClick={(e) => {
                          if (videoRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const pos = (e.clientX - rect.left) / rect.width
                            videoRef.current.currentTime = pos * videoRef.current.duration
                          }
                        }}
                        onTouchStart={(e) => {
                          if (videoRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const pos = (e.touches[0].clientX - rect.left) / rect.width
                            videoRef.current.currentTime = pos * videoRef.current.duration
                          }
                        }}
                      >
                        <div
                          className="bg-[#cf8426] h-full"
                          style={{
                            width: videoRef.current && videoRef.current.duration
                              ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%`
                              : '0%',
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (videoRef.current) {
                              if (videoRef.current.paused) {
                                videoRef.current.play().catch((err) => console.error('Play failed:', err))
                                setVideoPlaying(true)
                              } else {
                                videoRef.current.pause()
                                setVideoPlaying(false)
                              }
                            }
                          }}
                          className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
                          aria-label={videoPlaying ? 'Pause video' : 'Play video'}
                        >
                          {videoPlaying ? (
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                            </svg>
                          ) : (
                            <Play className="w-6 h-6 text-white" />
                          )}
                        </button>
                        <button
                          onClick={toggleMute}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
                            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#cf8426] hover:bg-[#b57322]'
                          }`}
                          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
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

        <div className="h-20"></div>
        <div className="space-y-8">
          <div className="relative">
            <AdBanner position="bottom" page="culture_urbaine" />
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}

export default ArtisteArticlePage