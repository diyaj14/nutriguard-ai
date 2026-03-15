"""
ML Model Integration Module for Personalized Food Scoring
"""
import numpy as np
import joblib
import os
from typing import Dict, Tuple, List

class PersonalizationEngine:
    """
    Handles loading the ML model and making personalized predictions.
    """
    
    # Define feature order (must match training order)
    FEATURE_ORDER = [
        # Product features
        'energy_kcal_100g', 'sugar_100g', 'fat_100g', 'saturated_fat_100g',
        'salt_100g', 'fiber_100g', 'protein_100g', 'nova_group',
        'contains_gluten', 'contains_peanut', 'contains_milk', 'contains_egg',
        # User features
        'has_hypertension', 'has_diabetes', 'has_high_cholesterol',
        'gluten_intolerance', 'peanut_allergy', 'lactose_intolerance',
        'egg_allergy', 'goal_weight_loss', 'goal_muscle_gain'
    ]
    
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
                
                # Create feature array in correct order (no pandas needed!)
                feature_values = [combined.get(feat, 0) for feat in self.FEATURE_ORDER]
                input_array = np.array([feature_values])
                
                # Predict
                score = self.model.predict(input_array)[0]
                
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

    def get_recommendations(self, current_product_data: dict, current_score: float, user_profile: dict) -> List[dict]:
        """
        Find healthier alternatives to the current product by searching OpenFoodFacts.
        """
        # --- 1. Identify category for search ---
        cat_tags = current_product_data.get('categories_tags', [])
        # Find the most specific category (usually longer strings or further down the list)
        # Filter for useful categories (avoid generic ones like 'en:food')
        search_cat = "en:snacks" # Default fallback
        
        useful_cats = [c for c in cat_tags if not c.startswith('en:label') and len(c) > 5 and ':' in c]
        if useful_cats:
            # Pick the 2nd to last or last tag for better specificity
            search_cat = useful_cats[-1]
            
        # --- 2. Fetch candidates ---
        from ..resolvers.barcode_resolver import resolve_by_category
        candidates = resolve_by_category(search_cat, limit=12)
        
        # --- 3. Add fallbacks from library if search returns few results ---
        if len(candidates) < 3:
            current_category_type = self._map_product_to_features(current_product_data).get('category', 'Snack')
            HEALTHY_LIBRARY = {
                'Snack': [
                    {'name': 'Roasted Makhanas', 'product_id': 'makhana01', 'energy_kcal_100g': 350, 'sugars_100g': 0.5, 'salt_100g': 0.2, 'proteins_100g': 9.0, 'fat_100g': 0.1, 'saturated_fat_100g': 0, 'nova_group': 1, 'image_url': 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=200'},
                    {'name': 'Mixed Roasted Nuts', 'product_id': 'nuts02', 'energy_kcal_100g': 600, 'sugars_100g': 4.0, 'salt_100g': 0.1, 'proteins_100g': 20.0, 'fat_100g': 50.0, 'saturated_fat_100g': 7, 'nova_group': 2, 'image_url': 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&q=80&w=200'}
                ],
                'Beverage': [
                    {'name': 'Unsweetened Green Tea', 'product_id': 'tea01', 'energy_kcal_100g': 2, 'sugars_100g': 0, 'salt_100g': 0, 'proteins_100g': 0, 'fat_100g': 0, 'saturated_fat_100g': 0, 'nova_group': 1, 'image_url': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=200'},
                    {'name': 'Fresh Coconut Water', 'product_id': 'coconut03', 'energy_kcal_100g': 19, 'sugars_100g': 3.7, 'salt_100g': 0.1, 'proteins_100g': 0.7, 'fat_100g': 0.2, 'saturated_fat_100g': 0, 'nova_group': 1, 'image_url': 'https://images.unsplash.com/photo-1523675322749-163414005489?auto=format&fit=crop&q=80&w=200'}
                ]
            }
            candidates.extend(HEALTHY_LIBRARY.get(current_category_type, HEALTHY_LIBRARY['Snack']))

        # --- 4. Score and Filter ---
        recommendations = []
        seen_ids = {current_product_data.get('product_id'), current_product_data.get('code')}
        
        for candidate in candidates:
            pid = candidate.get('product_id') or candidate.get('code')
            if pid in seen_ids:
                continue
            seen_ids.add(pid)
            
            # Score candidate
            score, _, _ = self.predict(candidate, user_profile)
            
            # Only recommend if it's better by at least 10 points or it's a "good" product (>70)
            if score > current_score + 5 or (score > 75 and current_score < 75):
                # Generate a simple improvement reason
                improvement_reason = ""
                curr_sugar = current_product_data.get('sugars_100g', 0)
                cand_sugar = candidate.get('sugars_100g', 0)
                
                if cand_sugar < curr_sugar * 0.7:
                    improvement_reason = f"Significantly lower in sugar ({cand_sugar}g vs {curr_sugar}g)"
                elif candidate.get('nova_group', 4) < current_product_data.get('nova_group', 4):
                    improvement_reason = "Less processed (lower NOVA group)"
                elif candidate.get('proteins_100g', 0) > current_product_data.get('proteins_100g', 0) + 5:
                    improvement_reason = "Higher in protein"
                else:
                    improvement_reason = "Better overall nutritional balance for your profile"

                recommendations.append({
                    'name': candidate['name'],
                    'product_id': str(pid),
                    'suitability_score': round(score, 1),
                    'improvement_score': round(score - current_score, 1),
                    'image_url': candidate.get('image_url'),
                    'reason': improvement_reason
                })
        
        # Sort by score and take top 3
        return sorted(recommendations, key=lambda x: x['suitability_score'], reverse=True)[:3]

    def get_additive_details(self, additive_ids: List[str]) -> List[dict]:
        """Get detailed health impact for a list of E-numbers."""
        ADDITIVE_DB = {
            'E102': {'name': 'Tartrazine', 'risk': 'high', 'description': 'Artificial yellow dye. Linked to hyperactivity in children and asthma.'},
            'E110': {'name': 'Sunset Yellow', 'risk': 'high', 'description': 'Artificial orange dye. Banned in some countries due to health concerns.'},
            'E129': {'name': 'Allura Red', 'risk': 'high', 'description': 'Artificial red dye. May cause allergic reactions in some people.'},
            'E133': {'name': 'Brilliant Blue', 'risk': 'moderate', 'description': 'Synthetic dye. Generally safe but limited intake recommended.'},
            'E150C': {'name': 'Ammonia Caramel', 'risk': 'moderate', 'description': 'Coloring agent. Some studies suggest potential inflammatory effects.'},
            'E202': {'name': 'Potassium Sorbate', 'risk': 'low', 'description': 'Common preservative. Generally recognized as safe.'},
            'E211': {'name': 'Sodium Benzoate', 'risk': 'moderate', 'description': 'Preservative. Can react with Vitamin C to form benzene in soft drinks.'},
            'E330': {'name': 'Citric Acid', 'risk': 'low', 'description': 'Natural acidity regulator. Very safe.'},
            'E415': {'name': 'Xanthan Gum', 'risk': 'low', 'description': 'Thickener. Safe for most, though may cause digestive issues in large amounts.'},
            'E440': {'name': 'Pectin', 'risk': 'low', 'description': 'Natural thickener from fruit. Very safe.'},
            'E621': {'name': 'MSG (Monosodium Glutamate)', 'risk': 'moderate', 'description': 'Flavor enhancer. Some people report sensitivity (headaches, sweating).'},
            'E951': {'name': 'Aspartame', 'risk': 'moderate', 'description': 'Artificial sweetener. Controversial; some concerns about long-term neurological impact.'},
            'E955': {'name': 'Sucralose', 'risk': 'moderate', 'description': 'Artificial sweetener. May impact gut microbiome in high amounts.'},
        }
        
        details = []
        for aid in additive_ids:
            # Clean ID (remove trailing 'i', etc)
            clean_id = aid.upper()
            if clean_id in ADDITIVE_DB:
                details.append({
                    'id': clean_id,
                    **ADDITIVE_DB[clean_id]
                })
            else:
                # Fallback for unknown additives
                details.append({
                    'id': clean_id,
                    'name': f'Additive {clean_id}',
                    'risk': 'low',
                    'description': 'Information not available, but generally used in safe quantities.'
                })
        return details


# Global instance (singleton pattern)
_engine_instance = None

def get_personalization_engine() -> PersonalizationEngine:
    """Get or create the global personalization engine instance."""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = PersonalizationEngine()
    return _engine_instance
