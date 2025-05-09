
# 10x Cards

**Learn 10x faster with intelligent flashcards.** 10x Cards is a web application designed to help users create, manage, and study flashcards effectively. It leverages AI for automated flashcard generation and provides a seamless learning experience.

## Table of Contents

*   [Project Description](#project-description)
*   [Tech Stack](#tech-stack)
*   [Key Features](#key-features)
*   [Getting Started Locally](#getting-started-locally)
    *   [Prerequisites](#prerequisites)
    *   [Environment Variables](#environment-variables)
    *   [Supabase Setup](#supabase-setup)
    *   [Installation & Running](#installation--running)
*   [Available Scripts](#available-scripts)
*   [Project Structure](#project-structure)
*   [API Documentation](#api-documentation)
*   [Database](#database)
*   [CI/CD](#cicd)
*   [Project Status](#project-status)
*   [Contributing](#contributing)
*   [License](#license)

## Project Description

10x Cards is a modern flashcard application built with Astro, React, and Supabase. It aims to enhance the learning process by:

*   Allowing users to create flashcards manually or generate them automatically from text using AI (powered by OpenRouter).
*   Providing a dedicated preview section to manage and review flashcards, including AI-generated candidates.
*   Offering an interactive learning module to study accepted flashcards.
*   Utilizing Supabase for authentication, database storage, and real-time capabilities.

The project is structured as a monorepo-like setup with a clear separation of frontend components, backend services, API routes, and database configurations.

## Tech Stack

*   **Frontend:**
    *   Framework: [Astro](https://astro.build/) (for content-driven pages and API endpoints)
    *   UI Library: [React](https://reactjs.org/) (for interactive components/islands)
    *   Language: [TypeScript](https://www.typescriptlang.org/)
    *   Styling: [Tailwind CSS](https://tailwindcss.com/)
    *   UI Components: [Radix UI](https://www.radix-ui.com/) (headless components) + Custom Styles
    *   Icons: [Lucide React](https://lucide.dev/)
    *   Notifications: [Sonner](https://sonner.emilkowal.ski/) (Toasts)
*   **Backend:**
    *   Runtime: Node.js (via Astro SSR adapters for Cloudflare/Node)
    *   API: Astro API Routes
    *   Authentication: [Supabase Auth](https://supabase.com/auth)
    *   AI Integration: [OpenRouter](https://openrouter.ai/) (for flashcard generation)
*   **Database:**
    *   [Supabase Database](https://supabase.com/database) (PostgreSQL)
    *   `pg_cron` for scheduled tasks
*   **Testing:**
    *   [Vitest](https://vitest.dev/) (Unit & Integration Tests)
    *   [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
*   **Development Tools:**
    *   Linting: [ESLint](https://eslint.org/)
    *   Formatting: [Prettier](https://prettier.io/)
    *   Git Hooks: [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/okonet/lint-staged)
*   **Deployment & CI/CD:**
    *   Hosting: [Cloudflare Pages](https://pages.cloudflare.com/)
    *   CI/CD: [GitHub Actions](https://github.com/features/actions)

## Key Features

*   **User Authentication:** Secure registration, login, and password reset functionality using Supabase Auth.
*   **Flashcard Creator:**
    *   **AI-Powered Generation:** Automatically generate flashcards from provided text using OpenRouter.
    *   **Manual Creation:** Intuitive interface for manually creating custom flashcards.
*   **Flashcard Preview & Management:**
    *   View all accepted flashcards and AI-generated candidates separately.
    *   Edit, delete, accept (for candidates), or discard (for candidates) flashcards.
    *   Export accepted flashcards to JSON or CSV formats.
    *   Pagination for efficient browsing.
*   **Learning Module:**
    *   Interactive learning sessions with your accepted flashcards.
    *   Progress tracking and statistics for study sessions.
*   **RESTful API:**
    *   Well-defined API endpoints for flashcard operations.
    *   Documented using OpenAPI (Swagger) specification.
*   **Automated Candidate Pruning:**
    *   AI-generated flashcard candidates that are not accepted are automatically pruned daily by a `pg_cron` job.
*   **Responsive Design:** User-friendly interface accessible on various devices.

## Getting Started Locally

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended - check `.nvmrc` if available in the project root, otherwise use a recent LTS like v20).
*   [npm](https://www.npmjs.com/) (comes with Node.js).
*   [Supabase CLI](https://supabase.com/docs/guides/cli).

### Environment Variables

Create a `.env` file in the project root by copying `.env.example` (if it exists) or by creating it manually. Add the following variables:

```env
# Supabase Project URL (from your Supabase dashboard or local setup)
SUPABASE_URL="your_supabase_url"
# Supabase Anon Key (from your Supabase dashboard or local setup)
SUPABASE_KEY="your_supabase_anon_key"

# OpenRouter API Key (for AI flashcard generation)
OPENROUTER_API_KEY="your_openrouter_api_key"

# (Optional) Public OpenRouter Model - defaults in code if not set
# PUBLIC_OPENROUTER_MODEL="meta-llama/llama-4-maverick:free"
```

### Supabase Setup

1.  Navigate to the `supabase` directory:
    ```bash
    cd supabase
    ```
2.  If this is the first time setting up Supabase for this project locally and the `.supabase` directory doesn't exist or is minimal, you might need to link it to your remote project if you have one, or initialize it if it's purely local. However, given the existing `config.toml`, it's likely set up.
3.  Start Supabase services:
    ```bash
    supabase start
    ```
    This will output local Supabase URLs and keys. Use these for your `.env` file if you're running entirely locally.
4.  Apply database migrations and seed data:
    ```bash
    supabase db reset
    ```
    This command drops the local database, re-runs all migrations from `supabase/migrations`, and executes the `supabase/seed.sql` file.

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/10x-cards-astro.git
    cd 10x-cards-astro
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    (or `npm ci` for a cleaner install based on `package-lock.json`)

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:4321` (or the port specified by Astro).
    Supabase Studio will be accessible at `http://localhost:54323` (or as specified in your `supabase/config.toml`).

## Available Scripts

*   `npm run dev`: Starts the Astro development server.
*   `npm run build`: Builds the application for production.
*   `npm run preview`: Serves the production build locally for preview.
*   `npm run astro -- <command>`: Runs Astro CLI commands.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run lint:fix`: Automatically fixes linting issues.
*   `npm run format`: Formats the codebase using Prettier.
*   `npm run test`: Runs unit tests using Vitest.
*   `npm run test:watch`: Runs unit tests in watch mode.
*   `npm run test:coverage`: Runs unit tests and generates a coverage report.

## Project Structure

The project follows a standard Astro project structure with some key directories:

```
.
├── .github/            # GitHub Actions workflows (CI/CD)
├── public/             # Static assets
├── supabase/           # Supabase local development config, migrations, seed
│   ├── migrations/
│   └── config.toml
├── src/
│   ├── components/     # Reusable Astro and React components
│   │   ├── astro/      # Astro-specific components
│   │   ├── react/      # React components (for islands)
│   │   └── ui/         # Shared UI components (Radix-based)
│   ├── db/             # Supabase client setup and database types
│   ├── env.d.ts        # TypeScript environment type definitions
│   ├── layouts/        # Astro layout components (see src/layouts/README.md)
│   ├── lib/            # Core logic, utilities, custom hooks, services
│   │   ├── hooks/
│   │   └── services/   # Business logic (auth, flashcards, openrouter AI)
│   ├── middleware/     # Astro middleware (e.g., for authentication)
│   ├── openapi/        # OpenAPI specification for the API
│   │   └── flashcards.yaml
│   ├── pages/          # Astro pages and API endpoints
│   │   ├── api/        # API routes
│   │   └── auth/       # Authentication pages
│   ├── styles/         # Global CSS and Tailwind setup
│   └── types.ts        # Global TypeScript type definitions
├── package.json
└── astro.config.mjs
```


## API Documentation

The backend API for flashcard management is documented using the OpenAPI 3.0 specification.
The API specification can be found at `src/openapi/flashcards.yaml`.

Key API functionalities include:
*   Listing accepted and candidate flashcards with pagination and sorting.
*   Creating manual flashcards.
*   Generating flashcards from text using AI.
*   Getting, updating, and deleting specific flashcards by ID.
*   Accepting AI-generated candidate flashcards.

All API endpoints under `/api/flashcards/*` (and other protected routes) require user authentication.

## Database

The application uses a PostgreSQL database managed by Supabase.
*   **Schema Migrations:** Database schema changes are managed through migration files located in `supabase/migrations/`. These are applied automatically when running `supabase db reset` or during deployment to a Supabase-hosted environment.
*   **Key Tables:**
    *   `flashcards`: Stores individual flashcard data, including content, source (manual, AI, AI-edited), and candidate status.
    *   `statistics`: Tracks user-specific statistics like the number of generated and accepted flashcards.
*   **Row Level Security (RLS):** Implemented to ensure users can only access and modify their own data.
*   **Scheduled Tasks:** A `pg_cron` job is configured to run daily at 3:00 AM UTC to prune old, unaccepted candidate flashcards (older than 3 hours). This helps keep the database clean.
*   **Seeding:** Initial data can be seeded using the `supabase/seed.sql` file (run during `supabase db reset`).

## CI/CD

Continuous Integration and Continuous Deployment are managed via GitHub Actions:

*   **Pull Request Checks (`pull-request.yml`):**
    *   Runs on every opened, synchronized, or reopened pull request targeting the `master` branch.
    *   Performs code linting and unit testing (with coverage).
    *   Posts a status comment on the PR summarizing the check results.
*   **Master Branch Workflow (`master-test-and-build.yml`):**
    *   Runs on every push to the `master` branch.
    *   Performs linting, unit testing with coverage (uploads coverage report as an artifact), and a production build.
*   **Deployment (`deploy.yml`):**
    *   A manually triggered workflow for deploying the application to Cloudflare Pages.
    *   Includes linting, testing, building, and then deploying using Cloudflare Wrangler.
    *   Requires `SUPABASE_URL`, `SUPABASE_KEY`, `CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_ACCOUNT_ID` secrets to be configured in GitHub repository settings.

Node.js version for workflows is typically managed by an `.nvmrc` file in the project root.

## Project Status

*   **Version:** `0.0.1`
*   The project is currently **under active development**.
*   Core features such as user authentication, AI and manual flashcard creation, flashcard management, and the learning module are implemented.
*   CI/CD pipelines are set up for quality assurance and deployment.

## License

This project is licensed under the [MIT License](LICENSE.md).
