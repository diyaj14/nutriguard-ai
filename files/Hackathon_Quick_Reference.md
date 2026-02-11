# HACKATHON QUICK REFERENCE GUIDE
## AI-Powered Personalized Food Quality Analyzer

---

## 📋 PRE-HACKATHON CHECKLIST

### Team Setup (Before Day 1)
- [ ] Identify team roles: 1-2 Backend Engineers, 1-2 Frontend/Mobile Devs, 1 ML/CV specialist, 1 Product/Domain expert
- [ ] Set up GitHub repository with clear structure
- [ ] Create shared Slack/Discord channel for team communication
- [ ] Decide on tech stack and confirm tool access/licenses
- [ ] Clone starter templates or boilerplate if provided

### Technical Prerequisites
- [ ] Install required tools: Python 3.8+, Node.js, mobile dev environment (if needed)
- [ ] Set up API keys for Vision APIs (Google Cloud Vision / Azure / AWS Textract)
- [ ] Access to nutritional databases (FSSAI, USDA FoodData Central)
- [ ] ML libraries ready: TensorFlow, PyTorch, sklearn, pandas

---

## 🎯 MVP BUILD PATH (24-48 Hours)

### Hours 0-4: Planning & Setup
**Deliverable:** Architecture diagram + database schema sketches

1. Define data flow: Image → OCR → Data Extraction → Personalization → UI
2. Sketch database schema:
   - Users table (health_profile, preferences)
   - Products table (name, ingredients, nutrition, image_url)
   - Scores/History table (user_id, product_id, score, reasoning)
3. List 5 APIs/libraries you'll use
4. Assign tasks: who owns OCR, who owns scoring algorithm, etc.

**Quick Start Template:**
```
Project Structure:
├── backend/
│   ├── api/
│   ├── models/
│   ├── utils/ (OCR, data extraction, scoring)
│   └── database/
├── frontend/
│   ├── screens/
│   └── components/
├── ml/
│   └── models/
└── README.md
```

### Hours 4-12: Core Functionality
**Target:** MVP with 3 working features

**Feature 1: OCR & Data Extraction (3 hours)**
- Use Google Cloud Vision / EasyOCR / PaddleOCR
- Test on 3-5 product images
- Extract: Product name, nutritional facts, ingredients
- Output: JSON with structured data

**Code Skeleton (Python):**
```python
def extract_nutrition_from_image(image_path):
    # Step 1: Use OCR to get text
    text = ocr_engine.extract_text(image_path)
    
    # Step 2: Parse nutritional info using regex/NLP
    nutrition = parse_nutrition_facts(text)
    
    # Step 3: Identify ingredients
    ingredients = extract_ingredients(text)
    
    return {
        "product_name": product_name,
        "nutrition": nutrition,
        "ingredients": ingredients,
        "allergens": find_allergens(ingredients)
    }
```

**Feature 2: User Health Profile (2 hours)**
- Simple form: age, health conditions (diabetes, hypertension), allergies, fitness goal
- Store in-memory (database not required for MVP)
- Example conditions: Hypertension → Low sodium preference, Diabetes → Low sugar preference

**Code Skeleton (Frontend):**
```javascript
const healthProfile = {
  age: 35,
  conditions: ["hypertension", "high-cholesterol"],
  allergies: ["peanut", "gluten"],
  fitnessGoal: "high-protein", // or "weight-loss", "muscle-gain"
  dietaryRestriction: "vegetarian"
};
```

**Feature 3: Personalized Scoring Algorithm (4 hours)**
- Create scoring function that considers health profile
- Simple version: Rule-based scoring
- Example rules:
  - Hypertension + High Sodium → Score reduced by 30%
  - Diabetes + High Sugar → Score reduced by 40%
  - Fitness Goal: High Protein + Product has >25g protein → Bonus +20%
  
**Code Skeleton (Python):**
```python
def calculate_personalized_score(product, user_health_profile):
    base_score = 50  # Start at 50/100
    
    # Rule 1: Check sodium for hypertension
    if "hypertension" in user_health_profile['conditions']:
        if product['nutrition']['sodium_mg'] > 500:
            base_score -= 20
    
    # Rule 2: Check sugar for diabetes
    if "diabetes" in user_health_profile['conditions']:
        if product['nutrition']['sugar_g'] > 5:
            base_score -= 25
    
    # Rule 3: Check protein for fitness goals
    if user_health_profile['fitnessGoal'] == 'high-protein':
        if product['nutrition']['protein_g'] > 25:
            base_score += 15
    
    # Clamp score between 0-100
    return max(0, min(100, base_score))
```

### Hours 12-20: Comparison & UI
**Target:** Functional MVP with visual output

**Feature 4: Comparative Analysis (3 hours)**
- Accept 2-5 product images
- Score each one
- Rank by suitability
- Show side-by-side comparison

**Code Skeleton:**
```python
def compare_products(products, user_profile):
    results = []
    for product in products:
        score = calculate_personalized_score(product, user_profile)
        results.append({
            "product_name": product['name'],
            "score": score,
            "reasoning": generate_explanation(product, user_profile, score)
        })
    
    # Sort by score descending
    return sorted(results, key=lambda x: x['score'], reverse=True)
```

**Feature 5: UI/UX (4 hours)**
- Mobile-first design
- Simple 3-step flow: Scan → See Score → Compare
- Visual elements: 
  - Green/yellow/red indicator for score
  - Clear reasoning statement
  - Ranking list for comparisons

### Hours 20-24: Polish & Testing
**Target:** Demo-ready prototype

1. Test with 10 real product images (get from supermarket or photos)
2. Fix OCR errors and edge cases
3. Create demo script with 3 scenarios
4. Record demo video
5. Write basic README

---

## 🧠 PERSONALIZATION ALGORITHM TIPS

### Simple Approach (Recommended for MVP)
- **Rule-based scoring:** If condition X, reduce/increase score by Y%
- **Weighted factors:** Health conditions get 40% weight, fitness goals get 30%, allergies get 30%

### Medium Complexity
- **Decision trees:** Use scikit-learn to train on hypothetical user preferences
- **Collaborative filtering:** "Users with similar health profiles like these products"

### Advanced (Stretch Goal)
- **ML-based:** Train a model on user feedback (though you won't have training data in 24h)
- **Multi-criteria optimization:** Pareto frontier to find best products given multiple constraints

### Key Personalization Factors to Consider
1. **Medical Conditions** (highest priority)
   - Hypertension → Low sodium < 500mg per serving
   - Diabetes → Low sugar < 5g per serving
   - High Cholesterol → Low saturated fat < 3g

2. **Fitness Goals**
   - High Protein: > 20g protein per serving
   - Low Carb: < 10g carbs per serving
   - Weight Loss: < 200 calories per serving

3. **Allergies** (binary: must avoid completely)
   - Flag if allergen found in ingredients or "may contain"

4. **Dietary Restrictions**
   - Vegan: No animal products
   - Gluten-free: No wheat, barley, rye
   - Vegetarian: No meat

---

## 🛠️ TECHNOLOGY STACK RECOMMENDATIONS

### Frontend (Pick One)
| Option | Best For | Setup Time |
|--------|----------|-----------|
| **React Web** | Cross-platform, easy camera | 2 hours |
| **React Native** | Mobile-first, reusable code | 4 hours |
| **Flutter** | Fast, native feel | 4 hours |

### Backend (Recommended)
- **Python FastAPI** — Fast, easy API, great for ML
- **Node.js Express** — If you prefer JavaScript ecosystem
- **Google Cloud Functions** — Serverless, quick to deploy

### OCR/Vision
- **Google Cloud Vision API** — Most accurate, $1.50/1000 images
- **EasyOCR (Python)** — Free, offline, ~90% accuracy
- **PaddleOCR** — Fast, supports multiple languages
- **Tesseract** — Open source, good for English

### Database (For MVP, Optional)
- **In-memory (JSON/List)** — Simplest for hackathon
- **Firebase** — Easy auth + database
- **PostgreSQL + SQLAlchemy** — Most robust

### Deployment
- **Vercel/Netlify** (Frontend)
- **Heroku** (Backend) — Free tier available
- **Google Colab** — Run Python notebooks as API

---

## 📱 SAMPLE CODE ARCHITECTURE

### Backend API Endpoints (FastAPI Example)
```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/analyze-product")
async def analyze_product(image: UploadFile):
    """
    Input: Product image
    Output: {product_name, nutrition, allergens, score}
    """
    # Extract text from image
    # Parse nutrition
    # Return structured data
    pass

@app.post("/set-health-profile")
async def set_health_profile(user_id: str, health_data: dict):
    """
    Input: User health info
    Output: Confirmation
    """
    pass

@app.post("/get-personalized-score")
async def get_personalized_score(user_id: str, product_data: dict):
    """
    Input: User ID + Product data
    Output: {score: 0-100, reasoning: "..."}
    """
    pass

@app.post("/compare-products")
async def compare_products(user_id: str, products: list):
    """
    Input: User ID + List of products
    Output: Ranked list with scores
    """
    pass
```

### Frontend Flow (React Example)
```javascript
// Step 1: User sets health profile
function HealthProfileForm() {
  // Collect: age, conditions, allergies, goals
  // Store in state/context
}

// Step 2: User scans product
function CameraCapture() {
  // Use device camera
  // Send image to backend API
  // Get nutrition data + OCR results
}

// Step 3: Show personalized score
function ProductScore({ score, reasoning, product }) {
  return (
    <div className="score-card">
      <h2>{product.name}</h2>
      <ScoreCircle value={score} />
      <p>{reasoning}</p>
      <button>Compare with Others</button>
    </div>
  );
}

// Step 4: Compare multiple products
function ComparisonView({ products, userProfile }) {
  // Call backend to rank products
  // Show ranked list with scores
}
```

---

## 🚀 DEMO PREP CHECKLIST

### Before Demo (30 mins before)
- [ ] Test all 3 scenarios end-to-end
- [ ] Have 5-10 product images ready (clear, well-lit)
- [ ] Confirm internet connection (APIs work)
- [ ] Have backup plan if live demo fails (pre-recorded video)
- [ ] Test audio/video recording if demoing remotely

### Demo Script (3-4 minutes)
1. **Intro (30 sec):** "We're helping consumers make personalized food choices instantly"
2. **Scenario 1 (1 min):** Hypertensive user → Scan curry powder → See low sodium recommendation
3. **Scenario 2 (1 min):** Allergic parent → Scan snack → Alert for peanut
4. **Scenario 3 (1 min):** Fitness enthusiast → Scan protein bar → Macro breakdown + score
5. **Outro (30 sec):** Impact + Next steps (scale to all supermarkets)

---

## 🎨 UI/UX DESIGN TIPS

### Mobile-First Layout
```
┌─────────────────────────────────┐
│  My Health Profile   Settings   │
├─────────────────────────────────┤
│    [📷 SCAN PRODUCT]            │ ← Main CTA
├─────────────────────────────────┤
│  Last Scanned:                  │
│  • Curry Powder - 7/10 ✓        │
│  • Snack Bar - 3/10 ✗           │
│  • Protein Bar - 9/10 ✓✓        │
└─────────────────────────────────┘
```

### Score Visualization
- **8-10:** 🟢 Green (Great choice for you!)
- **5-7:** 🟡 Yellow (Okay, but could be better)
- **0-4:** 🔴 Red (Not ideal for your health)

### Key Messaging
- Keep language simple and non-judgmental
- Explain WHY, not just the score
- Provide actionable next steps (alternatives, tips)

---

## ⚠️ COMMON PITFALLS & HOW TO AVOID THEM

| Pitfall | Why It Happens | Solution |
|---------|----------------|----------|
| **OCR accuracy too low** | Poor image quality, complex fonts | Test with multiple image angles/lighting; use backup OCR if needed |
| **Database of products incomplete** | Only 100 products in system | Use mock data; focus on algorithm quality not data completeness |
| **Personalization too simple** | Ran out of time | Start with 3-4 key rules; expand later if time |
| **No mobile optimization** | Focused on backend | Use responsive design; test on actual phone early |
| **Unclear demo** | Trying to show too many features | Pick 3 scenarios, practice multiple times |
| **No error handling** | Ignored edge cases | Handle: bad images, missing data, network failures gracefully |

---

## 🎯 HACKHATHON TIMELINE AT A GLANCE

```
Day 1:
  0-2h:   Kickoff + Team formation + Plan architecture
  2-6h:   Build OCR + Data extraction
  6-10h:  Health profile + Basic scoring
  10-14h: UI/UX + First demo
  14-24h: Polish + Testing + Recording demo video

Day 2 (if 48h):
  0-8h:   Add comparison feature + Multi-language support
  8-12h:  Full testing + Documentation
  12-16h: Bonus features (if time) + Final polish
  16-20h: Create pitch deck
  20-24h: Final demo practice + Submission
```

---

## 📊 EVALUATION SCORING SNAPSHOT

| What Judges Look For | Score Weight | How to Win |
|----------------------|--------------|-----------|
| Does it work? | 25% | Live demo: scan → score → compare (all working) |
| Is it innovative? | 20% | Unique personalization angle? Novel feature? |
| User experience | 20% | Fast (<5sec), intuitive, clear recommendations |
| Feasibility | 15% | Could this scale to 10,000+ products? |
| Social impact | 10% | Will this actually help people? |
| Code quality | 10% | Clean, documented, maintainable code |

---

## 🔗 USEFUL RESOURCES

### APIs & Libraries
- **Google Cloud Vision:** https://cloud.google.com/vision/docs
- **EasyOCR:** https://github.com/JaidedAI/EasyOCR
- **FSSAI Database:** https://www.fssai.gov.in/
- **USDA FoodData:** https://fdc.nal.usda.gov/

### UI Frameworks
- **React:** https://react.dev
- **Flutter:** https://flutter.dev
- **Tailwind CSS:** https://tailwindcss.com

### Deployment
- **Heroku:** https://www.heroku.com
- **Vercel:** https://vercel.com
- **Google Colab:** https://colab.research.google.com

---

## 💡 FINAL PRO TIPS

1. **Start with a working prototype in 6 hours**, then iterate
2. **Test your OCR early** — it's often the bottleneck
3. **Use mock data** for products if building the database takes too long
4. **Demo one person's journey** (scan 1 product, get score) over 10 features
5. **Make scoring algorithm simple and explainable** — judges need to understand it
6. **Focus on the AHA moment** — the moment where personalization becomes clear
7. **Prepare for demo failures** — have screenshots/video backup
8. **Document your assumptions** — "We assume 85% OCR accuracy," etc.

---

## ❓ QUICK FAQs

**Q: Do I need to build with all real products?**
A: No! Use 5-10 real products + mock data for prototyping. Judges care about the algorithm.

**Q: Can I use pre-trained models?**
A: Yes! Using existing OCR, NLP, and ML models is expected and encouraged.

**Q: Do I need a mobile app or can it be web?**
A: Either works! Web is faster to build, mobile is more impressive for supermarket use.

**Q: How much data do I need?**
A: 10-20 diverse products is enough for demo. Focus on algorithm quality.

**Q: What if my OCR accuracy is 70%, not 85%?**
A: That's okay! Document it and show how you'd improve it with more data.

---

**Good luck! Build something awesome.** 🚀

Last Updated: February 2026
