# NutriGuard AI - Food Quality Analyzer

AI-powered personalized food suitability engine that analyzes products based on your health profile.

## 🚀 Live Demo
- **Frontend**: https://nutriguard-ai.vercel.app/
- **Backend API**: https://nutriguard-backend-i175.onrender.com/

## 📱 Features
- 🎯 Personalized health scoring
- 🔍 Barcode scanning
- 💊 Health condition tracking
- 🎨 Premium mobile-first UI
- 🤖 AI-powered recommendations

## 🛠️ Tech Stack
- **Frontend**: React + Vite + TailwindCSS + Three.js
- **Backend**: FastAPI + Python
- **ML**: Scikit-learn
- **Deployment**: Render + Vercel

## 📦 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://nutriguard-backend-i175.onrender.com/
```

## 📄 License
MIT License
