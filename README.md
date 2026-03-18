# IGNITE - Dating Website

A modern, high-performance dating application built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Features

### Core Experience
- **Swipe Interface**: Pixel-perfect card stack with real physics, drag interactions, and spring animations.
- **Matching System**: Real-time matching logic with "It's a Match" celebration overlay.
- **Chat System**: Real-time messaging interface with photo sharing, GIFs (mock), and mini-profile drawer.

### Premium Features
- **Ignite Pro**: Subscription tier with exclusive benefits.
- **Super Likes & Boosts**: Stand out from the crowd with premium actions.
- **See Who Likes You**: View profiles of users who have already liked you (Pro feature).
- **Stripe Integration**: Complete payment flow with Stripe Elements (Test Mode).

### User Profile
- **Rich Profiles**: Detailed user profiles with photos, bio, interests, and stats.
- **Edit Profile**: Drag-and-drop photo reordering and profile customization.
- **Profile Strength**: Visual indicator of profile completeness.

### App Experience
- **PWA Ready**: Installable on mobile devices with native-like feel.
- **Dark Mode**: sleek dark theme optimized for viewing photos.
- **Smooth Transitions**: Page transitions and micro-interactions powered by Framer Motion.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand (Persisted)
- **Drag & Drop**: @dnd-kit
- **Payments**: Stripe
- **Icons**: Lucide React
- **Fonts**: Cormorant Garamond (Headings), DM Mono (Accents), Plus Jakarta Sans (Body)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

- `app/`: Next.js App Router pages and layouts.
  - `(main)/`: Main application routes (authenticated).
  - `(auth)/`: Authentication routes (login/signup).
- `components/`: Reusable UI components.
  - `swipe/`: Card stack and profile card components.
  - `chat/`: Messaging and conversation components.
  - `layout/`: Main layout and navigation components.
- `lib/`: Utility functions and state management stores.
- `public/`: Static assets.

## Design System

- **Primary Color**: Crimson Red (#E8192C)
- **Background**: Deep Black (#080808)
- **Text**: Off-White (#F5F0EB)
- **Grid System**: 8px base grid
