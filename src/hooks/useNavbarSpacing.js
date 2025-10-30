import { useEffect } from 'react';

/**
 * Hook pour gérer automatiquement l'espacement avec la navbar fixe
 * Ajoute les classes CSS appropriées au body pour éviter les chevauchements
 */
export const useNavbarSpacing = () => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Ajouter la classe pour les pages avec navbar
            document.body.classList.add('page-with-navbar');

            // Function pour ajuster l'espacement selon le scroll
            const handleNavbarVisibility = () => {
                const navbar = document.querySelector('nav');
                if (navbar) {
                    const navbarRect = navbar.getBoundingClientRect();
                    const isNavbarVisible = navbarRect.top >= 0;

                    if (isNavbarVisible) {
                        document.body.classList.remove('navbar-hidden');
                    } else {
                        document.body.classList.add('navbar-hidden');
                    }
                }
            };

            // Observer pour détecter les changements de position de la navbar
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.target.tagName === 'NAV') {
                            if (entry.isIntersecting) {
                                document.body.classList.remove('navbar-hidden');
                            } else {
                                document.body.classList.add('navbar-hidden');
                            }
                        }
                    });
                },
                { rootMargin: '0px 0px -90% 0px' }
            );

            // Observer la navbar
            const navbar = document.querySelector('nav');
            if (navbar) {
                observer.observe(navbar);
            }

            // Cleanup
            return () => {
                observer.disconnect();
                if (typeof window !== 'undefined') {
                    document.body.classList.remove('page-with-navbar', 'navbar-hidden');
                }
            };
        }
    }, []);

    // Retourner des classes utilitaires
    return {
        containerClass: 'pt-4 md:pt-8', // Padding top pour les conteneurs principaux
        headerClass: 'pt-8 md:pt-12',   // Padding top pour les headers de page
        contentClass: 'mt-4 md:mt-6',   // Margin top pour le contenu
    };
};

export default useNavbarSpacing; 