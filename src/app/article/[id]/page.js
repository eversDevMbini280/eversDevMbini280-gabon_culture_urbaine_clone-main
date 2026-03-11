'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import { Calendar, Clock, User, Eye, Facebook, Twitter, Linkedin, Mail, Printer, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gabon-culture-urbaine-1.onrender.com';

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoints = [
          `${apiUrl}/api/articles/${id}`,
          `${apiUrl}/api/articles/alaune/${id}`,
          `${apiUrl}/api/articles/buzz/${id}`,
          `${apiUrl}/api/articles/afrotcham/${id}`,
          `${apiUrl}/api/articles/rap/${id}`,
          `${apiUrl}/api/articles/sport/${id}`,
          `${apiUrl}/api/articles/comedy/${id}`,
          `${apiUrl}/api/articles/cinema/${id}`,
          `${apiUrl}/api/articles/story/${id}`,
        ];

        let articleData = null;
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);
            if (res.ok) {
              const data = await res.json();
              if (data && data.id) { articleData = data; break; }
            }
          } catch { continue; }
        }

        if (!articleData) throw new Error('Article introuvable');

        // ✅ FIX : l'auteur peut être un objet {id, username, email...} ou une string
        const rawAuthor = articleData.author;
        const authorName = rawAuthor
          ? typeof rawAuthor === 'object'
            ? rawAuthor.username || rawAuthor.email || rawAuthor.name || 'Rédaction'
            : String(rawAuthor)
          : null;

        // ✅ FIX : category et section peuvent aussi être des objets
        const categoryName = articleData.category
          ? typeof articleData.category === 'object'
            ? articleData.category.name || 'Général'
            : String(articleData.category)
          : 'Général';

        const sectionName = articleData.section
          ? typeof articleData.section === 'object'
            ? articleData.section.name || 'Général'
            : String(articleData.section)
          : 'Général';

        let imageUrl = articleData.image_url;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
          imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
        }
        if (!imageUrl) {
          imageUrl = `${apiUrl}/api/placeholder/1200/600?text=${encodeURIComponent(articleData.title || 'Article')}&color=1d4ed8`;
        }

        setArticle({
          ...articleData,
          image_url: imageUrl,
          author: authorName,
          category: { name: categoryName },
          section: {
            id: typeof articleData.section === 'object' ? articleData.section?.id : null,
            name: sectionName,
          },
        });

        // Articles similaires
        try {
          const sectionId = articleData.section?.id;
          const relUrl = sectionId
            ? `${apiUrl}/api/articles/?section_id=${sectionId}&status=published`
            : `${apiUrl}/api/articles/?status=published`;
          const relRes = await fetch(relUrl);
          if (relRes.ok) {
            const relData = await relRes.json();
            const filtered = relData
              .filter((a) => String(a.id) !== String(id))
              .slice(0, 4)
              .map((a) => {
                let img = a.image_url;
                if (img && !img.startsWith('http') && !img.startsWith('//')) {
                  img = `${apiUrl}${img.startsWith('/') ? img : `/${img}`}`;
                }
                return { ...a, image_url: img || `${apiUrl}/api/placeholder/400/250?color=1d4ed8` };
              });
            setRelatedArticles(filtered);
          }
        } catch { /* non critique */ }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticle();
  }, [id, apiUrl]);

  const getSectionPath = (article) => {
    const section = (article?.section?.name || '').toLowerCase();
    const category = (article?.category?.name || '').toLowerCase();
    if (section.includes('buzz') || category.includes('buzz')) return { path: '/buzz', label: 'Buzz' };
    if (section.includes('afrotcham') || category.includes('afrotcham')) return { path: '/afrotcham', label: 'AfroTcham' };
    if (section.includes('rap') || category.includes('rap')) return { path: '/rap', label: 'Rap Gabonais' };
    if (section.includes('sport') || category.includes('sport')) return { path: '/sport', label: 'Sport' };
    if (section.includes('comédie') || category.includes('comedy')) return { path: '/comedy', label: 'Comédie' };
    if (section.includes('cinéma') || category.includes('cinema')) return { path: '/cinema', label: 'Cinéma' };
    if (section.includes('story') || category.includes('story')) return { path: '/stories', label: 'Stories' };
    return { path: '/', label: 'À La Une' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const estimateReadTime = (content) => {
    if (!content) return '2 min';
    const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return `${Math.max(1, Math.round(words / 200))} min`;
  };

  const handleShare = (platform) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = article?.title || '';
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      mail: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    };
    if (platform === 'print') { window.print(); return; }
    if (links[platform]) window.open(links[platform], '_blank');
  };

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="min-h-[60vh] flex items-center justify-center" style={{ paddingTop: '160px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        </div>
        <Footer />
      </main>
    );
  }

  // Erreur
  if (error || !article) {
    return (
      <main className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center" style={{ paddingTop: '160px' }}>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Article introuvable</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Retour à l&apos;accueil
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const sectionInfo = getSectionPath(article);

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ✅ NAVBAR — identique à toutes les autres pages */}
      <Navigation />

      <div style={{ paddingTop: '160px' }}>

        {/* ✅ BREADCRUMB — Accueil / Section / Titre comme GMT */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <nav className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                🏠 Accueil
              </Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <Link href={sectionInfo.path} className="hover:text-blue-600 transition-colors">
                {sectionInfo.label}
              </Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-gray-700 line-clamp-1 max-w-xs md:max-w-lg">
                {article.title}
              </span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">

            {/* ✅ BOUTONS PARTAGE FLOTTANTS À GAUCHE — comme GMT */}
            <div className="hidden lg:flex flex-col items-center gap-3 sticky top-48 self-start pt-2">
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                title="Partager sur Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                title="Partager sur X"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-10 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                title="Partager sur LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('mail')}
                className="w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                title="Envoyer par email"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('print')}
                className="w-10 h-10 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                title="Imprimer"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            {/* ARTICLE PRINCIPAL */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">

                  {/* ✅ TAGS DE SECTION — comme GMT */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Link
                      href={sectionInfo.path}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors uppercase"
                    >
                      {sectionInfo.label}
                    </Link>
                    <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded uppercase">
                      Derniers articles
                    </span>
                    {article.category?.name && article.category.name !== sectionInfo.label && (
                      <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded uppercase">
                        {article.category.name}
                      </span>
                    )}
                  </div>

                  {/* TITRE */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {article.title}
                  </h1>

                  {/* ✅ META — auteur, date, vues, temps lecture comme GMT */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">
                    {article.author && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-800">{article.author}</span>
                      </div>
                    )}
                    {article.created_at && (
                      <div className="flex items-center gap-1">
                        <span>·</span>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                    )}
                    {article.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{parseInt(article.views).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Temps de lecture {estimateReadTime(article.content)}</span>
                    </div>
                  </div>

                  {/* BOUTONS PARTAGE MOBILE */}
                  <div className="flex lg:hidden gap-2 mb-5">
                    {[
                      { key: 'facebook', bg: 'bg-blue-600', icon: <Facebook className="w-4 h-4" /> },
                      { key: 'twitter', bg: 'bg-black', icon: <Twitter className="w-4 h-4" /> },
                      { key: 'linkedin', bg: 'bg-blue-700', icon: <Linkedin className="w-4 h-4" /> },
                      { key: 'mail', bg: 'bg-gray-500', icon: <Mail className="w-4 h-4" /> },
                      { key: 'print', bg: 'bg-gray-400', icon: <Printer className="w-4 h-4" /> },
                    ].map(({ key, bg, icon }) => (
                      <button
                        key={key}
                        onClick={() => handleShare(key)}
                        className={`w-9 h-9 ${bg} text-white rounded flex items-center justify-center transition-all hover:scale-110 shadow-sm`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  {/* IMAGE PRINCIPALE */}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        e.target.src = `${apiUrl}/api/placeholder/1200/600?text=${encodeURIComponent(article.title)}&color=1d4ed8`;
                      }}
                    />
                  </div>

                  {/* DESCRIPTION */}
                  {article.description && (
                    <p className="text-lg text-gray-600 font-medium mb-6 leading-relaxed border-l-4 border-blue-500 pl-4 italic">
                      {article.description}
                    </p>
                  )}

                  {/* CONTENU COMPLET */}
                  {article.content ? (
                    <div
                      className="prose prose-blue max-w-none text-gray-800 text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">Contenu non disponible.</p>
                  )}

                </div>
              </div>

              {/* Articles similaires mobile */}
              {relatedArticles.length > 0 && (
                <div className="mt-8 lg:hidden">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
                    Articles Similaires
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedArticles.map((rel) => (
                      <Link key={rel.id} href={`/article/${rel.id}`}>
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex gap-3 p-3">
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                            <Image src={rel.image_url} alt={rel.title} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="text-blue-600 text-xs font-medium">
                              {rel.category?.name || rel.section?.name}
                            </span>
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mt-1">{rel.title}</h4>
                            <span className="text-xs text-gray-400">{formatDate(rel.created_at)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR DROITE */}
            <div className="hidden lg:block w-64 flex-shrink-0 space-y-6 sticky top-48 self-start">

              <AdBanner position="sidebar" page="article" />

              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-blue-600 text-white px-4 py-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide">Articles Similaires</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {relatedArticles.map((rel) => (
                      <Link key={rel.id} href={`/article/${rel.id}`} className="block hover:bg-gray-50 transition-colors">
                        <div className="p-3 flex gap-3">
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                            <Image src={rel.image_url} alt={rel.title} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="text-blue-600 text-xs block mb-1">
                              {rel.category?.name || rel.section?.name || 'Général'}
                            </span>
                            <h4 className="text-xs font-medium text-gray-900 line-clamp-2">{rel.title}</h4>
                            <span className="text-xs text-gray-400 mt-1 block">{formatDate(rel.created_at)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ArticleDetailPage;