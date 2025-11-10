import React, { useState } from 'react';

const ContactForm = ({ onSubmit }) => {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    preferredMethod: 'email'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(contactInfo);
  };

  return (
    <div className="contact-form-container">
      <div className="contact-form-header">
        <i className="fas fa-address-card"></i>
        <h3>Provide Your Contact Information</h3>
        <p>This will be shared with your skill exchange partner</p>
      </div>
      
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label>
            <i className="fas fa-phone"></i> Phone Number
          </label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <i className="fas fa-envelope"></i> Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email address"
            value={contactInfo.email}
            onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <i className="fas fa-star"></i> Preferred Contact Method
          </label>
          <select
            value={contactInfo.preferredMethod}
            onChange={(e) => setContactInfo({...contactInfo, preferredMethod: e.target.value})}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">
          <i className="fas fa-check-circle"></i>
          Submit Contact Details
        </button>
      </form>
    </div>
  );
};

export default ContactForm;