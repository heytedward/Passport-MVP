# 🧪 Testing Instructions for QR Scanning & Account Creation

## ⚡ Quick Start Testing

### 1. **Start the App**
```bash
npm start
```

### 2. **Test Account Creation**
1. Open the app (should start at `http://localhost:3000`)
2. Click the **"Sign In"** button in the top-right corner
3. Toggle to **"Sign Up"** mode
4. Create a test account:
   - **Username**: `testuser`
   - **Email**: `test@example.com`
   - **Password**: `password123`
   - **Confirm Password**: `password123`
5. Click **"Create Account"**

### 3. **Test QR Code Scanning**

#### Option A: Use Test QR Codes
1. Open `test-qr-generator.html` in your browser
2. You'll see 3 test QR codes automatically generated
3. In the app, click the **floating scan button** (camera icon, bottom-left)
4. Point your camera at one of the QR codes from the generator
5. You should see a reward modal appear

#### Option B: Generate Custom QR Codes
1. In `test-qr-generator.html`, select a reward from the dropdown
2. Click **"Generate QR Code"**
3. Use the app to scan the generated QR code

### 4. **Expected Flow**
1. **Sign Up** → Account created successfully
2. **Login** → Redirected to home screen with your username
3. **Scan QR** → Camera opens (grant permission if asked)
4. **Successful Scan** → Reward modal shows:
   - Item name and rarity
   - Wings earned (10, 25, or 50)
   - "Claim Reward" button
5. **Claim Reward** → Item added to closet, Wings balance updated

## 🎯 What to Test

### ✅ Account Creation
- [ ] Sign up with valid credentials
- [ ] Login with created account
- [ ] Sign out functionality
- [ ] Error handling for invalid inputs

### ✅ QR Scanning
- [ ] Camera permission request
- [ ] QR code recognition
- [ ] Reward modal display
- [ ] Wings balance update
- [ ] Duplicate prevention (scan same QR twice)

### ✅ Navigation
- [ ] Home screen → Login screen
- [ ] Login → Home screen (after auth)
- [ ] Floating scan button → Camera
- [ ] Navigation bar functionality

## 🛠️ Troubleshooting

### Camera Not Working?
- Make sure you're using HTTPS or localhost
- Grant camera permissions when prompted
- Try a different browser (Chrome recommended)

### QR Codes Not Scanning?
- Ensure good lighting
- Hold phone steady
- Make sure QR code is clear and not too small

### Authentication Issues?
- Check your `.env` file has correct Supabase credentials
- Verify Supabase project is running
- Check browser console for errors

## 📱 Mobile Testing

### On Your Phone:
1. Find your computer's IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access: `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)
3. Test QR scanning with physical QR codes

## 🎉 Success Criteria

Your app is working correctly if you can:
1. ✅ Create a new account
2. ✅ Login and see personalized home screen
3. ✅ Open camera by clicking scan button
4. ✅ Scan QR codes and see reward modals
5. ✅ See Wings balance update after claiming rewards

---

**Ready to test? Run `npm start` and follow the steps above!** 