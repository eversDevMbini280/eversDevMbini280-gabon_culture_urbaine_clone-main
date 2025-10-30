/**
 * Système de recommandations croisées pour articles similaires
 * Permet aux articles d'une section d'apparaître dans d'autres sections similaires
 */

// Configuration des sections et leurs affinités
const SECTION_AFFINITIES = {
    // Culture Urbaine et sections apparentées
    'buzz': ['afrotcham', 'rap', 'stories', 'cinema', 'comedy'],
    'afrotcham': ['buzz', 'rap', 'stories', 'cinema'],
    'rap': ['buzz', 'afrotcham', 'stories', 'cinema', 'comedy'],
    'cinema': ['buzz', 'afrotcham', 'rap', 'comedy', 'stories'],
    'comedy': ['buzz', 'cinema', 'rap', 'stories'],
    'stories': ['buzz', 'afrotcham', 'rap', 'cinema', 'comedy'],

    // Sport reste principalement avec sport mais peut inclure actualités
    'sport': ['actualite', 'eventactual'],

    // Actualités et événements
    'actualite': ['eventactual', 'alauneactual', 'sport'],
    'eventactual': ['actualite', 'alauneactual'],
    'alauneactual': ['actualite', 'eventactual'],

    // Sciences et découvertes
    'sciences': ['tech', 'decouverte'],
    'tech': ['sciences', 'decouverte'],
    'decouverte': ['sciences', 'tech'],

    // Articles les plus lus peuvent venir de partout
    'mostread': ['buzz', 'actualite', 'sport', 'rap', 'cinema']
};

// Endpoints API pour chaque section
const SECTION_ENDPOINTS = {
    'buzz': '/api/articles/?section_id=2&status=published',
    'afrotcham': '/api/articles/afrotcham?status=published',
    'rap': '/api/articles/rap?status=published',
    'sport': '/api/articles/sport?status=published',
    'cinema': '/api/articles/cinema?status=published',
    'comedy': '/api/articles/comedy?status=published',
    'stories': '/api/articles/story?status=published',
    'actualite': '/api/actualitehome/?status=published',
    'eventactual': '/api/actualitehome/?status=published&type=event',
    'alauneactual': '/api/actualitehome/?status=published&type=alaune',
    'sciences': '/api/science-articles/?status=published',
    'tech': '/api/science-articles/?status=published&science_section=tech',
    'decouverte': '/api/science-articles/?status=published&science_section=decouverte',
    'mostread': '/api/articles/mostread?status=published'
};

/**
 * Récupère des articles de recommandation croisée
 * @param {string} currentSection - Section actuelle
 * @param {string|number} excludeId - ID de l'article à exclure
 * @param {string} apiUrl - URL de base de l'API
 * @param {number} limit - Nombre maximum d'articles à récupérer
 * @returns {Promise<Array>} Articles recommandés
 */
export const getCrossRecommendations = async (currentSection, excludeId, apiUrl, limit = 6) => {
    try {
        const relatedSections = SECTION_AFFINITIES[currentSection] || [];
        const allRecommendations = [];

        // Récupérer des articles de la même section d'abord
        const currentSectionEndpoint = SECTION_ENDPOINTS[currentSection];
        if (currentSectionEndpoint) {
            try {
                const currentSectionUrl = `${apiUrl}${currentSectionEndpoint}&limit=${Math.ceil(limit / 2)}`;
                const response = await fetch(currentSectionUrl);
                if (response.ok) {
                    const articles = await response.json();
                    const filtered = articles
                        .filter(article => article.id !== parseInt(excludeId))
                        .map(article => ({ ...article, sourceSection: currentSection }));
                    allRecommendations.push(...filtered);
                }
            } catch (error) {
                console.error(`Error fetching from current section ${currentSection}:`, error);
            }
        }

        // Récupérer des articles des sections apparentées
        const remainingLimit = limit - allRecommendations.length;
        if (remainingLimit > 0 && relatedSections.length > 0) {
            const articlesPerSection = Math.ceil(remainingLimit / relatedSections.length);

            for (const section of relatedSections) {
                const endpoint = SECTION_ENDPOINTS[section];
                if (endpoint) {
                    try {
                        const sectionUrl = `${apiUrl}${endpoint}&limit=${articlesPerSection}`;
                        const response = await fetch(sectionUrl);
                        if (response.ok) {
                            const articles = await response.json();
                            const filtered = articles
                                .filter(article => article.id !== parseInt(excludeId))
                                .map(article => ({ ...article, sourceSection: section }));
                            allRecommendations.push(...filtered);
                        }
                    } catch (error) {
                        console.error(`Error fetching from section ${section}:`, error);
                    }
                }
            }
        }

        // Mélanger les articles pour diversifier
        const shuffled = shuffleArray(allRecommendations);
        return shuffled.slice(0, limit);

    } catch (error) {
        console.error('Error getting cross recommendations:', error);
        return [];
    }
};

/**
 * Traite les articles pour l'affichage
 * @param {Array} articles - Articles bruts
 * @param {string} apiUrl - URL de base de l'API
 * @returns {Array} Articles traités
 */
export const processRecommendations = (articles, apiUrl) => {
    return articles.map((item, index) => {
        // Déterminer l'URL d'image
        let imageUrl;
        if (item.image_url) {
            imageUrl = item.image_url.startsWith('http') || item.image_url.startsWith('//')
                ? item.image_url
                : `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`;
        } else {
            imageUrl = `${apiUrl}/api/placeholder/300/400?text=${encodeURIComponent(item.title || 'Article')}&color=4f46e5`;
        }

        // Déterminer l'URL vidéo si elle existe
        let videoUrl = null;
        if (item.video_url) {
            videoUrl = item.video_url.startsWith('http') || item.video_url.startsWith('//')
                ? item.video_url
                : `${apiUrl}${item.video_url.startsWith('/') ? item.video_url : `/${item.video_url}`}`;
        }

        // Déterminer le lien vers l'article en fonction de la section source
        const linkMapping = {
            'buzz': `/buzz/${item.id}`,
            'afrotcham': `/afrotcham/${item.id}`,
            'rap': `/rap/${item.id}`,
            'sport': `/sport/${item.id}`,
            'cinema': `/cinema/${item.id}`,
            'comedy': `/comedy/${item.id}`,
            'stories': `/stories/${item.id}`,
            'actualite': `/alauneactual/${item.id}`,
            'eventactual': `/eventactual/${item.id}`,
            'alauneactual': `/alauneactual/${item.id}`,
            'sciences': `/tech/${item.id}`,
            'tech': `/tech/${item.id}`,
            'decouverte': `/decouverte/${item.id}`,
            'mostread': `/mostread/${item.id}`
        };

        const link = linkMapping[item.sourceSection] || `/articles/${item.id}`;

        return {
            id: item.id,
            title: item.title || 'Titre non disponible',
            description: item.description || 'Description non disponible',
            image: imageUrl,
            video_url: videoUrl,
            category: item.category?.name || getSectionDisplayName(item.sourceSection),
            section: item.sourceSection,
            link: link,
            date: new Date(item.created_at || Date.now()).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            uniqueKey: `cross-rec-${item.id}-${item.sourceSection}-${index}`,
            isCrossRecommendation: true
        };
    });
};

/**
 * Obtient le nom d'affichage pour une section
 * @param {string} section - Nom de la section
 * @returns {string} Nom d'affichage
 */
export const getSectionDisplayName = (section) => {
    const displayNames = {
        'buzz': 'Buzz',
        'afrotcham': 'AfroTcham',
        'rap': 'Rap',
        'sport': 'Sport',
        'cinema': 'Cinéma',
        'comedy': 'Comédie',
        'stories': 'Stories',
        'actualite': 'Actualité',
        'eventactual': 'Événement',
        'alauneactual': 'À la Une',
        'sciences': 'Sciences',
        'tech': 'Tech',
        'decouverte': 'Découverte',
        'mostread': 'Plus Lu'
    };
    return displayNames[section] || 'Général';
};

/**
 * Mélange un tableau de manière aléatoire
 * @param {Array} array - Tableau à mélanger
 * @returns {Array} Tableau mélangé
 */
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Fonction utilitaire pour récupérer des recommandations avec fallback
 * @param {string} currentSection - Section actuelle
 * @param {string|number} excludeId - ID à exclure
 * @param {string} apiUrl - URL de l'API
 * @param {number} limit - Limite d'articles
 * @returns {Promise<Array>} Articles recommandés traités
 */
export const getSmartRecommendations = async (currentSection, excludeId, apiUrl, limit = 6) => {
    try {
        // Essayer d'abord les recommandations croisées
        const crossRecs = await getCrossRecommendations(currentSection, excludeId, apiUrl, limit);
        const processed = processRecommendations(crossRecs, apiUrl);

        // Si on n'a pas assez d'articles, compléter avec des articles généraux
        if (processed.length < limit) {
            const remainingLimit = limit - processed.length;
            try {
                const fallbackResponse = await fetch(`${apiUrl}/api/articles/?status=published&limit=${remainingLimit}`);
                if (fallbackResponse.ok) {
                    const fallbackArticles = await fallbackResponse.json();
                    const fallbackFiltered = fallbackArticles
                        .filter(article => article.id !== parseInt(excludeId))
                        .map(article => ({ ...article, sourceSection: 'general' }));
                    const fallbackProcessed = processRecommendations(fallbackFiltered, apiUrl);
                    processed.push(...fallbackProcessed);
                }
            } catch (error) {
                console.error('Error fetching fallback recommendations:', error);
            }
        }

        return processed.slice(0, limit);
    } catch (error) {
        console.error('Error getting smart recommendations:', error);
        return [];
    }
}; 