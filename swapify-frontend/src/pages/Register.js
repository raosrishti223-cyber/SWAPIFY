import React, { useState } from 'react';
import { api } from '../api';

export default function Register({ switchToLogin }){
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [msg,setMsg]=useState('');
  async function submit(e){ e.preventDefault(); setMsg(''); const res = await api('/auth/register','POST',{ name,email,password }); if(res.token){ setMsg('Registered! You can login.'); setTimeout(()=>switchToLogin(),1200); } else setMsg(res.msg || 'Error'); }
  return (<div className='container'>
    <h2>Swapify — Register</h2>
    <form onSubmit={submit}>
      <input placeholder='Full name' value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} />
      <button>Register</button>
    </form>
    {msg && <div style={{marginTop:10}}>{msg}</div>}
    <div style={{marginTop:10}}>Have account? <span className='link' onClick={switchToLogin}>Login</span></div>
  </div>);
}
