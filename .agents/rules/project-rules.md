---
trigger: always_on
---

# PROJECT CONTEXT: End-to-End English Learning Platform

## 1. Core Identity & Agent Instructions
You are operating within the workspace of a comprehensive English learning web application. Your role is an autonomous, expert Full-Stack & AI Engineer. 
- Always generate verifiable Artifacts (Implementation Plans, DB Schemas, Task Lists) before writing code.
- Never break existing code when implementing new features.
- If a task requires browser research (e.g., checking Shadcn docs or IELTS rubrics), autonomously use the Browser Agent.
- For terminal commands, ensure you are in the correct directory (e.g., `/frontend` vs `/ai-service`).
- Tooling: Always use `pnpm` for Node packages and `uv` or `poetry` for Python dependencies.

## 2. Tech Stack & Frameworks Required
- **Frontend & UI:** Next.js 14+ (App Router), React, TypeScript (Strict Mode). Tailwind CSS, Shadcn UI, Radix UI, Framer Motion. State management: Zustand, TanStack Query. Keep components modular and server/client boundaries clear.
- **Backend & Core Database:** Supabase (PostgreSQL for relational data, `pgvector` for vector storage, Auth, Storage). Use Prisma or Drizzle ORM.
- **AI, NLP & Microservices:** Python (FastAPI) with Uvicorn, Pydantic (Asynchronous programming is mandatory).
- **RAG & Vector DB:** LangChain/LlamaIndex, Supabase `pgvector`, OpenAI API (GPT-4o) or Gemini 1.5 Pro.
- **NLP & Speech Processing:** SpaCy/HuggingFace, OpenAI Whisper API (STT), ElevenLabs API (TTS).
- **Recommendation Engine:** Scikit-learn, Surprise (Matrix Factorization).
- **Deployment:** Vercel (Frontend), Render/Railway/AWS (AI Backend), GitHub Actions.

## 3. Core Features & Architecture
1. **Dashboard:** Metric aggregation (streak, words, EXP) with Recharts/Chart.js.
2. **Roadmaps:** Dynamic path generation (IELTS, TOEIC, VSTEP) using Graph-based data structures.
3. **Vocabulary (SRS):** SuperMemo-2 (SM-2) algorithm using PostgreSQL. Flashcard animations. Global debounce dictionary search.
4. **Grammar & RAG Tutor:** Chunking -> Embedding -> Vector DB. Retrieve top-k context -> LLM -> Server-Sent Events (SSE) streaming.
5. **Listening:** HTML5 Audio API, `diff-match-patch` for text-diffing, transcript shadowing.
6. **Writing:** FastApi backend for LLM evaluation, SpaCy for precise grammar tagging and NER.
7. **Speaking (AI Partner):** WebRTC/WebSockets streaming -> Whisper -> LLM -> TTS -> Audio back to user.
8. **Mock Exams:** Strict timer, JSONB columns in PostgreSQL for complex test structures.
9. **Smart Recommendations:** Matrix Factorization combined with Content-Based Filtering.

## 4. Execution Plan (Reference)
The project will be built in the following phases. Always refer to these phases when asked to execute a specific task:
- Phase 1: Initialize Next.js, Tailwind, Shadcn, Zustand, Supabase. Base layout.
- Phase 2: PostgreSQL DB Schema (Users, SRS, Mock Tests) & pgvector.
- Phase 3: Dashboard, Roadmaps, UI logic.
- Phase 4: SRS logic and basic audio integration.
- Phase 5: Python FastAPI microservice & RAG pipeline.
- Phase 6: Whisper, LLMs, WebSockets for Writing/Speaking.
- Phase 7: Recommendation System & Deployment.