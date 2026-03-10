"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Edit, Trash2, RefreshCw, Check, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Sections = ({ apiUrl = API_BASE_URL }) => {
  const [state, setState] = useState({
    sections: [],
    loading: true,
    error: null,
    searchQuery: '',
    isEditing: false,
    currentSection: null,
    formData: {
      name: '',
      slug: '',
      description: '',
      _slugEdited: false,
    },
  });

  // Auto-generate slug from name
  const generateSlug = (name) =>
    name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Get token helper
  const getToken = () => localStorage.getItem('token');

  // Fetch sections
  const fetchSections = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const token = getToken();
      const res = await fetch(`${apiUrl}/api/sections/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur ${res.status} : ${res.statusText}`);
      const sections = await res.json();
      setState((prev) => ({ ...prev, sections, loading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value,
        ...(name === 'name' && !prev.formData._slugEdited
          ? { slug: generateSlug(value) }
          : {}),
      },
    }));
  };

  const handleSlugChange = (e) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        slug: e.target.value,
        _slugEdited: true,
      },
    }));
  };

  // Save or update section
  const saveSection = async (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const token = getToken();
      const { currentSection, formData } = state;
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
      };

      const url = currentSection
        ? `${apiUrl}/api/sections/${currentSection.id}`
        : `${apiUrl}/api/sections/`;
      const method = currentSection ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erreur ${response.status}`);
      }

      const saved = await response.json();
      setState((prev) => ({
        ...prev,
        sections: currentSection
          ? prev.sections.map((s) => (s.id === saved.id ? saved : s))
          : [...prev.sections, saved],
        isEditing: false,
        currentSection: null,
        formData: { name: '', slug: '', description: '', _slugEdited: false },
        loading: false,
      }));
      alert(currentSection ? 'Section mise à jour avec succès' : 'Section créée avec succès');
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      alert(`Erreur : ${error.message}`);
    }
  };

  // Delete section
  const deleteSection = async (id) => {
    if (!confirm('Supprimer cette section ? Les articles associés ne seront pas supprimés.')) return;
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const token = getToken();
      const response = await fetch(`${apiUrl}/api/sections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erreur ${response.status}`);
      }

      setState((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== id),
        loading: false,
      }));
      alert('Section supprimée avec succès');
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      alert(`Erreur : ${error.message}`);
    }
  };

  // Edit section
  const editSection = (section) => {
    setState((prev) => ({
      ...prev,
      isEditing: true,
      currentSection: section,
      formData: {
        name: section.name,
        slug: section.slug,
        description: section.description || '',
        _slugEdited: true,
      },
    }));
  };

  // Cancel
  const cancelEdit = () => {
    setState((prev) => ({
      ...prev,
      isEditing: false,
      currentSection: null,
      formData: { name: '', slug: '', description: '', _slugEdited: false },
    }));
  };

  const filteredSections = state.sections.filter((s) =>
    s.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    (s.slug || '').toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 style={{ color : 'black'}} className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Layers className="mr-3 text-indigo-500" />
            Gestion des Sections
          </h1>
          {!state.isEditing ? (
            <button
              onClick={() => setState((prev) => ({ ...prev, isEditing: true }))}
              style={{ color : 'black'}}
              className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter une Section
            </button>
          ) : (
            <button
              onClick={cancelEdit}
              className="inline-flex items-center px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <X className="w-5 h-5 mr-2" />
              Annuler
            </button>
          )}
        </div>

        {/* Error */}
        {state.error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex">
              <X className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="ml-3 text-red-700 dark:text-red-300">{state.error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {state.isEditing && (
          <form
            onSubmit={saveSection}
            className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {state.currentSection ? 'Modifier la Section' : 'Créer une Section'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={state.formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600 peer"
                  required
                  placeholder=" "
                  id="section-name"
                />
                <label
                  htmlFor="section-name"
                  className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
                >
                  Nom *
                </label>
              </div>

              {/* Slug */}
              <div className="relative">
                <input
                  type="text"
                  name="slug"
                  value={state.formData.slug}
                  onChange={handleSlugChange}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600 peer"
                  required
                  placeholder=" "
                  id="section-slug"
                />
                <label
                  htmlFor="section-slug"
                  className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
                >
                  Slug * (auto-généré)
                </label>
              </div>

              {/* Description */}
              <div className="relative md:col-span-2">
                <textarea
                  name="description"
                  value={state.formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600 peer resize-none"
                  placeholder=" "
                  id="section-description"
                />
                <label
                  htmlFor="section-description"
                  className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
                >
                  Description (optionnel)
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-4 justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <X className="mr-2" size={18} /> Annuler
              </button>
              <button
                type="submit"
                disabled={state.loading}
                className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {state.loading ? (
                  <RefreshCw className="mr-2 animate-spin" size={18} />
                ) : (
                  <Check className="mr-2" size={18} />
                )}
                {state.currentSection ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {state.loading && !state.isEditing && (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Table */}
        {!state.isEditing && !state.loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-x-auto">
            {/* Search + Refresh */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Rechercher une section..."
                  value={state.searchQuery}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                onClick={fetchSections}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rafraîchir
              </button>
            </div>

            {filteredSections.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune section trouvée. Créez votre première section.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Créée le</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSections.map((section, index) => (
                    <tr
                      key={section.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{section.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                          {section.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {section.description || <span className="italic opacity-50">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(section.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 flex gap-3">
                        <button
                          onClick={() => editSection(section)}
                          className="text-indigo-500 hover:text-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          aria-label={`Modifier ${section.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="text-red-500 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          aria-label={`Supprimer ${section.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
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

export default Sections;