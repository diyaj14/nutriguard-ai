import requests
from ..models.schemas import ProductResponse, NutritionInfo
from ..utils.normalizer import normalize_nutrition, normalize_ingredients, extract_additives
from typing import Optional
import time

def resolve_by_barcode(barcode: str) -> Optional[ProductResponse]:
    """
    Fetches product data from OpenFoodFacts for the given barcode.
    Works with ANY valid barcode in the OpenFoodFacts database.
    Includes retry logic and fallback domains for reliability.
    """
    # Clean barcode (remove spaces, dashes)
    barcode = str(barcode).strip().replace('-', '').replace(' ', '')
    
    # Try multiple OpenFoodFacts domains (in case one is down)
    domains = [
        "https://world.openfoodfacts.org",
        "https://world.openfoodfacts.net",
        "https://us.openfoodfacts.org"
    ]
    
    for domain_idx, base_domain in enumerate(domains):
        url = f"{base_domain}/api/v2/product/{barcode}"
        
        # Retry logic (max 2 attempts per domain)
        for attempt in range(2):
            try:
                if domain_idx > 0 or attempt > 0:
                    print(f"� Retry attempt {attempt + 1} with domain: {base_domain}")
                else:
                    print(f"�🔍 Querying OpenFoodFacts for barcode: {barcode}")
                
                response = requests.get(url, timeout=10)
                
                if response.status_code != 200:
                    print(f"⚠️ Status code {response.status_code} from {base_domain}")
                    continue
                    
                data = response.json()
                
                # Check if product was found
                if data.get('status') != 1 and not data.get('product'):
                    print(f"❌ Product not found in OpenFoodFacts database")
                    return None
                
                print(f"✅ Product found in OpenFoodFacts!")
                product = data['product']
                
                # Extract product name with fallbacks
                product_name = (
                    product.get('product_name') or 
                    product.get('product_name_en') or 
                    product.get('generic_name') or 
                    'Unknown Product'
                )
                
                # Normalize nutrition data
                nutrients = product.get('nutriments', {})
                nutrition = normalize_nutrition(nutrients)
                
                # Normalize ingredients
                raw_ingredients = (
                    product.get('ingredients_text') or 
                    product.get('ingredients_text_en') or 
                    ''
                )
                ingredients = normalize_ingredients(raw_ingredients)
                
                # Extract additives
                raw_additives = product.get('additives_tags', [])
                additives = extract_additives(raw_additives)
                
                # Extract sources
                sources = [s.get('id', 'OpenFoodFacts') for s in product.get('sources', [])]
                if not sources:
                    sources = ["OpenFoodFacts"]
                
                # Get best available image
                image_url = (
                    product.get('image_front_url') or
                    product.get('image_url') or
                    product.get('image_front_small_url')
                )
                
                print(f"📦 Product: {product_name}")
                print(f"🔢 Barcode: {barcode}")
                print(f"🥗 Ingredients: {len(ingredients)} found")
                print(f"📊 Nutrition data: {len([k for k, v in nutrition.items() if v is not None])} fields")
                
                return ProductResponse(
                    product_id=product.get('code', barcode),
                    name=product_name,
                    ingredients=ingredients,
                    nutrition=NutritionInfo(**nutrition),
                    additives=additives,
                    data_sources=sources,
                    image_url=image_url
                )
                
            except requests.exceptions.Timeout:
                print(f"⏱️ Timeout on attempt {attempt + 1} with {base_domain}")
                if attempt == 0:
                    time.sleep(1)  # Wait 1 second before retry
                continue
                
            except requests.exceptions.ConnectionError as e:
                print(f"🌐 Connection error with {base_domain}: {str(e)[:100]}")
                if attempt == 0:
                    time.sleep(1)
                continue
                
            except requests.exceptions.RequestException as e:
                print(f"🌐 Network error with {base_domain}: {str(e)[:100]}")
                if attempt == 0:
                    time.sleep(1)
                continue
                
            except Exception as e:
                print(f"❌ Error processing product data: {e}")
                import traceback
                traceback.print_exc()
                return None
    
    # If all domains and retries failed
    print(f"❌ Failed to fetch product after trying all domains")
    return None
