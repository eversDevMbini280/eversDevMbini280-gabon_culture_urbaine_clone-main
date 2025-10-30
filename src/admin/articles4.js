// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { FileText, Plus, Edit, Trash2, RefreshCw, FilePlus, Upload, X, Play } from 'lucide-react';

// // Base64 fallback image (1x1 transparent pixel)
// const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// const Articles4 = ({ apiUrl = 'https://gabon-culture-urbaine-1.onrender.com' }) => {
//   const [scienceArticles, setScienceArticles] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loginData, setLoginData] = useState({ username: '', password: '' });
//   const [formData, setFormData] = useState({
//     id: null,
//     title: '',
//     content: '',
//     category_id: '',
//     section_id: '',
//     science_section: 'science',
//     status: 'draft',
//     image: null,
//     video: null,
//     remove_image: false,
//     remove_video: false,
//     author_name: '',
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isEditing, setIsEditing] = useState(false);
//   const [failedImages, setFailedImages] = useState(new Set());

//   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//   const isAdmin = userInfo.role === 'admin';

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setIsAuthenticated(true);
//       fetchData(token);
//     } else {
//       setErrorMessage('Aucun token trouvé. Veuillez vous connecter.');
//     }
//   }, [apiUrl]);

//   const fetchData = async (token) => {
//     setIsLoading(true);
//     try {
//       const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
//       const [articlesResponse, categoriesResponse, sectionsResponse] = await Promise.all([
//         fetch(`${apiUrl}/api/science-articles/`, { cache: 'no-store', headers }),
//         fetch(`${apiUrl}/api/categories/`, { cache: 'no-store', headers }),
//         fetch(`${apiUrl}/api/sections/`, { cache: 'no-store', headers }),
//       ]);

//       const responses = [
//         { res: articlesResponse, name: 'Science Articles' },
//         { res: categoriesResponse, name: 'Categories' },
//         { res: sectionsResponse, name: 'Sections' },
//       ];

//       for (const { res, name } of responses) {
//         if (!res.ok) {
//           const errorData = await res.json().catch(() => ({}));
//           throw new Error(`Échec de la récupération des ${name}: ${errorData.detail || res.statusText}`);
//         }
//       }

//       const [articlesData, categoriesData, sectionsData] = await Promise.all([
//         articlesResponse.json(),
//         categoriesResponse.json(),
//         sectionsResponse.json(),
//       ]);

//       setScienceArticles(
//         Array.isArray(articlesData)
//           ? articlesData.map((item) => ({
//               ...item,
//               image_url:
//                 item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
//                   ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
//                   : item.image_url || FALLBACK_IMAGE,
//             }))
//           : []
//       );
//       setCategories(Array.isArray(categoriesData) ? categoriesData : []);
//       setSections(Array.isArray(sectionsData) ? sectionsData : []);
//     } catch (error) {
//       setErrorMessage(error.message || 'Échec de la récupération des données.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${apiUrl}/api/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//         body: new URLSearchParams({
//           username: loginData.username,
//           password: loginData.password,
//         }),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Échec de la connexion');
//       }
//       const data = await response.json();
//       localStorage.setItem('token', data.access_token);
//       localStorage.setItem('userInfo', JSON.stringify(data.user_info));
//       setIsAuthenticated(true);
//       fetchData(data.access_token);
//     } catch (error) {
//       setErrorMessage(error.message || 'Échec de la connexion.');
//     }
//   };

//   const filteredData = () => {
//     return scienceArticles.filter(
//       (item) =>
//         (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.science_section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          new Date(item.created_at).toLocaleDateString('fr-FR').includes(searchQuery.toLowerCase())) &&
//         item.status !== 'archived'
//     );
//   };

//   const renderStatusBadge = (status) => {
//     const colorClass = {
//       published: 'bg-green-100 text-green-800 border-green-200',
//       draft: 'bg-gray-100 text-gray-800 border-gray-200',
//       pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//     }[status] || 'bg-blue-100 text-blue-800 border-blue-200';
//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   const handleFileChange = (e, type) => {
//     const file = e.target.files[0];
//     if (file && type === 'image' && !['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.type)) {
//       setErrorMessage('Veuillez sélectionner une image PNG, JPG, JPEG ou GIF.');
//       return;
//     }
//     if (file && type === 'video' && !['video/mp4', 'video/mov', 'video/avi'].includes(file.type)) {
//       setErrorMessage('Veuillez sélectionner une vidéo MP4, MOV ou AVI.');
//       return;
//     }
//     setFormData((prev) => ({ ...prev, [type]: file }));
//   };

//   const handleImageError = useCallback(
//     (e, itemId) => {
//       if (!failedImages.has(itemId)) {
//         setFailedImages((prev) => new Set(prev).add(itemId));
//         e.target.style.display = 'none';
//         const defaultIcon = e.target.parentElement.querySelector('.default-icon');
//         if (defaultIcon) defaultIcon.classList.remove('hidden');
//       }
//     },
//     [failedImages]
//   );

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setErrorMessage('');

//     try {
//       const token = localStorage.getItem('token');
//       if (!formData.title.trim() || !formData.content.trim() || !formData.category_id || !formData.section_id || !formData.science_section) {
//         throw new Error('Veuillez remplir tous les champs obligatoires');
//       }

//       const formDataToSend = new FormData();
//       formDataToSend.append('title', formData.title.trim());
//       formDataToSend.append('content', formData.content.trim());
//       formDataToSend.append('category_id', parseInt(formData.category_id));
//       formDataToSend.append('section_id', parseInt(formData.section_id));
//       formDataToSend.append('science_section', formData.science_section);
//       formDataToSend.append('status', formData.status || 'draft');
//       if (formData.image) formDataToSend.append('image', formData.image);
//       if (formData.video) formDataToSend.append('video', formData.video);
//       formDataToSend.append('remove_image', formData.remove_image);
//       formDataToSend.append('remove_video', formData.remove_video);
//       if (isAdmin && formData.author_name.trim()) {
//         formDataToSend.append('author_name', formData.author_name.trim());
//       }

//       const method = isEditing ? 'PUT' : 'POST';
//       const url = isEditing ? `${apiUrl}/api/science-articles/${formData.id}` : `${apiUrl}/api/science-articles/`;

//       const response = await fetch(url, {
//         method,
//         headers: { Authorization: `Bearer ${token}` },
//         body: formDataToSend,
//       });

//       const responseData = await response.json();
//       if (!response.ok) {
//         throw new Error(
//           responseData.detail ||
//             `Échec de la ${isEditing ? 'mise à jour' : 'création'} de l'article scientifique`
//         );
//       }

//       const updatedItem = {
//         ...responseData,
//         image_url:
//           responseData.image_url && !responseData.image_url.startsWith('http') && !responseData.image_url.startsWith('//')
//             ? `${apiUrl}${responseData.image_url.startsWith('/') ? responseData.image_url : `/${responseData.image_url}`}`
//             : responseData.image_url || FALLBACK_IMAGE,
//       };

//       if (isEditing) {
//         setScienceArticles(scienceArticles.map((item) => (item.id === formData.id ? updatedItem : item)));
//       } else {
//         setScienceArticles([...scienceArticles, updatedItem]);
//       }

//       resetForm();
//     } catch (error) {
//       setErrorMessage(
//         error.message ||
//           `Échec de la ${isEditing ? 'mise à jour' : 'création'} de l'article scientifique.`
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleEdit = (item) => {
//     const section = sections.find((s) => s.slug === 'sciences');
//     setFormData({
//       id: item.id,
//       title: item.title || '',
//       content: item.content || '',
//       category_id: item.category_id || '',
//       section_id: section?.id || '',
//       science_section: item.science_section || 'science',
//       status: item.status || 'draft',
//       image: null,
//       video: null,
//       remove_image: false,
//       remove_video: false,
//       author_name: item.author_name || '',
//     });
//     setIsEditing(true);
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Voulez-vous vraiment supprimer cet article scientifique ? Cette action est irréversible.')) return;
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${apiUrl}/api/science-articles/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Échec de la suppression');
//       }
//       setScienceArticles(scienceArticles.filter((item) => item.id !== id));
//     } catch (error) {
//       setErrorMessage(error.message || 'Échec de la suppression.');
//     }
//   };

//   const resetForm = () => {
//     const section = sections.find((s) => s.slug === 'sciences');
//     setFormData({
//       id: null,
//       title: '',
//       content: '',
//       category_id: '',
//       section_id: section?.id || '',
//       science_section: 'science',
//       status: 'draft',
//       image: null,
//       video: null,
//       remove_image: false,
//       remove_video: false,
//       author_name: '',
//     });
//     setIsEditing(false);
//     setErrorMessage('');
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
//           <h2 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h2>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//                 Nom d'utilisateur
//               </label>
//               <input
//                 type="text"
//                 id="username"
//                 value={loginData.username}
//                 onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                 placeholder="Nom d'utilisateur"
//                 required
//                 aria-label="Nom d'utilisateur"
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Mot de passe
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 value={loginData.password}
//                 onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                 placeholder="Mot de passe"
//                 required
//                 aria-label="Mot de passe"
//               />
//             </div>
//             <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
//               Connexion
//             </button>
//           </form>
//           {errorMessage && (
//             <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
//               {errorMessage}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//         <div>
//           <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion des Articles Scientifiques</h3>
//           <p className="text-sm text-gray-500">Gérez les articles scientifiques et leurs sections</p>
//         </div>
//         <button
//           onClick={resetForm}
//           className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           <Plus className="w-5 h-5 mr-2" />
//           Ajouter un article
//         </button>
//       </div>
//       <div className="bg-white p-4 rounded-lg shadow mb-6">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Rechercher par titre, contenu, catégorie, section, statut, auteur, date..."
//             className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             aria-label="Rechercher des articles"
//           />
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>
//       </div>
//       <div className="bg-white rounded-lg shadow mb-6 overflow-x-auto">
//         {isLoading ? (
//           <div className="p-12 flex flex-col items-center justify-center">
//             <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
//             <p className="text-gray-500">Chargement...</p>
//           </div>
//         ) : filteredData().length > 0 ? (
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aperçu</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section Scientifique</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de Publication</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredData().map((item) => (
//                 <tr key={item.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap relative">
//                     <img
//                       src={item.image_url}
//                       alt={item.title || 'Image'}
//                       className="w-16 h-12 object-cover rounded"
//                       onError={(e) => handleImageError(e, item.id)}
//                     />
//                     <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                       <Play className="w-8 h-8 text-gray-400 bg-black/50 rounded-full p-2" />
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     <Link
//                       href={`/science-articles/${item.id}`}
//                       className="text-blue-600 hover:text-blue-800"
//                     >
//                       {item.title || 'Sans titre'}
//                     </Link>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category?.name || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.science_section || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author_name || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderStatusBadge(item.status)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 mr-4" aria-label="Modifier l'article">
//                       <Edit className="w-5 h-5" />
//                     </button>
//                     <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800" aria-label="Supprimer l'article">
//                       <Trash2 className="w-5 h-5" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <div className="p-12 flex flex-col items-center justify-center text-gray-500">
//             <FilePlus className="w-16 h-16 text-gray-300 mb-4" />
//             <p className="mb-2">Aucun élément trouvé</p>
//             <p className="text-sm text-gray-400">
//               {searchQuery
//                 ? 'Aucun résultat pour la recherche actuelle.'
//                 : 'Ajoutez un article scientifique en cliquant sur "Ajouter".'}
//             </p>
//           </div>
//         )}
//       </div>
//       <div className="bg-white rounded-lg shadow p-6 max-h-screen overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-medium text-gray-800">
//             {isEditing ? 'Modifier' : 'Ajouter'} un Article Scientifique
//           </h3>
//           {isEditing && (
//             <button onClick={resetForm} className="text-gray-500 hover:text-gray-700" aria-label="Annuler la modification">
//               <X className="w-6 h-6" />
//             </button>
//           )}
//         </div>
//         {errorMessage && (
//           <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
//             {errorMessage}
//           </div>
//         )}
//         <form className="space-y-6" onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//                 Titre *
//               </label>
//               <input
//                 type="text"
//                 id="title"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                 placeholder="Entrez le titre"
//                 required
//                 aria-label="Titre de l'article"
//               />
//             </div>
//             <div>
//               <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
//                 Catégorie *
//               </label>
//               <select
//                 id="category_id"
//                 value={formData.category_id}
//                 onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//                 required
//                 aria-label="Catégorie"
//               >
//                 <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une catégorie</option>
//                 {categories.map((category) => (
//                   <option key={category.id} value={category.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
//                     {category.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label htmlFor="section_id" className="block text-sm font-medium text-gray-700">
//                 Section *
//               </label>
//               <select
//                 id="section_id"
//                 value={formData.section_id}
//                 onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//                 required
//                 aria-label="Section"
//               >
//                 <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une section</option>
//                 {sections.map((section) => (
//                   <option key={section.id} value={section.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
//                     {section.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label htmlFor="science_section" className="block text-sm font-medium text-gray-700">
//                 Section Scientifique *
//               </label>
//               <select
//                 id="science_section"
//                 value={formData.science_section}
//                 onChange={(e) => setFormData({ ...formData, science_section: e.target.value })}
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//                 required
//                 aria-label="Section scientifique"
//               >
//                 <option value="science" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Science</option>
//                 <option value="technologie" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Technologie</option>
//                 <option value="innovation" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Innovation</option>
//                 <option value="recherche" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Recherche</option>
//                 <option value="developpement_durable" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Développement Durable</option>
//                 <option value="biotechnologie" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Biotechnologie</option>
//                 <option value="intelligence_artificielle" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Intelligence Artificielle</option>
//                 <option value="sante_numerique" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Santé Numérique</option>
//               </select>
//             </div>
//             <div>
//               <label htmlFor="status" className="block text-sm font-medium text-gray-700">
//                 Statut *
//               </label>
//               <select
//                 id="status"
//                 value={formData.status}
//                 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//                 required
//                 aria-label="Statut"
//               >
//                 <option value="draft" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Brouillon</option>
//                 <option value="pending" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">En attente</option>
//                 <option value="published" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Publié</option>
//               </select>
//             </div>
//             {isAdmin && (
//               <div>
//                 <label htmlFor="author_name" className="block text-sm font-medium text-gray-700">
//                   Nom de l'Auteur
//                 </label>
//                 <input
//                   type="text"
//                   id="author_name"
//                   value={formData.author_name}
//                   onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
//                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//                   placeholder="Nom de l'auteur"
//                   aria-label="Nom de l'auteur"
//                 />
//               </div>
//             )}
//           </div>
//           <div>
//             <label htmlFor="content" className="block text-sm font-medium text-gray-700">
//               Contenu *
//             </label>
//             <textarea
//               id="content"
//               value={formData.content}
//               onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//               className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600 resize-vertical"
//               rows="6"
//               required
//               placeholder="Contenu de l'article"
//               aria-label="Contenu de l'article"
//             />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label htmlFor="image" className="block text-sm font-medium text-gray-700">
//                 Image
//               </label>
//               <div className="mt-1 flex items-center">
//                 <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-100">
//                   <Upload className="w-8 h-8 text-gray-400" />
//                   <span className="mt-2 text-sm text-gray-600">
//                     {formData.image ? formData.image.name : 'Sélectionner une image'}
//                   </span>
//                   <input
//                     id="image"
//                     type="file"
//                     accept="image/png,image/jpeg,image/jpg,image/gif"
//                     onChange={(e) => handleFileChange(e, 'image')}
//                     className="hidden"
//                     aria-label="Télécharger une image"
//                   />
//                 </label>
//               </div>
//               {isEditing && (
//                 <div className="mt-2">
//                   <label className="inline-flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={formData.remove_image}
//                       onChange={(e) => setFormData({ ...formData, remove_image: e.target.checked })}
//                       className="rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500"
//                       aria-label="Supprimer l'image existante"
//                     />
//                     <span className="ml-2 text-sm text-gray-600">Supprimer l'image existante</span>
//                   </label>
//                 </div>
//               )}
//             </div>
//             <div>
//               <label htmlFor="video" className="block text-sm font-medium text-gray-700">
//                 Vidéo
//               </label>
//               <div className="mt-1 flex items-center">
//                 <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-100">
//                   <Upload className="w-8 h-8 text-gray-400" />
//                   <span className="mt-2 text-sm text-gray-600">
//                     {formData.video ? formData.video.name : 'Sélectionner une vidéo'}
//                   </span>
//                   <input
//                     id="video"
//                     type="file"
//                     accept="video/mp4,video/mov,video/avi"
//                     onChange={(e) => handleFileChange(e, 'video')}
//                     className="hidden"
//                     aria-label="Télécharger une vidéo"
//                   />
//                 </label>
//               </div>
//               {isEditing && (
//                 <div className="mt-2">
//                   <label className="inline-flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={formData.remove_video}
//                       onChange={(e) => setFormData({ ...formData, remove_video: e.target.checked })}
//                       className="rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500"
//                       aria-label="Supprimer la vidéo existante"
//                     />
//                     <span className="ml-2 text-sm text-gray-600">Supprimer la vidéo existante</span>
//                   </label>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={resetForm}
//               className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
//             >
//               Annuler
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
//                 isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//             >
//               {isSubmitting ? (
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//               ) : (
//                 <FileText className="w-5 h-5 mr-2" />
//               )}
//               {isEditing ? 'Mettre à jour' : 'Créer'} l'article
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Articles4;





'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Edit, Trash2, RefreshCw, FilePlus, Upload, X, Play, Check } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const Articles4 = ({ apiUrl = 'https://gabon-culture-urbaine-1.onrender.com' }) => {
  const [scienceArticles, setScienceArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    content: '',
    category_id: '',
    section_id: '',
    science_section: 'science',
    status: 'draft',
    image: null,
    video: null,
    remove_image: false,
    remove_video: false,
    author_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isAdmin = userInfo.role === 'admin';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchData(token);
    } else {
      setErrorMessage('Aucun token trouvé. Veuillez vous connecter.');
    }
  }, [apiUrl]);

  const fetchData = async (token) => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
      const [articlesResponse, categoriesResponse, sectionsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/science-articles/`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/categories/`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/sections/`, { cache: 'no-store', headers }),
      ]);

      const responses = [
        { res: articlesResponse, name: 'Science Articles' },
        { res: categoriesResponse, name: 'Categories' },
        { res: sectionsResponse, name: 'Sections' },
      ];

      for (const { res, name } of responses) {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Échec de la récupération des ${name}: ${errorData.detail || res.statusText}`);
        }
      }

      const [articlesData, categoriesData, sectionsData] = await Promise.all([
        articlesResponse.json(),
        categoriesResponse.json(),
        sectionsResponse.json(),
      ]);

      setScienceArticles(
        Array.isArray(articlesData)
          ? articlesData.map((item) => ({
              ...item,
              image_url:
                item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
                  ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
                  : item.image_url || FALLBACK_IMAGE,
            }))
          : []
      );
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
    } catch (error) {
      setErrorMessage(error.message || 'Échec de la récupération des données.');
    } finally {
      setIsLoading(false);
    }
  };

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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Échec de la connexion');
      }
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userInfo', JSON.stringify(data.user_info));
      setIsAuthenticated(true);
      fetchData(data.access_token);
    } catch (error) {
      setErrorMessage(error.message || 'Échec de la connexion.');
    }
  };

  const filteredData = () => {
    return scienceArticles.filter(
      (item) =>
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.science_section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         new Date(item.created_at).toLocaleDateString('fr-FR').includes(searchQuery.toLowerCase())) &&
        item.status !== 'archived'
    );
  };

  const renderStatusBadge = (status) => {
    const colorClass = {
      published: 'bg-green-100 text-green-800 border-green-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    }[status] || 'bg-blue-100 text-blue-800 border-blue-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, [type]: null }));
      if (type === 'image') setImagePreview(null);
      if (type === 'video') setVideoPreview(null);
      return;
    }
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      setErrorMessage('Veuillez sélectionner une image PNG, JPG, JPEG ou GIF.');
      e.target.value = '';
      return;
    }
    if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
      setErrorMessage('Veuillez sélectionner une vidéo MP4, MOV ou AVI.');
      e.target.value = '';
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (type === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        setFormData((prev) => ({ ...prev, video: file }));
        setVideoPreview(previewUrl);
      };
      video.src = previewUrl;
      video.load();
    } else {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(previewUrl);
    }
  };

  const handleImageError = useCallback(
    (e, itemId) => {
      if (!failedImages.has(itemId)) {
        setFailedImages((prev) => new Set(prev).add(itemId));
        e.target.style.display = 'none';
        const defaultIcon = e.target.parentElement.querySelector('.default-icon');
        if (defaultIcon) defaultIcon.classList.remove('hidden');
      }
    },
    [failedImages]
  );

  const filePickerCallback = (callback, value, meta) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    if (meta.filetype === 'image') {
      input.setAttribute('accept', 'image/png,image/jpeg,image/jpg,image/gif');
    } else if (meta.filetype === 'media') {
      input.setAttribute('accept', 'video/mp4,video/mov,video/avi');
    } else {
      console.warn('Unsupported file type:', meta.filetype);
      return;
    }

    input.onchange = () => {
      const file = input.files[0];
      if (!file) {
        console.warn('No file selected');
        return;
      }

      const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      const type = meta.filetype === 'image' ? 'image' : 'video';

      if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
        alert('Only MP4, MOV, or AVI videos are supported');
        return;
      }
      if (type === 'image' && !allowedImageTypes.includes(file.type)) {
        alert('Only PNG, JPG, JPEG, or GIF images are supported');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));
      if (type === 'image') setImagePreview(previewUrl);
      if (type === 'video') setVideoPreview(previewUrl);

      callback(previewUrl, { alt: file.name });
    };

    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!formData.title.trim() || !formData.content.trim() || !formData.category_id || !formData.section_id || !formData.science_section) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      let updatedContent = formData.content;
      if (imagePreview?.startsWith('blob:') && formData.image) {
        const imageUrl = imagePreview;
        updatedContent = updatedContent.replaceAll(imagePreview, imageUrl);
      }
      if (videoPreview?.startsWith('blob:') && formData.video) {
        const videoUrl = videoPreview;
        updatedContent = updatedContent.replaceAll(videoPreview, videoUrl);
      }
      formDataToSend.append('content', updatedContent);
      formDataToSend.append('category_id', parseInt(formData.category_id));
      formDataToSend.append('section_id', parseInt(formData.section_id));
      formDataToSend.append('science_section', formData.science_section);
      formDataToSend.append('status', formData.status || 'draft');
      if (formData.image) formDataToSend.append('image', formData.image);
      if (formData.video) formDataToSend.append('video', formData.video);
      formDataToSend.append('remove_image', formData.remove_image);
      formDataToSend.append('remove_video', formData.remove_video);
      if (isAdmin && formData.author_name.trim()) {
        formDataToSend.append('author_name', formData.author_name.trim());
      }

      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `${apiUrl}/api/science-articles/${formData.id}` : `${apiUrl}/api/science-articles/`;

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.detail ||
            `Échec de la ${isEditing ? 'mise à jour' : 'création'} de l'article scientifique`
        );
      }

      const updatedItem = {
        ...responseData,
        image_url:
          responseData.image_url && !responseData.image_url.startsWith('http') && !responseData.image_url.startsWith('//')
            ? `${apiUrl}${responseData.image_url.startsWith('/') ? responseData.image_url : `/${responseData.image_url}`}`
            : responseData.image_url || FALLBACK_IMAGE,
      };

      if (isEditing) {
        setScienceArticles(scienceArticles.map((item) => (item.id === formData.id ? updatedItem : item)));
      } else {
        setScienceArticles([...scienceArticles, updatedItem]);
      }

      resetForm();
    } catch (error) {
      setErrorMessage(
        error.message ||
          `Échec de la ${isEditing ? 'mise à jour' : 'création'} de l'article scientifique.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    const section = sections.find((s) => s.slug === 'sciences');
    setFormData({
      id: item.id,
      title: item.title || '',
      content: item.content || '',
      category_id: item.category_id || '',
      section_id: section?.id || '',
      science_section: item.science_section || 'science',
      status: item.status || 'draft',
      image: null,
      video: null,
      remove_image: false,
      remove_video: false,
      author_name: item.author_name || '',
    });
    setImagePreview(item.image_url || null);
    setVideoPreview(item.video_url || null);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet article scientifique ? Cette action est irréversible.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/science-articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Échec de la suppression');
      }
      setScienceArticles(scienceArticles.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(error.message || 'Échec de la suppression.');
    }
  };

  const resetForm = () => {
    const section = sections.find((s) => s.slug === 'sciences');
    setFormData({
      id: null,
      title: '',
      content: '',
      category_id: '',
      section_id: section?.id || '',
      science_section: 'science',
      status: 'draft',
      image: null,
      video: null,
      remove_image: false,
      remove_video: false,
      author_name: '',
    });
    setImagePreview(null);
    setVideoPreview(null);
    setIsEditing(false);
    setErrorMessage('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                placeholder="Nom d'utilisateur"
                required
                aria-label="Nom d'utilisateur"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                placeholder="Mot de passe"
                required
                aria-label="Mot de passe"
              />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Connexion
            </button>
          </form>
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion des Articles Scientifiques</h3>
          <p className="text-sm text-gray-500">Gérez les articles scientifiques et leurs sections</p>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un article
        </button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par titre, contenu, catégorie, section, statut, auteur, date..."
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Rechercher des articles"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow mb-6 overflow-x-auto">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : filteredData().length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aperçu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section Scientifique</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de Publication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData().map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap relative">
                    <img
                      src={item.image_url}
                      alt={item.title || 'Image'}
                      className="w-16 h-12 object-cover rounded"
                      onError={(e) => handleImageError(e, item.id)}
                    />
                    <div className="default-icon hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Play className="w-8 h-8 text-gray-400 bg-black/50 rounded-full p-2" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link
                      href={`/science-articles/${item.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {item.title || 'Sans titre'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.science_section || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 mr-4" aria-label="Modifier l'article">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800" aria-label="Supprimer l'article">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <FilePlus className="w-16 h-16 text-gray-300 mb-4" />
            <p className="mb-2">Aucun élément trouvé</p>
            <p className="text-sm text-gray-400">
              {searchQuery
                ? 'Aucun résultat pour la recherche actuelle.'
                : 'Ajoutez un article scientifique en cliquant sur "Ajouter".'}
            </p>
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            {isEditing ? 'Modifier' : 'Ajouter'} un Article Scientifique
          </h3>
          {isEditing && (
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700" aria-label="Annuler la modification">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {errorMessage}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titre *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                placeholder="Entrez le titre"
                required
                aria-label="Titre de l'article"
              />
            </div>
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Catégorie *
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                required
                aria-label="Catégorie"
              >
                <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="section_id" className="block text-sm font-medium text-gray-700">
                Section *
              </label>
              <select
                id="section_id"
                value={formData.section_id}
                onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                required
                aria-label="Section"
              >
                <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="science_section" className="block text-sm font-medium text-gray-700">
                Section Scientifique *
              </label>
              <select
                id="science_section"
                value={formData.science_section}
                onChange={(e) => setFormData({ ...formData, science_section: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                required
                aria-label="Section scientifique"
              >
                <option value="science" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Science</option>
                <option value="technologie" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Technologie</option>
                <option value="innovation" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Innovation</option>
                <option value="recherche" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Recherche</option>
                <option value="developpement_durable" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Développement Durable</option>
                <option value="biotechnologie" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Biotechnologie</option>
                <option value="intelligence_artificielle" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Intelligence Artificielle</option>
                <option value="sante_numerique" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Santé Numérique</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Statut *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                required
                aria-label="Statut"
              >
                <option value="draft" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Brouillon</option>
                <option value="pending" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">En attente</option>
                <option value="published" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Publié</option>
              </select>
            </div>
            {isAdmin && (
              <div>
                <label htmlFor="author_name" className="block text-sm font-medium text-gray-700">
                  Nom de l'Auteur
                </label>
                <input
                  type="text"
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                  placeholder="Nom de l'auteur"
                  aria-label="Nom de l'auteur"
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenu *
            </label>
            <div className="tinymce-wrapper mt-1">
              <Editor
                apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                value={formData.content}
                onEditorChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                init={{
                  height: 400,
                  menubar: true,
                  plugins: [
                    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                    'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
                  ],
                  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                  tinycomments_mode: 'embedded',
                  tinycomments_author: 'Admin',
                  mergetags_list: [
                    { value: 'First.Name', title: 'First Name' },
                    { value: 'Email', title: 'Email' },
                  ],
                  ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('AI Assistant not implemented')),
                  file_picker_callback: filePickerCallback,
                  file_picker_types: 'image media',
                  content_style: `
                    body { 
                      font-family: Arial, sans-serif; 
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
                  placeholder: 'Contenu de l\'article scientifique'
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <div className="mt-1 flex items-center">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-100">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-600">
                    {formData.image ? formData.image.name : 'Sélectionner une image'}
                  </span>
                  <input
                    id="image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    onChange={(e) => handleFileChange(e, 'image')}
                    className="hidden"
                    aria-label="Télécharger une image"
                  />
                </label>
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 h-32 object-cover rounded-lg"
                />
              )}
              {isEditing && (
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.remove_image}
                      onChange={(e) => setFormData({ ...formData, remove_image: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500"
                      aria-label="Supprimer l'image existante"
                    />
                    <span className="ml-2 text-sm text-gray-600">Supprimer l'image existante</span>
                  </label>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="video" className="block text-sm font-medium text-gray-700">
                Vidéo
              </label>
              <div className="mt-1 flex items-center">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-100">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-600">
                    {formData.video ? formData.video.name : 'Sélectionner une vidéo'}
                  </span>
                  <input
                    id="video"
                    type="file"
                    accept="video/mp4,video/mov,video/avi"
                    onChange={(e) => handleFileChange(e, 'video')}
                    className="hidden"
                    aria-label="Télécharger une vidéo"
                  />
                </label>
              </div>
              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="mt-2 h-32 object-cover rounded-lg"
                />
              )}
              {isEditing && (
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.remove_video}
                      onChange={(e) => setFormData({ ...formData, remove_video: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500"
                      aria-label="Supprimer la vidéo existante"
                    />
                    <span className="ml-2 text-sm text-gray-600">Supprimer la vidéo existante</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              {isEditing ? 'Mettre à jour' : 'Créer'} l'article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Articles4;