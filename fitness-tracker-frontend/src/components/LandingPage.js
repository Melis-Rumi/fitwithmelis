import React, { useEffect } from 'react';
import './LandingPage.css';

const LandingPage = () => {
  useEffect(() => {
    // Smooth scroll initialization
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }, []);

  return (
    <div className="landing-container">
      {/* Hero Section with Name */}
      <section className="hero-section">
        <div className="name-container">
          <h1 className="name-title">Melis Zhalalov</h1>
          <div className="subtitle">Personal Trainer & Fitness Coach</div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="auth-buttons">
          <a href="/intro">
            <button className="btn btn-primary">I'm interested!</button>
          </a>
          <a href="/login">
            <button className="btn btn-secondary">Login</button>
          </a>
        </div>
        
        {/* Scroll Indicator */}
        <a href="#bio" className="scroll-indicator">
          <span className="scroll-text">Scroll to learn more</span>
          <div className="scroll-arrow"></div>
        </a>
      </section>

      {/* Image Section */}
      <section className="image-section">
        <div className="image-container">
          <div className="background-image"></div>
          <div className="image-overlay"></div>
        </div>
      </section>

      {/* Bio Section */}
      <section id="bio" className="bio-section">
        <div className="bio-container">
          <h2 className="bio-title">About Me</h2>
          <p className="bio-text">
            With a background in both natural bodybuilding and amateur boxing, 
            I know what it takes to push your limits and achieve your fitness goals. 
            Now, my passion is helping YOU become stronger, healthier, and happier—whether 
            that's through lifting heavy metal or just feeling your best every day.
          </p>
          <p className="bio-text">
            Whether you're aiming to build muscle, lose weight, or improve your overall fitness,
            I'll be there every step of the way to guide you with expert knowledge, motivation, 
            and a focus on perfect form. If you're ready to transform your body and mind,
            let's work together to lift you to new heights!
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;