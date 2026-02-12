import cv2
import numpy as np
import requests
from ..models.schemas import ProductResponse, NutritionInfo
from ..utils.normalizer import normalize_nutrition, normalize_ingredients, extract_additives
from typing import Optional, List
from difflib import get_close_matches

# Optional dependencies for image processing
try:
    from pyzbar.pyzbar import decode as pyzbar_decode
    PYZBAR_AVAILABLE = True
except ImportError:
    PYZBAR_AVAILABLE = False
    print("⚠️ Warning: pyzbar not installed. Image barcode scanning will be disabled.")

try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    print("⚠️ Warning: easyocr not installed. OCR will be disabled.")

# Initialize EasyOCR reader lazily/globally if available
reader = None
if EASYOCR_AVAILABLE:
    try:
        # GPU=False for server environments to avoid CUDA issues
        reader = easyocr.Reader(['en'], gpu=False)
    except Exception as e:
        print(f"⚠️ Warning: EasyOCR initialization failed: {e}")
        EASYOCR_AVAILABLE = False

def decode_barcode_from_image(image_bytes: bytes) -> Optional[str]:
    """
    Decodes barcode from an image byte stream.
    Requires pyzbar to be installed.
    """
    if not PYZBAR_AVAILABLE:
        print("❌ decode_barcode_from_image called but pyzbar is missing.")
        return None
        
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        
        if img is None:
            print("❌ Failed to decode image bytes to image")
            return None
            
        decoded_objects = pyzbar_decode(img)
        for obj in decoded_objects:
            return obj.data.decode('utf-8')
            
    except Exception as e:
        print(f"❌ Error decoding barcode: {e}")
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
