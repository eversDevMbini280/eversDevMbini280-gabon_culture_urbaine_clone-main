// 'use client'
// import React, { useState } from 'react';
// import Navigation from '@/components/navigation';
// import Footer from '@/components/Footer';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { Users, Mic, Award, Search, Filter, Instagram, Twitter, Youtube, ExternalLink } from 'lucide-react';

// const PresentateursPage = () => {
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');

//   // Presenters data
//   const presenters = [
//     {
//       id: 1,
//       name: "Michel Nguema",
//       role: "Présentateur Principal JT",
//       image: "/api/placeholder/600/600",
//       bio: "Michel anime le journal télévisé de GCUTV depuis 2021. Avec son style dynamique et sa présence charismatique, il a su conquérir le cœur des téléspectateurs.",
//       categories: ["journal", "actualités"],
//       shows: ["JT Culture", "Décryptage Hebdo"],
//       socialMedia: {
//         instagram: "michel_nguema",
//         twitter: "michelnguema",
//       },
//       awards: ["Meilleur présentateur 2023"],
//       featured: true
//     },
//     {
//       id: 2,
//       name: "Sophie Mboumba",
//       role: "Animatrice Musicale",
//       image: "/api/placeholder/600/600",
//       bio: "Sophie est la référence musicale de GCUTV. Elle présente plusieurs émissions musicales et est reconnue pour sa connaissance approfondie de la scène musicale gabonaise et africaine.",
//       categories: ["musique", "culture"],
//       shows: ["Top Hits Gabon", "Interview Artistes"],
//       socialMedia: {
//         instagram: "sophiemboumba",
//         twitter: "sophie_mboumba",
//         youtube: "SophieMboumbaTV"
//       },
//       awards: ["Prix découverte média 2022"],
//       featured: true
//     },
//     {
//       id: 3,
//       name: "Jean-Paul Okily",
//       role: "Chroniqueur Culture Urbaine",
//       image: "/api/placeholder/600/600",
//       bio: "Expert de la culture urbaine, Jean-Paul décrypte les tendances et anime des débats passionnants sur les différentes expressions artistiques urbaines au Gabon.",
//       categories: ["culture", "débats"],
//       shows: ["Urban Talk", "Street Culture"],
//       socialMedia: {
//         instagram: "jp_okily",
//         twitter: "jeanpaulokily",
//       },
//       featured: true
//     },
//     {
//       id: 4,
//       name: "Marie Nzinga",
//       role: "Journaliste Terrain",
//       image: "/api/placeholder/600/600",
//       bio: "Marie est notre reporter de terrain qui va à la rencontre des artistes et acteurs culturels dans tout le Gabon pour des reportages authentiques et immersifs.",
//       categories: ["reportages", "actualités"],
//       shows: ["Immersion", "À la Rencontre"],
//       socialMedia: {
//         instagram: "marie_nzinga",
//       },
//       featured: false
//     },
//     {
//       id: 5,
//       name: "Patrick Moussavou",
//       role: "Animateur Événementiel",
//       image: "/api/placeholder/600/600",
//       bio: "La voix des grands événements de GCUTV, Patrick anime les cérémonies et festivals diffusés sur notre chaîne avec une énergie contagieuse.",
//       categories: ["événements", "divertissement"],
//       shows: ["GCUTV en Direct", "Festival Live"],
//       socialMedia: {
//         instagram: "patrick_moussavou",
//         twitter: "patrickmoussavou",
//         youtube: "PatrickMShow"
//       },
//       awards: ["Meilleur animateur événementiel 2023"],
//       featured: false
//     },
//     {
//       id: 6,
//       name: "Carine Obame",
//       role: "Présentatrice Mode & Lifestyle",
//       image: "/api/placeholder/600/600",
//       bio: "Passionnée de mode et de lifestyle, Carine présente les dernières tendances et conseils pour un style urbain authentique et adapté au contexte gabonais.",
//       categories: ["mode", "lifestyle"],
//       shows: ["Urban Style", "Mode en Ville"],
//       socialMedia: {
//         instagram: "carine_obame_style",
//       },
//       featured: true
//     },
//     {
//       id: 7,
//       name: "David Ondo",
//       role: "Présentateur Sports Urbains",
//       image: "/api/placeholder/600/600",
//       bio: "Ancien basketteur professionnel, David couvre les sports urbains et présente les événements sportifs majeurs de la scène gabonaise.",
//       categories: ["sports", "événements"],
//       shows: ["Urban Sports", "Terrain de Jeu"],
//       socialMedia: {
//         instagram: "david_ondo",
//         twitter: "davidondo",
//       },
//       featured: false
//     },
//     {
//       id: 8,
//       name: "Francine Mabika",
//       role: "Chroniqueuse Jeunesse",
//       image: "/api/placeholder/600/600",
//       bio: "Francine est la voix de la jeunesse sur GCUTV. Elle aborde les sujets qui intéressent les jeunes et donne la parole à la nouvelle génération.",
//       categories: ["jeunesse", "débats"],
//       shows: ["Génération Z", "Parole aux Jeunes"],
//       socialMedia: {
//         instagram: "francine_mabika",
//         twitter: "francinemabika",
//       },
//       featured: false
//     }
//   ];

//   // Category filters
//   const categories = [
//     { id: "all", label: "Tous" },
//     { id: "actualités", label: "Actualités" },
//     { id: "culture", label: "Culture" },
//     { id: "musique", label: "Musique" },
//     { id: "mode", label: "Mode & Style" },
//     { id: "sports", label: "Sports" },
//     { id: "débats", label: "Débats" },
//     { id: "jeunesse", label: "Jeunesse" }
//   ];

//   // Filter presenters based on active filter and search query
//   const filteredPresenters = presenters.filter(presenter => {
//     const matchesFilter = activeFilter === 'all' || presenter.categories.includes(activeFilter);
//     const matchesSearch = presenter.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                          presenter.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          presenter.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
//     return matchesFilter && matchesSearch;
//   });

//   // Featured presenters (for hero section)
//   const featuredPresenters = presenters.filter(presenter => presenter.featured);

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
//         className="relative bg-blue-600 text-white"
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
//               <Users className="w-8 h-8 text-blue-600" />
//             </motion.div>
//             <h1 className="text-4xl font-bold">Nos Présentateurs</h1>
//           </motion.div>
//           <motion.p 
//             className="text-lg text-blue-100 max-w-3xl mb-8"
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//           >
//             Découvrez les visages et les voix de GCUTV qui vous accompagnent au quotidien pour vous faire vivre la culture urbaine gabonaise dans toute sa richesse.
//           </motion.p>
          
//           {/* Featured Presenters Carousel - Improved horizontal scrolling */}
//           <motion.div 
//             className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x"
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.4, duration: 0.5 }}
//             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//           >
//             {featuredPresenters.map((presenter, index) => (
//               <motion.div 
//                 key={presenter.id}
//                 className="min-w-[250px] snap-start bg-white/10 backdrop-blur-sm p-4 rounded-xl flex items-center gap-4"
//                 initial={{ x: 30 * index, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.4 + (index * 0.1), duration: 0.5 }}
//                 whileHover={{ y: -5 }}
//               >
//                 <img 
//                   src={presenter.image} 
//                   alt={presenter.name}
//                   className="w-16 h-16 rounded-full object-cover"
//                 />
//                 <div>
//                   <h3 className="font-bold">{presenter.name}</h3>
//                   <p className="text-sm text-blue-200">{presenter.role}</p>
//                   <Link 
//                     href={`/presentateurs/${presenter.id}`}
//                     className="text-xs text-white/80 hover:text-white flex items-center mt-1"
//                   >
//                     Voir le profil
//                     <ExternalLink className="w-3 h-3 ml-1" />
//                   </Link>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//         <motion.div 
//           className="absolute inset-0 opacity-30"
//           initial={{ scale: 1.1, opacity: 0 }}
//           animate={{ scale: 1, opacity: 0.3 }}
//           transition={{ duration: 1.2 }}
//         >
//           <img 
//             src="/api/placeholder/1920/600" 
//             alt="Présentateurs GCUTV" 
//             className="w-full h-full object-cover"
//           />
//         </motion.div>
//       </motion.div>

//       {/* Search and Filter Bar */}
//       <div className="sticky top-0 bg-white shadow-md z-20">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex flex-col md:flex-row gap-4 items-center">
//             {/* Search */}
//             <div className="relative w-full md:w-1/3">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Rechercher un présentateur..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
            
//             {/* Categories - Improved horizontal scrolling */}
//             <div className="flex items-center gap-2 overflow-x-auto w-full scrollbar-hide snap-x"
//                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//               <Filter className="text-gray-400 flex-shrink-0" />
//               {categories.map(category => (
//                 <button
//                   key={category.id}
//                   onClick={() => setActiveFilter(category.id)}
//                   className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 snap-start ${
//                     activeFilter === category.id
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                 >
//                   {category.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Presenters Grid */}
//       <section className="py-16">
//         <div className="max-w-7xl mx-auto px-4">
//           {filteredPresenters.length === 0 ? (
//             <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl p-8">
//               <motion.div 
//                 className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4"
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <Search className="w-8 h-8" />
//               </motion.div>
//               <h2 className="text-2xl font-bold text-white mb-2">Aucun résultat trouvé</h2>
//               <p className="text-blue-200">
//                 Aucun présentateur ne correspond à votre recherche.
//                 Essayez d'autres termes ou filtres.
//               </p>
//               <button
//                 onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
//                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Réinitialiser la recherche
//               </button>
//             </div>
//           ) : (
//             <motion.div 
//               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//             >
//               {filteredPresenters.map((presenter, index) => (
//                 <motion.div 
//                   key={presenter.id}
//                   className="bg-white rounded-xl shadow-md overflow-hidden text-gray-900"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.05, duration: 0.5 }}
//                   whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
//                 >
//                   <motion.div 
//                     className="relative h-72 overflow-hidden"
//                     whileHover={{ scale: 1.03 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <div className="overflow-x-auto w-full h-full scrollbar-hide snap-x"
//                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//                       <img 
//                         src={presenter.image} 
//                         alt={presenter.name}
//                         className="w-full h-full object-cover snap-center"
//                       />
//                     </div>
//                     {presenter.awards && presenter.awards.length > 0 && (
//                       <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
//                         <Award className="w-3 h-3 mr-1" />
//                         {presenter.awards[0]}
//                       </div>
//                     )}
//                   </motion.div>
                  
//                   <div className="p-6">
//                     <div className="mb-4">
//                       <h3 className="text-xl font-bold text-gray-900 mb-1">{presenter.name}</h3>
//                       <p className="text-blue-600">{presenter.role}</p>
//                     </div>
                    
//                     <p className="text-gray-600 mb-4 line-clamp-3">{presenter.bio}</p>
                    
//                     <div className="mb-4">
//                       <h4 className="text-sm font-medium text-gray-900 mb-2">Émissions :</h4>
//                       <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide snap-x"
//                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//                         {presenter.shows.map((show, idx) => (
//                           <span 
//                             key={idx} 
//                             className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded snap-start"
//                           >
//                             {show}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
                    
//                     <div className="flex justify-between items-center">
//                       <div className="flex gap-2">
//                         {presenter.socialMedia.instagram && (
//                           <a 
//                             href={`https://instagram.com/${presenter.socialMedia.instagram}`} 
//                             target="_blank" 
//                             rel="noopener noreferrer"
//                             className="text-gray-500 hover:text-pink-600 transition-colors"
//                           >
//                             <Instagram className="w-5 h-5" />
//                           </a>
//                         )}
//                         {presenter.socialMedia.twitter && (
//                           <a 
//                             href={`https://twitter.com/${presenter.socialMedia.twitter}`} 
//                             target="_blank" 
//                             rel="noopener noreferrer"
//                             className="text-gray-500 hover:text-blue-400 transition-colors"
//                           >
//                             <Twitter className="w-5 h-5" />
//                           </a>
//                         )}
//                         {presenter.socialMedia.youtube && (
//                           <a 
//                             href={`https://youtube.com/${presenter.socialMedia.youtube}`} 
//                             target="_blank" 
//                             rel="noopener noreferrer"
//                             className="text-gray-500 hover:text-red-600 transition-colors"
//                           >
//                             <Youtube className="w-5 h-5" />
//                           </a>
//                         )}
//                       </div>
                      
//                       <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
//                         <Link 
//                           href={`/presentateurs/${presenter.id}`}
//                           className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
//                         >
//                           Profil complet
//                           <ExternalLink className="w-4 h-4 ml-1" />
//                         </Link>
//                       </motion.div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </motion.div>
//           )}
//         </div>
//       </section>

//       {/* Join Our Team Banner */}
//       <section className="py-16 bg-blue-700 text-white">
//         <div className="max-w-7xl mx-auto px-4 text-center">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5 }}
//             className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-xl"
//           >
//             <motion.div 
//               className="inline-flex bg-white p-3 rounded-full text-blue-600 mb-6"
//               initial={{ scale: 0.8, opacity: 0 }}
//               whileInView={{ scale: 1, opacity: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.1, duration: 0.5 }}
//             >
//               <Mic className="w-8 h-8" />
//             </motion.div>
            
//             <h2 className="text-3xl font-bold mb-4">Rejoignez notre équipe de présentateurs</h2>
//             <p className="max-w-2xl mx-auto text-blue-100 mb-8">
//               Vous êtes passionné(e) par la culture urbaine et vous avez le talent pour animer des émissions? GCUTV est toujours à la recherche de nouvelles voix et de nouveaux visages.
//             </p>
            
//             <motion.div 
//               whileHover={{ scale: 1.05 }} 
//               whileTap={{ scale: 0.95 }}
//             >
//               <Link 
//                 href="/carrieres"
//                 className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
//               >
//                 Voir nos opportunités
//               </Link>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       <Footer />
//     </motion.main>
//   );
// };

// export default PresentateursPage;


'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';

const PresentateursPage = () => {
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
            La page des présentateurs GCUTV arrive bientôt avec des profils exclusifs !
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

export default PresentateursPage;