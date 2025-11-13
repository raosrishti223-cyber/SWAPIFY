import React, { useEffect, useState } from 'react';
import { api } from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import About from './pages/About';
import Contact from './pages/Contact';
import Feedbacks from './pages/Feedbacks';
import DeveloperDashboard from './pages/DeveloperDashboard';

function App(){
  const [token, setToken] = useState(localStorage.getItem('swapify_token') || '');
  const [page, setPage] = useState('login');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if(token) {
        try {
          localStorage.setItem('swapify_token', token);
          const user = await api('/auth/me', 'GET', null, token);
          setUserRole(user.role);
          setPage(user.role === 'developer' ? 'dev-dashboard' : 'dashboard');
        } catch (error) {
          console.error('Auth error:', error);
          setToken('');
          localStorage.removeItem('swapify_token');
        }
      } else {
        localStorage.removeItem('swapify_token');
        setUserRole('');
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const handleLogout = () => {
    setToken('');
    setPage('login');
  };

  const gotoPage = (pageName) => {
    setPage(pageName);
  };

  const goBack = () => {
    // If logged in, go back to dashboard, otherwise to login
    setPage(token ? 'dashboard' : 'login');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  }

  // Not logged in states
  if (!token) {
    if (page === 'login') {
      return <Login onLogin={(t) => setToken(t)} switchToRegister={() => gotoPage('register')} />;
    }
    if (page === 'register') {
      return <Register switchToLogin={() => gotoPage('login')} />;
    }

    // if (page === 'about') {
    //   return <About onBack={goBack} />;
    // }
    // if (page === 'contact') {
    //   return <Contact onBack={goBack} />;
    // }
    // For any other page, redirect to login
    return <Login onLogin={(t) => setToken(t)} switchToRegister={() => gotoPage('register')} />;
  }

  // Logged in states
  if (userRole === 'developer') {
    return (
      <div className="container">
        <div className="page-header">
          <h2>Developer Dashboard</h2>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
        <DeveloperDashboard token={token} />
      </div>
    );
  }

  switch (page) {
    case 'dashboard':
      return (
        <Dashboard
          token={token}
          onLogout={handleLogout}
          gotoBrowse={() => gotoPage('browse')}
          gotoAbout={() => gotoPage('about')}
          gotoContact={() => gotoPage('contact')}
          gotoFeedbacks={() => gotoPage('feedbacks')}
        />
      );
    case 'browse':
      return <Browse token={token} onBack={goBack} />;
    case 'about':
      return <About onBack={goBack} />;
    case 'contact':
      return <Contact onBack={goBack} />;
    case 'feedbacks':
      return <Feedbacks token={token} onBack={goBack} />;
    default:
      return null;
  }

}

export default App;
