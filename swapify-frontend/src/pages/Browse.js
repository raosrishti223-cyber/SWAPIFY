import React, { useEffect, useState } from 'react';
import { api } from '../api';

// Feedback Modal Component
const FeedbackModal = ({ user, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(rating, message);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Give Feedback to {user.name}</h3>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="rating-select">
            <label>Rating:</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fas fa-star ${star <= rating ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  style={{ cursor: 'pointer', color: star <= rating ? '#f1c40f' : '#ddd' }}
                ></i>
              ))}
            </div>
          </div>
          <div className="message-input">
            <label>Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your feedback here..."
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-btn">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

// Browse Component
const Browse = ({ token, onBack }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  async function search(e){ 
    e.preventDefault(); 
    setLoading(true);
    try {
      const res = await api('/skills/browse?q='+encodeURIComponent(query),'GET', null, token); 
      setResults(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function sendRequest(toUserId){
    const offeredSkill = { name: prompt('Which of your skills will you offer? (exact name)') || '' };
    const requestedSkill = { name: prompt('Which of their skills do you want? (exact name)') || '' };
    if(!offeredSkill.name || !requestedSkill.name) return alert('Cancelled');
    try {
      await api('/requests/send','POST',{ toUserId, offeredSkill, requestedSkill }, token);
      alert('Request sent successfully!');
    } catch (error) {
      alert('Failed to send request. Please try again.');
    }
  }

  async function submitFeedback(toUserId, rating, message) {
    try {
      await api('/feedback/submit', 'POST', {
        toUserId,
        rating,
        message,
        isContactFeedback: false
      }, token);
      alert('Feedback submitted successfully!');
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
    }
  }

  return (
    <div className='container'>
      <div className="page-header">
        <button onClick={onBack} className="back-btn">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h2>Browse Skills</h2>
      </div>

      <form onSubmit={search} className="search-form">
        <div className="search-input-container">
          <i className="fas fa-search search-icon"></i>
          <input 
            className="search-input"
            placeholder="Search skills or category" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
          />
        </div>
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? (
            <><i className="fas fa-spinner fa-spin"></i> Searching...</>
          ) : (
            <><i className="fas fa-search"></i> Search</>
          )}
        </button>
      </form>

      <div className="skills-results">
        {results.map(u => (
          <div key={u._id} className="skill-card">
            <div className="skill-header">
              <div className="user-info">
                <i className="fas fa-user-circle"></i>
                <h3>{u.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedUser(u)}
                className="feedback-btn"
              >
                <i className="fas fa-star"></i>
                Give Feedback
              </button>
            </div>
            <div className="skills-list">
              {u.teachSkills.map(s => (
                <div key={s.name} className="skill-item">
                  <div className="skill-name">
                    <i className="fas fa-graduation-cap"></i>
                    {s.name}
                  </div>
                  <button 
                    onClick={() => sendRequest(u._id)}
                    className="request-btn"
                  >
                    <i className="fas fa-exchange-alt"></i>
                    Request Swap
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {query && results.length === 0 && !loading && (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <p>No skills found matching "{query}"</p>
          </div>
        )}
      </div>
      
      {selectedUser && (
        <FeedbackModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSubmit={(rating, message) => submitFeedback(selectedUser._id, rating, message)}
        />
      )}
    </div>
  );
};

export default Browse;
