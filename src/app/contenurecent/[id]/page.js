'use client'
import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import { ArrowLeft, Calendar, User, Tag, Share2, Play, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import Head from 'next/head'

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Memoized Related Article Component
const RelatedArticle = memo(({ article, apiUrl, handleImageError, onVideoHover }) => {
  return (
    <Link href={`/contenurecent/${article.id}`} key={article.id}>
      <div
        className="group cursor-pointer snap-start mr-4"
        style={{
          width: article.isMobile ? 'calc(75vw - 2rem)' : '250px',
          minWidth: article.isMobile ? 'calc(75vw - 2rem)' : '250px',
        }}
        onMouseEnter={() => !article.isMobile && article.video_url && onVideoHover(article.id, 'start')}
        onMouseLeave={() => !article.isMobile && article.video_url && onVideoHover(article.id, 'stop')}
        onTouchStart={() => article.isMobile && article.video_url && onVideoHover(article.id, 'start')}
        onTouchEnd={() => article.isMobile && article.video_url && onVideoHover(article.id, 'stop')}
      >
        <div className="rounded-xl overflow-hidden aspect-[2/3] relative">
          {article.video_url ? (
            <div className="relative w-full h-full">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => handleImageError(e, article.id, article.title, { width: 250, height: 375 })}
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
            </div>
          ) : (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => handleImageError(e, article.id, article.title, { width: 250, height: 375 })}
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="bg-[#cf8426] text-white text-xs font-medium px-2 py-1 rounded">{article.category}</span>
          </div>
          {article.duration && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">{article.duration}</div>
          )}
        </div>
        <h4 className="mt-3 font-medium text-[#cf8426] group-hover:text-[#b57322] transition line-clamp-2">{article.title}</h4>
        <p className="text-sm text-gray-500">{article.date}</p>
      </div>
    </Link>
  )
})

const ContenurecentArticlePage = () => {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
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
  const sliderRef = useRef(null)
  const videoRef = useRef(null)
  const previewVideoRef = useRef(null)
  const relatedVideoRefs = useRef({})
  const loadedImages = useRef(new Set())

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Fetch article data
  useEffect(() => {
    if (id) {
      const getArticleData = async () => {
        setLoading(true)
        try {
          // Fetch article by ID
          const articleRes = await fetch(`${apiUrl}/culture_urbaine_articles/${id}`)
          if (!articleRes.ok) {
            const errorData = await articleRes.json().catch(() => ({}))
            throw new Error(errorData.detail || 'Article not found')
          }
          const articleData = await articleRes.json()

          // Fetch author name
          let authorName = 'Inconnu'
          if (articleData.author_id) {
            try {
              const authorRes = await fetch(`${apiUrl}/api/authors/${articleData.author_id}`)
              if (authorRes.ok) {
                const authorData = await authorRes.json()
                authorName = authorData.name || 'Inconnu'
              }
            } catch (err) {
              console.warn(`Failed to fetch author ${articleData.author_id}:`, err)
            }
          }

          // Normalize image_url
          let imageUrl = articleData.image_url || FALLBACK_IMAGE
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//') && imageUrl !== FALLBACK_IMAGE) {
            imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
          }

          // Normalize video_url
          let videoUrl = articleData.video_url
          if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('//')) {
            videoUrl = `${apiUrl}${videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}`
          }

          // Format duration
          let duration = articleData.duration
          if (duration && !isNaN(duration)) {
            const minutes = Math.floor(duration / 60)
            const seconds = Math.floor(duration % 60)
            duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          }

          setArticle({
            ...articleData,
            image_url: imageUrl,
            video_url: videoUrl || null,
            author_name: articleData.author_name || '',
            category: articleData.category?.name || articleData.category || 'Inconnu',
            date: articleData.created_at ? new Date(articleData.created_at).toLocaleDateString('fr-FR') : 'Inconnu',
            author: authorName,
            duration,
          })

          // Fetch related articles
          const filter = searchParams.get('filter')
          let relatedUrl = `${apiUrl}/culture_urbaine_articles/?recent=true&category_id=${articleData.category_id}&limit=4&status=published`
          if (filter === 'afrotcham') {
            relatedUrl += '&Lafrotcham=true'
          }

          const relatedRes = await fetch(relatedUrl)
          if (!relatedRes.ok) {
            console.warn('Failed to fetch related articles:', relatedRes.status)
            setRelatedArticles([])
          } else {
            const relatedData = await relatedRes.json()
            const normalizedRelated = relatedData
              .filter((a) => a.id !== parseInt(id))
              .map((item) => {
                let relatedImageUrl = item.image_url || FALLBACK_IMAGE
                if (relatedImageUrl && !relatedImageUrl.startsWith('http') && !relatedImageUrl.startsWith('//') && relatedImageUrl !== FALLBACK_IMAGE) {
                  relatedImageUrl = `${apiUrl}${relatedImageUrl.startsWith('/') ? relatedImageUrl : `/${relatedImageUrl}`}`
                }

                let relatedVideoUrl = item.video_url
                if (relatedVideoUrl && !relatedVideoUrl.startsWith('http') && !relatedVideoUrl.startsWith('//')) {
                  relatedVideoUrl = `${apiUrl}${relatedVideoUrl.startsWith('/') ? relatedVideoUrl : `/${relatedVideoUrl}`}`
                }

                let relatedDuration = item.duration
                if (relatedDuration && !isNaN(relatedDuration)) {
                  const minutes = Math.floor(relatedDuration / 60)
                  const seconds = Math.floor(relatedDuration % 60)
                  relatedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                }

                return {
                  ...item,
                  image_url: relatedImageUrl,
                  video_url: relatedVideoUrl || null,
                  category: item.category?.name || item.category || 'Inconnu',
                  date: item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : 'Inconnu',
                  duration: relatedDuration,
                  isMobile,
                  uniqueKey: `related-${item.id}-${Date.now()}`,
                  videoRef: relatedVideoRefs,
                }
              })
            setRelatedArticles(normalizedRelated)
          }
        } catch (error) {
          console.error('Error fetching article:', error)
          setArticle(null)
        } finally {
          setLoading(false)
        }
      }
      getArticleData()
    }
  }, [id, apiUrl, isMobile, searchParams])

  // Handle image errors
  const handleImageError = useCallback((e, id, title = 'Image', dimensions = { width: 1200, height: 600 }) => {
    if (loadedImages.current.has(id)) return
    loadedImages.current.add(id)
    console.warn(`Image load failed for ${title} (ID: ${id}): ${e.target.src}`)
    e.target.src = `${apiUrl}/api/placeholder/${dimensions.width}/${dimensions.height}?text=${encodeURIComponent(title)}&color=cf8426`
    e.target.className = `${e.target.className} object-contain bg-gray-200`
    e.target.loading = 'lazy'
  }, [apiUrl])

  // Handle video hover for related articles
  const handleVideoHover = useCallback((articleId, action) => {
    const video = relatedVideoRefs.current[articleId]
    if (!video) return
    try {
      if (action === 'start') {
        video.play().catch((err) => console.warn(`Video play failed for related article ${articleId}:`, err))
        setRelatedVideoHover(articleId)
      } else {
        video.pause()
        video.currentTime = 0
        setRelatedVideoHover(null)
      }
    } catch (err) {
      console.error(`Error handling video hover for article ${articleId}:`, err)
    }
  }, [])

  // Handle slider navigation
  const handleSliderNav = (direction) => {
    if (!sliderRef.current) return
    const container = sliderRef.current
    const itemsPerView = isMobile ? 1 : 3
    const itemWidth = container.clientWidth / itemsPerView
    const maxSlide = Math.max(0, relatedArticles.length - itemsPerView)
    let newSlide = currentSlide + (direction === 'next' ? 1 : -1)
    newSlide = Math.min(Math.max(newSlide, 0), maxSlide)
    container.scrollTo({ left: newSlide * itemWidth, behavior: 'smooth' })
    setCurrentSlide(newSlide)
  }

  // Handle drag for slider
  const handleDragStart = (e) => {
    if (!sliderRef.current) return
    setIsDragging(true)
    setStartX(isMobile ? e.touches[0].pageX : e.pageX)
    setScrollLeft(sliderRef.current.scrollLeft)
  }

  const handleDragMove = (e) => {
    if (!isDragging || !sliderRef.current) return
    e.preventDefault()
    const x = isMobile ? e.touches[0].pageX : e.pageX
    const walk = (x - startX) * 2
    sliderRef.current.scrollLeft = scrollLeft - walk
  }

  const handleDragEnd = () => {
    if (!sliderRef.current) return
    setIsDragging(false)
    const itemsPerView = isMobile ? 1 : 3
    const itemWidth = sliderRef.current.clientWidth / itemsPerView
    const newSlide = Math.round(sliderRef.current.scrollLeft / itemWidth)
    sliderRef.current.scrollTo({ left: newSlide * itemWidth, behavior: 'smooth' })
    setCurrentSlide(newSlide)
  }

  // Handle video playback
  const handleVideoPlay = () => {
    if (!videoRef.current || !article?.video_url) return
    setShowVideoModal(true)
    videoRef.current.muted = true
    setIsMuted(true)
    setIsVideoLoading(true)
    videoRef.current.play().then(() => {
      setVideoPlaying(true)
      setVideoError(null)
      setIsVideoLoading(false)
    }).catch((err) => {
      console.error('Main video play failed:', err)
      setVideoError('Unable to play video. Try again.')
      setIsVideoLoading(false)
    })
  }

  // Toggle mute
  const toggleMute = (e) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  // Format time
  const formatTime = (time) => {
    if (isNaN(time)) return '00:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Close video modal
  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setShowVideoModal(false)
    setVideoPlaying(false)
    setIsVideoLoading(false)
  }

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.description?.substring(0, 100) + '...',
        url: window.location.href,
      }).catch((err) => console.error('Share failed:', err))
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  // Video event listeners
  useEffect(() => {
    if (videoRef.current && article?.video_url) {
      const video = videoRef.current
      const handleError = () => {
        setVideoError(video.error?.message || 'Error loading video')
        setIsVideoLoading(false)
      }
      const handleLoadedMetadata = () => {
        setIsVideoLoading(false)
      }
      const handleCanPlay = () => {
        setIsVideoLoading(false)
      }
      const handleLoadStart = () => {
        setIsVideoLoading(true)
      }
      video.addEventListener('error', handleError)
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('loadstart', handleLoadStart)
      return () => {
        video.removeEventListener('error', handleError)
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('loadstart', handleLoadStart)
      }
    }
  }, [videoRef.current, article])

  // Preview video event listeners
  useEffect(() => {
    if (previewVideoRef.current && article?.video_url && !previewVideoError) {
      const video = previewVideoRef.current
      const handleError = () => {
        setPreviewVideoError(true)
      }
      const handleLoadedMetadata = () => {
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
  }, [previewVideoRef.current, article, previewVideoError])

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

  const handleBack = useCallback(() => {
    // Navigate to the previous page in history
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to AfroTcham section if no history
      router.push('/#contenurecent');
    }
  }, [router]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#cf8426] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#cf8426] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#cf8426] mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you are looking for does not exist or has been removed.</p>
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
        <title>{article.title} | Gabon Culture Urbaine</title>
        <meta name="description" content={article.description?.substring(0, 160) || 'Article'} />
        <meta property="og:title" content={article.title} />
        <meta property="og:image" content={article.image_url} />
        <meta property="og:description" content={article.description?.substring(0, 160) || 'Article'} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen bg-[#cf8426]">
        <div className="relative h-[50vh] w-full">
          {article.video_url && !previewVideoError ? (
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
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, article.id, article.title)}
                loading="eager"
              />
              {article.video_url && (
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
            <span className="bg-[#cf8426] text-white text-sm font-medium px-3 py-1 rounded-full">{article.category}</span>
          </div>
          <div className="absolute bottom-8 left-8 right-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{article.title}</h1>
            <p className="text-white/90 mb-4">{article.description}</p>
            <div className="flex items-center text-white">
              <User className="w-4 h-4 mr-2" />
              <span>{article.author}</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto -mt-20 relative z-10 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-y-2">
              <div className="flex items-center mr-6">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center mr-6">
                <Tag className="w-4 h-4 mr-2" />
                <span>{article.category}</span>
              </div>
              <div className="ml-auto">
                <button onClick={handleShare} className="flex items-center text-[#cf8426] hover:text-[#b57322]">
                  <Share2 className="w-4 h-4 mr-1" />
                  <span>Partager</span>
                </button>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#cf8426] mb-4 flex items-center">
                <div className="w-2 h-6 bg-[#e0a76a] mr-3 rounded-full"></div>Contenu
              </h2>
              <div
                className="max-h-96 md:max-h-[500px] overflow-y-auto overflow-x-hidden pr-4 scrollbar-thin scrollbar-thumb-[#cf8426] scrollbar-track-gray-100 hover:scrollbar-thumb-[#b57322]"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cf8426 #f3f4f6'
                }}
              >
                <div
                  className="prose max-w-none prose-img:rounded-xl text-black prose-p:text-base prose-p:leading-relaxed prose-h1:text-[#cf8426] prose-h2:text-[#cf8426] prose-h3:text-[#cf8426]"
                  style={{
                    '--tw-prose-links': '#cf8426',
                    '--tw-prose-body': '#000000',
                    '--tw-prose-headings': '#000000',
                    color: '#000000',
                    WebkitTextFillColor: 'initial'
                  }}
                >
                  <div
                    className="article-content text-black leading-relaxed"
                    style={{ color: '#000000', lineHeight: '1.7' }}
                    dangerouslySetInnerHTML={{ __html: article.content || '<p>No content available.</p>' }}
                  />
                </div>
              </div>
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
                <h3 className="text-xl font-bold text-[#cf8426] mb-6 flex items-center">
                  <div className="w-2 h-8 bg-[#e0a76a] mr-3 rounded-full"></div>Articles similaires
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSliderNav('prev')}
                    className="p-2 bg-[#cf8426] rounded-lg hover:bg-[#b57322] transition-colors"
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => handleSliderNav('next')}
                    className="p-2 bg-[#cf8426] rounded-lg hover:bg-[#b57322] transition-colors"
                    disabled={currentSlide >= relatedArticles.length - (isMobile ? 1 : 3)}
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="relative">
                  <div
                    ref={sliderRef}
                    className="flex overflow-x-auto pb-6 pl-4 pr-4 md:pr-0 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                    style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                  >
                    {relatedArticles.map((related) => (
                      <RelatedArticle
                        key={related.uniqueKey || related.id}
                        article={related}
                        apiUrl={apiUrl}
                        handleImageError={handleImageError}
                        onVideoHover={handleVideoHover}
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

        {article.video_url && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 ${showVideoModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            onClick={closeVideoModal}
          >
            <div className="relative w-full max-w-4xl mx-auto p-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeVideoModal}
                className="absolute -top-10 right-4 text-white hover:text-gray-300 z-10"
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
              <div className="relative w-full bg-black rounded-lg overflow-hidden flex justify-center">
                {videoError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white text-center p-6">
                    <p className="mb-4">{videoError}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVideoPlay()
                      }}
                      className="bg-[#cf8426] hover:bg-[#b57322] text-white px-6 py-3 rounded-lg transition"
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
                        poster={article.image_url}
                        preload="metadata"
                        controls={false}
                        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                      >
                        <source src={article.video_url} type="video/mp4" />
                        <source src={article.video_url.replace('.mp4', '.webm')} type="video/webm" />
                      </video>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-4 px-4">
                      <div className="flex justify-between text-white text-sm mb-1">
                        <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
                        <span>{formatTime(videoRef.current?.duration || 0)}</span>
                      </div>
                      <div
                        className="mt-2 w-full bg-gray-600 rounded-full h-2 overflow-hidden cursor-pointer"
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
                      <div className="flex items-center justify-between mt-2">
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
                          aria-label={videoPlaying ? 'Pause' : 'Play'}
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
                          className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#cf8426] hover:bg-[#b57322]'
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

        <div className="h-20"></div>
        <div className="space-y-8">
          <div className="relative">
            <img
              src={`${apiUrl}/api/images/pub-banner.jpg`}
              alt="Publicité"
              className="w-full h-full object-contain"
              onError={(e) => handleImageError(e, 'pub-banner', 'Espace publicitaire disponible', { width: 1200, height: 80 })}
              loading="lazy"
            />
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}

export default ContenurecentArticlePage