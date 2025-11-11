# 🚨 QUICK FIX - Review Ready Setup

## Problem: Docker not working + Token expired

### Solution: Run Everything Locally (No Docker Needed)

---

## Step 1: Start MongoDB (if not running)

**Option A: Use MongoDB Atlas (Cloud - Easiest)**
- Go to: https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update `backend/.env` with: `MONGO_URI=your_atlas_connection_string`

**Option B: Local MongoDB**
- If installed: Run `mongod` in terminal
- Or download from: https://www.mongodb.com/try/download/community

---

## Step 2: Start Backend

```bash
cd Memoir/backend
npm install
npm run seed    # Creates demo user
npm start
```

**Backend should show:** "Backend listening on 4000"

---

## Step 3: Start Frontend

```bash
cd Memoir/frontend
npm install
npm run dev
```

**Frontend should show:** "Local: http://localhost:5173"

---

## Step 4: Login

**Use Demo Account:**
- Email: `demo@memoir.app`
- Password: `demo1234`

**OR create new account** - Sign up works!

---

## Step 5: If Token Issues

If you see "invalid token" errors:

1. **Clear browser localStorage:**
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Refresh page
   - Login again

2. **Or manually delete:**
   - DevTools → Application → Local Storage → Clear all

---

## Step 6: Load Demo Data (For Presentation)

1. Login to account
2. Go to **Settings** → **Privacy & Data** tab
3. Click **"Load Demo Data"** button
4. Refresh page
5. You'll see sample journal entries, habits, and insights

---

## 🎯 Review Checklist

- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] Can login (demo account or new account)
- [ ] Journal page works
- [ ] Chat page works (with fallback if microservices down)
- [ ] Insights page shows data
- [ ] Time Travel generates summaries
- [ ] Habits page works
- [ ] Demo data loaded for presentation

---

## ⚡ Emergency Fallbacks

**If microservices fail:**
- Chat: Uses fallback responses (works without Python services)
- Sentiment: Uses fallback analysis (works without Python services)
- Summary: Uses basic summary (works without Python services)

**Everything works without Docker or Python services!**

---

## 🔧 Troubleshooting

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=4001
```

**MongoDB connection error?**
- Use MongoDB Atlas (cloud) - no local install needed
- Or start MongoDB: `mongod`

**Token expired?**
- Clear localStorage and login again
- Tokens last 7 days, but browser restart clears them

---

## 📝 Quick Commands

**Start everything:**
```bash
# Terminal 1 - Backend
cd Memoir/backend && npm start

# Terminal 2 - Frontend  
cd Memoir/frontend && npm run dev
```

**That's it!** No Docker needed for review.

