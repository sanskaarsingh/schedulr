🗓️ Schedulr – A Simple Calendar Booking App

Schedulr is a full-stack, serverless calendar booking web app that enables private calendar management and public booking through a unique shareable link.
It’s built entirely with free-tier services — React (Vite) + Firebase (Auth & Firestore) — making it cost-free, lightweight, and production-ready.

🌐 Live Demo

(Replace this with your deployed URL once live)
https://shedulr-ec642.web.app/

🚀 Overview

Schedulr lets owners securely manage a private calendar and share a public URL so visitors can book available time slots.
It automatically handles availability, prevents double-bookings using Firestore transactions, and provides a clean, responsive UI for both users and visitors.

✨ Key Features
🔐 For Calendar Owners

Secure Authentication – Email/password sign-up & login via Firebase Auth.

Private Dashboard – Manage your entire schedule from one central dashboard.

Calendar Management – View your monthly calendar with existing events and requests.

Manual Event Management (CRUD):

Add custom events with title, description, and time.

View full event details by clicking an event.

Edit events via a modal form.

Delete events instantly.

Booking Request Management:

View all pending booking requests from visitors.

Confirm a request → Automatically creates a calendar event.

Reject a request → Removes it from the pending list.

Shareable Link:

Each calendar has a unique, private shareable link (/c/:share_token).

Copy the link directly from the dashboard.

Regenerate it anytime to revoke old access.

Availability Calculation:
The app automatically determines available slots based on working hours and existing confirmed events.

Transactional Booking Confirmations:
Bookings are confirmed through Firestore transactions to prevent double-bookings and maintain data integrity.

Secure by Design:
Custom Firestore Security Rules ensure users can only modify their own data.

👥 For Visitors

Public Calendar View:
See the owner’s calendar with confirmed “Busy” slots hidden from editing.

Flexible Booking Form:
Request any time slot (not limited to pre-defined blocks).
Fill in name, email, and booking details.

Real-Time Validation:
Immediate feedback for invalid times or unavailable slots.

Smooth Booking Workflow:
Requests go directly to the owner’s dashboard for confirmation.

💡 General Features

Dark Mode: Elegant black & orange theme toggle.

Responsive Design: Fully functional on both desktop and mobile.

Smooth Animations: Framer Motion–based transitions for modals and UI actions.

E2E Testing: Complete Cypress suite for booking workflows.

🧱 Tech Stack
Layer	Technologies
Frontend	React (Vite), React Router, Tailwind CSS
Date & Time	date-fns and date-fns-tz (for timezone-safe operations)
Backend	Firebase Authentication, Firestore Database
Hosting	GitHub Pages (Frontend), Firebase (Backend)
Testing	Cypress (E2E)
⚙️ Step-by-Step Deployment Guide
Step 1 – Set Up Firebase Project

Go to the Firebase Console
 → Add Project → name it (e.g., my-schedulr-app).

Inside the project, click “Web” (</>) → Register app → Copy the firebaseConfig object.

Enable Authentication:

Navigate: Build → Authentication → Get Started

Enable Email/Password provider.

Enable Firestore Database:

Go to Build → Firestore Database → Create Database.

Choose Production Mode, pick a location near you.

Step 2 – Configure Firestore Security Rules

Go to the Rules tab in Firestore.

Delete placeholder rules.

Copy and paste from your project’s firestore.rules file.

Click Publish.

Step 3 – Local Setup
# Clone repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Install dependencies
npm install

Create Environment File

Create .env in the project root and paste:

VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"


🔸 All variable names must start with VITE_ for Vite to expose them to the app.

Step 4 – Run Locally for Testing
npm run dev


Visit: http://localhost:5173

Create your first Owner account via “Login / Sign Up”

The app will auto-generate your user and calendar documents in Firestore.

Run Cypress E2E Tests
npm run cypress:open


Select and execute the booking.spec.js suite.

Step 5 – Deploy Frontend to GitHub Pages

Create a new GitHub repository and push your local code.

Run:

npm run deploy


This builds and pushes dist/ to a new gh-pages branch.

In GitHub → Settings → Pages, set:

Source: gh-pages branch

Your site will go live in a few minutes 🎉

Vite automatically handles routing (base: '/'), but you can add a "homepage" field to package.json if needed.

🔧 Technical Breakdown
Firestore Transaction (Prevent Double-Booking)
await runTransaction(db, async (transaction) => {
  const eventsRef = collection(db, `calendars/${calendar.id}/events`);
  const reqRef = doc(db, `calendars/${calendar.id}/booking_requests`, request.id);

  const conflictQuery = query(
    eventsRef,
    where('startUTC', '<', request.requestedEndUTC),
    where('endUTC', '>', request.requestedStartUTC)
  );

  const conflictingEvents = await transaction.get(conflictQuery);

  if (!conflictingEvents.empty) {
    throw new Error("This time slot is no longer available.");
  }

  transaction.set(doc(eventsRef), newEvent);
  transaction.update(reqRef, { status: 'confirmed' });
});


This ensures atomic reads/writes and prevents two users from booking the same slot concurrently.

📘 User Manual
👤 For Calendar Owners

Sign Up / Log In:

Go to your site, click “Login / Sign Up”.

Create an account → auto-generates your private calendar.

Add Manual Events:

Use the “Add Event” form.

Enter title, description, date, and time → click “Add”.

View / Edit / Delete Events:

Click an event to open its details.

Use ✏️ to edit, 🗑️ to delete.

Manage Booking Requests:

Incoming requests appear under “Pending Requests”.

Click Confirm → adds it to calendar.

Click Reject → deletes the request.

Share Your Calendar:

Copy your unique public link from “Calendar Settings”.

Share it with anyone.

Click “Regenerate” to reset the link anytime.

🧑‍💻 For Visitors

Accessing the Calendar:

Open the share link from the owner.

View their availability (Busy slots hidden).

Requesting a Slot:

Fill out your name, email, and requested time.

Click “Send Request”.

The owner will see your request and confirm or reject it.

✅ Additional Notes

Free Hosting: Works fully under Firebase Spark plan + GitHub Pages.

Responsive: Works seamlessly across all screen sizes.

Secure: Auth + Firestore rules prevent unauthorized writes.

Customizable: Easily tweak styles and features via Tailwind and Firestore schema.

🧑‍💻 Contributing

Pull requests are welcome!
If you find bugs, open an issue or submit a fix with a descriptive commit message.

🪪 License

This project is licensed under the MIT License – you’re free to modify and distribute it.