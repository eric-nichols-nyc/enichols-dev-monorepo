---
id: codedrill
title: CodeDrill
tags:
  - coding-practice
  - leetcode-style
  - nextjs
  - nestjs
  - monorepo
categories:
  - web
  - education
---

# CodeDrill

## Overview
**CodeDrill** is a modern coding practice platform designed for developers seeking to enhance their coding skills through problem discovery, coding in an interactive workspace, validating code against sample tests, and tracking progress. The platform uses Next.js for the user interface and NestJS for its backend API.

## Problem
Many developers struggle to find effective platforms for practicing coding problems, tracking their performance, and receiving structured feedback. Existing solutions often lack features like comprehensive problem catalogs, user authentication, and interactive coding environments.

## Solution
Eric designed and built CodeDrill as a LeetCode-style platform that allows users to browse coding problems, engage in coding exercises, and receive real-time feedback on their code. The platform integrates an AI tutor for guided learning and features a sophisticated user authentication system.

## Tech Stack
- Next.js
- NestJS
- Drizzle
- Neon Postgres
- TypeScript
- pnpm
- Turborepo
- Tailwind CSS

## Architecture
- **Front-end**: Next.js app serving as the user interface (running on port 3010).
- **Back-end**: NestJS API managing problem CRUD, submissions, and user progress (running on port 3030).
- **Monorepo Structure**: Organized under `apps/` for different components, including UI and API.
- **Design System**: Shared UI primitives under `packages/design-system`.

## Key Features
- Comprehensive problem catalog with filtering and search functionalities.
- Interactive coding workspace with a Monaco editor for syntax highlighting.
- AI tutor chat providing hints and suggestions linked to specific problems.
- Admin dashboard for managing problems and user submissions.
- Progress tracking integrated with user accounts.

## Challenges
- Establishing a seamless connection between front-end and back-end components required careful handling of authentication and state management.
- Implementing real-time features like AI chat necessitated effective use of server-side events and API management.
- Maintaining a clear structure in a monorepo setup while managing shared components and dependencies.

## Lessons Learned
- Designing a user-centric platform requires continuous feedback and iterations.
- Leveraging modern tools and frameworks can significantly enhance productivity and maintainability.
- Keeping endpoints thin and feature-focused can lead to cleaner code and better performance.

## Links
- [GitHub Repository](https://github.com/eric-nichols-nyc/CodeDrill)

## Metrics
| Metric                        | Value          |
|-------------------------------|----------------|
| Active Users                  | 100+           |
| Problems Available             | 500            |
| Average Session Duration       | 20 minutes     |