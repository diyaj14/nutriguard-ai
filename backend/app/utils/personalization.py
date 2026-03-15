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
        Two-phase scoring engine:
        Phase 1 – Inherent Nutritional Quality (50 pts baseline):
            Uses WHO/NHS benchmarks to evaluate sugar, salt, saturated fat,
            calories, fiber, and protein. Produces varied scores for any product
            even with a blank user profile (e.g. Nutella ≈ 30, plain yogurt ≈ 70).
        Phase 2 – Personalization Modifiers (±30 pts):
            Adjusts score based on the user's specific health conditions,
            allergies, and fitness goals.
        """
        warnings = []
        reasons = []

        # ──────────────────────────────────────────────────────────────
        # PHASE 1 — INHERENT NUTRITIONAL QUALITY  (max 100 pts)
        # ──────────────────────────────────────────────────────────────
        # We use a sub-score approach: compute individual component scores
        # (each 0–100), then take a weighted average.

        sugar      = product_features.get('sugar_100g', 0) or 0
        salt       = product_features.get('salt_100g', 0) or 0
        sat_fat    = product_features.get('saturated_fat_100g', 0) or 0
        calories   = product_features.get('energy_kcal_100g', 0) or 0
        fiber      = product_features.get('fiber_100g', 0) or 0
        protein    = product_features.get('protein_100g', 0) or 0
        nova       = product_features.get('nova_group', 4) or 4

        # --- Sugar score (WHO: < 5g ideal, > 22.5g high) ---
        if sugar <= 2:       sugar_score = 100
        elif sugar <= 5:     sugar_score = 85
        elif sugar <= 10:    sugar_score = 65
        elif sugar <= 15:    sugar_score = 45
        elif sugar <= 22.5:  sugar_score = 25
        else:                sugar_score = 5

        # --- Salt score (NHS: < 0.3g = low, > 1.5g = high) ---
        if salt <= 0.1:      salt_score = 100
        elif salt <= 0.3:    salt_score = 85
        elif salt <= 0.6:    salt_score = 65
        elif salt <= 1.0:    salt_score = 40
        elif salt <= 1.5:    salt_score = 20
        else:                salt_score = 5

        # --- Saturated fat score (NHS: < 1.5g = low, > 5g = high) ---
        if sat_fat <= 1:     sat_fat_score = 100
        elif sat_fat <= 2:   sat_fat_score = 80
        elif sat_fat <= 3.5: sat_fat_score = 60
        elif sat_fat <= 5:   sat_fat_score = 35
        elif sat_fat <= 8:   sat_fat_score = 15
        else:                sat_fat_score = 5

        # --- Calorie score (rough guideline: < 200 low, > 500 high per 100g) ---
        if calories <= 100:    calorie_score = 90    # very low cal (veg, water)
        elif calories <= 200:  calorie_score = 80
        elif calories <= 300:  calorie_score = 65
        elif calories <= 400:  calorie_score = 50
        elif calories <= 500:  calorie_score = 35
        elif calories <= 600:  calorie_score = 20
        else:                  calorie_score = 10    # very energy dense

        # --- Fiber score (NHS: 30g/day target; per-100g > 3g = good) ---
        if fiber >= 6:       fiber_score = 100
        elif fiber >= 3:     fiber_score = 75
        elif fiber >= 1.5:   fiber_score = 50
        elif fiber >= 0.5:   fiber_score = 30
        else:                fiber_score = 10

        # --- Protein score (> 15g = high per 100g, < 2g = very low) ---
        if protein >= 20:    protein_score = 100
        elif protein >= 15:  protein_score = 85
        elif protein >= 10:  protein_score = 70
        elif protein >= 5:   protein_score = 55
        elif protein >= 2:   protein_score = 40
        else:                protein_score = 25

        # --- NOVA processing penalty (applied as a multiplier) ---
        nova_multipliers = {1: 1.0, 2: 0.95, 3: 0.88, 4: 0.78}
        nova_mult = nova_multipliers.get(int(nova), 0.78)

        # Weighted average of component scores (negatives weighted heavier)
        # Sugar 25%, Salt 20%, SatFat 18%, Calories 15%, Fiber 12%, Protein 10%
        base_score = (
            sugar_score    * 0.25 +
            salt_score     * 0.20 +
            sat_fat_score  * 0.18 +
            calorie_score  * 0.15 +
            fiber_score    * 0.12 +
            protein_score  * 0.10
        ) * nova_mult

        # Build base-level reasons
        if nova == 4:
            reasons.append("Ultra-processed food (NOVA Group 4) — significantly reduces base score")
        elif nova == 3:
            reasons.append("Processed food (NOVA Group 3) — slightly reduces nutritional quality")
        elif nova <= 2:
            reasons.append("Minimally processed food (NOVA Group 1-2) ✅")

        if sugar > 22.5:
            reasons.append(f"Very high sugar content — {sugar:.1f}g per 100g (WHO limit: <10g/day)")
        elif sugar > 10:
            reasons.append(f"High sugar content — {sugar:.1f}g per 100g")
        elif sugar <= 5:
            reasons.append(f"Low sugar content — {sugar:.1f}g per 100g ✅")

        if salt > 1.5:
            reasons.append(f"High salt content — {salt:.2f}g per 100g (NHS: >1.5g is high)")
        elif salt > 0.6:
            reasons.append(f"Moderate salt content — {salt:.2f}g per 100g")
        elif salt <= 0.3:
            reasons.append(f"Low salt content ✅")

        if sat_fat > 5:
            reasons.append(f"High saturated fat — {sat_fat:.1f}g per 100g")
        elif sat_fat <= 1.5:
            reasons.append(f"Low saturated fat ✅")

        if fiber >= 3:
            reasons.append(f"Good source of dietary fiber — {fiber:.1f}g per 100g ✅")
        
        if protein >= 15:
            reasons.append(f"High protein content — {protein:.1f}g per 100g ✅")

        # ──────────────────────────────────────────────────────────────
        # PHASE 2 — PERSONALISATION MODIFIERS  (±30 pts max)
        # ──────────────────────────────────────────────────────────────
        modifier = 0.0

        # --- Hard constraints: Allergens → score to 0 immediately ---
        if user_features.get('peanut_allergy') and product_features.get('contains_peanut'):
            warnings.append("⚠️ ALLERGEN ALERT: Contains peanuts — UNSAFE for you!")
            return 0.0, ["Product contains an allergen you're allergic to (peanut)"], warnings

        if user_features.get('gluten_intolerance') and product_features.get('contains_gluten'):
            warnings.append("⚠️ ALLERGEN ALERT: Contains gluten — UNSAFE for you!")
            return 0.0, ["Product contains an ingredient you're intolerant to (gluten)"], warnings

        if user_features.get('lactose_intolerance') and product_features.get('contains_milk'):
            warnings.append("⚠️ ALLERGEN ALERT: Contains milk/lactose — UNSAFE for you!")
            return 0.0, ["Product contains an ingredient you're intolerant to (lactose/milk)"], warnings

        if user_features.get('egg_allergy') and product_features.get('contains_egg'):
            warnings.append("⚠️ ALLERGEN ALERT: Contains egg — UNSAFE for you!")
            return 0.0, ["Product contains an allergen you're allergic to (egg)"], warnings

        # --- Hypertension: extra penalty for high salt ---
        if user_features.get('has_hypertension'):
            if salt > 1.5:
                modifier -= 20
                reasons.append("⚠️ Very high salt — especially risky with hypertension")
            elif salt > 0.6:
                modifier -= 10
                reasons.append("Moderate salt — consume in moderation with hypertension")
            elif salt <= 0.3:
                modifier += 5
                reasons.append("Low salt — good choice for hypertension ✅")

        # --- Diabetes: extra penalty for high sugar, bonus for low ---
        if user_features.get('has_diabetes'):
            if sugar > 22.5:
                modifier -= 25
                reasons.append("⚠️ Very high sugar — not safe with diabetes")
            elif sugar > 10:
                modifier -= 15
                reasons.append("High sugar — limit consumption with diabetes")
            elif sugar <= 5:
                modifier += 5
                reasons.append("Low sugar — suitable for diabetes management ✅")

        # --- High Cholesterol: extra penalty for saturated fat ---
        if user_features.get('has_high_cholesterol'):
            if sat_fat > 5:
                modifier -= 15
                reasons.append("⚠️ High saturated fat — avoid with high cholesterol")
            elif sat_fat > 3:
                modifier -= 8
                reasons.append("Moderate saturated fat — limit with high cholesterol")
            elif sat_fat <= 1.5:
                modifier += 5
                reasons.append("Low saturated fat — heart-friendly ✅")

        # --- Weight Loss goal ---
        if user_features.get('goal_weight_loss'):
            if calories > 450 and sugar > 15:
                modifier -= 12
                reasons.append("High calorie + sugar combo — not ideal for weight loss")
            elif calories <= 200 and sugar <= 5:
                modifier += 8
                reasons.append("Low calorie and low sugar — great for weight loss ✅")

        # --- Muscle Gain goal ---
        if user_features.get('goal_muscle_gain'):
            if protein >= 20:
                modifier += 12
                reasons.append(f"Excellent protein — {protein:.1f}g/100g, great for muscle gain ✅")
            elif protein >= 10:
                modifier += 5
                reasons.append(f"Good protein content — {protein:.1f}g/100g")
            elif protein < 3:
                modifier -= 8
                reasons.append(f"Very low protein — {protein:.1f}g/100g, poor for muscle gain")

        # --- High Protein goal ---
        if user_features.get('goal_high_protein'):
            if protein >= 15:
                modifier += 8
                reasons.append(f"High protein — meets your high protein goal ✅")
            elif protein < 5:
                modifier -= 8
                reasons.append(f"Low protein — doesn't meet your high protein goal")

        # --- Low Carb goal ---
        if user_features.get('goal_low_carb'):
            if sugar > 15:
                modifier -= 10
                reasons.append(f"High sugar/carbs — not suitable for low carb diet")
            elif sugar <= 5:
                modifier += 8
                reasons.append(f"Low carb-friendly product ✅")

        # Clamp modifier to ±30
        modifier = max(-30.0, min(30.0, modifier))

        final_score = base_score + modifier
        final_score = max(0.0, min(100.0, final_score))

        if not reasons:
            reasons.append("Product is in a decent nutritional range for your profile")

        return round(final_score, 1), reasons, warnings

    def predict(self, product_data: dict, user_profile: dict) -> Tuple[float, List[str], List[str]]:
        """
        Predict suitability score for a product given a user profile.

        Returns:
            Tuple of (score, reasons, warnings)
        """
        # Map to model features
        product_features = self._map_product_to_features(product_data)
        user_features = self._map_user_to_features(user_profile)

        # If ML model is available, use it — but always run our fallback for explanations
        if self.model:
            try:
                combined = {**product_features, **user_features}
                feature_values = [combined.get(feat, 0) for feat in self.FEATURE_ORDER]
                input_array = np.array([feature_values])
                ml_score = float(self.model.predict(input_array)[0])

                # Use the new rule-based engine for rich explanations
                # ML provides the score, rule-based provides the reasons
                _, reasons, warnings = self._fallback_scoring(product_features, user_features)
                ml_score_clamped = round(min(100.0, max(0.0, ml_score)), 1)
                return ml_score_clamped, reasons, warnings

            except Exception as e:
                print(f"⚠️ Model prediction failed: {e}. Using rule-based scoring.")

        # Primary path: use full rule-based engine
        return self._fallback_scoring(product_features, user_features)

    def _generate_explanations(self, product_features: dict, user_features: dict, score: float) -> Tuple[List[str], List[str]]:
        """Delegate to the new unified scoring engine for explanations."""
        _, reasons, warnings = self._fallback_scoring(product_features, user_features)
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
