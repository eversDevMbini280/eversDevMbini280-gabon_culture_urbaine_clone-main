"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Settings,
  FileText,
  Image as ImageIcon,
  Users,
  LogOut,
  Tag,
  Calendar,
  Briefcase,
  FlaskConical,
  Music,
  Palette,
  Newspaper,
  Layers,
} from "lucide-react";
import Videos from "./video";
import Images from "./images";
import Articles from "./articles";
import GestionDesEvenements from "./evenements";
import GestionDeEntrepreneuriat from "./entrepreneuriat";
import User from "./user";
import Apropos from "./apropos";
import GestionDesArticlesScientifiques from "./scientifiques";
import Articles5 from "./cultureUrbaine";
import Articles6 from "./artsEtTraditions";
import Articlesactual from "./articlesactual";
import Categories from "./categories";
import Sections from "./sections";

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No token available");
    window.location.href = "/adm";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/adm";
      return;
    }

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

const AdminDashboard = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");
    window.location.href = "/adm";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "videos":
        return (
          <Videos
            apiUrl={apiUrl}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case "images":
        return <Images apiUrl={apiUrl} />;
      case "articles":
        return <Articles apiUrl={apiUrl} />;
      case "evenements":
        return <GestionDesEvenements apiUrl={apiUrl} />;
      case "entrepreneuriat":
        return <GestionDeEntrepreneuriat apiUrl={apiUrl} />;
      case "sciences":
        return <GestionDesArticlesScientifiques apiUrl={apiUrl} />;
      case "culture-urbaine":
        return <Articles5 apiUrl={apiUrl} />;
      case "arts-traditions":
        return <Articles6 apiUrl={apiUrl} />;
      case "actualites":
        return <Articlesactual apiUrl={apiUrl} />;
      case "users":
        return <User apiUrl={apiUrl} />;
      case "apropos":
        return <Apropos apiUrl={apiUrl} />;
      case "categories":
        return <Categories apiUrl={apiUrl} authFetch={authFetch} />;
      case "sections":
        return <Sections apiUrl={apiUrl} />;
      default:
        return <div>Sélectionnez un onglet dans le menu latéral</div>;
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem("user_info"));
        if (localUser) setCurrentUser(localUser);

        const response = await authFetch(`${apiUrl}/api/auth/me`);
        const userData = await response.json();
        setCurrentUser(userData);
        localStorage.setItem("user_info", JSON.stringify(userData));
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [apiUrl]);

  const navItems = [
    { tab: "videos",          label: "Vidéos",          icon: <Home size={20} /> },
    { tab: "images",          label: "Images",          icon: <ImageIcon size={20} /> },
    { tab: "articles",        label: "Articles",        icon: <FileText size={20} /> },
    { tab: "evenements",      label: "Événements",      icon: <Calendar size={20} /> },
    { tab: "entrepreneuriat", label: "Entrepreneuriat", icon: <Briefcase size={20} /> },
    { tab: "sciences",        label: "Sciences",        icon: <FlaskConical size={20} /> },
    { tab: "culture-urbaine", label: "Culture Urbaine", icon: <Music size={20} /> },
    { tab: "arts-traditions", label: "Arts & Traditions", icon: <Palette size={20} /> },
    { tab: "actualites",      label: "Actualités",      icon: <Newspaper size={20} /> },
    { tab: "categories",      label: "Catégories",      icon: <Tag size={20} /> },
    { tab: "sections",        label: "Sections",        icon: <Layers size={20} /> },
    { tab: "users",           label: "Utilisateurs",    icon: <Users size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-blue-900 text-white ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 flex flex-col h-screen sticky top-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="bg-white text-blue-900 p-2 rounded font-bold">
                GCU
              </div>
              <span className="font-bold text-xl">TV Admin</span>
            </div>
          ) : null}
          <div
            className={`flex ${sidebarOpen ? "" : "flex-grow justify-center"}`}
          >
            <button
              onClick={toggleSidebar}
              className="text-white focus:outline-none"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="py-4 flex flex-col flex-grow overflow-y-auto">
          {navItems.map(({ tab, label, icon }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center px-4 py-3 ${
                activeTab === tab ? "bg-blue-800" : "hover:bg-blue-800"
              } transition-colors`}
            >
              {icon}
              {sidebarOpen && <span className="ml-3">{label}</span>}
            </button>
          ))}

          <div className="mt-auto">
            <button
              onClick={() => setActiveTab("apropos")}
              className={`flex items-center px-4 py-3 w-full ${
                activeTab === "apropos" ? "bg-blue-800" : "hover:bg-blue-800"
              } transition-colors`}
            >
              <Settings size={20} />
              {sidebarOpen && <span className="ml-3">À propos</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              GCUTV Admin Panel
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={
                      currentUser?.image_url ||
                      `data:image/svg+xml;base64,${btoa(`
                        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100%" height="100%" fill="#1e3a8a"/>
                          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14">
                            ${currentUser?.username?.charAt(0) || "A"}
                          </text>
                        </svg>
                      `)}`
                    }
                    alt="User avatar"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cud3Mub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSIxNiIgZmlsbD0iIzFlM2E4YSIvPjwvc3ZnPg==";
                      e.target.onerror = null;
                    }}
                  />
                  <span className="ml-2 font-medium text-gray-800">
                    {currentUser?.username || "Chargement..."}
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
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;