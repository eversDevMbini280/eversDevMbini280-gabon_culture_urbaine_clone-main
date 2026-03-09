"use client"
import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  FilePlus,
  X,
  Upload,
  Check,
  AlertTriangle,
  Calendar,
  Save
} from 'lucide-react';

const Videos = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000" }) => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    time: '',
    date: '',
    duration: '',
    is_live: false,
    status: 'published', // Default to published
    is_featured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // For debugging
  
  // New state for upcoming programs
  const [upcomingProgram, setUpcomingProgram] = useState('');
  const [isEditingUpcoming, setIsEditingUpcoming] = useState(false);
  const [isSavingUpcoming, setIsSavingUpcoming] = useState(false);

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
  
      // Try to fetch from the admin endpoint directly
      console.log("Attempting to fetch videos from admin endpoint");
      
      // Use try/catch for each fetch attempt to handle network errors gracefully
      try {
        const adminResponse = await fetch(`${apiUrl}/api/directtv/admin`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
        });
        
        if (adminResponse.ok) {
          const data = await adminResponse.json();
          console.log("Retrieved videos from admin endpoint:", data.length);
          setDebugInfo({
            source: "admin endpoint",
            count: data.length,
            statuses: data.map(v => v.status)
          });
          setVideos(data);
          setIsLoading(false);
          return;
        } else {
          console.error("Admin endpoint failed with status:", adminResponse.status);
        }
      } catch (adminError) {
        console.error("Error fetching from admin endpoint:", adminError);
      }
      
      // Fall back to the main endpoint with admin privileges
      try {
        const response = await fetch(`${apiUrl}/api/directtv/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log("Retrieved videos from main endpoint:", data.length);
          setDebugInfo({
            source: "main endpoint",
            count: data.length,
            statuses: data.map(v => v.status)
          });
          setVideos(data);
        } else {
          // Handle 401 specifically
          if (response.status === 401) {
            // Attempt token refresh or redirect to login
            throw new Error('Session expired. Please log in again.');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to fetch videos (Status: ${response.status})`);
        }
      } catch (mainError) {
        console.error("Error fetching from main endpoint:", mainError);
        throw mainError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error.message || "Failed to fetch videos. Please try again later.");
      // Redirect to login if unauthorized
      if (error.message && (error.message.includes('401') || error.message.includes('expired'))) {
        window.location.href = '/adm';
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load upcoming program from localStorage on component mount
  useEffect(() => {
    const savedProgram = localStorage.getItem('upcomingProgram');
    if (savedProgram) {
      setUpcomingProgram(savedProgram);
    }
  }, []);

  useEffect(() => {
    console.log('Videos component mounted, fetching videos at', new Date().toLocaleString());
    fetchVideos();
    
    // Set up a refresh interval to periodically check for new videos
    console.log('Setting up 24-hour refresh interval at', new Date().toLocaleString());
    const intervalId = setInterval(() => {
      console.log('24-hour refresh triggered at', new Date().toLocaleString());
      fetchVideos();
    }, 24 * 60 * 60 * 1000); // Refresh every 24 hours
    
    // Clean up interval on component unmount
    return () => {
      console.log('Cleaning up interval at', new Date().toLocaleString());
      clearInterval(intervalId);
    };
  }, [apiUrl]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'image') {
      setImageFile(file);
    } else if (type === 'video') {
      setVideoFile(file);
    }
  };

  // Format time to ensure it complies with backend requirements
  const formatTimeForSubmission = (time) => {
    // Standardize time format by removing extra spaces around hyphen
    return time.replace(/\s+\-\s+/, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsUploading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setFormError('Please log in to add a video.');
      setIsUploading(false);
      return;
    }

    if (!formData.title || !formData.description || !formData.category_id || !formData.time || !formData.date) {
      setFormError('Please fill in all required fields.');
      setIsUploading(false);
      return;
    }

    if (!videoFile && !isEditModalOpen) {
      setFormError('Please upload a video file.');
      setIsUploading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category_id', formData.category_id);
    
    // Format time to ensure it complies with length requirements
    const formattedTime = formatTimeForSubmission(formData.time);
    data.append('time', formattedTime);
    
    data.append('date', formData.date);
    data.append('status', formData.status); // Explicitly set status
    data.append('is_featured', formData.is_featured);
    if (formData.duration) data.append('duration', formData.duration);
    data.append('is_live', formData.is_live);
    if (imageFile) data.append('image', imageFile);
    if (videoFile) data.append('video', videoFile);

    try {
      console.log("Submitting video data:", Object.fromEntries(data.entries()));
      console.log("Time value:", formattedTime);
      
      let url = `${apiUrl}/api/directtv/`;
      let method = 'POST';
      
      // If editing, use PUT method and include video ID in URL
      if (isEditModalOpen && selectedVideo) {
        url = `${apiUrl}/api/directtv/${selectedVideo.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type with FormData, browser will set it with boundary
        },
        body: data,
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API response error:", errorData);
        throw new Error(errorData.detail || `Failed to ${isEditModalOpen ? 'update' : 'upload'} video`);
      }

      const newVideo = await response.json();
      console.log(`Successfully ${isEditModalOpen ? 'updated' : 'uploaded'} video:`, newVideo);
      
      // Immediately refresh the video list to show the new/updated video
      await fetchVideos();
      
      setFormSuccess(`Video ${isEditModalOpen ? 'updated' : 'added'} successfully!`);
      setFormData({ 
        title: '', 
        description: '', 
        category_id: '', 
        time: '', 
        date: '', 
        duration: '', 
        is_live: false,
        status: 'published',
        is_featured: false
      });
      setImageFile(null);
      setVideoFile(null);
      setIsModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(`Error ${isEditModalOpen ? 'updating' : 'adding'} video:`, error);
      setFormError(error.message || `Failed to ${isEditModalOpen ? 'update' : 'upload'} video. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetFeatured = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
  
      // Create FormData properly for the PUT request
      const formData = new FormData();
      formData.append('is_featured', 'true');
  
      const response = await fetch(`${apiUrl}/api/directtv/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type with FormData, browser will set it with boundary
        },
        body: formData,
        mode: 'cors',
      });
  
      if (!response.ok) {
        throw new Error('Failed to set as featured');
      }
  
      // Immediately refresh the video list
      await fetchVideos();
      
      setFormSuccess('Video set as featured successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error setting featured:', error);
      setError(error.message || 'Failed to set video as featured. Please try again.');
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await fetch(`${apiUrl}/api/directtv/${selectedVideo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }
      
      // Immediately refresh the video list
      await fetchVideos();
      
      setFormSuccess('Video deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedVideo(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting video:', error);
      setError(error.message || 'Failed to delete video. Please try again.');
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title || '',
      description: video.description || '',
      category_id: video.category_id || '',
      time: video.time || '',
      date: video.date ? video.date.split('T')[0] : '',
      duration: video.duration || '',
      is_live: video.is_live || false,
      status: video.status || 'published',
      is_featured: video.is_featured || false
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (video) => {
    setSelectedVideo(video);
    setIsDeleteModalOpen(true);
  };

  const viewVideo = (video) => {
    // Open video in new tab or modal
    if (video.video_url) {
      window.open(`${apiUrl}${video.video_url}`, '_blank');
    }
  };

  // Handle upcoming program save
  const handleSaveUpcomingProgram = async () => {
    setIsSavingUpcoming(true);
    try {
      // Save to localStorage
      localStorage.setItem('upcomingProgram', upcomingProgram);
      setIsEditingUpcoming(false);
      setFormSuccess('Programme à venir sauvegardé!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving upcoming program:', error);
      setError('Erreur lors de la sauvegarde du programme à venir.');
    } finally {
      setIsSavingUpcoming(false);
    }
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    video.status.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    video.date.includes(searchQuery || '')
  );

  const handleImageError = (e) => {
    e.target.src = '/static/placeholder.jpg';
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
      case 'archived':
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

  return (
    <>
      {/* Upcoming Programs Section */}
      <div className="mb-6 bg-blue-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Programme à venir
          </h3>
          {!isEditingUpcoming && (
            <button 
              onClick={() => setIsEditingUpcoming(true)}
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
            >
              <Edit className="w-4 h-4 mr-1" />
              Modifier
            </button>
          )}
        </div>
        
        {isEditingUpcoming ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du prochain programme
              </label>
              <input
                type="text"
                value={upcomingProgram}
                onChange={(e) => setUpcomingProgram(e.target.value)}
                placeholder="Ex: Le Débat Urbain - Édition spéciale"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditingUpcoming(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveUpcomingProgram}
                disabled={isSavingUpcoming}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSavingUpcoming ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="-ml-1 mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            {upcomingProgram ? (
              <p className="text-lg font-medium text-gray-800">{upcomingProgram}</p>
            ) : (
              <p className="text-gray-500 italic">Aucun programme à venir défini</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">
          Toutes les Vidéos
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => fetchVideos()}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Actualiser
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter une vidéo
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      
      {formSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
          <Check className="w-5 h-5 mr-2" />
          {formSuccess}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Chargement des vidéos...</p>
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Heure
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center border">
                          {video.image_url ? (
                            <img 
                              src={`${apiUrl}${video.image_url}`} 
                              alt={video.title}
                              className="h-full w-full object-cover"
                              onError={handleImageError}
                            />
                          ) : (
                            <Video className="text-red-500 w-5 h-5" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{video.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{video.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(video.status)}
                      {video.is_featured && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                          Featured
                        </span>
                      )}
                      {video.is_live && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">
                          LIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(video.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">{video.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSetFeatured(video.id)}
                          className={`px-2 py-1 text-xs rounded ${video.is_featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          title="Set as featured"
                        >
                          Featured
                        </button>
                        <button 
                          onClick={() => viewVideo(video)} 
                          className="text-blue-600 hover:text-blue-900" 
                          title="Voir"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openEditModal(video)} 
                          className="text-indigo-600 hover:text-indigo-900" 
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(video)} 
                          className="text-red-600 hover:text-red-900" 
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <FilePlus className="w-16 h-16 text-gray-300 mb-4" />
            <p className="mb-2">Aucune vidéo trouvée</p>
            <p className="text-sm text-gray-400">
              {searchQuery 
                ? `Aucun résultat pour "${searchQuery}"`
                : `Ajoutez des vidéos en cliquant sur le bouton "Ajouter une vidéo"`
              }
            </p>
          </div>
        )}
      </div>

      {/* ADD VIDEO MODAL - SIMPLIFIED VERSION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-xl font-medium">Ajouter une nouvelle vidéo</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content Area - Scrollable */}
            <div className="p-6 overflow-y-auto" style={{height: "calc(100% - 130px)"}}>
              {formError && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              {formSuccess && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
                  <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}
              
              <form id="videoForm" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Programme *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Entrez le titre du programme"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                        placeholder="Description du programme"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie ID *</label>
                      <input
                        type="number"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ID de la catégorie"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
                        <input
                          type="text"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          placeholder="10:30 ou 10:30-12:00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="1h30m"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex space-x-6">
                      <div className="flex items-center">
                        <input
                          id="is_live"
                          name="is_live"
                          type="checkbox"
                          checked={formData.is_live}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_live" className="ml-2 block text-sm text-gray-700">
                          En direct
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="is_featured"
                          name="is_featured"
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                          À l'antenne
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* File Upload Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Choisir une image
                      </label>
                      <span className="ml-3 text-sm text-gray-500 truncate max-w-[200px]">
                        {imageFile ? imageFile.name : 'Aucun fichier choisi'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vidéo *</label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, 'video')}
                        className="hidden"
                        id="video-upload"
                        required={!isEditModalOpen}
                      />
                      <label
                        htmlFor="video-upload"
                        className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Choisir une vidéo
                      </label>
                      <span className="ml-3 text-sm text-gray-500 truncate max-w-[200px]">
                        {videoFile ? videoFile.name : 'Aucun fichier choisi'}
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Footer - Fixed at bottom */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-4 mt-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="videoForm"
                disabled={isUploading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Upload className="-ml-1 mr-2 h-5 w-5" />
                    Ajouter la vidéo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VIDEO MODAL - SIMPLIFIED VERSION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[600px] flex flex-col">
  {/* Header */}
  <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
    <h3 className="text-xl font-medium">Modifier la vidéo</h3>
    <button 
      onClick={() => setIsEditModalOpen(false)} 
      className="text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label="Fermer la fenêtre de modification"
    >
      <X className="w-6 h-6" />
    </button>
  </div>
  
  {/* Content Area - Scrollable */}
  <div className="p-6 overflow-y-auto" style={{height: "calc(100% - 130px)"}}>
    {formError && (
      <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-lg flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
        <span>{formError}</span>
      </div>
    )}
    
    {formSuccess && (
      <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg flex items-center">
        <Check className="w-5 h-5 mr-2 flex-shrink-0" />
        <span>{formSuccess}</span>
      </div>
    )}
    
    <form id="editForm" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Programme *</label>
            <input
              type="text"
              id="edit-title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
              placeholder="Entrez le titre du programme"
              required
              aria-label="Titre du programme"
            />
          </div>
          
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600 resize-vertical"
              rows="4"
              placeholder="Description du programme"
              required
              aria-label="Description du programme"
            />
          </div>
          
          <div>
            <label htmlFor="edit-category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie ID *</label>
            <input
              type="number"
              id="edit-category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
              placeholder="ID de la catégorie"
              required
              aria-label="ID de la catégorie"
            />
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure *</label>
              <input
                type="text"
                id="edit-time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                placeholder="10:30 ou 10:30-12:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
                required
                aria-label="Heure du programme"
              />
            </div>
            <div>
              <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input
                type="date"
                id="edit-date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
                aria-label="Date du programme"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durée</label>
            <input
              type="text"
              id="edit-duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="1h30m"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
              aria-label="Durée du programme"
            />
          </div>
          
          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
            <select
              id="edit-status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              aria-label="Statut de la vidéo"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                id="edit_is_live"
                name="is_live"
                type="checkbox"
                checked={formData.is_live}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                aria-label="Diffusion en direct"
              />
              <label htmlFor="edit_is_live" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                En direct
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="edit_is_featured"
                name="is_featured"
                type="checkbox"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                aria-label="Vidéo à l'antenne"
              />
              <label htmlFor="edit_is_featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                À l'antenne
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* File Upload Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="edit-image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image (optionnel)</label>
          <div className="flex items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image')}
              className="hidden"
              id="edit-image-upload"
            />
            <label
              htmlFor="edit-image-upload"
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Choisir une nouvelle image"
            >
              Choisir une image
            </label>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {imageFile ? imageFile.name : 'Conserver l\'image actuelle'}
            </span>
          </div>
        </div>
        
        <div>
          <label htmlFor="edit-video-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vidéo (optionnel)</label>
          <div className="flex items-center">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, 'video')}
              className="hidden"
              id="edit-video-upload"
            />
            <label
              htmlFor="edit-video-upload"
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Choisir une nouvelle vidéo"
            >
              Choisir une vidéo
            </label>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {videoFile ? videoFile.name : 'Conserver la vidéo actuelle'}
            </span>
          </div>
        </div>
      </div>
    </form>
  </div>
  
  {/* Footer - Fixed at bottom */}
  <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-b-lg flex justify-end space-x-4 mt-auto">
    <button
      type="button"
      onClick={() => setIsEditModalOpen(false)}
      className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label="Annuler la modification"
    >
      Annuler
    </button>
    <button
      type="submit"
      form="editForm"
      disabled={isUploading}
      className="px-6 py-2 border border-transparent rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      aria-label="Mettre à jour la vidéo"
    >
      {isUploading ? (
        <>
          <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
          Mise à jour...
        </>
      ) : (
        <>
          <Edit className="-ml-1 mr-2 h-5 w-5" />
          Mettre à jour
        </>
      )}
    </button>
  </div>
</div>
        </div>
      )}

      {/* Delete Confirmation Modal - Simplified */}
      {isDeleteModalOpen && selectedVideo && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
      {/* Header */}
      <div className="bg-red-600 dark:bg-red-700 text-white px-6 py-4 flex justify-between items-center">
        <h3 className="text-xl font-medium">Confirmer la suppression</h3>
        <button 
          onClick={() => setIsDeleteModalOpen(false)} 
          className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Fermer la fenêtre de suppression"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-center mb-6 text-red-500 dark:text-red-400">
          <AlertTriangle className="w-16 h-16" />
        </div>
        <p className="text-center text-lg font-medium text-gray-900 dark:text-white mb-2">
          Êtes-vous sûr de vouloir supprimer cette vidéo ?
        </p>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
          <strong>{selectedVideo.title}</strong>
        </p>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
          Cette action est irréversible et supprimera définitivement la vidéo.
        </p>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-4">
        <button
          onClick={() => setIsDeleteModalOpen(false)}
          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Annuler la suppression"
        >
          Annuler
        </button>
        <button
          onClick={handleDeleteVideo}
          className="px-4 py-2 border border-transparent rounded-md bg-red-600 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
          aria-label="Supprimer la vidéo"
        >
          <Trash2 className="-ml-1 mr-2 h-5 w-5" />
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default Videos;
