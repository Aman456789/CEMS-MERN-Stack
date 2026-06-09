<div align="center">

# 🎓 College Event Management System

<p align="center">
  <strong>A production-grade, full-stack platform that digitizes and streamlines the entire event lifecycle within a college ecosystem.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Stack-MERN-orange?style=for-the-badge" alt="MERN Stack" />
</p>

</div>

---

## 📖 Overview

**CEMS** is a robust, full-stack web application engineered to solve the critical pain points of fragmented event discovery and manual, error-prone registration processes in college ecosystems. By providing a **single, unified platform** for Students, Organizers, and Administrators, CEMS transforms what was once a disjointed, email-driven workflow into a structured, automated, and scalable digital system — whether the event is a technical hackathon, a cultural fest, or an academic workshop.

At its architectural core, CEMS is built on a **tri-tier Role-Based Access Control (RBAC)** model with stateless JWT authentication, an automated email verification workflow with intelligent ghost account cleanup, and a Cloudinary-powered media pipeline pre-configured for scalable banner uploads. The user interface is built with a **glassmorphism design language**, enriched by physics-driven, spring-based animations via Framer Motion — delivering a product-grade experience that bridges the gap between organizers and students with precision, speed, and elegance.

---

## ✨ Key Features

- 🔐 **Tri-Tier RBAC** — Three fully isolated, secure dashboards: `super_admin`, `organizer`, and `student`, each with role-scoped permissions enforced at the middleware level.
- 📧 **Automated Email Verification Workflow** — On registration, Nodemailer dispatches a unique verification token link. Unverified "ghost accounts" are automatically pruned from the database via TTL-based cleanup, ensuring data hygiene.
- ✅ **Super Admin Organizer Approval Pipeline** — New Organizers are placed in a `pending` state and cannot create events until a Super Admin explicitly reviews and approves their account via a dedicated endpoint.
- 📅 **Full Event Lifecycle Management** — Organizers can create richly detailed events with automated **ISO 8601 date parsing** for timezone-consistent scheduling. Students get a friction-free, one-click registration experience.
- ⚡ **Conflict Detection Engine** — Backend logic that detects scheduling and venue conflicts before an event is committed to the database, preventing double-bookings.
- 🎨 **Glassmorphism UI with Physics-Driven Animations** — Blog-style, detailed event views rendered in spring-based modal popups with fluid page transitions powered by Framer Motion.
- ☁️ **Cloud-Ready Media Pipeline** — Cloudinary SDK fully pre-configured in the backend, ready for seamless activation of event banner and profile picture uploads.
- 🛡️ **Hardened Security Layer** — Password hashing via Bcrypt, RBAC middleware on every protected route, and cryptographically signed JWTs with configurable expiry.

---

## 🛠️ Tech Stack

| Technology | Category | Role in CEMS |
| :--- | :--- | :--- |
| **React.js** | Frontend Library | Drives the entire component-based UI, managing complex application state across three distinct role dashboards. |
| **Vite** | Build Tool | Provides near-instant HMR (Hot Module Replacement) and an optimized production build pipeline. |
| **Tailwind CSS** | Styling Framework | Powers the utility-first, responsive **Glassmorphism** design system across all pages and components. |
| **Framer Motion** | Animation Library | Delivers physics/spring-based modal animations, page transitions, and interactive micro-animations. |
| **Lucide React** | Iconography | Provides crisp, tree-shakeable SVG icons that integrate flawlessly into the React component tree. |
| **Axios** | HTTP Client | Handles all client-to-server API communication with a centralized, pre-configured instance (interceptors included). |
| **React Router DOM** | Client-Side Routing | Manages the SPA routing layer with protected, role-gated routes using custom `PrivateRoute` wrappers. |
| **Node.js** | Runtime Environment | Provides the server-side JavaScript execution context, ensuring full-stack JS consistency. |
| **Express.js** | Backend Framework | Underpins the RESTful API layer with a clean, modular controller-route-middleware architecture. |
| **MongoDB** | Database | Flexible NoSQL document store ideal for hierarchical data structures like events, attendee arrays, and user profiles. |
| **Mongoose** | ODM | Provides schema validation, business logic hooks, and a clean abstraction over raw MongoDB queries. |
| **JSON Web Token** | Authentication | Secures all protected endpoints using stateless, cryptographically signed tokens with role-based claims. |
| **Bcrypt.js** | Security | Handles one-way password hashing with salt rounds to ensure credentials are never stored in plain text. |
| **Nodemailer** | Email Utility | Delivers transactional emails — OTPs, verification links, and account status notifications. |
| **Cloudinary** | Media Storage | Pre-integrated cloud media SDK for scalable, CDN-backed event poster and profile image management. |
| **Multer** | File Handling | Acts as the multipart/form-data parser middleware, processing file uploads before passing them to Cloudinary. |

---

## 📂 Folder Architecture

```text
CEMS/
│
├── backend/                          # ⚙️  Node.js / Express RESTful API
│   ├── config/
│   │   └── db.js                     # Mongoose connection logic
│   │
│   ├── controllers/                  # Business logic (separated from routes)
│   │   ├── adminController.js        # Organizer approval / admin ops
│   │   ├── authController.js         # Register, Login, Verify Email
│   │   ├── eventController.js        # CRUD + Conflict Detection Engine
│   │   ├── notificationController.js # In-app notification ops
│   │   ├── registrationController.js # Student event registration state machine
│   │   └── venueController.js        # Venue management & availability
│   │
│   ├── middleware/                   # Custom Express middleware layer
│   │   ├── authmiddleware.js         # JWT verification & user hydration
│   │   └── rbacmiddleware.js         # Role-based route guarding
│   │
│   ├── models/                       # Mongoose schemas & data contracts
│   │   ├── Event.js
│   │   ├── notification.js
│   │   ├── Registration.js
│   │   ├── User.js
│   │   └── venue.js
│   │
│   ├── routes/                       # Express route definitions
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── venueRoutes.js
│   │
│   ├── scripts/
│   │   └── seedadmin.js              # Seeds the initial Super Admin to the DB
│   │
│   ├── utils/                        # Shared utility modules
│   │   ├── asyncHandler.js           # Async error-wrapper for controllers
│   │   ├── cloudinary.js             # Cloudinary SDK configuration
│   │   └── emailService.js           # Nodemailer transport & email templates
│   │
│   ├── .env                          # Local environment secrets (gitignored)
│   ├── .env.example                  # Committed template for collaborators
│   ├── package.json
│   └── server.js                     # Express app bootstrap & entry point
│
├── frontend/                         # ⚛️  React.js / Vite Client Application
│   ├── public/
│   │   └── cems-icon.svg             # App favicon/icon
│   │
│   ├── src/
│   │   ├── components/               # Reusable, dumb UI components
│   │   │   ├── EventCard.jsx         # Card used in the public event feed
│   │   │   └── Navbar.jsx            # Role-aware, responsive navigation bar
│   │   │
│   │   ├── context/                  # React Context API — global state
│   │   │   ├── AuthContext.jsx       # JWT storage, user state, login/logout logic
│   │   │   └── ThemeContext.jsx      # Light/Dark mode theme management
│   │   │
│   │   ├── pages/                    # Route-level, smart page components
│   │   │   ├── AdminDashboard.jsx    # Super Admin: view & approve organizers
│   │   │   ├── EventFeed.jsx         # Public: browse & search all events
│   │   │   ├── Login.jsx             # Glassmorphism split-screen login page
│   │   │   ├── OrganizerDashboard.jsx# Organizer: create & manage their events
│   │   │   ├── Register.jsx          # Multi-role registration form
│   │   │   ├── StudentDashboard.jsx  # Student: registered events & profile
│   │   │   └── VerifyEmail.jsx       # Token-based email confirmation page
│   │   │
│   │   ├── utils/
│   │   │   └── api.js                # Pre-configured Axios instance (base URL + interceptors)
│   │   │
│   │   ├── App.jsx                   # Root component: Router config & protected routes
│   │   ├── index.css                 # Global Tailwind CSS directives & base styles
│   │   └── main.jsx                  # React DOM render entry point
│   │
│   ├── index.html                    # Vite HTML shell
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js            # Tailwind theme & plugin configuration
│   └── vite.config.js                # Vite build & proxy configuration
│
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `/backend` directory. Use `.env.example` as your template.

> [!IMPORTANT]
> **Never commit your `.env` file.** It is listed in `.gitignore` by default. Use the `.env.example` for sharing the required variable keys with collaborators.

```env
# ── Server ────────────────────────────────────────────
PORT=5000

# ── Database ──────────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/cems_db

# ── Authentication ────────────────────────────────────
JWT_SECRET=your_cryptographically_secure_random_string_here
JWT_EXPIRES_IN=7d

# ── Email Service (Nodemailer) ────────────────────────
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password_here

# ── Client URL (CORS + Email Links) ──────────────────
CLIENT_URL=http://localhost:5173

# ── Cloudinary (Media Storage) ────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

| Variable | Description |
| :--- | :--- |
| `PORT` | Port the Express server will listen on |
| `MONGO_URI` | Full MongoDB Atlas (or local) connection string |
| `JWT_SECRET` | Long, random string used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | Token validity duration (e.g., `7d`, `24h`, `1h`) |
| `EMAIL_USER` | Gmail address used as the Nodemailer sender |
| `EMAIL_PASS` | Google App Password (not your Gmail password) |
| `CLIENT_URL` | Frontend URL — injected into verification email links |
| `CLOUDINARY_CLOUD_NAME` | Found in your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Found in your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Found in your Cloudinary dashboard |

---

## 🚀 Installation & Getting Started

### Prerequisites

Ensure the following are installed on your machine before proceeding:

- **Node.js** `v18.x` or higher — [Download](https://nodejs.org/)
- **npm** `v9.x` or higher (bundled with Node.js)
- **MongoDB** — A running [Atlas](https://www.mongodb.com/cloud/atlas) cluster or a local `mongod` instance
- **Git** — [Download](https://git-scm.com/)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/CEMS.git
cd CEMS
```

---

### Step 2 — Backend Setup

```bash
# Navigate into the backend directory
cd backend

# Install all server-side dependencies
npm install

# Create your local environment file from the example template
cp .env.example .env
# ⚠️ Open .env and fill in ALL required values before proceeding

# Seed the initial Super Admin account into the database
node scripts/seedadmin.js

# Start the development server with hot-reload (nodemon)
npm run dev
```

> ✅ The API server will be live at **`http://localhost:5000`**

---

### Step 3 — Frontend Setup

Open a **new terminal window** (keep the backend running):

```bash
# Navigate into the frontend directory
cd frontend

# Install all client-side dependencies
npm install

# Start the Vite development server
npm run dev
```

> ✅ The React application will be live at **`http://localhost:5173`**

---

### Step 4 — Verify the Full Stack

Open `http://localhost:5173` in your browser. You should see the CEMS landing page. Use the seeded Super Admin credentials from `seedadmin.js` to log in and begin managing the platform.

---

## 📡 API Endpoints

All protected routes require an `Authorization: Bearer <token>` header with a valid JWT.

### 🔑 Auth Routes — `/api/auth`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new Student or Organizer account | Public |
| `POST` | `/api/auth/login` | Authenticate user credentials and return a signed JWT | Public |
| `GET` | `/api/auth/verify-email/:token` | Confirm a user's email address via the token link | Public |
| `GET` | `/api/auth/me` | Fetch the currently authenticated user's profile | Private — Any Role |

### 📅 Event Routes — `/api/events`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Retrieve all active and approved events | Public |
| `POST` | `/api/events` | Create a new event (triggers Conflict Detection Engine) | Private — Organizer |
| `GET` | `/api/events/:id` | Retrieve full details for a single event | Public |
| `PUT` | `/api/events/:id` | Update an existing event | Private — Organizer (owner) |
| `DELETE` | `/api/events/:id` | Delete an event | Private — Organizer (owner) |

### 🎟️ Registration Routes — `/api/registrations`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/events/:id/register` | Register the authenticated student for an event | Private — Student |
| `GET` | `/api/registrations/my-events` | Fetch all events a student is registered for | Private — Student |

### 🛡️ Admin Routes — `/api/admin`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/pending-organizers` | Fetch all organizer accounts awaiting approval | Private — Super Admin |
| `PUT` | `/api/admin/approve-organizer/:id` | Approve a pending organizer account | Private — Super Admin |
| `PUT` | `/api/admin/reject-organizer/:id` | Reject a pending organizer account | Private — Super Admin |

### 🏛️ Venue Routes — `/api/venues`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/venues` | Retrieve all registered venues | Private — Organizer, Admin |
| `POST` | `/api/venues` | Register a new venue in the system | Private — Super Admin |

---

## 🔮 Future Enhancements

The following features are planned for upcoming development cycles:

- **📸 Event Poster Uploads** — The Cloudinary SDK is **fully pre-configured** in the backend. The next step is to wire the Multer middleware to the event creation endpoint and expose an upload field in the Organizer dashboard UI.
- **🎫 Digital Ticketing with QR Codes** — On successful registration, automatically generate a downloadable PDF ticket embedded with a unique QR code for check-in at the event gate.
- **🔔 Real-Time Notifications** — Integrate **Socket.io** for WebSocket-based, push-style notifications — alerting students of event updates and organizers of their approval status instantly.
- **📊 Admin Analytics Dashboard** — A data visualization layer for the Super Admin to track event participation rates, popular categories, and platform growth metrics.
- **🔍 Advanced Event Filtering** — Full-text search, category filtering, date-range queries, and sorting on the public Event Feed to improve event discoverability.
- **📱 Progressive Web App (PWA)** — Add a Vite PWA plugin manifest to make CEMS installable on mobile devices with offline-capable caching for the event feed.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](https://github.com/your-username/CEMS/issues) before opening a new one.

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-amazing-feature

# 3. Commit your changes with a descriptive message
git commit -m "feat: add QR code generation for event tickets"

# 4. Push to your branch
git push origin feature/your-amazing-feature

# 5. Open a Pull Request against the main branch
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [`LICENSE`](LICENSE) file for details.

---

<div align="center">

**Built with 💙 using the MERN Stack**

*If you found this project helpful, consider giving it a ⭐ on GitHub!*

</div>
