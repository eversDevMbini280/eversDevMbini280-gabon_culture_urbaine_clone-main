"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, X, Search, Radio, ArrowRight, ArrowLeft, LogIn, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Hook pour gérer la visibilité de la navbar au scroll avec UX professionnel
const useNavbarVisibility = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimer;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Détecter si on est en train de scroller
      setIsScrolling(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setIsScrolling(false), 150);

      // Seuil intelligent basé sur la taille de l'écran
      const scrollThreshold = window.innerWidth < 768 ? 60 : 100;
      const deltaY = currentScrollY - lastScrollY;

      // Amélioration de la détection de direction avec une tolérance
      if (Math.abs(deltaY) > 5) { // Éviter les micro-scrolls
        const newDirection = deltaY > 0 ? 'down' : 'up';
        setScrollDirection(newDirection);

        // Logique de visibilité améliorée
        if (currentScrollY < scrollThreshold) {
          // Toujours visible en haut de page
          setIsNavbarVisible(true);
        } else if (newDirection === 'down' && currentScrollY > scrollThreshold) {
          // Masquer seulement si on scroll significativement vers le bas
          if (deltaY > 10) { // Seuil pour éviter les animations intempestives
            setIsNavbarVisible(false);
          }
        } else if (newDirection === 'up') {
          // Afficher dès qu'on remonte, même légèrement
          setIsNavbarVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    // Debounce pour performance optimisée
    const debouncedHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(scrollTimer);
    };
  }, [lastScrollY]);

  return { isNavbarVisible, scrollDirection, isScrolling };
};

// Hook pour gérer la visibilité de la section flash info (publicité)
const useFlashInfoVisibility = () => {
  // La section publicité reste TOUJOURS visible
  const [isFlashInfoVisible, setIsFlashInfoVisible] = useState(true);

  // Pas de gestion de scroll pour la section publicité
  return isFlashInfoVisible;
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathname = usePathname();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com';
  const newsIntervalRef = useRef(null);

  // Utiliser les hooks pour la visibilité séparée
  const { isNavbarVisible, scrollDirection, isScrolling } = useNavbarVisibility(); // Navbar disparaît au scroll
  const isFlashInfoVisible = useFlashInfoVisibility(); // Section pub reste visible

  // Effet pour gérer la classe du body selon la visibilité navbar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Toujours ajouter la classe page-with-navbar
      document.body.classList.add('page-with-navbar');

      if (isNavbarVisible) {
        document.body.classList.remove('navbar-hidden');
      } else {
        document.body.classList.add('navbar-hidden');
      }
    }

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        document.body.classList.remove('page-with-navbar', 'navbar-hidden');
      }
    };
  }, [isNavbarVisible]);

  // State for latest news content
  const [content, setContent] = useState({
    latestNews: []
  });

  // State for responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Détection responsive intelligente
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch latest news from the actualitehome endpoint
  useEffect(() => {
    const fetchWithErrorHandling = async (url, endpoint) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      } catch (err) {
        if (err.name === 'AbortError') {
          console.error(`Request timeout for ${endpoint}`);
        } else {
          console.error(`Error fetching ${endpoint}:`, err);
        }
        throw err;
      }
    };

    const fetchLatestNews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const latestNewsData = await fetchWithErrorHandling(
          `${apiUrl}/api/actualitehome/?status=published`,
          'latest news'
        );

        const processedData = Array.isArray(latestNewsData)
          ? latestNewsData.map((item) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            title: item.title || 'Titre non disponible',
            description: item.description || 'Description non disponible',
            category: item.category?.name || 'Actualité',
          }))
          : [];

        setContent({ latestNews: processedData });
      } catch (error) {
        console.error('Error processing latest news:', error);
        setError('Impossible de charger les actualités');
        setContent({ latestNews: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestNews();
  }, [apiUrl]);

  // Auto-scroll news for mobile - improved with cleanup
  useEffect(() => {
    // Clear existing interval
    if (newsIntervalRef.current) {
      clearInterval(newsIntervalRef.current);
    }

    if (content.latestNews.length > 1) {
      newsIntervalRef.current = setInterval(() => {
        setCurrentNewsIndex((prevIndex) =>
          (prevIndex + 1) % content.latestNews.length
        );
      }, 5000);
    }

    return () => {
      if (newsIntervalRef.current) {
        clearInterval(newsIntervalRef.current);
      }
    };
  }, [content.latestNews.length]);

  // Update date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const timeString = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const dateString = now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      setCurrentTime(timeString);
      setCurrentDate(dateString);
    };

    updateDateTime();

    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Reset news index when content changes
  useEffect(() => {
    setCurrentNewsIndex(0);
  }, [content.latestNews]);

  const mainCategories = [
    { id: 1, name: 'Actualité', link: '/actualite' },
    { id: 2, name: 'Culture Urbaine', link: '/culture-urbaine' },
    { id: 3, name: 'Arts et Traditions', link: '/arts-traditions' },
    { id: 4, name: 'Sciences', link: '/sciences' },
    { id: 5, name: 'Événements', link: '/evenements' },
    { id: 6, name: 'Entrepreneuriat', link: '/entrepreneuriat' },
  ];

  const isActive = (path) => {
    return pathname === path;
  };

  // Manual navigation functions for mobile news
  const goToNextNews = useCallback(() => {
    setCurrentNewsIndex((prevIndex) =>
      (prevIndex + 1) % content.latestNews.length
    );
  }, [content.latestNews.length]);

  const goToPrevNews = useCallback(() => {
    setCurrentNewsIndex((prevIndex) =>
      prevIndex === 0 ? content.latestNews.length - 1 : prevIndex - 1
    );
  }, [content.latestNews.length]);

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Render news ticker for desktop
  const renderDesktopNewsTicker = () => {
    if (isLoading) {
      return (
        <span className="text-white text-sm animate-pulse">
          Chargement des actualités...
        </span>
      );
    }

    if (error) {
      return (
        <span className="text-red-300 text-sm">
          {error}
        </span>
      );
    }

    if (content.latestNews.length === 0) {
      return (
        <span className="text-white text-sm">
          Aucune actualité disponible
        </span>
      );
    }

    return (
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: ['0%', `-${100 * content.latestNews.length}%`]
        }}
        transition={{
          duration: content.latestNews.length * 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {content.latestNews.map((item) => (
          <span key={item.id} className="text-white text-sm mr-16 flex-shrink-0">
            <span className="text-yellow-400 font-medium">{item.category}:</span>
            {' '}{item.title} - {item.description}
          </span>
        ))}
      </motion.div>
    );
  };

  // Render mobile news content - OPTIMIZED AND COMPACT
  const renderMobileNewsContent = () => {
    if (isLoading) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-blue-200 p-2">
          <div className="flex items-center justify-center py-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2"></div>
            <span className="text-blue-700 text-xs font-medium">
              Chargement...
            </span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-red-200 p-2">
          <div className="flex items-center justify-center py-1">
            <TrendingUp className="w-3 h-3 text-red-400 mr-2" />
            <span className="text-red-700 text-xs font-medium">
              Erreur de chargement
            </span>
          </div>
        </div>
      );
    }

    if (content.latestNews.length === 0) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-blue-200 p-2">
          <div className="flex items-center justify-center py-1">
            <TrendingUp className="w-3 h-3 text-blue-400 mr-2" />
            <span className="text-blue-700 text-xs font-medium">
              Aucune actualité
            </span>
          </div>
        </div>
      );
    }

    const currentNews = content.latestNews[currentNewsIndex];
    if (!currentNews) return null;

    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-blue-200 overflow-hidden">
        {/* Compact Navigation Controls */}
        {content.latestNews.length > 1 && (
          <div className="flex items-center justify-between bg-blue-50 px-2 py-1 border-b border-blue-100">
            <button
              onClick={goToPrevNews}
              className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors active:scale-95"
              aria-label="Article précédent"
            >
              <ChevronLeft className="w-3 h-3 text-blue-700" />
            </button>

            <div className="flex items-center gap-1">
              {content.latestNews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentNewsIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${index === currentNewsIndex
                    ? 'bg-blue-600 w-3'
                    : 'bg-blue-300 hover:bg-blue-400'
                    }`}
                  aria-label={`Aller à l'article ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNextNews}
              className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors active:scale-95"
              aria-label="Article suivant"
            >
              <ChevronRight className="w-3 h-3 text-blue-700" />
            </button>
          </div>
        )}

        {/* Compact News Content */}
        <div className="relative h-16 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNewsIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3
              }}
              className="absolute inset-0 p-2 flex items-center"
            >
              <div className="flex items-center gap-2 w-full">
                <span className="inline-block px-1.5 py-0.5 bg-blue-600 text-white font-medium text-xs rounded uppercase flex-shrink-0">
                  {currentNews.category}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium text-xs leading-tight line-clamp-2">
                    {currentNews.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <nav className="w-full z-50 fixed top-0 left-0 right-0">
      {/* Header sections - TOUJOURS VISIBLES */}
      <div className="overflow-hidden">
        {/* Top Bar */}
        <div className="bg-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-1 flex justify-between items-center">
            <div className="text-sm font-medium capitalize">{currentDate}</div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium font-mono">{currentTime}</div>
              <Link
                href="/adm"
                className="group relative transition-all"
                title="Connexion administrateur"
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
                >
                  <LogIn className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  <span className="hidden md:inline text-sm font-medium tracking-tight">
                    Connexion
                  </span>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>

        {/* Logo and Website Name Bar */}
        <div className="bg-[#151f3f] text-black">
          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center group">
                  <img
                    src="/images/logo2.png"
                    alt="GCUWEBTV Logo"
                    className="h-16 w-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="ml-2 flex items-center text-sm text-white font-medium">
                    <ArrowLeft className="h-3 w-3 ml-1 transform group-hover:-translate-x-1 transition-transform" />
                    <span>Accueil</span>
                  </div>
                </Link>
              </div>

              {/* Flash Info Desktop - TOUJOURS VISIBLE */}
              <AnimatePresence>
                {isFlashInfoVisible && (
                  <motion.div
                    className="flex-1 mx-8 overflow-hidden"
                    initial={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="flex items-center bg-blue-800/30 rounded-lg px-4 py-2">
                      <div className="flex items-center mr-4 flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-yellow-400 mr-2" />
                        <span className="text-yellow-400 font-bold text-sm">FLASH INFO</span>
                      </div>
                      <div className="overflow-hidden flex-1">
                        {renderDesktopNewsTicker()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-gray-800 text-xl font-bold flex-shrink-0">
                <div className="flex space-x-2">
                  <span style={{ color: '#ffffff' }}>GABON</span>
                  <span style={{ color: '#ffffff' }}>CULTURE</span>
                  <span style={{ color: '#ffffff' }}>URBAINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout - OPTIMIZED */}
          <div className="md:hidden">
            {/* Logo Row */}
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center group">
                  <img
                    src="/images/logo2.png"
                    alt="GCUWEBTV Logo"
                    className="h-12 w-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="ml-2 flex items-center text-xs text-white font-medium">
                    <ArrowLeft className="h-2 w-2 ml-1 transform group-hover:-translate-x-1 transition-transform" />
                    <span>Accueil</span>
                  </div>
                </Link>
              </div>

              <div className="text-gray-800 text-lg font-bold flex-shrink-0">
                <div className="flex space-x-1">
                  <span style={{ color: '#ffffff' }}>GABON</span>
                  <span style={{ color: '#ffffff' }}>CULTURE</span>
                  <span style={{ color: '#ffffff' }}>URBAINE</span>
                </div>
              </div>
            </div>

            {/* Flash Info Mobile - TOUJOURS VISIBLE */}
            <AnimatePresence>
              {isFlashInfoVisible && (
                <motion.div
                  className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-t border-blue-700"
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-4 py-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center bg-yellow-400 px-2 py-1 rounded-full shadow-sm">
                        <TrendingUp className="w-3 h-3 text-blue-900 mr-1" />
                        <span className="text-blue-900 font-bold text-xs tracking-wide uppercase">
                          FLASH INFO
                        </span>
                      </div>

                      {content.latestNews.length > 0 && (
                        <div className="text-white text-xs opacity-75">
                          {currentNewsIndex + 1}/{content.latestNews.length}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      {renderMobileNewsContent()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <hr className="border-0 h-1 bg-gray-200 m-0" />
      </div>

      {/* Main Navigation - SEULE SECTION QUI DISPARAÎT */}
      <motion.div
        className={`bg-white border-b border-gray-200 transition-shadow duration-300 ${isScrolling ? 'shadow-lg' : 'shadow-sm'
          } ${!isNavbarVisible ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: isNavbarVisible ? 0 : (isMobile ? -70 : -80),
          opacity: isNavbarVisible ? 1 : 0,
          scale: isNavbarVisible ? 1 : 0.98,
        }}
        transition={{
          duration: isMobile ? 0.25 : (isNavbarVisible ? 0.4 : 0.3),
          ease: isNavbarVisible
            ? [0.16, 1, 0.3, 1] // easeOutExpo pour apparition fluide
            : [0.7, 0, 0.84, 0], // easeInExpo pour disparition rapide
          opacity: {
            duration: isMobile ? 0.2 : (isNavbarVisible ? 0.3 : 0.2),
            ease: "easeInOut"
          },
          scale: {
            duration: 0.15,
            ease: "easeOut"
          }
        }}
        style={{
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform3d: 'translateZ(0)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-8">
                {mainCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={category.link}
                    className={`font-medium transition-colors duration-200 ${isActive(category.link)
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-900 hover:text-blue-600"
                      }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/direct-tv"
                className={`hidden md:flex items-center px-6 py-2 rounded-md font-medium transition-all duration-300 hover:shadow-md ${isActive('/direct-tv')
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                <Radio className="h-4 w-4 mr-2" />
                {isActive('/direct-tv') ? 'EN DIRECT' : 'Direct TV'}
              </Link>
              <button className="text-gray-600 hover:text-blue-600 transition-colors transform hover:scale-105 active:scale-95">
                <Search className="h-5 w-5" />
              </button>

              {/* Indicateur de scroll subtil sur mobile */}
              {isMobile && scrollDirection === 'down' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden md:block w-1 h-1 bg-blue-400 rounded-full"
                />
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`md:hidden px-3 py-2 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 ${isOpen
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-blue-600"
                  }`}
                aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
              transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                height: { duration: 0.4 },
                opacity: { duration: 0.3, delay: 0.1 },
                y: { duration: 0.3, delay: 0.1 }
              }
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: -10,
              transition: {
                duration: 0.25,
                ease: [0.7, 0, 0.84, 0],
                height: { duration: 0.25, delay: 0.05 },
                opacity: { duration: 0.15 },
                y: { duration: 0.15 }
              }
            }}
            className="md:hidden bg-[#151f3f] overflow-hidden shadow-xl"
            style={{
              willChange: 'transform, opacity, height',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="px-4 py-2 space-y-1">
              {mainCategories.map((category) => (
                <Link
                  key={category.id}
                  href={category.link}
                  className={`block px-3 py-2 rounded-md transition-colors font-medium ${isActive(category.link)
                    ? "bg-blue-600 text-white border-l-4 border-blue-300"
                    : "text-white hover:bg-blue-700/30 hover:text-blue-200"
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/direct-tv"
                className={`flex items-center px-3 py-2 mt-2 rounded-md font-medium transition-colors ${isActive('/direct-tv')
                  ? "bg-red-600 text-white border-l-4 border-red-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <Radio className="h-4 w-4 mr-2" />
                {isActive('/direct-tv') ? 'EN DIRECT' : 'DIRECT TV'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </nav>
  );
};

export default Navigation;
