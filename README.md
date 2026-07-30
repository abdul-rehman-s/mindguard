# 🧠 MindGuard

> AI-powered attention management platform built with Next.js, TypeScript, Prisma, and Tailwind CSS.

MindGuard is an intelligent productivity platform designed to help users improve focus, build healthy habits, reduce distractions, and gain insights into their work patterns through AI-powered coaching and analytics.

---

## ✨ Features

### 🎯 Focus & Productivity
- Pomodoro Focus Timer
- Deep Work Sessions
- Smart Session Analytics
- Productivity Dashboard
- Focus Score Tracking

### 🤖 AI Assistant
- Personalized AI Productivity Coach
- Context-aware Conversations
- Memory System
- Knowledge Graph
- Reflection & Recommendations

### 📈 Habit Tracking
- Daily Habit Management
- Habit Streaks
- Progress Analytics
- Weekly Reports
- Goal Tracking

### 🧠 Intelligent Insights
- Attention Pattern Analysis
- Productivity Trends
- Work Preference Detection
- Personalized Suggestions

### 🔐 Authentication
- Secure User Authentication
- Onboarding Flow
- Protected Dashboard
- Session Management

### 💻 Desktop Integration
- Local Desktop Companion
- Activity Monitoring
- Local Database Support
- WebSocket Communication

---

# 🏗 Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand

## Backend

- Next.js API Routes
- Prisma ORM
- SQLite
- NextAuth

## AI

- Memory Engine
- Knowledge Graph
- AI Coaching
- Intelligent Recommendations

---

# 📁 Project Structure

```
mindguard/
│
├── prisma/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── electron/
├── mini-services/
├── skills/
├── scripts/
└── docs/
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/abdul-rehman-s/mindguard.git
cd mindguard
```

## Install Dependencies

```bash
npm install
```

## Configure Environment

Create a `.env` file.

Example:

```env
DATABASE_URL="file:./dev.db"

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

OPENAI_API_KEY=your-api-key
```

---

## Setup Database

```bash
npx prisma generate

npx prisma db push
```

---

## Start Development Server

```bash
npm run dev
```

Application runs at

```
http://localhost:3000
```

---

# 🧪 Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint

npx prisma generate
npx prisma db push
```

---

# 📊 Current Modules

- Landing Page
- Authentication
- Onboarding
- Dashboard
- Focus Timer
- Habits
- Analytics
- AI Assistant
- Memory Engine
- Knowledge Graph
- Settings
- Desktop Integration

---

# 📸 Screenshots

Add screenshots here:

```
docs/screenshots/
```

Example:

```
Dashboard

Landing Page

Focus Timer

AI Assistant

Analytics

Habit Tracker
```

---

# 🔒 Security

Sensitive configuration is stored using environment variables.

Never commit:

- `.env`
- API Keys
- Secrets
- Tokens
- Database credentials

---

# 🛣 Roadmap

- [x] Authentication
- [x] AI Memory
- [x] Knowledge Graph
- [x] Focus Timer
- [x] Habit Tracking
- [x] Dashboard
- [x] Desktop Integration
- [ ] Cloud Sync
- [ ] Mobile Application
- [ ] Team Collaboration
- [ ] AI Voice Coach

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/my-feature
```

3. Commit your changes.

```bash
git commit -m "feat: add new feature"
```

4. Push your branch.

```bash
git push origin feature/my-feature
```

5. Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Abdul Rehman**

GitHub

https://github.com/abdul-rehman-s

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps others discover the project and supports future development.
