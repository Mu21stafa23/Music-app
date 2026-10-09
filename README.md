# MOON Sound 🌙

A music player for the browser with time-synced lyrics, live lyric translation and a karaoke mode. Available in Arabic and English, and installable as an app (PWA).

**Live demo:** [moonsound.vercel.app](https://moonsound.vercel.app)

## Features

- **Search with suggestions** — find any song or artist, with autocomplete as you type
- **Synced lyrics** — lines highlight in time with the music, with a manual offset if the timing is off
- **Lyric translation** — translate the lyrics line by line without leaving the player
- **Karaoke and vinyl modes** — full-screen lyrics with adjustable text size, or a spinning record view
- **Favorites, playlists and bookmarks** — saved in your browser, no account needed
- **Listening extras** — playback speed, sleep timer, and ambient sounds (rain, waves, fire)
- **Moon Drop** — share a 15-second moment of a song as a link with a short "vibe" label
- **Arabic / English** interface with right-to-left support, plus dark and light themes
- **Installable** — works as a PWA on phone and desktop

## Built with

- [Next.js 16](https://nextjs.org) (App Router, API routes)
- [React 19](https://react.dev) and [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- [react-youtube](https://github.com/tjallingt/react-youtube) for playback
- [LRCLIB](https://lrclib.net) for lyrics

## Run it locally

```bash
cd my-lyrics-app
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project structure

```
my-lyrics-app/
├── app/
│   ├── api/
│   │   ├── search/        # Song search
│   │   ├── suggestions/   # Search autocomplete
│   │   └── translate/     # Lyric translation
│   ├── layout.tsx
│   └── page.tsx           # The player UI
├── components/
│   └── MoonDropModal.tsx  # Share-a-moment dialog
├── lib/
│   └── lyrics.ts          # Fetches and parses synced lyrics
└── public/
    ├── manifest.json      # PWA manifest
    └── sw.js              # Service worker
```

## Note

This is a personal learning project. Music playback comes from YouTube and lyrics from LRCLIB; all content belongs to its respective owners.
