# REST API Plan

## 1. Resources

- **Users**: Maps to the `users` table.
  - Fields: `id`, `email`, `password`, `created_at`
  - Managed through Supabase Auth; operations such as registration and login may be handled via Supabase or custom endpoints if needed.

- **Flashcards**: Maps to the `flashcards` table.
  - Fields: `id`, `user_id`, `front`, `back`, `source`, `created_at`, `updated_at`
  - Validation: `front` ≤ 200 characters, `back` ≤ 500 characters, `source` must be one of `AI`, `AI_EDITED`, or `MANUAL`.
  - Index: An index on `user_id` for query optimization.

- **Statistics**: Maps to the `statistics` table.
  - Fields: `id`, `user_id`, `generated_count`, `accepted_unedited_count`, `accepted_edited_count`
  - Note: Each user has a unique statistics record.

## 2. Endpoints

### A. Authentication & User Management

1. **Register User**
   - **Method:** POST
   - **URL:** `/api/register`
   - **Description:** Creates a new user account.
   - **Request Payload:**
     ```json
     {
       "email": "user@example.com",
       "password": "securePassword"
     }
     ```
   - **Response:**
     - **201 Created:** Returns user details (e.g., id, email, created_at).
     - **Error Codes:** 400 (Bad Request), 409 (Conflict if email already exists).

2. **Login User**
   - **Method:** POST
   - **URL:** `/api/login`
   - **Description:** Authenticates a user and returns an access token.
   - **Request Payload:**
     ```json
     {
       "email": "user@example.com",
       "password": "securePassword"
     }
     ```
   - **Response:**
     - **200 OK:** Returns an authentication token and user details.
     - **Error Codes:** 401 (Unauthorized).

3. **Get Current User**
   - **Method:** GET
   - **URL:** `/api/me`
   - **Description:** Retrieves the profile information of the authenticated user.
   - **Response:**
     - **200 OK:** Returns user details.
     - **Error Codes:** 401 (Unauthorized).

### B. Flashcards Management

1. **List Accepted Flashcards**
   - **Method:** GET
   - **URL:** `/api/flashcards`
   - **Description:** Retrieves a paginated list of accepted flashcards (candidate = false) for the authenticated user.
   - **Query Parameters:**
     - `page` (default: 1)
     - `limit` (default: 20)
     - `sort` (e.g., `created_at_desc` or `created_at_asc`)
   - **Response:**
     - **200 OK:** Returns an array of accepted flashcards and pagination metadata.
     - **Error Codes:** 401 (Unauthorized).

2. **List Candidate Flashcards**
   - **Method:** GET
   - **URL:** `/api/flashcards/candidates`
   - **Description:** Retrieves a paginated list of candidate flashcards (candidate = true) for the authenticated user.
   - **Query Parameters:**
     - `page` (default: 1)
     - `limit` (default: 20)
     - `sort` (e.g., `created_at_desc` or `created_at_asc`)
   - **Response:**
     - **200 OK:** Returns an array of candidate flashcards and pagination metadata.
     - **Error Codes:** 401 (Unauthorized).

2. **Get Flashcard by ID**
   - **Method:** GET
   - **URL:** `/api/flashcards/{id}`
   - **Description:** Retrieves details for a specific flashcard.
   - **Response:**
     - **200 OK:** Returns flashcard details.
     - **Error Codes:** 404 (Not Found), 401 (Unauthorized).

3. **Create Flashcard (Manual)**
   - **Method:** POST
   - **URL:** `/api/flashcards`
   - **Description:** Creates a new manual flashcard.
   - **Request Payload:**
     ```json
     {
       "front": "Short question or prompt (max 200 chars)",
       "back": "Answer text (max 500 chars)",
       "source": "MANUAL",
       "candidate": false
     }
     ```
   - **Response:**
     - **201 Created:** Returns the created flashcard details.
     - **Error Codes:** 400 (Validation Error), 401 (Unauthorized).

4. **Update Flashcard**
   - **Method:** PUT
   - **URL:** `/api/flashcards/{id}`
   - **Description:** Updates an existing flashcard. If a candidate flashcard is edited, it will be automatically marked as accepted (candidate = false). If a flashcard with source "AI" is edited, its source will be automatically changed to "AI_EDITED".
   - **Request Payload:**
     ```json
     {
       "front": "Updated front text (max 200 chars)",
       "back": "Updated back text (max 500 chars)",
       "candidate": false
     }
     ```
   - **Response:**
     - **200 OK:** Returns the updated flashcard details.
     - **Error Codes:** 400 (Validation Error), 404 (Not Found), 401 (Unauthorized).

5. **Delete Flashcard**
   - **Method:** DELETE
   - **URL:** `/api/flashcards/{id}`
   - **Description:** Deletes a specified flashcard.
   - **Response:**
     - **204 No Content:** Indicates successful deletion.
     - **Error Codes:** 404 (Not Found), 401 (Unauthorized).

6. **Auto-Generate Flashcards via AI**
   - **Method:** POST
   - **URL:** `/api/flashcards/generate`
   - **Description:** Accepts a long text input and processes it through an AI service to generate flashcards candidate.
   - **Request Payload:**
     ```json
     {
       "text": "Long text input (between 1000 to 10000 characters)"
     }
     ```
   - **Response:**
     - **200 OK:** Returns a list of generated flashcards candidates (each with `source` set to "AI" and `candidate` set to 'true').
     - **Error Codes:** 400 (Input Validation Error), 401 (Unauthorized), 500 (Internal Server Error if AI service fails).

### C. Statistics

1. **Get User Statistics**
   - **Method:** GET
   - **URL:** `/api/statistics`
   - **Description:** Retrieves flashcard generation and interaction statistics for the authenticated user.
   - **Response:**
     - **200 OK:** Returns statistics data such as `generated_count`, `accepted_unedited_count`, and `accepted_edited_count`.
     - **Error Codes:** 401 (Unauthorized).

## 4. Validation and Business Logic

- **Data Validation:**
  - Flashcard `front` must not exceed 200 characters; `back` must not exceed 500 characters.
  - AI-generated text must be between 1000 and 10000 characters.
  - The `source` field is restricted to `AI`, `AI_EDITED`, or `MANUAL`.

- **Business Logic Mapping:**
  - **Manual Flashcard Creation & Updating:** Enforces character limits and returns appropriate error messages if violated.
  - **Automatic Flashcard Generation:** Processes long text via an AI API. Generated flashcards candidates are generated with the `source` set to "AI" and `candidate` set to 'true' and also must adhere to length restrictions.
  - **Pagination, Filtering, and Sorting:** Implemented in list endpoints to efficiently handle large datasets.

- **Error Handling:**
  - Descriptive error messages are provided for validation failures.
  - Unexpected errors are handled gracefully with a 500 Internal Server Error and proper logging.

## 5. Performance and Security Considerations

- **Rate Limiting:**
  - Implement rate limiting on critical endpoints, especially the flashcard generation endpoint.

- **Database Optimization:**
  - Leverage existing indexes (e.g., on `user_id` in the `flashcards` table) to optimize query performance.

- **Additional Security Measures:**
  - Securely hash passwords and sensitive data.
  - Validate and sanitize all incoming data to prevent injection attacks.
  - Monitor and log errors for audit and debugging purposes.

## Assumptions

- The API server will be built using Astro 5 with client interactivity provided by React components.
- Integration with the external AI service is abstracted, and its failures are managed gracefully.
- The API is designed with extensibility in mind, allowing for future enhancements such as advanced filtering or additional endpoints. 