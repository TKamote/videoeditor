# Stream Editor AI

AI-powered video editing platform for streamers.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase, Google Cloud
- **AI**: Google Video Intelligence API, Gemini 2.5 Flash
- **Storage**: Firebase Storage, Google Cloud Storage
- **Authentication**: Firebase Auth with email verification

## Project Structure

```
web/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/        # React components
│   └── lib/              # Utilities and configs
├── cloud-run/            # FFmpeg worker (separate service)
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project
- Google Cloud project (for video processing)

### Installation

```bash
cd web
npm install
```

### Environment Variables

See `env.example` for required environment variables.

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Deployment

### Vercel

1. Connect GitHub repository
2. Set **Root Directory** to `web`
3. Add environment variables in Vercel dashboard
4. Deploy!

See `DEPLOY_CHECKLIST.md` for detailed deployment instructions.

## Features

- ✅ User authentication with email verification
- ✅ Video upload and processing
- ✅ AI-powered clip detection
- ✅ Dark/Light mode
- ✅ Mobile responsive

## License

Private project

