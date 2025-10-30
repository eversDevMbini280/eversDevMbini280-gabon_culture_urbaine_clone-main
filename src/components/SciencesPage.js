'use client';
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Atom, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

const SciencesPage = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com';
  const [articles, setArticles] = useState([]);
  const [sections, setSections] = useState([
    { name: 'Toutes', value: null },
    { name: 'Science', value: 'science' },
    { name: 'Technologie', value: 'technologie' },
    { name: 'Innovation', value: 'innovation' },
    { name: 'Recherche', value: 'recherche' },
    { name: 'Développement Durable', value: 'developpement_durable' },
    { name: 'Biotechnologie', value: 'biotechnologie' },
    { name: 'Intelligence Artificielle', value: 'intelligence_artificielle' },
    { name: 'Santé Numérique', value: 'sante_numerique' },
  ]);
  const [activeSection, setActiveSection] = useState('Toutes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleImageError = (e, placeholderText, size = { width: 800, height: 400 }, color = '162146') => {
    console.log(`Image error loading: ${e.target.src}`);
    const { width, height } = size;
    const placeholderUrl = `${API_BASE_URL}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText)}&color=${color}`;
    console.log(`Using placeholder: ${placeholderUrl}`);
    e.target.src = placeholderUrl;
    e.target.className = `${e.target.className} object-contain`;
  };

  // Fetch articles with retry logic
  const fetchArticles = async (retries = 3, delay = 1000) => {
    setLoading(true);
    setError(null);

    for (let i = 0; i < retries; i++) {
      try {
        const queryParams = new URLSearchParams({
          status: 'published',
          limit: '10',
        });

        const activeSectionObj = sections.find((section) => section.name === activeSection);
        if (activeSectionObj && activeSectionObj.value) {
          queryParams.append('science_section', activeSectionObj.value);
          console.log(`Fetching articles with science_section=${activeSectionObj.value}`);
        }

        const response = await fetch(`${API_BASE_URL}/api/science-articles/?${queryParams.toString()}`, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Échec de la récupération des articles: ${response.status} ${response.statusText}`);
        }

        const articlesData = await response.json();
        console.log('API response:', articlesData);

        const processedArticles = articlesData.map((article) => {
          console.log(`Processing article: ${article.title}, science_section: ${article.science_section}`);
          // Prioritize author_name over author_username
          const authorName = article.author_name || article.author_username || 'Inconnu';

          const date = new Date(article.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });

          let imageUrl = article.image_url;
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
            imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
          }

          // Use science_section name from sections array
          const sectionName = article.science_section
            ? sections.find((section) => section.value === article.science_section)?.name || article.science_section
            : 'Inconnu';

          return {
            id: article.id,
            title: article.title,
            excerpt: article.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...',
            image: imageUrl || null,
            date,
            author: authorName,
            category: sectionName,
          };
        });

        setArticles(processedArticles);
        setError(null);
        break; // Exit retry loop on success
      } catch (err) {
        console.error(`Tentative de récupération ${i + 1} échouée:`, err);
        if (i === retries - 1) {
          setError('Impossible de charger les articles. Vérifiez votre connexion ou réessayez plus tard.');
          setArticles([]);
        }
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Trigger fetch on mount and when dependencies change
  useEffect(() => {
    fetchArticles();
  }, [API_BASE_URL, activeSection, sections]);

  // Retry handler for user-initiated retry
  const handleRetry = () => {
    fetchArticles();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <motion.main
      className="min-h-screen bg-[#162146]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />

      {/* Page Header */}
      <motion.div
        className="bg-[#162146] text-white"
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
              <Atom className="w-8 h-8 text-[#162146]" />
            </motion.div>
            <h1 className="text-4xl font-bold">Sciences</h1>
          </motion.div>
          <motion.p
            className="text-lg text-blue-100 max-w-3xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Explorez les dernières innovations, découvertes scientifiques et initiatives technologiques qui façonnent l'avenir du Gabon.
          </motion.p>
        </div>
      </motion.div>

      {/* Top AdBanner */}
      {/* <div className="bg-[#162146] py-6">
        <div className="max-w-7xl mx-auto px-4">
          <AdBanner position="top" page="sciences" />
        </div>
      </div> */}

      {/* Section Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <motion.div
            className="flex space-x-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {sections.map((section, index) => (
              <motion.button
                key={section.value || 'toutes'}
                className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-colors ${section.name === activeSection
                  ? 'bg-[#162146] text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                onClick={() => setActiveSection(section.name)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {section.name}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Articles */}
          <div className="lg:col-span-2 space-y-10">
            {error ? (
              <div className="text-center py-12">
                <Atom className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Erreur lors du chargement des articles</p>
                <p className="text-gray-400 text-sm mt-2">{error}</p>
                <motion.button
                  className="mt-4 px-4 py-2 bg-[#162146] text-white rounded-md font-medium hover:bg-[#0e172e] transition-colors"
                  onClick={handleRetry}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Réessayer
                </motion.button>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <Atom className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun article disponible pour le moment.</p>
                <p className="text-gray-400 text-sm mt-2">
                  De nouveaux articles scientifiques seront bientôt publiés.
                </p>
              </div>
            ) : (
              articles.map((item, index) => (
                <motion.article
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                >
                  <Link href={`/tech/${item.id}`} className="flex flex-col md:flex-row">
                    <div className="md:w-2/5">
                      {item.image ? (
                        <motion.img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-64 md:h-full object-cover"
                          onError={(e) => handleImageError(e, item.title, { width: 400, height: 300 }, '162146')}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <div className="w-full h-64 md:h-full bg-gradient-to-br from-[#162146] to-[#0e172e] flex items-center justify-center">
                          <Atom className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="md:w-3/5 p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-[#162146] transition-colors">
                        {item.title}
                      </h2>
                      {/* <p className="text-gray-600 mb-4">{item.excerpt}</p> */}
                      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-y-2">
                        <div className="flex items-center mr-6">
                          <Calendar className="w-4 h-4 mr-1" />
                          {item.date}
                        </div>
                        <div className="flex items-center mr-6">Par {item.author}</div>
                        {item.category && (
                          <div className="flex items-center">
                            <span className="px-2 py-1 bg-[#162146] text-white text-xs rounded-full">
                              {item.category}
                            </span>
                          </div>
                        )}
                        <motion.div
                          className="w-full mt-4"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center text-[#162146] font-medium hover:text-[#0e172e]">
                            Lire plus
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))
            )}

            {/* Inline AdBanner after articles */}
            {/* {articles.length > 0 && (
              <div className="py-8">
                <AdBanner position="inline" page="sciences" />
              </div>
            )} */}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Sidebar AdBanner */}
            {/* <div className="bg-white rounded-xl p-4 shadow-sm">
              <AdBanner position="sidebar" page="sciences" />
            </div> */}

            <motion.div
              className="bg-gradient-to-br from-[#162146] to-[#0e172e] text-white rounded-xl overflow-hidden shadow-md"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -5, boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            >
              {/* <div className="p-6">
                <motion.div
                  className="flex items-center gap-2 mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Atom className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Focus Science</h3>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h4 className="text-lg font-semibold mb-3">Écosystème d'innovation technologique au Gabon</h4>
                  <p className="text-blue-100 mb-4">
                    Découvrez comment le Gabon développe un écosystème technologique diversifié allant de l'intelligence artificielle au développement durable, en passant par la biotechnologie et la santé numérique.
                  </p>
                  <motion.button
                    className="inline-block px-4 py-2 bg-white text-[#162146] rounded-md font-medium hover:bg-blue-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explorer l'écosystème
                  </motion.button>
                </motion.div>
              </div> */}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom AdBanner */}
      <div className="w-fully">
        <AdBanner position="bottom" page="sciences" />
      </div>

      <Footer />
    </motion.main>
  );
};

export default SciencesPage;