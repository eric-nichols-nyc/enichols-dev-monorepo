# @repo/ai

Shared AI utilities and model configuration for the monorepo.

## Provider Selection

This package supports both OpenAI and Google (Gemini) providers.

Set `AI_PROVIDER` to choose which provider the app uses:

- `openai` (default)
- `google`

The model selection logic lives in `lib/models.ts`.

## Environment Variables

Define these in your root `.env.local` (or app-level `.env.local` if that app loads them).

### Common

- `AI_PROVIDER` - `openai` or `google` (defaults to `openai`)

### OpenAI

- `OPENAI_API_KEY` (required when `AI_PROVIDER=openai`)
- `OPENAI_CHAT_MODEL` (optional, default: `gpt-4o-mini`)
- `OPENAI_EMBEDDING_MODEL` (optional, default: `text-embedding-3-small`)

### Google

- `GOOGLE_GENERATIVE_AI_API_KEY` (required when `AI_PROVIDER=google`)
- `GOOGLE_CHAT_MODEL` (optional, default: `gemini-2.0-flash`)
- `GOOGLE_EMBEDDING_MODEL` (optional, default: `text-embedding-004`)

## Example Config

OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Google:

```env
AI_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=AI...
GOOGLE_CHAT_MODEL=gemini-2.0-flash
GOOGLE_EMBEDDING_MODEL=text-embedding-004
```

## Notes

- If the selected provider is missing its required API key, model initialization throws an error at runtime.
- The chat app imports models from this package (`@repo/ai/lib/models`) and uses `models.chat`.
