'use client';
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Filter, Search, ChevronRight, ArrowRight, ArrowDown, Phone, Ticket } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

// Static fallback image to prevent infinite loop
const STATIC_FALLBACK_IMAGE = "/static/fallback-placeholder.png";

const EvenementsPage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Updated categories to use string IDs for consistency
  const categories = [
    { id: 'all', name: 'Tous' },
    { id: '1', name: 'Concert' },
    { id: '2', name: 'Festival' },
    { id: '3', name: 'Exposition' },
    { id: '4', name: 'Conférence' },
    { id: '5', name: 'Atelier' },
    { id: '6', name: 'Compétition' }
  ];

  const locations = [
    { id: 'all', name: 'Tous les lieux' },
    { id: 'libreville', name: 'Libreville' },
    { id: 'port-gentil', name: 'Port-Gentil' },
    { id: 'franceville', name: 'Franceville' },
    { id: 'oyem', name: 'Oyem' },
    { id: 'lambarene', name: 'Lambaréné' }
  ];

  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLocation, setActiveLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}/events/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, message: ${await response.text()}`);
        }
        const data = await response.json();
        console.log('Fetched events:', data);
        setEvents(data);
        setFetchError(null);
      } catch (error) {
        console.error('Error fetching events:', error.message);
        setFetchError(error.message);
      }
    };
    fetchEvents();
  }, [apiUrl]);

  // Improved filtering logic that handles both ID and name-based filtering properly
  const filteredEvents = events.filter(event => {
    // For debugging, log the full event
    console.log('Processing event:', event.title, 'Category:', event.category, 'Location:', event.location);

    // CATEGORY FILTER
    let matchesCategory = false;
    if (activeCategory === 'all') {
      matchesCategory = true;
    } else {
      // Try to match by ID first (convert both to strings for comparison)
      const eventCategoryId = event.category?.id?.toString();
      if (eventCategoryId === activeCategory) {
        matchesCategory = true;
      } else {
        // If ID doesn't match, try to match by name (case insensitive)
        const selectedCategory = categories.find(c => c.id === activeCategory);
        if (selectedCategory && event.category?.name?.toLowerCase() === selectedCategory.name.toLowerCase()) {
          matchesCategory = true;
        }
      }
    }

    // LOCATION FILTER
    let matchesLocation = false;
    if (activeLocation === 'all') {
      matchesLocation = true;
    } else {
      // Find the selected location name
      const selectedLocation = locations.find(l => l.id === activeLocation);
      if (selectedLocation && event.location) {
        // Use includes instead of exact match and normalize case
        matchesLocation = event.location.toLowerCase().includes(selectedLocation.name.toLowerCase());
      }
    }

    // SEARCH QUERY
    const matchesSearch = searchQuery === '' ||
      (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()));

    console.log('Filter results for', event.title,
      '- Category:', event.category?.name,
      '- Active Category:', activeCategory,
      '- Matches Category:', matchesCategory,
      '- Location:', event.location,
      '- Active Location:', activeLocation,
      '- Matches Location:', matchesLocation,
      '- Matches Search:', matchesSearch);

    return matchesCategory && matchesLocation && matchesSearch;
  });

  const featuredEvents = events.filter(event => event.is_featured);

  const handleImageError = (e, placeholderText, color = '4f46e5') => {
    if (e.target.dataset.placeholderAttempted) {
      e.target.src = STATIC_FALLBACK_IMAGE;
      e.target.dataset.placeholderAttempted = 'static';
    } else {
      const placeholderUrl = `${apiUrl}/api/placeholder/800/300?text=${encodeURIComponent(placeholderText)}&color=${color}`;
      e.target.src = placeholderUrl;
      e.target.dataset.placeholderAttempted = 'true';
      e.target.className = `${e.target.className} object-contain`;
    }
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return 'Date non spécifiée';
    if (!endDate || startDate === endDate) {
      return new Date(startDate).toLocaleDateString('fr-FR');
    }
    const start = new Date(startDate).toLocaleDateString('fr-FR');
    const end = new Date(endDate).toLocaleDateString('fr-FR');
    return `${start} - ${end}`;
  };

  const renderTicketInfo = (event) => {
    const categoryName = event.category?.name?.toLowerCase() || '';
    switch (categoryName) {
      case 'concert':
      case 'festival':
      case 'competition':
        return (
          <div className="flex items-center text-sm">
            <Ticket className="w-4 h-4 mr-2 text-green-600" />
            <span>Billets: </span>
            <a href={event.ticket_url || '#'} className="ml-1 text-blue-600 hover:underline">
              {event.ticket_price || 'N/A'} (Acheter)
            </a>
          </div>
        );
      case 'atelier':
        return (
          <div className="flex items-center text-sm">
            <Ticket className="w-4 h-4 mr-2 text-yellow-600" />
            <span>{event.ticket_price || 'N/A'} - </span>
            <a href={`tel:${event.contact || ''}`} className="ml-1 text-blue-600 hover:underline">
              Inscription obligatoire
            </a>
          </div>
        );
      case 'exposition':
        return (
          <div className="flex items-center text-sm">
            <Ticket className="w-4 h-4 mr-2 text-blue-600" />
            <span>Entrée libre</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-sm">
            <Ticket className="w-4 h-4 mr-2 text-gray-600" />
            <span>{event.ticket_price || 'pas de prix du ticket'}</span>
          </div>
        );
    }
  };

  // Debug functionality - add a button to inspect events and filter state
  const debugState = () => {
    console.log('Current state:');
    console.log('- Events:', events);
    console.log('- Active Category:', activeCategory);
    console.log('- Active Location:', activeLocation);
    console.log('- Search Query:', searchQuery);
    console.log('- Filtered Events:', filteredEvents);
  };

  return (
    <motion.main
      className="min-h-screen bg-blue-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />

      <motion.div
        className="bg-blue-900 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            className="flex items-center gap-3 mb-4 page-title-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className="bg-white p-2 rounded-lg"
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Calendar className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h1 className="text-4xl font-bold">Événements</h1>
          </motion.div>
          <motion.p
            className="text-lg text-blue-100 max-w-3xl mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Découvrez les concerts, festivals, expositions et autres événements culturels à ne pas manquer au Gabon.
          </motion.p>

          {fetchError && (
            <motion.div
              className="bg-red-100 text-red-700 rounded-lg p-4 mb-6 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Erreur lors de la récupération des événements : {fetchError}
            </motion.div>
          )}

          <motion.div
            className="max-w-xl bg-white rounded-lg flex items-center p-1 mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un événement..."
                className="block w-full pl-10 pr-3 py-2 border-0 rounded-md focus:outline-none focus:ring-0"
                value={searchQuery}
                onChange={(e) => {
                  console.log('New Search Query:', e.target.value.trim());
                  setSearchQuery(e.target.value.trim());
                }}
              />
            </div>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="h-5 w-5 mr-1" />
              Filtres
              <motion.div
                animate={{ rotate: showFilters ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {showFilters ? (
                  <ArrowDown className="h-4 w-4 ml-1" />
                ) : (
                  <ArrowRight className="h-4 w-4 ml-1" />
                )}
              </motion.div>
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="bg-white rounded-lg mt-4 p-4 max-w-xl"
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Catégorie</h3>
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    {categories.map((category, index) => (
                      <motion.button
                        key={category.id}
                        onClick={() => {
                          console.log('Setting active category to:', category.id);
                          setActiveCategory(category.id);
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${activeCategory === category.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.03, duration: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {category.name}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Lieu</h3>
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    {locations.map((location, index) => (
                      <motion.button
                        key={location.id}
                        onClick={() => {
                          console.log('Setting active location to:', location.id);
                          setActiveLocation(location.id);
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${activeLocation === location.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.03, duration: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {location.name}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>

                {/* Reset filters button */}
                <div className="mt-4 pt-2 border-t border-gray-100">
                  <motion.button
                    onClick={() => {
                      setActiveCategory('all');
                      setActiveLocation('all');
                      setSearchQuery('');
                      console.log('Filters reset');
                    }}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Réinitialiser les filtres
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* <div className="py-12 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <AdBanner position="top" page="evenements" />
        </div>
      </div> */}

      {featuredEvents.length > 0 && !searchQuery && activeCategory === 'all' && activeLocation === 'all' && (
        <section className="py-12 bg-blue-900">
          <div className="max-w-7xl mx-auto px-4">
            <motion.h2
              className="text-2xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Événements à la Une
            </motion.h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                >
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-2/5 relative">
                      <motion.img
                        src={event.image_url ? `${apiUrl}${event.image_url}` : `${apiUrl}/api/placeholder/400/300?text=${encodeURIComponent(event.title)}&color=6b7280`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, event.title, '6b7280')}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {event.category?.name || 'N/A'}
                      </div>
                    </div>
                    <div className="md:w-3/5 p-6 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 mb-4 flex-grow">
                        {event.description || 'No description available.'}
                      </p>
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDateRange(event.date, event.end_date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {event.time || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.venue}, {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {event.attendees || 0} participants attendus
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Informations pratiques :</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start">
                            {renderTicketInfo(event)}
                          </li>
                          <li className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-medium mr-2">Contact:</span>
                            <a href={`tel:${event.contact || ''}`} className="text-blue-600 hover:underline">
                              {event.contact || 'N/A'}
                            </a>
                          </li>
                          {event.category?.name?.toLowerCase() === 'atelier' && (
                            <li className="text-xs text-orange-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Places limitées - Inscription obligatoire
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* <div className="py-12 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <AdBanner position="middle" page="evenements" />
        </div>
      </div> */}

      <section className="py-12 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            className="text-2xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {searchQuery || activeCategory !== 'all' || activeLocation !== 'all'
              ? 'Résultats de la recherche'
              : 'Tous les Événements'}
          </motion.h2>

          {filteredEvents.length === 0 ? (
            <motion.div
              className="bg-white rounded-xl p-8 text-center shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
              <p className="text-gray-600 mb-4">
                Aucun événement ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
              </p>
              <motion.button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveLocation('all');
                  setSearchQuery('');
                  console.log('Filters reset from no results');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Réinitialiser les filtres
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                >
                  <div className="relative">
                    <motion.img
                      src={event.image_url ? `${apiUrl}${event.image_url}` : `${apiUrl}/api/placeholder/400/300?text=${encodeURIComponent(event.title)}&color=6b7280`}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => handleImageError(e, event.title, '6b7280')}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {event.category?.name || 'N/A'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDateRange(event.date, event.end_date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.time || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.venue}, {event.location}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-col space-y-2 text-sm">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-blue-600" />
                          <a href={`tel:${event.contact || ''}`} className="text-blue-600 hover:underline">
                            {event.contact || 'N/A'}
                          </a>
                        </div>
                        {renderTicketInfo(event)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* <section className="py-12 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="bg-blue-800 rounded-xl overflow-hidden shadow-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          >
            <div className="p-8 md:p-12">
              <motion.h2 
                className="text-2xl font-bold text-white mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Vous organisez un événement ?
              </motion.h2>
              <motion.p 
                className="text-blue-100 mb-6 max-w-2xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Soumettez votre événement culturel pour qu'il soit ajouté à notre calendrier et promu sur GCUTV.
                Notre équipe examinera votre demande dans les plus brefs délais.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.03}}
                whileTap={{ scale: 0.97}}
              >
                <Link 
                  href="/evenements/soumettre"
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Soumettre un événement
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section> */}

      <div className="w-fully">
        <AdBanner position="bottom" page="evenements" />
      </div>

      <Footer />
    </motion.main>
  );
};

export default EvenementsPage;