# 🏠 Stay Safe - Is That Property Safe?

A web app to analyze real estate listings for potential scam indicators using AI. Just paste a property listing URL and get a red-flag report backed by LLaMA 3 via the Groq API.

## 🚀 Features

- Analyze property listings with AI
- Returns suspicion score, red flags, and reasoning
- Clean UI with Framer Motion animations
- Caching and rate-limiting using Upstash Redis
- Headless scraping with Puppeteer

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TailwindCSS, Framer Motion
- **Backend**: Next.js API routes, Puppeteer, Groq API (LLaMA 3)
- **Caching/Rate-limiting**: Upstash Redis
- **Types**: TypeScript
- **Deployment**: Docker-ready

## 🐳 Docker

To run locally with Docker:

```bash
docker build -t stay-safe .
docker run -p 3000:3000 --env-file .env.local stay-safe
