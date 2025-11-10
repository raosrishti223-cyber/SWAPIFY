import React, { useState } from 'react';
import { api } from '../api';
export default function Contact({ onBack }){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [msg, setMsg] = useState('');
  
  async function submit(e){
    e.preventDefault();
    setMsg('');
    try {
      const res = await api('/feedback/submit', 'POST', { 
        name, 
        email, 
        message,
        isContactFeedback: true
      });
      setMsg('Thank you for your feedback! Our developers will review it.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setMsg('Error submitting feedback. Please try again.');
    }
  }

  return (
    <div className='container'>
      <div className="page-header">
        <button onClick={onBack} className="back-btn">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h2>Contact Us</h2>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="contact-method">
            <i className="fas fa-envelope"></i>
            <h3>Email Us</h3>
            <p>supports@swapify.com</p>
          </div>
          <div className="contact-method">
            <i className="fas fa-comment-alt"></i>
            <h3>Send Feedback</h3>
            <p>Help us improve Swapify</p>
          </div>
        </div>

        <form onSubmit={submit} className="contact-form">
          <div className="form-group">
            <label><i className="fas fa-user"></i> Your Name</label>
            <input
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><i className="fas fa-envelope"></i> Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><i className="fas fa-comment"></i> Message</label>
            <textarea
              placeholder="Type your message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows="5"
            />
          </div>

          <button type="submit" className="submit-btn">
            <i className="fas fa-paper-plane"></i> Send Message
          </button>
        </form>

        {msg && (
          <div className={`message ${msg.includes('Error') ? 'error' : 'success'}`}>
            <i className={msg.includes('Error') ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}></i>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
