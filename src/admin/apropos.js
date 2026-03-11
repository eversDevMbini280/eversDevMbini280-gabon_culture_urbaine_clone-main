'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, TrendingUp, Award, Map, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Save, Info, LogOut } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';

const AProposDashboard = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' }) => {
  const teamScrollContainerRef = useRef(null);
  const milestoneScrollContainerRef = useRef(null);
  const statsScrollContainerRef = useRef(null);
  const valuesScrollContainerRef = useRef(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [stats, setStats] = useState([]);
  const [values, setValues] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [aboutContent, setAboutContent] = useState(null);
  const [studios, setStudios] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    teamMember: { name: '', role: '', image: null, bio: '' },
    milestone: { year: '', title: '', description: '' },
    stat: { number: '', label: '', icon_name: '' },
    value: { title: '', description: '', icon_name: '' },
    contactInfo: { address: '', email: '', phone: '' },
    aboutContent: {
      history_title: '',
      history_subtitle: '',
      history_text1: '',
      history_text2: '',
      mission_title: '',
      mission_subtitle: '',
      mission_text: '',
      vision_title: '',
      vision_text: '',
    },
    studios: { title: '', description: '', features: '', collaboration_text: '', image: null },
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showStatForm, setShowStatForm] = useState(false);
  const [showValueForm, setShowValueForm] = useState(false);
  const aproposApiUrl = `${apiUrl}/apropos`;
  const staticUrl = apiUrl;
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const iconOptions = ['Clock', 'Headphones', 'Tv', 'Users', 'Camera', 'PlayCircle', 'Award'];
  const router = useRouter();

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      router.push('/admin/login');
      return null;
    }
    try {
      const response = await axios.post(`${apiUrl}/api/auth/refresh`, { refresh_token: refreshToken });
      const { access_token, refresh_token: newRefreshToken } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', newRefreshToken);
      return access_token;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      router.push('/admin/adm');
      return null;
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/admin/adm');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const [teamRes, milestoneRes, statsRes, valuesRes, contactRes, aboutRes, studiosRes] = await Promise.all([
          axios.get(`${aproposApiUrl}/team-members/`, { headers }),
          axios.get(`${aproposApiUrl}/milestones/`, { headers }),
          axios.get(`${aproposApiUrl}/stats/`, { headers }),
          axios.get(`${aproposApiUrl}/values/`, { headers }),
          axios.get(`${aproposApiUrl}/contact-info/`, { headers }),
          axios.get(`${aproposApiUrl}/about-content/`, { headers }),
          axios.get(`${aproposApiUrl}/studios/`, { headers }),
        ]);

        setTeamMembers(teamRes.data);
        setMilestones(milestoneRes.data);
        setStats(statsRes.data);
        setValues(valuesRes.data);
        setContactInfo(contactRes.data[0] || null);
        setAboutContent(aboutRes.data[0] || null);
        setStudios(studiosRes.data[0] || null);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_info');
          router.push('/admin/adm');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1 00:00:00 GMT';
    router.push('/admin/adm');
  };

  const handleScroll = (containerId, direction) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollDistance = container.clientWidth * 0.5;
      container.scrollBy({ left: direction * scrollDistance, behavior: 'auto' });
    }
  };

  useEffect(() => {
    const handleWheelScroll = (event, container) => {
      if (container && event.deltaY !== 0) {
        event.preventDefault();
        container.scrollLeft += event.deltaY;
      }
    };

    const containers = [
      { id: 'team-scroll-container', ref: teamScrollContainerRef },
      { id: 'milestone-scroll-container', ref: milestoneScrollContainerRef },
      { id: 'stats-scroll-container', ref: statsScrollContainerRef },
      { id: 'values-scroll-container', ref: valuesScrollContainerRef },
    ];

    containers.forEach(({ id, ref }) => {
      const container = document.getElementById(id);
      if (container) {
        container.addEventListener('wheel', (e) => handleWheelScroll(e, container), { passive: false });
        ref.current = container;
      }
    });

    return () => {
      containers.forEach(({ id }) => {
        const container = document.getElementById(id);
        if (container) {
          container.removeEventListener('wheel', handleWheelScroll);
        }
      });
    };
  }, []);

  const handleInputChange = (e, section, field = null) => {
    if (!e) return;
    const { id, value } = e.target;
    setFormData((prev) => {
      if (field) {
        return {
          ...prev,
          [section]: { ...prev[section], [field]: value },
        };
      }
      return {
        ...prev,
        [section]: { ...prev[section], [id]: value },
      };
    });
  };

  const handleEditorChange = (content, section, field) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: content },
    }));
  };

  const handleImageChange = (e, section) => {
    const file = e.target.files[0];
    setImageError(null);
    setErrorMessage(null);
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image file size must be less than 2MB');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setImageError('Invalid image file. Only JPEG or PNG images are allowed.');
      return;
    }
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], image: file },
      }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      setImageError('Invalid image file. Please upload a valid JPEG or PNG image.');
      URL.revokeObjectURL(img.src);
    };
  };

  const filePickerCallback = (callback, section) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png');

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        alert('Image file size must be less than 2MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Invalid image format. Only JPEG or PNG images are allowed.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          [section]: { ...prev[section], image: file },
        }));
        setImagePreview(reader.result);
        callback(reader.result, { alt: file.name });
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const handleSubmit = async (e, section, endpoint) => {
    e.preventDefault();
    if ((section === 'teamMember' || section === 'studios') && imageError) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/Storage');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      let dataToSend = formData[section];
      if (section === 'milestone') {
        dataToSend = {
          ...formData[section],
          year: parseInt(formData[section].year, 10),
        };
      }
      let response;
      if (section === 'teamMember' || section === 'studios') {
        dataToSend = new FormData();
        Object.keys(formData[section]).forEach((key) => {
          if (key !== 'image' && formData[section][key]) {
            dataToSend.append(key, formData[section][key]);
          }
        });
        if (formData[section].image) {
          dataToSend.append('image', formData[section].image);
        }
        if (editingItem) {
          try {
            await axios.get(`${apiUrl}/${endpoint}/${editingItem.id}`, { headers });
          } catch (error) {
            if (error.response?.status === 404) {
              setErrorMessage(`Cannot update ${section}: Resource no longer exists.`);
              setEditingItem(null);
              setIsSaving(false);
              return;
            }
          }
          response = await axios.put(`${apiUrl}/${endpoint}/${editingItem.id}`, dataToSend, {
            headers: { ...headers, 'Content-Type': 'multipart/form-data' },
          });
        } else {
          response = await axios.post(`${apiUrl}/${endpoint}/`, dataToSend, {
            headers: { ...headers, 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        if (editingItem) {
          response = await axios.put(`${apiUrl}/${endpoint}/${editingItem.id || ''}`, dataToSend, { headers });
        } else {
          const postUrl = endpoint === 'about-content' ? `${apiUrl}/${endpoint}` : `${apiUrl}/${endpoint}/`;
          response = await axios.post(postUrl, dataToSend, { headers });
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setEditingItem(null);
      setImagePreview(null);
      setImageError(null);
      setFormData((prev) => ({
        ...prev,
        [section]:
          section === 'contactInfo'
            ? { address: '', email: '', phone: '' }
            : section === 'teamMember'
            ? { name: '', role: '', image: null, bio: '' }
            : section === 'aboutContent'
            ? {
                history_title: '',
                history_subtitle: '',
                history_text1: '',
                history_text2: '',
                mission_title: '',
                mission_subtitle: '',
                mission_text: '',
                vision_title: '',
                vision_text: '',
              }
            : section === 'studios'
            ? { title: '', description: '', features: '', collaboration_text: '', image: null }
            : section === 'milestone'
            ? { year: '', title: '', description: '' }
            : { ...prev[section], ...Object.fromEntries(Object.keys(prev[section]).map((k) => [k, ''])) },
      }));
      const res = await axios.get(`${apiUrl}/${endpoint}/`, { headers });
      if (section === 'teamMember') setTeamMembers(res.data);
      else if (section === 'milestone') setMilestones(res.data);
      else if (section === 'stat') setStats(res.data);
      else if (section === 'value') setValues(res.data);
      else if (section === 'contactInfo') setContactInfo(res.data[0] || null);
      else if (section === 'aboutContent') setAboutContent(res.data[0] || null);
      else if (section === 'studios') setStudios(res.data[0] || null);
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/admin/adm');
      } else if (error.response?.status === 422) {
        setErrorMessage(`Validation error: ${JSON.stringify(error.response.data.detail)}`);
      } else if (error.response?.status === 400) {
        setErrorMessage(error.response.data.detail || `Failed to save ${section}. Please check your input.`);
      } else if (error.response?.status === 404) {
        setErrorMessage(`Cannot update ${section}: Resource not found. It may have been deleted.`);
      } else {
        setErrorMessage(`An error occurred while saving ${section}: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, endpoint, section) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/admin/adm');
        return;
      }
      await axios.delete(`${apiUrl}/${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (section === 'studios') {
        const res = await axios.get(`${apiUrl}/${endpoint}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudios(res.data[0] || null);
      } else if (section === 'teamMembers') {
        setTeamMembers(teamMembers.filter((item) => item.id !== id));
      } else if (section === 'milestones') {
        setMilestones(milestones.filter((item) => item.id !== id));
      } else if (section === 'stats') {
        setStats(stats.filter((item) => item.id !== id));
      } else if (section === 'values') {
        setValues(values.filter((item) => item.id !== id));
      } else if (section === 'contactInfo') {
        setContactInfo(null);
      } else if (section === 'aboutContent') {
        setAboutContent(null);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/admin/adm');
      } else {
        setErrorMessage(`Failed to delete ${section}: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleEdit = (item, section) => {
    setEditingItem({ ...item, section });
    setImageError(null);
    setErrorMessage(null);
    if (section === 'teamMember' || section === 'studios') {
      setFormData((prev) => ({ ...prev, [section]: { ...item, image: null } }));
      setImagePreview(section === 'teamMember' ? (item.image_url ? `${staticUrl}${item.image_url}` : null) : (item.image_path ? `${staticUrl}${item.image_path}` : null));
    } else {
      setFormData((prev) => ({ ...prev, [section]: item }));
    }
    if (section === 'teamMember') setShowTeamForm(true);
    if (section === 'milestone') setShowMilestoneForm(true);
    if (section === 'stat') setShowStatForm(true);
    if (section === 'value') setShowValueForm(true);
  };

  const MobileScrollIndicator = ({ containerId, light = false }) => (
    <div className="flex items-center justify-center mt-1 mb-3 md:hidden">
      <div className="flex flex-col items-center">
        <p className={`text-sm ${light ? 'text-blue-200' : 'text-blue-600'} mb-1`}>Faire défiler</p>
        <div className="flex items-center scroll-indicator" onClick={() => document.getElementById(containerId).scrollLeft += 100}>
          <ChevronLeft className={`w-5 h-5 ${light ? 'text-blue-300' : 'text-blue-500'}`} />
          <ChevronRight className={`w-6 h-6 ${light ? 'text-blue-300' : 'text-blue-500'}`} />
        </div>
      </div>
    </div>
  );

  const editorInit = {
    height: 250,
    menubar: false,
    plugins: ['image', 'link', 'lists', 'media', 'table'],
    toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | removeformat',
    file_picker_types: 'image',
    content_style: `
      body { 
        font-family: Arial, sans-serif; 
        font-size: 14px; 
        background: ${document.documentElement.classList.contains('dark') ? '#1c2526' : '#ffffff'}; 
        color: ${document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'}; 
      }
      .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
        color: ${document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'};
      }
    `,
    skin: document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
    content_css: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <motion.main className="min-h-screen bg-blue-900" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <style jsx>{`
        @keyframes scrollIndicator { 0% { opacity: 0.7; transform: translateX(0); } 50% { opacity: 1; transform: translateX(10px); } 100% { opacity: 0.7; transform: translateX(0); } }
        .scroll-indicator { animation: scrollIndicator 1.5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.7); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 1); }
        .team-image { aspect-ratio: 1/1; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .preview-image { aspect-ratio: 1/1; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .scroll-container { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
        .scroll-item { flex: 0 0 auto; scroll-snap-align: start; }
        @media (max-width: 768px) { 
          .custom-scrollbar::-webkit-scrollbar { display: none; } 
          .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } 
          .scroll-item { min-width: 85vw; }
        }
      `}</style>

      <motion.div className="relative bg-blue-600 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <motion.div className="flex items-center gap-3 mb-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg" initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <Users className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h1 className="text-4xl font-bold">Tableau de Bord À Propos</h1>
          </motion.div>
          <motion.p className="text-lg text-blue-100 max-w-3xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
            Gérez le contenu de la page À Propos de GCUTV, y compris l'histoire, l'équipe, les jalons, les statistiques, les valeurs, les informations de contact, et les studios.
          </motion.p>
          <motion.button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md flex items-center"
            onClick={handleLogout}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Déconnexion
          </motion.button>
        </div>
      </motion.div>

      {saveSuccess && (
        <motion.div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md m-4 max-w-7xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Données enregistrées avec succès
          </div>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md m-4 max-w-7xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        </motion.div>
      )}

      {/* About Content Section */}
      <section className="py-16 bg-blue-950">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <Info className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Gérer le Contenu À Propos</h2>
          </motion.div>
          <motion.div className="bg-white rounded-xl shadow-lg p-6 mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <form onSubmit={(e) => handleSubmit(e, 'aboutContent', 'about-content')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="history_title" className="block text-sm font-medium text-gray-700 mb-1">Titre de l'Histoire</label>
                  <input type="text" id="history_title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.aboutContent.history_title} onChange={(e) => handleInputChange(e, 'aboutContent')} required />
                </div>
                <div>
                  <label htmlFor="history_subtitle" className="block text-sm font-medium text-gray-700 mb-1">Sous-titre de l'Histoire</label>
                  <input type="text" id="history_subtitle" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.aboutContent.history_subtitle} onChange={(e) => handleInputChange(e, 'aboutContent')} required />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="history_text1" className="block text-sm font-medium text-gray-700 mb-1">Texte de l'Histoire 1</label>
                  <Editor
                    apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                    value={formData.aboutContent.history_text1}
                    onEditorChange={(content) => handleEditorChange(content, 'aboutContent', 'history_text1')}
                    init={{
                      ...editorInit,
                      placeholder: 'Texte de l\'histoire 1',
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="history_text2" className="block text-sm font-medium text-gray-700 mb-1">Texte de l'Histoire 2</label>
                  <Editor
                    apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                    value={formData.aboutContent.history_text2}
                    onEditorChange={(content) => handleEditorChange(content, 'aboutContent', 'history_text2')}
                    init={{
                      ...editorInit,
                      placeholder: 'Texte de l\'histoire 2',
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="mission_title" className="block text-sm font-medium text-gray-700 mb-1">Titre de la Mission</label>
                  <input type="text" id="mission_title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.aboutContent.mission_title} onChange={(e) => handleInputChange(e, 'aboutContent')} required />
                </div>
                <div>
                  <label htmlFor="mission_subtitle" className="block text-sm font-medium text-gray-700 mb-1">Sous-titre de la Mission</label>
                  <input type="text" id="mission_subtitle" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.aboutContent.mission_subtitle} onChange={(e) => handleInputChange(e, 'aboutContent')} required />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="mission_text" className="block text-sm font-medium text-gray-700 mb-1">Texte de la Mission</label>
                  <Editor
                    apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                    value={formData.aboutContent.mission_text}
                    onEditorChange={(content) => handleEditorChange(content, 'aboutContent', 'mission_text')}
                    init={{
                      ...editorInit,
                      placeholder: 'Texte de la mission',
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="vision_title" className="block text-sm font-medium text-gray-700 mb-1">Titre de la Vision</label>
                  <input type="text" id="vision_title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.aboutContent.vision_title} onChange={(e) => handleInputChange(e, 'aboutContent')} required />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="vision_text" className="block text-sm font-medium text-gray-700 mb-1">Texte de la Vision</label>
                  <Editor
                    apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                    value={formData.aboutContent.vision_text}
                    onEditorChange={(content) => handleEditorChange(content, 'aboutContent', 'vision_text')}
                    init={{
                      ...editorInit,
                      placeholder: 'Texte de la vision',
                    }}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editingItem?.section === 'aboutContent' ? 'Mettre à jour' : 'Ajouter'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
          {aboutContent && (
            <motion.div className="bg-white rounded-xl shadow-lg p-6" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{aboutContent.history_title}</h3>
              <p className="text-gray-600 mb-2">{aboutContent.history_subtitle}</p>
              <div className="text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: aboutContent.history_text1 }} />
              <div className="text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: aboutContent.history_text2 }} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{aboutContent.mission_title}</h3>
              <p className="text-gray-600 mb-2">{aboutContent.mission_subtitle}</p>
              <div className="text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: aboutContent.mission_text }} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{aboutContent.vision_title}</h3>
              <div className="text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: aboutContent.vision_text }} />
              <div className="mt-4 flex gap-2 justify-end">
                <motion.button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEdit(aboutContent, 'aboutContent')}>
                  <Edit className="w-5 h-5" />
                </motion.button>
                <motion.button className="p-2 bg-red-600 text-white rounded hover:bg-red-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(aboutContent.id, 'about-content', 'aboutContent')}>
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-16 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <Users className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Gérer l'Équipe</h2>
          </motion.div>
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowTeamForm((v) => !v)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showTeamForm ? 'Fermer le formulaire' : 'Ajouter un membre'}
            </button>
          </div>
          {showTeamForm && (
            <motion.div className="bg-white rounded-xl shadow-lg p-6 mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <form onSubmit={(e) => handleSubmit(e, 'teamMember', 'team-members')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" id="name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.teamMember.name} onChange={(e) => handleInputChange(e, 'teamMember')} required />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <input type="text" id="role" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.teamMember.role} onChange={(e) => handleInputChange(e, 'teamMember')} required />
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Image (max 2MB, sera redimensionnée à 500x500)</label>
                  <input type="file" id="image" accept="image/jpeg,image/png" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => handleImageChange(e, 'teamMember')} />
                  <p className="mt-1 text-xs text-gray-500">L'image sera automatiquement redimensionnée à 500x500 pixels.</p>
                  {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 preview-image" />}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <Editor
                    apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                    value={formData.teamMember.bio}
                    onEditorChange={(content) => handleEditorChange(content, 'teamMember', 'bio')}
                    init={{
                      ...editorInit,
                      file_picker_callback: (cb) => filePickerCallback(cb, 'teamMember'),
                      placeholder: 'Biographie du membre de l\'équipe',
                    }}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={isSaving || !!imageError}>
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editingItem?.section === 'teamMember' ? 'Mettre à jour' : 'Ajouter'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
          )}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg" onClick={() => handleScroll('team-scroll-container', -1)} aria-label="Précédent">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg" onClick={() => handleScroll('team-scroll-container', 1)} aria-label="Suivant">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div id="team-scroll-container" ref={teamScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
              {teamMembers.map((member, index) => (
                <motion.div key={member.id} className="flex-none w-full sm:w-1/2 lg:w-1/4 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md h-full">
                    <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
                      <img
                        src={member.image_url ? `${staticUrl}${member.image_url}` : '/api/placeholder/400/600'}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                      <div className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: member.bio }} />
                      <div className="mt-4 flex gap-2 justify-end">
                        <motion.button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEdit(member, 'teamMember')}>
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        <motion.button className="p-2 bg-red-600 text-white rounded hover:bg-red-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(member.id, 'team-members', 'teamMembers')}>
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <MobileScrollIndicator containerId="team-scroll-container" light={true} />
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-16 bg-blue-950">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <Calendar className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Gérer les Jalons</h2>
          </motion.div>
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowMilestoneForm((v) => !v)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showMilestoneForm ? 'Fermer le formulaire' : 'Ajouter un jalon'}
            </button>
          </div>
          {showMilestoneForm && (
            <motion.div className="bg-white rounded-xl shadow-lg p-6 mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <form onSubmit={(e) => handleSubmit(e, 'milestone', 'milestones')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                  <input type="number" id="year" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.milestone.year} onChange={(e) => handleInputChange(e, 'milestone')} required />
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input type="text" id="title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.milestone.title} onChange={(e) => handleInputChange(e, 'milestone')} required />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Editor
                    apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                    value={formData.milestone.description}
                    onEditorChange={(content) => handleEditorChange(content, 'milestone', 'description')}
                    init={{
                      ...editorInit,
                      placeholder: 'Description du jalon',
                    }}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editingItem?.section === 'milestone' ? 'Mettre à jour' : 'Ajouter'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
          )}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg" onClick={() => handleScroll('milestone-scroll-container', -1)} aria-label="Précédent">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg" onClick={() => handleScroll('milestone-scroll-container', 1)} aria-label="Suivant">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div id="milestone-scroll-container" ref={milestoneScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
              {milestones.map((milestone, index) => (
                <motion.div key={milestone.id} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md h-full p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.year}</h3>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h4>
                    <div className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: milestone.description }} />
                    <div className="mt-4 flex gap-2 justify-end">
                      <motion.button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEdit(milestone, 'milestone')}>
                        <Edit className="w-5 h-5" />
                      </motion.button>
                      <motion.button className="p-2 bg-red-600 text-white rounded hover:bg-red-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(milestone.id, 'milestones', 'milestones')}>
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <MobileScrollIndicator containerId="milestone-scroll-container" light={true} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Gérer les Statistiques</h2>
          </motion.div>
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowStatForm((v) => !v)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showStatForm ? 'Fermer le formulaire' : 'Ajouter une statistique'}
            </button>
          </div>
          {showStatForm && (
            <motion.div className="bg-white rounded-xl shadow-lg p-6 mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <form onSubmit={(e) => handleSubmit(e, 'stat', 'stats')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" id="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.stat.number} onChange={(e) => handleInputChange(e, 'stat')} required />
                </div>
                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">Étiquette</label>
                  <input type="text" id="label" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.stat.label} onChange={(e) => handleInputChange(e, 'stat')} required />
                </div>
                <div>
                  <label htmlFor="icon_name" className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                  <select id="icon_name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.stat.icon_name || ''} onChange={(e) => handleInputChange(e, 'stat')}>
                    <option value="">Aucune icône</option>
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editingItem?.section === 'stat' ? 'Mettre à jour' : 'Ajouter'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
          )}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg" onClick={() => handleScroll('stats-scroll-container', -1)} aria-label="Précédent">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg" onClick={() => handleScroll('stats-scroll-container', 1)} aria-label="Suivant">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div id="stats-scroll-container" ref={statsScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
              {stats.map((stat, index) => (
                <motion.div key={stat.id} className="flex-none w-full sm:w-1/2 lg:w-1/4 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md h-full p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {stat.icon_name && <span className="text-blue-600">{stat.icon_name}</span>}
                      <h3 className="text-2xl font-bold text-gray-900">{stat.number}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <div className="mt-4 flex gap-2 justify-end">
                      <motion.button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEdit(stat, 'stat')}>
                        <Edit className="w-5 h-5" />
                      </motion.button>
                      <motion.button className="p-2 bg-red-600 text-white rounded hover:bg-red-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(stat.id, 'stats', 'stats')}>
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <MobileScrollIndicator containerId="stats-scroll-container" light={true} />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-blue-950">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <Award className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Gérer les Valeurs</h2>
          </motion.div>
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowValueForm((v) => !v)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showValueForm ? 'Fermer le formulaire' : 'Ajouter une valeur'}
            </button>
          </div>
          {showValueForm && (
            <motion.div className="bg-white rounded-xl shadow-lg p-6 mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <form onSubmit={(e) => handleSubmit(e, 'value', 'values')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input type="text" id="title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.value.title} onChange={(e) => handleInputChange(e, 'value')} required />
                </div>
                <div>
                  <label htmlFor="icon_name" className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                  <select id="icon_name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.value.icon_name || ''} onChange={(e) => handleInputChange(e, 'value')}>
                    <option value="">Aucune icône</option>
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Editor
                    apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                    value={formData.value.description}
                    onEditorChange={(content) => handleEditorChange(content, 'value', 'description')}
                    init={{
                      ...editorInit,
                      placeholder: 'Description de la valeur',
                    }}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editingItem?.section === 'value' ? 'Mettre à jour' : 'Ajouter'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
          )}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg" onClick={() => handleScroll('values-scroll-container', -1)} aria-label="Précédent">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button className="p-2 bg-blue-600 text-white rounded-full shadow-lg" onClick={() => handleScroll('values-scroll-container', 1)} aria-label="Suivant">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div id="values-scroll-container" ref={valuesScrollContainerRef} className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
              {values.map((value, index) => (
                <motion.div key={value.id} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4 first:pl-0 last:pr-0 snap-start" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md h-full p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {value.icon_name && <span className="text-blue-600">{value.icon_name}</span>}
                      <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                    </div>
                    <div className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: value.description }} />
                    <div className="mt-4 flex gap-2 justify-end">
                      <motion.button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEdit(value, 'value')}>
                        <Edit className="w-5 h-5" />
                      </motion.button>
                      <motion.button className="p-2 bg-red-600 text-white rounded hover:bg-red-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(value.id, 'values', 'values')}>
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <MobileScrollIndicator containerId="values-scroll-container" light={true} />
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-center gap-3 mb-12 justify-center text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <motion.div className="bg-white p-2 rounded-lg inline-flex" initial={{ rotate: -10, scale: 0.9 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ rotate: 5, scale: 1.1 }}>
              <Map className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Gérer les Informations de Contact</h2>
          </motion.div>
          <motion.div className="bg-white rounded-xl shadow-lg p-6 mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <form onSubmit={(e) => handleSubmit(e, 'contactInfo', 'contact-info')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input type="text" id="address" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.contactInfo.address} onChange={(e) => handleInputChange(e, 'contactInfo')} required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.contactInfo.email} onChange={(e) => handleInputChange(e, 'contactInfo')} required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="text" id="phone" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.contactInfo.phone} onChange={(e) => handleInputChange(e, 'contactInfo')} required />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editingItem?.section === 'contactInfo' ? 'Mettre à jour' : 'Ajouter'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
          {contactInfo && (
            <motion.div className="bg-white rounded-xl shadow-lg p-6" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{studios.title}</h3>
    <div className="w-full max-w-sm mx-auto mb-4" style={{ aspectRatio: '2/3' }}>
  <img
    src={studios.image_path ? `${staticUrl}${studios.image_path}` : '/api/placeholder/400/600'}
    alt={studios.title}
    className="w-full h-full object-cover rounded-lg"
  />
</div>
    <p className="text-gray-600 dark:text-gray-300 mb-2">{studios.description}</p>
    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 mb-2">
      {studios.features.split('\n').map((feature, index) => (
        <li key={index}>{feature}</li>
      ))}
    </ul>
    <p className="text-gray-600 dark:text-gray-300">{studios.collaboration_text}</p>
    <div className="mt-4 flex gap-2 justify-end">
      <motion.button
        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleEdit(studios, 'studios')}
        aria-label="Modifier le studio"
      >
        <Edit className="w-5 h-5" />
      </motion.button>
      <motion.button
        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleDelete(studios.id, 'studios', 'studios')}
        aria-label="Supprimer le studio"
      >
        <Trash2 className="w-5 h-5" />
      </motion.button>
    </div>
  </motion.div>
)}
        </div>
      </section>
    </motion.main>
  );
};

export default AProposDashboard;
