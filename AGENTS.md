# AGENTS.md

Guidance for AI coding agents working in the `digital-art` / `thesis-web-app` project.

---

## 1) Project Snapshot

- **Framework**: Next.js App Router (`/app` root directory)
- **Language**: TypeScript (`strict: true`)
- **UI & Styling**: React 19 + Tailwind CSS v4 + Radix UI / Shadcn
- **Backend & Database**: Supabase (`@supabase/ssr`, `@supabase/supabase-js` with Row Level Security enabled)
- **Cloud/Media Storage**: Cloudinary (configured for secure artwork uploads)
- **Async State Management**: TanStack Query (via custom wrapper `providers/react-query-provider.tsx` with IndexedDB persistence client)
- **Form Handling**: React Hook Form + Zod resolvers
- **Blockchain / Web3**: ethers.js v6 (interacting with the `ArtworkRegistry` contract on Polygon Amoy network)

---

## 2) Local Commands

- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Lint check**: `npm run lint` (runs ESLint checks)
- **Production build check**: `npm run build`
- **Start built app**: `npm run start`

Before finalizing significant changes, always run `npm run lint` and `npm run build` to confirm there are no typescript or build issues.

---

## 3) Repository Map

- `app`: Next.js App Router files (`layout.tsx`, `globals.css`, `not-found.tsx`) and route groups:
  - `(auth)`: Login, registration, password recovery request UI
  - `(main)`: The core application layouts, dashboard, and artwork interfaces
  - `(recovery)`: Flows related to password reset
- `features`: Domain-first feature modules encapsulating functional domains:
  - `(user)`: User specific features (e.g. user authentication forms/actions, dashboard settings, profile details, artwork uploading flows, certificate generator layouts)
  - `classify`: Core backend artwork classification queries and helpers
  - `image-classification`: Dashboard interfaces for evaluating artwork classes
  - `plagiarise-checker`: Web-based plagiarism checking logic
  - `txs`: Transaction queries and blockchain event fetching
  - `verify-artwork`: Artwork certificate and registration validation mechanisms
- `components`: Shared UI primitives and block templates:
  - `ui`: Primitive components (e.g. button, input, dialog, popover)
  - `blocks`: Combined components and reusable layout structures
- `lib`: Shared system configurations and utilities:
  - `supabase`: Client configurations (`client.ts` for browser, `server.ts` for SSR environment, `admin.ts` with service-role bypass credentials)
  - `client-utils.ts`: Shared client-side helpers (e.g., the class merger helper `cn`, `formatDate`, `formatTimeAgo`, and `truncateHash`)
  - `server-utils.ts`: Server-side context helpers
- `providers`: Client-side provider modules:
  - `react-query-provider.tsx`: Configured with cache-persistent store (`idb-keyval`)
- `public`: Static media and asset assets

---

## 4) Architectural Rules

- **Separation of Concerns (SoC)**: Keep route files inside `app/` thin. Route page files should serve as declarative entry points, with visual components and feature-specific operations imported from `features/`.
- **Domain Co-location**: Place all components, query/mutation hooks, validation schemas, server actions, and domain-specific typings inside the corresponding directory under `features/.../` rather than polluting shared spaces.
- **Client vs. Server Components**: Default to Next.js Server Components. Declare `"use client"` only at the top of files requiring interactivity (state, context hooks, window/browser API usage, framer-motion animations, forms).
- **Import Aliasing**: Use direct relative pathing or configured import aliases where appropriate.

---

## 5) Data, Security & Web3 Conventions

- **Supabase Instances**:
  - In client-facing components: Use the browser client from `lib/supabase/client.ts`.
  - In Server Actions, API routes, or React Server Components: Use the server client from `lib/supabase/server.ts`.
  - In trusted admin tasks requiring full database read/write access (bypassing RLS): Use the admin client from `lib/supabase/admin.ts`. Keep this private and restricted to the server environment.
- **Smart Contract Interactions**:
  - Connect to the RPC endpoint using `ethers.JsonRpcProvider` verifying the `AMOY_RPC_URL`.
  - For validation of certificate or ownership registry, verify inputs against the deployed contract address (`ARTWORK_REGISTRY`).
  - Never execute transactions with the system private key (`SYSTEM_PRIVATE_KEY`) directly on the client side. Ensure private keys are strictly accessed on the server (e.g. within Server Actions `upload-artwork/server/record-artwork-blockchain.ts`).
- **Defensive Input Validation**:
  - All form submissions, URL search params, and external API requests must validate against strict **Zod** schemas.
- **Cloudflare Turnstile**:
  - Public authentication pages (Login, Register, Forgotten Password) must include Turnstile verification (`@marsidev/react-turnstile`) to prevent bots and spam actions.

---

## 6) Style and Implementation Expectations

- **Tailwind CSS v4 styling**: Use the class variables defined inside `app/globals.css`. Ensure focus states, dark mode variants, and responsive layout classes conform to standard CSS specs.
- **Dynamic Merging**: Always use the `cn` helper (configured with `clsx` and `tailwind-merge` inside `lib/client-utils.ts`) when merging or conditionally overriding Tailwind classes.
- **Dependency Control**: Do not introduce arbitrary dependencies or libraries unless requested or strictly necessary. Focus on extending features with existing packages.
- **Code Clarity**: Write self-documenting code. Add clear JSDoc comments only for complex functions or non-obvious algorithms.

---

## 7) Environment Variables

The application relies on the following environment configurations (configured inside `.env.local` which must remain gitignored):

- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase API endpoint.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous access key.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Optional publishable key.
- `NEXT_PUBLIC_SITE_URL`: Frontend deployment URL for email redirections.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key.
- `NEXT_PUBLIC_DIGITAL_ART_API_URL` / `DIGITAL_ART_API_URL`: Backend URL for classification and plagiarism tools.
- `AMOY_RPC_URL`: JSON-RPC node URL for the Polygon Amoy testnet.
- `SYSTEM_PRIVATE_KEY`: Server private key for signing automated registry contract executions.
- `NEXT_PUBLIC_ARTWORK_REGISTRY_CONTRACT_ADDRESS` / `ARTWORK_REGISTRY_CONTRACT_ADDRESS` / `ARTWORK_REGISTRY`: The deployed Smart Contract Address.
- `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`: Cloudinary API configuration.
- `POLYGONSCAN_API_KEY`: API key for indexing transaction receipts.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase secret bypass key (keep server-side only).

---

## 8) Agent Workflow

1. **Review Local Context**: Inspect nearby files within the target feature domain. Align with existing patterns.
2. **Implement Safe Changes**: Adopt KISS, DRY, and YAGNI. Keep changes minimal and modular.
3. **Execute Verifications**: Run `npm run lint` and `npm run build` after modifying any code to ensure compile-time and lint safety.
4. **Communicate Explicitly**: Explain the edits clearly upon completion, noting any configuration or security implications.

---

## 9) Git & Repository Rules

- **User-Controlled Git Operations**: Agentic AI must **never** perform any git operations (commits, staging, pushing, branch creation, merges, etc.) on either local or remote repositories. The user has full and exclusive control over all git operations. Agentic AI may only view git history and status for context.

---

## 10) Database Schema & Column Proposals

- **Schema Reference Access**: All agentic AI agents may view `/thesis-web-app/docs/database/supabase-schema.sql` to understand the project's database schema and structure for informed decision-making during development and feature implementation.
- **Proposing New Columns**: When proposing to add a new column to a specific table (e.g., adding a field to the `users`, `registered_arts`, `art_posts`, or other tables), agentic AI must:
  1. **Justify the addition**: Explain why this column is necessary and what problem it solves.
  2. **Define the column specification**: Provide the exact column name, data type (with constraints), and any defaults.
  3. **Request user confirmation**: Present the proposal to the user and **wait for explicit approval** before any schema changes are made.
  4. **Update documentation**: Only after user approval, update the `supabase-schema.sql` file with the new column definition and any necessary indexes or constraints.
  5. **Document the change**: Add a comment in the schema SQL explaining the purpose of the new column.
