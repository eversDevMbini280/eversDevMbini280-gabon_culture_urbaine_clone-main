// 'use client'
// import React, { useState, useEffect, useRef } from 'react';
// import Navigation from '@/components/navigation';
// import Footer from '@/components/Footer';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { Info, Users, Map, Award, TrendingUp, Calendar, Mail, Phone, Camera, PlayCircle, Headphones, Clock, Tv, ChevronLeft, ChevronRight } from 'lucide-react';
// import axios from 'axios';

// const AProposPage = () => {
//   const teamScrollContainerRef = useRef(null);
//   const timelineScrollContainerRef = useRef(null);
//   const statsScrollContainerRef = useRef(null);
//   const valuesScrollContainerRef = useRef(null);
//   const [teamMembers, setTeamMembers] = useState([]);
//   const [milestones, setMilestones] = useState([]);
//   const [stats, setStats] = useState([]);
//   const [values, setValues] = useState([]);
//   const [contactInfo, setContactInfo] = useState(null);
//   const [aboutContent, setAboutContent] = useState(null);
//   const [studios, setStudios] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const apiUrl = 'https://gabon-culture-urbaine-1.onrender.com/apropos';
//   const staticBaseUrl = 'https://gabon-culture-urbaine-1.onrender.com';


//   // Static fallback image - use a proper path to an image that exists on your server
//   const STATIC_FALLBACK_IMAGE = "/images/default-avatar.jpg"; // Make sure this image exists in your public/images folder

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [teamRes, milestoneRes, statsRes, valuesRes, contactRes, aboutRes, studiosRes] = await Promise.all([
//           axios.get(`${apiUrl}/team-members/`),
//           axios.get(`${apiUrl}/milestones/`),
//           axios.get(`${apiUrl}/stats/`),
//           axios.get(`${apiUrl}/values/`),
//           axios.get(`${apiUrl}/contact-info/`),
//           axios.get(`${apiUrl}/about-content/`),
//           axios.get(`${apiUrl}/studios/`),
//         ]);

//         // Debug logging
//         console.log('Team members response:', teamRes.data);
//         console.log('First team member image_url:', teamRes.data[0]?.image_url);
//         console.log('Constructed image URL:', `${apiUrl}${teamRes.data[0]?.image_url}`);

//         setTeamMembers(teamRes.data);
//         setMilestones(milestoneRes.data);
//         setStats(statsRes.data);
//         setValues(valuesRes.data);
//         setContactInfo(contactRes.data[0] || null);
//         setAboutContent(aboutRes.data[0] || null);
//         setStudios(studiosRes.data[0] || null);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleScroll = (containerId, direction) => {
//     const container = document.getElementById(containerId);
//     if (container) {
//       const scrollDistance = container.clientWidth * 0.5;
//       container.scrollBy({ left: direction * scrollDistance, behavior: 'smooth' });
//     }
//   };

//   useEffect(() => {
//     const handleWheelScroll = (event, container) => {
//       if (container && event.deltaY !== 0) {
//         event.preventDefault();
//         container.scrollLeft += event.deltaY;
//       }
//     };

//     const containers = [
//       { id: 'team-scroll-container', ref: teamScrollContainerRef },
//       { id: 'timeline-scroll-container', ref: timelineScrollContainerRef },
//       { id: 'stats-scroll-container', ref: statsScrollContainerRef },
//       { id: 'values-scroll-container', ref: valuesScrollContainerRef },
//     ];

//     containers.forEach(({ id, ref }) => {
//       const container = document.getElementById(id);
//       if (container) {
//         container.addEventListener('wheel', (e) => handleWheelScroll(e, container), { passive: false });
//         ref.current = container;
//       }
//     });

//     return () => {
//       containers.forEach(({ id }) => {
//         const container = document.getElementById(id);
//         if (container) {
//           container.removeEventListener('wheel', handleWheelScroll);
//         }
//       });
//     };
//   }, []);

//   // Custom hook for handling image loading with fallback
//   const useImageWithFallback = (src, fallback) => {
//     const [imgSrc, setImgSrc] = useState(src);
//     const [isLoading, setIsLoading] = useState(true);
//     const [hasErrored, setHasErrored] = useState(false);

//     const handleLoad = () => {
//       setIsLoading(false);
//       console.log('Image loaded successfully:', src);
//     };

//     const handleError = () => {
//       if (!hasErrored) {
//         console.error('Image failed to load:', src);
//         setHasErrored(true);
//         setImgSrc(fallback);
//         setIsLoading(false);
//       }
//     };

//     return { imgSrc, handleLoad, handleError, isLoading };
//   };

//   const MobileScrollIndicator = ({ containerId, light = false }) => (
//     <div className="flex items-center justify-center mt-1 mb-3 md:hidden">
//       <div className="flex flex-col items-center">
//         <p className={`text-sm ${light ? 'text-blue-200' : 'text-blue-600'} mb-1`}>Faire défiler</p>
//         <div className="flex items-center">
//           <ChevronLeft className={`w-5 h-5 ${light ? 'text-blue-300' : 'text-blue-500'}`} />
//           <div className="flex items-center scroll-indicator" onClick={() => document.getElementById(containerId).scrollLeft += 100}>
//             <ChevronRight className={`w-6 h-6 ${light ? 'text-blue-300' : 'text-blue-500'}`} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) return <div className="text-white text-center py-16">Chargement...</div>;

//   return (
//     <motion.main className="min-h-screen bg-blue-900" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
//       <Navigation />
//       <style jsx>{`
//         @keyframes scrollIndicator {
//           0% { opacity: 0.7; transform: translateX(0); }
//           50% { opacity: 1; transform: translateX(10px); }
//           100% { opacity: 0.7; transform: translateX(0); }
//         }
//         .scroll-indicator { animation: scrollIndicator 1.5s ease-in-out infinite; }
//         .custom-scrollbar::-webkit-scrollbar { height: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.7); border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 1); }
//         @media (max-width: 768px) {
//           .custom-scrollbar::-webkit-scrollbar { display: none; }
//           .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//         }
//       `}</style>

//       {/* Hero Section */}
//       <motion.div className="relative bg-blue-600 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
//         <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
//           <motion.div className="flex items-center gap-3 mb-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
//             <motion.div className="bg-white p-2 rounded-lg" initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
//               <Info className="w-8 h-8 text-blue-600" />
//             </motion.div>
//             <h1 className="text-4xl font-bold">À Propos de GCUTV</h1>
//           </motion.div>
//           <motion.p className="text-lg text-blue-100 max-w-3xl mb-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
//             Découvrez l'histoire, la mission et les valeurs qui font de GCUTV la référence de la culture urbaine gabonaise.
//           </motion.p>
//         </div>
//         <motion.div className="absolute inset-0 opacity-30" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 0.3 }} transition={{ duration: 1.2 }}>
//         <img 
//                 src="/images/logo2.png" 
//                 alt="GCUTV Studio" className="w-full h-full object-cover" />
//         </motion.div>
//       </motion.div>

//       {/* Mission & Vision Section */}
//       {aboutContent && (
//         <section className="py-16 bg-blue-950">
//           <div className="max-w-7xl mx-auto px-4">
//             <motion.div className="flex flex-col md:flex-row gap-12 items-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
//               <motion.div className="md:w-1/2" initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
//                 <div className="relative">
//                   <img src={STATIC_FALLBACK_IMAGE} alt="GCUTV Mission" className="rounded-lg shadow-lg w-full" />
//                   <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
//                     <h3 className="text-lg font-bold">{aboutContent.mission_title}</h3>
//                     <p className="text-sm text-blue-100">{aboutContent.mission_subtitle}</p>
//                   </div>
//                 </div>
//               </motion.div>
//               <motion.div className="md:w-1/2 space-y-6" initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
//                 <div className="border-l-4 border-blue-600 pl-4">
//                   <h2 className="text-3xl font-bold text-white mb-2">{aboutContent.history_title}</h2>
//                   <p className="text-blue-300 font-medium">{aboutContent.history_subtitle}</p>
//                 </div>
//                 <p className="text-blue-100">{aboutContent.history_text1}</p>
//                 <p className="text-blue-100">{aboutContent.history_text2}</p>
//                 <div className="bg-white border-l-4 border-blue-600 p-4 rounded-r-lg">
//                   <h3 className="text-xl font-bold text-gray-900 mb-2">{aboutContent.mission_title}</h3>
//                   <p className="text-gray-700">{aboutContent.mission_text}</p>
//                 </div>
//                 <div className="bg-white border-l-4 border-green-600 p-4 rounded-r-lg">
//                   <h3 className="text-xl font-bold text-gray-900 mb-2">{aboutContent.vision_title}</h3>
//                   <p className="text-gray-700">{aboutContent.vision_text}</p>
//                 </div>
//               </motion.div>
//             </motion.div>
//           </div>
//         </section>
//       )}

//       {/* Notre Équipe Section */}
//       <section className="py-16 bg-blue-900">
//         <div className="max-w-7xl mx-auto px-4">
//           <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
//             <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
//               <Users className="w-6 h-6 text-blue-600" />
//             </motion.div>
//             <h2 className="text-3xl font-bold text-white">Notre Équipe</h2>
//           </motion.div>
//           <div className="relative">
//             <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
//               <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('team-scroll-container', -1)} aria-label="Précédent">
//                 <ChevronLeft className="h-6 w-6" />
//               </button>
//             </div>
//             <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
//               <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('team-scroll-container', 1)} aria-label="Suivant">
//                 <ChevronRight className="h-6 w-6" />
//               </button>
//             </div>
//             <div id="team-scroll-container" ref={teamScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//               {teamMembers.map((member, index) => {
//                 const TeamMemberImage = ({ member }) => {
//                 const imageUrl = member.image_url ? `${staticBaseUrl}${member.image_url}` : STATIC_FALLBACK_IMAGE;
//                   const { imgSrc, handleLoad, handleError } = useImageWithFallback(imageUrl, STATIC_FALLBACK_IMAGE);

//                   return (
//                     <motion.img
//                       src={imgSrc}
//                       alt={member.name}
//                       className="w-full h-full object-cover"
//                       whileHover={{ scale: 1.05 }}
//                       transition={{ duration: 0.3 }}
//                       onLoad={handleLoad}
//                       onError={handleError}
//                     />
//                   );
//                 };

//                 return (
//                   <motion.div key={member.id} className="flex-none w-full sm:w-1/2 lg:w-1/4 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }} whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}>
//                     <div className="bg-white rounded-xl overflow-hidden shadow-md h-full">
//                       <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
//                         <TeamMemberImage member={member} />
//                       </div>
//                       <div className="p-6">
//                         <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
//                         <p className="text-blue-600 font-medium mb-3">{member.role}</p>
//                         <p className="text-gray-600 text-sm">{member.bio}</p>
//                       </div>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//             <MobileScrollIndicator containerId="team-scroll-container" light={true} />
//           </div>
//         </div>
//       </section>

//       {/* Timeline Section */}
//       <section className="py-16 bg-blue-950">
//         <div className="max-w-7xl mx-auto px-4">
//           <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
//             <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
//               <Calendar className="w-6 h-6 text-blue-600" />
//             </motion.div>
//             <h2 className="text-3xl font-bold text-white">Notre Histoire</h2>
//           </motion.div>
//           <div className="hidden md:block relative">
//             <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 z-0"></div>
//             <div className="relative z-10">
//               {milestones.slice(0, 4).map((milestone, index) => (
//                 <motion.div key={milestone.id} className={`flex items-center mb-16 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
//                   <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
//                     <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
//                       <h3 className="font-bold text-blue-600 text-xl mb-2">{milestone.title}</h3>
//                       <p className="text-gray-700">{milestone.description}</p>
//                     </div>
//                   </div>
//                   <div className="relative flex items-center justify-center">
//                     <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md z-10">
//                       <span className="text-white font-bold text-sm">{milestone.year}</span>
//                     </div>
//                   </div>
//                   <div className="w-5/12"></div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//           <div className="relative md:hidden">
//             <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden">
//               <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('timeline-scroll-container', -1)} aria-label="Précédent">
//                 <ChevronLeft className="h-6 w-6" />
//               </button>
//             </div>
//             <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden">
//               <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('timeline-scroll-container', 1)} aria-label="Suivant">
//                 <ChevronRight className="h-6 w-6" />
//               </button>
//             </div>
//             <div id="timeline-scroll-container" ref={timelineScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
//               {milestones.map((milestone, index) => (
//                 <motion.div key={milestone.id} className="flex-none w-full sm:w-4/5 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
//                   <div className="bg-white p-6 rounded-lg shadow-md mb-4 relative">
//                     <div className="absolute -top-3 left-4 bg-blue-600 px-3 py-1 rounded-full">
//                       <span className="text-white font-bold text-sm">{milestone.year}</span>
//                     </div>
//                     <h3 className="font-bold text-blue-600 text-xl mb-2 mt-4">{milestone.title}</h3>
//                     <p className="text-gray-700">{milestone.description}</p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//             <MobileScrollIndicator containerId="timeline-scroll-container" light={true} />
//           </div>
//         </div>
//       </section>

//       {/* Key Stats Section */}
//       <section className="py-16 bg-blue-600 text-white">
//         <div className="max-w-7xl mx-auto px-4">
//           <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
//             <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
//               <TrendingUp className="w-6 h-6 text-blue-600" />
//             </motion.div>
//             <h2 className="text-3xl font-bold">GCUTV en Chiffres</h2>
//           </motion.div>
//           <div className="relative">
//             <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
//               <button className="p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-colors" onClick={() => handleScroll('stats-scroll-container', -1)} aria-label="Précédent">
//                 <ChevronLeft className="h-6 w-6" />
//               </button>
//             </div>
//             <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
//               <button className="p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-colors" onClick={() => handleScroll('stats-scroll-container', 1)} aria-label="Suivant">
//                 <ChevronRight className="h-6 w-6" />
//               </button>
//             </div>
//             <div id="stats-scroll-container" ref={statsScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
//               {stats.map((stat, index) => (
//                 <motion.div key={stat.id} className="flex-none w-full sm:w-1/2 md:w-1/4 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.4 }} whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}>
//                   <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center h-full">
//                     <motion.div className="inline-flex items-center justify-center mb-4 text-blue-300" whileHover={{ rotate: 5, scale: 1.1 }} transition={{ duration: 0.3 }}>
//                       {stat.icon_name && React.createElement(require('lucide-react')[stat.icon_name], { className: 'w-10 h-10' })}
//                     </motion.div>
//                     <h3 className="text-3xl font-bold mb-2">{stat.number}</h3>
//                     <p className="text-blue-100">{stat.label}</p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//             <MobileScrollIndicator containerId="stats-scroll-container" light={true} />
//           </div>
//         </div>
//       </section>

//       {/* Values Section */}
//       <section className="py-16 bg-blue-900">
//         <div className="max-w-7xl mx-auto px-4">
//           <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
//             <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
//               <Award className="w-6 h-6 text-blue-600" />
//             </motion.div>
//             <h2 className="text-3xl font-bold text-white">Nos Valeurs</h2>
//           </motion.div>
//           <div className="relative">
//             <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
//               <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('values-scroll-container', -1)} aria-label="Précédent">
//                 <ChevronLeft className="h-6 w-6" />
//               </button>
//             </div>
//             <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
//               <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('values-scroll-container', 1)} aria-label="Suivant">
//                 <ChevronRight className="h-6 w-6" />
//               </button>
//             </div>
//             <div id="values-scroll-container" ref={valuesScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
//               {values.map((value, index) => (
//                 <motion.div key={value.id} className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }} whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}>
//                   <div className="bg-white rounded-xl overflow-hidden shadow-md p-8 h-full">
//                     <motion.div className="bg-blue-100 inline-flex p-4 rounded-lg text-blue-600 mb-6" whileHover={{ rotate: 5, scale: 1.1 }} transition={{ duration: 0.3 }}>
//                       {value.icon_name && React.createElement(require('lucide-react')[value.icon_name], { className: 'w-8 h-8' })}
//                     </motion.div>
//                     <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
//                     <p className="text-gray-600">{value.description}</p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//             <MobileScrollIndicator containerId="values-scroll-container" light={true} />
//           </div>
//         </div>
//       </section>

//       {/* Contact Section */}
//       {contactInfo && (
//         <section className="py-16 bg-blue-950">
//           <div className="max-w-7xl mx-auto px-4">
//             <motion.div className="bg-white rounded-xl shadow-lg overflow-hidden" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
//               <div className="grid grid-cols-1 md:grid-cols-2">
//                 <div className="p-8 md:p-12">
//                   <h2 className="text-3xl font-bold text-gray-900 mb-6">Contactez-Nous</h2>
//                   <p className="text-gray-600 mb-8">Une question, une suggestion ou une proposition de partenariat ? Notre équipe est à votre écoute.</p>
//                   <div className="space-y-6">
//                     <div className="flex items-start gap-4">
//                       <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
//                         <Map className="w-6 h-6" />
//                       </div>
//                       <div>
//                         <h3 className="font-bold text-gray-900 mb-1">Adresse</h3>
//                         <p className="text-gray-600">{contactInfo.address}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-4">
//                       <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
//                         <Mail className="w-6 h-6" />
//                       </div>
//                       <div>
//                         <h3 className="font-bold text-gray-900 mb-1">Email</h3>
//                         <p className="text-gray-600">{contactInfo.email}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-4">
//                       <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
//                         <Phone className="w-6 h-6" />
//                       </div>
//                       <div>
//                         <h3 className="font-bold text-gray-900 mb-1">Téléphone</h3>
//                         <p className="text-gray-600">{contactInfo.phone}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-blue-600 p-8 md:p-12 text-white">
//                   <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
//                   <form className="space-y-4">
//                     <div>
//                       <label htmlFor="name" className="block text-sm font-medium mb-2">Nom complet</label>
//                       <input type="text" id="name" className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" placeholder="Votre nom" />
//                     </div>
//                     <div>
//                       <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
//                       <input type="email" id="email" className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" placeholder="votre@email.com" />
//                     </div>
//                     <div>
//                       <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
//                       <textarea id="message" rows="4" className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" placeholder="Votre message"></textarea>
//                     </div>
//                     <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium">
//                       Envoyer le message
//                     </motion.button>
//                   </form>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </section>
//       )}

//       {/* Map & Studios Section */}
//       {studios && (
//         <section className="py-16 bg-blue-900">
//           <div className="max-w-7xl mx-auto px-4">
//             <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
//               <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
//                 <Map className="w-6 h-6 text-blue-600" />
//               </motion.div>
//               <h2 className="text-3xl font-bold text-white">Nos Studios</h2>
//             </motion.div>
//             <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
//             <motion.div
//   initial={{ x: -50, opacity: 0 }}
//   whileInView={{ x: 0, opacity: 1 }}
//   viewport={{ once: true }}
//   transition={{ duration: 0.6 }}
// >
//   <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
//     <img
// src={studios.image_path ? `${staticBaseUrl}${studios.image_path}` : '/api/placeholder/400/600'}
// alt="GCUTV Studios"
//       className="w-full h-full object-cover rounded-lg shadow-lg"
//     />
//   </div>
// </motion.div>
//               <motion.div className="space-y-6" initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
//                 <h3 className="text-2xl font-bold text-white">{studios.title}</h3>
//                 <p className="text-blue-200">{studios.description}</p>
//                 <ul className="space-y-3 text-blue-100">
//                   {studios.features.split('\n').map((feature, index) => (
//                     <li key={index} className="flex items-start gap-2">
//                       <span className="inline-block bg-blue-400 rounded-full w-2 h-2 mt-2"></span>
//                       <span>{feature}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <p className="text-blue-200">{studios.collaboration_text}</p>
//                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                   <Link href="/contact" className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium">
//                     Organiser une visite
//                   </Link>
//                 </motion.div>
//               </motion.div>
//             </motion.div>
//           </div>
//         </section>            
//       )}



//       <Footer />
//     </motion.main>

//   );
// };

// export default AProposPage;



'use client';
import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Users, Map, Award, TrendingUp, Calendar, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import AdBanner from '@/components/AdBanner';

const AProposPage = () => {
  const teamScrollContainerRef = useRef(null);
  const timelineScrollContainerRef = useRef(null);
  const statsScrollContainerRef = useRef(null);
  const valuesScrollContainerRef = useRef(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [stats, setStats] = useState([]);
  const [values, setValues] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [aboutContent, setAboutContent] = useState(null);
  const [studios, setStudios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/apropos';
  const staticBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Static fallback image
  const STATIC_FALLBACK_IMAGE = "/images/default-avatar.jpg";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamRes, milestoneRes, statsRes, valuesRes, contactRes, aboutRes, studiosRes] = await Promise.all([
          axios.get(`${apiUrl}/team-members/`),
          axios.get(`${apiUrl}/milestones/`),
          axios.get(`${apiUrl}/stats/`),
          axios.get(`${apiUrl}/values/`),
          axios.get(`${apiUrl}/contact-info/`),
          axios.get(`${apiUrl}/about-content/`),
          axios.get(`${apiUrl}/studios/`),
        ]);

        console.log('Team members response:', teamRes.data);
        console.log('First team member image_url:', teamRes.data[0]?.image_url);
        console.log('Constructed image URL:', `${apiUrl}${teamRes.data[0]?.image_url}`);

        setTeamMembers(teamRes.data);
        setMilestones(milestoneRes.data);
        setStats(statsRes.data);
        setValues(valuesRes.data);
        setContactInfo(contactRes.data[0] || null);
        setAboutContent(aboutRes.data[0] || null);
        setStudios(studiosRes.data[0] || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleScroll = (containerId, direction) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollDistance = container.clientWidth * 0.5;
      container.scrollBy({ left: direction * scrollDistance, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleWheelScroll = (event, container) => {
      if (container && event.deltaY !== 0) {
        event.preventDefault();
        container.scrollLeft += event.deltaY;
      }
    };

    const containers = [
      { id: 'team-scroll-container', ref: teamScrollContainerRef },
      { id: 'timeline-scroll-container', ref: timelineScrollContainerRef },
      { id: 'stats-scroll-container', ref: statsScrollContainerRef },
      { id: 'values-scroll-container', ref: valuesScrollContainerRef },
    ];

    containers.forEach(({ id, ref }) => {
      const container = document.getElementById(id);
      if (container) {
        container.addEventListener('wheel', (e) => handleWheelScroll(e, container), { passive: false });
        ref.current = container;
      }
    });

    return () => {
      containers.forEach(({ id }) => {
        const container = document.getElementById(id);
        if (container) {
          container.removeEventListener('wheel', handleWheelScroll);
        }
      });
    };
  }, []);

  // Custom hook for handling image loading with fallback
  const useImageWithFallback = (src, fallback) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasErrored, setHasErrored] = useState(false);

    const handleLoad = () => {
      setIsLoading(false);
      console.log('Image loaded successfully:', src);
    };

    const handleError = () => {
      if (!hasErrored) {
        console.error('Image failed to load:', src);
        setHasErrored(true);
        setImgSrc(fallback);
        setIsLoading(false);
      }
    };

    return { imgSrc, handleLoad, handleError, isLoading };
  };

  const MobileScrollIndicator = ({ containerId, light = false }) => (
    <div className="flex items-center justify-center mt-1 mb-3 md:hidden">
      <div className="flex flex-col items-center">
        <p className={`text-sm ${light ? 'text-blue-200' : 'text-blue-600'} mb-1`}>Faire défiler</p>
        <div className="flex items-center">
          <ChevronLeft className={`w-5 h-5 ${light ? 'text-blue-300' : 'text-blue-500'}`} />
          <div className="flex items-center scroll-indicator" onClick={() => document.getElementById(containerId).scrollLeft += 100}>
            <ChevronRight className={`w-6 h-6 ${light ? 'text-blue-300' : 'text-blue-500'}`} />
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Component
  const ContactModal = () => (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Organiser une visite</h2>
            <p className="text-gray-600 mb-6">
              Contactez-nous sur ce numéro WhatsApp pour organiser une visite de nos studios :
            </p>
            <p className="text-blue-600 font-bold text-lg mb-6">
              +241 123 456 789
            </p>
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Fermer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Team Member Image Component
  const TeamMemberImage = ({ member }) => {
    const imageUrl = member.image_url ? `${staticBaseUrl}${member.image_url}` : STATIC_FALLBACK_IMAGE;
    const { imgSrc, handleLoad, handleError } = useImageWithFallback(imageUrl, STATIC_FALLBACK_IMAGE);

    return (
      <motion.img
        src={imgSrc}
        alt={member.name}
        className="w-full h-full object-cover rounded-xl"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  };

  if (loading) return <div className="text-white text-center py-16">Chargement...</div>;

  return (
    <motion.main className="min-h-screen bg-blue-900" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <Navigation />
      <ContactModal />
      <style jsx>{`
        @keyframes scrollIndicator {
          0% { opacity: 0.7; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(10px); }
          100% { opacity: 0.7; transform: translateX(0); }
        }
        .scroll-indicator { animation: scrollIndicator 1.5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.7); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 1); }
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { display: none; }
          .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        }
      `}</style>

      {/* Hero Section */}
      <motion.div className="relative bg-blue-600 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <motion.div className="flex items-center gap-3 mb-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg" initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <Info className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h1 className="text-4xl font-bold">À Propos de GCUTV</h1>
          </motion.div>
          <motion.p className="text-lg text-blue-100 max-w-3xl mb-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
            Découvrez l'histoire, la mission et les valeurs qui font de GCUTV la référence de la culture urbaine gabonaise.
          </motion.p>
        </div>
        <motion.div className="absolute inset-0 opacity-30" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 0.3 }} transition={{ duration: 1.2 }}>
          <img src="/images/logo2.png" alt="GCUTV Studio" className="w-full h-full object-cover" />
        </motion.div>
      </motion.div>

      {/* Mission & Vision Section */}
      {aboutContent && (
        <section className="py-16 bg-blue-950">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div className="flex flex-col md:flex-row gap-12 items-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <motion.div className="md:w-1/2" initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="relative">
                  <img src={STATIC_FALLBACK_IMAGE} alt="GCUTV Mission" className="rounded-lg shadow-lg w-full" />
                  <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold">{aboutContent.mission_title}</h3>
                    <p className="text-sm text-blue-100">{aboutContent.mission_subtitle}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div className="md:w-1/2 space-y-6" initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h2 className="text-3xl font-bold text-white mb-2">{aboutContent.history_title}</h2>
                  <p className="text-blue-300 font-medium">{aboutContent.history_subtitle}</p>
                </div>
                <p className="text-blue-100">{aboutContent.history_text1}</p>
                <p className="text-blue-100">{aboutContent.history_text2}</p>
                <div className="bg-white border-l-4 border-blue-600 p-4 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{aboutContent.mission_title}</h3>
                  <p className="text-gray-700">{aboutContent.mission_text}</p>
                </div>
                <div className="bg-white border-l-4 border-green-600 p-4 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{aboutContent.vision_title}</h3>
                  <p className="text-gray-700">{aboutContent.vision_text}</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Notre Équipe Section */}
      <section className="py-16 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <Users className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Notre Équipe</h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('team-scroll-container', -1)} aria-label="Précédent">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('team-scroll-container', 1)} aria-label="Suivant">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div id="team-scroll-container" ref={teamScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  className="flex-none w-full sm:w-1/2 lg:w-1/4 px-4 first:pl-0 last:pr-0 snap-start"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-md h-full">
                    <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
                      <TeamMemberImage member={member} />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                      <div className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: member.bio }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <MobileScrollIndicator containerId="team-scroll-container" light={true} />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-blue-950">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <Calendar className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Notre Histoire</h2>
          </motion.div>
          <div className="hidden md:block relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 z-0"></div>
            <div className="relative z-10">
              {milestones.slice(0, 4).map((milestone, index) => (
                <motion.div key={milestone.id} className={`flex items-center mb-16 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <h3 className="font-bold text-blue-600 text-xl mb-2">{milestone.title}</h3>
                      <p className="text-gray-700">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md z-10">
                      <span className="text-white font-bold text-sm">{milestone.year}</span>
                    </div>
                  </div>
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="relative md:hidden">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('timeline-scroll-container', -1)} aria-label="Précédent">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('timeline-scroll-container', 1)} aria-label="Suivant">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div id="timeline-scroll-container" ref={timelineScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
              {milestones.map((milestone, index) => (
                <motion.div key={milestone.id} className="flex-none w-full sm:w-4/5 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
                  <div className="bg-white p-6 rounded-lg shadow-md mb-4 relative">
                    <div className="absolute -top-3 left-4 bg-blue-600 px-3 py-1 rounded-full">
                      <span className="text-white font-bold text-sm">{milestone.year}</span>
                    </div>
                    <h3 className="font-bold text-blue-600 text-xl mb-2 mt-4">{milestone.title}</h3>
                    <p className="text-gray-700">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <MobileScrollIndicator containerId="timeline-scroll-container" light={true} />
          </div>
        </div>
      </section>

      {/* Key Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold">GCUTV en Chiffres</h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-colors" onClick={() => handleScroll('stats-scroll-container', -1)} aria-label="Précédent">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-colors" onClick={() => handleScroll('stats-scroll-container', 1)} aria-label="Suivant">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div id="stats-scroll-container" ref={statsScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
              {stats.map((stat, index) => (
                <motion.div key={stat.id} className="flex-none w-full sm:w-1/2 md:w-1/4 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.4 }} whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center h-full">
                    <motion.div className="inline-flex items-center justify-center mb-4 text-blue-300" whileHover={{ rotate: 5, scale: 1.1 }} transition={{ duration: 0.3 }}>
                      {stat.icon_name && React.createElement(require('lucide-react')[stat.icon_name], { className: 'w-10 h-10' })}
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-2">{stat.number}</h3>
                    <p className="text-blue-100">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <MobileScrollIndicator containerId="stats-scroll-container" light={true} />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <Award className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Nos Valeurs</h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('values-scroll-container', -1)} aria-label="Précédent">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" onClick={() => handleScroll('values-scroll-container', 1)} aria-label="Suivant">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div id="values-scroll-container" ref={valuesScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
              {values.map((value, index) => (
                <motion.div key={value.id} className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }} whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md p-8 h-full">
                    <motion.div className="bg-blue-100 inline-flex p-4 rounded-lg text-blue-600 mb-6" whileHover={{ rotate: 5, scale: 1.1 }} transition={{ duration: 0.3 }}>
                      {value.icon_name && React.createElement(require('lucide-react')[value.icon_name], { className: 'w-8 h-8' })}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <MobileScrollIndicator containerId="values-scroll-container" light={true} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      {contactInfo && (
        <section className="py-16 bg-blue-950">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div className="bg-white rounded-xl shadow-lg overflow-hidden" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Contactez-Nous</h2>
                  <p className="text-gray-600 mb-8">Une question, une suggestion ou une proposition de partenariat ? Notre équipe est à votre écoute.</p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <Map className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Adresse</h3>
                        <p className="text-gray-600">{contactInfo.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                        <p className="text-gray-600">{contactInfo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Téléphone</h3>
                        <p className="text-gray-600">{contactInfo.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-600 p-8 md:p-12 text-white">
                  <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">Nom complet</label>
                      <input type="text" id="name" className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" placeholder="Votre nom" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                      <input type="email" id="email" className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" placeholder="votre@email.com" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                      <textarea id="message" rows="4" className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" placeholder="Votre message"></textarea>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium">
                      Envoyer le message
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Map & Studios Section */}
      {studios && (
        <section className="py-16 bg-blue-900">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
                <Map className="w-6 h-6 text-blue-600" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white">Nos Studios</h2>
            </motion.div>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <motion.div initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
                  <img
                    src={studios.image_path ? `${staticBaseUrl}${studios.image_path}` : '/api/placeholder/400/600'}
                    alt="GCUTV Studios"
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                </div>
              </motion.div>
              <motion.div className="space-y-6" initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h3 className="text-2xl font-bold text-white">{studios.title}</h3>
                <p className="text-blue-200">{studios.description}</p>
                <ul className="space-y-3 text-blue-100">
                  {studios.features.split('\n').map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="inline-block bg-blue-400 rounded-full w-2 h-2 mt-2"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-blue-200">{studios.collaboration_text}</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
                  >
                    Organiser une visite
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
          <div className="w-full">
            <AdBanner position="bottom" page="arts-traditions" />
          </div>
        </section>
      )}

      <Footer />
    </motion.main>
  );
};

export default AProposPage;
