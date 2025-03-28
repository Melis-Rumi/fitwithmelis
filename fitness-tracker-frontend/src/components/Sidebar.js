import React, { useState, useContext } from 'react';
import { UserContext } from './UserContext';
import logo from '../images/logo.png';
import './Sidebar.css';

const Sidebar = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { username } = useContext(UserContext);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="app-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="logo">
          <a href="/home">
            <img src={logo} alt="MyLogo" className="logo-image" />
          </a>
        </div>
        <button className="menu-button" onClick={toggleMenu}>
          <span className="menu-icon"></span>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <nav className="nav-menu">
            <ul>
              <li>
                <a href="/home" className="nav-link">
                  <span className="nav-icon">🏠</span>
                  <span className="nav-text">Home</span>
                </a>
              </li>
              <li>
                <a href="/progress" className="nav-link">
                  <span className="nav-icon">📈</span>
                  <span className="nav-text">Progress</span>
                </a>
              </li>
              <li>
                <a href="/trainingprogram" className="nav-link">
                  <span className="nav-icon">💪</span>
                  <span className="nav-text">Training Program</span>
                </a>
              </li>
              <li>
                <a href="/profile" className="nav-link">
                  <span className="nav-icon">👤</span>
                  <span className="nav-text">Profile</span>
                </a>
              </li>
              {username === 'rumi' && (
                <li>
                  <a href="/clients" className="nav-link">
                    <span className="nav-icon">👥</span>
                    <span className="nav-text">Clients</span>
                  </a>
                </li>
              )}
            </ul>
          </nav>
          
          <div className="sidebar-footer">
            <a href="/logout" className="nav-link logout-link">
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Logout</span>
            </a>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
      ></div>

      {/* Main Content */}
      <main className={`main-content ${isMenuOpen ? 'shifted' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Sidebar;