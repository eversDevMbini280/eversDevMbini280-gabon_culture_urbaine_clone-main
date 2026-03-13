'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Music as MusicIcon, Upload, X, Check, Clock, FileText, RefreshCw, FilePlus, Play } from 'lucide-react';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

/* ─── styles ─── */
const styles = `
  /* ══ FORM ══ */
  .cu-form-shell {
    background: #0f0f13;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 40px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
    margin-bottom: 32px;
  }
  .cu-form-shell::before {
    content:''; position:absolute; top:-120px; right:-120px;
    width:360px; height:360px;
    background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%);
    pointer-events:none;
  }
  .cu-form-shell::after {
    content:''; position:absolute; bottom:-80px; left:-80px;
    width:280px; height:280px;
    background:radial-gradient(circle,rgba(99,102,241,0.10) 0%,transparent 70%);
    pointer-events:none;
  }
  .cu-form-title {
    font-size:1.6rem; font-weight:800; color:#fff;
    letter-spacing:-0.03em; margin-bottom:36px;
    display:flex; align-items:center; gap:12px;
  }
  .cu-form-title span {
    display:inline-block; width:6px; height:28px;
    background:linear-gradient(to bottom,#3b82f6,#6366f1);
    border-radius:3px;
  }
  .cu-section-label {
    font-size:0.65rem; font-weight:700; letter-spacing:0.15em;
    text-transform:uppercase; color:#3b82f6;
    margin-bottom:16px; padding-bottom:8px;
    border-bottom:1px solid rgba(59,130,246,0.2);
  }
  .cu-static-label {
    display:block; font-size:0.72rem; font-weight:600;
    color:rgba(255,255,255,0.4); letter-spacing:0.06em;
    text-transform:uppercase; margin-bottom:8px;
  }
  .cu-input, .cu-select, .cu-textarea {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:14px 16px;
    font-size:0.875rem; font-family:inherit; color:#f0f0f5;
    outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
    appearance:none; -webkit-appearance:none;
  }
  .cu-input::placeholder,.cu-textarea::placeholder{color:rgba(255,255,255,0.25);}
  .cu-input:focus,.cu-select:focus,.cu-textarea:focus {
    border-color:rgba(59,130,246,0.6);
    background:rgba(59,130,246,0.06);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .cu-select option{background:#1a1a24;color:#f0f0f5;}
  .cu-select-wrap{position:relative;}
  .cu-select-wrap svg{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:16px;height:16px;pointer-events:none;color:rgba(255,255,255,0.3);}
  .cu-dropzone {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:8px; padding:24px;
    border:2px dashed rgba(255,255,255,0.1); border-radius:12px;
    cursor:pointer; transition:all 0.2s;
    background:rgba(255,255,255,0.02);
    font-size:0.8rem; color:rgba(255,255,255,0.3);
    position:relative;
  }
  .cu-dropzone:hover{border-color:rgba(59,130,246,0.4);background:rgba(59,130,246,0.04);color:rgba(255,255,255,0.6);}
  .cu-dropzone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
  .cu-media-preview{margin-top:12px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);max-width:240px;}
  .cu-audio-preview{margin-top:12px;}
  .cu-audio-preview audio{width:100%;max-width:320px;}
  .cu-divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:28px 0;}

  /* Checkbox pills */
  .cu-cb-pill {
    display:inline-flex; align-items:center; gap:8px;
    padding:8px 14px;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
    border-radius:999px; cursor:pointer; transition:all 0.18s;
    font-size:0.8rem; color:rgba(255,255,255,0.55); user-select:none;
  }
  .cu-cb-pill:hover{border-color:rgba(59,130,246,0.4);color:rgba(255,255,255,0.85);background:rgba(59,130,246,0.08);}
  .cu-cb-pill input[type=checkbox]{width:14px;height:14px;accent-color:#3b82f6;cursor:pointer;}
  .cu-cb-pill:has(input:checked){background:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.5);color:#93c5fd;}

  .cu-btn-cancel {
    display:inline-flex;align-items:center;gap:8px;padding:12px 24px;
    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;color:rgba(255,255,255,0.7);
    font-size:0.875rem;font-weight:500;cursor:pointer;transition:all 0.2s;
  }
  .cu-btn-cancel:hover{background:rgba(255,255,255,0.1);color:#fff;}
  .cu-btn-submit {
    display:inline-flex;align-items:center;gap:8px;padding:12px 32px;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    border:none;border-radius:12px;color:#fff;
    font-size:0.875rem;font-weight:700;letter-spacing:0.03em;
    cursor:pointer;transition:all 0.2s;
    box-shadow:0 4px 20px rgba(59,130,246,0.35);
  }
  .cu-btn-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px rgba(59,130,246,0.5);}
  .cu-btn-submit:disabled{opacity:0.5;cursor:not-allowed;}
  .cu-editor-wrap .tox-tinymce{border-radius:12px!important;border-color:rgba(255,255,255,0.1)!important;overflow:hidden;}

  /* ══ LIST ══ */
  .cu-list-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; overflow:hidden;
    box-shadow:0 40px 80px rgba(0,0,0,0.5);
    margin-bottom:32px; position:relative;
  }
  .cu-list-shell::before{
    content:'';position:absolute;top:-100px;right:-100px;
    width:300px;height:300px;
    background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%);
    pointer-events:none;z-index:0;
  }
  .cu-list-header{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);position:relative;z-index:1;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
  .cu-search-wrap{position:relative;flex:1;}
  .cu-search-input{
    width:100%;max-width:360px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;padding:11px 16px 11px 40px;
    font-size:0.875rem;font-family:inherit;color:#f0f0f5;
    outline:none;transition:border-color 0.2s,box-shadow 0.2s;
  }
  .cu-search-input::placeholder{color:rgba(255,255,255,0.25);}
  .cu-search-input:focus{border-color:rgba(59,130,246,0.5);box-shadow:0 0 0 3px rgba(59,130,246,0.10);}
  .cu-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:rgba(255,255,255,0.25);pointer-events:none;}

  /* Filter pills */
  .cu-filter-row{padding:14px 24px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;flex-wrap:wrap;gap:8px;position:relative;z-index:1;}
  .cu-filter-btn{padding:6px 14px;border-radius:999px;font-size:0.78rem;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);transition:all 0.15s;}
  .cu-filter-btn:hover{color:rgba(255,255,255,0.7);border-color:rgba(255,255,255,0.2);}
  .cu-filter-btn.active{background:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.4);color:#93c5fd;}

  .cu-table{width:100%;border-collapse:collapse;position:relative;z-index:1;}
  .cu-table thead tr{border-bottom:1px solid rgba(255,255,255,0.06);}
  .cu-table thead th{padding:12px 20px;text-align:left;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.25);}
  .cu-table tbody tr{border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;}
  .cu-table tbody tr:last-child{border-bottom:none;}
  .cu-table tbody tr:hover{background:rgba(255,255,255,0.03);}
  .cu-table td{padding:14px 20px;font-size:0.85rem;color:rgba(255,255,255,0.65);vertical-align:middle;}
  .cu-title-text{font-size:0.875rem;font-weight:500;color:#f0f0f5;}
  .cu-sub-text{font-size:0.75rem;color:rgba(255,255,255,0.3);}
  .cu-thumb{width:56px;height:44px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;position:relative;}

  /* Tags */
  .cu-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:0.68rem;font-weight:600;background:rgba(99,102,241,0.12);color:#a5b4fc;border:1px solid rgba(99,102,241,0.2);margin:2px;}

  /* Media indicators */
  .cu-media-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:4px;font-size:0.68rem;font-weight:700;margin:2px;}
  .cu-media-img{background:rgba(59,130,246,0.12);color:#93c5fd;}
  .cu-media-vid{background:rgba(34,197,94,0.12);color:#4ade80;}
  .cu-media-aud{background:rgba(168,85,247,0.12);color:#d8b4fe;}

  /* Badges */
  .cu-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:0.72rem;font-weight:600;border:1px solid;}
  .cu-badge-published{background:rgba(34,197,94,0.12);color:#4ade80;border-color:rgba(34,197,94,0.25);}
  .cu-badge-draft{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);border-color:rgba(255,255,255,0.1);}
  .cu-badge-pending{background:rgba(234,179,8,0.12);color:#facc15;border-color:rgba(234,179,8,0.25);}

  /* Action btns */
  .cu-action-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.15s;color:rgba(255,255,255,0.4);}
  .cu-action-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}
  .cu-action-btn.edit:hover{background:rgba(99,102,241,0.15);color:#a5b4fc;border-color:rgba(99,102,241,0.35);}
  .cu-action-btn.del:hover{background:rgba(239,68,68,0.15);color:#fca5a5;border-color:rgba(239,68,68,0.35);}

  .cu-empty{padding:60px 24px;text-align:center;color:rgba(255,255,255,0.2);}
  .cu-overflow{overflow-x:auto;}
`;

const LABELS = [
  { key: 'Lmusic', label: 'Musique' },
  { key: 'Ldance', label: 'Danse' },
  { key: 'Lafrotcham', label: 'Afrotcham' },
  { key: 'Lrap', label: 'Rap' },
];

const CultureUrbaineArticlesDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '', content: '', category_id: '', section_id: '', status: 'draft',
    author_name: '', Lmusic: false, Ldance: false, Lafrotcham: false, Lrap: false,
    image: null, video: null, audio: null,
    remove_image: false, remove_video: false, remove_audio: false,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); }
  }, [success]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      fetchAll();
    }
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [artRes, catRes, secRes] = await Promise.all([
        api.get('/culture_urbaine_articles/'),
        api.get('/api/categories/'),
        api.get('/api/sections/'),
      ]);
      setArticles((artRes.data || []).map(a => ({ ...a, image_url: a.image_url || FALLBACK_IMAGE })));
      setCategories(catRes.data || []);
      setSections(secRes.data || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Échec de la récupération des données');
    } finally { setIsLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', new URLSearchParams({ username: loginData.username, password: loginData.password }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.user_info));
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      setIsAuthenticated(true); fetchAll();
    } catch (e) { setError(e.response?.data?.detail || 'Échec de la connexion'); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) { setFormData(p => ({ ...p, [type]: null })); if (type === 'image') setImagePreview(null); if (type === 'video') setVideoPreview(null); if (type === 'audio') setAudioPreview(null); return; }
    if (type === 'image' && !['image/jpeg','image/png','image/jpg'].includes(file.type)) { setError('PNG ou JPG uniquement.'); return; }
    if (type === 'video' && !['video/mp4','video/webm','video/ogg'].includes(file.type)) { setError('MP4, WebM ou OGG uniquement.'); return; }
    if (type === 'audio' && !['audio/mpeg','audio/mp3','audio/wav','audio/m4a','audio/aac'].includes(file.type)) { setError('MP3, WAV, M4A ou AAC uniquement.'); return; }
    const url = URL.createObjectURL(file);
    if (type === 'video') {
      const v = document.createElement('video'); v.preload = 'metadata';
      v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); setFormData(p => ({ ...p, video: file })); setVideoPreview(url); };
      v.src = url; v.load();
    } else { setFormData(p => ({ ...p, [type]: file })); if (type === 'image') setImagePreview(url); if (type === 'audio') setAudioPreview(url); }
  };

  const filePickerCallback = (callback, _v, meta) => {
    const input = document.createElement('input'); input.type = 'file';
    input.accept = meta.filetype === 'image' ? 'image/jpeg,image/png,image/jpg' : 'video/mp4,video/webm,video/ogg,audio/mpeg,audio/mp3,audio/wav';
    input.onchange = () => {
      const file = input.files[0]; if (!file) return;
      const type = meta.filetype === 'image' ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'video';
      const url = URL.createObjectURL(file);
      setFormData(p => ({ ...p, [type]: file }));
      if (type === 'image') setImagePreview(url);
      if (type === 'video') setVideoPreview(url);
      if (type === 'audio') setAudioPreview(url);
      callback(url, { alt: file.name });
    };
    input.click();
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category_id: '', section_id: '', status: 'draft', author_name: '', Lmusic: false, Ldance: false, Lafrotcham: false, Lrap: false, image: null, video: null, audio: null, remove_image: false, remove_video: false, remove_audio: false });
    setImagePreview(null); setVideoPreview(null); setAudioPreview(null);
    setEditingId(null); setShowForm(false); setError('');
  };

  const handleEdit = (article) => {
    setFormData({ title: article.title || '', content: article.content || '', category_id: article.category_id || '', section_id: article.section_id || '', status: article.status || 'draft', author_name: article.author_name || '', Lmusic: article.Lmusic || false, Ldance: article.Ldance || false, Lafrotcham: article.Lafrotcham || false, Lrap: article.Lrap || false, image: null, video: null, audio: null, remove_image: false, remove_video: false, remove_audio: false });
    setImagePreview(article.image_url !== FALLBACK_IMAGE ? article.image_url : null);
    setVideoPreview(article.video_url || null);
    setAudioPreview(article.audio_url || null);
    setEditingId(article.id); setShowForm(true); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return;
    try {
      await api.delete(`/culture_urbaine_articles/${id}`);
      setArticles(p => p.filter(a => a.id !== id));
      setSuccess('Article supprimé avec succès.');
    } catch (e) { setError(e.response?.data?.detail || 'Échec de la suppression.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true); setError('');
    try {
      const form = new FormData();
      form.append('title', formData.title); form.append('content', formData.content);
      form.append('category_id', formData.category_id);
      if (formData.section_id) form.append('section_id', formData.section_id);
      form.append('status', formData.status);
      if (formData.author_name) form.append('author_name', formData.author_name);
      ['Lmusic','Ldance','Lafrotcham','Lrap'].forEach(k => form.append(k, formData[k]));
      if (formData.image) form.append('image', formData.image);
      if (formData.video) form.append('video', formData.video);
      if (formData.audio) form.append('audio', formData.audio);
      if (editingId) { form.append('remove_image', formData.remove_image); form.append('remove_video', formData.remove_video); form.append('remove_audio', formData.remove_audio); }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      let res;
      if (editingId) { res = await api.put(`/culture_urbaine_articles/${editingId}`, form, config); }
      else { res = await api.post('/culture_urbaine_articles/', form, config); }

      const normalized = { ...res.data, image_url: res.data.image_url || FALLBACK_IMAGE };
      editingId ? setArticles(p => p.map(a => a.id === editingId ? normalized : a)) : setArticles(p => [...p, normalized]);
      setSuccess(editingId ? 'Article mis à jour !' : 'Article créé avec succès !');
      resetForm();
    } catch (e) { setError(e.response?.data?.detail || 'Échec de l\'enregistrement.'); }
    finally { setIsSubmitting(false); }
  };

  const filteredArticles = articles.filter(a => {
    const matchSearch = !searchQuery || a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || a.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.author_username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'all' || (activeFilter === 'musique' && a.Lmusic) || (activeFilter === 'danse' && a.Ldance) || (activeFilter === 'afrotcham' && a.Lafrotcham) || (activeFilter === 'rap' && a.Lrap);
    return matchSearch && matchFilter;
  });

  const Chevron = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

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
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Se connecter</button>
          </form>
          {error && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">{error}</div>}
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
          <h3 className="text-xl font-bold text-gray-800 mb-1">Articles Culture Urbaine</h3>
          <p className="text-sm text-gray-500">Gérez les articles de culture urbaine (musique, danse, rap, afrotcham)</p>
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

      {/* ── Success/Error global ── */}
      {success && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} /> {success}
        </div>
      )}

      {/* ══ FORM ══ */}
      {showForm && (
        <div className="cu-form-shell">
          <div className="cu-form-title">
            <span />
            {editingId ? "Modifier l'article" : 'Ajouter un article Culture Urbaine'}
          </div>

          {error && (
            <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Infos générales */}
            <p className="cu-section-label">Informations générales</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label className="cu-static-label">Titre *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="cu-input" placeholder="Entrez le titre" required />
              </div>
              <div>
                <label className="cu-static-label">Catégorie *</label>
                <div className="cu-select-wrap">
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="cu-select" required>
                    <option value="">Sélectionner…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="cu-static-label">Section (optionnel)</label>
                <div className="cu-select-wrap">
                  <select name="section_id" value={formData.section_id} onChange={handleInputChange} className="cu-select">
                    <option value="">Aucune</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="cu-static-label">Statut *</label>
                <div className="cu-select-wrap">
                  <select name="status" value={formData.status} onChange={handleInputChange} className="cu-select" required>
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="pending">En attente</option>
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="cu-static-label">Nom de l&apos;auteur (optionnel)</label>
                <input type="text" name="author_name" value={formData.author_name} onChange={handleInputChange} className="cu-input" placeholder="Laissez vide pour le nom d'utilisateur" />
              </div>
            </div>

            <hr className="cu-divider" />

            {/* Étiquettes */}
            <p className="cu-section-label">Étiquettes</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {LABELS.map(({ key, label }) => (
                <label key={key} className="cu-cb-pill">
                  <input type="checkbox" name={key} checked={formData[key]} onChange={handleInputChange} />
                  {label}
                </label>
              ))}
            </div>

            <hr className="cu-divider" />

            {/* Contenu */}
            <p className="cu-section-label">Contenu *</p>
            <div className="cu-editor-wrap">
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

            <hr className="cu-divider" />

            {/* Médias */}
            <p className="cu-section-label">Médias</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {/* Image */}
              <div>
                <label className="cu-static-label">Image (optionnel)</label>
                <div className="cu-dropzone">
                  <Upload size={24} style={{ opacity: 0.35 }} />
                  <span>{formData.image ? formData.image.name : 'Choisir une image'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>PNG, JPG</span>
                  <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={e => handleFileChange(e, 'image')} />
                </div>
                {imagePreview && (
                  <div className="cu-media-preview" style={{ position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Aperçu" style={{ width: '100%', display: 'block' }} />
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, image: null, remove_image: true })); setImagePreview(null); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              {/* Vidéo */}
              <div>
                <label className="cu-static-label">Vidéo (optionnel)</label>
                <div className="cu-dropzone">
                  <Upload size={24} style={{ opacity: 0.35 }} />
                  <span>{formData.video ? formData.video.name : 'Choisir une vidéo'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>MP4, WebM, OGG</span>
                  <input type="file" accept="video/mp4,video/webm,video/ogg" onChange={e => handleFileChange(e, 'video')} />
                </div>
                {videoPreview && (
                  <div className="cu-media-preview" style={{ position: 'relative' }}>
                    <video src={videoPreview} controls style={{ width: '100%', display: 'block' }} />
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, video: null, remove_video: true })); setVideoPreview(null); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              {/* Audio */}
              <div>
                <label className="cu-static-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MusicIcon size={12} /> Audio (optionnel)
                </label>
                <div className="cu-dropzone">
                  <MusicIcon size={24} style={{ opacity: 0.35 }} />
                  <span>{formData.audio ? formData.audio.name : 'Choisir un fichier audio'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>MP3, WAV, M4A, AAC</span>
                  <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/aac" onChange={e => handleFileChange(e, 'audio')} />
                </div>
                {audioPreview && (
                  <div className="cu-audio-preview" style={{ position: 'relative' }}>
                    <audio src={audioPreview} controls style={{ width: '100%', maxWidth: 320 }} />
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, audio: null, remove_audio: true })); setAudioPreview(null); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.78rem' }}>
                      <X size={12} /> Supprimer l&apos;audio
                    </button>
                  </div>
                )}
              </div>
            </div>

            <hr className="cu-divider" />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={resetForm} className="cu-btn-cancel">
                <X size={16} /> Annuler
              </button>
              <button type="submit" disabled={isSubmitting} className="cu-btn-submit">
                {isSubmitting
                  ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Envoi…</>
                  : <><Check size={16} /> {editingId ? "Mettre à jour" : "Créer l'article"}</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══ LIST ══ */}
      <div className="cu-list-shell">
        {/* Header */}
        <div className="cu-list-header">
          <div className="cu-search-wrap">
            <svg className="cu-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Rechercher titre, auteur…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} className="cu-search-input" />
          </div>
          <button onClick={fetchAll}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Rafraîchir
          </button>
        </div>

        {/* Filter pills */}
        <div className="cu-filter-row">
          {[['all','Tous'],['musique','Musique'],['danse','Danse'],['afrotcham','Afrotcham'],['rap','Rap']].map(([key, label]) => (
            <button key={key} className={`cu-filter-btn${activeFilter === key ? ' active' : ''}`} onClick={() => setActiveFilter(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.3)' }}>
            <RefreshCw style={{ width: 36, height: 36, color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <p>Chargement…</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="cu-overflow">
            <table className="cu-table">
              <thead>
                <tr>
                  {['Aperçu', 'Titre', 'Auteur', 'Statut', 'Médias', 'Étiquettes', 'Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map(article => (
                  <tr key={article.id}>
                    {/* Thumb */}
                    <td>
                      <div className="cu-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={article.image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={e => { e.target.style.display = 'none'; }} />
                      </div>
                    </td>
                    {/* Titre */}
                    <td><span className="cu-title-text">{article.title}</span></td>
                    {/* Auteur */}
                    <td><span className="cu-sub-text">{article.author_name || article.author_username || 'N/A'}</span></td>
                    {/* Statut */}
                    <td>
                      {(() => {
                        const s = article.status;
                        const cls = s === 'published' ? 'cu-badge cu-badge-published' : s === 'pending' ? 'cu-badge cu-badge-pending' : 'cu-badge cu-badge-draft';
                        const icon = s === 'published' ? <Check size={11} /> : s === 'pending' ? <Clock size={11} /> : <FileText size={11} />;
                        return <span className={cls}>{icon}{s === 'published' ? 'Publié' : s === 'pending' ? 'En attente' : 'Brouillon'}</span>;
                      })()}
                    </td>
                    {/* Médias */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {article.image_url && article.image_url !== FALLBACK_IMAGE && <span className="cu-media-tag cu-media-img">IMG</span>}
                        {article.video_url && <span className="cu-media-tag cu-media-vid">VID</span>}
                        {article.audio_url && <span className="cu-media-tag cu-media-aud"><MusicIcon size={10} /> AUD</span>}
                      </div>
                    </td>
                    {/* Étiquettes */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {LABELS.filter(({ key }) => article[key]).map(({ key, label }) => (
                          <span key={key} className="cu-tag">{label}</span>
                        ))}
                      </div>
                    </td>
                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(article)} className="cu-action-btn edit" title="Modifier"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(article.id)} className="cu-action-btn del" title="Supprimer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cu-empty">
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

export default CultureUrbaineArticlesDashboard;
