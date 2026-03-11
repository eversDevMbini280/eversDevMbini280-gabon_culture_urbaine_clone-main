"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Edit, Trash2, RefreshCw, Check, X, Clock, Send } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ─── Design tokens ──────────────────────────────────────────────── */
const formStyles = `
  .form-shell {
    background: #0f0f13;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 40px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
  }

  .form-shell::before {
    content: '';
    position: absolute;
    top: -120px; right: -120px;
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .form-shell::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -80px;
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .form-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
    margin-bottom: 36px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .form-title span {
    display: inline-block;
    width: 6px; height: 28px;
    background: linear-gradient(to bottom, #3b82f6, #2563eb);
    border-radius: 3px;
  }

  /* ── Section label ── */
  .section-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #3b82f6;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(59,130,246,0.2);
  }

  /* ── Field wrapper ── */
  .field-wrap {
    position: relative;
    margin-bottom: 4px;
  }

  /* ── Inputs & Selects ── */
  .form-input,
  .form-select {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 0.875rem;
    font-family: inherit;
    color: #f0f0f5;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    appearance: none;
    -webkit-appearance: none;
  }

  .form-input::placeholder {
    color: rgba(255,255,255,0.25);
  }

  .form-input:focus,
  .form-select:focus {
    border-color: rgba(59,130,246,0.6);
    background: rgba(59,130,246,0.06);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
  }

  .form-select option {
    background: #1a1a24;
    color: #f0f0f5;
  }

  /* ── Floating label ── */
  .float-label {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.875rem;
    color: rgba(255,255,255,0.3);
    pointer-events: none;
    transition: all 0.2s;
    background: transparent;
    padding: 0 4px;
  }

  .form-input:focus ~ .float-label,
  .form-input:not(:placeholder-shown) ~ .float-label {
    top: 0;
    font-size: 0.7rem;
    color: #3b82f6;
    background: #0f0f13;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  /* ── Static label ── */
  .static-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  /* ── Checkbox pill ── */
  .cb-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.18s;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.55);
    user-select: none;
  }

  .cb-pill:hover {
    border-color: rgba(59,130,246,0.4);
    color: rgba(255,255,255,0.85);
    background: rgba(59,130,246,0.08);
  }

  .cb-pill input[type="checkbox"] {
    width: 14px; height: 14px;
    accent-color: #3b82f6;
    cursor: pointer;
  }

  .cb-pill:has(input:checked) {
    background: rgba(59,130,246,0.15);
    border-color: rgba(59,130,246,0.5);
    color: #93c5fd;
  }

  /* ── File input ── */
  .file-input-wrap {
    position: relative;
  }

  .file-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    border: 2px dashed rgba(255,255,255,0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255,255,255,0.02);
    font-size: 0.8rem;
    color: rgba(255,255,255,0.3);
  }

  .file-dropzone:hover {
    border-color: rgba(59,130,246,0.4);
    background: rgba(59,130,246,0.04);
    color: rgba(255,255,255,0.6);
  }

  .file-dropzone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  /* ── Buttons ── */
  .btn-cancel {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: rgba(255,255,255,0.7);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-cancel:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }

  .btn-submit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 32px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(59,130,246,0.35);
  }
  .btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(59,130,246,0.5);
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
  }
  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── Preview images/video ── */
  .media-preview {
    margin-top: 12px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    max-width: 280px;
  }

  /* ── TinyMCE wrapper ── */
  .editor-wrap .tox-tinymce {
    border-radius: 12px !important;
    border-color: rgba(255,255,255,0.1) !important;
    overflow: hidden;
  }

  /* ── Divider ── */
  .form-divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin: 28px 0;
  }

  /* ══ LIST SHELL ══ */
  .list-shell {
    background: #0f0f13;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
    position: relative;
  }

  .list-shell::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* Search bar */
  .list-search-wrap {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    position: relative;
    z-index: 1;
  }

  .list-search-input {
    width: 100%;
    max-width: 360px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 11px 16px 11px 40px;
    font-size: 0.875rem;
    font-family: inherit;
    color: #f0f0f5;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .list-search-input::placeholder { color: rgba(255,255,255,0.25); }
  .list-search-input:focus {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
  }

  .list-search-icon {
    position: absolute;
    left: 36px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px; height: 16px;
    color: rgba(255,255,255,0.25);
    pointer-events: none;
  }

  /* Table */
  .list-table {
    width: 100%;
    border-collapse: collapse;
    position: relative;
    z-index: 1;
  }

  .list-table thead tr {
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .list-table thead th {
    padding: 12px 20px;
    text-align: left;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
  }

  .list-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s;
  }
  .list-table tbody tr:last-child { border-bottom: none; }
  .list-table tbody tr:hover { background: rgba(255,255,255,0.03); }

  .list-table td {
    padding: 14px 20px;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.65);
    vertical-align: middle;
  }

  .list-title-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: #f0f0f5;
  }
  .list-cat-text {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.3);
    margin-top: 2px;
  }

  .list-thumb {
    width: 40px; height: 40px;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    position: relative;
  }

  /* Status badges */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    border: 1px solid;
  }
  .badge-published { background: rgba(34,197,94,0.12); color: #4ade80; border-color: rgba(34,197,94,0.25); }
  .badge-draft     { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); border-color: rgba(255,255,255,0.1); }
  .badge-pending   { background: rgba(234,179,8,0.12); color: #facc15; border-color: rgba(234,179,8,0.25); }

  /* Action buttons */
  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px; height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: all 0.15s;
    color: rgba(255,255,255,0.4);
  }
  .action-btn:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.18); }
  .action-btn.edit:hover  { background: rgba(99,102,241,0.15); color: #a5b4fc; border-color: rgba(99,102,241,0.35); }
  .action-btn.del:hover   { background: rgba(239,68,68,0.15);  color: #fca5a5; border-color: rgba(239,68,68,0.35); }
  .action-btn.pub:hover   { background: rgba(34,197,94,0.15);  color: #86efac; border-color: rgba(34,197,94,0.35); }

  /* Filters bar */
  .filters-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 20px;
  }

  .filter-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    color: #374151;
    transition: all 0.15s;
    user-select: none;
  }
  .filter-pill input { width: 16px; height: 16px; accent-color: #2563eb; cursor: pointer; border-radius: 4px; }

  .btn-refresh {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #22c55e;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-refresh:hover { background: #16a34a; }

  /* Empty state */
  .list-empty {
    padding: 60px 24px;
    text-align: center;
    color: rgba(255,255,255,0.2);
  }

  /* Scrollable */
  .list-overflow { overflow-x: auto; }
`;

const Articles = ({ apiUrl = API_BASE_URL }) => {
  const [state, setState] = useState({
    articles: [],
    categories: [],
    sections: [],
    loading: true,
    error: null,
    searchQuery: '',
    isEditing: false,
    currentArticle: null,
    successMessage: '',
    filters: { mostRead: false, stories: false, artists: false },
    formData: {
      title: '', content: '', category_id: '', section_id: '', status: 'draft',
      alauneactual: false, videoactual: false, eventactual: false, mostread: false,
      is_story: false, is_cinema: false, is_comedy: false, is_sport: false,
      is_rap: false, is_afrotcham: false, is_buzz: false, is_alaune: false,
      science: false, is_artist: false, contenurecent: false,
      image: null, video: null, duration: '', author_name: '', story_expires_at: null,
    },
    imagePreview: null, videoPreview: null, expiredStories: 0,
  });

  useEffect(() => {
    if (state.successMessage) {
      const t = setTimeout(() => setState(p => ({ ...p, successMessage: '' })), 3000);
      return () => clearTimeout(t);
    }
  }, [state.successMessage]);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (!storedRefreshToken) return null;
    try {
      const r = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });
      if (r.ok) {
        const d = await r.json();
        localStorage.setItem('token', d.access_token);
        localStorage.setItem('refresh_token', d.refresh_token);
        return d.access_token;
      }
      return null;
    } catch { return null; }
  }, [apiUrl]);

  const fetchData = useCallback(async () => {
    try {
      setState(p => ({ ...p, loading: true, error: null }));
      let token = localStorage.getItem('token');
      if (!token) { token = await refreshToken(); if (!token) { setState(p => ({ ...p, loading: false, error: 'Session expirée.' })); return; } }
      const headers = { Authorization: `Bearer ${token}` };
      let [aR, cR, sR] = await Promise.all([
        fetch(`${apiUrl}/api/articles/`, { headers }).catch(e => ({ ok: false, status: 500, statusText: e.message })),
        fetch(`${apiUrl}/api/categories/`, { headers }).catch(() => ({ ok: false })),
        fetch(`${apiUrl}/api/sections/`, { headers }).catch(() => ({ ok: false })),
      ]);
      if (!aR.ok && aR.status === 401) { const nt = await refreshToken(); if (nt) { headers.Authorization = `Bearer ${nt}`; const rr = await fetch(`${apiUrl}/api/articles/`, { headers }); if (rr.ok) aR = rr; } }
      if (!aR.ok) throw new Error('Session expirée. Veuillez vous reconnecter.');
      if (!cR.ok) throw new Error('Impossible de récupérer les catégories.');
      const articles = await aR.json(), categories = await cR.json(), sections = sR.ok ? await sR.json() : [];
      const defaultSectionId = sections.find(s => s.name === 'Contenus Récents')?.id || sections[0]?.id || '';
      setState(p => ({ ...p, articles, categories, sections, loading: false, formData: { ...p.formData, category_id: categories[0]?.id || '', section_id: defaultSectionId } }));
    } catch (e) { setState(p => ({ ...p, loading: false, error: e.message })); }
  }, [apiUrl, refreshToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const n = state.articles.filter(a => a.is_story && a.story_expires_at && new Date(a.story_expires_at) <= new Date()).length;
    setState(p => ({ ...p, expiredStories: n }));
  }, [state.articles]);

  const handleChange = e => { const { name, value } = e.target; setState(p => ({ ...p, formData: { ...p.formData, [name]: value } })); };
  const handleEditorChange = content => setState(p => ({ ...p, formData: { ...p.formData, content } }));

  const handleCheckboxChange = e => {
    const { name, checked } = e.target;
    setState(p => {
      const nf = { ...p.formData, [name]: checked };
      if (name === 'is_story' && checked) nf.story_expires_at = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
      else if (name === 'is_story') nf.story_expires_at = null;
      if (name === 'contenurecent' && checked) { const s = p.sections.find(s => s.name === 'Contenus Récents'); if (s) nf.section_id = s.id; }
      return { ...p, formData: nf };
    });
  };

  const handleFilterChange = k => setState(p => ({ ...p, filters: { ...p.filters, [k]: !p.filters[k] } }));

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) { setState(p => ({ ...p, formData: { ...p.formData, [type]: null }, [`${type}Preview`]: null })); return; }
    const allowed = type === 'video' ? ['video/mp4', 'video/webm'] : ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) { setState(p => ({ ...p, error: type === 'video' ? 'MP4/WebM uniquement.' : 'JPG/PNG uniquement.' })); e.target.value = ''; return; }
    const url = URL.createObjectURL(file);
    if (type === 'video') {
      const v = document.createElement('video'); v.preload = 'metadata';
      v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); setState(p => ({ ...p, formData: { ...p.formData, video: file, duration: Math.round(v.duration) }, videoPreview: url })); };
      v.src = url; v.load();
    } else setState(p => ({ ...p, formData: { ...p.formData, [type]: file }, [`${type}Preview`]: url }));
  };

  const handleImageError = e => { e.target.style.display = 'none'; const d = e.target.parentElement?.querySelector('.default-icon'); if (d) d.style.display = 'block'; };
  const getImageUrl = u => !u ? null : (u.startsWith('http') || u.startsWith('//') ? u : `${apiUrl}${u.startsWith('/') ? u : `/${u}`}`);

  const filePickerCallback = (callback, _v, meta) => {
    const input = document.createElement('input'); input.type = 'file';
    input.accept = meta.filetype === 'image' ? 'image/jpeg,image/png,image/jpg' : 'video/mp4,video/webm';
    input.onchange = () => { const f = input.files[0]; if (!f) return; const t = meta.filetype === 'image' ? 'image' : 'video'; const u = URL.createObjectURL(f); setState(p => ({ ...p, formData: { ...p.formData, [t]: f }, [`${t}Preview`]: u })); callback(u, { alt: f.name }); };
    input.click();
  };

  const getEmptyForm = p => ({
    title: '', content: '', category_id: p.categories[0]?.id || '',
    section_id: p.sections.find(s => s.name === 'Contenus Récents')?.id || p.sections[0]?.id || '',
    status: 'draft', alauneactual: false, videoactual: false, eventactual: false,
    mostread: false, is_story: false, is_cinema: false, is_comedy: false, is_sport: false,
    is_rap: false, is_afrotcham: false, is_buzz: false, is_alaune: false, science: false,
    is_artist: false, contenurecent: false, image: null, video: null, duration: '', author_name: '', story_expires_at: null,
  });

  const saveArticle = async e => {
    e.preventDefault(); setState(p => ({ ...p, loading: true, error: null }));
    try {
      const { currentArticle, formData } = state;
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (k !== 'image' && k !== 'video' && v !== null && v !== undefined) fd.append(k, v); });
      if (formData.image) fd.append('image', formData.image);
      if (formData.video) fd.append('video', formData.video);
      let token = localStorage.getItem('token');
      const url = currentArticle ? `${apiUrl}/api/articles/${currentArticle.id}` : `${apiUrl}/api/articles/`;
      const method = currentArticle ? 'PUT' : 'POST';
      const ctrl = new AbortController(); const tid = setTimeout(() => ctrl.abort(), 30000);
      let res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd, signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok && res.status === 401) { token = await refreshToken(); if (token) { const c2 = new AbortController(); const t2 = setTimeout(() => c2.abort(), 30000); res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd, signal: c2.signal }); clearTimeout(t2); } else throw new Error('Session expirée.'); }
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || 'Échec de la sauvegarde.'); }
      const newA = await res.json();
      setState(p => ({ ...p, articles: currentArticle ? p.articles.map(a => a.id === newA.id ? newA : a) : [...p.articles, newA], isEditing: false, currentArticle: null, formData: getEmptyForm(p), imagePreview: null, videoPreview: null, loading: false, successMessage: currentArticle ? 'Article mis à jour !' : 'Article créé !' }));
    } catch (e) { setState(p => ({ ...p, loading: false, error: e.message })); }
  };

  const publishArticle = async id => {
    if (!window.confirm('Publier cet article ?')) return;
    try {
      setState(p => ({ ...p, loading: true, error: null }));
      let token = localStorage.getItem('token'); const fd = new FormData(); fd.append('status', 'published');
      let res = await fetch(`${apiUrl}/api/articles/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok && res.status === 401) { token = await refreshToken(); if (token) res = await fetch(`${apiUrl}/api/articles/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd }); else throw new Error('Session expirée.'); }
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || 'Échec.'); }
      const up = await res.json();
      setState(p => ({ ...p, articles: p.articles.map(a => a.id === up.id ? up : a), loading: false, successMessage: 'Article publié !' }));
    } catch (e) { setState(p => ({ ...p, loading: false, error: e.message })); }
  };

  const deleteArticle = async id => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try {
      setState(p => ({ ...p, loading: true, error: null }));
      let token = localStorage.getItem('token');
      let res = await fetch(`${apiUrl}/api/articles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok && res.status === 401) { token = await refreshToken(); if (token) res = await fetch(`${apiUrl}/api/articles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); else throw new Error('Session expirée.'); }
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || 'Échec.'); }
      setState(p => ({ ...p, articles: p.articles.filter(a => a.id !== id), loading: false, successMessage: 'Article supprimé !' }));
    } catch (e) { setState(p => ({ ...p, loading: false, error: e.message })); }
  };

  const editArticle = article => {
    setState(p => ({
      ...p, isEditing: true, currentArticle: article,
      formData: {
        title: article.title, content: article.content, category_id: article.category_id,
        section_id: article.section_id || '', status: article.status,
        alauneactual: article.alauneactual, videoactual: article.videoactual, eventactual: article.eventactual,
        mostread: article.mostread, is_story: article.is_story, is_cinema: article.is_cinema,
        is_comedy: article.is_comedy, is_sport: article.is_sport, is_rap: article.is_rap,
        is_afrotcham: article.is_afrotcham, is_buzz: article.is_buzz, is_alaune: article.is_alaune,
        science: article.science, is_artist: article.is_artist, contenurecent: article.contenurecent,
        image: null, video: null, duration: article.duration || '', author_name: article.author_name || '',
        story_expires_at: article.story_expires_at ? new Date(article.story_expires_at).toISOString().slice(0, 16) : null,
      },
      imagePreview: article.image_url, videoPreview: article.video_url,
    }));
  };

  const cancelEdit = () => setState(p => ({ ...p, isEditing: false, currentArticle: null, formData: getEmptyForm(p), imagePreview: null, videoPreview: null, error: null }));

  const totalViews = state.articles.reduce((s, a) => s + (a.views || 0), 0);
  const averageViews = state.articles.length ? totalViews / state.articles.length : 0;
  const categoryMap = state.categories.reduce((m, c) => { m[c.id] = c.name; return m; }, {});
  const sectionMap = state.sections.reduce((m, s) => { m[s.id] = s.name; return m; }, {});
  const getCategoryName = id => categoryMap[id] || 'Non catégorisé';
  const getSectionName = id => sectionMap[id] || '—';

  const filteredArticles = state.articles.filter(a => {
    const q = state.searchQuery.toLowerCase();
    const match = a.title.toLowerCase().includes(q) || a.status.toLowerCase().includes(q) || getCategoryName(a.category_id).toLowerCase().includes(q) || getSectionName(a.section_id).toLowerCase().includes(q);
    const isStory = a.is_story && (!a.story_expires_at || new Date(a.story_expires_at) > new Date());
    const isMR = a.views > averageViews;
    const isArt = a.is_artist || false;
    if (state.filters.mostRead && state.filters.stories && state.filters.artists) return match && (isMR || isStory || isArt);
    if (state.filters.mostRead) return match && isMR;
    if (state.filters.stories) return match && isStory;
    if (state.filters.artists) return match && isArt;
    return match;
  });

  const renderStatusBadge = s => {
    const map = { published: { color: 'green', icon: <Check className="w-3 h-3" /> }, draft: { color: 'gray', icon: <FileText className="w-3 h-3" /> }, pending: { color: 'yellow', icon: <Clock className="w-3 h-3" /> } };
    const { color, icon } = map[s] || { color: 'blue', icon: null };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 border border-${color}-200`}>{icon && <span className="mr-1">{icon}</span>}{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
  };

  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const isAdmin = userInfo.role === 'admin';

  const checkboxFields = [
    { name: 'mostread', label: 'Les plus lus' }, { name: 'is_story', label: 'Story' },
    { name: 'is_cinema', label: 'Cinéma' }, { name: 'is_comedy', label: 'Comédie' },
    { name: 'is_sport', label: 'Sport' }, { name: 'is_rap', label: 'Rap' },
    { name: 'is_afrotcham', label: 'Afrotcham' }, { name: 'is_buzz', label: 'Buzz' },
    { name: 'is_alaune', label: 'À la Une' }, { name: 'alauneactual', label: 'À la Une Actual' },
    { name: 'videoactual', label: 'Vidéo Actual' }, { name: 'eventactual', label: 'Évènement Actual' },
    { name: 'science', label: 'Science' }, { name: 'is_artist', label: 'Artiste' },
    { name: 'contenurecent', label: 'Contenu Récent' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <style>{formStyles}</style>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 style={{ color: 'black' }} className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="mr-3 text-blue-500" /> Gestion des Articles
          </h1>
          {!state.isEditing ? (
            <button onClick={() => setState(p => ({ ...p, isEditing: true }))} className="inline-flex items-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md">
              <Plus className="w-5 h-5 mr-2" /> Ajouter un article
            </button>
          ) : (
            <button onClick={cancelEdit} className="inline-flex items-center px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 transition-all duration-300 shadow-md">
              <X className="w-5 h-5 mr-2" /> Annuler
            </button>
          )}
        </div>

        {/* Success */}
        {state.successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center gap-2">
            <Check className="w-4 h-4" /> {state.successMessage}
          </div>
        )}

        {/* Expired stories */}
        {state.expiredStories > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg shadow-md">
            <p className="font-semibold text-yellow-800">Note :</p>
            <p className="text-yellow-700">{state.expiredStories} story(ies) masquée(s) car expirée(s).</p>
          </div>
        )}

        {/* Error */}
        {state.error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex"><X className="h-5 w-5 text-red-400 flex-shrink-0" /><p className="ml-3 text-red-700">{state.error}</p></div>
          </div>
        )}

        {/* Filters */}
        {!state.isEditing && (
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            {[{ key: 'mostRead', label: 'Les plus lus' }, { key: 'stories', label: 'Stories' }, { key: 'artists', label: 'Artistes' }].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={state.filters[key]} onChange={() => handleFilterChange(key)} className="h-4 w-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
            <button onClick={fetchData} className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 shadow-md">
              <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir
            </button>
          </div>
        )}

        {/* ═══ REDESIGNED FORM ═══ */}
        {state.isEditing && (
          <form onSubmit={saveArticle} className="form-shell mb-8">

            <div className="form-title">
              <span />
              {state.currentArticle ? "Modifier l'article" : "Créer un article"}
            </div>

            {/* ── Informations générales ── */}
            <p className="section-label">Informations générales</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>

              {/* Title */}
              <div>
                <label className="static-label">Titre *</label>
                <input
                  type="text" name="title" id="title"
                  value={state.formData.title} onChange={handleChange}
                  className="form-input" placeholder="Titre de l'article" required
                />
              </div>

              {/* Category */}
              <div>
                <label className="static-label">Catégorie *</label>
                <div style={{ position: 'relative' }}>
                  <select name="category_id" value={state.formData.category_id} onChange={handleChange} className="form-select" required>
                    <option value="">Sélectionner…</option>
                    {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, pointerEvents: 'none', color: 'rgba(255,255,255,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Section */}
              <div>
                <label className="static-label">Section</label>
                <div style={{ position: 'relative' }}>
                  <select name="section_id" value={state.formData.section_id} onChange={handleChange} className="form-select">
                    <option value="">Sélectionner…</option>
                    {state.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, pointerEvents: 'none', color: 'rgba(255,255,255,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="static-label">Statut *</label>
                <div style={{ position: 'relative' }}>
                  <select name="status" value={state.formData.status} onChange={handleChange} className="form-select">
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="pending">En attente</option>
                  </select>
                  <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, pointerEvents: 'none', color: 'rgba(255,255,255,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Author (admin) */}
              {isAdmin && (
                <div>
                  <label className="static-label">Nom de l&apos;auteur (optionnel)</label>
                  <input type="text" name="author_name" id="author_name" value={state.formData.author_name} onChange={handleChange} className="form-input" placeholder="Nom de l'auteur" />
                </div>
              )}

              {/* Story expiry */}
              {state.formData.is_story && (
                <div>
                  <label className="static-label">Expiration de la story</label>
                  <input type="datetime-local" name="story_expires_at" id="story_expires_at" value={state.formData.story_expires_at || ''} onChange={handleChange} className="form-input" required={state.formData.is_story} />
                </div>
              )}
            </div>

            <hr className="form-divider" />

            {/* ── Contenu ── */}
            <p className="section-label">Contenu *</p>
            <div className="editor-wrap">
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'flup6mpg77mo3dunmn55uysoe36a3no8ykt61q105qolika5'}
                value={state.formData.content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 400, menubar: true,
                  plugins: ['advlist','autolink','lists','link','image','searchreplace','visualblocks','code','fullscreen','insertdatetime','media','table','anchor'],
                  toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | code | removeformat',
                  file_picker_callback: filePickerCallback, file_picker_types: 'image media',
                  content_style: 'body { font-size: 14px; }',
                  placeholder: "Contenu de l'article",
                  skin: 'oxide-dark', content_css: 'dark',
                }}
              />
            </div>

            <hr className="form-divider" />

            {/* ── Médias ── */}
            <p className="section-label">Médias</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {/* Image */}
              <div>
                <label className="static-label">Image (JPG / PNG)</label>
                <div className="file-dropzone file-input-wrap">
                  <svg style={{ width: 28, height: 28, opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4a3 3 0 014 0l4 4m-4-10v10M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /></svg>
                  <span>Cliquer pour choisir un fichier</span>
                  <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={e => handleFileChange(e, 'image')} />
                </div>
                {state.imagePreview && (
                  <div className="media-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={state.imagePreview} alt="Aperçu" style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} loading="lazy" onError={handleImageError} />
                  </div>
                )}
              </div>

              {/* Video */}
              <div>
                <label className="static-label">Vidéo (MP4 / WebM)</label>
                <div className="file-dropzone file-input-wrap">
                  <svg style={{ width: 28, height: 28, opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                  <span>Cliquer pour choisir un fichier</span>
                  <input type="file" accept="video/mp4,video/webm" onChange={e => handleFileChange(e, 'video')} />
                </div>
                {state.videoPreview && (
                  <div className="media-preview">
                    <video src={state.videoPreview} controls style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
              </div>
            </div>

            <hr className="form-divider" />

            {/* ── Tags ── */}
            <p className="section-label">Tags &amp; Catégorisation</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {checkboxFields.map(({ name, label }) => (
                <label key={name} className="cb-pill">
                  <input type="checkbox" name={name} checked={state.formData[name]} onChange={handleCheckboxChange} />
                  {label}
                </label>
              ))}
            </div>

            <hr className="form-divider" />

            {/* ── Actions ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={cancelEdit} className="btn-cancel">
                <X size={16} /> Annuler
              </button>
              <button type="submit" disabled={state.loading} className="btn-submit">
                {state.loading
                  ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enregistrement…</>
                  : <><Check size={16} /> {state.currentArticle ? 'Mettre à jour' : 'Créer l\'article'}</>
                }
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {state.loading && !state.isEditing && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <RefreshCw style={{ width: 36, height: 36, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* Table */}
        {!state.isEditing && !state.loading && (
          <div className="list-shell">
            <div className="list-search-wrap" style={{ position: 'relative' }}>
              <svg className="list-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" placeholder="Rechercher un article…"
                value={state.searchQuery}
                onChange={e => setState(p => ({ ...p, searchQuery: e.target.value }))}
                className="list-search-input"
              />
            </div>

            {filteredArticles.length === 0 ? (
              <div className="list-empty">
                <FileText style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.2 }} />
                <p>Aucun article trouvé.</p>
              </div>
            ) : (
              <div className="list-overflow">
                <table className="list-table">
                  <thead>
                    <tr>
                      {['Titre', 'Statut', 'Section', 'Date', 'Story', 'Actions'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map(article => (
                      <tr key={article.id}>
                        {/* Titre */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="list-thumb">
                              {article.image_url ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={getImageUrl(article.image_url)} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={handleImageError} />
                                  <FileText className="default-icon" style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.2)', position: 'absolute', display: 'none' }} />
                                </>
                              ) : <FileText style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.2)' }} />}
                            </div>
                            <div>
                              <div className="list-title-text">{article.title}</div>
                              <div className="list-cat-text">{getCategoryName(article.category_id)}</div>
                            </div>
                          </div>
                        </td>
                        {/* Statut */}
                        <td>
                          {(() => {
                            const s = article.status;
                            const cls = s === 'published' ? 'badge badge-published' : s === 'pending' ? 'badge badge-pending' : 'badge badge-draft';
                            const icon = s === 'published' ? <Check size={11}/> : s === 'pending' ? <Clock size={11}/> : <FileText size={11}/>;
                            return <span className={cls}>{icon}{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
                          })()}
                        </td>
                        {/* Section */}
                        <td>{getSectionName(article.section_id)}</td>
                        {/* Date */}
                        <td>{new Date(article.created_at).toLocaleDateString('fr-FR')}</td>
                        {/* Story */}
                        <td>
                          {article.is_story
                            ? (!article.story_expires_at || new Date(article.story_expires_at) > new Date()
                              ? <Check size={16} style={{ color: '#4ade80' }} />
                              : <Clock size={16} style={{ color: '#f87171' }} title="Expirée" />)
                            : <X size={16} style={{ color: 'rgba(255,255,255,0.15)' }} />}
                        </td>
                        {/* Actions */}
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => editArticle(article)} className="action-btn edit" aria-label={`Modifier ${article.title}`}><Edit size={15} /></button>
                            <button onClick={() => deleteArticle(article.id)} className="action-btn del" aria-label={`Supprimer ${article.title}`}><Trash2 size={15} /></button>
                            {article.status !== 'published' && (
                              <button onClick={() => publishArticle(article.id)} className="action-btn pub" aria-label={`Publier ${article.title}`}><Send size={15} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;