'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Instagram, 
  Twitter, 
  Youtube, 
  Award, 
  Calendar, 
  Clock, 
  Play, 
  Mail, 
  Share2,
  MessageCircle
} from 'lucide-react';

// This would typically come from an API or database
// For this example, we'll include the data directly
const getPresenters = () => {
  return [
    {
      id: "1",
      name: "Michel Nguema",
      role: "Présentateur Principal JT",
      image: "/api/placeholder/600/600",
      bio: "Michel anime le journal télévisé de GCUTV depuis 2021. Avec son style dynamique et sa présence charismatique, il a su conquérir le cœur des téléspectateurs.",
      detailedBio: "Après des études de journalisme à l'Université Omar Bongo de Libreville et un passage par plusieurs radios locales, Michel Nguema a rejoint GCUTV dès ses débuts. Passionné par l'actualité culturelle et engagé dans la promotion des artistes locaux, il a rapidement su imposer son style unique qui allie professionnalisme et proximité avec le public.\n\nGrâce à sa connaissance approfondie de la scène culturelle gabonaise et son approche authentique, Michel est devenu l'un des visages les plus reconnaissables de GCUTV. En dehors de ses émissions, il participe régulièrement à des événements culturels en tant que modérateur ou maître de cérémonie.",
      categories: ["journal", "actualités"],
      shows: [
        {
          name: "JT Culture",
          time: "Tous les jours à 20h",
          description: "Le journal télévisé quotidien dédié à l'actualité culturelle gabonaise et africaine."
        },
        {
          name: "Décryptage Hebdo",
          time: "Chaque vendredi à 21h",
          description: "Analyse approfondie des événements culturels marquants de la semaine avec des invités experts."
        }
      ],
      socialMedia: {
        instagram: "michel_nguema",
        twitter: "michelnguema",
      },
      awards: ["Meilleur présentateur 2023", "Prix Excellence Média 2022"],
      featured: true,
      quote: "La culture est le reflet de l'âme d'un peuple. Mon rôle est de la rendre accessible à tous.",
      upcomingEvents: [
        {
          name: "Festival Urbain de Libreville",
          date: "15-18 mai 2025",
          role: "Maître de cérémonie"
        },
        {
          name: "Conférence sur les Médias Culturels",
          date: "7 juin 2025",
          role: "Intervenant"
        }
      ],
      recentEpisodes: [
        {
          show: "JT Culture",
          date: "28 février 2025",
          thumbnail: "/api/placeholder/400/225",
          link: "#"
        },
        {
          show: "Décryptage Hebdo",
          date: "23 février 2025",
          thumbnail: "/api/placeholder/400/225",
          link: "#"
        },
        {
          show: "JT Culture",
          date: "27 février 2025",
          thumbnail: "/api/placeholder/400/225",
          link: "#"
        }
      ]
    },
    {
      id: "2",
      name: "Sophie Mboumba",
      role: "Animatrice Musicale",
      image: "/api/placeholder/600/600",
      bio: "Sophie est la référence musicale de GCUTV. Elle présente plusieurs émissions musicales et est reconnue pour sa connaissance approfondie de la scène musicale gabonaise et africaine.",
      detailedBio: "Avant de rejoindre le monde des médias, Sophie était DJ dans plusieurs clubs réputés de Libreville. Sa transition vers la télévision s'est faite naturellement, portée par sa passion pour la musique et son désir de mettre en avant les talents gabonais.\n\nDepuis son arrivée à GCUTV en 2019, elle a créé et développé plusieurs émissions musicales devenues incontournables. Ses interviews d'artistes sont particulièrement appréciées pour leur authenticité et la qualité des échanges. Sophie est également connue pour son engagement en faveur des artistes féminines dans l'industrie musicale gabonaise.",
      categories: ["musique", "culture"],
      shows: [
        {
          name: "Top Hits Gabon",
          time: "Chaque samedi à 19h",
          description: "Classement des titres les plus populaires de la semaine sur la scène musicale gabonaise."
        },
        {
          name: "Interview Artistes",
          time: "Mercredi à 21h",
          description: "Rencontres intimistes avec les artistes du moment pour découvrir leur univers et leur parcours."
        }
      ],
      socialMedia: {
        instagram: "sophiemboumba",
        twitter: "sophie_mboumba",
        youtube: "SophieMboumbaTV"
      },
      awards: ["Prix découverte média 2022", "Trophée de l'animation musicale 2023"],
      featured: true,
      quote: "La musique gabonaise est riche et diverse. Je suis fière de contribuer à sa promotion chaque jour sur GCUTV.",
      upcomingEvents: [
        {
          name: "Festival Akoma Mba",
          date: "22-25 avril 2025",
          role: "Présentatrice"
        }
      ],
      recentEpisodes: [
        {
          show: "Top Hits Gabon",
          date: "24 février 2025",
          thumbnail: "/api/placeholder/400/225",
          link: "#"
        },
        {
          show: "Interview Artistes - Mylka",
          date: "21 février 2025",
          thumbnail: "/api/placeholder/400/225",
          link: "#"
        },
        {
          show: "Top Hits Gabon",
          date: "17 février 2025",
          thumbnail: "/api/placeholder/400/225",
          link: "#"
        }
      ]
    },
    // We would add more presenters here in a real application
  ];
};

const PresenterDetailPage = ({ presenterId }) => {
  const router = useRouter();
  const [presenter, setPresenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // In a real application, this would be an API call
    // Here we're simulating fetching data
    try {
      const allPresenters = getPresenters();
      const foundPresenter = allPresenters.find(p => p.id === presenterId);
      
      if (foundPresenter) {
        setPresenter(foundPresenter);
      } else {
        setError("Présentateur non trouvé");
      }
    } catch (err) {
      setError("Une erreur s'est produite lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [presenterId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (error || !presenter) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-red-100 flex items-center justify-center rounded-full mx-auto mb-6">
              <span className="text-red-600 text-4xl">!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || "Présentateur non trouvé"}</h1>
            <p className="text-gray-600 mb-6">
              Nous n'avons pas pu trouver les informations demandées. Veuillez retourner à la liste des présentateurs.
            </p>
            <button
              onClick={() => router.push('/presentateurs')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retour aux présentateurs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Format bio text with paragraphs
  const formattedBio = presenter.detailedBio.split('\n\n').map((paragraph, index) => (
    <p key={index} className="mb-4">{paragraph}</p>
  ));

  return (
    <motion.main 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />
      
      {/* Back Button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/presentateurs')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux présentateurs
          </button>
        </div>
      </div>
      
      {/* Hero Section */}
      <motion.div 
        className="bg-blue-600 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white mx-auto">
                  <img 
                    src={presenter.image} 
                    alt={presenter.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {presenter.awards && presenter.awards.length > 0 && (
                  <div className="absolute -bottom-4 right-1/2 transform translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    <span>{presenter.awards[0]}</span>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center md:text-left"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{presenter.name}</h1>
              <p className="text-xl text-blue-100 mb-6">{presenter.role}</p>
              
              {presenter.quote && (
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-6 relative">
                  <span className="absolute top-0 left-0 transform -translate-x-2 -translate-y-2 text-5xl text-blue-300 opacity-50">"</span>
                  <p className="italic text-blue-50">
                    {presenter.quote}
                  </p>
                  <span className="absolute bottom-0 right-0 transform translate-x-2 translate-y-2 text-5xl text-blue-300 opacity-50">"</span>
                </div>
              )}
              
              <div className="flex justify-center md:justify-start space-x-4 mb-6">
                {presenter.socialMedia.instagram && (
                  <a 
                    href={`https://instagram.com/${presenter.socialMedia.instagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {presenter.socialMedia.twitter && (
                  <a 
                    href={`https://twitter.com/${presenter.socialMedia.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {presenter.socialMedia.youtube && (
                  <a 
                    href={`https://youtube.com/${presenter.socialMedia.youtube}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {presenter.categories.map((category, idx) => (
                  <span 
                    key={idx} 
                    className="bg-white/10 text-white text-sm px-3 py-1 rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Bio and Shows */}
          <div className="lg:col-span-2">
            {/* Bio Section */}
            <motion.section 
              className="bg-white rounded-xl shadow-sm p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Biographie</h2>
              <div className="text-gray-700">
                {formattedBio}
              </div>
            </motion.section>
            
            {/* Shows Section */}
            <motion.section 
              className="bg-white rounded-xl shadow-sm p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Émissions</h2>
              
              <div className="space-y-6">
                {presenter.shows.map((show, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{show.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {show.time}
                      </span>
                    </div>
                    <p className="text-gray-600">{show.description}</p>
                    
                    <div className="mt-4 flex justify-end">
                      <Link 
                        href={`/emissions/${show.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-blue-600 flex items-center text-sm font-medium hover:text-blue-800 transition-colors"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Voir les épisodes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
          
          {/* Sidebar - Details, Recent Episodes, Events */}
          <div className="space-y-8">
            {/* Contact */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact</h3>
              
              <div className="space-y-4">
                <button
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contacter pour une interview
                </button>
                
                <button
                  className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager le profil
                </button>
              </div>
            </motion.div>
            
            {/* Awards */}
            {presenter.awards && presenter.awards.length > 0 && (
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Récompenses</h3>
                
                <ul className="space-y-2">
                  {presenter.awards.map((award, index) => (
                    <li key={index} className="flex items-start">
                      <Award className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{award}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            
            {/* Upcoming Events */}
            {presenter.upcomingEvents && presenter.upcomingEvents.length > 0 && (
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Événements à venir</h3>
                
                <ul className="space-y-4">
                  {presenter.upcomingEvents.map((event, index) => (
                    <li key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">{event.name}</h4>
                          <p className="text-sm text-gray-500">{event.date}</p>
                          <p className="text-sm text-blue-600 mt-1">{event.role}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            
            {/* Recent Episodes */}
            {presenter.recentEpisodes && presenter.recentEpisodes.length > 0 && (
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Épisodes récents</h3>
                
                <div className="space-y-4">
                  {presenter.recentEpisodes.map((episode, index) => (
                    <Link 
                      key={index} 
                      href={episode.link}
                      className="block group"
                    >
                      <div className="relative rounded-lg overflow-hidden mb-2">
                        <img 
                          src={episode.thumbnail} 
                          alt={episode.show}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{episode.show}</h4>
                      <p className="text-sm text-gray-500">{episode.date}</p>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Link 
                    href={`/replay?presenter=${presenter.id}`}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                  >
                    Voir tous les épisodes
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="bg-blue-600 p-2 rounded-lg inline-flex"
              initial={{ rotate: -10, scale: 0.9 }}
              whileInView={{ rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">Commentaires</h2>
          </motion.div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <textarea 
                placeholder="Partagez votre opinion sur ce présentateur..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
              ></textarea>
              <div className="flex justify-end mt-2">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Commenter
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <p className="text-center text-gray-500">
                Soyez le premier à commenter sur {presenter.name}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </motion.main>
  );
};

export default PresenterDetailPage;