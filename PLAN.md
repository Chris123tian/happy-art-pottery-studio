# Website Improvements: Performance, Admin Features, Reviews & Layout Fixes

## Summary
Seven improvements to the Happy Art pottery studio website covering performance, admin tools, booking UX, reviews, and layout.

---

### 1. 🚀 Faster Image Loading
- Add optimized image sizes (smaller thumbnails for gallery grids, medium for cards)
- Use lower-resolution image URLs with width parameters where possible
- Add placeholder backgrounds so content doesn't jump while images load
- Enable progressive loading with blur-up effect on hero and gallery images

### 2. 🛠 Fix Admin Event Upload/Update Issues
- Fix the event creation and update flow to handle image uploads more reliably
- Add better error messages when uploads fail
- Show a loading spinner overlay during image upload to prevent double-taps
- Ensure form data is properly preserved when switching between create and edit modes

### 3. 📅 Date Picker for Booking
- Replace the plain text "Date" field with a proper calendar date picker
- Tapping the date field opens a calendar popup where customers pick a date
- The selected date automatically fills in both the date and the day of the week
- Remove the separate "Day" text field since it will be auto-calculated
- Works on both web and mobile

### 4. 💰 Admin Price List Management
- Add a new "Price List" section in the admin dashboard
- Admin can edit all pricing categories: Pot Making (weekday/weekend, group sizes, amounts, durations) and Pot Painting prices
- Admin can update payment notes (Momo number, deposit percentage, etc.)
- Price changes appear instantly on the booking page for customers
- Prices are stored in the database so they persist across sessions

### 5. ⭐ Customer Reviews System
- Add a "Leave a Review" button on the home page in the testimonials section
- Customers fill in their name, rating (1–5 stars), and review text
- Submitted reviews go into a "pending" state and are not shown until approved
- Admin gets a new "Reviews" management page to approve, reject, or delete reviews
- Admin can also manually add reviews
- Approved reviews display in the testimonials section on the home page

### 6. ↔️ "How It Works" Horizontal Layout
- Change the 3 steps (Choose Your Class → Book Your Session → Create & Enjoy) from stacking vertically to displaying side by side in a horizontal row
- Each step card takes equal width, reducing white space on the screen
- Cleaner, more compact look that fills the screen width

### 7. 🖼 Service Images
- Add an image above each service in the "Our Services" section on the home page
- Each service (Wheel Throwing, Pot Painting, Free Hand Modeling, Pottery Sales) gets its own image
- Admin can upload custom images for each service from the admin settings
- Services section will look more visual and engaging with images alongside text
- Images stored in the database and manageable from admin panel
