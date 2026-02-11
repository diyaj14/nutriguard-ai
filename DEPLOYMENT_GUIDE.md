# 🚀 Complete Deployment Guide: NutriGuard AI

## 📋 **Table of Contents**
1. [Prerequisites](#prerequisites)
2. [Phase 1: GitHub Setup](#phase-1-github-setup)
3. [Phase 2: Backend Deployment (Render)](#phase-2-backend-deployment-render)
4. [Phase 3: Frontend Deployment (Vercel)](#phase-3-frontend-deployment-vercel)
5. [Phase 4: Testing & Verification](#phase-4-testing--verification)

---

## ✅ **Prerequisites**

Before starting, ensure you have:
- ✅ GitHub account ([Sign up](https://github.com/signup))
- ✅ Render account ([Sign up](https://render.com/))
- ✅ Vercel account ([Sign up](https://vercel.com/signup))
- ✅ Git installed on your computer

---

## 📦 **Phase 1: GitHub Setup**

### **Step 1.1: Initialize Git Repository**

Open your terminal in the project root (`E:\IPR PROJECT`) and run:

```bash
# Navigate to project root
cd "E:\IPR PROJECT"

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: NutriGuard AI Food Quality Analyzer"
```

### **Step 1.2: Create GitHub Repository**

1. Go to [GitHub](https://github.com/new)
2. **Repository name**: `nutriguard-ai` (or your preferred name)
3. **Description**: "AI-powered personalized food quality analyzer"
4. **Visibility**: Public (or Private if you prefer)
5. **DO NOT** initialize with README (we already have one)
6. Click **"Create repository"**

### **Step 1.3: Push to GitHub**

Copy the commands from GitHub's "push an existing repository" section:

```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/nutriguard-ai.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**✅ Checkpoint**: Visit your GitHub repository URL to verify all files are uploaded.

---

## 🐍 **Phase 2: Backend Deployment (Render)**

### **Step 2.1: Create Render Account & New Web Service**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** (authorize Render to access your repos)
4. Select your `nutriguard-ai` repository

### **Step 2.2: Configure Backend Service**

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `nutriguard-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` (or paid if needed) |

### **Step 2.3: Environment Variables (Optional)**

If you have any API keys or secrets:
1. Scroll to **"Environment Variables"**
2. Add any required variables (e.g., `OPENAI_API_KEY`, `DATABASE_URL`)

### **Step 2.4: Deploy Backend**

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. **Copy your backend URL** (e.g., `https://nutriguard-backend.onrender.com`)

**✅ Checkpoint**: Test your backend by visiting:
```
https://nutriguard-backend.onrender.com/docs
```
You should see the FastAPI Swagger documentation.

---

## ⚛️ **Phase 3: Frontend Deployment (Vercel)**

### **Step 3.1: Create Environment Variable File**

Before deploying, create a `.env` file in the `frontend` folder:

```bash
cd frontend
echo VITE_API_URL=https://nutriguard-backend.onrender.com > .env
```

**Replace** `https://nutriguard-backend.onrender.com` with your actual Render backend URL from Step 2.4.

### **Step 3.2: Commit Environment Changes**

```bash
# Go back to project root
cd ..

# Add and commit
git add .
git commit -m "Configure production API URL"
git push origin main
```

### **Step 3.3: Deploy to Vercel**

#### **Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **Project name?** → `nutriguard-ai`
- **Directory?** → `./` (current directory)
- **Override settings?** → `N`

#### **Option B: Using Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `nutriguard-ai` repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://nutriguard-backend.onrender.com` (your Render URL)
6. Click **"Deploy"**

### **Step 3.4: Get Your Live URL**

After deployment (2-3 minutes), Vercel will provide your live URL:
```
https://nutriguard-ai.vercel.app
```

**✅ Checkpoint**: Visit your frontend URL and test the full flow.

---

## 🧪 **Phase 4: Testing & Verification**

### **Step 4.1: Test Complete Flow**

1. **Open your Vercel URL** (e.g., `https://nutriguard-ai.vercel.app`)
2. **Navigate to Profile** → Set up health profile
3. **Go to Scan** → Enter barcode `3017624010701` (Nutella)
4. **Verify** the score displays correctly

### **Step 4.2: Check Backend Logs**

If something doesn't work:
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on `nutriguard-backend`
3. Go to **"Logs"** tab
4. Look for errors

### **Step 4.3: Check Frontend Logs**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for network errors or CORS issues

### **Step 4.4: Common Issues & Fixes**

| Issue | Solution |
|-------|----------|
| **CORS Error** | Ensure backend `main.py` has `allow_origins=["*"]` in CORS middleware |
| **404 on API calls** | Verify `VITE_API_URL` is set correctly in Vercel |
| **Backend not responding** | Check Render logs, ensure service is running |
| **Frontend build fails** | Check `package.json` dependencies, run `npm install` locally |

---

## 🎉 **Success Checklist**

- ✅ GitHub repository created and pushed
- ✅ Backend deployed on Render
- ✅ Backend `/docs` endpoint accessible
- ✅ Frontend deployed on Vercel
- ✅ Frontend can communicate with backend
- ✅ Full scan flow works end-to-end
- ✅ Mobile responsive design verified

---

## 📝 **Next Steps**

1. **Custom Domain** (Optional):
   - Vercel: Settings → Domains → Add your domain
   - Render: Settings → Custom Domain

2. **Analytics** (Optional):
   - Add Vercel Analytics
   - Add Google Analytics

3. **Monitoring** (Optional):
   - Set up Render alerts
   - Use Sentry for error tracking

---

## 🆘 **Need Help?**

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/

---

**🎊 Congratulations! Your app is now live!**

Share your URLs:
- **Frontend**: `https://nutriguard-ai.vercel.app`
- **Backend API**: `https://nutriguard-backend.onrender.com`
