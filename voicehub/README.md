# VoiceHub

VoiceHub is a production-oriented AI audio platform that unifies speech-to-text and text-to-speech in one SaaS-ready Next.js application.

## Stack

- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- Secure cookie sessions with hashed session tokens
- OpenAI Audio APIs behind swappable provider adapters
- Local storage adapter for MVP, ready to evolve to S3 / Blob storage

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL locally:

```bash
docker compose up -d
```

3. Copy the env file and fill in your secrets:

```bash
cp .env.example .env
```

4. Generate the Prisma client and apply the schema:

```bash
npm run db:generate
npm run db:push
```

5. Start the app:

```bash
npm run dev
```

6. Open `http://localhost:3000`.

## Deployment Notes

- Use managed PostgreSQL in production.
- Replace the local storage adapter with S3, Vercel Blob, or another object store.
- Keep `OPENAI_API_KEY` server-side only.
- Set `NEXT_PUBLIC_APP_URL` to the deployed origin.

## Included Deliverables

- Unified STT and TTS product shell
- Auth, jobs, usage logging, and history
- Transcript editing and TXT / DOCX / SRT export
- Premium responsive dashboard and workspaces
- Deployment-ready architecture documentation in `ARCHITECTURE.md`
