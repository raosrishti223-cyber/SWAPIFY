Swapify — Ready to run

Steps:
1. Unzip project.
2. In swapify-backend, create a .env with:
   MONGO_URI=<your_mongo_atlas_connection_string>
   JWT_SECRET=swapify_secret
   PORT=5000
3. From swapify-backend: npm install
   From swapify-frontend: npm install
4. Start backend: npm run dev
5. (Optional) Run seed: npm run seed
6. Start frontend: npm start
7. Frontend runs on http://localhost:3000 and will talk to backend on http://localhost:5000
