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
    
    // Bookings - Anyone can create, admin can read/update/delete
    match /bookings/{document=**} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }
    
    // Messages - Anyone can create, admin can read/delete
    match /messages/{document=**} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
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
