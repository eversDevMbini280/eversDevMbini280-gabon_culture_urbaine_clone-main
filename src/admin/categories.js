'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Tag, X, Check } from 'lucide-react';

const styles = `
  .cat-form-shell {
    background: #0f0f13;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 32px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.45);
    margin-top: 24px;
  }
  .cat-form-shell::before {
    content:''; position:absolute; top:-100px; right:-100px;
    width:300px; height:300px;
    background:radial-gradient(circle,rgba(59,130,246,0.14) 0%,transparent 70%);
    pointer-events:none;
  }
  .cat-form-title {
    font-size: 1.2rem; font-weight: 700; color: #fff;
    margin-bottom: 20px; display:flex; align-items:center; gap:10px;
  }
  .cat-form-title span {
    display:inline-block; width:6px; height:20px;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    border-radius:3px;
  }
  .cat-static-label {
    display:block; font-size:0.7rem; font-weight:600;
    color:rgba(255,255,255,0.45); letter-spacing:0.08em;
    text-transform:uppercase; margin-bottom:8px;
  }
  .cat-input, .cat-textarea {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:12px 14px;
    font-size:0.875rem; font-family:inherit; color:#f0f0f5;
    outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
  }
  .cat-input::placeholder, .cat-textarea::placeholder { color:rgba(255,255,255,0.25); }
  .cat-input:focus, .cat-textarea:focus {
    border-color:rgba(59,130,246,0.6);
    background:rgba(59,130,246,0.06);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .cat-textarea { resize: vertical; min-height: 90px; }
  .cat-form-actions {
    display:flex; justify-content:flex-end; gap:12px; flex-wrap:wrap; margin-top:6px;
  }
  .cat-btn-cancel {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 18px; border-radius:12px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.7); font-size:0.875rem; font-weight:600;
    transition:all 0.2s;
  }
  .cat-btn-cancel:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .cat-btn-submit {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 20px; border-radius:12px; border:none;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    color:#fff; font-size:0.875rem; font-weight:700; letter-spacing:0.02em;
    box-shadow:0 4px 20px rgba(59,130,246,0.35); transition:all 0.2s;
  }
  .cat-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow:0 8px 28px rgba(59,130,246,0.5); }
  .cat-btn-submit:disabled { opacity:0.5; cursor:not-allowed; }
  .cat-icon-btn {
    display:inline-flex; align-items:center; justify-content:center;
    width:34px; height:34px; border-radius:10px;
    border:1px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.6);
    transition:all 0.2s;
  }
  .cat-icon-btn:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .cat-helper { color:rgba(255,255,255,0.35); font-weight:500; text-transform:none; letter-spacing:0; }

  .cat-list-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px;
    box-shadow:0 30px 60px rgba(0,0,0,0.45);
    margin-bottom:24px;
    overflow:hidden;
  }
  .cat-list-header {
    padding:18px 20px;
    border-bottom:1px solid rgba(255,255,255,0.06);
    display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;
  }
  .cat-search-wrap { position:relative; }
  .cat-search-input {
    width:100%; max-width:360px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:11px 14px 11px 40px;
    font-size:0.875rem; color:#f0f0f5; outline:none;
    transition:border-color 0.2s, box-shadow 0.2s;
  }
  .cat-search-input::placeholder { color:rgba(255,255,255,0.25); }
  .cat-search-input:focus { border-color:rgba(59,130,246,0.5); box-shadow:0 0 0 3px rgba(59,130,246,0.10); }
  .cat-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:rgba(255,255,255,0.25); pointer-events:none; }
  .cat-table-wrap { overflow-x:auto; }
  .cat-table { width:100%; border-collapse:collapse; }
  .cat-table thead th {
    text-align:left; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase;
    color:rgba(255,255,255,0.35); padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .cat-table tbody td {
    padding:12px 16px; font-size:0.85rem; color:rgba(255,255,255,0.7);
    border-bottom:1px solid rgba(255,255,255,0.04);
  }
  .cat-table tbody tr:hover { background:rgba(255,255,255,0.03); }
  .cat-slug {
    display:inline-flex; align-items:center; padding:3px 8px; border-radius:8px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.65); font-size:0.72rem;
  }
  .cat-actions { display:flex; gap:8px; }
  .cat-action-btn {
    display:inline-flex; align-items:center; justify-content:center;
    width:30px; height:30px; border-radius:8px;
    border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03);
    color:rgba(255,255,255,0.45); transition:all 0.15s;
  }
  .cat-action-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }
  .cat-action-btn.edit:hover { background:rgba(99,102,241,0.15); color:#a5b4fc; border-color:rgba(99,102,241,0.35); }
  .cat-action-btn.del:hover { background:rgba(239,68,68,0.15); color:#fca5a5; border-color:rgba(239,68,68,0.35); }
  .cat-empty { padding:60px 24px; text-align:center; color:rgba(255,255,255,0.25); }
`;

const Categories = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', authFetch }) => {
  const [categories, setCategories] = useState([]);
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

  // ─── Use authFetch if provided, fallback to native fetch with token ──────────
  const apiFetch = useCallback(async (url, options = {}) => {
    if (authFetch) return authFetch(url, options);
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...options.headers,
      },
    });
  }, [authFetch]);

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

  // ─── Fetch all categories ────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await apiFetch(`${apiUrl}/api/categories/`, {
        headers: { Accept: 'application/json' },
      });
      if (!response || !response.ok) {
        const err = await response?.json().catch(() => ({}));
        throw new Error(err?.detail || 'Échec de la récupération des catégories.');
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Erreur lors du chargement des catégories.');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, apiFetch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      setErrorMessage('Le nom de la catégorie est obligatoire.');
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
        ? `${apiUrl}/api/categories/${formData.id}`
        : `${apiUrl}/api/categories/`;

      const body = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
      };

      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response || !response.ok) {
        const responseData = await response?.json().catch(() => ({}));
        throw new Error(
          responseData?.detail ||
            `Échec de la ${isEditing ? 'mise à jour' : 'création'} de la catégorie.`
        );
      }

      const responseData = await response.json();

      if (isEditing) {
        setCategories(categories.map((c) => (c.id === formData.id ? responseData : c)));
        setSuccessMessage('Catégorie mise à jour avec succès !');
      } else {
        setCategories([...categories, responseData]);
        setSuccessMessage('Catégorie créée avec succès !');
      }
      resetForm();
    } catch (error) {
      setErrorMessage(error.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Edit ────────────────────────────────────────────────────────────────────
  const handleEdit = (category) => {
    setFormData({
      id: category.id,
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
    });
    setIsEditing(true);
    setErrorMessage('');
    setShowForm(true);
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette catégorie ? Cette action est irréversible.')) return;
    try {
      const response = await apiFetch(`${apiUrl}/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response || !response.ok) {
        const err = await response?.json().catch(() => ({}));
        throw new Error(err?.detail || 'Échec de la suppression.');
      }
      setCategories(categories.filter((c) => c.id !== id));
      setSuccessMessage('Catégorie supprimée avec succès !');
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
  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <style>{styles}</style>

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion des Catégories</h3>
          <p className="text-sm text-gray-500">Créez et gérez les catégories d&apos;articles</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une catégorie
        </button>
      </div>

      {/* ─── Search + table ──────────────────────────────────────────────────── */}
      <div className="cat-list-shell">
        <div className="cat-list-header">
          <div className="cat-search-wrap">
            <input
              type="text"
              placeholder="Rechercher par nom, slug, description..."
              className="cat-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Rechercher une catégorie"
            />
            <svg className="cat-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
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
        <div className="cat-table-wrap">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
              <p>Chargement...</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <table className="cat-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>#{category.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-100">{category.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cat-slug">
                        {category.slug}
                      </span>
                    </td>
                    <td className="text-sm text-gray-400 max-w-xs truncate">
                      {category.description || <span className="italic text-gray-500">—</span>}
                    </td>
                    <td className="text-sm text-gray-400">
                      {category.created_at
                        ? new Date(category.created_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td>
                      <div className="cat-actions">
                        <button
                          onClick={() => handleEdit(category)}
                          className="cat-action-btn edit"
                          aria-label="Modifier la catégorie"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="cat-action-btn del"
                          aria-label="Supprimer la catégorie"
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
            <div className="cat-empty">
              <Tag className="w-16 h-16 text-gray-500 mb-4" />
              <p className="mb-2">Aucune catégorie trouvée</p>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? 'Aucun résultat pour cette recherche.'
                  : 'Ajoutez une catégorie en cliquant sur "Ajouter une catégorie".'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Form ────────────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="cat-form-shell">
        <div className="flex justify-between items-center mb-4">
          <h3 className="cat-form-title">
            <span />
            {isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
          </h3>
          {isEditing && (
            <button
              onClick={resetForm}
              className="cat-icon-btn"
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
              <label htmlFor="category_name" className="cat-static-label">
                Nom *
              </label>
              <input
                type="text"
                id="category_name"
                value={formData.name}
                onChange={handleNameChange}
                className="cat-input"
                placeholder="Ex: Success Stories"
                required
                aria-label="Nom de la catégorie"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="category_slug" className="cat-static-label">
                Slug * <span className="cat-helper">(auto-généré depuis le nom)</span>
              </label>
              <input
                type="text"
                id="category_slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="cat-input font-mono text-sm"
                placeholder="ex: success-stories"
                required
                aria-label="Slug de la catégorie"
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label htmlFor="category_description" className="cat-static-label">
              Description <span className="cat-helper">(Optionnel)</span>
            </label>
            <textarea
              id="category_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="cat-textarea"
              rows="3"
              placeholder="Description de la catégorie..."
              aria-label="Description de la catégorie"
            />
          </div>

          <div className="cat-form-actions">
            <button
              type="button"
              onClick={resetForm}
              className="cat-btn-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cat-btn-submit"
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

export default Categories;
