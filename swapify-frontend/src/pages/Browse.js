import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { io } from 'socket.io-client';

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
  const [pendingFeedbacks, setPendingFeedbacks] = useState({});

  // connect socket once and listen for feedback created events so other users see updates
  useEffect(() => {
    const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/,'');
    const socketUrl = apiBase.replace(/\/api$/, '');
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    const handler = (feedback) => {
      // feedback.toUser may be an object or id string
      const toId = feedback.toUser && (feedback.toUser._id || feedback.toUser);
      if (!toId) return;
      setResults(prev => {
        let changed = false;
        const next = prev.map(u => {
          if (u._id !== toId) return u;

          // avoid duplicate if this feedback already present
          const exists = (u.recentFeedbacks || []).some(f => f._id === feedback._id);
          if (exists) return u;

          const prevSummary = u.feedbackSummary || { averageRating: 0, totalFeedback: 0 };
          const prevAvg = prevSummary.averageRating || 0;
          const prevTotal = prevSummary.totalFeedback || 0;
          const newTotal = prevTotal + 1;
          const newAvg = ((prevAvg * prevTotal) + (feedback.rating || 0)) / newTotal;

          changed = true;
          return {
            ...u,
            feedbackSummary: { averageRating: newAvg, totalFeedback: newTotal },
            recentFeedbacks: [feedback, ...(u.recentFeedbacks || [])].slice(0,3)
          };
        });
        return changed ? next : prev;
      });
    };

    socket.on('feedback:created', handler);
    return () => {
      socket.off('feedback:created', handler);
      socket.disconnect();
    };
  }, []);

  async function search(e){ 
    e.preventDefault(); 
    setLoading(true);
    try {
      const res = await api('/skills/browse?q='+encodeURIComponent(query),'GET', null, token); 
      // For each result, fetch feedback summary and recent feedbacks
      const enhanced = await Promise.all(res.map(async (u) => {
        try {
          const summary = await api(`/feedback/summary/${u._id}`, 'GET', null, token);
          // fetch recent feedback messages (up to 3)
          const feedbacks = await api(`/feedback/user/${u._id}`, 'GET', null, token);
          return { ...u, feedbackSummary: summary, recentFeedbacks: feedbacks.slice(0, 3) };
        } catch (err) {
          // if fetching feedback fails, still return the user
          return { ...u, feedbackSummary: null, recentFeedbacks: [] };
        }
      }));

      setResults(enhanced);
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
      const postRes = await api('/feedback/submit', 'POST', {
        toUserId,
        rating,
        message,
        isContactFeedback: false
      }, token);

      // If server returned the created feedback, optimistically update UI immediately
      const created = postRes && postRes.feedback ? postRes.feedback : null;

      // create a local pending feedback entry if server did not return the created object
      let localFeedback = null;
      if (!created) {
        localFeedback = {
          _id: 'local-' + Date.now(),
          fromUser: { name: 'You' },
          rating,
          message,
          createdAt: new Date().toISOString()
        };
        setPendingFeedbacks(prev => ({
          ...prev,
          [toUserId]: [(localFeedback), ...(prev[toUserId] || [])]
        }));
      }

      setResults(prev => prev.map(u => {
        if (u._id !== toUserId) return u;
        // compute optimistic new summary
        const prevSummary = u.feedbackSummary || { averageRating: 0, totalFeedback: 0 };
        const prevAvg = prevSummary.averageRating || 0;
        const prevTotal = prevSummary.totalFeedback || 0;
        const newTotal = prevTotal + 1;
        const newAvg = ((prevAvg * prevTotal) + rating) / newTotal;

        const newFeedback = created ? created : localFeedback;

        return {
          ...u,
          feedbackSummary: { averageRating: newAvg, totalFeedback: newTotal },
          recentFeedbacks: [newFeedback, ...(u.recentFeedbacks || [])].slice(0,3)
        };
      }));

      // still attempt to refresh from server (keeps client in sync if server-side computed differently)
      try {
        let summary = await api(`/feedback/summary/${toUserId}`, 'GET', null, token);
        let feedbacks = await api(`/feedback/user/${toUserId}`, 'GET', null, token);

        // merge any pending local feedbacks for this user so they remain visible until confirmed
        const pendings = pendingFeedbacks[toUserId] || [];

        // If any pending matches a server feedback (by message+rating), consider it confirmed and remove it
        let remainingPendings = pendings.filter(p => !feedbacks.some(f => f.message === p.message && f.rating === p.rating));

        // combined feedbacks: server first, then remaining local pendings at top
        const combined = [...remainingPendings, ...feedbacks].slice(0,3);

        // adjust summary to include pending items for display
        const pendingCount = remainingPendings.length;
        if (pendingCount > 0) {
          const serverTotal = summary.totalFeedback || 0;
          const serverAvg = summary.averageRating || 0;
          const addedSum = remainingPendings.reduce((acc, p) => acc + (p.rating || 0), 0);
          const newTotal = serverTotal + pendingCount;
          const newAvg = ((serverAvg * serverTotal) + addedSum) / newTotal;
          summary = { ...summary, averageRating: newAvg, totalFeedback: newTotal };
          // persist remaining pendings
          setPendingFeedbacks(prev => ({ ...prev, [toUserId]: remainingPendings }));
        }

        setResults(prev => prev.map(u => u._id === toUserId ? { ...u, feedbackSummary: summary, recentFeedbacks: combined } : u));
      } catch (err) {
        console.error('Failed to refresh feedback after submit', err);
      }

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
            {/* Display rating and recent feedbacks */}
            <div className="user-feedback-summary">
              {u.feedbackSummary ? (
                <div className="rating-line">
                  <span className="avg-rating">{u.feedbackSummary.averageRating ? u.feedbackSummary.averageRating.toFixed(1) : '0.0'}</span>
                  <span className="stars-inline">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.round(u.feedbackSummary.averageRating || 0) ? 'filled' : ''}`} style={{ color: i < Math.round(u.feedbackSummary.averageRating || 0) ? '#f1c40f' : '#ddd' }}></i>
                    ))}
                  </span>
                  <span className="total-count">({u.feedbackSummary.totalFeedback || 0})</span>
                </div>
              ) : null}

              {u.recentFeedbacks && u.recentFeedbacks.length > 0 && (
                <div className="recent-feedbacks">
                  {u.recentFeedbacks.map(f => (
                    <div key={f._id} className="recent-feedback">
                      <div className="rf-header"><strong>{f.fromUser ? f.fromUser.name : 'Anonymous'}</strong> <span className="rf-rating">{f.rating ? '· ' + f.rating + '★' : ''}</span></div>
                      <div className="rf-message">{f.message}</div>
                    </div>
                  ))}
                </div>
              )}
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
