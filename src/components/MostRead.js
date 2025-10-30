'use client'
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MostRead = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://gabon-culture-urbaine-1.onrender.com";
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());

  useEffect(() => {
    const fetchMostRead = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/articles/mostread?status=published`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Failed to fetch most read articles');
        }

        const data = await res.json();
        const processed = data.map(item => ({
          id: item.id,
          title: item.title,
          image: item.image_url 
            ? `${API_BASE_URL}${item.image_url}`
            : `${API_BASE_URL}/api/placeholder/300/400?text=${encodeURIComponent(item.title)}&color=162146`,
          category: item.category?.name || "Les Plus lus",
          views: item.views ? `${item.views.toLocaleString()} vues` : "0 vues",
          date: new Date(item.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          isMostRead: item.views >= 50  // Add this flag
        }));

        setArticles(processed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMostRead();
  }, [API_BASE_URL]);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleImageError = (e, articleId) => {
    if (!failedImages.has(articleId)) {
      setFailedImages(prev => new Set(prev).add(articleId));
      e.target.src = `${API_BASE_URL}/api/placeholder/300/400?text=${encodeURIComponent('Most Read')}&color=162146`;
    }
  };

  const handlePrev = () => {
    const slideWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3);
    sliderRef.current.scrollBy({ left: -slideWidth, behavior: 'smooth' });
  };

  const handleNext = () => {
    const slideWidth = sliderRef.current.clientWidth / (isMobile ? 1 : 3);
    sliderRef.current.scrollBy({ left: slideWidth, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="py-12 bg-blue-900 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-blue-900 text-center text-white">
        <p>Error loading most read articles: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="py-12 bg-blue-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Les Plus Lus</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button 
              onClick={handleNext}
              className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={currentSlide >= Math.max(0, articles.length - (isMobile ? 1 : 3))}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div 
          ref={sliderRef}
          className="flex overflow-x-auto pb-6 pl-4 scrollbar-hide snap-x snap-mandatory gap-4"
          onScroll={(e) => {
            const scrollPos = e.target.scrollLeft;
            const slideWidth = e.target.clientWidth / (isMobile ? 1 : 3);
            setCurrentSlide(Math.round(scrollPos / slideWidth));
          }}
        >
          {articles.map((article) => (
            <motion.div 
              key={article.id}
              className="flex-none w-[300px] snap-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/mostread/${article.id}`}>
                <div className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => handleImageError(e, article.id)}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                    <div className="absolute top-4 left-4 bg-[#162146] text-white text-sm font-medium px-3 py-1 rounded-full">
                      {article.views}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">{article.date}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostRead;