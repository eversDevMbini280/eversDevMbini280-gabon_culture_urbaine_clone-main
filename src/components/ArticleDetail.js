'use client'

import React from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import { Calendar, Clock, User, Share2, Facebook, Twitter, Instagram, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const ArticleDetail = ({ params }) => {
  // In a real application, you would fetch the article data using the ID
  // For this example, we'll use mock data
  const article = {
    id: params.id,
    title: "Lancement d'un nouveau programme de soutien aux artistes urbains gabonais",
    content: [
      "Le ministère de la Culture a dévoilé hier un nouveau dispositif de financement destiné à soutenir les jeunes talents de la scène urbaine gabonaise. Ce programme, baptisé « Émergence Culturelle », vise à accompagner financièrement et logistiquement les artistes émergents dans divers domaines comme la musique, la danse, le graffiti ou encore le cinéma.",
      "Lors de la conférence de presse tenue au Palais de la Culture de Libreville, la ministre a précisé que l'enveloppe globale s'élève à 250 millions de francs CFA pour la première année. « Ce dispositif répond à une demande forte du secteur culturel, notamment des jeunes créateurs qui peinent souvent à trouver les moyens nécessaires pour développer leurs projets », a-t-elle déclaré.",
      "Le programme se décompose en trois volets principaux : une aide à la création, un accompagnement à la diffusion et un soutien à la formation professionnelle. Les candidatures seront ouvertes dès le mois prochain et seront examinées par un comité composé de professionnels de la culture et de représentants du ministère.",
      "« Nous voulons que ce programme soit accessible et transparent », a souligné la ministre. « Les critères de sélection seront basés principalement sur la qualité artistique et l'originalité des projets, sans considération d'appartenance à telle ou telle école ou courant. »",
      "Cette initiative s'inscrit dans un plan plus large de développement culturel annoncé en début d'année par le gouvernement. Elle fait suite à plusieurs consultations menées auprès des acteurs du secteur ces derniers mois.",
      "Pour Jean-Marc Koumba, rappeur et président du collectif « Libreville en Rythme », cette annonce est une excellente nouvelle : « C'est la reconnaissance de notre travail et de notre contribution à la culture nationale. Jusqu'à présent, la culture urbaine était souvent considérée comme secondaire par rapport aux arts traditionnels. »",
      "Parmi les points forts du dispositif figure la création d'un studio d'enregistrement public qui sera mis à la disposition des artistes sélectionnés. Des résidences de création seront également proposées dans plusieurs centres culturels du pays.",
      "Le ministère a par ailleurs annoncé un partenariat avec plusieurs médias, dont GCUTV, pour assurer une meilleure visibilité aux artistes bénéficiaires du programme.",
      "Les formulaires de candidature seront disponibles en ligne à partir du 15 mars prochain. Une série d'ateliers d'information sera organisée dans les principales villes du pays pour présenter le dispositif et aider les artistes à préparer leurs dossiers.",
    ],
    category: "Culture",
    image: "/api/placeholder/1200/600",
    date: "25 février 2025",
    readTime: "5 min de lecture",
    author: "Marie Nguema",
    tags: ["Financement", "Artistes", "Ministère de la Culture", "Programme", "Jeunes talents"]
  };

  // Related articles
  const relatedArticles = [
    {
      id: 2,
      title: "Rénovation du Centre Culturel Français de Libreville: un tournant pour la scène artistique",
      category: "Infrastructures",
      image: "/api/placeholder/400/250",
      date: "24 février 2025"
    },
    {
      id: 3,
      title: "Le Festival des Cultures Urbaines reporté en raison des prévisions météorologiques",
      category: "Événements",
      image: "/api/placeholder/400/250",
      date: "23 février 2025"
    },
    {
      id: 4,
      title: "Nouvelle plateforme de streaming dédiée aux artistes gabonais",
      category: "Technologie",
      image: "/api/placeholder/400/250",
      date: "25 février 2025"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Article Content */}
      <article className="max-w-7xl mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/actualite" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour aux actualités
          </Link>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
            {article.category}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{article.title}</h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-y-2 gap-x-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {article.date}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {article.readTime}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              Par {article.author}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-8 rounded-xl overflow-hidden shadow-md">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-auto"
          />
        </div>

        {/* Article Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="prose prose-blue max-w-none">
                {article.content.map((paragraph, index) => (
                  <p key={index} className="mb-6 text-gray-800 text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Partager cet article
                </h3>
                <div className="flex gap-4">
                  <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="bg-blue-400 text-white p-3 rounded-full hover:bg-blue-500 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Related Articles */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="bg-blue-600 text-white p-4">
                <h3 className="font-bold">Articles Similaires</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/actualite/${related.id}`}
                    className="block hover:bg-blue-50 transition-colors"
                  >
                    <div className="p-4 flex gap-4">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={related.image}
                          alt={related.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <span className="text-blue-600 text-sm block mb-1">{related.category}</span>
                        <h4 className="font-medium text-gray-900 line-clamp-2">{related.title}</h4>
                        <span className="text-sm text-gray-500 mt-1 block">{related.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">Restez informé</h3>
              <p className="text-gray-600 mb-4">
                Inscrivez-vous à notre newsletter pour recevoir les dernières actualités de la culture urbaine gabonaise.
              </p>
              <form className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Votre adresse email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  S'inscrire
                </button>
              </form>
            </div>

            {/* Ad Space */}
            <div className="bg-yellow-100 rounded-xl p-8 text-center border border-yellow-300">
              <p className="text-yellow-800 font-medium">Espace publicitaire</p>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
};

export default ArticleDetail;