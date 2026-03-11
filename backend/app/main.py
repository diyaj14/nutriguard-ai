from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Standard relative imports for package structure
from .resolvers.barcode_resolver import resolve_by_barcode
from .resolvers.image_resolver import resolve_by_image
from .models.schemas import ProductResponse, UserProfile, PersonalizedProductResponse
from .utils.personalization import get_personalization_engine
from .utils.history import save_scan, get_history

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Food Quality Analyzer", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize personalization engine at startup
@app.on_event("startup")
async def startup_event():
    print("🚀 Starting AI Food Quality Analyzer API...")
    # This will load the ML model
    get_personalization_engine()

class BarcodeRequest(BaseModel):
    barcode: str

class PersonalizedBarcodeRequest(BaseModel):
    barcode: str
    user_profile: UserProfile

@app.get("/")
def read_root():
    return {"message": "AI Food Quality Analyzer API - Now with ML Personalization!", "version": "0.2.0"}

# --- ORIGINAL ENDPOINTS (Basic Product Info) ---

@app.post("/scan/barcode", response_model=ProductResponse)
def scan_barcode_endpoint(request: BarcodeRequest):
    result = resolve_by_barcode(request.barcode)
    if result:
        return result
    raise HTTPException(status_code=404, detail="Product not found")

@app.post("/scan/image", response_model=ProductResponse)
async def scan_image_endpoint(file: UploadFile = File(...)):
    contents = await file.read()
    result = resolve_by_image(contents)
    if result:
        return result
    raise HTTPException(status_code=404, detail="Product not found or could not be identified from image")

# --- NEW: PERSONALIZED ENDPOINTS (With ML-Powered Scoring) ---

@app.post("/scan/barcode/personalized", response_model=PersonalizedProductResponse)
def scan_barcode_personalized_endpoint(request: PersonalizedBarcodeRequest):
    """
    Scan a barcode and get personalized suitability score based on user's health profile.
    """
    # Get base product data
    product = resolve_by_barcode(request.barcode)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get personalization engine
    engine = get_personalization_engine()
    
    # Convert product to dict for the model
    product_dict = product.dict()
    # Add nutrition fields to top level for easier access
    product_dict.update(product_dict.get('nutrition', {}))
    
    # Get personalized score
    score, reasons, warnings = engine.predict(
        product_data=product_dict,
        user_profile=request.user_profile.dict()
    )
    
    # Get recommendations
    recommendations = engine.get_recommendations(
        current_product_data=product_dict,
        current_score=score,
        user_profile=request.user_profile.dict()
    )
    
    # Get additive details
    additive_details = engine.get_additive_details(product.additives)
    
    # Create personalized response
    return PersonalizedProductResponse(
        **product.dict(),
        suitability_score=score,
        reasons=reasons,
        warnings=warnings,
        recommendations=recommendations,
        additive_details=additive_details
    )

@app.post("/scan/image/personalized", response_model=PersonalizedProductResponse)
async def scan_image_personalized_endpoint(
    file: UploadFile = File(...),
    user_profile: str = None  # JSON string of UserProfile
):
    """
    Scan an image and get personalized suitability score.
    Note: user_profile should be a JSON string due to multipart/form-data limitations.
    """
    import json
    
    # Get base product data
    contents = await file.read()
    product = resolve_by_image(contents)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or could not be identified from image")
    
    # Parse user profile
    if user_profile:
        try:
            user_profile_dict = json.loads(user_profile)
            user_profile_obj = UserProfile(**user_profile_dict)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid user_profile JSON: {e}")
    else:
        # Default healthy user
        user_profile_obj = UserProfile()
    
    # Get personalization engine
    engine = get_personalization_engine()
    
    # Convert product to dict
    product_dict = product.dict()
    product_dict.update(product_dict.get('nutrition', {}))
    
    # Get personalized score
    score, reasons, warnings = engine.predict(
        product_data=product_dict,
        user_profile=user_profile_obj.dict()
    )
    
    # Get recommendations
    recommendations = engine.get_recommendations(
        current_product_data=product_dict,
        current_score=score,
        user_profile=user_profile_obj.dict()
    )
    
    # Get additive details
    additive_details = engine.get_additive_details(product.additives)
    
    # Create personalized response
    return PersonalizedProductResponse(
        **product.dict(),
        suitability_score=score,
        reasons=reasons,
        warnings=warnings,
        recommendations=recommendations,
        additive_details=additive_details
    )

@app.get("/history")
def get_user_history():
    """Get scan history for the user."""
    return get_history()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

