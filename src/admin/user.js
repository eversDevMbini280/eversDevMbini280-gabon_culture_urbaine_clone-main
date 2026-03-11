'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Eye, EyeOff, Loader2, CheckCircle, AtSign, Shield, AlertCircle } from 'lucide-react';
import { authFetch } from './auth';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>]/g, '');
};

const styles = `
  .usr-list-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px;
    box-shadow:0 30px 60px rgba(0,0,0,0.45);
    overflow:hidden;
  }
  .usr-list-header {
    padding:18px 20px;
    border-bottom:1px solid rgba(255,255,255,0.06);
    display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;
  }
  .usr-table { width:100%; border-collapse:collapse; }
  .usr-table thead th {
    text-align:left; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase;
    color:rgba(255,255,255,0.35); padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .usr-table tbody td {
    padding:12px 16px; font-size:0.85rem; color:rgba(255,255,255,0.7);
    border-bottom:1px solid rgba(255,255,255,0.04);
  }
  .usr-table tbody tr:hover { background:rgba(255,255,255,0.03); }
  .usr-pill {
    display:inline-flex; align-items:center; padding:3px 10px; border-radius:999px;
    font-size:0.72rem; font-weight:600; border:1px solid;
  }
  .usr-pill.admin { background:rgba(139,92,246,0.12); color:#c4b5fd; border-color:rgba(139,92,246,0.25); }
  .usr-pill.editor { background:rgba(59,130,246,0.12); color:#93c5fd; border-color:rgba(59,130,246,0.25); }
  .usr-pill.active { background:rgba(34,197,94,0.12); color:#4ade80; border-color:rgba(34,197,94,0.25); }
  .usr-pill.disabled { background:rgba(239,68,68,0.12); color:#fca5a5; border-color:rgba(239,68,68,0.25); }
  .usr-action-btn {
    display:inline-flex; align-items:center; justify-content:center;
    width:30px; height:30px; border-radius:8px;
    border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03);
    color:rgba(255,255,255,0.45); transition:all 0.15s;
  }
  .usr-action-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }
  .usr-action-btn.edit:hover { background:rgba(99,102,241,0.15); color:#a5b4fc; border-color:rgba(99,102,241,0.35); }
  .usr-action-btn.del:hover { background:rgba(239,68,68,0.15); color:#fca5a5; border-color:rgba(239,68,68,0.35); }

  .usr-form-shell {
    background:#0f0f13;
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px;
    padding:28px;
    box-shadow:0 30px 60px rgba(0,0,0,0.45);
    margin-top:24px;
  }
  .usr-form-title { font-size:1.2rem; font-weight:700; color:#fff; margin-bottom:16px; display:flex; align-items:center; gap:10px; }
  .usr-form-title span { display:inline-block; width:6px; height:20px; background:linear-gradient(135deg,#3b82f6,#2563eb); border-radius:3px; }
  .usr-label {
    display:block; font-size:0.7rem; font-weight:600;
    color:rgba(255,255,255,0.45); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px;
  }
  .usr-input, .usr-select {
    width:100%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:12px 14px;
    font-size:0.875rem; font-family:inherit; color:#f0f0f5;
    outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
  }
  .usr-input::placeholder { color:rgba(255,255,255,0.25); }
  .usr-input:focus, .usr-select:focus {
    border-color:rgba(59,130,246,0.6);
    background:rgba(59,130,246,0.06);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .usr-actions { display:flex; justify-content:flex-end; gap:12px; flex-wrap:wrap; margin-top:10px; }
  .usr-btn-ghost {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 18px; border-radius:12px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.7); font-size:0.875rem; font-weight:600;
    transition:all 0.2s;
  }
  .usr-btn-ghost:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .usr-btn-primary {
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 20px; border-radius:12px; border:none;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    color:#fff; font-size:0.875rem; font-weight:700; letter-spacing:0.02em;
    box-shadow:0 4px 20px rgba(59,130,246,0.35); transition:all 0.2s;
  }
  .usr-btn-primary:hover:not(:disabled){transform:translateY(-1px); box-shadow:0 8px 28px rgba(59,130,246,0.5);}
  .usr-btn-primary:disabled{opacity:0.5; cursor:not-allowed;}
`;

const User = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000", searchQuery }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'editor'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const checkOnlineStatus = (lastActivity) => {
    if (!lastActivity) return false;
    const lastActive = new Date(lastActivity).getTime();
    const now = Date.now();
    return Math.abs(now - lastActive) < 300000;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setApiError('');
      try {
        const response = await authFetch(`${apiUrl}/api/auth/users`);
        const usersData = await response.json();
        setUsers(usersData);
      } catch (error) {
        setApiError(error.message);
        if (error.message.includes('Authentication') || error.message.includes('401')) {
          setTimeout(() => { window.location.href = '/adm'; }, 3000);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [searchQuery, apiUrl]);

  const handleAddUser = () => {
    setShowForm(true);
    setSuccessMessage('');
    setErrors({});
    setFormData({ username: '', email: '', password: '', confirmPassword: '', role: 'editor' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Le nom complet est requis';
    else if (formData.username.length < 3) newErrors.username = 'Le nom complet doit avoir au moins 3 caractères';

    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "L'email est invalide";

    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit avoir au moins 8 caractères';
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Le mot de passe doit contenir au moins une majuscule';
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Le mot de passe doit contenir au moins un chiffre';

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setApiError('');

    try {
      const url = formData.id ? `${apiUrl}/api/auth/users/${formData.id}` : `${apiUrl}/api/auth/register`;
      const method = formData.id ? 'PUT' : 'POST';
      const body = {
        username: sanitizeInput(formData.username),
        email: sanitizeInput(formData.email),
        role: sanitizeInput(formData.role)
      };
      if (formData.password) body.password = formData.password;

      await authFetch(url, { method, body: JSON.stringify(body) });

      const usersResponse = await authFetch(`${apiUrl}/api/auth/users`);
      const usersData = await usersResponse.json();
      setUsers(usersData);

      setSuccessMessage(formData.id ? 'Utilisateur mis à jour avec succès' : 'Utilisateur créé avec succès');
      setShowForm(false);
      setFormData({ username: '', email: '', password: '', confirmPassword: '', role: 'editor' });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (userId) => {
    try {
      const user = await authFetch(`${apiUrl}/api/auth/users/${userId}`);
      const userData = await user.json();
      setFormData({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        password: '',
        confirmPassword: '',
        role: userData.role
      });
      setShowForm(true);
    } catch (error) {
      setErrors({ submit: 'Failed to load user data' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await authFetch(`${apiUrl}/api/auth/users/${userId}`, { method: 'DELETE' });
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        setSuccessMessage('Utilisateur supprimé avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <style>{styles}</style>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion des utilisateurs</h3>
          <p className="text-sm text-gray-500">Gérez les comptes administrateurs et éditeurs</p>
        </div>
        <button onClick={handleAddUser} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      <div className="usr-list-shell">
        <div className="usr-list-header">
          <div>
            <div className="text-white font-semibold">Liste des utilisateurs</div>
            <div className="text-sm text-white/50">Comptes administrateurs et éditeurs</div>
          </div>
        </div>

        {apiError && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 text-red-200 border border-red-500/30 rounded-md">
            {apiError}
          </div>
        )}
        {successMessage && (
          <div className="mx-4 mt-4 p-3 bg-green-500/10 text-green-200 border border-green-500/30 rounded-md flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="p-6 text-center text-gray-400">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-400" />
            <p className="mt-2">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="usr-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Statut compte</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Aucun utilisateur trouvé</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold border border-blue-500/30">
                            {user.username.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-100">{user.username}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`usr-pill ${user.role === 'admin' ? 'admin' : 'editor'}`}>{user.role}</span></td>
                      <td><span className={`usr-pill ${user.disabled ? 'disabled' : 'active'}`}>{user.disabled ? 'Désactivé' : 'Activé'}</span></td>
                      <td>
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full ${checkOnlineStatus(user.last_activity) ? 'bg-green-400' : 'bg-gray-500'}`} />
                          <span className="ml-2 text-sm text-gray-300">{checkOnlineStatus(user.last_activity) ? 'En ligne' : 'Hors ligne'}</span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-300">{user.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : 'Jamais connecté'}</td>
                      <td className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <button onClick={() => handleEditUser(user.id)} className="usr-action-btn edit" title="Modifier">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="usr-action-btn del" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="usr-form-shell">
          <div className="flex justify-between items-center mb-6">
            <h2 className="usr-form-title"><span />{formData.id ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2>
            <button onClick={() => setShowForm(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="username" className="usr-label">Nom complet</label>
              <div className="relative">
                <input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="usr-input" placeholder="Jean Dupont" />
                {errors.username && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="usr-label">Adresse Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-500" />
                </div>
                <input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="usr-input pl-10" placeholder="jean.dupont@example.com" />
                {errors.email && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="password" className="usr-label">Mot de passe</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="usr-input" placeholder="••••••••" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-blue-300 transition-colors focus:outline-none">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="usr-label">Confirmer le mot de passe</label>
                <div className="relative">
                  <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="usr-input" placeholder="••••••••" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500 hover:text-blue-300 transition-colors focus:outline-none">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>
            </div>

            {errors.password && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.password}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <label className="usr-label">Type de compte</label>
              <div className="grid grid-cols-2 gap-3">
                {['editor', 'admin'].map((role) => (
                  <div
                    key={role}
                    onClick={() => setFormData({ ...formData, role })}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      formData.role === role
                        ? 'border-blue-400 bg-blue-500/10 text-blue-200'
                        : 'border-white/10 text-white/50 hover:text-blue-200 hover:border-blue-300/30'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setFormData({ ...formData, role })}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      {formData.role === role ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : role === 'admin' ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <Edit className="w-5 h-5" />
                      )}
                      <span className="capitalize font-medium">{role === 'admin' ? 'Administrateur' : 'Éditeur'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            <div className="usr-actions">
              <button type="button" onClick={() => setShowForm(false)} className="usr-btn-ghost">Annuler</button>
              <button type="submit" className="usr-btn-primary flex items-center gap-2" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {formData.id ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default User;
