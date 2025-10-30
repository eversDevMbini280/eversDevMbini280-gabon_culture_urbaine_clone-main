// 'use client'
// import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
// import { ArrowLeft, Calendar, User, Tag, Share2, Atom, Beaker, Play, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react'
// import Link from 'next/link'
// import { useParams, useRouter } from 'next/navigation'
// import Footer from '@/components/Footer'
// import Head from 'next/head'

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

// const sections = [
//   { name: 'Toutes', value: null },
//   { name: 'Science', value: 'science' },
//   { name: 'Technologie', value: 'technologie' },
//   { name: 'Innovation', value: 'innovation' },
//   { name: 'Recherche', value: 'recherche' },
//   { name: 'Développement Durable', value: 'developpement_durable' },
//   { name: 'Biotechnologie', value: 'biotechnologie' },
//   { name: 'Intelligence Artificielle', value: 'intelligence_artificielle' },
//   { name: 'Santé Numérique', value: 'sante_numerique' },
// ]

// // Memoized Related Article Component
// const RelatedArticle = memo(({ article, apiUrl, handleImageError, onVideoHover }) => {
//   return (
//     <Link href={`/tech/${article.id}`}>
//       <div
//         className="group cursor-pointer snap-start mr-4"
//         style={{
//           width: article.isMobile ? 'calc(75vw - 2rem)' : '250px',
//           minWidth: article.isMobile ? 'calc(75vw - 2rem)' : '250px',
//         }}
//         onMouseEnter={() => !article.isMobile && article.video_url && onVideoHover(article.id, 'start')}
//         onMouseLeave={() => !article.isMobile && article.video_url && onVideoHover(article.id, 'stop')}
//         onTouchStart={() => article.isMobile && article.video_url && onVideoHover(article.id, 'start')}
//         onTouchEnd={() => article.isMobile && article.video_url && onVideoHover(article.id, 'stop')}
//       >
//         <div className="rounded-xl overflow-hidden aspect-[2/3] relative">
//           {article.video_url ? (
//             <div className="relative w-full h-full">
//               <img
//                 src={
//                   article.image ||
//                   `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(article.title || 'Article')}&color=162146`
//                 }
//                 alt={article.title}
//                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                 onError={(e) => handleImageError(e, article.id, article.title, { width: 250, height: 375 })}
//                 loading="lazy"
//               />
//               <video
//                 ref={(el) => (article.videoRef.current[article.id] = el)}
//                 className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                 muted
//                 playsInline
//                 loop
//                 preload="metadata"
//                 poster={article.image}
//               >
//                 <source src={article.video_url} type="video/mp4" />
//                 <source src={article.video_url.replace('.mp4', '.webm')} type="video/webm" />
//               </video>
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <Play className="w-8 h-8 text-white opacity-80" />
//               </div>
//             </div>
//           ) : (
//             <img
//               src={
//                 article.image ||
//                 `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(article.title || 'Article')}&color=162146`
//               }
//               alt={article.title}
//               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//               onError={(e) => handleImageError(e, article.id, article.title, { width: 250, height: 375 })}
//               loading="lazy"
//             />
//           )}
//           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
//           <div className="absolute bottom-4 left-4">
//             <span className="bg-[#162146] text-white text-xs font-medium px-2 py-1 rounded">{article.category}</span>
//           </div>
//         </div>
//         <h4 className="mt-3 font-medium text-[#162146] group-hover:text-[#0e172e] transition line-clamp-2">{article.title}</h4>
//         <p className="text-sm text-gray-500">{article.date}</p>
//       </div>
//     </Link>
//   )
// })

// const TechArticlePage = () => {
//   const { id } = useParams()
//   const router = useRouter()
//   const [article, setArticle] = useState(null)
//   const [relatedArticles, setRelatedArticles] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const sliderRef = useRef(null)
//   const videoRef = useRef(null)
//   const previewVideoRef = useRef(null)
//   const relatedVideoRefs = useRef({})
//   const loadedImages = useRef(new Set())
//   const [currentSlide, setCurrentSlide] = useState(0)
//   const [isMobile, setIsMobile] = useState(false)
//   const [isDragging, setIsDragging] = useState(false)
//   const [startX, setStartX] = useState(0)
//   const [scrollLeft, setScrollLeft] = useState(0)
//   const [videoPlaying, setVideoPlaying] = useState(false)
//   const [isMuted, setIsMuted] = useState(true)
//   const [videoError, setVideoError] = useState(null)
//   const [relatedVideoHover, setRelatedVideoHover] = useState(null)
//   const [showVideoModal, setShowVideoModal] = useState(false)
//   const [currentTime, setCurrentTime] = useState(0)
//   const [isVideoLoading, setIsVideoLoading] = useState(false)
//   const [previewVideoError, setPreviewVideoError] = useState(false)

//   const handleImageError = useCallback(
//     (e, articleId, placeholderText, size = { width: 800, height: 300 }, color = '162146') => {
//       const src = e.target.src
//       if (!loadedImages.current.has(src)) {
//         console.warn(`Image failed to load for article ${articleId}:`, src)
//         loadedImages.current.add(src)
//         const { width, height } = size
//         e.target.src = `${API_BASE_URL}/api/placeholder/${width}/${height}?text=${encodeURIComponent(
//           placeholderText || 'Article'
//         )}&color=${color}`
//         e.target.className = `${e.target.className} object-contain`
//       }
//     },
//     []
//   )

//   useEffect(() => {
//     const checkIfMobile = () => {
//       setIsMobile(window.innerWidth < 768)
//     }
//     checkIfMobile()
//     window.addEventListener('resize', checkIfMobile)
//     return () => {
//       window.removeEventListener('resize', checkIfMobile)
//     }
//   }, [])

//   const stripHtml = useCallback((html) => {
//     return html.replace(/<[^>]+>/g, '').trim()
//   }, [])

//   const getArticleData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Fetch main article
//       const articleResponse = await fetch(`${API_BASE_URL}/api/science-articles/${id}`);
//       if (!articleResponse.ok) {
//         throw new Error(`Failed to fetch article: ${articleResponse.status} ${articleResponse.statusText}`);
//       }
//       const articleData = await articleResponse.json();
  
//       const date = new Date(articleData.created_at).toLocaleDateString('fr-FR', {
//         day: '2-digit',
//         month: 'long',
//         year: 'numeric',
//       });
  
//       // Use category.name or fallback to science_section mapped name
//       const sectionName = articleData.category?.name || 
//         (articleData.science_section
//           ? sections.find((section) => section.value === articleData.science_section)?.name || articleData.science_section
//           : 'Inconnu');
  
//       // Normalize image_url
//       let imageUrl = articleData.image_url;
//       if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
//         imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
//       } else if (!imageUrl) {
//         imageUrl = `${API_BASE_URL}/api/placeholder/1200/600?text=${encodeURIComponent(articleData.title || 'Article')}&color=162146`;
//       }
  
//       let videoUrl = articleData.video_url;
//       if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('//')) {
//         videoUrl = `${API_BASE_URL}${videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}`;
//       }
  
//       // Fetch related articles by science_section
//       let relatedParams = new URLSearchParams({
//         status: 'published',
//         limit: '3',
//         science_section: articleData.science_section || '',
//         exclude: id.toString()
//       });
  
//       let relatedResponse = await fetch(
//         `${API_BASE_URL}/api/science-articles/?${relatedParams.toString()}`,
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         }
//       );
  
//       let relatedData = [];
//       if (relatedResponse.ok) {
//         relatedData = await relatedResponse.json();
//       }
  
//       // Fallback: If no related articles, try by category_id
//       if (!relatedData.length && articleData.category_id) {
//         relatedParams = new URLSearchParams({
//           status: 'published',
//           limit: '3',
//           category_id: articleData.category_id.toString(),
//           exclude: id.toString()
//         });
//         relatedResponse = await fetch(
//           `${API_BASE_URL}/api/science-articles/?${relatedParams.toString()}`,
//           {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//             }
//           }
//         );
//         if (relatedResponse.ok) {
//           relatedData = await relatedResponse.json();
//         }
//       }
  
//       // Final fallback: Any published articles
//       if (!relatedData.length) {
//         relatedParams = new URLSearchParams({
//           status: 'published',
//           limit: '3',
//           exclude: id.toString()
//         });
//         relatedResponse = await fetch(
//           `${API_BASE_URL}/api/science-articles/?${relatedParams.toString()}`,
//           {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//             }
//           }
//         );
//         if (relatedResponse.ok) {
//           relatedData = await relatedResponse.json();
//         }
//       }
  
//       const processedRelated = relatedData.map((rel) => {
//         const relDate = new Date(rel.created_at).toLocaleDateString('fr-FR', {
//           day: '2-digit',
//           month: 'long',
//           year: 'numeric',
//         });
  
//         // Use category.name or fallback to science_section mapped name
//         const relSectionName = rel.category?.name || 
//           (rel.science_section
//             ? sections.find((section) => section.value === rel.science_section)?.name || rel.science_section
//             : 'Inconnu');
  
//         let relImageUrl = rel.image_url;
//         if (relImageUrl && !relImageUrl.startsWith('http') && !relImageUrl.startsWith('//')) {
//           relImageUrl = `${API_BASE_URL}${relImageUrl.startsWith('/') ? relImageUrl : `/${relImageUrl}`}`;
//         } else if (!relImageUrl) {
//           relImageUrl = `${API_BASE_URL}/api/placeholder/250/375?text=${encodeURIComponent(rel.title || 'Article')}&color=162146`;
//         }
  
//         let relVideoUrl = rel.video_url;
//         if (relVideoUrl && !relVideoUrl.startsWith('http') && !relVideoUrl.startsWith('//')) {
//           relVideoUrl = `${API_BASE_URL}${relVideoUrl.startsWith('/') ? relVideoUrl : `/${relVideoUrl}`}`;
//         }
  
//         return {
//           id: rel.id,
//           title: rel.title,
//           category: relSectionName,
//           author: rel.author_name || rel.author_username || 'Inconnu',
//           date: relDate,
//           image: relImageUrl,
//           video_url: relVideoUrl || null,
//           isMobile,
//           uniqueKey: `related-${rel.id}-${Date.now()}`,
//           videoRef: relatedVideoRefs,
//         };
//       });
  
//       setArticle({
//         id: articleData.id,
//         title: articleData.title,
//         content: articleData.content,
//         category: sectionName,
//         author: articleData.author_name || articleData.author_username || 'Inconnu',
//         date,
//         image: imageUrl,
//         video_url: videoUrl || null,
//       });
  
//       setRelatedArticles(processedRelated);
//     } catch (err) {
//       console.error('Error fetching article:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [id, isMobile]);

//   useEffect(() => {
//     if (id) {
//       getArticleData()
//     }
//   }, [id, getArticleData])

//   // Reset video state when article changes
//   useEffect(() => {
//     setVideoPlaying(false)
//     setShowVideoModal(false)
//     setIsMuted(true)
//     setVideoError(null)
//     setIsVideoLoading(false)
//     setPreviewVideoError(false)
//   }, [article])

//   // Main video event listeners
//   useEffect(() => {
//     if (videoRef.current && article?.video_url) {
//       const video = videoRef.current

//       const handleError = () => {
//         console.error('Main video error:', video.error)
//         setVideoError(video.error?.message || 'Error loading video')
//         setIsVideoLoading(false)
//       }

//       const handleLoadedMetadata = () => {
//         console.log('Main video metadata loaded')
//         setIsVideoLoading(false)
//       }

//       const handleCanPlay = () => {
//         console.log('Main video can play')
//         setIsVideoLoading(false)
//       }

//       const handleLoadStart = () => {
//         console.log('Main video load start')
//         setIsVideoLoading(true)
//       }

//       video.addEventListener('error', handleError)
//       video.addEventListener('loadedmetadata', handleLoadedMetadata)
//       video.addEventListener('canplay', handleCanPlay)
//       video.addEventListener('loadstart', handleLoadStart)

//       const timeout = setTimeout(() => {
//         if (isVideoLoading) {
//           console.warn('Video loading timeout')
//           setIsVideoLoading(false)
//         }
//       }, 10000)

//       return () => {
//         video.removeEventListener('error', handleError)
//         video.removeEventListener('loadedmetadata', handleLoadedMetadata)
//         video.removeEventListener('canplay', handleCanPlay)
//         video.removeEventListener('loadstart', handleLoadStart)
//         clearTimeout(timeout)
//       }
//     }
//   }, [videoRef.current, article, isVideoLoading])

//   // Preview video event listeners
//   useEffect(() => {
//     if (previewVideoRef.current && article?.video_url && !previewVideoError) {
//       const video = previewVideoRef.current

//       const handleError = () => {
//         console.error('Preview video error:', video.error)
//         setPreviewVideoError(true)
//       }

//       const handleLoadedMetadata = () => {
//         console.log('Preview video metadata loaded')
//         video.play().catch((err) => {
//           console.warn('Preview video autoplay failed:', err)
//           setPreviewVideoError(true)
//         })
//       }

//       video.addEventListener('error', handleError)
//       video.addEventListener('loadedmetadata', handleLoadedMetadata)

//       return () => {
//         video.removeEventListener('error', handleError)
//         video.removeEventListener('loadedmetadata', handleLoadedMetadata)
//         video.pause()
//       }
//     }
//   }, [previewVideoRef.current, article, previewVideoError])

//   // Pause preview video when modal opens
//   useEffect(() => {
//     if (previewVideoRef.current && showVideoModal) {
//       previewVideoRef.current.pause()
//     } else if (previewVideoRef.current && !showVideoModal && !previewVideoError) {
//       previewVideoRef.current.play().catch((err) => {
//         console.warn('Preview video resume failed:', err)
//         setPreviewVideoError(true)
//       })
//     }
//   }, [showVideoModal, previewVideoError])

//   // Video play handler
//   const handleVideoPlay = useCallback(() => {
//     if (!videoRef.current || !article?.video_url) {
//       console.warn('Video reference or URL not available')
//       return
//     }

//     setShowVideoModal(true)
//     videoRef.current.muted = true
//     setIsMuted(true)
//     setIsVideoLoading(true)

//     videoRef.current
//       .play()
//       .then(() => {
//         setVideoPlaying(true)
//         setVideoError(null)
//         setIsVideoLoading(false)
//       })
//       .catch((err) => {
//         console.error('Main video play failed:', err)
//         setVideoError('Unable to play video. Try again.')
//         setIsVideoLoading(false)
//       })
//   }, [article])

//   // Mute toggle handler
//   const toggleMute = useCallback((e) => {
//     e.stopPropagation()
//     if (videoRef.current) {
//       const newMutedState = !videoRef.current.muted
//       videoRef.current.muted = newMutedState
//       setIsMuted(newMutedState)
//     }
//   }, [])

//   // Related video hover handler
//   const handleRelatedVideoHover = useCallback(
//     (articleId, action) => {
//       const videoElement = relatedVideoRefs.current[articleId]
//       if (!videoElement) return

//       if (action === 'start') {
//         if (relatedVideoHover && relatedVideoHover !== articleId) {
//           const prevVideo = relatedVideoRefs.current[relatedVideoHover]
//           if (prevVideo) {
//             prevVideo.pause()
//             prevVideo.currentTime = 0
//           }
//         }

//         setRelatedVideoHover(articleId)
//         videoElement.muted = true
//         videoElement.currentTime = 0

//         videoElement.play().catch((err) => {
//           console.log('Related video preview failed:', err)
//         })
//       } else if (action === 'stop') {
//         if (relatedVideoHover === articleId) {
//           setRelatedVideoHover(null)
//         }
//         videoElement.pause()
//         videoElement.currentTime = 0
//       }
//     },
//     [relatedVideoHover]
//   )

//   // Format time for video
//   const formatTime = useCallback((timeInSeconds) => {
//     if (isNaN(timeInSeconds)) return '00:00'
//     const minutes = Math.floor(timeInSeconds / 60)
//     const seconds = Math.floor(timeInSeconds % 60)
//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
//   }, [])

//   // Share handler
//   const handleShare = useCallback(() => {
//     if (navigator.share) {
//       navigator
//         .share({
//           title: article?.title,
//           text: stripHtml(article?.content).substring(0, 100) + '...',
//           url: window.location.href,
//         })
//         .catch((err) => console.error('Share failed:', err))
//     } else {
//       navigator.clipboard.writeText(window.location.href)
//       alert('Link copied to clipboard!')
//     }
//   }, [article, stripHtml])

//   // Close video modal
//   const closeVideoModal = useCallback(() => {
//     if (videoRef.current) {
//       videoRef.current.pause()
//     }
//     setShowVideoModal(false)
//     setVideoPlaying(false)
//     setIsVideoLoading(false)
//   }, [])

//   const maxPossibleSlide = relatedArticles.length - (isMobile ? 1 : 3)

//   const handlePrev = useCallback(() => {
//     const newSlide = Math.max(0, currentSlide - 1)
//     setCurrentSlide(newSlide)
//     if (sliderRef.current) {
//       const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3)
//       sliderRef.current.scrollTo({
//         left: newSlide * itemWidth,
//         behavior: 'smooth',
//       })
//     }
//   }, [isMobile])

//   const handleNext = useCallback(() => {
//     const newSlide = Math.min(maxPossibleSlide, currentSlide + 1)
//     setCurrentSlide(newSlide)
//     if (sliderRef.current) {
//       const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3)
//       sliderRef.current.scrollTo({
//         left: newSlide * itemWidth,
//         behavior: 'smooth',
//       })
//     }
//   }, [isMobile, maxPossibleSlide, currentSlide])

//   const handleMouseDown = useCallback((e) => {
//     setIsDragging(true)
//     setStartX(e.pageX - sliderRef.current.offsetLeft)
//     setScrollLeft(sliderRef.current.scrollLeft)
//     sliderRef.current.style.cursor = 'grabbing'
//   }, [])

//   const handleMouseUp = useCallback(() => {
//     setIsDragging(false)
//     if (sliderRef.current) {
//       sliderRef.current.style.cursor = 'grab'
//     }
//   }, [])

//   const handleMouseMove = useCallback(
//     (e) => {
//       if (!isDragging) return
//       e.preventDefault()
//       const x = e.pageX - sliderRef.current.offsetLeft
//       const distance = (x - startX) * 2
//       sliderRef.current.scrollLeft = scrollLeft - distance
//     },
//     [isDragging, startX, scrollLeft]
//   )

//   const handleScroll = useCallback(() => {
//     if (!sliderRef.current) return
//     const scrollPosition = sliderRef.current.scrollLeft
//     const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3)
//     const newSlide = Math.round(scrollPosition / itemWidth)
//     setCurrentSlide(Math.min(maxPossibleSlide, Math.max(0, newSlide)))
//   }, [isMobile, maxPossibleSlide])

//   if (loading || !id) {
//     return (
//       <div className="min-h-screen bg-[#162146] flex items-center justify-center">
//         <div className="bg-white p-8 rounded-xl shadow-xl">
//           <div className="animate-pulse flex flex-col items-center">
//             <div className="h-6 w-40 bg-blue-200 rounded mb-4"></div>
//             <div className="h-4 w-60 bg-blue-200 rounded"></div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (error || !article) {
//     return (
//       <div className="min-h-screen bg-[#162146] flex items-center justify-center p-4">
//         <div className="bg-white p-8 rounded-xl shadow-xl text-center">
//           <div className="flex justify-center mb-4">
//             <Atom className="w-10 h-10 text-[#162146]" />
//           </div>
//           <h1 className="text-2xl font-bold text-[#162146] mb-4">Article non trouvé</h1>
//           <p className="text-gray-600 mb-6">L'article scientifique que vous recherchez n'existe pas ou a été déplacé.</p>
//           <Link href="/sciences" className="bg-[#162146] text-white px-6 py-2 rounded-lg hover:bg-[#0e172e] transition">
//             <span className="flex items-center">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Retour aux sciences
//             </span>
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
//       <Head>
//         <title>{article.title} | Gabon Culture Urbaine</title>
//         <meta name="description" content={stripHtml(article.content).substring(0, 160)} />
//         <meta property="og:title" content={article.title} />
//         <meta property="og:image" content={article.image} />
//         <meta property="og:description" content={stripHtml(article.content).substring(0, 160)} />
//         <meta name="twitter:card" content="summary_large_image" />
//       </Head>
//       <div className="min-h-screen bg-[#162146]">
//         <div className="relative h-[50vh] w-full">
//           {article?.video_url && !previewVideoError ? (
//             <div className="relative w-full h-full" onClick={handleVideoPlay}>
//               <video
//                 ref={previewVideoRef}
//                 className="w-full h-full object-cover"
//                 muted
//                 autoPlay
//                 loop
//                 playsInline
//                 preload="metadata"
//                 poster={article.image}
//               >
//                 <source src={article.video_url} type="video/mp4" />
//                 <source src={article.video_url.replace('.mp4', '.webm')} type="video/webm" />
//               </video>
//               <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
//                 <div className="bg-black/50 rounded-full p-4 transform transition-transform hover:scale-110">
//                   <Play className="w-12 h-12 text-white" />
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="relative w-full h-full" onClick={article.video_url ? handleVideoPlay : undefined}>
//               <img
//                 src={article.image || `${API_BASE_URL}/api/placeholder/1200/600?text=${encodeURIComponent(article.title || 'Article')}&color=162146`}
//                 alt={article.title}
//                 className="w-full h-full object-cover"
//                 onError={(e) => handleImageError(e, article.id, article.title, { width: 1200, height: 600 })}
//                 loading="eager"
//               />
//               {article.video_url && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10">
//                   <div className="bg-black/50 rounded-full p-4 transform transition-transform hover:scale-110">
//                     <Play className="w-12 h-12 text-white" />
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
//           <div className="absolute top-4 left-4 z-10">
//             <Link href="/sciences">
//               <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition">
//                 <ArrowLeft className="w-6 h-6" />
//               </button>
//             </Link>
//           </div>
//           <div className="absolute top-4 right-4 z-10">
//             <span className="bg-[#162146] text-white text-sm font-medium px-3 py-1 rounded-full">{article.category}</span>
//           </div>
//         </div>

//         <div className="max-w-4xl mx-auto -mt-20 relative z-10 px-4">
//           <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
//             <h1 className="text-2xl md:text-3xl font-bold text-[#162146] mb-4">{article.title}</h1>
//             <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-y-2">
//               <div className="flex items-center mr-6">
//                 <User className="w-4 h-4 mr-2" />
//                 <span>{article.author}</span>
//               </div>
//               <div className="flex items-center mr-6">
//                 <Calendar className="w-4 h-4 mr-2" />
//                 <span>{article.date}</span>
//               </div>
//               <div className="flex items-center">
//                 <Tag className="w-4 h-4 mr-2" />
//                 <span>{article.category}</span>
//               </div>
//               <div className="ml-auto">
//                 <button onClick={handleShare} className="flex items-center text-[#162146] hover:text-[#0e172e]">
//                   <Share2 className="w-4 h-4 mr-1" />
//                   <span>Partager</span>
//                 </button>
//               </div>
//             </div>
//             <div
//               className="prose max-w-none prose-img:rounded-xl text-black"
//               style={{
//                 '--tw-prose-links': '#162146',
//                 '--tw-prose-body': '#000000',
//                 '--tw-prose-headings': '#000000',
//                 color: '#000000',
//                 WebkitTextFillColor: 'initial',
//               }}
//             >
//               <div
//                 className="article-content text-black"
//                 style={{ color: '#000000' }}
//                 dangerouslySetInnerHTML={{ __html: article.content }}
//               />
//             </div>

//             {relatedArticles.length > 0 && (
//               <div className="mt-12">
//                 <h3 className="text-xl font-bold text-[#162146] mb-6 flex items-center">
//                   <Beaker className="w-5 h-5 mr-2 text-[#162146]" />
//                   Articles connexes
//                 </h3>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handlePrev}
//                     className="p-2 bg-[#162146] rounded-lg hover:bg-[#0e172e] transition-colors"
//                     disabled={currentSlide === 0}
//                   >
//                     <ChevronLeft className="w-6 h-6 text-white" />
//                   </button>
//                   <button
//                     onClick={handleNext}
//                     className="p-2 bg-[#162146] rounded-lg hover:bg-[#0e172e] transition-colors"
//                     disabled={currentSlide >= maxPossibleSlide}
//                   >
//                     <ChevronRight className="w-6 h-6 text-white" />
//                   </button>
//                 </div>
//                 <div className="relative">
//                   <div
//                     ref={sliderRef}
//                     className="flex overflow-x-auto pb-6 pl-4 pr-4 md:pr-0 scrollbar-hide snap-x snap-mandatory scroll-smooth"
//                     style={{
//                       msOverflowStyle: 'none',
//                       scrollbarWidth: 'none',
//                       WebkitOverflowScrolling: 'touch',
//                     }}
//                     onMouseDown={handleMouseDown}
//                     onMouseUp={handleMouseUp}
//                     onMouseLeave={handleMouseUp}
//                     onMouseMove={handleMouseMove}
//                     onScroll={handleScroll}
//                   >
//                     {relatedArticles.map((related) => (
//                       <RelatedArticle
//                         key={related.uniqueKey || related.id}
//                         article={related}
//                         apiUrl={API_BASE_URL}
//                         handleImageError={handleImageError}
//                         onVideoHover={handleRelatedVideoHover}
//                       />
//                     ))}
//                     {isMobile && (
//                       <div className="min-w-[25vw] flex items-center justify-start pr-4">
//                         <div className="w-8 h-full flex items-center justify-center">
//                           <ChevronRight className="w-6 h-6 text-[#162146] animate-pulse" />
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   {isMobile && (
//                     <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {article?.video_url && (
//           <div
//             className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 ${
//               showVideoModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
//             }`}
//             onClick={closeVideoModal}
//           >
//             <div className="relative w-full max-w-4xl mx-auto p-4" onClick={(e) => e.stopPropagation()}>
//               <button
//                 onClick={closeVideoModal}
//                 className="absolute -top-10 right-4 text-white hover:text-gray-300 z-10"
//                 aria-label="Close video"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-8 w-8"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//               <div className="relative w-full bg-black rounded-lg overflow-hidden flex justify-center">
//                 {videoError ? (
//                   <div className="w-full h-full flex flex-col items-center justify-center bg-gray-8
// 00 text-white text-center p-6">
//                     <p className="mb-4">{videoError}</p>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         handleVideoPlay()
//                       }}
//                       className="bg-[#162146] hover:bg-[#0e172e] text-white px-6 py-3 rounded-lg transition"
//                     >
//                       Try Again
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="relative w-full">
//                       {isVideoLoading && (
//                         <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
//                           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
//                         </div>
//                       )}
//                       <video
//                         ref={videoRef}
//                         className="w-full max-h-[70vh] object-contain"
//                         playsInline
//                         muted={isMuted}
//                         onEnded={() => setVideoPlaying(false)}
//                         poster={article.image}
//                         preload="metadata"
//                         controls={false}
//                         onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
//                       >
//                         <source src={article.video_url} type="video/mp4" />
//                         <source src={article.video_url.replace('.mp4', '.webm')} type="video/webm" />
//                       </video>
//                     </div>
//                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-4 px-4">
//                       <div className="flex justify-between text-white text-sm mb-1">
//                         <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
//                         <span>{formatTime(videoRef.current?.duration || 0)}</span>
//                       </div>
//                       <div
//                         className="mt-2 w-full bg-gray-600 rounded-full h-2 overflow-hidden cursor-pointer"
//                         onClick={(e) => {
//                           if (videoRef.current) {
//                             const rect = e.currentTarget.getBoundingClientRect()
//                             const pos = (e.clientX - rect.left) / rect.width
//                             videoRef.current.currentTime = pos * videoRef.current.duration
//                           }
//                         }}
//                         onTouchStart={(e) => {
//                           if (videoRef.current) {
//                             const rect = e.currentTarget.getBoundingClientRect()
//                             const pos = (e.touches[0].clientX - rect.left) / rect.width
//                             videoRef.current.currentTime = pos * videoRef.current.duration
//                           }
//                         }}
//                       >
//                         <div
//                           className="bg-[#162146] h-full"
//                           style={{
//                             width: videoRef.current && videoRef.current.duration
//                               ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%`
//                               : '0%',
//                           }}
//                         ></div>
//                       </div>
//                       <div className="flex items-center justify-between mt-2">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             if (videoRef.current) {
//                               if (videoRef.current.paused) {
//                                 videoRef.current.play().catch((err) => console.error('Play failed:', err))
//                                 setVideoPlaying(true)
//                               } else {
//                                 videoRef.current.pause()
//                                 setVideoPlaying(false)
//                               }
//                             }
//                           }}
//                           className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
//                           aria-label={videoPlaying ? 'Pause' : 'Play'}
//                         >
//                           {videoPlaying ? (
//                             <svg
//                               className="w-6 h-6 text-white"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
//                             </svg>
//                           ) : (
//                             <Play className="w-6 h-6 text-white" />
//                           )}
//                         </button>
//                         <button
//                           onClick={toggleMute}
//                           className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
//                             isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#162146] hover:bg-[#0e172e]'
//                           }`}
//                           aria-label={isMuted ? 'Unmute' : 'Mute'}
//                         >
//                           {isMuted ? (
//                             <>
//                               <VolumeX className="w-5 h-5 text-white" />
//                               <span className="text-white text-sm font-medium">Unmute</span>
//                             </>
//                           ) : (
//                             <>
//                               <Volume2 className="w-5 h-5 text-white" />
//                               <span className="text-white text-sm font-medium">Mute</span>
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="h-20"></div>
//         <div className="space-y-8">
//           <div className="relative">
//             <img
//               src={`${API_BASE_URL}/api/images/pub-banner.jpg`}
//               alt="Publicité"
//               className="w-full h-full object-contain"
//               onError={(e) => handleImageError(e, 'Espace publicitaire disponible', { width: 1200, height: 150 })}
//             />
//           </div>
//         </div>
//         <Footer />
//       </div>
//     </>
//   )
// }

// export default TechArticlePage;



'use client'
import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import { ArrowLeft, Calendar, User, Tag, Share2, Atom, Beaker, Play, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import Head from 'next/head'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com'

const sections = [
  { name: 'Toutes', value: null },
  { name: 'Science', value: 'science' },
  { name: 'Technologie', value: 'technologie' },
  { name: 'Innovation', value: 'innovation' },
  { name: 'Recherche', value: 'recherche' },
  { name: 'Développement Durable', value: 'developpement_durable' },
  { name: 'Biotechnologie', value: 'biotechnologie' },
  { name: 'Intelligence Artificielle', value: 'intelligence_artificielle' },
  { name: 'Santé Numérique', value: 'sante_numerique' },
]

// Memoized Related Article Component
const RelatedArticle = memo(({ article, apiUrl, handleImageError, onVideoHover }) => {
  return (
    <Link href={`/tech/${article.id}`}>
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
                src={
                  article.image ||
                  `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(article.title || 'Article')}&color=162146`
                }
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
                poster={article.image}
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
              src={
                article.image ||
                `${apiUrl}/api/placeholder/250/375?text=${encodeURIComponent(article.title || 'Article')}&color=162146`
              }
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => handleImageError(e, article.id, article.title, { width: 250, height: 375 })}
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="bg-[#162146] text-white text-xs font-medium px-2 py-1 rounded">{article.category}</span>
          </div>
        </div>
        <h4 className="mt-3 font-medium text-[#162146] group-hover:text-[#0e172e] transition line-clamp-2">{article.title}</h4>
        <p className="text-sm text-gray-500">{article.date}</p>
      </div>
    </Link>
  )
})

const TechArticlePage = () => {
  const { id } = useParams()
  const router = useRouter()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  const handleImageError = useCallback(
    (e, articleId, placeholderText, size = { width: 800, height: 300 }, color = '162146') => {
      const src = e.target.src
      if (!loadedImages.current.has(src)) {
        console.warn(`Image failed to load for article ${articleId}:`, src)
        loadedImages.current.add(src)
        const { width, height } = size
        e.target.src = `${API_BASE_URL}/api/placeholder/${width}/${height}?text=${encodeURIComponent(
          placeholderText || 'Article'
        )}&color=${color}`
        e.target.className = `${e.target.className} object-contain`
      }
    },
    []
  )

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  const stripHtml = useCallback((html) => {
    return html.replace(/<[^>]+>/g, '').trim()
  }, [])

  const getArticleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch main article
      const articleResponse = await fetch(`${API_BASE_URL}/api/science-articles/${id}`);
      if (!articleResponse.ok) {
        throw new Error(`Failed to fetch article: ${articleResponse.status} ${articleResponse.statusText}`);
      }
      const articleData = await articleResponse.json();
  
      const date = new Date(articleData.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
  
      // Use category.name or fallback to science_section mapped name
      const sectionName = articleData.category?.name || 
        (articleData.science_section
          ? sections.find((section) => section.value === articleData.science_section)?.name || articleData.science_section
          : 'Inconnu');
  
      // Normalize image_url
      let imageUrl = articleData.image_url;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
        imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
      } else if (!imageUrl) {
        imageUrl = `${API_BASE_URL}/api/placeholder/1200/600?text=${encodeURIComponent(articleData.title || 'Article')}&color=162146`;
      }
  
      let videoUrl = articleData.video_url;
      if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('//')) {
        videoUrl = `${API_BASE_URL}${videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}`;
      }
  
      // Fetch related articles by science_section
      let relatedParams = new URLSearchParams({
        status: 'published',
        limit: '3',
        science_section: articleData.science_section || '',
        exclude: id.toString()
      });
  
      let relatedResponse = await fetch(
        `${API_BASE_URL}/api/science-articles/?${relatedParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
  
      let relatedData = [];
      if (relatedResponse.ok) {
        relatedData = await relatedResponse.json();
      }
  
      // Fallback: If no related articles, try by category_id
      if (!relatedData.length && articleData.category_id) {
        relatedParams = new URLSearchParams({
          status: 'published',
          limit: '3',
          category_id: articleData.category_id.toString(),
          exclude: id.toString()
        });
        relatedResponse = await fetch(
          `${API_BASE_URL}/api/science-articles/?${relatedParams.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        if (relatedResponse.ok) {
          relatedData = await relatedResponse.json();
        }
      }
  
      // Final fallback: Any published articles
      if (!relatedData.length) {
        relatedParams = new URLSearchParams({
          status: 'published',
          limit: '3',
          exclude: id.toString()
        });
        relatedResponse = await fetch(
          `${API_BASE_URL}/api/science-articles/?${relatedParams.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        if (relatedResponse.ok) {
          relatedData = await relatedResponse.json();
        }
      }
  
      const processedRelated = relatedData.map((rel) => {
        const relDate = new Date(rel.created_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
  
        // Use category.name or fallback to science_section mapped name
        const relSectionName = rel.category?.name || 
          (rel.science_section
            ? sections.find((section) => section.value === rel.science_section)?.name || rel.science_section
            : 'Inconnu');
  
        let relImageUrl = rel.image_url;
        if (relImageUrl && !relImageUrl.startsWith('http') && !relImageUrl.startsWith('//')) {
          relImageUrl = `${API_BASE_URL}${relImageUrl.startsWith('/') ? relImageUrl : `/${relImageUrl}`}`;
        } else if (!relImageUrl) {
          relImageUrl = `${API_BASE_URL}/api/placeholder/250/375?text=${encodeURIComponent(rel.title || 'Article')}&color=162146`;
        }
  
        let relVideoUrl = rel.video_url;
        if (relVideoUrl && !relVideoUrl.startsWith('http') && !relVideoUrl.startsWith('//')) {
          relVideoUrl = `${API_BASE_URL}${relVideoUrl.startsWith('/') ? relVideoUrl : `/${relVideoUrl}`}`;
        }
  
        return {
          id: rel.id,
          title: rel.title,
          category: relSectionName,
          author: rel.author_name || rel.author_username || 'Inconnu',
          date: relDate,
          image: relImageUrl,
          video_url: relVideoUrl || null,
          isMobile,
          uniqueKey: `related-${rel.id}-${Date.now()}`,
          videoRef: relatedVideoRefs,
        };
      });
  
      setArticle({
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        category: typeof sectionName === 'string' ? sectionName : 'Inconnu', // Ensure string
        author: articleData.author_name || articleData.author_username || 'Inconnu',
        date,
        image: imageUrl,
        video_url: videoUrl || null,
      });
      console.log('Article category set:', sectionName); // Debug log
  
      setRelatedArticles(processedRelated);
      console.log('Related articles categories:', processedRelated.map(r => r.category)); // Debug log
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, isMobile]);

  useEffect(() => {
    if (id) {
      getArticleData()
    }
  }, [id, getArticleData])

  // Reset video state when article changes
  useEffect(() => {
    setVideoPlaying(false)
    setShowVideoModal(false)
    setIsMuted(true)
    setVideoError(null)
    setIsVideoLoading(false)
    setPreviewVideoError(false)
  }, [article])

  // Main video event listeners
  useEffect(() => {
    if (videoRef.current && article?.video_url) {
      const video = videoRef.current

      const handleError = () => {
        console.error('Main video error:', video.error)
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
  }, [videoRef.current, article, isVideoLoading])

  // Preview video event listeners
  useEffect(() => {
    if (previewVideoRef.current && article?.video_url && !previewVideoError) {
      const video = previewVideoRef.current

      const handleError = () => {
        console.error('Preview video error:', video.error)
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

  // Video play handler
  const handleVideoPlay = useCallback(() => {
    if (!videoRef.current || !article?.video_url) {
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
  }, [article])

  // Mute toggle handler
  const toggleMute = useCallback((e) => {
    e.stopPropagation()
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
    }
  }, [])

  // Related video hover handler
  const handleRelatedVideoHover = useCallback(
    (articleId, action) => {
      const videoElement = relatedVideoRefs.current[articleId]
      if (!videoElement) return

      if (action === 'start') {
        if (relatedVideoHover && relatedVideoHover !== articleId) {
          const prevVideo = relatedVideoRefs.current[relatedVideoHover]
          if (prevVideo) {
            prevVideo.pause()
            prevVideo.currentTime = 0
          }
        }

        setRelatedVideoHover(articleId)
        videoElement.muted = true
        videoElement.currentTime = 0

        videoElement.play().catch((err) => {
          console.log('Related video preview failed:', err)
        })
      } else if (action === 'stop') {
        if (relatedVideoHover === articleId) {
          setRelatedVideoHover(null)
        }
        videoElement.pause()
        videoElement.currentTime = 0
      }
    },
    [relatedVideoHover]
  )

  // Format time for video
  const formatTime = useCallback((timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00'
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Share handler
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title,
          text: stripHtml(article?.content).substring(0, 100) + '...',
          url: window.location.href,
        })
        .catch((err) => console.error('Share failed:', err))
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }, [article, stripHtml])

  // Close video modal
  const closeVideoModal = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setShowVideoModal(false)
    setVideoPlaying(false)
    setIsVideoLoading(false)
  }, [])

  const maxPossibleSlide = relatedArticles.length - (isMobile ? 1 : 3)

  const handlePrev = useCallback(() => {
    const newSlide = Math.max(0, currentSlide - 1)
    setCurrentSlide(newSlide)
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3)
      sliderRef.current.scrollTo({
        left: newSlide * itemWidth,
        behavior: 'smooth',
      })
    }
  }, [isMobile])

  const handleNext = useCallback(() => {
    const newSlide = Math.min(maxPossibleSlide, currentSlide + 1)
    setCurrentSlide(newSlide)
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3)
      sliderRef.current.scrollTo({
        left: newSlide * itemWidth,
        behavior: 'smooth',
      })
    }
  }, [isMobile, maxPossibleSlide, currentSlide])

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
    const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3)
    const newSlide = Math.round(scrollPosition / itemWidth)
    setCurrentSlide(Math.min(maxPossibleSlide, Math.max(0, newSlide)))
  }, [isMobile, maxPossibleSlide])

  const handleBack = useCallback(() => {
      // Navigate to the previous page in history
      if (window.history.length > 1) {
        router.back();
      } else {
        // Fallback to AfroTcham section if no history
        router.push('/#science');
      }
    }, [router]);

  if (loading || !id) {
    return (
      <div className="min-h-screen bg-[#162146] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 w-40 bg-blue-200 rounded mb-4"></div>
            <div className="h-4 w-60 bg-blue-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#162146] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <div className="flex justify-center mb-4">
            <Atom className="w-10 h-10 text-[#162146]" />
          </div>
          <h1 className="text-2xl font-bold text-[#162146] mb-4">Article non trouvé</h1>
          <p className="text-gray-600 mb-6">L'article scientifique que vous recherchez n'existe pas ou a été déplacé.</p>
          <button 
          onClick={handlBack}
          className="bg-[#162146] text-white px-6 py-2 rounded-lg hover:bg-[#0e172e] transition">
            <span className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux sciences
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
        <meta name="description" content={stripHtml(article.content).substring(0, 160)} />
        <meta property="og:title" content={article.title} />
        <meta property="og:image" content={article.image} />
        <meta property="og:description" content={stripHtml(article.content).substring(0, 160)} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen bg-[#162146]">
        <div className="relative h-[50vh] w-full">
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
                poster={article.image}
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
                src={article.image || `${API_BASE_URL}/api/placeholder/1200/600?text=${encodeURIComponent(article.title || 'Article')}&color=162146`}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, article.id, article.title, { width: 1200, height: 600 })}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
              <button
              onClick={handleBack}
               className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition">
                <ArrowLeft className="w-6 h-6" />
              </button>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-[#162146] text-white text-sm font-medium px-3 py-1 rounded-full">
              {typeof article.category === 'string' ? article.category : 'Inconnu'}
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto -mt-20 relative z-10 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#162146] mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-y-2">
              <div className="flex items-center mr-6">
                <User className="w-4 h-4 mr-2" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center mr-6">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                <span>{typeof article.category === 'string' ? article.category : 'Inconnu'}</span>
              </div>
              <div className="ml-auto">
                <button onClick={handleShare} className="flex items-center text-[#162146] hover:text-[#0e172e]">
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
                  className="prose max-w-none prose-img:rounded-xl prose-lg text-black prose-p:text-base prose-p:leading-relaxed prose-h1:text-[#162146] prose-h2:text-[#162146] prose-h3:text-[#162146]"
                  style={{
                    '--tw-prose-links': '#162146',
                    '--tw-prose-body': '#000000',
                    '--tw-prose-headings': '#000000',
                    color: '#000000',
                    WebkitTextFillColor: 'initial',
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
                <h3 className="text-xl font-bold text-[#162146] mb-6 flex items-center">
                  <Beaker className="w-5 h-5 mr-2 text-[#162146]" />
                  Articles connexes
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2 bg-[#162146] rounded-lg hover:bg-[#0e172e] transition-colors"
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 bg-[#162146] rounded-lg hover:bg-[#0e172e] transition-colors"
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
                    onMouseLeave={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onScroll={handleScroll}
                  >
                    {relatedArticles.map((related) => (
                      <RelatedArticle
                        key={related.uniqueKey || related.id}
                        article={related}
                        apiUrl={API_BASE_URL}
                        handleImageError={handleImageError}
                        onVideoHover={handleRelatedVideoHover}
                      />
                    ))}
                    {isMobile && (
                      <div className="min-w-[25vw] flex items-center justify-start pr-4">
                        <div className="w-8 h-full flex items-center justify-center">
                          <ChevronRight className="w-6 h-6 text-[#162146] animate-pulse" />
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

        {article?.video_url && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 ${
              showVideoModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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
                      className="bg-[#162146] hover:bg-[#0e172e] text-white px-6 py-3 rounded-lg transition"
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
                        poster={article.image}
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
                          className="bg-[#162146] h-full"
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
                          className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
                            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#162146] hover:bg-[#0e172e]'
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
        <Footer />
      </div>
    </>
  )
}

export default TechArticlePage;