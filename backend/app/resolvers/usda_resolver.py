from typing import Optional, Dict, Any
import requests
import os

USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

def search_usda_food(query: str) -> Optional[Dict[str, Any]]:
    """
    Searches USDA FoodData Central for a food item.
    Requires USDA_API_KEY environment variable.
    """
    if not USDA_API_KEY:
        print("Warning: USDA_API_KEY not set. USDA fallback disabled.")
        return None
        
    url = f"{USDA_BASE_URL}/foods/search"
    params = {
        "api_key": USDA_API_KEY,
        "query": query,
        "pageSize": 1
    }
    
    try:
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("foods"):
                return data["foods"][0]
    except Exception as e:
        print(f"USDA API error: {e}")
    return None

def normalize_usda_nutrition(food_item: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts and normalizes nutrition from USDA format.
    """
    nutrients = {}
    for nutrient in food_item.get("foodNutrients", []):
        name = nutrient.get("nutrientName", "").lower()
        value = nutrient.get("value", 0.0)
        
        # Mapping logic (simplified)
        if "energy" in name:
            nutrients["energy_kcal_100g"] = value
        elif "protein" in name:
            nutrients["proteins_100g"] = value
        elif "total lipid" in name or "fat" in name:
             nutrients["fat_100g"] = value
        elif "carbohydrate" in name:
             nutrients["carbohydrates_100g"] = value
        elif "sugar" in name:
             nutrients["sugars_100g"] = value
        elif "sodium" in name:
             nutrients["sodium_100g"] = value / 1000.0 # mg to g usually, but check units. USDA is often per 100g but unit varies.
             # Assuming value is in default unit, we might need unit conversion.
    
    return nutrients
