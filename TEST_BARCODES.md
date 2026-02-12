# 🔍 Test Barcodes for NutriGuard AI

This file contains real barcodes from OpenFoodFacts that you can use to test the application.

## 🍫 Popular Products

### Chocolate & Sweets
- **Nutella**: `3017624010701` ✅ (Your original test)
- **Ferrero Rocher**: `8000500037560`
- **Snickers Bar**: `5000159461122`
- **M&M's Peanut**: `4000539701603`
- **Toblerone**: `7622210449283`
- **Kit Kat**: `7622210449276`

### 🥤 Beverages
- **Coca-Cola**: `5449000000996`
- **Pepsi**: `5000112637588`
- **Red Bull**: `9002490100070`
- **Sprite**: `5449000000439`
- **Fanta Orange**: `5449000000453`

### 🍪 Snacks & Cookies
- **Oreo**: `7622210449283`
- **Pringles Original**: `5053990155354`
- **Doritos Nacho**: `8710398510068`
- **Lay's Classic**: `8710398510075`

### 🥛 Dairy
- **Kinder Bueno**: `8000500037560`
- **Danone Yogurt**: `3033710065967`

### 🍞 Breakfast
- **Kellogg's Corn Flakes**: `5053827142649`
- **Nesquik Cereal**: `7613035937659`

### 🍕 Prepared Foods
- **Heinz Ketchup**: `8715700421001`
- **Nutella B-ready**: `8000500310427`

## 🌍 International Products

### Indian Products
- **Parle-G Biscuits**: `8901719100017`
- **Maggi Noodles**: `8901058847062`
- **Amul Milk**: `8901430001001`

### European Products
- **Milka Chocolate**: `7622210449283`
- **Haribo Goldbears**: `4001686301012`

## 🧪 Testing Tips

1. **Valid Barcode**: Should return product data with nutrition info
2. **Invalid Barcode**: `0000000000000` - Should return 404 error
3. **Non-existent**: `9999999999999` - Should return "Product not found"

## 📝 How to Test

### Using Frontend
1. Go to Profile tab
2. Set your health conditions
3. Go to Scan tab
4. Enter any barcode from above
5. Click "Analyze Product"

### Using Backend API (curl)
```bash
curl -X POST http://localhost:8000/scan/barcode/personalized \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "5449000000996",
    "user_profile": {
      "age": 30,
      "has_diabetes": true,
      "has_hypertension": false,
      "goal_weight_loss": true
    }
  }'
```

### Using Python
```python
import requests

response = requests.post(
    "http://localhost:8000/scan/barcode/personalized",
    json={
        "barcode": "5449000000996",  # Coca-Cola
        "user_profile": {
            "age": 30,
            "has_diabetes": True,
            "goal_weight_loss": True
        }
    }
)

print(response.json())
```

## 🎯 Expected Results

### Healthy Product (e.g., Plain Yogurt)
- **Score**: 70-90
- **Warnings**: Few or none
- **Reasons**: Good protein, low sugar

### Unhealthy Product (e.g., Soda)
- **Score**: 10-40
- **Warnings**: High sugar, no nutritional value
- **Reasons**: Poor for diabetes, weight loss

## 🔗 Find More Barcodes

Visit [OpenFoodFacts](https://world.openfoodfacts.org/) to search for any product and get its barcode!
