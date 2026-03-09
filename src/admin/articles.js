"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, RefreshCw, Check, X, Clock, Send } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Articles = ({ apiUrl = API_BASE_URL }) => {
  // State initialization
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [state, setState] = useState({
    articles: [],
    categories: [],
    sections: [],
    loading: true,
    error: null,
    searchQuery: '',
    isEditing: false,
    currentArticle: null,
    filters: {
      mostRead: false,
      stories: false,
      artists: false,
    },
    formData: {
      title: '',
      content: '',
      category_id: '',
      section_id: '',
      status: 'draft',
      alauneactual: false,
      videoactual: false,
      eventactual: false,
      mostread: false,
      is_story: false,
      is_cinema: false,
      is_comedy: false,
      is_sport: false,
      is_rap: false,
      is_afrotcham: false,
      is_buzz: false,
      is_alaune: false,
      science: false,
      is_artist: false,
      contenurecent: false,
      image: null,
      video: null,
      duration: '',
      author_name: '',
      story_expires_at: null,
    },
    imagePreview: null,
    videoPreview: null,
    expiredStories: 0,
  });

  // Check authentication and fetch initial data
  useEffect(() => {
    const accessToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (accessToken && refreshToken) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  // Update expired stories count
  useEffect(() => {
    const expiredStories = state.articles.filter(
      (a) => a.is_story && a.story_expires_at && new Date(a.story_expires_at) <= new Date()
    ).length;
    setState((prev) => ({ ...prev, expiredStories }));
  }, [state.articles]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: loginData.username,
          password: loginData.password,
        }),
      });
      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_info', JSON.stringify(data.user_info));
      setIsAuthenticated(true);
      fetchData();
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  // Refresh token handler
  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (!storedRefreshToken) return null;
    try {
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return data.access_token;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  // Fetch articles, categories, and sections
  const fetchData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      let token = localStorage.getItem('token');
      if (!token) {
        token = await refreshToken();
        if (!token) {
          setIsAuthenticated(false);
          alert('Your session has expired. Please log in again.');
          localStorage.clear();
          return;
        }
      }
      const headers = { Authorization: `Bearer ${token}` };
      let [articlesRes, categoriesRes, sectionsRes] = await Promise.all([
        fetch(`${apiUrl}/api/articles/?status=published`, { headers }).catch((err) => ({
          ok: false,
          status: 500,
          statusText: `Network error: ${err.message}`,
        })),
        fetch(`${apiUrl}/api/categories/`, { headers }).catch(() => ({ ok: false })),
        fetch(`${apiUrl}/api/sections/`, { headers }).catch(() => ({ ok: false })),
      ]);

      if (!articlesRes.ok) {
        if (articlesRes.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            const retryRes = await fetch(`${apiUrl}/api/articles/?status=published`, { headers });
            if (retryRes.ok) articlesRes = retryRes;
          }
        }
        if (!articlesRes.ok) {
          setIsAuthenticated(false);
          alert('Your session has expired. Please log in again.');
          localStorage.clear();
          throw new Error('Failed to retrieve articles');
        }
      }
      if (!categoriesRes.ok) throw new Error('Failed to retrieve categories');
      const articles = await articlesRes.json();
      const categories = await categoriesRes.json();
      const sections = sectionsRes.ok ? await sectionsRes.json() : [];
      const defaultSectionId = sections.find((s) => s.name === 'Contenus Récents')?.id || sections[0]?.id || '';
      setState((prev) => ({
        ...prev,
        articles,
        categories,
        sections,
        loading: false,
        formData: {
          ...prev.formData,
          category_id: categories[0]?.id || '',
          section_id: defaultSectionId,
        },
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  // Form input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value,
      },
    }));
  };

  const handleEditorChange = (content) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        content,
      },
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setState((prev) => {
      const newFormData = {
        ...prev.formData,
        [name]: checked,
      };
      if (name === 'is_story' && checked) {
        newFormData.story_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      } else if (name === 'is_story' && !checked) {
        newFormData.story_expires_at = null;
      }
      if (name === 'contenurecent' && checked) {
        const contenusRecentsSection = prev.sections.find((section) => section.name === 'Contenus Récents');
        if (contenusRecentsSection) {
          newFormData.section_id = contenusRecentsSection.id;
        }
      }
      return {
        ...prev,
        formData: newFormData,
      };
    });
  };

  const handleFilterChange = (filterType) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: !prev.filters[filterType],
      },
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) {
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, [type]: null },
        [`${type}Preview`]: null,
      }));
      return;
    }
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
      alert('Only MP4 and WebM videos are supported');
      e.target.value = '';
      return;
    }
    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      alert('Only JPG/PNG images are supported');
      e.target.value = '';
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (type === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        setState((prev) => ({
          ...prev,
          formData: {
            ...prev.formData,
            video: file,
            duration: Math.round(video.duration),
          },
          videoPreview: previewUrl,
        }));
      };
      video.src = previewUrl;
      video.load();
    } else {
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, [type]: file },
        [`${type}Preview`]: previewUrl,
      }));
    }
  };

  // Handle image load errors
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (parent) {
      const defaultIcon = parent.querySelector('.default-icon');
      if (defaultIcon) defaultIcon.style.display = 'block';
    }
  };

  // Utility to format image/video URLs
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith('http') || imageUrl.startsWith('//')
      ? imageUrl
      : `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  };

  // TinyMCE file picker callback
  const filePickerCallback = (callback, value, meta) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', meta.filetype === 'image' ? 'image/jpeg,image/png,image/jpg' : 'video/mp4,video/webm');
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const allowedVideoTypes = ['video/mp4', 'video/webm'];
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const type = meta.filetype === 'image' ? 'image' : 'video';
      if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
        alert('Only MP4 and WebM videos are supported');
        return;
      }
      if (type === 'image' && !allowedImageTypes.includes(file.type)) {
        alert('Only JPG/PNG images are supported');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, [type]: file },
        [`${type}Preview`]: previewUrl,
      }));
      callback(previewUrl, { alt: file.name });
    };
    input.click();
  };

  // Save or update article
  const saveArticle = async (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { currentArticle, formData } = state;
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' && key !== 'video' && value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
      if (formData.image) formDataToSend.append('image', formData.image);
      if (formData.video) formDataToSend.append('video', formData.video);

      let token = localStorage.getItem('token');
      const url = currentArticle ? `${apiUrl}/api/articles/${currentArticle.id}` : `${apiUrl}/api/articles/`;
      const method = currentArticle ? 'PUT' : 'POST';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          token = await refreshToken();
          if (token) {
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 30000);
            response = await fetch(url, {
              method,
              headers: { Authorization: `Bearer ${token}` },
              body: formDataToSend,
              signal: retryController.signal,
            });
            clearTimeout(retryTimeoutId);
          } else {
            setIsAuthenticated(false);
            alert('Your session has expired. Please log in again.');
            localStorage.clear();
            throw new Error('Authentication failed');
          }
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to save article');
        }
      }

      const newArticle = await response.json();
      setState((prev) => {
        let updatedContent = prev.formData.content;
        if (newArticle.image_url && prev.imagePreview?.startsWith('blob:')) {
          const imageUrl = getImageUrl(newArticle.image_url);
          updatedContent = updatedContent.replaceAll(prev.imagePreview, imageUrl);
        }
        if (newArticle.video_url && prev.videoPreview?.startsWith('blob:')) {
          const videoUrl = getImageUrl(newArticle.video_url);
          updatedContent = updatedContent.replaceAll(prev.videoPreview, videoUrl);
        }
        return {
          ...prev,
          articles: currentArticle
            ? prev.articles.map((a) => (a.id === newArticle.id ? newArticle : a))
            : [...prev.articles, newArticle],
          isEditing: false,
          currentArticle: null,
          formData: {
            title: '',
            content: updatedContent,
            category_id: prev.categories[0]?.id || '',
            section_id: prev.sections.find((s) => s.name === 'Contenus Récents')?.id || prev.sections[0]?.id || '',
            status: 'draft',
            alauneactual: false,
            videoactual: false,
            eventactual: false,
            mostread: false,
            is_story: false,
            is_cinema: false,
            is_comedy: false,
            is_sport: false,
            is_rap: false,
            is_afrotcham: false,
            is_buzz: false,
            is_alaune: false,
            science: false,
            is_artist: false,
            contenurecent: false,
            image: null,
            video: null,
            duration: '',
            author_name: '',
            story_expires_at: null,
          },
          imagePreview: null,
          videoPreview: null,
          loading: false,
        };
      });
      alert(currentArticle ? 'Article updated successfully' : 'Article created successfully');
    } catch (error) {
      console.error('Error saving article:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      alert(`Error: ${error.message}`);
    }
  };

  // Publish article
  const publishArticle = async (articleId) => {
    if (!confirm('Are you sure you want to publish this article?')) return;
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      let token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('status', 'published');
      let response = await fetch(`${apiUrl}/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        if (response.status === 401) {
          token = await refreshToken();
          if (token) {
            response = await fetch(`${apiUrl}/api/articles/${articleId}`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` },
              body: formDataToSend,
            });
          } else {
            setIsAuthenticated(false);
            alert('Your session has expired. Please log in again.');
            localStorage.clear();
            throw new Error('Authentication failed');
          }
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to publish article');
        }
      }

      const updatedArticle = await response.json();
      setState((prev) => ({
        ...prev,
        articles: prev.articles.map((a) => (a.id === updatedArticle.id ? updatedArticle : a)),
        loading: false,
      }));
      alert('Article published successfully');
    } catch (error) {
      console.error('Error publishing article:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      alert(`Error: ${error.message}`);
    }
  };

  // Delete article
  const deleteArticle = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      let token = localStorage.getItem('token');
      let response = await fetch(`${apiUrl}/api/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          token = await refreshToken();
          if (token) {
            response = await fetch(`${apiUrl}/api/articles/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
          } else {
            setIsAuthenticated(false);
            alert('Your session has expired. Please log in again.');
            localStorage.clear();
            throw new Error('Authentication failed');
          }
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete article');
        }
      }

      setState((prev) => ({
        ...prev,
        articles: prev.articles.filter((article) => article.id !== id),
        loading: false,
      }));
      alert('Article deleted successfully');
    } catch (error) {
      console.error('Error deleting article:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      alert(`Error: ${error.message}`);
    }
  };

  // Edit article
  const editArticle = (article) => {
    setState((prev) => ({
      ...prev,
      isEditing: true,
      currentArticle: article,
      formData: {
        title: article.title,
        content: article.content,
        category_id: article.category_id,
        section_id: article.section_id || '',
        status: article.status,
        alauneactual: article.alauneactual,
        videoactual: article.videoactual,
        eventactual: article.eventactual,
        mostread: article.mostread,
        is_story: article.is_story,
        is_cinema: article.is_cinema,
        is_comedy: article.is_comedy,
        is_sport: article.is_sport,
        is_rap: article.is_rap,
        is_afrotcham: article.is_afrotcham,
        is_buzz: article.is_buzz,
        is_alaune: article.is_alaune,
        science: article.science,
        is_artist: article.is_artist,
        contenurecent: article.contenurecent,
        image: null,
        video: null,
        duration: article.duration || '',
        author_name: article.author_name || '',
        story_expires_at: article.story_expires_at ? new Date(article.story_expires_at).toISOString().slice(0, 16) : null,
      },
      imagePreview: article.image_url,
      videoPreview: article.video_url,
    }));
  };

  // Cancel edit
  const cancelEdit = () => {
    setState((prev) => ({
      ...prev,
      isEditing: false,
      currentArticle: null,
      formData: {
        title: '',
        content: '',
        category_id: prev.categories[0]?.id || '',
        section_id: prev.sections.find((s) => s.name === 'Contenus Récents')?.id || prev.sections[0]?.id || '',
        status: 'draft',
        alauneactual: false,
        videoactual: false,
        eventactual: false,
        mostread: false,
        is_story: false,
        is_cinema: false,
        is_comedy: false,
        is_sport: false,
        is_rap: false,
        is_afrotcham: false,
        is_buzz: false,
        is_alaune: false,
        science: false,
        is_artist: false,
        contenurecent: false,
        image: null,
        video: null,
        duration: '',
        author_name: '',
        story_expires_at: null,
      },
      imagePreview: null,
      videoPreview: null,
    }));
  };

  // Utility functions
  const totalViews = state.articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const averageViews = state.articles.length ? totalViews / state.articles.length : 0;

  const categoryMap = state.categories.reduce((map, cat) => {
    map[cat.id] = cat.name;
    return map;
  }, {});
  const sectionMap = state.sections.reduce((map, sec) => {
    map[sec.id] = sec.name;
    return map;
  }, {});
  const getCategoryName = (categoryId) => categoryMap[categoryId] || 'Uncategorized';
  const getSectionName = (sectionId) => sectionMap[sectionId] || 'None';

  // Filter articles
  const filteredArticles = state.articles.filter((article) => {
    const categoryName = getCategoryName(article.category_id).toLowerCase();
    const sectionName = getSectionName(article.section_id).toLowerCase();
    const searchLower = state.searchQuery.toLowerCase();
    const matchesSearch = (
      article.title.toLowerCase().includes(searchLower) ||
      article.status.toLowerCase().includes(searchLower) ||
      categoryName.includes(searchLower) ||
      sectionName.includes(searchLower)
    );
    const isStory = article.is_story && (!article.story_expires_at || new Date(article.story_expires_at) > new Date());
    const isMostRead = article.views > averageViews;
    const isArtist = article.is_artist || false;

    if (state.filters.mostRead && state.filters.stories && state.filters.artists) {
      return matchesSearch && (isMostRead || isStory || isArtist);
    }
    if (state.filters.mostRead) return matchesSearch && isMostRead;
    if (state.filters.stories) return matchesSearch && isStory;
    if (state.filters.artists) return matchesSearch && isArtist;
    return matchesSearch;
  });

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusMap = {
      published: { color: 'green', icon: <Check className="w-3 h-3" /> },
      draft: { color: 'gray', icon: <FileText className="w-3 h-3" /> },
      pending: { color: 'yellow', icon: <Clock className="w-3 h-3" /> },
    };
    const { color, icon } = statusMap[status] || { color: 'blue', icon: null };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-200 border border-${color}-200`}>
        {icon && <span className="mr-1">{icon}</span>}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const isAdmin = userInfo.role === 'admin';

  // Render login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-6 relative">
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600 peer"
                required
                placeholder=" "
                id="username"
                aria-label="Username"
              />
              <label
                htmlFor="username"
                className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
              >
                Username
              </label>
            </div>
            <div className="mb-6 relative">
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600 peer"
                required
                placeholder=" "
                id="password"
                aria-label="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
              >
                Password
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main dashboard rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <FileText className="mr-3 text-indigo-500" /> Article Management
          </h1>
          {!state.isEditing ? (
            <button
              id="add-new-article-button"
              onClick={() => setState((prev) => ({ ...prev, isEditing: true }))}
              className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Add new article"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Article
            </button>
          ) : (
            <button
              onClick={cancelEdit}
              className="inline-flex items-center px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Cancel editing"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </button>
          )}
        </div>

        {/* Expired stories notification */}
        {state.expiredStories > 0 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg shadow-md">
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">Note:</p>
            <p className="text-yellow-700 dark:text-yellow-300">
              {state.expiredStories} story article(s) hidden due to expiration.
            </p>
          </div>
        )}

        {/* Error display */}
        {state.error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex">
              <X className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="font-semibold text-red-800 dark:text-red-200">Error:</p>
                <p className="text-red-700 dark:text-red-300">
                  {state.error}. Please check:
                  <ul className="list-disc pl-5 mt-1">
                    <li>API server is running at {apiUrl}</li>
                    <li>API endpoints: /api/articles/, /api/categories/, /api/sections/</li>
                    <li>Check browser console for details</li>
                    <li>Ensure valid login credentials</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {!state.isEditing && (
          <div className="mb-6 flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={state.filters.mostRead}
                onChange={() => handleFilterChange('mostRead')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                aria-label="Most read articles"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Most Read</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={state.filters.stories}
                onChange={() => handleFilterChange('stories')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                aria-label="Stories"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Stories</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={state.filters.artists}
                onChange={() => handleFilterChange('artists')}
                className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
                aria-label="Artists"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Artists</span>
            </label>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Refresh articles"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        )}

        {/* Article form */}
        {state.isEditing && (
          <form onSubmit={saveArticle} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {state.currentArticle ? 'Edit Article' : 'Create Article'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  name="title"
                  value={state.formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600 peer"
                  required
                  placeholder=" "
                  id="title"
                  aria-label="Article title"
                />
                <label
                  htmlFor="title"
                  className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
                >
                  Title *
                </label>
              </div>
              <div className="relative">
                <select
                  name="category_id"
                  value={state.formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600"
                  required
                  aria-label="Category"
                >
                  <option value="" className="text-gray-900 dark:text-white">Select Category</option>
                  {state.categories.map((category) => (
                    <option key={category.id} value={category.id} className="text-gray-900 dark:text-white">
                      {category.name}
                    </option>
                  ))}
                </select>
                <label className="absolute -top-6 left-4 text-sm text-gray-500 dark:text-gray-400">Category *</label>
              </div>
              <div className="relative">
                <select
                  name="section_id"
                  value={state.formData.section_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600"
                  aria-label="Section"
                >
                  <option value="" className="text-gray-900 dark:text-white">Select Section</option>
                  {state.sections.map((section) => (
                    <option key={section.id} value={section.id} className="text-gray-900 dark:text-white">
                      {section.name}
                    </option>
                  ))}
                </select>
                <label className="absolute -top-6 left-4 text-sm text-gray-500 dark:text-gray-400">Section</label>
              </div>
              <div className="relative">
                <select
                  name="status"
                  value={state.formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600"
                  aria-label="Status"
                >
                  <option value="draft" className="text-gray-900 dark:text-white">Draft</option>
                  <option value="published" className="text-gray-900 dark:text-white">Published</option>
                  <option value="pending" className="text-gray-900 dark:text-white">Pending</option>
                </select>
                <label className="absolute -top-6 left-4 text-sm text-gray-500 dark:text-gray-400">Status *</label>
              </div>
              {isAdmin && (
                <div className="relative">
                  <input
                    type="text"
                    name="author_name"
                    value={state.formData.author_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600 peer"
                    placeholder=" "
                    id="author_name"
                    aria-label="Author name"
                  />
                  <label
                    htmlFor="author_name"
                    className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
                  >
                    Author Name (Optional)
                  </label>
                </div>
              )}
              {state.formData.is_story && (
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="story_expires_at"
                    value={state.formData.story_expires_at || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600 peer"
                    required={state.formData.is_story}
                    id="story_expires_at"
                    aria-label="Story expiration"
                  />
                  <label
                    htmlFor="story_expires_at"
                    className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
                  >
                    Story Expiration
                  </label>
                </div>
              )}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5'}
                value={state.formData.content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 400,
                  menubar: true,
                  plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount',
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | removeformat | help',
                  file_picker_callback: filePickerCallback,
                  file_picker_types: 'image media',
                  content_style: `
                    body { 
                      font-family: Inter, sans-serif; 
                      font-size: 14px; 
                      background: ${document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff'}; 
                      color: ${document.documentElement.classList.contains('dark') ? '#fff' : '#000'}; 
                    }
                    .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
                      color: ${document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'};
                    }
                  `,
                  skin: document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
                  content_css: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
                  placeholder: 'Article Content',
                }}
              />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 border border-gray-300 dark:border-gray-600"
                  aria-label="Upload image"
                />
                {state.imagePreview && (
                  <img
                    src={state.imagePreview}
                    alt="Preview"
                    className="mt-4 max-w-xs w-full h-auto object-contain rounded-lg shadow-md"
                    loading="lazy"
                    onError={handleImageError}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video</label>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => handleFileChange(e, 'video')}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 border border-gray-300 dark:border-gray-600"
                  aria-label="Upload video"
                />
                {state.videoPreview && (
                  <video
                    src={state.videoPreview}
                    controls
                    className="mt-4 max-w-xs w-full h-auto rounded-lg shadow-md"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'mostread', label: 'Most Read' },
                { name: 'is_story', label: 'Story' },
                { name: 'is_cinema', label: 'Cinema' },
                { name: 'is_comedy', label: 'Comedy' },
                { name: 'is_sport', label: 'Sport' },
                { name: 'is_rap', label: 'Rap' },
                { name: 'is_afrotcham', label: 'Afrotcham' },
                { name: 'is_buzz', label: 'Buzz' },
                { name: 'is_alaune', label: 'À la Une' },
                { name: 'alauneactual', label: 'À la Une Actual' },
                { name: 'videoactual', label: 'Video Actual' },
                { name: 'eventactual', label: 'Event Actual' },
                { name: 'science', label: 'Science' },
                { name: 'is_artist', label: 'Artist' },
                { name: 'contenurecent', label: 'Recent Content' },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={name}
                    checked={state.formData[name]}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                    aria-label={label}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-4 justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Cancel"
              >
                <X className="mr-2" size={18} /> Cancel
              </button>
              <button
                type="submit"
                disabled={state.loading}
                className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center shadow-md transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label={state.currentArticle ? 'Update article' : 'Create article'}
              >
                {state.loading ? (
                  <RefreshCw className="mr-2" size={18} />
                ) : (
                  <Check className="mr-2" size={18} />
                )}
                {state.currentArticle ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        )}

        {/* Loading spinner */}
        {state.loading && !state.isEditing && (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Articles table */}
        {!state.isEditing && !state.loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-x-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={state.searchQuery}
                  onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600"
                  aria-label="Search articles"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {filteredArticles.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No published articles found. Create or publish an article to see it here.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-4 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-4 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                    <th className="px-4 py-4 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-4 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Story</th>
                    <th className="px-4 py-4 sm:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredArticles.map((article, index) => (
                    <tr
                      key={article.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border relative">
                            {article.image_url ? (
                              <>
                                <img
                                  src={getImageUrl(article.image_url)}
                                  alt={article.title}
                                  className="h-10 w-full object-contain"
                                  loading="lazy"
                                  onError={handleImageError}
                                />
                                <FileText
                                  className="default-icon h-6 w-6 text-gray-400 dark:text-gray-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                  style={{ display: 'none' }}
                                />
                              </>
                            ) : (
                              <FileText className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{article.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{getCategoryName(article.category_id)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">{renderStatusBadge(article.status)}</td>
                      <td className="px-4 py-4 sm:px-6 text-sm text-gray-500 dark:text-gray-400">{getSectionName(article.section_id)}</td>
                      <td className="px-4 py-4 sm:px-6 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(article.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        {article.is_story ? (
                          !article.story_expires_at || new Date(article.story_expires_at) > new Date() ? (
                            <Check className="text-green-500" size={18} />
                          ) : (
                            <Clock className="text-red-500" size={18} title="Expired" />
                          )
                        ) : (
                          <X className="text-red-500" size={18} />
                        )}
                      </td>
                      <td className="px-4 py-4 sm:px-6 flex gap-3">
                        <button
                          onClick={() => editArticle(article)}
                          className="text-indigo-500 hover:text-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          aria-label={`Edit article ${article.title}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          className="text-red-500 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          aria-label={`Delete article ${article.title}`}
                        >
                          <Trash2 size={18} />
                        </button>
                        {article.status !== 'published' && (
                          <button
                            onClick={() => publishArticle(article.id)}
                            className="text-green-500 hover:text-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            aria-label={`Publish article ${article.title}`}
                          >
                            <Send size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
