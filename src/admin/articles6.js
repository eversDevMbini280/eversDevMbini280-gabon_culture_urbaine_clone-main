// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { FileText, Plus, Edit, Trash2, RefreshCw, FilePlus, Upload, X } from 'lucide-react';

// // Base64 fallback image (1x1 transparent pixel)
// const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// const Articles6 = ({ apiUrl = 'https://gabon-culture-urbaine-1.onrender.com' }) => {
//   const [articles, setArticles] = useState([]);
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
//     category_id: '38', // Default to Arts et Traditions
//     section_id: '',
//     arts_traditions_type: 'tradition',
//     status: 'draft',
//     image: null,
//     remove_image: false,
//     author_name: '',
//     date: '',
//     prep_time: '',
//     cook_time: '',
//     difficulty: '',
//     rating: '',
//     reviews: '',
//     recipe_author: '',
//     specialty: '',
//     recipes_count: '',
//     video_url: '', // Added video_url
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
//         fetch(`${apiUrl}/api/arts-traditions-articles/`, { cache: 'no-store', headers }),
//         fetch(`${apiUrl}/api/categories/`, { cache: 'no-store', headers }),
//         fetch(`${apiUrl}/api/sections/`, { cache: 'no-store', headers }),
//       ]);

//       const responses = [
//         { res: articlesResponse, name: 'Arts Traditions Articles' },
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

//       setArticles(
//         Array.isArray(articlesData)
//           ? articlesData.map((item) => ({
//               ...item,
//               image_url: item.image_url
//                 ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
//                 : FALLBACK_IMAGE,
//               video_url: item.video_url
//                 ? `${apiUrl}${item.video_url.startsWith('/') ? item.video_url : `/${item.video_url}`}`
//                 : null, // Normalize video_url
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
//     return articles.filter(
//       (item) =>
//         (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.section?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.arts_traditions_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//          item.video_url?.toLowerCase().includes(searchQuery.toLowerCase()) || // Added video_url to search
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

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file && !['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.type)) {
//       setErrorMessage('Veuillez sélectionner une image PNG, JPG, JPEG ou GIF.');
//       return;
//     }
//     setFormData((prev) => ({ ...prev, image: file }));
//   };

//   const handleImageError = useCallback(
//     (e, itemId) => {
//       if (!failedImages.has(itemId)) {
//         setFailedImages((prev) => new Set(prev).add(itemId));
//         e.target.src = FALLBACK_IMAGE;
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
//       if (!formData.title.trim() || !formData.content.trim() || !formData.category_id || !formData.section_id || !formData.arts_traditions_type) {
//         throw new Error('Veuillez remplir tous les champs obligatoires');
//       }

//       const formDataToSend = new FormData();
//       formDataToSend.append('title', formData.title.trim());
//       formDataToSend.append('content', formData.content.trim());
//       formDataToSend.append('category_id', parseInt(formData.category_id));
//       formDataToSend.append('section_id', parseInt(formData.section_id));
//       formDataToSend.append('arts_traditions_type', formData.arts_traditions_type);
//       formDataToSend.append('status', formData.status || 'draft');
//       if (formData.image) formDataToSend.append('image', formData.image);
//       formDataToSend.append('remove_image', formData.remove_image);
//       if (isAdmin && formData.author_name.trim()) formDataToSend.append('author_name', formData.author_name.trim());
//       if (formData.date) formDataToSend.append('date', formData.date);
//       if (formData.prep_time) formDataToSend.append('prep_time', formData.prep_time);
//       if (formData.cook_time) formDataToSend.append('cook_time', formData.cook_time);
//       if (formData.difficulty) formDataToSend.append('difficulty', formData.difficulty);
//       if (formData.rating) formDataToSend.append('rating', parseFloat(formData.rating));
//       if (formData.reviews) formDataToSend.append('reviews', parseInt(formData.reviews));
//       if (formData.recipe_author) formDataToSend.append('recipe_author', formData.recipe_author);
//       if (formData.specialty) formDataToSend.append('specialty', formData.specialty);
//       if (formData.recipes_count) formDataToSend.append('recipes_count', parseInt(formData.recipes_count));
//       if (formData.video_url.trim()) formDataToSend.append('video_url', formData.video_url.trim()); // Added video_url

//       const url = isEditing
//         ? `${apiUrl}/api/arts-traditions-articles/${formData.id}`
//         : `${apiUrl}/api/arts-traditions-articles/`;
//       const method = isEditing ? 'PUT' : 'POST';

//       const response = await fetch(url, {
//         method,
//         headers: { Authorization: `Bearer ${token}` },
//         body: formDataToSend,
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || `Échec de ${isEditing ? 'la mise à jour' : 'la création'} de l'article`);
//       }

//       await fetchData(token);
//       resetForm();
//     } catch (error) {
//       setErrorMessage(error.message || 'Une erreur est survenue.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleEdit = (article) => {
//     setFormData({
//       id: article.id,
//       title: article.title,
//       content: article.content,
//       category_id: article.category_id.toString(),
//       section_id: article.section_id.toString(),
//       arts_traditions_type: article.arts_traditions_type,
//       status: article.status,
//       image: null,
//       remove_image: false,
//       author_name: article.author_name || '',
//       date: article.date || '',
//       prep_time: article.prep_time || '',
//       cook_time: article.cook_time || '',
//       difficulty: article.difficulty || '',
//       rating: article.rating || '',
//       reviews: article.reviews || '',
//       recipe_author: article.recipe_author || '',
//       specialty: article.specialty || '',
//       recipes_count: article.recipes_count || '',
//       video_url: article.video_url || '', // Added video_url
//     });
//     setIsEditing(true);
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return;

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${apiUrl}/api/arts-traditions-articles/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Échec de la suppression de l’article');
//       }

//       await fetchData(token);
//     } catch (error) {
//       setErrorMessage(error.message || 'Échec de la suppression de l’article.');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       id: null,
//       title: '',
//       content: '',
//       category_id: '38',
//       section_id: '',
//       arts_traditions_type: 'tradition',
//       status: 'draft',
//       image: null,
//       remove_image: false,
//       author_name: '',
//       date: '',
//       prep_time: '',
//       cook_time: '',
//       difficulty: '',
//       rating: '',
//       reviews: '',
//       recipe_author: '',
//       specialty: '',
//       recipes_count: '',
//       video_url: '', // Added video_url
//     });
//     setIsEditing(false);
//     setErrorMessage('');
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleRemoveImage = () => {
//     setFormData((prev) => ({ ...prev, image: null, remove_image: true }));
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
//           <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
//           {errorMessage && (
//             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMessage}</div>
//           )}
//           <form onSubmit={handleLogin}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700">Nom d’utilisateur</label>
//               <input
//                 type="text"
//                 value={loginData.username}
//                 onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
//                 className="mt-1 p-2 w-full border rounded-md"
//                 required
//               />
//             </div>
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
//               <input
//                 type="password"
//                 value={loginData.password}
//                 onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//                 className="mt-1 p-2 w-full border rounded-md"
//                 required
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
//             >
//               Se connecter
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Gestion des Articles Arts et Traditions
//           </h1>
//           <Link href="/" className="text-blue-600 hover:underline">
//             Retour au site
//           </Link>
//         </div>

//         {errorMessage && (
//           <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMessage}</div>
//         )}

//         {/* Form */}
//         <div className="bg-white p-6 rounded-lg shadow mb-8 max-h-screen overflow-y-auto">
//   <h2 className="text-xl font-semibold mb-4">
//     {isEditing ? 'Modifier' : 'Ajouter'} un Article
//   </h2>
//   <form onSubmit={handleSubmit} className="articles-form">
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Titre</label>
//         <input
//           type="text"
//           name="title"
//           value={formData.title}
//           onChange={handleInputChange}
//           className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//           placeholder="Entrez le titre"
//           required
//           aria-label="Titre de l'article"
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Type</label>
//         <select
//           name="arts_traditions_type"
//           value={formData.arts_traditions_type}
//           onChange={handleInputChange}
//           className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//           required
//           aria-label="Type d'article"
//         >
//           <option value="tradition" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Tradition</option>
//           <option value="artisanat" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Artisanat</option>
//           <option value="rite" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Rite</option>
//           <option value="coutume" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Coutume</option>
//           <option value="ethnie" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Ethnie</option>
//           <option value="festival" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Festival</option>
//           <option value="recipe" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Recette</option>
//           <option value="ingredient" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Ingrédient</option>
//           <option value="chef" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Chef</option>
//         </select>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Catégorie</label>
//         <select
//           name="category_id"
//           value={formData.category_id}
//           onChange={handleInputChange}
//           className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//           required
//           aria-label="Catégorie"
//         >
//           <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une catégorie</option>
//           {categories.map((cat) => (
//             <option key={cat.id} value={cat.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
//               {cat.name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Section</label>
//         <select
//           name="section_id"
//           value={formData.section_id}
//           onChange={handleInputChange}
//           className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//           required
//           aria-label="Section"
//         >
//           <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une section</option>
//           {sections.map((sec) => (
//             <option key={sec.id} value={sec.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
//               {sec.name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Statut</label>
//         <select
//           name="status"
//           value={formData.status}
//           onChange={handleInputChange}
//           className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//           aria-label="Statut"
//         >
//           <option value="draft" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Brouillon</option>
//           <option value="pending" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">En attente</option>
//           <option value="published" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Publié</option>
//         </select>
//       </div>
//       {isAdmin && (
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
//       <div>
//         <label className="block text-sm font-medium text-gray-700">URL de la vidéo (optionnel)</label>
//         <input
//           type="text"
//           name="video_url"
//           value={formData.video_url}
//           onChange={handleInputChange}
//           className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//           placeholder="e.g., /videos/example.mp4"
//           aria-label="URL de la vidéo"
//         />
//       </div>
//       {/* Conditional Fields */}
//       {formData.arts_traditions_type === 'festival' && (
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Date</label>
//           <input
//             type="date"
//             name="date"
//             value={formData.date}
//             onChange={handleInputChange}
//             className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//             aria-label="Date du festival"
//           />
//         </div>
//       )}
//       {formData.arts_traditions_type === 'recipe' && (
//         <>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Temps de préparation</label>
//             <input
//               type="text"
//               name="prep_time"
//               value={formData.prep_time}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="e.g., 30 min"
//               aria-label="Temps de préparation"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Temps de cuisson</label>
//             <input
//               type="text"
//               name="cook_time"
//               value={formData.cook_time}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="e.g., 45 min"
//               aria-label="Temps de cuisson"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Difficulté</label>
//             <input
//               type="text"
//               name="difficulty"
//               value={formData.difficulty}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="e.g., Facile"
//               aria-label="Difficulté"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Note</label>
//             <input
//               type="number"
//               name="rating"
//               value={formData.rating}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="0 à 5"
//               step="0.1"
//               min="0"
//               max="5"
//               aria-label="Note"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Nombre d’avis</label>
//             <input
//               type="number"
//               name="reviews"
//               value={formData.reviews}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="0"
//               aria-label="Nombre d’avis"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Auteur de la recette</label>
//             <input
//               type="text"
//               name="recipe_author"
//               value={formData.recipe_author}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="Auteur de la recette"
//               aria-label="Auteur de la recette"
//             />
//           </div>
//         </>
//       )}
//       {formData.arts_traditions_type === 'chef' && (
//         <>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Spécialité</label>
//             <input
//               type="text"
//               name="specialty"
//               value={formData.specialty}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="e.g., Cuisine gabonaise"
//               aria-label="Spécialité"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Nombre de recettes</label>
//             <input
//               type="number"
//               name="recipes_count"
//               value={formData.recipes_count}
//               onChange={handleInputChange}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="0"
//               aria-label="Nombre de recettes"
//             />
//           </div>
//         </>
//       )}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium text-gray-700">Contenu</label>
//         <textarea
//           name="content"
//           value={formData.content}
//           onChange={handleInputChange}
//           rows="10"
//           className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600 resize-vertical"
//           placeholder="Contenu de l'article"
//           required
//           aria-label="Contenu de l'article"
//         />
//       </div>
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium text-gray-700">Image</label>
//         <div className="flex items-center gap-4">
//           <input
//             type="file"
//             name="image"
//             onChange={handleFileChange}
//             accept="image/png,image/jpeg,image/jpg,image/gif"
//             className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//             aria-label="Télécharger une image"
//           />
//           {formData.image && (
//             <button
//               type="button"
//               onClick={handleRemoveImage}
//               className="text-red-500 hover:text-red-700"
//               aria-label="Supprimer l’image"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//     <div className="mt-6 flex gap-2">
//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
//       >
//         {isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer'}
//       </button>
//       {(isEditing || formData.title) && (
//         <button
//           type="button"
//           onClick={resetForm}
//           className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//         >
//           Annuler
//         </button>
//       )}
//     </div>
//   </form>
// </div>

//         {/* Articles Table */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Liste des Articles</h2>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Rechercher..."
//                   className="p-2 border rounded-md"
//                 />
//                 <button
//                   onClick={() => fetchData(localStorage.getItem('token'))}
//                   className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
//                 >
//                   <RefreshCw className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//             {isLoading ? (
//               <div className="text-center py-4">Chargement...</div>
//             ) : filteredData().length === 0 ? (
//               <div className="text-center py-4">Aucun article trouvé.</div>
//             ) : (
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Titre</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Catégorie</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Section</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Statut</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Auteur</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date de Création</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vidéo</th>
//                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredData().map((item, index) => (
//                     <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
//                       <td className="px-6 py-2">
//                         <div className="relative w-16 h-16">
//                           <img
//                             src={item.image_url}
//                             alt={item.title}
//                             className="w-full h-full object-cover rounded"
//                             onError={(e) => handleImageError(e, item.id)}
//                           />
//                           <FileText
//                             className="default-icon hidden w-6 h-6 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
//                           />
//                         </div>
//                       </td>
//                       <td className="px-4 py-2 text-sm font-medium">{item.title}</td>
//                       <td className="px-4 py-2 text-sm">{item.arts_traditions_type}</td>
//                       <td className="px-4 py-2 text-sm">{item.category?.name}</td>
//                       <td className="px-4 py-2 text-sm">{item.section?.name}</td>
//                       <td className="px-4 py-2">{renderStatusBadge(item.status)}</td>
//                       <td className="px-4 py-2 text-sm">{item.author_name || item.author_username}</td>
//                       <td className="px-4 py-2 text-sm">{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
//                       <td className="px-4 py-2 text-sm">{item.video_url ? <a href={item.video_url} target="_blank" className="text-blue-600 hover:underline">Voir</a> : '-'}</td>
//                       <td className="px-4 py-2 text-right">
//                         <div className="flex justify-end gap-2">
//                           <button
//                             onClick={() => handleEdit(item)}
//                             className="text-blue-500 hover:text-blue-600"
//                           >
//                             <Edit className="w-5 h-5" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(item.id)}
//                             className="text-red-500 hover:text-red-600"
//                           >
//                             <Trash2 className="w-5 h-5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Articles6;



'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Edit, Trash2, RefreshCw, FilePlus, Upload, X } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const Articles6 = ({ apiUrl = 'https://gabon-culture-urbaine-1.onrender.com' }) => {
  const [articles, setArticles] = useState([]);
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
    category_id: '38', // Default to Arts et Traditions
    section_id: '',
    arts_traditions_type: 'tradition',
    status: 'draft',
    image: null,
    remove_image: false,
    author_name: '',
    date: '',
    prep_time: '',
    cook_time: '',
    difficulty: '',
    rating: '',
    reviews: '',
    recipe_author: '',
    specialty: '',
    recipes_count: '',
    video_url: '',
    video: null, // Added for video file upload
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
        fetch(`${apiUrl}/api/arts-traditions-articles/`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/categories/`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/sections/`, { cache: 'no-store', headers }),
      ]);

      const responses = [
        { res: articlesResponse, name: 'Arts Traditions Articles' },
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

      setArticles(
        Array.isArray(articlesData)
          ? articlesData.map((item) => ({
              ...item,
              image_url: item.image_url
                ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
                : FALLBACK_IMAGE,
              video_url: item.video_url
                ? `${apiUrl}${item.video_url.startsWith('/') ? item.video_url : `/${item.video_url}`}`
                : null,
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
    return articles.filter(
      (item) =>
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.section?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.arts_traditions_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.video_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      else if (type === 'video') setVideoPreview(null);
      return;
    }
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
      setErrorMessage('Seuls les vidéos MP4 et WebM sont supportées.');
      e.target.value = '';
      return;
    }
    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      setErrorMessage('Veuillez sélectionner une image PNG, JPG, JPEG ou GIF.');
      e.target.value = '';
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (type === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        setFormData((prev) => ({
          ...prev,
          video: file,
          duration: Math.round(video.duration)
        }));
        setVideoPreview(previewUrl);
      };
      video.src = previewUrl;
      video.load();
    } else {
      setFormData((prev) => ({ ...prev, image: file, remove_image: false }));
      setImagePreview(previewUrl);
    }
  };

  const handleImageError = useCallback(
    (e, itemId) => {
      if (!failedImages.has(itemId)) {
        setFailedImages((prev) => new Set(prev).add(itemId));
        e.target.src = FALLBACK_IMAGE;
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
      input.setAttribute('accept', 'image/jpeg,image/png,image/jpg,image/gif');
    } else if (meta.filetype === 'media') {
      input.setAttribute('accept', 'video/mp4,video/webm');
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

      const allowedVideoTypes = ['video/mp4', 'video/webm'];
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const type = meta.filetype === 'image' ? 'image' : 'video';

      if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
        alert('Seuls les vidéos MP4 et WebM sont supportées.');
        return;
      }
      if (type === 'image' && !allowedImageTypes.includes(file.type)) {
        alert('Format d’image invalide. Seuls JPG/JPEG/PNG/GIF sont supportés.');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));
      if (type === 'image') setImagePreview(previewUrl);
      else setVideoPreview(previewUrl);

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
      if (!formData.title.trim() || !formData.content.trim() || !formData.category_id || !formData.section_id || !formData.arts_traditions_type) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('category_id', parseInt(formData.category_id));
      formDataToSend.append('section_id', parseInt(formData.section_id));
      formDataToSend.append('arts_traditions_type', formData.arts_traditions_type);
      formDataToSend.append('status', formData.status || 'draft');
      if (formData.image) formDataToSend.append('image', formData.image);
      if (formData.video) formDataToSend.append('video', formData.video);
      formDataToSend.append('remove_image', formData.remove_image);
      if (isAdmin && formData.author_name.trim()) formDataToSend.append('author_name', formData.author_name.trim());
      if (formData.date) formDataToSend.append('date', formData.date);
      if (formData.prep_time) formDataToSend.append('prep_time', formData.prep_time);
      if (formData.cook_time) formDataToSend.append('cook_time', formData.cook_time);
      if (formData.difficulty) formDataToSend.append('difficulty', formData.difficulty);
      if (formData.rating) formDataToSend.append('rating', parseFloat(formData.rating));
      if (formData.reviews) formDataToSend.append('reviews', parseInt(formData.reviews));
      if (formData.recipe_author) formDataToSend.append('recipe_author', formData.recipe_author);
      if (formData.specialty) formDataToSend.append('specialty', formData.specialty);
      if (formData.recipes_count) formDataToSend.append('recipes_count', parseInt(formData.recipes_count));
      if (formData.video_url.trim()) formDataToSend.append('video_url', formData.video_url.trim());

      const url = isEditing
        ? `${apiUrl}/api/arts-traditions-articles/${formData.id}`
        : `${apiUrl}/api/arts-traditions-articles/`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Échec de ${isEditing ? 'la mise à jour' : 'la création'} de l'article`);
      }

      const newArticle = await response.json();
      // Update content to replace blob URLs with backend URLs
      let updatedContent = formData.content;
      if (newArticle.image_url && imagePreview?.startsWith('blob:')) {
        const imageUrl = `${apiUrl}${newArticle.image_url.startsWith('/') ? newArticle.image_url : `/${newArticle.image_url}`}`;
        updatedContent = updatedContent.replaceAll(imagePreview, imageUrl);
      }
      if (newArticle.video_url && videoPreview?.startsWith('blob:')) {
        const videoUrl = `${apiUrl}${newArticle.video_url.startsWith('/') ? newArticle.video_url : `/${newArticle.video_url}`}`;
        updatedContent = updatedContent.replaceAll(videoPreview, videoUrl);
      }
      setFormData((prev) => ({ ...prev, content: updatedContent }));

      await fetchData(token);
      resetForm();
    } catch (error) {
      setErrorMessage(error.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (article) => {
    setFormData({
      id: article.id,
      title: article.title,
      content: article.content,
      category_id: article.category_id.toString(),
      section_id: article.section_id.toString(),
      arts_traditions_type: article.arts_traditions_type,
      status: article.status,
      image: null,
      remove_image: false,
      author_name: article.author_name || '',
      date: article.date || '',
      prep_time: article.prep_time || '',
      cook_time: article.cook_time || '',
      difficulty: article.difficulty || '',
      rating: article.rating || '',
      reviews: article.reviews || '',
      recipe_author: article.recipe_author || '',
      specialty: article.specialty || '',
      recipes_count: article.recipes_count || '',
      video_url: article.video_url || '',
      video: null,
    });
    setImagePreview(article.image_url !== FALLBACK_IMAGE ? article.image_url : null);
    setVideoPreview(article.video_url || null);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/arts-traditions-articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Échec de la suppression de l’article');
      }

      await fetchData(token);
    } catch (error) {
      setErrorMessage(error.message || 'Échec de la suppression de l’article.');
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      content: '',
      category_id: '38',
      section_id: '',
      arts_traditions_type: 'tradition',
      status: 'draft',
      image: null,
      remove_image: false,
      author_name: '',
      date: '',
      prep_time: '',
      cook_time: '',
      difficulty: '',
      rating: '',
      reviews: '',
      recipe_author: '',
      specialty: '',
      recipes_count: '',
      video_url: '',
      video: null,
    });
    setImagePreview(null);
    setVideoPreview(null);
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null, remove_image: true }));
    setImagePreview(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMessage}</div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nom d’utilisateur</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="mt-1 p-2 w-full border rounded-md"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="mt-1 p-2 w-full border rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Articles Arts et Traditions
          </h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Retour au site
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMessage}</div>
        )}

        {/* Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8 max-h-screen overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Modifier' : 'Ajouter'} un Article
          </h2>
          <form onSubmit={handleSubmit} className="articles-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                  placeholder="Entrez le titre"
                  required
                  aria-label="Titre de l'article"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="arts_traditions_type"
                  value={formData.arts_traditions_type}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  required
                  aria-label="Type d'article"
                >
                  <option value="tradition" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Tradition</option>
                  <option value="artisanat" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Artisanat</option>
                  <option value="rite" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Rite</option>
                  <option value="coutume" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Coutume</option>
                  <option value="ethnie" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Ethnie</option>
                  <option value="festival" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Festival</option>
                  <option value="recipe" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Recette</option>
                  <option value="ingredient" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Ingrédient</option>
                  <option value="chef" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Chef</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  required
                  aria-label="Catégorie"
                >
                  <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <select
                  name="section_id"
                  value={formData.section_id}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  required
                  aria-label="Section"
                >
                  <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une section</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
              <div>
                <label className="block text-sm font-medium text-gray-700">URL de la vidéo (optionnel)</label>
                <input
                  type="text"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                  placeholder="e.g., /videos/example.mp4"
                  aria-label="URL de la vidéo"
                />
              </div>
              {/* Conditional Fields */}
              {formData.arts_traditions_type === 'festival' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    aria-label="Date du festival"
                  />
                </div>
              )}
              {formData.arts_traditions_type === 'recipe' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Temps de préparation</label>
                    <input
                      type="text"
                      name="prep_time"
                      value={formData.prep_time}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                      placeholder="e.g., 30 min"
                      aria-label="Temps de préparation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Temps de cuisson</label>
                    <input
                      type="text"
                      name="cook_time"
                      value={formData.cook_time}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                      placeholder="e.g., 45 min"
                      aria-label="Temps de cuisson"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulté</label>
                    <input
                      type="text"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                      placeholder="e.g., Facile"
                      aria-label="Difficulté"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Note</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                      placeholder="0 à 5"
                      step="0.1"
                      min="0"
                      max="5"
                      aria-label="Note"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre d’avis</label>
                    <input
                      type="number"
                      name="reviews"
                      value={formData.reviews}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                      placeholder="0"
                      aria-label="Nombre d’avis"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Auteur de la recette</label>
                    <input
                      type="text"
                      name="recipe_author"
                      value={formData.recipe_author}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                      placeholder="Auteur de la recette"
                      aria-label="Auteur de la recette"
                    />
                  </div>
                </>
              )}
              {formData.arts_traditions_type === 'chef' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Spécialité</label>
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                      placeholder="e.g., Cuisine gabonaise"
                      aria-label="Spécialité"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de recettes</label>
                    <input
                      type="number"
                      name="recipes_count"
                      value={formData.recipes_count}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
                      placeholder="0"
                      aria-label="Nombre de recettes"
                    />
                  </div>
                </>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Contenu</label>
                <div className="tinymce-wrapper">
                  <Editor
                    apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                    value={formData.content}
                    onEditorChange={handleEditorChange}
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
                      placeholder: 'Contenu de l\'article'
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    name="image"
                    onChange={(e) => handleFileChange(e, 'image')}
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    aria-label="Télécharger une image"
                  />
                  {formData.image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Supprimer l’image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Aperçu de l'image"
                    className="mt-2 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vidéo</label>
                <input
                  type="file"
                  name="video"
                  onChange={(e) => handleFileChange(e, 'video')}
                  accept="video/mp4,video/webm"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  aria-label="Télécharger une vidéo"
                />
                {videoPreview && (
                  <video
                    src={videoPreview}
                    controls
                    className="mt-2 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer'}
              </button>
              {(isEditing || formData.title) && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Liste des Articles</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="p-2 border rounded-md"
                />
                <button
                  onClick={() => fetchData(localStorage.getItem('token'))}
                  className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : filteredData().length === 0 ? (
              <div className="text-center py-4">Aucun article trouvé.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Titre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Catégorie</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Auteur</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date de Création</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vidéo</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData().map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-2">
                        <div className="relative w-16 h-16">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => handleImageError(e, item.id)}
                          />
                          <FileText
                            className="default-icon hidden w-6 h-6 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">{item.title}</td>
                      <td className="px-4 py-2 text-sm">{item.arts_traditions_type}</td>
                      <td className="px-4 py-2 text-sm">{item.category?.name}</td>
                      <td className="px-4 py-2 text-sm">{item.section?.name}</td>
                      <td className="px-4 py-2">{renderStatusBadge(item.status)}</td>
                      <td className="px-4 py-2 text-sm">{item.author_name || item.author_username}</td>
                      <td className="px-4 py-2 text-sm">{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-2 text-sm">{item.video_url ? <a href={item.video_url} target="_blank" className="text-blue-600 hover:underline">Voir</a> : '-'}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Articles6;