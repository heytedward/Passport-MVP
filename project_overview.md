# Monarch Passport - Project Overview

## 🎯 What is Monarch Passport?

**Monarch Passport** is a luxury, premium web application that serves as a digital passport for exclusive fashion and lifestyle experiences. It's designed to bridge the physical and digital worlds through "phygital" fashion experiences.

## 🎨 Design Philosophy

The app is built around a **custom luxury design system** featuring:

- **Liquid Glassmorphism**: Multi-layered glass cards with blur effects, gold glows, and chromatic aberration
- **Premium Color Palette**: Deep purple (#4C1C8C), accent gold (#FFB000), with glass overlays and neon effects
- **Typography**: 
  - Headings: 'Outfit' font family
  - Body: 'Space Grotesk' 
  - Code/Mono: 'JetBrains Mono'
- **Smooth Animations**: Cubic-bezier transitions, pulse glows, and touch feedback
- **Responsive Mobile-First Design**: Optimized for both mobile and desktop

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 18+ with React Router DOM
- **Styling**: styled-components with custom theme system
- **Backend**: Supabase (authentication, user data)
- **UI Libraries**: 
  - QR Code scanning (`react-qr-reader`)
  - Animations (`framer-motion`)
- **Build Tool**: Create React App (`react-scripts`)

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── GlassCard.jsx   # Glassmorphic cards
│   ├── GlowButton.jsx  # Glowing CTA buttons
│   ├── NavBar.jsx      # Navigation component
│   └── ...
├── screens/            # Main application screens
│   ├── HomeScreen.jsx
│   ├── PassportScreen.jsx
│   ├── ProfileScreen.jsx
│   ├── ScanScreen.jsx
│   └── ...
├── styles/
│   └── theme.js        # Complete theme system
└── App.js              # Main router and theme provider
```

## 🎮 Core Features

### 1. **Digital Passport System**
- Collect digital stamps at real-world events via QR code scanning
- Track your journey through exclusive experiences

### 2. **WNGS Currency System**
- Digital reward currency for participation and loyalty
- Earn through engagement and completing quests

### 3. **Achievements & Quests**
- Complete fashion-related challenges
- Unlock exclusive content and rewards
- Progress tracking system

### 4. **Multiple App Screens**
- **Home**: Main dashboard and overview
- **Passport**: Digital stamp collection view
- **Scan**: QR code scanning interface
- **Closet**: Fashion items and collections
- **Profile**: User avatar and transaction history
- **Quests**: Available challenges and achievements
- **Settings**: Theme customization and preferences

### 5. **Premium UI Components**
- **GlassCard**: Glassmorphic cards with multiple opacity levels
- **GlowButton**: Premium buttons with gold glow effects
- **FlippableCard**: Interactive stamp cards
- **FloatingScanButton**: Quick access to scanning

## 🎨 Theme System

The app features a sophisticated theming system with:

### Color Themes
- **Dark Theme** (default): Black background with purple/gold accents
- **Light Theme**: White background with purple accents
- **5 Gradient Themes**:
  - Frequency Pulse (default purple gradient)
  - Solar Shine (gold gradient)
  - Echo Glass (dark glass)
  - Retro Frame (gray to white)
  - Night Scan (black to purple)

### Glassmorphism Effects
- Multiple opacity levels for different UI elements
- Blur effects ranging from 10px to 25px
- Gold and purple glow effects
- Chromatic aberration for premium feel

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- Supabase account and project

### Setup Process
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Supabase environment variables:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start development server: `npm start`

## 🎯 Target Audience

This application is designed for:
- **Fashion enthusiasts** who want exclusive digital experiences
- **Luxury brands** hosting phygital events and pop-ups
- **Event organizers** creating premium experiences
- **Digital collectors** interested in unique stamp/achievement systems

## 🔧 Current State

The project appears to be in **MVP (Minimum Viable Product)** stage based on:
- Complete UI component library
- Full routing system implemented
- Theme system fully developed
- Multiple screens built out
- Ready for Supabase integration

## 🎨 Unique Selling Points

1. **Luxury-First Design**: Premium glassmorphic UI that stands out from typical apps
2. **Phygital Bridge**: Seamlessly connects physical events with digital rewards
3. **Customizable Themes**: Multiple visual themes for personalization
4. **Mobile-Optimized**: Designed specifically for mobile-first usage
5. **Fashion-Focused**: Built specifically for the fashion and luxury lifestyle industry

This is a sophisticated, well-architected React application that combines modern web technologies with a premium design aesthetic to create a unique digital passport experience for the luxury fashion industry.