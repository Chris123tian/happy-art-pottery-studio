# Cloudinary Setup Guide for Happy Art Pottery Studio

Cloudinary offers **25 GB free storage & monthly credits**, ultra-fast global CDN delivery, and automatic image optimization. It completely solves Firebase Storage quota errors.

---

## Quick Setup (Takes 2 Minutes)

### Step 1: Create a Free Cloudinary Account
1. Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free) and sign up for a free account.
2. After logging in, go to your **Dashboard**.
3. Note your **Cloud Name** (e.g. `happyartstudio`).

---

### Step 2: Create an Unsigned Upload Preset
1. Click the **Settings Gear Icon ⚙️** at the bottom left of Cloudinary Console.
2. Select **Upload** under *Product Settings*.
3. Scroll down to **Upload presets** and click **Add upload preset**.
4. Configure the preset:
   - **Upload preset name**: Choose a name (e.g. `happy_art_preset`) or copy the generated one.
   - **Signing Mode**: Select **Unsigned** *(Required so your app can upload directly without a backend secret key)*.
   - **Folder**: `happy-art-pottery` (optional).
5. Click **Save** at the top right.

---

### Step 3: Add Keys to `.env`

Add your Cloud Name and Upload Preset name to `.env` in the `expo` directory:

```env
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=happy_art_preset
```

---

## How It Works in Your App

`imageService.ts` handles image uploads intelligently:

1. **Primary**: If `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` and `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` are set in `.env`, images are uploaded directly to **Cloudinary CDN** (25 GB free storage).
2. **Secondary**: If Cloudinary keys are missing or fail, it tries **Firebase Storage**.
3. **Fallback**: If Firebase Storage quota is exceeded, it compresses the image and saves it directly as a Base64 Data URI in Firestore, so your admin website **never fails or crashes**.
