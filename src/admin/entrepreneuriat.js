'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Edit, Trash2, RefreshCw, FilePlus, Upload, X, Play, Check, Clock } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/* ─── shared dark styles ─── */
const styles = `
  /* ══ FORM ══ */
  .ent-form-shell {
    background: #0f0f13;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 40px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
    margin-bottom: 32px;
  }
  .ent-form-shell::before {
    content:''; position:absolute; top:-120px; right:-120px;
    width:360px; height:360px;
    background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%);
    pointer-events:none;
  }
  .ent-form-shell::after {
    content:''; position:absolute; bottom:-80px; left:-80px;
    width:280px; height:280px;
    background:radial-gradient(circle,rgba(99,102,241,0.10) 0%,transparent 70%);
    pointer-events:none;
  }
  .ent-form-title {
    font-size:1.6rem; font-weight:800; color:#fff;
    letter-spacing:-0.03em; margin-bottom:36px;
    display:flex; align-items:center; gap:12px;
  }
  .ent-form-title span {
    display:inline-block; width:6px; height:28px;
    background:linear-gradient(to bottom,#3b82f6,#6366f1);
    border-radius:3px;
  }
  .ent-section-label {
    font-size:0.65rem; font-weight:700; letter-spacing:0.15em;
    text-transform:uppercase; color:#3b82f6;
    margin-bottom:16px; padding-bottom:8px;
    border-bottom:1px solid rgba(59,130,246,0.2);
  }
  .ent-static-label {
    display:block; font-size:0.72rem; font-weight:600;
    color:rgba(255,255,255,0.4); letter-spacing:0.06em;
    text-transform:uppercase; margin-bottom:8px;
  }
  .ent-input, .ent-select, .ent-textarea {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:14px 16px;
    font-size:0.875rem; font-family:inherit; color:#f0f0f5;
    outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
    appearance:none; -webkit-appearance:none;
  }
  .ent-input::placeholder,.ent-textarea::placeholder{color:rgba(255,255,255,0.25);}
  .ent-input:focus,.ent-select:focus,.ent-textarea:focus {
    border-color:rgba(59,130,246,0.6);
    background:rgba(59,130,246,0.06);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .ent-select option{background:#1a1a24;color:#f0f0f5;}
  .ent-textarea{resize:vertical;min-height:80px;}
  .ent-select-wrap{position:relative;}
  .ent-select-wrap svg{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:16px;height:16px;pointer-events:none;color:rgba(255,255,255,0.3);}
  .ent-dropzone {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:8px; padding:24px;
    border:2px dashed rgba(255,255,255,0.1); border-radius:12px;
    cursor:pointer; transition:all 0.2s;
    background:rgba(255,255,255,0.02);
    font-size:0.8rem; color:rgba(255,255,255,0.3);
    position:relative;
  }
  .ent-dropzone:hover{border-color:rgba(59,130,246,0.4);background:rgba(59,130,246,0.04);color:rgba(255,255,255,0.6);}
  .ent-dropzone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
  .ent-media-preview{margin-top:12px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);max-width:240px;}
  .ent-divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:28px 0;}
  .ent-btn-cancel {
    display:inline-flex;align-items:center;gap:8px;padding:12px 24px;
    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;color:rgba(255,255,255,0.7);
    font-size:0.875rem;font-weight:500;cursor:pointer;transition:all 0.2s;
  }
  .ent-btn-cancel:hover{background:rgba(255,255,255,0.1);color:#fff;}
  .ent-btn-submit {
    display:inline-flex;align-items:center;gap:8px;padding:12px 32px;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    border:none;border-radius:12px;color:#fff;
    font-size:0.875rem;font-weight:700;letter-spacing:0.03em;
    cursor:pointer;transition:all 0.2s;
    box-shadow:0 4px 20px rgba(59,130,246,0.35);
  }
  .ent-btn-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px rgba(59,130,246,0.5);}
  .ent-btn-submit:disabled{opacity:0.5;cursor:not-allowed;}
  .ent-editor-wrap .tox-tinymce{border-radius:12px!important;border-color:rgba(255,255,255,0.1)!important;overflow:hidden;}

  /* ══ LIST ══ */
  .ent-list-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; overflow:hidden;
    box-shadow:0 40px 80px rgba(0,0,0,0.5);
    margin-bottom:32px; position:relative;
  }
  .ent-list-shell::before{
    content:'';position:absolute;top:-100px;right:-100px;
    width:300px;height:300px;
    background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%);
    pointer-events:none;z-index:0;
  }

  /* Tabs */
  .ent-tabs{display:flex;border-bottom:1px solid rgba(255,255,255,0.06);position:relative;z-index:1;}
  .ent-tab{
    padding:14px 20px;font-size:0.82rem;font-weight:600;
    color:rgba(255,255,255,0.35);cursor:pointer;
    border-bottom:2px solid transparent;transition:all 0.18s;background:none;border-left:none;border-right:none;border-top:none;
  }
  .ent-tab:hover{color:rgba(255,255,255,0.7);}
  .ent-tab.active{color:#3b82f6;border-bottom-color:#3b82f6;}

  /* Search */
  .ent-search-wrap{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);position:relative;z-index:1;}
  .ent-search-input{
    width:100%;max-width:360px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px;padding:11px 16px 11px 40px;
    font-size:0.875rem;font-family:inherit;color:#f0f0f5;
    outline:none;transition:border-color 0.2s,box-shadow 0.2s;
  }
  .ent-search-input::placeholder{color:rgba(255,255,255,0.25);}
  .ent-search-input:focus{border-color:rgba(59,130,246,0.5);box-shadow:0 0 0 3px rgba(59,130,246,0.10);}
  .ent-search-icon{position:absolute;left:36px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:rgba(255,255,255,0.25);pointer-events:none;}

  /* Table */
  .ent-table{width:100%;border-collapse:collapse;position:relative;z-index:1;}
  .ent-table thead tr{border-bottom:1px solid rgba(255,255,255,0.06);}
  .ent-table thead th{padding:12px 20px;text-align:left;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.25);}
  .ent-table tbody tr{border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;}
  .ent-table tbody tr:last-child{border-bottom:none;}
  .ent-table tbody tr:hover{background:rgba(255,255,255,0.03);}
  .ent-table td{padding:14px 20px;font-size:0.85rem;color:rgba(255,255,255,0.65);vertical-align:middle;}
  .ent-title-text{font-size:0.875rem;font-weight:500;color:#f0f0f5;}
  .ent-sub-text{font-size:0.75rem;color:rgba(255,255,255,0.3);margin-top:2px;}
  .ent-thumb{width:56px;height:44px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;}

  /* Badges */
  .ent-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:0.72rem;font-weight:600;letter-spacing:0.03em;border:1px solid;}
  .ent-badge-published{background:rgba(34,197,94,0.12);color:#4ade80;border-color:rgba(34,197,94,0.25);}
  .ent-badge-draft{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);border-color:rgba(255,255,255,0.1);}
  .ent-badge-processing{background:rgba(234,179,8,0.12);color:#facc15;border-color:rgba(234,179,8,0.25);}

  /* Action btns */
  .ent-action-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.15s;color:rgba(255,255,255,0.4);}
  .ent-action-btn:hover{background:rgba(255,255,255,0.08);color:#fff;border-color:rgba(255,255,255,0.18);}
  .ent-action-btn.edit:hover{background:rgba(99,102,241,0.15);color:#a5b4fc;border-color:rgba(99,102,241,0.35);}
  .ent-action-btn.del:hover{background:rgba(239,68,68,0.15);color:#fca5a5;border-color:rgba(239,68,68,0.35);}

  /* Empty */
  .ent-empty{padding:60px 24px;text-align:center;color:rgba(255,255,255,0.2);}
  .ent-overflow{overflow-x:auto;}
`;

const Articles3 = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' }) => {
  const [successStories, setSuccessStories] = useState([]);
  const [resources, setResources] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('success-stories');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null, title: '', content: '', category_id: '', section_id: '',
    status: 'draft', image: null, video: null,
    remove_image: false, remove_video: false, author_name: '',
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
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const fetchData = useCallback(async (token) => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
      const safeJson = async (res) => { if (!res.ok) return []; const d = await res.json().catch(() => []); return Array.isArray(d) ? d : []; };
      const [storiesRes, resourcesRes, programmesRes, catsRes, secsRes] = await Promise.all([
        fetch(`${apiUrl}/api/success-stories/?section_id=25`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/resources/?section_id=26`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/programmes/?section_id=27`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/categories/`, { cache: 'no-store', headers }),
        fetch(`${apiUrl}/api/sections/`, { cache: 'no-store', headers }),
      ]);
      let [storiesData, resourcesData, programmesData, catsData, secsData] = await Promise.all([
        safeJson(storiesRes), safeJson(resourcesRes), safeJson(programmesRes), safeJson(catsRes), safeJson(secsRes),
      ]);
      if (!catsData.length) catsData = await fetch(`${apiUrl}/api/categories/`, { cache: 'no-store' }).then(safeJson).catch(() => []);
      if (!secsData.length) secsData = await fetch(`${apiUrl}/api/sections/`, { cache: 'no-store' }).then(safeJson).catch(() => []);

      const normalizeImg = (item) => ({
        ...item,
        image_url: item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('//')
          ? `${apiUrl}${item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}`
          : item.image_url || FALLBACK_IMAGE,
      });
      setSuccessStories(storiesData.map(normalizeImg));
      setResources(resourcesData.map(normalizeImg));
      setProgrammes(programmesData.map(normalizeImg));
      setCategories(catsData);
      setSections(secsData);
    } catch (e) {
      setErrorMessage(e.message || 'Échec de la récupération des données.');
    } finally {
      setIsLoading(false);
    }
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
      setIsAuthenticated(true);
      fetchData(data.access_token);
    } catch (e) { setErrorMessage(e.message || 'Échec de la connexion.'); }
  };

  const currentData = () => {
    const data = activeTab === 'success-stories' ? successStories : activeTab === 'resources' ? resources : programmes;
    return data.filter(item =>
      (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       new Date(item.created_at).toLocaleDateString('fr-FR').includes(searchQuery.toLowerCase())) &&
      item.status !== 'archived'
    );
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) { setFormData(p => ({ ...p, [type]: null, [`remove_${type}`]: true })); if (type === 'image') setImagePreview(null); if (type === 'video') setVideoPreview(null); return; }
    if (type === 'image' && !['image/png','image/jpeg','image/jpg','image/gif'].includes(file.type)) { setErrorMessage('PNG, JPG ou GIF uniquement.'); return; }
    if (type === 'video' && !['video/mp4','video/webm'].includes(file.type)) { setErrorMessage('MP4 ou WebM uniquement.'); return; }
    const url = URL.createObjectURL(file);
    setFormData(p => ({ ...p, [type]: file, [`remove_${type}`]: false }));
    if (type === 'image') setImagePreview(url);
    if (type === 'video') { const v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); setVideoPreview(url); }; v.src = url; v.load(); }
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
    input.accept = meta.filetype === 'image' ? 'image/png,image/jpeg,image/jpg,image/gif' : 'video/mp4,video/webm';
    input.onchange = () => {
      const file = input.files[0]; if (!file) return;
      const type = meta.filetype === 'image' ? 'image' : 'video';
      const url = URL.createObjectURL(file);
      setFormData(p => ({ ...p, [type]: file, [`remove_${type}`]: false }));
      if (type === 'image') setImagePreview(url);
      if (type === 'video') setVideoPreview(url);
      callback(url, { alt: file.name });
    };
    input.click();
  };

  const getSection = () => sections.find(s => s.slug === (activeTab === 'success-stories' ? 'success-stories' : activeTab === 'resources' ? 'resources' : 'programmes-de-soutien'));
  const getDefaultCategoryId = () => activeTab === 'success-stories' ? 32 : activeTab === 'resources' ? 35 : 37;

  const resetForm = () => {
    setFormData({ id: null, title: '', content: '', category_id: getDefaultCategoryId(), section_id: getSection()?.id || '', status: 'draft', image: null, video: null, remove_image: false, remove_video: false, author_name: '' });
    setImagePreview(null); setVideoPreview(null); setIsEditing(false); setShowForm(false); setErrorMessage('');
  };

  const handleEdit = (item) => {
    setFormData({ id: item.id, title: item.title || '', content: item.content || '', category_id: item.category_id || '', section_id: getSection()?.id || '', status: item.status || 'draft', image: null, video: null, remove_image: false, remove_video: false, author_name: item.author_name || '' });
    setImagePreview(item.image_url || null);
    setVideoPreview(item.video_url || null);
    setIsEditing(true); setShowForm(true); setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'success-stories' ? '/success-stories/' : activeTab === 'resources' ? '/resources/' : '/programmes/';
      const res = await fetch(`${apiUrl}/api${endpoint}${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Échec de la suppression'); }
      if (activeTab === 'success-stories') setSuccessStories(p => p.filter(i => i.id !== id));
      else if (activeTab === 'resources') setResources(p => p.filter(i => i.id !== id));
      else setProgrammes(p => p.filter(i => i.id !== id));
      setSuccessMessage('Élément supprimé avec succès.');
    } catch (e) { setErrorMessage(e.message || 'Échec de la suppression.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!formData.title.trim() || !formData.content.trim() || !formData.category_id || !formData.section_id)
        throw new Error('Veuillez remplir tous les champs obligatoires');
      const fd = new FormData();
      fd.append('title', formData.title.trim()); fd.append('content', formData.content.trim());
      fd.append('category_id', parseInt(formData.category_id)); fd.append('section_id', parseInt(formData.section_id));
      fd.append('status', formData.status || 'draft');
      if (formData.image) fd.append('image', formData.image);
      if (formData.video) fd.append('video', formData.video);
      fd.append('remove_image', formData.remove_image); fd.append('remove_video', formData.remove_video);
      if (isAdmin && formData.author_name.trim()) fd.append('author_name', formData.author_name.trim());

      const endpoint = activeTab === 'success-stories' ? '/success-stories/' : activeTab === 'resources' ? '/resources/' : '/programmes/';
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `${apiUrl}/api${endpoint}${formData.id}` : `${apiUrl}/api${endpoint}`;
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Échec de l\'opération');

      const normalized = { ...data, image_url: data.image_url && !data.image_url.startsWith('http') ? `${apiUrl}${data.image_url.startsWith('/') ? data.image_url : `/${data.image_url}`}` : data.image_url || FALLBACK_IMAGE };
      if (activeTab === 'success-stories') isEditing ? setSuccessStories(p => p.map(i => i.id === formData.id ? normalized : i)) : setSuccessStories(p => [...p, normalized]);
      else if (activeTab === 'resources') isEditing ? setResources(p => p.map(i => i.id === formData.id ? normalized : i)) : setResources(p => [...p, normalized]);
      else isEditing ? setProgrammes(p => p.map(i => i.id === formData.id ? normalized : i)) : setProgrammes(p => [...p, normalized]);

      setSuccessMessage(isEditing ? 'Élément mis à jour avec succès !' : 'Élément créé avec succès !');
      resetForm();
    } catch (e) { setErrorMessage(e.message || 'Échec de l\'opération.'); }
    finally { setIsSubmitting(false); }
  };

  const tabLabel = activeTab === 'success-stories' ? 'une Histoire de Succès' : activeTab === 'resources' ? 'une Ressource' : 'un Programme';
  const Chevron = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d&apos;utilisateur</label>
              <input type="text" id="username" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input type="password" id="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
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
          <h3 className="text-xl font-bold text-gray-800 mb-1">Gestion de l&apos;Entrepreneuriat</h3>
          <p className="text-sm text-gray-500">Gérez les histoires de succès, ressources et programmes de soutien</p>
        </div>
        {!showForm ? (
          <button onClick={() => { setIsEditing(false); setShowForm(true); setErrorMessage(''); resetForm(); setShowForm(true); }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" /> Ajouter {tabLabel}
          </button>
        ) : (
          <button onClick={resetForm}
            className="inline-flex items-center px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 transition-all shadow-md">
            <X className="w-5 h-5 mr-2" /> Annuler
          </button>
        )}
      </div>

      {/* ── Success ── */}
      {successMessage && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} /> {successMessage}
        </div>
      )}

      {/* ── Form (toggled) ── */}
      {showForm && (
        <div className="ent-form-shell">
          <div className="ent-form-title">
            <span />
            {isEditing ? `Modifier ${tabLabel}` : `Ajouter ${tabLabel}`}
          </div>

          {errorMessage && (
            <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: '0.85rem' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Informations */}
            <p className="ent-section-label">Informations générales</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label className="ent-static-label">Titre *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="ent-input" placeholder="Entrez le titre" required />
              </div>
              <div>
                <label className="ent-static-label">Catégorie *</label>
                <div className="ent-select-wrap">
                  <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="ent-select" required>
                    <option value="">Sélectionner…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="ent-static-label">Section *</label>
                <div className="ent-select-wrap">
                  <select value={formData.section_id} onChange={e => setFormData({ ...formData, section_id: e.target.value })} className="ent-select" required>
                    <option value="">Sélectionner…</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="ent-static-label">Statut *</label>
                <div className="ent-select-wrap">
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="ent-select" required>
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="processing">En traitement</option>
                  </select>
                  <Chevron />
                </div>
              </div>
              {isAdmin && (
                <div>
                  <label className="ent-static-label">Nom de l&apos;auteur (optionnel)</label>
                  <input type="text" value={formData.author_name} onChange={e => setFormData({ ...formData, author_name: e.target.value })} className="ent-input" placeholder="Nom de l'auteur" />
                </div>
              )}
            </div>

            <hr className="ent-divider" />

            {/* Contenu */}
            <p className="ent-section-label">Contenu *</p>
            <div className="ent-editor-wrap">
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
                  placeholder: 'Contenu',
                }}
              />
            </div>

            <hr className="ent-divider" />

            {/* Médias */}
            <p className="ent-section-label">Médias</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label className="ent-static-label">Image (optionnel)</label>
                <div className="ent-dropzone">
                  <Upload size={26} style={{ opacity: 0.35 }} />
                  <span>Cliquer pour choisir une image</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>PNG, JPG, GIF</span>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif" onChange={e => handleFileChange(e, 'image')} />
                </div>
                {imagePreview && (
                  <div className="ent-media-preview" style={{ position: 'relative' }}>
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
                <label className="ent-static-label">Vidéo (optionnel)</label>
                <div className="ent-dropzone">
                  <Upload size={26} style={{ opacity: 0.35 }} />
                  <span>Cliquer pour choisir une vidéo</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>MP4, WebM</span>
                  <input type="file" accept="video/mp4,video/webm" onChange={e => handleFileChange(e, 'video')} />
                </div>
                {videoPreview && (
                  <div className="ent-media-preview" style={{ position: 'relative' }}>
                    <video src={videoPreview} controls style={{ width: '100%', display: 'block' }} />
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, video: null, remove_video: true })); setVideoPreview(null); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <hr className="ent-divider" />

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={resetForm} className="ent-btn-cancel">
                <X size={16} /> Annuler
              </button>
              <button type="submit" disabled={isSubmitting} className="ent-btn-submit">
                {isSubmitting
                  ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Envoi…</>
                  : <><Check size={16} /> {isEditing ? 'Mettre à jour' : 'Créer'}</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── List ── */}
      <div className="ent-list-shell">
        {/* Tabs */}
        <div className="ent-tabs">
          {[
            { id: 'success-stories', label: 'Histoires de Succès' },
            { id: 'resources', label: 'Ressources' },
            { id: 'programmes', label: 'Programmes de Soutien' },
          ].map(t => (
            <button key={t.id} className={`ent-tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
          <button onClick={() => fetchData(localStorage.getItem('token'))}
            style={{ marginLeft: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Rafraîchir
          </button>
        </div>

        {/* Search */}
        <div className="ent-search-wrap" style={{ position: 'relative' }}>
          <svg className="ent-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Rechercher par titre, catégorie, statut, auteur…" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} className="ent-search-input" />
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.3)' }}>
            <RefreshCw style={{ width: 36, height: 36, color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <p>Chargement…</p>
          </div>
        ) : currentData().length > 0 ? (
          <div className="ent-overflow">
            <table className="ent-table">
              <thead>
                <tr>
                  {['Aperçu', 'Titre', 'Catégorie', 'Auteur', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData().map(item => (
                  <tr key={item.id}>
                    {/* Thumb */}
                    <td>
                      <div className="ent-thumb">
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
                      <Link href={`/${activeTab === 'success-stories' ? 'success-stories' : activeTab === 'resources' ? 'resources' : 'programmes'}/${item.id}`}
                        style={{ color: '#93c5fd', textDecoration: 'none' }} className="ent-title-text">
                        {item.title || 'Sans titre'}
                      </Link>
                    </td>
                    {/* Catégorie */}
                    <td><span className="ent-sub-text">{item.category?.name || 'N/A'}</span></td>
                    {/* Auteur */}
                    <td><span className="ent-sub-text">{item.author_name || 'N/A'}</span></td>
                    {/* Statut */}
                    <td>
                      {(() => {
                        const s = item.status;
                        const cls = s === 'published' ? 'ent-badge ent-badge-published' : s === 'processing' ? 'ent-badge ent-badge-processing' : 'ent-badge ent-badge-draft';
                        const icon = s === 'published' ? <Check size={11} /> : s === 'processing' ? <Clock size={11} /> : <FileText size={11} />;
                        return <span className={cls}>{icon}{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
                      })()}
                    </td>
                    {/* Date */}
                    <td>{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(item)} className="ent-action-btn edit" title="Modifier"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(item.id)} className="ent-action-btn del" title="Supprimer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ent-empty">
            <FilePlus style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.2 }} />
            <p>Aucun élément trouvé</p>
            <p style={{ fontSize: '0.8rem', marginTop: 4, opacity: 0.6 }}>
              {searchQuery ? 'Aucun résultat pour la recherche actuelle.' : `Ajoutez ${tabLabel} en cliquant sur le bouton ci-dessus`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles3;
