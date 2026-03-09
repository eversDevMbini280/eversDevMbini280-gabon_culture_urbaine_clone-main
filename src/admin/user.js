'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Eye, EyeOff, Loader2, CheckCircle, AtSign, Shield, AlertCircle } from 'lucide-react';
import { authFetch } from './auth'; // Import from separate file

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>]/g, '');
};

const User = ({ apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000", searchQuery }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    
    // Convert ISO string to timestamp
    const lastActive = new Date(lastActivity).getTime();
    const now = Date.now();
    
    // Ensure positive difference calculation
    return Math.abs(now - lastActive) < 300000; // 5 minutes
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setApiError('');
      
      try {
        const response = await authFetch(`${apiUrl}/api/auth/users`);
        
        const usersData = await response.json();
        console.log("Users fetched successfully:", usersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Fetch users error:', error);
        setApiError(error.message);
        if (error.message.includes('Authentication') || error.message.includes('401')) {
          setTimeout(() => {
            window.location.href = '/adm';
          }, 3000);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [searchQuery, apiUrl]);

  const handleAddUser = () => {
    setIsModalOpen(true);
    setSuccessMessage('');
    setErrors({});
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'editor'
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Le nom complet est requis";
    } else if (formData.username.length < 3) {
      newErrors.username = "Le nom complet doit avoir au moins 3 caractères";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email est invalide";
    }
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit avoir au moins 8 caractères";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une majuscule";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins un chiffre";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
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
      const url = formData.id 
        ? `${apiUrl}/api/auth/users/${formData.id}`
        : `${apiUrl}/api/auth/register`;
  
      const method = formData.id ? 'PUT' : 'POST';
  
      const body = {
        username: sanitizeInput(formData.username),
        email: sanitizeInput(formData.email),
        role: sanitizeInput(formData.role)
      };
  
      if (formData.password) {
        body.password = formData.password;
      }
  
      const response = await authFetch(url, {
        method: method,
        body: JSON.stringify(body)
      });
  
      // Refresh user list
      const usersResponse = await authFetch(`${apiUrl}/api/auth/users`);
      const usersData = await usersResponse.json();
      setUsers(usersData);
  
      setSuccessMessage(formData.id 
        ? "Utilisateur mis à jour avec succès" 
        : "Utilisateur créé avec succès");
  
      setIsModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'editor'
      });
  
    } catch (error) {
      console.error('Operation error:', error);
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
      setIsModalOpen(true);
      
    } catch (error) {
      console.error('Error fetching user:', error);
      setErrors({ submit: "Failed to load user data" });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await authFetch(`${apiUrl}/api/auth/users/${userId}`, {
          method: 'DELETE'
        });
        
        setUsers(prev => prev.filter(user => user.id !== userId));
        setSuccessMessage("Utilisateur supprimé avec succès");
        
        setTimeout(() => setSuccessMessage(''), 3000);
        
      } catch (error) {
        console.error('Delete error:', error);
        setErrors({ submit: error.message });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Gestion des utilisateurs</h3>
          <p className="text-sm text-gray-500 mt-1">Gérez les comptes administrateurs et éditeurs</p>
          {apiError && (
            <div className="mt-2 text-sm text-red-600 p-2 bg-red-50 rounded">
              {apiError}
            </div>
          )}
          {successMessage && (
            <div className="mt-2 text-sm text-green-600 p-2 bg-green-50 rounded flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}
        </div>
        <button 
          onClick={handleAddUser}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {isLoading && (
        <div className="p-6 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
          <p className="mt-2 text-gray-500">Chargement des utilisateurs...</p>
        </div>
      )}

      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut compte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière connexion</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                          {user.username.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.disabled ? 'Désactivé' : 'Activé'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full ${
                          checkOnlineStatus(user.last_activity) ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="ml-2 text-sm">
                          {checkOnlineStatus(user.last_activity) ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? 
                        new Date(user.last_login).toLocaleString('fr-FR') : 
                        'Jamais connecté'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button 
                          onClick={() => handleEditUser(user.id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50" 
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" 
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
            
            <div className="relative p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {formData.id ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.id ? "Modifier les informations de l'utilisateur" : "Ajouter un nouveau compte administrateur ou éditeur"}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username field */}
                <div className="space-y-1">
                  <label 
                    htmlFor="username" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom complet
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        errors.username ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Jean Dupont"
                    />
                {errors.username && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700"
              >
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    errors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="jean.dupont@example.com"
                />
                {errors.email && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`w-full pr-10 pl-4 py-2.5 rounded-lg border ${
                      errors.password ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className={`w-full pr-10 pl-4 py-2.5 rounded-lg border ${
                      errors.confirmPassword ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password error message */}
            {errors.password && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.password}</span>
              </div>
            )}

            {/* Role Selection Section */}
            <div className="space-y-2 pt-1">
              <label className="block text-sm font-medium text-gray-700">Type de compte</label>
              <div className="grid grid-cols-2 gap-3">
                {['editor', 'admin'].map((role) => (
                  <div
                    key={role}
                    onClick={() => setFormData({...formData, role})}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.role === role 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-blue-200 text-gray-600 hover:text-blue-600'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setFormData({...formData, role})}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      {formData.role === role ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : role === 'admin' ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <Edit className="w-5 h-5" />
                      )}
                      <span className="capitalize font-medium">
                        {role === 'admin' ? 'Administrateur' : 'Éditeur'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form submission error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{errors.submit}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-medium transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 mt-6"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </div>
              ) : (
                "Créer le compte utilisateur"
              )}
            </button>
          </form>
   
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default User;
