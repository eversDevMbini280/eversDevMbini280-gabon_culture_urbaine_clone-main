"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw, X, Check, AlertTriangle } from 'lucide-react';

const styles = `
  .act-modal {
    background: #0f0f13;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  .act-modal-header {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
  }
  .act-modal-header.alt { background: linear-gradient(135deg, #4f46e5, #4338ca); }
  .act-modal-header.danger { background: linear-gradient(135deg, #dc2626, #b91c1c); }
  .act-modal-body { padding: 24px; }
  .act-label {
    display:block; font-size:0.7rem; font-weight:600;
    color:rgba(255,255,255,0.45); letter-spacing:0.08em;
    text-transform:uppercase; margin-bottom:8px;
  }
  .act-input, .act-textarea, .act-select {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:12px 14px;
    font-size:0.875rem; font-family:inherit; color:#f0f0f5;
    outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
  }
  .act-input::placeholder, .act-textarea::placeholder { color:rgba(255,255,255,0.25); }
  .act-input:focus, .act-textarea:focus, .act-select:focus {
    border-color:rgba(59,130,246,0.6);
    background:rgba(59,130,246,0.06);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .act-select option { background:#1a1a24; color:#f0f0f5; }
  .act-textarea { resize: vertical; min-height: 100px; }
  .act-actions {
    background: rgba(255,255,255,0.02);
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 16px 24px;
    display:flex; justify-content:flex-end; gap:12px; flex-wrap:wrap;
  }
  .act-btn-ghost {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 18px; border-radius:12px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.7); font-size:0.875rem; font-weight:600;
    transition:all 0.2s;
  }
  .act-btn-ghost:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .act-btn-primary {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:10px 20px; border-radius:12px; border:none;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    color:#fff; font-size:0.875rem; font-weight:700; letter-spacing:0.02em;
    box-shadow:0 4px 20px rgba(59,130,246,0.35); transition:all 0.2s;
  }
  .act-btn-primary:hover { transform: translateY(-1px); box-shadow:0 8px 28px rgba(59,130,246,0.5); }
  .act-btn-danger {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:10px 20px; border-radius:12px; border:none;
    background:linear-gradient(135deg,#ef4444,#dc2626);
    color:#fff; font-size:0.875rem; font-weight:700; letter-spacing:0.02em;
    box-shadow:0 4px 20px rgba(239,68,68,0.35); transition:all 0.2s;
  }
  .act-btn-danger:hover { transform: translateY(-1px); box-shadow:0 8px 28px rgba(239,68,68,0.5); }
  .act-alert {
    margin-bottom: 16px; padding: 12px 16px;
    border-radius: 10px; font-size: 0.875rem;
    border: 1px solid;
  }
  .act-alert.error { background: rgba(239,68,68,0.1); color: #fca5a5; border-color: rgba(239,68,68,0.3); }
  .act-alert.success { background: rgba(34,197,94,0.12); color: #86efac; border-color: rgba(34,197,94,0.3); }
  .act-alert.warn { background: rgba(234,179,8,0.12); color: #facc15; border-color: rgba(234,179,8,0.3); }

  .act-list-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px;
    box-shadow:0 30px 60px rgba(0,0,0,0.45);
    overflow:hidden;
  }
  .act-list-header {
    padding:18px 20px;
    border-bottom:1px solid rgba(255,255,255,0.06);
    display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;
  }
  .act-search {
    width:100%; max-width:360px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:11px 14px;
    font-size:0.875rem; color:#f0f0f5; outline:none;
  }
  .act-search::placeholder { color:rgba(255,255,255,0.25); }
  .act-table { width:100%; border-collapse:collapse; }
  .act-table thead th {
    text-align:left; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase;
    color:rgba(255,255,255,0.35); padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .act-table tbody td {
    padding:12px 16px; font-size:0.85rem; color:rgba(255,255,255,0.7);
    border-bottom:1px solid rgba(255,255,255,0.04);
  }
  .act-table tbody tr:hover { background:rgba(255,255,255,0.03); }
  .act-status {
    display:inline-flex; align-items:center; padding:3px 10px; border-radius:999px;
    font-size:0.72rem; font-weight:600; border:1px solid;
  }
  .act-status.published { background:rgba(34,197,94,0.12); color:#4ade80; border-color:rgba(34,197,94,0.25); }
  .act-status.draft { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.4); border-color:rgba(255,255,255,0.1); }
  .act-status.pending { background:rgba(234,179,8,0.12); color:#facc15; border-color:rgba(234,179,8,0.25); }
  .act-row-actions { display:flex; gap:8px; justify-content:flex-end; }
  .act-row-btn {
    display:inline-flex; align-items:center; justify-content:center;
    width:30px; height:30px; border-radius:8px;
    border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03);
    color:rgba(255,255,255,0.45); transition:all 0.15s;
  }
  .act-row-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }
  .act-row-btn.edit:hover { background:rgba(99,102,241,0.15); color:#a5b4fc; border-color:rgba(99,102,241,0.35); }
  .act-row-btn.del:hover { background:rgba(239,68,68,0.15); color:#fca5a5; border-color:rgba(239,68,68,0.35); }
`;

const Actualite = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000" }) => {
  const [actualites, setActualites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActualite, setSelectedActualite] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'published'
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'pending', label: 'Pending' }
  ];

  const fetchActualites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      const response = await fetch(`${apiUrl}/api/actualitehome/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No actualites found, initializing empty array');
          setActualites([]);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch actualites (Status: ${response.status})`);
      }

      const data = await response.json();
      setActualites(data);
    } catch (err) {
      console.error('Error fetching actualites:', err);
      setError(err.message || "Failed to fetch actualites. Please try again later.");
      if (err.message.includes('401') || err.message.includes('expired')) {
        window.location.href = '/adm';
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchActualites();
    const intervalId = setInterval(fetchActualites, 24 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchActualites]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setFormError('Please log in to add an actualite.');
      return;
    }

    if (!formData.title || !formData.description) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      let url = `${apiUrl}/api/actualitehome/`;
      let method = 'POST';

      if (isEditModalOpen && selectedActualite) {
        url = `${apiUrl}/api/actualitehome/${selectedActualite.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${isEditModalOpen ? 'update' : 'add'} actualite`);
      }

      await fetchActualites();
      setFormSuccess(`Actualite ${isEditModalOpen ? 'updated' : 'added'} successfully!`);
      setFormData({ title: '', description: '', status: 'published' });
      setIsEditModalOpen(false);
      setShowForm(false);
    } catch (err) {
      console.error(`Error ${isEditModalOpen ? 'updating' : 'adding'} actualite:`, err);
      setFormError(err.message || `Failed to ${isEditModalOpen ? 'update' : 'add'} actualite. Please try again.`);
    }
  };

  const handleDeleteActualite = async () => {
    if (!selectedActualite) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${apiUrl}/api/actualitehome/${selectedActualite.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) throw new Error('Failed to delete actualite');

      await fetchActualites();
      setFormSuccess('Actualite deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedActualite(null);
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting actualite:', err);
      setError(err.message || 'Failed to delete actualite. Please try again.');
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (actualite) => {
    setSelectedActualite(actualite);
    setFormData({
      title: actualite.title || '',
      description: actualite.description || '',
      status: actualite.status || 'published'
    });
    setIsEditModalOpen(true);
    setShowForm(true);
  };

  const openDeleteModal = (actualite) => {
    setSelectedActualite(actualite);
    setIsDeleteModalOpen(true);
  };

  const filteredActualites = actualites.filter(actualite =>
    actualite.title.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    actualite.status.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );

  const renderStatusBadge = (status) => {
    let colorClass = '';
    switch (status) {
      case 'published': colorClass = 'published'; break;
      case 'draft': colorClass = 'draft'; break;
      case 'pending': colorClass = 'pending'; break;
      default: colorClass = 'published';
    }
    return (
      <span className={`act-status ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-medium text-gray-800">Toutes les Actualités</h3>
        <button
          onClick={() => {
            setFormData({ title: '', description: '', status: 'published' });
            setSelectedActualite(null);
            setIsEditModalOpen(false);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une actualité
        </button>
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

      <div className="act-list-shell">
        <div className="act-list-header">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou statut..."
            className="act-search"
          />
          <button
            onClick={() => fetchActualites()}
            className="inline-flex items-center px-3 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
            <p>Chargement des actualités...</p>
          </div>
        ) : filteredActualites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="act-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th className="hidden sm:table-cell">Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActualites.map((actualite) => (
                  <tr key={actualite.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-100 truncate">{actualite.title}</div>
                          <div className="text-sm text-gray-400 line-clamp-2 sm:line-clamp-1">{actualite.description}</div>
                          <div className="sm:hidden text-xs text-gray-500 mt-1">
                            {new Date(actualite.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      {renderStatusBadge(actualite.status)}
                    </td>
                    <td className="hidden sm:table-cell whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(actualite.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-right text-sm font-medium">
                      <div className="act-row-actions">
                        <button
                          onClick={() => openEditModal(actualite)}
                          className="act-row-btn edit"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(actualite)}
                          className="act-row-btn del"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
            <p className="mb-2 text-center">Aucune actualité trouvée</p>
            <p className="text-sm text-gray-400 text-center">
              {searchQuery
                ? `Aucun résultat pour "${searchQuery}"`
                : 'Ajoutez des actualités en cliquant sur le bouton "Ajouter une actualité"'
              }
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="act-modal" style={{ marginTop: 24 }}>
          <div className={`act-modal-header ${isEditModalOpen ? 'alt' : ''} px-6 py-4 flex justify-between items-center`}>
            <h3 className="text-xl font-medium">
              {isEditModalOpen ? "Modifier l'actualité" : "Ajouter une nouvelle actualité"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setIsEditModalOpen(false);
                setFormData({ title: '', description: '', status: 'published' });
              }}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="act-modal-body">
            {formError && (
              <div className="act-alert error flex items-start">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="act-alert success flex items-start">
                <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}
            <form id="actualiteInlineForm" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="act-label">Titre *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="act-input"
                    placeholder="Entrez le titre de l'actualité"
                    required
                  />
                </div>
                <div>
                  <label className="act-label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="act-textarea"
                    rows="4"
                    placeholder="Description de l'actualité"
                    required
                  />
                </div>
                <div>
                  <label className="act-label">Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="act-select"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div className="act-actions">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setIsEditModalOpen(false);
                setFormData({ title: '', description: '', status: 'published' });
              }}
              className="act-btn-ghost"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="actualiteInlineForm"
              className="act-btn-primary"
            >
              <Check className="w-5 h-5 mr-2" />
              {isEditModalOpen ? 'Mettre à jour' : "Ajouter l'actualité"}
            </button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedActualite && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 flex items-center justify-center z-50 p-4">
          <div className="act-modal w-full max-w-md overflow-hidden">
            <div className="act-modal-header danger px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Confirmer la suppression</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="act-modal-body">
              <div className="flex justify-center mb-6">
                <AlertTriangle className="w-16 h-16 text-red-400" />
              </div>
              <p className="text-center text-lg font-semibold mb-2 text-gray-100">
                Êtes-vous sûr de vouloir supprimer cette actualité ?
              </p>
              <p className="text-center text-gray-400 mb-4">
                <strong>{selectedActualite.title}</strong>
              </p>
              <p className="text-sm text-center text-gray-500 mb-4">
                Cette action sera irréversible.
              </p>
            </div>
            <div className="act-actions">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="act-btn-ghost"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteActualite}
                className="act-btn-danger"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Actualite;
