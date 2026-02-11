import pandas as pd
import joblib
import json
import os
import sys

# Define expected model columns based on training script
MODEL_COLUMNS = [
    # Product Features
    'category', 'energy_kcal_100g', 'sugar_100g', 'fat_100g', 
    'saturated_fat_100g', 'salt_100g', 'fiber_100g', 'protein_100g', 
    'nova_group', 'contains_gluten', 'contains_peanut', 'contains_milk', 'contains_egg',
    # User Features
    'has_hypertension', 'has_diabetes', 'has_high_cholesterol', 
    'gluten_intolerance', 'peanut_allergy', 'lactose_intolerance', 'egg_allergy', 
    'goal_weight_loss', 'goal_muscle_gain'
]

# Mock User Profiles for Testing
TEST_USERS = {
    "Healthy User": {
        'has_hypertension': 0, 'has_diabetes': 0, 'has_high_cholesterol': 0,
        'gluten_intolerance': 0, 'peanut_allergy': 0, 'lactose_intolerance': 0, 'egg_allergy': 0,
        'goal_weight_loss': 0, 'goal_muscle_gain': 0
    },
    "Diabetic User": {
        'has_hypertension': 0, 'has_diabetes': 1, 'has_high_cholesterol': 0,
        'gluten_intolerance': 0, 'peanut_allergy': 0, 'lactose_intolerance': 0, 'egg_allergy': 0,
        'goal_weight_loss': 1, 'goal_muscle_gain': 0
    },
    "Peanut Allergy User": {
        'has_hypertension': 0, 'has_diabetes': 0, 'has_high_cholesterol': 0,
        'gluten_intolerance': 0, 'peanut_allergy': 1, 'lactose_intolerance': 0, 'egg_allergy': 0,
        'goal_weight_loss': 0, 'goal_muscle_gain': 0
    }
}

def load_data():
    """Load extracted product data and the trained model."""
    # 1. Load Product Data
    json_path = os.path.join(os.path.dirname(__file__), '..', 'files', 'extracted_features.json')
    if not os.path.exists(json_path):
        print(f"❌ Error: {json_path} not found. Run extract_features_for_ml.py first.")
        return None, None
        
    with open(json_path, 'r') as f:
        products = json.load(f)
        
    # 2. Load Model
    model_path = os.path.join(os.path.dirname(__file__), 'personalization_model.pkl')
    if not os.path.exists(model_path):
        print(f"⚠️ Warning: Model file '{model_path}' not found.")
        print("   Please run the training script in Colab, download 'personalization_model.pkl', and place it in the 'backend' folder.")
        # Create a dummy model for demonstration purposes if file is missing? 
        # No, better to fail gracefully or strict check.
        return products, None
        
    try:
        model = joblib.load(model_path)
        print(f"✅ Model loaded successfully from {model_path}")
        return products, model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return products, None

def map_api_data_to_model_input(product_data, user_profile):
    """
    Transforms API JSON structure + User Profile into a single DataFrame row
    matching the exact columns the model was trained on.
    """
    
    # --- 1. Product Feature Mapping ---
    
    # Category: Simple heuristic mapping
    categories_whitelist = ['Snack', 'Beverage', 'Dairy', 'Cereal', 'Ready-Meal', 'Condiment']
    cat_tags = [t.lower() for t in product_data.get('categories_tags', [])]
    
    model_category = 'Snack' # Default
    if any('beverage' in t for t in cat_tags): model_category = 'Beverage'
    elif any('dairy' in t or 'milk' in t for t in cat_tags): model_category = 'Dairy'
    elif any('cereal' in t or 'breakfast' in t for t in cat_tags): model_category = 'Cereal'
    elif any('meal' in t for t in cat_tags): model_category = 'Ready-Meal'
    
    # Allergens: Check tags
    allergens = str(product_data.get('allergens_tags', [])).lower()
    
    product_features = {
        'category': model_category,
        'energy_kcal_100g': product_data.get('energy_kcal_100g', 0),
        'sugar_100g': product_data.get('sugars_100g', 0), # Note plural 's' in API
        'fat_100g': product_data.get('fat_100g', 0),
        'saturated_fat_100g': product_data.get('saturated_fat_100g', 0),
        'salt_100g': product_data.get('salt_100g', 0),
        'fiber_100g': product_data.get('fiber_100g', 0),
        'protein_100g': product_data.get('protein_100g', 0),
        'nova_group': product_data.get('nova_group', 4), # Default to verified processed
        
        # Binary flags
        'contains_gluten': 1 if 'gluten' in allergens else 0,
        'contains_peanut': 1 if 'peanut' in allergens or 'nut' in allergens else 0,
        'contains_milk': 1 if 'milk' in allergens or 'dairy' in allergens else 0,
        'contains_egg': 1 if 'egg' in allergens else 0,
    }
    
    # --- 2. Combine with User Profile ---
    full_vector = {**product_features, **user_profile}
    
    # Convert to DataFrame (single row)
    return pd.DataFrame([full_vector])

def main():
    print(f"{'='*20} PERSONALIZED SUITABILITY PREDICTOR {'='*20}\n")
    
    products, model = load_data()
    
    if not products:
        return
        
    if not model:
        print("\n[MOCK MODE] Since model file is missing, we will simulate predictions.")
        print("Expected Real Setup: Load 'personalization_model.pkl' from disk.")
    
    # Iterate through products
    for product in products:
        print(f"\n🥘 Analyzing Product: {product['product_name']}")
        print(f"   (Nutrients: Sugar={product.get('sugars_100g')}g, Fat={product.get('fat_100g')}g)")
        
        # Iterate through users
        for user_name, user_profile in TEST_USERS.items():
            
            # Prepare Input
            input_df = map_api_data_to_model_input(product, user_profile)
            
            # Predict
            score = 0
            if model:
                try:
                    # Ensure columns are in correct order
                    # (Though pipeline often handles this, explicit is safer)
                    # We might need to handle missing columns if any
                    score = model.predict(input_df)[0]
                except Exception as e:
                    print(f"Error predicting: {e}")
                    score = -1
            else:
                # Mock Logic mostly matching the 'Suitability Score' logic for visual confirmation
                score = 80
                if user_profile['has_diabetes'] and product.get('sugars_100g', 0) > 10: score -= 40
                if user_profile['peanut_allergy'] and ('nuts' in str(product.get('allergens_tags'))): score = 0
            
            # Display Result
            print(f"   👤 {user_name}: Score {score:.1f}/100")
            
        print("-" * 40)

if __name__ == "__main__":
    main()
