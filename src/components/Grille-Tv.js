// 'use client'
// import React, { useState, useRef } from 'react';
// import Navigation from '@/components/navigation';
// import Footer from '@/components/Footer';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { 
//   Calendar, 
//   Clock, 
//   Filter, 
//   Download, 
//   Star, 
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   Bookmark,
//   Bell,
//   PlayCircle,
//   Mail, 
//   Share2,
//   MessageCircle
// } from 'lucide-react';

// const GrilleTVPage = () => {
//   // Current day index (0 = Today, 1 = Tomorrow, etc.)
//   const [currentDayIndex, setCurrentDayIndex] = useState(0);
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [showReminders, setShowReminders] = useState(false);
  
//   // Refs for scrollable containers
//   const daysScrollRef = useRef(null);
//   const categoriesScrollRef = useRef(null);

//   // Function to scroll containers
//   const scroll = (ref, direction) => {
//     if (ref.current) {
//       const scrollAmount = direction === 'left' ? -200 : 200;
//       ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//     }
//   };

//   // Generate dates for the week
//   const today = new Date();
//   const weekDays = [];
//   for (let i = 0; i < 7; i++) {
//     const date = new Date(today);
//     date.setDate(today.getDate() + i);
//     weekDays.push({
//       dayName: i === 0 ? 'Aujourd\'hui' : i === 1 ? 'Demain' : date.toLocaleDateString('fr-FR', { weekday: 'long' }),
//       dayNumber: date.getDate(),
//       monthName: date.toLocaleDateString('fr-FR', { month: 'short' }),
//       date: date
//     });
//   }

//   // TV Schedule data
//   // This would normally come from an API
//   const scheduleData = [
//     {
//       id: 1,
//       time: "06:00",
//       title: "Réveil Musical",
//       category: "musique",
//       duration: 60,
//       description: "Les meilleurs sons urbains pour commencer la journée en énergie.",
//       type: "emission",
//       featured: false,
//       replayAvailable: true
//     },
//     {
//       id: 2,
//       time: "07:00",
//       title: "JT Matinal",
//       category: "actualités",
//       duration: 30,
//       description: "Les dernières actualités culturelles au Gabon et en Afrique.",
//       type: "journal",
//       featured: false,
//       replayAvailable: true
//     },
//     {
//       id: 3,
//       time: "07:30",
//       title: "Matinale Culture",
//       category: "culture",
//       duration: 90,
//       description: "Magazine culturel matinal avec invités et chroniques.",
//       type: "emission",
//       featured: false,
//       replayAvailable: true
//     },
//     {
//       id: 4,
//       time: "09:00",
//       title: "Urban Style",
//       category: "mode",
//       duration: 60,
//       description: "Les dernières tendances de la mode urbaine gabonaise avec Carine Obame.",
//       type: "emission",
//       featured: true,
//       replayAvailable: true,
//       presenter: "Carine Obame"
//     },
//     {
//       id: 5,
//       time: "10:00",
//       title: "Clips Non-Stop",
//       category: "musique",
//       duration: 120,
//       description: "Sélection des meilleurs clips de la scène gabonaise et africaine.",
//       type: "musique",
//       featured: false,
//       replayAvailable: false
//     },
//     {
//       id: 6,
//       time: "12:00",
//       title: "JT Culture Midi",
//       category: "actualités",
//       duration: 30,
//       description: "Point sur l'actualité culturelle à la mi-journée.",
//       type: "journal",
//       featured: false,
//       replayAvailable: true
//     },
//     {
//       id: 7,
//       time: "12:30",
//       title: "Pause Déj' Musicale",
//       category: "musique",
//       duration: 90,
//       description: "Les meilleurs sons pour accompagner votre pause déjeuner.",
//       type: "musique",
//       featured: false,
//       replayAvailable: false
//     },
//     {
//       id: 8,
//       time: "14:00",
//       title: "Top Hits Gabon",
//       category: "musique",
//       duration: 60,
//       description: "Classement des titres les plus populaires de la semaine avec Sophie Mboumba.",
//       type: "emission",
//       featured: true,
//       replayAvailable: true,
//       presenter: "Sophie Mboumba"
//     },
//     {
//       id: 9,
//       time: "15:00",
//       title: "Terrain de Jeu",
//       category: "sports",
//       duration: 60,
//       description: "Magazine dédié aux sports urbains et événements sportifs avec David Ondo.",
//       type: "emission",
//       featured: false,
//       replayAvailable: true,
//       presenter: "David Ondo"
//     },
//     {
//       id: 10,
//       time: "16:00",
//       title: "Génération Z",
//       category: "jeunesse",
//       duration: 60,
//       description: "Émission dédiée à la jeunesse gabonaise avec Francine Mabika.",
//       type: "emission",
//       featured: false,
//       replayAvailable: true,
//       presenter: "Francine Mabika"
//     },
//     {
//       id: 11,
//       time: "17:00",
//       title: "Clips Urban Mix",
//       category: "musique",
//       duration: 60,
//       description: "Sélection de clips urbains actuels.",
//       type: "musique",
//       featured: false,
//       replayAvailable: false
//     },
//     {
//       id: 12,
//       time: "18:00",
//       title: "Street Culture",
//       category: "culture",
//       duration: 60,
//       description: "Immersion dans la culture urbaine gabonaise avec Jean-Paul Okily.",
//       type: "emission",
//       featured: true,
//       replayAvailable: true,
//       presenter: "Jean-Paul Okily"
//     },
//     {
//       id: 13,
//       time: "19:00",
//       title: "Interview Artiste",
//       category: "musique",
//       duration: 60,
//       description: "Rencontre intimiste avec un artiste du moment.",
//       type: "emission",
//       featured: true,
//       replayAvailable: true,
//       presenter: "Sophie Mboumba",
//       specialGuest: "Mylka"
//     },
//     {
//       id: 14,
//       time: "20:00",
//       title: "JT Culture Soir",
//       category: "actualités",
//       duration: 30,
//       description: "Le journal télévisé du soir présenté par Michel Nguema.",
//       type: "journal",
//       featured: true,
//       replayAvailable: true,
//       presenter: "Michel Nguema"
//     },
//     {
//       id: 15,
//       time: "20:30",
//       title: "Décryptage Hebdo",
//       category: "actualités",
//       duration: 90,
//       description: "Analyse des événements culturels de la semaine avec experts et invités.",
//       type: "emission",
//       featured: true,
//       replayAvailable: true,
//       presenter: "Michel Nguema"
//     },
//     {
//       id: 16,
//       time: "22:00",
//       title: "Urban Talents",
//       category: "divertissement",
//       duration: 60,
//       description: "Émission de découverte de nouveaux talents de la scène urbaine.",
//       type: "emission",
//       featured: false,
//       replayAvailable: true
//     },
//     {
//       id: 17,
//       time: "23:00",
//       title: "Late Night Session",
//       category: "musique",
//       duration: 120,
//       description: "Session musicale nocturne avec les meilleurs DJs gabonais.",
//       type: "musique",
//       featured: false,
//       replayAvailable: false
//     },
//     {
//       id: 18,
//       time: "01:00",
//       title: "Rediffusions",
//       category: "divers",
//       duration: 300,
//       description: "Rediffusion des programmes de la journée.",
//       type: "rediffusion",
//       featured: false,
//       replayAvailable: false
//     }
//   ];

//   // Format time from "HH:MM" to display hours and minutes
//   const formatTime = (timeString) => {
//     const [hours, minutes] = timeString.split(':');
//     return (
//       <div className="text-center">
//         <span className="text-lg font-bold">{hours}</span>
//         <span className="text-sm">:{minutes}</span>
//       </div>
//     );
//   };

//   // Filter schedule based on category
//   const filteredSchedule = scheduleData.filter(item => 
//     categoryFilter === 'all' || item.category === categoryFilter
//   );

//   // Categories for filter
//   const categories = [
//     { id: 'all', label: 'Tout' },
//     { id: 'actualités', label: 'Actualités' },
//     { id: 'culture', label: 'Culture' },
//     { id: 'musique', label: 'Musique' },
//     { id: 'mode', label: 'Mode' },
//     { id: 'sports', label: 'Sports' },
//     { id: 'jeunesse', label: 'Jeunesse' },
//     { id: 'divertissement', label: 'Divertissement' }
//   ];

//   // Get the current time slot (for highlighting)
//   const getCurrentTimeSlot = () => {
//     if (currentDayIndex > 0) return null; // Only highlight for today
    
//     const now = new Date();
//     const currentHour = now.getHours();
//     const currentMinute = now.getMinutes();
//     const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
//     // Find the current or next program
//     for (let i = 0; i < scheduleData.length; i++) {
//       const item = scheduleData[i];
//       const itemTime = item.time;
      
//       if (itemTime > currentTimeString) {
//         return i > 0 ? scheduleData[i-1].id : null;
//       }
//     }
    
//     return scheduleData[scheduleData.length - 1].id;
//   };

//   const currentTimeSlot = getCurrentTimeSlot();

//   return (
//     <motion.main 
//       className="min-h-screen bg-blue-900 text-white"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       <Navigation />
      
//       {/* Hero Section */}
//       <motion.div 
//         className="relative bg-blue-800 text-white"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.8 }}
//       >
//         <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
//           <motion.div 
//             className="flex items-center gap-3 mb-4"
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//           >
//             <motion.div 
//               className="bg-white p-2 rounded-lg"
//               initial={{ rotate: -10, scale: 0.9 }}
//               animate={{ rotate: 0, scale: 1 }}
//               transition={{ delay: 0.2, duration: 0.5 }}
//             >
//               <Calendar className="w-8 h-8 text-blue-600" />
//             </motion.div>
//             <h1 className="text-4xl font-bold">Grille TV</h1>
//           </motion.div>
//           <motion.p 
//             className="text-lg text-blue-100 max-w-3xl mb-6"
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//           >
//             Retrouvez toute la programmation de GCUTV. Consultez les horaires et les descriptions des émissions pour ne rien manquer de votre chaîne préférée.
//           </motion.p>
//         </div>
//         <motion.div 
//           className="absolute inset-0 opacity-30"
//           initial={{ scale: 1.1, opacity: 0 }}
//           animate={{ scale: 1, opacity: 0.3 }}
//           transition={{ duration: 1.2 }}
//         >
//           <img 
//             src="/api/placeholder/1920/600" 
//             alt="GCUTV Programme" 
//             className="w-full h-full object-cover"
//           />
//         </motion.div>
//       </motion.div>

//       {/* Day Selector and Filters */}
//       <section className="sticky top-0 bg-blue-950 shadow-md z-20 text-white">
//         <div className="max-w-7xl mx-auto">
//           {/* Day Selector with scroll arrows */}
//           <div className="border-b border-blue-800">
//             <div className="flex items-center justify-between p-2">
//               <button 
//                 onClick={() => {
//                   scroll(daysScrollRef, 'left');
//                   setCurrentDayIndex(prev => Math.max(0, prev - 1));
//                 }}
//                 className="p-2 text-blue-200 hover:bg-blue-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed z-10"
//                 disabled={currentDayIndex === 0}
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
              
//               <div className="flex relative w-full">
//                 <div 
//                   ref={daysScrollRef}
//                   className="flex overflow-x-auto scrollbar-hide space-x-2 scroll-smooth w-full no-scrollbar"
//                   style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//                 >
//                   {weekDays.map((day, index) => (
//                     <button
//                       key={index}
//                       onClick={() => setCurrentDayIndex(index)}
//                       className={`flex flex-col items-center p-3 min-w-[90px] rounded-lg transition-colors ${
//                         currentDayIndex === index 
//                           ? 'bg-blue-600 text-white' 
//                           : 'bg-blue-800 text-blue-100 hover:bg-blue-700'
//                       }`}
//                     >
//                       <span className="text-xs font-medium uppercase">{day.dayName}</span>
//                       <div className="flex items-baseline">
//                         <span className="text-xl font-bold">{day.dayNumber}</span>
//                         <span className="text-xs ml-1">{day.monthName}</span>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
              
//               <button 
//                 onClick={() => {
//                   scroll(daysScrollRef, 'right');
//                   setCurrentDayIndex(prev => Math.min(6, prev + 1));
//                 }}
//                 className="p-2 text-blue-200 hover:bg-blue-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed z-10"
//                 disabled={currentDayIndex === 6}
//               >
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
          
//           {/* Filters with scroll arrows */}
//           <div className="px-2 py-2 relative">
//             <div className="flex items-center">
//               <button 
//                 onClick={() => scroll(categoriesScrollRef, 'left')}
//                 className="p-2 text-blue-200 hover:bg-blue-800 rounded-full z-10 flex-shrink-0"
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
              
//               <div className="flex-grow relative overflow-hidden">
//                 <div 
//                   ref={categoriesScrollRef}
//                   className="flex items-center gap-2 overflow-x-auto scroll-smooth no-scrollbar px-2"
//                   style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//                 >
//                   <Filter className="text-blue-300 flex-shrink-0 w-5 h-5" />
//                   {categories.map(category => (
//                     <button
//                       key={category.id}
//                       onClick={() => setCategoryFilter(category.id)}
//                       className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${
//                         categoryFilter === category.id
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-blue-800 text-blue-100 hover:bg-blue-700'
//                       }`}
//                     >
//                       {category.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>
              
//               <button 
//                 onClick={() => scroll(categoriesScrollRef, 'right')}
//                 className="p-2 text-blue-200 hover:bg-blue-800 rounded-full z-10 flex-shrink-0"
//               >
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
            
//             <div className="flex items-center gap-3 mt-2 px-2 justify-end">
//               <button
//                 onClick={() => setShowReminders(!showReminders)}
//                 className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                   showReminders 
//                     ? 'bg-blue-600 text-white' 
//                     : 'bg-blue-800 text-blue-100 hover:bg-blue-700'
//                 }`}
//               >
//                 <Bell className="w-4 h-4 mr-1" />
//                 Rappels
//               </button>
              
//               <Link
//                 href="/grille-tv/pdf"
//                 className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-800 text-blue-100 hover:bg-blue-700"
//                 target="_blank"
//               >
//                 <Download className="w-4 h-4 mr-1" />
//                 PDF
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Schedule */}
//       <section className="py-8">
//         <div className="max-w-7xl mx-auto px-4">
//           {/* Current Live */}
//           {currentDayIndex === 0 && currentTimeSlot && (
//             <motion.div 
//               className="mb-8 bg-blue-800 rounded-xl overflow-hidden shadow-lg border border-blue-700"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               <div className="bg-blue-700 text-white px-4 py-2 flex items-center">
//                 <span className="relative flex h-3 w-3 mr-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
//                 </span>
//                 <span className="font-medium">En direct maintenant</span>
//               </div>
              
//               {scheduleData.find(item => item.id === currentTimeSlot) && (
//                 <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
//                   <div className="md:col-span-1">
//                     <img 
//                       src="/api/placeholder/400/225" 
//                       alt="Current show" 
//                       className="w-full rounded-lg"
//                     />
//                   </div>
//                   <div className="md:col-span-3">
//                     <div className="flex items-start justify-between mb-2">
//                       <div>
//                         <h3 className="text-xl font-bold text-white">
//                           {scheduleData.find(item => item.id === currentTimeSlot).title}
//                         </h3>
//                         <p className="text-blue-300">
//                           {scheduleData.find(item => item.id === currentTimeSlot).time} - {(() => {
//                             const item = scheduleData.find(s => s.id === currentTimeSlot);
//                             const [hours, minutes] = item.time.split(':').map(Number);
//                             const endTime = new Date();
//                             endTime.setHours(hours, minutes + item.duration, 0);
//                             return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
//                           })()}
//                         </p>
//                       </div>
//                       {scheduleData.find(item => item.id === currentTimeSlot).replayAvailable && (
//                         <Link
//                           href={`/replay/${scheduleData.find(item => item.id === currentTimeSlot).id}`}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors text-sm"
//                         >
//                           Regarder
//                         </Link>
//                       )}
//                     </div>
//                     <p className="text-blue-100 mb-4">
//                       {scheduleData.find(item => item.id === currentTimeSlot).description}
//                     </p>
//                     {scheduleData.find(item => item.id === currentTimeSlot).presenter && (
//                       <div className="flex items-center">
//                         <span className="text-sm text-blue-300 mr-2">Présentateur:</span>
//                         <Link
//                           href={`/presentateurs/${scheduleData.find(item => item.id === currentTimeSlot).presenter.toLowerCase().replace(/\s+/g, '-')}`}
//                           className="text-sm text-blue-200 hover:text-white transition-colors"
//                         >
//                           {scheduleData.find(item => item.id === currentTimeSlot).presenter}
//                         </Link>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* Schedule Table */}
//           <motion.div 
//             className="bg-blue-800 rounded-xl overflow-hidden shadow-lg border border-blue-700"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1, duration: 0.5 }}
//           >
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-blue-700">
//                 <thead className="bg-blue-950">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider w-24">
//                       Heure
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
//                       Programme
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider hidden md:table-cell">
//                       Catégorie
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-blue-300 uppercase tracking-wider w-28">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-blue-800 divide-y divide-blue-700">
//                   {filteredSchedule.map((item, index) => (
//                     <motion.tr 
//                       key={item.id}
//                       className={`${currentTimeSlot === item.id ? 'bg-blue-700' : ''} hover:bg-blue-700 transition-colors`}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.05 * index, duration: 0.3 }}
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap text-white">
//                         <div className="flex items-center">
//                           {currentTimeSlot === item.id && currentDayIndex === 0 && (
//                             <span className="relative flex h-2 w-2 mr-2">
//                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                               <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
//                             </span>
//                           )}
//                           {formatTime(item.time)}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-start">
//                           {item.featured && (
//                             <span className="inline-flex mr-2 mt-1">
//                               <Star className="w-4 h-4 text-yellow-400" />
//                             </span>
//                           )}
//                           <div>
//                             <h3 className="text-base font-medium text-white flex items-center">
//                               {item.title}
//                               {item.specialGuest && (
//                                 <span className="ml-2 text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">
//                                   Invité: {item.specialGuest}
//                                 </span>
//                               )}
//                             </h3>
//                             <p className="text-sm text-blue-200 mt-1">{item.description}</p>
//                             {item.presenter && (
//                               <Link
//                                 href={`/presentateurs/${item.presenter.toLowerCase().replace(/\s+/g, '-')}`}
//                                 className="text-xs text-blue-300 hover:text-white transition-colors mt-1 inline-block"
//                               >
//                                 Présenté par {item.presenter}
//                               </Link>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
//                         <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-200">
//                           {item.category}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <div className="flex items-center justify-end space-x-2">
//                           {showReminders && (
//                             <button className="p-1 text-blue-300 hover:text-white transition-colors">
//                               <Bell className="w-5 h-5" />
//                             </button>
//                           )}
//                           {item.replayAvailable && (
//                             <Link
//                               href={`/replay/${item.id}`}
//                               className="p-1 text-blue-300 hover:text-white transition-colors"
//                             >
//                               <PlayCircle className="w-5 h-5" />
//                             </Link>
//                           )}
//                           <button className="p-1 text-blue-300 hover:text-white transition-colors">
//                             <Bookmark className="w-5 h-5" />
//                           </button>
//                         </div>
//                       </td>
//                     </motion.tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>

//           {/* Guide Legend */}
//           <div className="mt-6 bg-blue-800 rounded-xl p-6 shadow-lg border border-blue-700">
//             <h3 className="text-lg font-medium text-white mb-4">Légende</h3>
//             <div className="flex flex-wrap gap-4">
//               <div className="flex items-center">
//                 <Star className="w-4 h-4 text-yellow-400 mr-2" />
//                 <span className="text-sm text-blue-100">Programme à ne pas manquer</span>
//               </div>
//               <div className="flex items-center">
//                 <PlayCircle className="w-4 h-4 text-blue-300 mr-2" />
//                 <span className="text-sm text-blue-100">Disponible en replay</span>
//               </div>
//               <div className="flex items-center">
//                 <Bell className="w-4 h-4 text-blue-300 mr-2" />
//                 <span className="text-sm text-blue-100">Définir un rappel</span>
//               </div>
//               <div className="flex items-center">
//   <Bookmark className="w-4 h-4 text-blue-300 mr-2" />
//   <span className="text-sm text-blue-100">Ajouter aux favoris</span>
// </div>
// <div className="flex items-center">
//   <span className="relative flex h-3 w-3 mr-2">
//     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//     <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
//   </span>
//   <span className="text-sm text-blue-100">En direct maintenant</span>
// </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Download Section */}
//       <section className="py-12 bg-blue-950">
//         <div className="max-w-7xl mx-auto px-4">
//           <motion.div 
//             className="bg-blue-800 rounded-xl shadow-lg overflow-hidden border border-blue-700"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="grid grid-cols-1 md:grid-cols-2">
//               <div className="p-8 md:p-12">
//                 <h2 className="text-2xl font-bold text-white mb-4">Téléchargez notre grille TV</h2>
//                 <p className="text-blue-200 mb-6">
//                   Gardez toujours notre programmation à portée de main. Téléchargez la grille des programmes de GCUTV au format PDF pour la consulter même hors ligne.
//                 </p>
//                 <div className="space-y-4">
//                   <Link
//                     href="/grille-tv/pdf"
//                     className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors w-full md:w-auto justify-center"
//                     target="_blank"
//                   >
//                     <Download className="w-5 h-5 mr-2" />
//                     Télécharger la grille complète
//                   </Link>
//                   <Link
//                     href="/grille-tv/hebdo"
//                     className="flex items-center px-6 py-3 bg-blue-900 border border-blue-600 text-blue-200 rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto justify-center"
//                   >
//                     <Calendar className="w-5 h-5 mr-2" />
//                     Vue hebdomadaire
//                   </Link>
//                 </div>
//               </div>
//               <div className="hidden md:block">
//                 <img 
//                   src="/api/placeholder/600/500" 
//                   alt="Programme PDF" 
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//      {/* App Download Banner */}
//      <section className="py-16 bg-blue-800 text-white">
//         <div className="max-w-7xl mx-auto px-4 text-center">
//           <motion.h2 
//             className="text-3xl md:text-4xl font-bold mb-6"
//             initial={{ opacity: 0, y: -20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5 }}
//           >
//             Ne manquez plus jamais vos émissions préférées !
//           </motion.h2>
//           <motion.p 
//             className="text-xl text-blue-200 max-w-3xl mx-auto mb-8"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.1, duration: 0.5 }}
//           >
//             Téléchargez notre application mobile pour consulter la grille TV, recevoir des notifications pour vos programmes favoris et regarder GCUTV en direct ou en replay.
//           </motion.p>
//           <motion.div 
//             className="flex flex-col sm:flex-row items-center justify-center gap-4"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//           >
//             <Link 
//               href="/application-mobile"
//               className="flex items-center px-8 py-3 bg-white text-blue-800 rounded-md hover:bg-blue-100 transition-colors"
//             >
//               En savoir plus
//             </Link>
//             <Link 
//               href="#"
//               className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
//             >
//               Télécharger l'application
//             </Link>
//           </motion.div>
//         </div>
//       </section>

//       <Footer />
//     </motion.main>
//   );
// };

// export default GrilleTVPage;



'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';

const GrilleTVPage = () => {
  return (
    <motion.main 
      className="bg-blue-900 min-h-screen flex flex-col justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Navigation */}
      <Navigation />
      
      {/* Coming Soon Message */}
      <motion.div
        className="flex-grow flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="bg-blue-800 rounded-lg p-8 text-center border border-blue-700">
          <h1 className="text-4xl font-bold text-white mb-4">Bientôt Disponible</h1>
          <p className="text-xl text-blue-200 mb-6">
            La grille TV de GCUTV arrive bientôt avec une programmation exclusive !
          </p>
          <button 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            onClick={() => window.location.href = '/'}
          >
            Retour à l'accueil
          </button>
        </div>
      </motion.div>
      
      {/* Footer */}
      <Footer />
    </motion.main>
  );
};

export default GrilleTVPage;