import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Feedbacks({ token, onBack }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, [token]);

  async function loadFeedbacks() {
    try {
      const res = await api('/feedback/all', 'GET', null, token);
      setFeedbacks(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitFeedback(e) {
    e.preventDefault();
    if (!newFeedback.trim()) return;
    
    try {
      await api('/feedback/submit', 'POST', {
        message: newFeedback,
        isContactFeedback: true,
        name: 'User',  // We'll use a generic name for now
        email: 'user@example.com'  // We'll use a generic email for now
      }, token);
      setNewFeedback('');
      loadFeedbacks();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className='container'>
      <div className="page-header">
        <button onClick={onBack} className="back-btn">Back</button>
        <h2>Feedbacks</h2>
      </div>

      <div className="feedback-section">
        <form onSubmit={handleSubmitFeedback} className="feedback-form">
          <textarea
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            placeholder="Write your feedback here..."
            className="feedback-input"
            rows="4"
          />
          <button type="submit" className="submit-btn">Submit Feedback</button>
        </form>

        <div className="feedback-list">
          {loading ? (
            <div className="loading">Loading feedbacks...</div>
          ) : feedbacks.length === 0 ? (
            <div className="no-feedback">No feedbacks yet</div>
          ) : (
            feedbacks.map(feedback => (
              <div key={feedback._id} className="feedback-card">
                <div className="feedback-header">
                  <p className="user-name">{feedback.name || 'Anonymous'}</p>
                  <p className="feedback-date">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="feedback-message">{feedback.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
