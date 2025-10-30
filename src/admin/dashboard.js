'use client'
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Settings,
  FileText, 
  Image as ImageIcon, 
  Users,
  LogOut 
} from 'lucide-react';
import Videos from './video';
import Images from './images';
import Articles from './articles';
import Articles2 from './articles2';
import Articles3 from './articles3';
import User from './user';
import Apropos from './apropos';
import Articles4 from './articles4';
import Articles5 from './articles5';
import Articles6 from './articles6';
import Articlesactual from './articlesactual';

// import  authFetch  from './user';


// Move authFetch to a separate utils file to avoid circular imports
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Handle authentication error
    console.error('No token available');
    window.location.href = '/adm';
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const response = await fetch(url, { 
      ...options, 
      headers
    });
    
    if (response.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      window.location.href = '/adm';
      return;
    }
    
    if (!response.ok) {
      throw new Error('Request failed');
    }
    
    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

const AdminDashboard = () => {
  const apiUrl = "https://gabon-culture-urbaine-1.onrender.com";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user_info');
    
    // Redirect to login page
    window.location.href = '/adm';
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'videos':
        return <Videos searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
      case 'images':
        return <Images />;
      case 'articles':
        return <Articles />;
      case 'articles2':
        return <Articles2 />;
      case 'articles3':
        return <Articles3 />;
      case 'articles4': 
        return <Articles4 />;
      case 'articles5': 
        return <Articles5 />;
      case 'articles6': 
        return <Articles6 />;
      case 'articlesactual': 
        return <Articlesactual />;
      case 'users':
        return <User />;
      case 'apropos':
        return <Apropos />;
      
      default:
        return <div>Select a tab from the sidebar</div>;
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First check localStorage
        const localUser = JSON.parse(localStorage.getItem('user_info'));
        if (localUser) setCurrentUser(localUser);
        
        // Then verify with API
        const response = await authFetch(`${apiUrl}/api/auth/me`);
        const userData = await response.json();
        setCurrentUser(userData);
        localStorage.setItem('user_info', JSON.stringify(userData));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-blue-900 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col h-screen sticky top-0`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="bg-white text-blue-900 p-2 rounded font-bold">GCU</div>
              <span className="font-bold text-xl">TV Admin</span>
            </div>
          ) : null}
          <div className={`flex ${sidebarOpen ? '' : 'flex-grow justify-center'}`}>
            <button 
              onClick={toggleSidebar} 
              className="text-white focus:outline-none"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        
        <nav className="py-4 flex flex-col flex-grow">
          <button 
            onClick={() => setActiveTab('videos')}
            className={`flex items-center px-4 py-3 ${activeTab === 'videos' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <Home size={20} />
            {sidebarOpen && <span className="ml-3">Videos</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('images')}
            className={`flex items-center px-4 py-3 ${activeTab === 'images' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <ImageIcon size={20} />
            {sidebarOpen && <span className="ml-3">Images</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('articles')}
            className={`flex items-center px-4 py-3 ${activeTab === 'articles' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <FileText size={20} />
            {sidebarOpen && <span className="ml-3">Articles</span>}
          </button>

          <button 
            onClick={() => setActiveTab('articles2')}
            className={`flex items-center px-4 py-3 ${activeTab === 'articles2' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <FileText size={20} />
            {sidebarOpen && <span className="ml-3">Articles2</span>}
          </button>

          <button 
            onClick={() => setActiveTab('articles3')}
            className={`flex items-center px-4 py-3 ${activeTab === 'articles3' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <FileText size={20} />
            {sidebarOpen && <span className="ml-3">Articles3</span>}
          </button>

          <button 
            onClick={() => setActiveTab('articles4')}
            className={`flex items-center px-4 py-3 ${activeTab === 'articles4' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <FileText size={20} />
            {sidebarOpen && <span className="ml-3">Articles4</span>}
          </button>

          <button 
            onClick={() => setActiveTab('articles5')}
            className={`flex items-center px-4 py-3 ${activeTab === 'articles5' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <FileText size={20} />
            {sidebarOpen && <span className="ml-3">Articles5</span>}
          </button>

          <button 
            onClick={() => setActiveTab('articles6')}
            className={`flex items-center px-4 py-3 ${activeTab === 'articles6' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <FileText size={20} />
            {sidebarOpen && <span className="ml-3">Articles6</span>}
          </button>

          <button 
            onClick={() => setActiveTab('articlesactual')}
            className={`flex items-center px-4 py-3 ${activeTab === 'articlesactual' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <FileText size={20} />
            {sidebarOpen && <span className="ml-3">Articlesactual</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-3 ${activeTab === 'users' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
          >
            <Users size={20} />
            {sidebarOpen && <span className="ml-3">Users</span>}
          </button>
          
          <div className="mt-auto">
            <button 
              onClick={() => setActiveTab('apropos')}
              className={`flex items-center px-4 py-3 ${activeTab === 'apropos' ? 'bg-blue-800' : 'hover:bg-blue-800'} transition-colors`}
            >
              <Settings size={20} />
              {sidebarOpen && <span className="ml-3">Apropos</span>}
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">GCUTV Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {/* Notification icon commented out */}
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center">
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src={
                      currentUser?.image_url || 
                      `data:image/svg+xml;base64,${btoa(`
                        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100%" height="100%" fill="#1e3a8a"/>
                          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14">
                            ${currentUser?.username?.charAt(0) || 'A'}
                          </text>
                        </svg>
                      `)}`
                    }
                    alt="User avatar"
                    onError={(e) => {
                      // Fallback to empty avatar
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cud3Mub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSIxNiIgZmlsbD0iIzFlM2E4YSIvPjwvc3ZnPg==';
                      e.target.onerror = null; 
                    }}
                  />
                  <span className="ml-2 font-medium text-gray-800">
                    {currentUser?.username || 'Chargement...'}
                  </span>
                </div>

                <div className="border-l border-gray-300 h-8 mx-6"></div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut size={18} />
                  <span className="ml-3">Se déconnecter</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;