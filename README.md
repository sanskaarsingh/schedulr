Schedulr - A Simple Calendar Booking App

Schedulr is a full-stack, production-ready calendar booking application. It enables calendar owners to manage a private schedule and share a public link so others can book time slots with them. The app combines a modern React frontend with a Firebase backend, designed to run entirely on free hosting tiers.

Live Demo: (https://shedulr-ec642.web.app/)

---

Features

For Calendar Owners

- Secure Authentication: Sign up and log in with email/password.
- Private Dashboard: Manage your schedule via an intuitive interface.
- Calendar Management: Monthly view of all events.
- Event Management (CRUD):
  - Create manual events with title, description, and time.
  - View full event details.
  - Edit and delete events easily.
- Booking Requests:
  - See all pending booking requests.
  - Confirm to automatically add the event, or reject it.
  - Safe booking confirmation using Firestore transactions to avoid double-booking.
- Shareable Public Link:
  - Unique URL for your calendar (/c/:share_token).
  - Regenerate the link at any time to revoke old access.

For Visitors

- Public Calendar View: See available and "Busy" time slots for the owner.
- Booking Form:
  - Flexible form to request custom times (no forced slot grid).
  - Enter name, email, title, and description.
  - Real-time validation for submitting valid time slots.
- Smooth Booking Workflow: Requests are managed transparently between both parties.

General App Features

- Responsive design: Fully usable on desktop and mobile.
- Dark mode: A modern, toggleable black and orange theme.
- Smooth animations: Subtle transitions for pop-ups and interactive elements.
- Security: Strict Firestore rules ensure owners can only access their own data and all user actions are validated on the server.
- Prevents Double-Booking: Booking confirmations are performed in Firestore transactions to guarantee atomicity and data integrity.

---

Tech Stack

Frontend: React (Vite), React Router, Tailwind CSS  
Date & Time: date-fns, date-fns-tz  
Backend & Database: Firebase (Auth, Firestore)  
Hosting: GitHub Pages (frontend), Firebase (backend)  
Testing: Cypress (end-to-end)  
Deployment: GitHub Pages (default), supports Firebase Hosting as well

---

Deployment Guide

Step 1: Firebase Project Setup

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a Web App to receive your firebaseConfig object. Copy the config keys.
3. Enable Authentication: Go to Build > Authentication, enable Email/Password.
4. Enable Firestore Database: Go to Build > Firestore Database, create in Production Mode.

Step 2: Configure Firestore Security Rules

1. In Firestore, switch to the Rules tab.
2. Delete placeholder rules and paste in the firestore.rules contents from this repo.
3. Publish the new rules.

Step 3: Clone and Configure Project Locally

1. Clone the repo:

   git clone https://github.com/sanskaarsingh/schedulr
   cd your-repo-name

2. Install dependencies:

   npm install

3. Create a .env file in the root directory. Populate it:

   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"

   (Values from firebaseConfig. All keys must start with VITE_)

Step 4: Run Locally

1. Start the dev server:

   npm run dev

2. Open http://localhost:5173 to view the app.
3. Register as the first user via "Login / Sign Up" (creates user+calendar docs).
4. (Optional) Run Cypress tests:

   npm run cypress:open

Step 5: Deploy to Production

Default Deploy (GitHub Pages):

1. Create a GitHub repo, push code.
2. (Optional) Add "homepage" field in package.json for correct routing.
3. Deploy:

   npm run deploy

4. In GitHub repo settings, set Pages source to gh-pages branch.

Firebase Hosting (Alternative):

1. Install Firebase CLI if needed:

   npm install -g firebase-tools

2. Log in:

   firebase login

3. Build app:

   npm run build

4. Deploy:

   firebase deploy

---

Usage Guide

For Calendar Owners

- Sign Up: Use "Login / Sign Up" to register; a calendar is created automatically.
- Copy Share Link: In Dashboard > Calendar Settings, copy your unique share URL to send to others.
- Add Events: Use "Add Manual Event" to create appointments with all necessary details.
- Edit/Delete Events: Click events in the calendar for edit or delete options.
- Manage Requests: View pending booking requests; Confirm to add as an event, Reject to delete.

For Visitors

- Open the owner's share link.
- View the owner's available/busy slots.
- Use "Request a Time Slot" form to send a booking request (name, email, time, etc).
- Wait for confirmation from the owner.

---

Technical Notes

Firestore Transaction for Booking Confirmation

To prevent double-bookings, confirmation runs inside a Firestore transaction. The transaction:

- Checks for existing events overlapping the requested slot.
- Aborts if a conflict is found with an error.
- Otherwise, creates the event and marks the request as confirmed, atomically.

Example (src/pages/DashboardPage.jsx):

await runTransaction(db, async (transaction) => {
    const eventsRef = collection(db, `calendars/${calendar.id}/events`);
    const reqRef = doc(db, `calendars/${calendar.id}/booking_requests`, request.id);

    // Find conflicts before writing
    const conflictQuery = query(eventsRef,
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

---

Indexing

The first time a booking is confirmed, Firestore may prompt you to create a composite index for its queries (link shown in browser console). Complete this step if needed.

---

License

MIT - Free to use

---

Contribution

Pull requests and issues are welcome.

---

Contact

For support, open an issue on GitHub or contact sanskaarprivate@gmail.com.

---

