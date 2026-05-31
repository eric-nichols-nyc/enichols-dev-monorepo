# Reference notes (learn-by-reading)

This folder is for **human learning notes** and deep dives written while exploring the codebase.

## Not requirements

Cursor agents must **not** treat files here as product requirements. Authoritative specs live in:

- **[../feature-specs/](../feature-specs/)** — per-feature requirements
- **[../context/](../context/)** — architecture, standards, tracker
- **[../prd.md](../prd.md)** — product-level requirements

If reference notes conflict with a feature spec, **the spec wins**.

## When to add here

- Explaining how a subsystem works after reading code
- Diagrams, debugging notes, links to external docs
- Migration notes that are informational, not acceptance criteria

Move stable requirements into `feature-specs/` when they should drive implementation.
