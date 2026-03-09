// 'use client'
// import React, { useState, useEffect } from 'react';
// import { LogIn, Lock, User, AlertCircle } from 'lucide-react';
// import { motion } from 'framer-motion';

// const AdminLoginPage = () => {
//   const apiUrl = "https://gabon-culture-urbaine-1.onrender.com";
  
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [backgroundImageUrl, setBackgroundImageUrl] = useState(`${apiUrl}/api/images/direct-tv.jpg`);
  
//   const handleImageError = (placeholderText, size = { width: 800, height: 300 }, color = '4f46e5') => {
//     const width = size.width;
//     const height = size.height;
    
//     const placeholderUrl = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText)}&color=${color}`;
//     setBackgroundImageUrl(placeholderUrl);
//   };
  
//   const handleLogin = async (e) => {
//     e.preventDefault();
    
//     if (!username || !password) {
//       setError('Veuillez remplir tous les champs');
//       return;
//     }
    
//     setError('');
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(`${apiUrl}/api/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams({
//           username: username,
//           password: password,
//           grant_type: 'password'
//         })
//       });
      
//       if (response.ok) {
//         const data = await response.json();
        
//         localStorage.setItem('token', data.access_token);
//         localStorage.setItem('refresh_token', data.refresh_token);
//         localStorage.setItem('user_info', JSON.stringify({
//           id: data.user_info.id,
//           username: data.user_info.username,
//           email: data.user_info.email,
//           role: data.user_info.role,
//           image_url: data.user_info.image_url || ''
//         }));
        
//         window.location.href = '/admin/dashboard';
//       } else {
//         const errorData = await response.json();
//         setError(errorData.detail || 'Échec de la connexion');
//       }
//     } catch (err) {
//       setError('Erreur de connexion au serveur');
//       console.error('Login error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   useEffect(() => {
//     const img = new Image();
//     img.src = backgroundImageUrl;
    
//     img.onerror = () => {
//       handleImageError('GCUTV Direct', { width: 1920, height: 1080 }, '1e3a8a');
//     };
//   }, [backgroundImageUrl]);

//   return (
//     <main 
//       className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
//       style={{ backgroundImage: `url(${backgroundImageUrl})` }}
//     >
//       <div className="fixed inset-0 bg-black/70"></div>
      
//       <div className="max-w-7xl w-full px-4 py-12 relative z-10">
//         <div className="max-w-md mx-auto">
//           <motion.div 
//             className="bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)]"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4, duration: 0.5 }}
//           >
//             <div className="bg-blue-600 text-white p-4 flex items-center justify-center gap-2">
//               <LogIn className="w-5 h-5" />
//               <h2 className="font-bold text-lg">Connexion Administrateur</h2>
//             </div>
            
//             <form onSubmit={handleLogin} className="p-6 text-white">
//               {error && (
//                 <div className="bg-red-900/50 border border-red-500 text-red-200 rounded-lg p-3 mb-6 flex items-start gap-2">
//                   <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
//                   <p className="text-sm leading-relaxed">{error}</p>
//                 </div>
//               )}
              
//               <div className="space-y-6">
//                 <div>
//                   <label htmlFor="username" className="block text-gray-300 mb-2 text-sm font-medium">
//                     Nom d'utilisateur
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                       <User className="w-5 h-5 text-gray-500" />
//                     </div>
//                     <input
//                       type="text"
//                       id="username"
//                       value={username}
//                       onChange={(e) => setUsername(e.target.value)}
//                       className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 transition-colors"
//                       placeholder="Entrez votre nom d'utilisateur"
//                     />
//                   </div>
//                 </div>
                
//                 <div>
//                   <label htmlFor="password" className="block text-gray-300 mb-2 text-sm font-medium">
//                     Mot de passe
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                       <Lock className="w-5 h-5 text-gray-500" />
//                     </div>
//                     <input
//                       type="password"
//                       id="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 transition-colors"
//                       placeholder="Entrez votre mot de passe"
//                     />
//                   </div>
//                 </div>
                
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-900 font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
//                 >
//                   {isLoading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
//                       Connexion en cours...
//                     </span>
//                   ) : (
//                     'Se connecter'
//                   )}
//                 </button>
//               </div>
//             </form>
//           </motion.div>
          
//           <motion.div
//             className="mt-8 text-center text-gray-300"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.7, duration: 0.5 }}
//           >
//             <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-sm leading-relaxed">
//               <p className="mb-3">
//                 Toutes les tentatives de connexion sont enregistrées à des fins de sécurité.
//               </p>
//               <p className="mb-4">
//                 En cas de difficulté à vous connecter, veuillez contacter l'administrateur ou le responsable technique.
//               </p>
//               <hr className="border-gray-600 mb-3" />
//               <p className="font-medium text-white">
//                 Développé par <span className="text-blue-400 font-bold">Emane-Tech</span>
//               </p>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </main>
//   );
// };

// export default AdminLoginPage;


'use client'
import React, { useState, useEffect } from 'react';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Navigation from '@/components/navigation';

const AdminLoginPage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(`${apiUrl}/api/images/direct-tv.jpg`);
  
  const handleImageError = (placeholderText, size = { width: 800, height: 300 }, color = '4f46e5') => {
    const width = size.width;
    const height = size.height;
    
    const placeholderUrl = `${apiUrl}/api/placeholder/${width}/${height}?text=${encodeURIComponent(placeholderText)}&color=${color}`;
    setBackgroundImageUrl(placeholderUrl);
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password,
          grant_type: 'password'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_info', JSON.stringify({
          id: data.user_info.id,
          username: data.user_info.username,
          email: data.user_info.email,
          role: data.user_info.role,
          image_url: data.user_info.image_url || ''
        }));
        
        window.location.href = '/admin/dashboard';
      } else {
        const errorData = await response.json();
        // Temporairement: logique de blocage désactivée.
        setError(errorData.detail || 'Échec de la connexion');
      }
    } catch (err) {
      // Temporairement: logique de blocage désactivée.
      setError('Erreur de connexion au serveur.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImageUrl;
    
    img.onerror = () => {
      handleImageError('GCUTV Direct', { width: 1920, height: 1080 }, '1e3a8a');
    };
  }, [backgroundImageUrl]);

  return (
    <>
      <div className="relative z-50">
        <Navigation />
      </div>
      <main 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed pt-20"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
      <div className="fixed inset-0 bg-black/70 z-10"></div>
      
      <div className="max-w-7xl w-full px-4 py-12 relative z-20">
        <div className="max-w-md mx-auto">
          <motion.div 
            className="bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-blue-600 text-white p-4 flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              <h2 className="font-bold text-lg">Connexion Administrateur</h2>
            </div>
            
            <form onSubmit={handleLogin} className="p-6 text-white">
              {error && (
                <div className="border rounded-lg p-3 mb-6 flex items-start gap-2 bg-red-900/50 border-red-500 text-red-200">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              )}
              
              {/* Temporairement: compteur de tentatives et blocage désactivés */}
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-gray-300 mb-2 text-sm font-medium">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 transition-colors"
                      placeholder="Entrez votre nom d'utilisateur"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-gray-300 mb-2 text-sm font-medium">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 transition-colors"
                      placeholder="Entrez votre mot de passe"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors mt-6 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-900 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Connexion en cours...
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
          
          <motion.div
            className="mt-8 text-center text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-sm leading-relaxed">
              <p className="mb-3">
                Toutes les tentatives de connexion sont enregistrées à des fins de sécurité.
              </p>
              <p className="mb-4">
                En cas de difficulté à vous connecter, veuillez contacter l'administrateur ou le responsable technique.
              </p>
              <hr className="border-gray-600 mb-3" />
              <p className="font-medium text-white">
                Développé par <span className="text-blue-400 font-bold">Emane-Tech</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
    </>
  );
};

export default AdminLoginPage;
