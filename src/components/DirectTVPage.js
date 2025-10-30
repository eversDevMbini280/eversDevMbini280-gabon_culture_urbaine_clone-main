// 'use client';
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import Navigation from '@/components/navigation';
// import Footer from '@/components/Footer';
// import { Play, Radio, Volume2, Volume1, VolumeX, Maximize, ChevronRight, Calendar, Clock, RefreshCw } from 'lucide-react';
// import Link from 'next/link';
// import AdBanner from '@/components/AdBanner';

// // Base64 fallback image (1x1 transparent pixel)
// const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// const DirectTVPage = () => {
//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://gabon-culture-urbaine-1.onrender.com";

//   const [volume, setVolume] = useState(50);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentProgram, setCurrentProgram] = useState(null);
//   const [upcomingPrograms, setUpcomingPrograms] = useState([]);
//   const [upcomingProgramTitle, setUpcomingProgramTitle] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [failedImages, setFailedImages] = useState(new Set());
//   const [debugInfo, setDebugInfo] = useState(null); // For debugging

//   const videoRef = useRef(null);
//   const videoContainerRef = useRef(null);

//   const fetchPrograms = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       let programs = [];
//       let fetchSuccess = false;

//       try {
//         const publicResponse = await fetch(`${apiUrl}/api/directtv/public`, {
//           method: 'GET',
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           },
//           mode: 'cors'
//         });

//         console.log('Public endpoint response status:', publicResponse.status);

//         if (publicResponse.ok) {
//           programs = await publicResponse.json();
//           console.log('Fetched programs from public endpoint:', programs.length);
//           fetchSuccess = true;
//         }
//       } catch (publicError) {
//         console.error('Error fetching from public endpoint:', publicError);
//       }

//       if (!fetchSuccess) {
//         try {
//           const headers = {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           };

//           if (typeof window !== 'undefined') {
//             const token = localStorage.getItem('token');
//             if (token) {
//               headers['Authorization'] = `Bearer ${token}`;
//             }
//           }

//           const mainResponse = await fetch(`${apiUrl}/api/directtv/`, {
//             method: 'GET',
//             headers: headers,
//             mode: 'cors'
//           });

//           console.log('Main endpoint response status:', mainResponse.status);

//           if (mainResponse.ok) {
//             programs = await mainResponse.json();
//             console.log('Fetched programs from main endpoint:', programs.length);
//             fetchSuccess = true;
//           } else {
//             throw new Error(`Failed to fetch Direct TV programs (Status: ${mainResponse.status})`);
//           }
//         } catch (mainError) {
//           console.error('Error fetching from main endpoint:', mainError);
//           throw mainError;
//         }
//       }

//       if (!fetchSuccess) {
//         throw new Error('Failed to fetch programs from any endpoint');
//       }

//       processPrograms(programs);
//     } catch (error) {
//       console.error('Error fetching programs:', error);
//       setError(error.message || 'Failed to load programs');

//       setCurrentProgram({
//         title: "GCUTV - Direct",
//         description: "Regardez GCUTV en direct - La culture urbaine gabonaise à l'antenne",
//         image_url: FALLBACK_IMAGE,
//         time: "En continu",
//         date: new Date().toISOString(),
//         video_url: null,
//         id: 'fallback'
//       });
//       setUpcomingPrograms([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const processPrograms = (programs) => {
//     if (!Array.isArray(programs)) {
//       console.error('Expected array of programs, got:', programs);
//       return;
//     }

//     const now = new Date();
//     console.log("Programs before filtering:", programs);
//     console.log("Current date for comparison:", now);

//     const publishedPrograms = programs.filter(p => p.status === 'published');

//     const featuredProgram = publishedPrograms.find(p => p.is_featured);
//     console.log("Featured program:", featuredProgram);

//     const liveProgram = !featuredProgram ? publishedPrograms.find(p => p.is_live) : null;
//     console.log("Live program:", liveProgram);

//     const recentPrograms = publishedPrograms.filter(p => new Date(p.date) <= now);
//     console.log("Recent programs (before today):", recentPrograms.length);

//     const sortedRecentPrograms = recentPrograms.sort((a, b) => new Date(b.date) - new Date(a.date));
//     console.log("Sorted recent programs:", sortedRecentPrograms.length > 0 ? sortedRecentPrograms[0]?.title : "none");

//     const current = featuredProgram || liveProgram || sortedRecentPrograms[0];

//     const upcoming = publishedPrograms
//       .filter(p => new Date(p.date) > now)
//       .sort((a, b) => new Date(a.date) - new Date(b.date))
//       .slice(0, 3);

//     console.log("Upcoming programs selected:", upcoming.length);

//     setCurrentProgram(current || {
//       title: "GCUTV - Direct",
//       description: "Regardez GCUTV en direct - La culture urbaine gabonaise à l'antenne",
//       image_url: FALLBACK_IMAGE,
//       time: "En continu",
//       date: new Date().toISOString(),
//       video_url: null,
//       id: 'default'
//     });

//     setUpcomingPrograms(upcoming);
//   };

//   useEffect(() => {
//     fetchPrograms();

//     const savedProgram = localStorage.getItem('upcomingProgram');
//     if (savedProgram) {
//       setUpcomingProgramTitle(savedProgram);
//     }

//     const programsIntervalId = setInterval(fetchPrograms, 24 * 60 * 60 * 100);

//     return () => {
//       clearInterval(programsIntervalId);
//     };
//   }, [apiUrl]);

//   useEffect(() => {
//     const videoElement = videoRef.current;

//     if (videoElement) {
//       videoElement.volume = volume / 100;
//       videoElement.muted = isMuted;

//       const handlePlay = () => setIsPlaying(true);
//       const handlePause = () => setIsPlaying(false);
//       const handleVolumeChange = () => {
//         setVolume(videoElement.volume * 100);
//         setIsMuted(videoElement.muted);
//       };

//       videoElement.addEventListener('play', handlePlay);
//       videoElement.addEventListener('pause', handlePause);
//       videoElement.addEventListener('volumechange', handleVolumeChange);

//       return () => {
//         videoElement.removeEventListener('play', handlePlay);
//         videoElement.removeEventListener('pause', handlePause);
//         videoElement.removeEventListener('volumechange', handleVolumeChange);
//       };
//     }
//   }, [volume, isMuted, currentProgram]);

//   const handleImageError = useCallback(
//     (e, itemId) => {
//       if (!failedImages.has(itemId)) {
//         setFailedImages((prev) => new Set(prev).add(itemId));
//         e.target.style.display = 'none';
//         const defaultIcon = e.target.parentElement?.querySelector('.default-icon');
//         if (defaultIcon) defaultIcon.classList.remove('hidden');
//       }
//     },
//     [failedImages]
//   );

//   const handleVolumeChange = (e) => {
//     const newVolume = parseInt(e.target.value);
//     setVolume(newVolume);

//     if (videoRef.current) {
//       videoRef.current.volume = newVolume / 100;
//     }

//     if (newVolume === 0) {
//       setIsMuted(true);
//       if (videoRef.current) videoRef.current.muted = true;
//     } else {
//       setIsMuted(false);
//       if (videoRef.current) videoRef.current.muted = false;
//     }
//   };

//   const toggleMute = () => {
//     setIsMuted(!isMuted);
//     if (videoRef.current) {
//       videoRef.current.muted = !isMuted;
//     }
//   };

//   const togglePlay = () => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   const toggleFullscreen = () => {
//     const container = videoContainerRef.current;

//     if (!container) return;

//     if (!document.fullscreenElement) {
//       container.requestFullscreen().catch(err => {
//         console.error(`Error attempting to enable fullscreen: ${err.message}`);
//       });
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   // New handlers for improved mobile video interaction
//   const handleVideoClick = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     // Only handle play/pause, don't allow default video behavior
//     if (currentProgram?.video_url) {
//       togglePlay();
//     }
//   };

//   const handleVideoTouch = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     // Prevent mobile zoom/fullscreen on touch
//     if (currentProgram?.video_url) {
//       togglePlay();
//     }
//   };

//   const getVolumeIcon = () => {
//     if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
//     if (volume < 50) return <Volume1 className="w-5 h-5" />;
//     return <Volume2 className="w-5 h-5" />;
//   };

//   const formatDate = (dateString) => {
//     try {
//       return new Date(dateString).toLocaleDateString('fr-FR');
//     } catch (error) {
//       return 'Aujourd\'hui';
//     }
//   };

//   const getImageUrl = (imageUrl) => {
//     if (!imageUrl || imageUrl === FALLBACK_IMAGE) return FALLBACK_IMAGE;
//     if (imageUrl.startsWith('http')) return imageUrl;
//     return `${apiUrl}${imageUrl}`;
//   };

//   const getVideoUrl = (videoUrl) => {
//     if (!videoUrl) return null;
//     if (videoUrl.startsWith('http')) return videoUrl;
//     return `${apiUrl}${videoUrl}`;
//   };

//   const handleRefresh = () => {
//     fetchPrograms();
//     const savedProgram = localStorage.getItem('upcomingProgram');
//     if (savedProgram) {
//       setUpcomingProgramTitle(savedProgram);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-gray-900">
//       <style jsx>{`
//         .video-container {
//           touch-action: manipulation;
//           -webkit-touch-callout: none;
//           -webkit-user-select: none;
//           user-select: none;
//         }

//         .video-container video {
//           -webkit-tap-highlight-color: transparent;
//           -webkit-touch-callout: none;
//           -webkit-user-select: none;
//           user-select: none;
//         }
//       `}</style>

//       <Navigation />

//       {error && (
//         <div className="grok-ignore max-w-7xl mx-auto px-4 py-4 bg-yellow-600 text-white text-center">
//           <div className="flex items-center justify-center">
//             <span className="mr-2">⚠️</span>
//             <span>{error}</span>
//           </div>
//           <p className="text-sm mt-2">Affichage du contenu par défaut.</p>
//         </div>
//       )}

//       {debugInfo && process.env.NODE_ENV !== 'production' && (
//         <div className="max-w-7xl mx-auto px-4 py-2 bg-gray-800 text-white text-xs">
//           <p>Debug: Found {debugInfo.programsCount} programs</p>
//           {debugInfo.firstProgram && (
//             <p>First program: {debugInfo.firstProgram.title} ({debugInfo.firstProgram.status}, featured: {debugInfo.firstProgram.is_featured ? 'yes' : 'no'})</p>
//           )}
//         </div>
//       )}

//       <div className="bg-blue-900 text-white">
//         <div className="max-w-7xl mx-auto px-4 py-12">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <div className="bg-white p-2 rounded-lg">
//                 <Radio className="w-8 h-8 text-blue-600" />
//               </div>
//               <h1 className="text-4xl font-bold">Direct TV</h1>
//             </div>
//             <button 
//               onClick={handleRefresh} 
//               className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
//             >
//               <RefreshCw className="w-4 h-4 mr-2" />
//               Actualiser
//             </button>
//           </div>
//           <p className="text-lg text-blue-100 max-w-3xl">
//             Regardez GCUTV en direct et suivez les derniers programmes dédiés à la culture urbaine gabonaise en temps réel.
//           </p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-black rounded-xl overflow-hidden">
//               <div className="relative video-container" ref={videoContainerRef}>
//                 <div className="relative w-full aspect-[16/9] bg-gray-800 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
//                   {currentProgram?.video_url ? (
//                     <div className="relative w-full h-full">
//                       <video
//                         ref={videoRef}
//                         className="w-full h-full object-cover touch-none"
//                         poster={getImageUrl(currentProgram.image_url)}
//                         onError={(e) => handleImageError(e, currentProgram?.id || 'current')}
//                         controls={false}
//                         autoPlay={false}
//                         playsInline={true}
//                         webkit-playsinline="true"
//                         disablePictureInPicture={true}
//                         controlsList="nodownload nofullscreen noremoteplayback"
//                         onContextMenu={(e) => e.preventDefault()}
//                       >
//                         <source src={getVideoUrl(currentProgram.video_url)} type="video/mp4" />
//                         Votre navigateur ne supporte pas la lecture vidéo.
//                       </video>

//                       {/* Custom click overlay that covers the entire video */}
//                       <div 
//                         className="absolute inset-0 cursor-pointer"
//                         onClick={handleVideoClick}
//                         onTouchStart={handleVideoTouch}
//                         onTouchEnd={(e) => e.preventDefault()}
//                       >
//                         {/* Play button overlay - only show when not playing */}
//                         {!isPlaying && (
//                           <div className="absolute inset-0 flex items-center justify-center">
//                             <div className="bg-blue-600 p-5 rounded-full hover:bg-blue-500 transition-colors pointer-events-none">
//                               <Play className="w-10 h-10 text-white" fill="white" />
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="relative w-full h-full">
//                       {currentProgram?.image_url && currentProgram.image_url !== FALLBACK_IMAGE ? (
//                         <img 
//                           src={getImageUrl(currentProgram.image_url)}
//                           alt={currentProgram?.title || 'GCUTV Direct'} 
//                           className="w-full h-full object-cover opacity-70"
//                           onError={(e) => handleImageError(e, currentProgram?.id || 'current')}
//                         />
//                       ) : (
//                         <div className="w-full h-full bg-gradient-to-br from-blue-800 to-purple-900 opacity-70"></div>
//                       )}
//                       <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                         <Radio className="w-16 h-16 text-white opacity-50" />
//                       </div>
//                     </div>
//                   )}

//                   {/* Live indicator */}
//                   <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
//                     <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
//                     <span className="font-medium">EN DIRECT</span>
//                   </div>

//                   {/* Program info */}
//                   <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
//                     <h2 className="text-white text-xl font-bold mb-1">{currentProgram?.title}</h2>
//                     <p className="text-gray-300 text-sm">{currentProgram?.description}</p>
//                   </div>
//                 </div>

//                 <div className="bg-gray-800 p-4 flex items-center">
//                   <div className="flex items-center">
//                     <button 
//                       className="text-white mr-4 hover:text-blue-300 transition-colors" 
//                       onClick={togglePlay}
//                     >
//                       {isPlaying ? (
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                       ) : (
//                         <Play className="w-6 h-6" />
//                       )}
//                     </button>
//                     <button 
//                       className="text-white mr-4 hover:text-blue-300 transition-colors" 
//                       onClick={toggleMute}
//                     >
//                       {getVolumeIcon()}
//                     </button>
//                     <div className="w-24 mr-4">
//                       <input
//                         type="range"
//                         min="0"
//                         max="100"
//                         value={volume}
//                         onChange={handleVolumeChange}
//                         className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
//                       />
//                     </div>
//                   </div>
//                   <div className="ml-auto">
//                     <button 
//                       className="text-white hover:text-blue-300 transition-colors" 
//                       onClick={toggleFullscreen}
//                     >
//                       <Maximize className="w-6 h-6" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gray-800 rounded-xl p-6">
//               <div className="flex items-center mb-4">
//                 <Calendar className="w-5 h-5 text-blue-400 mr-2" />
//                 <h2 className="text-white text-lg font-medium">Actuellement à l'antenne</h2>
//               </div>
//               <div className="flex items-start">
//                 <div className="flex-shrink-0 w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mr-4">
//                   <Clock className="w-8 h-8 text-blue-400" />
//                 </div>
//                 <div>
//                   <h3 className="text-white text-xl font-bold">{currentProgram?.title}</h3>
//                   <div className="flex items-center text-gray-400 text-sm mt-1">
//                     <span className="mr-3">{currentProgram?.time}</span>
//                     <span>{formatDate(currentProgram?.date)}</span>
//                   </div>
//                   <p className="text-gray-300 mt-2">{currentProgram?.description}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-6">
//             <div className="bg-gray-800 rounded-xl p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center">
//                   <Calendar className="w-5 h-5 text-blue-400 mr-2" />
//                   <h2 className="text-white text-lg font-medium">À suivre aujourd'hui</h2>
//                 </div>
//               </div>

//               {upcomingProgramTitle ? (
//                 <div className="bg-gray-700 rounded-lg p-4 mb-4">
//                   <h3 className="text-white font-bold">{upcomingProgramTitle}</h3>
//                 </div>
//               ) : upcomingPrograms.length > 0 ? (
//                 <div className="space-y-4">
//                   {upcomingPrograms.map((program) => (
//                     <div key={program.id} className="bg-gray-700 rounded-lg p-4">
//                       <h3 className="text-white font-bold">{program.title}</h3>
//                       <div className="flex items-center text-gray-400 text-sm mt-1">
//                         <span className="mr-3">{program.time}</span>
//                         <span>{formatDate(program.date)}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="bg-gray-700 rounded-lg p-6 text-center">
//                   <p className="text-gray-400">Aucun programme à venir pour aujourd'hui</p>
//                 </div>
//               )}
//             </div>

//             <div className="bg-gray-800 rounded-xl p-6">
//               <div className="flex items-center mb-4">
//                 <Radio className="w-5 h-5 text-blue-400 mr-2" />
//                 <h2 className="text-white text-lg font-medium">Restez connecté</h2>
//               </div>
//               <p className="text-gray-300 mb-4">
//                 Suivez-nous sur les réseaux sociaux pour ne rien manquer de notre programmation et de nos événements.
//               </p>
//               <div className="flex space-x-3">
//                 <a href="https://www.facebook.com/share/1A9qryHyGc/?mibextid=wwXIfr" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full">
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                     <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
//                   </svg>
//                 </a>
//                 <a href="https://www.instagram.com/gabon_culture_urbaine?igsh=MWxmbm83cWsyNmhsOA%3D%3D&utm_source=qr" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-full">
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                     <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
//                   </svg>
//                 </a>
//                 <a href="https://www.youtube.com/channel/UCX79Jv7MmK-z9rEsKkABDQw" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                     <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="relative">
//         <AdBanner position="bottom" page="direct_tv" />
//       </div>

//       <Footer />
//     </main>
//   );
// };

// export default DirectTVPage;



'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import { Play, Radio, Volume2, Volume1, VolumeX, Maximize, ChevronRight, Calendar, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const DirectTVPage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://gabon-culture-urbaine-1.onrender.com";

  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [upcomingPrograms, setUpcomingPrograms] = useState([]);
  const [upcomingProgramTitle, setUpcomingProgramTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());
  const [debugInfo, setDebugInfo] = useState(null); // For debugging

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  const fetchPrograms = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let programs = [];
      let fetchSuccess = false;

      try {
        const publicResponse = await fetch(`${apiUrl}/api/directtv/public`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        console.log('Public endpoint response status:', publicResponse.status);

        if (publicResponse.ok) {
          programs = await publicResponse.json();
          console.log('Fetched programs from public endpoint:', programs.length);
          fetchSuccess = true;
        }
      } catch (publicError) {
        console.error('Error fetching from public endpoint:', publicError);
      }

      if (!fetchSuccess) {
        try {
          const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          };

          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
          }

          const mainResponse = await fetch(`${apiUrl}/api/directtv/`, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
          });

          console.log('Main endpoint response status:', mainResponse.status);

          if (mainResponse.ok) {
            programs = await mainResponse.json();
            console.log('Fetched programs from main endpoint:', programs.length);
            fetchSuccess = true;
          } else {
            throw new Error(`Failed to fetch Direct TV programs (Status: ${mainResponse.status})`);
          }
        } catch (mainError) {
          console.error('Error fetching from main endpoint:', mainError);
          throw mainError;
        }
      }

      if (!fetchSuccess) {
        throw new Error('Failed to fetch programs from any endpoint');
      }

      processPrograms(programs);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError(error.message || 'Failed to load programs');

      setCurrentProgram({
        title: "GCUTV - Direct",
        description: "Regardez GCUTV en direct - La culture urbaine gabonaise à l'antenne",
        image_url: FALLBACK_IMAGE,
        time: "En continu",
        date: new Date().toISOString(),
        video_url: null,
        id: 'fallback'
      });
      setUpcomingPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processPrograms = (programs) => {
    if (!Array.isArray(programs)) {
      console.error('Expected array of programs, got:', programs);
      return;
    }

    const now = new Date();
    console.log("Programs before filtering:", programs);
    console.log("Current date for comparison:", now);

    const publishedPrograms = programs.filter(p => p.status === 'published');

    const featuredProgram = publishedPrograms.find(p => p.is_featured);
    console.log("Featured program:", featuredProgram);

    const liveProgram = !featuredProgram ? publishedPrograms.find(p => p.is_live) : null;
    console.log("Live program:", liveProgram);

    const recentPrograms = publishedPrograms.filter(p => new Date(p.date) <= now);
    console.log("Recent programs (before today):", recentPrograms.length);

    const sortedRecentPrograms = recentPrograms.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log("Sorted recent programs:", sortedRecentPrograms.length > 0 ? sortedRecentPrograms[0]?.title : "none");

    const current = featuredProgram || liveProgram || sortedRecentPrograms[0];

    const upcoming = publishedPrograms
      .filter(p => new Date(p.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);

    console.log("Upcoming programs selected:", upcoming.length);

    setCurrentProgram(current || {
      title: "GCUTV - Direct",
      description: "Regardez GCUTV en direct - La culture urbaine gabonaise à l'antenne",
      image_url: FALLBACK_IMAGE,
      time: "En continu",
      date: new Date().toISOString(),
      video_url: null,
      id: 'default'
    });

    setUpcomingPrograms(upcoming);
  };

  useEffect(() => {
    fetchPrograms();

    const savedProgram = localStorage.getItem('upcomingProgram');
    if (savedProgram) {
      setUpcomingProgramTitle(savedProgram);
    }

    const programsIntervalId = setInterval(fetchPrograms, 24 * 60 * 60 * 100);

    return () => {
      clearInterval(programsIntervalId);
    };
  }, [apiUrl]);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.volume = volume / 100;
      videoElement.muted = isMuted;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleVolumeChange = () => {
        setVolume(videoElement.volume * 100);
        setIsMuted(videoElement.muted);
      };

      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      videoElement.addEventListener('volumechange', handleVolumeChange);

      return () => {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('volumechange', handleVolumeChange);
      };
    }
  }, [volume, isMuted, currentProgram]);

  // Add event listeners to track fullscreen state across devices
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        (videoRef.current && videoRef.current.webkitDisplayingFullscreen)
      );
      setIsFullscreen(isFS);
    };

    // Standard and vendor-prefixed fullscreen events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // iOS-specific fullscreen events for video
    const video = videoRef.current;
    if (video) {
      video.addEventListener('webkitbeginfullscreen', handleFullscreenChange);
      video.addEventListener('webkitendfullscreen', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', handleFullscreenChange);
        video.removeEventListener('webkitendfullscreen', handleFullscreenChange);
      }
    };
  }, []);

  const handleImageError = useCallback(
    (e, itemId) => {
      if (!failedImages.has(itemId)) {
        setFailedImages((prev) => new Set(prev).add(itemId));
        e.target.style.display = 'none';
        const defaultIcon = e.target.parentElement?.querySelector('.default-icon');
        if (defaultIcon) defaultIcon.classList.remove('hidden');
      }
    },
    [failedImages]
  );

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }

    if (newVolume === 0) {
      setIsMuted(true);
      if (videoRef.current) videoRef.current.muted = true;
    } else {
      setIsMuted(false);
      if (videoRef.current) videoRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
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

  const toggleFullscreen = () => {
    const container = videoContainerRef.current;
    const video = videoRef.current;

    if (!container) return;

    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      (video && video.webkitDisplayingFullscreen)
    );

    if (!isCurrentlyFullscreen) {
      if (video && video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      } else if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (video && video.webkitDisplayingFullscreen) {
        video.webkitExitFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // New handlers for improved mobile video interaction
  const handleVideoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle play/pause, don't allow default video behavior
    if (currentProgram?.video_url) {
      togglePlay();
    }
  };

  const handleVideoTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent mobile zoom/fullscreen on touch
    if (currentProgram?.video_url) {
      togglePlay();
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 50) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Aujourd\'hui';
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl === FALLBACK_IMAGE) return FALLBACK_IMAGE;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${apiUrl}${imageUrl}`;
  };

  const getVideoUrl = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.startsWith('http')) return videoUrl;
    return `${apiUrl}${videoUrl}`;
  };

  const handleRefresh = () => {
    fetchPrograms();
    const savedProgram = localStorage.getItem('upcomingProgram');
    if (savedProgram) {
      setUpcomingProgramTitle(savedProgram);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
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

      <Navigation />

      {error && (
        <div className="grok-ignore max-w-7xl mx-auto px-4 py-4 bg-yellow-600 text-white text-center">
          <div className="flex items-center justify-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
          <p className="text-sm mt-2">Affichage du contenu par défaut.</p>
        </div>
      )}

      {debugInfo && process.env.NODE_ENV !== 'production' && (
        <div className="max-w-7xl mx-auto px-4 py-2 bg-gray-800 text-white text-xs">
          <p>Debug: Found {debugInfo.programsCount} programs</p>
          {debugInfo.firstProgram && (
            <p>First program: {debugInfo.firstProgram.title} ({debugInfo.firstProgram.status}, featured: {debugInfo.firstProgram.is_featured ? 'yes' : 'no'})</p>
          )}
        </div>
      )}

      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 page-title-section">
              <div className="bg-white p-2 rounded-lg">
                <Radio className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold">Direct TV</h1>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </button>
          </div>
          <p className="text-lg text-blue-100 max-w-3xl">
            Regardez GCUTV en direct et suivez les derniers programmes dédiés à la culture urbaine gabonaise en temps réel.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black rounded-xl overflow-hidden">
              <div className="relative video-container" ref={videoContainerRef}>
                <div className="relative w-full aspect-[16/9] bg-gray-800 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                  {currentProgram?.video_url ? (
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover touch-none"
                        poster={getImageUrl(currentProgram.image_url)}
                        onError={(e) => handleImageError(e, currentProgram?.id || 'current')}
                        controls={false}
                        autoPlay={false}
                        playsInline={true}
                        webkit-playsinline="true"
                        disablePictureInPicture={true}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <source src={getVideoUrl(currentProgram.video_url)} type="video/mp4" />
                        Votre navigateur ne supporte pas la lecture vidéo.
                      </video>

                      {/* Custom click overlay that covers the entire video */}
                      <div
                        className="absolute inset-0 cursor-pointer"
                        onClick={handleVideoClick}
                        onTouchStart={handleVideoTouch}
                        onTouchEnd={(e) => e.preventDefault()}
                      >
                        {/* Play button overlay - only show when not playing */}
                        {!isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-blue-600 p-5 rounded-full hover:bg-blue-500 transition-colors pointer-events-none">
                              <Play className="w-10 h-10 text-white" fill="white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {currentProgram?.image_url && currentProgram.image_url !== FALLBACK_IMAGE ? (
                        <img
                          src={getImageUrl(currentProgram.image_url)}
                          alt={currentProgram?.title || 'GCUTV Direct'}
                          className="w-full h-full object-cover opacity-70"
                          onError={(e) => handleImageError(e, currentProgram?.id || 'current')}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-800 to-purple-900 opacity-70"></div>
                      )}
                      <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Radio className="w-16 h-16 text-white opacity-50" />
                      </div>
                    </div>
                  )}

                  {/* Live indicator */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    <span className="font-medium">EN DIRECT</span>
                  </div>

                  {/* Program info */}
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <h2 className="text-white text-xl font-bold mb-1">{currentProgram?.title}</h2>
                    <p className="text-gray-300 text-sm">{currentProgram?.description}</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 flex items-center">
                  <div className="flex items-center">
                    <button
                      className="text-white mr-4 hover:text-blue-300 transition-colors"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                    <button
                      className="text-white mr-4 hover:text-blue-300 transition-colors"
                      onClick={toggleMute}
                    >
                      {getVolumeIcon()}
                    </button>
                    <div className="w-24 mr-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="ml-auto">
                    <button
                      className="text-white hover:text-blue-300 transition-colors"
                      onClick={toggleFullscreen}
                    >
                      <Maximize className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                <h2 className="text-white text-lg font-medium">Actuellement à l'antenne</h2>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">{currentProgram?.title}</h3>
                  <div className="flex items-center text-gray-400 text-sm mt-1">
                    <span className="mr-3">{currentProgram?.time}</span>
                    <span>{formatDate(currentProgram?.date)}</span>
                  </div>
                  <p className="text-gray-300 mt-2">{currentProgram?.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                  <h2 className="text-white text-lg font-medium">À suivre aujourd'hui</h2>
                </div>
              </div>

              {upcomingProgramTitle ? (
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <h3 className="text-white font-bold">{upcomingProgramTitle}</h3>
                </div>
              ) : upcomingPrograms.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPrograms.map((program) => (
                    <div key={program.id} className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-white font-bold">{program.title}</h3>
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <span className="mr-3">{program.time}</span>
                        <span>{formatDate(program.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-6 text-center">
                  <p className="text-gray-400">Aucun programme à venir pour aujourd'hui</p>
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Radio className="w-5 h-5 text-blue-400 mr-2" />
                <h2 className="text-white text-lg font-medium">Restez connecté</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Suivez-nous sur les réseaux sociaux pour ne rien manquer de notre programmation et de nos événements.
              </p>
              <div className="flex space-x-3">
                <a href="https://www.facebook.com/share/1A9qryHyGc/?mibextid=wwXIfr" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/gabon_culture_urbaine?igsh=MWxmbm83cWsyNmhsOA%3D%3D&utm_source=qr" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.youtube.com/channel/UCX79Jv7MmK-z9rEsKkABDQw" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <AdBanner position="bottom" page="direct_tv" />
      </div>

      <Footer />
    </main>
  );
};

export default DirectTVPage;