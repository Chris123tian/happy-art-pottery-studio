# Website Improvements: Performance, Admin Features, Reviews & Layout Fixes

## Summary
Seven improvements to the Happy Art pottery studio website covering performance, admin tools, booking UX, reviews, and layout.

---

### 1. 🚀 Faster Image Loading
- [x] Add optimized image sizes (smaller thumbnails for gallery grids, medium for cards)
- [x] Use lower-resolution image URLs with width parameters where possible
- [x] Add placeholder backgrounds so content doesn't jump while images load
- [x] Enable progressive loading with blur-up effect on hero and gallery images

### 2. 🛠 Fix Admin Event Upload/Update Issues
- [x] Fix the event creation and update flow to handle image uploads more reliably
- [x] Add better error messages when uploads fail
- [x] Show a loading spinner overlay during image upload to prevent double-taps
- [x] Ensure form data is properly preserved when switching between create and edit modes

### 3. 📅 Date Picker for Booking
- [x] Replace the plain text "Date" field with a proper calendar date picker
- [x] Tapping the date field opens a calendar popup where customers pick a date
- [x] The selected date automatically fills in both the date and the day of the week
- [x] Remove the separate "Day" text field since it will be auto-calculated
- [x] Works on both web and mobile

### 4. 💰 Admin Price List Management
- [x] Add a new "Price List" section in the admin dashboard
- [x] Admin can edit all pricing categories: Pot Making (weekday/weekend, group sizes, amounts, durations) and Pot Painting prices
- [x] Admin can update payment notes (Momo number, deposit percentage, etc.)
- [x] Price changes appear instantly on the booking page for customers
- [x] Prices are stored in the database so they persist across sessions

### 5. ⭐ Customer Reviews System
- [x] Add a "Leave a Review" button on the home page in the testimonials section
- [x] Customers fill in their name, rating (1–5 stars), and review text
- [x] Submitted reviews go into a "pending" state and are not shown until approved
- [x] Admin gets a new "Reviews" management page to approve, reject, or delete reviews
- [x] Admin can also manually add reviews
- [x] Approved reviews display in the testimonials section on the home page

### 6. ↔️ "How It Works" Horizontal Layout
- [x] Change the 3 steps (Choose Your Class → Book Your Session → Create & Enjoy) from stacking vertically to displaying side by side in a horizontal row
- [x] Each step card takes equal width, reducing white space on the screen
- [x] Cleaner, more compact look that fills the screen width

### 7. 🖼 Service Images
- [x] Add an image above each service in the "Our Services" section on the home page
- [x] Each service (Wheel Throwing, Pot Painting, Free Hand Modeling, Pottery Sales) gets its own image
- [x] Admin can upload custom images for each service from the admin settings
- [x] Services section will look more visual and engaging with images alongside text
- [x] Images stored in the database and manageable from admin panel
