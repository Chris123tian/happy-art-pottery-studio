# Firestore Security Rules Setup

## Critical: Fix Permission Errors

Your console shows permission errors for `bookings` and `messages` collections. Follow these steps:

### 1. Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project: **happy-79ddd**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab

### 2. Replace Security Rules

Copy and paste these rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public read for all collections (website content)
    // Write requires authentication (admin only)
    
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /classes/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /instructors/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /gallery/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /events/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /testimonials/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Bookings - public can create, admin can read/update/delete
    match /bookings/{document=**} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
    
    // Messages - public can create, admin can read/delete
    match /messages/{document=**} {
      allow read: if request.auth != null;
      allow create: if true;
      allow delete: if request.auth != null;
    }
  }
}
```

### 3. Click "Publish"

After pasting the rules, click the **Publish** button at the top.

---

## What These Rules Do

- **Public Collections** (settings, classes, instructors, gallery, events, testimonials)
  - Anyone can READ (view website content)
  - Only authenticated admins can WRITE (update content)

- **Bookings**
  - Anyone can CREATE (submit booking forms)
  - Only authenticated admins can READ/UPDATE/DELETE

- **Messages**
  - Anyone can CREATE (submit contact forms)
  - Only authenticated admins can READ/DELETE

---

## Indexes (If Needed)

If you see index errors in the console, Firebase will provide a link to create the required index automatically. Click that link.

---

## Testing

After updating rules:
1. Refresh your website
2. Check browser console - permission errors should be gone
3. Test creating a booking or message without logging in
4. Test admin updates after logging in

---

## Security Notes

- These rules allow public form submissions but protect admin data
- Admin authentication is handled by Firebase Auth
- For production, consider adding rate limiting
- Consider adding field validation in the rules
