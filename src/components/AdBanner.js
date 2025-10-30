'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const AdBanner = ({ position = 'sidebar', page = 'all', sticky = false, className = '' }) => {
  const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com';

  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/advertisements/public?page=${page}`);
        if (!response.ok) throw new Error(`Failed to fetch ads: ${response.status}`);
        const data = await response.json();
        setAds(data);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAds();
  }, [apiUrl, page]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  // Effet pour la visibilité avec scroll (seulement si pas sticky)
  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      // Pour les bannières sticky, elles restent toujours visibles
      setIsVisible(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  const handleImageError = (e) => {
    if (e.target.src !== FALLBACK_IMAGE) {
      e.target.src = FALLBACK_IMAGE;
    }
  };

  const getImageUrl = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith('http')) return imageUrl;
    return `${apiUrl}${imageUrl}`;
  };

  const getContainerClasses = () => {
    let baseClasses = '';

    switch (position) {
      case 'top':
        baseClasses = 'w-full h-auto overflow-hidden';
        break;
      case 'bottom':
        baseClasses = 'w-full h-auto overflow-hidden';
        break;
      case 'sidebar':
        baseClasses = 'w-full max-w-[300px] mx-auto h-auto';
        break;
      case 'inline':
        baseClasses = 'w-full max-w-[400px] mx-auto h-auto';
        break;
      case 'floating':
        baseClasses = 'fixed bottom-4 right-4 w-[280px] h-auto z-50 shadow-2xl';
        break;
      default:
        baseClasses = 'w-full max-w-[300px] mx-auto h-auto';
    }

    // Ajouter les classes sticky si nécessaire
    if (sticky && position !== 'floating') {
      baseClasses += ' sticky top-20 z-30';
    }

    return `${baseClasses} ${className}`;
  };

  const getLoadingClasses = () => {
    switch (position) {
      case 'top':
      case 'bottom':
        return 'w-full h-[100px] md:h-[120px] bg-gray-200 animate-pulse rounded-lg';
      case 'sidebar':
        return 'w-full h-[250px] bg-gray-200 animate-pulse rounded-lg';
      case 'inline':
        return 'w-full h-[200px] bg-gray-200 animate-pulse rounded-lg';
      case 'floating':
        return 'w-full h-[200px] bg-gray-200 animate-pulse rounded-lg shadow-lg';
      default:
        return 'w-full h-[150px] bg-gray-200 animate-pulse rounded-lg';
    }
  };

  const getImageClasses = () => {
    let baseImageClasses = '';

    switch (position) {
      case 'top':
      case 'bottom':
        baseImageClasses = 'w-full h-auto object-cover rounded-lg transition-opacity duration-200';
        break;
      case 'sidebar':
      case 'inline':
        baseImageClasses = 'w-full h-auto object-contain rounded-lg transition-opacity duration-200';
        break;
      case 'floating':
        baseImageClasses = 'w-full h-auto object-cover rounded-lg transition-all duration-200 hover:scale-105';
        break;
      default:
        baseImageClasses = 'w-full h-auto object-contain rounded-lg transition-opacity duration-200';
    }

    return baseImageClasses;
  };

  // Si pas visible et pas sticky, ne pas afficher
  if (!isVisible && !sticky) {
    return null;
  }

  if (isLoading) {
    return <div className={getLoadingClasses()} />;
  }

  if (error || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];
  if (!currentAd || !currentAd.image_url) return null;

  const imageUrl = getImageUrl(currentAd.image_url);

  const adContent = (
    <div className={`${getContainerClasses()} transition-all duration-300`}>
      {/* Indicateur pour les bannières floating */}
      {position === 'floating' && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
          Pub
        </div>
      )}

      {/* Indicateur pour les bannières sticky */}
      {sticky && position !== 'floating' && (
        <div className="text-center mb-2">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            Publicité
          </span>
        </div>
      )}

      <div className="relative group">
        <img
          src={imageUrl}
          alt={currentAd.title || 'Publicité'}
          className={getImageClasses()}
          onError={handleImageError}
          loading="lazy"
        />

        {/* Overlay pour les bannières interactives */}
        {currentAd.link_url && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg" />
        )}

        {/* Indicateur de clic pour les bannières avec lien */}
        {currentAd.link_url && (
          <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Cliquer pour en savoir plus
          </div>
        )}
      </div>

      {/* Indicateurs de pagination pour plusieurs publicités */}
      {ads.length > 1 && (
        <div className="flex justify-center mt-3 gap-1">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentAdIndex
                  ? 'bg-blue-600 scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
                }`}
              aria-label={`Voir la publicité ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Bouton de fermeture pour les bannières floating */}
      {position === 'floating' && (
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -left-2 bg-gray-600 hover:bg-gray-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
          aria-label="Fermer la publicité"
        >
          ×
        </button>
      )}
    </div>
  );

  // Si la bannière a un lien, l'envelopper dans un Link
  if (currentAd.link_url) {
    return (
      <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer">
        {adContent}
      </Link>
    );
  }

  return adContent;
};

export default AdBanner;
