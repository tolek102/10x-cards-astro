# 10x-cards

## Project Description

10x-cards is a web application designed to streamline the creation and management of educational flashcards. Leveraging AI, the app can automatically generate flashcard suggestions from pasted text, saving time and enhancing learning through spaced repetition techniques. Users can also manually create, edit, and delete flashcards, and access a learning session powered by a proven repetition algorithm.

## Tech Stack

- **Frontend:**
  - Astro 5
  - React 19
  - TypeScript 5
  - Tailwind CSS 4
  - Shadcn/ui

- **Backend:**
  - Supabase (for database, authentication, and API integration)

- **Runtime:**
  - Node.js (ensure version matches .nvmrc: 22.14.0)

## Getting Started Locally

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd 10x-cards-astro
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Ensure you are using Node version specified in .nvmrc:**
   ```sh
   nvm use
   ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## Available Scripts

In the project directory, you can run:

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the app for production.
- **`npm run preview`**: Starts a local server to preview the production build.
- **`npm run astro`**: Executes Astro CLI commands.
- **`npm run lint`**: Runs ESLint to analyze code quality.
- **`npm run lint:fix`**: Automatically fixes lint errors.
- **`npm run format`**: Formats the code using Prettier.

## Project Scope

The project focuses on the following features:

- **Automatic Flashcard Generation:**
  - Paste text and let the AI generate flashcard suggestions.
  - Review, edit, and accept generated flashcards.

- **Manual Flashcard Management:**
  - Create, edit, and delete flashcards manually.
  - Manage a personal set of flashcards in the "My Flashcards" view.

- **Learning Sessions:**
  - Engage in learning sessions using spaced repetition algorithms.
  - Interactive flashcard review to support effective learning.

- **User Authentication:**
  - Registration and login functionality to secure user data.
  - Ensure that only authenticated users can manage and view their flashcards.

## Project Status

This project is currently in the MVP stage, where core functionalities are implemented and iteratively improved based on user feedback.

## License

This project is licensed under the MIT License. 