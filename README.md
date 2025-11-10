# Swapify — Learn & Teach Platform

This is a full-stack minimal implementation scaffold for **Swapify**, a skill-exchange platform.

## Project Structure
- swapify-backend/  — Node.js + Express API
- swapify-frontend/ — React frontend (Create React App-like structure)

## Features included (basic implementation)
- User registration & login (JWT, bcrypt)
- User profile with skills they can teach / want to learn
- Browse skills
- Send/Accept/Reject swap requests
- Simple dashboard

## Setup

### Backend
1. `cd swapify-backend`
2. Create a `.env` file with:
```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=swapify_secret
PORT=5000
```
3. `npm install`
4. `npm run dev` (uses nodemon) or `npm start`

### Frontend
1. `cd swapify-frontend`
2. `npm install`
3. `npm start` (runs on port 3000)

You may host backend on Render/Heroku and frontend on Vercel/Netlify. Use MongoDB Atlas for database.

This scaffold is intended for educational / evaluation purposes and can be extended.

Authors: Srishti Rao, Shwetha S, Spoorthi T
