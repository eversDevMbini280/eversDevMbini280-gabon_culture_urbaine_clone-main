'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Tag, X, Check } from 'lucide-react';

const Categories = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', authFetch }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion des Catégories</h3>
          <p className="text-sm text-gray-500">Créez et gérez les catégories d&apos;articles</p>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une catégorie
        </button>
      </div>

      {/* ─── Search + table ──────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Rechercher par nom, slug, description..."
            className="w-full sm:w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Rechercher une catégorie"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{category.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {category.description || <span className="italic text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.created_at
                        ? new Date(category.created_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 mr-4 transition-colors"
                        aria-label="Modifier la catégorie"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        aria-label="Supprimer la catégorie"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <Tag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="mb-2">Aucune catégorie trouvée</p>
              <p className="text-sm text-gray-400">
                {searchQuery
                  ? 'Aucun résultat pour cette recherche.'
                  : 'Ajoutez une catégorie en cliquant sur "Ajouter une catégorie".'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Form ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            {isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
          </h3>
          {isEditing && (
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 transition-colors"
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
              <label htmlFor="category_name" className="block text-sm font-medium text-gray-700">
                Nom *
              </label>
              <input
                type="text"
                id="category_name"
                value={formData.name}
                onChange={handleNameChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Success Stories"
                required
                aria-label="Nom de la catégorie"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="category_slug" className="block text-sm font-medium text-gray-700">
                Slug * <span className="text-gray-400 font-normal">(auto-généré depuis le nom)</span>
              </label>
              <input
                type="text"
                id="category_slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="ex: success-stories"
                required
                aria-label="Slug de la catégorie"
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label htmlFor="category_description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(Optionnel)</span>
            </label>
            <textarea
              id="category_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              rows="3"
              placeholder="Description de la catégorie..."
              aria-label="Description de la catégorie"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Envoi...' : isEditing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Categories;