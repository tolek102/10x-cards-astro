# 10x Cards

## Table of Contents

1.  [Project Description](#project-description)
2.  [Tech Stack](#tech-stack)
3.  [Key Features](#key-features)
4.  [Getting Started Locally](#getting-started-locally)
5.  [Available Scripts](#available-scripts)
6.  [Project Scope](#project-scope)
7.  [API Documentation](#api-documentation)
8.  [Project Status](#project-status)
9.  [Project Structure](#project-structure)
10. [License](#license)

## Project Description

**10x Cards** is an intelligent flashcard application designed to accelerate learning. It leverages AI (via OpenRouter) to automatically generate flashcards from text input, alongside manual creation options. Users can manage their flashcards, review AI-generated candidates, and engage in learning sessions to master the material. The application features user authentication and provides a clean, responsive interface for a seamless learning experience.

## Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **UI Library:** [React](https://reactjs.org/) (integrated within Astro)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** Custom components (likely inspired by shadcn/ui, located in `src/components/ui/`)
- **State Management (Client):** React Context API (`AuthProvider`), Custom React Hooks (`useFlashcards`, `useCurrentUser`, `useFlashcardsLearning`)
- **Backend:** Astro API Routes
- **Database:** [Supabase](https://supabase.io/) (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI Integration:** [OpenRouter](https://openrouter.ai/)
- **API Documentation:** OpenAPI v3 (`src/openapi/flashcards.yaml`)
- **Validation:** [Zod](https://zod.dev/) (in API routes)
- **Testing:** [Vitest](https://vitest.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/) (via `ToastProvider`)
- **Language:** TypeScript

## Key Features

- **AI Flashcard Generation:** Automatically create flashcards from text (1000-10000 characters) using OpenRouter AI.
- **Manual Flashcard Creation:** Create flashcards directly through the UI.
- **Flashcard Management (Preview):**
  - View separate lists for accepted flashcards and AI-generated candidates.
  - Edit flashcard content (front/back).
  - Delete flashcards.
  - Accept AI-generated candidates into the main learning deck.
  - Discard unwanted candidates.
  - Automatic removal of unaccepted AI-generated candidates at 3:00 AM the next day.
  - Pagination and configurable page size for lists.
  - Export accepted flashcards to JSON or CSV.
- **Learning Module:**
  - Study accepted flashcards with a front/back flipping interface.
  - Track progress within a learning session.
  - Keyboard navigation (arrow keys, spacebar).
- **User Authentication:** Secure registration, login, logout, and password reset functionality via Supabase Auth.
- **Responsive UI:** User-friendly interface adapting to different screen sizes.
- **Toast Notifications:** Provide feedback to users for various actions.

## Getting Started Locally

### Prerequisites

- Node.js (Check Astro's documentation for recommended versions)
- npm, yarn, or pnpm
- A Supabase account and project ([supabase.com](https://supabase.com/))
- An OpenRouter API Key ([openrouter.ai](https://openrouter.ai/))

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/10x-cards.git
    cd 10x-cards
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add the following variables:

    ```dotenv
    # Supabase credentials (find in your Supabase project settings > API)
    SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY

    # OpenRouter API Key (find in your OpenRouter account settings)
    OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY

    # Optional OpenRouter configuration (defaults are provided in the code)
    # PUBLIC_OPENROUTER_MODEL=google/gemini-flash-1.5 # Example model
    # PUBLIC_OPENROUTER_MAX_RETRIES=3
    # PUBLIC_OPENROUTER_TIMEOUT=30000
    # PUBLIC_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
    ```

    _Replace placeholders with your actual credentials._

4.  **Database Schema:**
    The required database schema (tables: `flashcards`, `statistics`) should be set up in your Supabase project. The types are defined in `src/db/database.types.ts`. You can usually apply the schema via the Supabase dashboard SQL editor or using Supabase migrations if configured.

5.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

6.  **Open the application:**
    Navigate to `http://localhost:4321` (or the port specified in your terminal) in your browser.

## Available Scripts

- `dev`: Starts the development server with hot reloading.
- `build`: Builds the application for production.
- `preview`: Serves the production build locally for previewing.
- `test`: Runs the test suite using Vitest.

_(Execute scripts using `npm run <script>`, `yarn <script>`, or `pnpm <script>`)_

## Project Scope

The application provides a complete workflow for flashcard-based learning, centered around AI assistance:

1.  **User Management:** Standard authentication flows.
2.  **Creation:** Users can input text for AI generation or manually add cards.
3.  **Review/Management:** AI-generated cards appear as "candidates" for users to accept, edit, or discard. Accepted cards can also be edited or deleted.
4.  **Learning:** Accepted cards are used in a dedicated learning interface.
5.  **Export:** Users can export their verified flashcards.

## API Documentation

The backend API for flashcard operations is documented using the OpenAPI 3.0 standard.

- **Specification File:** `src/openapi/flashcards.yaml`
- **Base Path:** `/api`

The specification details all available endpoints under `/api/flashcards`, including:

- `GET /flashcards`: List accepted flashcards.
- `POST /flashcards`: Create a manual flashcard.
- `GET /flashcards/candidates`: List candidate flashcards.
- `POST /flashcards/generate`: Generate flashcards via AI.
- `GET /flashcards/{id}`: Get a specific flashcard.
- `PATCH /flashcards/{id}`: Update a flashcard.
- `DELETE /flashcards/{id}`: Delete a flashcard.
- `PATCH /flashcards/{id}/accept`: Accept a candidate flashcard.

_(Note: Authentication endpoints under `/api/auth` are implemented but not included in this specific OpenAPI file.)_

## Project Status

**Actively Developed**

The project includes core functionalities for flashcard creation, management, and learning, along with user authentication and AI integration. Tests are included for backend services and API routes, indicating ongoing development and maintenance.

## Project Structure
```
└── src/
├── env.d.ts # TypeScript definitions for environment variables
├── types.ts # Core application DTOs and types
├── components/ # UI components (Astro & React)
│ ├── astro/ # Astro-specific components (e.g., Welcome screen)
│ ├── modals/ # Reusable modal components
│ ├── providers/ # React Context providers (Auth, Toast)
│ ├── react/ # React components grouped by feature (creator, learning, preview)
│ └── ui/ # Base UI elements (Button, Dialog, Input, etc.)
├── db/ # Database related files
│ ├── database.types.ts # Auto-generated Supabase schema types
│ └── supabase.client.ts # Supabase client setup with SSR support and type safety
├── layouts/ # Astro layout components
│ ├── README.md # Internal layout documentation
│ └── BaseLayout.astro # Main page layout
├── lib/ # Core logic, utilities, services, hooks
│ ├── hooks/ # Custom React hooks for data fetching and state management
│ ├── services/ # Business logic services (client & server-side)
│ │ ├── **tests**/ # Unit/Integration tests for services
│ │ └── openrouter/ # AI generation service integration
│ ├── toast.ts # Toast notification utility
│ └── utils.ts # General utility functions (e.g., `cn` for classnames)
├── middleware/ # Astro middleware (e.g., authentication checks)
│ └── index.ts
├── openapi/ # API specifications
│ └── flashcards.yaml # OpenAPI spec for flashcards API
├── pages/ # Application pages and API routes
│ ├── api/ # Backend API endpoints (auth, flashcards)
│ │ └── **tests**/ # API route tests
│ ├── auth/ # Authentication pages (Login, Register, Reset Password)
│ └── \*.astro # Main application pages (index, creator, preview, learning)
└── styles/ # Global styles
└── global.css # Tailwind CSS setup and global styling rules
```
## License

This project is licensed under the MIT License.
