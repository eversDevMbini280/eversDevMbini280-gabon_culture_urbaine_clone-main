'use client';
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  FilePlus,
  Upload,
  MapPin,
  Clock,
  Users,
  Filter,
  Star,
  StarOff
} from 'lucide-react';

const Articles2 = ({ apiUrl = 'https://gabon-culture-urbaine-1.onrender.com' }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    location: '',
    venue: '',
    date: '',
    end_date: '',
    time: '',
    contact: '',
    attendees: '',
    status: 'draft',
    is_featured: false,
    tickets_available: false,
    ticket_price: '',
    ticket_url: '',
    description: '',
    organizer_id: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);

  const baseCategories = [
    { id: 'all', name: 'Tous' },
    { id: 26, name: 'Concert' },
    { id: 27, name: 'Festival' },
    { id: 28, name: 'Exposition' },
    { id: 29, name: 'Conférence' },
    { id: 30, name: 'Atelier' },
    { id: 31, name: 'Compétition' }
  ];

  const filters = [
    { id: 'all', name: 'Tous' },
    { id: 'featured', name: 'À la une' },
    { id: 'upcoming', name: 'À venir' },
    { id: 'past', name: 'Passés' }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/auth/users`, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setErrorMessage('Échec de la récupération des utilisateurs. Veuillez réessayer.');
      }
    };
  
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, apiUrl]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchEvents(token);
    }
  }, [apiUrl]);

  const fetchEvents = async (token) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/events/`, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setErrorMessage('Échec de la récupération des événements. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: loginData.username,
          password: loginData.password
        })
      });
      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setIsAuthenticated(true);
      fetchEvents(data.access_token);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      event.category?.name?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      event.location?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      event.status?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      event.date?.includes(searchQuery || '');
    
    const matchesCategory = activeCategory === 'all' || event.category?.id === parseInt(activeCategory);
    
    let matchesFilter = true;
    if (activeFilter === 'featured') {
      matchesFilter = event.is_featured;
    } else if (activeFilter === 'upcoming') {
      const eventDate = new Date(event.date);
      const today = new Date();
      matchesFilter = eventDate >= today;
    } else if (activeFilter === 'past') {
      const eventDate = new Date(event.date);
      const today = new Date();
      matchesFilter = eventDate < today;
    }
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleImageError = (e, placeholderText, size = { width: 300, height: 200 }, color = '4f46e5') => {
    const width = size.width;
    const height = size.height;
    const placeholderUrl = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText)}&color=${color}`;
    e.target.src = placeholderUrl;
  };

  const renderStatusBadge = (status) => {
    let colorClass = '';
    switch(status) {
      case 'published':
        colorClass = 'bg-green-100 text-green-800 border-green-200';
        break;
      case 'draft':
        colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
        break;
      case 'processing':
        colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        break;
      default:
        colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDateRange = (startDate, endDate) => {
    if (!endDate || startDate === endDate) {
      return new Date(startDate).toLocaleDateString('fr-FR');
    }
    const start = new Date(startDate).toLocaleDateString('fr-FR');
    const end = new Date(endDate).toLocaleDateString('fr-FR');
    return `${start} - ${end}`;
  };

  const toggleFeatured = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/events/${id}/toggle-featured`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to toggle featured status');
      const updatedEvent = await response.json();
      setEvents(events.map(event => event.id === id ? updatedEvent : event));
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setErrorMessage('Échec de la mise à jour du statut "À la une". Veuillez réessayer.');
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/events/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete event');
      setEvents(events.filter(event => event.id !== id));
      setErrorMessage('Événement supprimé avec succès.');
    } catch (error) {
      console.error('Error deleting event:', error);
      setErrorMessage('Échec de la suppression de l\'événement. Veuillez réessayer.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    } else {
      setFormData(prev => ({ ...prev, image: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!formData.title.trim() || !formData.category_id || !formData.location.trim() || 
          !formData.venue.trim() || !formData.date || !formData.time.trim() || 
          !formData.description.trim() || !formData.organizer_id || !formData.contact.trim()) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }
      
      const organizerId = parseInt(formData.organizer_id);
      const categoryId = parseInt(formData.category_id);
      if (isNaN(organizerId) || isNaN(categoryId)) {
        throw new Error('Les identifiants de l\'organisateur et de la catégorie doivent être valides');
      }
      
      const formattedDate = `${formData.date}T00:00:00Z`;
      const formattedEndDate = formData.end_date && formData.end_date.trim() !== '' ? `${formData.end_date}T00:00:00Z` : null;
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category_id', categoryId.toString());
      formDataToSend.append('location', formData.location.trim());
      formDataToSend.append('venue', formData.venue.trim());
      formDataToSend.append('date', formattedDate);
      if (formattedEndDate) {
        formDataToSend.append('end_date', formattedEndDate);
      }
      formDataToSend.append('time', formData.time.trim());
      formDataToSend.append('status', formData.status || 'draft');
      formDataToSend.append('is_featured', formData.is_featured.toString());
      formDataToSend.append('attendees', (parseInt(formData.attendees) || 0).toString());
      formDataToSend.append('contact', formData.contact.trim());
      formDataToSend.append('tickets_available', formData.tickets_available.toString());
      if (formData.ticket_price) {
        formDataToSend.append('ticket_price', formData.ticket_price);
      }
      if (formData.ticket_url) {
        formDataToSend.append('ticket_url', formData.ticket_url);
      }
      formDataToSend.append('organizer_id', organizerId.toString());
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('Submitting FormData:');
      for (let pair of formDataToSend.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await fetch(`${apiUrl}/events/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('; ');
          throw new Error(errorMessages || 'Échec de la création de l\'événement');
        }
        throw new Error(errorData.detail || 'Échec de la création de l\'événement');
      }

      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      
      setFormData({
        title: '',
        category_id: '',
        location: '',
        venue: '',
        date: '',
        end_date: '',
        time: '',
        contact: '',
        attendees: '',
        status: 'draft',
        is_featured: false,
        tickets_available: false,
        ticket_price: '',
        ticket_url: '',
        description: '',
        organizer_id: '',
        image: null
      });
    } catch (error) {
      console.error('Error creating event:', error);
      setErrorMessage(error.message || 'Échec de la création de l\'événement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                placeholder="Username"
                required
                aria-label="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                placeholder="Password"
                required
                aria-label="Password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Gestion des Événements
          </h3>
          <p className="text-sm text-gray-500">
            Gérez tous les événements, concerts, festivals et autres activités culturelles
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {}}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un événement
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un événement..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Rechercher un événement"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  activeFilter === filter.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
          <div>
            <select
              className="w-full sm:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              aria-label="Filtrer par catégorie"
            >
              {baseCategories.map((category) => (
                <option key={category.id} value={category.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Chargement des événements...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="p-4 space-y-4">
            {filteredEvents.map((event) => (
             <div key={event.id} className="border rounded-lg p-4 flex items-start space-x-4 hover:bg-gray-50">
             <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center border">
               <Calendar className="text-blue-500 w-5 h-5" />
             </div>
             <div className="flex-1">
               <div className="flex justify-between items-start">
                 <div>
                   <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                   <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                 </div>
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                   {baseCategories.find(c => c.id === event.category?.id)?.name || event.category?.name}
                 </span>
               </div>
               <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                 <div className="flex items-center">
                   <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                   {event.venue}, {event.location}
                 </div>
                 <div className="flex items-center">
                   <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                   {formatDateRange(event.date, event.end_date)}
                 </div>
                 <div className="flex items-center">
                   <Clock className="w-4 h-4 mr-1 text-gray-400" />
                   {event.time}
                 </div>
                 <button
                   onClick={() => toggleFeatured(event.id)}
                   className="text-yellow-500 hover:text-yellow-600"
                 >
                   {event.is_featured ? <Star /> : <StarOff />}
                 </button>
                 <button
                   onClick={() => deleteEvent(event.id)}
                   className="text-red-500 hover:text-red-600"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
               </div>
             </div>
           </div>
            ))}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <FilePlus className="w-16 h-16 text-gray-300 mb-4" />
            <p className="mb-2">Aucun événement trouvé</p>
            <p className="text-sm text-gray-400">
              {searchQuery || activeCategory !== 'all' || activeFilter !== 'all'
                ? `Aucun résultat pour la recherche actuelle. Essayez de modifier vos filtres.`
                : `Ajoutez des événements en cliquant sur le bouton "Ajouter un événement"`}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Soumettre un nouvel événement</h3>
          <p className="text-sm text-gray-500 mt-1">Remplissez le formulaire ci-dessous pour ajouter un nouvel événement</p>
        </div>
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
              {errorMessage}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre de l'événement *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                  placeholder="Festival des Cultures Urbaines de Libreville"
                  required
                  aria-label="Titre de l'événement"
                />
              </div>
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                  Catégorie *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  required
                  aria-label="Catégorie"
                >
                  <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une catégorie</option>
                  {baseCategories.filter(c => c.id !== 'all').map((category) => (
                    <option key={category.id} value={category.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="organizer_id" className="block text-sm font-medium text-gray-700">
                  Organisateur *
                </label>
                <select
                  id="organizer_id"
                  name="organizer_id"
                  value={formData.organizer_id}
                  onChange={(e) => setFormData({ ...formData, organizer_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  required
                  aria-label="Organisateur"
                >
                  <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner un organisateur</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ville *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                  placeholder="Libreville"
                  required
                  aria-label="Ville"
                />
              </div>
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                  Lieu précis *
                </label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                  placeholder="Place de l'Indépendance"
                  required
                  aria-label="Lieu précis"
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date de début *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  required
                  aria-label="Date de début"
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  Date de fin (si applicable)
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  aria-label="Date de fin"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Horaires *
                </label>
                <input
                  type="text"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                  placeholder="14:00 - 00:00"
                  required
                  aria-label="Horaires"
                />
              </div>
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                  Contact *
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                  placeholder="+241 01 23 45 67"
                  required
                  aria-label="Contact"
                />
              </div>
              <div>
                <label htmlFor="attendees" className="block text-sm font-medium text-gray-700">
                  Nombre de participants attendus
                </label>
                <input
                  type="number"
                  id="attendees"
                  name="attendees"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                  placeholder="1000"
                  aria-label="Nombre de participants attendus"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Statut *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  required
                  aria-label="Statut"
                >
                  <option value="draft" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Brouillon</option>
                  <option value="published" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Publié</option>
                  <option value="processing" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">En traitement</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-label="Mettre à la une"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                  Mettre à la une
                </label>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Informations de billetterie</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tickets_available"
                    name="tickets_available"
                    checked={formData.tickets_available}
                    onChange={(e) => setFormData({ ...formData, tickets_available: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Billets disponibles"
                  />
                  <label htmlFor="tickets_available" className="ml-2 block text-sm text-gray-700">
                    Billets disponibles
                  </label>
                </div>
                <div>
                  <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700">
                    Prix des billets
                  </label>
                  <input
                    type="text"
                    id="ticket_price"
                    name="ticket_price"
                    value={formData.ticket_price}
                    onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                    placeholder="À partir de 10.000 XAF"
                    aria-label="Prix des billets"
                  />
                </div>
                <div>
                  <label htmlFor="ticket_url" className="block text-sm font-medium text-gray-700">
                    URL de la billetterie
                  </label>
                  <input
                    type="url"
                    id="ticket_url"
                    name="ticket_url"
                    value={formData.ticket_url}
                    onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                    placeholder="https://billetterie.gcutv.com"
                    aria-label="URL de la billetterie"
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description de l'événement *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600 resize-vertical"
                placeholder="Description détaillée de l'événement..."
                required
                aria-label="Description de l'événement"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">
                Image de l'événement
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Télécharger une image</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleFileChange}
                        accept="image/png,image/jpeg,image/gif"
                        aria-label="Télécharger une image"
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF jusqu'à 10Mo
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Soumission...' : 'Soumettre l\'événement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Articles2;




// 'use client';
// import React, { useState, useEffect } from 'react';
// import { 
//   Calendar, 
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   RefreshCw,
//   FilePlus,
//   Upload,
//   MapPin,
//   Clock,
//   Users,
//   Filter,
//   Star,
//   StarOff
// } from 'lucide-react';
// import { Editor } from '@tinymce/tinymce-react';

// const Articles2 = ({ apiUrl = 'https://gabon-culture-urbaine-1.onrender.com' }) => {
//   const [events, setEvents] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [activeCategory, setActiveCategory] = useState('all');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loginData, setLoginData] = useState({ username: '', password: '' });
//   const [formData, setFormData] = useState({
//     title: '',
//     category_id: '',
//     location: '',
//     venue: '',
//     date: '',
//     end_date: '',
//     time: '',
//     contact: '',
//     attendees: '',
//     status: 'draft',
//     is_featured: false,
//     tickets_available: false,
//     ticket_price: '',
//     ticket_url: '',
//     description: '',
//     organizer_id: '',
//     image: null
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [users, setUsers] = useState([]);
//   const [imagePreview, setImagePreview] = useState(null);

//   const baseCategories = [
//     { id: 'all', name: 'Tous' },
//     { id: 26, name: 'Concert' },
//     { id: 27, name: 'Festival' },
//     { id: 28, name: 'Exposition' },
//     { id: 29, name: 'Conférence' },
//     { id: 30, name: 'Atelier' },
//     { id: 31, name: 'Compétition' }
//   ];

//   const filters = [
//     { id: 'all', name: 'Tous' },
//     { id: 'featured', name: 'À la une' },
//     { id: 'upcoming', name: 'À venir' },
//     { id: 'past', name: 'Passés' }
//   ];

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`${apiUrl}/api/auth/users`, {
//           headers: { 
//             Authorization: `Bearer ${token}`
//           }
//         });
//         if (!response.ok) throw new Error('Failed to fetch users');
//         const data = await response.json();
//         setUsers(data);
//       } catch (error) {
//         console.error('Error fetching users:', error);
//         setErrorMessage('Échec de la récupération des utilisateurs. Veuillez réessayer.');
//       }
//     };
  
//     if (isAuthenticated) {
//       fetchUsers();
//     }
//   }, [isAuthenticated, apiUrl]);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setIsAuthenticated(true);
//       fetchEvents(token);
//     }
//   }, [apiUrl]);

//   const fetchEvents = async (token) => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${apiUrl}/events/`, {
//         headers: { 
//           Authorization: `Bearer ${token}`
//         }
//       });
//       if (!response.ok) throw new Error('Failed to fetch events');
//       const data = await response.json();
//       setEvents(data);
//     } catch (error) {
//       console.error('Error fetching events:', error);
//       setErrorMessage('Échec de la récupération des événements. Veuillez réessayer.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${apiUrl}/api/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//         body: new URLSearchParams({
//           username: loginData.username,
//           password: loginData.password
//         })
//       });
//       if (!response.ok) throw new Error('Login failed');
//       const data = await response.json();
//       localStorage.setItem('token', data.access_token);
//       setIsAuthenticated(true);
//       fetchEvents(data.access_token);
//     } catch (error) {
//       console.error('Error logging in:', error);
//       alert('Login failed. Please check your credentials.');
//     }
//   };

//   const filteredEvents = events.filter(event => {
//     const matchesSearch = event.title?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
//       event.category?.name?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
//       event.location?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
//       event.status?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
//       event.date?.includes(searchQuery || '');
    
//     const matchesCategory = activeCategory === 'all' || event.category?.id === parseInt(activeCategory);
    
//     let matchesFilter = true;
//     if (activeFilter === 'featured') {
//       matchesFilter = event.is_featured;
//     } else if (activeFilter === 'upcoming') {
//       const eventDate = new Date(event.date);
//       const today = new Date();
//       matchesFilter = eventDate >= today;
//     } else if (activeFilter === 'past') {
//       const eventDate = new Date(event.date);
//       const today = new Date();
//       matchesFilter = eventDate < today;
//     }
    
//     return matchesSearch && matchesCategory && matchesFilter;
//   });

//   const handleImageError = (e, placeholderText, size = { width: 300, height: 200 }, color = '4f46e5') => {
//     const width = size.width;
//     const height = size.height;
//     const placeholderUrl = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText)}&color=${color}`;
//     e.target.src = placeholderUrl;
//   };

//   const renderStatusBadge = (status) => {
//     let colorClass = '';
//     switch(status) {
//       case 'published':
//         colorClass = 'bg-green-100 text-green-800 border-green-200';
//         break;
//       case 'draft':
//         colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
//         break;
//       case 'processing':
//         colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
//         break;
//       default:
//         colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
//     }
//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   const formatDateRange = (startDate, endDate) => {
//     if (!endDate || startDate === endDate) {
//       return new Date(startDate).toLocaleDateString('fr-FR');
//     }
//     const start = new Date(startDate).toLocaleDateString('fr-FR');
//     const end = new Date(endDate).toLocaleDateString('fr-FR');
//     return `${start} - ${end}`;
//   };

//   const toggleFeatured = async (id) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${apiUrl}/events/${id}/toggle-featured`, {
//         method: 'PATCH',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         }
//       });
//       if (!response.ok) throw new Error('Failed to toggle featured status');
//       const updatedEvent = await response.json();
//       setEvents(events.map(event => event.id === id ? updatedEvent : event));
//     } catch (error) {
//       console.error('Error toggling featured status:', error);
//       setErrorMessage('Échec de la mise à jour du statut "À la une". Veuillez réessayer.');
//     }
//   };

//   const deleteEvent = async (id) => {
//     if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
  
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${apiUrl}/events/${id}`, {
//         method: 'DELETE',
//         headers: { 
//           'Authorization': `Bearer ${token}`
//         }
//       });
//       if (!response.ok) throw new Error('Failed to delete event');
//       setEvents(events.filter(event => event.id !== id));
//       setErrorMessage('Événement supprimé avec succès.');
//     } catch (error) {
//       console.error('Error deleting event:', error);
//       setErrorMessage('Échec de la suppression de l\'événement. Veuillez réessayer.');
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
//       if (!allowedImageTypes.includes(file.type)) {
//         alert('Only JPG, PNG, or GIF images are supported');
//         e.target.value = '';
//         return;
//       }
//       const previewUrl = URL.createObjectURL(file);
//       setFormData(prev => ({ ...prev, image: file }));
//       setImagePreview(previewUrl);
//     } else {
//       setFormData(prev => ({ ...prev, image: null }));
//       setImagePreview(null);
//     }
//   };

//   const handleDescriptionChange = (content) => {
//     setFormData(prev => ({
//       ...prev,
//       description: content
//     }));
//   };

//   const filePickerCallback = (callback, value, meta) => {
//     const input = document.createElement('input');
//     input.setAttribute('type', 'file');
//     input.setAttribute('accept', 'image/jpeg,image/png,image/gif');
    
//     input.onchange = () => {
//       const file = input.files[0];
//       if (!file) {
//         console.warn('No file selected');
//         return;
//       }

//       const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
//       if (!allowedImageTypes.includes(file.type)) {
//         alert('Only JPG, PNG, or GIF images are supported');
//         return;
//       }

//       const previewUrl = URL.createObjectURL(file);
//       setFormData(prev => ({
//         ...prev,
//         image: file
//       }));
//       setImagePreview(previewUrl);

//       callback(previewUrl, { alt: file.name });
//     };

//     input.click();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setErrorMessage('');
    
//     try {
//       const token = localStorage.getItem('token');
      
//       if (!formData.title.trim() || !formData.category_id || !formData.location.trim() || 
//           !formData.venue.trim() || !formData.date || !formData.time.trim() || 
//           !formData.description.trim() || !formData.organizer_id || !formData.contact.trim()) {
//         throw new Error('Veuillez remplir tous les champs obligatoires');
//       }
      
//       const organizerId = parseInt(formData.organizer_id);
//       const categoryId = parseInt(formData.category_id);
//       if (isNaN(organizerId) || isNaN(categoryId)) {
//         throw new Error('Les identifiants de l\'organisateur et de la catégorie doivent être valides');
//       }
      
//       const formattedDate = `${formData.date}T00:00:00Z`;
//       const formattedEndDate = formData.end_date && formData.end_date.trim() !== '' ? `${formData.end_date}T00:00:00Z` : null;
      
//       const formDataToSend = new FormData();
//       formDataToSend.append('title', formData.title.trim());
//       formDataToSend.append('description', formData.description.trim());
//       formDataToSend.append('category_id', categoryId.toString());
//       formDataToSend.append('location', formData.location.trim());
//       formDataToSend.append('venue', formData.venue.trim());
//       formDataToSend.append('date', formattedDate);
//       if (formattedEndDate) {
//         formDataToSend.append('end_date', formattedEndDate);
//       }
//       formDataToSend.append('time', formData.time.trim());
//       formDataToSend.append('status', formData.status || 'draft');
//       formDataToSend.append('is_featured', formData.is_featured.toString());
//       formDataToSend.append('attendees', (parseInt(formData.attendees) || 0).toString());
//       formDataToSend.append('contact', formData.contact.trim());
//       formDataToSend.append('tickets_available', formData.tickets_available.toString());
//       if (formData.ticket_price) {
//         formDataToSend.append('ticket_price', formData.ticket_price);
//       }
//       if (formData.ticket_url) {
//         formDataToSend.append('ticket_url', formData.ticket_url);
//       }
//       formDataToSend.append('organizer_id', organizerId.toString());
//       if (formData.image) {
//         formDataToSend.append('image', formData.image);
//       }

//       console.log('Submitting FormData:');
//       for (let pair of formDataToSend.entries()) {
//         console.log(`${pair[0]}: ${pair[1]}`);
//       }

//       const response = await fetch(`${apiUrl}/events/`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: formDataToSend
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         if (Array.isArray(errorData.detail)) {
//           const errorMessages = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('; ');
//           throw new Error(errorMessages || 'Échec de la création de l\'événement');
//         }
//         throw new Error(errorData.detail || 'Échec de la création de l\'événement');
//       }

//       const newEvent = await response.json();
//       setEvents([...events, newEvent]);
      
//       setFormData({
//         title: '',
//         category_id: '',
//         location: '',
//         venue: '',
//         date: '',
//         end_date: '',
//         time: '',
//         contact: '',
//         attendees: '',
//         status: 'draft',
//         is_featured: false,
//         tickets_available: false,
//         ticket_price: '',
//         ticket_url: '',
//         description: '',
//         organizer_id: '',
//         image: null
//       });
//       setImagePreview(null);
//     } catch (error) {
//       console.error('Error creating event:', error);
//       setErrorMessage(error.message || 'Échec de la création de l\'événement. Veuillez réessayer.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
//           <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 id="username"
//                 value={loginData.username}
//                 onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                 placeholder="Username"
//                 required
//                 aria-label="Username"
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 value={loginData.password}
//                 onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                 placeholder="Password"
//                 required
//                 aria-label="Password"
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Login
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//         <div>
//           <h3 className="text-xl font-bold text-gray-800 mb-2">
//             Gestion des Événements
//           </h3>
//           <p className="text-sm text-gray-500">
//             Gérez tous les événements, concerts, festivals et autres activités culturelles
//           </p>
//         </div>
//         <div className="flex gap-4">
//           <button
//             onClick={() => {}}
//             className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
//           >
//             <Plus className="w-5 h-5 mr-2" />
//             Ajouter un événement
//           </button>
//         </div>
//       </div>
      
//       <div className="bg-white p-4 rounded-lg shadow mb-6">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Rechercher un événement..."
//                 className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 aria-label="Rechercher un événement"
//               />
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {filters.map((filter) => (
//               <button
//                 key={filter.id}
//                 onClick={() => setActiveFilter(filter.id)}
//                 className={`px-3 py-1 text-sm font-medium rounded-full ${
//                   activeFilter === filter.id
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {filter.name}
//               </button>
//             ))}
//           </div>
//           <div>
//             <select
//               className="w-full sm:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
//               value={activeCategory}
//               onChange={(e) => setActiveCategory(e.target.value)}
//               aria-label="Filtrer par catégorie"
//             >
//               {baseCategories.map((category) => (
//                 <option key={category.id} value={category.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>
      
//       <div className="bg-white rounded-lg shadow mb-6 max-h-[400px] overflow-y-auto">
//         {isLoading ? (
//           <div className="p-12 flex flex-col items-center justify-center">
//             <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
//             <p className="text-gray-500">Chargement des événements...</p>
//           </div>
//         ) : filteredEvents.length > 0 ? (
//           <div className="p-4 space-y-4">
//             {filteredEvents.map((event) => (
//              <div key={event.id} className="border rounded-lg p-4 flex items-start space-x-4 hover:bg-gray-50">
//              <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center border">
//                <Calendar className="text-blue-500 w-5 h-5" />
//              </div>
//              <div className="flex-1">
//                <div className="flex justify-between items-start">
//                  <div>
//                    <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
//                    <p className="text-xs text-gray-500 mt-1">{event.description}</p>
//                  </div>
//                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                    {baseCategories.find(c => c.id === event.category?.id)?.name || event.category?.name}
//                  </span>
//                </div>
//                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
//                  <div className="flex items-center">
//                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
//                    {event.venue}, {event.location}
//                  </div>
//                  <div className="flex items-center">
//                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
//                    {formatDateRange(event.date, event.end_date)}
//                  </div>
//                  <div className="flex items-center">
//                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
//                    {event.time}
//                  </div>
//                  <button
//                    onClick={() => toggleFeatured(event.id)}
//                    className="text-yellow-500 hover:text-yellow-600"
//                  >
//                    {event.is_featured ? <Star /> : <StarOff />}
//                  </button>
//                  <button
//                    onClick={() => deleteEvent(event.id)}
//                    className="text-red-500 hover:text-red-600"
//                  >
//                    <Trash2 className="w-5 h-5" />
//                  </button>
//                </div>
//              </div>
//            </div>
//             ))}
//           </div>
//         ) : (
//           <div className="p-12 flex flex-col items-center justify-center text-gray-500">
//             <FilePlus className="w-16 h-16 text-gray-300 mb-4" />
//             <p className="mb-2">Aucun événement trouvé</p>
//             <p className="text-sm text-gray-400">
//               {searchQuery || activeCategory !== 'all' || activeFilter !== 'all'
//                 ? `Aucun résultat pour la recherche actuelle. Essayez de modifier vos filtres.`
//                 : `Ajoutez des événements en cliquant sur le bouton "Ajouter un événement"`}
//             </p>
//           </div>
//         )}
//       </div>
      
//       <div className="bg-white rounded-lg shadow overflow-hidden max-h-screen overflow-y-auto">
//         <div className="p-6 border-b border-gray-200">
//           <h3 className="text-lg font-medium text-gray-800">Soumettre un nouvel événement</h3>
//           <p className="text-sm text-gray-500 mt-1">Remplissez le formulaire ci-dessous pour ajouter un nouvel événement</p>
//         </div>
//         <div className="p-6">
//           {errorMessage && (
//             <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
//               {errorMessage}
//             </div>
//           )}
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//                   Titre de l'événement *
//                 </label>
//                 <input
//                   type="text"
//                   id="title"
//                   name="title"
//                   value={formData.title}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                   placeholder="Festival des Cultures Urbaines de Libreville"
//                   required
//                   aria-label="Titre de l'événement"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
//                   Catégorie *
//                 </label>
//                 <select
//                   id="category_id"
//                   name="category_id"
//                   value={formData.category_id}
//                   onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//                   required
//                   aria-label="Catégorie"
//                 >
//                   <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une catégorie</option>
//                   {baseCategories.filter(c => c.id !== 'all').map((category) => (
//                     <option key={category.id} value={category.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label htmlFor="organizer_id" className="block text-sm font-medium text-gray-700">
//                   Organisateur *
//                 </label>
//                 <select
//                   id="organizer_id"
//                   name="organizer_id"
//                   value={formData.organizer_id}
//                   onChange={(e) => setFormData({ ...formData, organizer_id: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//                   required
//                   aria-label="Organisateur"
//                 >
//                   <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner un organisateur</option>
//                   {users.map((user) => (
//                     <option key={user.id} value={user.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
//                       {user.username}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label htmlFor="location" className="block text-sm font-medium text-gray-700">
//                   Ville *
//                 </label>
//                 <input
//                   type="text"
//                   id="location"
//                   name="location"
//                   value={formData.location}
//                   onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                   placeholder="Libreville"
//                   required
//                   aria-label="Ville"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
//                   Lieu précis *
//                 </label>
//                 <input
//                   type="text"
//                   id="venue"
//                   name="venue"
//                   value={formData.venue}
//                   onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                   placeholder="Place de l'Indépendance"
//                   required
//                   aria-label="Lieu précis"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="date" className="block text-sm font-medium text-gray-700">
//                   Date de début *
//                 </label>
//                 <input
//                   type="date"
//                   id="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//                   required
//                   aria-label="Date de début"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
//                   Date de fin (si applicable)
//                 </label>
//                 <input
//                   type="date"
//                   id="end_date"
//                   name="end_date"
//                   value={formData.end_date}
//                   onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//                   aria-label="Date de fin"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="time" className="block text-sm font-medium text-gray-700">
//                   Horaires *
//                 </label>
//                 <input
//                   type="text"
//                   id="time"
//                   name="time"
//                   value={formData.time}
//                   onChange={(e) => setFormData({ ...formData, time: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                   placeholder="14:00 - 00:00"
//                   required
//                   aria-label="Horaires"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
//                   Contact *
//                 </label>
//                 <input
//                   type="text"
//                   id="contact"
//                   name="contact"
//                   value={formData.contact}
//                   onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                   placeholder="+241 01 23 45 67"
//                   required
//                   aria-label="Contact"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="attendees" className="block text-sm font-medium text-gray-700">
//                   Nombre de participants attendus
//                 </label>
//                 <input
//                   type="number"
//                   id="attendees"
//                   name="attendees"
//                   value={formData.attendees}
//                   onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                   placeholder="1000"
//                   aria-label="Nombre de participants attendus"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="status" className="block text-sm font-medium text-gray-700">
//                   Statut *
//                 </label>
//                 <select
//                   id="status"
//                   name="status"
//                   value={formData.status}
//                   onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//                   required
//                   aria-label="Statut"
//                 >
//                   <option value="draft" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Brouillon</option>
//                   <option value="published" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Publié</option>
//                   <option value="processing" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">En traitement</option>
//                 </select>
//               </div>
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="is_featured"
//                   name="is_featured"
//                   checked={formData.is_featured}
//                   onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   aria-label="Mettre à la une"
//                 />
//                 <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
//                   Mettre à la une
//                 </label>
//               </div>
//             </div>
//             <div>
//               <h4 className="font-medium text-gray-700 mb-3">Informations de billetterie</h4>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="tickets_available"
//                     name="tickets_available"
//                     checked={formData.tickets_available}
//                     onChange={(e) => setFormData({ ...formData, tickets_available: e.target.checked })}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     aria-label="Billets disponibles"
//                   />
//                   <label htmlFor="tickets_available" className="ml-2 block text-sm text-gray-700">
//                     Billets disponibles
//                   </label>
//                 </div>
//                 <div>
//                   <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700">
//                     Prix des billets
//                   </label>
//                   <input
//                     type="text"
//                     id="ticket_price"
//                     name="ticket_price"
//                     value={formData.ticket_price}
//                     onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
//                     className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                     placeholder="À partir de 10.000 XAF"
//                     aria-label="Prix des billets"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="ticket_url" className="block text-sm font-medium text-gray-700">
//                     URL de la billetterie
//                   </label>
//                   <input
//                     type="url"
//                     id="ticket_url"
//                     name="ticket_url"
//                     value={formData.ticket_url}
//                     onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
//                     className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                     placeholder="https://billetterie.gcutv.com"
//                     aria-label="URL de la billetterie"
//                   />
//                 </div>
//               </div>
//             </div>
//             <div>
//               <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//                 Description de l'événement *
//               </label>
//               <div className="tinymce-wrapper">
//                 <Editor
//                   apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
//                   value={formData.description}
//                   onEditorChange={handleDescriptionChange}
//                   init={{
//                     height: 400,
//                     menubar: true,
//                     plugins: [
//                       'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
//                       'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
//                     ],
//                     toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
//                     tinycomments_mode: 'embedded',
//                     tinycomments_author: 'Admin',
//                     mergetags_list: [
//                       { value: 'Event.Name', title: 'Event Name' },
//                       { value: 'Event.Location', title: 'Event Location' },
//                     ],
//                     ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('AI Assistant not implemented')),
//                     file_picker_callback: filePickerCallback,
//                     file_picker_types: 'image',
//                     content_style: `
//                       body { 
//                         font-family: Arial, sans-serif; 
//                         font-size: 14px; 
//                         background: ${document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff'}; 
//                         color: ${document.documentElement.classList.contains('dark') ? '#fff' : '#000'}; 
//                       }
//                       .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
//                         color: ${document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'};
//                       }
//                     `,
//                     skin: document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
//                     content_css: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
//                     placeholder: 'Description détaillée de l\'événement...'
//                   }}
//                 />
//               </div>
//             </div>
//             <div className="w-full">
//               <label className="block text-sm font-medium text-gray-700">
//                 Image de l'événement
//               </label>
//               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
//                 <div className="space-y-1 text-center">
//                   <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                   <div className="flex text-sm text-gray-600">
//                     <label
//                       htmlFor="file-upload"
//                       className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
//                     >
//                       <span>Télécharger une image</span>
//                       <input 
//                         id="file-upload" 
//                         name="file-upload" 
//                         type="file" 
//                         className="sr-only" 
//                         onChange={handleFileChange}
//                         accept="image/png,image/jpeg,image/gif"
//                         aria-label="Télécharger une image"
//                       />
//                     </label>
//                     <p className="pl-1">ou glisser-déposer</p>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     PNG, JPG, GIF jusqu'à 10Mo
//                   </p>
//                 </div>
//               </div>
//               {imagePreview && (
//                 <img
//                   src={imagePreview}
//                   alt="Preview"
//                   className="mt-2 h-32 object-cover rounded-lg"
//                 />
//               )}
//             </div>
//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 {isSubmitting ? 'Soumission...' : 'Soumettre l\'événement'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Articles2;