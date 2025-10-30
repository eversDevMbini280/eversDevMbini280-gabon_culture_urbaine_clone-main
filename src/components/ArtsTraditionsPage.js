"use client";
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Paintbrush, BookOpen, Map, Calendar, User, Globe, ChevronRight, Utensils, Clock, Star, Play } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const ArtsTraditionsPage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [featuredArts, setFeaturedArts] = useState([]);
  const [ethnies, setEthnies] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [popularIngredients, setPopularIngredients] = useState([]);
  const [featuredChefs, setFeaturedChefs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          artsResponse,
          ethniesResponse,
          festivalsResponse,
          recipesResponse,
          ingredientsResponse,
          chefsResponse,
        ] = await Promise.all([
          fetch(`${apiUrl}/api/arts-traditions-articles/?arts_traditions_type=artisanat`),
          fetch(`${apiUrl}/api/arts-traditions-articles/?arts_traditions_type=ethnie`),
          fetch(`${apiUrl}/api/arts-traditions-articles/?arts_traditions_type=festival`),
          fetch(`${apiUrl}/api/arts-traditions-articles/?arts_traditions_type=recipe`),
          fetch(`${apiUrl}/api/arts-traditions-articles/?arts_traditions_type=ingredient`),
          fetch(`${apiUrl}/api/arts-traditions-articles/?arts_traditions_type=chef`),
        ]);

        const responses = [
          { res: artsResponse, name: 'Arts Articles' },
          { res: ethniesResponse, name: 'Ethnies' },
          { res: festivalsResponse, name: 'Festivals' },
          { res: recipesResponse, name: 'Recipes' },
          { res: ingredientsResponse, name: 'Ingredients' },
          { res: chefsResponse, name: 'Chefs' },
        ];

        for (const { res, name } of responses) {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`Failed to fetch ${name}: ${errorData.detail || res.statusText}`);
          }
        }

        const [
          artsData,
          ethniesData,
          festivalsData,
          recipesData,
          ingredientsData,
          chefsData,
        ] = await Promise.all([
          artsResponse.json(),
          ethniesResponse.json(),
          festivalsResponse.json(),
          recipesResponse.json(),
          ingredientsResponse.json(),
          chefsResponse.json(),
        ]);

        const processItem = (item) => ({
          ...item,
          image: item.image_url
            ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
            : FALLBACK_IMAGE,
          video_url: item.video_url
            ? `${apiUrl}${item.video_url.startsWith('/') ? item.video_url : `/${item.video_url}`}`
            : null,
          description: item.content,
          name: item.title,
          author: item.recipe_author || item.author_name,
        });

        setFeaturedArts(artsData.map(processItem));
        setEthnies(ethniesData.map(processItem));
        setFestivals(festivalsData.map(processItem));
        setFeaturedRecipes(recipesData.map(processItem));
        setPopularIngredients(ingredientsData.map(processItem));
        setFeaturedChefs(chefsData.map(processItem));
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const handleImageError = (e, placeholderText, size = { width: 800, height: 400 }, color = '4f46e5') => {
    console.log(`Image error loading: ${e.target.src}`);
    e.target.src = FALLBACK_IMAGE;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900">
        <div className="text-white">Error: {error}</div>
      </div>
    );
  }

  return (
    <motion.main
      className="min-h-screen bg-blue-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <motion.div
          className="relative bg-blue-900 text-white mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="px-4 py-16 relative z-10">
            <motion.div
              className="flex items-center gap-3 mb-4 page-title-section"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                className="bg-white p-2 rounded-md"
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Paintbrush className="w-8 h-8 text-blue-600" />
              </motion.div>
              <h3 className="text-4xl font-bold">Arts et Traditions</h3>
            </motion.div>
            <motion.p
              className="text-lg text-blue-100 max-w-3xl mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Explorez la richesse du patrimoine culturel gabonais à travers ses arts traditionnels, son artisanat, ses rites, sa cuisine et ses coutumes transmis de génération en génération.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.div
                className="w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div

                  className="block text-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                >
                  Découvrir l'artisanat
                </div>
              </motion.div>
              <motion.div
                className="w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div

                  className="block text-center px-6 py-3 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors"
                >
                  Explorer les ethnies
                </div>
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            className="absolute inset-0 opacity-30"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 1.2 }}
          >
            <img
              src={featuredArts[0]?.image || FALLBACK_IMAGE}
              alt="Arts et Traditions"
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e, 'Arts et Traditions', { width: 1200, height: 600 }, '1e40af')}
            />
          </motion.div>
        </motion.div>

        {/* Top AdBanner */}
        {/* <div className="mb-10">
          <AdBanner position="top" page="arts-traditions" />
        </div> */}

        {/* Featured Articles */}
        <section className="mb-10">
          <motion.div
            className="bg-blue-900 p-6 rounded-xl shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-3xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              À la Découverte de Nos Traditions
            </motion.h2>
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-blue-900 to-transparent md:hidden" />
              <motion.div
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:snap-none"
                style={{
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {featuredArts.map((article, index) => (
                  <motion.article
                    key={article.id}
                    className="flex-none w-[85%] pr-4 snap-start md:w-auto bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    style={{ scrollSnapAlign: 'start' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  >
                    <div className="relative">
                      <motion.img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-56 object-cover"
                        onError={(e) => handleImageError(e, article.title, { width: 400, height: 300 }, '2563eb')}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      {article.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-12 h-12 text-white opacity-80" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                        {article.arts_traditions_type || 'Article'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{article.content.substring(0, 100)}...</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                          <Link
                            href={`/decouverte/${article.id}`}
                            className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
                          >
                            Lire plus
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Middle AdBanner */}
        {/* <div className="mb-10">
          <AdBanner position="middle" page="arts-traditions" />
        </div> */}

        {/* Art Culinaire Section */}
        <section className="mb-10">
          <motion.div
            className="bg-blue-950 p-6 rounded-xl shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="bg-blue-50 p-2 rounded-lg"
                  initial={{ rotate: -5, scale: 0.9 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <Utensils className="w-6 h-6 text-blue-600" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white">Art Culinaire</h2>
              </div>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                {/* <Link href="/art-culinaire/" className="text-blue-300 font-medium hover:text-blue-100 flex items-center">
                  Explorer notre cuisine
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link> */}
              </motion.div>
            </motion.div>
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-blue-950 to-transparent md:hidden" />
              <motion.div
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:snap-none"
                style={{
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {featuredRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    className="flex-none w-[85%] pr-4 snap-start md:w-auto bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                    style={{ scrollSnapAlign: 'start' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative">
                      <motion.img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-56 object-cover"
                        onError={(e) => handleImageError(e, recipe.title, { width: 400, height: 300 }, '2563eb')}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      {recipe.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-12 h-12 text-white opacity-80" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                        Recette
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {recipe.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{recipe.description?.substring(0, 100)}...</p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-500 mr-1" />
                          <span className="font-medium">{recipe.rating || 0}</span>
                          <span className="text-gray-500 ml-1">({recipe.reviews || 0} avis)</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">{recipe.author || 'Anonyme'}</div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-5">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Préparation: {recipe.prep_time || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Cuisson: {recipe.cook_time || 'N/A'}
                        </div>
                        <div>Difficulté: {recipe.difficulty || 'N/A'}</div>
                      </div>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                          href={`/artculinaire/${recipe.id}`}
                          className="block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Voir la recette
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Featured Chefs */}
        <section className="mb-10">
          <motion.div
            className="bg-blue-950 p-6 rounded-xl shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-2xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Nos Chefs à l'Honneur
            </motion.h2>
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-blue-950 to-transparent md:hidden" />
              <motion.div
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:snap-none"
                style={{
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {featuredChefs.map((chef, index) => (
                  <motion.div
                    key={chef.id}
                    className="flex-none w-[85%] pr-4 snap-start md:w-auto bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    style={{ scrollSnapAlign: 'start' }}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 relative">
                        <motion.img
                          src={chef.image}
                          alt={chef.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, chef.name, { width: 300, height: 300 }, '2563eb')}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                        {chef.video_url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="w-12 h-12 text-white opacity-80" />
                          </div>
                        )}
                      </div>
                      <div className="md:w-2/3 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{chef.name}</h3>
                        <p className="text-blue-600 mb-4">{chef.specialty || 'N/A'}</p>
                        <p className="text-gray-600 mb-6">{chef.recipes_count || 0} recettes partagées</p>
                        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                          <Link
                            href={`/chef/${chef.id}`}
                            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
                          >
                            Découvrir ses recettes
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Popular Ingredients Section */}
        <section className="mb-10">
          <motion.div
            className="bg-blue-900 p-6 rounded-xl shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-2xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Ingrédients Populaires de la Cuisine Gabonaise
            </motion.h2>
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-blue-900 to-transparent md:hidden" />
              <motion.div
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-2 md:md:grid-cols-3 md:lg:grid-cols-5 md:gap-6 md:overflow-visible md:snap-none"
                style={{
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {popularIngredients.map((ingredient, index) => (
                  <motion.div
                    key={ingredient.id || index}
                    className="flex-none w-[70%] pr-4 snap-start md:w-auto"
                    style={{ scrollSnapAlign: 'start' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    whileHover={{ y: -5 }}
                  >
                    <Link
                      href={`/art-culinaire/ingredients/${ingredient.name.toLowerCase().replace(/ /g, '-')}`}
                      className="group"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <motion.img
                            src={ingredient.image}
                            alt={ingredient.name}
                            className="w-full h-40 object-cover"
                            onError={(e) => handleImageError(e, ingredient.name, { width: 200, height: 200 }, '2563eb')}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          />
                          {ingredient.video_url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="w-10 h-10 text-white opacity-80" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {ingredient.name}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{ingredient.description}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Ethnies Section */}
        <section className="mb-10">
          <motion.div
            className="bg-blue-950 p-6 rounded-xl shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="bg-blue-600 p-2 rounded-lg"
                  initial={{ rotate: -5, scale: 0.9 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <Globe className="w-6 h-6 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white">Nos Ethnies</h2>
              </div>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                {/* <Link
                  href="/arts-traditions/ethnies"
                  className="text-blue-300 font-medium hover:text-blue-100 flex items-center"
                >
                  Découvrir toutes les ethnies
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link> */}
              </motion.div>
            </motion.div>
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-blue-950 to-transparent md:hidden" />
              <motion.div
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-2 md:lg:grid-cols-4 md:gap-8 md:overflow-visible md:snap-none"
                style={{
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {ethnies.map((ethnie, index) => (
                  <motion.div
                    key={ethnie.id}
                    className="flex-none w-[85%] pr-4 snap-start md:w-auto bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    style={{ scrollSnapAlign: 'start' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative">
                      <motion.img
                        src={ethnie.image}
                        alt={ethnie.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => handleImageError(e, ethnie.name, { width: 300, height: 200 }, '2563eb')}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      {ethnie.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-12 h-12 text-white opacity-80" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {ethnie.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{ethnie.description}</p>
                      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <Link
                          href={`/ethnies/${ethnie.id}`}
                          className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
                        >
                          En savoir plus
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Festivals Section */}
        {/* <section className="mb-10">
          <motion.div
            className="bg-blue-900 p-6 rounded-xl shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="bg-blue-600 p-2 rounded-lg"
                  initial={{ rotate: -5, scale: 0.9 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <Calendar className="w-6 h-6 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white">Festivals et Événements</h2>
              </div>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Link
                  href="/arts-traditions/festivals"
                  className="text-blue-300 font-medium hover:text-blue-100 flex items-center"
                >
                  Voir tous les festivals
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </motion.div>
            </motion.div>
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-blue-900 to-transparent md:hidden" />
              <motion.div
                className="flex overflow-x-auto pb-6 -mx-4 pl-4 scrollbar-hide snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:snap-none"
                style={{
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {festivals.map((festival, index) => (
                  <motion.div
                    key={festival.id}
                    className="flex-none w-[85%] pr-4 snap-start md:w-auto bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    style={{ scrollSnapAlign: 'start' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative">
                      <motion.img
                        src={festival.image}
                        alt={festival.name}
                        className="w-full h-56 object-cover"
                        onError={(e) => handleImageError(e, festival.name, { width: 400, height: 300 }, '2563eb')}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      {festival.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-12 h-12 text-white opacity-80" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {festival.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{festival.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{new Date(festival.created_at).toLocaleDateString('fr-FR')}</span>
                        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                          <Link
                            href={`/arts-traditions/festivals/${festival.id}`}
                            className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
                          >
                            Détails
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section> */}

        {/* Bottom AdBanner */}
        <div className="w-full">
          <AdBanner position="bottom" page="arts-traditions" />
        </div>
      </div>

      <Footer />
    </motion.main>
  );
};

export default ArtsTraditionsPage;
