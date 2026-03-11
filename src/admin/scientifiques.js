'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Edit, Trash2, RefreshCw, FilePlus, Upload, X, Play, Check, Clock, FlaskConical } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const styles = `
  /* ══ FORM ══ */
  .sci-form-shell {
    background: #0f0f13;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 40px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
    margin-bottom: 32px;
  }
  .sci-form-shell::before {
    content:''; position:absolute; top:-120px; right:-120px;
    width:360px; height:360px;
    background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%);
    pointer-events:none;
  }
  .sci-form-shell::after {
    content:''; position:absolute; bottom:-80px; left:-80px;
    width:280px; height:280px;
    background:radial-gradient(circle,rgba(99,102,241,0.10) 0%,transparent 70%);
    pointer-events:none;
  }
  .sci-form-title {
    font-size:1.6rem; font-weight:800; color:#fff;
    letter-spacing:-0.03em; margin-bottom:36px;
    display:flex; align-items:center; gap:12px;
  }
  .sci-form-title span {
    display:inline-block; width:6px; height:28px;
    background:linear-gradient(to bottom,#3b82f6,#6366f1);
    border-radius:3px;
  }
  .sci-section-label {
    font-size:0.65rem; font-weight:700; letter-spacing:0.15em;
    text-transform:uppercase; color:#3b82f6;
    margin-bottom:16px; padding-bottom:8px;
    border-bottom:1px solid rgba(59,130,246,0.2);
  }
  .sci-static-label {
    display:block; font-size:0.72rem; font-weight:600;
    color:rgba(255,255,255,0.4); letter-spacing:0.06em;
    text-transform:uppercase; margin-bottom:8px;
  }
  .sci-input, .sci-select, .sci-textarea {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:14px 16px;
    font-size:0.875rem; font-family:inherit; color:#f0f0f5;
    outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
    appearance:none; -webkit-appearance:none;
  }
  .sci-input::placeholder,.sci-textarea::placeholder{color:rgba(255,255,255,0.25);}
  .sci-input:focus,.sci-select:focus,.sci-textarea:focus {
    border-color:rgba(59,130,246,0.6);
    background:rgba(59,130,246,0.06);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .sci-select option{background:#1a1a24;color:#f0f0f5;}
  .sci-textarea{resize:vertical;min-height:80px;}
  .sci-select-wrap{position:relative;}
  .sci-select-wrap svg{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:16px;height:16px;pointer-events:none;color:rgba(255,255,255,0.3);}
  .sci-dropzone {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:8px; padding:24px;
    border:2px dashed rgba(255,255,255,0.1); border-radius:12px;
    cursor:pointer; transition:all 0.2s;
    background:rgba(255,255,255,0.02);
    font-size:0.8rem; color:rgba(255,255,255,0.3);
    position:relative;
  }
  .sci-dropzone:hover{border-color:rgba(59,130,246,0.4);background:rgba(59,130,246,0.04);color:rgba(255,255,255,0.6);}
  .sci-dropzone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
  .sci-media-preview{margin-top:12px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);max-width:240px;}
  .sci-divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:28px 0;}
  .sci-btn-cancel {
    display:inline-flex;align-items:center;gap:8px;padding:12px 24px;
    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;color:rgba(255,255,255,0.7);
    font-size:0.875rem;font-weight:500;cursor:pointer;transition:all 0.2s;
  }
  .sci-btn-cancel:hover{background:rgba(255,255,255,0.1);color:#fff;}
  .sci-btn-submit {
    display:inline-flex;align-items:center;gap:8px;padding:12px 32px;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    border:none;border-radius:12px;color:#fff;
    font-size:0.875rem;font-weight:700;letter-spacing:0.03em;
    cursor:pointer;transition:all 0.2s;
    box-shadow:0 4px 20px rgba(59,130,246,0.35);
  }
  .sci-btn-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px rgba(59,130,246,0.5);}
  .sci-btn-submit:disabled{opacity:0.5;cursor:not-allowed;}
  .sci-editor-wrap .tox-tinymce{border-radius:12px!important;border-color:rgba(255,255,255,0.1)!important;overflow:hidden;}

  /* ══ LIST ══ */
  .sci-list-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; overflow:hidden;
    box-shadow:0 40px 80px rgba(0,0,0,0.5);
    margin-bottom:32px; position:relative;
  }
  .sci-list-shell::before{
    content:'';position:absolute;top:-100px;right:-100px;
    width:300px;height:300px;
    background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%);
    pointer-events:none;z-index:0;
  }
  .sci-list-header{
    padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);
    position:relative;z-index:1;
  }
  .sci-search-wrap{position:relative;}
  .sci-search-input{
    width:100%;max-width:360px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;padding:11px 16px 11px 40px;
    font-size:0.875rem;font-family:inherit;color:#f0f0f5;
    outline:none;transition:border-color 0.2s,box-shadow 0.2s;
  }
  .sci-search-input::placeholder{color:rgba(255,255,255,0.25);}
  .sci-search-input:focus{border-color:rgba(59,130,246,0.5);box-shadow:0 0 0 3px rgba(59,130,246,0.10);}
  .sci-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:rgba(255,255,255,0.25);pointer-events:none;}

  .sci-table{width:100%;border-collapse:collapse;position:relative;z-index:1;}
  .sci-table thead tr{border-bottom:1px solid rgba(255,255,255,0.06);}
  .sci-table thead th{padding:12px 20px;text-align:left;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.25);}
  .sci-table tbody tr{border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;}
  .sci-table tbody tr:last-child{border-bottom:none;}
  .sci-table tbody tr:hover{background:rgba(255,255,255,0.03);}
  .sci-table td{padding:14px 20px;font-size:0.85rem;color:rgba(255,255,255,0.65);vertical-align:middle;}
  .sci-title-text{font-size:0.875rem;font-weight:500;color:#f0f0f5;}
  .sci-sub-text{font-size:0.75rem;color:rgba(255,255,255,0.3);}
  .sci-thumb{width:56px;height:44px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;position:relative;}

  /* Science section pill */
  .sci-section-pill{
    display:inline-flex;align-items:center;gap:5px;
    padding:3px 10px;border-radius:999px;font-size:0.7rem;font-weight:600;
    background:rgba(99,102,241,0.12);color:#a5b4fc;border:1px solid rgba(99,102,241,0.25);
  }

  /* Status badges */
  .sci-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:0.72rem;font-weight:600;letter-spacing:0.03em;border:1px solid;}
  .sci-badge-published{background:rgba(34,197,94,0.12);color:#4ade80;border-color:rgba(34,197,94,0.25);}
  .sci-badge-draft{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);border-color:rgba(255,255,255,0.1);}
  .sci-badge-pending{background:rgba(234,179,8,0.12);color:#facc15;border-color:rgba(234,179,8,0.25);}

  /* Action btns */
  .sci-action-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.15s;color:rgba(255,255,255,0.4);}
  .sci-action-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}
  .sci-action-btn.edit:hover{background:rgba(99,102,241,0.15);color:#a5b4fc;border-color:rgba(99,102,241,0.35);}
  .sci-action-btn.del:hover{background:rgba(239,68,68,0.15);color:#fca5a5;border-color:rgba(239,68,68,0.35);}

  .sci-empty{padding:60px 24px;text-align:center;color:rgba(255,255,255,0.2);}
  .sci-overflow{overflow-x:auto;}
`;

const SCIENCE_SECTIONS = [
  { value: 'science', label: 'Science' },
  { value: 'technologie', label: 'Technologie' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'recherche', label: 'Recherche' },
  { value: 'developpement_durable', label: 'Développement Durable' },
  { value: 'biotechnologie', label: 'Biotechnologie' },
  { value: 'intelligence_artificielle', label: 'Intelligence Artificielle' },
  { value: 'sante_numerique', label: 'Santé Numérique' },
];

const Articles4 = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' }) => {
  const [scienceArticles, setScienceArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null, title: '', content: '', category_id: '', section_id: '',
    science_section: 'science', status: 'draft',
    image: null, video: null, remove_image: false, remove_video: false, author_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [failedImages, setFailedImages] = useState(new Set());
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const userInfo = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('user_info') || '{}' : '{}');
  const isAdmin = userInfo.role === 'admin';

  useEffect(() => {
    if (successMessage) { const t = setTimeout(() => setSuccessMessage(''), 3000); return () => clearTimeout(t); }
  }, [successMessage]);

  const fetchData = useCallback(async (token) => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
      const safeJson = async (res) => { if (!res.ok) return []; const d = await res.json().catch(() => []); return Array.isArray(d) ? d : []; };
      const [articlesRes, catsRes, secsRes] = await Promise.all([
        fetch(`${apiUrl}/api/science-articles/`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/categories/`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/sections/`, { cache: 'no-store', headers }),
      ]);
      const [articlesData, catsData, secsData] = await Promise.all([safeJson(articlesRes), safeJson(catsRes), safeJson(secsRes)]);

      const normalizeImg = (item) => ({
        ...item,
        image_url: item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
          ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
          : item.image_url || FALLBACK_IMAGE,
      });
      setScienceArticles(articlesData.map(normalizeImg));
      setCategories(catsData);
      setSections(secsData);
    } catch (e) {
      setErrorMessage(e.message || 'Échec de la récupération des données.');
    } finally { setIsLoading(false); }
  }, [apiUrl]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { setIsAuthenticated(true); fetchData(token); }
    else setErrorMessage('Aucun token trouvé. Veuillez vous connecter.');
  }, [apiUrl, fetchData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: loginData.username, password: loginData.password }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Échec de la connexion'); }
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_info', JSON.stringify(data.user_info));
      setIsAuthenticated(true); fetchData(data.access_token);
    } catch (e) { setErrorMessage(e.message || 'Échec de la connexion.'); }
  };

  const filteredData = () => scienceArticles.filter(item =>
    (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.science_section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     new Date(item.created_at).toLocaleDateString('fr-FR').includes(searchQuery.toLowerCase())) &&
    item.status !== 'archived'
  );

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) { setFormData(p => ({ ...p, [type]: null })); if (type === 'image') setImagePreview(null); if (type === 'video') setVideoPreview(null); return; }
    if (type === 'image' && !['image/png','image/jpeg','image/jpg','image/gif'].includes(file.type)) { setErrorMessage('PNG, JPG ou GIF uniquement.'); return; }
    if (type === 'video' && !['video/mp4','video/mov','video/avi'].includes(file.type)) { setErrorMessage('MP4, MOV ou AVI uniquement.'); return; }
    const url = URL.createObjectURL(file);
    if (type === 'video') {
      const v = document.createElement('video'); v.preload = 'metadata';
      v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); setFormData(p => ({ ...p, video: file })); setVideoPreview(url); };
      v.src = url; v.load();
    } else { setFormData(p => ({ ...p, image: file })); setImagePreview(url); }
  };

  const handleImageError = useCallback((e, itemId) => {
    if (!failedImages.has(itemId)) {
      setFailedImages(p => new Set(p).add(itemId));
      e.target.style.display = 'none';
      const icon = e.target.parentElement.querySelector('.default-icon');
      if (icon) icon.style.display = 'flex';
    }
  }, [failedImages]);

  const filePickerCallback = (callback, _v, meta) => {
    const input = document.createElement('input'); input.type = 'file';
    input.accept = meta.filetype === 'image' ? 'image/png,image/jpeg,image/jpg,image/gif' : 'video/mp4,video/mov,video/avi';
    input.onchange = () => {
      const file = input.files[0]; if (!file) return;
      const type = meta.filetype === 'image' ? 'image' : 'video';
      const url = URL.createObjectURL(file);
      setFormData(p => ({ ...p, [type]: file }));
      if (type === 'image') setImagePreview(url);
      if (type === 'video') setVideoPreview(url);
      callback(url, { alt: file.name });
    };
    input.click();
  };

  const getScienceSection = () => sections.find(s => s.slug === 'sciences');

  const resetForm = () => {
    setFormData({ id: null, title: '', content: '', category_id: '', section_id: getScienceSection()?.id || '', science_section: 'science', status: 'draft', image: null, video: null, remove_image: false, remove_video: false, author_name: '' });
    setImagePreview(null); setVideoPreview(null); setIsEditing(false); setShowForm(false); setErrorMessage('');
  };

  const handleEdit = (item) => {
    setFormData({ id: item.id, title: item.title || '', content: item.content || '', category_id: item.category_id || '', section_id: getScienceSection()?.id || '', science_section: item.science_section || 'science', status: item.status || 'draft', image: null, video: null, remove_image: false, remove_video: false, author_name: item.author_name || '' });
    setImagePreview(item.image_url || null); setVideoPreview(item.video_url || null);
    setIsEditing(true); setShowForm(true); setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet article scientifique ? Cette action est irréversible.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/science-articles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Échec de la suppression'); }
      setScienceArticles(p => p.filter(i => i.id !== id));
      setSuccessMessage('Article supprimé avec succès.');
    } catch (e) { setErrorMessage(e.message || 'Échec de la suppression.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!formData.title.trim() || !formData.content.trim() || !formData.category_id || !formData.section_id || !formData.science_section)
        throw new Error('Veuillez remplir tous les champs obligatoires');
      const fd = new FormData();
      fd.append('title', formData.title.trim()); fd.append('content', formData.content.trim());
      fd.append('category_id', parseInt(formData.category_id)); fd.append('section_id', parseInt(formData.section_id));
      fd.append('science_section', formData.science_section); fd.append('status', formData.status || 'draft');
      if (formData.image) fd.append('image', formData.image);
      if (formData.video) fd.append('video', formData.video);
      fd.append('remove_image', formData.remove_image); fd.append('remove_video', formData.remove_video);
      if (isAdmin && formData.author_name.trim()) fd.append('author_name', formData.author_name.trim());

      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `${apiUrl}/api/science-articles/${formData.id}` : `${apiUrl}/api/science-articles/`;
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Échec de l\'opération');

      const normalized = { ...data, image_url: data.image_url && !data.image_url.startsWith('http') ? `${apiUrl}${data.image_url.startsWith('/') ? data.image_url : `/${data.image_url}`}` : data.image_url || FALLBACK_IMAGE };
      isEditing ? setScienceArticles(p => p.map(i => i.id === formData.id ? normalized : i)) : setScienceArticles(p => [...p, normalized]);
      setSuccessMessage(isEditing ? 'Article mis à jour !' : 'Article créé avec succès !');
      resetForm();
    } catch (e) { setErrorMessage(e.message || 'Échec de l\'opération.'); }
    finally { setIsSubmitting(false); }
  };

  const Chevron = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
  const sciSectionLabel = (val) => SCIENCE_SECTIONS.find(s => s.value === val)?.label || val;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom d&apos;utilisateur</label>
              <input type="text" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Connexion</button>
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
          <h3 className="text-xl font-bold text-gray-800 mb-1">Gestion des Articles Scientifiques</h3>
          <p className="text-sm text-gray-500">Gérez les articles scientifiques et leurs sections</p>
        </div>
        {!showForm ? (
          <button onClick={() => { resetForm(); setShowForm(true); }}
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

      {/* ── Success message ── */}
      {successMessage && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} /> {successMessage}
        </div>
      )}

      {/* ── Form ── */}
      {showForm && (
        <div className="sci-form-shell">
          <div className="sci-form-title">
            <span />
            {isEditing ? 'Modifier l\'Article Scientifique' : 'Ajouter un Article Scientifique'}
          </div>

          {errorMessage && (
            <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: '0.85rem' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Informations */}
            <p className="sci-section-label">Informations générales</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label className="sci-static-label">Titre *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="sci-input" placeholder="Entrez le titre" required />
              </div>
              <div>
                <label className="sci-static-label">Catégorie *</label>
                <div className="sci-select-wrap">
                  <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="sci-select" required>
                    <option value="">Sélectionner…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="sci-static-label">Section *</label>
                <div className="sci-select-wrap">
                  <select value={formData.section_id} onChange={e => setFormData({ ...formData, section_id: e.target.value })} className="sci-select" required>
                    <option value="">Sélectionner…</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="sci-static-label">Section Scientifique *</label>
                <div className="sci-select-wrap">
                  <select value={formData.science_section} onChange={e => setFormData({ ...formData, science_section: e.target.value })} className="sci-select" required>
                    {SCIENCE_SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="sci-static-label">Statut *</label>
                <div className="sci-select-wrap">
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="sci-select" required>
                    <option value="draft">Brouillon</option>
                    <option value="pending">En attente</option>
                    <option value="published">Publié</option>
                  </select>
                  <Chevron />
                </div>
              </div>
              {isAdmin && (
                <div>
                  <label className="sci-static-label">Nom de l&apos;auteur (optionnel)</label>
                  <input type="text" value={formData.author_name} onChange={e => setFormData({ ...formData, author_name: e.target.value })} className="sci-input" placeholder="Nom de l'auteur" />
                </div>
              )}
            </div>

            <hr className="sci-divider" />

            {/* Contenu */}
            <p className="sci-section-label">Contenu *</p>
            <div className="sci-editor-wrap">
              <Editor
                apiKey="flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5"
                value={formData.content}
                onEditorChange={content => setFormData(p => ({ ...p, content }))}
                init={{
                  height: 400, menubar: true,
                  plugins: ['anchor','autolink','charmap','codesample','emoticons','image','link','lists','media','searchreplace','table','visualblocks','wordcount'],
                  toolbar: 'undo redo | blocks | bold italic underline strikethrough | link image media table | numlist bullist indent outdent | emoticons charmap | removeformat',
                  file_picker_callback: filePickerCallback, file_picker_types: 'image media',
                  content_style: 'body { font-size: 14px; }',
                  skin: 'oxide-dark', content_css: 'dark',
                  placeholder: "Contenu de l'article scientifique",
                }}
              />
            </div>

            <hr className="sci-divider" />

            {/* Médias */}
            <p className="sci-section-label">Médias</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label className="sci-static-label">Image (optionnel)</label>
                <div className="sci-dropzone">
                  <Upload size={26} style={{ opacity: 0.35 }} />
                  <span>{formData.image ? formData.image.name : 'Cliquer pour choisir une image'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>PNG, JPG, GIF</span>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif" onChange={e => handleFileChange(e, 'image')} />
                </div>
                {imagePreview && (
                  <div className="sci-media-preview" style={{ position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Aperçu" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, image: null, remove_image: true })); setImagePreview(null); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="sci-static-label">Vidéo (optionnel)</label>
                <div className="sci-dropzone">
                  <Upload size={26} style={{ opacity: 0.35 }} />
                  <span>{formData.video ? formData.video.name : 'Cliquer pour choisir une vidéo'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>MP4, MOV, AVI</span>
                  <input type="file" accept="video/mp4,video/mov,video/avi" onChange={e => handleFileChange(e, 'video')} />
                </div>
                {videoPreview && (
                  <div className="sci-media-preview" style={{ position: 'relative' }}>
                    <video src={videoPreview} controls style={{ width: '100%', display: 'block' }} />
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, video: null, remove_video: true })); setVideoPreview(null); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <hr className="sci-divider" />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={resetForm} className="sci-btn-cancel">
                <X size={16} /> Annuler
              </button>
              <button type="submit" disabled={isSubmitting} className="sci-btn-submit">
                {isSubmitting
                  ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Envoi…</>
                  : <><Check size={16} /> {isEditing ? 'Mettre à jour' : 'Créer l\'article'}</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── List ── */}
      <div className="sci-list-shell">
        {/* Header */}
        <div className="sci-list-header" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div className="sci-search-wrap" style={{ flex: 1 }}>
            <svg className="sci-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Rechercher par titre, section, statut, auteur…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} className="sci-search-input" />
          </div>
          <button onClick={() => fetchData(localStorage.getItem('token'))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s' }}>
            <RefreshCw size={14} /> Rafraîchir
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.3)' }}>
            <RefreshCw style={{ width: 36, height: 36, color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <p>Chargement…</p>
          </div>
        ) : filteredData().length > 0 ? (
          <div className="sci-overflow">
            <table className="sci-table">
              <thead>
                <tr>
                  {['Aperçu', 'Titre', 'Catégorie', 'Section Scientifique', 'Auteur', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData().map(item => (
                  <tr key={item.id}>
                    {/* Thumb */}
                    <td>
                      <div className="sci-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={e => handleImageError(e, item.id)} />
                        <div className="default-icon" style={{ display: 'none', position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                          <Play size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        </div>
                      </div>
                    </td>
                    {/* Titre */}
                    <td>
                      <Link href={`/science-articles/${item.id}`} style={{ color: '#93c5fd', textDecoration: 'none' }} className="sci-title-text">
                        {item.title || 'Sans titre'}
                      </Link>
                    </td>
                    {/* Catégorie */}
                    <td><span className="sci-sub-text">{item.category?.name || 'N/A'}</span></td>
                    {/* Section scientifique */}
                    <td><span className="sci-section-pill"><FlaskConical size={10} />{sciSectionLabel(item.science_section)}</span></td>
                    {/* Auteur */}
                    <td><span className="sci-sub-text">{item.author_name || 'N/A'}</span></td>
                    {/* Statut */}
                    <td>
                      {(() => {
                        const s = item.status;
                        const cls = s === 'published' ? 'sci-badge sci-badge-published' : s === 'pending' ? 'sci-badge sci-badge-pending' : 'sci-badge sci-badge-draft';
                        const icon = s === 'published' ? <Check size={11} /> : s === 'pending' ? <Clock size={11} /> : <FileText size={11} />;
                        return <span className={cls}>{icon}{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
                      })()}
                    </td>
                    {/* Date */}
                    <td>{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(item)} className="sci-action-btn edit" title="Modifier"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(item.id)} className="sci-action-btn del" title="Supprimer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sci-empty">
            <FilePlus style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.2 }} />
            <p>Aucun article trouvé</p>
            <p style={{ fontSize: '0.8rem', marginTop: 4, opacity: 0.6 }}>
              {searchQuery ? 'Aucun résultat pour la recherche actuelle.' : 'Ajoutez un article scientifique en cliquant sur le bouton ci-dessus.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles4;