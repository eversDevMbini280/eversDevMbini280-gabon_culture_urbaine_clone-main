"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw, X, Check, AlertTriangle } from 'lucide-react';

const Actualite = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000" }) => {
  const [actualites, setActualites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
      setIsEditModalOpen(false);
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
      case 'published': colorClass = 'bg-green-100 text-green-800 border-green-200'; break;
      case 'draft': colorClass = 'bg-gray-100 text-gray-800 border-gray-200'; break;
      case 'pending': colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200'; break;
      default: colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-medium text-gray-800">
          Toutes les Actualités
        </h3>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou statut..."
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => fetchActualites()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Actualiser
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Ajouter une actualité</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Chargement des actualités...</p>
          </div>
        ) : filteredActualites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActualites.map((actualite) => (
                  <tr key={actualite.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{actualite.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2 sm:line-clamp-1">{actualite.description}</div>
                          <div className="sm:hidden text-xs text-gray-400 mt-1">
                            {new Date(actualite.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(actualite.status)}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(actualite.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(actualite)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(actualite)}
                          className="text-red-600 hover:text-red-900 p-1"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-xl font-medium">Ajouter une nouvelle actualité</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {formError && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-start">
                  <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}
              <form id="actualiteForm" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Entrez le titre de l&apos;actualité"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      rows="4"
                      placeholder="Description de l&apos;actualité"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value} className="text-gray-900 bg-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="actualiteForm"
                className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
              >
                <Check className="w-5 h-5 mr-2" />
                Ajouter l&apos;actualité
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-xl font-medium">Modifier l&apos;actualité</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {formError && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-start">
                  <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}
              <form id="editForm" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Entrez le titre de l&apos;actualité"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
                      rows="4"
                      placeholder="Description de l&apos;actualité"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value} className="text-gray-900 bg-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="editForm"
                className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
              >
                <Edit className="w-5 h-5 mr-2" />
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedActualite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-red-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Confirmer la suppression</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </div>
              <p className="text-center text-lg font-semibold mb-2 text-gray-900">
                Êtes-vous sûr de vouloir supprimer cette actualité ?
              </p>
              <p className="text-center text-gray-600 mb-4">
                <strong>{selectedActualite.title}</strong>
              </p>
              <p className="text-sm text-center text-gray-400 mb-4">
                Cette action sera irréversible.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteActualite}
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center"
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