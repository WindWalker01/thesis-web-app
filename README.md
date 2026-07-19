# Digital Art IP Protection Platform

A comprehensive **blockchain-powered digital rights management (DRM)** platform that empowers digital artists, photographers, and creators to register, protect, verify, and manage their intellectual property with cryptographic proof-of-ownership anchored to the **Polygon Amoy blockchain**.

Built with **Next.js 16**, **React 19**, **Supabase**, and **ethers.js**, the platform bridges the gap between creative expression and legal protection — no crypto wallet or blockchain knowledge required.

---

## Features

### 🖼️ Artwork Registration & Proof of Ownership
- Upload artwork in standard formats (PNG, JPG, TIFF, SVG, AI, PSD)
- Generates unique **cryptographic fingerprints** (SHA-256 file hash + perceptual hash vectors) for each asset
- Records immutable ownership data on the **Polygon Amoy blockchain** via the `ArtworkRegistry` smart contract
- Automatically generates **court-admissible PDF certificates** with QR code verification
- Cloudinary-powered media storage with secure URL generation
- **Under 60 seconds** to generate proof of existence

### 🤖 AI-Powered Artwork Classification
- Automatic genre and style classification using machine learning models
- Real-time genre scoring with confidence metrics
- Helps organize and categorize digital art collections
- Provides descriptive labels for uploaded artwork

### 🔍 Plagiarism & Similarity Detection
- **Perceptual hashing** (pHash, dHash, wHash) to detect visually similar works
- **Two comparison modes:**
  - **Web Mode** — Search for matches across the internet and the platform's database
  - **Compare Mode** — Direct side-by-side similarity analysis of two images
- Calculates transform similarity and block similarity scores
- Displays similarity percentages with visual indicators (rings, bars)
- Other matches discovery with source attribution

### ✅ On-Chain Verification
- Verify artwork authenticity against **immutable blockchain records**
- Cross-references six verification dimensions:
  - Work ID, File hash, Perceptual hash, Author ID hash, Evidence hash, Revocation status
- Provides clear verification status: **Verified**, **Mismatch**, **Not on chain**, **Revoked**, or **Not found**
- Direct links to Polygon Amoy block explorer for transaction transparency
- Supports verification of registered works and certificates

### 📜 Certificate Generation
- Generates **PDF certificates of authenticity** with embedded QR codes
- Certificates include: artwork title, creator information, blockchain tx hash, timestamps, and verification URL
- Certificates are court-admissible as evidentiary documentation

### ⚖️ Copyright Infringement Reporting
- File DMCA/copyright reports with detailed evidence submission
- **Real-time chat** between reporters and admins
- Evidence gallery with image upload support
- Status tracking: pending → under review → resolved / dismissed
- Appeal mechanism for disputed decisions
- Desktop notifications for new messages
- Typing indicators and read receipts

### 🛡️ Artwork Verification Pipeline (Admin)
- Admin moderation workflow for reviewing new artwork registrations
- Manual review of flagged artworks before blockchain finalization
- Activity feed for tracking review decisions
- Blockchain recovery tools for failed transactions
- Per-artwork similarity report inspection

### 📊 Admin Dashboard
- Analytics overview: total registered artworks, verified works, pending reviews, active reports
- **User management**: view, moderate, suspend, or ban accounts
- **Artwork management**: browse all registered works, view blockchain details, manage statuses
- **Report moderation**: manage infringement reports, communicate with reporters, make decisions
- **Platform settings**: configure platform name, description, and other site-wide settings

### 👤 User Features
- **Authentication**: Email/password registration and login with **Cloudflare Turnstile** bot protection
- **Password recovery**: forgot password and reset password flows
- **Profile management**: edit profile details, view personal gallery
- **User dashboard**: overview of personal artworks, certificates, and report statuses
- **Community**: artist profiles, galleries, and social interactions
- **Settings**: account preferences, notifications, and theme customization



---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript (strict mode) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS v4 + Radix UI / Shadcn |
| **Backend / Database** | [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security) |
| **Blockchain** | Polygon Amoy testnet via [ethers.js](https://docs.ethers.org/) v6 |
| **Smart Contract** | `ArtworkRegistry` — records ownership metadata on-chain |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) |
| **Async State** | TanStack Query (with IndexedDB persistence) |
| **Form Validation** | React Hook Form + Zod |
| **Certificate PDF** | jsPDF + QR Code generation (`qrcode`) |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Auth Protection** | Cloudflare Turnstile (`@marsidev/react-turnstile`) |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **Package Manager** | npm |

---

## Architecture

The project follows a **domain-driven feature module** pattern:

```
app/                          # Next.js App Router (thin route files)
├── (auth)/                   #   Authentication routes
├── (main)/                   #   Main application routes
├── (recovery)/               #   Password recovery routes
├── account/                  #   Account status pages
├── api/                      #   API route handlers
└── maintenance/              #   Maintenance mode page

features/                     # Domain-first feature modules
├── (user)/                   #   User-specific features
│   ├── auth/                 #     Login, register, authentication hooks
│   ├── upload-artwork/       #     Artwork upload pipeline
│   ├── dashboard/            #     User dashboard
│   ├── profile/              #     Profile management
│   ├── settings/             #     Account settings
│   ├── community/            #     Community & social features
│   ├── report-infringement/  #     Report filing interface
│   ├── reset-password/       #     Password recovery forms
│   └── notifications-navbar/ #     Notification system
├── admin/                    #   Admin features
│   ├── dashboard/            #     Analytics and statistics
│   ├── artwork-verification/ #     Verification pipeline & reviews
│   ├── artwork-management/   #     Artwork CRUD & blockchain details
│   ├── user-management/      #     User moderation
│   ├── reports/              #     Report management
│   └── settings/             #     Platform settings
├── classify/                 #   ML artwork classification
├── image-classification/     #   Image classification types
├── plagiarise-checker/       #   Plagiarism detection engine
├── certificate-generator/    #   PDF certificate generation
├── certificate-verify/       #   Certificate verification
├── verify-artwork/           #   On-chain artwork verification
├── reports/                  #   Shared report components & hooks
├── report-submit/            #   Report submission logic
├── txs/                      #   Blockchain transaction queries
└── shared/                   #   Shared utilities

components/                   # Shared UI primitives and blocks
├── ui/                       #   Atomic UI components (button, input, etc.)
└── blocks/                   #   Composed layout blocks (navbar, footer, etc.)

lib/                          # Shared configurations
└── supabase/                 #   Client, server, and admin clients
```

### Key Design Decisions

- **Separation of Concerns**: Route files in `app/` are kept thin; visual components and business logic live in `features/`
- **Client vs Server Components**: Default to React Server Components; `"use client"` only where interactivity is required
- **Supabase instances**: Browser client for client components, server client for Server Actions/API routes, admin client with service role for trusted server-side operations
- **Blockchain interactions**: Private keys are strictly server-side (Server Actions), never exposed to the client
- **Input validation**: All form submissions and API inputs validated against strict Zod schemas

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Cloudinary
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=

# Blockchain (Polygon Amoy)
AMOY_RPC_URL=
SYSTEM_PRIVATE_KEY=
NEXT_PUBLIC_ARTWORK_REGISTRY_CONTRACT_ADDRESS=

# Backend API
NEXT_PUBLIC_DIGITAL_ART_API_URL=
DIGITAL_ART_API_URL=

# PolygonScan
POLYGONSCAN_API_KEY=

# Site URL
NEXT_PUBLIC_SITE_URL=
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/WindWalker01/thesis-web-app.git
cd thesis-web-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your environment variables

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest (watch mode) |
| `npm run test:run` | Run Vitest once |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:headed` | Run Playwright with browser UI |
| `npm run test:e2e:ui` | Open Playwright UI mode |

---

## Smart Contract

The platform interacts with the `ArtworkRegistry` smart contract deployed on the **Polygon Amoy testnet**. The contract records:

- **Work ID** — Unique identifier for each registered artwork
- **Author ID Hash** — Cryptographic hash of the creator's identity
- **File Hash** — SHA-256 hash of the uploaded file
- **Perceptual Hash** — Visual fingerprint for similarity detection
- **Evidence Hash** — Hash of supporting evidence documents
- **Revocation Status** — Whether the registration has been revoked

All blockchain transactions are executed server-side using a system private key — users do not need a crypto wallet.

---

## Security

- **Row Level Security (RLS)** enforced on all Supabase tables
- **Cloudflare Turnstile** protects authentication endpoints from bots
- **Server-side blockchain signing** — private keys never leave the server
- **Input validation** via Zod schemas on all user inputs
- **Session management** with Supabase SSR cookies
- **Account suspension/ban** mechanisms for policy enforcement

---

## Testing

The project includes both **unit tests** (Vitest) and **end-to-end tests** (Playwright):

```
tests/
├── admin/               # Admin workflow tests
├── artwork/             # Artwork upload & management tests
├── authentication/      # Auth flow tests
├── fixtures/            # Test fixtures and data
├── gallery/             # Gallery tests
├── helpers/             # Test helper utilities
├── notifications/       # Notification tests
├── page-objects/        # Page Object Model classes
├── reports/             # Report flow tests
├── settings/            # Settings tests
└── verification/        # Verification tests
```

---

## License

This project is developed as a thesis submission. All rights reserved.

---

## Acknowledgments

- **Ruzzel** — Lead Developer
- **Tenshin** — Frontend/Backend Engineer
- **Nathaniel** — UI/UX Designer

Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), and the [Polygon](https://polygon.technology/) blockchain.