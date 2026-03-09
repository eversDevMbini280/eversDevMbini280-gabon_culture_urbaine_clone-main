'use client';
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Upload,
  Tag,
  AlertCircle,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const Images = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' }) => {
  const router = useRouter();
  const [advertisements, setAdvertisements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [adStatus, setAdStatus] = useState('draft');
  const [adPage, setAdPage] = useState('all');
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    redirect_url: '',
    status: 'draft',
    page: 'all',
    file: null,
  });

  // Fetch advertisements
  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const adsResponse = await fetch(`${apiUrl}/api/advertisements/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!adsResponse.ok) {
        const errorData = await adsResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch advertisements: ${adsResponse.status} ${adsResponse.statusText}`);
      }

      const adData = await adsResponse.json();
      setAdvertisements(adData);
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter advertisements based on search query
  const filteredAdvertisements = advertisements.filter(
    (ad) =>
      (ad.title?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '') ||
      (ad.status?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '') ||
      (ad.page?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '') ||
      (ad.created_at ? new Date(ad.created_at).toLocaleDateString('fr-FR') : '').includes(searchQuery || '')
  );

  // Handle image errors
  const handleImageError = (e, itemId, placeholderText, size = { width: 40, height: 40 }) => {
    if (!failedImages.has(itemId)) {
      setFailedImages((prev) => new Set(prev).add(itemId));
      e.target.src = FALLBACK_IMAGE;
      e.target.className = `${e.target.className} object-contain bg-gray-200`;
      e.target.loading = 'lazy';
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    let colorClass = '';
    switch (status) {
      case 'published':
        colorClass = 'bg-green-100 text-green-800 border-green-200';
        break;
      case 'draft':
        colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
        break;
      case 'expired':
        colorClass = 'bg-red-100 text-red-800 border-red-200';
        break;
      default:
        colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  // Render page badge
  const renderPageBadge = (page) => {
    let colorClass = '';
    switch (page) {
      case 'homepage':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'actualite':
        colorClass = 'bg-purple-100 text-purple-800';
        break;
      case 'culture_urbaine':
        colorClass = 'bg-pink-100 text-pink-800';
        break;
      case 'arts_traditions':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'sciences':
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'evenements':
        colorClass = 'bg-orange-100 text-orange-800';
        break;
      case 'entrepreneuriat':
        colorClass = 'bg-teal-100 text-teal-800';
        break;
      case 'direct_tv':
        colorClass = 'bg-red-100 text-red-800';
        break;
      case 'all':
        colorClass = 'bg-gray-100 text-gray-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {page
          ? page === 'all'
            ? 'All Pages'
            : page
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
          : 'Unknown'}
      </span>
    );
  };

  // Handle file upload
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      setError('Type de fichier non pris en charge. Veuillez utiliser JPG, PNG, WebP ou AVIF.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Fichier trop volumineux. La taille maximale est de 5MB.');
      return;
    }

    // Validate redirect URL if provided
    if (redirectUrl && !/^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(redirectUrl)) {
      setError('URL de redirection invalide. Veuillez entrer une URL valide (ex: https://example.com).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('status', adStatus);
    formData.append('page', adPage);
    if (redirectUrl) {
      formData.append('redirect_url', redirectUrl);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${apiUrl}/api/advertisements/`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const newItem = JSON.parse(xhr.responseText);
          setAdvertisements((prev) => [...prev, newItem]);
          if (adStatus === 'published') {
            setSuccessMessage(
              `Publicité téléchargée avec succès ! Elle est maintenant visible sur ${
                adPage === 'all' ? 'toutes les pages' : `la page ${adPage.split('_').join(' ')}`
              }.`
            );
          } else {
            setSuccessMessage('Publicité téléchargée avec succès. Changez le statut à "Publié" pour la rendre visible.');
          }
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            setRedirectUrl('');
            setAdStatus('draft');
            setAdPage('all');
          }, 1000);
        } else {
          let errorMessage;
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.detail || `Failed to upload advertisement: ${xhr.status} ${xhr.statusText}`;
          } catch (e) {
            errorMessage = `Failed to upload advertisement: ${xhr.status} ${xhr.statusText}`;
          }
          throw new Error(errorMessage);
        }
      };

      xhr.onerror = () => {
        throw new Error('Network error occurred while uploading advertisement');
      };

      xhr.send(formData);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Error uploading advertisement: ${err.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${apiUrl}/api/advertisements/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete advertisement: ${response.status} ${response.statusText}`);
      }

      setAdvertisements(advertisements.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Error deleting advertisement: ${err.message}`);
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${apiUrl}/api/advertisements/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to update advertisement status: ${response.status} ${response.statusText}`);
      }

      const updatedItem = await response.json();
      setAdvertisements(advertisements.map((item) => (item.id === id ? updatedItem : item)));
    } catch (err) {
      console.error('Status update error:', err);
      setError(`Error updating advertisement status: ${err.message}`);
    }
  };

  // Open edit modal
  const openEditModal = (ad) => {
    setEditingAd(ad);
    setEditForm({
      title: ad.title,
      redirect_url: ad.redirect_url || '',
      status: ad.status,
      page: ad.page,
      file: null,
    });
    setIsModalOpen(true);
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit file change
  const handleEditFileChange = (e) => {
    setEditForm((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAd) return;

    // Validate redirect URL
    if (editForm.redirect_url && !/^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(editForm.redirect_url)) {
      setError('URL de redirection invalide.');
      return;
    }

    // Validate file if provided
    if (editForm.file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      if (!validTypes.includes(editForm.file.type)) {
        setError('Type de fichier non pris en charge. Veuillez utiliser JPG, PNG, WebP ou AVIF.');
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (editForm.file.size > maxSize) {
        setError('Fichier trop volumineux. La taille maximale est de 5MB.');
        return;
      }
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    if (editForm.file) formData.append('file', editForm.file);
    if (editForm.title) formData.append('title', editForm.title);
    if (editForm.redirect_url) formData.append('redirect_url', editForm.redirect_url);
    formData.append('status', editForm.status);
    formData.append('page', editForm.page);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${apiUrl}/api/advertisements/${editingAd.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to update advertisement: ${response.status} ${response.statusText}`);
      }

      const updatedAd = await response.json();
      setAdvertisements(advertisements.map((ad) => (ad.id === editingAd.id ? updatedAd : ad)));
      setSuccessMessage('Publicité mise à jour avec succès !');
      setIsModalOpen(false);
      setEditingAd(null);
      setEditForm({ title: '', redirect_url: '', status: 'draft', page: 'all', file: null });
    } catch (err) {
      console.error('Edit error:', err);
      setError(`Error updating advertisement: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Retry fetching data
  const handleRetry = () => {
    fetchData();
  };

  return (
    <>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">Publicités</h2>
        <div className="flex space-x-2">
          <button
            className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={handleRetry}
            title="Rafraîchir"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter une publicité
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Succès</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erreur</p>
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 text-sm bg-red-200 px-3 py-1 rounded hover:bg-red-300 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Téléchargement en cours...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Advertisements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : filteredAdvertisements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Titre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Page
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdvertisements.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100">
                          <img
                            src={ad.image_url?.startsWith('http') ? ad.image_url : `${apiUrl}${ad.image_url}`}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, ad.id, ad.title, { width: 40, height: 40 })}
                            loading="lazy"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          {ad.redirect_url && (
                            <a
                              href={ad.redirect_url}
                              className="text-sm text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {ad.redirect_url}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Publicité
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {renderStatusBadge(ad.status)}
                        <div className="relative group">
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <div className="absolute left-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            <button
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              onClick={() => handleStatusChange(ad.id, 'draft')}
                            >
                              Brouillon
                            </button>
                            <button
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              onClick={() => handleStatusChange(ad.id, 'published')}
                            >
                              Publié
                            </button>
                            <button
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              onClick={() => handleStatusChange(ad.id, 'expired')}
                            >
                              Expiré
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderPageBadge(ad.page)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ad.created_at ? new Date(ad.created_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir"
                          onClick={() =>
                            window.open(
                              ad.image_url?.startsWith('http') ? ad.image_url : `${apiUrl}${ad.image_url}`,
                              '_blank'
                            )
                          }
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                          onClick={() => openEditModal(ad)}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                          onClick={() => handleDelete(ad.id)}
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
            <Tag className="w-16 h-16 text-gray-300 mb-4" />
            <p className="mb-2">Aucune publicité trouvée</p>
            <p className="text-sm text-gray-400">
              {searchQuery
                ? `Aucun résultat pour "${searchQuery}"`
                : 'Ajoutez des publicités en cliquant sur le bouton "Ajouter une publicité"'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Télécharger des publicités</h3>
          <p className="text-sm text-gray-500 mt-1">Formats pris en charge: JPG, PNG, WebP, AVIF</p>
        </div>

        <div className="p-6">
          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="redirect-url" className="block text-sm font-medium text-gray-700">
                URL de redirection (optionnel)
              </label>
              <input
                type="text"
                id="redirect-url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="ad-status" className="block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                id="ad-status"
                value={adStatus}
                onChange={(e) => setAdStatus(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
            <div>
              <label htmlFor="ad-page" className="block text-sm font-medium text-gray-700">
                Page
              </label>
              <select
                id="ad-page"
                value={adPage}
                onChange={(e) => setAdPage(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Toutes les pages</option>
                <option value="homepage">Page d'accueil</option>
                <option value="actualite">Actualités</option>
                <option value="culture_urbaine">Culture Urbaine</option>
                <option value="arts_traditions">Arts & Traditions</option>
                <option value="sciences">Sciences</option>
                <option value="evenements">Événements</option>
                <option value="entrepreneuriat">Entrepreneuriat</option>
                <option value="direct_tv">Direct TV</option>
              </select>
            </div>
          </div>
          <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50">
            <Upload className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-green-800 mb-2">Déposez vos publicités ici</h4>
            <p className="text-sm text-green-600 mb-4">ou</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              id="file-upload-drag"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload-drag"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Téléchargement en cours...' : 'Parcourir les publicités'}
            </label>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Modifier la publicité</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-redirect-url" className="block text-sm font-medium text-gray-700">
                  URL de redirection (optionnel)
                </label>
                <input
                  type="text"
                  id="edit-redirect-url"
                  name="redirect_url"
                  value={editForm.redirect_url}
                  onChange={handleEditFormChange}
                  placeholder="https://example.com"
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  id="edit-status"
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-page" className="block text-sm font-medium text-gray-700">
                  Page
                </label>
                <select
                  id="edit-page"
                  name="page"
                  value={editForm.page}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les pages</option>
                  <option value="homepage">Page d'accueil</option>
                  <option value="actualite">Actualités</option>
                  <option value="culture_urbaine">Culture Urbaine</option>
                  <option value="arts_traditions">Arts & Traditions</option>
                  <option value="sciences">Sciences</option>
                  <option value="evenements">Événements</option>
                  <option value="entrepreneuriat">Entrepreneuriat</option>
                  <option value="direct_tv">Direct TV</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-file" className="block text-sm font-medium text-gray-700">
                  Nouvelle image (optionnel)
                </label>
                <input
                  type="file"
                  id="edit-file"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editForm.file && (
                  <p className="text-sm text-gray-500 mt-1">Fichier sélectionné : {editForm.file.name}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUploading}
                >
                  {isUploading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Images;
