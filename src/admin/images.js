'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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

  const fetchData = useCallback(async () => {
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
  }, [apiUrl]);

  // Fetch advertisements
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter advertisements based on search query
  const filteredAdvertisements = advertisements.filter(
    (ad) =>
      (ad.title?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '') ||
      (ad.status?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '') ||
      (ad.page?.toLowerCase() || '').includes(searchQuery?.toLowerCase() || '') ||
      (ad.created_at ? new Date(ad.created_at).toLocaleDateString('fr-FR') : '').includes(searchQuery || '')
  );

  // Handle image errors
  const handleImageError = (itemId) => {
    if (!failedImages.has(itemId)) {
      setFailedImages((prev) => new Set(prev).add(itemId));
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    let colorClass = '';
    switch (status) {
      case 'published':
        colorClass = 'admin-badge--green';
        break;
      case 'draft':
        colorClass = 'admin-badge--gray';
        break;
      case 'expired':
        colorClass = 'admin-badge--yellow';
        break;
      default:
        colorClass = 'admin-badge--blue';
    }
    return (
      <span className={`admin-badge ${colorClass}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  // Render page badge
  const renderPageBadge = (page) => {
    const colorClass = page === 'all' ? 'admin-badge--gray' : 'admin-badge--blue';
    return (
      <span className={`admin-badge ${colorClass}`}>
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
      <style>{styles}</style>
      {/* Header with Add Button */}
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-title">Publicités</h2>
          <div className="admin-sub">Gérez les visuels et la diffusion</div>
        </div>
        <div className="flex space-x-2">
          <button
            className="admin-btn-ghost"
            onClick={handleRetry}
            title="Rafraîchir"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <label
            htmlFor="file-upload"
            className="admin-btn-primary"
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
          className="admin-input"
        />
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 admin-message admin-message--success">
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
        <div className="mb-4 admin-message admin-message--error">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erreur</p>
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 admin-btn-ghost"
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
      <div className="admin-table-shell">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
            <p className="admin-muted">Chargement...</p>
          </div>
        ) : filteredAdvertisements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">
                    Titre
                  </th>
                  <th scope="col">
                    Type
                  </th>
                  <th scope="col">
                    Statut
                  </th>
                  <th scope="col">
                    Page
                  </th>
                  <th scope="col">
                    Date
                  </th>
                  <th scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvertisements.map((ad) => (
                  <tr key={ad.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-white/5 border border-white/10">
                          <Image
                            src={
                              failedImages.has(ad.id)
                                ? FALLBACK_IMAGE
                                : ad.image_url?.startsWith('http')
                                  ? ad.image_url
                                  : `${apiUrl}${ad.image_url}`
                            }
                            alt={ad.title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(ad.id)}
                            loading="lazy"
                            unoptimized
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{ad.title}</div>
                          {ad.redirect_url && (
                            <a
                              href={ad.redirect_url}
                              className="text-sm text-blue-300 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {ad.redirect_url}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--blue">
                        Publicité
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {renderStatusBadge(ad.status)}
                        <div className="relative group">
                          <button className="admin-btn-ghost">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <div className="absolute left-0 mt-2 w-32 admin-shell admin-shell--compact z-10 hidden group-hover:block">
                            <button
                              className="block px-4 py-2 text-sm text-white/80 hover:text-white w-full text-left"
                              onClick={() => handleStatusChange(ad.id, 'draft')}
                            >
                              Brouillon
                            </button>
                            <button
                              className="block px-4 py-2 text-sm text-white/80 hover:text-white w-full text-left"
                              onClick={() => handleStatusChange(ad.id, 'published')}
                            >
                              Publié
                            </button>
                            <button
                              className="block px-4 py-2 text-sm text-white/80 hover:text-white w-full text-left"
                              onClick={() => handleStatusChange(ad.id, 'expired')}
                            >
                              Expiré
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {renderPageBadge(ad.page)}
                    </td>
                    <td className="admin-muted">
                      {ad.created_at ? new Date(ad.created_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          className="admin-btn-ghost"
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
                          className="admin-btn-ghost"
                          title="Modifier"
                          onClick={() => openEditModal(ad)}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          className="admin-btn-danger"
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
          <div className="admin-empty">
            <Tag className="w-16 h-16 text-gray-500 mb-4" />
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
      <div className="mt-8 admin-shell">
        <div className="mb-6">
          <h3 className="admin-title">Télécharger des publicités</h3>
          <p className="admin-sub">Formats pris en charge: JPG, PNG, WebP, AVIF</p>
        </div>

        <div>
          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="redirect-url" className="admin-static-label">
                URL de redirection (optionnel)
              </label>
              <input
                type="text"
                id="redirect-url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com"
                className="admin-input"
              />
            </div>
            <div>
              <label htmlFor="ad-status" className="admin-static-label">
                Statut
              </label>
              <select
                id="ad-status"
                value={adStatus}
                onChange={(e) => setAdStatus(e.target.value)}
                className="admin-select"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
            <div>
              <label htmlFor="ad-page" className="admin-static-label">
                Page
              </label>
              <select
                id="ad-page"
                value={adPage}
                onChange={(e) => setAdPage(e.target.value)}
                className="admin-select"
              >
                <option value="all">Toutes les pages</option>
                <option value="homepage">Page d&apos;accueil</option>
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
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
            <Upload className="w-12 h-12 text-blue-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">Déposez vos publicités ici</h4>
            <p className="text-sm admin-muted mb-4">ou</p>
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
              className="admin-btn-primary"
            >
              {isUploading ? 'Téléchargement en cours...' : 'Parcourir les publicités'}
            </label>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 flex items-center justify-center z-50">
          <div className="admin-modal max-w-md w-full relative">
            <button
              className="absolute top-4 right-4 admin-btn-ghost"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="admin-modal-header">
              <h3 className="text-lg font-semibold">Modifier la publicité</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="admin-modal-body space-y-4">
              <div>
                <label htmlFor="edit-title" className="admin-static-label">
                  Titre
                </label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  className="admin-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-redirect-url" className="admin-static-label">
                  URL de redirection (optionnel)
                </label>
                <input
                  type="text"
                  id="edit-redirect-url"
                  name="redirect_url"
                  value={editForm.redirect_url}
                  onChange={handleEditFormChange}
                  placeholder="https://example.com"
                  className="admin-input"
                />
              </div>
              <div>
                <label htmlFor="edit-status" className="admin-static-label">
                  Statut
                </label>
                <select
                  id="edit-status"
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                  className="admin-select"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-page" className="admin-static-label">
                  Page
                </label>
                <select
                  id="edit-page"
                  name="page"
                  value={editForm.page}
                  onChange={handleEditFormChange}
                  className="admin-select"
                >
                  <option value="all">Toutes les pages</option>
                  <option value="homepage">Page d&apos;accueil</option>
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
                <label htmlFor="edit-file" className="admin-static-label">
                  Nouvelle image (optionnel)
                </label>
                <input
                  type="file"
                  id="edit-file"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="admin-input"
                />
                {editForm.file && (
                  <p className="text-sm admin-muted mt-1">Fichier sélectionné : {editForm.file.name}</p>
                )}
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
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
