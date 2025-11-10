const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function api(path, method='GET', body=null, token=''){
  const headers = { 'Content-Type': 'application/json' };
  if(token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  return res.json();
}
