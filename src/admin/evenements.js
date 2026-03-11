"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar, Plus, Trash2, RefreshCw, FilePlus, Upload,
  MapPin, Clock, Star, StarOff, X, Check, Send, Edit,
} from "lucide-react";

const GestionDesEvenements = ({
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
}) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [formData, setFormData] = useState({
    title: "", category_id: "", location: "", venue: "",
    date: "", end_date: "", time: "", contact: "", attendees: "",
    status: "draft", is_featured: false, tickets_available: false,
    ticket_price: "", ticket_url: "", description: "", organizer_id: "", image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  const filters = [
    { id: "all", name: "Tous" },
    { id: "featured", name: "À la une" },
    { id: "upcoming", name: "À venir" },
    { id: "past", name: "Passés" },
  ];

  const fetchEvents = async (token) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/events/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch events");
      setEvents(await res.json());
    } catch (e) {
      setErrorMessage("Échec de la récupération des événements.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        setUsers(await res.json());
      } catch { setErrorMessage("Échec de la récupération des utilisateurs."); }
    };
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/categories/`);
        if (!res.ok) throw new Error();
        setCategories(await res.json());
      } catch { setErrorMessage("Échec de la récupération des catégories."); }
    };
    if (isAuthenticated) { fetchUsers(); fetchCategories(); }
  }, [isAuthenticated, apiUrl]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { setIsAuthenticated(true); fetchEvents(token); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: loginData.username, password: loginData.password }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      setIsAuthenticated(true);
      fetchEvents(data.access_token);
    } catch { alert("Login failed. Please check your credentials."); }
  };

  const filteredEvents = events.filter((event) => {
    const q = (searchQuery || "").toLowerCase();
    const matchesSearch =
      event.title?.toLowerCase().includes(q) ||
      event.category?.name?.toLowerCase().includes(q) ||
      event.location?.toLowerCase().includes(q) ||
      event.status?.toLowerCase().includes(q) ||
      event.date?.includes(searchQuery || "");
    const matchesCategory = activeCategory === "all" || event.category?.id === parseInt(activeCategory);
    let matchesFilter = true;
    if (activeFilter === "featured") matchesFilter = event.is_featured;
    else if (activeFilter === "upcoming") matchesFilter = new Date(event.date) >= new Date();
    else if (activeFilter === "past") matchesFilter = new Date(event.date) < new Date();
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const formatDateRange = (startDate, endDate) => {
    if (!endDate || startDate === endDate) return new Date(startDate).toLocaleDateString("fr-FR");
    return `${new Date(startDate).toLocaleDateString("fr-FR")} - ${new Date(endDate).toLocaleDateString("fr-FR")}`;
  };

  const toggleFeatured = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/events/${id}/toggle-featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setEvents(events.map(e => e.id === id ? updated : e));
    } catch { setErrorMessage('Échec de la mise à jour du statut "À la une".'); }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/events/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setEvents(events.filter(e => e.id !== id));
      setSuccessMessage("Événement supprimé avec succès.");
    } catch { setErrorMessage("Échec de la suppression de l'événement."); }
  };

  const resetForm = () => setFormData({
    title: "", category_id: "", location: "", venue: "", date: "", end_date: "",
    time: "", contact: "", attendees: "", status: "draft", is_featured: false,
    tickets_available: false, ticket_price: "", ticket_url: "", description: "", organizer_id: "", image: null,
  });

  const cancelForm = () => { setShowForm(false); setCurrentEvent(null); resetForm(); setErrorMessage(""); };

  const editEvent = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title || "",
      category_id: event.category?.id || event.category_id || "",
      location: event.location || "",
      venue: event.venue || "",
      date: event.date ? event.date.slice(0, 10) : "",
      end_date: event.end_date ? event.end_date.slice(0, 10) : "",
      time: event.time || "",
      contact: event.contact || "",
      attendees: event.attendees || "",
      status: event.status || "draft",
      is_featured: event.is_featured || false,
      tickets_available: event.tickets_available || false,
      ticket_price: event.ticket_price || "",
      ticket_url: event.ticket_url || "",
      description: event.description || "",
      organizer_id: event.organizer_id || "",
      image: null,
    });
    setShowForm(true);
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!formData.title.trim() || !formData.category_id || !formData.location.trim() ||
        !formData.venue.trim() || !formData.date || !formData.time.trim() ||
        !formData.description.trim() || !formData.organizer_id || !formData.contact.trim()) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }
      const organizerId = parseInt(formData.organizer_id);
      const categoryId = parseInt(formData.category_id);
      if (isNaN(organizerId) || isNaN(categoryId)) throw new Error("Identifiants invalides");

      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("description", formData.description.trim());
      fd.append("category_id", categoryId.toString());
      fd.append("location", formData.location.trim());
      fd.append("venue", formData.venue.trim());
      fd.append("date", `${formData.date}T00:00:00Z`);
      if (formData.end_date?.trim()) fd.append("end_date", `${formData.end_date}T00:00:00Z`);
      fd.append("time", formData.time.trim());
      fd.append("status", formData.status || "draft");
      fd.append("is_featured", formData.is_featured.toString());
      fd.append("attendees", (parseInt(formData.attendees) || 0).toString());
      fd.append("contact", formData.contact.trim());
      fd.append("tickets_available", formData.tickets_available.toString());
      if (formData.ticket_price) fd.append("ticket_price", formData.ticket_price);
      if (formData.ticket_url) fd.append("ticket_url", formData.ticket_url);
      fd.append("organizer_id", organizerId.toString());
      if (formData.image) fd.append("image", formData.image);

      const url = currentEvent ? `${apiUrl}/events/${currentEvent.id}` : `${apiUrl}/events/`;
      const method = currentEvent ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(Array.isArray(err.detail) ? err.detail.map(e => `${e.loc.join(".")}: ${e.msg}`).join("; ") : err.detail || "Échec de la création");
      }
      const savedEvent = await res.json();
      if (currentEvent) {
        setEvents(events.map(e => e.id === savedEvent.id ? savedEvent : e));
        setSuccessMessage("Événement mis à jour avec succès !");
      } else {
        setEvents([...events, savedEvent]);
        setSuccessMessage("Événement créé avec succès !");
      }
      setShowForm(false);
      setCurrentEvent(null);
      resetForm();
    } catch (e) {
      setErrorMessage(e.message || "Échec de la création de l'événement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── styles ─── */
  const styles = `
    .ev-form-shell {
      background: #0f0f13;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      padding: 40px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 40px 80px rgba(0,0,0,0.5);
      margin-bottom: 32px;
    }
    .ev-form-shell::before {
      content: '';
      position: absolute;
      top: -120px; right: -120px;
      width: 360px; height: 360px;
      background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
      pointer-events: none;
    }
    .ev-form-shell::after {
      content: '';
      position: absolute;
      bottom: -80px; left: -80px;
      width: 280px; height: 280px;
      background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
      pointer-events: none;
    }
    .ev-form-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      margin-bottom: 36px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ev-form-title span {
      display: inline-block;
      width: 6px; height: 28px;
      background: linear-gradient(to bottom, #3b82f6, #6366f1);
      border-radius: 3px;
    }
    .ev-section-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #3b82f6;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(59,130,246,0.2);
    }
    .ev-static-label {
      display: block;
      font-size: 0.72rem;
      font-weight: 600;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .ev-input, .ev-select, .ev-textarea {
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
    .ev-input::placeholder, .ev-textarea::placeholder { color: rgba(255,255,255,0.25); }
    .ev-input:focus, .ev-select:focus, .ev-textarea:focus {
      border-color: rgba(59,130,246,0.6);
      background: rgba(59,130,246,0.06);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    }
    .ev-select option { background: #1a1a24; color: #f0f0f5; }
    .ev-textarea { resize: vertical; min-height: 100px; }
    .ev-cb-pill {
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
    .ev-cb-pill:hover { border-color: rgba(59,130,246,0.4); color: rgba(255,255,255,0.85); background: rgba(59,130,246,0.08); }
    .ev-cb-pill input { width: 14px; height: 14px; accent-color: #3b82f6; cursor: pointer; }
    .ev-cb-pill:has(input:checked) { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.5); color: #93c5fd; }
    .ev-dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 28px;
      border: 2px dashed rgba(255,255,255,0.1);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      background: rgba(255,255,255,0.02);
      font-size: 0.8rem;
      color: rgba(255,255,255,0.3);
      position: relative;
    }
    .ev-dropzone:hover { border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.04); color: rgba(255,255,255,0.6); }
    .ev-dropzone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
    .ev-btn-cancel {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 24px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: rgba(255,255,255,0.7);
      font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .ev-btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .ev-btn-submit {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 32px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border: none; border-radius: 12px;
      color: #fff; font-size: 0.875rem; font-weight: 700;
      letter-spacing: 0.03em; cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(59,130,246,0.35);
    }
    .ev-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(59,130,246,0.5); }
    .ev-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .ev-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 28px 0; }
    .ev-select-wrap { position: relative; }
    .ev-select-wrap svg { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; pointer-events: none; color: rgba(255,255,255,0.3); }

    /* list */
    .ev-list-shell {
      background: #0f0f13;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 40px 80px rgba(0,0,0,0.5);
      margin-bottom: 32px;
    }
    .ev-list-search-wrap { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; }
    .ev-list-search-input {
      width: 100%; max-width: 360px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 11px 16px 11px 40px;
      font-size: 0.875rem; font-family: inherit; color: #f0f0f5;
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .ev-list-search-input::placeholder { color: rgba(255,255,255,0.25); }
    .ev-list-search-input:focus { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.10); }
    .ev-search-icon { position: absolute; left: 36px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: rgba(255,255,255,0.25); pointer-events: none; }
    .ev-list-filters { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); align-items: center; }
    .ev-filter-btn {
      padding: 6px 14px; border-radius: 999px; font-size: 0.78rem; font-weight: 600;
      cursor: pointer; transition: all 0.15s; border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.45);
    }
    .ev-filter-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.8); }
    .ev-filter-btn.active { background: rgba(59,130,246,0.18); border-color: rgba(59,130,246,0.5); color: #93c5fd; }
    .ev-cat-select {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 6px 28px 6px 12px; font-size: 0.78rem; font-family: inherit;
      color: rgba(255,255,255,0.55); outline: none; appearance: none; cursor: pointer;
    }
    .ev-cat-select option { background: #1a1a24; color: #f0f0f5; }
    .ev-cat-wrap { position: relative; }
    .ev-cat-wrap svg { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; pointer-events: none; color: rgba(255,255,255,0.3); }
    .ev-card { display: flex; align-items: flex-start; gap: 14px; padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s; }
    .ev-card:last-child { border-bottom: none; }
    .ev-card:hover { background: rgba(255,255,255,0.02); }
    .ev-card-icon { width: 56px; height: 56px; border-radius: 10px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
    .ev-card-title { font-size: 0.875rem; font-weight: 500; color: #f0f0f5; }
    .ev-card-desc { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-top: 3px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .ev-card-meta { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; font-size: 0.75rem; color: rgba(255,255,255,0.35); align-items: center; }
    .ev-card-meta span { display: flex; align-items: center; gap: 4px; }
    .ev-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; border: 1px solid; }
    .ev-badge-published { background: rgba(34,197,94,0.12); color: #4ade80; border-color: rgba(34,197,94,0.25); }
    .ev-badge-draft { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); border-color: rgba(255,255,255,0.1); }
    .ev-badge-processing { background: rgba(234,179,8,0.12); color: #facc15; border-color: rgba(234,179,8,0.25); }
    .ev-badge-cat { background: rgba(59,130,246,0.12); color: #93c5fd; border-color: rgba(59,130,246,0.25); }
    .ev-action-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); cursor: pointer; transition: all 0.15s; color: rgba(255,255,255,0.4); }
    .ev-action-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .ev-action-btn.edit:hover { background: rgba(99,102,241,0.15); color: #a5b4fc; border-color: rgba(99,102,241,0.3); }
    .ev-action-btn.del:hover { background: rgba(239,68,68,0.15); color: #fca5a5; border-color: rgba(239,68,68,0.3); }
    .ev-action-btn.star-on { color: #facc15; border-color: rgba(234,179,8,0.3); background: rgba(234,179,8,0.1); }
    .ev-empty { padding: 60px 24px; text-align: center; color: rgba(255,255,255,0.2); }
  `;

  const Chevron = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" id="username" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Username" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Password" required />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Gestion des Événements</h3>
          <p className="text-sm text-gray-500">Gérez tous les événements, concerts, festivals et activités culturelles</p>
        </div>
        {!showForm ? (
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" /> Ajouter un événement
          </button>
        ) : (
          <button onClick={cancelForm}
            className="inline-flex items-center px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 transition-all duration-300 shadow-md">
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
        <div className="ev-form-shell">
          <div className="ev-form-title"><span />{currentEvent ? "Modifier l'événement" : "Nouvel événement"}</div>

          {errorMessage && (
            <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: '0.85rem' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Infos générales */}
            <p className="ev-section-label">Informations générales</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label className="ev-static-label">Titre *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="ev-input" placeholder="Festival des Cultures Urbaines…" required />
              </div>
              <div>
                <label className="ev-static-label">Catégorie *</label>
                <div className="ev-select-wrap">
                  <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="ev-select" required>
                    <option value="">Sélectionner…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="ev-static-label">Organisateur *</label>
                <div className="ev-select-wrap">
                  <select value={formData.organizer_id} onChange={e => setFormData({ ...formData, organizer_id: e.target.value })} className="ev-select" required>
                    <option value="">Sélectionner…</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className="ev-static-label">Statut *</label>
                <div className="ev-select-wrap">
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="ev-select" required>
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="processing">En traitement</option>
                  </select>
                  <Chevron />
                </div>
              </div>
            </div>

            <hr className="ev-divider" />

            {/* Lieu & Date */}
            <p className="ev-section-label">Lieu &amp; Date</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label className="ev-static-label">Ville *</label>
                <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="ev-input" placeholder="Libreville" required />
              </div>
              <div>
                <label className="ev-static-label">Lieu précis *</label>
                <input type="text" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })}
                  className="ev-input" placeholder="Place de l'Indépendance" required />
              </div>
              <div>
                <label className="ev-static-label">Date de début *</label>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="ev-input" required />
              </div>
              <div>
                <label className="ev-static-label">Date de fin</label>
                <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  className="ev-input" />
              </div>
              <div>
                <label className="ev-static-label">Horaires *</label>
                <input type="text" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="ev-input" placeholder="14:00 - 00:00" required />
              </div>
              <div>
                <label className="ev-static-label">Contact *</label>
                <input type="text" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })}
                  className="ev-input" placeholder="+241 01 23 45 67" required />
              </div>
              <div>
                <label className="ev-static-label">Participants attendus</label>
                <input type="number" value={formData.attendees} onChange={e => setFormData({ ...formData, attendees: e.target.value })}
                  className="ev-input" placeholder="1000" />
              </div>
            </div>

            <hr className="ev-divider" />

            {/* Description */}
            <p className="ev-section-label">Description *</p>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="ev-textarea" placeholder="Description détaillée de l'événement…" required />

            <hr className="ev-divider" />

            {/* Billetterie */}
            <p className="ev-section-label">Billetterie</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
              <label className="ev-cb-pill">
                <input type="checkbox" checked={formData.tickets_available} onChange={e => setFormData({ ...formData, tickets_available: e.target.checked })} />
                Billets disponibles
              </label>
              <label className="ev-cb-pill">
                <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
                Mettre à la une
              </label>
              <div style={{ flex: '1 1 200px' }}>
                <label className="ev-static-label">Prix des billets</label>
                <input type="text" value={formData.ticket_price} onChange={e => setFormData({ ...formData, ticket_price: e.target.value })}
                  className="ev-input" placeholder="10 000 XAF" />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label className="ev-static-label">URL billetterie</label>
                <input type="url" value={formData.ticket_url} onChange={e => setFormData({ ...formData, ticket_url: e.target.value })}
                  className="ev-input" placeholder="https://billetterie.gcutv.com" />
              </div>
            </div>

            <hr className="ev-divider" />

            {/* Image */}
            <p className="ev-section-label">Image de l&apos;événement</p>
            <div className="ev-dropzone">
              <Upload size={28} style={{ opacity: 0.35 }} />
              <span>Cliquer pour choisir une image</span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>PNG, JPG, GIF — 10 Mo max</span>
              <input type="file" accept="image/png,image/jpeg,image/gif"
                onChange={e => setFormData({ ...formData, image: e.target.files[0] || null })} />
            </div>
            {formData.image && (
              <p style={{ marginTop: 8, fontSize: '0.78rem', color: '#93c5fd' }}>
                ✓ {formData.image.name}
              </p>
            )}

            <hr className="ev-divider" />

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={cancelForm} className="ev-btn-cancel">
                <X size={16} /> Annuler
              </button>
              <button type="submit" disabled={isSubmitting} className="ev-btn-submit">
                {isSubmitting
                  ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Envoi…</>
                  : <><Send size={16} /> {currentEvent ? "Mettre à jour" : "Soumettre l'événement"}</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── List ── */}
      <div className="ev-list-shell">
        {/* Search */}
        <div className="ev-list-search-wrap">
          <svg className="ev-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Rechercher un événement…" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} className="ev-list-search-input" />
        </div>

        {/* Filters */}
        <div className="ev-list-filters">
          {filters.map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)}
              className={`ev-filter-btn${activeFilter === f.id ? ' active' : ''}`}>
              {f.name}
            </button>
          ))}
          <div className="ev-cat-wrap">
            <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="ev-cat-select">
              <option value="all">Toutes catégories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, pointerEvents: 'none', color: 'rgba(255,255,255,0.3)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.3)' }}>
            <RefreshCw style={{ width: 36, height: 36, color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <p>Chargement des événements…</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div>
            {filteredEvents.map(event => (
              <div key={event.id} className="ev-card">
                <div className="ev-card-icon" style={{ overflow: 'hidden', padding: 0 }}>
                  {event.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.image_url.startsWith('http') ? event.image_url : `${apiUrl}${event.image_url.startsWith('/') ? event.image_url : `/${event.image_url}`}`}
                      alt={event.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div style={{ display: event.image_url ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} style={{ color: '#3b82f6' }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div className="ev-card-title">{event.title}</div>
                      <div className="ev-card-desc">{event.description}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      <span className="ev-badge ev-badge-cat">
                        {categories.find(c => c.id === event.category?.id)?.name || event.category?.name}
                      </span>
                      {(() => {
                        const s = event.status;
                        const cls = s === 'published' ? 'ev-badge ev-badge-published' : s === 'processing' ? 'ev-badge ev-badge-processing' : 'ev-badge ev-badge-draft';
                        return <span className={cls}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
                      })()}
                    </div>
                  </div>
                  <div className="ev-card-meta">
                    <span><MapPin size={12} />{event.venue}, {event.location}</span>
                    <span><Calendar size={12} />{formatDateRange(event.date, event.end_date)}</span>
                    <span><Clock size={12} />{event.time}</span>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                      <button onClick={() => editEvent(event)}
                        className="ev-action-btn edit" title="Modifier">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => toggleFeatured(event.id)}
                        className={`ev-action-btn star${event.is_featured ? ' star-on' : ''}`}
                        title={event.is_featured ? 'Retirer de la une' : 'Mettre à la une'}>
                        {event.is_featured ? <Star size={14} /> : <StarOff size={14} />}
                      </button>
                      <button onClick={() => deleteEvent(event.id)} className="ev-action-btn del" title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ev-empty">
            <FilePlus style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.2 }} />
            <p>Aucun événement trouvé</p>
            <p style={{ fontSize: '0.8rem', marginTop: 4, opacity: 0.6 }}>
              {searchQuery || activeCategory !== "all" || activeFilter !== "all"
                ? "Essayez de modifier vos filtres."
                : "Ajoutez un événement en cliquant sur le bouton ci-dessus"}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default GestionDesEvenements;