'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
    // In a real implementation, this would initiate a PDF download
    // For this example, we'll just redirect back to the schedule page
    
    // Display an alert informing the user
    alert('Le téléchargement du PDF de la grille TV commencera automatiquement...');
    
    // Redirect back to the schedule page
    setTimeout(() => {
      router.push('/grille-tv');
    }, 2000);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="w-20 h-20 bg-blue-100 flex items-center justify-center rounded-full mx-auto mb-6">
          <span className="text-blue-600 text-4xl">↓</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Téléchargement en cours...</h1>
        <p className="text-gray-600 mb-6">
          Votre téléchargement du PDF de la grille TV va commencer automatiquement.
          Si le téléchargement ne démarre pas, veuillez réessayer ou contactez-nous.
        </p>
        <button
          onClick={() => router.push('/grille-tv')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retourner à la grille TV
        </button>
      </div>
    </div>
  );
}