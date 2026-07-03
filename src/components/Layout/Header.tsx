import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Bell, LogOut, Menu, User, Key } from 'lucide-react';

const Header = ({ toggleSidebar }: any) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  const handleChangePassword = () => {
    navigate('/change-password');
    setIsDropdownOpen(false);
  };

  return (
    <header className="dash-header">
      {/* Left */}
      <div className="d-flex align-items-center gap-3">
        <button onClick={toggleSidebar} className="menu-btn">
          <Menu size={22} />
        </button>
        <div className="header-logo">
          <div className="header-logo-icon">
            <TrendingUp size={20} style={{ color: '#fff' }} />
          </div>
          <span className="header-logo-text">Suryashakti</span>
        </div>
      </div>

      {/* Right */}
      <div className="d-flex align-items-center gap-3">
        <button className="header-btn">
          <Bell size={20} />
        </button>

        {/* Dropdown */}
        <div className="dropdown-container">
          <button
            className={`dropdown-trigger ${isDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="header-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="header-username">{user?.username || 'User'}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ color: '#6c757d' }}>
              <path d="M6 8L1 3h10z" fill="currentColor" />
            </svg>
          </button>

          {isDropdownOpen && (
            <>
              <div className="dropdown-menu">
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">{user?.username || 'User'}</div>
                  <div className="dropdown-user-email">{user?.email || 'user@example.com'}</div>
                </div>

                <button className="dropdown-item" onClick={handleProfile}>
                  <User size={18} /> Profile
                </button>

                <button className="dropdown-item" onClick={handleChangePassword}>
                  <Key size={18} /> Change Password
                </button>

                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
              <div className="dropdown-overlay" onClick={() => setIsDropdownOpen(false)} />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;