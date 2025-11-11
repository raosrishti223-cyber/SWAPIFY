import React, { useState } from 'react';
import { api } from '../api';

export default function Register({ switchToLogin }){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setMsg('');
    setMsgType('');
    if (!name.trim() || !email.trim() || !password) {
      setMsg('Please fill in all fields');
      setMsgType('error');
      return;
    }
    setLoading(true);
    try {
      const res = await api('/auth/register','POST',{ name: name.trim(), email: email.trim(), password });
      if(res && res.token){
        setMsg('Registered! Redirecting to login...');
        setMsgType('success');
        setTimeout(()=>switchToLogin(),1200);
      } else {
        setMsg(res.msg || 'Registration failed');
        setMsgType('error');
      }
    } catch (err) {
      console.error(err);
      setMsg('Server error, please try again later');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Create your account</h1>
        <p>Join Swapify to exchange skills, learn, and help others.</p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <div className="input-group">
          <i className="fas fa-user"></i>
          <input
            placeholder="Full name"
            value={name}
            onChange={e=>setName(e.target.value)}
            aria-label="Full name"
          />
        </div>

        <div className="input-group">
          <i className="fas fa-envelope"></i>
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            aria-label="Email address"
          />
        </div>

        <div className="input-group">
          <i className="fas fa-lock"></i>
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            aria-label="Password"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {msg && (
        msgType === 'success' ? (
          <div className="message success" style={{marginTop:12}}>{msg}</div>
        ) : (
          <div className="auth-error" style={{marginTop:12}}>
            <i className="fas fa-exclamation-circle" style={{marginRight:8}}></i>
            <span>{msg}</span>
          </div>
        )
      )}

      <div className="auth-footer" style={{marginTop:16}}>
        Already have an account? <span className='link' onClick={switchToLogin}>Login</span>
      </div>
    </div>
  );
}
