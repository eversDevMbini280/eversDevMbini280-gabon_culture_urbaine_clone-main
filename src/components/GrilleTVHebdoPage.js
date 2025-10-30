'use client'
import React, { useState } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Download, 
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Clock,
  Star,
  PlayCircle // Changed from Play to PlayCircle
} from 'lucide-react';

const GrilleTVHebdoPage = () => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Day headers for the week grid
  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  // Time slots for the schedule
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
    '20:00', '21:00', '22:00', '23:00', '00:00', '01:00'
  ];
  
  // Categories for filter
  const categories = [
    { id: 'all', label: 'Tout' },
    { id: 'actualités', label: 'Actualités' },
    { id: 'culture', label: 'Culture' },
    { id: 'musique', label: 'Musique' },
    { id: 'mode', label: 'Mode' },
    { id: 'sports', label: 'Sports' },
    { id: 'jeunesse', label: 'Jeunesse' },
    { id: 'divertissement', label: 'Divertissement' }
  ];
  
  // Current week and navigation
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  
  // Get the current week's dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = currentDay === 0 ? 6 : currentDay - 1; // Adjust to start from Monday
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff + (currentWeekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push({
        date: date,
        dayName: weekDays[i],
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('fr-FR', { month: 'short' })
      });
    }
    
    return weekDates;
  };
  
  const weekDates = getCurrentWeekDates();
  
  // Get week range string (e.g., "17 - 23 Mars 2025")
  const getWeekRangeString = () => {
    const startDate = weekDates[0].date;
    const endDate = weekDates[6].date;
    
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const month = endDate.toLocaleDateString('fr-FR', { month: 'long' });
    const year = endDate.getFullYear();
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDay} - ${endDay} ${month} ${year}`;
    } else {
      const startMonth = startDate.toLocaleDateString('fr-FR', { month: 'long' });
      return `${startDay} ${startMonth} - ${endDay} ${month} ${year}`;
    }
  };
  
  return (
    <motion.main 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />
      
      {/* Hero Section */}
      <motion.div 
        className="relative bg-blue-600 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <motion.div 
            className="flex items-center gap-3 mb-4"
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
              <Calendar className="w-8 h-8 text-blue-600" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">Grille TV Hebdomadaire</h1>
              <p className="text-blue-100 text-lg">{getWeekRangeString()}</p>
            </div>
          </motion.div>
        </div>
        <motion.div 
          className="absolute inset-0 opacity-30"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.2 }}
        >
          <img 
            src="/api/placeholder/1920/600" 
            alt="GCUTV Programme" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>
      
      {/* Controls */}
      <div className="sticky top-0 bg-white shadow-md z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="font-medium text-gray-900">
                {getWeekRangeString()}
              </span>
              
              <button 
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                disabled={currentWeekOffset >= 4} // Limit future weeks
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setCurrentWeekOffset(0)}
                className={`ml-2 px-3 py-1 rounded-md text-sm ${
                  currentWeekOffset === 0 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semaine actuelle
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <Filter className="text-gray-400 flex-shrink-0 w-5 h-5" />
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                    categoryFilter === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/grille-tv"
                className="px-3 py-1 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
              >
                Vue journalière
              </Link>
              
              <Link
                href="/grille-tv/pdf"
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                target="_blank"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Weekly Schedule */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="bg-white rounded-xl overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                {/* Header */}
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 border-b border-r border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Heure
                    </th>
                    {weekDates.map((day, index) => (
                      <th 
                        key={index} 
                        className="p-3 border-b border-r border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]"
                      >
                        <div className="flex flex-col items-center">
                          <span>{day.dayName}</span>
                          <span className="flex items-baseline mt-1">
                            <span className="text-lg font-bold">{day.dayNumber}</span>
                            <span className="text-xs ml-1">{day.monthName}</span>
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                
                {/* Body - Time Slots */}
                <tbody>
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={time} className={timeIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 border-b border-r border-gray-200 text-center text-sm font-medium text-gray-900">
                        {time}
                      </td>
                      {weekDates.map((day, dayIndex) => (
                        <td 
                          key={`${time}-${dayIndex}`} 
                          className="p-1 border-b border-r border-gray-200 text-sm text-gray-700 h-16"
                        >
                          {/* Placeholder for schedule items */}
                          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                            {/* In a real implementation, we would map schedule items here */}
                            {Math.random() > 0.7 && (
                              <div className="bg-blue-100 text-blue-800 p-1 text-xs w-full rounded">
                                Programme
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          
          {/* Note */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>Cette vue est une représentation simplifiée de la grille des programmes.</p>
            <p>Pour plus de détails sur un programme spécifique, veuillez consulter la vue journalière.</p>
          </div>
          
          {/* Download Link */}
          <div className="mt-8 text-center">
            <Link
              href="/grille-tv/pdf"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              target="_blank"
            >
              <Download className="w-5 h-5 mr-2" />
              Télécharger la grille complète (PDF)
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </motion.main>
  );
};

export default GrilleTVHebdoPage;