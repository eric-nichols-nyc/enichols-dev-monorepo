---
id: trellnode
title: Trellix
tags: [fullstack, kanban, nosql]
categories: [ai]
---

# Trellix

## Overview

Trellix is a full-stack Kanban board application for task and project management. It offers drag-and-drop boards with real-time task updates, backed by a Node.js API and MongoDB for flexible document storage.

## Problem

Teams needed a lightweight, self-hosted alternative to traditional project management tools with fast performance and flexible data modeling for boards, lists, and cards.

## Solution

Eric built a RESTful Node.js API with MongoDB, paired with a responsive React frontend featuring drag-and-drop Kanban UX. MongoDB's document model maps naturally to boards, lists, and cards without rigid relational schemas.

## Tech Stack

- React, TypeScript
- Node.js, Express
- MongoDB
- REST API
- Drag-and-drop UI patterns

## Architecture

- **Client:** React SPA with drag-and-drop boards, lists, and cards; responsive layout.
- **API:** Express REST endpoints for boards, lists, cards, and task operations.
- **Data:** MongoDB stores flexible board/list/card documents; schema can evolve per board without migrations-heavy relational modeling.
- **Deployment:** Production app on Vercel (`trellix-one.vercel.app`).

## Key Features

- Drag-and-drop Kanban boards
- Create and organize boards, lists, and cards
- RESTful API for extensibility
- Real-time task management UX
- Flexible NoSQL data modeling
- Responsive design

## Challenges

- **Drag-and-drop state:** Keeping optimistic UI smooth while persisting card moves through the REST API without inconsistent board state.
- **Flexible MongoDB modeling:** Designing document shapes that support unlimited boards and nested list/card structures without query performance surprises.
- **REST API surface:** Exposing enough endpoints for extensibility while keeping the contract simple for the React client.
- **Full-stack TypeScript alignment:** Sharing types and validation patterns between Express handlers and the React front end.

## Lessons Learned

- MongoDB fit the board/list/card hierarchy better than forcing a relational schema for a portfolio-scale Kanban app.
- A clear REST layer made the React client easier to test independently of UI drag-and-drop polish.
- Drag-and-drop UX required careful separation of local interaction state and server persistence to avoid jitter on slow networks.

## Links

- **Live demo:** [trellix-one.vercel.app](https://trellix-one.vercel.app/)
- **GitHub:** [github.com/eric-nichols-nyc/trellix](https://github.com/eric-nichols-nyc/trellix)

## Metrics

| Metric | Value |
|--------|-------|
| Boards | Unlimited |
| API | RESTful |
| Data store | MongoDB |
| Stack | Full stack |
