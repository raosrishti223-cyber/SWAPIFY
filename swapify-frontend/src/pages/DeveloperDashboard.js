import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function DeveloperDashboard({ token }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, [token]);

  async function loadFeedbacks() {
    try {
      const res = await api('/feedback/contact-feedback', 'GET', null, token);
      setFeedbacks(res);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="developer-dashboard">
      <div className="feedback-section">
        <div className="section-header">
          <i className="fas fa-comments"></i>
          <h2>User Feedback Messages</h2>
        </div>
        
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading feedback messages...</p>
          </div>
        ) : (
          <div className="feedback-list">
            {feedbacks.length === 0 ? (
              <div className="no-feedback">
                <i className="fas fa-inbox"></i>
                <p>No feedback messages received yet</p>
              </div>
            ) : (
              feedbacks.map(feedback => (
                <div key={feedback._id} className="feedback-card">
                  <div className="feedback-header">
                    <div className="user-info">
                      <i className="fas fa-user-circle"></i>
                      <div>
                        <p className="user-name">{feedback.name || 'Anonymous User'}</p>
                        <p className="feedback-date">
                          {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {feedback.isContactFeedback && feedback.email && (
                      <div className="contact-info">
                        <a href={`mailto:${feedback.email}`} className="email-link">
                          <i className="fas fa-reply"></i>
                          Reply via Email
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="feedback-content">
                    <i className="fas fa-quote-left quote-icon"></i>
                    <p className="feedback-message">{feedback.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}