// import React, { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2 } from 'lucide-react';
// import axios from 'axios';

// // Base64 fallback image (1x1 transparent pixel)
// const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// // Define axios client
// const api = axios.create({
//   baseURL: 'https://gabon-culture-urbaine-1.onrender.com',
// });

// const CultureUrbaineArticlesDashboard = () => {
//   const [articles, setArticles] = useState([]);
//   const [filteredArticles, setFilteredArticles] = useState([]);
//   const [formData, setFormData] = useState({
//     title: '',
//     content: '',
//     category_id: '',
//     section_id: '',
//     status: 'draft',
//     author_name: '',
//     Lmusic: false,
//     Ldance: false,
//     Lafrotcham: false,
//     Lrap: false,
//     image: null,
//     video: null,
//     remove_image: false,
//     remove_video: false,
//   });
//   const [categories, setCategories] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loginData, setLoginData] = useState({ username: '', password: '' });
//   const [filter, setFilter] = useState('');

//   // Check authentication and filter on mount
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const params = new URLSearchParams(window.location.search);
//     const filterParam = params.get('filter');
//     if (filterParam === 'afrotcham') {
//       setFilter('afrotcham');
//     }
//     if (token) {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       setIsAuthenticated(true);
//       fetchArticles();
//       fetchCategories();
//       fetchSections();
//     }
//   }, []);

//   // Apply filter when articles or filter changes
//   useEffect(() => {
//     if (filter === 'afrotcham') {
//       setFilteredArticles(
//         articles.filter((article) => article.Lafrotcham && article.status === 'published')
//       );
//     } else {
//       setFilteredArticles(articles);
//     }
//   }, [articles, filter]);

//   const fetchArticles = async () => {
//     try {
//       const response = await api.get('/culture_urbaine_articles/');
//       setArticles(response.data.map(article => ({
//         ...article,
//         image_url: article.image_url || FALLBACK_IMAGE,
//       })));
//       setError('');
//     } catch (err) {
//       console.error('Fetch articles error:', err);
//       setError(err.response?.data?.detail || 'Échec de la récupération des articles');
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const response = await api.get('/api/categories/');
//       setCategories(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Fetch categories error:', err);
//       setError(err.response?.data?.detail || 'Échec de la récupération des catégories');
//     }
//   };

//   const fetchSections = async () => {
//     try {
//       const response = await api.get('/api/sections/');
//       setSections(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Fetch sections error:', err);
//       setError(err.response?.data?.detail || 'Échec de la récupération des sections');
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post('/api/auth/login', new URLSearchParams({
//         username: loginData.username,
//         password: loginData.password,
//       }), {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       });
//       localStorage.setItem('token', response.data.access_token);
//       localStorage.setItem('userInfo', JSON.stringify(response.data.user_info));
//       api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
//       setIsAuthenticated(true);
//       setError('');
//       fetchArticles();
//       fetchCategories();
//       fetchSections();
//     } catch (err) {
//       console.error('Login error:', err);
//       setError(err.response?.data?.detail || 'Échec de la connexion');
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isAuthenticated) {
//       setError('Veuillez vous connecter pour soumettre un article');
//       return;
//     }
//     setError('');
//     setSuccess('');

//     const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//     const form = new FormData();
//     form.append('title', formData.title);
//     form.append('content', formData.content);
//     form.append('category_id', formData.category_id);
//     if (formData.section_id) form.append('section_id', formData.section_id);
//     form.append('status', formData.status);
//     if (formData.author_name) form.append('author_name', formData.author_name);
//     form.append('Lmusic', formData.Lmusic);
//     form.append('Ldance', formData.Ldance);
//     form.append('Lafrotcham', formData.Lafrotcham);
//     form.append('Lrap', formData.Lrap);
//     if (formData.image) form.append('image', formData.image);
//     if (formData.video) form.append('video', formData.video);
//     if (editingId) {
//       form.append('remove_image', formData.remove_image);
//       form.append('remove_video', formData.remove_video);
//     }

//     try {
//       const config = { headers: { 'Content-Type': 'multipart/form-data' } };
//       if (editingId) {
//         await api.put(`/culture_urbaine_articles/${editingId}`, form, config);
//         setSuccess('Article mis à jour avec succès');
//       } else {
//         await api.post('/culture_urbaine_articles/', form, config);
//         setSuccess('Article créé avec succès');
//       }
//       resetForm();
//       fetchArticles();
//     } catch (err) {
//       console.error('Submit error:', err);
//       setError(err.response?.data?.detail || 'Échec de l\'enregistrement de l\'article');
//     }
//   };

//   const handleEdit = (article) => {
//     setFormData({
//       title: article.title || '',
//       content: article.content || '',
//       category_id: article.category_id || '',
//       section_id: article.section_id || '',
//       status: article.status || 'draft',
//       author_name: article.author_name || '',
//       Lmusic: article.Lmusic || false,
//       Ldance: article.Ldance || false,
//       Lafrotcham: article.Lafrotcham || false,
//       Lrap: article.Lrap || false,
//       image: null,
//       video: null,
//       remove_image: false,
//       remove_video: false,
//     });
//     setEditingId(article.id);
//   };

//   const handleDelete = async (id) => {
//     if (!isAuthenticated) {
//       setError('Veuillez vous connecter pour supprimer un article');
//       return;
//     }
//     if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
//     try {
//       await api.delete(`/culture_urbaine_articles/${id}`);
//       setSuccess('Article supprimé avec succès');
//       fetchArticles();
//     } catch (err) {
//       console.error('Delete error:', err);
//       setError(err.response?.data?.detail || 'Échec de la suppression de l\'article');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       title: '',
//       content: '',
//       category_id: '',
//       section_id: '',
//       status: 'draft',
//       author_name: '',
//       Lmusic: false,
//       Ldance: false,
//       Lafrotcham: false,
//       Lrap: false,
//       image: null,
//       video: null,
//       remove_image: false,
//       remove_video: false,
//     });
//     setEditingId(null);
//     setSuccess('');
//     setError('');
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="p-6">
//         <h2 className="text-2xl font-bold mb-4">Connexion</h2>
//         {error && <div className="text-red-500 mb-4">{error}</div>}
//         <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow mb-6 max-w-md max-h-screen overflow-y-auto">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Nom d’utilisateur</label>
//             <input
//               type="text"
//               value={loginData.username}
//               onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="Nom d’utilisateur"
//               required
//               aria-label="Nom d’utilisateur"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
//             <input
//               type="password"
//               value={loginData.password}
//               onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="Mot de passe"
//               required
//               aria-label="Mot de passe"
//             />
//           </div>
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Se connecter
//           </button>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 w-full min-h-screen bg-white dark:bg-gray-900">
//         <div className="relative z-10">
//           <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
//           Tableau de bord des articles de culture urbaine
//           </h1>
//         </div>
//       {filter === 'afrotcham' && (
//         <div className="mb-4 text-gray-700 dark:text-gray-300">
//           <span className="text-gray-700">Filtre actif : Afrotcham (articles publiés)</span>
//           <button
//             onClick={() => setFilter('')}
//             className="ml-2 text-blue-500 hover:text-blue-700"
//           >
//             Supprimer le filtre
//           </button>
//         </div>
//       )}

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 max-h-screen overflow-y-auto" encType="multipart/form-data">
//   {error && <div className="text-red-500 mb-4">{error}</div>}
//   {success && <div className="text-green-500 mb-4">{success}</div>}
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     <div>
//       <label className="block text-sm font-medium text-gray-700">Titre</label>
//       <input
//         type="text"
//         name="title"
//         value={formData.title}
//         onChange={handleInputChange}
//         className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//         placeholder="Entrez le titre"
//         required
//         aria-label="Titre de l'article"
//       />
//     </div>
//     <div>
//       <label className="block text-sm font-medium text-gray-700">Catégorie</label>
//       <select
//         name="category_id"
//         value={formData.category_id}
//         onChange={handleInputChange}
//         className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//         required
//         aria-label="Catégorie"
//       >
//         <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une catégorie</option>
//         {categories.map((cat) => (
//           <option key={cat.id} value={cat.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">{cat.name}</option>
//         ))}
//       </select>
//     </div>
//     <div>
//       <label className="block text-sm font-medium text-gray-700">Section (facultatif)</label>
//       <select
//         name="section_id"
//         value={formData.section_id}
//         onChange={handleInputChange}
//         className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//         aria-label="Section"
//       >
//         <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Aucune</option>
//         {sections.map((sec) => (
//           <option key={sec.id} value={sec.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">{sec.name}</option>
//         ))}
//       </select>
//     </div>
//     <div>
//       <label className="block text-sm font-medium text-gray-700">Statut</label>
//       <select
//         name="status"
//         value={formData.status}
//         onChange={handleInputChange}
//         className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//         aria-label="Statut"
//       >
//         <option value="draft" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Brouillon</option>
//         <option value="published" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Publié</option>
//         <option value="pending" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">En attente</option>
//       </select>
//     </div>
//     <div>
//       <label className="block text-sm font-medium text-gray-700">Image</label>
//       <input
//         type="file"
//         name="image"
//         accept="image/png,image/jpeg,image/jpg"
//         onChange={handleInputChange}
//         className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//         aria-label="Télécharger une image"
//       />
//       {editingId && articles.find(a => a.id === editingId)?.image_url && (
//         <label className="flex items-center mt-2">
//           <input
//             type="checkbox"
//             name="remove_image"
//             checked={formData.remove_image}
//             onChange={handleInputChange}
//             className="mr-2"
//             aria-label="Supprimer l'image existante"
//           />
//           Supprimer l'image existante
//         </label>
//       )}
//     </div>
//     <div>
//       <label className="block text-sm font-medium text-gray-700">Vidéo</label>
//       <input
//         type="file"
//         name="video"
//         accept="video/mp4,video/webm,video/ogg"
//         onChange={handleInputChange}
//         className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//         aria-label="Télécharger une vidéo"
//       />
//       {editingId && articles.find(a => a.id === editingId)?.video_url && (
//         <label className="flex items-center mt-2">
//           <input
//             type="checkbox"
//             name="remove_video"
//             checked={formData.remove_video}
//             onChange={handleInputChange}
//             className="mr-2"
//             aria-label="Supprimer la vidéo existante"
//           />
//           Supprimer la vidéo existante
//         </label>
//       )}
//     </div>
//     <div>
//       <label className="block text-sm font-medium text-gray-700">Nom de l'auteur (remplacement)</label>
//       <input
//         type="text"
//         name="author_name"
//         value={formData.author_name}
//         onChange={handleInputChange}
//         className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//         placeholder="Laissez vide pour utiliser le nom d'utilisateur"
//         aria-label="Nom de l'auteur"
//       />
//     </div>
//   </div>
//   <div className="mt-4">
//     <label className="block text-sm font-medium text-gray-700">Contenu</label>
//     <textarea
//       name="content"
//       value={formData.content}
//       onChange={handleInputChange}
//       className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600 resize-vertical"
//       rows="5"
//       required
//       aria-label="Contenu de l'article"
//       placeholder="Contenu de l'article"
//     />
//   </div>
//   <div className="mt-4">
//     <label className="block text-sm font-medium text-gray-700">Étiquettes</label>
//     <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-4 space-y-2 sm:space-y-0">
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="Lmusic"
//           checked={formData.Lmusic}
//           onChange={handleInputChange}
//           className="mr-2"
//           aria-label="Musique"
//         />
//         Musique
//       </label>
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="Ldance"
//           checked={formData.Ldance}
//           onChange={handleInputChange}
//           className="mr-2"
//           aria-label="Danse"
//         />
//         Danse
//       </label>
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="Lafrotcham"
//           checked={formData.Lafrotcham}
//           onChange={handleInputChange}
//           className="mr-2"
//           aria-label="Afrotcham"
//         />
//         Afrotcham
//       </label>
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="Lrap"
//           checked={formData.Lrap}
//           onChange={handleInputChange}
//           className="mr-2"
//           aria-label="Rap"
//         />
//         Rap
//       </label>
//     </div>
//   </div>
//   <div className="mt-6 flex flex-col sm:flex-row gap-2">
//     <button
//       type="submit"
//       className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//     >
//       {editingId ? 'Mettre à jour l\'article' : 'Créer un article'}
//     </button>
//     {editingId && (
//       <button
//         type="button"
//         onClick={resetForm}
//         className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//       >
//         Annuler
//       </button>
//     )}
//   </div>
// </form>

//       {/* Articles List */}
//       <div className="bg-white p-6 rounded shadow">
//         <h2 className="text-xl font-semibold mb-4">Articles</h2>
//         <table className="w-full">
//           <thead>
//             <tr>
//               <th className="text-left p-2">Aperçu</th>
//               <th className="text-left p-2">Titre</th>
//               <th className="text-left p-2">Auteur</th>
//               <th className="text-left p-2">Statut</th>
//               <th className="text-left p-2">Étiquettes</th>
//               <th className="text-left p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredArticles.map((article) => (
//               <tr key={article.id} className="border-t">
//                 <td className="p-2">
//                   <img
//                     src={article.image_url}
//                     alt={article.title || 'Image'}
//                     className="w-16 h-12 object-cover rounded"
//                     onError={(e) => e.target.src = FALLBACK_IMAGE}
//                   />
//                 </td>
//                 <td className="p-2">{article.title}</td>
//                 <td className="p-2">{article.author_name || article.author_username}</td>
//                 <td className="p-2">
//                   {article.status === 'draft' && 'Brouillon'}
//                   {article.status === 'published' && 'Publié'}
//                   {article.status === 'pending' && 'En attente'}
//                 </td>
//                 <td className="p-2">
//                   {article.Lmusic && 'Musique '}
//                   {article.Ldance && 'Danse '}
//                   {article.Lafrotcham && 'Afrotcham '}
//                   {article.Lrap && 'Rap'}
//                 </td>
//                 <td className="p-2">
//                   <button
//                     onClick={() => handleEdit(article)}
//                     className="text-blue-500 hover:text-blue-700 mr-2"
//                   >
//                     <Edit className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(article.id)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default CultureUrbaineArticlesDashboard;




// import React, { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2 } from 'lucide-react';
// import axios from 'axios';
// import { Editor } from '@tinymce/tinymce-react';

// // Base64 fallback image (1x1 transparent pixel)
// const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// // Define axios client
// const api = axios.create({
//   baseURL: 'https://gabon-culture-urbaine-1.onrender.com',
// });

// const CultureUrbaineArticlesDashboard = () => {
//   const [articles, setArticles] = useState([]);
//   const [filteredArticles, setFilteredArticles] = useState([]);
//   const [formData, setFormData] = useState({
//     title: '',
//     content: '',
//     category_id: '',
//     section_id: '',
//     status: 'draft',
//     author_name: '',
//     Lmusic: false,
//     Ldance: false,
//     Lafrotcham: false,
//     Lrap: false,
//     image: null,
//     video: null,
//     remove_image: false,
//     remove_video: false,
//   });
//   const [categories, setCategories] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loginData, setLoginData] = useState({ username: '', password: '' });
//   const [filter, setFilter] = useState('');
//   const [imagePreview, setImagePreview] = useState(null);
//   const [videoPreview, setVideoPreview] = useState(null);

//   // Check authentication and filter on mount
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const params = new URLSearchParams(window.location.search);
//     const filterParam = params.get('filter');
//     if (filterParam === 'afrotcham') {
//       setFilter('afrotcham');
//     }
//     if (token) {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       setIsAuthenticated(true);
//       fetchArticles();
//       fetchCategories();
//       fetchSections();
//     }
//   }, []);

//   // Apply filter when articles or filter changes
//   useEffect(() => {
//     if (filter === 'afrotcham') {
//       setFilteredArticles(
//         articles.filter((article) => article.Lafrotcham && article.status === 'published')
//       );
//     } else {
//       setFilteredArticles(articles);
//     }
//   }, [articles, filter]);

//   const fetchArticles = async () => {
//     try {
//       const response = await api.get('/culture_urbaine_articles/');
//       setArticles(response.data.map(article => ({
//         ...article,
//         image_url: article.image_url || FALLBACK_IMAGE,
//       })));
//       setError('');
//     } catch (err) {
//       console.error('Fetch articles error:', err);
//       setError(err.response?.data?.detail || 'Échec de la récupération des articles');
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const response = await api.get('/api/categories/');
//       setCategories(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Fetch categories error:', err);
//       setError(err.response?.data?.detail || 'Échec de la récupération des catégories');
//     }
//   };

//   const fetchSections = async () => {
//     try {
//       const response = await api.get('/api/sections/');
//       setSections(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Fetch sections error:', err);
//       setError(err.response?.data?.detail || 'Échec de la récupération des sections');
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post('/api/auth/login', new URLSearchParams({
//         username: loginData.username,
//         password: loginData.password,
//       }), {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       });
//       localStorage.setItem('token', response.data.access_token);
//       localStorage.setItem('userInfo', JSON.stringify(response.data.user_info));
//       api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
//       setIsAuthenticated(true);
//       setError('');
//       fetchArticles();
//       fetchCategories();
//       fetchSections();
//     } catch (err) {
//       console.error('Login error:', err);
//       setError(err.response?.data?.detail || 'Échec de la connexion');
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value,
//     });
//   };

//   const handleFileChange = (e, type) => {
//     const file = e.target.files[0];
//     if (!file) {
//       setFormData(prev => ({ ...prev, [type]: null }));
//       if (type === 'image') setImagePreview(null);
//       if (type === 'video') setVideoPreview(null);
//       return;
//     }

//     const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
//     const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//     if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
//       alert('Only MP4, WebM, and OGG videos are supported');
//       e.target.value = '';
//       return;
//     }
//     if (type === 'image' && !allowedImageTypes.includes(file.type)) {
//       alert('Only JPG/PNG images are supported');
//       e.target.value = '';
//       return;
//     }

//     const previewUrl = URL.createObjectURL(file);
//     if (type === 'video') {
//       const video = document.createElement('video');
//       video.preload = 'metadata';
//       video.onloadedmetadata = () => {
//         URL.revokeObjectURL(video.src);
//         setFormData(prev => ({ ...prev, [type]: file }));
//         setVideoPreview(previewUrl);
//       };
//       video.src = previewUrl;
//       video.load();
//     } else {
//       setFormData(prev => ({ ...prev, [type]: file }));
//       setImagePreview(previewUrl);
//     }
//   };

//   const filePickerCallback = (callback, value, meta) => {
//     const input = document.createElement('input');
//     input.setAttribute('type', 'file');
//     if (meta.filetype === 'image') {
//       input.setAttribute('accept', 'image/jpeg,image/png,image/jpg');
//     } else if (meta.filetype === 'media') {
//       input.setAttribute('accept', 'video/mp4,video/webm,video/ogg');
//     } else {
//       console.warn('Unsupported file type:', meta.filetype);
//       return;
//     }

//     input.onchange = () => {
//       const file = input.files[0];
//       if (!file) {
//         console.warn('No file selected');
//         return;
//       }

//       const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
//       const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//       const type = meta.filetype === 'image' ? 'image' : 'video';

//       if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
//         alert('Only MP4, WebM, and OGG videos are supported');
//         return;
//       }
//       if (type === 'image' && !allowedImageTypes.includes(file.type)) {
//         alert('Invalid image format. Only JPG/JPEG/PNG are supported');
//         return;
//       }

//       const previewUrl = URL.createObjectURL(file);
//       setFormData(prev => ({ ...prev, [type]: file }));
//       if (type === 'image') setImagePreview(previewUrl);
//       if (type === 'video') setVideoPreview(previewUrl);

//       callback(previewUrl, { alt: file.name });
//     };

//     input.click();
//   };

//   const handleEditorChange = (content) => {
//     setFormData(prev => ({ ...prev, content }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isAuthenticated) {
//       setError('Veuillez vous connecter pour soumettre un article');
//       return;
//     }
//     setError('');
//     setSuccess('');

//     const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//     const form = new FormData();
//     form.append('title', formData.title);
//     form.append('content', formData.content);
//     form.append('category_id', formData.category_id);
//     if (formData.section_id) form.append('section_id', formData.section_id);
//     form.append('status', formData.status);
//     if (formData.author_name) form.append('author_name', formData.author_name);
//     form.append('Lmusic', formData.Lmusic);
//     form.append('Ldance', formData.Ldance);
//     form.append('Lafrotcham', formData.Lafrotcham);
//     form.append('Lrap', formData.Lrap);
//     if (formData.image) form.append('image', formData.image);
//     if (formData.video) form.append('video', formData.video);
//     if (editingId) {
//       form.append('remove_image', formData.remove_image);
//       form.append('remove_video', formData.remove_video);
//     }

//     try {
//       const config = { headers: { 'Content-Type': 'multipart/form-data' } };
//       let response;
//       if (editingId) {
//         response = await api.put(`/culture_urbaine_articles/${editingId}`, form, config);
//         setSuccess('Article mis à jour avec succès');
//       } else {
//         response = await api.post('/culture_urbaine_articles/', form, config);
//         setSuccess('Article créé avec succès');
//       }

//       // Update content with backend URLs if image or video was uploaded
//       let updatedContent = formData.content;
//       if (response.data.image_url && imagePreview?.startsWith('blob:')) {
//         updatedContent = updatedContent.replaceAll(imagePreview, response.data.image_url);
//       }
//       if (response.data.video_url && videoPreview?.startsWith('blob:')) {
//         updatedContent = updatedContent.replaceAll(videoPreview, response.data.video_url);
//       }

//       resetForm();
//       fetchArticles();
//     } catch (err) {
//       console.error('Submit error:', err);
//       setError(err.response?.data?.detail || 'Échec de l\'enregistrement de l\'article');
//     }
//   };

//   const handleEdit = (article) => {
//     setFormData({
//       title: article.title || '',
//       content: article.content || '',
//       category_id: article.category_id || '',
//       section_id: article.section_id || '',
//       status: article.status || 'draft',
//       author_name: article.author_name || '',
//       Lmusic: article.Lmusic || false,
//       Ldance: article.Ldance || false,
//       Lafrotcham: article.Lafrotcham || false,
//       Lrap: article.Lrap || false,
//       image: null,
//       video: null,
//       remove_image: false,
//       remove_video: false,
//     });
//     setImagePreview(article.image_url !== FALLBACK_IMAGE ? article.image_url : null);
//     setVideoPreview(article.video_url || null);
//     setEditingId(article.id);
//   };

//   const handleDelete = async (id) => {
//     if (!isAuthenticated) {
//       setError('Veuillez vous connecter pour supprimer un article');
//       return;
//     }
//     if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
//     try {
//       await api.delete(`/culture_urbaine_articles/${id}`);
//       setSuccess('Article supprimé avec succès');
//       fetchArticles();
//     } catch (err) {
//       console.error('Delete error:', err);
//       setError(err.response?.data?.detail || 'Échec de la suppression de l\'article');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       title: '',
//       content: '',
//       category_id: '',
//       section_id: '',
//       status: 'draft',
//       author_name: '',
//       Lmusic: false,
//       Ldance: false,
//       Lafrotcham: false,
//       Lrap: false,
//       image: null,
//       video: null,
//       remove_image: false,
//       remove_video: false,
//     });
//     setImagePreview(null);
//     setVideoPreview(null);
//     setEditingId(null);
//     setSuccess('');
//     setError('');
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="p-6">
//         <h2 className="text-2xl font-bold mb-4">Connexion</h2>
//         {error && <div className="text-red-500 mb-4">{error}</div>}
//         <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow mb-6 max-w-md max-h-screen overflow-y-auto">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Nom d’utilisateur</label>
//             <input
//               type="text"
//               value={loginData.username}
//               onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="Nom d’utilisateur"
//               required
//               aria-label="Nom d’utilisateur"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
//             <input
//               type="password"
//               value={loginData.password}
//               onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="Mot de passe"
//               required
//               aria-label="Mot de passe"
//             />
//           </div>
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Se connecter
//           </button>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 w-full min-h-screen bg-white dark:bg-gray-900">
//       <div className="relative z-10">
//         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
//           Tableau de bord des articles de culture urbaine
//         </h1>
//       </div>
//       {filter === 'afrotcham' && (
//         <div className="mb-4 text-gray-700 dark:text-gray-300">
//           <span className="text-gray-700">Filtre actif : Afrotcham (articles publiés)</span>
//           <button
//             onClick={() => setFilter('')}
//             className="ml-2 text-blue-500 hover:text-blue-700"
//           >
//             Supprimer le filtre
//           </button>
//         </div>
//       )}

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 max-h-screen overflow-y-auto" encType="multipart/form-data">
//         {error && <div className="text-red-500 mb-4">{error}</div>}
//         {success && <div className="text-green-500 mb-4">{success}</div>}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Titre</label>
//             <input
//               type="text"
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="Entrez le titre"
//               required
//               aria-label="Titre de l'article"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Catégorie</label>
//             <select
//               name="category_id"
//               value={formData.category_id}
//               onChange={handleInputChange}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//               required
//               aria-label="Catégorie"
//             >
//               <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Sélectionner une catégorie</option>
//               {categories.map((cat) => (
//                 <option key={cat.id} value={cat.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">{cat.name}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Section (facultatif)</label>
//             <select
//               name="section_id"
//               value={formData.section_id}
//               onChange={handleInputChange}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//               aria-label="Section"
//             >
//               <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Aucune</option>
//               {sections.map((sec) => (
//                 <option key={sec.id} value={sec.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">{sec.name}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Statut</label>
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleInputChange}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//               aria-label="Statut"
//             >
//               <option value="draft" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Brouillon</option>
//               <option value="published" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Publié</option>
//               <option value="pending" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">En attente</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Image</label>
//             <input
//               type="file"
//               name="image"
//               accept="image/png,image/jpeg,image/jpg"
//               onChange={(e) => handleFileChange(e, 'image')}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//               aria-label="Télécharger une image"
//             />
//             {imagePreview && (
//               <img
//                 src={imagePreview}
//                 alt="Preview"
//                 className="mt-2 h-32 object-cover rounded-lg"
//               />
//             )}
//             {editingId && articles.find(a => a.id === editingId)?.image_url !== FALLBACK_IMAGE && (
//               <label className="flex items-center mt-2">
//                 <input
//                   type="checkbox"
//                   name="remove_image"
//                   checked={formData.remove_image}
//                   onChange={handleInputChange}
//                   className="mr-2"
//                   aria-label="Supprimer l'image existante"
//                 />
//                 Supprimer l'image existante
//               </label>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Vidéo</label>
//             <input
//               type="file"
//               name="video"
//               accept="video/mp4,video/webm,video/ogg"
//               onChange={(e) => handleFileChange(e, 'video')}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
//               aria-label="Télécharger une vidéo"
//             />
//             {videoPreview && (
//               <video
//                 src={videoPreview}
//                 controls
//                 className="mt-2 h-32 object-cover rounded-lg"
//               />
//             )}
//             {editingId && articles.find(a => a.id === editingId)?.video_url && (
//               <label className="flex items-center mt-2">
//                 <input
//                   type="checkbox"
//                   name="remove_video"
//                   checked={formData.remove_video}
//                   onChange={handleInputChange}
//                   className="mr-2"
//                   aria-label="Supprimer la vidéo existante"
//                 />
//                 Supprimer la vidéo existante
//               </label>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Nom de l'auteur (remplacement)</label>
//             <input
//               type="text"
//               name="author_name"
//               value={formData.author_name}
//               onChange={handleInputChange}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
//               placeholder="Laissez vide pour utiliser le nom d'utilisateur"
//               aria-label="Nom de l'auteur"
//             />
//           </div>
//         </div>
//         <div className="mt-4">
//           <label className="block text-sm font-medium text-gray-700">Contenu</label>
//           <Editor
//             apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
//             value={formData.content}
//             onEditorChange={handleEditorChange}
//             init={{
//               height: 400,
//               menubar: true,
//               plugins: [
//                 'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
//                 'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
//               ],
//               toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
//               tinycomments_mode: 'embedded',
//               tinycomments_author: 'Admin',
//               mergetags_list: [
//                 { value: 'First.Name', title: 'First Name' },
//                 { value: 'Email', title: 'Email' },
//               ],
//               ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('AI Assistant not implemented')),
//               file_picker_callback: filePickerCallback,
//               file_picker_types: 'image media',
//               content_style: `
//                 body { 
//                   font-family: Arial, sans-serif; 
//                   font-size: 14px; 
//                   background: ${document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff'}; 
//                   color: ${document.documentElement.classList.contains('dark') ? '#fff' : '#000'}; 
//                 }
//                 .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
//                   color: ${document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'};
//                 }
//               `,
//               skin: document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
//               content_css: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
//               placeholder: 'Contenu de l\'article'
//             }}
//           />
//         </div>
//         <div className="mt-4">
//           <label className="block text-sm font-medium text-gray-700">Étiquettes</label>
//           <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-4 space-y-2 sm:space-y-0">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="Lmusic"
//                 checked={formData.Lmusic}
//                 onChange={handleInputChange}
//                 className="mr-2"
//                 aria-label="Musique"
//               />
//               Musique
//             </label>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="Ldance"
//                 checked={formData.Ldance}
//                 onChange={handleInputChange}
//                 className="mr-2"
//                 aria-label="Danse"
//               />
//               Danse
//             </label>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="Lafrotcham"
//                 checked={formData.Lafrotcham}
//                 onChange={handleInputChange}
//                 className="mr-2"
//                 aria-label="Afrotcham"
//               />
//               Afrotcham
//             </label>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="Lrap"
//                 checked={formData.Lrap}
//                 onChange={handleInputChange}
//                 className="mr-2"
//                 aria-label="Rap"
//               />
//               Rap
//             </label>
//           </div>
//         </div>
//         <div className="mt-6 flex flex-col sm:flex-row gap-2">
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             {editingId ? 'Mettre à jour l\'article' : 'Créer un article'}
//           </button>
//           {editingId && (
//             <button
//               type="button"
//               onClick={resetForm}
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               Annuler
//             </button>
//           )}
//         </div>
//       </form>

//       {/* Articles List */}
//       <div className="bg-white p-6 rounded shadow">
//         <h2 className="text-xl font-semibold mb-4">Articles</h2>
//         <table className="w-full">
//           <thead>
//             <tr>
//               <th className="text-left p-2">Aperçu</th>
//               <th className="text-left p-2">Titre</th>
//               <th className="text-left p-2">Auteur</th>
//               <th className="text-left p-2">Statut</th>
//               <th className="text-left p-2">Étiquettes</th>
//               <th className="text-left p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredArticles.map((article) => (
//               <tr key={article.id} className="border-t">
//                 <td className="p-2">
//                   <img
//                     src={article.image_url}
//                     alt={article.title || 'Image'}
//                     className="w-16 h-12 object-cover rounded"
//                     onError={(e) => e.target.src = FALLBACK_IMAGE}
//                   />
//                 </td>
//                 <td className="p-2">{article.title}</td>
//                 <td className="p-2">{article.author_name || article.author_username}</td>
//                 <td className="p-2">
//                   {article.status === 'draft' && 'Brouillon'}
//                   {article.status === 'published' && 'Publié'}
//                   {article.status === 'pending' && 'En attente'}
//                 </td>
//                 <td className="p-2">
//                   {article.Lmusic && 'Musique '}
//                   {article.Ldance && 'Danse '}
//                   {article.Lafrotcham && 'Afrotcham '}
//                   {article.Lrap && 'Rap'}
//                 </td>
//                 <td className="p-2">
//                   <button
//                     onClick={() => handleEdit(article)}
//                     className="text-blue-500 hover:text-blue-700 mr-2"
//                   >
//                     <Edit className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(article.id)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default CultureUrbaineArticlesDashboard;





import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Music as MusicIcon } from 'lucide-react';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

// Base64 fallback image (1x1 transparent pixel)
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Define axios client
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

const CultureUrbaineArticlesDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    section_id: '',
    status: 'draft',
    author_name: '',
    Lmusic: false,
    Ldance: false,
    Lafrotcham: false,
    Lrap: false,
    image: null,
    video: null,
    audio: null, // New audio field
    remove_image: false,
    remove_video: false,
    remove_audio: false, // New audio removal field
  });
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [filter, setFilter] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null); // New audio preview

  // Check authentication and filter on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');
    if (filterParam === 'afrotcham') {
      setFilter('afrotcham');
    }
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      fetchArticles();
      fetchCategories();
      fetchSections();
    }
  }, []);

  // Apply filter when articles or filter changes
  useEffect(() => {
    if (filter === 'afrotcham') {
      setFilteredArticles(
        articles.filter((article) => article.Lafrotcham && article.status === 'published')
      );
    } else {
      setFilteredArticles(articles);
    }
  }, [articles, filter]);

  const fetchArticles = async () => {
    try {
      const response = await api.get('/culture_urbaine_articles/');
      setArticles(response.data.map(article => ({
        ...article,
        image_url: article.image_url || FALLBACK_IMAGE,
      })));
      setError('');
    } catch (err) {
      console.error('Fetch articles error:', err);
      setError(err.response?.data?.detail || 'Échec de la récupération des articles');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories/');
      setCategories(response.data);
      setError('');
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError(err.response?.data?.detail || 'Échec de la récupération des catégories');
    }
  };

  const fetchSections = async () => {
    try {
      const response = await api.get('/api/sections/');
      setSections(response.data);
      setError('');
    } catch (err) {
      console.error('Fetch sections error:', err);
      setError(err.response?.data?.detail || 'Échec de la récupération des sections');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', new URLSearchParams({
        username: loginData.username,
        password: loginData.password,
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('userInfo', JSON.stringify(response.data.user_info));
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      setIsAuthenticated(true);
      setError('');
      fetchArticles();
      fetchCategories();
      fetchSections();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Échec de la connexion');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData(prev => ({ ...prev, [type]: null }));
      if (type === 'image') setImagePreview(null);
      if (type === 'video') setVideoPreview(null);
      if (type === 'audio') setAudioPreview(null); // Handle audio preview
      return;
    }

    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac']; // New audio types

    if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
      alert('Only MP4, WebM, and OGG videos are supported');
      e.target.value = '';
      return;
    }
    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      alert('Only JPG/PNG images are supported');
      e.target.value = '';
      return;
    }
    if (type === 'audio' && !allowedAudioTypes.includes(file.type)) { // Audio validation
      alert('Only MP3, WAV, M4A, and AAC audio files are supported');
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        setFormData(prev => ({ ...prev, [type]: file }));
        setVideoPreview(previewUrl);
      };
      video.src = previewUrl;
      video.load();
    } else if (type === 'audio') { // Handle audio preview
      setFormData(prev => ({ ...prev, [type]: file }));
      setAudioPreview(previewUrl);
    } else {
      setFormData(prev => ({ ...prev, [type]: file }));
      setImagePreview(previewUrl);
    }
  };

  const filePickerCallback = (callback, value, meta) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    if (meta.filetype === 'image') {
      input.setAttribute('accept', 'image/jpeg,image/png,image/jpg');
    } else if (meta.filetype === 'media') {
      input.setAttribute('accept', 'video/mp4,video/webm,video/ogg,audio/mpeg,audio/mp3,audio/wav'); // Include audio
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

      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac'];
      const type = meta.filetype === 'image' ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'video';

      if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
        alert('Only MP4, WebM, and OGG videos are supported');
        return;
      }
      if (type === 'image' && !allowedImageTypes.includes(file.type)) {
        alert('Invalid image format. Only JPG/JPEG/PNG are supported');
        return;
      }
      if (type === 'audio' && !allowedAudioTypes.includes(file.type)) {
        alert('Invalid audio format. Only MP3, WAV, M4A, and AAC are supported');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [type]: file }));
      if (type === 'image') setImagePreview(previewUrl);
      if (type === 'video') setVideoPreview(previewUrl);
      if (type === 'audio') setAudioPreview(previewUrl);

      callback(previewUrl, { alt: file.name });
    };

    input.click();
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Veuillez vous connecter pour soumettre un article');
      return;
    }
    setError('');
    setSuccess('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const form = new FormData();
    form.append('title', formData.title);
    form.append('content', formData.content);
    form.append('category_id', formData.category_id);
    if (formData.section_id) form.append('section_id', formData.section_id);
    form.append('status', formData.status);
    if (formData.author_name) form.append('author_name', formData.author_name);
    form.append('Lmusic', formData.Lmusic);
    form.append('Ldance', formData.Ldance);
    form.append('Lafrotcham', formData.Lafrotcham);
    form.append('Lrap', formData.Lrap);
    if (formData.image) form.append('image', formData.image);
    if (formData.video) form.append('video', formData.video);
    if (formData.audio) form.append('audio', formData.audio); // Add audio to form data
    if (editingId) {
      form.append('remove_image', formData.remove_image);
      form.append('remove_video', formData.remove_video);
      form.append('remove_audio', formData.remove_audio); // Add audio removal
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      let response;
      if (editingId) {
        response = await api.put(`/culture_urbaine_articles/${editingId}`, form, config);
        setSuccess('Article mis à jour avec succès');
      } else {
        response = await api.post('/culture_urbaine_articles/', form, config);
        setSuccess('Article créé avec succès');
      }

      // Update content with backend URLs if files were uploaded
      let updatedContent = formData.content;
      if (response.data.image_url && imagePreview?.startsWith('blob:')) {
        updatedContent = updatedContent.replaceAll(imagePreview, response.data.image_url);
      }
      if (response.data.video_url && videoPreview?.startsWith('blob:')) {
        updatedContent = updatedContent.replaceAll(videoPreview, response.data.video_url);
      }
      if (response.data.audio_url && audioPreview?.startsWith('blob:')) { // Handle audio URL
        updatedContent = updatedContent.replaceAll(audioPreview, response.data.audio_url);
      }

      resetForm();
      fetchArticles();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.detail || 'Échec de l\'enregistrement de l\'article');
    }
  };

  const handleEdit = (article) => {
    setFormData({
      title: article.title || '',
      content: article.content || '',
      category_id: article.category_id || '',
      section_id: article.section_id || '',
      status: article.status || 'draft',
      author_name: article.author_name || '',
      Lmusic: article.Lmusic || false,
      Ldance: article.Ldance || false,
      Lafrotcham: article.Lafrotcham || false,
      Lrap: article.Lrap || false,
      image: null,
      video: null,
      audio: null, // Reset audio
      remove_image: false,
      remove_video: false,
      remove_audio: false, // Reset audio removal
    });
    setImagePreview(article.image_url !== FALLBACK_IMAGE ? article.image_url : null);
    setVideoPreview(article.video_url || null);
    setAudioPreview(article.audio_url || null); // Set audio preview
    setEditingId(article.id);
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      setError('Veuillez vous connecter pour supprimer un article');
      return;
    }
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    try {
      await api.delete(`/culture_urbaine_articles/${id}`);
      setSuccess('Article supprimé avec succès');
      fetchArticles();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.detail || 'Échec de la suppression de l\'article');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category_id: '',
      section_id: '',
      status: 'draft',
      author_name: '',
      Lmusic: false,
      Ldance: false,
      Lafrotcham: false,
      Lrap: false,
      image: null,
      video: null,
      audio: null, // Reset audio
      remove_image: false,
      remove_video: false,
      remove_audio: false, // Reset audio removal
    });
    setImagePreview(null);
    setVideoPreview(null);
    setAudioPreview(null); // Reset audio preview
    setEditingId(null);
    setSuccess('');
    setError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Connexion</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow mb-6 max-w-md max-h-screen overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
              placeholder="Nom d'utilisateur"
              required
              aria-label="Nom d'utilisateur"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
              placeholder="Mot de passe"
              required
              aria-label="Mot de passe"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 w-full min-h-screen bg-white dark:bg-gray-900">
      <div className="relative z-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Tableau de bord des articles de culture urbaine
        </h1>
      </div>
      {filter === 'afrotcham' && (
        <div className="mb-4 text-gray-700 dark:text-gray-300">
          <span className="text-gray-700">Filtre actif : Afrotcham (articles publiés)</span>
          <button
            onClick={() => setFilter('')}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            Supprimer le filtre
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 max-h-screen overflow-y-auto" encType="multipart/form-data">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
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
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
            <label className="block text-sm font-medium text-gray-700">Section (facultatif)</label>
            <select
              name="section_id"
              value={formData.section_id}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              aria-label="Section"
            >
              <option value="" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Aucune</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">{sec.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              aria-label="Statut"
            >
              <option value="draft" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Brouillon</option>
              <option value="published" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Publié</option>
              <option value="pending" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">En attente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              name="image"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => handleFileChange(e, 'image')}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              aria-label="Télécharger une image"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 h-32 object-cover rounded-lg"
              />
            )}
            {editingId && articles.find(a => a.id === editingId)?.image_url !== FALLBACK_IMAGE && (
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="remove_image"
                  checked={formData.remove_image}
                  onChange={handleInputChange}
                  className="mr-2"
                  aria-label="Supprimer l'image existante"
                />
                Supprimer l'image existante
              </label>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vidéo</label>
            <input
              type="file"
              name="video"
              accept="video/mp4,video/webm,video/ogg"
              onChange={(e) => handleFileChange(e, 'video')}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              aria-label="Télécharger une vidéo"
            />
            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="mt-2 h-32 object-cover rounded-lg"
              />
            )}
            {editingId && articles.find(a => a.id === editingId)?.video_url && (
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="remove_video"
                  checked={formData.remove_video}
                  onChange={handleInputChange}
                  className="mr-2"
                  aria-label="Supprimer la vidéo existante"
                />
                Supprimer la vidéo existante
              </label>
            )}
          </div>
          {/* NEW AUDIO FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <MusicIcon className="w-4 h-4 inline mr-1" />
              Audio (MP3, WAV, M4A, AAC)
            </label>
            <input
              type="file"
              name="audio"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/aac"
              onChange={(e) => handleFileChange(e, 'audio')}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              aria-label="Télécharger un fichier audio"
            />
            {audioPreview && (
              <div className="mt-2">
                <audio
                  src={audioPreview}
                  controls
                  className="w-full max-w-sm"
                >
                  Votre navigateur ne prend pas en charge l'élément audio.
                </audio>
              </div>
            )}
            {editingId && articles.find(a => a.id === editingId)?.audio_url && (
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="remove_audio"
                  checked={formData.remove_audio}
                  onChange={handleInputChange}
                  className="mr-2"
                  aria-label="Supprimer l'audio existant"
                />
                Supprimer l'audio existant
              </label>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de l'auteur (remplacement)</label>
            <input
              type="text"
              name="author_name"
              value={formData.author_name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-300 dark:border-gray-600"
              placeholder="Laissez vide pour utiliser le nom d'utilisateur"
              aria-label="Nom de l'auteur"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Contenu</label>
	          <Editor
	            apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
	            value={formData.content}
	            onEditorChange={handleEditorChange}
	            init={{
	              height: 400,
	              menubar: true,
	              plugins: [
	                'anchor',
	                'autolink',
	                'charmap',
	                'codesample',
	                'emoticons',
	                'image',
	                'link',
	                'lists',
	                'media',
	                'searchreplace',
	                'table',
	                'visualblocks',
	                'wordcount'
	              ],
	              toolbar: 'undo redo | blocks | bold italic underline strikethrough | link image media table | numlist bullist indent outdent | emoticons charmap | removeformat',
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
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Étiquettes</label>
          <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-4 space-y-2 sm:space-y-0">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="Lmusic"
                checked={formData.Lmusic}
                onChange={handleInputChange}
                className="mr-2"
                aria-label="Musique"
              />
              Musique
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="Ldance"
                checked={formData.Ldance}
                onChange={handleInputChange}
                className="mr-2"
                aria-label="Danse"
              />
              Danse
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="Lafrotcham"
                checked={formData.Lafrotcham}
                onChange={handleInputChange}
                className="mr-2"
                aria-label="Afrotcham"
              />
              Afrotcham
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="Lrap"
                checked={formData.Lrap}
                onChange={handleInputChange}
                className="mr-2"
                aria-label="Rap"
              />
              Rap
            </label>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingId ? 'Mettre à jour l\'article' : 'Créer un article'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Articles List */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Articles</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Aperçu</th>
              <th className="text-left p-2">Titre</th>
              <th className="text-left p-2">Auteur</th>
              <th className="text-left p-2">Statut</th>
              <th className="text-left p-2">Médias</th>
              <th className="text-left p-2">Étiquettes</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => (
              <tr key={article.id} className="border-t">
                <td className="p-2">
                  <img
                    src={article.image_url}
                    alt={article.title || 'Image'}
                    className="w-16 h-12 object-cover rounded"
                    onError={(e) => e.target.src = FALLBACK_IMAGE}
                  />
                </td>
                <td className="p-2">{article.title}</td>
                <td className="p-2">{article.author_name || article.author_username}</td>
                <td className="p-2">
                  {article.status === 'draft' && 'Brouillon'}
                  {article.status === 'published' && 'Publié'}
                  {article.status === 'pending' && 'En attente'}
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    {article.image_url && article.image_url !== FALLBACK_IMAGE && (
                      <span className="text-blue-500 text-xs">IMG</span>
                    )}
                    {article.video_url && (
                      <span className="text-green-500 text-xs">VID</span>
                    )}
                    {article.audio_url && ( // Show audio indicator
                      <span className="text-purple-500 text-xs flex items-center">
                        <MusicIcon className="w-3 h-3 mr-1" />
                        AUD
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  {article.Lmusic && 'Musique '}
                  {article.Ldance && 'Danse '}
                  {article.Lafrotcham && 'Afrotcham '}
                  {article.Lrap && 'Rap'}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CultureUrbaineArticlesDashboard;







// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2, Music as MusicIcon } from 'lucide-react';
// import axios from 'axios';
// import { Editor } from '@tinymce/tinymce-react';
// import http from 'http';
// import https from 'https';

// const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// const api = axios.create({
//   baseURL: 'https://gabon-culture-api.onrender.com/api',
//   httpAgent: new http.Agent({ keepAlive: true }),
//   httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: true }),
// });

// const CultureUrbaineArticlesDashboard = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [articles, setArticles] = useState([]);
//   const [songs, setSongs] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [urbanCategoryId, setUrbanCategoryId] = useState(null);
//   const [formData, setFormData] = useState({
//     title: '',
//     content: '',
//     category_id: '',
//     section_id: '',
//     image: null,
//     status: 'draft',
//     Lmusic: false,
//     Ldance: false,
//     Lrap: false,
//     Lafrotcham: false,
//   });
//   const [songFormData, setSongFormData] = useState({
//     title: '',
//     artist_name: '',
//     category_id: '',
//     status: 'published',
//     audio: null,
//     image: null,
//     remove_audio: false,
//     remove_image: false,
//   });
//   const [imagePreview, setImagePreview] = useState(null);
//   const [songImagePreview, setSongImagePreview] = useState(null);
//   const [songAudioPreview, setSongAudioPreview] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [songEditingId, setSongEditingId] = useState(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [filter, setFilter] = useState('');
//   const editorRef = useRef(null);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const params = new URLSearchParams(window.location.search);
//     const filterParam = params.get('filter');
//     if (filterParam === 'afrotcham') {
//       setFilter('afrotcham');
//     }
//     if (token) {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       setIsAuthenticated(true);
//       fetchArticles();
//       fetchCategories();
//       fetchSections();
//       fetchSongs();
//     }
//   }, []);

//   const fetchArticles = async (retries = 3) => {
//     try {
//       let url = '/culture_urbaine_articles/?status=published';
//       if (filter === 'afrotcham') url += '&Lafrotcham=true';
//       const response = await api.get(url);
//       setArticles(response.data.map(article => ({
//         ...article,
//         image_url: article.image_url ? `${api.defaults.baseURL}${article.image_url}` : FALLBACK_IMAGE,
//       })));
//       setError('');
//     } catch (err) {
//       console.error('Fetch articles error:', err.response?.data || err.message);
//       if (retries > 0 && err.code === 'ERR_QUIC_PROTOCOL_ERROR') {
//         console.log(`Retrying fetchArticles (${retries} attempts left)`);
//         return fetchArticles(retries - 1);
//       }
//       setError(err.response?.data?.detail || 'Failed to fetch articles');
//     }
//   };

//   const fetchCategories = async (retries = 3) => {
//     try {
//       const response = await api.get('/categories/');
//       setCategories(response.data);
//       const urbanCategory = response.data.find(c => c.name === 'Culture Urbaine');
//       if (urbanCategory) {
//         setUrbanCategoryId(urbanCategory.id);
//         setSongFormData(prev => ({ ...prev, category_id: urbanCategory.id.toString() }));
//         setFormData(prev => ({ ...prev, category_id: urbanCategory.id.toString() }));
//       } else {
//         console.warn('Culture Urbaine category not found');
//         setError('Culture Urbaine category missing in database');
//       }
//       setError('');
//     } catch (err) {
//       console.error('Fetch categories error:', err.response?.data || err.message);
//       if (retries > 0 && err.code === 'ERR_QUIC_PROTOCOL_ERROR') {
//         console.log(`Retrying fetchCategories (${retries} attempts left)`);
//         return fetchCategories(retries - 1);
//       }
//       setError(err.response?.data?.detail || 'Failed to fetch categories');
//     }
//   };

//   const fetchSections = async (retries = 3) => {
//     try {
//       const response = await api.get('/sections/');
//       setSections(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Fetch sections error:', err.response?.data || err.message);
//       if (retries > 0 && err.code === 'ERR_QUIC_PROTOCOL_ERROR') {
//         console.log(`Retrying fetchSections (${retries} attempts left)`);
//         return fetchSections(retries - 1);
//       }
//       setError(err.response?.data?.detail || 'Failed to fetch sections');
//     }
//   };

//   const fetchSongs = async (retries = 3) => {
//     try {
//       const url = urbanCategoryId
//         ? `/culture_urbaine_articles/songs?status=published&category_id=${urbanCategoryId}`
//         : '/culture_urbaine_articles/songs?status=published';
//       const response = await api.get(url);
//       setSongs(response.data.map(song => ({
//         ...song,
//         image_url: song.image_url ? `${api.defaults.baseURL}${song.image_url}` : FALLBACK_IMAGE,
//       })));
//       setError('');
//     } catch (err) {
//       console.error('Fetch songs error:', err.response?.data || err.message);
//       if (retries > 0 && err.code === 'ERR_QUIC_PROTOCOL_ERROR') {
//         console.log(`Retrying fetchSongs (${retries} attempts left)`);
//         return fetchSongs(retries - 1);
//       }
//       setError(err.response?.data?.detail || 'Failed to fetch songs');
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     const username = e.target.username.value;
//     const password = e.target.password.value;
//     try {
//       const response = await api.post('/auth/jwt/login', new URLSearchParams({
//         username,
//         password,
//       }), {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       });
//       localStorage.setItem('token', response.data.access_token);
//       api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
//       setIsAuthenticated(true);
//       fetchArticles();
//       fetchCategories();
//       fetchSections();
//       fetchSongs();
//       setError('');
//     } catch (err) {
//       console.error('Login error:', err.response?.data || err.message);
//       setError(err.response?.data?.detail || 'Échec de la connexion');
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     if (type === 'checkbox') {
//       setFormData(prev => ({ ...prev, [name]: checked }));
//     } else if (type === 'file') {
//       const file = files[0];
//       setFormData(prev => ({ ...prev, [name]: file }));
//       if (name === 'image' && file) {
//         setImagePreview(URL.createObjectURL(file));
//       }
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSongInputChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     if (type === 'checkbox') {
//       setSongFormData(prev => ({ ...prev, [name]: checked }));
//     } else if (type === 'file') {
//       const file = files[0];
//       setSongFormData(prev => ({ ...prev, [name]: file }));
//       if (name === 'image' && file) {
//         setSongImagePreview(URL.createObjectURL(file));
//       } else if (name === 'audio' && file) {
//         setSongAudioPreview(URL.createObjectURL(file));
//       }
//     } else {
//       setSongFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isAuthenticated) {
//       setError('Please log in to submit an article');
//       return;
//     }
//     setError('');
//     setSuccess('');

//     if (!formData.title || !editorRef.current?.getContent()) {
//       setError('Title and content are required');
//       return;
//     }
//     if (!formData.category_id || isNaN(parseInt(formData.category_id))) {
//       setError('Please select a valid category');
//       return;
//     }

//     const form = new FormData();
//     form.append('title', formData.title);
//     form.append('content', editorRef.current.getContent());
//     form.append('category_id', parseInt(formData.category_id));
//     if (formData.section_id) form.append('section_id', parseInt(formData.section_id));
//     if (formData.image) form.append('image', formData.image);
//     form.append('status', formData.status);
//     form.append('Lmusic', formData.Lmusic.toString());
//     form.append('Ldance', formData.Ldance.toString());
//     form.append('Lrap', formData.Lrap.toString());
//     form.append('Lafrotcham', formData.Lafrotcham.toString());
//     if (editingId) {
//       form.append('remove_image', formData.remove_image.toString());
//     }

//     try {
//       const config = { headers: { 'Content-Type': 'multipart/form-data' } };
//       let response;
//       if (editingId) {
//         response = await api.put(`/culture_urbaine_articles/${editingId}`, form, config);
//         setSuccess('Article updated successfully');
//       } else {
//         response = await api.post('/culture_urbaine_articles/', form, config);
//         setSuccess('Article created successfully');
//       }
//       resetForm();
//       fetchArticles();
//     } catch (err) {
//       console.error('Submit article error:', err.response?.data || err.message);
//       setError(err.response?.data?.detail || 'Failed to save article');
//     }
//   };

//   const handleSongSubmit = async (e, retries = 3) => {
//     e.preventDefault();
//     if (!isAuthenticated) {
//       setError('Please log in to submit a song');
//       return;
//     }
//     setError('');
//     setSuccess('');

//     if (!songFormData.title) {
//       setError('Song title is required');
//       return;
//     }
//     if (!songFormData.audio && !songEditingId) {
//       setError('Audio file is required for new songs');
//       return;
//     }
//     const categoryId = songFormData.category_id ? parseInt(songFormData.category_id, 10) : urbanCategoryId;
//     if (!categoryId || isNaN(categoryId)) {
//       setError('Please select a valid category (Culture Urbaine recommended)');
//       return;
//     }

//     const form = new FormData();
//     form.append('title', songFormData.title);
//     if (songFormData.artist_name) form.append('artist_name', songFormData.artist_name);
//     form.append('category_id', categoryId.toString());
//     form.append('status', songFormData.status);
//     if (songFormData.audio) form.append('audio', songFormData.audio);
//     if (songFormData.image) form.append('image', songFormData.image);
//     if (songEditingId) {
//       form.append('remove_audio', songFormData.remove_audio.toString());
//       form.append('remove_image', songFormData.remove_image.toString());
//     }

//     try {
//       const config = { headers: { 'Content-Type': 'multipart/form-data' } };
//       let response;
//       if (songEditingId) {
//         response = await api.put(`/culture_urbaine_articles/songs/${songEditingId}`, form, config);
//         setSuccess('Song updated successfully');
//       } else {
//         response = await api.post('/culture_urbaine_articles/songs', form, config);
//         setSuccess('Song created successfully');
//       }
//       resetSongForm();
//       fetchSongs();
//     } catch (err) {
//       console.error('Submit song error:', err.response?.data || err.message);
//       if (retries > 0 && err.code === 'ERR_QUIC_PROTOCOL_ERROR') {
//         console.log(`Retrying handleSongSubmit (${retries} attempts left)`);
//         return handleSongSubmit(e, retries - 1);
//       }
//       setError(err.response?.data?.detail || 'Failed to save song');
//     }
//   };

//   const handleEdit = (article) => {
//     setFormData({
//       title: article.title || '',
//       content: article.content || '',
//       category_id: article.category_id ? article.category_id.toString() : urbanCategoryId ? urbanCategoryId.toString() : '',
//       section_id: article.section_id ? article.section_id.toString() : '',
//       image: null,
//       status: article.status || 'draft',
//       Lmusic: article.Lmusic || false,
//       Ldance: article.Ldance || false,
//       Lrap: article.Lrap || false,
//       Lafrotcham: article.Lafrotcham || false,
//       remove_image: false,
//     });
//     setImagePreview(article.image_url !== FALLBACK_IMAGE ? `${api.defaults.baseURL}${article.image_url}` : null);
//     setEditingId(article.id);
//     editorRef.current?.setContent(article.content || '');
//   };

//   const handleSongEdit = (song) => {
//     setSongFormData({
//       title: song.title || '',
//       artist_name: song.artist_name || '',
//       category_id: song.category_id ? song.category_id.toString() : urbanCategoryId ? urbanCategoryId.toString() : '',
//       status: song.status || 'published',
//       audio: null,
//       image: null,
//       remove_audio: false,
//       remove_image: false,
//     });
//     setSongImagePreview(song.image_url !== FALLBACK_IMAGE ? `${api.defaults.baseURL}${song.image_url}` : null);
//     setSongAudioPreview(song.audio_url ? `${api.defaults.baseURL}${song.audio_url}` : null);
//     setSongEditingId(song.id);
//   };

//   const handleDelete = async (id) => {
//     if (!isAuthenticated) {
//       setError('Please log in to delete an article');
//       return;
//     }
//     try {
//       await api.delete(`/culture_urbaine_articles/${id}`);
//       setArticles(articles.filter(article => article.id !== id));
//       setSuccess('Article deleted successfully');
//       setError('');
//     } catch (err) {
//       console.error('Delete article error:', err.response?.data || err.message);
//       setError(err.response?.data?.detail || 'Failed to delete article');
//     }
//   };

//   const handleSongDelete = async (id) => {
//     if (!isAuthenticated) {
//       setError('Please log in to delete a song');
//       return;
//     }
//     try {
//       await api.delete(`/culture_urbaine_articles/songs/${id}`);
//       setSongs(songs.filter(song => song.id !== id));
//       setSuccess('Song deleted successfully');
//       setError('');
//     } catch (err) {
//       console.error('Delete song error:', err.response?.data || err.message);
//       setError(err.response?.data?.detail || 'Failed to delete song');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       title: '',
//       content: '',
//       category_id: urbanCategoryId ? urbanCategoryId.toString() : '',
//       section_id: '',
//       image: null,
//       status: 'draft',
//       Lmusic: false,
//       Ldance: false,
//       Lrap: false,
//       Lafrotcham: false,
//       remove_image: false,
//     });
//     setImagePreview(null);
//     setEditingId(null);
//     editorRef.current?.setContent('');
//   };

//   const resetSongForm = () => {
//     setSongFormData({
//       title: '',
//       artist_name: '',
//       category_id: urbanCategoryId ? urbanCategoryId.toString() : '',
//       status: 'published',
//       audio: null,
//       image: null,
//       remove_audio: false,
//       remove_image: false,
//     });
//     setSongImagePreview(null);
//     setSongAudioPreview(null);
//     setSongEditingId(null);
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="p-6 w-full min-h-screen bg-white dark:bg-gray-900">
//         <h1 className="text-2xl font-bold mb-6">Connexion au tableau de bord</h1>
//         <form onSubmit={handleLogin} className="max-w-md">
//           {error && <div className="text-red-500 mb-4">{error}</div>}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
//             <input
//               type="text"
//               name="username"
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
//             <input
//               type="password"
//               name="password"
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Se connecter
//           </button>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 w-full min-h-screen bg-white dark:bg-gray-900">
//       <h1 className="text-2xl font-bold mb-6">Tableau de bord Culture Urbaine</h1>
//       {error && <div className="text-red-500 mb-4">{error}</div>}
//       {success && <div className="text-green-500 mb-4">{success}</div>}

//       {/* Article Form */}
//       <div className="bg-white p-6 rounded shadow mb-6">
//         <h2 className="text-xl font-semibold mb-4 flex items-center">
//           <Plus className="w-5 h-5 mr-2" />
//           {editingId ? 'Modifier l\'article' : 'Ajouter un article'}
//         </h2>
//         <form onSubmit={handleSubmit} className="max-h-screen overflow-y-auto" encType="multipart/form-data">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Titre</label>
//               <input
//                 type="text"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 placeholder="Entrez le titre de l'article"
//                 required
//                 aria-label="Titre de l'article"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Catégorie</label>
//               <select
//                 name="category_id"
//                 value={formData.category_id}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//                 aria-label="Catégorie"
//               >
//                 <option value="" disabled>Sélectionner une catégorie</option>
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={cat.id}>{cat.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Section</label>
//               <select
//                 name="section_id"
//                 value={formData.section_id}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 aria-label="Section"
//               >
//                 <option value="">Aucune section</option>
//                 {sections.map((sec) => (
//                   <option key={sec.id} value={sec.id}>{sec.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Statut</label>
//               <select
//                 name="status"
//                 value={formData.status}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 aria-label="Statut"
//               >
//                 <option value="draft">Brouillon</option>
//                 <option value="published">Publié</option>
//               </select>
//             </div>
//             <div className="col-span-2">
//               <label className="block text-sm font-medium text-gray-700">Image</label>
//               <input
//                 type="file"
//                 name="image"
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 accept="image/*"
//                 aria-label="Image de l'article"
//               />
//               {imagePreview && (
//                 <img src={imagePreview} alt="Aperçu" className="mt-2 w-32 h-32 object-cover rounded" />
//               )}
//               {editingId && imagePreview && (
//                 <label className="flex items-center mt-2">
//                   <input
//                     type="checkbox"
//                     name="remove_image"
//                     checked={formData.remove_image}
//                     onChange={handleInputChange}
//                     className="mr-2"
//                   />
//                   Supprimer l'image existante
//                 </label>
//               )}
//             </div>
//             <div className="col-span-2">
//               <label className="block text-sm font-medium text-gray-700">Contenu</label>
//               <Editor
//                 apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
//                 onInit={(evt, editor) => (editorRef.current = editor)}
//                 initialValue={formData.content}
//                 init={{
//                   height: 400,
//                   menubar: false,
//                   plugins: [
//                     'advlist autolink lists link image charmap print preview anchor',
//                     'searchreplace visualblocks code fullscreen',
//                     'insertdatetime media table paste code help wordcount',
//                   ],
//                   toolbar:
//                     'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
//                   content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
//                 }}
//               />
//             </div>
//             <div className="col-span-2">
//               <label className="block text-sm font-medium text-gray-700">Tags</label>
//               <div className="flex flex-wrap gap-4 mt-2">
//                 {['Lmusic', 'Ldance', 'Lrap', 'Lafrotcham'].map((tag) => (
//                   <label key={tag} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       name={tag}
//                       checked={formData[tag]}
//                       onChange={handleInputChange}
//                       className="mr-2"
//                     />
//                     {tag.replace('L', '')}
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <div className="mt-6 flex flex-col sm:flex-row gap-2">
//             <button
//               type="submit"
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             >
//               {editingId ? 'Mettre à jour l\'article' : 'Ajouter l\'article'}
//             </button>
//             {editingId && (
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//               >
//                 Annuler
//               </button>
//             )}
//           </div>
//         </form>
//       </div>

//       {/* Song Form */}
//       <div className="bg-white p-6 rounded shadow mb-6">
//         <h2 className="text-xl font-semibold mb-4 flex items-center">
//           <MusicIcon className="w-5 h-5 mr-2" />
//           {songEditingId ? 'Modifier la chanson' : 'Ajouter une chanson'}
//         </h2>
//         <form onSubmit={handleSongSubmit} className="max-h-screen overflow-y-auto" encType="multipart/form-data">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Titre</label>
//               <input
//                 type="text"
//                 name="title"
//                 value={songFormData.title}
//                 onChange={handleSongInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 placeholder="Entrez le titre de la chanson"
//                 required
//                 aria-label="Titre de la chanson"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Artiste</label>
//               <input
//                 type="text"
//                 name="artist_name"
//                 value={songFormData.artist_name}
//                 onChange={handleSongInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 placeholder="Nom de l'artiste"
//                 aria-label="Nom de l'artiste"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Catégorie</label>
//               <select
//                 name="category_id"
//                 value={songFormData.category_id}
//                 onChange={handleSongInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//                 aria-label="Catégorie"
//               >
//                 <option value="" disabled>Sélectionner une catégorie</option>
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={cat.id}>{cat.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Statut</label>
//               <select
//                 name="status"
//                 value={songFormData.status}
//                 onChange={handleSongInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 aria-label="Statut"
//               >
//                 <option value="draft">Brouillon</option>
//                 <option value="published">Publié</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Fichier Audio</label>
//               <input
//                 type="file"
//                 name="audio"
//                 onChange={handleSongInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 accept="audio/*"
//                 aria-label="Fichier audio"
//                 required={!songEditingId}
//               />
//               {songAudioPreview && (
//                 <audio
//                   src={songAudioPreview}
//                   controls
//                   className="mt-2 w-full"
//                   onError={() => console.warn('Audio preview failed:', songAudioPreview)}
//                 />
//               )}
//               {songEditingId && songAudioPreview && (
//                 <label className="flex items-center mt-2">
//                   <input
//                     type="checkbox"
//                     name="remove_audio"
//                     checked={songFormData.remove_audio}
//                     onChange={handleSongInputChange}
//                     className="mr-2"
//                   />
//                   Supprimer l'audio existant
//                 </label>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Image</label>
//               <input
//                 type="file"
//                 name="image"
//                 onChange={handleSongInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 accept="image/*"
//                 aria-label="Image de la chanson"
//               />
//               {songImagePreview && (
//                 <img
//                   src={songImagePreview}
//                   alt="Aperçu"
//                   className="mt-2 w-32 h-32 object-cover rounded"
//                   onError={() => console.warn('Image preview failed:', songImagePreview)}
//                 />
//               )}
//               {songEditingId && songImagePreview && (
//                 <label className="flex items-center mt-2">
//                   <input
//                     type="checkbox"
//                     name="remove_image"
//                     checked={songFormData.remove_image}
//                     onChange={handleSongInputChange}
//                     className="mr-2"
//                   />
//                   Supprimer l'image existante
//                 </label>
//               )}
//             </div>
//           </div>
//           <div className="mt-6 flex flex-col sm:flex-row gap-2">
//             <button
//               type="submit"
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             >
//               {songEditingId ? 'Mettre à jour la chanson' : 'Ajouter la chanson'}
//             </button>
//             {songEditingId && (
//               <button
//                 type="button"
//                 onClick={resetSongForm}
//                 className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//               >
//                 Annuler
//               </button>
//             )}
//           </div>
//         </form>
//       </div>

//       {/* Articles List */}
//       <div className="bg-white p-6 rounded shadow mb-6">
//         <h2 className="text-xl font-semibold mb-4 flex items-center">
//           <Plus className="w-5 h-5 mr-2" />
//           Articles
//         </h2>
//         <table className="w-full">
//           <thead>
//             <tr>
//               <th className="text-left p-2">Aperçu</th>
//               <th className="text-left p-2">Titre</th>
//               <th className="text-left p-2">Catégorie</th>
//               <th className="text-left p-2">Statut</th>
//               <th className="text-left p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {articles.map((article) => (
//               <tr key={article.id} className="border-t">
//                 <td className="p-2">
//                   <img
//                     src={article.image_url}
//                     alt={article.title || 'Image'}
//                     className="w-16 h-12 object-cover rounded"
//                     onError={(e) => { e.target.src = FALLBACK_IMAGE; console.warn(`Image not found: ${article.image_url}`); }}
//                   />
//                 </td>
//                 <td className="p-2">{article.title}</td>
//                 <td className="p-2">{categories.find(cat => cat.id === article.category_id)?.name || 'Inconnu'}</td>
//                 <td className="p-2">{article.status === 'published' ? 'Publié' : 'Brouillon'}</td>
//                 <td className="p-2">
//                   <button
//                     onClick={() => handleEdit(article)}
//                     className="text-blue-500 hover:text-blue-700 mr-2"
//                   >
//                     <Edit className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(article.id)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Songs List */}
//       <div className="bg-white p-6 rounded shadow mb-6">
//         <h2 className="text-xl font-semibold mb-4 flex items-center">
//           <MusicIcon className="w-5 h-5 mr-2" />
//           Chansons
//         </h2>
//         <table className="w-full">
//           <thead>
//             <tr>
//               <th className="text-left p-2">Aperçu</th>
//               <th className="text-left p-2">Titre</th>
//               <th className="text-left p-2">Artiste</th>
//               <th className="text-left p-2">Statut</th>
//               <th className="text-left p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {songs.map((song) => (
//               <tr key={song.id} className="border-t">
//                 <td className="p-2">
//                   <img
//                     src={song.image_url}
//                     alt={song.title || 'Image'}
//                     className="w-16 h-12 object-cover rounded"
//                     onError={(e) => { e.target.src = FALLBACK_IMAGE; console.warn(`Image not found: ${song.image_url}`); }}
//                   />
//                 </td>
//                 <td className="p-2">{song.title}</td>
//                 <td className="p-2">{song.artist_name || 'Inconnu'}</td>
//                 <td className="p-2">{song.status === 'published' ? 'Publié' : 'Brouillon'}</td>
//                 <td className="p-2">
//                   <button
//                     onClick={() => handleSongEdit(song)}
//                     className="text-blue-500 hover:text-blue-700 mr-2"
//                   >
//                     <Edit className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={() => handleSongDelete(song.id)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default CultureUrbaineArticlesDashboard;
