from typing import Dict, Any, List
import re

def clean_nutrient_value(value: Any) -> float:
    """Standardizes nutrient values."""
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        # Remove non-numeric characters besides periods
        match = re.search(r"([\d\.]+)", value)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return 0.0
    return 0.0

def normalize_nutrition(nutrition_data: Dict[str, Any]) -> Dict[str, float]:
    """Extracts and normalizes nutrition data to per 100g."""
    normalized = {
        "energy_kcal_100g": clean_nutrient_value(nutrition_data.get("energy-kcal_100g", nutrition_data.get("energy-kcal"))),
        "fat_100g": clean_nutrient_value(nutrition_data.get("fat_100g", nutrition_data.get("fat"))),
        "saturated_fat_100g": clean_nutrient_value(nutrition_data.get("saturated-fat_100g", nutrition_data.get("saturated-fat"))),
        "carbohydrates_100g": clean_nutrient_value(nutrition_data.get("carbohydrates_100g", nutrition_data.get("carbohydrates"))),
        "sugars_100g": clean_nutrient_value(nutrition_data.get("sugars_100g", nutrition_data.get("sugars"))),
        "proteins_100g": clean_nutrient_value(nutrition_data.get("proteins_100g", nutrition_data.get("proteins"))),
        "sodium_100g": clean_nutrient_value(nutrition_data.get("sodium_100g", nutrition_data.get("sodium"))),
        "fiber_100g": clean_nutrient_value(nutrition_data.get("fiber_100g", nutrition_data.get("fiber"))),
    }
    return normalized

def normalize_ingredients(ingredients_text: str) -> List[str]:
    """Cleans up ingredients text and returns a list."""
    if not ingredients_text:
        return []
        
    # Remove marketing noise like 'Fresh', 'Premium', etc if needed.
    # For now, splitting by comma and stripping whitespace.
    # Also clean up HTML entities, weird characters
    
    cleaned = re.sub(r'[\(\[\{].*?[\)\]\}]', '', ingredients_text) # Remove parenthesis info for now
    items = [item.strip() for item in cleaned.split(',')]
    return [item for item in items if item]

def extract_additives(additives_tags: List[str]) -> List[str]:
    """Extracts additive codes (e.g., E330)."""
    if not additives_tags:
        return []
    # OpenFoodFacts returns tags like 'en:e330', so create list of codes
    return [tag.replace('en:', '').upper() for tag in additives_tags if tag.startswith('en:e')]
