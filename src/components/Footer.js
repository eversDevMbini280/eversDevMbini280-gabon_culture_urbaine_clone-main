'use client'
import React from 'react';
import { Facebook, Instagram, Youtube, Smartphone } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const mainLinks = [
    { title: 'Actualités', href: '/actualite' },
    { title: 'Culture Urbaine', href: '/culture-urbaine' },
    { title: 'Événements', href: '/evenements' },
    { title: 'Émissions', href: '/emissions' },
    { title: 'Replay', href: '/replay' }
  ];

  const sections = [
    {
      title: 'Notre Chaîne',
      links: [
        { name: 'À propos', href: '/a-propos' },
        { name: 'Présentateurs', href: '/presentateurs' },
        { name: 'Grille TV', href: '/grille-tv' }
      ]
    },
    {
      title: 'Services',
      links: [
        { name: 'Publicité', href: '/publicite' },
        { name: 'Boutique', href: '/boutique' }
      ]
    },
  ];

  return (
    <footer className="bg-[#151f3f] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer - Compact Layout */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-6">
          {/* Brand Section */}
          <div className="flex-shrink-0 md:max-w-xs">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-blue-400">GCU<span className="text-green-400">WebTV</span></span>
            </Link>
            <p className="text-gray-300 text-sm mt-2">
              Votre destination pour le meilleur de la culture urbaine gabonaise.
            </p>
          </div>

          {/* Quick Links Section - Horizontal Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:flex md:flex-row md:gap-10 flex-grow justify-between">
            {sections.map((section) => (
              <div key={section.title} className="flex-shrink-0">
                <h3 className="font-semibold text-gray-200 mb-2 text-sm">{section.title}</h3>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-gray-300 hover:text-blue-300 transition-colors text-xs">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Media Icons - Centered on mobile */}
          <div className="flex flex-col items-center md:items-end text-center">
            <h3 className="font-semibold text-gray-200 mb-2 text-sm">Suivez-nous</h3>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/share/1A9qryHyGc/?mibextid=wwXIfr" className="bg-[#3e874a] p-2 rounded-full hover:opacity-80 transition-opacity">
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://www.tiktok.com/@gaboncultureurbaine?_r=1&_d=e01mc2lkk770mc&sec_uid=MS4wLjABAAAAY_lYAKv903Oz10-XCSdtDeADE7eH34NaFzcO0jUHJUJtcxwQUvO8Kz78hjhi8in6&share_author_id=6962647320127177734&sharer_language=fr&source=h5_m&u_code=digb5lmf0lfe23&ug_btm=b8727,b0&social_share_type=4&utm_source=copy&sec_user_id=MS4wLjABAAAAY_lYAKv903Oz10-XCSdtDeADE7eH34NaFzcO0jUHJUJtcxwQUvO8Kz78hjhi8in6&tt_from=copy&utm_medium=ios&utm_campaign=client_share&enable_checksum=1&user_id=6962647320127177734&share_link_id=25292939-B776-4FBD-AC86-D29F60CB92BD&share_app_id=1233" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#3e874a] text-white p-2 rounded-full hover:opacity-80 transition-opacity inline-flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor" className="w-5 h-5">
                  <path d="M34.1 10.9c-2.3-1.2-3.5-3.3-3.8-5.6h-5.9v26.5c0 2.6-2.1 4.8-4.8 4.8-2.6 0-4.8-2.1-4.8-4.8 0-2.6 2.1-4.8 4.8-4.8.6 0 1.2.1 1.7.3v-6c-.6-.1-1.2-.2-1.7-.2-6 0-10.9 4.9-10.9 10.9S13.5 42 19.5 42s10.9-4.9 10.9-10.9V17.4c1.7 1.3 3.8 2.1 6.1 2.1v-6c-1.1 0-2.2-.3-3.2-.8z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/gabon_culture_urbaine?igsh=MWxmbm83cWsyNmhsOA%3D%3D&utm_source=qr" className="bg-[#3e874a] p-2 rounded-full hover:opacity-80 transition-opacity">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/channel/UCX79Jv7MmK-z9rEsKkABDQw" className="bg-[#3e874a] p-2 rounded-full hover:opacity-80 transition-opacity">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <div className="text-gray-400">
              © {new Date().getFullYear()} GCU WebTV. Tous droits réservés / Powered by Emane-Tech
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/conditions-generales" className="text-gray-400 hover:text-blue-300 transition-colors">
                Conditions générales
              </Link>
              <Link href="/confidentialite" className="text-gray-400 hover:text-blue-300 transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/mentions-legales" className="text-gray-400 hover:text-blue-300 transition-colors">
                Mentions légales
              </Link>
            </div>
            <div className="flex flex-col items-center sm:items-end text-gray-400 text-xs mt-2 sm:mt-0">
              <a href="mailto:recrutement@gaboncultureurbaine.com" className="hover:text-blue-300 transition-colors">
                recrutement@gaboncultureurbaine.com
              </a>
              <a href="mailto:contact@gaboncultureurbaine.com" className="hover:text-blue-300 transition-colors">
                contact@gaboncultureurbaine.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
