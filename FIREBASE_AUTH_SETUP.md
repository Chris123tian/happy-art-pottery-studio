# Firebase Authentication & Storage Setup

## Current Issues Fixed
✅ **Admin authentication now uses Firebase Auth** (instead of AsyncStorage)  
✅ **Image uploads now use Firebase Storage** (instead of base64 in Firestore)  
✅ **Firestore rules now properly check authenticated users**

---

## 🔥 Required Setup Steps

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **happy-79ddd**
3. Click **Authentication** in the left sidebar
4. Click **Get Started**
5. Enable **Email/Password** sign-in method
6. Click **Users** tab
7. Click **Add User**
8. Add admin user:
   - **Email**: `happyartgh@gmail.com`
   - **Password**: Choose a secure password
   - Click **Add User**

### 2. Enable Firebase Storage

1. In Firebase Console, click **Storage** in the left sidebar
2. Click **Get Started**
3. Choose **Start in production mode** (we'll set rules next)
4. Select your storage location (closest to your users)
5. Click **Done**

### 3. Configure Storage Security Rules

Replace the default Storage rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'happyartgh@gmail.com';
    }
    
    // Settings images - admin only
    match /settings/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Gallery images - admin only
    match /gallery/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Instructor images - admin only
    match /instructors/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Event images - admin only
    match /events/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // All other files - deny by default
    match /{allPaths=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

### 4. Verify Firestore Rules

Your current Firestore rules look correct. Verify they match:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'happyartgh@gmail.com';
    }
    
    // Settings - Public read, admin write
    match /settings/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Classes - Public read, admin write
    match /classes/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Instructors - Public read, admin write
    match /instructors/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Gallery - Public read, admin write
    match /gallery/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Events - Public read, admin write
    match /events/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Testimonials - Public read, admin write
    match /testimonials/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Bookings - Anyone can create, admin can read/update
    match /bookings/{document=**} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }
    
    // Messages - Anyone can create, admin can read
    match /messages/{document=**} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## 🎯 What Changed in the Code

### Authentication (contexts/AuthContext.tsx)
- **Before**: Used AsyncStorage for fake authentication
- **After**: Uses Firebase Authentication with `signInWithEmailAndPassword()`
- Now properly authenticates with Firebase and gets auth tokens

### Image Upload (services/imageService.ts)
- **Before**: Converted images to base64 (caused 1MB Firestore limit errors)
- **After**: Uploads images to Firebase Storage and stores URLs in Firestore
- Supports up to 10MB images (configurable)

### Admin Gallery (app/admin/gallery.tsx)
- Now automatically uploads to Firebase Storage when you select an image
- Stores only the download URL in Firestore (not base64)

### Admin Settings (app/admin/settings.tsx)
- Hero and About images now upload to Firebase Storage
- Images stored at `settings/hero_{timestamp}.jpg` and `settings/about_{timestamp}.jpg`

---

## 📋 Testing Checklist

After completing the setup:

1. ✅ **Test Admin Login**
   - Navigate to `/admin/login`
   - Login with: `happyartgh@gmail.com` and your chosen password
   - Should see "Login successful" in console

2. ✅ **Test Gallery Upload**
   - Go to Admin → Gallery
   - Click "Add Image"
   - Select an image from your device
   - Should upload to Firebase Storage and display

3. ✅ **Test Settings Images**
   - Go to Admin → Settings
   - Click "Upload Hero Image" or "Upload About Image"
   - Should upload and preview correctly

4. ✅ **Verify Cross-Device Sync**
   - Upload an image on one device
   - Refresh on another device
   - Should see the image immediately

---

## 🐛 Troubleshooting

### "Missing or insufficient permissions" error
- **Cause**: Firebase Auth user not created or Firestore/Storage rules not updated
- **Fix**: Complete steps 1-4 above

### Images not uploading
- **Cause**: Firebase Storage not enabled
- **Fix**: Complete step 2 above and verify Storage rules (step 3)

### "Image too large" error
- **Cause**: Image exceeds 10MB limit
- **Fix**: Use a smaller image or increase limit in `imageService.ts` line 16

### Login fails with correct password
- **Cause**: User not created in Firebase Auth
- **Fix**: Go to Firebase Console → Authentication → Users → Add User

---

## 🚀 Next Steps

1. Complete all 4 setup steps above
2. Test admin login and image uploads
3. Your data will now:
   - ✅ Persist permanently in Firebase
   - ✅ Sync across all devices in real-time
   - ✅ Support proper authentication
   - ✅ Handle images up to 10MB

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify all Firebase services are enabled in console
3. Confirm admin user email matches exactly: `happyartgh@gmail.com`
4. Check that both Firestore AND Storage rules are updated
