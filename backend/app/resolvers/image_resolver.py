import cv2
import numpy as np
from pyzbar.pyzbar import decode
import easyocr
import requests
from ..models.schemas import ProductResponse, NutritionInfo
from ..utils.normalizer import normalize_nutrition, normalize_ingredients, extract_additives
from typing import Optional, List
from difflib import get_close_matches

# Initialize EasyOCR reader (this will download model on first run)
# We initialize it lazily or here if we expect frequent usage.
# For now, let's initialize it globally to avoid reloading on every request, 
# but wrap in try-except in case of issues.
try:
    reader = easyocr.Reader(['en'])
except Exception as e:
    print(f"Warning: EasyOCR intialization failed: {e}")
    reader = None

def decode_barcode_from_image(image_bytes: bytes) -> Optional[str]:
    """
    Decodes barcode from an image byte stream.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        
        decoded_objects = decode(img)
        for obj in decoded_objects:
            return obj.data.decode('utf-8')
    except Exception as e:
        print(f"Error decoding barcode: {e}")
    return None

def search_product_by_name(query: str) -> Optional[ProductResponse]:
    """
    Searches OpenFoodFacts for a product by name.
    """
    url = f"https://world.openfoodfacts.net/cgi/search.pl"
    params = {
        'search_terms': query,
        'search_simple': 1,
        'action': 'process',
        'json': 1,
        'page_size': 1
    }
    try:
        print(f"DEBUG: Searching OpenFoodFacts for: '{query}'")
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        count = data.get('count', 0)
        print(f"DEBUG: Found {count} results for '{query}'")
        
        if count > 0 and data.get('products'):
            product = data['products'][0]
            
            # Normalize nutrition data
            nutrients = product.get('nutriments', {})
            nutrition = normalize_nutrition(nutrients)
            
            # Normalize ingredients
            raw_ingredients = product.get('ingredients_text', '')
            ingredients = normalize_ingredients(raw_ingredients)
            
            # Extract additives
            raw_additives = product.get('additives_tags', [])
            additives = extract_additives(raw_additives)

            # Extract sources if available
            sources = [s.get('id', 'OpenFoodFacts') for s in product.get('sources', [])]
            if not sources:
                sources = ["OpenFoodFacts Search"]
            
            return ProductResponse(
                product_id=product.get('code', 'search_result'),
                name=product.get('product_name', 'Unknown Product'),
                ingredients=ingredients,
                nutrition=NutritionInfo(**nutrition),
                additives=additives,
                data_sources=sources,
                image_url=product.get('image_front_url')
            )
    except Exception as e:
        print(f"Search failed: {e}")
    return None

def resolve_by_image(image_bytes: bytes) -> Optional[ProductResponse]:
    """
    Resolves a product from an image:
    1. Try barcode decoding.
    2. If no barcode, try OCR + Search.
    """
    barcode = decode_barcode_from_image(image_bytes)
    if barcode:
        from .barcode_resolver import resolve_by_barcode
        return resolve_by_barcode(barcode)
    
    # OCR (Fallback)
    if reader:
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            # Use IMREAD_COLOR to ensure 3 channels for EasyOCR if needed (it handles BGR)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            result = reader.readtext(img, detail=0)
            text_query = " ".join(result)
            
            if text_query.strip():
                print(f"OCR Extracted: {text_query}")
                return search_product_by_name(text_query)
        except Exception as e:
            print(f"OCR failed: {e}")
            
    return None
