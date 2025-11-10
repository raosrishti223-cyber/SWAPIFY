import React from 'react';
export default function About({ onBack }) {
  return (
    <div className='container'>
      <div className="page-header">
        <button onClick={onBack} className="back-btn">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h2>About Swapify</h2>
      </div>
      <div className="about-content">
        <div className="about-section">
          <h3><i className="fas fa-handshake"></i> Our Mission</h3>
          <p>Swapify is a peer-to-peer skill exchange platform built for learning and teaching without monetary transactions. We believe in the power of knowledge sharing and community learning.</p>
        </div>
        
        <div className="about-section">
          <h3><i className="fas fa-users"></i> How It Works</h3>
          <ul>
            <li>List your teaching and learning skills</li>
            <li>Browse other users' skills</li>
            <li>Send and receive skill exchange requests</li>
            <li>Connect and start learning together</li>
          </ul>
        </div>

        <div className="about-section">
          <h3><i className="fas fa-star"></i> Core Values</h3>
          <ul>
            <li>Community-driven learning</li>
            <li>Knowledge sharing</li>
            <li>Mutual growth</li>
            <li>Trust and respect</li>
          </ul>
        </div>

        <div className="team-section">
          <h3><i className="fas fa-heart"></i> Our Team</h3>
          <div className="team-members">
            <div className="team-member">
              <i className="fas fa-user-circle"></i>
              <h4>Srishti Rao</h4>
            </div>
            <div className="team-member">
              <i className="fas fa-user-circle"></i>
              <h4>Shwetha S</h4>
            </div>
            <div className="team-member">
              <i className="fas fa-user-circle"></i>
              <h4>Spoorthi T</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
