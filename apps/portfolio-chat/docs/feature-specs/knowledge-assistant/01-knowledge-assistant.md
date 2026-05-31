# Dynamic Portfolio Assistant

**Status:** In progress  
**Implementation plan:** [00 — Implementation Stages](./00-implementation-stages.md)

## Goal

Upgrade the existing portfolio chat so it can respond dynamically based on the user’s intent and Eric’s portfolio knowledge.

The assistant should no longer rely on hard-coded follow-up questions or generic AI responses. Instead, it should choose the correct portfolio context, generate useful answers, and return relevant next-step suggestions after each response.

## Current Behavior

The portfolio chat currently works, but parts of the experience are static.

Examples:

* Clicking “Show me your projects” displays projects from a JSON file.
* Clicking “Tell me about AudioGraph” sends a generic prompt to the AI.
* Follow-up suggestions are mostly hard-coded.
* The assistant does not reliably know which context to use for each question.

## Desired Behavior

The assistant should support two dynamic behaviors:

### 1. Dynamic Content Generation

When the user asks a question, the system should determine what type of response is needed.

Examples:

* “Show me your projects” should display the project list.
* “Show me your tech stack” should display Eric’s tech stack.
* “Tell me about yourself” should use candidate profile context.
* “Tell me about AudioGraph” should use AudioGraph project context.
* “What AI projects have you built?” should use relevant project context.

### 2. Dynamic Suggestions

After each assistant response, the system should generate relevant follow-up suggestions based on:

* the user’s latest message
* the assistant’s latest response
* the selected intent
* the portfolio context used

Example:

If the user asks about AudioGraph, suggestions might include:

* “How does AudioGraph collect data?”
* “What APIs does AudioGraph use?”
* “What was the hardest technical challenge?”

## Stage 1 Scope

Build a simple dynamic system without full RAG, GitHub scanning, or database storage.

Stage 1 should include:

* Markdown-based portfolio knowledge files
* A simple intent router
* Context loading based on intent
* Response type handling
* Dynamic follow-up suggestions
* Integration with the existing chat API and UI

## Out of Scope for Stage 1

* GitHub repo scanning
* Vector search
* Embeddings
* Full agent workflow
* Database-backed knowledge storage
* Resume PDF parsing
* Rebuilding the entire chat UI

## Main Concept

The chat should become a consumer of portfolio knowledge.

Flow:

```txt
User message or clicked suggestion
        ↓
Intent router
        ↓
Load relevant portfolio context
        ↓
Generate or render response
        ↓
Generate dynamic suggestions
        ↓
Return answer + suggestions to UI
```

## Example Intents

```txt
show_projects
show_tech_stack
candidate_overview
project_overview
project_architecture
project_challenges
ai_experience
design_system_experience
general_question
```

## Success Criteria

* Static follow-up questions are replaced with dynamic suggestions.
* Project questions use project-specific context.
* Candidate questions use candidate profile context.
* Simple display questions can return structured UI content without unnecessary AI generation.
* The assistant does not invent details that are not in the portfolio knowledge.
* The existing chat UI continues to work.

---

## Spec registry

| Stage | Spec |
|-------|------|
| Baseline | [current-state.md](./current-state.md) |
| 0 — Plan & decisions | [00-implementation-stages.md](./00-implementation-stages.md) |
| 1 — Knowledge files | [02-knowledge-sources.md](./02-knowledge-sources.md) |
| 2 — Intent router | [03-intent-router.md](./03-intent-router.md) |
| 3 — Context loader | [04-context-loader.md](./04-context-loader.md) |
| 4 — Response handler | [05-response-handler.md](./05-response-handler.md) |
| 5 — Dynamic suggestions | [06-dynamic-suggestions.md](./06-dynamic-suggestions.md) |
| 6 — Integration & cleanup | [07-integration-cleanup.md](./07-integration-cleanup.md) |
