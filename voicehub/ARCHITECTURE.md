# VoiceHub Architecture

## Product Requirements

- Unified SaaS-style AI audio platform
- Speech-to-text with uploads, recording, timestamps, editing, export, history
- Text-to-speech with voice controls, download, and history
- Shared authentication, dashboard, activity tracking, and library
- Extensible design for billing, team accounts, quotas, and new AI audio features

## System Architecture

- Frontend: Next.js App Router pages and reusable UI components
- Backend: Route handlers plus feature services
- Auth: Email/password login with server-side hashed sessions
- Data: Prisma models on PostgreSQL
- AI Processing: OpenAI-based STT and TTS provider implementation behind interfaces
- Storage: Local filesystem adapter for MVP, designed to be replaced by object storage later

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `PATCH /api/profile`
- `POST /api/stt`
- `POST /api/tts`
- `PATCH /api/transcripts/:id`
- `DELETE /api/transcripts/:id`
- `GET /api/transcripts/:id/export?format=txt|docx|srt`
- `DELETE /api/voice-outputs/:id`
- `GET /api/assets/:id`
- `GET /api/health`

## Database Schema

- `User`
- `Session`
- `Job`
- `MediaAsset`
- `Transcript`
- `TranscriptSegment`
- `VoiceOutput`
- `UsageLog`

## Frontend Structure

- Marketing landing page
- Auth pages
- Authenticated dashboard shell
- STT studio
- TTS studio
- Library
- Activity feed
- Settings / profile

## Folder Structure

```text
src/
  app/
  components/
  lib/
  server/
prisma/
storage/
```

## Deployment Guidance

- Run on Vercel or another Node-capable platform
- Use managed Postgres
- Swap storage adapter to a durable blob store
- Add background queues for heavy async processing in v2

## Suggested V2 Improvements

- Team workspaces and RBAC
- Billing and usage quotas
- Background job queues and webhooks
- Search and tagging in the library
- API keys for programmatic access
- Additional AI audio tools like translation, dubbing, and voice cloning
