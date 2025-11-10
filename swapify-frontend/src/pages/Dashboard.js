import React, { useEffect, useState } from 'react';
import { api } from '../api';
import ContactForm from '../components/ContactForm';

export default function Dashboard({ token, onLogout, gotoBrowse, gotoAbout, gotoContact, gotoFeedbacks }) {
  const [profile, setProfile] = useState(null);
  const [skillName, setSkillName] = useState('');
  const [incoming, setIncoming] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [message, setMessage] = useState('');
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [profileRes, incomingRes, acceptedRes] = await Promise.all([
        api('/skills/me', 'GET', null, token),
        api('/requests/incoming', 'GET', null, token),
        api('/requests/accepted', 'GET', null, token)
      ]);
      
      setProfile(profileRes);
      setIncoming(incomingRes);
      setAcceptedRequests(acceptedRes);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }

  async function load() {
    const res = await api('/skills/me', 'GET', null, token);
    setProfile(res);
  }

  async function loadIncoming() {
    const res = await api('/requests/incoming', 'GET', null, token);
    setIncoming(res);
  }

  async function loadAcceptedRequests() {
    try {
      const res = await api('/requests/accepted', 'GET', null, token);
      setAcceptedRequests(res);
    } catch (error) {
      console.error('Error loading accepted requests:', error);
      setMessage('Error loading accepted requests. Please try again.');
    }
  }

  async function addSkill(e, skillType = 'teach') {
    e.preventDefault();
    if (!skillName.trim()) return;
    await api('/skills/add', 'POST', { type: skillType, name: skillName }, token);
    setSkillName('');
    load();
  }

  async function removeSkill(n, skillType = 'teach') {
    await api('/skills/remove', 'POST', { type: skillType, name: n }, token);
    load();
  }



  async function respond(id, action, contactInfo = null) {
    try {
      if (action === 'accept' && !contactInfo) {
        setCurrentRequest(id);
        setShowContactForm(true);
        return;
      }

      const response = await api('/requests/' + id + '/respond', 'POST', { action, contactInfo }, token);
      if (response.msg) {
        throw new Error(response.msg);
      }

      setShowContactForm(false);
      setCurrentRequest(null);
      
      if (action === 'accept') {
        if (contactInfo) {
          setMessage('Contact details provided successfully! The exchange can begin once both users have shared their contact information.');
        } else {
          setMessage('Request accepted! Please provide your contact details so the exchange can begin.');
        }
      } else if (action === 'reject') {
        setMessage('Request rejected.');
      }
      
      loadIncoming();
      loadAcceptedRequests();
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: ' + (error.message || 'Something went wrong. Please try again.'));
      if (contactInfo) {
        // Reset the form if there was an error submitting contact info
        setShowContactForm(false);
        setCurrentRequest(null);
      }
    }
  }

  const handleContactSubmit = async (contactInfo) => {
    if (currentRequest) {
      await respond(currentRequest, 'accept', contactInfo);
    }
  }

  if (!profile) return <div className="container">Loading...</div>;

  if (showContactForm) {
    return (
      <div className="container">
        <h2>Provide Contact Information</h2>
        <ContactForm onSubmit={handleContactSubmit} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h2><i className="fas fa-user-circle"></i> Welcome, {profile.name}</h2>
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={gotoBrowse}>
            <i className="fas fa-search"></i> Browse Skills
          </button>
          <button className="btn btn-secondary" onClick={gotoAbout}>
            <i className="fas fa-info-circle"></i> About
          </button>
          <button className="btn btn-secondary" onClick={gotoContact}>
            <i className="fas fa-envelope"></i> Contact
          </button>
          <button className="btn btn-secondary" onClick={gotoFeedbacks}>
            <i className="fas fa-star"></i> Feedbacks
          </button>
          <button className="btn btn-secondary" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('error') ? 'alert-error' : 'alert-success'}`}>
          <i className={message.includes('error') ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}></i>
          {message}
        </div>
      )}

      {/* Skills Sections */}
      <div className="section">
        <h3 className="section-title">Your Teaching Skills</h3>
        <div className="skills-grid">
          {profile.teachSkills.map((s) => (
            <div key={s.name} className="skill-card">
              <span className="skill-name">{s.name}</span>
              <button onClick={() => removeSkill(s.name, 'teach')} className="remove-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
          <form onSubmit={(e) => addSkill(e, 'teach')} className="add-skill-form">
            <input
              placeholder="Add a new skill to teach"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-plus"></i> Add
            </button>
          </form>
        </div>

        <h3 className="section-title" style={{ marginTop: '2rem' }}>Your Learning Skills</h3>
        <div className="skills-grid">
          {profile.learnSkills.map((s) => (
            <div key={s.name} className="skill-card">
              <span className="skill-name">{s.name}</span>
              <button onClick={() => removeSkill(s.name, 'learn')} className="remove-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
          <form onSubmit={(e) => addSkill(e, 'learn')} className="add-skill-form">
            <input
              placeholder="Add a new skill to learn"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-plus"></i> Add
            </button>
          </form>
        </div>
      </div>

      {/* ================== MESSAGES SECTION ================== */}
      {message && (
        <div className={`message ${message.includes('error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Requests Sections */}
      <div className="section">
        <h3 className="section-title">Incoming Requests</h3>
        <div className="requests-grid">
          {incoming.map((r) => (
            <div key={r._id} className="request-card pending">
              <div className="request-header">
                <i className="fas fa-user"></i>
                <span className="requester-name">{r.fromUser.name}</span>
              </div>
              <div className="skills-exchange">
                <div className="skill-offer">
                  <label>Offering:</label>
                  <span>{r.offeredSkill?.name || '—'}</span>
                </div>
                <div className="skill-request">
                  <label>Requesting:</label>
                  <span>{r.requestedSkill?.name || '—'}</span>
                </div>
              </div>
              <div className="request-actions">
                <button onClick={() => respond(r._id, 'accept')} className="accept-btn">
                  <i className="fas fa-check"></i> Accept
                </button>
                <button onClick={() => respond(r._id, 'reject')} className="reject-btn">
                  <i className="fas fa-times"></i> Reject
                </button>
              </div>
            </div>
          ))}
          {incoming.length === 0 && (
            <div className="no-requests">
              <i className="fas fa-inbox"></i>
              <p>No incoming requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Accepted Requests Section */}
      <div className="section">
        <h3 className="section-title">Accepted Exchanges</h3>
        <div className="accepted-requests-grid">
          {acceptedRequests.map((r) => {
            const isRequester = r.fromUser._id === profile._id;
            const otherUser = isRequester ? r.toUser : r.fromUser;
            const myContact = isRequester ? r.fromUserContact : r.toUserContact;
            const theirContact = isRequester ? r.toUserContact : r.fromUserContact;
            
            return (
              <div key={r._id} className="exchange-card">
                <div className="exchange-header">
                  <h4>
                    <i className="fas fa-handshake"></i>
                    Exchange with {otherUser.name}
                  </h4>
                  <div className="exchange-skills">
                    <span className="skill-tag offering">
                      <i className="fas fa-gift"></i>
                      {isRequester ? "You're" : "They're"} offering: {r.offeredSkill?.name}
                    </span>
                    <span className="skill-tag requesting">
                      <i className="fas fa-hand-holding"></i>
                      {isRequester ? "You're" : "They're"} requesting: {r.requestedSkill?.name}
                    </span>
                  </div>
                </div>

                <div className="contact-details">
                  <div className="their-contact">
                    {theirContact ? (
                      <>
                        <h5>
                          <i className="fas fa-user"></i>
                          {otherUser.name}'s Contact Details
                        </h5>
                        <div className="contact-info">
                          <p><i className="fas fa-phone"></i> {theirContact.phone}</p>
                          <p><i className="fas fa-envelope"></i> {theirContact.email}</p>
                          <p className="preferred">
                            <i className="fas fa-star"></i>
                            Preferred: {theirContact.preferredMethod}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="waiting-message">
                        <i className="fas fa-hourglass-half"></i>
                        <p>Waiting for {otherUser.name}'s contact details...</p>
                      </div>
                    )}
                  </div>

                  <div className="your-contact">
                    {!myContact ? (
                      <button 
                        onClick={() => respond(r._id, 'accept')}
                        className="provide-contact-btn"
                      >
                        <i className="fas fa-plus-circle"></i>
                        Provide Your Contact Details
                      </button>
                    ) : (
                      <>
                        <h5>
                          <i className="fas fa-user-check"></i>
                          Your Provided Details
                        </h5>
                        <div className="contact-info">
                          <p><i className="fas fa-phone"></i> {myContact.phone}</p>
                          <p><i className="fas fa-envelope"></i> {myContact.email}</p>
                          <p className="preferred">
                            <i className="fas fa-star"></i>
                            Preferred: {myContact.preferredMethod}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="exchange-status">
                  {r.fromUserContact && r.toUserContact ? (
                    <div className="status-complete">
                      <i className="fas fa-check-circle"></i>
                      Ready to start learning!
                    </div>
                  ) : (
                    <div className="status-pending">
                      <i className="fas fa-clock"></i>
                      Waiting for contact details...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {acceptedRequests.length === 0 && (
            <div className="no-requests">
              <i className="fas fa-handshake"></i>
              <p>No accepted exchanges yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
