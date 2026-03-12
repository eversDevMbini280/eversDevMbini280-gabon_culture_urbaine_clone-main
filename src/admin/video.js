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

const styles = `
  .admin-shell {
    background: #0f0f13;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 32px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.45);
  }
  .admin-shell::before {
    content:''; position:absolute; top:-100px; right:-100px;
    width:300px; height:300px;
    background:radial-gradient(circle,rgba(59,130,246,0.14) 0%,transparent 70%);
    pointer-events:none;
  }
  .admin-shell--compact { padding: 20px; }
  .admin-shell--muted { background: rgba(255,255,255,0.04); }
  .admin-title {
    font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 6px;
    display:flex; align-items:center; gap:10px;
  }
  .admin-sub { font-size: 0.85rem; color: rgba(255,255,255,0.45); }
  .admin-static-label {
    display:block; font-size:0.7rem; font-weight:600;
    color:rgba(255,255,255,0.45); letter-spacing:0.08em;
    text-transform:uppercase; margin-bottom:8px;
  }
  .admin-input, .admin-textarea, .admin-select {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:12px 14px;
    font-size:0.875rem; font-family:inherit; color:#f0f0f5;
    outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
  }
  .admin-input::placeholder, .admin-textarea::placeholder { color:rgba(255,255,255,0.25); }
  .admin-input:focus, .admin-textarea:focus, .admin-select:focus {
    border-color:rgba(59,130,246,0.6);
    background:rgba(59,130,246,0.06);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .admin-textarea { resize: vertical; min-height: 90px; }
  .admin-btn-primary {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 18px; border-radius:12px; border:none;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    color:#fff; font-size:0.875rem; font-weight:700; letter-spacing:0.02em;
    box-shadow:0 4px 20px rgba(59,130,246,0.35); transition:all 0.2s;
  }
  .admin-btn-primary:hover:not(:disabled){ transform:translateY(-1px); box-shadow:0 8px 28px rgba(59,130,246,0.5); }
  .admin-btn-primary:disabled{ opacity:0.5; cursor:not-allowed; }
  .admin-btn-ghost {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 16px; border-radius:12px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.7); font-size:0.875rem; font-weight:600;
    transition:all 0.2s;
  }
  .admin-btn-ghost:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .admin-btn-danger {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 16px; border-radius:12px;
    background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25);
    color:#fecaca; font-size:0.875rem; font-weight:600;
    transition:all 0.2s;
  }
  .admin-toolbar { display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .admin-table-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px;
    box-shadow:0 30px 60px rgba(0,0,0,0.45);
    overflow:hidden;
  }
  .admin-table { width:100%; border-collapse:collapse; }
  .admin-table thead th {
    text-align:left; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase;
    color:rgba(255,255,255,0.35); padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .admin-table tbody td {
    padding:12px 16px; font-size:0.85rem; color:rgba(255,255,255,0.7);
    border-bottom:1px solid rgba(255,255,255,0.04);
  }
  .admin-table tbody tr:hover { background:rgba(255,255,255,0.03); }
  .admin-muted { color:rgba(255,255,255,0.5); }
  .admin-badge {
    display:inline-flex; align-items:center; padding:3px 8px; border-radius:999px;
    font-size:0.7rem; font-weight:600; border:1px solid rgba(255,255,255,0.12);
  }
  .admin-badge--green { background:rgba(34,197,94,0.16); color:#86efac; border-color:rgba(34,197,94,0.35); }
  .admin-badge--gray { background:rgba(148,163,184,0.16); color:#cbd5f5; border-color:rgba(148,163,184,0.35); }
  .admin-badge--yellow { background:rgba(234,179,8,0.16); color:#fde68a; border-color:rgba(234,179,8,0.35); }
  .admin-badge--blue { background:rgba(59,130,246,0.16); color:#bfdbfe; border-color:rgba(59,130,246,0.35); }
  .admin-empty { padding:60px 24px; text-align:center; color:rgba(255,255,255,0.25); }
  .admin-modal {
    background:#0f0f13; border:1px solid rgba(255,255,255,0.08);
    border-radius:20px; box-shadow:0 30px 60px rgba(0,0,0,0.45);
    color:#f0f0f5; overflow:hidden;
  }
  .admin-modal-header {
    padding:18px 20px; border-bottom:1px solid rgba(255,255,255,0.06);
    display:flex; align-items:center; justify-content:space-between;
  }
  .admin-modal-body { padding:20px; }
  .admin-modal-footer { padding:16px 20px; border-top:1px solid rgba(255,255,255,0.06); display:flex; justify-content:flex-end; gap:12px; }
  .admin-file-btn {
    display:inline-flex; align-items:center; justify-content:center;
    padding:8px 14px; border-radius:10px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.7); font-size:0.8rem; font-weight:600;
    transition:all 0.2s; cursor:pointer;
  }
  .admin-file-btn:hover { background:rgba(255,255,255,0.12); color:#fff; }
  .admin-message {
    padding:12px 14px; border-radius:12px; font-size:0.85rem; border:1px solid transparent;
    display:flex; align-items:center; gap:8px;
  }
  .admin-message--error { background:rgba(239,68,68,0.12); color:#fecaca; border-color:rgba(239,68,68,0.3); }
  .admin-message--success { background:rgba(34,197,94,0.12); color:#bbf7d0; border-color:rgba(34,197,94,0.3); }
`;

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
  const [categories, setCategories] = useState([]);
  
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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/categories/`, { cache: 'no-store' });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
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
    fetchCategories();
    
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
        colorClass = 'admin-badge--green';
        break;
      case 'draft':
        colorClass = 'admin-badge--gray';
        break;
      case 'archived':
        colorClass = 'admin-badge--yellow';
        break;
      default:
        colorClass = 'admin-badge--blue';
    }
    return (
      <span className={`admin-badge ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <style>{styles}</style>
      {/* Upcoming Programs Section */}
      <div className="mb-6 admin-shell admin-shell--compact">
        <div className="admin-toolbar">
          <div className="admin-title">
            <Calendar className="w-5 h-5 text-blue-400" />
            Programme à venir
          </div>
          {!isEditingUpcoming && (
            <button 
              onClick={() => setIsEditingUpcoming(true)}
              className="admin-btn-ghost"
            >
              <Edit className="w-4 h-4 mr-1" />
              Modifier
            </button>
          )}
        </div>
        
        {isEditingUpcoming ? (
          <div className="space-y-4">
            <div>
              <label className="admin-static-label">
                Titre du prochain programme
              </label>
              <input
                type="text"
                value={upcomingProgram}
                onChange={(e) => setUpcomingProgram(e.target.value)}
                placeholder="Ex: Le Débat Urbain - Édition spéciale"
                className="admin-input"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditingUpcoming(false)}
                className="admin-btn-ghost"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveUpcomingProgram}
                disabled={isSavingUpcoming}
                className="admin-btn-primary"
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
          <div className="admin-shell admin-shell--compact admin-shell--muted">
            {upcomingProgram ? (
              <p className="text-lg font-medium text-white">{upcomingProgram}</p>
            ) : (
              <p className="admin-muted italic">Aucun programme à venir défini</p>
            )}
          </div>
        )}
      </div>

      <div className="admin-toolbar">
        <div>
          <h3 className="admin-title">Toutes les Vidéos</h3>
          <div className="admin-sub">Gérez les vidéos et les statuts de diffusion</div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => fetchVideos()}
            className="admin-btn-ghost"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Actualiser
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="admin-btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter une vidéo
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 admin-message admin-message--error">
          {error}
        </div>
      )}
      
      {formSuccess && (
        <div className="mb-4 admin-message admin-message--success">
          <Check className="w-5 h-5 mr-2" />
          {formSuccess}
        </div>
      )}

      <div className="admin-table-shell">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
            <p className="admin-muted">Chargement des vidéos...</p>
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">
                    Titre
                  </th>
                  <th scope="col">
                    Statut
                  </th>
                  <th scope="col">
                    Date/Heure
                  </th>
                  <th scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video) => (
                  <tr key={video.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-white/5 flex items-center justify-center border border-white/10">
                          {video.image_url ? (
                            <img 
                              src={`${apiUrl}${video.image_url}`} 
                              alt={video.title}
                              className="h-full w-full object-cover"
                              onError={handleImageError}
                            />
                          ) : (
                            <Video className="text-red-300 w-5 h-5" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{video.title}</div>
                          <div className="text-sm admin-muted line-clamp-1">{video.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {renderStatusBadge(video.status)}
                      {video.is_featured && (
                        <span className="ml-2 admin-badge admin-badge--blue">
                          Featured
                        </span>
                      )}
                      {video.is_live && (
                        <span className="ml-2 admin-badge admin-badge--yellow">
                          LIVE
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="text-sm text-white">
                        {new Date(video.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm admin-muted">{video.time}</div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSetFeatured(video.id)}
                          className={`admin-badge ${video.is_featured ? 'admin-badge--green' : 'admin-badge--gray'}`}
                          title="Set as featured"
                        >
                          Featured
                        </button>
                        <button 
                          onClick={() => viewVideo(video)} 
                          className="admin-btn-ghost" 
                          title="Voir"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openEditModal(video)} 
                          className="admin-btn-ghost" 
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(video)} 
                          className="admin-btn-danger" 
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
          <div className="admin-empty">
            <FilePlus className="w-16 h-16 text-gray-500 mb-4" />
            <p className="mb-2">Aucune vidéo trouvée</p>
            <p className="text-sm admin-muted">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 flex items-center justify-center z-50 p-4">
          <div className="admin-modal w-full max-w-2xl max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="admin-modal-header">
              <h3 className="text-lg font-semibold">Ajouter une nouvelle vidéo</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="admin-btn-ghost"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content Area - Scrollable */}
            <div className="admin-modal-body overflow-y-auto" style={{height: "calc(100% - 130px)"}}>
              {formError && (
                <div className="mb-6 admin-message admin-message--error">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              {formSuccess && (
                <div className="mb-6 admin-message admin-message--success">
                  <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}
              
              <form id="videoForm" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="admin-static-label">Programme *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="admin-input"
                        placeholder="Entrez le titre du programme"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="admin-static-label">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="admin-textarea"
                        rows="4"
                        placeholder="Description du programme"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category_id" className="admin-static-label">
                        Catégorie *
                      </label>
                      <select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="admin-select"
                        required
                        aria-label="Catégorie"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="admin-static-label">Heure *</label>
                        <input
                          type="text"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          placeholder="10:30 ou 10:30-12:00"
                          className="admin-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="admin-static-label">Date *</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="admin-input"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="admin-static-label">Durée</label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="1h30m"
                        className="admin-input"
                      />
                    </div>
                    
                    <div>
                      <label className="admin-static-label">Statut</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="admin-select"
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
                      <label htmlFor="is_live" className="ml-2 block text-sm text-white">
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
                      <label htmlFor="is_featured" className="ml-2 block text-sm text-white">
                        À l'antenne
                      </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* File Upload Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="admin-static-label">Image</label>
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
                        className="admin-file-btn"
                      >
                        Choisir une image
                      </label>
                      <span className="ml-3 text-sm admin-muted truncate max-w-[200px]">
                        {imageFile ? imageFile.name : 'Aucun fichier choisi'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="admin-static-label">Vidéo *</label>
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
                        className="admin-file-btn"
                      >
                        Choisir une vidéo
                      </label>
                      <span className="ml-3 text-sm admin-muted truncate max-w-[200px]">
                        {videoFile ? videoFile.name : 'Aucun fichier choisi'}
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Footer - Fixed at bottom */}
            <div className="admin-modal-footer mt-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="admin-btn-ghost"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="videoForm"
                disabled={isUploading}
                className="admin-btn-primary"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 flex items-center justify-center z-50 p-4">
         <div className="admin-modal w-full max-w-2xl max-h-[600px] flex flex-col">
  {/* Header */}
  <div className="admin-modal-header">
    <h3 className="text-lg font-semibold">Modifier la vidéo</h3>
    <button 
      onClick={() => setIsEditModalOpen(false)} 
      className="admin-btn-ghost"
      aria-label="Fermer la fenêtre de modification"
    >
      <X className="w-6 h-6" />
    </button>
  </div>
  
  {/* Content Area - Scrollable */}
  <div className="admin-modal-body overflow-y-auto" style={{height: "calc(100% - 130px)"}}>
    {formError && (
      <div className="mb-6 admin-message admin-message--error">
        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
        <span>{formError}</span>
      </div>
    )}
    
    {formSuccess && (
      <div className="mb-6 admin-message admin-message--success">
        <Check className="w-5 h-5 mr-2 flex-shrink-0" />
        <span>{formSuccess}</span>
      </div>
    )}
    
    <form id="editForm" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label htmlFor="edit-title" className="admin-static-label">Programme *</label>
            <input
              type="text"
              id="edit-title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="admin-input"
              placeholder="Entrez le titre du programme"
              required
              aria-label="Titre du programme"
            />
          </div>
          
          <div>
            <label htmlFor="edit-description" className="admin-static-label">Description *</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="admin-textarea"
              rows="4"
              placeholder="Description du programme"
              required
              aria-label="Description du programme"
            />
          </div>
          
          <div>
            <label htmlFor="edit-category_id" className="admin-static-label">
              Catégorie *
            </label>
            <select
              id="edit-category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="admin-select"
              required
              aria-label="Catégorie"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-time" className="admin-static-label">Heure *</label>
              <input
                type="text"
                id="edit-time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                placeholder="10:30 ou 10:30-12:00"
                className="admin-input"
                required
                aria-label="Heure du programme"
              />
            </div>
            <div>
              <label htmlFor="edit-date" className="admin-static-label">Date *</label>
              <input
                type="date"
                id="edit-date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="admin-input"
                required
                aria-label="Date du programme"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="edit-duration" className="admin-static-label">Durée</label>
            <input
              type="text"
              id="edit-duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="1h30m"
              className="admin-input"
              aria-label="Durée du programme"
            />
          </div>
          
          <div>
            <label htmlFor="edit-status" className="admin-static-label">Statut</label>
            <select
              id="edit-status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="admin-select"
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-label="Diffusion en direct"
              />
              <label htmlFor="edit_is_live" className="ml-2 block text-sm text-white">
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-label="Vidéo à l'antenne"
              />
              <label htmlFor="edit_is_featured" className="ml-2 block text-sm text-white">
                À l'antenne
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* File Upload Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="edit-image-upload" className="admin-static-label">Image (optionnel)</label>
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
              className="admin-file-btn"
              aria-label="Choisir une nouvelle image"
            >
              Choisir une image
            </label>
            <span className="ml-3 text-sm admin-muted truncate max-w-[200px]">
              {imageFile ? imageFile.name : 'Conserver l\'image actuelle'}
            </span>
          </div>
        </div>
        
        <div>
          <label htmlFor="edit-video-upload" className="admin-static-label">Vidéo (optionnel)</label>
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
              className="admin-file-btn"
              aria-label="Choisir une nouvelle vidéo"
            >
              Choisir une vidéo
            </label>
            <span className="ml-3 text-sm admin-muted truncate max-w-[200px]">
              {videoFile ? videoFile.name : 'Conserver la vidéo actuelle'}
            </span>
          </div>
        </div>
      </div>
    </form>
  </div>
  
  {/* Footer - Fixed at bottom */}
  <div className="admin-modal-footer mt-auto">
    <button
      type="button"
      onClick={() => setIsEditModalOpen(false)}
      className="admin-btn-ghost"
      aria-label="Annuler la modification"
    >
      Annuler
    </button>
    <button
      type="submit"
      form="editForm"
      disabled={isUploading}
      className="admin-btn-primary"
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
  <div className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 flex items-center justify-center z-50 p-4">
    <div className="admin-modal w-full max-w-md overflow-hidden">
      {/* Header */}
      <div className="admin-modal-header">
        <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
        <button 
          onClick={() => setIsDeleteModalOpen(false)} 
          className="admin-btn-ghost"
          aria-label="Fermer la fenêtre de suppression"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Content */}
      <div className="admin-modal-body">
        <div className="flex items-center justify-center mb-6 text-red-300">
          <AlertTriangle className="w-16 h-16" />
        </div>
        <p className="text-center text-lg font-medium text-white mb-2">
          Êtes-vous sûr de vouloir supprimer cette vidéo ?
        </p>
        <p className="text-center admin-muted mb-4">
          <strong>{selectedVideo.title}</strong>
        </p>
        <p className="text-center admin-muted text-sm mb-6">
          Cette action est irréversible et supprimera définitivement la vidéo.
        </p>
      </div>
      
      {/* Footer */}
      <div className="admin-modal-footer">
        <button
          onClick={() => setIsDeleteModalOpen(false)}
          className="admin-btn-ghost"
          aria-label="Annuler la suppression"
        >
          Annuler
        </button>
        <button
          onClick={handleDeleteVideo}
          className="admin-btn-danger"
          aria-label="Supprimer la vidéo"
        >
          <Trash2 className="-ml-1 mr-2 h-5 w-5" />
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Videos;
