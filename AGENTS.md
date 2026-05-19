# AGENTS.md

## Project

AI Resume Parser SaaS.

Users upload resume PDFs. The backend extracts PDF text, sends it to Groq LLM, validates the structured output with Pydantic, and stores the parsed result in PostgreSQL.

## Tech Stack

- Backend: FastAPI, SQLAlchemy 2.0, PostgreSQL, Celery, Redis, Pydantic
- Frontend: Next.js 15 App Router, Tailwind CSS, Shadcn UI
- Infra: Docker Compose
- LLM provider: Groq

## Repository Expectations

Use this structure unless an existing file layout clearly establishes a different convention:

```text
backend/
  app/
    main.py
    api/
      routes/
    core/
      config.py
      logging.py
    db/
      session.py
    models/
    schemas/
    services/
    workers/
frontend/
  app/
  components/
  lib/
docker-compose.yml
verify.sh
```

## Architecture Rules

- Keep FastAPI route handlers thin.
- Put business logic in `services/`.
- Put SQLAlchemy database models in `models/`.
- Put Pydantic request, response, and LLM validation schemas in `schemas/`.
- Put Celery tasks in `workers/`.
- Use async FastAPI route handlers.
- Use strict typing everywhere.
- Load configuration from environment variables via `.env`.
- Use production-grade structured logging.
- Add explicit error handling around uploads, PDF parsing, LLM calls, validation, database writes, and worker execution.
- Validate every LLM response with Pydantic before saving or returning it.
- Do not trust raw LLM JSON.
- Keep database access behind service or repository-style functions; do not put ORM logic directly in API routes.
- Prefer small, testable functions over large orchestration blocks.

## Backend Requirements

Implement these endpoints:

- `POST /upload`
  - Accepts a resume PDF.
  - Stores or stages the uploaded file.
  - Creates a database record with a processing status.
  - Enqueues a Celery task.
  - Returns the resume record id and current status.

- `GET /resume/{id}`
  - Returns processing status.
  - Returns validated parsed resume JSON when complete.
  - Returns clear error information when processing fails.

## Worker Flow

Celery processing must follow this order:

1. Extract PDF text.
2. Send extracted text to Groq.
3. Parse and validate Groq JSON with Pydantic.
4. Save validated structured data to PostgreSQL.
5. Update processing status.

Worker failures must update the database record with a failed status and log enough context to debug the issue without leaking secrets.

## Database Rules

- Use PostgreSQL.
- Use SQLAlchemy 2.0 style models and sessions.
- Keep migrations deterministic if Alembic is added.
- Store processing status separately from parsed JSON.
- Use a persistent PostgreSQL Docker volume.

## Frontend Requirements

Build the actual app experience, not a marketing landing page.

Required pages:

- Upload page
- Result page

Required behavior:

- Drag and drop PDF upload.
- Submit uploaded file to `POST /upload`.
- Navigate to or display a result view for the returned resume id.
- Poll `GET /resume/{id}` until processing is complete or failed.
- Show loading, success, and error states.

Use Tailwind and Shadcn UI consistently. Keep UI components accessible and typed.

## Docker Requirements

The entire stack must run with:

```sh
docker-compose up
```

Docker Compose must include:

- FastAPI backend with hot reload.
- Next.js frontend with hot reload.
- PostgreSQL with a persistent volume.
- Redis.
- Celery worker.

Environment variables must be read from `.env`. Do not commit real secrets.

## LLM Rules

- Use Groq through a service module, not directly from routes or workers.
- Keep prompts versioned in code.
- Require JSON output from the model.
- Validate all model output with Pydantic.
- Treat validation failure as a processing failure and store/log it accordingly.
- Never save unvalidated LLM output as the final parsed result.

## Logging And Errors

- Use structured logs for backend and worker processes.
- Include request ids or job ids where practical.
- Do not log API keys, raw secrets, or full sensitive resume contents.
- Convert expected failures into clear API responses.
- Let unexpected failures be logged with stack traces server-side.

## Testing And Verification

Create `verify.sh` at the repository root.

`verify.sh` must:

1. Upload a sample PDF to `POST /upload`.
2. Wait for processing completion by polling `GET /resume/{id}`.
3. Validate the returned JSON shape.
4. Print `OK` on success.
5. Exit non-zero on failure.

The script should assume the stack is already running through `docker-compose up`.

## Development Standards

- Keep code typed and formatted.
- Add focused tests for services, schemas, worker flow, and API behavior when practical.
- Prefer dependency injection for database sessions and service clients.
- Keep external service calls isolated behind service modules.
- Avoid broad refactors unless needed for the requested change.
- Preserve existing user changes in the working tree.

