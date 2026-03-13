'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Edit, Trash2, RefreshCw, FilePlus, Upload, X, Check, Clock, Link as LinkIcon } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const styles = `
  /* ══ FORM ══ */
  .at-form-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; padding:40px;
    position:relative; overflow:hidden;
    box-shadow:0 40px 80px rgba(0,0,0,0.5);
    margin-bottom:32px;
  }
  .at-form-shell::before {
    content:''; position:absolute; top:-120px; right:-120px;
    width:360px; height:360px;
    background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%);
    pointer-events:none;
  }
  .at-form-shell::after {
    content:''; position:absolute; bottom:-80px; left:-80px;
    width:280px; height:280px;
    background:radial-gradient(circle,rgba(99,102,241,0.10) 0%,transparent 70%);
    pointer-events:none;
  }
  .at-form-title {
    font-size:1.6rem; font-weight:800; color:#fff;
    letter-spacing:-0.03em; margin-bottom:36px;
    display:flex; align-items:center; gap:12px;
  }
  .at-form-title span {
    display:inline-block; width:6px; height:28px;
    background:linear-gradient(to bottom,#3b82f6,#6366f1);
    border-radius:3px;
  }
  .at-section-label {
    font-size:0.65rem; font-weight:700; letter-spacing:0.15em;
    text-transform:uppercase; color:#3b82f6;
    margin-bottom:16px; padding-bottom:8px;
    border-bottom:1px solid rgba(59,130,246,0.2);
  }
  .at-static-label {
    display:block; font-size:0.72rem; font-weight:600;
    color:rgba(255,255,255,0.4); letter-spacing:0.06em;
    text-transform:uppercase; margin-bottom:8px;
  }
  .at-input, .at-select, .at-textarea {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:14px 16px;
    font-size:0.875rem; font-family:inherit; color:#f0f0f5;
    outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
    appearance:none; -webkit-appearance:none;
  }
  .at-input[type=date]{color-scheme:dark;}
  .at-input[type=number]{-moz-appearance:textfield;}
  .at-input::placeholder,.at-textarea::placeholder{color:rgba(255,255,255,0.25);}
  .at-input:focus,.at-select:focus,.at-textarea:focus {
    border-color:rgba(59,130,246,0.6);
    background:rgba(59,130,246,0.06);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .at-select option{background:#1a1a24;color:#f0f0f5;}
  .at-select-wrap{position:relative;}
  .at-select-wrap svg{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:16px;height:16px;pointer-events:none;color:rgba(255,255,255,0.3);}
  .at-textarea{resize:vertical;min-height:80px;}
  .at-dropzone {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:8px; padding:24px;
    border:2px dashed rgba(255,255,255,0.1); border-radius:12px;
    cursor:pointer; transition:all 0.2s;
    background:rgba(255,255,255,0.02);
    font-size:0.8rem; color:rgba(255,255,255,0.3);
    position:relative;
  }
  .at-dropzone:hover{border-color:rgba(59,130,246,0.4);background:rgba(59,130,246,0.04);color:rgba(255,255,255,0.6);}
  .at-dropzone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
  .at-media-preview{margin-top:12px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);max-width:240px;}
  .at-divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:28px 0;}
  .at-btn-cancel {
    display:inline-flex;align-items:center;gap:8px;padding:12px 24px;
    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;color:rgba(255,255,255,0.7);
    font-size:0.875rem;font-weight:500;cursor:pointer;transition:all 0.2s;
  }
  .at-btn-cancel:hover{background:rgba(255,255,255,0.1);color:#fff;}
  .at-btn-submit {
    display:inline-flex;align-items:center;gap:8px;padding:12px 32px;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    border:none;border-radius:12px;color:#fff;
    font-size:0.875rem;font-weight:700;letter-spacing:0.03em;
    cursor:pointer;transition:all 0.2s;
    box-shadow:0 4px 20px rgba(59,130,246,0.35);
  }
  .at-btn-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px rgba(59,130,246,0.5);}
  .at-btn-submit:disabled{opacity:0.5;cursor:not-allowed;}
  .at-editor-wrap .tox-tinymce{border-radius:12px!important;border-color:rgba(255,255,255,0.1)!important;overflow:hidden;}

  /* Conditional fields highlight */
  .at-conditional-box{
    background:rgba(99,102,241,0.05);
    border:1px solid rgba(99,102,241,0.15);
    border-radius:14px; padding:20px 20px 4px;
    margin-bottom:0;
  }
  .at-conditional-title{
    font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
    color:#a5b4fc;margin-bottom:16px;
  }

  /* ══ LIST ══ */
  .at-list-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; overflow:hidden;
    box-shadow:0 40px 80px rgba(0,0,0,0.5);
    margin-bottom:32px; position:relative;
  }
  .at-list-shell::before{
    content:'';position:absolute;top:-100px;right:-100px;
    width:300px;height:300px;
    background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%);
    pointer-events:none;z-index:0;
  }
  .at-list-header{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);position:relative;z-index:1;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
  .at-search-wrap{position:relative;flex:1;}
  .at-search-input{
    width:100%;max-width:360px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;padding:11px 16px 11px 40px;
    font-size:0.875rem;font-family:inherit;color:#f0f0f5;
    outline:none;transition:border-color 0.2s,box-shadow 0.2s;
  }
  .at-search-input::placeholder{color:rgba(255,255,255,0.25);}
  .at-search-input:focus{border-color:rgba(59,130,246,0.5);box-shadow:0 0 0 3px rgba(59,130,246,0.10);}
  .at-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:rgba(255,255,255,0.25);pointer-events:none;}

  /* Type filter pills */
  .at-filter-row{padding:14px 24px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;flex-wrap:wrap;gap:8px;position:relative;z-index:1;}
  .at-filter-btn{padding:5px 12px;border-radius:999px;font-size:0.75rem;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);transition:all 0.15s;}
  .at-filter-btn:hover{color:rgba(255,255,255,0.7);border-color:rgba(255,255,255,0.2);}
  .at-filter-btn.active{background:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.4);color:#93c5fd;}

  .at-table{width:100%;border-collapse:collapse;position:relative;z-index:1;}
  .at-table thead tr{border-bottom:1px solid rgba(255,255,255,0.06);}
  .at-table thead th{padding:12px 16px;text-align:left;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.25);}
  .at-table tbody tr{border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;}
  .at-table tbody tr:last-child{border-bottom:none;}
  .at-table tbody tr:hover{background:rgba(255,255,255,0.03);}
  .at-table td{padding:12px 16px;font-size:0.85rem;color:rgba(255,255,255,0.65);vertical-align:middle;}
  .at-title-text{font-size:0.875rem;font-weight:500;color:#f0f0f5;}
  .at-sub-text{font-size:0.75rem;color:rgba(255,255,255,0.3);}
  .at-thumb{width:52px;height:42px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;}

  /* Type pill */
  .at-type-pill{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:0.68rem;font-weight:700;background:rgba(99,102,241,0.12);color:#a5b4fc;border:1px solid rgba(99,102,241,0.2);}

  /* Badges */
  .at-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:0.72rem;font-weight:600;border:1px solid;}
  .at-badge-published{background:rgba(34,197,94,0.12);color:#4ade80;border-color:rgba(34,197,94,0.25);}
  .at-badge-draft{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);border-color:rgba(255,255,255,0.1);}
  .at-badge-pending{background:rgba(234,179,8,0.12);color:#facc15;border-color:rgba(234,179,8,0.25);}

  /* Action btns */
  .at-action-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.15s;color:rgba(255,255,255,0.4);}
  .at-action-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}
  .at-action-btn.edit:hover{background:rgba(99,102,241,0.15);color:#a5b4fc;border-color:rgba(99,102,241,0.35);}
  .at-action-btn.del:hover{background:rgba(239,68,68,0.15);color:#fca5a5;border-color:rgba(239,68,68,0.35);}

  .at-empty{padding:60px 24px;text-align:center;color:rgba(255,255,255,0.2);}
  .at-overflow{overflow-x:auto;}
`;

const ARTS_TYPES = [
  { value: 'tradition', label: 'Tradition' },
  { value: 'artisanat', label: 'Artisanat' },
  { value: 'rite', label: 'Rite' },
  { value: 'coutume', label: 'Coutume' },
  { value: 'ethnie', label: 'Ethnie' },
  { value: 'festival', label: 'Festival' },
  { value: 'recipe', label: 'Recette' },
  { value: 'ingredient', label: 'Ingrédient' },
  { value: 'chef', label: 'Chef' },
];

const Articles6 = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' }) => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const emptyForm = {
    id: null, title: '', content: '', category_id: '38', section_id: '',
    arts_traditions_type: 'tradition', status: 'draft',
    image: null, remove_image: false, author_name: '',
    date: '', prep_time: '', cook_time: '', difficulty: '',
    rating: '', reviews: '', recipe_author: '',
    specialty: '', recipes_count: '', video_url: '', video: null,
  };
  const [formData, setFormData] = useState(emptyForm);

  const userInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || '{}') : {};
  const isAdmin = userInfo.role === 'admin';

  useEffect(() => {
    if (successMessage) { const t = setTimeout(() => setSuccessMessage(''), 3000); return () => clearTimeout(t); }
  }, [successMessage]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { setIsAuthenticated(true); fetchData(token); }
    else setErrorMessage('Aucun token trouvé. Veuillez vous connecter.');
  }, [apiUrl]);

  const fetchData = async (token) => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
      const safeJson = async (res) => { if (!res.ok) return []; const d = await res.json().catch(() => []); return Array.isArray(d) ? d : []; };
      const [aRes, cRes, sRes] = await Promise.all([
        fetch(`${apiUrl}/api/arts-traditions-articles/`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/categories/`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/sections/`, { cache: 'no-store', headers }),
      ]);
      const [aData, cData, sData] = await Promise.all([safeJson(aRes), safeJson(cRes), safeJson(sRes)]);
      const norm = (url) => url ? `${apiUrl}${url.startsWith('/') ? url : `/${url}`}` : null;
      setArticles(aData.map(item => ({ ...item, image_url: norm(item.image_url) || FALLBACK_IMAGE, video_url: norm(item.video_url) })));
      setCategories(cData); setSections(sData);
    } catch (e) { setErrorMessage(e.message || 'Échec de la récupération des données.'); }
    finally { setIsLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ username: loginData.username, password: loginData.password }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Échec de la connexion'); }
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userInfo', JSON.stringify(data.user_info));
      setIsAuthenticated(true); fetchData(data.access_token);
    } catch (e) { setErrorMessage(e.message || 'Échec de la connexion.'); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) { setFormData(p => ({ ...p, [type]: null })); if (type === 'image') setImagePreview(null); if (type === 'video') setVideoPreview(null); return; }
    if (type === 'image' && !['image/png','image/jpeg','image/jpg','image/gif'].includes(file.type)) { setErrorMessage('PNG, JPG ou GIF uniquement.'); return; }
    if (type === 'video' && !['video/mp4','video/webm'].includes(file.type)) { setErrorMessage('MP4 ou WebM uniquement.'); return; }
    const url = URL.createObjectURL(file);
    if (type === 'video') {
      const v = document.createElement('video'); v.preload = 'metadata';
      v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); setFormData(p => ({ ...p, video: file })); setVideoPreview(url); };
      v.src = url; v.load();
    } else { setFormData(p => ({ ...p, image: file, remove_image: false })); setImagePreview(url); }
  };

  const filePickerCallback = (callback, _v, meta) => {
    const input = document.createElement('input'); input.type = 'file';
    input.accept = meta.filetype === 'image' ? 'image/jpeg,image/png,image/jpg,image/gif' : 'video/mp4,video/webm';
    input.onchange = () => {
      const file = input.files[0]; if (!file) return;
      const type = meta.filetype === 'image' ? 'image' : 'video';
      const url = URL.createObjectURL(file);
      setFormData(p => ({ ...p, [type]: file }));
      if (type === 'image') setImagePreview(url); else setVideoPreview(url);
      callback(url, { alt: file.name });
    };
    input.click();
  };

  const handleImageError = useCallback((e, itemId) => {
    if (!failedImages.has(itemId)) {
      setFailedImages(p => new Set(p).add(itemId));
      e.target.style.display = 'none';
    }
  }, [failedImages]);

  const resetForm = () => {
    setFormData(emptyForm); setImagePreview(null); setVideoPreview(null);
    setIsEditing(false); setShowForm(false); setErrorMessage('');
  };

  const handleEdit = (article) => {
    setFormData({ id: article.id, title: article.title, content: article.content, category_id: article.category_id.toString(), section_id: article.section_id.toString(), arts_traditions_type: article.arts_traditions_type, status: article.status, image: null, remove_image: false, author_name: article.author_name || '', date: article.date || '', prep_time: article.prep_time || '', cook_time: article.cook_time || '', difficulty: article.difficulty || '', rating: article.rating || '', reviews: article.reviews || '', recipe_author: article.recipe_author || '', specialty: article.specialty || '', recipes_count: article.recipes_count || '', video_url: article.video_url || '', video: null });
    setImagePreview(article.image_url !== FALLBACK_IMAGE ? article.image_url : null);
    setVideoPreview(article.video_url || null);
    setIsEditing(true); setShowForm(true); setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/arts-traditions-articles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Échec de la suppression'); }
      setArticles(p => p.filter(a => a.id !== id));
      setSuccessMessage('Article supprimé avec succès.');
    } catch (e) { setErrorMessage(e.message || 'Échec de la suppression.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!formData.title.trim() || !formData.content.trim() || !formData.category_id || !formData.section_id) throw new Error('Veuillez remplir tous les champs obligatoires');
      const fd = new FormData();
      fd.append('title', formData.title.trim()); fd.append('content', formData.content.trim());
      fd.append('category_id', parseInt(formData.category_id)); fd.append('section_id', parseInt(formData.section_id));
      fd.append('arts_traditions_type', formData.arts_traditions_type); fd.append('status', formData.status || 'draft');
      if (formData.image) fd.append('image', formData.image);
      if (formData.video) fd.append('video', formData.video);
      fd.append('remove_image', formData.remove_image);
      if (isAdmin && formData.author_name.trim()) fd.append('author_name', formData.author_name.trim());
      if (formData.date) fd.append('date', formData.date);
      if (formData.prep_time) fd.append('prep_time', formData.prep_time);
      if (formData.cook_time) fd.append('cook_time', formData.cook_time);
      if (formData.difficulty) fd.append('difficulty', formData.difficulty);
      if (formData.rating) fd.append('rating', parseFloat(formData.rating));
      if (formData.reviews) fd.append('reviews', parseInt(formData.reviews));
      if (formData.recipe_author) fd.append('recipe_author', formData.recipe_author);
      if (formData.specialty) fd.append('specialty', formData.specialty);
      if (formData.recipes_count) fd.append('recipes_count', parseInt(formData.recipes_count));
      if (formData.video_url.trim()) fd.append('video_url', formData.video_url.trim());

      const url = isEditing ? `${apiUrl}/api/arts-traditions-articles/${formData.id}` : `${apiUrl}/api/arts-traditions-articles/`;
      const res = await fetch(url, { method: isEditing ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Échec de l\'opération'); }
      const newArt = await res.json();
      const norm = (u) => u ? `${apiUrl}${u.startsWith('/') ? u : `/${u}`}` : null;
      const normalized = { ...newArt, image_url: norm(newArt.image_url) || FALLBACK_IMAGE, video_url: norm(newArt.video_url) };
      isEditing ? setArticles(p => p.map(a => a.id === formData.id ? normalized : a)) : setArticles(p => [...p, normalized]);
      setSuccessMessage(isEditing ? 'Article mis à jour !' : 'Article créé avec succès !');
      resetForm();
    } catch (e) { setErrorMessage(e.message || 'Une erreur est survenue.'); }
    finally { setIsSubmitting(false); }
  };

  const filteredData = articles.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.title?.toLowerCase().includes(q) || item.category?.name?.toLowerCase().includes(q) || item.section?.name?.toLowerCase().includes(q) || item.arts_traditions_type?.toLowerCase().includes(q) || item.status?.toLowerCase().includes(q) || item.author_name?.toLowerCase().includes(q) || new Date(item.created_at).toLocaleDateString('fr-FR').includes(q);
    const matchFilter = activeFilter === 'all' || item.arts_traditions_type === activeFilter;
    return matchSearch && matchFilter && item.status !== 'archived';
  });

  const Chevron = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom d&apos;utilisateur</label>
              <input type="text" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Se connecter</button>
          </form>
          {errorMessage && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">{errorMessage}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <style>{styles}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Articles Arts et Traditions</h3>
          <p className="text-sm text-gray-500">Gérez les traditions, artisanats, recettes, festivals et plus</p>
        </div>
        {!showForm ? (
          <button onClick={() => { setFormData(emptyForm); setShowForm(true); }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" /> Ajouter un article
          </button>
        ) : (
          <button onClick={resetForm}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
            <X className="w-5 h-5 mr-2" /> Annuler
          </button>
        )}
      </div>

      {successMessage && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} /> {successMessage}
        </div>
      )}

      {/* ══ FORM ══ */}
      {showForm && (
        <div className="at-form-shell">
          <div className="at-form-title">
            <span />
            {isEditing ? "Modifier l'article" : 'Ajouter un Article Arts & Traditions'}
          </div>

          {errorMessage && (
            <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: '0.85rem' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Infos générales */}
            <p className="at-section-label">Informations générales</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label className="at-static-label">Titre *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="at-input" placeholder="Entrez le titre" required />
              </div>
              <div>
                <label className="at-static-label">Type *</label>
                <div className="at-select-wrap">
                  <select name="arts_traditions_type" value={formData.arts_traditions_type} onChange={handleInputChange} className="at-select" required>
                    {ARTS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="at-static-label">Catégorie *</label>
                <div className="at-select-wrap">
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="at-select" required>
                    <option value="">Sélectionner…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="at-static-label">Section *</label>
                <div className="at-select-wrap">
                  <select name="section_id" value={formData.section_id} onChange={handleInputChange} className="at-select" required>
                    <option value="">Sélectionner…</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="at-static-label">Statut *</label>
                <div className="at-select-wrap">
                  <select name="status" value={formData.status} onChange={handleInputChange} className="at-select">
                    <option value="draft">Brouillon</option>
                    <option value="pending">En attente</option>
                    <option value="published">Publié</option>
                  </select>
                  <Chevron />
                </div>
              </div>
              {isAdmin && (
                <div>
                  <label className="at-static-label">Nom de l&apos;auteur</label>
                  <input type="text" name="author_name" value={formData.author_name} onChange={handleInputChange} className="at-input" placeholder="Nom de l'auteur" />
                </div>
              )}
              <div>
                <label className="at-static-label">URL vidéo (optionnel)</label>
                <input type="text" name="video_url" value={formData.video_url} onChange={handleInputChange} className="at-input" placeholder="/videos/exemple.mp4" />
              </div>
            </div>

            {/* Conditional: Festival */}
            {formData.arts_traditions_type === 'festival' && (
              <>
                <hr className="at-divider" />
                <div className="at-conditional-box">
                  <p className="at-conditional-title">Champs spécifiques — Festival</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                    <div>
                      <label className="at-static-label">Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="at-input" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Conditional: Recipe */}
            {formData.arts_traditions_type === 'recipe' && (
              <>
                <hr className="at-divider" />
                <div className="at-conditional-box">
                  <p className="at-conditional-title">Champs spécifiques — Recette</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                    {[['prep_time','Temps de préparation','ex: 30 min'],['cook_time','Temps de cuisson','ex: 45 min'],['difficulty','Difficulté','ex: Facile'],['recipe_author','Auteur de la recette','Nom']].map(([n,l,p]) => (
                      <div key={n}>
                        <label className="at-static-label">{l}</label>
                        <input type="text" name={n} value={formData[n]} onChange={handleInputChange} className="at-input" placeholder={p} />
                      </div>
                    ))}
                    <div>
                      <label className="at-static-label">Note (0–5)</label>
                      <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} className="at-input" placeholder="4.5" step="0.1" min="0" max="5" />
                    </div>
                    <div>
                      <label className="at-static-label">Nombre d&apos;avis</label>
                      <input type="number" name="reviews" value={formData.reviews} onChange={handleInputChange} className="at-input" placeholder="0" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Conditional: Chef */}
            {formData.arts_traditions_type === 'chef' && (
              <>
                <hr className="at-divider" />
                <div className="at-conditional-box">
                  <p className="at-conditional-title">Champs spécifiques — Chef</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                    <div>
                      <label className="at-static-label">Spécialité</label>
                      <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} className="at-input" placeholder="ex: Cuisine gabonaise" />
                    </div>
                    <div>
                      <label className="at-static-label">Nombre de recettes</label>
                      <input type="number" name="recipes_count" value={formData.recipes_count} onChange={handleInputChange} className="at-input" placeholder="0" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <hr className="at-divider" />

            {/* Contenu */}
            <p className="at-section-label">Contenu *</p>
            <div className="at-editor-wrap">
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'kace4qkcs3zmic3xrgg5vyqjbh8r3w9q772ybtcyghuh52yn'}
                value={formData.content}
                onEditorChange={content => setFormData(p => ({ ...p, content }))}
                init={{
                  height: 400, menubar: true,
                  plugins: [
                    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                    'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable',
                    'advcode', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography',
                    'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf',
                  ],
                  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                  tinycomments_mode: 'embedded',
                  tinycomments_author: 'Author name',
                  mergetags_list: [
                    { value: 'First.Name', title: 'First Name' },
                    { value: 'Email', title: 'Email' },
                  ],
                  ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
                  file_picker_callback: filePickerCallback, file_picker_types: 'image media',
                  content_style: 'body { font-size: 14px; }',
                  skin: 'oxide-dark', content_css: 'dark',
                  placeholder: "Contenu de l'article",
                }}
              />
            </div>

            <hr className="at-divider" />

            {/* Médias */}
            <p className="at-section-label">Médias</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label className="at-static-label">Image (optionnel)</label>
                <div className="at-dropzone">
                  <Upload size={24} style={{ opacity: 0.35 }} />
                  <span>{formData.image ? formData.image.name : 'Choisir une image'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>PNG, JPG, GIF</span>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif" onChange={e => handleFileChange(e, 'image')} />
                </div>
                {imagePreview && (
                  <div className="at-media-preview" style={{ position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Aperçu" style={{ width: '100%', display: 'block' }} />
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, image: null, remove_image: true })); setImagePreview(null); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="at-static-label">Vidéo fichier (optionnel)</label>
                <div className="at-dropzone">
                  <Upload size={24} style={{ opacity: 0.35 }} />
                  <span>{formData.video ? formData.video.name : 'Choisir une vidéo'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>MP4, WebM</span>
                  <input type="file" accept="video/mp4,video/webm" onChange={e => handleFileChange(e, 'video')} />
                </div>
                {videoPreview && (
                  <div className="at-media-preview" style={{ position: 'relative' }}>
                    <video src={videoPreview} controls style={{ width: '100%', display: 'block' }} />
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, video: null })); setVideoPreview(null); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <hr className="at-divider" />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={resetForm} className="at-btn-cancel"><X size={16} /> Annuler</button>
              <button type="submit" disabled={isSubmitting} className="at-btn-submit">
                {isSubmitting
                  ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Envoi…</>
                  : <><Check size={16} /> {isEditing ? 'Mettre à jour' : "Créer l'article"}</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══ LIST ══ */}
      <div className="at-list-shell">
        {/* Header */}
        <div className="at-list-header">
          <div className="at-search-wrap">
            <svg className="at-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Rechercher titre, type, auteur…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} className="at-search-input" />
          </div>
          <button onClick={() => fetchData(localStorage.getItem('token'))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Rafraîchir
          </button>
        </div>

        {/* Filter pills */}
        <div className="at-filter-row">
          <button className={`at-filter-btn${activeFilter === 'all' ? ' active' : ''}`} onClick={() => setActiveFilter('all')}>Tous</button>
          {ARTS_TYPES.map(t => (
            <button key={t.value} className={`at-filter-btn${activeFilter === t.value ? ' active' : ''}`} onClick={() => setActiveFilter(t.value)}>{t.label}</button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.3)' }}>
            <RefreshCw style={{ width: 36, height: 36, color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <p>Chargement…</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="at-overflow">
            <table className="at-table">
              <thead>
                <tr>
                  {['Aperçu','Titre','Type','Catégorie','Section','Statut','Auteur','Date','Vidéo','Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id}>
                    {/* Thumb */}
                    <td>
                      <div className="at-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={e => handleImageError(e, item.id)} />
                      </div>
                    </td>
                    <td><span className="at-title-text">{item.title}</span></td>
                    <td><span className="at-type-pill">{ARTS_TYPES.find(t => t.value === item.arts_traditions_type)?.label || item.arts_traditions_type}</span></td>
                    <td><span className="at-sub-text">{item.category?.name || 'N/A'}</span></td>
                    <td><span className="at-sub-text">{item.section?.name || 'N/A'}</span></td>
                    <td>
                      {(() => {
                        const s = item.status;
                        const cls = s === 'published' ? 'at-badge at-badge-published' : s === 'pending' ? 'at-badge at-badge-pending' : 'at-badge at-badge-draft';
                        const icon = s === 'published' ? <Check size={11} /> : s === 'pending' ? <Clock size={11} /> : <FileText size={11} />;
                        return <span className={cls}>{icon}{s === 'published' ? 'Publié' : s === 'pending' ? 'Attente' : 'Brouillon'}</span>;
                      })()}
                    </td>
                    <td><span className="at-sub-text">{item.author_name || item.author_username || 'N/A'}</span></td>
                    <td><span className="at-sub-text">{new Date(item.created_at).toLocaleDateString('fr-FR')}</span></td>
                    <td>
                      {item.video_url
                        ? <a href={item.video_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#93c5fd', fontSize: '0.78rem', textDecoration: 'none' }}>
                            <LinkIcon size={12} /> Voir
                          </a>
                        : <span className="at-sub-text">—</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(item)} className="at-action-btn edit" title="Modifier"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(item.id)} className="at-action-btn del" title="Supprimer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="at-empty">
            <FilePlus style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.2 }} />
            <p>Aucun article trouvé</p>
            <p style={{ fontSize: '0.8rem', marginTop: 4, opacity: 0.6 }}>
              {searchQuery || activeFilter !== 'all' ? 'Aucun résultat pour les filtres actuels.' : 'Ajoutez un article en cliquant sur le bouton ci-dessus.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles6;
