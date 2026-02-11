from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class NutritionInfo(BaseModel):
    energy_kcal_100g: Optional[float] = None
    fat_100g: Optional[float] = None
    saturated_fat_100g: Optional[float] = None
    carbohydrates_100g: Optional[float] = None
    sugars_100g: Optional[float] = None
    proteins_100g: Optional[float] = None
    sodium_100g: Optional[float] = None
    fiber_100g: Optional[float] = None
    # Add other nutrients as needed

class ProductResponse(BaseModel):
    product_id: str
    name: str
    ingredients: List[str]
    nutrition: NutritionInfo
    additives: List[str]
    data_sources: List[str]
    image_url: Optional[str] = None

class UserProfile(BaseModel):
    """User health profile for personalized recommendations"""
    # Medical Conditions
    has_hypertension: bool = False
    has_diabetes: bool = False
    has_high_cholesterol: bool = False
    heart_disease: bool = False
    kidney_disease: bool = False
    obesity: bool = False
    
    # Allergies
    peanut_allergy: bool = False
    gluten_intolerance: bool = False
    lactose_intolerance: bool = False
    soy_allergy: bool = False
    egg_allergy: bool = False
    
    # Fitness Goals
    goal_weight_loss: bool = False
    goal_muscle_gain: bool = False
    goal_high_protein: bool = False
    goal_low_carb: bool = False
    
    # Optional
    age: Optional[int] = None
    daily_calorie_target: Optional[int] = None

class PersonalizedProductResponse(ProductResponse):
    """Product response with personalized suitability score"""
    suitability_score: float  # 0-100
    reasons: List[str]  # Explanation for the score
    warnings: List[str] = []  # Critical warnings (e.g., allergen alerts)
