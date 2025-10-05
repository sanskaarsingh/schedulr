# Schedulr - A Simple Calendar Booking App

This repository contains a full-stack, production-ready calendar booking application. It allows users (owners) to manage a private calendar and share a public link for others to book available time slots.

The frontend is built with **React (Vite)** and **Tailwind CSS**, hosted for free on **GitHub Pages**. The backend logic, authentication, and database are handled entirely by **Firebase** (Auth and Firestore), using only the free "Spark" plan.



## Features

-   **Owner Authentication**: Secure sign-up and login for calendar owners via email/password.
-   **Private Calendar Management**: Owners can view their calendar and manually add events for the current month.
-   **Shareable Public Link**: Each calendar has a unique, shareable URL (`/c/:share_token`).
-   **Public Booking**: Visitors can view the owner's availability for the current month and request a booking in an available slot.
-   **Availability Calculation**: The app automatically calculates available slots based on the owner's configured working hours and existing confirmed events.
-   **Booking Request Workflow**: Owners see pending requests on their dashboard and can **Confirm** or **Reject** them.
-   **Transactional Confirmations**: The booking confirmation process is a **Firestore transaction**, preventing double-bookings and ensuring data integrity.
-   **Secure by Design**: Firestore security rules enforce strict permissions, ensuring users can only modify their own data and that all actions are validated on the server.

---

## Tech Stack

-   **Frontend**: React (Vite), React Router, Tailwind CSS
-   **Date/Time**: `date-fns` and `date-fns-tz` for robust date and timezone manipulation.
-   **Backend**: Firebase (Authentication, Firestore)
-   **Hosting**: GitHub Pages (Frontend), Firebase (Backend)
-   **E2E Testing**: Cypress

---

## Step-by-Step Deployment Guide

Follow these instructions to set up and deploy your own instance of this application.

### Step 1: Set Up Firebase Project

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and click "Add project". Give it a name (e.g., `my-schedulr-app`).
2.  **Create a Web App**: Inside your project, click the Web icon (`</>`) to add a new web app. Name it and register it. Firebase will provide you with a `firebaseConfig` object. **Copy these keys.**
3.  **Enable Authentication**: In the Firebase console, go to `Build > Authentication`. Click "Get started" and enable the **Email/Password** sign-in provider.
4.  **Enable Firestore**: Go to `Build > Firestore Database`. Click "Create database", start in **production mode**, and choose a location close to you.

### Step 2: Configure Firestore Security Rules

1.  In the Firestore Database section of the console, click the **Rules** tab.
2.  Delete the existing placeholder rules.
3.  Copy the entire content of the `firestore.rules` file from this repository and paste it into the editor.
4.  Click **Publish**.

### Step 3: Set Up Local Environment

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Create Environment File**: Create a file named `.env` in the root of the project. Copy the contents of `.env.example` into it.
    ```bash
    # .env
    VITE_FIREBASE_API_KEY="your-api-key"
    VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    VITE_FIREBASE_PROJECT_ID="your-project-id"
    VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    VITE_FIREBASE_APP_ID="your-app-id"
    ```
4.  **Add Firebase Config**: Paste the keys you copied from Step 1 into your `.env` file. **Important**: The variable names must start with `VITE_`.

### Step 4: Run Locally for Testing

1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  Open your browser to `http://localhost:5173`.
3.  **Create an Owner Account**: Click "Login / Sign Up", switch to the Sign Up form, and create your first user. This will automatically generate a `user` document and a `calendar` document in Firestore.
4.  **Run Cypress Tests**: To run the end-to-end tests, use the command:
    ```bash
    npm run cypress:open
    ```
    This will open the Cypress test runner, where you can execute the `booking.spec.js` test suite.

### Step 5: Deploy to GitHub Pages

1.  **Create a GitHub Repository**: Create a new repository on GitHub and push your local code to it.
2.  **Update `package.json`**: If your repository name is `my-calendar-app`, you might need to add a `"homepage"` field to `package.json` for routing to work correctly on GitHub pages, though Vite's `base: '/'` config should handle this for project pages.
3.  **Deploy**: Run the deploy script. This command builds the app and pushes the `dist` folder to a `gh-pages` branch on your repository.
    ```bash
    npm run deploy
    ```
4.  **Configure GitHub Pages**: In your GitHub repository settings, go to `Pages`. Set the source to deploy from the `gh-pages` branch. Your site will be live in a few minutes.

---

## Technical Explanations

### Firestore Transaction for Confirming Bookings

The most critical operation is confirming a booking, as it must prevent double-booking. This is achieved using a **Firestore Transaction**.

```javascript
// From src/pages/DashboardPage.jsx
await runTransaction(db, async (transaction) => {
    // 1. Define references to documents needed
    const eventsRef = collection(db, `calendars/${calendar.id}/events`);
    const reqRef = doc(db, `calendars/${calendar.id}/booking_requests`, request.id);

    // 2. Read data within the transaction: Check for conflicting events
    const conflictQuery = query(eventsRef,
        where('startUTC', '<', request.requestedEndUTC),
        where('endUTC', '>', request.requestedStartUTC)
    );
    // Firestore transactions require reads to happen before writes
    const conflictingEvents = await transaction.get(conflictQuery);

    if (!conflictingEvents.empty) {
        // If a conflict is found, abort the transaction by throwing an error
        throw new Error("This time slot is no longer available.");
    }

    // 3. Write data within the transaction: Create event & update request
    // This part only runs if the reads above found no conflicts.
    transaction.set(doc(eventsRef), newEvent);
    transaction.update(reqRef, { status: 'confirmed' });
});