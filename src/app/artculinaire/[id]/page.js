'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, Share2 } from 'lucide-react';
import Head from 'next/head';
import Footer from '@/components/Footer';

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const ArtCulinaireArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com';
  const validCulinaryTypes = ['recipe', 'ingredient', 'chef', 'culinaire'];

  // Fetch article data
  useEffect(() => {
    if (id) {
        const getArticleData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${apiUrl}/api/arts-traditions-articles/art-culinaire/${id}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        Accept: 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Article not found');
                }
                const articleData = await response.json();
                // Normalize image_url and video_url as before
                let imageUrl = articleData.image_url;
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
                    imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
                } else if (!imageUrl) {
                    imageUrl = `${apiUrl}/api/placeholder/1200/600?text=${encodeURIComponent(articleData.title || 'Article')}&color=047857`;
                }
                let videoUrl = articleData.video_url;
                if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('//')) {
                    videoUrl = `${apiUrl}${videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}`;
                }
                setArticle({
                    id: articleData.id,
                    title: articleData.title,
                    image_url: imageUrl,
                    video_url: videoUrl || null,
                    category: articleData.category?.name || 'Art Culinaire',
                    section: articleData.section?.name || 'Arts & Traditions',
                    author_name: articleData.author_name,
                    author: articleData.author?.username || 'Unknown Author',
                    date: new Date(articleData.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }),
                    content: articleData.content,
                    arts_traditions_type: articleData.arts_traditions_type,
                    prep_time: articleData.prep_time,
                    cook_time: articleData.cook_time,
                    difficulty: articleData.difficulty,
                    rating: articleData.rating,
                    reviews: articleData.reviews,
                    recipe_author: articleData.recipe_author,
                    specialty: articleData.specialty,
                    recipes_count: articleData.recipes_count,
                });
            } catch (err) {
                console.error('Error fetching article:', err);
                setError(err.message);
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };
        getArticleData();
    }
}, [id, apiUrl]);

  // Image error handler
  const handleImageError = (e, itemId, placeholderText, size = { width: 1200, height: 600 }) => {
    const src = e.target.src;
    if (src !== FALLBACK_IMAGE) {
      console.warn(`Image failed to load for item ${itemId}:`, src);
      e.target.src = `${apiUrl}/api/placeholder/${size.width}/${size.height}?text=${encodeURIComponent(placeholderText || 'Article')}&color=047857`;
    } else {
      e.target.src = FALLBACK_IMAGE;
    }
    e.target.className = `${e.target.className} object-contain bg-gray-200`;
  };

  // Share handler
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: `Découvrez cet article culinaire sur ${article?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

   const handleBack = useCallback(() => {
      // Navigate to the previous page in history
      if (window.history.length > 1) {
        router.back();
      } else {
        // Fallback to AfroTcham section if no history
        router.push('/#artculinaire');
      }
    }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#047857] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#047857] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-[#047857] mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || "L'article que vous recherchez n'existe pas ou a été déplacé."}</p>
          <button
          onClick={handleBack}
           className="bg-[#047857] text-white px-6 py-2 rounded-lg hover:bg-[#065f46] transition">
            <span className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} | Art Culinaire</title>
        <meta name="description" content={article.content.substring(0, 160)} />
        <meta property="og:title" content={article.title} />
        <meta property="og:image" content={article.image_url} />
        <meta property="og:description" content={article.content.substring(0, 160)} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen bg-[#047857]">
        {/* Article Header */}
        <div className="relative h-[50vh] w-full">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e, article.id, article.title)}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
              <button
               onClick={handleBack}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition"
                aria-label="Retour à l'accueil"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
          </div>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={handleShare}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition"
              aria-label="Partager l'article"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <span className="bg-[#047857] text-white text-sm font-medium px-3 py-1 rounded-full">{article.section}</span>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto -mt-20 relative z-10 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#047857] mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-y-2">
              <div className="flex items-center mr-6">
                <User className="w-4 h-4 mr-2" />
                <span>{article.author_name || article.author}</span>
              </div>
              <div className="flex items-center mr-6">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                <span>{article.category}</span>
              </div>
              <div className="ml-auto">
                <button
                  onClick={handleShare}
                  className="flex items-center text-[#047857] hover:text-[#065f46]"
                  aria-label="Partager l'article"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  <span>Partager</span>
                </button>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#047857] mb-4 flex items-center">
                <div className="w-2 h-6 bg-[#10b981] mr-3 rounded-full"></div>Contenu
              </h2>
              <div
                className="prose max-w-none text-black prose-p:text-base prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
            {article.arts_traditions_type === 'recipe' && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#047857] mb-4 flex items-center">
                  <div className="w-2 h-6 bg-[#10b981] mr-3 rounded-full"></div>Détails de la Recette
                </h2>
                <p><strong>Temps de préparation :</strong> {article.prep_time || 'N/A'}</p>
                <p><strong>Temps de cuisson :</strong> {article.cook_time || 'N/A'}</p>
                <p><strong>Difficulté :</strong> {article.difficulty || 'N/A'}</p>
                <p><strong>Note :</strong> {article.rating || 'N/A'}</p>
                <p><strong>Avis :</strong> {article.reviews || '0'}</p>
                <p><strong>Auteur de la recette :</strong> {article.recipe_author || 'N/A'}</p>
              </div>
            )}
            {article.arts_traditions_type === 'chef' && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#047857] mb-4 flex items-center">
                  <div className="w-2 h-6 bg-[#10b981] mr-3 rounded-full"></div>À propos du Chef
                </h2>
                <p><strong>Spécialité :</strong> {article.specialty || 'N/A'}</p>
                <p><strong>Nombre de recettes :</strong> {article.recipes_count || '0'}</p>
              </div>
            )}
            {article.arts_traditions_type === 'culinaire' && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#047857] mb-4 flex items-center">
                  <div className="w-2 h-6 bg-[#10b981] mr-3 rounded-full"></div>Contenu Culinaire
                </h2>
                <p>Article culinaire général.</p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ArtCulinaireArticlePage;