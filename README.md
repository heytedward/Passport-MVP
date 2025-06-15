# PapillonOS

PapillonOS is a premium, luxury web application inspired by the world of phygital fashion. It serves as a digital passport for exclusive experiences, blending the tactile allure of high fashion with the seamless interactivity of modern web technology.

## What is PapillonOS?

PapillonOS is your gateway to the next generation of fashion and lifestyle engagement. Designed for discerning users and brands, it enables:
- **Digital stamp collection** at real-world events and pop-ups via QR code scanning
- **WNGS**: A digital currency and reward system for participation and loyalty
- **Achievements & Quests**: Complete fashion quests, earn rewards, and unlock exclusive content
- **Phygital Experience**: Bridging physical and digital worlds for luxury fashion, art, and events

## Design System & Philosophy

PapillonOS is built on a **custom luxury design system**, featuring:
- **Liquid Glassmorphism**: Multi-layered glass cards and overlays with blur, gold glow, and chromatic aberration (purple, gold, cyan) for a premium, futuristic feel
- **Brighter Cards**: Glass cards use a white overlay and higher opacity for clarity and lift on dark backgrounds
- **Gold Glow & Chromatic Effects**: Cards and buttons feature a gold glow and subtle colored edges for a synthwave-inspired, high-fashion look
- **Premium Animation System**: All interactive elements use smooth cubic-bezier transitions, pulse glows, and touch feedback (scale on press)
- **Modern Typography**: 'Outfit' for headings, 'Space Grotesk' for body, and 'JetBrains Mono' for code/system info
- **Responsive, Mobile-First**: Optimized for both mobile and desktop, with a luxury touch
- **Custom Components**: GlassCard, GlowButton, flippable stamp cards, and more

### Theme Tokens (Summary)
- **Colors**: Deep purple (#4C1C8C), accent purple (#7F3FBF), gold highlight (#FFD700), glass backgrounds and borders, white overlays
- **Typography**: Heading: 'Outfit', Body: 'Space Grotesk', Mono: 'JetBrains Mono'
- **Glassmorphism**: 
  - Background: layered gradients and glass color
  - Border: semi-transparent white
  - Box-shadow: gold, purple, cyan glows
  - Opacity: 0.35–0.45 for clarity
- **Animation**: 
  - Durations: 150ms (micro), 300ms (standard), 500ms (complex)
  - Timing: cubic-bezier for smoothness
  - Effects: pulse glow, touch scale, gold focus ring

## Tech Stack
- **React 18+** (web-first, mobile-optimized)
- **styled-components** (custom theme)
- **Supabase** (authentication, user data)
- **QR Code Scanning** (`react-qr-reader`)
- **No NFC** (for maximum iOS compatibility)
- **React Router** (navigation)

## Main Features
- **Digital Passport**: Collect digital stamps at events, shops, and experiences
- **WNGS Balance**: Track and earn digital currency for engagement
- **Achievements & Quests**: Complete challenges, view progress, and unlock rewards
- **Profile & History**: View your avatar, transaction history, and achievements
- **Scan to Earn**: Instantly scan QR codes to collect stamps and rewards
- **Luxury UI/UX**: Glassmorphic, glowing, and responsive interface inspired by high fashion

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/papillonos-mvp.git
   cd papillonos-mvp
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Supabase:**
   - Create a `.env` file in the root directory:
     ```
     REACT_APP_SUPABASE_URL=your_supabase_url
     REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
4. **Start the development server:**
   ```bash
   npm start
   ```

## Contributing

We welcome contributions from the fashion, tech, and design communities!
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

---

**PapillonOS**: Where luxury fashion meets the future of digital experience. 