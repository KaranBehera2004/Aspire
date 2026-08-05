# React + Node + MongoDB Atlas Auth Dashboard

Basic full-stack login/register project with:

- React + Vite frontend
- Node.js + Express backend
- MongoDB Atlas through Mongoose
- Password hashing with bcrypt
- JWT-based protected dashboard session

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

3. Add your MongoDB Atlas connection string in `.env`:

   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/auth_dashboard?retryWrites=true&w=majority
   JWT_SECRET=replace-this-with-a-long-random-secret
   PORT=5000
   CLIENT_URL=http://127.0.0.1:5173
   ```

4. Start the full app:

   ```bash
   npm run dev
   ```

Frontend: http://127.0.0.1:5173  
API: http://localhost:5000

## Useful Scripts

- `npm run dev` starts React and Express together.
- `npm run client` starts only React.
- `npm run server` starts only the API.
- `npm run build` builds the React app.
- `npm start` starts the Express API.
