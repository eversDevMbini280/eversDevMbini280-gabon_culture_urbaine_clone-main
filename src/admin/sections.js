'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Layers, X, Check } from 'lucide-react';

const styles = `
  .sec-form-shell {
    background: #0f0f13;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 32px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.45);
    margin-top: 24px;
  }
  .sec-form-shell::before {
    content:''; position:absolute; top:-100px; right:-100px;
    width:300px; height:300px;
    background:radial-gradient(circle,rgba(59,130,246,0.14) 0%,transparent 70%);
    pointer-events:none;
  }
  .sec-form-title {
    font-size: 1.2rem; font-weight: 700; color: #fff;
    margin-bottom: 20px; display:flex; align-items:center; gap:10px;
  }
  .sec-form-title span {
    display:inline-block; width:6px; height:20px;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    border-radius:3px;
  }
  .sec-static-label {
    display:block; font-size:0.7rem; font-weight:600;
    color:rgba(255,255,255,0.45); letter-spacing:0.08em;
    text-transform:uppercase; margin-bottom:8px;
  }
  .sec-input, .sec-textarea {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:12px 14px;
    font-size:0.875rem; font-family:inherit; color:#f0f0f5;
    outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
  }
  .sec-input::placeholder, .sec-textarea::placeholder { color:rgba(255,255,255,0.25); }
  .sec-input:focus, .sec-textarea:focus {
    border-color:rgba(59,130,246,0.6);
    background:rgba(59,130,246,0.06);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .sec-textarea { resize: vertical; min-height: 90px; }
  .sec-form-actions {
    display:flex; justify-content:flex-end; gap:12px; flex-wrap:wrap; margin-top:6px;
  }
  .sec-btn-cancel {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 18px; border-radius:12px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.7); font-size:0.875rem; font-weight:600;
    transition:all 0.2s;
  }
  .sec-btn-cancel:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .sec-btn-submit {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 20px; border-radius:12px; border:none;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    color:#fff; font-size:0.875rem; font-weight:700; letter-spacing:0.02em;
    box-shadow:0 4px 20px rgba(59,130,246,0.35); transition:all 0.2s;
  }
  .sec-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow:0 8px 28px rgba(59,130,246,0.5); }
  .sec-btn-submit:disabled { opacity:0.5; cursor:not-allowed; }
  .sec-icon-btn {
    display:inline-flex; align-items:center; justify-content:center;
    width:34px; height:34px; border-radius:10px;
    border:1px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.6);
    transition:all 0.2s;
  }
  .sec-icon-btn:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .sec-helper { color:rgba(255,255,255,0.35); font-weight:500; text-transform:none; letter-spacing:0; }

  .sec-list-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px;
    box-shadow:0 30px 60px rgba(0,0,0,0.45);
    margin-bottom:24px;
    overflow:hidden;
  }
  .sec-list-header {
    padding:18px 20px;
    border-bottom:1px solid rgba(255,255,255,0.06);
    display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;
  }
  .sec-search-wrap { position:relative; }
  .sec-search-input {
    width:100%; max-width:360px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:11px 14px 11px 40px;
    font-size:0.875rem; color:#f0f0f5; outline:none;
    transition:border-color 0.2s, box-shadow 0.2s;
  }
  .sec-search-input::placeholder { color:rgba(255,255,255,0.25); }
  .sec-search-input:focus { border-color:rgba(59,130,246,0.5); box-shadow:0 0 0 3px rgba(59,130,246,0.10); }
  .sec-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:rgba(255,255,255,0.25); pointer-events:none; }
  .sec-table-wrap { overflow-x:auto; }
  .sec-table { width:100%; border-collapse:collapse; }
  .sec-table thead th {
    text-align:left; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase;
    color:rgba(255,255,255,0.35); padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .sec-table tbody td {
    padding:12px 16px; font-size:0.85rem; color:rgba(255,255,255,0.7);
    border-bottom:1px solid rgba(255,255,255,0.04);
  }
  .sec-table tbody tr:hover { background:rgba(255,255,255,0.03); }
  .sec-slug {
    display:inline-flex; align-items:center; padding:3px 8px; border-radius:8px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.65); font-size:0.72rem;
  }
  .sec-actions { display:flex; gap:8px; }
  .sec-action-btn {
    display:inline-flex; align-items:center; justify-content:center;
    width:30px; height:30px; border-radius:8px;
    border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03);
    color:rgba(255,255,255,0.45); transition:all 0.15s;
  }
  .sec-action-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }
  .sec-action-btn.edit:hover { background:rgba(99,102,241,0.15); color:#a5b4fc; border-color:rgba(99,102,241,0.35); }
  .sec-action-btn.del:hover { background:rgba(239,68,68,0.15); color:#fca5a5; border-color:rgba(239,68,68,0.35); }
  .sec-empty { padding:60px 24px; text-align:center; color:rgba(255,255,255,0.25); }
`;

const Sections = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' }) => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    slug: '',
    description: '',
  });

  // ─── Token helper ────────────────────────────────────────────────────────────
  const apiFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...options.headers,
      },
    });
  }, []);

  // ─── Auto-generate slug from name ───────────────────────────────────────────
  const generateSlug = (name) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !isEditing ? generateSlug(name) : prev.slug,
    }));
  };

  // ─── Fetch all sections ──────────────────────────────────────────────────────
  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await apiFetch(`${apiUrl}/api/sections/`);
      if (!response || !response.ok) {
        const err = await response?.json().catch(() => ({}));
        throw new Error(err?.detail || 'Échec de la récupération des sections.');
      }
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Erreur lors du chargement des sections.');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, apiFetch]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // ─── Auto-dismiss success message ───────────────────────────────────────────
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ─── Submit (create or update) ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Le nom de la section est obligatoire.');
      return;
    }
    if (!formData.slug.trim()) {
      setErrorMessage('Le slug est obligatoire.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `${apiUrl}/api/sections/${formData.id}`
        : `${apiUrl}/api/sections/`;

      const body = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
      };

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response || !response.ok) {
        const responseData = await response?.json().catch(() => ({}));
        throw new Error(
          responseData?.detail ||
            `Échec de la ${isEditing ? 'mise à jour' : 'création'} de la section.`
        );
      }

      const responseData = await response.json();

      if (isEditing) {
        setSections(sections.map((s) => (s.id === formData.id ? responseData : s)));
        setSuccessMessage('Section mise à jour avec succès !');
      } else {
        setSections([...sections, responseData]);
        setSuccessMessage('Section créée avec succès !');
      }
      resetForm();
    } catch (error) {
      setErrorMessage(error.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Edit ────────────────────────────────────────────────────────────────────
  const handleEdit = (section) => {
    setFormData({
      id: section.id,
      name: section.name || '',
      slug: section.slug || '',
      description: section.description || '',
    });
    setIsEditing(true);
    setErrorMessage('');
    setShowForm(true);
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette section ? Les articles associés ne seront pas supprimés.')) return;
    try {
      const response = await apiFetch(`${apiUrl}/api/sections/${id}`, {
        method: 'DELETE',
      });
      if (!response || !response.ok) {
        const err = await response?.json().catch(() => ({}));
        throw new Error(err?.detail || 'Échec de la suppression.');
      }
      setSections(sections.filter((s) => s.id !== id));
      setSuccessMessage('Section supprimée avec succès !');
    } catch (error) {
      setErrorMessage(error.message || 'Erreur lors de la suppression.');
    }
  };

  // ─── Reset form ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ id: null, name: '', slug: '', description: '' });
    setIsEditing(false);
    setErrorMessage('');
    setShowForm(false);
  };

  // ─── Filtered list ───────────────────────────────────────────────────────────
  const filteredSections = sections.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <style>{styles}</style>

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion des Sections</h3>
          <p className="text-sm text-gray-500">Créez et gérez les sections d&apos;articles</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une section
        </button>
      </div>

      {/* ─── Search + table ──────────────────────────────────────────────────── */}
      <div className="sec-list-shell">
        <div className="sec-list-header">
          <div className="sec-search-wrap">
            <input
              type="text"
              placeholder="Rechercher par nom, slug, description..."
              className="sec-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Rechercher une section"
            />
            <svg className="sec-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={fetchSections}
            className="inline-flex items-center px-3 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Rafraîchir
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mx-4 mb-4 p-3 bg-red-500/10 text-red-200 border border-red-500/30 rounded-md">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mx-4 mb-4 p-3 bg-green-500/10 text-green-200 border border-green-500/30 rounded-md flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {/* Table */}
        <div className="sec-table-wrap">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
              <p>Chargement...</p>
            </div>
          ) : filteredSections.length > 0 ? (
            <table className="sec-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Créée le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSections.map((section) => (
                  <tr key={section.id}>
                    <td>#{section.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-100">{section.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sec-slug">
                        {section.slug}
                      </span>
                    </td>
                    <td className="text-sm text-gray-400 max-w-xs truncate">
                      {section.description || <span className="italic text-gray-500">—</span>}
                    </td>
                    <td className="text-sm text-gray-400">
                      {section.created_at
                        ? new Date(section.created_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td>
                      <div className="sec-actions">
                        <button
                          onClick={() => handleEdit(section)}
                          className="sec-action-btn edit"
                          aria-label="Modifier la section"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(section.id)}
                          className="sec-action-btn del"
                          aria-label="Supprimer la section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="sec-empty">
              <Layers className="w-16 h-16 text-gray-500 mb-4" />
              <p className="mb-2">Aucune section trouvée</p>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? 'Aucun résultat pour cette recherche.'
                  : 'Ajoutez une section en cliquant sur "Ajouter une section".'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Form ────────────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="sec-form-shell">
        <div className="flex justify-between items-center mb-4">
          <h3 className="sec-form-title">
            <span />
            {isEditing ? 'Modifier la section' : 'Ajouter une section'}
          </h3>
          {isEditing && (
            <button
              onClick={resetForm}
              className="sec-icon-btn"
              aria-label="Annuler la modification"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Nom */}
            <div>
              <label htmlFor="section_name" className="sec-static-label">Nom *</label>
              <input
                type="text"
                id="section_name"
                value={formData.name}
                onChange={handleNameChange}
                className="sec-input"
                placeholder="Ex: Contenus Récents"
                required
                aria-label="Nom de la section"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="section_slug" className="sec-static-label">
                Slug * <span className="sec-helper">(auto-généré depuis le nom)</span>
              </label>
              <input
                type="text"
                id="section_slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="sec-input font-mono text-sm"
                placeholder="ex: contenus-recents"
                required
                aria-label="Slug de la section"
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label htmlFor="section_description" className="sec-static-label">
              Description <span className="sec-helper">(Optionnel)</span>
            </label>
            <textarea
              id="section_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="sec-textarea"
              rows="3"
              placeholder="Description de la section..."
              aria-label="Description de la section"
            />
          </div>

          <div className="sec-form-actions">
            <button
              type="button"
              onClick={resetForm}
              className="sec-btn-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="sec-btn-submit"
            >
              {isSubmitting ? 'Envoi...' : isEditing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
      )}

    </div>
  );
};

export default Sections;
