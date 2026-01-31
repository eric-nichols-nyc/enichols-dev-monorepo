# Tech stack (and tool → component) flow

How the tech stack question works end-to-end, and how tool results become React components.

## End-to-end flow

1. **User** asks something like "What's your tech stack?" or clicks "</> Tech".

2. **Client** sends the conversation to `POST /api/chat` (e.g. via `useChat`).

3. **API** runs `streamText` with the `show_tech_stack` tool. The **model** decides to call that tool (per the system prompt).

4. **Tool** runs on the server: it reads `tech.json`, returns `{ technologies, tech, related }`. That payload is sent in the stream as a **tool result** (not as streamed text).

5. **Stream**
   - The API injects the short copy ("Here's the tech stack…") as **streamed text** so the user sees typing.
   - The **tool result** is a separate chunk: `type: "tool-output-available"`, with the full `output` object.

6. **Client** (`useChat` / AI SDK) turns that into a message with **parts**:
   - One part: streamed text ("Here's the tech stack…").
   - Another part: `type: "tool-show_tech_stack"`, `state: "output-available"`, `output: { tech, related, ... }`.

7. **MessagePartRenderer** sees the tool part. For `tool-show_tech_stack` + `output-available` it renders the React component `<TechStack tech={output.tech} />` (and Related). The table is **not** streamed character-by-character; it appears when the tool result is available, same as the projects grid.

**Summary:** The model chooses when to call the tool, the tool returns data, and the frontend decides how to display that data (table + related). The only streamed text is the short intro; the table is rendered once from the tool output.

## Same pattern for other tools

- **show_projects** → `<Projects />` + streamed follow-up copy
- **show_experience** → `<Experience />` + Related
- **show_about** → `<About />` + Related
- **show_resume** → `<Resume />` + Related
- **show_tech_stack** → short streamed intro + `<TechStack />` + Related

Tool returns data → stream sends tool result → client message has a part → `MessagePartRenderer` maps that part to the right component.
