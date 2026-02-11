"""
ML Model Integration Module for Personalized Food Scoring
"""
import pandas as pd
import joblib
import os
from typing import Dict, Tuple, List

class PersonalizationEngine:
    """
    Handles loading the ML model and making personalized predictions.
    """
    
    def __init__(self, model_path: str = None):
        """Initialize the personalization engine."""
        if model_path is None:
            # Default path: same directory as this file
            model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'personalization_model.pkl')
        
        self.model_path = model_path
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the trained model from disk."""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print(f"✅ Personalization model loaded from {self.model_path}")
            else:
                print(f"⚠️ Warning: Model file not found at {self.model_path}")
                print("   The engine will use fallback rule-based scoring.")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model = None
    
    def _map_product_to_features(self, product_data: dict) -> dict:
        """
        Convert API product data to model input features.
        Matches the structure defined in ml_training_colab_script.py
        """
        # Category mapping (simple heuristic)
        categories_whitelist = ['Snack', 'Beverage', 'Dairy', 'Cereal', 'Ready-Meal', 'Condiment']
        cat_tags = [t.lower() for t in product_data.get('categories_tags', [])]
        
        model_category = 'Snack'  # Default
        if any('beverage' in t or 'drink' in t for t in cat_tags):
            model_category = 'Beverage'
        elif any('dairy' in t or 'milk' in t for t in cat_tags):
            model_category = 'Dairy'
        elif any('cereal' in t or 'breakfast' in t for t in cat_tags):
            model_category = 'Cereal'
        elif any('meal' in t or 'ready' in t for t in cat_tags):
            model_category = 'Ready-Meal'
        
        # Allergens detection
        allergens = str(product_data.get('allergens_tags', [])).lower()
        traces = str(product_data.get('traces_tags', [])).lower()
        combined_allergens = allergens + " " + traces
        
        return {
            'category': model_category,
            'energy_kcal_100g': product_data.get('energy_kcal_100g', 0),
            'sugar_100g': product_data.get('sugars_100g', 0),
            'fat_100g': product_data.get('fat_100g', 0),
            'saturated_fat_100g': product_data.get('saturated_fat_100g', 0),
            'salt_100g': product_data.get('salt_100g', 0),
            'fiber_100g': product_data.get('fiber_100g', 0),
            'protein_100g': product_data.get('proteins_100g', 0),
            'nova_group': product_data.get('nova_group', 4),
            'contains_gluten': 1 if 'gluten' in combined_allergens else 0,
            'contains_peanut': 1 if ('peanut' in combined_allergens or 'nut' in combined_allergens) else 0,
            'contains_milk': 1 if ('milk' in combined_allergens or 'dairy' in combined_allergens) else 0,
            'contains_egg': 1 if 'egg' in combined_allergens else 0,
        }
    
    def _map_user_to_features(self, user_profile: dict) -> dict:
        """Convert user profile to model input features."""
        return {
            'has_hypertension': int(user_profile.get('has_hypertension', False)),
            'has_diabetes': int(user_profile.get('has_diabetes', False)),
            'has_high_cholesterol': int(user_profile.get('has_high_cholesterol', False)),
            'gluten_intolerance': int(user_profile.get('gluten_intolerance', False)),
            'peanut_allergy': int(user_profile.get('peanut_allergy', False)),
            'lactose_intolerance': int(user_profile.get('lactose_intolerance', False)),
            'egg_allergy': int(user_profile.get('egg_allergy', False)),
            'goal_weight_loss': int(user_profile.get('goal_weight_loss', False)),
            'goal_muscle_gain': int(user_profile.get('goal_muscle_gain', False)),
        }
    
    def _fallback_scoring(self, product_features: dict, user_features: dict) -> Tuple[float, List[str], List[str]]:
        """
        Rule-based fallback scoring when ML model is not available.
        Implements the logic from mlmodel.txt
        """
        score = 100.0
        reasons = []
        warnings = []
        
        # --- HARD CONSTRAINTS (Safety) ---
        if user_features['peanut_allergy'] and product_features['contains_peanut']:
            warnings.append("⚠️ ALLERGEN ALERT: Contains peanuts - UNSAFE for you!")
            return 0.0, ["Product contains allergen you're allergic to"], warnings
        
        if user_features['gluten_intolerance'] and product_features['contains_gluten']:
            warnings.append("⚠️ ALLERGEN ALERT: Contains gluten - UNSAFE for you!")
            return 0.0, ["Product contains allergen you're intolerant to"], warnings
        
        if user_features['lactose_intolerance'] and product_features['contains_milk']:
            warnings.append("⚠️ ALLERGEN ALERT: Contains milk/lactose - UNSAFE for you!")
            return 0.0, ["Product contains allergen you're intolerant to"], warnings
        
        if user_features['egg_allergy'] and product_features['contains_egg']:
            warnings.append("⚠️ ALLERGEN ALERT: Contains egg - UNSAFE for you!")
            return 0.0, ["Product contains allergen you're allergic to"], warnings
        
        # --- SOFT PENALTIES (Health Conditions) ---
        
        # Hypertension: Penalize high salt
        if user_features['has_hypertension']:
            if product_features['salt_100g'] > 1.5:
                score -= 40
                reasons.append("High salt content (not suitable for hypertension)")
            elif product_features['salt_100g'] > 0.5:
                score -= 20
                reasons.append("Moderate salt content (caution with hypertension)")
        
        # Diabetes: Penalize high sugar
        if user_features['has_diabetes']:
            if product_features['sugar_100g'] > 22.5:
                score -= 50
                reasons.append("Very high sugar content (not suitable for diabetes)")
            elif product_features['sugar_100g'] > 5.0:
                score -= 25
                reasons.append("Moderate sugar content (caution with diabetes)")
        
        # High Cholesterol: Penalize Saturated Fat
        if user_features['has_high_cholesterol']:
            if product_features['saturated_fat_100g'] > 5.0:
                score -= 30
                reasons.append("High saturated fat (not suitable for high cholesterol)")
        
        # --- GOALS (Fitness) ---
        
        # Weight Loss: Penalize high calories & sugar
        if user_features['goal_weight_loss']:
            if product_features['energy_kcal_100g'] > 400:
                score -= 20
                reasons.append("High calorie content (not ideal for weight loss)")
            if product_features['sugar_100g'] > 15:
                score -= 15
                reasons.append("High sugar content (not ideal for weight loss)")
        
        # Muscle Gain: Reward/penalize protein
        if user_features['goal_muscle_gain']:
            if product_features['protein_100g'] > 20:
                score += 10
                reasons.append("Excellent protein content (great for muscle gain)")
            elif product_features['protein_100g'] < 5:
                score -= 10
                reasons.append("Low protein content (not ideal for muscle gain)")
        
        # --- GENERAL HEALTH (Base Penalties) ---
        if product_features['nova_group'] == 4:
            score -= 15
            reasons.append("Ultra-processed food (NOVA Group 4)")
        elif product_features['nova_group'] == 3:
            score -= 5
            reasons.append("Processed food (NOVA Group 3)")
        
        # Ensure score is in valid range
        score = max(0.0, min(100.0, score))
        
        if not reasons:
            reasons.append("Product is generally suitable for your profile")
        
        return score, reasons, warnings
    
    def predict(self, product_data: dict, user_profile: dict) -> Tuple[float, List[str], List[str]]:
        """
        Predict suitability score for a product given a user profile.
        
        Returns:
            Tuple of (score, reasons, warnings)
        """
        # Map to model features
        product_features = self._map_product_to_features(product_data)
        user_features = self._map_user_to_features(user_profile)
        
        # If model is available, use it
        if self.model:
            try:
                # Combine features into single row
                combined = {**product_features, **user_features}
                input_df = pd.DataFrame([combined])
                
                # Predict
                score = self.model.predict(input_df)[0]
                
                # Generate explanations (basic version - can be enhanced)
                reasons, warnings = self._generate_explanations(product_features, user_features, score)
                
                return float(score), reasons, warnings
                
            except Exception as e:
                print(f"⚠️ Model prediction failed: {e}. Using fallback scoring.")
                return self._fallback_scoring(product_features, user_features)
        else:
            # Use rule-based fallback
            return self._fallback_scoring(product_features, user_features)
    
    def _generate_explanations(self, product_features: dict, user_features: dict, score: float) -> Tuple[List[str], List[str]]:
        """Generate human-readable explanations for the score."""
        reasons = []
        warnings = []
        
        # Check allergens first
        allergen_map = {
            ('peanut_allergy', 'contains_peanut', 'peanuts'),
            ('gluten_intolerance', 'contains_gluten', 'gluten'),
            ('lactose_intolerance', 'contains_milk', 'milk/lactose'),
            ('egg_allergy', 'contains_egg', 'egg'),
        }
        
        for user_key, product_key, name in allergen_map:
            if user_features.get(user_key) and product_features.get(product_key):
                warnings.append(f"⚠️ ALLERGEN ALERT: Contains {name}")
        
        # Score-based explanations
        if score >= 80:
            reasons.append("Excellent match for your health profile")
        elif score >= 60:
            reasons.append("Good match with minor concerns")
        elif score >= 40:
            reasons.append("Moderate suitability - consume with caution")
        else:
            reasons.append("Not recommended for your health profile")
        
        # Specific nutritional insights
        if product_features['sugar_100g'] > 20:
            reasons.append(f"High sugar content ({product_features['sugar_100g']}g per 100g)")
        if product_features['salt_100g'] > 1.0:
            reasons.append(f"High salt content ({product_features['salt_100g']}g per 100g)")
        
        return reasons, warnings


# Global instance (singleton pattern)
_engine_instance = None

def get_personalization_engine() -> PersonalizationEngine:
    """Get or create the global personalization engine instance."""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = PersonalizationEngine()
    return _engine_instance
