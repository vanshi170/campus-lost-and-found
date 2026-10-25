import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Compass,
  PlusCircle,
  FolderOpen,
  LogIn,
  LogOut,
  Sparkles,
  User,
  Home
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('You have been logged out.', 'info');
    navigate('/');
  };

  return (
    <nav className="navbar-dock" aria-label="Main Navigation">
      {/* Brand Logo & Name (Left) */}
      <Link to="/" className="navbar-brand">
        <div className="brand-icon-wrapper">
          <Sparkles size={18} />
        </div>
        <span>Found It</span>
      </Link>

      {/* Right Side Group: Links & Actions Equispaced */}
      <div className="navbar-right-group">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          <Home size={17} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/browse"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Compass size={17} />
          <span>Browse</span>
        </NavLink>

        <NavLink
          to="/post"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <PlusCircle size={17} />
          <span>Post Item</span>
        </NavLink>

        {isAuthenticated && (
          <NavLink
            to="/my-posts"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FolderOpen size={17} />
            <span>My Posts</span>
          </NavLink>
        )}

        {isAuthenticated ? (
          <>
            <div className="user-pill">
              <User size={14} style={{ opacity: 0.8 }} />
              <span>{user?.name?.split(' ')[0] || 'Student'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary nav-action-btn"
              title="Log out"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="btn-secondary nav-action-btn"
            >
              <LogIn size={15} />
              <span>Log in</span>
            </Link>
            <Link
              to="/register"
              className="btn-primary nav-action-btn"
            >
              <span>Register</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
