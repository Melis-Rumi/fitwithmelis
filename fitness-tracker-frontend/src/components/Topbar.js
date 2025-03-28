import React, { useState } from 'react';
import './Topbar.css';

const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="topbar">
      <div className="logo">MyLogo</div>
      <div className="menu-icon" onClick={toggleMenu}>
        ☰
      </div>
      {isMenuOpen && (
        <div className="menu-dropdown">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
      )}
    </div>
  );
};

export default Topbar;