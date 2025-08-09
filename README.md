# MusiArt

An interactive web application that generates music using Google's GenAI, featuring a canvas-based interface for a unique user experience.

## Features

- Real-time music generation from your drawings using Google's GenAI
- Interactive canvas interface
- Responsive design with Tailwind CSS
- Built with SvelteKit and TypeScript

## Prerequisites

- Node.js (v18 or later)
- pnpm (recommended) or npm
- Google GenAI API key

## Getting Started

1. Clone the repository
   ```sh
   git clone https://github.com/yourusername/musiart.git
   cd musiart
   ```

2. Install dependencies
   ```sh
   pnpm install
   # or
   npm install
   ```

3. Start the development server
   ```sh
   pnpm dev
   # or
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build
- `check` - Run type checking
- `format` - Format code with Prettier
- `lint` - Lint code with ESLint

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) - Frontend framework
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google GenAI](https://ai.google.dev/) - AI music generation