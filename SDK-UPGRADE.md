# 🚀 Expo SDK Upgrade Guide - Quick Fix

## ❌ **Your Issue:** SDK Version Mismatch
- **Your Project:** Expo SDK 49
- **Your Expo Go App:** SDK 53
- **Solution:** Upgrade project to SDK 53

---

## ⚡ **Quick Fix (Choose One):**

### Option 1: Automated Upgrade
```bash
fix-expo.bat          # Runs full SDK upgrade
```

### Option 2: Manual Upgrade
```bash
# Stop any running processes (Ctrl+C)

# Upgrade Expo SDK
npm install expo@~53.0.0

# Update React dependencies  
npm install react@18.3.1 react-native@0.76.1

# Fix dependencies
npx expo install --fix

# Clear caches
npm cache clean --force

# Start with compatible version
npx expo start --tunnel
```

### Option 3: Web Version (Bypass Mobile)
```bash
npx expo start --web
```
This opens in your browser immediately - no mobile compatibility issues!

---

## 🔍 **Alternative Solutions:**

### If you want to keep SDK 49:
1. **Downgrade Expo Go app** (not recommended)
2. **Use Expo Dev Client** instead of Expo Go
3. **Use web version** for development

### If upgrade fails:
```bash
# Nuclear option - complete reset
rmdir /s node_modules
del package-lock.json  
npm install
npx expo install --fix
```

---

## 🎯 **Expected Result After Fix:**
1. ✅ Project uses Expo SDK 53
2. ✅ Compatible with latest Expo Go app
3. ✅ QR code works without version errors
4. ✅ App loads on mobile device

---

## 📱 **Test Steps:**
1. Run the upgrade
2. Wait for QR code
3. Scan with Expo Go app
4. App should load without "incompatible" error
5. Test login with: `admin@nbs.com / admin123`

---

**Start with `fix-expo.bat` - it will upgrade everything automatically!** 🚀
