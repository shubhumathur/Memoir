# 🚀 Quick Start Guide - Memoir

## Easiest Way to Run (Recommended)

### Option 1: Docker Compose (Easiest - All Services)

**Prerequisites:** Docker Desktop installed and running

1. **Open terminal in the Memoir folder:**
   ```bash
   cd Memoir
   ```

2. **Start everything:**
   ```bash
   docker compose up --build
   ```

3. **Wait for all services to start** (you'll see "Backend listening on 4000" and similar messages)

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

5. **Create an account** or use demo credentials:
   - Email: `demo@memoir.app`
   - Password: `demo1234`

**That's it!** Everything runs automatically.

---

### Option 2: Local Development (Without Docker)

**Prerequisites:** Node.js, npm, and MongoDB installed

#### Step 1: Install MongoDB
- Download from: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas (free tier)

#### Step 2: Start MongoDB
```bash
# If installed locally:
mongod

# Or use MongoDB Atlas connection string (no local install needed)
```

#### Step 3: Setup Backend
```bash
cd backend
npm install
npm run seed    # Creates demo user with sample data
npm start       # Starts backend on port 4000
```

#### Step 4: Setup Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev     # Starts frontend on port 5173
```

#### Step 5: Access the App
- Open: http://localhost:5173

---

## 🎯 First Steps After Starting

1. **Sign Up** - Create a new account, or
2. **Use Demo Account:**
   - Email: `demo@memoir.app`
   - Password: `demo1234`

3. **Explore Features:**
   - ✅ **Journal** - Write entries with rich text editor
   - ✅ **Insights** - View your emotional patterns
   - ✅ **Time Travel** - Generate AI summaries
   - ✅ **Habits** - Track daily habits and streaks
   - ✅ **Settings** - Load demo data for presentation

4. **Load Demo Data** (in Settings):
   - Go to Settings → Privacy & Data tab
   - Click "Load Demo Data" button
   - Refresh the page to see sample journal entries and habits

---

## 🔧 Troubleshooting

### Port Already in Use?
- Change ports in `docker-compose.yml` or stop conflicting services

### MongoDB Connection Error?
- Make sure MongoDB is running
- Check connection string in `.env` file
- For Docker: MongoDB starts automatically

### Frontend Not Loading?
- Make sure backend is running on port 4000
- Check browser console for errors
- Verify `VITE_API_URL` in frontend config

### Microservices Not Working?
- The app works without them (graceful fallbacks)
- Optional: Start microservices for full AI features
- Check `services/` folder for Python services

---

## 📝 Quick Test Checklist

- [ ] Sign up / Login
- [ ] Write a journal entry
- [ ] View Insights page
- [ ] Generate Time Travel summary
- [ ] Add a habit and mark it complete
- [ ] Toggle dark/light theme
- [ ] Load demo data from Settings

---

## 🎨 Features to Try

1. **Rich Text Editor** - Use formatting in journal entries
2. **Mood Selector** - Add emojis to your entries
3. **Tags** - Organize entries with tags
4. **Smart Prompts** - Get AI writing suggestions
5. **Habit Streaks** - Track your consistency
6. **PDF Export** - Export Time Travel summaries
7. **Dark Mode** - Toggle theme in header

---

## 💡 Tips

- **Autosave**: Journal entries auto-save drafts every 10 seconds
- **Onboarding**: New users see a helpful tour modal
- **Demo Mode**: Perfect for presentations - loads sample data
- **Responsive**: Works on mobile, tablet, and desktop

---

## 🆘 Need Help?

Check the main README.md for detailed documentation or open an issue.

