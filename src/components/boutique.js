// 'use client'
// import React, { useState, useRef } from 'react';
// import { motion } from 'framer-motion';
// import { ShoppingCart, Star, Filter, ChevronDown, Tag, Search, ShoppingBag, ArrowRight, Heart, ChevronLeft } from 'lucide-react';
// import Link from 'next/link';
// import Navigation from '@/components/navigation';
// import Footer from '@/components/Footer';

// const BoutiquePage = () => {
//   // Filter states
//   const [categoryFilter, setCategoryFilter] = useState('Tous');
//   const [priceFilter, setPriceFilter] = useState('Tous');
//   const [sortBy, setSortBy] = useState('Nouveautés');
  
//   // Cart state
//   const [cartCount, setCartCount] = useState(0);
  
//   // Refs for scrollable containers
//   const featuredProductsRef = useRef(null);
//   const productsGridRef = useRef(null);
  
//   // Function to scroll containers horizontally
//   const scroll = (ref, direction) => {
//     if (ref.current) {
//       const scrollAmount = direction === 'left' ? -300 : 300;
//       ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//     }
//   };
  
//   // Products data
//   const products = [
//     {
//       id: 1,
//       name: "T-shirt GCUTV Logo",
//       price: 15000,
//       oldPrice: 18000,
//       image: "/images/IMG-20250601-WA0022.jpg",
//       category: "Vêtements",
//       rating: 4.8,
//       reviewCount: 24,
//       isNew: true,
//       isFeatured: true
//     },
//     {
//       id: 2,
//       name: "Casquette Culture Urbaine",
//       price: 12000,
//       oldPrice: null,
//       image: "/images/IMG-20250601-WA0039.jpg",
//       category: "Accessoires",
//       rating: 4.5,
//       reviewCount: 18,
//       isNew: true,
//       isFeatured: false
//     },
//     {
//       id: 3,
//       name: "Tote Bag GCUTV",
//       price: 8000,
//       oldPrice: 10000,
//       image: "/images/IMG-20250601-WA0025.jpg",
//       category: "Accessoires",
//       rating: 4.7,
//       reviewCount: 15,
//       isNew: false,
//       isFeatured: true
//     },
//     {
//       id: 4,
//       name: "Hoodie Culture Gabonaise",
//       price: 25000,
//       oldPrice: null,
//       image: "/images/IMG-20250601-WA0026.jpg",
//       category: "Vêtements",
//       rating: 4.9,
//       reviewCount: 32,
//       isNew: false,
//       isFeatured: true
//     },
//     {
//       id: 5,
//       name: "Mug GCUTV",
//       price: 6500,
//       oldPrice: null,
//       image: "/images/IMG-20250601-WA0035.jpg",
//       category: "Accessoires",
//       rating: 4.4,
//       reviewCount: 12,
//       isNew: false,
//       isFeatured: false
//     },
//     {
//       id: 6,
//       name: "Poster Festival Afro Ntcham",
//       price: 5000,
//       oldPrice: null,
//       image: "/images/IMG-20250601-WA0020.jpg",
//       category: "Déco",
//       rating: 4.6,
//       reviewCount: 9,
//       isNew: true,
//       isFeatured: false
//     },
//     {
//       id: 7,
//       name: "Bracelet Culture Urbaine",
//       price: 4000,
//       oldPrice: 5500,
//       image: "/images/IMG-20250601-WA0033.jpg",
//       category: "Bijoux",
//       rating: 4.3,
//       reviewCount: 7,
//       isNew: false,
//       isFeatured: false
//     },
//     {
//       id: 8,
//       name: "Sweatshirt GCUTV",
//       price: 22000,
//       oldPrice: null,
//       image: "/images/IMG-20250601-WA0020.jpg",
//       category: "Vêtements",
//       rating: 4.7,
//       reviewCount: 21,
//       isNew: true,
//       isFeatured: true
//     }
//   ];

//   // Categories for filter
//   const categories = ['Tous', 'Vêtements', 'Accessoires', 'Déco', 'Bijoux'];
  
//   // Price ranges
//   const priceRanges = ['Tous', 'Moins de 10.000 FCFA', '10.000 - 20.000 FCFA', 'Plus de 20.000 FCFA'];
  
//   // Sort options
//   const sortOptions = ['Nouveautés', 'Prix: croissant', 'Prix: décroissant', 'Populaires'];

//   // Featured products
//   const featuredProducts = products.filter(product => product.isFeatured);
  
//   // Filter products based on selected filters
//   const filteredProducts = products.filter(product => {
//     // Category filter
//     if (categoryFilter !== 'Tous' && product.category !== categoryFilter) {
//       return false;
//     }
    
//     // Price filter
//     if (priceFilter === 'Moins de 10.000 FCFA' && product.price >= 10000) {
//       return false;
//     }
//     if (priceFilter === '10.000 - 20.000 FCFA' && (product.price < 10000 || product.price > 20000)) {
//       return false;
//     }
//     if (priceFilter === 'Plus de 20.000 FCFA' && product.price <= 20000) {
//       return false;
//     }
    
//     return true;
//   });
  
//   // Sort filtered products
//   const sortedProducts = [...filteredProducts].sort((a, b) => {
//     if (sortBy === 'Prix: croissant') {
//       return a.price - b.price;
//     }
//     if (sortBy === 'Prix: décroissant') {
//       return b.price - a.price;
//     }
//     if (sortBy === 'Populaires') {
//       return b.rating - a.rating;
//     }
//     // Default: Nouveautés
//     return a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1;
//   });
  
//   // Function to add to cart
//   const addToCart = (productId) => {
//     setCartCount(cartCount + 1);
//     // Here you would add product to actual cart state/context
//   };

//   return (
//     <motion.div 
//       className="bg-blue-900 min-h-screen"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       {/* Navigation */}
//       <Navigation />
      
//       {/* Header Banner */}
//       <motion.div 
//         className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-12"
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
//             Boutique GCUTV
//           </motion.h1>
//           <motion.p 
//             className="text-xl max-w-3xl mx-auto"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//           >
//             Découvrez notre collection de produits exclusifs aux couleurs de la culture urbaine gabonaise
//           </motion.p>
//         </div>
//       </motion.div>
      
//       {/* Shopping Cart Button (Floating) */}
//       <div className="fixed bottom-6 right-6 z-50">
//         <motion.div 
//           className="bg-blue-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center relative cursor-pointer"
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           <ShoppingCart className="w-6 h-6" />
//           {cartCount > 0 && (
//             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//               {cartCount}
//             </span>
//           )}
//         </motion.div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {/* Featured Products Carousel */}
//         <motion.div 
//           className="mb-16"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4, duration: 0.5 }}
//         >
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-white">Produits en Vedette</h2>
//             <Link href="/boutique/featured" className="text-blue-300 hover:text-blue-100 flex items-center">
//               Voir tout <ArrowRight className="ml-1 w-4 h-4" />
//             </Link>
//           </div>
          
//           <div className="relative">
//             <button 
//               onClick={() => scroll(featuredProductsRef, 'left')}
//               className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-800 bg-opacity-70 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors"
//               aria-label="Scroll left"
//             >
//               <ChevronLeft className="w-5 h-5" />
//             </button>
            
//             <div 
//               ref={featuredProductsRef}
//               className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x"
//               style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//             >
//               {featuredProducts.map((product) => (
//                 <motion.div
//                   key={product.id}
//                   className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow min-w-[280px] snap-start flex-shrink-0"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.5 + product.id * 0.1, duration: 0.5 }}
//                   whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
//                 >
//                   <div className="relative">
//                     <img
//                       src={product.image || `/api/placeholder/300/300?text=${encodeURIComponent(product.name)}`}
//                       alt={product.name}
//                       className="w-full h-64 object-cover"
//                     />
//                     {product.isNew && (
//                       <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
//                         NOUVEAU
//                       </span>
//                     )}
//                     {product.oldPrice && (
//                       <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
//                         PROMO
//                       </span>
//                     )}
//                     <button 
//                       className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
//                       onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                       }}
//                     >
//                       <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
//                     </button>
//                   </div>
                  
//                   <div className="p-4">
//                     <div className="flex items-center mb-1">
//                       {Array.from({ length: 5 }).map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-4 h-4 ${
//                             i < Math.floor(product.rating)
//                               ? "text-yellow-500 fill-yellow-500"
//                               : i < product.rating
//                               ? "text-yellow-500 fill-yellow-500 opacity-50"
//                               : "text-gray-300"
//                           }`}
//                         />
//                       ))}
//                       <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
//                     </div>
                    
//                     <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                    
//                     <div className="flex justify-between items-center">
//                       <div>
//                         {product.oldPrice ? (
//                           <div className="flex items-center">
//                             <span className="font-bold text-lg text-blue-600">{product.price.toLocaleString()} FCFA</span>
//                             <span className="text-sm text-gray-500 line-through ml-2">{product.oldPrice.toLocaleString()} FCFA</span>
//                           </div>
//                         ) : (
//                           <span className="font-bold text-lg text-blue-600">{product.price.toLocaleString()} FCFA</span>
//                         )}
//                       </div>
//                       <button 
//                         className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
//                         onClick={() => addToCart(product.id)}
//                       >
//                         <ShoppingCart className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
            
//             <button 
//               onClick={() => scroll(featuredProductsRef, 'right')}
//               className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-800 bg-opacity-70 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors"
//               aria-label="Scroll right"
//             >
//               <ArrowRight className="w-5 h-5" />
//             </button>
//           </div>
//         </motion.div>
        
//         {/* Filter & Products */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {/* Filters Sidebar */}
//           <motion.div 
//             className="md:col-span-1"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.5, duration: 0.5 }}
//           >
//             <div className="bg-blue-800 border border-blue-700 rounded-lg p-6 sticky top-20 text-white">
//               <div className="mb-6">
//                 <div className="flex items-center mb-4">
//                   <Filter className="w-5 h-5 text-blue-300 mr-2" />
//                   <h3 className="font-bold text-white">Filtres</h3>
//                 </div>
                
//                 {/* Category Filter */}
//                 <div className="mb-4">
//                   <h4 className="font-medium text-blue-200 mb-2">Catégorie</h4>
//                   <div className="space-y-2">
//                     {categories.map((category) => (
//                       <div key={category} className="flex items-center">
//                         <input
//                           type="radio"
//                           id={`category-${category}`}
//                           name="category"
//                           className="mr-2"
//                           checked={categoryFilter === category}
//                           onChange={() => setCategoryFilter(category)}
//                         />
//                         <label htmlFor={`category-${category}`} className="text-blue-100 cursor-pointer">
//                           {category}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
                
//                 {/* Price Filter */}
//                 <div className="mb-4">
//                   <h4 className="font-medium text-blue-200 mb-2">Prix</h4>
//                   <div className="space-y-2">
//                     {priceRanges.map((range) => (
//                       <div key={range} className="flex items-center">
//                         <input
//                           type="radio"
//                           id={`price-${range}`}
//                           name="price"
//                           className="mr-2"
//                           checked={priceFilter === range}
//                           onChange={() => setPriceFilter(range)}
//                         />
//                         <label htmlFor={`price-${range}`} className="text-blue-100 cursor-pointer">
//                           {range}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
              
//               {/* Promo Banner */}
//               <div className="bg-blue-700 p-4 rounded-lg border border-blue-600">
//                 <Tag className="w-5 h-5 text-blue-300 mb-2" />
//                 <h4 className="font-bold text-white mb-1">Offre spéciale</h4>
//                 <p className="text-sm text-blue-200 mb-2">10% de réduction sur votre première commande</p>
//                 <span className="block font-bold text-blue-300">CODE: GCUTV10</span>
//               </div>
//             </div>
//           </motion.div>
          
//           {/* Products Grid */}
//           <motion.div 
//             className="md:col-span-3"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6, duration: 0.5 }}
//           >
//             {/* Search & Sort Bar */}
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
//               <div className="relative w-full md:w-64">
//                 <input
//                   type="text"
//                   placeholder="Rechercher un produit..."
//                   className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800"
//                 />
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               </div>
              
//               <div className="flex items-center">
//                 <label className="text-blue-100 mr-2">Trier par:</label>
//                 <div className="relative">
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
//                   >
//                     {sortOptions.map((option) => (
//                       <option key={option} value={option}>
//                         {option}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>
//             </div>
            
//             {/* Products */}
//             <div className="relative">
//               <button 
//                 onClick={() => scroll(productsGridRef, 'left')}
//                 className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-blue-800 bg-opacity-70 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors md:hidden"
//                 aria-label="Scroll left"
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
              
//               <div 
//                 ref={productsGridRef}
//                 className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x md:overflow-x-visible"
//                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//               >
//                 {sortedProducts.map((product) => (
//                   <motion.div
//                     key={product.id}
//                     className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow min-w-[280px] snap-start flex-shrink-0 md:min-w-0 md:flex-shrink-1"
//                     whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
//                   >
//                     <div className="relative">
//                       <img
//                         src={product.image || `/api/placeholder/300/300?text=${encodeURIComponent(product.name)}`}
//                         alt={product.name}
//                         className="w-full h-64 object-cover"
//                       />
//                       {product.isNew && (
//                         <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
//                           NOUVEAU
//                         </span>
//                       )}
//                       {product.oldPrice && (
//                         <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
//                           PROMO
//                         </span>
//                       )}
//                       <button 
//                         className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                         }}
//                       >
//                         <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
//                       </button>
//                     </div>
                    
//                     <div className="p-4">
//                       <div className="flex items-center mb-1">
//                         {Array.from({ length: 5 }).map((_, i) => (
//                           <Star
//                             key={i}
//                             className={`w-4 h-4 ${
//                               i < Math.floor(product.rating)
//                                 ? "text-yellow-500 fill-yellow-500"
//                                 : i < product.rating
//                                 ? "text-yellow-500 fill-yellow-500 opacity-50"
//                                 : "text-gray-300"
//                             }`}
//                           />
//                         ))}
//                         <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
//                       </div>
                      
//                       <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                      
//                       <div className="flex justify-between items-center">
//                         <div>
//                           {product.oldPrice ? (
//                             <div className="flex items-center">
//                               <span className="font-bold text-lg text-blue-600">{product.price.toLocaleString()} FCFA</span>
//                               <span className="text-sm text-gray-500 line-through ml-2">{product.oldPrice.toLocaleString()} FCFA</span>
//                             </div>
//                           ) : (
//                             <span className="font-bold text-lg text-blue-600">{product.price.toLocaleString()} FCFA</span>
//                           )}
//                         </div>
//                         <button 
//                           className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
//                           onClick={() => addToCart(product.id)}
//                         >
//                           <ShoppingCart className="w-5 h-5" />
//                         </button>
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
              
//               <button 
//                 onClick={() => scroll(productsGridRef, 'right')}
//                 className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-blue-800 bg-opacity-70 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors md:hidden"
//                 aria-label="Scroll right"
//               >
//                 <ArrowRight className="w-5 h-5" />
//               </button>
//             </div>
            
//             {/* Empty State */}
//             {sortedProducts.length === 0 && (
//               <div className="bg-blue-800 rounded-lg p-8 text-center border border-blue-700">
//                 <ShoppingBag className="w-12 h-12 text-blue-300 mx-auto mb-4" />
//                 <h3 className="text-lg font-bold text-white mb-2">Aucun produit trouvé</h3>
//                 <p className="text-blue-200">Essayez de modifier vos filtres pour voir plus de produits.</p>
//                 <button 
//                   className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
//                   onClick={() => {
//                     setCategoryFilter('Tous');
//                     setPriceFilter('Tous');
//                   }}
//                 >
//                   Réinitialiser les filtres
//                 </button>
//               </div>
//             )}
//           </motion.div>
//         </div>
        
//         {/* Newsletter Section */}
        
//       </div>
      
//       {/* Footer */}
//       <Footer />
//     </motion.div>
//   );
// };

// export default BoutiquePage;




'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';

const BoutiquePage = () => {
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
            La boutique GCUTV arrive bientôt avec une collection exclusive !
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

export default BoutiquePage;