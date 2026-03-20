# Trivia Genius - AI-Powered Quiz Symphony

A professional, high-performance web application designed for the **Frontend Developer** assignment. This app leverages **Next.js 16**, **TypeScript**, and **Generative AI** to deliver a premium, modular, and context-aware quiz experience.

---

## Live Demo & Repository
- **Live URL:** [https://trivia-genius-app.vercel.app](https://trivia-genius-app.vercel.app)
- **GitHub:** [https://github.com/nishanthxmahesh/Trivia-Genius](https://github.com/nishanthxmahesh/Trivia-Genius)

---

## Features Implemented

### 1. **AI Question Generation**
-   **Hyper-Topic Selection:** Generate quizzes on *any* free-text topic (from "Quantum Physics" to "Pop Culture").
-   **Customizable Constraints:** Select difficulty (Easy, Medium, Hard), question counts (5–20), and specific question types.
-   **Advanced Rules Engine:** Configure **Negative Marking** per question, **Strict Mode** (require all answers), and **AI Assistance** toggles.
-   **Precision Timers:** Set a **Total Quiz Timer** (auto-submit on expiry) and a **Minimum Time Limit** (prevents early/accidental submissions).
-   **Factually Accurate:** Integrated with **Groq SDK** for high-accuracy, context-aware question creation.

### 2. **Advanced Quiz UX**
-   **Dynamic Quiz Interface:** Single-question focus with a real-time **Progress Bar** and **Timer**.
-   **Intuitive Navigation:** Grid-based and button-based question navigation.
-   **Auto-Persistence:** Quiz progress is saved in local state via **Zustand Persistence**, allowing for seamless page refreshes.
-   **Penalty-Based Hints:** Get up to 3 AI-generated hints per question with a tiered points-deduction penalty (25%, 50%, 75%).
-   **Answer Management:** "Clear Answer" functionality and a visual **Question Navigator** to track marked and skipped questions.

### 3. **Results & Deep Analytics**
-   **Score Breakdown:** Instant score calculation with comprehensive metrics (Time, Marks, Percentage).
-   **AI Weak Area Analysis**: Exclusive feature that analyzes your mistakes and suggests specific subtopics to improve upon.
-   **Detailed Question Review**: View correct answers, your picks, and AI-generated explanations for every response.
-   **PDF Export**: Download your results with one click using `jsPDF` and `html-to-image`.

### 4. **Persistence & Performance**
-   **Cloud Persistence**: All attempts and leaderboard data are synced with **Supabase** for real-time global competition.
-   **Data Visualization**: Performance trends (Line Charts) and Category Accuracy (Bar Charts) built with **Recharts**.
-   **Achievements & Streaks**: Gamified experience with tracked badges and performance milestones.
-   **PWA Ready**: Installable web experience with offline support and optimized service workers.

---

## Architecture Decisions

### **1. Modular Design System**
The project follows a component-driven architecture. Complex UI elements are broken down into small, reusable "Parts" (e.g., `ProgressBar`, `QuestionNavigator`, `ReviewCard`). This ensures the codebase remains maintainable and strictly DRY (Don't Repeat Yourself).

### **2. State Management (Zustand)**
Zustand was chosen over Redux for its lightweight footprint and powerful middleware support. 
-   **`persist`**: Used to recover the user's quiz state if they accidentally refresh or close the tab.
-   **Centralized Store**: Handles everything from AI-generated questions to real-time question-by-question timing.

### **3. AI Integration Layer (Server Side)**
To ensure security and performance:
-   **API Proxying**: AI requests are routed through Next.js API routes (`/api/generate`, `/api/explain`) to keep API keys secure.
-   **Prompt Engineering**: Specialized system prompts ensure the AI consistently returns valid JSON, preventing application crashes.

---

## Technology Stack
-   **Framework:** Next.js 16 (App Router)
-   **Language:** TypeScript (Strictly Typed)
-   **Database:** Supabase (PostgreSQL)
-   **AI Engine:** Groq (Llama 3.3 70B Model)
-   **State Management:** Zustand
-   **Styling:** Tailwind CSS + Framer Motion
-   **Charts:** Recharts
-   **Export:** jsPDF + html-to-image

---

## Setup Instructions

### 1. Prerequisites
-   Node.js (v18+)
-   A Groq API Key ([Get one here](https://console.groq.com/))
-   A Supabase Project ([Create one here](https://supabase.com/))

### 2. Basic Setup
```bash
git clone https://github.com/nishanthxmahesh/Trivia-Genius.git
cd Trivia-Genius
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Database Schema
Run this SQL in your Supabase SQL Editor:
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score FLOAT8 NOT NULL,
  total INT8 NOT NULL,
  time_taken INT8 NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  questions JSONB NOT NULL,
  user_answers JSONB NOT NULL,
  question_timings JSONB,
  earned_marks FLOAT8,
  total_marks FLOAT8,
  question_hints JSONB,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  earned_marks FLOAT8,
  total_marks FLOAT8,
  percentage FLOAT8,
  time_taken INT8,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Run the App
```bash
npm run dev
```
Visit `http://localhost:3000` to start.

---

## Known Limitations
-   **Rate Limits:** The free tier of Groq has a rate limit (~429). The app handles this with a graceful error message asking the user to wait a moment.
-   **Exact Matching:** Fill-in-the-blank questions currently expect exact text matches (though case-insensitive).

---

## Project Gallery

### 1. Smart Question Generation
*Generate unlimited quizzes on any topic with custom settings.*
<div flex gap-2>
  <img src="/public/screenshots/gen-1.png" width="30%" />
  <img src="/public/screenshots/gen-2.png" width="30%" />
  <img src="/public/screenshots/gen-3.png" width="30%" />
</div>

### 2. Dynamic Quiz Experience
*Distraction-free environment with progress tracking and timers.*
<div flex gap-2>
  <img src="/public/screenshots/quiz-1.png" width="24%" />
  <img src="/public/screenshots/quiz-2.png" width="24%" />
  <img src="/public/screenshots/quiz-3.png" width="24%" />
  <img src="/public/screenshots/quiz-4.png" width="24%" />
</div>

### 3. Detailed Results & Review
*Get instant feedback and AI-powered explanations for every answer.*
<div flex gap-2>
  <img src="/public/screenshots/review-1.png" width="30%" />
  <img src="/public/screenshots/review-2.png" width="30%" />
  <img src="/public/screenshots/review-3.png" width="30%" />
</div>

### 4. Advanced Analytics & History
*Visualize your growth with data charts and full attempt history.*
<div flex gap-2>
  <img src="/public/screenshots/analytics-1.png" width="48%" />
  <img src="/public/screenshots/analytics-2.png" width="48%" />
  <img src="/public/screenshots/history-1.png" width="48%" />
  <img src="/public/screenshots/history-2.png" width="48%" />
</div>

### 5. Global Leaderboard
*Synced with Supabase to track top performers worldwide.*
<div flex gap-2>
  <img src="/public/screenshots/leaderboard.png" width="32%" />
</div>

---

Developed for the **Frontend Developer** Assignment by **M.Nishanth**.
