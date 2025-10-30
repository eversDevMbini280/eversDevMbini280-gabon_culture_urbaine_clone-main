"use client";
import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import { Calendar, Clock, ChevronRight, ChevronLeft, Newspaper, Play } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AdBanner from '@/components/AdBanner';

const ActualitePage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com';

  // State for content
  const [content, setContent] = useState({
    alauneactual: [],
    videoactual: [],
    eventactual: [],
    sections: [],
    loading: true,
    error: null,
  });
  const [failedImages, setFailedImages] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [currentArticleSlide, setCurrentArticleSlide] = useState(0);
  const [currentVideoSlide, setCurrentVideoSlide] = useState(0);
  const [currentEventSlide, setCurrentEventSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for sliders
  const articleSliderRef = useRef(null);
  const videoSliderRef = useRef(null);
  const eventSliderRef = useRef(null);

  // Static category types
  const actualitetypes = [
    'Toutes', 'Culture', 'Politique', 'Économie', 'Société',
    'Sports', 'Technologie', 'Éducation', 'Santé', 'Environnement',
  ];

  // Map backend category names to frontend actualitetypes
  const categoryMapping = {
    Health: 'Santé',
    Politics: 'Politique',
    Economy: 'Économie',
    Society: 'Société',
    Sport: 'Sports',
    Technology: 'Technologie',
    Education: 'Éducation',
    Culture: 'Culture',
    Environment: 'Environnement',
    // Add more mappings based on backend category.name values
  };

  // Image error handler
  const handleImageError = (e, itemId, placeholderText, size = { width: 800, height: 400 }, color = '4f46e5') => {
    if (!failedImages.has(itemId)) {
      setFailedImages((prev) => new Set(prev).add(itemId));
      const width = size.width;
      const height = size.height;
      const placeholderUrl = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText)}&color=${color}`;
      if (e.target.src !== placeholderUrl) {
        e.target.src = placeholderUrl;
        e.target.className = `${e.target.className} object-contain bg-gray-200`;
        e.target.loading = 'lazy';
      }
    }
  };

  // Fetch articles
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setContent((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch sections
        const sectionsResponse = await fetch(`${apiUrl}/api/sections/`);
        let sections = [];
        if (sectionsResponse.ok) {
          sections = await sectionsResponse.json();
        } else {
          console.warn('Sections endpoint not available, using defaults');
          sections = [
            { id: 11, name: 'alauneactual' },
            { id: 12, name: 'videoactual' },
            { id: 13, name: 'eventactual' },
          ];
        }

        // Fetch articles
        const [alauneactualRes, videoactualRes, eventactualRes] = await Promise.all([
          fetch(`${apiUrl}/api/articles/alauneactual?status=published`),
          fetch(`${apiUrl}/api/articles/videoactual?status=published`),
          fetch(`${apiUrl}/api/articles/eventactual?status=published`),
        ]);

        // Process responses
        let alauneactualData = alauneactualRes.ok ? await alauneactualRes.json() : [];
        let videoactualData = videoactualRes.ok ? await videoactualRes.json() : [];
        let eventactualData = eventactualRes.ok ? await eventactualRes.json() : [];

        // Process items
        const processItems = (data, sectionName) => {
          return data.map((item) => {
            let imageUrl = item.image_url || `${apiUrl}/api/placeholder/300/400?text=${encodeURIComponent(item.title || 'Article')}&color=4f46e5`;
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
              imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
            }
            // Map backend category to frontend actualitetypes
            const backendCategory = item.category?.name || 'Général';
            const frontendCategory = categoryMapping[backendCategory] || 'Général';
            return {
              id: item.id,
              title: item.title,
              excerpt: item.content?.substring(0, 100) + '...' || 'No excerpt available',
              category: frontendCategory,
              section: item.section?.name || sectionName,
              image: imageUrl,
              date: new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
              readTime: item.content ? `${Math.ceil(item.content.length / 200)} min de lecture` : '2 min de lecture',
              author: item.author_name || item.author?.username || 'Anonyme',
              duration: sectionName === 'videoactual' ? item.video_duration || '5:00' : null,
              location: sectionName === 'eventactual' ? item.location || 'Unknown Location' : null,
            };
          });
        };

        setContent({
          alauneactual: processItems(alauneactualData, 'alauneactual'),
          videoactual: processItems(videoactualData, 'videoactual'),
          eventactual: processItems(eventactualData, 'eventactual'),
          sections,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setContent((prev) => ({
          ...prev,
          loading: false,
          error: 'Erreur de chargement des données. Veuillez réessayer.',
        }));
      }
    };

    fetchAllData();
  }, [apiUrl]);

  // Check for mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Filter articles by category
  const filterByCategory = (articles) => {
    if (activeCategory === 'Toutes') return articles;
    return articles.filter((item) => item.category === activeCategory);
  };

  // Mobile Scroll Indicator
  const MobileScrollIndicator = ({ containerId }) => (
    <div className="flex items-center justify-center mt-1 mb-3 md:hidden">
      <div className="flex flex-col items-center">
        <p className="text-sm text-blue-200 mb-1">Faire défiler</p>
        <div className="flex items-center scroll-indicator" onClick={() => document.getElementById(containerId).scrollLeft += 100}>
          <ChevronLeft className="w-5 h-5 text-blue-300" />
          <ChevronRight className="w-6 h-6 text-blue-300" />
        </div>
      </div>
    </div>
  );

  // Slider navigation
  const handleSliderNavigation = (sliderRef, currentSlide, setCurrentSlide, data) => {
    const maxPossibleSlide = data.length - (isMobile ? 1 : 3);
    const handlePrev = () => {
      const newSlide = Math.max(0, currentSlide - 1);
      setCurrentSlide(newSlide);
      if (sliderRef.current) {
        const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 4);
        sliderRef.current.scrollTo({ left: newSlide * itemWidth, behavior: 'smooth' });
      }
    };
    const handleNext = () => {
      const newSlide = Math.min(maxPossibleSlide, currentSlide + 1);
      setCurrentSlide(newSlide);
      if (sliderRef.current) {
        const itemWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 4);
        sliderRef.current.scrollTo({ left: newSlide * itemWidth, behavior: 'smooth' });
      }
    };
    return { handlePrev, handleNext, maxPossibleSlide };
  };

  const { handlePrev: handleArticlePrev, handleNext: handleArticleNext, maxPossibleSlide: maxArticleSlide } = handleSliderNavigation(
    articleSliderRef,
    currentArticleSlide,
    setCurrentArticleSlide,
    filterByCategory(content.alauneactual)
  );
  const { handlePrev: handleVideoPrev, handleNext: handleVideoNext, maxPossibleSlide: maxVideoSlide } = handleSliderNavigation(
    videoSliderRef,
    currentVideoSlide,
    setCurrentVideoSlide,
    filterByCategory(content.videoactual)
  );
  const { handlePrev: handleEventPrev, handleNext: handleEventNext, maxPossibleSlide: maxEventSlide } = handleSliderNavigation(
    eventSliderRef,
    currentEventSlide,
    setCurrentEventSlide,
    filterByCategory(content.eventactual)
  );

  // Handle wheel scroll
  const handleWheelScroll = (event, containerId) => {
    const container = document.getElementById(containerId);
    if (container && event.deltaY !== 0) {
      event.preventDefault();
      container.scrollLeft += event.deltaY;
    }
  };

  // Loading and error states
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
        <div className="bg-white p-8 rounded-md shadow-lg text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-4">{content.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-blue-900">
      <Navigation />
      <style jsx>{`
        @keyframes scrollIndicator {
          0% { opacity: 0.7; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(10px); }
          100% { opacity: 0.7; transform: translateX(0); }
        }
        .scroll-indicator { animation: scrollIndicator 1.5s ease-in-out infinite; }
      `}</style>

      <div className="bg-blue-900 text-white hero-section">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-6 page-title-section">
            <div className="bg-white p-2 rounded-lg">
              <Newspaper className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold">Actualités</h1>
          </div>
          <p className="text-lg text-blue-100 max-w-3xl">
            Restez informé des derniers événements dans le monde de la culture urbaine gabonaise.
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-4 py-4">
            {actualitetypes.map((category, index) => (
              <button
                key={category}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* <AdBanner position="top" page="actualite" /> */}

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Newspaper className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Articles à la Une</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleArticlePrev}
                    className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={currentArticleSlide === 0}
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={handleArticleNext}
                    className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={currentArticleSlide >= maxArticleSlide}
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              <div className="relative overflow-hidden">
                <div
                  ref={articleSliderRef}
                  id="article-slider"
                  className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
                  onWheel={(e) => handleWheelScroll(e, 'article-slider')}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-blue-900 to-transparent z-10 pointer-events-none md:hidden" />
                  {filterByCategory(content.alauneactual).length === 0 ? (
                    <div className="flex w-full justify-center py-4">
                      <p className="text-white text-lg">Aucun article disponible pour {activeCategory}.</p>
                    </div>
                  ) : (
                    filterByCategory(content.alauneactual).map((item) => (
                      <div
                        key={item.id}
                        className="flex-none w-[85%] pr-4 snap-start md:w-1/4 md:pr-0"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <Link href={`/alauneactual/${item.id}`}>
                          <div className="group cursor-pointer relative rounded-xl overflow-hidden">
                            <div className="aspect-[3/4] relative">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => handleImageError(e, item.id, item.title, { width: 300, height: 400 }, '4f46e5')}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                                {item.category}
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Calendar className="w-3.5 h-3.5 text-white/80" />
                                <span className="text-white/80 text-xs">{item.date}</span>
                              </div>
                              <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                              <p className="text-white/80 text-sm line-clamp-2">{item.excerpt}</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <MobileScrollIndicator containerId="article-slider" />
              <div className="flex justify-center mt-4 md:hidden">
                {filterByCategory(content.alauneactual).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 mx-1 rounded-full ${index === currentArticleSlide ? 'bg-blue-300' : 'bg-blue-800'}`}
                  />
                ))}
              </div>
            </section>

            <section className="pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 p-2 rounded-lg">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Vidéos Récentes</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleVideoPrev}
                    className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={currentVideoSlide === 0}
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={handleVideoNext}
                    className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={currentVideoSlide >= maxVideoSlide}
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              <div className="relative overflow-hidden">
                <div
                  ref={videoSliderRef}
                  id="video-slider"
                  className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
                  onWheel={(e) => handleWheelScroll(e, 'video-slider')}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-blue-900 to-transparent z-10 pointer-events-none md:hidden" />
                  {filterByCategory(content.videoactual).length === 0 ? (
                    <div className="flex w-full justify-center py-4">
                      <p className="text-white text-lg">Aucune vidéo disponible pour {activeCategory}.</p>
                    </div>
                  ) : (
                    filterByCategory(content.videoactual).map((item) => (
                      <div
                        key={item.id}
                        className="flex-none w-[85%] pr-4 snap-start md:w-1/4 md:pr-0"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <Link href={`/videoactual/${item.id}`}>
                          <div className="group cursor-pointer relative rounded-xl overflow-hidden">
                            <div className="aspect-[3/4] relative">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => handleImageError(e, item.id, item.title, { width: 300, height: 400 }, '4f46e5')}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                                {item.category}
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white/80 text-xs">{item.date}</span>
                                <span className="text-white/80 text-xs flex items-center">
                                  <Play className="w-3.5 h-3.5 mr-1" />
                                  {item.duration}
                                </span>
                              </div>
                              <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <MobileScrollIndicator containerId="video-slider" />
              <div className="flex justify-center mt-4 md:hidden">
                {filterByCategory(content.videoactual).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 mx-1 rounded-full ${index === currentVideoSlide ? 'bg-blue-300' : 'bg-blue-800'}`}
                  />
                ))}
              </div>
            </section>

            {/* <AdBanner position="top" page="actualite" /> */}

            <section className="pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Actu</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleEventPrev}
                    className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={currentEventSlide === 0}
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={handleEventNext}
                    className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={currentEventSlide >= maxEventSlide}
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              <div className="relative overflow-hidden">
                <div
                  ref={eventSliderRef}
                  id="event-slider"
                  className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
                  onWheel={(e) => handleWheelScroll(e, 'event-slider')}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-blue-900 to-transparent z-10 pointer-events-none md:hidden" />
                  {filterByCategory(content.eventactual).length === 0 ? (
                    <div className="flex w-full justify-center py-4">
                      <p className="text-white text-lg">Aucun événement disponible pour {activeCategory}.</p>
                    </div>
                  ) : (
                    filterByCategory(content.eventactual).map((item) => (
                      <div
                        key={item.id}
                        className="flex-none w-[85%] pr-4 snap-start md:w-1/4 md:pr-0"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <Link href={`/eventactual/${item.id}`}>
                          <div className="group cursor-pointer relative rounded-xl overflow-hidden">
                            <div className="aspect-[3/4] relative">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => handleImageError(e, item.id, item.title, { width: 300, height: 400 }, '4f46e5')}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                                {item.category}
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                              <div className="flex items-center text-white text-sm mb-1">
                                <Clock className="w-4 h-4 mr-2" />
                                {item.date}
                              </div>
                              <div className="flex items-center text-white text-sm">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                                  />
                                </svg>
                                <span className="line-clamp-1">{item.location}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <MobileScrollIndicator containerId="event-slider" />
              <div className="flex justify-center mt-4 md:hidden">
                {filterByCategory(content.eventactual).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 mx-1 rounded-full ${index === currentEventSlide ? 'bg-blue-300' : 'bg-blue-800'}`}
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="w-full">
            <AdBanner position="bottom" page="actualite" />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ActualitePage;