import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FaBars, FaBell, FaGlobe, FaUserCircle } from 'react-icons/fa';

export default function Layout() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getLinks = () => {
    switch (user?.role) {
      case 'citizen': return [
        { to: '/dashboard', label: t('dashboard') },
        { to: '/live-map', label: 'Live Map' },
        { to: '/report', label: t('report') },
        { to: '/challenges', label: t('my_challenges') }
      ];
      case 'admin': return [
        { to: '/admin/dashboard', label: t('dashboard') },
        { to: '/admin/verification', label: 'Verification Queue' },
        { to: '/admin/matching', label: 'Matching' }
        ,{ to: '/admin/organizations', label: 'Project Tracking & Approvals' }
      ];
      case 'university_admin':
      case 'faculty_mentor':
      case 'student': return [
        { to: '/institution/directory', label: 'All Institutes' },
        ,{ to: '/institution/projects', label: 'Accepted Projects' }
        ,{ to: '/institution/collaboration', label: 'Industry Collaboration' }
        ,{ to: '/institution/dashboard', label: t('dashboard') }
      ];
      case 'industry_partner': return [
        { to: '/industry/directory', label: 'All Industries' },
        { to: '/industry/collaborations', label: 'Matched Projects' },
        { to: '/industry/interests', label: 'Collaboration Requests' },
        { to: '/industry/accepted', label: 'Accepted Collaboration' },
        { to: '/industry/dashboard', label: t('dashboard') }
      ];
      default: return [];
    }
  };

  const links = user?.role === 'admin' || user?.role === 'govt_official' || ['university_admin', 'faculty_mentor', 'student', 'industry_partner'].includes(user?.role) ? getLinks() : [...getLinks(), { to: '/notifications', label: t('notifications') }];

  return (
    <div className="shell">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand" style={{ marginBottom: '20px' }}>
          <img className="brand-logo" src="/samvedana-setu-logo.svg" alt="Samvedana Setu logo" />
          <div><b>Samvedana Setu</b><small>AI civic bridge</small></div>
        </div>
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`nav-item ${location.pathname === l.to ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            {l.label}
          </Link>
        ))}
        <button className="nav-item mt-16" onClick={logout}>{t('logout')}</button>
      </div>
      <div className={`sidebar-back ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      
      <div className="main">
        <header className="topbar">
          <button className="hamburger icon-btn" onClick={() => setSidebarOpen(true)}><FaBars /></button>
          <div className="topbar-spacer"></div>
          <span className="proto-badge">Prototype Demo</span>
          <button className="icon-btn" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}><FaGlobe /></button>
          {user?.role !== 'admin' && user?.role !== 'govt_official' && <button className="icon-btn" onClick={() => navigate('/notifications')}><FaBell /></button>}
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
        </header>
        
        <div className="content mt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
