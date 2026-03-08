<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/scissors.svg" width="80" alt="StyleForge Logo" />
  
  # 🕶️ STYLEFORGE
  
  *The ultimate cyber-wardrobe network. Analyze your past purchases, generate physical coordinate vectors, and virtually try on user-published styles in a fully immersive 3D mirror.*

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)]()
[![Three.js](https://img.shields.io/badge/Three.js-black?style=flat&logo=three.js&logoColor=white)]()
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)]()
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)]()

</div>

---

## ⚡ Features

- **Neural Style Analyzer**: Upload inspiration photos or past purchases. Our network extracts core aesthetic embeddings to forge highly personalized outfit recommendations.
- **Smart Mirror Try-On**: A fully immersive 3D rendering engine. Input your physical biometric vector data to see exactly how clothing scales and fits your specific dimensions.
- **Social Wardrobe Hub**: Tap into the public feed. Discover, save, and curate style vectors published by other operators across the global network.
- **Biometric Profiles**: Store encrypted height, weight, shoulder width, and waist measurements for pixel-perfect 3D garment scaling.
- **Secure Authentication**: Built-in login and registration utilizing JWT tokens and secure MySQL & MongoDB data persistence.

---

## 💻 Tech Stack & Things Used

StyleForge relies on a robust and modern stack separated into robust micro-environments:

### **Frontend Interface**

- **React.js (Vite)** — Lightning-fast component rendering and hot-module replacement.
- **TailwindCSS** — Rapid utility-first styling for our neon-cyberpunk aesthetic.
- **Lucide-React** — Crisp, clean, minimal SVG icons.
- **Three.js & React Three Fiber** — The core WebGL engine rendering our rigged 3D models.
- **React Three Drei** — Helpful abstractions for Three.js (cameras, environments, GLTF loaders).
- **React Router DOM** — Seamless client-side routing.
- **Framer Motion** — (Optional) Smooth page transitions and micro-animations.

### **Backend Server**

- **Node.js & Express.js** — The foundation of our fast, non-blocking REST API.
- **MySQL2** — Promise-based SQL driver for robust relational data mapping.
- **MongoDB & Mongoose** — NoSQL database for unstructured and flexible AI-generated aesthetic vectors.
- **Bcrypt.js** — State-of-the-art password hashing.
- **JSON Web Tokens (JWT)** — Stateless, secure session authentication.
- **Cors & Dotenv** — Security handlers and environment variable management.

---

## 📁 File Structure

The network is structurally divided into two primary nodes: `FRONTEND` and `BACKEND`.

```text
StyleForge/
├── BACKEND/                    # Server node and database handlers
│   ├── config/                 # Database connection logic & env validators
│   ├── controllers/            # Route business logic (auth, user profiles)
│   ├── data/                   # Initial seed data and json configurations
│   ├── dataset/                # Machine learning datasets and CSV embeddings
│   ├── middleware/             # Express handlers (JWT verification, logging)
│   ├── models/                 # Database schemas (Mongoose & MySQL wrappers)
│   ├── routes/                 # Express API URL endpoint definitions
│   ├── scripts/                # Database migration and utility scripts
│   ├── services/               # Core backend services and 3rd-party integrations
│   ├── tests/                  # Unit tests and automated endpoint runners
│   ├── utils/                  # Helper functions (encryption, formatting)
│   ├── server.js               # Main Express.js server entry point
│   └── .env.example            # Environment configurations (JWT secrets, DB pass)
│
├── FRONTEND/                   # Client interface and 3D mirror environment
│   ├── public/                 # Static assets
│   │   ├── models/             # 3D GLTF/GLB models (Realistic avatar, clothing primitives)
│   │   └── fonts/              # Custom cyberpunk and neon typography
│   └── src/
│       ├── assets/             # Images, SVGs, and brand material
│       ├── components/         # Reusable UI React blocks
│       │   ├── 3d/             # Three.js environments (Scene.jsx, RealisticAvatar.jsx, Clothing.jsx)
│       │   ├── layout/         # Grid wrappers (Navbar, Sidebar, Footer)
│       │   └── ui/             # Atomic components (GlassCard, ChromeButton, NeonInputs)
│       ├── context/            # React Contexts (Global Auth State, Outfits State)
│       ├── pages/              # Primary views (Login, Signup, VirtualTryOn, Profile, Dashboard)
│       ├── services/           # Axios network calls (Product API, Auth Interface)
│       ├── styles/             # Global CSS variables and utility classes
│       ├── App.jsx             # React Router Hub and App Shell
│       ├── index.css           # Global neon typography and Tailwind setup injections
│       └── main.jsx            # React 18 createRoot React DOM mount
│
└── README.md
```

---

## ⚙️ Initialization Sequence (Installation)

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- A running MySQL Database Server
- A running MongoDB Cluster (Local or remote via MongoDB Atlas)

### 1. Database Setup

1. **MySQL**: Launch your MySQL client (e.g., XAMPP, phpMyAdmin, or MySQL CLI) and create a database named `fashion_ai`:
   ```sql
   CREATE DATABASE fashion_ai;
   ```
2. **MongoDB**: Secure your MongoDB connection URI (e.g., `mongodb://localhost:27017/fashion_ai` or your Atlas cluster URI).

### 2. Booting the Backend

Navigate to the server directory and configure your environment:

```bash
cd BACKEND
cp .env.example .env
npm install
```

Inside `.env`, ensure the credentials match your local MySQL and MongoDB configurations:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fashion_ai
MONGO_URI=mongodb://localhost:27017/fashion_ai
JWT_SECRET=super_secret_cyber_key
```

Ignite the server:

```bash
npm run dev
```

### 3. Booting the Frontend

Open a new terminal node and initialize the client:

```bash
cd FRONTEND
npm install
```

Start the React interface:

```bash
npm run dev
```

**Access the grid at**: [http://localhost:5173](http://localhost:5173)

---

## 👥 The Operators (Contributors)

The core team responsible for forging this architecture:

- **[Rishab](https://github.com/rishab11250)**
  _Leader, 2D UI Elements, AI Integration_
- **[Vineet](https://github.com/vineet1cg)**
  _3D UI Elements, 3D Model Engineering_
- **[Sahil](https://github.com/sahilchaudhari32)**
  _Data Handler, Database Manager_
- **[Ankit](https://github.com/ankitkumar764)**
  _Backend Handler, Test Runner_
- extra credit [Vedant](https://github.com/vedantdubal-141)\*\* Extra credit to @Vedant P. Dubal for helping us debug a stubborn GitHub connectivity issue during the hackathon. After tracing proxy and DNS problems, he suggested switching our Git remote to SSH — which fixed everything instantly.

---

<div align="center">
  <p><i>"Forge your digital aesthetic."</i></p>
</div>
