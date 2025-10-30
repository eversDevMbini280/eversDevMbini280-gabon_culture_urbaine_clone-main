'use client';
import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Music, Video, Camera, Mic, User, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const CultureUrbainePage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [artists, setArtists] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [activeType, setActiveType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [urbanCategoryId, setUrbanCategoryId] = useState(null);
  const artistsSliderRef = useRef(null);
  const contentSliderRef = useRef(null);
  const [artistsCurrentSlide, setArtistsCurrentSlide] = useState(0);
  const [contentCurrentSlide, setContentCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const artistTypes = [
    { id: 'all', name: 'Tout', icon: null },
    { id: 'music', name: 'Artiste - Musique', field: 'Lmusic', icon: <Music className="w-4 h-4 mr-2" /> },
    { id: 'dance', name: 'Artiste - Danse', field: 'Ldance', icon: <Video className="w-4 h-4 mr-2" /> },
    { id: 'afrotcham', name: 'Artiste - Afrotcham', field: 'Lafrotcham', icon: <Camera className="w-4 h-4 mr-2" /> },
    { id: 'rap', name: 'Artiste - Rap', field: 'Lrap', icon: <Mic className="w-4 h-4 mr-2" /> },
  ];

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories to find "Culture Urbaine"
        const categoriesRes = await fetch(`${apiUrl}/api/categories/`);
        if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
        const categoriesData = await categoriesRes.json();
        const urbanCategory = categoriesData.find(c => c.name === 'Culture Urbaine');
        if (!urbanCategory) throw new Error('Culture Urbaine category not found');
        setUrbanCategoryId(urbanCategory.id);

        // Fetch artist articles for "Culture Urbaine" using Lmusic, Ldance, Lafrotcham, or Lrap
        let artistsUrl = `${apiUrl}/culture_urbaine_articles/?category_id=${urbanCategory.id}&status=published`;
        if (activeType !== 'all') {
          const field = artistTypes.find(type => type.id === activeType)?.field;
          if (field) artistsUrl += `&${field}=true`;
        } else {
          // For 'all', fetch articles with any artist-related tag
          artistsUrl += '&Lmusic=true&Ldance=true&Lafrotcham=true&Lrap=true';
        }
        const artistsRes = await fetch(artistsUrl);
        if (!artistsRes.ok) throw new Error(`Failed to fetch artists: ${artistsRes.status}`);
        const artistsData = await artistsRes.json();
        const normalizedArtists = artistsData.map(artist => ({
          ...artist,
          image_url: artist.image_url
            ? (artist.image_url.startsWith('http') || artist.image_url.startsWith('//')
              ? artist.image_url
              : `${apiUrl}${artist.image_url.startsWith('/') ? artist.image_url : `/${artist.image_url}`}`)
            : FALLBACK_IMAGE,
        }));
        setArtists(normalizedArtists || []);

        // Fetch latest articles (recent, filter by Lafrotcham if activeType is afrotcham)
        let articlesUrl = `${apiUrl}/culture_urbaine_articles/?recent=true&limit=3&status=published`;
        if (activeType === 'afrotcham') {
          articlesUrl += '&Lafrotcham=true';
        }
        const articlesRes = await fetch(articlesUrl);
        if (!articlesRes.ok) throw new Error(`Failed to fetch articles: ${articlesRes.status}`);
        const articlesData = await articlesRes.json();
        const normalizedArticles = articlesData.map(article => ({
          ...article,
          image_url: article.image_url
            ? (article.image_url.startsWith('http') || article.image_url.startsWith('//')
              ? article.image_url
              : `${apiUrl}${article.image_url.startsWith('/') ? article.image_url : `/${article.image_url}`}`)
            : FALLBACK_IMAGE,
          category: article.category?.name || article.category || 'Inconnu',
          date: article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR') : 'Inconnu',
        }));
        setLatestArticles(normalizedArticles || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Impossible de charger les contenus. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl, activeType]);

  const handleImageError = (e, itemId) => {
    if (e.target.dataset.placeholderAttempted) return;
    console.warn(`Image failed for item ${itemId}: ${e.target.src}`);
    e.target.src = FALLBACK_IMAGE;
    e.target.dataset.placeholderAttempted = 'true';
    e.target.className = `${e.target.className} object-contain bg-gray-200`;
    e.target.loading = 'lazy';
  };

  const handleSliderNav = (sliderRef, newSlide, itemsCount) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const itemsPerView = isMobile ? 1 : 4;
    const itemWidth = container.clientWidth / itemsPerView;
    const maxSlide = Math.max(0, itemsCount - itemsPerView);
    const clampedSlide = Math.min(Math.max(newSlide, 0), maxSlide);
    container.scrollTo({ left: clampedSlide * itemWidth, behavior: 'smooth' });
    return clampedSlide;
  };

  const filteredArtists = activeType === 'all'
    ? artists
    : artists.filter(artist => artist[artistTypes.find(type => type.id === activeType)?.field]);

  const MobileScrollIndicator = ({ containerId }) => (
    <div className="flex items-center justify-center mt-1 mb-3 md:hidden">
      <div className="flex flex-col items-center">
        <p className="text-sm text-blue-200 mb-1">Faire défiler</p>
        <div className="flex items-center">
          <ChevronLeft className="w-5 h-5 text-blue-300" />
          <div className="flex items-center scroll-indicator" onClick={() => document.getElementById(containerId).scrollLeft += 100}>
            <ChevronRight className="w-6 h-6 text-blue-300" />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  if (error) return <div className="min-h-screen bg-blue-900 flex items-center justify-center text-white">Error: {error}</div>;

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
          <div className="flex items-center gap-3 mb-4 page-title-section">
            <div className="bg-white p-2 rounded-lg">
              <Music className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold">Culture Urbaine</h1>
          </div>
          <p className="text-lg text-blue-100 max-w-3xl">
            Découvrez l'effervescence de la scène urbaine gabonaise à travers la musique, la danse, le graffiti et toutes les expressions artistiques qui font vibrer notre culture.
          </p>
        </div>
      </div>

      <div className="relative h-96">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-800/80" />
        <img
          src={`${apiUrl}/api/images/culture.jpg`}
          alt="Culture Urbaine Background"
          className="w-full h-full object-cover"
          onError={(e) => handleImageError(e, 'culture-bg')}
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-6 animate-fadeIn">L'Art Urbain Gabonais</h2>
            <div className="flex justify-center gap-8">
              {['Musique', 'Danse', 'Afrotcham', 'Rap'].map((item, index) => (
                <div key={item} className="text-white font-medium text-xl opacity-0 animate-slideUp" style={{ animationDelay: `${index * 0.2}s` }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="relative bg-blue-600 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <AdBanner position="center" page="culture_urbaine" />
        </div>
      </div> */}

      <section className="py-16 bg-blue-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Artistes à Découvrir</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setArtistsCurrentSlide(s => handleSliderNav(artistsSliderRef, s - 1, filteredArtists.length))}
                className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={artistsCurrentSlide === 0}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setArtistsCurrentSlide(s => handleSliderNav(artistsSliderRef, s + 1, filteredArtists.length))}
                className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={artistsCurrentSlide >= filteredArtists.length - (isMobile ? 1 : 4)}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {artistTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeType === type.id ? 'bg-blue-600 text-white' : 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                  }`}
              >
                {type.icon} {type.name.split(' - ')[1] || type.name}
              </button>
            ))}
          </div>

          <div className="relative">
            <div
              ref={artistsSliderRef}
              id="artists-scroll-container"
              className="flex overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory pl-4"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {filteredArtists.map(artist => (
                <div key={artist.id} className="flex-none w-[85%] pr-4 snap-start md:w-1/4 md:pr-0">
                  <Link href={`/artiste/${artist.id}`}>
                    <div className="group cursor-pointer relative rounded-xl overflow-hidden h-full">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={artist.image_url}
                          alt={artist.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => handleImageError(e, artist.id)}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                          {artistTypes.find(type => artist[type.field])?.name.split(' - ')[1] || 'Artiste'}
                        </div>
                      </div>
                      {/* <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">{artist.title}</h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <User className="w-4 h-4 mr-2" />
                          {artist.views || 0} vues
                        </div>
                      </div> */}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <MobileScrollIndicator containerId="artists-scroll-container" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">{activeType === 'afrotcham' ? 'Contenus Afrotcham Récents' : 'Contenus Récents'}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setContentCurrentSlide(s => handleSliderNav(contentSliderRef, s - 1, latestArticles.length))}
                className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={contentCurrentSlide === 0}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setContentCurrentSlide(s => handleSliderNav(contentSliderRef, s + 1, latestArticles.length))}
                className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={contentCurrentSlide >= latestArticles.length - (isMobile ? 1 : 3)}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={contentSliderRef}
              id="content-scroll-container"
              className="flex overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory pl-4"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {latestArticles.map(item => (
                <div key={item.id} className="flex-none w-[85%] pr-4 snap-start md:w-1/3 md:pr-0">
                  <Link href={`/contenurecent/${item.id}${activeType === 'afrotcham' ? '?filter=afrotcham' : ''}`}>
                    <div className="group cursor-pointer relative rounded-xl overflow-hidden h-full">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => handleImageError(e, item.id)}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">{item.category}</div>
                        {item.duration && <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">{item.duration}</div>}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">{item.title}</h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          {item.date}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <MobileScrollIndicator containerId="content-scroll-container" />
          </div>
        </div>
      </section>

      <div className="w-fully">
        <AdBanner position="bottom" page="culture_urbaine" />
      </div>

      <Footer />
    </main>
  );
};

export default CultureUrbainePage;





// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Music, Calendar, User } from 'lucide-react';
// import AudioPlayer from './AudioPlayer'; // Adjust path as needed

// const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// const CultureUrbainePage = () => {
//   const apiUrl = 'https://gabon-culture-api.onrender.com/api';
//   const [urbanCategoryId, setUrbanCategoryId] = useState(null);
//   const [artists, setArtists] = useState([]);
//   const [latestArticles, setLatestArticles] = useState([]);
//   const [songs, setSongs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeType, setActiveType] = useState('all');

//   const artistTypes = [
//     { id: 'all', name: 'Tous', field: null },
//     { id: 'music', name: 'Musique', field: 'Lmusic' },
//     { id: 'dance', name: 'Danse', field: 'Ldance' },
//     { id: 'rap', name: 'Rap', field: 'Lrap' },
//     { id: 'afrotcham', name: 'Afrotcham', field: 'Lafrotcham' },
//   ];

//   useEffect(() => {
//     const fetchData = async (retries = 3) => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Fetch categories
//         const categoriesRes = await fetch(`${apiUrl}/categories/`);
//         if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
//         const categoriesData = await categoriesRes.json();
//         const urbanCategory = categoriesData.find(c => c.name === 'Culture Urbaine');
//         if (!urbanCategory) throw new Error('Culture Urbaine category not found');
//         setUrbanCategoryId(urbanCategory.id);

//         // Fetch artists
//         let artistsUrl = `${apiUrl}/culture_urbaine_articles/?category_id=${urbanCategory.id}&status=published`;
//         if (activeType !== 'all') {
//           const field = artistTypes.find(type => type.id === activeType)?.field;
//           if (field) artistsUrl += `&${field}=true`;
//         } else {
//           artistsUrl += '&Lmusic=true&Ldance=true&Lafrotcham=true&Lrap=true';
//         }
//         const artistsRes = await fetch(artistsUrl);
//         if (!artistsRes.ok) throw new Error(`Failed to fetch artists: ${artistsRes.status}`);
//         const artistsData = await artistsRes.json();
//         const normalizedArtists = artistsData.map(artist => ({
//           ...artist,
//           image_url: artist.image_url
//             ? `${apiUrl}${artist.image_url.startsWith('/') ? artist.image_url : `/${artist.image_url}`}`
//             : FALLBACK_IMAGE,
//         }));
//         setArtists(normalizedArtists || []);

//         // Fetch latest articles
//         let articlesUrl = `${apiUrl}/culture_urbaine_articles/?recent=true&limit=3&status=published`;
//         if (activeType === 'afrotcham') articlesUrl += '&Lafrotcham=true';
//         const articlesRes = await fetch(articlesUrl);
//         if (!articlesRes.ok) throw new Error(`Failed to fetch articles: ${articlesRes.status}`);
//         const articlesData = await articlesRes.json();
//         const normalizedArticles = articlesData.map(article => ({
//           ...article,
//           image_url: article.image_url
//             ? `${apiUrl}${article.image_url.startsWith('/') ? article.image_url : `/${article.image_url}`}`
//             : FALLBACK_IMAGE,
//           category: article.category?.name || article.category || 'Inconnu',
//           date: article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR') : 'Inconnu',
//         }));
//         setLatestArticles(normalizedArticles || []);

//         // Fetch songs
//         const songsUrl = `${apiUrl}/culture_urbaine_articles/songs?category_id=${urbanCategory.id}&limit=10&status=published`;
//         console.log('Fetching songs from:', songsUrl);
//         const songsRes = await fetch(songsUrl);
//         if (!songsRes.ok) {
//           const errorData = await songsRes.json().catch(() => ({}));
//           console.error('Songs fetch error:', songsRes.status, errorData);
//           throw new Error(`Failed to fetch songs: ${songsRes.status} - ${JSON.stringify(errorData)}`);
//         }
//         const songsData = await songsRes.json();
//         const normalizedSongs = songsData.map(song => ({
//           id: song.id,
//           title: song.title,
//           author_name: song.artist_name || 'Unknown Artist',
//           image_url: song.image_url
//             ? `${apiUrl}${song.image_url.startsWith('/') ? song.image_url : `/${song.image_url}`}`
//             : FALLBACK_IMAGE,
//           audio_url: song.audio_url
//             ? `${apiUrl}${song.audio_url.startsWith('/') ? song.audio_url : `/${song.audio_url}`}`
//             : null,
//         }));
//         setSongs(normalizedSongs || []);
//       } catch (err) {
//         console.error('Error fetching data:', err.message, err);
//         if (retries > 0 && err.message.includes('ERR_QUIC_PROTOCOL_ERROR')) {
//           console.log(`Retrying fetchData (${retries} attempts left)`);
//           return fetchData(retries - 1);
//         }
//         setError('Impossible de charger les contenus. Veuillez réessayer plus tard.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [apiUrl, activeType]);

//   const handleTypeChange = (type) => {
//     setActiveType(type);
//   };

//   return (
//     <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <div className="container mx-auto px-4 py-8">
//         <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
//           Culture Urbaine
//         </h1>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//             {error}
//           </div>
//         )}

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
//           </div>
//         ) : (
//           <>
//             {/* Audio Player */}
//             <section className="mb-12">
//               <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
//                 <Music className="w-6 h-6 mr-2" />
//                 Playlist Culture Urbaine
//               </h2>
//               <AudioPlayer songs={songs} apiUrl={apiUrl} />
//             </section>

//             {/* Artist Types Filter */}
//             <section className="mb-12">
//               <div className="flex flex-wrap gap-2 justify-center">
//                 {artistTypes.map((type) => (
//                   <button
//                     key={type.id}
//                     onClick={() => handleTypeChange(type.id)}
//                     className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
//                       activeType === type.id
//                         ? 'bg-blue-500 text-white'
//                         : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
//                     }`}
//                   >
//                     {type.name}
//                   </button>
//                 ))}
//               </div>
//             </section>

//             {/* Artists Section */}
//             <section className="mb-12">
//               <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
//                 <User className="w-6 h-6 mr-2" />
//                 Artistes
//               </h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {artists.length > 0 ? (
//                   artists.map((artist) => (
//                     <div
//                       key={artist.id}
//                       className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
//                     >
//                       <img
//                         src={artist.image_url}
//                         alt={artist.title}
//                         className="w-full h-48 object-cover"
//                         onError={(e) => { e.target.src = FALLBACK_IMAGE; console.warn(`Image not found: ${artist.image_url}`); }}
//                       />
//                       <div className="p-4">
//                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
//                           {artist.title}
//                         </h3>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {artist.category?.name || 'Inconnu'}
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-600 dark:text-gray-400 text-center col-span-3">
//                     Aucun artiste disponible pour le moment.
//                   </p>
//                 )}
//               </div>
//             </section>

//             {/* Latest Articles Section */}
//             <section>
//               <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
//                 <Calendar className="w-6 h-6 mr-2" />
//                 Derniers Articles
//               </h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {latestArticles.length > 0 ? (
//                   latestArticles.map((article) => (
//                     <div
//                       key={article.id}
//                       className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
//                     >
//                       <img
//                         src={article.image_url}
//                         alt={article.title}
//                         className="w-full h-48 object-cover"
//                         onError={(e) => { e.target.src = FALLBACK_IMAGE; console.warn(`Image not found: ${article.image_url}`); }}
//                       />
//                       <div className="p-4">
//                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
//                           {article.title}
//                         </h3>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">{article.date}</p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {article.category}
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-600 dark:text-gray-400 text-center col-span-3">
//                     Aucun article récent disponible.
//                   </p>
//                 )}
//               </div>
//             </section>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CultureUrbainePage;
