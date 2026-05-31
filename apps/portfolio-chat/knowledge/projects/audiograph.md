---
id: audiograph
title: AudioGraph
tags: [analytics, full-stack, api-integration]
categories: [health]
---

# AudioGraph

## Overview

AudioGraph is a dual-app artist analytics platform for music industry professionals who need comparative performance data across streaming platforms. It tracks artists on Spotify and YouTube with automated daily collection, admin tooling for artist management, and a client portal for viewing analytics and historical trends.

## Problem

Music industry professionals needed real-time analytics to track artist performance across multiple platforms without manual data collection. Pulling Spotify and YouTube metrics by hand does not scale when comparing many artists over time.

## Solution

Eric built an automated system that collects daily metrics from Spotify and YouTube APIs, stores them in Supabase, and exposes the data through separate admin and client dashboards. Cron jobs drive scheduled collection; dashboards support real-time artist comparison and historical trend visualization.

## Tech Stack

- React 18, Next.js 14, TypeScript, Node.js
- Supabase (data storage)
- Spotify API, YouTube API
- Cron jobs for scheduled data collection

## Architecture

- **Dual-app layout:** Admin app for artist management and configuration; client portal for analytics consumption.
- **Data flow:** Cron jobs trigger daily API calls to Spotify and YouTube → metrics normalized and stored in Supabase → dashboards query stored data for comparison and trend charts.
- **Multi-tenant:** Secure separation between admin operations and client-facing views.
- **Deployment:** Production app on Vercel (`audiograph.vercel.app`).

## Key Features

- Automated daily data collection via cron jobs
- Real-time artist comparison dashboard
- Admin panel for artist management
- Client portal for viewing analytics
- Historical trend analysis
- Performance metrics visualization

## Challenges

- **External API integration:** Coordinating Spotify and YouTube APIs with different response shapes, auth, and rate limits while keeping daily jobs reliable.
- **Scheduled collection:** Designing cron-based pipelines that stay idempotent and recover gracefully when an upstream API fails.
- **Multi-tenant dashboards:** Serving admin and client experiences from shared data without leaking management capabilities to end users.
- **Performance at scale:** Keeping dashboard response times under ~2 seconds while querying growing historical datasets (10K+ data points monthly, 200+ API calls daily in production metrics).

## Lessons Learned

- Centralizing collected metrics in Supabase simplified both admin and client views compared to querying third-party APIs on every page load.
- Separating admin and client apps early clarified auth boundaries and UI responsibilities.
- Investing in automated collection upfront removed the manual workflow that motivated the product.

## Links

- **Live demo:** [audiograph.vercel.app](https://audiograph.vercel.app/)
- **GitHub:** [github.com/eric-nichols-nyc/audiograph](https://github.com/eric-nichols-nyc/audiograph)

## Metrics

| Metric | Value |
|--------|-------|
| Artists tracked | 50+ |
| Data points monthly | 10K+ |
| API calls daily | 200+ |
| Dashboard response time | <2s |
