# Public Notes 📝🌍

An interactive, real-time public wall where anyone can leave sticky notes, react with emojis, and collaborate on an infinite canvas. Built with modern web technologies, it features live cursors, customizable note styling, and clustered interactions.

## ✨ Features

- **Infinite Canvas:** Pan and zoom across a vast space to drop your thoughts.
- **Real-Time Collaboration:** See notes appear instantly and watch live cursors of other users on the board.
- **Customizable Sticky Notes:** Choose different color codes for your notes.
- **Anonymous or Identified:** Post notes anonymously or attach a username.
- **Rich Interactions:** React to notes using a custom emoji picker.
- **Smart Clustering:** Notes are clustered intelligently based on their coordinates.
- **Community Guidelines:** Onboarding modal that ensures respectful participation before users can post.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library:** [React 19](https://react.dev/), [Shadcn UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Canvas Interaction:** [@xyflow/react](https://reactflow.dev/) (for panning/zooming)
- **Live Cursors:** `perfect-cursors`
- **Testing:** [Jest](https://jestjs.io/) (Unit) & [Playwright](https://playwright.dev/) (E2E)

## 📖 Documentation

For deeper dives into the project setup, please refer to the `docs/` directory:
- [Architecture](docs/ARCHITECTURE.md) - System design and data flow.
- [Design](docs/DESIGN.md) - UI/UX principles and component structure.
- [Project Overview](docs/project.md) - High-level goals and context.
- [Onboarding](docs/ONBOARDING.md) - Guide for new developers.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase CLI (optional, for local DB development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/public-notes.git
   cd public-notes
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup:**
   The database migrations are located in `supabase/migrations`. Apply them to your Supabase instance to create the necessary tables (`wall_notes`, `wall_interactions`, etc.) and views.

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## 🧪 Testing

We use **Jest** for unit testing and **Playwright** for End-to-End (E2E) testing.

**Run unit tests:**
```bash
npm run test
# or run in watch mode
npm run test:watch
```

**Run E2E tests:**
Make sure you've installed Playwright browsers first (`npx playwright install`).
```bash
npm run test:e2e
# or run with the UI
npm run test:e2e:ui
```

## 🤝 Contributing

We welcome contributions! Whether you want to fix a bug, add a feature, or improve documentation, here’s how you can help:

1. **Fork the repository** and create your feature branch: `git checkout -b feature/my-new-feature`.
2. **Read the Docs:** Familiarize yourself with the [Architecture](docs/ARCHITECTURE.md) and [Design](docs/DESIGN.md) documents.
3. **Write Tests:** If you are adding a new feature, please include Jest or Playwright tests to cover your changes.
4. **Commit your changes:** Follow conventional commits (e.g., `feat: add new emoji interactions`).
5. **Push to the branch:** `git push origin feature/my-new-feature`.
6. **Open a Pull Request:** Describe your changes in detail and link any relevant issues.

### Known Issues & Upcoming Features
Check out the `todo.md` file for a list of active tasks, known bugs (like overlapping clusters), and planned features (like auto-expiring notes).

## 📄 License

This project is licensed under the MIT License.
