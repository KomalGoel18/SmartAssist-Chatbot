# SmartAssist Chatbot

SmartAssist Chatbot is a reusable **decision-tree based chatbot** built with **Next.js, TypeScript, and Tailwind CSS**. It is designed as a floating chatbot widget that can be integrated into any website to provide guided conversational support through predefined response flows.

The chatbot follows a structured decision-tree approach where users interact by selecting options instead of typing free-text queries, making it ideal for service navigation, support assistance, and guided user journeys.

---

## Features

* Floating chatbot widget with modern UI
* Decision-tree based guided conversation flow
* Chat history support for user and bot messages
* Restart conversation functionality
* Auto-scroll to latest message
* Global integration using Next.js layout
* Reusable and modular architecture
* Easily editable chatbot content through a single data file

---

## Tech Stack

* Next.js
* TypeScript
* Tailwind CSS
* React Hooks

---

## Project Structure

```text
smartassist-chatbot
├── app
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── src
│   ├── components
│   │   └── chatbot
│   │       └── Chatbot.tsx
│   │
│   ├── data
│   │   └── chatbotTree.ts
│   │
│   ├── hooks
│   │   └── useChatbot.ts
│   │
│   └── types
│       └── chatbot.ts
│
├── public
├── package.json
└── tsconfig.json
```

---

## How It Works

The chatbot uses a **decision tree stored in `chatbotTree.ts`**.

Each node contains:

* a bot message
* available options
* next conversation path

Example:

```ts
start: {
  message: "Hello! How can I help you today?",
  options: [
    { label: "Services", next: "services" },
    { label: "Pricing", next: "pricing" }
  ]
}
```

The chatbot logic reads the current node and updates the conversation when the user selects an option.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/KomalGoel18/SmartAssist-Chatbot
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open in browser:

```text
http://localhost:3000
```

---

## Customization

Chatbot content can be edited from:

```text
src/data/chatbotTree.ts
```

You can modify:

* messages
* options
* conversation branches

without changing chatbot logic.

---

## Purpose

This project demonstrates how a structured chatbot can be built using modern frontend technologies while maintaining clean architecture and reusable logic.

---
