# Firebase Storage Setup

## Critical Issue
Your Firebase Storage is blocking uploads with CORS errors because storage security rules are not configured.

## Required Steps

### 1. Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `happy-79ddd`
3. Go to **Storage** in the left menu
4. Click on the **Rules** tab

### 2. Set Storage Security Rules

Replace the existing rules with these rules:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'happyartgh@gmail.com';
    }
    
    // Gallery images - Public read, admin write
    match /gallery/{imageId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Classes images - Public read, admin write
    match /classes/{imageId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Instructors images - Public read, admin write
    match /instructors/{imageId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Events images - Public read, admin write
    match /events/{imageId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // All other paths - admin only
    match /{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### 3. Publish Rules

Click **Publish** button to activate the rules.

### 4. Test Upload

After publishing:
1. Clear your browser cache or open in incognito mode
2. Log in to admin panel
3. Try uploading an image to gallery

## What These Rules Do

- **Public Read**: Anyone can view/download images (required for website visitors)
- **Admin Write**: Only authenticated admin (`happyartgh@gmail.com`) can upload/delete images
- **Organized by Folder**: Images are stored in folders (gallery/, classes/, etc.)

## Troubleshooting

If uploads still fail after setting rules:

1. **Verify Authentication**: Make sure you're logged in as `happyartgh@gmail.com`
2. **Check Storage Bucket**: Ensure the bucket name matches in your Firebase config
3. **Clear Cache**: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check Console**: Look for detailed error messages in browser console

## Important Notes

- **File Size Limit**: Current limit is 10MB per image (set in code)
- **Supported Formats**: JPG, PNG, WebP
- **CORS**: These rules automatically handle CORS for web uploads
- **Security**: Only admin email can upload, preventing unauthorized uploads
