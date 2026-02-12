## 🔧 Network Troubleshooting Guide

### Issue: "Failed to resolve 'world.openfoodfacts.net'"

This error means your computer can't connect to the OpenFoodFacts API. Here are solutions:

---

## ✅ **Quick Fixes**

### 1. **Check Internet Connection**
```bash
# Test if you can reach Google
ping google.com

# Test OpenFoodFacts
ping world.openfoodfacts.org
```

### 2. **Flush DNS Cache** (Windows)
```powershell
ipconfig /flushdns
```

### 3. **Change DNS Server**
Your DNS might be blocking OpenFoodFacts. Try using Google DNS:
- Open Network Settings
- Change DNS to: `8.8.8.8` and `8.8.4.4`

### 4. **Disable VPN/Proxy**
If you're using a VPN or proxy, try disabling it temporarily.

### 5. **Check Firewall**
- Windows Defender might be blocking Python
- Add exception for `python.exe` and `uvicorn`

### 6. **Try Different Network**
- Switch from WiFi to mobile hotspot
- Or vice versa

---

## 🔄 **Backend Now Has Auto-Retry**

The updated code will automatically:
1. ✅ Try `world.openfoodfacts.org` first
2. ✅ Fallback to `world.openfoodfacts.net`
3. ✅ Fallback to `us.openfoodfacts.org`
4. ✅ Retry each domain 2 times
5. ✅ Wait 1 second between retries

---

## 🧪 **Test the Fix**

Restart your backend and try again:

```bash
# Stop the backend (Ctrl+C)
# Then restart:
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then test with any barcode:
- Nutella: `3017624010701`
- Coca-Cola: `5449000000996`

---

## 📊 **What You Should See**

If it works, you'll see:
```
🔍 Querying OpenFoodFacts for barcode: 5449000000996
✅ Product found in OpenFoodFacts!
📦 Product: Coca-Cola
```

If it fails on first domain:
```
🔍 Querying OpenFoodFacts for barcode: 5449000000996
🌐 Connection error with https://world.openfoodfacts.org
🔄 Retry attempt 1 with domain: https://world.openfoodfacts.net
✅ Product found in OpenFoodFacts!
```

---

## 🆘 **Still Not Working?**

If none of the above work, you might have a strict corporate firewall. In that case:

1. **Use mobile hotspot** for testing
2. **Contact IT** if on corporate network
3. **Check antivirus** settings

---

## 💡 **Alternative: Use Mock Data**

If you absolutely can't connect, I can add offline mock data for testing purposes.
