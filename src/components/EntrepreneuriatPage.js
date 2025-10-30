'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Filter, Search, ChevronRight, ArrowDown, RefreshCw, Play } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const EntrepreneuriatPage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [successStories, setSuccessStories] = useState([]);
  const [resources, setResources] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failedImages, setFailedImages] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token
          ? { Authorization: `Bearer ${token}`, Accept: 'application/json' }
          : { Accept: 'application/json' };

        const [categoriesResponse, storiesResponse, resourcesResponse, programmesResponse] = await Promise.all([
          fetch(`${apiUrl}/api/categories/`, { cache: 'no-store', headers }),
          fetch(`${apiUrl}/api/success-stories/?section_id=25`, { cache: 'no-store', headers }),
          fetch(`${apiUrl}/api/resources/?section_id=26`, { cache: 'no-store', headers }),
          fetch(`${apiUrl}/api/programmes/?section_id=27`, { cache: 'no-store', headers }),
        ]);

        const responses = [
          { res: categoriesResponse, name: 'Categories' },
          { res: storiesResponse, name: 'Success Stories' },
          { res: resourcesResponse, name: 'Resources' },
          { res: programmesResponse, name: 'Programmes' },
        ];

        for (const { res, name } of responses) {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`Échec de la récupération des ${name}: ${errorData.detail || res.statusText}`);
          }
        }

        const [categoriesData, storiesData, resourcesData, programmesData] = await Promise.all([
          categoriesResponse.json(),
          storiesResponse.json(),
          resourcesResponse.json(),
          programmesResponse.json(),
        ]);

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setSuccessStories(
          Array.isArray(storiesData)
            ? storiesData.map((item) => ({
              ...item,
              id: item.id || null,
              category: item.category || { id: 32, name: 'Success Story' },
              author_name: item.author_name || 'Anonyme',
              title: item.title || 'Histoire sans titre',
              content: item.content || 'Aucun contenu disponible',
              image_url:
                item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
                  ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
                  : item.image_url || FALLBACK_IMAGE,
            })).filter((item) => item.id != null && !isNaN(item.id))
            : []
        );
        setResources(
          Array.isArray(resourcesData)
            ? resourcesData.map((item) => ({
              ...item,
              id: item.id || null,
              category: item.category || { id: 35, name: 'Financement' },
              author_name: item.author_name || 'Anonyme',
              title: item.title || 'Ressource sans titre',
              content: item.content || 'Aucun contenu disponible',
              image_url:
                item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
                  ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
                  : item.image_url || FALLBACK_IMAGE,
            })).filter((item) => item.id != null && !isNaN(item.id))
            : []
        );
        setProgrammes(
          Array.isArray(programmesData)
            ? programmesData.map((item) => ({
              ...item,
              id: item.id || null,
              category: item.category || { id: 37, name: 'Programmes de Soutien' },
              author_name: item.author_name || 'Anonyme',
              title: item.title || 'Programme sans titre',
              content: item.content || 'Aucun contenu disponible',
              image_url:
                item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
                  ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
                  : item.image_url || FALLBACK_IMAGE,
            })).filter((item) => item.id != null && !isNaN(item.id))
            : []
        );
        setFetchError(null);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  const filteredItems = useCallback(
    (items) => {
      if (!Array.isArray(items)) return [];
      return items.filter((item) => {
        const matchesCategory =
          activeCategory === 'all' || Number(item.category?.id) === Number(activeCategory);
        const matchesSearch =
          searchQuery === '' ||
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch && item.id != null && !isNaN(item.id);
      });
    },
    [activeCategory, searchQuery]
  );

  const featuredStories = useMemo(
    () =>
      successStories
        .filter((story) => story.status === 'published' && story.id != null && !isNaN(story.id))
        .slice(0, 2),
    [successStories]
  );

  const handleImageError = useCallback(
    (e, itemId) => {
      if (!failedImages.has(itemId)) {
        setFailedImages((prev) => new Set(prev).add(itemId));
        e.target.style.display = 'none';
        const defaultIcon = e.target.parentElement.querySelector('.default-icon');
        if (defaultIcon) defaultIcon.classList.remove('hidden');
      }
    },
    [failedImages]
  );

  const retryFetch = () => {
    setFetchError(null);
    setIsLoading(true);
    setSuccessStories([]);
    setResources([]);
    setProgrammes([]);
    setCategories([]);
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token
          ? { Authorization: `Bearer ${token}`, Accept: 'application/json' }
          : { Accept: 'application/json' };

        const [categoriesResponse, storiesResponse, resourcesResponse, programmesResponse] = await Promise.all([
          fetch(`${apiUrl}/api/categories/`, { cache: 'no-store', headers }),
          fetch(`${apiUrl}/api/success-stories/?section_id=25`, { cache: 'no-store', headers }),
          fetch(`${apiUrl}/api/resources/?section_id=26`, { cache: 'no-store', headers }),
          fetch(`${apiUrl}/api/programmes/?section_id=27`, { cache: 'no-store', headers }),
        ]);

        const responses = [
          { res: categoriesResponse, name: 'Categories' },
          { res: storiesResponse, name: 'Success Stories' },
          { res: resourcesResponse, name: 'Resources' },
          { res: programmesResponse, name: 'Programmes' },
        ];

        for (const { res, name } of responses) {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`Échec de la récupération des ${name}: ${errorData.detail || res.statusText}`);
          }
        }

        const [categoriesData, storiesData, resourcesData, programmesData] = await Promise.all([
          categoriesResponse.json(),
          storiesResponse.json(),
          resourcesResponse.json(),
          programmesResponse.json(),
        ]);

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setSuccessStories(
          Array.isArray(storiesData)
            ? storiesData.map((item) => ({
              ...item,
              id: item.id || null,
              category: item.category || { id: 32, name: 'Success Story' },
              author_name: item.author_name || 'Anonyme',
              title: item.title || 'Histoire sans titre',
              content: item.content || 'Aucun contenu disponible',
              image_url:
                item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
                  ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
                  : item.image_url || FALLBACK_IMAGE,
            })).filter((item) => item.id != null && !isNaN(item.id))
            : []
        );
        setResources(
          Array.isArray(resourcesData)
            ? resourcesData.map((item) => ({
              ...item,
              id: item.id || null,
              category: item.category || { id: 35, name: 'Financement' },
              author_name: item.author_name || 'Anonyme',
              title: item.title || 'Ressource sans titre',
              content: item.content || 'Aucun contenu disponible',
              image_url:
                item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
                  ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
                  : item.image_url || FALLBACK_IMAGE,
            })).filter((item) => item.id != null && !isNaN(item.id))
            : []
        );
        setProgrammes(
          Array.isArray(programmesData)
            ? programmesData.map((item) => ({
              ...item,
              id: item.id || null,
              category: item.category || { id: 37, name: 'Programmes de Soutien' },
              author_name: item.author_name || 'Anonyme',
              title: item.title || 'Programme sans titre',
              content: item.content || 'Aucun contenu disponible',
              image_url:
                item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
                  ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
                  : item.image_url || FALLBACK_IMAGE,
            })).filter((item) => item.id != null && !isNaN(item.id))
            : []
        );
        setFetchError(null);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <motion.main className="min-h-screen bg-blue-900" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} aria-label="Page Entrepreneuriat">
      <Navigation />
      <motion.div className="bg-blue-900 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div className="flex items-center gap-3 mb-4 page-title-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg" initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <FileText className="w-8 h-8 text-blue-600" aria-hidden="true" />
            </motion.div>
            <h1 className="text-4xl font-bold">Entrepreneuriat</h1>
          </motion.div>
          <motion.p className="text-lg text-blue-100 max-w-3xl mb-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
            Découvrez les histoires inspirantes, ressources et programmes de soutien pour les entrepreneurs gabonais.
          </motion.p>
          {fetchError && (
            <motion.div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6 max-w-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} role="alert">
              <p>Erreur : {fetchError}</p>
              <motion.button
                onClick={retryFetch}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Réessayer le chargement des données"
              >
                Réessayer
              </motion.button>
            </motion.div>
          )}
          <motion.div className="max-w-xl bg-white rounded-lg flex items-center p-1 mt-8" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="block w-full pl-10 pr-3 py-2 border-0 rounded-md focus:outline-none focus:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.trim())}
                aria-label="Rechercher des histoires, ressources ou programmes"
              />
            </div>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-md text-blue-600 hover:bg-blue-50 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            >
              <Filter className="h-5 w-5 mr-1" aria-hidden="true" />
              Filtres
              <motion.div animate={{ rotate: showFilters ? 90 : 0 }} transition={{ duration: 0.3 }}>
                {showFilters ? <ArrowDown className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
              </motion.div>
            </motion.button>
          </motion.div>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="bg-white rounded-lg mt-4 p-4 max-w-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                role="region"
                aria-label="Filtres de catégorie"
              >
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Catégorie</h3>
                  <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
                    <motion.button
                      key="all"
                      onClick={() => setActiveCategory('all')}
                      className={`px-3 py-1 rounded-full text-sm ${activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Filtrer par toutes les catégories"
                      aria-pressed={activeCategory === 'all'}
                    >
                      Tous
                    </motion.button>
                    {categories.map((category, index) => (
                      <motion.button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`px-3 py-1 rounded-full text-sm ${activeCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.03, duration: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Filtrer par catégorie ${category.name}`}
                        aria-pressed={activeCategory === category.id}
                      >
                        {category.name}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
                <motion.button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Réinitialiser les filtres"
                >
                  Réinitialiser les filtres
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      {featuredStories.length > 0 && !searchQuery && activeCategory === 'all' && (
        <section className="py-12 bg-blue-900">
          <div className="max-w-7xl mx-auto px-4">
            <motion.h2 className="text-2xl font-bold text-white mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              Histoires de Succès à la Une
            </motion.h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-2/5 relative">
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, story.id)}
                      />
                      <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Play className="w-8 h-8 text-gray-400 bg-black/50 rounded-full p-2" />
                      </div>
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {story.category.name}
                      </div>
                    </div>
                    <div className="md:w-3/5 p-6 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600">{story.title}</h3>
                      <p className="text-gray-600 mb-4 flex-grow">{story.content.substring(0, 200)}...</p>
                      <Link
                        href={`/success-stories/${story.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        aria-label={`Lire l'histoire complète : ${story.title}`}
                      >
                        Lire l'histoire complète
                        <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      <div className="py-12 bg-blue-900">
        {/* <div className="max-w-7xl mx-auto px-4">
          <AdBanner position="middle" page="entrepreneuriat" />
        </div> */}
      </div>
      <section className="py-12 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 className="text-2xl font-bold text-white mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Toutes les Histoires de Succès
          </motion.h2>
          {filteredItems(successStories).length === 0 ? (
            <motion.div className="bg-white rounded-xl p-8 text-center shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} role="alert">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune histoire trouvée</h3>
              <p className="text-gray-600 mb-4">Aucune histoire ne correspond à vos critères.</p>
              <motion.button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Réinitialiser les filtres pour afficher toutes les histoires"
              >
                Réinitialiser les filtres
              </motion.button>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {filteredItems(successStories).map((story, index) => (
                <motion.div
                  key={story.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative">
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => handleImageError(e, story.id)}
                    />
                    <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Play className="w-8 h-8 text-gray-400 bg-black/50 rounded-full p-2" />
                    </div>
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {story.category.name}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-blue-600">{story.title}</h3>
                    <p className="text-gray-600 mb-4">{story.content.substring(0, 100)}...</p>
                    <Link
                      href={`/success-stories/${story.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      aria-label={`Lire l'histoire : ${story.title}`}
                    >
                      Lire plus
                      <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <section className="py-12 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 className="text-2xl font-bold text-white mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Ressources pour Entrepreneurs
          </motion.h2>
          {filteredItems(resources).length === 0 ? (
            <motion.div className="bg-white rounded-xl p-8 text-center shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} role="alert">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune ressource trouvée</h3>
              <p className="text-gray-600 mb-4">Aucune ressource ne correspond à vos critères.</p>
              <motion.button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Réinitialiser les filtres pour afficher toutes les ressources"
              >
                Réinitialiser les filtres
              </motion.button>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {filteredItems(resources).map((resource, index) => (
                <motion.div
                  key={resource.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative">
                    <img
                      src={resource.image_url}
                      alt={resource.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => handleImageError(e, resource.id)}
                    />
                    <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Play className="w-8 h-8 text-gray-400 bg-black/50 rounded-full p-2" />
                    </div>
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {resource.category.name}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-blue-600">{resource.title}</h3>
                    <p className="text-gray-600 mb-4">{resource.content.substring(0, 100)}...</p>
                    <Link
                      href={`/ressources/${resource.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      aria-label={`Lire la ressource : ${resource.title}`}
                    >
                      Lire la ressource
                      <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <section className="py-12 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 className="text-2xl font-bold text-white mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Programmes de Soutien
          </motion.h2>
          {filteredItems(programmes).length === 0 ? (
            <motion.div className="bg-white rounded-xl p-8 text-center shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} role="alert">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun programme trouvé</h3>
              <p className="text-gray-600 mb-4">Aucun programme ne correspond à vos critères.</p>
              <motion.button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Réinitialiser les filtres pour afficher tous les programmes"
              >
                Réinitialiser les filtres
              </motion.button>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {filteredItems(programmes).map((programme, index) => (
                <motion.div
                  key={programme.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative">
                    <img
                      src={programme.image_url}
                      alt={programme.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => handleImageError(e, programme.id)}
                    />
                    <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Play className="w-8 h-8 text-gray-400 bg-black/50 rounded-full p-2" />
                    </div>
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {programme.category.name}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-blue-600">{programme.title}</h3>
                    <p className="text-gray-600 mb-4">{programme.content.substring(0, 100)}...</p>
                    <Link
                      href={`/programmes/${programme.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      aria-label={`Lire le programme : ${programme.title}`}
                    >
                      Lire le programme
                      <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <section className="py-12 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="bg-blue-800 rounded-xl overflow-hidden shadow-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="p-8 md:p-12">
              <motion.h2
                className="text-2xl font-bold text-white mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Partagez votre histoire
              </motion.h2>
              <motion.p
                className="text-blue-100 mb-6 max-w-2xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Votre parcours entrepreneurial inspire ! Soumettez votre histoire pour GCUTV.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/entrepreneuriat/soumettre"
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  aria-label="Soumettre votre histoire entrepreneuriale"
                >
                  Soumettre une histoire
                  <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="w-fully">
        <AdBanner position="bottom" page="entrepreneuriat" />
      </div>

      <Footer />
    </motion.main>
  );
};

export default EntrepreneuriatPage;