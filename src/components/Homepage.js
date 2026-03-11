'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Radio, TrendingUp, Star, Flame, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AdBanner from '@/components/AdBanner';

// Mapping section_id → route (à adapter selon ton backend)
const SECTION_ID_TO_PATH = {
  1: 'alaune',
  2: 'buzz',
  3: 'afrotcham',
  4: 'rap',
  5: 'sport',
  6: 'comedy',
  7: 'cinema',
  8: 'stories',
};

const HomePage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com';

  const [content, setContent] = useState({
    alaune: [],
    buzz: [],
    afroTcham: [],
    rap: [],
    sport: [],
    comedie: [],
    cinema: [],
    story: [],
    mostread: [],
    latestPublished: [],
    latestNews: [],
    sections: [],
    directTVVideo: null,
    loading: true,
    error: null,
  });

  const [failedImages, setFailedImages] = useState(new Set());

  const [activeALaUneSlide, setActiveALaUneSlide] = useState(0);
  const [activeBuzzSlide, setActiveBuzzSlide] = useState(0);
  const [activeAfroTchamSlide, setActiveAfroTchamSlide] = useState(0);
  const [activeRapSlide, setActiveRapSlide] = useState(0);
  const [activeSportSlide, setActiveSportSlide] = useState(0);
  const [activeComedieSlide, setActiveComedieSlide] = useState(0);
  const [activeCinemaSlide, setActiveCinemaSlide] = useState(0);
  const [activeStoriesSlide, setActiveStoriesSlide] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const aLaUneContainerRef = useRef(null);
  const buzzContainerRef = useRef(null);
  const afroTchamContainerRef = useRef(null);
  const rapContainerRef = useRef(null);
  const sportContainerRef = useRef(null);
  const comedieContainerRef = useRef(null);
  const cinemaContainerRef = useRef(null);
  const mostreadContainerRef = useRef(null);
  const storyContainerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setContent((prev) => ({ ...prev, loading: true, error: null }));

        let sections = [];
        try {
          const sectionsResponse = await fetch(`${apiUrl}/api/sections/`);
          if (sectionsResponse.ok) {
            sections = await sectionsResponse.json();
          } else {
            console.warn(`Failed to fetch sections: ${sectionsResponse.status} ${sectionsResponse.statusText}`);
            sections = [
              { id: 1, name: 'À la Une' },
              { id: 2, name: 'Buzz' },
              { id: 3, name: 'AfroTcham' },
              { id: 4, name: 'Rap' },
              { id: 5, name: 'Sport' },
              { id: 6, name: 'Comédie' },
              { id: 7, name: 'Cinéma' },
              { id: 8, name: 'Story' },
              { id: 9, name: 'Mostread' },
              { id: 10, name: 'Latest News' },
            ];
          }
        } catch (err) {
          console.error('Error fetching sections:', err);
        }

        const fetchWithErrorHandling = async (url, endpoint) => {
          try {
            const res = await fetch(url);
            if (!res.ok) {
              throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
            }
            return await res.json();
          } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            return endpoint === 'directtv' ? null : [];
          }
        };

        const [
          alauneData,
          buzzData,
          latestPublishedData,
          latestNewsData,
          afroTchamData,
          rapData,
          sportData,
          comedieData,
          cinemaData,
          mostreadData,
          storyData,
          directTvData,
        ] = await Promise.all([
          fetchWithErrorHandling(`${apiUrl}/api/articles/alaune?status=published`, 'alaune articles'),
          fetchWithErrorHandling(`${apiUrl}/api/articles/?section_id=2&status=published`, 'buzz articles'),
          fetchWithErrorHandling(`${apiUrl}/api/articles/?status=published`, 'latest published articles'),
          fetchWithErrorHandling(`${apiUrl}/api/actualitehome/?status=published`, 'latest news'),
          fetchWithErrorHandling(`${apiUrl}/api/articles/afrotcham?status=published`, 'AfroTcham articles'),
          fetchWithErrorHandling(`${apiUrl}/api/articles/rap?status=published`, 'Rap articles'),
          fetchWithErrorHandling(`${apiUrl}/api/articles/sport?status=published`, 'Sport articles'),
          fetchWithErrorHandling(`${apiUrl}/api/articles/comedy?status=published`, 'Comédie articles'),
          fetchWithErrorHandling(`${apiUrl}/api/articles/cinema?status=published`, 'Cinéma articles'),
          fetchWithErrorHandling(`${apiUrl}/api/articles/mostread?status=published`, 'Most Read articles'),
          fetchWithErrorHandling(`${apiUrl}/api/articles/story?status=published`, 'Stories'),
          (async () => {
            let programs = [];
            let fetchSuccess = false;

            try {
              const publicResponse = await fetch(`${apiUrl}/api/directtv/public`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                mode: 'cors',
              });
              if (publicResponse.ok) {
                programs = await publicResponse.json();
                fetchSuccess = true;
              }
            } catch (publicError) {
              console.error('Error fetching from public endpoint:', publicError);
            }

            if (!fetchSuccess) {
              try {
                const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
                if (typeof window !== 'undefined') {
                  const token = localStorage.getItem('token');
                  if (token) headers['Authorization'] = `Bearer ${token}`;
                }
                const mainResponse = await fetch(`${apiUrl}/api/directtv/`, {
                  method: 'GET',
                  headers,
                  mode: 'cors',
                });
                if (mainResponse.ok) {
                  programs = await mainResponse.json();
                  fetchSuccess = true;
                }
              } catch (mainError) {
                console.error('Error fetching from main endpoint:', mainError);
              }
            }

            return fetchSuccess ? programs : [];
          })(),
        ]);

        const processItems = (
          data,
          Mostread = false,
          isStory = false,
          isCinema = false,
          isComedy = false,
          isSport = false,
          isRap = false,
          isAfroTcham = false,
          isBuzz = false,
          isAlaune = false,
          isActualite = false
        ) => {
          const getSummary = (rawContent, rawDescription) => {
            if (rawDescription && rawDescription.trim()) return rawDescription.trim();
            const plain = (rawContent || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            if (!plain) return 'Aucun résumé disponible';
            return plain.length > 120 ? `${plain.slice(0, 120)}...` : plain;
          };

          return data.map((item) => {
            let imageUrl;
            if (isActualite) {
              imageUrl = item.image_url || `${apiUrl}/api/placeholder/300/400?text=${encodeURIComponent(item.title || 'Actualité')}&color=4f46e5`;
            } else {
              imageUrl = item.image_url;
              if (!imageUrl || imageUrl === '') {
                imageUrl = `${apiUrl}/api/placeholder/300/400?text=${encodeURIComponent(item.title || 'Article')}&color=4f46e5`;
              } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
                imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
              }
            }

            return {
              id: item.id,
              title: item.title,
              description: getSummary(item.content, item.description),
              image: imageUrl,
              category: isActualite ? 'Actualité' : (item.category?.name || 'Général'),
              section: isActualite ? 'Latest News' : (item.section?.name || 'General'),
              // ✅ FIX: on conserve le section_id brut pour le routing
              section_id: item.section?.id || item.section_id || null,
              views: isActualite ? '0 vues' : (item.views ? `${parseInt(item.views).toLocaleString()} vues` : '0 vues'),
              date: new Date(item.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric', month: 'long', day: 'numeric',
              }),
              Mostread: Mostread || !!item.mostread,
              isStory: isStory || !!item.is_story,
              isCinema: isCinema || !!item.is_cinema,
              isComedy: isComedy || !!item.is_comedy,
              isSport: isSport || !!item.is_sport,
              isRap: isRap || !!item.is_rap,
              isAfroTcham: isAfroTcham || !!item.is_afrotcham,
              isBuzz: isBuzz || !!item.is_buzz,
              isAlaune: isAlaune || !!item.is_alaune,
              isAlauneActual: !!item.alauneactual,
              isVideoActual: !!item.videoactual,
              isEventActual: !!item.eventactual,
              isActualite,
            };
          });
        };

        const categoryMatches = (items, keywords) => {
          const normalizedKeywords = keywords.map((k) => k.toLowerCase());
          return items.filter((item) => {
            const categoryName = (item.category?.name || '').toLowerCase();
            return normalizedKeywords.some((kw) => categoryName.includes(kw));
          });
        };

        const genericPublished = Array.isArray(latestPublishedData) ? latestPublishedData : [];
        const buzzFallback = categoryMatches(genericPublished, ['buzz']);
        const afroFallback = categoryMatches(genericPublished, ['afrotcham', 'afro tcham']);
        const rapFallback = categoryMatches(genericPublished, ['rap']);
        const sportFallback = categoryMatches(genericPublished, ['sport']);
        const comedyFallback = categoryMatches(genericPublished, ['comedy', 'comedie', 'comédie']);
        const cinemaFallback = categoryMatches(genericPublished, ['cinema', 'cinéma']);

        const processDirectTvVideo = (programs) => {
          if (!Array.isArray(programs) || programs.length === 0) return null;

          const now = new Date();
          const publishedPrograms = programs.filter((p) => p.status === 'published');
          const featuredProgram = publishedPrograms.find((p) => p.is_featured);
          const liveProgram = !featuredProgram ? publishedPrograms.find((p) => p.is_live) : null;
          const recentPrograms = publishedPrograms
            .filter((p) => new Date(p.date) <= now)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          const current = featuredProgram || liveProgram || recentPrograms[0];

          if (!current) return null;

          return {
            id: current.id,
            title: current.title || 'Événements culturels',
            video_url: current.video_url
              ? current.video_url.startsWith('http') || current.video_url.startsWith('//')
                ? current.video_url
                : `${apiUrl}${current.video_url.startsWith('/') ? current.video_url : `/${current.video_url}`}`
              : null,
            image_url: current.image_url
              ? current.image_url.startsWith('http') || current.image_url.startsWith('//')
                ? current.image_url
                : `${apiUrl}${current.image_url.startsWith('/') ? current.image_url : `/${current.image_url}`}`
              : `${apiUrl}/api/placeholder/800/400?text=${encodeURIComponent(current.title || 'Événements culturels')}&color=1d4ed8`,
          };
        };

        setContent({
          alaune: processItems((alauneData?.length ? alauneData : genericPublished), false, false, false, false, false, false, false, false, true),
          buzz: processItems((buzzData?.length ? buzzData : buzzFallback), false, false, false, false, false, false, false, true),
          latestNews: processItems(latestNewsData, false, false, false, false, false, false, false, false, false, true),
          afroTcham: processItems((afroTchamData?.length ? afroTchamData : afroFallback), false, false, false, false, false, false, true),
          rap: processItems((rapData?.length ? rapData : rapFallback), false, false, false, false, false, true),
          sport: processItems((sportData?.length ? sportData : sportFallback), false, false, false, false, true),
          comedie: processItems((comedieData?.length ? comedieData : comedyFallback), false, false, false, true),
          cinema: processItems((cinemaData?.length ? cinemaData : cinemaFallback), false, false, true),
          mostread: processItems(mostreadData, true),
          story: processItems(storyData, false, true),
          latestPublished: processItems(genericPublished),
          directTVVideo: processDirectTvVideo(directTvData),
          sections,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setContent((prev) => ({
          ...prev,
          loading: false,
          error: `Erreur de chargement des données: ${error.message}. Veuillez réessayer.`,
        }));
      }
    };

    fetchAllData();
  }, [apiUrl]);

  const handleImageError = (e, itemId, placeholderText, size = { width: 800, height: 300 }, color = '4f46e5') => {
    if (!failedImages.has(itemId)) {
      setFailedImages((prev) => new Set(prev).add(itemId));
      const placeholderUrl = `${apiUrl}/api/placeholder/${size.width}/${size.height}?text=${encodeURIComponent(placeholderText)}&color=${color}`;
      if (e.target.src !== placeholderUrl) {
        e.target.src = placeholderUrl;
        e.target.className = `${e.target.className} object-contain bg-gray-200`;
        e.target.loading = 'lazy';
      }
    }
  };

  const handleVideoError = (e, itemId) => {
    if (!failedImages.has(itemId)) {
      console.error(`Video failed for item ${itemId}: ${e.target.currentSrc}`);
      setFailedImages((prev) => new Set(prev).add(itemId));
      e.target.poster = `${apiUrl}/api/placeholder/800/400?text=Événements+culturels&color=1d4ed8`;
    }
  };

  const handleVideoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (content.directTVVideo?.video_url) togglePlay();
  };

  const handleVideoTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (content.directTVVideo?.video_url) togglePlay();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current && content.directTVVideo?.video_url) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
  };

  const scrollToSlide = (containerId, index, totalItems) => {
    const container = document.getElementById(containerId);
    if (container) {
      const itemWidth = container.scrollWidth / totalItems;
      container.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
    }
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleScroll = (containerRef, setActiveSlide, totalItems) => {
    if (containerRef.current) {
      const slideWidth = containerRef.current.scrollWidth / totalItems;
      const newSlide = Math.round(containerRef.current.scrollLeft / slideWidth);
      setActiveSlide(newSlide);
    }
  };

  // ✅ FIX PRINCIPAL : routing intelligent basé sur section_id + flags + category + section name
  const getArticleDetailPath = (item) => `/article/${item.id}`;

  if (content.loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (content.error) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{content.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-blue-900 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full">
        <AdBanner position="top" page="homepage" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Derniers articles publiés */}
        <section className="mb-10 bg-blue-900 backdrop-blur-sm p-6 rounded-xl shadow-xl">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-500 p-2 rounded-lg shadow-md mr-3">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">DERNIERS ARTICLES PUBLIES</h2>
          </div>
          {content.latestPublished.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.latestPublished.map((item) => (
                // ✅ FIX : utilise getArticleDetailPath au lieu d'un chemin hardcodé
                <Link key={`latest-${item.id}`} href={`/article/${item.id}`}>
                  <div className="bg-white/10 hover:bg-white/15 transition rounded-lg p-4 h-full">
                    <p className="text-cyan-300 text-xs mb-2">{item.category}</p>
                    <h3 className="text-white font-semibold line-clamp-2 mb-2">{item.title}</h3>
                    <p className="text-white/80 text-sm line-clamp-3">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-blue-800/20 rounded-lg p-8 text-center">
              <p className="text-white">Aucun article publié pour le moment</p>
            </div>
          )}
        </section>

        {/* À la Une Section */}
        <section className="mb-10 bg-blue-900 backdrop-blur-sm p-6 rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-tr from-yellow-500 to-yellow-300 p-2 rounded-lg shadow-md mr-3">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">À LA UNE</h2>
            </div>
          </div>

          {content.alaune.length > 0 ? (
            <div className="relative group">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none md:hidden" />
              <div
                id="a-la-une-container"
                ref={aLaUneContainerRef}
                className="flex overflow-x-auto pb-8 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                onScroll={() => handleScroll(aLaUneContainerRef, setActiveALaUneSlide, content.alaune.length)}
              >
                {content.alaune.map((item) => (
                  <motion.div key={item.id} className="flex-none w-[85%] pr-4 snap-start md:w-1/3 lg:w-1/4">
                    <Link href={`/article/${item.id}`}>
                      <div className="group cursor-pointer relative rounded-xl overflow-hidden h-full">
                        <div className="aspect-[3/4] relative">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => handleImageError(e, item.id, item.title, { width: 300, height: 400 }, '4f46e5')}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                            {item.category}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-lg font-semibold line-clamp-2 drop-shadow-md">{item.title}</h3>
                          <div className="flex items-center mt-3 text-white/80 text-sm">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Lire l&apos;article
                          </div>
                          <div className="flex items-center mt-3 text-white/80 text-sm">
                            <Play className="w-4 h-4 mr-2" />
                            {item.views}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-blue-800/20 rounded-lg p-8 text-center">
              <p className="text-white">Aucun article à la une pour le moment</p>
            </div>
          )}
        </section>

        {/* Buzz du moment Section */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gradient-to-br bg-blue-900 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg shadow-md mr-3">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">BUZZ DU MOMENT</h2>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none md:hidden" />
              <div
                id="buzz-scroll-container"
                ref={buzzContainerRef}
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                onScroll={() => handleScroll(buzzContainerRef, setActiveBuzzSlide, content.buzz.length)}
              >
                {content.buzz.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex-none w-[85%] pr-4 snap-start md:w-1/3 lg:w-1/4"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <Link href={`/article/${item.id}`}>
                      <div className="group cursor-pointer relative rounded-xl overflow-hidden h-full">
                        <div className="aspect-[3/4] relative">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => handleImageError(e, item.id, 'Buzz', { width: 300, height: 400 }, 'dc2626')}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                            Buzz
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-lg font-semibold line-clamp-2">{item.title}</h3>
                          <div className="flex items-center mt-3 text-white/80 text-sm">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Lire l&apos;article
                          </div>
                          <div className="flex items-center mt-3 text-white/80 text-sm">
                            <Play className="w-4 h-4 mr-2" />
                            {item.views}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-4 items-center">
              <div className="flex space-x-2">
                {content.buzz.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${activeBuzzSlide === index ? 'bg-red-400 scale-110' : 'bg-blue-800 hover:bg-blue-700'}`}
                    onClick={() => { setActiveBuzzSlide(index); scrollToSlide('buzz-scroll-container', index, content.buzz.length); }}
                    aria-label={`Aller à la diapositive ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* AfroTcham Section */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-2 rounded-lg shadow-md mr-3">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">AFROTCHAM</h2>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none md:hidden" />
              <div
                id="afrotcham-scroll-container"
                ref={afroTchamContainerRef}
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                onScroll={() => handleScroll(afroTchamContainerRef, setActiveAfroTchamSlide, content.afroTcham.length)}
              >
                {content.afroTcham.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex-none w-[85%] pr-4 snap-start md:w-1/3 lg:w-1/4"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <Link href={`/article/${item.id}`}>
                      <div className="group cursor-pointer relative rounded-xl overflow-hidden h-full">
                        <div className="aspect-[3/4] relative">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => handleImageError(e, item.id, 'AfroTcham', { width: 300, height: 400 }, 'dc2626')}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute top-4 left-4 bg-amber-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                            AfroTcham
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-lg font-semibold line-clamp-2">{item.title}</h3>
                          <div className="flex items-center mt-3 text-white/80 text-sm">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Lire l&apos;article
                          </div>
                          <div className="flex items-center mt-3 text-white/80 text-sm">
                            <Play className="w-4 h-4 mr-2" />
                            {item.views}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-4 items-center">
              <div className="flex space-x-2">
                {content.afroTcham.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${activeAfroTchamSlide === index ? 'bg-amber-400 scale-110' : 'bg-amber-800 hover:bg-amber-700'}`}
                    onClick={() => { setActiveAfroTchamSlide(index); scrollToSlide('afrotcham-scroll-container', index, content.afroTcham.length); }}
                    aria-label={`Aller à la diapositive ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Rap Section */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-lg shadow-md mr-3">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">RAP GABONAIS</h2>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none md:hidden" />
              <div
                id="rap-scroll-container"
                ref={rapContainerRef}
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                onScroll={() => handleScroll(rapContainerRef, setActiveRapSlide, content.rap.length)}
              >
                {content.rap.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex-none w-[85%] pr-4 snap-start md:w-1/3 lg:w-1/4"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <Link href={`/article/${item.id}`}>
                      <div className="group cursor-pointer relative rounded-xl overflow-hidden h-full">
                        <div className="aspect-[3/4] relative">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => handleImageError(e, item.id, 'Rap', { width: 300, height: 400 }, '2563eb')}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                            Rap
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-lg font-semibold line-clamp-2">{item.title}</h3>
                          <div className="flex items-center mt-3 text-white/80 text-sm">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Lire l&apos;article
                          </div>
                          <div className="flex items-center mt-3 text-white/80 text-sm">
                            <Play className="w-4 h-4 mr-2" />
                            {item.views}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-4 items-center">
              <div className="flex space-x-2">
                {content.rap.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${activeRapSlide === index ? 'bg-blue-400 scale-110' : 'bg-blue-800 hover:bg-blue-700'}`}
                    onClick={() => { setActiveRapSlide(index); scrollToSlide('rap-scroll-container', index, content.rap.length); }}
                    aria-label={`Aller à la diapositive ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Sport Section */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-lg shadow-md mr-3">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">SPORT NATIONAL</h2>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-emerald-600 to-transparent md:hidden" />
              <div
                id="sport-scroll-container"
                ref={sportContainerRef}
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                onScroll={() => handleScroll(sportContainerRef, setActiveSportSlide, content.sport.length)}
              >
                {content.sport.length > 0 ? (
                  content.sport.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex-none w-[85%] pr-4 snap-start md:w-1/3 lg:w-1/4"
                      style={{ scrollSnapAlign: 'start' }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Link href={`/article/${item.id}`}>
                        <div className="group cursor-pointer relative rounded-xl overflow-hidden h-full">
                          <div className="aspect-[3/4] relative">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => handleImageError(e, item.id, item.title, { width: 300, height: 400 }, '059669')}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute top-4 left-4 bg-green-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                              {item.category}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-white text-lg font-semibold line-clamp-2">{item.title}</h3>
                            <div className="flex items-center mt-3 text-white/80 text-sm">
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Lire l&apos;article
                            </div>
                            <div className="flex items-center mt-3 text-white/80 text-sm">
                              <Play className="w-4 h-4 mr-2" />
                              {item.views}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full text-center py-6 text-white">
                    Aucun article sport disponible pour le moment.
                  </div>
                )}
              </div>
            </div>

            {content.sport.length > 0 && (
              <div className="flex justify-center mt-4 items-center">
                <div className="flex space-x-2">
                  {content.sport.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${activeSportSlide === index ? 'bg-emerald-400 scale-110' : 'bg-emerald-800 hover:bg-emerald-700'}`}
                      onClick={() => { setActiveSportSlide(index); scrollToSlide('sport-scroll-container', index, content.sport.length); }}
                      aria-label={`Aller à la diapositive ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Comédie Section */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-pink-400 to-purple-600 p-2 rounded-lg shadow-md mr-3">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl text-white font-semibold">COMÉDIE</h2>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-pink-600 to-transparent md:hidden" />
              <div
                id="comedie-scroll-container"
                ref={comedieContainerRef}
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                onScroll={() => handleScroll(comedieContainerRef, setActiveComedieSlide, content.comedie.length)}
              >
                {content.comedie.length > 0 ? (
                  content.comedie.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex-none w-[85%] pr-4 snap-start md:w-1/3 lg:w-1/4"
                      style={{ scrollSnapAlign: 'start' }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Link href={`/article/${item.id}`}>
                        <div className="group cursor-pointer relative rounded-xl overflow-hidden h-full">
                          <div className="aspect-[3/4] relative">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => handleImageError(e, item.id, item.title, { width: 300, height: 400 }, 'db2777')}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute top-4 left-4 bg-pink-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                              {item.category}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-white text-lg font-semibold line-clamp-2">{item.title}</h3>
                            <div className="flex items-center mt-3 text-white/80 text-sm">
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Lire l&apos;article
                            </div>
                            <div className="flex items-center mt-3 text-white/80 text-sm">
                              <Play className="w-3 h-3 mr-2" />
                              {item.views}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full text-center py-6 text-white">
                    Aucun article comédie disponible pour le moment.
                  </div>
                )}
              </div>
            </div>

            {content.comedie.length > 0 && (
              <div className="flex justify-center mt-4 items-center">
                <div className="flex space-x-2">
                  {content.comedie.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${activeComedieSlide === index ? 'bg-pink-400 scale-110' : 'bg-pink-800 hover:bg-pink-700'}`}
                      onClick={() => { setActiveComedieSlide(index); scrollToSlide('comedie-scroll-container', index, content.comedie.length); }}
                      aria-label={`Aller à la diapositive ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Cinéma Section */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-gradient-to-br from-red-800 to-rose-600 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-rose-400 to-red-600 p-2 rounded-lg shadow-md mr-3">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">CINÉMA</h2>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-rose-600 to-transparent md:hidden" />
              <div
                id="cinema-scroll-container"
                ref={cinemaContainerRef}
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                onScroll={() => handleScroll(cinemaContainerRef, setActiveCinemaSlide, content.cinema.length)}
              >
                {content.cinema.length > 0 ? (
                  content.cinema.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex-none w-[85%] pr-4 snap-start md:w-1/3 lg:w-1/4"
                      style={{ scrollSnapAlign: 'start' }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Link href={`/article/${item.id}`}>
                        <div className="group cursor-pointer relative rounded-xl overflow-hidden h-full">
                          <div className="aspect-[3/4] relative">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => handleImageError(e, item.id, item.title, { width: 300, height: 400 }, 'dc2626')}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                              {item.category}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-white text-lg font-semibold line-clamp-2">{item.title}</h3>
                            <div className="flex items-center mt-3 text-white/80 text-sm">
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Lire l&apos;article
                            </div>
                            <div className="flex items-center mt-3 text-white/80 text-sm">
                              <Play className="w-4 h-4 mr-2" />
                              {item.views}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full text-center py-6 text-white">
                    Aucun article cinéma disponible pour le moment.
                  </div>
                )}
              </div>
            </div>

            {content.cinema.length > 0 && (
              <div className="flex justify-center mt-4 items-center">
                <div className="flex space-x-2">
                  {content.cinema.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${activeCinemaSlide === index ? 'bg-red-400 scale-110' : 'bg-red-800 hover:bg-red-700'}`}
                      onClick={() => { setActiveCinemaSlide(index); scrollToSlide('cinema-scroll-container', index, content.cinema.length); }}
                      aria-label={`Aller à la diapositive ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Last Section — Video */}
        <section className="mb-10">
          <div className="bg-white bg-gradient-to-br rounded-xl py-8 px-6 shadow-xl">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="md:col-span-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="group relative rounded-xl overflow-hidden shadow-2xl"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <style jsx>{`
                      .video-container {
                        touch-action: manipulation;
                        -webkit-touch-callout: none;
                        -webkit-user-select: none;
                        user-select: none;
                      }
                      .video-container video {
                        -webkit-tap-highlight-color: transparent;
                        -webkit-touch-callout: none;
                        -webkit-user-select: none;
                        user-select: none;
                      }
                    `}</style>

                    {content.directTVVideo && content.directTVVideo.video_url ? (
                      <div className="relative video-container">
                        <motion.video
                          ref={videoRef}
                          src={content.directTVVideo.video_url}
                          poster={content.directTVVideo.image_url}
                          className="w-full h-full object-cover touch-none"
                          onError={(e) => handleVideoError(e, content.directTVVideo.id || 'Video')}
                          controls={false}
                          autoPlay={false}
                          playsInline={true}
                          webkit-playsinline="true"
                          disablePictureInPicture={true}
                          controlsList="nodownload nofullscreen noremoteplayback"
                          onContextMenu={(e) => e.preventDefault()}
                          initial={{ scale: 1.1, opacity: 0.7 }}
                          animate={{ scale: 1, opacity: 0.8 }}
                          transition={{ duration: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        >
                          <source src={content.directTVVideo.video_url} type="video/mp4" />
                          Votre navigateur ne supporte pas la lecture vidéo.
                        </motion.video>

                        <div
                          className="absolute inset-0 cursor-pointer"
                          onClick={handleVideoClick}
                          onTouchStart={handleVideoTouch}
                          onTouchEnd={(e) => e.preventDefault()}
                        >
                          {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-red-600 hover:bg-red-500 p-5 rounded-full transition-colors pointer-events-none">
                                <Play className="w-10 h-10 text-white" fill="white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full aspect-video">
                        <Image
                          src={`${apiUrl}/api/placeholder/800/400?text=Événements+culturels&color=1d4ed8`}
                          alt="Featured Content"
                          fill
                          className="object-cover"
                          onError={(e) => handleImageError(e, 'live3', 'Événements culturels', { width: 800, height: 400 }, '1d4ed8')}
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

                    <div className="absolute top-4 left-4">
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 bg-red-600 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                        />
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center z-10 relative shadow-lg">
                          <Radio className="w-4 h-4 mr-2" />
                          EN DIRECT
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <motion.h2
                        className="text-white text-2xl md:text-3xl font-bold"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        {content.directTVVideo?.title || 'Les talents locaux et événements culturels du Gabon'}
                      </motion.h2>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="flex mt-4 items-center"
                      >
                        {!isPlaying && (
                          <button
                            onClick={handlePlayClick}
                            className="flex items-center bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white font-medium transition-all shadow-md pointer-events-auto"
                          >
                            <Play className="w-5 h-5 mr-2" fill="currentColor" />
                            Regarder maintenant
                          </button>
                        )}
                        {isPlaying && (
                          <div className="flex items-center pointer-events-auto">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-32 md:w-48 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                              aria-label="Contrôle du volume"
                            />
                            <span className="ml-2 text-white text-sm">{Math.round(volume * 100)}%</span>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="border border-blue-700 rounded-xl overflow-hidden shadow-xl transform transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <AdBanner position="sidebar" page="homepage" sticky={true} />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>

      <AdBanner position="floating" page="homepage" />
    </motion.div>
  );
};

export default HomePage;