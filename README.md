# CF IP ACCESS RULE API WORKERS

## Introduction

This project provides a simple API to manage Cloudflare IP Access Rules for a specific zone. It allows you to:

- **List** existing access rules by mode (block, challenge, whitelist, js_challenge, managed_challenge).
- **Create** access rules for all countries with a specified mode.
- **Delete** all access rules of a specific mode.

## Prerequisites

- A Cloudflare account with API credentials (API email and API key).
- The zone ID of the Cloudflare zone you want to manage.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/cf-jongsik/cf-ip-access-rule-API-worker.git
```

2. Navigate to the project directory:

```bash
cd cf-ip-access-rule-API-worker
```

3. Install dependencies:

```bash
npm install
```

# Configuration

Create a secret to the project.
Add the following environment variables, replacing the placeholders with your actual values:

```
API_EMAIL=your_cloudflare_api_email
API_KEY=your_cloudflare_api_key
ZONEID=your_cloudflare_zone_id
```

# Deployment

Refer to the documentation of your preferred deployment platform (e.g., Vercel, Netlify, AWS Lambda) for instructions on deploying Node.js applications.

# API Endpoints

Base URL: /

Method Endpoint Description

- **GET** /:mode List access rules by mode.

- **POST** /:mode Create access rules for all countries with the specified mode.

- **DELETE** /:mode Delete all access rules of the specified mode.

Mode Parameter:

- **block:** Block requests from the specified countries.

- **challenge:** Challenge requests from the specified countries with a CAPTCHA.

- **whitelist:** Allow requests only from the specified countries.

- **js_challenge:** Challenge requests from the specified countries with a JavaScript challenge.

- **managed_challenge:** Challenge requests from the specified countries with a Managed Challenge.

# Examples

```bash
List all block rules:
curl http://localhost:3000/block

Create challenge rules for all countries:
curl -X POST http://localhost:3000/challenge

Delete all whitelist rules:
curl -X DELETE http://localhost:3000/whitelist
```

# Disclaimer

This project is provided as-is without warranty or support. Use it at your own risk.
