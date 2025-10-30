// 'use client'
// import React from 'react';
// import { motion } from 'framer-motion';
// import { Mail, Phone, FileText, DollarSign, BarChart, Users, Layout, Globe, CheckCircle, Star } from 'lucide-react';
// import Link from 'next/link';
// import Navigation from '@/components/navigation';
// import Footer from '@/components/Footer';

// const PublicitePage = () => {
//   // Statistiques du site
//   const stats = [
//     { label: "Visiteurs uniques", value: "25K+", unit: "par mois", icon: <Users className="w-6 h-6 text-blue-600" /> },
//     { label: "Pages vues", value: "120K+", unit: "par mois", icon: <Layout className="w-6 h-6 text-green-600" /> },
//     { label: "Durée moyenne", value: "3:45", unit: "minutes par visite", icon: <BarChart className="w-6 h-6 text-yellow-600" /> },
//     { label: "Portée", value: "National", unit: "& international", icon: <Globe className="w-6 h-6 text-purple-600" /> }
//   ];

//   // Avantages de la publicité
//   const benefits = [
//     "Visibilité auprès d'une audience jeune et dynamique",
//     "Placement stratégique selon vos objectifs marketing",
//     "Audience ciblée intéressée par la culture et l'actualité du Gabon",
//     "Rapports détaillés sur les performances de vos campagnes",
//     "Présence sur la première plateforme dédiée à la culture urbaine gabonaise"
//   ];

//   // Témoignages clients
//   const testimonials = [
//     {
//       id: 1,
//       quote: "Notre campagne publicitaire sur GCUTV a généré 40% de trafic supplémentaire sur notre site.",
//       author: "Marie Koumba",
//       company: "Directrice Marketing, AZRT Group"
//     },
//     {
//       id: 2,
//       quote: "Un excellent retour sur investissement. Notre marque a gagné en notoriété auprès des jeunes.",
//       author: "Jean Mendome",
//       company: "CEO, Start-up Innovante"
//     }
//   ];

//   return (
//     <motion.div 
//       className="bg-blue-900 min-h-screen text-white"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       {/* Navigation - Using your existing component */}
//       <Navigation />

//       {/* Header */}
//       <motion.div 
//         className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-16"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="max-w-7xl mx-auto px-4 text-center">
//           <motion.h1 
//             className="text-4xl font-bold mb-4"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//           >
//             Espaces Publicitaires
//           </motion.h1>
//           <motion.p 
//             className="text-xl max-w-3xl mx-auto"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//           >
//             Augmentez votre visibilité auprès de notre audience passionnée par la culture urbaine gabonaise
//           </motion.p>
//         </div>
//       </motion.div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {/* Introduction */}
//         <motion.div 
//           className="mb-16 text-center"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4, duration: 0.5 }}
//         >
//           <h2 className="text-3xl font-bold mb-6 text-white">Pourquoi faire de la publicité chez nous ?</h2>
//           <p className="text-lg text-blue-100 max-w-4xl mx-auto">
//             GCUTV est la première plateforme digitale entièrement dédiée à la culture urbaine gabonaise. 
//             Notre audience jeune, dynamique et engagée est à la recherche des dernières tendances 
//             culturelles, musicales et artistiques. Nous offrons des espaces publicitaires stratégiquement 
//             placés pour maximiser votre impact auprès de cette communauté.
//           </p>
//         </motion.div>

//         {/* Statistics Section */}
//         <motion.div 
//           className="mb-16"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5, duration: 0.5 }}
//         >
//           <h2 className="text-2xl font-bold mb-8 text-center text-white">Notre audience en chiffres</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {stats.map((stat, index) => (
//               <motion.div
//                 key={index}
//                 className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
//                 whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
//               >
//                 <div className="flex justify-center mb-4">
//                   {stat.icon}
//                 </div>
//                 <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
//                 <p className="text-gray-500">{stat.label}</p>
//                 <p className="text-gray-500 text-sm">{stat.unit}</p>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>

//         {/* Testimonials Section */}
//         <motion.div 
//           className="mb-16 bg-blue-800 rounded-lg py-10 px-6 border border-blue-700"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6, duration: 0.5 }}
//         >
//           <h2 className="text-2xl font-bold mb-8 text-center text-white">Ce que disent nos annonceurs</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {testimonials.map((testimonial, index) => (
//               <motion.div
//                 key={testimonial.id}
//                 className="bg-white rounded-lg p-6 shadow-sm text-gray-800"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
//                 whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
//               >
//                 <div className="flex mb-4">
//                   <Star className="w-5 h-5 text-yellow-500" />
//                   <Star className="w-5 h-5 text-yellow-500" />
//                   <Star className="w-5 h-5 text-yellow-500" />
//                   <Star className="w-5 h-5 text-yellow-500" />
//                   <Star className="w-5 h-5 text-yellow-500" />
//                 </div>
//                 <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
//                 <div>
//                   <p className="font-bold text-gray-800">{testimonial.author}</p>
//                   <p className="text-gray-600 text-sm">{testimonial.company}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>

//         {/* Benefits Section */}
//         <motion.div 
//           className="mb-16"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.9, duration: 0.5 }}
//         >
//           <h2 className="text-2xl font-bold mb-8 text-center text-white">Les avantages de notre plateforme</h2>
//           <div className="bg-blue-800 rounded-lg p-8 border border-blue-700">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {benefits.map((benefit, index) => (
//                 <motion.div
//                   key={index}
//                   className="flex items-start"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
//                 >
//                   <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
//                   <p className="text-blue-100">{benefit}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </motion.div>

//         {/* Contact Section */}
//         <motion.div 
//           className="bg-blue-800 rounded-lg p-8 border border-blue-700"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 1.1, duration: 0.5 }}
//         >
//           <h2 className="text-2xl font-bold mb-6 text-center text-white">Contactez notre équipe commerciale</h2>
//           <p className="text-center text-blue-100 mb-8">
//             Vous souhaitez en savoir plus sur nos offres publicitaires ou discuter d'un partenariat sur mesure ? 
//             Notre équipe commerciale est à votre disposition.
//           </p>
//           <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
//             <motion.a
//               href="mailto:commercial@gcutv.com"
//               className="flex items-center bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all w-full md:w-auto text-gray-800"
//               whileHover={{ y: -5 }}
//             >
//               <Mail className="w-6 h-6 text-blue-600 mr-3" />
//               <span>commercial@gcutv.com</span>
//             </motion.a>
//             <motion.a
//               href="tel:+24174123456"
//               className="flex items-center bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all w-full md:w-auto text-gray-800"
//               whileHover={{ y: -5 }}
//             >
//               <Phone className="w-6 h-6 text-blue-600 mr-3" />
//               <span>+241 74 12 34 56</span>
//             </motion.a>
//             <motion.a
//               href="/contact"
//               className="flex items-center bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all w-full md:w-auto"
//               whileHover={{ y: -5 }}
//             >
//               <DollarSign className="w-6 h-6 mr-3" />
//               <span>Demander un devis</span>
//             </motion.a>
//           </div>
//         </motion.div>
//       </div>

//       {/* Footer - Using your existing component */}
//       <Footer />
//     </motion.div>
//   );
// };

// export default PublicitePage;



'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';

const PublicitePage = () => {
  return (
    <motion.div 
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
            La page des espaces publicitaires GCUTV arrive bientôt avec des offres exclusives !
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
    </motion.div>
  );
};

export default PublicitePage;